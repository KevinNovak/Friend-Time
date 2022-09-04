import { GuildData, UserData } from '../database/entities/index.js';
import { Locale } from '../enums/index.js';
import { Lang } from '../services/index.js';

// This class is used to store and pass data along in events
export class EventData {
    constructor(public user?: UserData, public guild?: GuildData) {}

    public lang(): Locale {
        return this.user?.language ?? this.guild?.language ?? Lang.Default;
    }
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
