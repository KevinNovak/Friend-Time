export abstract class StringUtils {
    private static QUOTE_MAX_LENGTH = 200;

    public static formatQuote(quote: string): string {
        return StringUtils.truncate(quote.replace('\n', ' '), this.QUOTE_MAX_LENGTH);
    }

    public static formatMention(id: string): string {
        return `<@!${id}>`;
    }

    public static truncate(input: string, size: number): string {
        if (input.length <= size) {
            return input;
        }

        return input.slice(0, size) + '...';
    }

    public static replaceVariables(
        input: string,
        variables: { name: string; value: string }[]
    ): string {
        let output = input;
        for (let variable of variables) {
            output = output.replace(variable.name, variable.value);
        }
        return output;
    }
}
