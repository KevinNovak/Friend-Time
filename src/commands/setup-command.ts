import { Message, Permissions } from 'discord.js';

import { GuildData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class SetupCommand {
    // export class SetupCommand implements Command {
    public name = Lang.getCom('commands.setup');
    public requireDev = false;
    public requireGuild = true;
    public requirePerms = [Permissions.FLAGS.MANAGE_GUILD];

    constructor(private guildSettingManager: SettingManager) {}

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = msg.guild.id;
        }

        for (let setting of this.guildSettingManager.settings) {
            let value = await setting.retrieve(msg, args, data);
            if (value == null) {
                return;
            }
            setting.apply(data.guild, value);
        }
        await data.guild.save();

        let settingList = this.guildSettingManager.list(data.guild, data.lang());
        await MessageUtils.send(
            msg.channel,
            Lang.getEmbed('resultEmbeds.setupCompleted', data.lang(), {
                SETTING_LIST: settingList,
            })
        );
        return;
    }
}
