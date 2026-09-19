import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveProviderPluginChoice } from "../../src/plugins/provider-auth-choice.runtime.js";
import { resolveProviderAuthEnvVarCandidates } from "../../src/secrets/provider-env-vars.js";
import { registerSingleProviderPlugin } from "../../test/helpers/plugins/plugin-registration.js";
import stonkagentsPlugin from "./index.js";
import {
  AGENTS_API_BASE_PATH,
  DEFAULT_TRACKER_URL,
  resolveStonkagentsCompletionsUrl,
  resolveTrackerBaseUrl,
} from "./provider-catalog.js";

function clearStonkagentsEnv() {
  delete process.env.STONKAGENTS_API_KEY;
  delete process.env.STONKAGENTS_TRACKER_URL;
}

async function runNonInteractiveAuth(methodId: string) {
  const provider = await registerSingleProviderPlugin(stonkagentsPlugin);
  const method = provider.auth?.find((entry) => entry.id === methodId);
  if (!method?.runNonInteractive) {
    throw new Error(`expected ${methodId} non-interactive auth`);
  }
  return await method.runNonInteractive({
    config: {},
    opts: {},
    env: {},
    runtime: {
      error: () => {},
      exit: () => {},
      log: () => {},
    },
    resolveApiKey: async () => ({
      key: "stonkagents-test-key",
      source: "profile",
    }),
    toApiKeyCredential: () => null,
  } as never);
}

describe("StonkAgents provider plugin", () => {
  beforeEach(() => {
    clearStonkagentsEnv();
  });

  afterEach(() => {
    clearStonkagentsEnv();
  });

  it("registers StonkAgents AI with the stonkagents-ai auth choice", async () => {
    const provider = await registerSingleProviderPlugin(stonkagentsPlugin);

    expect(provider.id).toBe("stonkagents");
    expect(provider.label).toBe("StonkAgents AI");
    expect(provider.envVars).toEqual(["STONKAGENTS_API_KEY"]);
    expect(provider.auth?.map((method) => method.id)).toEqual(["stonkagents-ai"]);

    const choice = resolveProviderPluginChoice({ providers: [provider], choice: "stonkagents-ai" });
    expect(choice).not.toBeNull();
    expect(choice?.provider.id).toBe("stonkagents");
    expect(choice?.method.id).toBe("stonkagents-ai");
    expect(choice?.method.wizard?.assistantVisibility).toBeUndefined();
  });

  it("writes the provider config with the default tracker URL when env is unset", async () => {
    const config = await runNonInteractiveAuth("stonkagents-ai");

    expect(config?.auth?.profiles?.["stonkagents:default"]).toMatchObject({
      provider: "stonkagents",
      mode: "api_key",
    });
    expect(config?.models?.providers?.stonkagents).toMatchObject({
      baseUrl: `${DEFAULT_TRACKER_URL}${AGENTS_API_BASE_PATH}`,
      api: "openai-completions",
    });
    expect(config?.models?.providers?.stonkagents?.models?.map((model) => model.id)).toEqual([
      "default",
    ]);
  });

  it("resolves the tracker base URL from STONKAGENTS_TRACKER_URL", () => {
    expect(resolveTrackerBaseUrl({})).toBe(DEFAULT_TRACKER_URL);
    expect(resolveTrackerBaseUrl({ STONKAGENTS_TRACKER_URL: "https://new.example.com/" })).toBe(
      "https://new.example.com",
    );
  });

  it("honors STONKAGENTS_TRACKER_URL when writing the provider config", async () => {
    process.env.STONKAGENTS_TRACKER_URL = "https://tracker.example.com/";
    const config = await runNonInteractiveAuth("stonkagents-ai");

    // Trailing slash normalized away; agents base path appended.
    expect(config?.models?.providers?.stonkagents?.baseUrl).toBe(
      "https://tracker.example.com/api/v1/agents",
    );
  });

  it("lists the API key env var as a stonkagents provider env candidate", () => {
    const candidates = resolveProviderAuthEnvVarCandidates();
    expect(candidates.stonkagents).toEqual(["STONKAGENTS_API_KEY"]);
  });

  it("builds the completions URL from the tracker base", () => {
    const env = { STONKAGENTS_TRACKER_URL: "https://tracker.example.com" };
    expect(resolveStonkagentsCompletionsUrl(env)).toBe("https://tracker.example.com/api/v1/agents");
  });

  it("builds the StonkAgents model catalog from the auth profile", async () => {
    const provider = await registerSingleProviderPlugin(stonkagentsPlugin);
    expect(provider.catalog).toBeDefined();

    const catalog = await provider.catalog!.run({
      config: {},
      env: {},
      resolveProviderApiKey: (id: string) =>
        id === "stonkagents" ? { apiKey: "stonkagents-test-key" } : { apiKey: undefined },
      resolveProviderAuth: () => ({
        apiKey: "stonkagents-test-key",
        mode: "api_key",
        source: "env",
      }),
    } as never);

    expect(catalog && "provider" in catalog).toBe(true);
    if (!catalog || !("provider" in catalog)) {
      throw new Error("expected single-provider catalog");
    }

    expect(catalog.provider.api).toBe("openai-completions");
    expect(catalog.provider.baseUrl).toBe(`${DEFAULT_TRACKER_URL}${AGENTS_API_BASE_PATH}`);
    expect(catalog.provider.apiKey).toBe("stonkagents-test-key");
    expect(catalog.provider.models?.map((model) => model.id)).toEqual(["default"]);
    expect(catalog.provider.models?.map((model) => model.name)).toEqual(["StonkAgents"]);
  });

  it("returns null from catalog.run when no api key is present", async () => {
    const provider = await registerSingleProviderPlugin(stonkagentsPlugin);

    const catalog = await provider.catalog!.run({
      config: {},
      env: {},
      resolveProviderApiKey: () => ({ apiKey: undefined }),
      resolveProviderAuth: () => ({
        apiKey: undefined,
        mode: "api_key",
        source: "none",
      }),
    } as never);

    expect(catalog).toBeNull();
  });
});
