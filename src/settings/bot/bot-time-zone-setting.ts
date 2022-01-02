import { CommandInteraction, Message, Snowflake } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Confirmation, Setting } from '..';
import { GuildBotData } from '../../database/entities';
import { LangCode, TimeFormatOption } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, FormatUtils, MessageUtils, TimeUtils, TimeZoneUtils } from '../../utils';

let Config = require('../../../config/config.json');

export class BotTimeZoneSetting implements Setting<GuildBotData, string>, Confirmation {
    public name = Lang.getCom('settings.timeZone');
    public default = null;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.timeZoneDisplay', langCode);
    }

    public value(botData: GuildBotData): string {
        return botData.timeZone;
    }

    public valueOrDefault(botData?: GuildBotData): string {
        return botData ? this.value(botData) ?? this.default : this.default;
    }

    public apply(botData: GuildBotData, value: string): void {
        botData.timeZone = value;
    }

    public clear(botData: GuildBotData): void {
        botData.timeZone = null;
    }

    public valueDisplayName(value: string, langCode: LangCode): string {
        return value;
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            if (msg.content.length < Config.validation.timeZone.lengthMin) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }

            let timeZoneName = TimeZoneUtils.find(msg.content)?.name;
            if (!timeZoneName) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidTimeZone', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return timeZoneName;
        };
    }

    public confirmation(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let confirmed = YesNo.find(msg.content);
            if (confirmed == null) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return confirmed;
        };
    }

    public async retrieve(
        intr: CommandInteraction,
        data: EventData,
        target?: Snowflake
    ): Promise<string> {
        let collect = CollectorUtils.createMsgCollect(intr.channel, intr.user, async () => {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
            );
        });

        let timeZone: string;
        let confirmed = false;
        while (confirmed === false) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('promptEmbeds.timeZoneBot', data.lang(), {
                    BOT: FormatUtils.userMention(target),
                })
            );
            timeZone = await collect(this.retriever(intr, data.lang()));
            if (!timeZone) {
                return;
            }

            let now = TimeUtils.now(timeZone);
            let nowTwentyFourHour = FormatUtils.time(
                now,
                TimeFormatOption.TWENTY_FOUR_HOUR,
                data.lang()
            );
            let nowTwelveHour = FormatUtils.time(now, TimeFormatOption.TWELVE_HOUR, data.lang());

            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('promptEmbeds.timeZoneConfirmBot', data.lang(), {
                    TIME_12_HOUR: nowTwelveHour,
                    TIME_24_HOUR: nowTwentyFourHour,
                    TIME_ZONE: timeZone,
                    BOT: FormatUtils.userMention(target),
                })
            );
            confirmed = await collect(this.confirmation(intr, data.lang()));
            if (confirmed === undefined) {
                return;
            }
        }

        return timeZone;
    }
}
