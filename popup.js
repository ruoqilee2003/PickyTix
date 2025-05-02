document.addEventListener('DOMContentLoaded', function () {
  const areaInput = document.getElementById('areaWhitelist');
  const ticketSelect = document.getElementById('ticketCount');
  const codeInput = document.getElementById('presaleCode');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  chrome.storage.sync.get(['areaWhitelist', 'ticketCount', 'presaleCode'], (data) => {
    if (data.areaWhitelist) areaInput.value = data.areaWhitelist;
    if (data.ticketCount) ticketSelect.value = data.ticketCount;
    if (data.presaleCode) codeInput.value = data.presaleCode;
  });

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
