import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { HelpOption } from '../../enums/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';

export class HelpCommand implements Command {
    public names = [Lang.getCom('chatCommands.help')];
    public deferType = CommandDeferType.PUBLIC;
    public requireClientPerms: PermissionsString[] = [];
    public requireUserPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            option: intr.options.getString(Lang.getCom('arguments.option')) as HelpOption,
        };

        let embed: EmbedBuilder;
        switch (args.option) {
            case HelpOption.COMMANDS: {
                embed = Lang.getEmbed('displayEmbeds.commands', data.lang);
                break;
            }
            case HelpOption.PERMISSIONS: {
                embed = Lang.getEmbed('displayEmbeds.permissions', data.lang);
                break;
            }
            case HelpOption.FAQ: {
                embed = Lang.getEmbed('displayEmbeds.faq', data.lang);
                break;
            }
            default: {
                return;
            }
        }

        await InteractionUtils.send(intr, embed);
    }
}
