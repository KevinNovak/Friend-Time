export interface Config {
    prefix: string;
    token: string;
    mysql: MySqlConfig;
    embedColor: string;
    emoji: string;
    regions: string[];
    timeFormats: TimeFormat[];
    updateInterval: number;
    sharding: ShardingConfig;
    clientOptions: ClientOptionsConfig;
    botSites: BotSitesConfig;
}

export interface MySqlConfig {
    host: string;
    database: string;
    user: string;
    password: string;
    connectionLimit: number;
}

export interface TimeFormat {
    name: string;
    display: string;
    dateFormat: string;
    timeFormat: string;
}

export interface ShardingConfig {
    machineId: number;
    machineCount: number;
    serversPerShard: number;
}

export interface ClientOptionsConfig {
    disabledEvents: string[] | null;
    messageCacheMaxSize: number;
    messageCacheLifetime: number;
    messageSweepInterval: number;
    partials: string[];
}

export interface BotSitesConfig {
    topGg: TopGgConfig;
    botsOnDiscordXyz: BotsOnDiscordXyzConfig;
    discordBotsGg: DiscordBotsGgConfig;
    discordBotListCom: DiscordBotListComConfig;
}

export interface TopGgConfig {
    enabled: boolean;
    url: string;
    token: string;
}

export interface BotsOnDiscordXyzConfig {
    enabled: boolean;
    url: string;
    token: string;
}

export interface DiscordBotsGgConfig {
    enabled: boolean;
    url: string;
    token: string;
}

export interface DiscordBotListComConfig {
    enabled: boolean;
    url: string;
    token: string;
}
