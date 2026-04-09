export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
});

