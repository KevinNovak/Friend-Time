import { Locale } from 'discord.js';

export interface Display {
    displayName(langCode: Locale): string;
}
