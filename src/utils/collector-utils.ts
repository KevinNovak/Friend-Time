import { ButtonInteraction, Message, MessageReaction, TextBasedChannel, User } from 'discord.js';
import {
    ButtonRetriever,
    CollectorUtils as DjsCollectorUtils,
    ExpireFunction,
    MessageRetriever,
    ReactionRetriever,
} from 'discord.js-collector-utils';
import { createRequire } from 'node:module';

import { Lang } from '../services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class CollectorUtils {
    public static collectByMessage<T>(
        channel: TextBasedChannel,
        user: User,
        messageRetriever: MessageRetriever<T>,
        expireFunction?: ExpireFunction
    ): Promise<T> {
        return DjsCollectorUtils.collectByMessage(
            channel,
            (nextMsg: Message): boolean => nextMsg.author.id === user.id,
            (nextMsg: Message): boolean => {
                // Check if another command was ran, if so cancel the current running setup
                let nextMsgArgs = nextMsg.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(nextMsgArgs[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            messageRetriever,
            expireFunction,
            { time: Config.experience.promptExpireTime * 1000, reset: true }
        );
    }

    public static collectByReaction<T>(
        msg: Message,
        user: User,
        reactionRetriever: ReactionRetriever<T>,
        expireFunction?: ExpireFunction
    ): Promise<T> {
        return DjsCollectorUtils.collectByReaction(
            msg,
            (_msgReaction: MessageReaction, reactor: User): boolean => reactor.id === user.id,
            (nextMsg: Message): boolean => {
                // Check if another command was ran, if so cancel the current running setup
                let nextMsgArgs = nextMsg.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(nextMsgArgs[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            reactionRetriever,
            expireFunction,
            { time: Config.experience.promptExpireTime * 1000, reset: true }
        );
    }

    public static collectByButton<T>(
        msg: Message,
        user: User,
        buttonRetriever: ButtonRetriever<T>,
        expireFunction?: ExpireFunction
    ): Promise<{
        intr: ButtonInteraction;
        value: T;
    }> {
        return DjsCollectorUtils.collectByButton(
            msg,
            (intr: ButtonInteraction) => intr.user.id === user.id,
            (nextMsg: Message): boolean => {
                // Check if another command was ran, if so cancel the current running setup
                let nextMsgArgs = nextMsg.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(nextMsgArgs[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            buttonRetriever,
            expireFunction,
            { time: Config.experience.promptExpireTime * 1000, reset: true }
        );
    }
}
