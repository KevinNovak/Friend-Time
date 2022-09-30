import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';

import { GuildBotData, GuildData, GuildListItemData } from '../../database/entities/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { SettingManager } from '../../settings/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class ServerCommand implements Command {
    public names = [Lang.getCom('chatCommands.server')];
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = ['ViewChannel'];
    public requireUserPerms: PermissionsString[] = ['ManageGuild'];

    constructor(private settingManager: SettingManager) {}

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = intr.guild?.id;
        }

        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.view'): {
                let settingList = this.settingManager.list(data.guild, data.lang);
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('displayEmbeds.settingsServer', data.lang, {
                        SETTING_LIST: settingList,
                        SERVER_ID: intr.guild?.id,
                    }).setAuthor({ name: intr.guild?.name, iconURL: intr.guild?.iconURL() })
                );
                return;
            }
            case Lang.getCom('subCommands.edit'): {
                // Find setting to configure
                let settingInput = intr.options.getString(Lang.getCom('arguments.setting'));
                let setting = this.settingManager.find(settingInput);
                if (!setting) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.notFoundSetting', data.lang)
                    );
                    return;
                }

                // Remove setting value
                let reset = intr.options.getBoolean(Lang.getCom('arguments.reset')) ?? false;
                if (reset) {
                    setting.clear(data.guild);
                    await data.guild.save();

                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('resultEmbeds.removedSettingGuild', data.lang, {
                            SETTING_NAME: setting.displayName(data.lang),
                        })
                    );
                    return;
                }

                // Set setting value
                let value = await setting.retrieve(intr, data);
                if (value == null) {
                    return;
                }

                setting.apply(data.guild, value);
                await data.guild.save();

                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.updatedSettingGuild', data.lang, {
                        SETTING_NAME: setting.displayName(data.lang),
                        SETTING_VALUE: setting.valueDisplayName(value, data.lang),
                    })
                );
                return;
            }
            case Lang.getCom('subCommands.remove'): {
                this.settingManager.settings.forEach(setting => setting.clear(data.guild));
                // Remove guild's bots
                if (data.guild.bots?.length > 0) {
                    await GuildBotData.delete(data.guild.bots.map(botData => botData.id));
                }
                // Remove guild's list items
                if (data.guild.listItems?.length > 0) {
                    await GuildListItemData.delete(
                        data.guild.listItems.map(listItemData => listItemData.id)
                    );
                }
                await data.guild.save();
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.removedGuild', data.lang)
                );
                return;
            }
        }
    }
}
