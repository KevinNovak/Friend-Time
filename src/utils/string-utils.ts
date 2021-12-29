import removeMarkdown from 'remove-markdown';
import urlRegex from 'url-regex';

export class StringUtils {
    public static truncate(input: string, length: number, addEllipsis: boolean = false): string {
        if (input.length <= length) {
            return input;
        }

        let output = input.substring(0, addEllipsis ? length - 3 : length);
        if (addEllipsis) {
            output += '...';
        }

        return output;
    }

    public static stripMarkdown(input: string): string {
        return removeMarkdown(input);
    }

    public static stripUrls(input: string): string {
        return input.replaceAll(urlRegex(), '');
    }
}
