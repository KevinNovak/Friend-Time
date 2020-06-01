import { Client, ClientOptions, PartialTypes } from 'discord.js';
import { Bot } from './bot';
import { ClearCommand } from './commands/clear-command';
import { ConfigCommand } from './commands/config-command';
import { DonateCommand } from './commands/donate-command';
import { FormatCommand } from './commands/format-command';
import { HelpCommand } from './commands/help-command';
import { InfoCommand } from './commands/info-command';
import { InviteCommand } from './commands/invite-command';
import { MapCommand } from './commands/map-command';
import { ReminderCommand } from './commands/reminder-command';
import { SetCommand } from './commands/set-command';
import { SupportCommand } from './commands/support-command';
import { TimeCommand } from './commands/time-command';
import { MessageHandler } from './events/message-handler';
import { ReactionHandler } from './events/reaction-handler';
import { Config } from './models/config';
import { InternalLanguage } from './models/internal-language';
import { Language } from './models/language';
import { DataAccess } from './services/database/data-access';
import { ServerRepo } from './services/database/server-repo';
import { UserRepo } from './services/database/user-repo';
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
        messageCacheMaxSize: config.clientOptions.messageCacheMaxSize,
        messageCacheLifetime: config.clientOptions.messageCacheLifetime,
        messageSweepInterval: config.clientOptions.messageSweepInterval,
        partials: config.clientOptions.partials as PartialTypes[],
    };

    // Dependency Injection
    let langService = new LanguageService([langEn]);
    let logger = new Logger(internalLang.tags);
    let client = new Client(clientOptions);
    let dataAccess = new DataAccess(config.mysql);
    let serverRepo = new ServerRepo(dataAccess);
    let userRepo = new UserRepo(dataAccess);
    let msgBuilder = new MessageBuilder(config.embedColor);
    let msgSender = new MessageSender(msgBuilder, langService, logger, internalLang.logs);
    let timeParser = new TimeParser(config.blacklist);
    let zoneService = new ZoneService(config.regions, timeParser);
    let timeFormatService = new TimeFormatService(config.timeFormats);
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
        config.emoji,
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
        config.emoji,
        msgSender,
        timeParser,
        zoneService,
        timeFormatService,
        serverRepo,
        userRepo,
        logger,
        internalLang.logs
    );
    let bot = new Bot(client, messageHandler, reactionHandler, config.token, logger);
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
