import { GuildData, UserData } from '../database/entities';
import { Lang } from '../services';
import { LangCode } from './enums';

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
