import { MessageReaction, User } from 'discord.js-light';

import { Reaction } from '.';
import { GuildBotData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang, ReminderService, TimeService } from '../services';
import { BotDateFormatSetting, BotTimeZoneSetting } from '../settings/bot';
import {
    UserDateFormatSetting,
    UserPrivateModeSetting,
    UserTimeFormatSetting,
    UserTimeZoneSetting,
} from '../settings/user';
import { DataUtils, EmbedUtils, FormatUtils, MessageUtils } from '../utils';

let Config = require('../../config/config.json');

export class ConvertReaction implements Reaction {
    public emoji: string = Config.reactions.convert;
    public requireGuild = true;

    constructor(
        private timeService: TimeService,
        private reminderService: ReminderService,
        private botTimeZoneSetting: BotTimeZoneSetting,
        private botDateFormatSetting: BotDateFormatSetting,
        private userTimeZoneSetting: UserTimeZoneSetting,
        private userDateFormatSetting: UserDateFormatSetting,
        private userTimeFormatSetting: UserTimeFormatSetting,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public async execute(
        msgReaction: MessageReaction,
        reactor: User,
        data: EventData
    ): Promise<void> {
        let msg = msgReaction.message;

        // Don't respond to reaction on client's message
        if (msg.author.id === msg.client.user.id) {
            return;
        }

        // Get author data
        let authorData = await DataUtils.getTargetData(msg.author, data.guild);

        // Get authors time zone
        let authorTimeZone =
            authorData instanceof GuildBotData
                ? this.botTimeZoneSetting.valueOrDefault(authorData)
                : this.userTimeZoneSetting.valueOrDefault(authorData);
        if (!authorTimeZone) {
            return;
        }

        let userTimeZone = this.userTimeZoneSetting.valueOrDefault(data.user);
        if (!userTimeZone) {
            await this.reminderService.sendReminder(reactor, msg, data);
            return;
        }

        let authorDateFormat =
            authorData instanceof GuildBotData
                ? this.botDateFormatSetting.valueOrDefault(authorData)
                : this.userDateFormatSetting.valueOrDefault(authorData);
        let input = msg.content || msg.embeds.map(embed => EmbedUtils.content(embed)).join('\n');
        let timeResults = this.timeService.parseResults(input, authorDateFormat, msg.createdAt);
        if (timeResults.length === 0) {
            return;
        }

        let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
        let formattedTimeResults = timeResults.map(result =>
            this.timeService.formatResult(
                result,
                authorTimeZone,
                userTimeZone,
                timeFormat,
                data.lang()
            )
        );

        let timeList = formattedTimeResults
            .map(result => {
                return Lang.getRef(
                    result.end ? 'lists.timeTextAndTimeWithEndItem' : 'lists.timeTextAndTimeItem',
                    data.lang(),
                    {
                        TIME_TEXT: result.text,
                        TIME_START: result.start,
                        TIME_END: result.end,
                    }
                );
            })
            .join('\n')
            .trim();

        let privateMode =
            authorData instanceof GuildBotData
                ? false
                : this.userPrivateModeSetting.valueOrDefault(authorData);
        await MessageUtils.send(
            reactor,
            Lang.getEmbed('displays.timeConversionDm', data.lang(), {
                USER: FormatUtils.userMention(msg.author.id),
                CHANNEL: FormatUtils.channelMention(msg.channel.id),
                TIME_ZONE_FROM: privateMode
                    ? Lang.getRef('other.private', data.lang())
                    : authorTimeZone,
                TIME_ZONE_TO: userTimeZone,
                TIME_LIST: timeList,
                MESSAGE_LINK: msg.url,
            }).setAuthor(msg.guild.name, msg.guild.iconURL())
        );
    }
}
