import { CommandInteraction } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { Locale } from '../enums/index.js';

export interface Confirmation {
    confirmation(intr: CommandInteraction, langCode: Locale): MessageRetriever<boolean>;
}
