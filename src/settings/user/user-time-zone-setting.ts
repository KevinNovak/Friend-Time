import { CommandInteraction, Message, Snowflake } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';
import { createRequire } from 'node:module';

import { UserData } from '../../database/entities/index.js';
import { LangCode, TimeFormatOption, YesNo } from '../../models/enums/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import {
    CollectorUtils,
    FormatUtils,
    MessageUtils,
    TimeUtils,
    TimeZoneUtils,
} from '../../utils/index.js';
import { Confirmation, Setting } from '../index.js';

const require = createRequire(import.meta.url);
let Config = require('../../../config/config.json');

export class UserTimeZoneSetting implements Setting<UserData, string>, Confirmation {
    public name = Lang.getCom('settings.timeZone');
    public default: string = null;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.timeZoneDisplay', langCode);
    }

    public value(userData: UserData): string {
        return userData.timeZone;
    }

    public valueOrDefault(userData?: UserData): string {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: string): void {
        userData.timeZone = value;
    }

    public clear(userData: UserData): void {
        userData.timeZone = null;
    }

    public valueDisplayName(value: string, _langCode: LangCode): string {
        return value;
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            if (msg.content.length <= Config.validation.timeZone.lengthMin) {
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
                target
                    ? Lang.getEmbed('promptEmbeds.timeZoneUser', data.lang(), {
                          USER: FormatUtils.userMention(target),
                      })
                    : Lang.getEmbed('promptEmbeds.timeZoneSelf', data.lang())
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
                target
                    ? Lang.getEmbed('promptEmbeds.timeZoneConfirmUser', data.lang(), {
                          TIME_12_HOUR: nowTwelveHour,
                          TIME_24_HOUR: nowTwentyFourHour,
                          TIME_ZONE: timeZone,
                          USER: FormatUtils.userMention(target),
                      })
                    : Lang.getEmbed('promptEmbeds.timeZoneConfirmSelf', data.lang(), {
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
