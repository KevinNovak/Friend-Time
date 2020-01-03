const Discord = require("discord.js");
const DBL = require("dblapi.js");
const _commandService = require("./services/command-service");
const _usersRepo = require("./repos/users-repo");
const _regexUtils = require("./utils/regex-utils");
const _config = require("./config/config.json");
const _lang = require("./config/lang.json");

const _client = new Discord.Client({
    // Don't listen to the "TYPING_START" events, for better memory usage.
    disabledEvents: ["TYPING_START"],
    // Only cache X messages per channel.
    messageCacheMaxSize: 20,
    // Messages in the cache live for at most X seconds.
    messageCacheLifetime: 120,
    // Every X seconds messages older than lifetime will be removed from cache.
    messageSweepInterval: 60
});

let _shardId = -1;
let _shardMode = false;
let _acceptMessages = false;

async function updateConnectedServers() {
    let serverCount = _client.guilds.size;
    if (_shardMode) {
        try {
            serverCount = (
                await _client.shard.fetchClientValues("guilds.size")
            ).reduce((prev, guildCount) => prev + guildCount, 0);
        } catch (error) {
            if (!error.name.includes("[SHARDING_IN_PROCESS]")) {
                console.error(error);
                return;
            }
            console.log(
                _lang.log.info.serverCount
                    .replace("{SHARD_ID}", _shardId)
                    .replace(
                        "{SHARD_SERVER_COUNT}",
                        _client.guilds.size.toLocaleString()
                    )
            );
            return;
        }
    }

    _client.user.setPresence({
        activity: {
            name: `time to ${serverCount.toLocaleString()} servers`,
            type: "STREAMING",
            url: "https://www.twitch.tv/monstercat"
        }
    });

    console.log(
        _lang.log.info.serverCountWithTotal
            .replace("{SHARD_ID}", _shardId)
            .replace(
                "{SHARD_SERVER_COUNT}",
                _client.guilds.size.toLocaleString()
            )
            .replace("{TOTAL_SERVER_COUNT}", serverCount.toLocaleString())
    );
}

function canReply(msg) {
    return msg.guild
        ? msg.channel.permissionsFor(msg.guild.me).has("SEND_MESSAGES")
        : true;
}

_client.on("ready", async () => {
    let userTag = _client.user.tag;
    console.log(
        _lang.log.events.shard.login
            .replace("{SHARD_ID}", _shardId)
            .replace("{USER_TAG}", userTag)
    );

    _shardMode = !!_client.shard;

    updateConnectedServers();

    try {
        await _usersRepo.connect();
        console.log(
            _lang.log.events.sql.connected.replace("{SHARD_ID}", _shardId)
        );
    } catch (error) {
        console.error(
            _lang.log.events.sql.connectError.replace("{SHARD_ID}", _shardId)
        );
        console.error(error);
        return;
    }
    _commandService.CommandService(_usersRepo);

    _acceptMessages = true;
    console.log(
        _lang.log.events.shard.startupComplete.replace("{SHARD_ID}", _shardId)
    );
});

_client.on("message", msg => {
    if (!_acceptMessages || msg.author.bot || !canReply(msg)) {
        return;
    }

    if (
        msg.mentions.has(_client.user, {
            ignoreDirect: false,
            ignoreRoles: true,
            ignoreEveryone: true
        })
    ) {
        _commandService.processHelp(msg);
        return;
    }

    if (_regexUtils.containsTime(msg.content)) {
        _commandService.processTime(msg);
        return;
    }

    let args = msg.content.split(" ");
    if (!_lang.cmd.prefix.includes(args[0].toLowerCase())) {
        return;
    }

    if (args.length > 1) {
        let cmd = args[1].toLowerCase();
        if (_lang.cmd.help.includes(cmd)) {
            _commandService.processHelp(msg);
            return;
        }

        if (_lang.cmd.map.includes(cmd)) {
            _commandService.processMap(msg);
            return;
        }

        if (_lang.cmd.set.includes(cmd)) {
            _commandService.processSet(msg, args);
            return;
        }

        if (_lang.cmd.invite.includes(cmd)) {
            _commandService.processInvite(msg);
            return;
        }

        if (_lang.cmd.support.includes(cmd)) {
            _commandService.processSupport(msg);
            return;
        }

        if (_lang.cmd.donate.includes(cmd)) {
            _commandService.processDonate(msg);
            return;
        }
    }

    _commandService.processHelp(msg);
});

_client.on("guildCreate", guild => {
    updateConnectedServers();
    console.log(
        _lang.log.events.server.connected
            .replace("{SHARD_ID}", _shardId)
            .replace("{SERVER_NAME}", guild.name)
            .replace("{SERVER_ID}", guild.id)
    );
});

_client.on("guildDelete", guild => {
    updateConnectedServers();
    console.log(
        _lang.log.events.server.disconnected
            .replace("{SHARD_ID}", _shardId)
            .replace("{SERVER_NAME}", guild.name)
            .replace("{SERVER_ID}", guild.id)
    );
});

_client.on("shardReady", (shardId, unavailableGuilds) => {
    _shardId = shardId;
});

_client.on("shardDisconnect", (event, shardId) => {
    console.error(
        _lang.log.events.shard.disconnect.replace("{SHARD_ID}", shardId)
    );
});

_client.on("shardReconnecting", shardId => {
    console.log(
        _lang.log.events.shard.reconnecting.replace("{SHARD_ID}", shardId)
    );
});

_client.on("shardResume", (replayed, shardId) => {
    console.log(
        _lang.log.events.shard.resume
            .replace("{SHARD_ID}", shardId)
            .replace("{REPLAYED_EVENT_COUNT}", replayed)
    );
});

_client.on("rateLimit", rateLimitInfo => {
    console.error(
        _lang.log.events.shard.rateLimit.replace("{SHARD_ID}", _shardId)
    );
    console.error(rateLimitInfo);
});

_client.on("shardError", (error, shardId) => {
    console.error(_lang.log.events.shard.error.replace("{SHARD_ID}", shardId));
    console.error(error);
});

_client.login(_config.token).catch(error => {
    console.error(
        _lang.log.events.shard.loginFailed.replace("{SHARD_ID}", _shardId)
    );
    console.error(error);
});

if (_config.discordBotList.enabled) {
    const dbl = new DBL(_config.discordBotList.token, _client);

    dbl.on("posted", () => {
        console.log(
            _lang.log.events.dbl.serverCountPosted.replace(
                "{SHARD_ID}",
                _shardId
            )
        );
    });

    dbl.on("error", error => {
        console.error(
            _lang.log.events.dbl.error.replace("{SHARD_ID}", _shardId)
        );
        console.error(error);
    });
}
