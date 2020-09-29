import { DMChannel, Message, TextChannel, User } from 'discord.js';

import { UserData } from '../models/database-models';
import { UserRepo } from '../repos';
import { MessageSender, TimeFormatService, ZoneService } from '../services';
import { MessageName } from '../services/language';
import { GuildUtils } from '../utils';
import { Command } from './command';

export class TimeCommand implements Command {
    public name = 'time';
    public requireGuild = false;

    constructor(
        private msgSender: MessageSender,
        private zoneService: ZoneService,
        private timeFormatService: TimeFormatService,
        private userRepo: UserRepo
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData
    ): Promise<void> {
        let mentionedUsers = msg.mentions.users;
        if (mentionedUsers.size > 0) {
            this.executeMention(mentionedUsers.first(), authorData, channel);
            return;
        }

        let input = args.join(' ');

        if (args.length > 0) {
            if (msg.guild) {
                let member = await GuildUtils.findMember(msg.guild, input);
                if (member) {
                    this.executeMention(member.user, authorData, channel);
                    return;
                }
            }

            this.executeZone(input, authorData, channel);
            return;
        }

        this.executeSelf(authorData, channel);
    }

    private async executeMention(
        mentionedUser: User,
        authorData: UserData,
        channel: TextChannel | DMChannel
    ): Promise<void> {
        let userData = await this.userRepo.getUserData(mentionedUser.id);
        if (!userData?.TimeZone) {
            await this.msgSender.sendEmbed(channel, 'noZoneSetUser', { USER_ID: mentionedUser.id });
            return;
        }

        let time = this.zoneService.getMomentInZone(userData.TimeZone);
        let timeFormat = this.timeFormatService.getTimeFormat(authorData?.TimeFormat);

        await this.msgSender.sendEmbed(channel, 'timeUserSuccess', {
            TIME: time.format(`${timeFormat.dateFormat} ${timeFormat.timeFormat}`),
            USER_ID: mentionedUser.id,
            ZONE: userData.TimeZone,
        });
    }

    private async executeZone(
        zoneInput: string,
        authorData: UserData,
        channel: TextChannel | DMChannel
    ): Promise<void> {
        let zone = this.zoneService.findZone(zoneInput);
        if (!zone) {
            await this.msgSender.sendEmbed(channel, 'zoneNotFound');
            return;
        }

        let time = this.zoneService.getMomentInZone(zone);
        let timeFormat = this.timeFormatService.getTimeFormat(authorData?.TimeFormat);

        await this.msgSender.sendEmbed(channel, 'timeZoneSuccess', {
            TIME: time.format(`${timeFormat.dateFormat} ${timeFormat.timeFormat}`),
            ZONE: zone,
        });
    }

    private async executeSelf(
        authorData: UserData,
        channel: TextChannel | DMChannel
    ): Promise<void> {
        if (!authorData?.TimeZone) {
            await this.msgSender.sendEmbed(channel, 'noZoneSetSelf');
            return;
        }

        let time = this.zoneService.getMomentInZone(authorData.TimeZone);
        let timeFormat = this.timeFormatService.getTimeFormat(authorData.TimeFormat);

        await this.msgSender.sendEmbed(channel, 'timeSelfSuccess', {
            TIME: time.format(`${timeFormat.dateFormat} ${timeFormat.timeFormat}`),
            ZONE: authorData.TimeZone,
        });
    }
}
