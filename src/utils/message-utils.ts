import { RESTJSONErrorCodes as DiscordApiErrors } from 'discord-api-types/v9';
import {
    DiscordAPIError,
    EmojiResolvable,
    Message,
    MessageEmbed,
    MessageOptions,
    MessageReaction,
    TextBasedChannel,
    User,
} from 'discord.js';

import { EmbedUtils } from './index.js';

const IGNORED_ERRORS = [
    DiscordApiErrors.UnknownMessage,
    DiscordApiErrors.UnknownChannel,
    DiscordApiErrors.UnknownGuild,
    DiscordApiErrors.UnknownUser,
    DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
    DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
];

export class MessageUtils {
    public static content(msg: Message): string {
        return [
            msg.content,
            ...msg.embeds.filter(embed => !embed.provider).map(embed => EmbedUtils.content(embed)),
        ]
            .filter(Boolean)
            .join('\n');
    }

    public static async send(
        target: User | TextBasedChannel,
        content: string | MessageEmbed | MessageOptions
    ): Promise<Message> {
        try {
            let msgOptions = this.messageOptions(content);
            return await target.send(msgOptions);
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async reply(
        msg: Message,
        content: string | MessageEmbed | MessageOptions
    ): Promise<Message> {
        try {
            let msgOptions = this.messageOptions(content);
            return await msg.reply(msgOptions);
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async edit(
        msg: Message,
        content: string | MessageEmbed | MessageOptions
    ): Promise<Message> {
        try {
            let msgOptions = this.messageOptions(content);
            return await msg.edit(msgOptions);
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async react(msg: Message, emoji: EmojiResolvable): Promise<MessageReaction> {
        try {
            return await msg.react(emoji);
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static async delete(msg: Message): Promise<Message> {
        try {
            return await msg.delete();
        } catch (error) {
            if (error instanceof DiscordAPIError && IGNORED_ERRORS.includes(error.code)) {
                return;
            } else {
                throw error;
            }
        }
    }

    public static messageOptions(content: string | MessageEmbed | MessageOptions): MessageOptions {
        let options: MessageOptions = {};
        if (typeof content === 'string') {
            options.content = content;
        } else if (content instanceof MessageEmbed) {
            options.embeds = [content];
        } else {
            options = content;
        }
        return options;
    }
}
