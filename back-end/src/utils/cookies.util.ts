import { CookieOptions } from 'express';

const environment = process.env;
const isProduction = environment.NODE_ENV === 'production';

const sameSite: CookieOptions['sameSite'] = isProduction ? 'none' : 'lax';
const secure = isProduction ? true : false;

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  path: '/',
  maxAge: +environment.COOKIE_ACCESS_DURATION!,
};

export const cookieRefreshOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite,
  path: '/',
  maxAge: +environment.COOKIE_REFRESH_DURATION!,
};
