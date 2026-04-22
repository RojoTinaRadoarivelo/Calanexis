// import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
// import { plainToInstance } from 'class-transformer';
// import { validate, ValidationError } from 'class-validator';
// import { HttpExceptionUtil } from '../../../utils/http-exception.util';
// import { ValidatorFormatter } from '../../../utils/validator-formatter.util';

// @Injectable()
// export class GenericDtoValidatorPipe implements PipeTransform {
//   constructor(private readonly dtoClass?: any, private readonly validationGroups: string[] = []) { }
//   async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
//     const metatype = this.dtoClass ?? metadata.metatype;
//     if (!metatype || [String, Boolean, Number, Array].includes(metatype as any)) {
//       return value;
//     }

//     const isCreateMode = this.validationGroups.includes('create');

//     const object = plainToInstance(metatype, value);

//     if (isCreateMode) {
//       if (!value || typeof value !== 'object' || Object.keys(value).length === 0) {
//         HttpExceptionUtil.badRequest('Please give all the required information!');
//       }
//     } else {
//       const hasValidFields = Object.values(object).some((field) => field !== undefined);
//       if (!hasValidFields) {
//         HttpExceptionUtil.badRequest('Please provide at least one valid field to update!');
//       }
//     }

//     const errors: ValidationError[] = await validate(object, {
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       groups: this.validationGroups,
//     });

//     if (errors.length) {
//       HttpExceptionUtil.badRequest(ValidatorFormatter.format(errors));
//     }

//     return value;
//   }
// }
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { HttpExceptionUtil } from '../../../utils/http-exception.util';
import { ValidatorFormatter } from '../../../utils/validator-formatter.util';

@Injectable()
export class GenericDtoValidatorPipe implements PipeTransform {
  constructor(
    private readonly dtoClass?: new (...args: any[]) => object,
    private readonly validationGroups: string[] = [],
  ) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    const metatype = this.dtoClass ?? metadata.metatype;

    if (
      !metatype ||
      [String, Boolean, Number, Array].includes(metatype as any)
    ) {
      return value;
    }

    // Vérifie que le body est un objet
    if (
      !value ||
      typeof value !== 'object' ||
      Object.keys(value).length === 0
    ) {
      HttpExceptionUtil.badRequest(
        'Veuillez fournir toutes les informations requises!',
      );
    }

    const object = plainToInstance(metatype, value);

    // Validation avec class-validator
    const errors: ValidationError[] = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      groups: this.validationGroups,
    });

    if (errors.length > 0) {
      HttpExceptionUtil.badRequest(ValidatorFormatter.format(errors));
    }

    return object; // retourne l'objet validé
  }
}
