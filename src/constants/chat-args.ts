import {
    APIApplicationCommandBasicOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';

import { HelpOption, InfoOption } from '../enums/index.js';
import { Lang } from '../services/index.js';

export class ChatArgs {
    public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getCom('arguments.option'),
        description: Lang.getRef('argDescs.helpOption', Lang.Default),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('helpOptions.commands', Lang.Default),
                value: HelpOption.COMMANDS,
            },
            // TODO: Implement once switched to slash command perms
            // {
            //     name: Lang.getRef('helpOptions.permissions', Lang.Default),
            //     value: HelpOption.PERMISSIONS,
            // },
            // {
            //     name: Lang.getRef('helpOptions.faq', Lang.Default),
            //     value: HelpOption.FAQ,
            // },
        ],
    };
    public static readonly INFO_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getCom('arguments.option'),
        description: Lang.getRef('argDescs.helpOption', Lang.Default),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('infoOptions.about', Lang.Default),
                value: InfoOption.ABOUT,
            },
            {
                name: Lang.getRef('infoOptions.translate', Lang.Default),
                value: InfoOption.TRANSLATE,
            },
            {
                name: Lang.getRef('infoOptions.dev', Lang.Default),
                value: InfoOption.DEV,
            },
        ],
    };
}
