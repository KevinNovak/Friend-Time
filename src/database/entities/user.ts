import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

import { DateFormatOption, LangCode, TimeFormatOption } from '../../enums/index.js';

@Entity('user')
@Unique(['discordId'])
export class UserData extends BaseEntity {
    // IDs
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({ type: 'varchar', length: 20 })
    discordId: string;

    // Settings
    @Column({ type: 'varchar', length: 32, nullable: true })
    timeZone?: string;

    @Column({ type: 'varchar', length: 9, nullable: true })
    dateFormat?: DateFormatOption;

    @Column({ type: 'varchar', length: 16, nullable: true })
    timeFormat?: TimeFormatOption;

    @Column({ nullable: true })
    privateMode?: boolean;

    @Column({ nullable: true })
    reminders?: boolean;

    @Column({ type: 'varchar', length: 13, nullable: true })
    language?: LangCode;

    // Timestamps
    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    modified: Date;
}
