import { MessageRetriever } from 'discord.js-collector-utils';
import { Message } from 'discord.js';

import { Setting } from '..';
import { GuildData } from '../../database/entities';
import { LangCode } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class GuildAutoDetectSetting implements Setting<GuildData, boolean> {
    public default = true;

    public keyword(langCode: LangCode): string {
        return Lang.getRef('settings.autoDetect', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('settings.autoDetect', langCode);
    }

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

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let autoDetect = YesNo.find(msg.content, langCode);
            if (autoDetect == null) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validation.invalidYesNo', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return autoDetect;
        };
    }

    public async retrieve(msg: Message, args: string[], data: EventData): Promise<boolean> {
        let collect = CollectorUtils.createMsgCollect(
            msg.channel,
            msg.author,
            data.lang(),
            Lang.getEmbed('results.collectorExpired', data.lang())
        );

        await MessageUtils.send(msg.channel, Lang.getEmbed('prompts.autoDetectGuild', data.lang()));
        return await collect(this.retriever(data.lang()));
    }
}
