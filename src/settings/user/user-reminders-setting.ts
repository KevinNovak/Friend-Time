import { Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserRemindersSetting implements Setting<UserData, boolean> {
    public default = true;

    public keyword(langCode: LangCode): string {
        return Lang.getRef('settings.reminders', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('settingRegexes.reminders', langCode);
    }

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.remindersDisplay', langCode);
    }

    public value(userData: UserData): boolean {
        return userData.reminders;
    }

    public valueOrDefault(userData?: UserData): boolean {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: boolean): void {
        userData.reminders = value;
    }

    public clear(userData: UserData): void {
        userData.reminders = null;
    }

    public valueDisplayName(value: boolean, langCode: LangCode): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let reminders = YesNo.find(msg.content, langCode);
            if (reminders == null) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return reminders;
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
            Lang.getEmbed('promptEmbeds.remindersUser', data.lang())
        );
        return collect(this.retriever(data.lang()));
    }
}
