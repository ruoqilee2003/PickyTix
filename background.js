chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "notify_discord") {
    const webhookUrl = "https://discord.com/api/webhooks/1366298715501101088/k80k2ul9Q-hmaUyW7WeFfXF5Crzy7wpPJppU2Z7LY8p4v26jrbPQ7llMMj_xAjGW7-Rr"; // <--- 替換成你自己的

    const content = {
      username: "🎟️ Tixcraft Bot",
      content: `🚨 有清票出現於白名單區域：**${message.area}**\n📅 場次資訊：${message.session || "未知場次"}`
    };

    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(content)
    })
      .then(() => {
        console.log("✅ 已發送 Discord 通知！");
      })
      .catch(err => {
        console.error("❌ 發送 Discord 通知失敗：", err);
      });
  }

  // 開啟 popup 用於首頁設定（選擇票數、白名單）
  if (message.action === "open_popup") {
    chrome.action.openPopup();  // 打開popup
  }
});
