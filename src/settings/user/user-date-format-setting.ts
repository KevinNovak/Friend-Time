import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { UserData } from '../../database/entities/index.js';
import { DateFormatOption, LangCode } from '../../enums/index.js';
import { DateFormat } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class UserDateFormatSetting implements Setting<UserData, DateFormatOption> {
    public name = Lang.getCom('settings.dateFormat');
    public default = DateFormatOption.MONTH_DAY;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.dateFormatDisplay', langCode);
    }

    public value(userData: UserData): DateFormatOption {
        return userData.dateFormat;
    }

    public valueOrDefault(userData?: UserData): DateFormatOption {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: DateFormatOption): void {
        userData.dateFormat = value;
    }

    public clear(userData: UserData): void {
        userData.dateFormat = null;
    }

    public valueDisplayName(value: DateFormatOption, langCode: LangCode): string {
        return DateFormat.Data[value].displayName(langCode);
    }

    public retriever(
        intr: CommandInteraction,
        langCode: LangCode
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

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<DateFormatOption> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('promptEmbeds.dateFormatUser', data.lang())
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
