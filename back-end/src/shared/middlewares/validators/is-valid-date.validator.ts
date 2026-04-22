import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidDate(
  validationOptions?: ValidationOptions,
): (object: object, propertyName: string) => void {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            value &&
            (value instanceof Date ||
              (!isNaN(Date.parse(value)) &&
                new Date(value).toString() !== 'Invalid Date'))
          );
        },
        defaultMessage() {
          return 'The given value is an invalid date.';
        },
      },
    });
  };
}
