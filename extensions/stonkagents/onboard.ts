import {
  createModelCatalogPresetAppliers,
  type OpenClawConfig,
} from "openclaw/plugin-sdk/provider-onboard";
import { STONKAGENTS_MODEL_CATALOG } from "./models.js";
import {
  buildStonkagentsCatalogModels,
  resolveStonkagentsCompletionsUrl,
} from "./provider-catalog.js";

export const STONKAGENTS_PROVIDER_ID = "stonkagents";
/**
 * The model id we declare for openclaw's catalog. The tracker maps it to its
 * configured upstream LLM, so it never needs to change here.
 */
export const STONKAGENTS_DEFAULT_MODEL_ID = STONKAGENTS_MODEL_CATALOG[0].id;
export const STONKAGENTS_DEFAULT_MODEL_REF = `${STONKAGENTS_PROVIDER_ID}/${STONKAGENTS_DEFAULT_MODEL_ID}`;

const stonkagentsPresetAppliers = createModelCatalogPresetAppliers({
  primaryModelRef: STONKAGENTS_DEFAULT_MODEL_REF,
  resolveParams: (_cfg: OpenClawConfig) => ({
    providerId: STONKAGENTS_PROVIDER_ID,
    api: "openai-completions" as const,
    baseUrl: resolveStonkagentsCompletionsUrl(),
    catalogModels: buildStonkagentsCatalogModels(),
    aliases: [{ modelRef: STONKAGENTS_DEFAULT_MODEL_REF, alias: "StonkAgents" }],
  }),
});

/** Write provider entry only (no primary model). Used for implicit discovery. */
export function applyStonkagentsProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  return stonkagentsPresetAppliers.applyProviderConfig(cfg);
}

/** Write provider entry + set the StonkAgents primary model. */
export function applyStonkagentsConfig(cfg: OpenClawConfig): OpenClawConfig {
  return stonkagentsPresetAppliers.applyConfig(cfg);
}
