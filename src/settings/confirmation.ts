import { ChatInputCommandInteraction, Locale } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

export interface Confirmation {
    confirmation(intr: ChatInputCommandInteraction, langCode: Locale): MessageRetriever<boolean>;
}
