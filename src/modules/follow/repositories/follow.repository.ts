import {Injectable} from "@nestjs/common";
import {Follow} from "../entities/follow.entity";
import {DataSource, Repository} from "typeorm";
import {IFilterFollower} from "../interfaces/filter-follower.interface";
import {ICreateFollower} from "../interfaces/create-follower.interface";

@Injectable()
export class FollowRepository extends Repository<Follow> {

    constructor(dataSource: DataSource) {
        super(Follow, dataSource.createEntityManager());
    }

    public async getFollower(payload: IFilterFollower): Promise<Follow> {
        const {followerUserId, followingUserId} = payload;
        return this.findOne({
            where: {
                followerUserId,
                followingUserId
            }
        });
    }

    public async getFollowersCount(payload: IFilterFollower) {
        const {followerUserId, followingUserId} = payload;
        return this.count({
            where: {
                followerUserId,
                followingUserId
            }
        });
    }

    public async getPaginatedFollowers(payload: IFilterFollower) {
        const {page, limit, followingUserId} = payload;
        const skippedItems = limit * (page - 1);
        return this.find({
            where: {
                followingUserId
            },
            relations: ["followerUser"],
            skip: skippedItems,
            take: page
        });
    }

    public async getFollowers(payload: IFilterFollower) {
        const {followingUserId} = payload;
        return this.find({
            where: {
                followingUserId
            },
            relations: ["followerUser"]
        });
    }

    public async createFollower(payload: ICreateFollower): Promise<Follow> {
        const createdFollower = this.create(payload);
        return createdFollower.save();
    }
}