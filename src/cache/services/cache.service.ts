import {Inject, Injectable} from "@nestjs/common";
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import {Cache} from "cache-manager";


@Injectable()
export class CacheService {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    }

    public async set<T>(key: string, value: T, ttl?: number): Promise<T> {
        try {
            if (!value) return null;
            ttl ? await this.cacheManager.set(key, value, ttl) : await this.cacheManager.set(key, value);
            return value;
        } catch (err) {
            console.error("set cache error:", err);
        }
    }

    public async get<T>(key: string): Promise<T> {
        try {
            if (!key) return null;
            return this.cacheManager.get(key);
        } catch (err) {
            console.error("set cache error:", err);
            return null;
        }
    }

    public async delete<T>(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
        } catch (err) {
            console.error("set cache error:", err);
        }
    }

}
