import { ApplicationCommandOptionType } from 'discord-api-types';
import { ApplicationCommandData, CommandInteraction } from 'discord.js';

import { GuildBotData } from '../database/entities';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { BotTimeZoneSetting } from '../settings/bot';
import { GuildTimeZoneSetting } from '../settings/guild';
import {
    UserPrivateModeSetting,
    UserTimeFormatSetting,
    UserTimeZoneSetting,
} from '../settings/user';
import { DataUtils, FormatUtils, MessageUtils, TimeUtils, TimeZoneUtils } from '../utils';
import { Command } from './command';

export class TimeCommand implements Command {
    public data: ApplicationCommandData = {
        name: Lang.getCom('commands.time'),
        description: Lang.getCom('commandDescs.time'),
        options: [
            {
                name: 'server',
                description: 'server', // TODO: Description
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: 'user',
                description: 'user', // TODO: Description
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: 'user',
                        description: 'user', // TODO: Description
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                ],
            },
            {
                name: 'zone',
                description: 'zone', // TODO: Description
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: 'zone',
                        description: 'zone', // TODO: Description
                        type: ApplicationCommandOptionType.String.valueOf(),
                        required: true,
                    },
                ],
            },
        ],
    };
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

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        switch (intr.options.getSubcommand()) {
            case 'server': {
                if (!intr.guild) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.serverOnlyCommand', data.lang())
                    );
                    return;
                }

                let guildTimeZone = this.guildTimeZoneSetting.valueOrDefault(data.guild);
                if (!guildTimeZone) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.noTimeZoneServer', data.lang())
                    );
                    return;
                }

                let now = TimeUtils.now(guildTimeZone);
                let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
                let time = FormatUtils.dateTime(now, timeFormat, data.lang());
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('displayEmbeds.timeServer', data.lang(), {
                        TIME: time,
                        TIME_ZONE: guildTimeZone,
                    })
                );
                return;
            }
            case 'user': {
                let user = intr.options.getUser('user');
                if (!user) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.notFoundUser', data.lang())
                    );
                    return;
                }

                let userData = await DataUtils.getTargetData(user, data.guild);
                let userTimeZone =
                    userData instanceof GuildBotData
                        ? this.botTimeZoneSetting.valueOrDefault(userData)
                        : this.userTimeZoneSetting.valueOrDefault(userData);
                if (!userTimeZone) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.noTimeZoneUser', data.lang(), {
                            USER: FormatUtils.userMention(user.id),
                        })
                    );
                    return;
                }

                let now = TimeUtils.now(userTimeZone);
                let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
                let time = FormatUtils.dateTime(now, timeFormat, data.lang());
                let privateMode =
                    userData instanceof GuildBotData
                        ? false
                        : this.userPrivateModeSetting.valueOrDefault(userData);
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed(
                        privateMode ? 'displayEmbeds.timeUserPrivate' : 'displayEmbeds.timeUser',
                        data.lang(),
                        {
                            TIME: time,
                            USER: FormatUtils.userMention(user.id),
                            TIME_ZONE: userTimeZone,
                        }
                    )
                );
                return;
            }
            case 'zone': {
                let zoneInput = intr.options.getString('zone');
                let timeZone = TimeZoneUtils.find(zoneInput)?.name;
                if (!timeZone) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.invalidTimeZone', data.lang())
                    );
                    return;
                }

                let now = TimeUtils.now(timeZone);
                let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
                let time = FormatUtils.dateTime(now, timeFormat, data.lang());
                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('displayEmbeds.timeTimeZone', data.lang(), {
                        TIME: time,
                        TIME_ZONE: timeZone,
                    })
                );
                return;
            }
        }
    }
}
