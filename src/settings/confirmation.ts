import { Locale } from 'discord-api-types/v10';
import { ChatInputCommandInteraction } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

export interface Confirmation {
    confirmation(intr: ChatInputCommandInteraction, langCode: Locale): MessageRetriever<boolean>;
}
