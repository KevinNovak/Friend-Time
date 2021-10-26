import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Confirmation, Setting } from '..';
import { GuildData } from '../../database/entities';
import { LangCode, TimeFormatOption } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, FormatUtils, MessageUtils, TimeUtils, TimeZoneUtils } from '../../utils';

let Config = require('../../../config/config.json');

export class GuildTimeZoneSetting implements Setting<GuildData, string>, Confirmation {
    public name = Lang.getCom('settings.timeZone');
    public default = null;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.timeZoneDisplay', langCode);
    }

    public value(guildData: GuildData): string {
        return guildData.timeZone;
    }

    public valueOrDefault(guildData?: GuildData): string {
        return guildData ? this.value(guildData) ?? this.default : this.default;
    }

    public apply(guildData: GuildData, value: string): void {
        guildData.timeZone = value;
    }

    public clear(guildData: GuildData): void {
        guildData.timeZone = null;
    }

    public valueDisplayName(value: string, langCode: LangCode): string {
        return value;
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            if (msg.content.length <= Config.validation.timeZone.lengthMin) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }

            let timeZoneName = TimeZoneUtils.find(msg.content)?.name;
            if (!timeZoneName) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidTimeZone', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
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
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return confirmed;
        };
    }

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<string> {
        let collect = CollectorUtils.createMsgCollect(
            intr.channel,
            intr.user,
            Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
        );

        let timeZone: string;
        let confirmed = false;
        while (confirmed === false) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('promptEmbeds.timeZoneGuild', data.lang())
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
                Lang.getEmbed('promptEmbeds.timeZoneConfirmGuild', data.lang(), {
                    TIME_12_HOUR: nowTwelveHour,
                    TIME_24_HOUR: nowTwentyFourHour,
                    TIME_ZONE: timeZone,
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
