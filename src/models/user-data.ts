import { LangCode } from '../services/language/lang-code';

export interface UserData {
    DiscordId: string;
    TimeZone: string;
    TimeFormat: string;
    LangCode: LangCode;
}
