import { DateTime } from 'luxon';

export class TimeUtils {
    public static now(zone?: string): DateTime {
        let now = DateTime.utc();
        if (zone) {
            now = now.setZone(zone);
        }
        return now;
    }

    public static convert(dateTime: DateTime, toZone: string): DateTime {
        return dateTime.setZone(toZone, { keepLocalTime: false });
    }

    public static dateToDateTime(
        date: Date,
        zone?: string,
        keepLocalTime: boolean = false
    ): DateTime {
        let dateTime = DateTime.fromJSDate(date);
        if (zone) {
            dateTime = dateTime.setZone(zone, { keepLocalTime });
        }
        return dateTime;
    }
}
