import { CommandInteraction } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { LangCode } from '../models/enums/index.js';

export interface Confirmation {
    confirmation(intr: CommandInteraction, langCode: LangCode): MessageRetriever<boolean>;
}
