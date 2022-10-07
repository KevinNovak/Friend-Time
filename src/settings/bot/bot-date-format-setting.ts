import { ChatInputCommandInteraction, Locale, Message, Snowflake } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { GuildBotData } from '../../database/entities/index.js';
import { DateFormatOption } from '../../enums/index.js';
import { DateFormat } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, FormatUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class BotDateFormatSetting implements Setting<GuildBotData, DateFormatOption> {
    public name = Lang.getCom('settings.dateFormat');
    public default = DateFormatOption.MONTH_DAY;

    public displayName(langCode: Locale): string {
        return Lang.getRef('settings.dateFormat', langCode);
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

    public valueDisplayName(value: DateFormatOption, langCode: Locale): string {
        return DateFormat.Data[value].displayName(langCode);
    }

    public retriever(
        intr: ChatInputCommandInteraction,
        langCode: Locale
    ): MessageRetriever<DateFormatOption> {
        return async (msg: Message) => {
            let dateFormat = DateFormat.find(msg.content);
            if (!dateFormat) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidDateFormat', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return dateFormat;
        };
    }

    public async retrieve(
        intr: ChatInputCommandInteraction,
        data: EventData,
        target?: Snowflake
    ): Promise<DateFormatOption> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('promptEmbeds.dateFormatBot', data.lang, {
                BOT: FormatUtils.userMention(target),
            })
        );

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
