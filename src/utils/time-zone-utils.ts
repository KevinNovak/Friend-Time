import { RawTimeZone, rawTimeZones } from '@vvo/tzdb';
import { TimeUtils } from './time-utils';

let TimeZoneCorrections: {
    [timeZone: string]: string;
} = require('../../config/time-zone-corrections.json');

export class TimeZoneUtils {
    private static timeZones = rawTimeZones.filter(timeZone => {
        let now = TimeUtils.now(timeZone.name);
        return now.isValid;
    });

    public static find(input: string): RawTimeZone {
        let search = input.split(' ').join('_').toLowerCase();
        return (
            // Exact match
            this.timeZones.find(
                timeZone =>
                    timeZone.name.toLowerCase() === search ||
                    timeZone.group.some(name => name.toLowerCase() === search)
            ) ??
            // Includes search term
            this.timeZones.find(
                timeZone =>
                    timeZone.name.toLowerCase().includes(search) ||
                    timeZone.group.some(name => name.toLowerCase().includes(search))
            )
        );
    }

    public static sort(timeZones: string[]): string[] {
        return timeZones
            .map(timeZone => this.find(timeZone))
            .sort(this.compare)
            .map(timeZone => timeZone.name);
    }

    private static compare(a: RawTimeZone, b: RawTimeZone): number {
        // Sort by raw offset first
        if (a.rawOffsetInMinutes > b.rawOffsetInMinutes) {
            return 1;
        } else if (a.rawOffsetInMinutes < b.rawOffsetInMinutes) {
            return -1;
        }

        // Then sort by time zone name
        if (a.name < b.name) {
            return -1;
        } else if (a.name > b.name) {
            return 1;
        }

        return 0;
    }
}
