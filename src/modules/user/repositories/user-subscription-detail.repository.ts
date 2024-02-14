import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserSubscriptionDetail } from "../entities/user-subscription-detail.entity";
import { ISubscriptionDetail } from "../../../shared/interfaces/subscription-detail.interface";

@Injectable()
export class UserSubscriptionDetailRepository extends Repository<UserSubscriptionDetail> {

  constructor(dataSource: DataSource) {
    super(UserSubscriptionDetail, dataSource.createEntityManager());
  }

  public async getUserSubscriptionDetail(userId: string) {
    return this.findOne({
      where: {
        userId
      }
    });
  }

  public async registerUserSubscriptionDetails(subscriptionDetail: ISubscriptionDetail): Promise<UserSubscriptionDetail> {
    const userSubscriptionDetail = this.create(subscriptionDetail);
    return userSubscriptionDetail.save();
  }
}