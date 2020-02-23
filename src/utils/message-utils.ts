import { Message } from 'discord.js';
import { ServerUtils } from './server-utils';
import { StringUtils } from './string-utils';

export abstract class MessageUtils {
    public static fromDirectChannel(msg: Message): boolean {
        return ServerUtils.isDirectChannel(msg.channel);
    }

    public static fromTextChannel(msg: Message): boolean {
        return ServerUtils.isTextChannel(msg.channel);
    }

    public static permToReply(msg: Message): boolean {
        return ServerUtils.permToSend(msg.guild, msg.channel);
    }

    public static permToReact(msg: Message): boolean {
        return ServerUtils.permToReact(msg.guild, msg.channel);
    }

    public static sentByBot(msg: Message): boolean {
        return msg.author.bot;
    }

    public static startsWithMyMention(msg: Message): boolean {
        let myMention = StringUtils.formatMention(msg.client.user.id);
        return this.startsWithPrefix(msg, myMention);
    }

    public static startsWithPrefix(msg: Message, prefix: string): boolean {
        return msg.content.startsWith(prefix);
    }

    public static extractArgs(msg: Message): string[] {
        return msg.content.split(' ');
    }
}
