import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { Options } from 'discord.js';

import { Bot } from './bot';
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
} from './commands';
import { Database } from './database/database';
import {
    CommandHandler,
    GuildJoinHandler,
    GuildLeaveHandler,
    MessageHandler,
    ReactionHandler,
    TriggerHandler,
} from './events';
import { CustomClient } from './extensions';
import { ConvertReaction, Reaction } from './reactions';
import { JobService, Logger, ReminderService, TimeService } from './services';
import { SettingManager } from './settings';
import { BotDateFormatSetting, BotTimeZoneSetting } from './settings/bot';
import {
    GuildAutoDetectSetting,
    GuildLanguageSetting,
    GuildListSetting,
    GuildRemindersSetting,
    GuildTimeFormatSetting,
    GuildTimeZoneSetting,
} from './settings/guild';
import {
    UserDateFormatSetting,
    UserLanguageSetting,
    UserPrivateModeSetting,
    UserRemindersSetting,
    UserTimeFormatSetting,
    UserTimeZoneSetting,
} from './settings/user';
import { ConvertTrigger, OldPrefixTrigger, Trigger } from './triggers';

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
    let triggerHandler = new TriggerHandler(triggers);
    let messageHandler = new MessageHandler(triggerHandler);
    let reactionHandler = new ReactionHandler(reactions);

    // Bot
    let bot = new Bot(
        Config.client.token,
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        commandHandler,
        reactionHandler,
        new JobService([])
    );

    // Register
    if (process.argv[2] === '--register') {
        await registerCommands(commands);
        process.exit();
    }

    await bot.start();
}

async function registerCommands(commands: Command[]): Promise<void> {
    let cmdDatas = commands.map(cmd => cmd.metadata);
    let cmdNames = cmdDatas.map(cmdData => cmdData.name);

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
        return;
    }

    Logger.info(Logs.info.commandsRegistered);
}

process.on('unhandledRejection', (reason, promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
