import { DMChannel, Message } from 'discord.js';

import { UserData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { UserPrivateModeSetting } from '../settings/user';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class MeCommand implements Command {
    public name = Lang.getCom('commands.me');
    public requireDev = false;
    public requireGuild = false;
    public requirePerms = [];

    constructor(
        private settingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
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

        // Display settings
        if (args.length === 2) {
            let settingList = this.settingManager.list(data.user, data.lang());
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('displayEmbeds.settingSelf', data.lang(), {
                    SETTING_LIST: settingList,
                    USER_ID: msg.author.id,
                }).setAuthor(msg.author.tag, msg.author.avatarURL())
            );
            return;
        }

        if (args.length > 2) {
            // Remove all setting data
            if (args[2].toLowerCase() === Lang.getCom('commands.remove')) {
                this.settingManager.settings.forEach(setting => setting.clear(data.user));
                await data.user.save();
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('resultEmbeds.removedUser', data.lang())
                );
                return;
            }

            // Find setting to configure
            let setting = this.settingManager.find(args[2]);

            // No setting found
            if (!setting) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.notFoundSetting', data.lang())
                );
                return;
            }

            // Remove setting value
            if (args.length > 3 && args[3].toLowerCase() === Lang.getCom('commands.remove')) {
                setting.clear(data.user);
                await data.user.save();

                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('resultEmbeds.removedSettingUser', data.lang(), {
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

            setting.apply(data.user, value);
            await data.user.save();

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('resultEmbeds.updatedSettingUser', data.lang(), {
                    SETTING_NAME: setting.displayName(data.lang()),
                    SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
                })
            );
        }
    }
}
