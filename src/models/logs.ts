export interface LogsSchema {
    appStarted: string;
    shardCountError: string;
    noShards: string;
    spawnShardError: string;
    launchedShard: string;
    updatedServerCount: string;
    updateServerCountSite: string;
    updateServerCountError: string;
    updateServerCountSiteError: string;
    guildJoined: string;
    guildLeft: string;
    guildJoinError: string;
    guildLeaveError: string;
    setSuccess: string;
    clearSuccess: string;
    formatSuccess: string;
    retrievePartialReactionMessageError: string;
    messageError: string;
    reactionError: string;
    commandDmError: string;
    commandGuildError: string;
}
