import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';
import { createRequire } from 'node:module';

import { GuildData } from '../../database/entities/index.js';
import { LangCode, TimeFormatOption, YesNo } from '../../models/enums/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import {
    CollectorUtils,
    FormatUtils,
    InteractionUtils,
    TimeUtils,
    TimeZoneUtils,
} from '../../utils/index.js';
import { Confirmation, Setting } from '../index.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

export class GuildTimeZoneSetting implements Setting<GuildData, string>, Confirmation {
    public name = Lang.getCom('settings.timeZone');
    public default: string = null;

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

    public valueDisplayName(value: string, _langCode: LangCode): string {
        return value;
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever<string> {
        return async (msg: Message) => {
            if (msg.content.length <= Config.validation.timeZone.lengthMin) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }

            let timeZoneName = TimeZoneUtils.find(msg.content)?.name;
            if (!timeZoneName) {
                await InteractionUtils.send(
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

    public confirmation(intr: CommandInteraction, langCode: LangCode): MessageRetriever<boolean> {
        return async (msg: Message) => {
            let confirmed = YesNo.find(msg.content);
            if (confirmed == null) {
                await InteractionUtils.send(
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

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<string> {
        let timeZone: string;
        let confirmed = false;
        while (confirmed === false) {
            await InteractionUtils.send(
                intr,
                Lang.getEmbed('promptEmbeds.timeZoneGuild', data.lang())
            );
            timeZone = await CollectorUtils.collectByMessage(
                intr.channel,
                intr.user,
                this.retriever(intr, data.lang()),
                async () => {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
                    );
                }
            );
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

            await InteractionUtils.send(
                intr,
                Lang.getEmbed('promptEmbeds.timeZoneConfirmGuild', data.lang(), {
                    TIME_12_HOUR: nowTwelveHour,
                    TIME_24_HOUR: nowTwentyFourHour,
                    TIME_ZONE: timeZone,
                })
            );
            confirmed = await CollectorUtils.collectByMessage(
                intr.channel,
                intr.user,
                this.confirmation(intr, data.lang()),
                async () => {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
                    );
                }
            );
            if (confirmed === undefined) {
                return;
            }
        }

        return timeZone;
    }
}
