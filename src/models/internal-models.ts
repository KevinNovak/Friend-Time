import { GuildData, UserData } from '../database/entities';
import { LangCode } from './enums';

// This class is used to store and pass data along in events
export class EventData {
    constructor(public user?: UserData, public guild?: GuildData) {}

    public lang(): LangCode {
        // TODO: Store default language in config
        return this.user?.language ?? this.guild?.language ?? LangCode.EN_US;
    }
}

export interface FormattedTimeResult {
    text: string;
    start: string;
    end?: string;
}
