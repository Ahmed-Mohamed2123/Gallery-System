import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const RequiredParam = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const param = request.params[key];
    if (!param) {
      throw new BadRequestException(`Missing required query param: '${key}'`);
    }
    return param;
  }
);
