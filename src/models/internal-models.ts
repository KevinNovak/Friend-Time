import { Locale } from 'discord-api-types/v10';

import { GuildData, UserData } from '../database/entities/index.js';
import { Language } from './enum-helpers/index.js';

// This class is used to store and pass data along in events
export class EventData {
    constructor(public user?: UserData, public guild?: GuildData) {}

    public lang(): Locale {
        return this.user?.language ?? this.guild?.language ?? Language.Default;
    }
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
