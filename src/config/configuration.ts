// File: users-service/backend/src/config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT ?? '3200', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE,
  },
});
