import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class BaseDocument extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "createdAt", default: new Date() })
  createdAt: Date;

  @Column({ name: "updatedAt", default: new Date() })
  updatedAt: Date;
}