import { ApplicationCommandData, Message, Permissions } from 'discord.js';
import { GuildData, GuildListItemData } from '../database/entities';

import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { DataUtils, MessageUtils, TimeZoneUtils } from '../utils';
import { Command } from './command';

let Config = require('../../config/config.json');

export class ListCommand {
    // export class ListCommand implements Command {
    public static data: ApplicationCommandData = {
        name: Lang.getCom('commands.list'),
        description: Lang.getCom('commandDescs.list'),
    };
    public requireDev = false;
    public requireGuild = true;
    public requirePerms = [Permissions.FLAGS.MANAGE_GUILD];

    public async execute(msg: Message, args: string[], data: EventData): Promise<void> {
        // Display list of time zones
        if (args.length === 2) {
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

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('displayEmbeds.listTimeZone', data.lang(), {
                    TIME_ZONE_LIST: timeZoneList,
                }).setAuthor(msg.guild.name, msg.guild.iconURL())
            );
            return;
        }

        // Check if abbreviation was provided
        let timeZoneInput = args.slice(2).join(' ');
        if (timeZoneInput.length < Config.validation.timeZone.lengthMin) {
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('validationEmbeds.notAllowedAbbreviation', data.lang())
            );
            return;
        }

        // Find time zone
        let timeZone = TimeZoneUtils.find(timeZoneInput)?.name;
        if (!timeZone) {
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('validationEmbeds.invalidTimeZone', data.lang())
            );
            return;
        }

        let listItem = data.guild?.listItems.find(listItem => listItem.timeZone === timeZone);
        if (listItem) {
            await listItem.remove();
            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('resultEmbeds.removedListItem', data.lang(), { TIME_ZONE: timeZone })
            );
            return;
        } else {
            if (data.guild?.listItems.length >= Config.validation.timeZones.countMax) {
                await MessageUtils.send(
                    msg.channel,
                    Lang.getEmbed('validationEmbeds.maxLimitList', data.lang(), {
                        TIME_ZONE: timeZone,
                    })
                );
                return;
            }

            // Save guild if not already in database
            if (!data.guild) {
                data.guild = new GuildData();
                data.guild.discordId = msg.guild.id;
                data.guild = await data.guild.save();
            }

            listItem = new GuildListItemData();
            listItem.guild = data.guild;
            listItem.timeZone = timeZone;
            await listItem.save();

            await MessageUtils.send(
                msg.channel,
                Lang.getEmbed('resultEmbeds.addedListItem', data.lang(), { TIME_ZONE: timeZone })
            );
            return;
        }
    }
}
