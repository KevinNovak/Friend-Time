import { ApplicationCommandData, CommandInteraction, PermissionString } from 'discord.js';

import { Command, CommandDeferType } from '.';
import { EventData } from '../models/internal-models';
import { Lang } from '../services';
import { MessageUtils } from '../utils';

export class MapCommand implements Command {
    public metadata: ApplicationCommandData = {
        name: Lang.getCom('commands.map'),
        description: Lang.getRef('commandDescs.map', Lang.Default),
    };
    public deferType = CommandDeferType.PUBLIC;
    public requireDev = false;
    public requireGuild = false;
    public requireClientPerms: PermissionString[] = [];
    public requireUserPerms: PermissionString[] = [];

    public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
        await MessageUtils.sendIntr(intr, Lang.getEmbed('displayEmbeds.linkMap', data.lang()));
    }
}
