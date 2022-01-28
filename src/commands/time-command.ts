import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ChatInputApplicationCommandData, CommandInteraction, PermissionString } from 'discord.js';
import { createRequire } from 'node:module';

import { GuildBotData } from '../database/entities/index.js';
import { EventData } from '../models/internal-models.js';
import { Lang } from '../services/index.js';
import { BotTimeZoneSetting } from '../settings/bot/index.js';
import { GuildTimeZoneSetting } from '../settings/guild/index.js';
import {
    UserPrivateModeSetting,
    UserTimeFormatSetting,
    UserTimeZoneSetting,
} from '../settings/user/index.js';
import {
    DataUtils,
    FormatUtils,
    InteractionUtils,
    TimeUtils,
    TimeZoneUtils,
} from '../utils/index.js';
import { Command, CommandDeferType } from './index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class TimeCommand implements Command {
    public metadata: ChatInputApplicationCommandData = {
        name: Lang.getCom('commands.time'),
        description: Lang.getRef('commandDescs.time', Lang.Default),
        options: [
            {
                name: Lang.getCom('subCommands.server'),
                description: Lang.getRef('commandDescs.timeServer', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.user'),
                description: Lang.getRef('commandDescs.timeUser', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.user'),
                        description: 'User or bot.',
                        type: ApplicationCommandOptionType.User.valueOf(),
                        required: true,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.zone'),
                description: Lang.getRef('commandDescs.timeZone', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
                options: [
                    {
                        name: Lang.getCom('arguments.zone'),
                        description: 'Time zone name. Ex: America/New_York',
                        type: ApplicationCommandOptionType.String.valueOf(),
                        required: true,
                    },
                ],
            },
        ],
    };
    public deferType = CommandDeferType.PUBLIC;
    public requireDev = false;
    public requireGuild = false;
    public requireClientPerms: PermissionString[] = [];
    public requireUserPerms: PermissionString[] = [];

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
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.serverOnlyCommand', data.lang())
                    );
                    return;
                }

                let guildTimeZone = this.guildTimeZoneSetting.valueOrDefault(data.guild);
                if (!guildTimeZone) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.noTimeZoneServer', data.lang())
                    );
                    return;
                }

                let now = TimeUtils.now(guildTimeZone);
                let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
                let time = FormatUtils.dateTime(now, timeFormat, data.lang());
                await InteractionUtils.send(
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
                    await InteractionUtils.send(
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
                    await InteractionUtils.send(
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
                await InteractionUtils.send(
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
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', data.lang())
                    );
                    return;
                }

                // Find time zone
                let timeZone = TimeZoneUtils.find(zoneInput)?.name;
                if (!timeZone) {
                    await InteractionUtils.send(
                        intr,
                        Lang.getEmbed('validationEmbeds.invalidTimeZone', data.lang())
                    );
                    return;
                }

                let now = TimeUtils.now(timeZone);
                let timeFormat = this.userTimeFormatSetting.valueOrDefault(data.user);
                let time = FormatUtils.dateTime(now, timeFormat, data.lang());
                await InteractionUtils.send(
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
