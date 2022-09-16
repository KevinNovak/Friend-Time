import { Locale } from 'discord-api-types/v10';
import { Guild, User } from 'discord.js';

import { GuildData, UserData } from '../database/entities/index.js';
import { Language } from './enum-helpers/index.js';

// This class is used to store and pass data along in events
export class EventData {
    public user?: UserData;
    public guild?: GuildData;

    private guildPrimaryLocale?: Locale;

    public async initialize(user?: User, guild?: Guild): Promise<EventData> {
        if (user) {
            this.user = await UserData.findOne({ discordId: user.id });
        }

        if (guild) {
            this.guild = await GuildData.findOne(
                { discordId: guild.id },
                { relations: ['bots', 'listItems'] }
            );
            let locale = guild.preferredLocale as Locale;
            if (Language.Enabled.includes(locale)) {
                this.guildPrimaryLocale = locale;
            }
        }

        return this;
    }

    public lang(): Locale {
        return (
            this.user?.language ??
            this.guild?.language ??
            this.guildPrimaryLocale ??
            Language.Default
        );
    }

    public langGuild(): Locale {
        return this.guild?.language ?? this.guildPrimaryLocale ?? Language.Default;
    }
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
