import { LangCode } from '../services/language';

export interface Language {
    langCode: LangCode;
    commands: Commands;
    serverConfig: ServerConfig;
    messages: Messages;
}

export interface Commands {
    set: string;
    find: string;
    map: string;
    clear: string;
    time: string;
    format: string;
    info: string;
    invite: string;
    support: string;
    donate: string;
}

export interface ServerConfig {
    mode: Mode;
    format: Format;
    notify: Notify;
}

export interface Mode {
    name: string;
    options: ModeOptions;
}

export interface ModeOptions {
    react: string;
    list: string;
}

export interface Format {
    name: string;
    options: FormatOptions;
}

export interface FormatOptions {
    twelve: string;
    twentyFour: string;
}

export interface Notify {
    name: string;
    options: NotifyOptions;
}

export interface NotifyOptions {
    on: string;
    off: string;
}

export interface Messages {
    helpTitle: string | string[];
    helpMessage: string | string[];
    configTitle: string | string[];
    configMessage: string | string[];
    infoTitle: string | string[];
    infoMessage: string | string[];
    setProvideZone: string | string[];
    setSuccess: string | string[];
    mapTitle: string | string[];
    mapMessage: string | string[];
    clearSuccess: string | string[];
    timeSelfSuccess: string | string[];
    timeUserSuccess: string | string[];
    timeZoneSuccess: string | string[];
    formatSuccess: string | string[];
    inviteTitle: string | string[];
    inviteMessage: string | string[];
    supportTitle: string | string[];
    supportMessage: string | string[];
    donateTitle: string | string[];
    donateMessage: string | string[];
    zoneNotFound: string | string[];
    noZoneSetReminder: string | string[];
    noZoneSetSelf: string | string[];
    noZoneSetUser: string | string[];
    invalidTimeFormat: string | string[];
    convertedTime: string | string[];
    serverOnly: string | string[];
    configNotFound: string | string[];
    noPermToSendEmbed: string | string[];
    configModeInvalidValue: string | string[];
    configModeSuccess: string | string[];
    configFormatInvalidValue: string | string[];
    configFormatSuccess: string | string[];
    configNotifyInvalidValue: string | string[];
    configNotifySuccess: string | string[];
    notAdmin: string | string[];
}
