import type { ModelProviderConfig } from "openclaw/plugin-sdk/provider-model-shared";
import { STONKAGENTS_MODEL_CATALOG, buildStonkagentsModelDefinition } from "./models.js";

/**
 * Default tracker URL used when `STONKAGENTS_TRACKER_URL` is unset.
 * This is the single source of truth for the default; do not inline it.
 */
export const DEFAULT_TRACKER_URL = "https://tracker.dev.stonkagents.com";

/** Tracker base URL env vars, in read order. */
export const TRACKER_URL_ENV_VARS = ["STONKAGENTS_TRACKER_URL"] as const;

/**
 * API key env vars, in read order (see the plugin manifest's
 * `providerAuthEnvVars`).
 */
export const STONKAGENTS_API_KEY_ENV_VARS = ["STONKAGENTS_API_KEY"];

/**
 * Path appended to the tracker base URL to form the OpenAI-SDK base.
 *
 * The OpenAI SDK appends `/chat/completions` to whatever `baseURL` it is
 * given, so we set the model `baseUrl` to `<tracker>/api/v1/agents` and let
 * the SDK build `<tracker>/api/v1/agents/chat/completions`.
 */
export const AGENTS_API_BASE_PATH = "/api/v1/agents";

function normalizeTrackerBase(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\/+$/, "");
}

/**
 * Resolve the tracker base URL (no API path). Reads `STONKAGENTS_TRACKER_URL`
 * and falls back to {@link DEFAULT_TRACKER_URL}. Read lazily so installers can
 * set the env var before running `openclaw onboard`.
 */
export function resolveTrackerBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  for (const name of TRACKER_URL_ENV_VARS) {
    const value = normalizeTrackerBase(env[name]);
    if (value) {
      return value;
    }
  }
  return DEFAULT_TRACKER_URL;
}

/**
 * The OpenAI-SDK-compatible base URL: the tracker's `agents` path.
 * Synchronous, so it is safe to use from config writers during onboarding.
 */
export function resolveStonkagentsCompletionsUrl(env: NodeJS.ProcessEnv = process.env): string {
  return `${resolveTrackerBaseUrl(env)}${AGENTS_API_BASE_PATH}`;
}

export function buildStonkagentsCatalogModels(): NonNullable<ModelProviderConfig["models"]> {
  return STONKAGENTS_MODEL_CATALOG.map(buildStonkagentsModelDefinition);
}

export function buildStonkagentsProvider(baseUrl: string): ModelProviderConfig {
  return {
    baseUrl,
    api: "openai-completions",
    models: buildStonkagentsCatalogModels(),
  };
}
