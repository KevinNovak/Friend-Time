import { ColorResolvable, MessageEmbed } from 'discord.js';

export class MessageBuilder {
    constructor(private embedColor: ColorResolvable) {}

    public createEmbed(message: string, title?: string): MessageEmbed {
        let embed = new MessageEmbed().setColor(this.embedColor).setDescription(message);
        if (title) {
            embed = embed.setTitle(title);
        }
        return embed;
    }
}
