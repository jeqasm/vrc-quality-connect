export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    security: {
      loginIpMaxAttempts: Number(process.env.LOGIN_IP_MAX_ATTEMPTS ?? 20),
      loginEmailMaxAttempts: Number(process.env.LOGIN_EMAIL_MAX_ATTEMPTS ?? 5),
      loginWindowMs: Number(process.env.LOGIN_WINDOW_MS ?? 15 * 60 * 1000),
      loginBlockMs: Number(process.env.LOGIN_BLOCK_MS ?? 15 * 60 * 1000),
    },
  },
  licenses: {
    registrySheetUrl: process.env.LICENSE_REGISTRY_SHEET_URL,
    registrySheetName: process.env.LICENSE_REGISTRY_SHEET_NAME,
  },
});
