import {createParamDecorator, ExecutionContext} from "@nestjs/common";
import {Request} from "express";

export const LangHeader = createParamDecorator(
    (data: any, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        return request.headers["x-lang"] ? request.headers["x-lang"].toString().toLowerCase()
            : request.headers["X-Lang"] ? request.headers["X-Lang"].toString().toLowerCase() : "ar";
    }
);
