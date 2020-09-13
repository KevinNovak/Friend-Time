export interface Config {
    prefix: string;
    client: ClientConfig;
    mysql: MySqlConfig;
    embedColor: string;
    emoji: string;
    regions: string[];
    timeFormats: TimeFormat[];
    blacklist: string[];
    updateInterval: number;
    sharding: ShardingConfig;
    botSites: BotSitesConfig;
}

export interface ClientConfig {
    token: string;
    intents: string[];
    partials: string[];
    caches: CachesConfig;
}

export interface CachesConfig {
    messages: MessagesConfig;
}

export interface MessagesConfig {
    size: number;
    lifetime: number;
    sweepInterval: number;
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
