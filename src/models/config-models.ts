export interface ConfigSchema {
    prefix: string;
    client: ClientConfig;
    mysql: MySqlConfig;
    jobs: JobsConfig;
    experience: ExperienceConfig;
    colors: ColorsConfig;
    emojis: EmojisConfig;
    validation: ValidationConfig;
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

export interface JobsConfig {
    updateServerCount: UpdateServerCountConfig;
}

export interface UpdateServerCountConfig {
    interval: number;
}

export interface ExperienceConfig {
    timeFormats: TimeFormat[];
    blacklist: string[];
}

export interface TimeFormat {
    name: string;
    display: string;
    dateFormat: string;
    timeFormat: string;
}

export interface ColorsConfig {
    default: string;
}

export interface EmojisConfig {
    convert: string;
}

export interface ValidationConfig {
    regions: string[];
}

export interface ShardingConfig {
    machineId: number;
    machineCount: number;
    serversPerShard: number;
    spawnDelay: number;
    spawnTimeout: number;
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
