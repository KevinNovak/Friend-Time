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
    ReminderCommand,
    SetCommand,
    SupportCommand,
    TimeCommand,
} from './commands';
import { MessageHandler, ReactionHandler } from './events';
import { Config } from './models/config';
import { InternalLanguage } from './models/internal-language';
import { Language } from './models/language';
import { ServerRepo, UserRepo } from './repos';
import { DataAccess } from './services/database/data-access';
import { LanguageService } from './services/language/lang-service';
import { Logger } from './services/logger';
import { MessageBuilder } from './services/message-builder';
import { MessageSender } from './services/message-sender';
import { TimeFormatService } from './services/time-format-service';
import { TimeParser } from './services/time-parser';
import { ZoneService } from './services/zone-service';

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
    let logger = new Logger(internalLang.tags);
    let client = new Client(clientOptions);
    let dataAccess = new DataAccess(config.mysql);
    let serverRepo = new ServerRepo(dataAccess);
    let userRepo = new UserRepo(dataAccess);
    let msgBuilder = new MessageBuilder(config.colors.default);
    let msgSender = new MessageSender(msgBuilder, langService, logger, internalLang.logs);
    let timeParser = new TimeParser(config.experience.blacklist);
    let zoneService = new ZoneService(config.validation.regions, timeParser);
    let timeFormatService = new TimeFormatService(config.experience.timeFormats);
    let helpCommand = new HelpCommand(msgSender);
    let reminderCommand = new ReminderCommand(msgSender);
    let setCommand = new SetCommand(msgSender, logger, internalLang.logs, zoneService, userRepo);
    let mapCommand = new MapCommand(msgSender);
    let clearCommand = new ClearCommand(msgSender, logger, internalLang.logs, userRepo);
    let timeCommand = new TimeCommand(
        msgSender,
        logger,
        internalLang.logs,
        zoneService,
        timeFormatService,
        userRepo
    );
    let formatCommand = new FormatCommand(
        msgSender,
        logger,
        internalLang.logs,
        userRepo,
        timeFormatService
    );
    let configCommand = new ConfigCommand(msgSender, serverRepo, langService);
    let infoCommand = new InfoCommand(msgSender);
    let inviteCommand = new InviteCommand(msgSender);
    let supportCommand = new SupportCommand(msgSender);
    let donateCommand = new DonateCommand(msgSender);
    let messageHandler = new MessageHandler(
        config.prefix,
        config.emojis.convert,
        helpCommand,
        reminderCommand,
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
        serverRepo,
        userRepo,
        msgSender,
        timeParser,
        zoneService,
        timeFormatService,
        langService,
        logger,
        internalLang.logs
    );
    let reactionHandler = new ReactionHandler(
        config.emojis.convert,
        msgSender,
        timeParser,
        zoneService,
        timeFormatService,
        serverRepo,
        userRepo,
        logger,
        internalLang.logs
    );
    let bot = new Bot(client, messageHandler, reactionHandler, config.client.token, logger);
    await bot.start();
}

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', promise);
    if (reason instanceof Error) {
        console.error(reason.stack);
    } else {
        console.error(reason);
    }
});

start();
