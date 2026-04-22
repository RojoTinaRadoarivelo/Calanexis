import { ICrudService } from '../../shared/interfaces/crud.interfaces';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { CrudRepository } from './abstract.crud.repository';

export abstract class CrudService<C, U, R> implements ICrudService<C, U, R> {
  constructor(protected readonly repository: CrudRepository<C, U, R>) {}

  // default
  protected includeParams: any = { id: true };
  // crud include
  protected createIncludeParams: any = { id: true };
  protected updateIncludeParams: any = { id: true };
  protected deleteIncludeParams: any = { id: true };
  protected searchIncludeParams: any = { id: true };
  protected listFilterIncludeParams: any = { id: true };

  async Create(data: C, query?: any): Promise<IResponse<R | null>> {
    const includeParams = this.createIncludeParams ?? this.includeParams;
    return await this.repository.Create(data, includeParams, query);
  }
  async Update(
    id: string | null,
    data: U,
    query?: any,
  ): Promise<IResponse<R | null>> {
    const includeParams = this.updateIncludeParams ?? this.includeParams;
    return await this.repository.Update(id, data, includeParams, query);
  }
  async Delete(id: string, query?: any): Promise<IResponse<R | null>> {
    const includeParams = this.deleteIncludeParams ?? this.includeParams;
    return await this.repository.Delete(id, includeParams, query);
  }
  async CreateMany(
    data: C[],
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const includeParams = this.listFilterIncludeParams ?? this.includeParams;
    return await this.repository.CreateMany(data, includeParams, query);
  }
  async UpdateMany(
    data: U[],
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const includeParams = this.listFilterIncludeParams ?? this.includeParams;
    return await this.repository.UpdateMany(data, includeParams, query);
  }
  async FindMany(
    pagination?: number,
    step?: number,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const includeParams = this.includeParams ?? this.listFilterIncludeParams;
    return await this.repository.FindMany(
      includeParams,
      null,
      pagination,
      step,
    );
  }
  async DeleteMany(
    ids: string[],
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const includeParams = this.listFilterIncludeParams ?? this.includeParams;
    return await this.repository.DeleteMany(ids, includeParams, query);
  }

  async Search(
    filter: Partial<R>,
    pagination?: number,
    step?: number,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const includeParams = this.listFilterIncludeParams ?? this.includeParams;
    return await this.repository.FindMany(
      includeParams,
      filter,
      pagination,
      step,
    );
  }

  async FindOne(query?: any, include?: any): Promise<IResponse<R | null>> {
    const includeParams = include ?? this.listFilterIncludeParams;
    return await this.repository.FindOne(query, includeParams);
  }

  async MoveToBin(
    id: string | null,
    query?: any,
  ): Promise<IResponse<R | null>> {
    const includeParams = this.deleteIncludeParams ?? this.includeParams;
    return await this.repository.MoveToBin(id, includeParams, query);
  }
  async RestoreFromBinPhoto(
    id: string | null,
    query?: any,
  ): Promise<IResponse<R | null>> {
    const includeParams = this.listFilterIncludeParams ?? this.includeParams;
    return await this.repository.RestoreFromBinPhoto(id, includeParams, query);
  }
}
