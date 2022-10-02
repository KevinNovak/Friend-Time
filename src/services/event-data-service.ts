import {
    Channel,
    CommandInteractionOptionResolver,
    Guild,
    PartialDMChannel,
    User,
} from 'discord.js';

import { GuildData, UserData } from '../database/entities/index.js';
import { Language } from '../models/enum-helpers/language.js';
import { EventData } from '../models/internal-models.js';

export class EventDataService {
    public async create(
        options: {
            user?: User;
            channel?: Channel | PartialDMChannel;
            guild?: Guild;
            args?: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
        } = {}
    ): Promise<EventData> {
        let userData: UserData;
        if (options.user) {
            userData = await UserData.findOne({ discordId: options.user.id });
        }

        let guildData: GuildData;
        if (options.guild) {
            guildData = await GuildData.findOne(
                { discordId: options.guild.id },
                { relations: ['bots', 'listItems'] }
            );
        }

        // Event language
        let lang =
            userData?.language && Language.Enabled.includes(userData.language)
                ? userData.language
                : guildData?.language && Language.Enabled.includes(guildData.language)
                ? guildData.language
                : options.guild?.preferredLocale &&
                  Language.Enabled.includes(options.guild.preferredLocale)
                ? options.guild.preferredLocale
                : Language.Default;

        // Guild language
        let langGuild =
            guildData?.language && Language.Enabled.includes(guildData.language)
                ? guildData.language
                : options.guild?.preferredLocale &&
                  Language.Enabled.includes(options.guild.preferredLocale)
                ? options.guild.preferredLocale
                : Language.Default;

        return new EventData(lang, langGuild, userData, guildData);
    }
}
