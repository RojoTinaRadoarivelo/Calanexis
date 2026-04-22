import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UserRepository } from './users.repository';
import {
  CreatedUserOutputDto,
  DeletedUserOutputDto,
  FilterUsersOutputDto,
  SearchUsersOutputDto,
  UpdatedUserOutputDto,
  Users,
  UsersOutputDto,
} from './users.type';
import { CrudService } from '../../core/crud/abstract-crud.service';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../shared/middlewares/DTOs/users.dto';
import {
  DEFAULT_ERROR_MSG,
  USER_ERROR_MESSAGE,
} from '../../auth/interfaces/error-messages';
import { assertSingle } from '../../utils/interfaces/assert-single.utils';
import { RemoveFile } from '../../utils/files.util';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { IPrismaService } from '../../core/configs/interfaces/prisma-ripository/prisma.service';

@Injectable()
export class UsersService extends CrudService<
  CreateUserDto,
  UpdateUserDto,
  Users
> {
  // default
  protected includeParams: any = UsersOutputDto;
  // crud include
  protected createIncludeParams: any = CreatedUserOutputDto;
  protected updateIncludeParams: any = UpdatedUserOutputDto;
  protected deleteIncludeParams: any = DeletedUserOutputDto;
  protected searchIncludeParams: any = SearchUsersOutputDto;
  protected listFilterIncludeParams: any = FilterUsersOutputDto;
  constructor(
    private readonly repo: UserRepository,
    private readonly _dbService: IPrismaService,
  ) {
    super(repo);
  }
  // override si nécessaire async create(data: CreateUserDto) { // logique custom return super.create(data); }

  override async Update(
    id: string | null,
    data: UpdateUserDto,
    query?: any,
  ): Promise<IResponse<Users | null>> {
    let response: IResponse<Users | null>;
    let user: Users | null = null;
    try {
      const hasFile = !!query?.hasFile;
      const { avatar, email, userName } = data;
      const { statusCode, result, message } = await this.findUser(id);
      if (result) {
        user = result;
      } else {
        throw new HttpException(message, statusCode);
      }

      // 2️⃣ supprimer l’ancienne image SI changement
      if (hasFile && user.avatar && user.avatar !== avatar) {
        await RemoveFile(user.avatar);
      }
      // update User
      const UserUpdated = await this.repo.Update(
        id,
        { avatar, email, userName },
        this.updateIncludeParams,
      );
      if (UserUpdated) {
        user = assertSingle(
          UserUpdated.data,
          'User not found or invalid result',
        );
      } else {
        throw new InternalServerErrorException(DEFAULT_ERROR_MSG.unexpected);
      }
      return {
        message: 'The user was updated successfuly!',
        data: user ?? null,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        };
      } else if (error instanceof ConflictException) {
        response = {
          statusCode: HttpStatus.CONFLICT,
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

  override async Delete(id: string): Promise<IResponse<Users | null>> {
    let response: IResponse<Users | null>;
    let user: Users | null = null;
    try {
      const { statusCode, result, message } = await this.findUser(id);
      if (result) {
        user = result;
      } else {
        throw new HttpException(message, statusCode);
      }

      const deletedUser = await this._dbService.prisma.users.delete({
        where: { id },
        select: this.deleteIncludeParams,
      });

      if (!deletedUser) {
        throw new BadRequestException('Bad request while deleting the user');
      }

      // Clean up avatar file if present
      if (user?.avatar) {
        await RemoveFile(user.avatar);
      }

      response = {
        statusCode: HttpStatus.OK,
        data: result,
        message: 'User was deleted successfuly.',
      };

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        response = {
          statusCode: HttpStatus.NOT_FOUND,
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

  async findUser(id: string | null) {
    try {
      if (!id) {
        throw new BadRequestException('Missing user id');
      }
      const existingUser = await this.repo.FindOne(
        { id },
        this.searchIncludeParams,
      );

      if (!existingUser.data) {
        throw new NotFoundException(USER_ERROR_MESSAGE.notfound);
      }

      return {
        statusCode: HttpStatus.OK,
        result: assertSingle(
          existingUser.data,
          'User not found or invalid result',
        ),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
        };
      } else if (error instanceof BadRequestException) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
        };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        };
      }
    }
  }
}
