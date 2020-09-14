import { DiscordBotsGgConfig } from '../../models/config-models';
import { HttpService } from '../http-service';
import { BotSite } from './bot-site';

export class DiscordBotsGgSite implements BotSite {
    public enabled = false;
    public name = 'discord.bots.gg';

    constructor(private config: DiscordBotsGgConfig, private httpService: HttpService) {
        this.enabled = this.config.enabled;
    }

    public async updateServerCount(serverCount: number): Promise<void> {
        try {
            await this.httpService.post(
                this.config.url,
                { guildCount: serverCount },
                this.config.token
            );
        } catch (error) {
            throw error;
        }
    }
}
