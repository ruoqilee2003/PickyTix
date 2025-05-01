document.addEventListener('DOMContentLoaded', () => {
    const areaInput = document.getElementById('areaWhitelist');
    const ticketCountSelect = document.getElementById('ticketCount');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');
  
    // 讀取舊設定
    chrome.storage.sync.get(["areaWhitelist", "ticketCount"], (data) => {
      if (data.areaWhitelist) areaInput.value = data.areaWhitelist;
      if (data.ticketCount) ticketCountSelect.value = data.ticketCount;
    });
  
    // 儲存新設定
    saveBtn.addEventListener('click', () => {
      chrome.storage.sync.set({
        areaWhitelist: areaInput.value,
        ticketCount: ticketCountSelect.value
      }, () => {
        status.textContent = "✅ 儲存成功！";
        setTimeout(() => status.textContent = "", 2000);
      });
    });
  });
  