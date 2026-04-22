import { ValidationError } from 'class-validator';

export class ValidatorFormatter {
  private static readonly CONSTRAINTS_PRIORITY = [
    'isNotEmpty',
    'isString',
    'maxLength',
  ];

  private static getHighestPriorityError(
    constraints: Record<string, string>,
  ): string {
    for (const key of ValidatorFormatter.CONSTRAINTS_PRIORITY) {
      if (constraints[key]) {
        return constraints[key];
      }
    }
    return Object.values(constraints)[0];
  }

  static format(errors: ValidationError[]): string {
    return errors.map((err) => {
      if (err.constraints) {
        return ValidatorFormatter.getHighestPriorityError(err.constraints);
      }
      return 'Validation failed for unknown reason';
    })[0];
  }
}
