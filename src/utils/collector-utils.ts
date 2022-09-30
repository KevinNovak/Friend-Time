import {
    ButtonInteraction,
    Message,
    ModalBuilder,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    TextBasedChannel,
    User,
} from 'discord.js';
import {
    ButtonRetriever,
    CollectorUtils as DjsCollectorUtils,
    ExpireFunction,
    MessageRetriever,
    ModalRetriever,
    ReactionRetriever,
    SelectMenuRetriever,
} from 'discord.js-collector-utils';
import { createRequire } from 'node:module';

import { Lang } from '../services/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class CollectorUtils {
    public static collectByButton<T>(
        msg: Message,
        user: User,
        retriever: ButtonRetriever<T>,
        expireFunc?: ExpireFunction
    ): Promise<{
        intr: ButtonInteraction;
        value: T;
    }> {
        return DjsCollectorUtils.collectByButton(msg, retriever, {
            time: Config.experience.promptExpireTime * 1000,
            reset: true,
            target: user,
            stopFilter: message => {
                // Check if another command was ran, if so cancel the current running setup
                let args = message.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(args[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            onExpire: expireFunc,
        });
    }

    public static collectBySelectMenu<T>(
        msg: Message,
        user: User,
        retriever: SelectMenuRetriever<T>,
        expireFunc?: ExpireFunction
    ): Promise<{
        intr: SelectMenuInteraction;
        value: T;
    }> {
        return DjsCollectorUtils.collectBySelectMenu(msg, retriever, {
            time: Config.experience.promptExpireTime * 1000,
            reset: true,
            target: user,
            stopFilter: message => {
                // Check if another command was ran, if so cancel the current running setup
                let args = message.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(args[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            onExpire: expireFunc,
        });
    }

    public static collectByModal<T>(
        msg: Message,
        modal: ModalBuilder,
        user: User,
        retriever: ModalRetriever<T>,
        expireFunc?: ExpireFunction
    ): Promise<{
        intr: ModalSubmitInteraction;
        value: T;
    }> {
        return DjsCollectorUtils.collectByModal(msg, modal, retriever, {
            time: Config.experience.promptExpireTime * 1000,
            reset: true,
            target: user,
            stopFilter: message => {
                // Check if another command was ran, if so cancel the current running setup
                let args = message.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(args[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            onExpire: expireFunc,
        });
    }

    public static collectByReaction<T>(
        msg: Message,
        user: User,
        retriever: ReactionRetriever<T>,
        expireFunc?: ExpireFunction
    ): Promise<T> {
        return DjsCollectorUtils.collectByReaction(msg, retriever, {
            time: Config.experience.promptExpireTime * 1000,
            reset: true,
            target: user,
            stopFilter: message => {
                // Check if another command was ran, if so cancel the current running setup
                let args = message.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(args[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            onExpire: expireFunc,
        });
    }

    public static collectByMessage<T>(
        channel: TextBasedChannel,
        user: User,
        retriever: MessageRetriever<T>,
        expireFunc?: ExpireFunction
    ): Promise<T> {
        return DjsCollectorUtils.collectByMessage(channel, retriever, {
            time: Config.experience.promptExpireTime * 1000,
            reset: true,
            target: user,
            stopFilter: message => {
                // Check if another command was ran, if so cancel the current running setup
                let args = message.content.split(' ');
                if ([Lang.getCom('keywords.stop')].includes(args[0]?.toLowerCase())) {
                    return true;
                }

                return false;
            },
            onExpire: expireFunc,
        });
    }
}
