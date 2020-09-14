import moment, { Moment, tz } from 'moment-timezone';

import { TimeParser } from './time-parser';

export class ZoneService {
    private INTERNAL_FORMAT = 'YYYY-MM-DD HH:mm:ss';

    private zoneNames: string[];

    constructor(regions: string[], private timeParser: TimeParser) {
        this.zoneNames = tz
            .names()
            .filter(name => regions.some(region => name.startsWith(`${region}/`)));
    }

    public findZone(input: string): string {
        let search = input.split(' ').join('_').toLowerCase();
        return this.zoneNames.find(zone => zone.toLowerCase().includes(search));
    }

    public getMomentInZone(zone: string): Moment {
        return tz(zone);
    }

    public convert(result: any, fromZone: string, toZone: string): Moment {
        let momentInZone: Moment;
        if (this.timeParser.offsetIsCertain(result.start)) {
            momentInZone = moment(result.date());
        } else {
            momentInZone = this.createMomentInZone(result.date(), fromZone);
        }
        return momentInZone.tz(toZone);
    }

    private createMomentInZone(time: Date | Moment, zone: string): Moment {
        let timeString = moment(time).format(this.INTERNAL_FORMAT);
        return tz(timeString, zone);
    }
}
