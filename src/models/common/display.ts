import { LangCode } from '../../enums/index.js';

export interface Display {
    displayName(langCode: LangCode): string;
}
