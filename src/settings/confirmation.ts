import { CommandInteraction } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';
import { LangCode } from '../models/enums';

export interface Confirmation {
    confirmation(intr: CommandInteraction, langCode: LangCode): MessageRetriever;
}
