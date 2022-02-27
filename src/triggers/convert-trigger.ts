import { ParsedResult } from 'chrono-node';
import { Message, MessageEmbed } from 'discord.js';
import { createRequire } from 'node:module';

import { GuildBotData } from '../database/entities/index.js';
import { DateFormatOption } from '../enums/index.js';
import { EventData } from '../models/internal-models.js';
import { ConvertReaction } from '../reactions/index.js';
import { Lang, ReminderService, TimeService } from '../services/index.js';
import { BotDateFormatSetting, BotTimeZoneSetting } from '../settings/bot/index.js';
import {
    GuildAutoDetectSetting,
    GuildLanguageSetting,
    GuildListSetting,
    GuildTimeFormatSetting,
} from '../settings/guild/index.js';
import {
    UserDateFormatSetting,
    UserPrivateModeSetting,
    UserTimeZoneSetting,
} from '../settings/user/index.js';
import { DataUtils, MessageUtils, PermissionUtils } from '../utils/index.js';
import { Trigger } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class ConvertTrigger implements Trigger {
    public requireGuild = true;

    constructor(
        private convertReaction: ConvertReaction,
        private timeService: TimeService,
        private reminderService: ReminderService,
        private guildAutoDetectSetting: GuildAutoDetectSetting,
        private guildListSetting: GuildListSetting,
        private guildTimeFormatSetting: GuildTimeFormatSetting,
        private guildLanguageSetting: GuildLanguageSetting,
        private botTimeZoneSetting: BotTimeZoneSetting,
        private botDateFormatSetting: BotDateFormatSetting,
        private userTimeZoneSetting: UserTimeZoneSetting,
        private userDateFormatSetting: UserDateFormatSetting,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public triggered(msg: Message): boolean {
        // Check prerequisite permissions needed for execute
        if (
            !(PermissionUtils.canReact(msg.channel) || PermissionUtils.canSend(msg.channel, true))
        ) {
            return false;
        }

        let input = MessageUtils.content(msg);
        let timeResults = this.timeService.parseResults(
            input,
            // Hard-coded just for performance with detecting time
            DateFormatOption.MONTH_DAY,
            msg.createdAt
        );
        return timeResults.length > 0;
    }

    public async execute(msg: Message, data: EventData): Promise<void> {
        // Check auto-detect or if message contains the required emoji for manual conversions
        let autoDetect = this.guildAutoDetectSetting.valueOrDefault(data.guild);
        if (!(autoDetect || msg.content.includes(Config.reactions.convert))) {
            return;
        }

        // Get author data
        let authorData = await DataUtils.getTargetData(msg.author, data.guild);

        // Get authors time zone
        // TODO: Use this format in other places where relevant
        let authorTimeZone =
            authorData instanceof GuildBotData
                ? this.botTimeZoneSetting.valueOrDefault(authorData)
                : this.userTimeZoneSetting.valueOrDefault(authorData);
        if (!authorTimeZone) {
            await this.reminderService.sendReminder(msg.author, msg, data);
            return;
        }

        // 1. React to message
        if (PermissionUtils.canReact(msg.channel)) {
            await MessageUtils.react(msg, this.convertReaction.emoji);
        }

        // 2. Send trigger message
        let listEnabled = this.guildListSetting.valueOrDefault(data.guild);
        if (
            listEnabled &&
            data.guild?.listItems.length > 0 &&
            PermissionUtils.canSend(msg.channel, true)
        ) {
            let authorDateFormat =
                authorData instanceof GuildBotData
                    ? this.botDateFormatSetting.valueOrDefault(authorData)
                    : this.userDateFormatSetting.valueOrDefault(authorData);

            // We need to re-parse the results here with the authors date format
            let input = MessageUtils.content(msg);
            let timeResults = this.timeService.parseResults(input, authorDateFormat, msg.createdAt);
            let privateMode =
                authorData instanceof GuildBotData
                    ? false
                    : this.userPrivateModeSetting.valueOrDefault(authorData);
            if (timeResults.length > 0) {
                let embed = this.getConversionEmbed(timeResults, authorTimeZone, privateMode, data);
                await MessageUtils.send(msg.channel, embed);
            }
        }
    }

    private getConversionEmbed(
        timeResults: ParsedResult[],
        timeZoneFrom: string,
        privateMode: boolean,
        data: EventData
    ): MessageEmbed {
        let guildLangCode = this.guildLanguageSetting.valueOrDefault(data.guild);
        let guildTimeFormat = this.guildTimeFormatSetting.valueOrDefault(data.guild);

        let timeTextList = timeResults
            .map((result, index) =>
                Lang.getRef(
                    timeResults.length === 1 ? 'lists.timeTextItem' : 'lists.timeTextWithPosItem',
                    guildLangCode,
                    {
                        POSITION: (index + 1).toLocaleString(),
                        TIME_TEXT: this.timeService.formatTimeText(result.text),
                    }
                )
            )
            .join('\n')
            .trim();

        let embed = Lang.getEmbed('displayEmbeds.timeConversionGuild', guildLangCode, {
            TIME_ZONE_FROM: privateMode ? Lang.getRef('other.private', data.lang()) : timeZoneFrom,
            TIME_TEXT_LIST: timeTextList,
        });

        let timeZoneTos = DataUtils.getTimeZoneList(data.guild);
        for (let timeZoneTo of timeZoneTos) {
            let formattedTimeResults = timeResults.map(result =>
                this.timeService.formatResult(
                    result,
                    timeZoneFrom,
                    timeZoneTo,
                    guildTimeFormat,
                    guildLangCode
                )
            );

            let timeList = formattedTimeResults
                .map((result, index) =>
                    Lang.getRef(
                        formattedTimeResults.length === 1
                            ? result.end
                                ? 'lists.timeWithEndItem'
                                : 'lists.timeItem'
                            : result.end
                            ? 'lists.timeWithPosAndEndItem'
                            : 'lists.timeWithPosItem',
                        guildLangCode,
                        {
                            POSITION: (index + 1).toLocaleString(),
                            TIME_START: result.start,
                            TIME_END: result.end,
                        }
                    )
                )
                .join('\n')
                .trim();

            embed.addField(timeZoneTo, timeList);
        }

        return embed;
    }
}
