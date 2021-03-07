import { MessageRetriever } from 'discord.js-collector-utils';
import { Message, Snowflake } from 'discord.js-light';
import { BaseEntity } from 'typeorm';

import { Display, Keyword } from '../models/common';
import { LangCode } from '../models/enums';
import { EventData } from '../models/internal-models';

export interface Setting<T1 extends BaseEntity, T2 extends any> extends Keyword, Display {
    default?: T2;
    value(entity: T1): T2;
    valueOrDefault(entity?: T1): T2;
    apply(entity: T1, value: T2): void;
    clear(entity: T1): void;
    valueDisplayName(value: T2, langCode: LangCode): string;
    retriever(langCode: LangCode): MessageRetriever;
    retrieve(msg: Message, args: string[], data: EventData, target?: Snowflake): Promise<T2>;
}
