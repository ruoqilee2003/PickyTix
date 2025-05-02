console.log("🎯 Ticket Hunter 啟動中！");

let settings = {
  areaWhitelist: [],
  ticketCount: "1"
};

let popupShown = false; // 用來控制首頁只跳一次popup

// 讀取使用者設定
chrome.storage.sync.get(["areaWhitelist", "ticketCount"], (data) => {
  if (data.areaWhitelist) settings.areaWhitelist = data.areaWhitelist.split(",").map(x => x.trim());
  if (data.ticketCount) settings.ticketCount = data.ticketCount;

  console.log("🔧 讀取設定完成：", settings);

  setInterval(main, 500);
});

function main() {
  const url = window.location.href;

  if (url === "https://tixcraft.com/" || url === "https://tixcraft.com") {
    if (!popupShown) {
      chrome.runtime.sendMessage({ action: "open_popup" });
      popupShown = true;
      console.log("📢 首頁已提醒打開 Ticket Hunter 設定");
    }
  } else if (url.includes('/activity/detail/')) {
    handleActivityPage();
  } else if (url.includes('/ticket/area/')) {
    handleAreaPage();
  } else if (url.includes('/ticket/ticket/')) {
    handleTicketPage();
  } else if (url.includes('/verify')) {
  handleVerifyPage();
  } else {
    // 若頁面上有票價表單就執行 handleTicketPage（更通用）
    const ticketForm = document.getElementById('TicketForm_ticketPrice_01');
    if (ticketForm) {
      handleTicketPage();
    }
  }
}

// 活動頁：自動點擊「自動購票」或「立即訂購」並下滑
function handleActivityPage() {
  console.log("🎬 進入活動頁！啟動自動偵測購票按鈕...");

  window.scrollTo({ top: 400, behavior: "smooth" }); // 模擬使用者滑動觸發懶加載

  const observer = new MutationObserver(() => {
    // 找 <a> 中有 "立即購票" 的連結
    const ticketLink = [...document.querySelectorAll("a")].find(a =>
      a.textContent.includes("立即購票")
    );

    if (ticketLink) {
      ticketLink.click();
      console.log("🎯 偵測到『立即購票』連結，已自動點擊！");
      observer.disconnect();

      // ✨ 延遲一下，再按下真正的「立即訂購」按鈕
      setTimeout(() => {
        const orderBtn = [...document.querySelectorAll("button")].find(btn =>
          btn.textContent.includes("立即訂購")
        );
        if (orderBtn) {
          orderBtn.click();
          console.log("✅ 延遲後自動點擊『立即訂購』按鈕！");
        } else {
          console.log("⚠️ 找不到『立即訂購』按鈕");
        }
      }, 300); // ⏱️ 你可以視情況改成 500 ~ 1500 毫秒
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// 預購驗證頁（如 MyVideo / 星展卡友）
function handleVerifyPage() {
  console.log("🔐 進入預購驗證頁");

  const input = document.querySelector('#form-ticket-verify input[name="checkCode"]');
  const submitBtn = document.querySelector('#form-ticket-verify button[type="submit"]');

  if (!input) {
    console.warn("⚠️ 找不到預購碼輸入欄位");
    return;
  }

  chrome.storage.sync.get('presaleCode', (data) => {
    if (data.presaleCode) {
      input.value = data.presaleCode;
      input.focus();
      input.dispatchEvent(new Event('input'));
      console.log(`✍️ 已自動填入預售代碼：${data.presaleCode}`);
    } else {
      input.focus();
    }
  });

  if (!input.dataset.bound) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (submitBtn) {
          submitBtn.click();
          console.log("🚀 已按 Enter 自動送出預購驗證");
        }
      }
    });
    input.dataset.bound = "true";
  }
}


