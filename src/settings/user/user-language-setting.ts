import { Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode, Language } from '../../models/enums';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserLanguageSetting implements Setting<UserData, LangCode> {
    public default = Lang.Default;

    public keyword(langCode: LangCode): string {
        return Lang.getRef('settings.language', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('settings.language', langCode);
    }

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.languageDisplay', langCode);
    }

    public value(userData: UserData): LangCode {
        return userData.language;
    }

    public valueOrDefault(userData?: UserData): LangCode {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: LangCode): void {
        userData.language = value;
    }

    public clear(userData: UserData): void {
        userData.language = null;
    }

    public valueDisplayName(value: LangCode, langCode: LangCode): string {
        return Language.displayName(value);
    }

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let newLangCode = Language.find(msg.content);
            if (!newLangCode) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validation.invalidLanguage', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return newLangCode;
        };
    }

    public async retrieve(msg: Message, args: string[], data: EventData): Promise<LangCode> {
        let collect = CollectorUtils.createMsgCollect(
            msg.channel,
            msg.author,
            data.lang(),
            Lang.getEmbed('results.collectorExpired', data.lang())
        );

        await MessageUtils.send(
            msg.channel,
            Lang.getEmbed('prompts.languageUser', data.lang(), {
                LANGUAGE_LIST: Language.list(),
            })
        );
        return await collect(this.retriever(data.lang()));
    }
}
