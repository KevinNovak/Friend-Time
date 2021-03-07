import { MessageEmbed } from 'discord.js-light';

export class EmbedUtils {
    public static content(embed: MessageEmbed): string {
        return [
            embed.author?.name,
            embed.title,
            embed.description,
            ...embed.fields.flatMap(field => [field.name, field.value]),
            embed.footer?.text,
        ]
            .filter(Boolean)
            .join('\n');
    }
}
