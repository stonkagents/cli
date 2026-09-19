import type { ModelDefinitionConfig } from "openclaw/plugin-sdk/provider-model-shared";

/**
 * StonkAgents model catalog.
 *
 * A single `default` model is declared. The tracker rewrites the client `model`
 * field to its configured upstream model unconditionally, so openclaw never
 * needs to know which upstream LLM the tracker is proxying to. When the
 * tracker changes its upstream model, no openclaw rebuild is needed.
 *
 * Cost is left at zero because credits are metered server-side; openclaw's
 * cost display would otherwise show wrong numbers.
 */
export const STONKAGENTS_MODEL_CATALOG: ModelDefinitionConfig[] = [
  {
    id: "default",
    name: "StonkAgents",
    reasoning: false,
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: {
      input: 0,
      output: 0,
      cacheRead: 0,
      cacheWrite: 0,
    },
  },
];

export function buildStonkagentsModelDefinition(
  model: (typeof STONKAGENTS_MODEL_CATALOG)[number],
): ModelDefinitionConfig {
  return {
    id: model.id,
    name: model.name,
    api: "openai-completions",
    reasoning: model.reasoning,
    input: model.input,
    cost: model.cost,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
  };
}
