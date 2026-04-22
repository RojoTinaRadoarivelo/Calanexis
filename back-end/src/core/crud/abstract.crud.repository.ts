import { IResponse } from '../../shared/interfaces/responses.interfaces';

export interface CrudRepository<C, U, R> {
  Create(
    data: C,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>>;
  CreateMany(
    data: C[],
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  Update(
    id: string | null,
    data: U,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>>;
  UpdateMany(
    data: U[],
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  Delete(
    id: string | null,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>>;
  DeleteMany(
    ids: string[],
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  FindMany(
    returnObjectParams: any,
    query?: any,
    pagination?: number,
    step?: number,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>>;
  FindOne(query?: any, include?: any): Promise<IResponse<R | null>>;
  MoveToBin(
    id: string | null,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>>;
  RestoreFromBinPhoto(
    id: string | null,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>>;
}
