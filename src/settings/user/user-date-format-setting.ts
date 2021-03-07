import { MessageRetriever } from 'discord.js-collector-utils';
import { Message } from 'discord.js-light';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { DateFormat, DateFormatOption, LangCode } from '../../models/enums';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserDateFormatSetting implements Setting<UserData, DateFormatOption> {
    public default = DateFormatOption.MONTH_DAY;

    public keyword(langCode: LangCode): string {
        return Lang.getRef('settings.dateFormat', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('settings.dateFormat', langCode);
    }

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.dateFormatDisplay', langCode);
    }

    public value(userData: UserData): DateFormatOption {
        return userData.dateFormat;
    }

    public valueOrDefault(userData?: UserData): DateFormatOption {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: DateFormatOption): void {
        userData.dateFormat = value;
    }

    public clear(userData: UserData): void {
        userData.dateFormat = null;
    }

    public valueDisplayName(value: DateFormatOption, langCode: LangCode): string {
        return DateFormat.Data[value].displayName(langCode);
    }

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let dateFormat = DateFormat.find(msg.content, langCode);
            if (!dateFormat) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validation.invalidDateFormat', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return dateFormat;
        };
    }

    public async retrieve(
        msg: Message,
        args: string[],
        data: EventData
    ): Promise<DateFormatOption> {
        let collect = CollectorUtils.createMsgCollect(
            msg.channel,
            msg.author,
            data.lang(),
            Lang.getEmbed('results.collectorExpired', data.lang())
        );

        await MessageUtils.send(msg.channel, Lang.getEmbed('prompts.dateFormatUser', data.lang()));
        return await collect(this.retriever(data.lang()));
    }
}
