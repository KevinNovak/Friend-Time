import { User } from 'discord.js';

import { TimeZoneUtils } from '.';
import { GuildBotData, GuildData, UserData } from '../database/entities';

let Config = require('../../config/config.json');

export class DataUtils {
    public static async getTargetData(
        user: User,
        guildData?: GuildData
    ): Promise<UserData | GuildBotData> {
        if (user.bot) {
            return guildData?.bots.find(botData => botData.discordId === user.id);
        } else {
            return UserData.findOne({ discordId: user.id });
        }
    }

    public static getTimeZoneList(guildData?: GuildData): string[] {
        return TimeZoneUtils.sort(
            guildData?.listItems
                .slice(0, Config.validation.timeZones.countMax)
                .map(listItem => listItem.timeZone) ?? []
        );
    }
}
