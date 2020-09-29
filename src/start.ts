import { Client, ClientOptions, IntentsString, PartialTypes } from 'discord.js';
import { MultilingualService } from 'discord.js-multilingual-utils';
import path from 'path';

import { Bot } from './bot';
import {
    ClearCommand,
    ConfigCommand,
    DonateCommand,
    FormatCommand,
    HelpCommand,
    InfoCommand,
    InviteCommand,
    MapCommand,
    SetCommand,
    SupportCommand,
    TimeCommand,
} from './commands';
import { GuildJoinHandler, GuildLeaveHandler, MessageHandler, ReactionHandler } from './events';
import { ConfigSchema } from './models/config-models';
import { GuildRepo, UserRepo } from './repos';
import {
    Logger,
    MessageSender,
    ReminderService,
    TimeFormatService,
    TimeParser,
    ZoneService,
} from './services';
import { DataAccess } from './services/database/data-access';
import { LanguageService } from './services/language';

let Config: ConfigSchema = require('../config/config.json');

async function start(): Promise<void> {
    let clientOptions: ClientOptions = {
        ws: { intents: Config.client.intents as IntentsString[] },
        partials: Config.client.partials as PartialTypes[],
        messageCacheMaxSize: Config.client.caches.messages.size,
        messageCacheLifetime: Config.client.caches.messages.lifetime,
        messageSweepInterval: Config.client.caches.messages.sweepInterval,
    };

    // Dependency Injection
    let multilingualService = new MultilingualService(path.join(__dirname, '../lang'));
    let langService = new LanguageService(multilingualService);
    let client = new Client(clientOptions);
    let dataAccess = new DataAccess(Config.mysql);
    let guildRepo = new GuildRepo(dataAccess);
    let userRepo = new UserRepo(dataAccess);
    let msgSender = new MessageSender(langService);
    let timeParser = new TimeParser(Config.experience.blacklist);
    let zoneService = new ZoneService(Config.validation.regions, timeParser);
    let timeFormatService = new TimeFormatService(Config.experience.timeFormats);
    let reminderService = new ReminderService(msgSender);
    let helpCommand = new HelpCommand(msgSender);
    let setCommand = new SetCommand(msgSender, zoneService, userRepo);
    let mapCommand = new MapCommand(msgSender);
    let clearCommand = new ClearCommand(msgSender, userRepo);
    let timeCommand = new TimeCommand(msgSender, zoneService, timeFormatService, userRepo);
    let formatCommand = new FormatCommand(msgSender, userRepo, timeFormatService);
    let configCommand = new ConfigCommand(msgSender, guildRepo);
    let infoCommand = new InfoCommand(msgSender);
    let inviteCommand = new InviteCommand(msgSender);
    let supportCommand = new SupportCommand(msgSender);
    let donateCommand = new DonateCommand(msgSender);
    let guildJoinHandler = new GuildJoinHandler();
    let guildLeaveHandler = new GuildLeaveHandler();
    let messageHandler = new MessageHandler(
        Config.prefix,
        Config.emojis.convert,
        helpCommand,
        [
            setCommand,
            mapCommand,
            clearCommand,
            timeCommand,
            formatCommand,
            configCommand,
            infoCommand,
            inviteCommand,
            supportCommand,
            donateCommand,
        ],
        guildRepo,
        userRepo,
        msgSender,
        timeParser,
        zoneService,
        timeFormatService,
        reminderService
    );
    let reactionHandler = new ReactionHandler(
        Config.emojis.convert,
        msgSender,
        timeParser,
        zoneService,
        timeFormatService,
        guildRepo,
        userRepo
    );
    let bot = new Bot(
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        reactionHandler,
        Config.client.token
    );
    await bot.start();
}

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled promise rejection.', reason);
});

start();
