import djs, { DMChannel, Message, TextChannel } from 'discord.js';
import typescript from 'typescript';

import { MessageSender } from '../services';
import { Command } from './command';

let TsConfig = require('../../tsconfig.json');

export class InfoCommand implements Command {
    public name = 'info';
    public requireGuild = false;

    constructor(private msgSender: MessageSender) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel
    ): Promise<void> {
        await this.msgSender.sendEmbed(channel, 'info', {
            NODE_VERSION: process.version,
            TS_VERSION: `v${typescript.version}`,
            ES_VERSION: TsConfig.compilerOptions.target,
            DJS_VERSION: `v${djs.version}`,
        });
    }
}
