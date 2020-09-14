import { Client, Message, MessageReaction, User } from 'discord.js';

import { MessageHandler, ReactionHandler } from './events';
import { Logs } from './models/internal-language';
import { Logger } from './services';

export class Bot {
    private ready = false;

    constructor(
        private client: Client,
        private messageHandler: MessageHandler,
        private reactionHandler: ReactionHandler,
        private token: string,
        private logs: Logs
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on('ready', () => this.onReady());
        this.client.on('shardReady', (shardId: number) => this.onShardReady(shardId));
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

    private async onMessage(msg: Message): Promise<void> {
        if (!this.ready) {
            return;
        }

        try {
            await this.messageHandler.process(msg);
        } catch (error) {
            Logger.error(this.logs.messageError, error);
        }
    }

    private async onReaction(messageReaction: MessageReaction, user: User): Promise<void> {
        if (!this.ready) {
            return;
        }

        try {
            await this.reactionHandler.process(messageReaction, user);
        } catch (error) {
            Logger.error(this.logs.reactionError, error);
        }
    }
}
