<p align="center">
  <img src="./assets/yinla-readme-splash-compact.png" alt="YINLA — weather, translation, baseball, and earthquake information in Discord" width="100%" />
</p>

<!-- README-I18N:START -->

**English** | [繁體中文（台灣）](./README.zh-TW.md)

<!-- README-I18N:END -->

# YINLA

> A Taiwan-focused Discord information assistant for communities that want useful public information, timely alerts, and everyday utilities in one place.

[![Discord](https://img.shields.io/discord/1031159028505641011?color=5865F2&label=Discord&logo=discord&logoColor=white&style=flat-square)](https://discord.gg/mnCHdBbh65)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square)](./License)
[![Runtime](https://img.shields.io/badge/runtime-Bun%20%7C%20Node.js-111111?style=flat-square)](./package.json)

YINLA brings Taiwan-centric information services into Discord. Use it to look up weather and disaster information, follow CPBL games, check transport and local services, translate text, and configure server notifications. It is designed for both people using the public bot and communities that want to run their own instance.

## What YINLA does

| Area | Highlights |
| --- | --- |
| Weather and safety | CWA weather summaries, station data, UV index, radar imagery, typhoon information, earthquake reports, and weather alerts. |
| Community notifications | Configurable weather-alert AI summaries, earthquake reports, CPC fuel-price updates, and welcome messages. |
| Sports | Live CPBL scores, standings, and detailed game views. |
| Everyday Taiwan services | YouBike availability, Taipei Metro operating status, public-restroom lookup, and CPC fuel prices. |
| Utilities | Slash-command translation, message-context translation to Chinese, English, Japanese, or Korean, Discord profile tools, and issue reporting. |

## Use the public bot

1. [Invite YINLA to your Discord server](https://discord.com/oauth2/authorize?client_id=914150570250625044&permissions=1759214307376375&integration_type=0&scope=applications.commands+bot).
2. Run `/help` in a channel and choose a category to browse the available commands.
3. For notifications, ask a server administrator to configure the relevant `/setup-*` command.

Need help or want to report a problem? Join the [support server](https://discord.gg/mnCHdBbh65) or open an [issue](https://github.com/YINLA-TEAM/YINLA/issues).

## Command guide

Discord presents localized command names when Traditional Chinese (Taiwan) is selected. The command identifiers below are the canonical names used by the API.

| Task | Commands |
| --- | --- |
| Get started and Discord utilities | `/help`, `/invite`, `/bot-info`, `/server-info`, `/user-info`, `/getAvatar`, `/report` |
| Weather, disasters, and alerts | `/weather_tool`, `/weather_station`, `/weather_alert`, `/earthquake_report`, `/radar`, `/typhoon`, `/uv` |
| CPBL | `/cpbl_score`, `/cpbl_standing`, `/cpbl_game` |
| Translation | `/translator` and the message context-menu translators |
| Transport and local information | `/youbike`, `/mrt-trtc`, `/restroom`, `/cpc_oil` |
| Server setup | `/setup-weather-alert`, `/setup-eqchannel`, `/setup-cpcchannel`, `/setup-welcome` |

### Weather-alert notifications

`/setup-weather-alert` lets each server choose a target text channel and optionally enable concise AI summaries. The bot checks the active CWA alert feed on a schedule and only republishes an alert when its published time, effective time, affected locations, or content changes. The optional summary falls back safely to the original alert when the AI service is unavailable. Read [weather-alert notifications and AI summaries](./docs/weather-alert-push.md) for configuration details.

## Self-hosting

### Requirements

- A Discord application with a bot user and its **token** and **Application ID**.
- The **Server Members Intent** and **Message Content Intent** enabled for that bot in the Discord Developer Portal.
- A MongoDB database; server-level notification settings are stored there.
- Bun (recommended) or a current Node.js runtime. Docker is also supported through the included `Dockerfile`.

### Configure the environment

Create a local `.env` file in the project root. Never commit it.

```dotenv
token=your_discord_bot_token
botId=your_discord_application_id
bot_status=watching for updates
databaseToken=your_mongodb_connection_string

# Optional: enables weather-alert AI summaries through LiteLLM Proxy.
LITELLM_API_KEY=your_litellm_virtual_key
LITELLM_PROXY_URL=https://your-litellm-proxy.example.com/v1
LITELLM_MODEL=your_configured_model_alias

# Legacy aliases are supported temporarily during migration.
# WEATHER_ALERT_AI_BASE_URL=https://your-litellm-proxy.example.com/v1
# WEATHER_ALERT_AI_MODEL=your_configured_model_alias
# WEATHER_ALERT_AI_CACHE_VERSION=1
# WEATHER_ALERT_AI_CACHE_PATH=/persistent/path/weatherAlertSummaries.json
# log_channel=your_discord_log_channel_id
```

The bot starts and authenticates with `token`, registers global slash commands using `botId`, displays `bot_status`, and connects to MongoDB through `databaseToken`. `LITELLM_API_KEY`, `LITELLM_PROXY_URL`, and `LITELLM_MODEL` must all be set to enable summaries; otherwise weather alerts still work and use the original CWA content. The Proxy URL must include its API version path (normally `/v1`), and the model must be an alias configured in LiteLLM.

### Run locally

```bash
bun install
bun src/index.js
```

On startup, YINLA registers its slash commands globally. Discord can take some time to make globally registered commands visible in every server. Keep the process running with a process manager in production.

### Run with Docker

```bash
docker build -t yinla .
docker run --env-file .env yinla
```

For long-running deployments, persist any configured weather-alert cache path and use a managed MongoDB service or a durable MongoDB volume.

## Development notes

- Commands, interactions, events, and components are loaded dynamically from `src/` when the bot starts.
- The project uses scheduled jobs for notification features; deployment must remain running for scheduled notifications to be delivered.
- External data providers can be temporarily unavailable or change their responses. Commands report a friendly error when a source cannot be reached.
- `data/`, `src/data/weatherAlertSummaries.json`, and `.env` may contain runtime data or credentials and should not be committed.

## Contributing

Bug reports and improvement ideas are welcome through [GitHub Issues](https://github.com/YINLA-TEAM/YINLA/issues). Before opening a pull request, keep changes focused, verify the commands you touch, and never include secrets or generated runtime data.

## License

YINLA is distributed under the [GNU General Public License v3.0](./License).

## Credits

Created and maintained by [YinCheng](https://github.com/YinCheng0106).
