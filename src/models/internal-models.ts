import { Locale } from 'discord-api-types/v10';

import { GuildData, UserData } from '../database/entities/index.js';

// This class is used to store and pass data along in events
export class EventData {
    // TODO: Add any data you want to store
    constructor(
        private userLang: Locale,
        private guildLang: Locale,
        public user?: UserData,
        public guild?: GuildData
    ) {}

    // User language
    public lang(): Locale {
        return this.userLang;
    }

    // Guild language
    public langGuild(): Locale {
        return this.guildLang;
    }
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
