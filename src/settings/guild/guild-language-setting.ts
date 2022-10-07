import { ChatInputCommandInteraction, Locale, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { GuildData } from '../../database/entities/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class GuildLanguageSetting implements Setting<GuildData, Locale> {
    public name = Lang.getCom('settings.language');
    public default = Language.Default;

    public displayName(langCode: Locale): string {
        return Lang.getRef('settings.language', langCode);
    }

    public value(guildData: GuildData): Locale {
        return guildData.language;
    }

    public valueOrDefault(guildData?: GuildData): Locale {
        return guildData ? this.value(guildData) ?? this.default : this.default;
    }

    public apply(guildData: GuildData, value: Locale): void {
        guildData.language = value;
    }

    public clear(guildData: GuildData): void {
        guildData.language = null;
    }

    public valueDisplayName(value: Locale, _langCode: Locale): string {
        return Language.Data[value].nativeName;
    }

    public retriever(
        intr: ChatInputCommandInteraction,
        langCode: Locale
    ): MessageRetriever<Locale> {
        return async (msg: Message) => {
            let newLangCode = Language.find(msg.content, true);
            if (!newLangCode) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidLanguage', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return newLangCode;
        };
    }

    public async retrieve(intr: ChatInputCommandInteraction, data: EventData): Promise<Locale> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('promptEmbeds.languageGuild', data.lang, {
                LANGUAGE_LIST: Language.Enabled.map(
                    langCode => `**${Language.Data[langCode].nativeName}** (\`${langCode}\`)`
                )
                    .join('\n')
                    .trim(),
            })
        );

        return await CollectorUtils.collectByMessage(
            intr.channel,
            intr.user,
            this.retriever(intr, data.lang),
            async () => {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.collectorExpired', data.lang)
                );
            }
        );
    }
}
