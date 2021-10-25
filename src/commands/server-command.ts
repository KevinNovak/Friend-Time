import { ApplicationCommandOptionType } from 'discord-api-types';
import { ApplicationCommandData, CommandInteraction, Permissions } from 'discord.js';

import { GuildBotData, GuildData, GuildListItemData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { MessageUtils } from '../utils';
import { Command } from './command';
export class ServerCommand implements Command {
    public data: ApplicationCommandData = {
        name: Lang.getCom('commands.server'),
        description: Lang.getCom('commandDescs.server'),
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: `View server settings.`,
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: 'Change a server setting.',
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.setting'),
                        description: 'Setting.',
                        type: ApplicationCommandOptionType.String.valueOf(),
                        required: true,
                        choices: [
                            {
                                name: 'timeZone',
                                value: 'timeZone',
                            },
                            {
                                name: 'timeFormat',
                                value: 'timeFormat',
                            },
                            {
                                name: 'autoDetect',
                                value: 'autoDetect',
                            },
                            {
                                name: 'list',
                                value: 'list',
                            },
                            {
                                name: 'reminders',
                                value: 'reminders',
                            },
                            {
                                name: 'language',
                                value: 'language',
                            },
                        ],
                    },
                    {
                        name: Lang.getCom('arguments.reset'),
                        description: 'Reset setting to default?',
                        type: ApplicationCommandOptionType.Boolean.valueOf(),
                        required: false,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.remove'),
                description: 'Remove all server data.',
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
        ],
    };
    public requireDev = false;
    public requireGuild = true;
    public requirePerms = [Permissions.FLAGS.MANAGE_GUILD];

    constructor(private settingManager: SettingManager) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = intr.guild.id;
        }

        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.view'): {
                let settingList = this.settingManager.list(data.guild, data.lang());
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('displayEmbeds.settingsServer', data.lang(), {
                        SETTING_LIST: settingList,
                        SERVER_ID: intr.guild.id,
                    }).setAuthor(intr.guild.name, intr.guild.iconURL())
                );
                return;
            }
            case Lang.getCom('subCommands.edit'): {
                // Find setting to configure
                let settingInput = intr.options.getString(Lang.getCom('arguments.setting'));
                let setting = this.settingManager.find(settingInput);
                if (!setting) {
                    await MessageUtils.sendIntr(
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

                    await MessageUtils.sendIntr(
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

                await MessageUtils.sendIntr(
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
                if (data.guild.bots) {
                    await GuildBotData.delete(data.guild.bots.map(botData => botData.id));
                }
                // Remove guild's list items
                if (data.guild.listItems) {
                    await GuildListItemData.delete(
                        data.guild.listItems.map(listItemData => listItemData.id)
                    );
                }
                await data.guild.save();
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('resultEmbeds.removedGuild', data.lang())
                );
                return;
            }
        }
    }
}
