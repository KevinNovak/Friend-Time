import { ApplicationCommandData, CommandInteraction } from 'discord.js';

import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { MessageUtils } from '../utils';
import { Command } from './command';

export class MapCommand implements Command {
    public static data: ApplicationCommandData = {
        name: Lang.getCom('commands.map'),
        description: Lang.getCom('commandDescs.map'),
    };
    public name = MapCommand.data.name;
    public requireDev = false;
    public requireGuild = false;
    public requirePerms = [];

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        await MessageUtils.sendIntr(intr, Lang.getEmbed('displayEmbeds.map', data.lang()));
    }
}
