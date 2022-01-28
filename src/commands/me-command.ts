import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import {
    ChatInputApplicationCommandData,
    CommandInteraction,
    DMChannel,
    PermissionString,
} from 'discord.js';

import { UserData } from '../database/entities/index.js';
import { EventData } from '../models/internal-models.js';
import { Lang } from '../services/index.js';
import { SettingManager } from '../settings/index.js';
import { UserPrivateModeSetting } from '../settings/user/index.js';
import { InteractionUtils } from '../utils/index.js';
import { Command, CommandDeferType } from './index.js';

export class MeCommand implements Command {
    public metadata: ChatInputApplicationCommandData = {
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
    public deferType = CommandDeferType.PUBLIC;
    public requireDev = false;
    public requireGuild = false;
    public requireClientPerms: PermissionString[] = ['VIEW_CHANNEL'];
    public requireUserPerms: PermissionString[] = [];

    constructor(
        private settingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        let privateMode = this.userPrivateModeSetting.valueOrDefault(data.user);
        if (privateMode && !(intr.channel instanceof DMChannel)) {
            await InteractionUtils.send(
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
                await InteractionUtils.send(
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
                    await InteractionUtils.send(
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

                    await InteractionUtils.send(
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

                await InteractionUtils.send(
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
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.removedUser', data.lang())
                );
                return;
            }
        }
    }
}
