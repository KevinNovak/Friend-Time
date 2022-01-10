import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode, TimeFormat, TimeFormatOption } from '../../models/enums';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, MessageUtils } from '../../utils';

export class UserTimeFormatSetting implements Setting<UserData, TimeFormatOption> {
    public name = Lang.getCom('settings.timeFormat');
    public default = TimeFormatOption.TWELVE_HOUR;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.timeFormatDisplay', langCode);
    }

    public value(userData: UserData): TimeFormatOption {
        return userData.timeFormat;
    }

    public valueOrDefault(userData?: UserData): TimeFormatOption {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: TimeFormatOption): void {
        userData.timeFormat = value;
    }

    public clear(userData: UserData): void {
        userData.timeFormat = null;
    }

    public valueDisplayName(value: TimeFormatOption, langCode: LangCode): string {
        return TimeFormat.Data[value].displayName(langCode);
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let timeFormat = TimeFormat.find(msg.content);
            if (!timeFormat) {
                await MessageUtils.sendIntr(
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
        let collect = CollectorUtils.createMsgCollect(intr.channel, intr.user, async () => {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
            );
        });

        await MessageUtils.sendIntr(
            intr,
            Lang.getEmbed('promptEmbeds.timeFormatUser', data.lang())
        );
        return (await collect(this.retriever(intr, data.lang()))) as TimeFormatOption;
    }
}
