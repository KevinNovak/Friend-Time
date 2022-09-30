import { Chrono, en, ParsedComponents, ParsedResult } from 'chrono-node';
import { Locale } from 'discord.js';
import { createRequire } from 'node:module';

import { DateFormatOption, TimeFormatOption } from '../enums/index.js';
import { DateFormat } from '../models/enum-helpers/index.js';
import { FormattedTimeResult } from '../models/internal-models.js';
import { FormatUtils, RegexUtils, StringUtils, TimeUtils } from '../utils/index.js';

const require = createRequire(import.meta.url);
let Config = require('../../config/config.json');

export class TimeService {
    private blacklistRegexes: RegExp[];

    constructor() {
        this.blacklistRegexes = Config.validation.timeResultText.blacklist.map(
            (regexString: string) => RegexUtils.regex(regexString)
        );
    }

    public parseResults(
        input: string,
        dateFormat: DateFormatOption = DateFormatOption.MONTH_DAY,
        referenceDate?: Date
    ): ParsedResult[] {
        // Create parser
        // TODO: May need to remove time ago and time later parsers, similar for others
        let littleEndian = DateFormat.Data[dateFormat].littleEndian;
        let parser = new Chrono(en.createConfiguration(true, littleEndian));

        // Preformat input for parser
        let lines = StringUtils.stripUrls(StringUtils.stripMarkdown(input))
            // Replace boundary-like characters with newlines
            .replaceAll(/[()[\]{}<>"`]/g, '\n')
            // Break message into each line
            .split('\n');

        // TODO: Reference date should be current time in time zone
        let results = lines.flatMap(line => parser.parse(line, referenceDate));

        // Filter results
        results = results
            .filter(
                result =>
                    result.start.isCertain('hour') &&
                    !this.blacklistRegexes.some(regex => regex.test(result.text))
            )
            .slice(0, Config.validation.timeResults.countMax);

        return results;
    }

    public formatResult(
        result: ParsedResult,
        timeZoneFrom: string,
        timeZoneTo: string,
        timeFormat: TimeFormatOption,
        langCode: Locale
    ): FormattedTimeResult {
        return {
            text: this.formatTimeText(result.text),
            start: this.formatTime(result.start, timeZoneFrom, timeZoneTo, timeFormat, langCode),
            end: result.end
                ? this.formatTime(result.end, timeZoneFrom, timeZoneTo, timeFormat, langCode)
                : undefined,
        };
    }

    public formatTimeText(text: string): string {
        return StringUtils.truncate(text, Config.validation.timeResultText.lengthMax, true);
    }

    public formatTime(
        components: ParsedComponents,
        timeZoneFrom: string,
        timeZoneTo: string,
        timeFormat: TimeFormatOption,
        langCode: Locale
    ): string {
        let dateTime = TimeUtils.dateToDateTime(
            components.date(),
            components.isCertain('timezoneOffset') ? undefined : timeZoneFrom,
            true
        );
        dateTime = TimeUtils.convert(dateTime, timeZoneTo);
        return components.isCertain('day')
            ? FormatUtils.dateTime(dateTime, timeFormat, langCode)
            : FormatUtils.time(dateTime, timeFormat, langCode);
    }
}
