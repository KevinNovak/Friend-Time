import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';

import { HelpOption, InfoOption } from '../enums/index.js';
import { Language } from '../models/enum-helpers/language.js';
import { Lang } from '../services/index.js';

export class Args {
    public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getCom('arguments.option'),
        description: Lang.getRef('argDescs.helpOption', Language.Default),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('helpOptions.commands', Language.Default),
                value: HelpOption.COMMANDS,
            },
            // TODO: Implement once switched to slash command perms
            // {
            //     name: Lang.getRef('helpOptions.permissions', Language.Default),
            //     value: HelpOption.PERMISSIONS,
            // },
            // {
            //     name: Lang.getRef('helpOptions.faq', Language.Default),
            //     value: HelpOption.FAQ,
            // },
        ],
    };
    public static readonly INFO_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getCom('arguments.option'),
        description: Lang.getRef('argDescs.helpOption', Language.Default),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('infoOptions.about', Language.Default),
                value: InfoOption.ABOUT,
            },
            {
                name: Lang.getRef('infoOptions.translate', Language.Default),
                value: InfoOption.TRANSLATE,
            },
            {
                name: Lang.getRef('infoOptions.dev', Language.Default),
                value: InfoOption.DEV,
            },
        ],
    };
}
