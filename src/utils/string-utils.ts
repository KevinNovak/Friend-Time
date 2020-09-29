export abstract class StringUtils {
    private static QUOTE_MAX_LENGTH = 200;

    public static formatQuote(quote: string): string {
        return this.truncate(quote.replace('\n', ' '), this.QUOTE_MAX_LENGTH);
    }

    public static truncate(input: string, size: number): string {
        if (input.length <= size) {
            return input;
        }

        return input.slice(0, size) + '...';
    }
}
