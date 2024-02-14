import * as randToken from 'rand-token';

export function generateRefreshToken(): string {
    return randToken.generate(16);
}