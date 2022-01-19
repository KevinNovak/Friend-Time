import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    Related,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { GuildData } from './index.js';

@Entity('guild_list_item')
@Unique(['guild', 'timeZone'])
export class GuildListItemData extends BaseEntity {
    // IDs
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 32 })
    timeZone: string;

    // Timestamps
    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    modified: Date;

    // Relations
    @ManyToOne(() => GuildData, guildData => guildData.listItems, { onDelete: 'CASCADE' })
    guild: Related<GuildData>;
}
