export interface InternalLanguage {
    logs: Logs;
}

export interface Logs {
    appStarted: string;
    shardCountError: string;
    noShards: string;
    spawnShardError: string;
    launchedShard: string;
    updateServerCountSiteError: string;
    updateServerCountSite: string;
    updatedServerCount: string;
    retrieveServerCountError: string;
    broadcastServerCountError: string;
    setSuccess: string;
    setError: string;
    clearSuccess: string;
    clearError: string;
    formatSuccess: string;
    formatError: string;
    retrieveServerDataError: string;
    retrieveUserDataError: string;
    retrieveServerMembersError: string;
    retrieveDistinctTimeZonesError: string;
    retrievePartialReactionMessageError: string;
    createDmChannelError: string;
    sendMessageError: string;
    messageError: string;
    reactionError: string;
}
