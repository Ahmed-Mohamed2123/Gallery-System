import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { validate as isValidUUID } from "uuid";


@ValidatorConstraint({ name: "isValidUUID", async: false })
export class IsValidUUID implements ValidatorConstraintInterface {
  validate(uuid: string, args: ValidationArguments) {
    return isValidUUID(uuid);
  }

  defaultMessage(args: ValidationArguments) {
    return "UUID ($value) is not valid!";
  }
}