import { Client, Message, MessageReaction, User } from 'discord.js';
import { MessageHandler, ReactionHandler } from './events';
import { Logger } from './services';

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

    private async onMessage(msg: Message): Promise<void> {
        if (!this.ready) {
            return;
        }

        await this.messageHandler.process(msg);
    }

    private async onReaction(messageReaction: MessageReaction, user: User): Promise<void> {
        if (!this.ready) {
            return;
        }

        await this.reactionHandler.process(messageReaction, user);
    }
}
