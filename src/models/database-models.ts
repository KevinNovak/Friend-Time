export class GuildData {
    DiscordId: string;
    Mode: string;
    TimeFormat: string;
    Notify: boolean;

    constructor(row: any) {
        this.DiscordId = row.DiscordId;
        this.Mode = row.Mode;
        this.TimeFormat = row.TimeFormat;
        this.Notify = row.Notify;
    }
}

export class UserData {
    DiscordId: string;
    TimeZone: string;
    TimeFormat: string;

    constructor(row: any) {
        this.DiscordId = row.DiscordId;
        this.TimeZone = row.TimeZone;
        this.TimeFormat = row.TimeFormat;
    }
}
