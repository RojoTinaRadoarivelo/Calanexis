import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { Users } from './users.type';
import { CrudController } from '../../core/crud/abstract-crud.controller';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../shared/middlewares/DTOs/users.dto';
import { AuthGuard } from '../../shared/middlewares/Guards/auth.guard';
import { reponsesDTO } from '../../utils/interfaces/responses';
import { AuthUserPresenter } from '../../auth/interfaces/presenters/auth-user.presenter';
import { SignedUserDto } from '../../auth/interfaces/dtos/signed-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { IResponse } from '../../shared/interfaces/responses.interfaces';
import { ApiMessage } from '../../shared/middlewares/decorators/api-message';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';
import { uploadImage } from '../../utils/storage.util';

@Controller('users')
export class UsersController extends CrudController<
  CreateUserDto,
  UpdateUserDto,
  Users
> {
  constructor(
    protected readonly service: UsersService,
    private readonly _preferenceService: UserPreferencesService,
  ) {
    super(service);
  }
  protected getCreateDto() {
    return CreateUserDto;
  }

  protected getUpdateDto() {
    return UpdateUserDto;
  }

  // 🔥 Nouvelle route spécifique @Get('active') findActiveUsers() { return []; } }

  @Get('info')
  @UseGuards(AuthGuard)
  async FindByToken(@Req() req: any): Promise<reponsesDTO<SignedUserDto>> {
    const userPresenter: AuthUserPresenter = new AuthUserPresenter();
    let dataResponse: SignedUserDto | null = null;
    if (req.user) {
      const findPreference = await this.findPreference(req.user.id);
      req.user.preference = findPreference?.data ?? null;
      dataResponse = userPresenter.present(req.user);
    }
    return {
      message: 'Information about the user',
      data: dataResponse,
      statusCode: 200,
    };
  }

  @UseInterceptors(
    FileInterceptor('objectFile', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        // Accept any image mime type (image/*)
        if (!file.mimetype || !file.mimetype.startsWith('image/')) {
          return cb(
            new Error('Seuls les fichiers image/* sont acceptés'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiMessage('update')
  @Put(':id')
  override async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @Req() req?: any,
  ): Promise<IResponse<Users | null>> {
    const dtoClass = this.getUpdateDto();
    const validated = (await new GenericDtoValidatorPipe(dtoClass).transform(
      data,
      { type: 'body' } as any,
    )) as UpdateUserDto;

    const file: Express.Multer.File | undefined = req?.file;
    if (file) {
      const uploaded = await uploadImage({
        folder: 'avatars',
        originalName: file.originalname,
        buffer: file.buffer,
        contentType: file.mimetype,
      });
      validated.avatar = uploaded.publicUrl;
    }
    return await this.service.Update(req.user.id, validated, {
      hasFile: !!file,
    });
  }

  @ApiMessage(`delete`)
  @Delete(':id')
  override async delete(id: string): Promise<IResponse<Users | null>> {
    return await this.service.Delete(id);
  }

  private async findPreference(user_id: string) {
    return await this._preferenceService.FindOne({ user_id, isDeleted: false });
  }
}
