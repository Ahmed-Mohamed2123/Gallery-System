import * as bcrypt from "bcryptjs";

export class Hash {
    public static async generateEncryptedPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

    public static async generateSalt(password: string, salt: string): Promise<string> {
        return bcrypt.genSalt();
    }

    public static async checkPasswordMatch(newPassword: string, currentPassword: string) {
        return bcrypt.compare(newPassword, currentPassword)
    }
}
