import { REST } from '@discordjs/rest';
import { Options, Partials } from 'discord.js';
import { createRequire } from 'node:module';

import { Button } from './buttons/index.js';
import {
    BotCommand,
    HelpCommand,
    InfoCommand,
    ListCommand,
    MapCommand,
    MeCommand,
    ServerCommand,
    SetCommand,
    SetupCommand,
    TimeCommand,
} from './commands/chat/index.js';
import {
    ChatCommandMetadata,
    Command,
    MessageCommandMetadata,
    UserCommandMetadata,
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
import {
    CommandRegistrationService,
    EventDataService,
    JobService,
    Logger,
    ReminderService,
    TimeService,
} from './services/index.js';
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
    let eventDataService = new EventDataService();
    let timeService = new TimeService();
    let reminderService = new ReminderService(guildRemindersSetting, userRemindersSetting);

    // Client
    let client = new CustomClient({
        intents: Config.client.intents,
        partials: (Config.client.partials as string[]).map(partial => Partials[partial]),
        makeCache: Options.cacheWithLimits({
            // Keep default caching behavior
            ...Options.DefaultMakeCacheSettings,
            // Override specific options from config
            ...Config.client.caches,
        }),
    });

    // Commands
    let commands: Command[] = [
        // Chat Commands
        new BotCommand(botSettingManager),
        new HelpCommand(),
        new InfoCommand(),
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
    ];

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
    let guildJoinHandler = new GuildJoinHandler(eventDataService);
    let guildLeaveHandler = new GuildLeaveHandler();
    let commandHandler = new CommandHandler(commands, eventDataService);
    let buttonHandler = new ButtonHandler(buttons, eventDataService);
    let triggerHandler = new TriggerHandler(triggers, eventDataService);
    let messageHandler = new MessageHandler(triggerHandler);
    let reactionHandler = new ReactionHandler(reactions, eventDataService);

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
    if (process.argv[2] == 'commands') {
        try {
            let rest = new REST({ version: '10' }).setToken(Config.client.token);
            let commandRegistrationService = new CommandRegistrationService(rest);
            let localCmds = [
                ...Object.values(ChatCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
                ...Object.values(MessageCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
                ...Object.values(UserCommandMetadata).sort((a, b) => (a.name > b.name ? 1 : -1)),
            ];
            await commandRegistrationService.process(localCmds, process.argv);
        } catch (error) {
            Logger.error(Logs.error.commandAction, error);
        }
        // Wait for any final logs to be written.
        await new Promise(resolve => setTimeout(resolve, 1000));
        process.exit();
    }

    await bot.start();
}

process.on('unhandledRejection', (reason, _promise) => {
    Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
    Logger.error(Logs.error.unspecified, error);
});
