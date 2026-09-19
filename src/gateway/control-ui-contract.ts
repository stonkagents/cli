export const CONTROL_UI_BOOTSTRAP_CONFIG_PATH = "/__openclaw/control-ui-config.json";

export type ControlUiBootstrapConfig = {
  basePath: string;
  assistantName: string;
  assistantAvatar: string;
  /** Gateway token for same-origin auto-connect. Only set for loopback requests. */
  gatewayToken?: string;
};
