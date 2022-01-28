import { ChatInputApplicationCommandData, CommandInteraction, PermissionString } from 'discord.js';

import { GuildData } from '../database/entities/index.js';
import { EventData } from '../models/internal-models.js';
import { Lang } from '../services/index.js';
import { SettingManager } from '../settings/index.js';
import { InteractionUtils } from '../utils/index.js';
import { Command, CommandDeferType } from './index.js';

export class SetupCommand implements Command {
    public metadata: ChatInputApplicationCommandData = {
        name: Lang.getCom('commands.setup'),
        description: Lang.getRef('commandDescs.setup', Lang.Default),
    };
    public deferType = CommandDeferType.PUBLIC;
    public requireDev = false;
    public requireGuild = true;
    public requireClientPerms: PermissionString[] = ['VIEW_CHANNEL'];
    public requireUserPerms: PermissionString[] = ['MANAGE_GUILD'];

    constructor(private guildSettingManager: SettingManager) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = intr.guild?.id;
        }

        for (let setting of this.guildSettingManager.settings) {
            let value = await setting.retrieve(intr, data);
            if (value == null) {
                return;
            }
            setting.apply(data.guild, value);
        }
        await data.guild.save();

        let settingList = this.guildSettingManager.list(data.guild, data.lang());
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('resultEmbeds.setupCompleted', data.lang(), {
                SETTING_LIST: settingList,
            })
        );
        return;
    }
}
