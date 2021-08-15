import { DMChannel, Message } from 'discord.js';

import { UserData } from '../database/entities';
import { LangCode } from '../models/enums';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { SettingManager } from '../settings';
import { UserPrivateModeSetting } from '../settings/user';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class MeCommand implements Command {
    public requireGuild = false;
    public requirePerms = [];

    constructor(
        private settingManager: SettingManager,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public keyword(langCode: LangCode): string {
        return Lang.getRef('commands.me', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('commands.me', langCode);
    }

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        let privateMode = this.userPrivateModeSetting.valueOrDefault(data.user);
        if (privateMode && !(msg.channel instanceof DMChannel)) {
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('validation.privateModeEnabled', data.lang())
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
                Lang.getEmbed('displays.settingSelf', data.lang(), {
                    SETTING_LIST: settingList,
                    USER_ID: msg.author.id,
                }).setAuthor(msg.author.tag, msg.author.avatarURL())
            );
            return;
        }

        if (args.length > 2) {
            let removeRegex = Lang.getRegex('commands.remove', data.lang());

            // Remove all setting data
            if (removeRegex.test(args[2])) {
                this.settingManager.settings.forEach(setting => setting.clear(data.user));
                await data.user.save();
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('results.removedUser', data.lang())
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
                setting.clear(data.user);
                await data.user.save();

                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('results.removedSettingUser', data.lang(), {
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
                Lang.getEmbed('results.updatedSettingUser', data.lang(), {
                    SETTING_NAME: setting.displayName(data.lang()),
                    SETTING_VALUE: setting.valueDisplayName(value, data.lang()),
                })
            );
        }
    }
}
