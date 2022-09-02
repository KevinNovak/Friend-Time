import {
    APIApplicationCommandBasicOption,
    ApplicationCommandOptionType,
} from 'discord-api-types/v10';

import { HelpOption, InfoOption } from '../enums/index.js';
import { Lang } from '../services/index.js';

export class ChatArgs {
    public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.option', Lang.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.option'),
        description: Lang.getRef('argDescs.helpOption', Lang.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('helpOptions.commands', Lang.Default),
                name_localizations: Lang.getRefLocalizationMap('helpOptions.commands'),
                value: HelpOption.COMMANDS,
            },
            // TODO: Implement once switched to slash command perms
            // {
            //     name: Lang.getRef('helpOptions.permissions', Lang.Default),
            //     name_localizations: Lang.getRefLocalizationMap('helpOptions.permissions'),
            //     value: HelpOption.PERMISSIONS,
            // },
            // {
            //     name: Lang.getRef('helpOptions.faq', Lang.Default),
            //     name_localizations: Lang.getRefLocalizationMap('helpOptions.faq'),
            //     value: HelpOption.FAQ,
            // },
        ],
    };
    public static readonly INFO_OPTION: APIApplicationCommandBasicOption = {
        name: Lang.getRef('arguments.option', Lang.Default),
        name_localizations: Lang.getRefLocalizationMap('arguments.option'),
        description: Lang.getRef('argDescs.helpOption', Lang.Default),
        description_localizations: Lang.getRefLocalizationMap('argDescs.helpOption'),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: Lang.getRef('infoOptions.about', Lang.Default),
                name_localizations: Lang.getRefLocalizationMap('infoOptions.about'),
                value: InfoOption.ABOUT,
            },
            {
                name: Lang.getRef('infoOptions.translate', Lang.Default),
                name_localizations: Lang.getRefLocalizationMap('infoOptions.translate'),
                value: InfoOption.TRANSLATE,
            },
            {
                name: Lang.getRef('infoOptions.dev', Lang.Default),
                name_localizations: Lang.getRefLocalizationMap('infoOptions.dev'),
                value: InfoOption.DEV,
            },
        ],
    };
}
