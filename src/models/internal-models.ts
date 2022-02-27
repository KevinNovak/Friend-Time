import { GuildData, UserData } from '../database/entities/index.js';
import { LangCode } from '../enums/index.js';
import { Lang } from '../services/index.js';

// This class is used to store and pass data along in events
export class EventData {
    constructor(public user?: UserData, public guild?: GuildData) {}

    public lang(): LangCode {
        return this.user?.language ?? this.guild?.language ?? Lang.Default;
    }
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
