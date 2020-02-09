import { TextChannel, User } from 'discord.js';

export abstract class UserUtils {
    public static isBot(user: User): boolean {
        return user.bot;
    }

    public static isAdmin(user: User, channel: TextChannel): boolean {
        return channel.permissionsFor(user).has('ADMINISTRATOR');
    }
}
