import TypeORM from 'typeorm';
export const {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} = TypeORM;

import { LangCode, TimeFormatOption } from '../../models/enums/index.js';
import { GuildBotData, GuildListItemData } from './index.js';

@Entity('guild')
@Unique(['discordId'])
export class GuildData extends BaseEntity {
    // IDs
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 20 })
    discordId: string;

    // Settings
    @Column({ type: 'varchar', length: 32, nullable: true })
    timeZone?: string;

    @Column({ nullable: true })
    autoDetect?: boolean;

    @Column({ nullable: true })
    list?: boolean;

    @Column({ type: 'varchar', length: 16, nullable: true })
    timeFormat?: TimeFormatOption;

    @Column({ nullable: true })
    reminders?: boolean;

    @Column({ type: 'varchar', length: 13, nullable: true })
    language?: LangCode;

    // Timestamps
    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    modified: Date;

    // Relations
    @OneToMany(() => GuildBotData, botData => botData.guild)
    bots: GuildBotData[];

    @OneToMany(() => GuildListItemData, guildListItemData => guildListItemData.guild)
    listItems: GuildListItemData[];
}
