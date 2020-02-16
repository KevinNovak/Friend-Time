import * as chrono from 'chrono-node';

export class TimeParser {
    private parser: any;

    constructor() {
        let options = chrono.options.mergeOptions([
            chrono.options.en({ strict: true }),
            chrono.options.commonPostProcessing,
        ]);
        // Remove "ENTimeAgoFormatParser" (8), and "ENTimeLaterFormatParser" (9)
        options.parsers.splice(8, 2);
        this.parser = new chrono.Chrono(options);
    }

    public parseTime(input: string, referenceTime: Date = new Date()): any {
        // TODO: Use reference date, current time in timezone
        let results: any[] = this.parser.parse(input, referenceTime);
        if (results.length > 0) {
            return results[0];
        }
    }

    public hourIsCertain(components: any): boolean {
        return components.isCertain('hour');
    }

    public offsetIsCertain(components: any): boolean {
        return components.isCertain('timezoneOffset');
    }
}
