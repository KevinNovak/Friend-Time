import { ApplicationCommandOptionType } from 'discord-api-types/payloads/v9';
import {
    ApplicationCommandData,
    CommandInteraction,
    DMChannel,
    Message,
    Permissions,
    PermissionString,
} from 'discord.js';

import { Command, CommandDeferType } from '.';
import { GuildBotData, GuildData, UserData } from '../database/entities';
import { YesNo } from '../models/enums/yes-no';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { UserPrivateModeSetting } from '../settings/user';
import { ClientUtils, CollectorUtils, FormatUtils, MessageUtils } from '../utils';

let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');

export class SetCommand implements Command {
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('commands.set'),
        description: Lang.getRef('commandDescs.set', Lang.Default),
        options: [
            {
                name: Lang.getCom('subCommands.me'),
                description: Lang.getRef('commandDescs.setMe', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.user'),
                description: Lang.getRef('commandDescs.setUser', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.user'),
                        description: 'User or bot.',
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                ],
            },
        ],
    };
    public deferType = CommandDeferType.PUBLIC;
    public requireDev = false;
    public requireGuild = false;
    public requireClientPerms: PermissionString[] = ['VIEW_CHANNEL'];
    public requireUserPerms: PermissionString[] = [];

    constructor(
        private userSettingManager: SettingManager,
        private botSettingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.me'): {
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

                for (let setting of this.userSettingManager.settings) {
                    let value = await setting.retrieve(intr, data);
                    if (value == null) {
                        return;
                    }
                    setting.apply(data.user, value);
                }
                await data.user.save();

                let settingList = this.userSettingManager.list(data.user, data.lang());
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('resultEmbeds.setCompletedSelf', data.lang(), {
                        SETTING_LIST: settingList,
                    })
                );
                return;
            }
            case Lang.getCom('subCommands.user'): {
                if (!intr.guild) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.serverOnlyCommand', data.lang())
                    );
                    return;
                }

                let user = intr.options.getUser(Lang.getCom('arguments.user'));
                let member = await ClientUtils.findMember(intr.guild, user.id);
                if (!member) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.notFoundUser', data.lang())
                    );
                    return;
                }

                // Setup for bot
                if (member.user.bot) {
                    if (
                        !(
                            intr.memberPermissions.has(Permissions.FLAGS.MANAGE_GUILD) ||
                            Debug.skip.checkPerms
                        )
                    ) {
                        await MessageUtils.sendIntr(
                            intr,
                            Lang.getEmbed('validationEmbeds.missingUserPerms', data.lang())
                        );
                        return;
                    }

                    if (member.id === intr.client.user?.id) {
                        await MessageUtils.sendIntr(
                            intr,
                            Lang.getEmbed('validationEmbeds.notAllowedSetClient', data.lang())
                        );
                        return;
                    }

                    let botData = data.guild?.bots.find(botData => botData.discordId === member.id);
                    if (!botData) {
                        if (data.guild?.bots.length >= Config.validation.bots.countMax) {
                            // Hit max number of bots allowed
                            await MessageUtils.sendIntr(
                                intr,
                                Lang.getEmbed('validationEmbeds.maxLimitBots', data.lang())
                            );
                            return;
                        }

                        botData = new GuildBotData();
                        botData.discordId = member.id;
                    }

                    for (let setting of this.botSettingManager.settings) {
                        let value = await setting.retrieve(intr, data, member.id);
                        if (value == null) {
                            return;
                        }
                        setting.apply(botData, value);
                    }

                    // If the guild is not in the database, we need to create it first.
                    if (!data.guild) {
                        data.guild = new GuildData();
                        data.guild.discordId = intr.guild?.id;
                        data.guild = await data.guild.save();
                    }

                    botData.guild = data.guild;
                    await botData.save();

                    let settingList = this.botSettingManager.list(botData, data.lang());
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('resultEmbeds.setCompletedBot', data.lang(), {
                            SETTING_LIST: settingList,
                        })
                    );
                    return;
                }

                // Setup for member
                let userData = await UserData.findOne({ discordId: member.id });
                if (!userData) {
                    userData = new UserData();
                    userData.discordId = member.id;
                }

                for (let setting of this.userSettingManager.settings) {
                    let value = await setting.retrieve(intr, data, member.id);
                    if (value == null) {
                        return;
                    }
                    setting.apply(userData, value);
                }

                let collect = CollectorUtils.createMsgCollect(
                    intr.channel,
                    member.user,
                    async () => {
                        await MessageUtils.sendIntr(
                            intr,
                            Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
                        );
                    }
                );

                let userMention = FormatUtils.userMention(member.id);
                let settingList = this.userSettingManager.list(userData, data.lang());
                await MessageUtils.sendIntr(intr, {
                    content: userMention,
                    embeds: [
                        Lang.getEmbed('promptEmbeds.setConfirmUser', data.lang(), {
                            SETTING_LIST: settingList,
                            USER: userMention,
                        }),
                    ],
                });
                let confirmed = await collect(async (msg: Message) => {
                    let privateMode = YesNo.find(msg.content);
                    if (privateMode == null) {
                        await MessageUtils.sendIntr(
                            intr,
                            Lang.getEmbed('validationEmbeds.invalidYesNo', data.lang()).setFooter({
                                text: Lang.getRef('footers.collector', data.lang()),
                            })
                        );
                        return;
                    }
                    return privateMode;
                });
                if (confirmed === undefined) {
                    return;
                }

                // User denied settings
                if (!confirmed) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('resultEmbeds.setDeniedUser', data.lang())
                    );
                    return;
                }

                // User accepted settings
                await userData.save();

                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('resultEmbeds.setCompletedUser', data.lang(), {
                        SETTING_LIST: settingList,
                    })
                );
                return;
            }
        }
    }
}
