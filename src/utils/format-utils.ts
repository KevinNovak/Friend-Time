import { Guild } from 'discord.js';
import { DateTime, Duration } from 'luxon'; // TODO: Missing types

import { LangCode, TimeFormatOption } from '../enums/index.js';
import { Language, TimeFormat } from '../models/enum-helpers/index.js';

export class FormatUtils {
    public static roleMention(guild: Guild, discordId: string): string {
        if (discordId === '@here') {
            return discordId;
        }

        if (discordId === guild.id) {
            return '@everyone';
        }

        return `<@&${discordId}>`;
    }

    public static channelMention(discordId: string): string {
        return `<#${discordId}>`;
    }

    public static userMention(discordId: string): string {
        return `<@!${discordId}>`;
    }

    public static dateTime(
        dateTime: DateTime,
        timeFormat: TimeFormatOption,
        langCode: LangCode
    ): string {
        let date = this.date(dateTime, langCode);
        let time = this.time(dateTime, timeFormat, langCode);
        return `${date}, ${time}`;
    }

    public static date(dateTime: DateTime, langCode: LangCode): string {
        let locale = Language.locale(langCode);
        dateTime = dateTime.setLocale(locale);
        return dateTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
    }

    public static time(
        dateTime: DateTime,
        timeFormat: TimeFormatOption,
        langCode: LangCode
    ): string {
        let locale = Language.locale(langCode);
        dateTime = dateTime.setLocale(locale);
        return dateTime.toFormat(TimeFormat.Data[timeFormat].format);
    }

    public static duration(milliseconds: number, langCode: LangCode): string {
        return Duration.fromObject(
            Object.fromEntries(
                Object.entries(
                    Duration.fromMillis(milliseconds, { locale: Language.locale(langCode) })
                        .shiftTo(
                            'year',
                            'quarter',
                            'month',
                            'week',
                            'day',
                            'hour',
                            'minute',
                            'second'
                        )
                        .toObject()
                ).filter(([_, value]) => !!value) // Remove units that are 0
            )
        ).toHuman({ maximumFractionDigits: 0 });
    }
}