// 選位頁：找白名單＋紅字座位，若無則自動刷新
function handleAreaPage() {
  console.log("📍 進入選位頁，啟動偵測白名單區域...");

  let areaWhitelist = [];
  try {
    const raw = settings.areaWhitelist;
    areaWhitelist = typeof raw === "string"
      ? raw.split(",").map(s => s.trim()).filter(s => s)
      : Array.isArray(raw) ? raw : [];
  } catch (e) {
    console.warn("⚠️ 無法解析 areaWhitelist", e);
  }

  let sessionTitle = "未知場次";
  const select = document.querySelector('#gameId');
  const selectedOption = select?.options[select.selectedIndex];
  if (selectedOption && selectedOption.textContent.trim()) {
    sessionTitle = selectedOption.textContent.trim();
  } else {
    sessionTitle =
      document.querySelector('.zoneName')?.innerText?.trim() ||
      document.querySelector('.buy_info .event_time')?.innerText?.trim() ||
      "未知場次";
  }

  let tried = false;

  const reloadWithDelay = (msg) => {
    console.log(msg + "（1 秒後自動刷新）");
    setTimeout(() => {
      window.location.replace(window.location.href);
    }, 1000);
  };

  const checkArea = () => {
    if (tried) return;
    tried = true;

    const areaItems = document.querySelectorAll('li.select_form_a, li.select_form_b');

    if (areaItems.length === 0) {
      reloadWithDelay("❌ 沒有任何開放區域（剩 / 熱賣中）");
      return;
    }

    let hasAvailable = false;
    let matched = false;
    let availableAreas = [];
    let skippedDueToDisabled = 0;

    for (const item of areaItems) {
      const link = item.querySelector('a');
      const font = link?.querySelector('font');
      const areaText = item.innerText.trim();
      const fontText = font ? font.textContent : "";

      if (!link || !areaText) continue;

      const isDisabled = areaText.includes("身障");
      if (isDisabled) {
        skippedDueToDisabled++;
        continue;
      }

      const isAvailable = fontText.includes("剩") || fontText.includes("熱賣中");
      const fallbackAvailable = areaText.includes("剩") || areaText.includes("熱賣中");

      if (isAvailable || fallbackAvailable) {
        hasAvailable = true;
        availableAreas.push(areaText);

        const pass = areaWhitelist.length === 0 || areaWhitelist.some(keyword => areaText.includes(keyword));
        if (pass && !matched) {
          matched = true;
          console.log(`🎯 命中白名單！自動點擊區域：${areaText}`);
          chrome.runtime.sendMessage({
            action: "notify_discord",
            area: areaText,
            session: sessionTitle
          });

          link.click();

          const checkJump = setInterval(() => {
            if (location.href.includes("/ticket/ticket/")) {
              console.log("🚀 成功跳轉至選票頁！");
              clearInterval(checkJump);
              observer.disconnect();
            }
          }, 300);
          return;
        }
      }
    }

    if (!hasAvailable) {
      if (skippedDueToDisabled > 0) {
        reloadWithDelay(`⚠️ 僅偵測到 ${skippedDueToDisabled} 個「身障區」開放，略過`);
      } else {
        reloadWithDelay("❌ 沒有任何開放區域（剩 / 熱賣中）");
      }
    } else if (!matched) {
      reloadWithDelay(`⚠️ 有 ${availableAreas.length} 個開放區域但未命中白名單：${availableAreas.join(" / ")}`);
    }
  };

  checkArea();

  const observer = new MutationObserver(() => {
    checkArea();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}



// 選票頁：選票數＋勾同意＋驗證碼 Enter 自動送出
let ticketPageHandled = false;

function handleTicketPage() {
  if (ticketPageHandled) return;
  ticketPageHandled = true;

  console.log("🎟️ 進入選票頁，開始等待元件載入...");

  let retryCount = 0;
  const maxRetries = 20;

  const interval = setInterval(() => {
    const ticketSelect = document.querySelector('[id^="TicketForm_ticketPrice"]');
    const agreeCheckbox = document.getElementById('TicketForm_agree');

    if (ticketSelect && agreeCheckbox) {
      clearInterval(interval);
      console.log("✅ 發現票選欄位與勾選框，開始自動操作...");

      const maxOption = Math.max(...[...ticketSelect.options]
        .map(opt => parseInt(opt.value))
        .filter(n => !isNaN(n))
      );
      
      let requested = parseInt(settings.ticketCount);
      if (isNaN(requested)) requested = 1;
      
      if (requested > maxOption) {
        ticketSelect.value = maxOption.toString();
        console.log(`⚠️ 可選票數僅 ${maxOption}，自動調整`);
      } else {
        ticketSelect.value = requested.toString();
        console.log(`✅ 選擇票數 ${requested}`);
      }
      ticketSelect.dispatchEvent(new Event('change'));
      
      if (!agreeCheckbox.checked) {
        agreeCheckbox.click();
        console.log("✅ 勾選同意條款");
      }

      waitForCaptcha(); // 👈 進入下一階段處理驗證碼
    } else {
      retryCount++;
      if (retryCount >= maxRetries) {
        clearInterval(interval);
        console.log("❌ 超過最大重試次數，放棄自動填票與勾同意");
      }
    }
  }, 300);
}

function waitForCaptcha() {
  let attempts = 0;
  const maxTries = 20;

  const captchaInterval = setInterval(() => {
    const captchaInput = document.getElementById('TicketForm_verifyCode');
    if (captchaInput) {
      clearInterval(captchaInterval);

      captchaInput.focus();
      captchaInput.scrollIntoView({ behavior: "smooth", block: "center" });
      console.log("🎯 自動 focus 驗證碼輸入框並滾動到中央");

      if (!captchaInput.dataset.bound) {
        captchaInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
        
            const submitBtn = [...document.querySelectorAll('input, button')].find(el =>
              el.value === "立即訂購" ||
              el.innerText.includes("立即訂購") ||
              el.innerText.includes("確認張數")
            );
        
            if (submitBtn) {
              console.log("🚀 輸入驗證碼後自動送出！");
              submitBtn.click();
            } else {
              console.log("❌ 找不到送出按鈕！");
            }
          }
        });        
        captchaInput.dataset.bound = "true";
        console.log("⌨️ 已綁定 Enter 自動送出");
      }
    } else {
      attempts++;
      if (attempts >= maxTries) {
        clearInterval(captchaInterval);
        console.log("⚠️ 超過驗證碼等待次數，未能 focus 或綁定 Enter");
      }
    }
  }, 300);
}







