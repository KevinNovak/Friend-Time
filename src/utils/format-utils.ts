import { Guild, Locale } from 'discord.js';
import { DateTime, Duration } from 'luxon'; // TODO: Missing types

import { TimeFormatOption } from '../enums/index.js';
import { TimeFormat } from '../models/enum-helpers/index.js';

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
        langCode: Locale
    ): string {
        let date = this.date(dateTime, langCode);
        let time = this.time(dateTime, timeFormat, langCode);
        return `${date}, ${time}`;
    }

    public static date(dateTime: DateTime, langCode: Locale): string {
        dateTime = dateTime.setLocale(langCode);
        return dateTime.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
    }

    public static time(dateTime: DateTime, timeFormat: TimeFormatOption, langCode: Locale): string {
        dateTime = dateTime.setLocale(langCode);
        return dateTime.toFormat(TimeFormat.Data[timeFormat].format);
    }

    public static duration(milliseconds: number, langCode: Locale): string {
        return Duration.fromObject(
            Object.fromEntries(
                Object.entries(
                    Duration.fromMillis(milliseconds, { locale: langCode })
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
