import {forwardRef, Inject, Injectable, NotFoundException} from "@nestjs/common";
import {concatMap, forkJoin, from, lastValueFrom, map, of, throwError} from "rxjs";
import {tap} from "rxjs/operators";
import {Follow} from "./entities/follow.entity";
import {UserService} from "../user/services/user.service";
import {GetFollowerDto} from "./dtos/get-follower.dto";
import {UnfollowUserDto} from "./dtos/unfollow-user.dto";
import {FollowUserDto} from "./dtos/follow-user.dto";
import {CheckUserFlowExistenceDto} from "./dtos/check-user-flow-existence.dto";
import {FollowRepository} from "./repositories/follow.repository";
import {IFilterFollower} from "./interfaces/filter-follower.interface";
import {ICreateFollower} from "./interfaces/create-follower.interface";
import {User} from "../user/entities/user.entity";

@Injectable()
export class FollowService {
    constructor(@Inject(forwardRef(() => UserService)) private userService: UserService,
                private followerRepo: FollowRepository) {
    }

    public async followUser(followUserDto: FollowUserDto): Promise<Follow> {
        const {followerUserId, followingUserId} = followUserDto;
        let followerUser: User;
        let followingUser: User;

        const usersLookupStream$ = forkJoin([
            from(this.userService.getUserById(followerUserId)),
            from(this.userService.getUserById(followingUserId))
        ]).pipe(
            concatMap(([foundFollowerUser, foundFollowingUser]) => {
                if (!foundFollowerUser && !foundFollowingUser) {
                    return throwError(() => new NotFoundException("Follower or following not found!"));
                }

                return of({
                    foundFollowerUser,
                    foundFollowingUser
                });
            }),
            tap(({foundFollowerUser, foundFollowingUser}) => {
                followerUser = foundFollowerUser;
                followingUser = foundFollowingUser;
            })
        );

        const createFollowerStream$ = () => concatMap(() => {
            const payload: ICreateFollower = {
                followerUser,
                followingUser
            };

            return from(this.followerRepo.createFollower(payload));
        });

        const execution$ = usersLookupStream$.pipe(
            createFollowerStream$()
        );

        return lastValueFrom(execution$);
    }

    public async checkUserFlowExistence(checkUserFlowExistenceDto: CheckUserFlowExistenceDto): Promise<boolean> {
        const {followerUserId, followingUserId} = checkUserFlowExistenceDto;
        const followersCountPayload: IFilterFollower = {
            followerUserId,
            followingUserId
        };

        const execution$ = from(this.followerRepo.getFollowersCount(followersCountPayload)).pipe(
            map(count => count > 0)
        );

        return lastValueFrom(execution$);
    }

    public async unfollowUser(unfollowUserDto: UnfollowUserDto) {
        const {followerUserId, followingUserId} = unfollowUserDto;
        let follower: Follow;

        const followerPayload: IFilterFollower = {
            followingUserId,
            followerUserId
        };

        const followLookupStream$ = from(this.followerRepo.getFollower(followerPayload)).pipe(
            concatMap((foundFollower: Follow) =>
                foundFollower ?
                    of(foundFollower) : throwError(() => new NotFoundException())
            ),
            tap((foundFollower: Follow) => follower = foundFollower)
        );

        const removeFollowerStream$ = () => concatMap(() =>
            from(follower.remove()));

        const execution$ = followLookupStream$.pipe(
            removeFollowerStream$()
        );

        return lastValueFrom(execution$);
    }

    public async getPaginatedFollowers(followerDto: GetFollowerDto) {
        const {userId, page, limit} = followerDto;
        const followersPayload: IFilterFollower = {
            followingUserId: userId,
            page,
            limit
        };

        const execution$ = forkJoin([
            from(this.followerRepo.getFollowersCount(followersPayload)),
            from(this.followerRepo.getPaginatedFollowers(followersPayload))
        ]).pipe(
            map(([followersCount, followers]) => ({
                    followersCount,
                    page: page,
                    limit: limit,
                    data: followers
                })
            )
        );

        return lastValueFrom(execution$);
    }

    public async getUserFollowers(followingUserId: string): Promise<Follow[]> {
        const followersPayload: IFilterFollower = {
            followingUserId
        };

        return this.followerRepo.getFollowers(followersPayload);
    }
}
