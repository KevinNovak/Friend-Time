import { EmbedBuilder } from 'discord.js';

export class EmbedUtils {
    public static content(embed: EmbedBuilder): string {
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
