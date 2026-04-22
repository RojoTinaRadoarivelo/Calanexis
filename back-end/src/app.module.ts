import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/configs/interfaces/prisma-ripository/prisma-interfaces.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './shared/middlewares/auth.middleware';
import { CONFIG } from './core/configs/config';
import { UsersModule } from './features/users/users.module';
import { UserPreferencesModule } from './features/user-preferences/user-preferences.module';

const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [CONFIG],
      cache: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('ttl', 1000),
            limit: config.get<number>('limit', 5),
            blockDuration: config.get<number>('ttl'),
          },
        ],
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: `/${globalPrefix}/uploads`,
    }),
    AuthModule,
    UsersModule,
    UserPreferencesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware).forRoutes('*'); // Apply to all routes
  }
}
