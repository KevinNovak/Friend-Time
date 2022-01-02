import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode, Language } from '../../models/enums';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserLanguageSetting implements Setting<UserData, LangCode> {
    public name = Lang.getCom('settings.language');
    public default = Lang.Default;

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

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let newLangCode = Language.find(msg.content);
            if (!newLangCode) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidLanguage', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return newLangCode;
        };
    }

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<LangCode> {
        let collect = CollectorUtils.createMsgCollect(intr.channel, intr.user, async () => {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
            );
        });

        await MessageUtils.sendIntr(
            intr,
            Lang.getEmbed('promptEmbeds.languageUser', data.lang(), {
                LANGUAGE_LIST: Language.list(),
            })
        );
        return collect(this.retriever(intr, data.lang()));
    }
}
