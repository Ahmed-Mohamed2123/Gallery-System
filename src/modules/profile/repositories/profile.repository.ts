import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Profile } from "../entities/profile.entity";

@Injectable()
export class ProfileRepository extends Repository<Profile> {

  constructor(dataSource: DataSource) {
    super(Profile, dataSource.createEntityManager());
  }

  public async getProfileById(profileId: string): Promise<Profile> {
    return this.findOne({
      where: {
        id: profileId
      }
    });
  }
}