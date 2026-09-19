/**
 * StonkAgents AI provider plugin.
 *
 * Routes LLM completions through the StonkAgents tracker, which meters credits
 * and proxies to an upstream LLM. The tracker URL and API key are provided by
 * the installer at onboarding time via `STONKAGENTS_TRACKER_URL` and
 * `STONKAGENTS_API_KEY` env vars (or the `--stonkagents-api-key` CLI flag).
 * Openclaw itself has no direct dependency on the StonkAgents agent; the
 * installer is responsible for obtaining the key (for example via the agent's
 * `GET /api/v1/installer/peer-key` endpoint) before running `openclaw onboard`.
 */

import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createProviderApiKeyAuthMethod } from "openclaw/plugin-sdk/provider-auth-api-key";
import {
  readConfiguredProviderCatalogEntries,
  type ProviderCatalogContext,
} from "openclaw/plugin-sdk/provider-catalog-shared";
import { buildProviderReplayFamilyHooks } from "openclaw/plugin-sdk/provider-model-shared";
import type { OpenClawConfig } from "openclaw/plugin-sdk/provider-onboard";
import {
  applyStonkagentsConfig,
  STONKAGENTS_DEFAULT_MODEL_REF,
  STONKAGENTS_PROVIDER_ID,
} from "./onboard.js";
import {
  buildStonkagentsProvider,
  DEFAULT_TRACKER_URL,
  resolveStonkagentsCompletionsUrl,
  STONKAGENTS_API_KEY_ENV_VARS,
} from "./provider-catalog.js";

const OPENAI_COMPATIBLE_REPLAY_HOOKS = buildProviderReplayFamilyHooks({
  family: "openai-compatible",
});

const PROVIDER_LABEL = "StonkAgents AI";
const PROVIDER_HINT = "StonkAgents-managed LLM with included credits";
const GROUP_ID = "stonkagents";

function buildNoteMessage(envVar: string, trackerEnvVar: string): string {
  return [
    `${PROVIDER_LABEL} is the StonkAgents-managed LLM. The tracker meters credits and proxies to an upstream model.`,
    `The installer obtains your API key automatically; for manual setup, set ${envVar}`,
    `and (optionally) ${trackerEnvVar} (default: ${DEFAULT_TRACKER_URL}) before running onboard.`,
  ].join("\n");
}

function readConfiguredStonkagentsCatalogEntries(config: OpenClawConfig | undefined) {
  return readConfiguredProviderCatalogEntries({
    config,
    providerId: STONKAGENTS_PROVIDER_ID,
  });
}

async function resolveStonkagentsCatalog(ctx: ProviderCatalogContext) {
  const apiKey = ctx.resolveProviderApiKey(STONKAGENTS_PROVIDER_ID).apiKey;
  if (!apiKey) {
    return null;
  }
  const baseUrl = resolveStonkagentsCompletionsUrl(ctx.env);
  return { provider: { ...buildStonkagentsProvider(baseUrl), apiKey } };
}

export default definePluginEntry({
  id: STONKAGENTS_PROVIDER_ID,
  name: "StonkAgents AI Provider",
  description:
    "StonkAgents-managed LLM with metered credits, routed through the StonkAgents tracker",
  register(api) {
    api.registerProvider({
      id: STONKAGENTS_PROVIDER_ID,
      label: PROVIDER_LABEL,
      docsPath: "/providers/stonkagents",
      envVars: STONKAGENTS_API_KEY_ENV_VARS,
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: STONKAGENTS_PROVIDER_ID,
          methodId: "stonkagents-ai",
          label: PROVIDER_LABEL,
          hint: PROVIDER_HINT,
          optionKey: "stonkagentsApiKey",
          flagName: "--stonkagents-api-key",
          envVar: "STONKAGENTS_API_KEY",
          promptMessage: "Enter your StonkAgents API key (from the installer or tracker)",
          noteTitle: PROVIDER_LABEL,
          noteMessage: buildNoteMessage("STONKAGENTS_API_KEY", "STONKAGENTS_TRACKER_URL"),
          defaultModel: STONKAGENTS_DEFAULT_MODEL_REF,
          expectedProviders: [STONKAGENTS_PROVIDER_ID],
          applyConfig: (cfg) => applyStonkagentsConfig(cfg),
          wizard: {
            choiceId: "stonkagents-ai",
            choiceLabel: PROVIDER_LABEL,
            choiceHint: PROVIDER_HINT,
            groupId: GROUP_ID,
            groupLabel: PROVIDER_LABEL,
            groupHint: "StonkAgents-managed LLM (no external API key required)",
          },
        }),
      ],
      catalog: {
        run: resolveStonkagentsCatalog,
      },
      augmentModelCatalog: ({ config }) => readConfiguredStonkagentsCatalogEntries(config),
      ...OPENAI_COMPATIBLE_REPLAY_HOOKS,
    });
  },
});
