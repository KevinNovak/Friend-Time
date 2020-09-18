import { TimeFormat } from '../models/config-models';

export class TimeFormatService {
    constructor(private timeFormats: TimeFormat[]) {}

    public getTimeFormat(name: string): TimeFormat {
        return this.findTimeFormat(name ?? '12');
    }

    public findTimeFormat(name: string): TimeFormat {
        return this.timeFormats.find(
            timeFormat => timeFormat.name.toLowerCase() === name.toLowerCase()
        );
    }
}
