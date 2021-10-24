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

let Config = require('../../config/config.json');

export class TimeCommand implements Command {
    public data: ApplicationCommandData = {
        name: Lang.getCom('commands.time'),
        description: Lang.getCom('commandDescs.time'),
        options: [
            {
                name: Lang.getCom('subCommands.server'),
                description: 'View the time of the server.',
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.user'),
                description: ' View the time of a user.',
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.user'),
                        description: 'User.',
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.zone'),
                description: 'View the time of a zone.',
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.zone'),
                        description: 'Time zone name.',
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
            case Lang.getCom('subCommands.server'): {
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
            case Lang.getCom('subCommands.user'): {
                let user = intr.options.getUser(Lang.getCom('arguments.user'));
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
            case Lang.getCom('subCommands.zone'): {
                let zoneInput = intr.options.getString(Lang.getCom('arguments.zone'));

                // Check if abbreviation was provided
                if (zoneInput.length < Config.validation.timeZone.lengthMin) {
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', data.lang())
                    );
                    return;
                }

                // Find time zone
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
