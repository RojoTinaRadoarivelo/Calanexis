import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';

import { ApiMessageInterceptor } from './shared/middlewares/interceptors/api-message.interceptor';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const CONFIG_SERVICE = app.get(ConfigService);
  app.use(cookieParser());
  const allowedUrls = CONFIG_SERVICE.get<string[]>('allowedUrls') || [];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      for (const allowed of allowedUrls) {
        if (allowed === origin) {
          return callback(null, true);
        }
        if (allowed.includes('*')) {
          // Convert 'https://*-front.vercel.app' into a regex
          const regex = new RegExp(
            '^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$',
          );
          if (regex.test(origin)) {
            return callback(null, true);
          }
        }
      }
      // Log for debugging if it fails
      console.log(`CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
    exposedHeaders: ['Content-Disposition'],
  });
  app.useGlobalInterceptors(new ApiMessageInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(CONFIG_SERVICE.get<string>('GLOBAL_PREFIX') || 'api/v1'); // may needs to adding it also in env
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
