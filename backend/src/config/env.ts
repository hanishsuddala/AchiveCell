import 'dotenv/config';

const parsedPort = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  throw new Error('PORT must be a valid port number between 1 and 65535.');
}

export const env = {
  port: parsedPort,
};
