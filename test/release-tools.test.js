const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ANNOUNCEMENT_MARKER,
  announceRelease,
  buildAnnouncementPayload,
  isEligibleRelease,
  sendDiscordWebhook,
} = require("../scripts/announce-release");
const {
  collectChangeData,
  getReleaseAiConfig,
  renderReleaseNotes,
  requestAiOutline,
  validateOutline,
  validateVersion,
} = require("../scripts/generate-release-notes");

function response(status, payload, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => headers[name.toLowerCase()] ?? null },
    json: async () => payload,
  };
}

test("只接受未加 v 的穩定版 SemVer", () => {
  assert.equal(validateVersion("0.28.1"), "0.28.1");
  assert.throws(() => validateVersion("v0.28.1"));
  assert.throws(() => validateVersion("0.28.1-beta.1"));
});

test("AI Release 結構會被驗證並以既有風格渲染", () => {
  const outline = validateOutline({
    added: ["新增天氣警特報的 AI 摘要推播設定"],
    improved: ["改善長訊息翻譯的回應處理"],
    fixed: ["修正高解析度機關圖示的顯示來源"],
  });
  const notes = renderReleaseNotes(outline);

  assert.match(notes, /新增內容/);
  assert.match(notes, /更新、修復與優化/);
  assert.match(notes, /\*\*\[優化\]\*\*/);
  assert.match(notes, /\*\*\[修復\]\*\*/);
});

test("AI Release 結構拒絕額外欄位、提及與空白內容", () => {
  assert.throws(() => validateOutline({ added: [], improved: [], fixed: [], extra: [] }));
  assert.throws(() => validateOutline({ added: ["@everyone 立即更新功能"], improved: [], fixed: [] }));
  assert.throws(() => validateOutline({ added: [], improved: [], fixed: [] }));
});

test("既有 0.27.1 到 0.28.0 的 Release 範圍只收集 Git 中繼資料", () => {
  const changes = collectChangeData("0.27.1", "0.28.0");

  assert.equal(changes.previousTag, "0.27.1");
  assert.ok(changes.commits.some((commit) => commit.subject.includes("weather-alert")));
  assert.ok(changes.files.includes("A\tsrc/services/weatherAlertSummary.js"));
  assert.ok(changes.files.every((file) => !file.includes("const ")));
});

test("AI 請求使用結構化提示並拒絕非成功回應", async () => {
  const changes = {
    previousTag: "0.28.0",
    target: "abc123",
    commits: [{ sha: "abc123", subject: "fix: improve alerts" }],
    files: ["M\tsrc/events/guild/new_weather_alert.js"],
  };
  let request;
  const outline = await requestAiOutline({
    version: "0.28.1",
    changes,
    apiKey: "test-key",
    model: "release-writer",
    baseUrl: "https://ai.example.test/v1",
    fetchFn: async (url, options) => {
      request = { url, options };
      return response(200, {
        choices: [{ message: { content: JSON.stringify({ added: [], improved: [], fixed: ["修正警特報排程的回應處理"] }) } }],
      });
    },
  });

  assert.equal(request.url, "https://ai.example.test/v1/chat/completions");
  assert.equal(JSON.parse(request.options.body).temperature, 0.2);
  assert.equal(outline.fixed[0], "修正警特報排程的回應處理");
  await assert.rejects(() => requestAiOutline({
    version: "0.28.1",
    changes,
    apiKey: "test-key",
    model: "release-writer",
    baseUrl: "https://ai.example.test/v1",
    fetchFn: async () => response(503, { error: "temporary" }),
  }));
});

test("Release AI 預設使用 LiteLLM 設定，並允許個別覆寫", () => {
  const keys = [
    "LITELLM_API_KEY",
    "LITELLM_PROXY_URL",
    "LITELLM_MODEL",
    "RELEASE_AI_API_KEY",
    "RELEASE_AI_BASE_URL",
    "RELEASE_AI_MODEL",
  ];
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  try {
    Object.assign(process.env, {
      LITELLM_API_KEY: "proxy-key",
      LITELLM_PROXY_URL: "https://proxy.example/v1",
      LITELLM_MODEL: "default-model",
    });
    for (const key of keys.filter((key) => key.startsWith("RELEASE_"))) {
      delete process.env[key];
    }
    assert.deepEqual(getReleaseAiConfig(), {
      apiKey: "proxy-key",
      baseUrl: "https://proxy.example/v1",
      model: "default-model",
    });

    Object.assign(process.env, {
      RELEASE_AI_API_KEY: "release-key",
      RELEASE_AI_BASE_URL: "https://release-proxy.example/v1",
      RELEASE_AI_MODEL: "release-model",
    });
    assert.deepEqual(getReleaseAiConfig(), {
      apiKey: "release-key",
      baseUrl: "https://release-proxy.example/v1",
      model: "release-model",
    });
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});

test("Discord payload 會禁止提及、移除去重標記並保留 Release 連結", () => {
  const payload = buildAnnouncementPayload({
    id: 1,
    name: "YINLA v0.28.1",
    tag_name: "0.28.1",
    body: "## 更新\n\n- 修正推播\n\n<!-- yinla-discord-announced -->",
    html_url: "https://github.com/YINLA-TEAM/YINLA/releases/tag/0.28.1",
    published_at: "2026-08-20T00:00:00Z",
  });

  assert.deepEqual(payload.allowed_mentions, { parse: [] });
  assert.doesNotMatch(payload.embeds[0].description, /yinla-discord-announced/);
  assert.match(payload.embeds[0].description, /閱讀完整 Release/);
  assert.ok(payload.embeds[0].description.length <= 4096);
});

test("只有已發布的正式版可公告，Webhook 會依 429 指示重試", async () => {
  assert.equal(isEligibleRelease({ draft: false, prerelease: false, published_at: "2026-08-20T00:00:00Z" }), true);
  assert.equal(isEligibleRelease({ draft: false, prerelease: true, published_at: "2026-08-20T00:00:00Z" }), false);

  let calls = 0;
  const delays = [];
  await sendDiscordWebhook({ content: "test" }, {
    webhookUrl: "https://discord.com/api/webhooks/1/token",
    fetchFn: async () => {
      calls += 1;
      return calls === 1
        ? response(429, { retry_after: 0.001 })
        : response(200, { id: "message" });
    },
    sleepFn: async (delay) => delays.push(delay),
  });

  assert.equal(calls, 2);
  assert.equal(delays.length, 1);
});

test("已寫入送達標記的 Release 不會再次呼叫 Discord", async () => {
  let calls = 0;
  const result = await announceRelease({
    id: 1,
    draft: false,
    prerelease: false,
    published_at: "2026-08-20T00:00:00Z",
    body: `更新完成\n${ANNOUNCEMENT_MARKER}`,
  }, {
    fetchFn: async () => {
      calls += 1;
      return response(200, {});
    },
  });

  assert.deepEqual(result, { skipped: "already-announced" });
  assert.equal(calls, 0);
});
