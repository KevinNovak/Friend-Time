import { Locale } from 'discord.js';

import { GuildData, UserData } from '../database/entities/index.js';

// This class is used to store and pass data along in events
export class EventData {
    // TODO: Add any data you want to store
    constructor(
        // Event language
        public lang: Locale,
        // Guild language
        public langGuild: Locale,
        // User data
        public user?: UserData,
        // Guild data
        public guild?: GuildData
    ) {}
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
