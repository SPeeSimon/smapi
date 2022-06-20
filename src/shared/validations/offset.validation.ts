import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { toNumber } from 'src/shared/validations/validations';

export function IsOffset(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsOffset',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === 'string') {
              return value.length <= 20 && toNumber(value) < 1000 && toNumber(value) > -1000;
          }
          if (typeof value === 'number') {
            return value < 1000 && value > -1000;
          }
          return false;
        },
      },
    });
  };
}
