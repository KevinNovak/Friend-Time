import { ApplicationCommandData, DMChannel, Message, Permissions } from 'discord.js';

import { GuildBotData, GuildData, UserData } from '../database/entities';
import { YesNo } from '../models/enums/yes-no';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { UserPrivateModeSetting } from '../settings/user';
import { ClientUtils, CollectorUtils, FormatUtils, MessageUtils } from '../utils';
import { Command } from './command';

let Config = require('../../config/config.json');
let Debug = require('../../config/debug.json');

export class SetCommand {
    // export class SetCommand implements Command {
    public static data: ApplicationCommandData = {
        name: Lang.getCom('commands.set'),
        description: Lang.getCom('commandDescs.set'),
    };
    public requireDev = false;
    public requireGuild = false;
    public requirePerms = [];

    constructor(
        private userSettingManager: SettingManager,
        private botSettingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        // Setup for self
        if (args.length === 2) {
            let privateMode = this.userPrivateModeSetting.valueOrDefault(data.user);
            if (privateMode && !(msg.channel instanceof DMChannel)) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.privateModeEnabled', data.lang())
                );
                return;
            }

            if (!data.user) {
                data.user = new UserData();
                data.user.discordId = msg.author.id;
            }

            for (let setting of this.userSettingManager.settings) {
                let value = await setting.retrieve(msg, args, data);
                if (value == null) {
                    return;
                }
                setting.apply(data.user, value);
            }
            await data.user.save();

            let settingList = this.userSettingManager.list(data.user, data.lang());
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('resultEmbeds.setCompletedSelf', data.lang(), {
                    SETTING_LIST: settingList,
                })
            );
            return;
        }

        // Setup for other
        if (args.length > 2) {
            if (!msg.guild) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.serverOnlyCommand', data.lang())
                );
                return;
            }

            let member = await ClientUtils.findMember(msg.guild, args.slice(2).join(' '));
            if (!member) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.notFoundUser', data.lang())
                );
                return;
            }

            // Setup for bot
            if (member.user.bot) {
                if (
                    !(
                        msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) ||
                        Debug.skip.checkPerms
                    )
                ) {
                    await MessageUtils.send(
                        msg.channel,
                        Lang.getEmbed('validationEmbeds.permissionRequired', data.lang())
                    );
                    return;
                }

                if (member.id === msg.client.user.id) {
                    await MessageUtils.send(
                        msg.channel,
                        Lang.getEmbed('validationEmbeds.notAllowedSetClient', data.lang())
                    );
                    return;
                }

                let botData = data.guild?.bots.find(botData => botData.discordId === member.id);
                if (!botData) {
                    if (data.guild?.bots.length >= Config.validation.bots.countMax) {
                        // Hit max number of bots allowed
                        await MessageUtils.send(
                            msg.channel,
                            Lang.getEmbed('validationEmbeds.maxLimitBots', data.lang())
                        );
                        return;
                    }

                    botData = new GuildBotData();
                    botData.discordId = member.id;
                }

                for (let setting of this.botSettingManager.settings) {
                    let value = await setting.retrieve(msg, args, data, member.id);
                    if (value == null) {
                        return;
                    }
                    setting.apply(botData, value);
                }

                // If the guild is not in the database, we need to create it first.
                if (!data.guild) {
                    data.guild = new GuildData();
                    data.guild.discordId = msg.guild.id;
                    data.guild = await data.guild.save();
                }

                botData.guild = data.guild;
                await botData.save();

                let settingList = this.botSettingManager.list(botData, data.lang());
                await MessageUtils.send(
                    msg.channel,
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
                let value = await setting.retrieve(msg, args, data, member.id);
                if (value == null) {
                    return;
                }
                setting.apply(userData, value);
            }

            let collect = CollectorUtils.createMsgCollect(
                msg.channel,
                member.user,
                Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
            );

            let settingList = this.userSettingManager.list(userData, data.lang());
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('promptEmbeds.setConfirmUser', data.lang(), {
                    SETTING_LIST: settingList,
                    USER: FormatUtils.userMention(member.id),
                })
            );
            let confirmed = await collect(async (msg: Message) => {
                let privateMode = YesNo.find(msg.content);
                if (privateMode == null) {
                    await MessageUtils.send(
                        msg.channel,
                        Lang.getEmbed('validationEmbeds.invalidYesNo', data.lang()).setFooter(
                            Lang.getRef('footers.collector', data.lang())
                        )
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
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('resultEmbeds.setDeniedUser', data.lang())
                );
                return;
            }

            // User accepted settings
            await userData.save();

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('resultEmbeds.setCompletedUser', data.lang(), {
                    SETTING_LIST: settingList,
                })
            );
            return;
        }
    }
}
