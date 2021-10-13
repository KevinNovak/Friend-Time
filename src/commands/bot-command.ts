import { Message, Permissions } from 'discord.js';

import { GuildData } from '../database/entities';
import { LangCode } from '../models/enums';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { ClientUtils, FormatUtils, MessageUtils, RegexUtils } from '../utils';
import { Command } from './command';

let Config = require('../../config/config.json');

export class BotCommand implements Command {
    public requireDev = false;
    public requireGuild = true;
    public requirePerms = [Permissions.FLAGS.MANAGE_GUILD];

    constructor(private settingManager: SettingManager) {}

    public keyword(langCode: LangCode): string {
        return Lang.getRef('commands.bot', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('commandRegexes.bot', langCode);
    }

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = msg.guild.id;
        }

        if (args.length === 2) {
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

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('displayEmbeds.listBot', data.lang(), {
                    BOT_LIST: botList,
                }).setAuthor(msg.guild.name, msg.guild.iconURL())
            );
            return;
        }

        let user =
            (await ClientUtils.findMember(msg.guild, args[2]))?.user ??
            (await ClientUtils.getUser(msg.client, args[2]));
        let discordId = user?.id ?? RegexUtils.discordId(args[2]);
        let botData = data.guild.bots?.find(botData => botData.discordId === discordId);
        if (!botData) {
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('validationEmbeds.notFoundBot', data.lang())
            );
            return;
        }

        // Display settings
        if (args.length === 3) {
            let settingList = this.settingManager.list(botData, data.lang());
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('displayEmbeds.settingsBot', data.lang(), {
                    SETTING_LIST: settingList,
                    BOT_ID: botData.discordId,
                }).setAuthor(user?.tag ?? botData.discordId, user?.avatarURL())
            );
            return;
        }

        if (args.length > 3) {
            let removeRegex = Lang.getRegex('commandRegexes.remove', data.lang());

            // Remove all setting data
            if (removeRegex.test(args[3])) {
                await botData.remove();
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('resultEmbeds.removedBot', data.lang(), {
                        BOT: FormatUtils.userMention(botData.discordId),
                    })
                );
                return;
            }

            // Find setting to configure
            let setting = this.settingManager.find(args[3], data.lang());

            // No setting found
            if (!setting) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.notFoundSetting', data.lang())
                );
                return;
            }

            // Remove setting value
            if (args.length > 4 && removeRegex.test(args[4])) {
                setting.clear(botData);
                await botData.save();

                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('resultEmbeds.removedSettingBot', data.lang(), {
                        BOT: FormatUtils.userMention(botData.discordId),
                        SETTING_NAME: setting.displayName(data.lang()),
                    })
                );
                return;
            }

            // Set setting value
            let value = await setting.retrieve(msg, args, data, botData.discordId);
            if (value == null) {
                return;
            }

            setting.apply(botData, value);
            await botData.save();

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('resultEmbeds.updatedSettingBot', data.lang(), {
                    BOT: FormatUtils.userMention(botData.discordId),
                    SETTING_NAME: setting.displayName(data.lang()),
                    SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
                })
            );
        }
    }
}
