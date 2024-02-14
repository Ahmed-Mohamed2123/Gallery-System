import {Unique, Column, Entity} from "typeorm";
import {BaseDocument} from "../../../shared/database/base-document";

@Entity('forgotten-passwords')
@Unique(['email', 'newPasswordToken'])
export class ForgottenPassword extends BaseDocument {
    @Column()
    email: string;

    @Column()
    newPasswordToken: string;

    @Column()
    timestamp: Date;
}
