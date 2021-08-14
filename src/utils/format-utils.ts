import { Guild } from 'discord.js';
import { DateTime } from 'luxon';

import { LangCode, Language, TimeFormat, TimeFormatOption } from '../models/enums';

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
}
