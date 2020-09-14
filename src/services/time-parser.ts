import * as chrono from 'chrono-node';

export class TimeParser {
    private parser: any;
    private blacklist: RegExp[];

    constructor(blacklist: string[]) {
        let options = chrono.options.mergeOptions([
            chrono.options.en({ strict: true }),
            chrono.options.commonPostProcessing,
        ]);
        // Remove "ENTimeAgoFormatParser" (8), and "ENTimeLaterFormatParser" (9)
        options.parsers.splice(8, 2);
        this.parser = new chrono.Chrono(options);
        this.blacklist = blacklist.map(regexString => new RegExp(regexString));
    }

    public parseTime(input: string, referenceTime: Date = new Date()): any {
        // TODO: Use reference date, current time in timezone
        let results: any[] = this.parser.parse(input, referenceTime);
        if (results.length > 0) {
            return results[0];
        }
    }

    public shouldConvert(result: any) {
        return result && this.hourIsCertain(result.start) && !this.matchesBlacklist(result.text);
    }

    public dayIsCertain(components: any): boolean {
        return components.isCertain('day');
    }

    public hourIsCertain(components: any): boolean {
        return components.isCertain('hour');
    }

    public offsetIsCertain(components: any): boolean {
        return components.isCertain('timezoneOffset');
    }

    private matchesBlacklist(input: string): any {
        for (let blacklistRegex of this.blacklist) {
            if (blacklistRegex.test(input)) {
                return true;
            }
        }
        return false;
    }
}
