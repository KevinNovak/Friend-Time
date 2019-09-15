const Discord = require('discord.js');
const DBL = require('dblapi.js');
const commandService = require('./services/commandService');
const regexUtils = require('./utils/regexUtils');
const config = require('./config/config.json');
const lang = require('./config/lang.json');

const client = new Discord.Client();

var acceptMessages = false;

async function updateConnectedServers() {
    let results = [];
    try {
        results = await client.shard.fetchClientValues('guilds.size');
    } catch (error) {
        if (!error.message.includes('Still spawning shards')) {
            console.error(error);
        }
        return;
    }

    let serverCount = results.reduce((prev, guildCount) => prev + guildCount, 0);

    client.user.setPresence({
        game: {
            name: `time to ${serverCount.toLocaleString()} servers`,
            type: 'STREAMING',
            url: 'https://www.twitch.tv/monstercat'
        }
    });

    console.log(
        lang.log.connectedServers
            .replace('{SERVER_COUNT}', serverCount)
    );
}

function canReply(msg) {
    return msg.guild
        ? msg.channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES')
        : true;
}

client.on('ready', () => {
    var userTag = client.user.tag;
    console.log(
        lang.log.shardLogin
            .replace('{SHARD_ID}', client.shard.id)
            .replace('{USER_TAG}', userTag)
    );

    updateConnectedServers();

    acceptMessages = true;
    console.log(
        lang.log.startupComplete
            .replace('{SHARD_ID}', client.shard.id)
    );
});

client.on('message', msg => {
    if (!acceptMessages || msg.author.bot || !canReply(msg)) {
        return;
    }

    if (regexUtils.containsTime(msg.content)) {
        commandService.processTime(msg);
        return;
    }

    var args = msg.content.split(' ');
    if (!lang.cmd.prefix.includes(args[0].toLowerCase())) {
        return;
    }

    if (args.length > 1) {
        var cmd = args[1].toLowerCase();
        if (lang.cmd.help.includes(cmd)) {
            commandService.processHelp(msg);
            return;
        }

        if (lang.cmd.map.includes(cmd)) {
            commandService.processMap(msg);
            return;
        }

        if (lang.cmd.set.includes(cmd)) {
            commandService.processSet(msg, args);
            return;
        }

        if (lang.cmd.invite.includes(cmd)) {
            commandService.processInvite(msg);
            return;
        }
    }

    commandService.processHelp(msg);
});

client.on('guildCreate', guild => {
    updateConnectedServers();
    console.log(
        lang.log.serverConnected
            .replace('{SHARD_ID}', client.shard.id)
            .replace('{SERVER_NAME}', guild.name)
            .replace('{SERVER_ID}', guild.id)
    );
});

client.on('guildDelete', guild => {
    updateConnectedServers();
    console.log(
        lang.log.serverDisconnected
            .replace('{SHARD_ID}', client.shard.id)
            .replace('{SERVER_NAME}', guild.name)
            .replace('{SERVER_ID}', guild.id)
    );
});

client.on('error', error => {
    console.error(
        lang.log.clientError
            .replace('{SHARD_ID}', client.shard.id)
    );
    console.error(error);
});

client.login(config.token).catch(error => {
    console.error(
        lang.log.loginFailed
            .replace('{SHARD_ID}', client.shard.id)
    );
    console.error(error);
});

if (config.discordBotList.enabled) {
    const dbl = new DBL(config.discordBotList.token, client);

    dbl.on('posted', () => {
        console.log(
            lang.log.dblServerCountPosted
                .replace('{SHARD_ID}', client.shard.id)
        );
    });

    dbl.on('error', error => {
        console.error(
            lang.log.dblError
                .replace('{SHARD_ID}', client.shard.id)
        );
        console.error(error);
    });
}
