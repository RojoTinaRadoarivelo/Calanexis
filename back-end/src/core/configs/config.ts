import { ConfigDTO } from './interfaces/config.dto';

export const CONFIG = (): ConfigDTO => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  allowedUrls: (process.env.ALLOWED_ORIGIN_URL ?? '')
    .split(',')
    .map((s) => s.trim().replace(/^"|"$/g, '')) // enlève guillemets
    .filter(Boolean),
  ttl: parseInt(process.env.TTL!, 10) || 1000,
  limit: parseInt(process.env.LIMIT!, 10) || 8,
});

export const refreshConfig = {
  secret: process.env.REFRESH_SECRET || '',
  duration: process.env.REFRESH_DURATION || '8h',
};
