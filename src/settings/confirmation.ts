import { MessageRetriever } from 'discord.js-collector-utils';
import { LangCode } from '../models/enums';

export interface Confirmation {
    confirmation(langCode: LangCode): MessageRetriever;
}
