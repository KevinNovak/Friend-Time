import { RawTimeZone, rawTimeZones } from '@vvo/tzdb';
import { createRequire } from 'node:module';

import { TimeUtils } from './index.js';

const require = createRequire(import.meta.url);
let TimeZoneCorrections: {
    [timeZone: string]: string;
} = require('../../config/time-zone-corrections.json');

export class TimeZoneUtils {
    private static timeZones = TimeZoneUtils.buildTimeZoneList();

    private static buildTimeZoneList(): RawTimeZone[] {
        let timeZones = rawTimeZones
            .filter(timeZone => {
                let now = TimeUtils.now(timeZone.name);
                return now.isValid;
            })
            .sort((a, b) => (a.name > b.name ? 1 : -1));

        let timeZoneCorrections = Object.entries(TimeZoneCorrections);
        for (let timeZone of timeZones) {
            for (let name of timeZone.group) {
                let additionalNames = timeZoneCorrections
                    .filter(entry => entry[1] === name)
                    .map(entry => entry[0]);
                timeZone.group = [...new Set([...timeZone.group, ...additionalNames])];
            }
        }

        return timeZones;
    }

    public static find(input: string): RawTimeZone {
        return this.findMultiple(input, 1)[0];
    }

    public static findMultiple(input: string, limit: number = Number.MAX_VALUE): RawTimeZone[] {
        let search = input.split(' ').join('_').toLowerCase();
        let found = new Set<RawTimeZone>();
        // Exact match
        if (found.size < limit)
            this.timeZones
                .filter(timeZone => timeZone.name.toLowerCase() === search)
                .forEach(timeZone => found.add(timeZone));
        if (found.size < limit)
            this.timeZones
                .filter(timeZone => timeZone.group.some(name => name.toLowerCase() === search))
                .forEach(timeZone => found.add(timeZone));
        // Starts with search term
        if (found.size < limit)
            this.timeZones
                .filter(timeZone => timeZone.name.toLowerCase().startsWith(search))
                .forEach(timeZone => found.add(timeZone));
        if (found.size < limit)
            this.timeZones
                .filter(timeZone =>
                    timeZone.group.some(name => name.toLowerCase().startsWith(search))
                )
                .forEach(timeZone => found.add(timeZone));
        // Includes search term
        if (found.size < limit)
            this.timeZones
                .filter(timeZone => timeZone.name.toLowerCase().includes(search))
                .forEach(timeZone => found.add(timeZone));
        if (found.size < limit)
            this.timeZones
                .filter(timeZone =>
                    timeZone.group.some(name => name.toLowerCase().includes(search))
                )
                .forEach(timeZone => found.add(timeZone));
        return [...found];
    }

    public static sort(timeZones: string[]): string[] {
        return timeZones
            .map(timeZone => this.find(timeZone))
            .sort((a, b) => this.compare(a, b))
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
