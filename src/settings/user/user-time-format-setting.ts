import { MessageRetriever } from 'discord.js-collector-utils';
import { Message } from 'discord.js-light';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode, TimeFormat, TimeFormatOption } from '../../models/enums';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserTimeFormatSetting implements Setting<UserData, TimeFormatOption> {
    public default = TimeFormatOption.TWELVE_HOUR;

    public keyword(langCode: LangCode): string {
        return Lang.getRef('settings.timeFormat', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('settings.timeFormat', langCode);
    }

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.timeFormatDisplay', langCode);
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

    public valueDisplayName(value: TimeFormatOption, langCode: LangCode): string {
        return TimeFormat.Data[value].displayName(langCode);
    }

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let timeFormat = TimeFormat.find(msg.content, langCode);
            if (!timeFormat) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validation.invalidTimeFormat', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return timeFormat;
        };
    }

    public async retrieve(
        msg: Message,
        args: string[],
        data: EventData
    ): Promise<TimeFormatOption> {
        let collect = CollectorUtils.createMsgCollect(
            msg.channel,
            msg.author,
            data.lang(),
            Lang.getEmbed('results.collectorExpired', data.lang())
        );

        await MessageUtils.send(msg.channel, Lang.getEmbed('prompts.timeFormatUser', data.lang()));
        return await collect(this.retriever(data.lang()));
    }
}
