import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { GuildData } from '../../database/entities/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { SettingManager } from '../../settings/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class SetupCommand implements Command {
    public names = [Lang.getCom('chatCommands.setup')];
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = ['ViewChannel'];
    public requireUserPerms: PermissionsString[] = ['ManageGuild'];

    constructor(private guildSettingManager: SettingManager) {}

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
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

        let settingList = this.guildSettingManager.list(data.guild, data.lang);
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('resultEmbeds.setupCompleted', data.lang, {
                SETTING_LIST: settingList,
            })
        );
        return;
    }
}
