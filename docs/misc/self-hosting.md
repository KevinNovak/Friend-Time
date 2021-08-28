---
description: How to self-host Friend Time.
---

# Self-Hosting

## Requirements

1. [Node.js v15](https://nodejs.org/) or newer.
2. A [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/) database.

## Setup

1. Copy example config files.
   * Navigate to the `config` folder of this project.
   * Copy all files ending in `.example.json` and remove the `.example` from the copied file names.
     * Ex: `config.example.json` should be copied and renamed as `config.json`.
2. Obtain a bot token.
   * You'll need to create a new bot in your [Discord Developer Portal](https://discord.com/developers/applications/).
     * See [here](https://www.writebots.com/discord-bot-token/) for detailed instructions.
     * At the end you should have a **bot token**.
3. Modify the config file.
   * Open the `config/config.json` file.
   * You'll need to edit the following values:
     * `client.token` - Your discord bot token.
     * `database.host`- The ip address that your database is running on \(or `localhost`\)
     * `database.database` - The name of the database to use.
     * `database.username` - The username to use when accessing the database.
     * `database.password` - The password of the user accessing the database.
4. Install packages.
   * Navigate into the downloaded source files and type `npm install`.

## Running

You can run Friend Time in 4 different modes:

1. Normal Mode
    * Type `npm start`.
    * This runs the bot directly with Node and without shards.
    * Use this mode if you don't need sharding.
2. Dev Mode
    * Type `npm start:dev`.
    * This runs the bot with [ts-node-dev](https://www.npmjs.com/package/ts-node-dev).
    * Use this mode for general development.
    * TypeScript files are compiled automatically as they are changed.
3. Shard Mode
    * Type `npm run start:shard`.
    * This runs the bot directly with Node and with sharding enabled.
    * Use this mode if you need sharding.
4. PM2 Mode
    * Run by typing `npm run start:pm2`.
    * This runs the bot using the process manager [PM2](https://pm2.keymetrics.io/).
    * Use this mode if you require the bot to always be online.

