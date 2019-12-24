const Discord = require("discord.js");
const DBL = require("dblapi.js");
const _commandService = require("./services/commandService");
const _usersRepo = require("./repos/usersRepo");
const _regexUtils = require("./utils/regexUtils");
const _config = require("./config/config.json");
const _lang = require("./config/lang.json");

const _client = new Discord.Client();

let _acceptMessages = false;

async function updateConnectedServers() {
    let results = [];
    try {
        results = await _client.shard.fetchClientValues("guilds.size");
    } catch (error) {
        if (error.name != "SHARDING_IN_PROCESS") {
            console.error(error);
            return;
        }
        console.log(
            _lang.log.info.serverCount
                .replace("{SHARD_ID}", _client.shard.id)
                .replace(
                    "{SHARD_SERVER_COUNT}",
                    _client.guilds.size.toLocaleString()
                )
        );
        return;
    }

    let serverCount = results.reduce(
        (prev, guildCount) => prev + guildCount,
        0
    );

    _client.user.setPresence({
        game: {
            name: `time to ${serverCount.toLocaleString()} servers`,
            type: "STREAMING",
            url: "https://www.twitch.tv/monstercat"
        }
    });

    console.log(
        _lang.log.info.serverCountWithTotal
            .replace("{SHARD_ID}", _client.shard.id)
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
            .replace("{SHARD_ID}", _client.shard.id)
            .replace("{USER_TAG}", userTag)
    );

    updateConnectedServers();

    try {
        await _usersRepo.connect();
        console.log(
            _lang.log.events.sql.connected.replace(
                "{SHARD_ID}",
                _client.shard.id
            )
        );
    } catch (error) {
        console.error(
            _lang.log.events.sql.connectError.replace(
                "{SHARD_ID}",
                _client.shard.id
            )
        );
        console.error(error);
        return;
    }
    _commandService.CommandService(_usersRepo);

    _acceptMessages = true;
    console.log(
        _lang.log.events.shard.startupComplete.replace(
            "{SHARD_ID}",
            _client.shard.id
        )
    );
});

_client.on("message", msg => {
    if (!_acceptMessages || msg.author.bot || !canReply(msg)) {
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
    }

    _commandService.processHelp(msg);
});

_client.on("guildCreate", guild => {
    updateConnectedServers();
    console.log(
        _lang.log.events.server.connected
            .replace("{SHARD_ID}", _client.shard.id)
            .replace("{SERVER_NAME}", guild.name)
            .replace("{SERVER_ID}", guild.id)
    );
});

_client.on("guildDelete", guild => {
    updateConnectedServers();
    console.log(
        _lang.log.events.server.disconnected
            .replace("{SHARD_ID}", _client.shard.id)
            .replace("{SERVER_NAME}", guild.name)
            .replace("{SERVER_ID}", guild.id)
    );
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
        _lang.log.events.shard.rateLimit.replace("{SHARD_ID}", _client.shard.id)
    );
    console.error(rateLimitInfo);
});

_client.on("shardError", (error, shardId) => {
    console.error(_lang.log.events.shard.error.replace("{SHARD_ID}", shardId));
    console.error(error);
});

_client.login(_config.token).catch(error => {
    console.error(
        _lang.log.events.shard.loginFailed.replace(
            "{SHARD_ID}",
            _client.shard.id
        )
    );
    console.error(error);
});

if (_config.discordBotList.enabled) {
    const dbl = new DBL(_config.discordBotList.token, _client);

    dbl.on("posted", () => {
        console.log(
            _lang.log.events.dbl.serverCountPosted.replace(
                "{SHARD_ID}",
                _client.shard.id
            )
        );
    });

    dbl.on("error", error => {
        console.error(
            _lang.log.events.dbl.error.replace("{SHARD_ID}", _client.shard.id)
        );
        console.error(error);
    });
}
