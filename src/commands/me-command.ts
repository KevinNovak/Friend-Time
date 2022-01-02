import { ApplicationCommandOptionType } from 'discord-api-types';
import { ApplicationCommandData, CommandInteraction, DMChannel } from 'discord.js';

import { UserData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { UserPrivateModeSetting } from '../settings/user';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class MeCommand implements Command {
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('commands.me'),
        description: Lang.getRef('commandDescs.me', Lang.Default),
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.meView', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: Lang.getRef('commandDescs.meEdit', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
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
                description: Lang.getRef('commandDescs.meRemove', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
        ],
    };
    public requireDev = false;
    public requireGuild = false;
    public requireUserPerms = [];

    constructor(
        private settingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        let privateMode = this.userPrivateModeSetting.valueOrDefault(data.user);
        if (privateMode && !(intr.channel instanceof DMChannel)) {
            await MessageUtils.sendIntr(
                intr,
                Lang.getEmbed('validationEmbeds.privateModeEnabled', data.lang())
            );
            return;
        }

        if (!data.user) {
            data.user = new UserData();
            data.user.discordId = intr.user.id;
        }

        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.view'): {
                let settingList = this.settingManager.list(data.user, data.lang());
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('displayEmbeds.settingSelf', data.lang(), {
                        SETTING_LIST: settingList,
                        USER_ID: intr.user.id,
                    }).setAuthor({ name: intr.user.tag, iconURL: intr.user.avatarURL() })
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
                    setting.clear(data.user);
                    await data.user.save();

                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('resultEmbeds.removedSettingUser', data.lang(), {
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

                setting.apply(data.user, value);
                await data.user.save();

                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('resultEmbeds.updatedSettingUser', data.lang(), {
                        SETTING_NAME: setting.displayName(data.lang()),
                        SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
                    })
                );
                return;
            }
            case Lang.getCom('subCommands.remove'): {
                this.settingManager.settings.forEach(setting => setting.clear(data.user));
                await data.user.save();
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('resultEmbeds.removedUser', data.lang())
                );
                return;
            }
        }
    }
}
