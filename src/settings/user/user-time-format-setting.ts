import { ChatInputCommandInteraction, Locale, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { UserData } from '../../database/entities/index.js';
import { TimeFormatOption } from '../../enums/index.js';
import { TimeFormat } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class UserTimeFormatSetting implements Setting<UserData, TimeFormatOption> {
    public name = Lang.getCom('settings.timeFormat');
    public default = TimeFormatOption.TWELVE_HOUR;

    public displayName(langCode: Locale): string {
        return Lang.getRef('settings.timeFormat', langCode);
    }

    public value(userData: UserData): TimeFormatOption {
        return userData.timeFormat;
    }

    public valueOrDefault(userData?: UserData): TimeFormatOption {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: TimeFormatOption): void {
        userData.timeFormat = value;
    }

    public clear(userData: UserData): void {
        userData.timeFormat = null;
    }

    public valueDisplayName(value: TimeFormatOption, langCode: Locale): string {
        return TimeFormat.Data[value].displayName(langCode);
    }

    public retriever(
        intr: ChatInputCommandInteraction,
        langCode: Locale
    ): MessageRetriever<TimeFormatOption> {
        return async (msg: Message) => {
            let timeFormat = TimeFormat.find(msg.content);
            if (!timeFormat) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidTimeFormat', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return timeFormat;
        };
    }

    public async retrieve(
        intr: ChatInputCommandInteraction,
        data: EventData
    ): Promise<TimeFormatOption> {
        await InteractionUtils.send(intr, Lang.getEmbed('promptEmbeds.timeFormatUser', data.lang));

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
