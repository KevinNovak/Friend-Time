import { Message, User } from 'discord.js-light';
import { Lang } from '.';
import { EventData } from '../models/internal-models';
import { GuildRemindersSetting } from '../settings/guild';
import { UserRemindersSetting } from '../settings/user';
import { FormatUtils, MessageUtils } from '../utils';

export class ReminderService {
    constructor(
        private guildRemindersSetting: GuildRemindersSetting,
        private userRemindersSetting: UserRemindersSetting
    ) {}

    public async sendReminder(user: User, msg: Message, data: EventData): Promise<void> {
        // Don't remind bots
        if (user.bot) {
            return;
        }

        // Check if guild or user disabled reminders
        let guildRemind = this.guildRemindersSetting.valueOrDefault(data.guild);
        let userRemind = this.userRemindersSetting.valueOrDefault(data.user);
        if (!(guildRemind && userRemind)) {
            return;
        }

        // Send the reminder
        await MessageUtils.send(
            user,
            Lang.getEmbed('displays.timeZoneReminder', data.lang(), {
                USER: FormatUtils.userMention(user.id),
                MESSAGE_LINK: msg.url,
            }).setAuthor(msg.guild.name, msg.guild.iconURL())
        );
    }
}
