import {Injectable, CanActivate, ExecutionContext} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Reflector} from "@nestjs/core";
import {Observable} from "rxjs";

@Injectable()
export class APICheckGuard implements CanActivate {
    constructor(private configService: ConfigService,
                private reflector: Reflector) {
    }

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const permitUnauthenticatedAccess = this.reflector.get<boolean>("permitUnauthenticatedAccess", context.getHandler());
        if (permitUnauthenticatedAccess) return true;

        const xKeyHeader = request.headers["API-KEY"] ?? request.headers["api-key"];
        let api_key = this.configService.get("API_KEY");
        return api_key === xKeyHeader;
    }
}
