import { Unique, Column, Entity } from "typeorm";
import { BaseDocument } from "../../../shared/database/base-document";

@Entity("verified_emails")
@Unique(["email", "emailToken"])
export class EmailVerification extends BaseDocument {

  @Column()
  email: string;

  @Column()
  emailToken: string;

  @Column()
  timestamp: Date;
}