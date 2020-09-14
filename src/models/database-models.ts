import { LangCode } from '../services/language';

export interface ServerData {
    DiscordId: string;
    Mode: string;
    TimeFormat: string;
    Notify: boolean;
}

export interface UserData {
    DiscordId: string;
    TimeZone: string;
    TimeFormat: string;
    LangCode: LangCode;
}
