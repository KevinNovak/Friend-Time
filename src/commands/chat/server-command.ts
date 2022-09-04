import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';

import { GuildBotData, GuildData, GuildListItemData } from '../../database/entities/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { SettingManager } from '../../settings/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class ServerCommand implements Command {
    public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.server'),
        description: Lang.getRef('commandDescs.server', Language.Default),
        dm_permission: false,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.serverView', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: Lang.getRef('commandDescs.serverEdit', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.setting'),
                        description: 'Setting.',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: this.settingManager.settings.map(setting => ({
                            name: setting.name,
                            value: setting.name,
                        })),
                    },
                    {
                        name: Lang.getCom('arguments.reset'),
                        description: 'Reset setting to default?',
                        type: ApplicationCommandOptionType.Boolean,
                        required: false,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.remove'),
                description: Lang.getRef('commandDescs.serverRemove', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
        ],
    };
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionString[] = ['VIEW_CHANNEL'];
    public requireUserPerms: PermissionString[] = ['MANAGE_GUILD'];

    constructor(private settingManager: SettingManager) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = intr.guild?.id;
        }

        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.view'): {
                let settingList = this.settingManager.list(data.guild, data.lang());
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('displayEmbeds.settingsServer', data.lang(), {
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
                        Lang.getEmbed('validationEmbeds.notFoundSetting', data.lang())
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
                        Lang.getEmbed('resultEmbeds.removedSettingGuild', data.lang(), {
                            SETTING_NAME: setting.displayName(data.lang()),
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
                    Lang.getEmbed('resultEmbeds.updatedSettingGuild', data.lang(), {
                        SETTING_NAME: setting.displayName(data.lang()),
                        SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
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
                    Lang.getEmbed('resultEmbeds.removedGuild', data.lang())
                );
                return;
            }
        }
    }
}
