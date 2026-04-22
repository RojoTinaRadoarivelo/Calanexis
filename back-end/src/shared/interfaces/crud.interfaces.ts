import { IResponse } from './responses.interfaces';

export interface ICrudService<C, U, R> {
  Create(data: C, query?: any): Promise<IResponse<R | null>>;
  Update(id: string | null, data: U, query?: any): Promise<IResponse<R | null>>;
  Delete(id: string | null, query?: any): Promise<IResponse<R | null>>;
  CreateMany(
    data: C[],
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  UpdateMany(
    data: U[],
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  FindMany(
    pagination?: number,
    step?: number,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  DeleteMany(
    ids: string[],
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  Search(
    filter: Partial<R>,
    pagination?: number,
    step?: number,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  FindOne(query?: any, include?: any): Promise<IResponse<R | null>>;
  MoveToBin(id: string | null, query?: any): Promise<IResponse<R | null>>;
  RestoreFromBinPhoto(
    id: string | null,
    query?: any,
  ): Promise<IResponse<R | null>>;
}
