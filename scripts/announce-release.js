#!/usr/bin/env node

const fs = require("node:fs/promises");

const ANNOUNCEMENT_MARKER = "<!-- yinla-discord-announced -->";
const MAX_EMBED_DESCRIPTION = 3900;
const MAX_RETRIES = 3;

function isEligibleRelease(release) {
  return Boolean(release && !release.draft && !release.prerelease && release.published_at);
}

function removeAnnouncementMarker(body = "") {
  return body.replaceAll(ANNOUNCEMENT_MARKER, "").trim();
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}…`;
}

function buildDescription(release) {
  const body = removeAnnouncementMarker(release.body ?? "") || "本次更新已發布。";
  const link = `\n\n[閱讀完整 Release](${release.html_url})`;
  if (body.length + link.length <= MAX_EMBED_DESCRIPTION) return `${body}${link}`;
  return `${truncate(body, MAX_EMBED_DESCRIPTION - link.length)}${link}`;
}

function buildAnnouncementPayload(release) {
  const name = release.name?.trim() || `YINLA v${release.tag_name}`;
  const embed = {
    author: { name: "YINLA 更新通知" },
    title: truncate(name, 256),
    url: release.html_url,
    description: buildDescription(release),
    color: 0x5865f2,
    footer: { text: `版本 ${release.tag_name}` },
  };
  if (release.published_at && !Number.isNaN(Date.parse(release.published_at))) {
    embed.timestamp = new Date(release.published_at).toISOString();
  }

  return {
    username: "YINLA 更新通知",
    allowed_mentions: { parse: [] },
    embeds: [embed],
  };
}

function getRetryDelay(response, payload) {
  const headerValue = Number(response.headers?.get?.("retry-after"));
  if (Number.isFinite(headerValue) && headerValue > 0) return Math.ceil(headerValue * 1000);
  const bodyValue = Number(payload?.retry_after);
  if (Number.isFinite(bodyValue) && bodyValue > 0) return Math.ceil(bodyValue * 1000);
  return 1000;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function sendDiscordWebhook(payload, {
  webhookUrl,
  fetchFn = fetch,
  sleepFn = sleep,
} = {}) {
  if (!webhookUrl) throw new Error("未設定 DISCORD_RELEASE_WEBHOOK_URL");
  let url;
  try {
    url = new URL(webhookUrl);
  } catch {
    throw new Error("DISCORD_RELEASE_WEBHOOK_URL 不是有效 URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("DISCORD_RELEASE_WEBHOOK_URL 必須使用 HTTPS");
  }
  url.searchParams.set("wait", "true");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) return response;

    let errorPayload = null;
    try {
      errorPayload = await response.json();
    } catch {
      // Discord 可能回傳沒有 JSON body 的暫時性錯誤。
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === MAX_RETRIES) {
      throw new Error(`Discord Webhook 發送失敗（HTTP ${response.status}）`);
    }
    const delay = response.status === 429
      ? getRetryDelay(response, errorPayload)
      : 1000 * 2 ** (attempt - 1);
    await sleepFn(delay);
  }
}

async function markAnnouncementSent(release, {
  repository,
  token,
  fetchFn = fetch,
} = {}) {
  if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY 格式無效");
  }
  if (!token) throw new Error("未設定 GITHUB_TOKEN");
  const body = removeAnnouncementMarker(release.body ?? "");
  const updatedBody = `${body}${body ? "\n\n" : ""}${ANNOUNCEMENT_MARKER}`;
  const response = await fetchFn(
    `https://api.github.com/repos/${repository}/releases/${release.id}`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ body: updatedBody }),
    }
  );
  if (!response.ok) {
    throw new Error(`無法寫入 Discord 發送標記（GitHub HTTP ${response.status}）`);
  }
}

async function getCurrentRelease(releaseId, {
  repository,
  token,
  fetchFn = fetch,
} = {}) {
  if (!Number.isInteger(releaseId) || releaseId <= 0) {
    throw new Error("GitHub Release ID 無效");
  }
  if (!repository || !/^[^/]+\/[^/]+$/.test(repository)) {
    throw new Error("GITHUB_REPOSITORY 格式無效");
  }
  if (!token) throw new Error("未設定 GITHUB_TOKEN");
  const response = await fetchFn(
    `https://api.github.com/repos/${repository}/releases/${releaseId}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (!response.ok) {
    throw new Error(`無法取得目前 Release 狀態（GitHub HTTP ${response.status}）`);
  }
  return response.json();
}

async function announceRelease(release, options) {
  if (!isEligibleRelease(release)) return { skipped: "not-a-published-stable-release" };
  if ((release.body ?? "").includes(ANNOUNCEMENT_MARKER)) {
    return { skipped: "already-announced" };
  }

  await sendDiscordWebhook(buildAnnouncementPayload(release), options);
  await markAnnouncementSent(release, options);
  return { announced: true };
}

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error("未設定 GITHUB_EVENT_PATH");
  const event = JSON.parse(await fs.readFile(eventPath, "utf8"));
  const options = {
    webhookUrl: process.env.DISCORD_RELEASE_WEBHOOK_URL,
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  };
  const release = await getCurrentRelease(event.release?.id, options);
  const result = await announceRelease(release, options);
  process.stdout.write(`${result.announced ? "Discord Release 公告已發送" : `略過公告：${result.skipped}`}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`Release 公告失敗：${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  ANNOUNCEMENT_MARKER,
  announceRelease,
  buildAnnouncementPayload,
  buildDescription,
  getCurrentRelease,
  isEligibleRelease,
  markAnnouncementSent,
  removeAnnouncementMarker,
  sendDiscordWebhook,
  validateWebhookUrl: (value) => new URL(value),
};
