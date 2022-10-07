import { ChatInputCommandInteraction, Locale, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { UserData } from '../../database/entities/index.js';
import { YesNo } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class UserRemindersSetting implements Setting<UserData, boolean> {
    public name = Lang.getCom('settings.reminders');
    public default = true;

    public displayName(langCode: Locale): string {
        return Lang.getRef('settings.reminders', langCode);
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

    public valueDisplayName(value: boolean, langCode: Locale): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(
        intr: ChatInputCommandInteraction,
        langCode: Locale
    ): MessageRetriever<boolean> {
        return async (msg: Message) => {
            let reminders = YesNo.find(msg.content);
            if (reminders == null) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return reminders;
        };
    }

    public async retrieve(intr: ChatInputCommandInteraction, data: EventData): Promise<boolean> {
        await InteractionUtils.send(intr, Lang.getEmbed('promptEmbeds.remindersUser', data.lang));

        return await CollectorUtils.collectByMessage(
            intr.channel,
            intr.user,
            this.retriever(intr, data.lang),
            async () => {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.collectorExpired', data.lang)
                );
            }
        );
    }
}
