import * as chrono from 'chrono-node';

export abstract class TimeUtils {
    public static parseTime(input: string, referenceTime: Date = new Date()): any {
        // TODO: Use reference date, current time in timezone
        let results: any[] = chrono.strict.parse(input, referenceTime);
        if (results.length > 0) {
            return results[0];
        }
    }

    public static hourIsCertain(components: any): boolean {
        return components.isCertain('hour');
    }

    public static offsetIsCertain(components: any): boolean {
        return components.isCertain('timezoneOffset');
    }
}
