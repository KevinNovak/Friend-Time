import { ApplicationCommandOptionType } from 'discord-api-types';
import { ApplicationCommandData, CommandInteraction, Permissions } from 'discord.js';
import { GuildData, GuildListItemData } from '../database/entities';

import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { DataUtils, MessageUtils, TimeZoneUtils } from '../utils';
import { Command } from './command';

let Config = require('../../config/config.json');

export class ListCommand implements Command {
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('commands.list'),
        description: Lang.getRef('commandDescs.list', Lang.Default),
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.listView', Lang.Default),
                type: ApplicationCommandOptionType.Subcommand.valueOf(),
            },
            {
                name: Lang.getCom('subCommands.toggle'),
                description: Lang.getRef('commandDescs.listToggle', Lang.Default),
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
    public requireDev = false;
    public requireGuild = true;
    public requireUserPerms = [Permissions.FLAGS.MANAGE_GUILD];

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        switch (intr.options.getSubcommand()) {
            case Lang.getCom('subCommands.view'): {
                let guildTimeZones = DataUtils.getTimeZoneList(data.guild);
                let timeZoneList =
                    guildTimeZones.length > 0
                        ? guildTimeZones
                              .map(timeZone =>
                                  Lang.getRef('lists.timeZoneItem', data.lang(), {
                                      TIME_ZONE: timeZone,
                                  })
                              )
                              .join('\n')
                              .trim()
                        : Lang.getRef('lists.timeZoneNone', data.lang());

                await MessageUtils.sendIntr(
                    intr,
                    Lang.getEmbed('displayEmbeds.listTimeZone', data.lang(), {
                        TIME_ZONE_LIST: timeZoneList,
                    }).setAuthor({ name: intr.guild?.name, iconURL: intr.guild?.iconURL() })
                );
                return;
            }
            case Lang.getCom('subCommands.toggle'): {
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

                let listItem = data.guild?.listItems.find(
                    listItem => listItem.timeZone === timeZone
                );
                if (listItem) {
                    await listItem.remove();
                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('resultEmbeds.removedListItem', data.lang(), {
                            TIME_ZONE: timeZone,
                        })
                    );
                    return;
                } else {
                    if (data.guild?.listItems.length >= Config.validation.timeZones.countMax) {
                        await MessageUtils.sendIntr(
                            intr,
                            Lang.getEmbed('validationEmbeds.maxLimitList', data.lang(), {
                                TIME_ZONE: timeZone,
                            })
                        );
                        return;
                    }

                    // Save guild if not already in database
                    if (!data.guild) {
                        data.guild = new GuildData();
                        data.guild.discordId = intr.guild?.id;
                        data.guild = await data.guild.save();
                    }

                    listItem = new GuildListItemData();
                    listItem.guild = data.guild;
                    listItem.timeZone = timeZone;
                    await listItem.save();

                    await MessageUtils.sendIntr(
                        intr,
                        Lang.getEmbed('resultEmbeds.addedListItem', data.lang(), {
                            TIME_ZONE: timeZone,
                        })
                    );
                    return;
                }
            }
        }
    }
}
