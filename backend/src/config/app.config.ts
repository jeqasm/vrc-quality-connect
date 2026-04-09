export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
  licenses: {
    registrySheetUrl: process.env.LICENSE_REGISTRY_SHEET_URL,
    registrySheetName: process.env.LICENSE_REGISTRY_SHEET_NAME,
  },
});
