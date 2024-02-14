import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { ICreateUser } from "../interfaces/create-user.interface";

@Injectable()
export class UserRepository extends Repository<User> {

  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.findOne({ where: { email: email.toString().trim() } });
  }

  public async getUserById(id: string): Promise<User> {
    return this.findOne({ where: { id } });
  }

  public async createUser(createUser: ICreateUser): Promise<User> {
    const userSaved = this.create(createUser);
    return userSaved.save();
  }

  public async checkEmailExistence(email: string) {
    const query = this.createQueryBuilder("auth");
    return new Promise(resolve => {
      query.select("email")
        .where("auth.email LIKE :email", { email: email.toString().trim() })
        .getCount()
        .then(count => resolve(count > 0));
    });
  }

  public async makeUserVerified(userId: string) {
    return this.update(userId, { isEmailVerified: true });
  }
}
