import { Message, Snowflake } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Confirmation, Setting } from '..';
import { UserData } from '../../database/entities';
import { LangCode, TimeFormatOption } from '../../models/enums';
import { YesNo } from '../../models/enums/yes-no';
import { EventData } from '../../models/internal-models';
import { Lang } from '../../services';
import { CollectorUtils, FormatUtils, MessageUtils, TimeUtils } from '../../utils';
import { TimeZoneUtils } from '../../utils/time-zone-utils';

let Config = require('../../../config/config.json');

export class UserTimeZoneSetting implements Setting<UserData, string>, Confirmation {
    public name = Lang.getCom('settings.timeZone');
    public default = null;

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

    public valueDisplayName(value: string, langCode: LangCode): string {
        return value;
    }

    public retriever(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            if (msg.content.length <= Config.validation.timeZone.lengthMin) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }

            let timeZoneName = TimeZoneUtils.find(msg.content)?.name;
            if (!timeZoneName) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.invalidTimeZone', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return timeZoneName;
        };
    }

    public confirmation(langCode: LangCode): MessageRetriever {
        return async (msg: Message) => {
            let confirmed = YesNo.find(msg.content);
            if (confirmed == null) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter(
                        Lang.getRef('footers.collector', langCode)
                    )
                );
                return;
            }
            return confirmed;
        };
    }

    public async retrieve(
        msg: Message,
        args: string[],
        data: EventData,
        target?: Snowflake
    ): Promise<string> {
        let collect = CollectorUtils.createMsgCollect(
            msg.channel,
            msg.author,
            Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
        );

        let timeZone: string;
        let confirmed = false;
        while (confirmed === false) {
            await MessageUtils.send(
                msg.channel,
                target
                    ? Lang.getEmbed('promptEmbeds.timeZoneUser', data.lang(), {
                          USER: FormatUtils.userMention(target),
                      })
                    : Lang.getEmbed('promptEmbeds.timeZoneSelf', data.lang())
            );
            timeZone = await collect(this.retriever(data.lang()));
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

            await MessageUtils.send(
                msg.channel,
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
            confirmed = await collect(this.confirmation(data.lang()));
            if (confirmed === undefined) {
                return;
            }
        }

        return timeZone;
    }
}
