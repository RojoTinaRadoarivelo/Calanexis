import { SetMetadata } from '@nestjs/common';

export const API_MESSAGE_KEY = 'api_message';
export type Api_Action =
  | 'create'
  | 'update'
  | 'delete'
  | 'list'
  | 'createMany'
  | 'updateMany'
  | 'deleteMany'
  | 'search'
  | 'bin';
export const ApiMessage = (action: Api_Action) =>
  SetMetadata(API_MESSAGE_KEY, action);
