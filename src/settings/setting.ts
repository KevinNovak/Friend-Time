import { CommandInteraction, Snowflake } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';
import { BaseEntity } from 'typeorm';

import { LangCode } from '../enums/index.js';
import { Display } from '../models/common/index.js';
import { EventData } from '../models/internal-models.js';

export interface Setting<T1 extends BaseEntity, T2> extends Display {
    name: string;
    default?: T2;
    value(entity: T1): T2;
    valueOrDefault(entity?: T1): T2;
    apply(entity: T1, value: T2): void;
    clear(entity: T1): void;
    valueDisplayName(value: T2, langCode: LangCode): string;
    retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever<T2>;
    retrieve(intr: CommandInteraction, data: EventData, target?: Snowflake): Promise<T2>;
}
