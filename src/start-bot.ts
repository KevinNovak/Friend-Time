import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { Options } from 'discord.js';
import { createRequire } from 'node:module';

import { Button } from './buttons/index.js';
import {
    BotCommand,
    Command,
    DevCommand,
    HelpCommand,
    InfoCommand,
    LinkCommand,
    ListCommand,
    MapCommand,
    MeCommand,
    ServerCommand,
    SetCommand,
    SetupCommand,
    TimeCommand,
    TranslateCommand,
} from './commands/index.js';
import { Database } from './database/database.js';
import {
    ButtonHandler,
    CommandHandler,
    GuildJoinHandler,
    GuildLeaveHandler,
    MessageHandler,
    ReactionHandler,
    TriggerHandler,
} from './events/index.js';
import { CustomClient } from './extensions/index.js';
import { Job } from './jobs/index.js';
import { Bot } from './models/bot.js';
import { ConvertReaction, Reaction } from './reactions/index.js';
import { JobService, Logger, ReminderService, TimeService } from './services/index.js';
import { BotDateFormatSetting, BotTimeZoneSetting } from './settings/bot/index.js';
import {
    GuildAutoDetectSetting,
    GuildLanguageSetting,
    GuildListSetting,
    GuildRemindersSetting,
    GuildTimeFormatSetting,
    GuildTimeZoneSetting,
} from './settings/guild/index.js';
import { SettingManager } from './settings/index.js';
import {
    UserDateFormatSetting,
    UserLanguageSetting,
    UserPrivateModeSetting,
    UserRemindersSetting,
    UserTimeFormatSetting,
    UserTimeZoneSetting,
} from './settings/user/index.js';
import { ConvertTrigger, OldPrefixTrigger, Trigger } from './triggers/index.js';

