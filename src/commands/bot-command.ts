import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChatInputApplicationCommandData, CommandInteraction, PermissionString } from 'discord.js';
import { createRequire } from 'node:module';

import { GuildData } from '../database/entities/index.js';
import { EventData } from '../models/internal-models.js';
import { Lang } from '../services/index.js';
import { SettingManager } from '../settings/index.js';
import { FormatUtils, InteractionUtils } from '../utils/index.js';
import { Command, CommandDeferType } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class BotCommand implements Command {
    public metadata: ChatInputApplicationCommandData = {
        name: Lang.getCom('commands.bot'),
        description: Lang.getRef('commandDescs.bot', Lang.Default),
        options: [
            {
                name: Lang.getCom('subCommands.list'),
                description: Lang.getRef('commandDescs.botList', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.botView', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.bot'),
                        description: 'Bot.',
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: Lang.getRef('commandDescs.botEdit', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.bot'),
                        description: 'Bot.',
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                    {
                        name: Lang.getCom('arguments.setting'),
                        description: 'Setting.',
                        type: ApplicationCommandOptionType.String.valueOf(),
                        required: true,
                        choices: this.settingManager.settings.map(setting => ({
                            name: setting.name,
                            value: setting.name,
                        })),
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
                description: Lang.getRef('commandDescs.botRemove', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.bot'),
                        description: 'Bot.',
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                ],
            },
        ],
    };
    public deferType = CommandDeferType.PUBLIC;
    public requireDev = false;
    public requireGuild = true;
    public requireClientPerms: PermissionString[] = ['VIEW_CHANNEL'];
    public requireUserPerms: PermissionString[] = ['MANAGE_GUILD'];

    constructor(private settingManager: SettingManager) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = intr.guild?.id;
        }

        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.list'): {
                let botList =
                    data.guild.bots?.length > 0
                        ? data.guild.bots
                              .slice(0, Config.validation.bots.countMax)
                              .map(botData =>
                                  Lang.getRef('lists.botItem', data.lang(), {
                                      BOT: FormatUtils.userMention(botData.discordId),
                                  })
                              )
                              .join('\n')
                              .trim()
                        : Lang.getRef('lists.botNone', data.lang());

                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('displayEmbeds.listBot', data.lang(), {
                        BOT_LIST: botList,
                    }).setAuthor({ name: intr.guild?.name, iconURL: intr.guild?.iconURL() })
                );
                return;
            }
            case Lang.getCom('subCommands.view'): {
                let user = intr.options.getUser(Lang.getCom('arguments.bot'));
                let botData = data.guild.bots?.find(botData => botData.discordId === user.id);
                if (!botData) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.notFoundBot', data.lang())
                    );
                    return;
                }

                let settingList = this.settingManager.list(botData, data.lang());
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('displayEmbeds.settingsBot', data.lang(), {
                        SETTING_LIST: settingList,
                        BOT_ID: botData.discordId,
                    }).setAuthor({
                        name: user?.tag ?? botData.discordId,
                        iconURL: user?.avatarURL(),
                    })
                );
                return;
            }
            case Lang.getCom('subCommands.edit'): {
                let user = intr.options.getUser(Lang.getCom('arguments.bot'));
                let botData = data.guild.bots?.find(botData => botData.discordId === user.id);
                if (!botData) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.notFoundBot', data.lang())
                    );
                    return;
                }

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
                    setting.clear(botData);
                    await botData.save();

                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('resultEmbeds.removedSettingBot', data.lang(), {
                            BOT: FormatUtils.userMention(botData.discordId),
                            SETTING_NAME: setting.displayName(data.lang()),
                        })
                    );
                    return;
                }

                // Set setting value
                let value = await setting.retrieve(intr, data, botData.discordId);
                if (value == null) {
                    return;
                }

                setting.apply(botData, value);
                await botData.save();

                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.updatedSettingBot', data.lang(), {
                        BOT: FormatUtils.userMention(botData.discordId),
                        SETTING_NAME: setting.displayName(data.lang()),
                        SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
                    })
                );
                return;
            }
            case Lang.getCom('subCommands.remove'): {
                let user = intr.options.getUser(Lang.getCom('arguments.bot'));
                let botData = data.guild.bots?.find(botData => botData.discordId === user.id);
                if (!botData) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.notFoundBot', data.lang())
                    );
                    return;
                }

                await botData.remove();
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.removedBot', data.lang(), {
                        BOT: FormatUtils.userMention(botData.discordId),
                    })
                );
                return;
            }
        }
    }
}
