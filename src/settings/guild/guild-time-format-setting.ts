import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { GuildData } from '../../database/entities/index.js';
import { LangCode, TimeFormatOption } from '../../enums/index.js';
import { TimeFormat } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class GuildTimeFormatSetting implements Setting<GuildData, TimeFormatOption> {
    public name = Lang.getCom('settings.timeFormat');
    public default = TimeFormatOption.TWELVE_HOUR;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.timeFormatDisplay', langCode);
    }

    public value(guildData: GuildData): TimeFormatOption {
        return guildData.timeFormat;
    }

    public valueOrDefault(guildData?: GuildData): TimeFormatOption {
        return guildData ? this.value(guildData) ?? this.default : this.default;
    }

    public apply(guildData: GuildData, value: TimeFormatOption): void {
        guildData.timeFormat = value;
    }

    public clear(guildData: GuildData): void {
        guildData.timeFormat = null;
    }

    public valueDisplayName(value: TimeFormatOption, langCode: LangCode): string {
        return TimeFormat.Data[value].displayName(langCode);
    }

    public retriever(
        intr: CommandInteraction,
        langCode: LangCode
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

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<TimeFormatOption> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('promptEmbeds.timeFormatGuild', data.lang())
        );

        return await CollectorUtils.collectByMessage(
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
    }
}
