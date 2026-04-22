export interface ConfigDTO {
  port: number;
  allowedUrls: string[];
  ttl?: ThrottleDto['ttl'];
  limit?: ThrottleDto['limit'];
}

interface ThrottleDto {
  ttl: number;
  limit: number;
}
