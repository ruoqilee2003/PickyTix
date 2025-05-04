document.addEventListener('DOMContentLoaded', function () {
  const areaInput = document.getElementById('areaWhitelist');
  const ticketSelect = document.getElementById('ticketCount');
  const codeInput = document.getElementById('presaleCode');
  const keywordInput = document.getElementById('concertKeyword');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // 載入儲存值
  chrome.storage.sync.get(['areaWhitelist', 'ticketCount', 'presaleCode'], (data) => {
    if (data.areaWhitelist) areaInput.value = data.areaWhitelist;
    if (data.ticketCount) ticketSelect.value = data.ticketCount;
    if (data.presaleCode) codeInput.value = data.presaleCode;
  });

  chrome.storage.local.get('concertKeyword', ({ concertKeyword }) => {
    if (concertKeyword) {
      keywordInput.value = concertKeyword;
    }
  });

  // 儲存 concertKeyword（即時變動時）
  keywordInput.addEventListener('change', (e) => {
    const keyword = e.target.value.trim();
    chrome.storage.local.set({ concertKeyword: keyword });
  });

  // 點擊儲存按鈕：儲存其他三項設定
  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      areaWhitelist: areaInput.value,
      ticketCount: ticketSelect.value,
      presaleCode: codeInput.value
    }, () => {
      status.textContent = '✅ 設定已儲存！';
      status.style.display = 'block';
      status.style.color = 'green';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });
});
