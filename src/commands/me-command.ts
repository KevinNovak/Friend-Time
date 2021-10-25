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
    public data: ApplicationCommandData = {
        name: Lang.getCom('commands.me'),
        description: Lang.getCom('commandDescs.me'),
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: `View your user settings.`,
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: 'Change a user setting.',
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
                                name: 'dateFormat',
                                value: 'dateFormat',
                            },
                            {
                                name: 'timeFormat',
                                value: 'timeFormat',
                            },
                            {
                                name: 'privateMode',
                                value: 'privateMode',
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
                description: 'Remove all your user data.',
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
        ],
    };
    public requireDev = false;
    public requireGuild = false;
    public requirePerms = [];

    constructor(
        private settingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        return;
    }

    // public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
    //     let privateMode = this.userPrivateModeSetting.valueOrDefault(data.user);
    //     if (privateMode && !(intr.channel instanceof DMChannel)) {
    //         await MessageUtils.sendIntr(
    //             intr,
    //             Lang.getEmbed('validationEmbeds.privateModeEnabled', data.lang())
    //         );
    //         return;
    //     }

    //     if (!data.user) {
    //         data.user = new UserData();
    //         data.user.discordId = intr.user.id;
    //     }

    //     // Display settings
    //     if (args.length === 2) {
    //         let settingList = this.settingManager.list(data.user, data.lang());
    //         await MessageUtils.sendIntr(
    //             intr,
    //             Lang.getEmbed('displayEmbeds.settingSelf', data.lang(), {
    //                 SETTING_LIST: settingList,
    //                 USER_ID: intr.user.id,
    //             }).setAuthor(intr.user.tag, intr.user.avatarURL())
    //         );
    //         return;
    //     }

    //     if (args.length > 2) {
    //         // Remove all setting data
    //         if (args[2].toLowerCase() === Lang.getCom('commands.remove')) {
    //             this.settingManager.settings.forEach(setting => setting.clear(data.user));
    //             await data.user.save();
    //             await MessageUtils.sendIntr(
    //                 intr,
    //                 Lang.getEmbed('resultEmbeds.removedUser', data.lang())
    //             );
    //             return;
    //         }

    //         // Find setting to configure
    //         let setting = this.settingManager.find(args[2]);

    //         // No setting found
    //         if (!setting) {
    //             await MessageUtils.sendIntr(
    //                 intr,
    //                 Lang.getEmbed('validationEmbeds.notFoundSetting', data.lang())
    //             );
    //             return;
    //         }

    //         // Remove setting value
    //         if (args.length > 3 && args[3].toLowerCase() === Lang.getCom('commands.remove')) {
    //             setting.clear(data.user);
    //             await data.user.save();

    //             await MessageUtils.sendIntr(
    //                 intr,
    //                 Lang.getEmbed('resultEmbeds.removedSettingUser', data.lang(), {
    //                     SETTING_NAME: setting.displayName(data.lang()),
    //                 })
    //             );
    //             return;
    //         }

    //         // Set setting value
    //         let value = await setting.retrieve(intr, data);
    //         if (value == null) {
    //             return;
    //         }

    //         setting.apply(data.user, value);
    //         await data.user.save();

    //         await MessageUtils.sendIntr(
    //             intr,
    //             Lang.getEmbed('resultEmbeds.updatedSettingUser', data.lang(), {
    //                 SETTING_NAME: setting.displayName(data.lang()),
    //                 SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
    //             })
    //         );
    //     }
    // }
}
