import { Client, ClientOptions, IntentsString, PartialTypes } from 'discord.js';

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
import { Config } from './models/config-models';
import { InternalLanguage } from './models/internal-language';
import { Language } from './models/language';
import { GuildRepo, UserRepo } from './repos';
import {
    Logger,
    MessageBuilder,
    MessageSender,
    ReminderService,
    TimeFormatService,
    TimeParser,
    ZoneService,
} from './services';
import { DataAccess } from './services/database/data-access';
import { LanguageService } from './services/language';

let config: Config = require('../config/config.json');
let langEn: Language = require('../lang/lang.en.json');
let internalLang: InternalLanguage = require('../lang/internal.en.json');

async function start(): Promise<void> {
    let clientOptions: ClientOptions = {
        ws: { intents: config.client.intents as IntentsString[] },
        partials: config.client.partials as PartialTypes[],
        messageCacheMaxSize: config.client.caches.messages.size,
        messageCacheLifetime: config.client.caches.messages.lifetime,
        messageSweepInterval: config.client.caches.messages.sweepInterval,
    };

    // Dependency Injection
    let langService = new LanguageService([langEn]);
    let client = new Client(clientOptions);
    let dataAccess = new DataAccess(config.mysql);
    let guildRepo = new GuildRepo(dataAccess);
    let userRepo = new UserRepo(dataAccess);
    let msgBuilder = new MessageBuilder(config.colors.default);
    let msgSender = new MessageSender(msgBuilder, langService);
    let timeParser = new TimeParser(config.experience.blacklist);
    let zoneService = new ZoneService(config.validation.regions, timeParser);
    let timeFormatService = new TimeFormatService(config.experience.timeFormats);
    let reminderService = new ReminderService(msgSender);
    let helpCommand = new HelpCommand(msgSender);
    let setCommand = new SetCommand(msgSender, internalLang.logs, zoneService, userRepo);
    let mapCommand = new MapCommand(msgSender);
    let clearCommand = new ClearCommand(msgSender, internalLang.logs, userRepo);
    let timeCommand = new TimeCommand(msgSender, zoneService, timeFormatService, userRepo);
    let formatCommand = new FormatCommand(
        msgSender,
        internalLang.logs,
        userRepo,
        timeFormatService
    );
    let configCommand = new ConfigCommand(msgSender, guildRepo, langService);
    let infoCommand = new InfoCommand(msgSender);
    let inviteCommand = new InviteCommand(msgSender);
    let supportCommand = new SupportCommand(msgSender);
    let donateCommand = new DonateCommand(msgSender);
    let guildJoinHandler = new GuildJoinHandler(internalLang.logs);
    let guildLeaveHandler = new GuildLeaveHandler(internalLang.logs);
    let messageHandler = new MessageHandler(
        config.prefix,
        config.emojis.convert,
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
        reminderService,
        langService
    );
    let reactionHandler = new ReactionHandler(
        config.emojis.convert,
        msgSender,
        timeParser,
        zoneService,
        timeFormatService,
        guildRepo,
        userRepo,
        internalLang.logs
    );
    let bot = new Bot(
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        reactionHandler,
        config.client.token,
        internalLang.logs
    );
    await bot.start();
}

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled promise rejection.', reason);
});

start();
