import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { GuildData } from '../../database/entities';
import { LangCode } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class GuildListSetting implements Setting<GuildData, boolean> {
    public name = Lang.getCom('settings.list');
    public default = true;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.listDisplay', langCode);
    }

    public value(guildData: GuildData): boolean {
        return guildData.list;
    }

    public valueOrDefault(guildData?: GuildData): boolean {
        return guildData ? this.value(guildData) ?? this.default : this.default;
    }

    public apply(guildData: GuildData, value: boolean): void {
        guildData.list = value;
    }

    public clear(guildData: GuildData): void {
        guildData.list = null;
    }

    public valueDisplayName(value: boolean, langCode: LangCode): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let list = YesNo.find(msg.content);
            if (list == null) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return list;
        };
    }

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<boolean> {
        let collect = CollectorUtils.createMsgCollect(
            intr.channel,
            intr.user,
            Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
        );

        await MessageUtils.sendIntr(intr, Lang.getEmbed('promptEmbeds.listGuild', data.lang()));
        return collect(this.retriever(intr, data.lang()));
    }
}
