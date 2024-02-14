import {forwardRef, Inject, Injectable, NotFoundException} from "@nestjs/common";
import { concatMap, from, lastValueFrom, of, throwError } from "rxjs";
import { tap } from "rxjs/operators";
import { UserSubscriptionDetailRepository } from "../repositories/user-subscription-detail.repository";
import { RegisterUserSubscriptionDetailDto } from "../dtos/register-user-subscription-detail.dto";
import { ISubscriptionDetail } from "../../../shared/interfaces/subscription-detail.interface";
import { UserService } from "./user.service";
import { User } from "../entities/user.entity";

@Injectable()
export class UserSubscriptionDetailService {
  constructor(private userSubscriptionDetailRepository: UserSubscriptionDetailRepository,
              @Inject(forwardRef(() => UserService)) private userService: UserService) {
  }

  public async getUserSubscriptionDetails(userId: string) {
    return this.userSubscriptionDetailRepository.getUserSubscriptionDetail(userId);
  }

  public async registerUserSubscriptionDetails(user: User, registerUserSubscriptionDetailDto: RegisterUserSubscriptionDetailDto) {
    const { keys, endpoint } = registerUserSubscriptionDetailDto;
    const userId = user.id;
    let userData: User;
    const userLookupStream$ = from(this.userService.getUserById(userId)).pipe(
      concatMap((foundUser: User) =>
        foundUser ? of(foundUser) : throwError(() => new NotFoundException())
      ),
      tap((foundUserData: User) => userData = foundUserData)
    );

    const registerUserSubscriptionDetailsStream$ = () => concatMap(() => {
      const payload: ISubscriptionDetail = {
        keys,
        endpoint,
        user: userData
      };
      return from(this.userSubscriptionDetailRepository.registerUserSubscriptionDetails(payload));
    });

    const execution$ = userLookupStream$.pipe(
      registerUserSubscriptionDetailsStream$()
    );

    return lastValueFrom(execution$);
  }
}