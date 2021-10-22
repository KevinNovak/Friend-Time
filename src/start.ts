import { Options } from 'discord.js';

import { Bot } from './bot';
import {
    BotCommand,
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
import { ConvertReaction } from './reactions';
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
import { ConvertTrigger } from './triggers';

let Config = require('../config/config.json');
let Logs = require('../lang/logs.json');

async function start(): Promise<void> {
    await Database.connect();

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

    // Guild Settings
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

    // Bot Settings
    let botTimeZoneSetting = new BotTimeZoneSetting();
    let botDateFormatSetting = new BotDateFormatSetting();
    let botSettingManager = new SettingManager([botTimeZoneSetting, botDateFormatSetting]);
    let botSetupSettingManager = new SettingManager([botTimeZoneSetting]);

    // User Settings
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

    // Commands
    let botCommand = new BotCommand(botSettingManager);
    let devCommand = new DevCommand();
    let helpCommand = new HelpCommand();
    let infoCommand = new InfoCommand();
    let linkCommand = new LinkCommand();
    let listCommand = new ListCommand();
    let mapCommand = new MapCommand();
    let meCommand = new MeCommand(userSettingManager, userPrivateModeSetting);
    let serverCommand = new ServerCommand(guildSettingManager);
    let setCommand = new SetCommand(
        userSetupSettingManager,
        botSetupSettingManager,
        userPrivateModeSetting
    );
    let setupCommand = new SetupCommand(guildSettingManager);
    let timeCommand = new TimeCommand(
        guildTimeZoneSetting,
        botTimeZoneSetting,
        userTimeZoneSetting,
        userTimeFormatSetting,
        userPrivateModeSetting
    );
    let translateCommand = new TranslateCommand();

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

    // Triggers
    let convertTrigger = new ConvertTrigger(
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
    );

    // Event handlers
    let guildJoinHandler = new GuildJoinHandler(guildLanguageSetting, userLanguageSetting);
    let guildLeaveHandler = new GuildLeaveHandler();
    let commandHandler = new CommandHandler([
        // botCommand,
        devCommand,
        helpCommand,
        infoCommand,
        linkCommand,
        // listCommand,
        mapCommand,
        // meCommand,
        // serverCommand,
        // setCommand,
        // setupCommand,
        // timeCommand,
        translateCommand,
    ]);
    let triggerHandler = new TriggerHandler([convertTrigger]);
    let messageHandler = new MessageHandler(triggerHandler);
    let reactionHandler = new ReactionHandler([]);

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

    await bot.start();
}

process.on('unhandledRejection', (reason, promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
