import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { GuildData } from '../../database/entities/index.js';
import { LangCode } from '../../enums/index.js';
import { YesNo } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class GuildAutoDetectSetting implements Setting<GuildData, boolean> {
    public name = Lang.getCom('settings.autoDetect');
    public default = true;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.autoDetectDisplay', langCode);
    }

    public value(guildData: GuildData): boolean {
        return guildData.autoDetect;
    }

    public valueOrDefault(guildData?: GuildData): boolean {
        return guildData ? this.value(guildData) ?? this.default : this.default;
    }

    public apply(guildData: GuildData, value: boolean): void {
        guildData.autoDetect = value;
    }

    public clear(guildData: GuildData): void {
        guildData.autoDetect = null;
    }

    public valueDisplayName(value: boolean, langCode: LangCode): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever<boolean> {
        return async (msg: Message) => {
            let autoDetect = YesNo.find(msg.content);
            if (autoDetect == null) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return autoDetect;
        };
    }

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<boolean> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('promptEmbeds.autoDetectGuild', data.lang())
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
