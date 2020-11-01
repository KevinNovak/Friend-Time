import { Guild, GuildMember } from 'discord.js';

export abstract class GuildUtils {
    public static async getMemberDiscordIds(guild: Guild): Promise<string[]> {
        return (await guild.members.fetch()).filter(member => !member.user.bot).keyArray();
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
