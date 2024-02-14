import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { EmailVerification } from "../entities/email-verification.entity";
import { ICreateEmailVerification } from "../interfaces/create-email-verification.interface";
import { IFilterEmailVerification } from "../interfaces/filter-email-verification.interface";

@Injectable()
export class EmailVerificationRepository extends Repository<EmailVerification> {

  constructor(dataSource: DataSource) {
    super(EmailVerification, dataSource.createEntityManager());
  }

  public async getEmailVerificationData(payload: IFilterEmailVerification) {
    return this.findOneBy(payload);
  }

  public async createEmailVerification(payload: ICreateEmailVerification) {
    const emailVerification = this.create(payload);
    return emailVerification.save();
  }

  public async deleteEmailVerificationById(id: string) {
    return this.delete(id);
  }
}
