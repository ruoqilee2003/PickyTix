# 🎟️ PickyTix

PickyTix 是一款專為 TixCraft 搶票打造的 Chrome 擴充功能，支援自動選區、自動偵測白名單、即時 Discord 通知，並具備簡潔直覺的介面設計。

---

## ✨ 功能特色

- 支援「白名單座位區」自動比對與點擊
- 自動判斷是否有票（含剩 / 熱賣中）
- 自動排除身障區
- 無票自動刷新（含 timeout 重試機制）
- Discord 通知（可開啟 background.js 支援）
- 現代化介面設計與清晰設定介面
- 本地儲存設定，開一次就記住

---

## 🛠 安裝教學

### 1️⃣ 下載專案

```bash
git clone https://github.com/ruoqilee2003/PickyTix.git
```
或前往 GitHub 頁面下載 ZIP 並解壓縮。

---

### 2️⃣ 安裝到 Chrome

1. 開啟 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟右上角「開發人員模式」
4. 點選「載入未封裝項目」
5. 選取專案資料夾

---

### 3️⃣ 使用方式

1. 點擊右上角 PickyTix 圖示開啟設定頁面
2. 輸入「白名單座位區」關鍵字（例：搖滾、紫2、黃3）
3. 選擇想搶的票數（1~4 張）
4. 前往 TixCraft 活動頁面（點入場次頁）
5. 自動偵測、命中白名單後自動點擊！

---

## ⚙️ 手動設定 Discord 通知 Webhook

若你想使用 Discord 通知功能，請修改 `background.js` 中這段程式碼：

```js
const webhookURL = "https://discord.com/api/webhooks/你的_webhook_連結";
```

然後在接收到訊息後使用：

```js
fetch(webhookURL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content })
});
```

你也可以將 webhook 寫進 `config.js` 作為環境變數模擬，再引入使用。

---

## 📁 專案結構

```
PickyTix/
├── content.js
├── background.js
├── popup.html
├── popup.js
├── icons/
├── manifest.json
└── README.md
```

---

## 🧪 支援平台

- ✅ TixCraft

---

## 📌 版本資訊

- beta 1.0.0（2025.05）

---

## 📬 聯絡與回饋

> © 2025 PickyTix


---

## ❓ 如何取得 Discord Webhook

1. 前往你的 Discord 伺服器，點選左上角伺服器名稱 → 選單中點「伺服器設定」
2. 點選左側的「整合」→ 選擇或新增一個「Webhook」
3. 設定名稱與頻道後點「複製 Webhook URL」
4. 將複製的網址貼入 background.js 中的 `webhookURL` 變數

📌 範例：

```js
const webhookURL = "https://discord.com/api/webhooks/你的_webhook_連結";
```

> Webhook 可用來通知你何時搶到票，建議綁定私人頻道或建立一個專屬通知頻道。
