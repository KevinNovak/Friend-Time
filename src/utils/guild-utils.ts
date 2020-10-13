import { Guild, GuildMember } from 'discord.js';

export abstract class GuildUtils {
    public static getMemberDiscordIds(guild: Guild): string[] {
        return guild.members.cache.filter(member => !member.user.bot).keyArray();
    }

    public static async findMember(guild: Guild, query: string): Promise<GuildMember> {
        query = query.toLowerCase();

        let members = await guild.members.fetch();
        return (
            members.find(member => member.nickname?.toLowerCase().includes(query)) ??
            members.find(member => member.user.tag.toLowerCase().includes(query)) ??
            members.find(member => member.user.id.includes(query)) ??
            undefined
        );
    }
}
