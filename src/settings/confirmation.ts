import { Locale } from 'discord-api-types/v10';
import { CommandInteraction } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';


export interface Confirmation {
    confirmation(intr: CommandInteraction, langCode: Locale): MessageRetriever<boolean>;
}
