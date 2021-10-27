import { CommandInteraction, Message, Snowflake } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { GuildBotData } from '../../database/entities';
import { DateFormat, DateFormatOption, LangCode } from '../../models/enums';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, FormatUtils, MessageUtils } from '../../utils';

export class BotDateFormatSetting implements Setting<GuildBotData, DateFormatOption> {
    public name = Lang.getCom('settings.dateFormat');
    public default = DateFormatOption.MONTH_DAY;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.dateFormatDisplay', langCode);
    }

    public value(botData: GuildBotData): DateFormatOption {
        return botData.dateFormat;
    }

    public valueOrDefault(botData?: GuildBotData): DateFormatOption {
        return botData ? this.value(botData) ?? this.default : this.default;
    }

    public apply(botData: GuildBotData, value: DateFormatOption): void {
        botData.dateFormat = value;
    }

    public clear(botData: GuildBotData): void {
        botData.dateFormat = null;
    }

    public valueDisplayName(value: DateFormatOption, langCode: LangCode): string {
        return DateFormat.Data[value].displayName(langCode);
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let dateFormat = DateFormat.find(msg.content);
            if (!dateFormat) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidDateFormat', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return dateFormat;
        };
    }

    public async retrieve(
        intr: CommandInteraction,
        data: EventData,
        target?: Snowflake
    ): Promise<DateFormatOption> {
        let collect = CollectorUtils.createMsgCollect(
            intr.channel,
            intr.user,
            Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
        );

        await MessageUtils.sendIntr(
            intr,
            Lang.getEmbed('promptEmbeds.dateFormatBot', data.lang(), {
                BOT: FormatUtils.userMention(target),
            })
        );
        return collect(this.retriever(intr, data.lang()));
    }
}
