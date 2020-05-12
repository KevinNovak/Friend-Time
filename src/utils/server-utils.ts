import { Channel, Collection, DMChannel, Guild, GuildMember, TextChannel } from 'discord.js';

export abstract class ServerUtils {
    public static getMemberDiscordIds(server: Guild): string[] {
        return server.members.cache.filter(member => !member.user.bot).keyArray();
    }

    public static isDirectChannel(channel: Channel): boolean {
        return channel instanceof DMChannel;
    }

    public static isTextChannel(channel: Channel): boolean {
        return channel instanceof TextChannel;
    }

    public static permToSend(server: Guild, channel: Channel): boolean {
        let isTextChannel = this.isTextChannel(channel);
        if (isTextChannel) {
            return (channel as TextChannel).permissionsFor(server.me).has('SEND_MESSAGES');
        } else {
            return this.isDirectChannel(channel);
        }
    }

    public static permToReact(server: Guild, channel: Channel): boolean {
        let isTextChannel = this.isTextChannel(channel);
        if (isTextChannel) {
            return (channel as TextChannel).permissionsFor(server.me).has('ADD_REACTIONS');
        } else {
            return this.isDirectChannel(channel);
        }
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
