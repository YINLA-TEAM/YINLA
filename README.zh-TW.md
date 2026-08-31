<p align="center">
  <img src="./assets/yinla-readme-splash-compact.png" alt="YINLA：在 Discord 取得天氣、翻譯、棒球與地震資訊" width="100%" />
</p>

<!-- README-I18N:START -->

[English](./README.md) | **繁體中文（台灣）**

<!-- README-I18N:END -->

# YINLA

> 為 Discord 社群打造的臺灣資訊助理：把公共資訊、即時通知與日常查詢整合在同一個機器人裡。

[![Discord](https://img.shields.io/discord/1031159028505641011?color=5865F2&label=Discord&logo=discord&logoColor=white&style=flat-square)](https://discord.gg/mnCHdBbh65)
[![授權條款：GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square)](./License)
[![執行環境](https://img.shields.io/badge/runtime-Bun%20%7C%20Node.js-111111?style=flat-square)](./package.json)

YINLA 把以臺灣為主的資訊服務帶進 Discord。你可以查詢天氣與災害資訊、追蹤中華職棒、查看交通與生活服務、翻譯文字，並為伺服器設定各式推播。無論是直接使用公開機器人，或自行部署一套專屬版本，都能快速開始。

## YINLA 可以做什麼？

| 類別 | 重點功能 |
| --- | --- |
| 氣象與防災 | 氣象署天氣小幫手、測站資料、紫外線、雷達回波、颱風資訊、地震報告與天氣警特報。 |
| 社群推播 | 可設定天氣警特報 AI 摘要、地震報告、中油油價與新成員歡迎訊息。 |
| 運動資訊 | 中華職棒即時比分、戰績與詳細賽事資訊。 |
| 臺灣日常服務 | YouBike 即時站點、臺北捷運營運狀況、公共廁所查詢與中油油價。 |
| 實用工具 | Slash 指令翻譯、訊息右鍵翻譯成中／英／日／韓文、Discord 資訊工具與問題回報。 |

## 使用公開機器人

1. [邀請 YINLA 加入你的 Discord 伺服器](https://discord.com/oauth2/authorize?client_id=914150570250625044&permissions=1759214307376375&integration_type=0&scope=applications.commands+bot)。
2. 在任一頻道輸入 `/help`，從選單瀏覽可用指令與說明。
3. 若要啟用推播，請由伺服器管理員設定相應的 `/setup-*` 指令。

需要協助或想回報問題，請加入[支援伺服器](https://discord.gg/mnCHdBbh65)，或到 [Issues](https://github.com/YINLA-TEAM/YINLA/issues) 提出回報。

## 指令總覽

當 Discord 語言設為繁體中文（臺灣）時，會顯示中文在地化的指令名稱；下表保留 API 使用的英文識別名稱。

| 想做的事 | 指令 |
| --- | --- |
| 基本操作與 Discord 工具 | `/help`、`/invite`、`/bot-info`、`/server-info`、`/user-info`、`/getAvatar`、`/report` |
| 氣象、防災與警特報 | `/weather_tool`、`/weather_station`、`/weather_alert`、`/earthquake_report`、`/radar`、`/typhoon`、`/uv` |
| 中華職棒 | `/cpbl_score`、`/cpbl_standing`、`/cpbl_game` |
| 翻譯 | `/translator`，以及訊息右鍵選單翻譯 |
| 交通與生活資訊 | `/youbike`、`/mrt-trtc`、`/restroom`、`/cpc_oil` |
| 伺服器設定 | `/setup-weather-alert`、`/setup-eqchannel`、`/setup-cpcchannel`、`/setup-welcome` |

### 天氣警特報推播

使用 `/setup-weather-alert` 可為每個伺服器選擇推播文字頻道，並選擇是否啟用精簡 AI 摘要。機器人會定期讀取有效的氣象署警特報；只有發布時間、有效時間、影響區域或內容變動時，才會把同一筆警報視為新版本再次推播。AI 摘要服務暫時無法使用時，會安全地退回原始警報內容。詳細設定方式請參閱[天氣警特報推播與 AI 摘要](./docs/weather-alert-push.md)。

## 自行部署

### 需求

- 已建立 Discord 應用程式與 Bot，並取得 **Bot Token** 和 **Application ID**。
- 已在 Discord Developer Portal 為 Bot 啟用 **Server Members Intent** 與 **Message Content Intent**。
- MongoDB 資料庫；伺服器層級的推播設定會儲存在此處。
- Bun（建議）或較新的 Node.js 執行環境。專案也提供 `Dockerfile`。

### 設定環境變數

在專案根目錄建立本機 `.env`，請勿提交此檔案。

```dotenv
token=your_discord_bot_token
botId=your_discord_application_id
bot_status=watching for updates
databaseToken=your_mongodb_connection_string

# 選填：透過 LiteLLM Proxy 啟用天氣警特報的 AI 摘要。
LITELLM_API_KEY=your_litellm_virtual_key
LITELLM_PROXY_URL=https://your-litellm-proxy.example.com/v1
LITELLM_MODEL=your_configured_model_alias

# 遷移期間暫時支援舊名稱。
# WEATHER_ALERT_AI_BASE_URL=https://your-litellm-proxy.example.com/v1
# WEATHER_ALERT_AI_MODEL=your_configured_model_alias
# WEATHER_ALERT_AI_CACHE_VERSION=1
# WEATHER_ALERT_AI_CACHE_PATH=/persistent/path/weatherAlertSummaries.json
# log_channel=your_discord_log_channel_id
```

`token` 用於登入 Discord；`botId` 用來註冊全域 Slash 指令；`bot_status` 是機器人狀態文字；`databaseToken` 用於連線 MongoDB。啟用摘要時，必須同時設定 `LITELLM_API_KEY`、`LITELLM_PROXY_URL` 與 `LITELLM_MODEL`；否則天氣警特報仍可正常運作，只會使用氣象署原始內容。Proxy URL 需包含 API 版本路徑（通常是 `/v1`），模型名稱則要填入 LiteLLM 中設定的別名。

### 在本機執行

```bash
bun install
bun src/index.js
```

啟動後 YINLA 會註冊全域 Slash 指令。Discord 對全域指令的顯示可能需要一些時間才會同步到每個伺服器。正式環境請使用程序管理工具讓服務持續執行。

### 使用 Docker 執行

```bash
docker build -t yinla .
docker run --env-file .env yinla
```

長期部署時，若有設定天氣警特報快取路徑，請將其放在持久化儲存空間；MongoDB 也應使用受管理服務或持久化磁碟。

## 開發注意事項

- 機器人啟動時，會從 `src/` 動態載入指令、互動元件與事件。
- 推播功能採用排程工作；若部署停止，排程通知就不會送出。
- 外部資料來源可能暫時無法使用或變更回應格式；無法取得資料時，指令會回傳提示訊息。
- `data/`、`src/data/weatherAlertSummaries.json` 與 `.env` 可能包含執行期資料或憑證，請勿提交。

## 貢獻

歡迎透過 [GitHub Issues](https://github.com/YINLA-TEAM/YINLA/issues) 回報問題或提出改善建議。送出 Pull Request 前，請讓變更保持聚焦、驗證有修改到的指令，且不要提交任何金鑰或執行期產生的資料。

## 授權條款

YINLA 採用 [GNU General Public License v3.0](./License) 授權。

## 製作與維護

由 [YinCheng](https://github.com/YinCheng0106) 建立與維護。
