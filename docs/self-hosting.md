# Self-Hosting Friend Time

## Requirements

1. [Node.js v12.14.0](https://nodejs.org/) or newer.
2. A [MySQL](https://www.mysql.com/) or [MariaDB](https://mariadb.org/) server.
    * [phpMyAdmin](https://www.phpmyadmin.net/) is also recommended.

## Setup

1. Obtain a bot token.
    * You'll need to create a new bot in your [Discord Developer Portal](https://discordapp.com/developers/applications/).
        * See [here](https://www.writebots.com/discord-bot-token/) for detailed instructions.
        * At the end you should have a **bot token**.
2. Clone or download the repository.
    * You can clone the repository by typing:
        * `git clone https://github.com/KevinNovak/Friend-Time.git`
3. Create the database.
    * In your MySQL or MariaDB server create a new database.
    * Run the `scripts/create-database.sql` script found in this repository.
        * This script will set up all the necessary tables and structures.
4. Setup the config file.
    * Open the `config/config.json` file found in this repository.
    * You'll need to edit the following values:
        * `client.token` - Your discord bot token.
        * `mysql.host` - The ip address that your database is running on (or `localhost`).
        * `mysql.database` - The name of the database to use.
        * `mysql.user` - The username to use when accessing the database.
        * `mysql.password` - The password of the user accessing the database.
5. Install packages.
    * Navigate into the downloaded source files and run:
        * `npm install`

## Running

You can run Friend Time in 3 different modes:

1. Non-Shard Mode
    * Type `npm start`.
    * This runs Friend Time directly with Node and without shards.
    * Use this mode for general development.
2. Shard Mode
    * Type `npm run start-shard`.
    * This runs Friend Time directly with Node and with sharding enabled.
    * Use this mode if you are testing sharding.
3. PM2 Mode
    * Run by typing `npm run start-pm2`.
    * This runs Friend Time using the process manager [PM2](https://pm2.keymetrics.io/).
    * Use this mode if you require Friend Time to always be online.
