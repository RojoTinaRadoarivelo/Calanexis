import { Body, Get, Post, Put, Delete, Param, Query } from '@nestjs/common';

import { ICrudService } from '../../shared/interfaces/crud.interfaces';
import { ApiMessage } from '../../shared/middlewares/decorators/api-message';
import { GenericDtoValidatorPipe } from '../../shared/middlewares/pipes/generic-dto-validator.pipe';

export abstract class CrudController<C, U, R> {
  protected constructor(protected readonly service: ICrudService<C, U, R>) {}

  protected abstract getCreateDto(): new (...args: any[]) => object;
  protected abstract getUpdateDto(): new (...args: any[]) => object;

  @ApiMessage(`create`)
  @Post()
  async create(@Body() data: C) {
    const dtoClass = this.getCreateDto();
    const validated = await new GenericDtoValidatorPipe(dtoClass).transform(
      data,
      { type: 'body' } as any,
    );
    return this.service.Create(validated as C);
  }

  @ApiMessage(`bin`)
  @Put('moveToBin/:id')
  moveToBin(@Param('id') id: string) {
    return this.service.MoveToBin(id);
  }

  @ApiMessage(`bin`)
  @Put('restoreFromBin/:id')
  restoreFromBin(@Param('id') id: string) {
    return this.service.RestoreFromBinPhoto(id);
  }

  @ApiMessage(`update`)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: U) {
    const dtoClass = this.getUpdateDto();
    const validated = await new GenericDtoValidatorPipe(dtoClass).transform(
      data,
      { type: 'body' } as any,
    );
    return this.service.Update(id, validated as U);
  }

  @ApiMessage(`delete`)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.Delete(id);
  }

  @ApiMessage(`search`)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.FindOne({ id });
  }

  @ApiMessage(`search`)
  @Post('search')
  searchMany(
    @Body() data: Partial<R>,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageIndex = Number(page) || undefined;
    const limitOrSize = Number(limit) || undefined;
    return pageIndex && limitOrSize
      ? this.service.Search(data, pageIndex, limitOrSize)
      : this.service.Search(data);
  }

  @ApiMessage(`list`)
  @Get()
  findMany(@Query('page') page?: number, @Query('limit') limit?: number) {
    const pageIndex = Number(page) || undefined;
    const limitOrSize = Number(limit) || undefined;
    return pageIndex && limitOrSize
      ? this.service.FindMany(pageIndex, limitOrSize)
      : this.service.FindMany();
  }
}
