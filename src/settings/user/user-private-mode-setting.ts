import { Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserPrivateModeSetting implements Setting<UserData, boolean> {
    public default = false;

    public keyword(langCode: LangCode): string {
        return Lang.getRef('settings.privateMode', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('settingRegexes.privateMode', langCode);
    }

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.privateModeDisplay', langCode);
    }

    public value(userData: UserData): boolean {
        return userData.privateMode;
    }

    public valueOrDefault(userData?: UserData): boolean {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: boolean): void {
        userData.privateMode = value;
    }

    public clear(userData: UserData): void {
        userData.privateMode = null;
    }

    public valueDisplayName(value: boolean, langCode: LangCode): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let privateMode = YesNo.find(msg.content, langCode);
            if (privateMode == null) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return privateMode;
        };
    }

    public async retrieve(msg: Message, args: string[], data: EventData): Promise<boolean> {
        let collect = CollectorUtils.createMsgCollect(
            msg.channel,
            msg.author,
            data.lang(),
            Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
        );

        await MessageUtils.send(
            msg.channel,
            Lang.getEmbed('promptEmbeds.privateModeUser', data.lang())
        );
        return collect(this.retriever(data.lang()));
    }
}
