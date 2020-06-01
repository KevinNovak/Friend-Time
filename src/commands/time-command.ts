import { DMChannel, GuildMember, Message, TextChannel, User } from 'discord.js';
import { Logs } from '../models/internal-language';
import { ServerData } from '../models/server-data';
import { UserData } from '../models/user-data';
import { UserRepo } from '../services/database/user-repo';
import { CommandName } from '../services/language/command-name';
import { MessageName } from '../services/language/message-name';
import { Logger } from '../services/logger';
import { MessageSender } from '../services/message-sender';
import { TimeFormatService } from '../services/time-format-service';
import { ZoneService } from '../services/zone-service';
import { ServerUtils } from '../utils/server-utils';
import { Command } from './command';

export class TimeCommand implements Command {
    public name = CommandName.time;

    constructor(
        private msgSender: MessageSender,
        private logger: Logger,
        private logs: Logs,
        private zoneService: ZoneService,
        private timeFormatService: TimeFormatService,
        private userRepo: UserRepo
    ) {}

    public async execute(
        msg: Message,
        args: string[],
        channel: TextChannel | DMChannel,
        authorData: UserData,
        serverData?: ServerData
    ): Promise<void> {
        // TODO: Consolidate usage between self, user, zone
        let guild = msg.guild;
        let mentionedUsers = msg.mentions.users;

        if (mentionedUsers.size > 0) {
            this.executeMention(mentionedUsers.first(), authorData, channel);
            return;
        }

        let input = args.join(' ');

        if (args.length > 0) {
            if (guild) {
                let member: GuildMember;
                try {
                    member = await ServerUtils.findMember(guild, input);
                } catch (error) {
                    this.msgSender.send(
                        channel,
                        authorData.LangCode,
                        MessageName.retrieveServerMembersError
                    );
                    this.logger.error(this.logs.retrieveServerMembersError, error);
                    return;
                }

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
        let zone: string;
        try {
            let userData = await this.userRepo.getUserData(mentionedUser.id);
            zone = userData.TimeZone;
        } catch (error) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.retrieveUserDataError);
            this.logger.error(this.logs.retrieveUserDataError, error);
            return;
        }

        if (!zone) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.noZoneSetUser, [
                { name: '{USER_ID}', value: mentionedUser.id },
            ]);
            return;
        }

        let time = this.zoneService.getMomentInZone(zone);
        let timeFormat = this.timeFormatService.findTimeFormat(authorData.TimeFormat);

        this.msgSender.send(channel, authorData.LangCode, MessageName.timeUserSuccess, [
            {
                name: '{TIME}',
                value: time.format(`${timeFormat.dateFormat} ${timeFormat.timeFormat}`),
            },
            { name: '{USER}', value: mentionedUser.username },
            { name: '{ZONE}', value: zone },
        ]);
    }

    private async executeZone(
        zoneInput: string,
        authorData: UserData,
        channel: TextChannel | DMChannel
    ): Promise<void> {
        let zone = this.zoneService.findZone(zoneInput);
        if (!zone) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.zoneNotFound);
            return;
        }

        let time = this.zoneService.getMomentInZone(zone);
        let timeFormat = this.timeFormatService.findTimeFormat(authorData.TimeFormat);

        this.msgSender.send(channel, authorData.LangCode, MessageName.timeZoneSuccess, [
            {
                name: '{TIME}',
                value: time.format(`${timeFormat.dateFormat} ${timeFormat.timeFormat}`),
            },
            { name: '{ZONE}', value: zone },
        ]);
    }

    private async executeSelf(
        authorData: UserData,
        channel: TextChannel | DMChannel
    ): Promise<void> {
        let zone = authorData.TimeZone;
        if (!zone) {
            this.msgSender.send(channel, authorData.LangCode, MessageName.noZoneSetSelf);
            return;
        }

        let time = this.zoneService.getMomentInZone(zone);
        let timeFormat = this.timeFormatService.findTimeFormat(authorData.TimeFormat);

        this.msgSender.send(channel, authorData.LangCode, MessageName.timeSelfSuccess, [
            {
                name: '{TIME}',
                value: time.format(`${timeFormat.dateFormat} ${timeFormat.timeFormat}`),
            },
            { name: '{ZONE}', value: zone },
        ]);
    }
}