const require = createRequire(import.meta.url);
let Config = require('../config/config.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    // Database
    await Database.connect();

    // Database - Guild Settings
    let guildTimeZoneSetting = new GuildTimeZoneSetting();
    let guildTimeFormatSetting = new GuildTimeFormatSetting();
    let guildAutoDetectSetting = new GuildAutoDetectSetting();
    let guildListSetting = new GuildListSetting();
    let guildRemindersSetting = new GuildRemindersSetting();
    let guildLanguageSetting = new GuildLanguageSetting();
    let guildSettingManager = new SettingManager([
        guildTimeZoneSetting,
        guildTimeFormatSetting,
        guildAutoDetectSetting,
        guildListSetting,
        guildRemindersSetting,
        guildLanguageSetting,
    ]);

    // Database - Bot Settings
    let botTimeZoneSetting = new BotTimeZoneSetting();
    let botDateFormatSetting = new BotDateFormatSetting();
    let botSettingManager = new SettingManager([botTimeZoneSetting, botDateFormatSetting]);
    let botSetupSettingManager = new SettingManager([botTimeZoneSetting]);

    // Database - User Settings
    let userTimeZoneSetting = new UserTimeZoneSetting();
    let userDateFormatSetting = new UserDateFormatSetting();
    let userTimeFormatSetting = new UserTimeFormatSetting();
    let userPrivateModeSetting = new UserPrivateModeSetting();
    let userRemindersSetting = new UserRemindersSetting();
    let userLanguageSetting = new UserLanguageSetting();
    let userSettingManager = new SettingManager([
        userTimeZoneSetting,
        userDateFormatSetting,
        userTimeFormatSetting,
        userPrivateModeSetting,
        userRemindersSetting,
        userLanguageSetting,
    ]);
    let userSetupSettingManager = new SettingManager([userTimeZoneSetting]);

    // Services
    let timeService = new TimeService();
    let reminderService = new ReminderService(guildRemindersSetting, userRemindersSetting);

    // Client
    let client = new CustomClient({
        intents: Config.client.intents,
        partials: Config.client.partials,
        makeCache: Options.cacheWithLimits({
            // Keep default caching behavior
            ...Options.defaultMakeCacheSettings,
            // Override specific options from config
            ...Config.client.caches,
        }),
    });

    // Commands
    let commands: Command[] = [
        new BotCommand(botSettingManager),
        new DevCommand(),
        new HelpCommand(),
        new InfoCommand(),
        new LinkCommand(),
        new ListCommand(),
        new MapCommand(),
        new MeCommand(userSettingManager, userPrivateModeSetting),
        new ServerCommand(guildSettingManager),
        new SetCommand(userSetupSettingManager, botSetupSettingManager, userPrivateModeSetting),
        new SetupCommand(guildSettingManager),
        new TimeCommand(
            guildTimeZoneSetting,
            botTimeZoneSetting,
            userTimeZoneSetting,
            userTimeFormatSetting,
            userPrivateModeSetting
        ),
        new TranslateCommand(),
    ].sort((a, b) => (a.metadata.name > b.metadata.name ? 1 : -1));

    // Buttons
    let buttons: Button[] = [
        // TODO: Add new buttons here
    ];

    // Reactions
    let convertReaction = new ConvertReaction(
        timeService,
        reminderService,
        botTimeZoneSetting,
        botDateFormatSetting,
        userTimeZoneSetting,
        userDateFormatSetting,
        userTimeFormatSetting,
        userPrivateModeSetting
    );
    let reactions: Reaction[] = [convertReaction];

    // Triggers
    let triggers: Trigger[] = [
        new OldPrefixTrigger(),
        new ConvertTrigger(
            convertReaction,
            timeService,
            reminderService,
            guildAutoDetectSetting,
            guildListSetting,
            guildTimeFormatSetting,
            guildLanguageSetting,
            botTimeZoneSetting,
            botDateFormatSetting,
            userTimeZoneSetting,
            userDateFormatSetting,
            userPrivateModeSetting
        ),
    ];

    // Event handlers
    let guildJoinHandler = new GuildJoinHandler(guildLanguageSetting, userLanguageSetting);
    let guildLeaveHandler = new GuildLeaveHandler();
    let commandHandler = new CommandHandler(commands);
    let buttonHandler = new ButtonHandler(buttons);
    let triggerHandler = new TriggerHandler(triggers);
    let messageHandler = new MessageHandler(triggerHandler);
    let reactionHandler = new ReactionHandler(reactions);

    // Jobs
    let jobs: Job[] = [];

    // Bot
    let bot = new Bot(
        Config.client.token,
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        commandHandler,
        buttonHandler,
        reactionHandler,
        new JobService(jobs)
    );

    // Register
    if (process.argv[2] === '--register') {
        await registerCommands(commands);
        process.exit();
    } else if (process.argv[2] === '--clear') {
        await clearCommands();
        process.exit();
    }

    await bot.start();
}

async function registerCommands(commands: Command[]): Promise<void> {
    let cmdDatas = commands.map(cmd => cmd.metadata);
    let cmdNames = cmdDatas.map(cmdData => cmdData.name);

    Logger.info(
        Logs.info.commandsRegistering
            .replaceAll('{COMMAND_NAMES}', cmdNames.map(cmdName => `'${cmdName}'`).join(', '))
            .replaceAll('{CLIENT_ID}', Config.client.id)
    );

    try {
        let rest = new REST({ version: '10' }).setToken(Config.client.token);
        for (let cmdData of cmdDatas) {
            await rest.post(Routes.applicationCommands(Config.client.id), {
                body: cmdData,
            });
        }
    } catch (error) {
        Logger.error(Logs.error.commandsRegistering, error);
        return;
    }

    Logger.info(Logs.info.commandsRegistered);
}

async function clearCommands(): Promise<void> {
    Logger.info(Logs.info.commandsClearing.replaceAll('{CLIENT_ID}', Config.client.id));

    try {
        let rest = new REST({ version: '10' }).setToken(Config.client.token);
        await rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
    } catch (error) {
        Logger.error(Logs.error.commandsClearing, error);
        return;
    }

    Logger.info(Logs.info.commandsCleared);
}

process.on('unhandledRejection', (reason, _promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
