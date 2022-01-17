import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { GuildData } from '../../database/entities/index.js';
import { LangCode, YesNo } from '../../models/enums/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, MessageUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class GuildRemindersSetting implements Setting<GuildData, boolean> {
    public name = Lang.getCom('settings.reminders');
    public default = true;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.remindersDisplay', langCode);
    }

    public value(guildData: GuildData): boolean {
        return guildData.reminders;
    }

    public valueOrDefault(guildData?: GuildData): boolean {
        return guildData ? this.value(guildData) ?? this.default : this.default;
    }

    public apply(guildData: GuildData, value: boolean): void {
        guildData.reminders = value;
    }

    public clear(guildData: GuildData): void {
        guildData.reminders = null;
    }

    public valueDisplayName(value: boolean, langCode: LangCode): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let reminders = YesNo.find(msg.content);
            if (reminders == null) {
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return reminders;
        };
    }

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<boolean> {
        let collect = CollectorUtils.createMsgCollect(intr.channel, intr.user, async () => {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
            );
        });

        await MessageUtils.sendIntr(
            intr,
            Lang.getEmbed('promptEmbeds.remindersGuild', data.lang())
        );
        return await collect(this.retriever(intr, data.lang()));
    }
}
