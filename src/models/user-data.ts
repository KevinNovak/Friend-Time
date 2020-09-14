import { LangCode } from '../services/language';

export interface UserData {
    DiscordId: string;
    TimeZone: string;
    TimeFormat: string;
    LangCode: LangCode;
}
