import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const RequiredQuery = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const param = request.query[key];
    if (!param) {
      throw new BadRequestException(`Missing required query: '${key}'`);
    }
    return param;
  }
);
