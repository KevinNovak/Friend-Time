export interface ConfigSchema {
    prefix: string;
    client: ClientConfig;
    mysql: MySqlConfig;
    rateLimiting: RateLimitingConfig;
    jobs: JobsConfig;
    experience: ExperienceConfig;
    colors: ColorsConfig;
    emojis: EmojisConfig;
    validation: ValidationConfig;
    sharding: ShardingConfig;
    links: LinksConfig;
    botSites: BotSiteConfig[];
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

export interface RateLimitingConfig {
    commands: CommandsConfig;
}

export interface CommandsConfig {
    amount: number;
    interval: number;
}

export interface JobsConfig {
    updateServerCount: UpdateServerCountConfig;
}

export interface UpdateServerCountConfig {
    schedule: string;
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

export interface LinksConfig {
    support: string;
    stream: string;
}

export interface ShardingConfig {
    machineId: number;
    machineCount: number;
    serversPerShard: number;
    spawnDelay: number;
    spawnTimeout: number;
}

export interface BotSiteConfig {
    name: string;
    enabled: boolean;
    url: string;
    authorization: string;
    body: string;
}
