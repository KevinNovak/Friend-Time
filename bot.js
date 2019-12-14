const Discord = require("discord.js");
const DBL = require("dblapi.js");
const _commandService = require("./services/commandService");
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
        if (!error.message.includes("Still spawning shards")) {
            console.error(error);
            return;
        }
        console.log(
            _lang.log.connectedServersWhileSpawning
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
        _lang.log.connectedServers
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

_client.on("ready", () => {
    let userTag = _client.user.tag;
    console.log(
        _lang.log.shardLogin
            .replace("{SHARD_ID}", _client.shard.id)
            .replace("{USER_TAG}", userTag)
    );

    updateConnectedServers();

    _acceptMessages = true;
    console.log(
        _lang.log.startupComplete.replace("{SHARD_ID}", _client.shard.id)
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
        _lang.log.serverConnected
            .replace("{SHARD_ID}", _client.shard.id)
            .replace("{SERVER_NAME}", guild.name)
            .replace("{SERVER_ID}", guild.id)
    );
});

_client.on("guildDelete", guild => {
    updateConnectedServers();
    console.log(
        _lang.log.serverDisconnected
            .replace("{SHARD_ID}", _client.shard.id)
            .replace("{SERVER_NAME}", guild.name)
            .replace("{SERVER_ID}", guild.id)
    );
});

_client.on("error", error => {
    console.error(
        _lang.log.clientError.replace("{SHARD_ID}", _client.shard.id)
    );
    console.error(error);
});

_client.login(_config.token).catch(error => {
    console.error(
        _lang.log.loginFailed.replace("{SHARD_ID}", _client.shard.id)
    );
    console.error(error);
});

if (_config.discordBotList.enabled) {
    const dbl = new DBL(_config.discordBotList.token, _client);

    dbl.on("posted", () => {
        console.log(
            _lang.log.dblServerCountPosted.replace(
                "{SHARD_ID}",
                _client.shard.id
            )
        );
    });

    dbl.on("error", error => {
        console.error(
            _lang.log.dblError.replace("{SHARD_ID}", _client.shard.id)
        );
        console.error(error);
    });
}
