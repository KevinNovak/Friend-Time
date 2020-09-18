import { Client, Guild, Message, MessageReaction, User } from 'discord.js';

import { GuildJoinHandler, GuildLeaveHandler, MessageHandler, ReactionHandler } from './events';
import { Logs } from './models/logs';
import { Logger } from './services';

let Logs: Logs = require('../lang/logs.en.json');

export class Bot {
    private ready = false;

    constructor(
        private client: Client,
        private guildJoinHandler: GuildJoinHandler,
        private guildLeaveHandler: GuildLeaveHandler,
        private messageHandler: MessageHandler,
        private reactionHandler: ReactionHandler,
        private token: string
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on('ready', () => this.onReady());
        this.client.on('shardReady', (shardId: number) => this.onShardReady(shardId));
        this.client.on('guildCreate', (guild: Guild) => this.onGuildJoin(guild));
        this.client.on('guildDelete', (guild: Guild) => this.onGuildLeave(guild));
        this.client.on('message', (msg: Message) => this.onMessage(msg));
        this.client.on('messageReactionAdd', (messageReaction: MessageReaction, user: User) =>
            this.onReaction(messageReaction, user)
        );
    }

    private async login(token: string): Promise<void> {
        try {
            await this.client.login(token);
        } catch (error) {
            Logger.error('An error occurred while the client attempted to login.', error);
        }
    }

    private onReady(): void {
        let userTag = this.client.user.tag;
        Logger.info(`Logged in as '${userTag}'!`);

        this.ready = true;
    }

    private onShardReady(shardId: number): void {
        Logger.setShardId(shardId);
    }

    private async onGuildJoin(guild: Guild): Promise<void> {
        if (!this.ready) {
            return;
        }

        try {
            await this.guildJoinHandler.process(guild);
        } catch (error) {
            Logger.error(Logs.guildJoinError, error);
        }
    }

    private async onGuildLeave(guild: Guild): Promise<void> {
        if (!this.ready) {
            return;
        }

        try {
            await this.guildLeaveHandler.process(guild);
        } catch (error) {
            Logger.error(Logs.guildLeaveError, error);
        }
    }

    private async onMessage(msg: Message): Promise<void> {
        if (!this.ready) {
            return;
        }

        try {
            await this.messageHandler.process(msg);
        } catch (error) {
            Logger.error(Logs.messageError, error);
        }
    }

    private async onReaction(messageReaction: MessageReaction, user: User): Promise<void> {
        if (!this.ready) {
            return;
        }

        try {
            await this.reactionHandler.process(messageReaction, user);
        } catch (error) {
            Logger.error(Logs.reactionError, error);
        }
    }
}
