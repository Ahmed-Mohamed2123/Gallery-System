import {SetMetadata} from "@nestjs/common";

export const PermitUnauthenticatedAccess = () => SetMetadata('permitUnauthenticatedAccess', true);
