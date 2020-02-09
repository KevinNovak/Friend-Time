import { Client, Message, MessageReaction, User } from 'discord.js';
import { MessageHandler } from './events/message-handler';
import { ReactionHandler } from './events/reaction-handler';
import { Logger } from './services/logger';

export class Bot {
    private ready = false;

    constructor(
        private client: Client,
        private messageHandler: MessageHandler,
        private reactionHandler: ReactionHandler,
        private token: string,
        private logger: Logger
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
            this.logger.error('An error occurred while the client attempted to login.', error);
        }
    }

    private onReady(): void {
        let userTag = this.client.user.tag;
        this.logger.info(`Logged in as '${userTag}'!`);

        this.ready = true;
    }

    private onShardReady(shardId: number): void {
        this.logger.setShardId(shardId);
    }

    private onMessage(msg: Message): void {
        if (!this.ready) {
            return;
        }

        this.messageHandler.process(msg);
    }

    private onReaction(messageReaction: MessageReaction, user: User): void {
        if (!this.ready) {
            return;
        }

        this.reactionHandler.process(messageReaction, user);
    }
}
