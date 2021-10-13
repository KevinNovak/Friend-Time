import { Message, TextChannel } from 'discord.js';

import { GuildBotData } from '../database/entities';
import { LangCode } from '../models/enums';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { BotTimeZoneSetting } from '../settings/bot';
import { GuildTimeZoneSetting } from '../settings/guild';
import {
    UserPrivateModeSetting,
    UserTimeFormatSetting,
    UserTimeZoneSetting,
} from '../settings/user';
import {
    ClientUtils,
    DataUtils,
    FormatUtils,
    MessageUtils,
    TimeUtils,
    TimeZoneUtils,
} from '../utils';
import { Command } from './command';

export class TimeCommand implements Command {
    public requireDev = false;
    public requireGuild = false;
    public requirePerms = [];

    constructor(
        private guildTimeZoneSetting: GuildTimeZoneSetting,
        private botTimeZoneSetting: BotTimeZoneSetting,
        private userTimeZoneSetting: UserTimeZoneSetting,
        private userTimeFormatSetting: UserTimeFormatSetting,
        private userPrivateModeSetting: UserPrivateModeSetting
    ) {}

    public keyword(langCode: LangCode): string {
        return Lang.getRef('commands.time', langCode);
    }

    public regex(langCode: LangCode): RegExp {
        return Lang.getRegex('commandRegexes.time', langCode);
    }

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        // Time for server
        if (args.length === 2) {
            if (!(msg.channel instanceof TextChannel)) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.serverOnlyCommand', data.lang())
                );
                return;
            }

            let guildTimeZone = this.guildTimeZoneSetting.valueOrDefault(data.guild);
            if (!guildTimeZone) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.noTimeZoneServer', data.lang())
                );
                return;
            }

            let now = TimeUtils.now(guildTimeZone);
            let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
            let time = FormatUtils.dateTime(now, timeFormat, data.lang());
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('displayEmbeds.timeServer', data.lang(), {
                    TIME: time,
                    TIME_ZONE: guildTimeZone,
                })
            );
            return;
        }

        if (args.length > 2) {
            let search = args.slice(2).join(' ');

            // Time for zone
            let timeZone = TimeZoneUtils.find(search)?.name;
            if (timeZone) {
                let now = TimeUtils.now(timeZone);
                let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
                let time = FormatUtils.dateTime(now, timeFormat, data.lang());
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('displayEmbeds.timeTimeZone', data.lang(), {
                        TIME: time,
                        TIME_ZONE: timeZone,
                    })
                );
                return;
            }

            if (!(msg.channel instanceof TextChannel)) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.serverOnlyCommand', data.lang())
                );
                return;
            }

            let member = await ClientUtils.findMember(msg.guild, search);
            if (!member) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.notFoundUser', data.lang())
                );
                return;
            }

            // Time for member
            let memberData = await DataUtils.getTargetData(member.user, data.guild);
            let memberTimeZone =
                memberData instanceof GuildBotData
                    ? this.botTimeZoneSetting.valueOrDefault(memberData)
                    : this.userTimeZoneSetting.valueOrDefault(memberData);
            if (!memberTimeZone) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.noTimeZoneUser', data.lang(), {
                        USER: FormatUtils.userMention(member.id),
                    })
                );
                return;
            }

            let now = TimeUtils.now(memberTimeZone);
            let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
            let time = FormatUtils.dateTime(now, timeFormat, data.lang());
            let privateMode =
                memberData instanceof GuildBotData
                    ? false
                    : this.userPrivateModeSetting.valueOrDefault(memberData);
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed(
                    privateMode ? 'displayEmbeds.timeUserPrivate' : 'displayEmbeds.timeUser',
                    data.lang(),
                    {
                        TIME: time,
                        USER: FormatUtils.userMention(member.id),
                        TIME_ZONE: memberTimeZone,
                    }
                )
            );
        }
    }
}
