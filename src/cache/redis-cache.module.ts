import {Global, Module} from "@nestjs/common";
import {CacheModule} from "@nestjs/cache-manager";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as redisStore from "cache-manager-redis-store";
import {CacheService} from "./services/cache.service";

@Global()
@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService): any => {
                return {
                    store: redisStore,
                    host: config.get("REDIS_HOST"),
                    port: +config.get("REDIS_PORT")
                };
            },
            inject: [ConfigService],
        })],
    providers: [CacheService],
    exports: [CacheModule, CacheService]
})
export class RedisCacheModule {
}
