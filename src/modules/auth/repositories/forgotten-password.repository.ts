import {DataSource, Repository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {ForgottenPassword} from "../entities/forgotten-password.entity";
import {ICreateForgottenPasswordToken} from "../interfaces/create-forgotten-password-token.interface";
import {IFilterForgottenPasswordToken} from "../interfaces/filter-forgotten-password-token.interface";

@Injectable()
export class ForgottenPasswordRepository extends Repository<ForgottenPassword> {

    constructor(dataSource: DataSource) {
        super(ForgottenPassword, dataSource.createEntityManager());
    }

    public async getForgottenPasswordToken(payload: IFilterForgottenPasswordToken) {
        return this.findOneBy(payload);
    }

    public async createForgottenPasswordToken(payload: ICreateForgottenPasswordToken) {
        return this.create(payload);
    }

    public async deleteForgottenPasswordTokenById(id: string) {
        return this.delete(id);
    }
}
