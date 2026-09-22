const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const source = ts.transpileModule(fs.readFileSync(
  path.join(__dirname, "../hooks/use-session-activity.ts"), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const flush = async () => {
  for (let i = 0; i < 5; i++) await new Promise(setImmediate);
};

async function setup() {
  let now = 1_000_000;
  let token = "pin-login-token";
  let activity = now;
  let appState;
  let cleanup;
  let status = 204;
  let offline = false;
  let calls = 0;
  const redirects = [];
  const intervals = new Set();
  const router = { replace: (route) => redirects.push(route) };
  const modules = {
    react: { useRef: (value) => ({ current: value }), useEffect: (fn) => { cleanup = fn(); } },
    "react-native": {
      Platform: { OS: "android" },
      AppState: { currentState: "active", addEventListener: (_, fn) => {
        appState = fn; return { remove() {} };
      } },
      Keyboard: { addListener: () => ({ remove() {} }) },
    },
    "expo-router": { useRouter: () => router },
    "@/constants/api": { API_BASE_URL: "https://test.invalid" },
    "@/services/tokenStore": {
      getAuthToken: async () => token,
      getLastActivity: async () => activity,
      setLastActivityNow: async (value) => { activity = value; },
      clearAuthToken: async () => { token = null; },
      SESSION_TIMEOUT_MS: 600_000,
    },
  };
  const context = {
    exports: {}, require: (name) => {
      assert.ok(modules[name], `Unexpected module: ${name}`);
      return modules[name];
    },
    Date: { now: () => now }, AbortController,
    setInterval: (fn) => { intervals.add(fn); return fn; },
    clearInterval: (fn) => intervals.delete(fn),
    setTimeout: () => 1, clearTimeout() {},
    fetch: async (_url, options) => {
      calls++;
      assert.equal(options.signal.aborted, false);
      if (offline) throw new Error("offline");
      return { status, ok: status === 204 };
    },
  };
  vm.runInNewContext(source, context);
  const touch = context.exports.useSessionActivity("(tabs)");
  await flush();
  return {
    touch, redirects,
    get calls() { return calls; },
    get activity() { return activity; },
    setStatus: (value) => { status = value; },
    setOffline: (value) => { offline = value; },
    advance: async (ms) => { now += ms; intervals.forEach((fn) => fn()); await flush(); },
    background: () => appState("background"),
    resume: async () => { appState("active"); await flush(); },
    cleanup: () => cleanup(),
  };
}

test("interaction keeps a session alive beyond ten minutes", async () => {
  const app = await setup();
  for (let i = 0; i < 12; i++) {
    await app.advance(60_000);
    app.touch();
    await flush();
  }
  assert.deepEqual(app.redirects, []);
  assert.ok(app.calls > 1);
  assert.equal(app.activity, 1_720_000);
  app.cleanup();
});

test("idle foreground expires at ten minutes without periodic keep-alives", async () => {
  const app = await setup();
  await app.advance(600_000);
  assert.equal(app.calls, 1);
  assert.deepEqual(app.redirects, ["/(auth)"]);
  app.touch();
  await flush();
  assert.equal(app.calls, 1);
  app.cleanup();
});

test("short app switch stays signed in; long background expires on return", async () => {
  const app = await setup();
  app.background();
  await app.advance(120_000);
  assert.equal(app.calls, 1);
  await app.resume();
  assert.deepEqual(app.redirects, []);
  assert.equal(app.calls, 2);
  app.background();
  await app.advance(480_000);
  await app.resume();
  assert.deepEqual(app.redirects, ["/(auth)"]);
  assert.equal(app.calls, 2);
  app.cleanup();
});

test("backend rejection redirects to sign-in", async () => {
  const app = await setup();
  app.setStatus(401);
  await app.resume();
  assert.deepEqual(app.redirects, ["/(auth)"]);
  app.cleanup();
});

test("network failure does not log out and activity synchronization retries", async () => {
  const app = await setup();
  app.setOffline(true);
  await app.advance(20_000);
  app.touch();
  await flush();
  assert.deepEqual(app.redirects, []);
  app.setOffline(false);
  await app.advance(20_000);
  assert.equal(app.calls, 3);
  assert.deepEqual(app.redirects, []);
  app.cleanup();
});
