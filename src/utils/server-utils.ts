import { Collection, Guild, GuildMember } from 'discord.js';

export abstract class ServerUtils {
    public static getMemberDiscordIds(server: Guild): string[] {
        return server.members.cache.filter(member => !member.user.bot).keyArray();
    }

    public static async findMember(server: Guild, query: string): Promise<GuildMember> {
        let members: Collection<string, GuildMember>;

        try {
            members = await server.members.fetch();
        } catch (error) {
            throw error;
        }

        query = query.toLowerCase();

        return (
            members.find(member => member.nickname?.toLowerCase().includes(query)) ??
            members.find(member => member.user.tag.toLowerCase().includes(query)) ??
            undefined
        );
    }
}
