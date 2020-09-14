import { TimeFormat } from '../models/config-models';

export class TimeFormatService {
    constructor(private timeFormats: TimeFormat[]) {}

    public findTimeFormat(name: string): TimeFormat {
        return this.timeFormats.find(
            timeFormat => timeFormat.name.toLowerCase() === name.toLowerCase()
        );
    }
}
