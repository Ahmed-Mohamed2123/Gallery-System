import {Controller, Get} from '@nestjs/common';
import {PermitUnauthenticatedAccess} from "./decorators/permit-unauthenticated-access.decorator";

@Controller()
export class AppController {
    constructor() {
    }

    @PermitUnauthenticatedAccess()
    @Get()
    async pingServer() {
        return "Server Pinged";
    }
}
