import { Message, Permissions } from 'discord.js';

import { GuildBotData, GuildData, GuildListItemData } from '../database/entities';
import { LangCode } from '../models/enums';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class ServerCommand implements Command {
    public requireGuild = true;
    public requirePerms = [Permissions.FLAGS.MANAGE_GUILD];

    constructor(private settingManager: SettingManager) {}

    public keyword(langCode: LangCode): string {
        return Lang.getRef('commands.server', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('commands.server', langCode);
    }

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        if (!data.guild) {
            data.guild = new GuildData();
            data.guild.discordId = msg.guild.id;
        }

        // Display settings
        if (args.length === 2) {
            let settingList = this.settingManager.list(data.guild, data.lang());
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('displays.settingsServer', data.lang(), {
                    SETTING_LIST: settingList,
                    SERVER_ID: msg.guild.id,
                }).setAuthor(msg.guild.name, msg.guild.iconURL())
            );
            return;
        }

        if (args.length > 2) {
            let removeRegex = Lang.getRegex('commands.remove', data.lang());

            // Remove all setting data
            // TODO: Move to method
            if (removeRegex.test(args[2])) {
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
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('results.removedGuild', data.lang())
                );
                return;
            }

            // Find setting to configure
            let setting = this.settingManager.find(args[2], data.lang());

            // No setting found
            if (!setting) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validation.notFoundSetting', data.lang())
                );
                return;
            }

            // Remove setting value
            if (args.length > 3 && removeRegex.test(args[3])) {
                setting.clear(data.guild);
                await data.guild.save();

                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('results.removedSettingGuild', data.lang(), {
                        SETTING_NAME: setting.displayName(data.lang()),
                    })
                );
                return;
            }

            // Set setting value
            let value = await setting.retrieve(msg, args, data);
            if (value == null) {
                return;
            }

            setting.apply(data.guild, value);
            await data.guild.save();

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('results.updatedSettingGuild', data.lang(), {
                    SETTING_NAME: setting.displayName(data.lang()),
                    SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
                })
            );
        }
    }
}
