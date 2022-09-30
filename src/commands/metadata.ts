import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';

import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';
import { Args } from './index.js';

export const ChatCommandMetadata: {
    [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
} = {
    BOT: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.bot'),
        description: Lang.getRef('commandDescs.bot', Language.Default),
        dm_permission: false,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.list'),
                description: Lang.getRef('commandDescs.botList', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.botView', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.bot'),
                        description: 'Bot.',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: Lang.getRef('commandDescs.botEdit', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.bot'),
                        description: 'Bot.',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                    {
                        name: Lang.getCom('arguments.setting'),
                        description: 'Setting.',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: [
                            {
                                name: Lang.getCom('settings.timeZone'),
                                value: Lang.getCom('settings.timeZone'),
                            },
                            {
                                name: Lang.getCom('settings.dateFormat'),
                                value: Lang.getCom('settings.dateFormat'),
                            },
                        ],
                    },
                    {
                        name: Lang.getCom('arguments.reset'),
                        description: 'Reset setting to default?',
                        type: ApplicationCommandOptionType.Boolean,
                        required: false,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.remove'),
                description: Lang.getRef('commandDescs.botRemove', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.bot'),
                        description: 'Bot.',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
        ],
    },
    HELP: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.help'),
        description: Lang.getRef('commandDescs.help', Language.Default),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                ...Args.HELP_OPTION,
                required: true,
            },
        ],
    },
    INFO: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.info'),
        description: Lang.getRef('commandDescs.info', Language.Default),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                ...Args.INFO_OPTION,
                required: true,
            },
        ],
    },
    LIST: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.list'),
        description: Lang.getRef('commandDescs.list', Language.Default),
        dm_permission: false,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.listView', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.toggle'),
                description: Lang.getRef('commandDescs.listToggle', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.zone'),
                        description: 'Time zone name. Ex: America/New_York',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
        ],
    },
    MAP: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.map'),
        description: Lang.getRef('commandDescs.map', Language.Default),
        dm_permission: true,
        default_member_permissions: undefined,
    },
    ME: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.me'),
        description: Lang.getRef('commandDescs.me', Language.Default),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.meView', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: Lang.getRef('commandDescs.meEdit', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.setting'),
                        description: 'Setting.',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: [
                            {
                                name: Lang.getCom('settings.timeZone'),
                                value: Lang.getCom('settings.timeZone'),
                            },
                            {
                                name: Lang.getCom('settings.dateFormat'),
                                value: Lang.getCom('settings.dateFormat'),
                            },
                            {
                                name: Lang.getCom('settings.timeFormat'),
                                value: Lang.getCom('settings.timeFormat'),
                            },
                            {
                                name: Lang.getCom('settings.privateMode'),
                                value: Lang.getCom('settings.privateMode'),
                            },
                            {
                                name: Lang.getCom('settings.reminders'),
                                value: Lang.getCom('settings.reminders'),
                            },
                            {
                                name: Lang.getCom('settings.language'),
                                value: Lang.getCom('settings.language'),
                            },
                        ],
                    },
                    {
                        name: Lang.getCom('arguments.reset'),
                        description: 'Reset setting to default?',
                        type: ApplicationCommandOptionType.Boolean,
                        required: false,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.remove'),
                description: Lang.getRef('commandDescs.meRemove', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
        ],
    },
    SERVER: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.server'),
        description: Lang.getRef('commandDescs.server', Language.Default),
        dm_permission: false,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.view'),
                description: Lang.getRef('commandDescs.serverView', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.edit'),
                description: Lang.getRef('commandDescs.serverEdit', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.setting'),
                        description: 'Setting.',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                        choices: [
                            {
                                name: Lang.getCom('settings.timeZone'),
                                value: Lang.getCom('settings.timeZone'),
                            },
                            {
                                name: Lang.getCom('settings.timeFormat'),
                                value: Lang.getCom('settings.timeFormat'),
                            },
                            {
                                name: Lang.getCom('settings.autoDetect'),
                                value: Lang.getCom('settings.autoDetect'),
                            },
                            {
                                name: Lang.getCom('settings.list'),
                                value: Lang.getCom('settings.list'),
                            },
                            {
                                name: Lang.getCom('settings.reminders'),
                                value: Lang.getCom('settings.reminders'),
                            },
                            {
                                name: Lang.getCom('settings.language'),
                                value: Lang.getCom('settings.language'),
                            },
                        ],
                    },
                    {
                        name: Lang.getCom('arguments.reset'),
                        description: 'Reset setting to default?',
                        type: ApplicationCommandOptionType.Boolean,
                        required: false,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.remove'),
                description: Lang.getRef('commandDescs.serverRemove', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
        ],
    },
    SET: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.set'),
        description: Lang.getRef('commandDescs.set', Language.Default),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.me'),
                description: Lang.getRef('commandDescs.setMe', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.user'),
                description: Lang.getRef('commandDescs.setUser', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.user'),
                        description: 'User or bot.',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
        ],
    },
    SETUP: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.setup'),
        description: Lang.getRef('commandDescs.setup', Language.Default),
        dm_permission: false,
        default_member_permissions: undefined,
    },
    TIME: {
        type: ApplicationCommandType.ChatInput,
        name: Lang.getCom('chatCommands.time'),
        description: Lang.getRef('commandDescs.time', Language.Default),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                name: Lang.getCom('subCommands.server'),
                description: Lang.getRef('commandDescs.timeServer', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: Lang.getCom('subCommands.user'),
                description: Lang.getRef('commandDescs.timeUser', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.user'),
                        description: 'User or bot.',
                        type: ApplicationCommandOptionType.User,
                        required: true,
                    },
                ],
            },
            {
                name: Lang.getCom('subCommands.zone'),
                description: Lang.getRef('commandDescs.timeZone', Language.Default),
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: Lang.getCom('arguments.zone'),
                        description: 'Time zone name. Ex: America/New_York',
                        type: ApplicationCommandOptionType.String,
                        required: true,
                    },
                ],
            },
        ],
    },
};

export const MessageCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {};

export const UserCommandMetadata: {
    [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {};
