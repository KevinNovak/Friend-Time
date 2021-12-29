import { Guild } from 'discord.js';

import { GuildData, UserData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang, Logger } from '../services';
import { GuildLanguageSetting } from '../settings/guild';
import { UserLanguageSetting } from '../settings/user';
import { ClientUtils, MessageUtils } from '../utils';
import { EventHandler } from './event-handler';

let Logs = require('../../lang/logs.json');

export class GuildJoinHandler implements EventHandler {
    constructor(
        private guildLanguageSetting: GuildLanguageSetting,
        private userLanguageSetting: UserLanguageSetting
    ) {}

    public async process(guild: Guild): Promise<void> {
        Logger.info(
            Logs.info.guildJoined
                .replaceAll('{GUILD_NAME}', guild.name)
                .replaceAll('{GUILD_ID}', guild.id)
        );

        // Get data from database
        let data = new EventData(
            await UserData.findOne({ discordId: guild.ownerId }),
            await GuildData.findOne({ discordId: guild.id })
        );

        // Send welcome message to the server's notify channel
        let guildLang = this.guildLanguageSetting.valueOrDefault(data.guild);
        let notifyChannel = await ClientUtils.findNotifyChannel(guild, guildLang);
        if (notifyChannel) {
            await MessageUtils.send(
                notifyChannel,
                Lang.getEmbed('displayEmbeds.welcome', guildLang).setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL(),
                })
            );
        }

        // Send welcome message to owner
        let ownerLang = this.userLanguageSetting.valueOrDefault(data.user);
        let owner = await guild.fetchOwner();
        if (owner) {
            await MessageUtils.send(
                owner.user,
                Lang.getEmbed('displayEmbeds.welcome', ownerLang).setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL(),
                })
            );
        }
    }
}
