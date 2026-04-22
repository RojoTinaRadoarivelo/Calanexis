import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CrudRepository } from '../../../crud/abstract.crud.repository';
import { IPrismaService } from './prisma.service';
import type { Response } from 'express';
import { IResponse } from '../../../../shared/interfaces/responses.interfaces';
import {
  getLimitSize,
  getPageIndex,
  MAX_LIMIT_SIZE,
} from '../pagination.utils';

@Injectable()
export class PrismaCrudRepository<
  ModelName extends keyof IPrismaService['prisma'],
  C,
  U,
  R,
> implements CrudRepository<C, U, R> {
  constructor(
    protected readonly prismaSv: IPrismaService,
    protected readonly model: ModelName,
  ) {}

  protected get prismaModel() {
    if (!this.prismaSv?.prisma) {
      throw new Error('Prisma not initialized!');
    }
    return this.prismaSv.prisma[this.model] as any;
  }

  async Create(data: C, returnObjectParams: any): Promise<IResponse<R | null>> {
    let response: IResponse<R | null>;
    try {
      const selectObj = returnObjectParams ?? {};
      const responseData = await this.prismaModel.create({
        data,
        select: selectObj,
      });
      if (!responseData) {
        throw new BadRequestException('There was an error creating the data!');
      }
      response = {
        statusCode: HttpStatus.CREATED,
        data: responseData,
      };
      // responseData
      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async Update(
    id: string | null,
    data: U,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>> {
    let response: IResponse<R | null>;
    try {
      if (id == null) {
        const responseData = await this.prismaModel.update({
          where: query,
          data,
          select: returnObjectParams,
        });
        if (!responseData) {
          throw new BadRequestException(
            'There was an error updating the data!',
          );
        }
        response = {
          statusCode: HttpStatus.CREATED,
          data: responseData,
        };
        return response;
      }
      const responseData = await this.prismaModel.update({
        where: { id },
        data,
        select: returnObjectParams,
      });
      if (!responseData) {
        throw new BadRequestException('There was an error updating the data!');
      }
      response = {
        statusCode: HttpStatus.CREATED,
        data: responseData,
      };
      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async Delete(
    id: string | null,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>> {
    let response: IResponse<R | null>;
    try {
      if (id == null) {
        const responseData = await this.prismaModel.delete({
          where: query,
          select: returnObjectParams,
        });
        if (!responseData) {
          throw new BadRequestException(
            'There was an error deleting the data!',
          );
        }
        response = {
          statusCode: HttpStatus.OK,
          data: responseData,
        };
        return response;
      }
      const responseData = await this.prismaModel.delete({
        where: { id },
        select: returnObjectParams,
      });
      if (!responseData) {
        throw new BadRequestException('There was an error deleting the data!');
      }
      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
      };
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        };
      } else if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async FindOne(
    query: any,
    returnObjectParams: any,
  ): Promise<IResponse<R | null>> {
    let response: IResponse<R | null>;
    try {
      const responseData = await this.prismaModel.findUnique({
        where: query,
        select: returnObjectParams,
      });
      if (!responseData) {
        throw new NotFoundException('Not found!');
      }
      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
      };
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        };
      } else if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async FindMany(
    returnObjectParams: any,
    query?: any,
    pageIndex?: number,
    pagination?: number,
  ): Promise<IResponse<R[]>> {
    let response: IResponse<R[]>;
    try {
      const page = getPageIndex(pageIndex);
      const limit = pagination ?? MAX_LIMIT_SIZE;
      const skip = getLimitSize(page, limit);

      const whereCondition = query ?? {};

      let responseData: R[] = [];
      if (pageIndex && pagination) {
        responseData = await this.prismaModel.findMany({
          where: whereCondition,
          select: returnObjectParams,
          take: limit,
          skip,
          orderBy: {
            createdAt: 'desc',
          },
        });
      } else {
        responseData = await this.prismaModel.findMany({
          where: whereCondition,
          select: returnObjectParams,
          orderBy: {
            createdAt: 'desc',
          },
        });
      }
      // count total items
      const total = await this.prismaModel.count({
        where: whereCondition,
      });

      const totalPages = pagination ? Math.ceil(total / pagination) : total;

      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
        page: pageIndex,
        total,
        totalPages,
      };

      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async CreateMany(
    data: C[],
    includeParams: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const results = await Promise.all(
      data.map((d) => this.Create(d, includeParams)),
    );

    // Récupère les erreurs
    const errors = results.filter((r) => (r.statusCode as number) >= 400);

    if (errors.length > 0) {
      return {
        statusCode: errors[0].statusCode,
        message: errors[0].message ?? 'Error while creating multiple records',
      };
    }

    // Récupère uniquement les data
    const createdData = results
      .map((r) => r.data)
      .filter((d): d is R => d !== null && d !== undefined);

    const response: IResponse<R[] | (Awaited<R> | null)[]> = {
      statusCode: HttpStatus.OK,
      data: createdData,
    };

    return response;
  }
  async UpdateMany(
    data: U[],
    includeParams: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    const results = await Promise.all(
      data.map((d) => this.Update((d as any).id, d, includeParams)),
    );

    // Récupère les erreurs
    const errors = results.filter((r) => (r.statusCode as number) >= 400);

    if (errors.length > 0) {
      return {
        statusCode: errors[0].statusCode,
        message: errors[0].message ?? 'Error while updating multiple records',
      };
    }

    // Récupère uniquement les data
    const updatedData = results
      .map((r) => r.data)
      .filter((d): d is R => d !== null && d !== undefined);

    const response: IResponse<R[] | (Awaited<R> | null)[]> = {
      statusCode: HttpStatus.OK,
      data: updatedData,
    };

    return response;
  }

  async DeleteMany(
    includeParams: any,
    query?: any,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    let response: IResponse<R[] | (Awaited<R> | null)[]>;
    try {
      const responseData = await this.prismaModel.deleteMany({
        where: query,
        select: includeParams,
      });
      if (!responseData) {
        throw new BadRequestException('There was an error deleting the data!');
      } else if (responseData.count === 0) {
        throw new NotFoundException('Not found!');
      }
      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
      };
      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async Search(
    filter: Partial<R>,
    includeParams: any,
    pageIndex?: number,
    pagination?: number,
  ): Promise<IResponse<R[] | (Awaited<R> | null)[]>> {
    let response: IResponse<R[] | (Awaited<R> | null)[]>;
    try {
      const page = getPageIndex(pageIndex);
      const limit = pagination ?? MAX_LIMIT_SIZE;
      const skip = getLimitSize(page, limit);

      let responseData: R[];
      if (pageIndex && pagination) {
        responseData = await this.prismaModel.findMany({
          where: filter,
          select: includeParams,
          take: limit,
          skip,
          orderBy: { createdAt: 'desc' },
        });
      } else {
        responseData = await this.prismaModel.findMany({
          where: filter,
          select: includeParams,
          orderBy: { createdAt: 'desc' },
        });
      }

      const total = await this.prismaModel.count({ where: filter });
      const totalPages = pagination ? Math.ceil(total / pagination) : total;

      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
        page: pageIndex,
        total,
        totalPages,
      };
      return response;
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async MoveToBin(
    id: string | null,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>> {
    let response: IResponse<R | null>;
    try {
      if (id == null) {
        const responseData = await this.prismaModel.update({
          where: query,
          data: { isDeleted: true },
          select: returnObjectParams,
        });
        if (!responseData) {
          throw new BadRequestException(
            'There was an error moving the data into bin!',
          );
        }
        response = {
          statusCode: HttpStatus.OK,
          data: responseData,
        };
        return response;
      }
      const responseData = await this.prismaModel.update({
        where: { id },
        data: { isDeleted: true },
        select: returnObjectParams,
      });
      if (!responseData) {
        throw new BadRequestException(
          'There was an error moving the data into bin!',
        );
      }
      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
      };
      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }

  async RestoreFromBinPhoto(
    id: string | null,
    returnObjectParams: any,
    query?: any,
  ): Promise<IResponse<R | null>> {
    let response: IResponse<R | null>;
    try {
      if (id == null) {
        const responseData = await this.prismaModel.update({
          where: query,
          data: { isDeleted: false },
          select: returnObjectParams,
        });
        if (!responseData) {
          throw new BadRequestException(
            'There was an error restoring the data frmo bin!',
          );
        }
        response = {
          statusCode: HttpStatus.OK,
          data: responseData,
        };
        return response;
      }
      const responseData = await this.prismaModel.update({
        where: { id },
        data: { isDeleted: false },
        select: returnObjectParams,
      });
      if (!responseData) {
        throw new BadRequestException(
          'There was an error restoring the data frmo bin!',
        );
      }
      response = {
        statusCode: HttpStatus.OK,
        data: responseData,
      };
      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        response = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        response = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
      return response;
    }
  }
}
