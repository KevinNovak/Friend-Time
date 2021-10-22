import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ApplicationCommandData } from 'discord.js';

import {
    // BotCommand,
    DevCommand,
    HelpCommand,
    InfoCommand,
    LinkCommand,
    // ListCommand,
    MapCommand,
    // MeCommand,
    // ServerCommand,
    // SetCommand,
    // SetupCommand,
    // TimeCommand,
    TranslateCommand,
} from './commands';
import { Logger } from './services';

let Config = require('../config/config.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    let cmdDatas: ApplicationCommandData[] = [
        // BotCommand.data,
        DevCommand.data,
        HelpCommand.data,
        InfoCommand.data,
        LinkCommand.data,
        // ListCommand.data,
        MapCommand.data,
        // MeCommand.data,
        // ServerCommand.data,
        // SetCommand.data,
        // SetupCommand.data,
        // TimeCommand.data,
        TranslateCommand.data,
    ].sort((a, b) => (a.name > b.name ? 1 : -1));

    let cmdNames = cmdDatas.map(cmdInfo => cmdInfo.name);

    Logger.info(
        Logs.info.commandsRegistering.replaceAll(
            '{COMMAND_NAMES}',
            cmdNames.map(cmdName => `'${cmdName}'`).join(', ')
        )
    );

    try {
        let rest = new REST({ version: '9' }).setToken(Config.client.token);
        await rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
        await rest.put(Routes.applicationCommands(Config.client.id), { body: cmdDatas });
    } catch (error) {
        Logger.error(Logs.error.commandsRegistering, error);
    }

    Logger.info(Logs.info.commandsRegistered);
}

process.on('unhandledRejection', (reason, promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
