export class GuildData {
    DiscordId: string;
    Mode: string;
    TimeFormat: string;
    Notify: boolean;

    constructor(row: any) {
        this.DiscordId = row.DiscordId;
        this.Mode = row.Mode ?? 'React';
        this.TimeFormat = row.TimeFormat ?? '12';
        this.Notify = row.Notify ?? true;
    }
}

export class UserData {
    DiscordId: string;
    TimeZone: string;
    TimeFormat: string;

    constructor(row: any) {
        this.DiscordId = row.DiscordId;
        this.TimeZone = row.TimeZone;
        this.TimeFormat = row.TimeFormat ?? '12';
    }
}
