import {Controller, Get} from "@nestjs/common";
import {HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator} from "@nestjs/terminus";
import {ConfigService} from "@nestjs/config";
import {PermitUnauthenticatedAccess} from "../decorators/permit-unauthenticated-access.decorator";

@Controller("health")
export class HealthController {
    constructor(
        private healthCheckService: HealthCheckService,
        private http: HttpHealthIndicator,
        private db: TypeOrmHealthIndicator,
        private configService: ConfigService
    ) {
    }

    @Get()
    @PermitUnauthenticatedAccess()
    @HealthCheck()
    async checkHealth() {
        return this.healthCheckService.check([
            () => this.http.pingCheck("Basic Check", this.configService.get("SERVER_URL")),
            () => this.db.pingCheck("Postgresql")
        ]);
    }
}
