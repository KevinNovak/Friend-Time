import { CommandInteraction, Message } from 'discord.js';
import { MessageRetriever } from 'discord.js-collector-utils';

import { UserData } from '../../database/entities/index.js';
import { LangCode, YesNo } from '../../models/enums/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { CollectorUtils, InteractionUtils } from '../../utils/index.js';
import { Setting } from '../index.js';

export class UserPrivateModeSetting implements Setting<UserData, boolean> {
    public name = Lang.getCom('settings.privateMode');
    public default = false;

    public displayName(langCode: LangCode): string {
        return Lang.getRef('settings.privateModeDisplay', langCode);
    }

    public value(userData: UserData): boolean {
        return userData.privateMode;
    }

    public valueOrDefault(userData?: UserData): boolean {
        return userData ? this.value(userData) ?? this.default : this.default;
    }

    public apply(userData: UserData, value: boolean): void {
        userData.privateMode = value;
    }

    public clear(userData: UserData): void {
        userData.privateMode = null;
    }

    public valueDisplayName(value: boolean, langCode: LangCode): string {
        return YesNo.Data[value.toString()].displayName(langCode);
    }

    public retriever(intr: CommandInteraction, langCode: LangCode): MessageRetriever<boolean> {
        return async (msg: Message) => {
            let privateMode = YesNo.find(msg.content);
            if (privateMode == null) {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('validationEmbeds.invalidYesNo', langCode).setFooter({
                        text: Lang.getRef('footers.collector', langCode),
                    })
                );
                return;
            }
            return privateMode;
        };
    }

    public async retrieve(intr: CommandInteraction, data: EventData): Promise<boolean> {
        await InteractionUtils.send(
            intr,
            Lang.getEmbed('promptEmbeds.privateModeUser', data.lang())
        );

        return await CollectorUtils.collectByMessage(
            intr.channel,
            intr.user,
            this.retriever(intr, data.lang()),
            async () => {
                await InteractionUtils.send(
                    intr,
                    Lang.getEmbed('resultEmbeds.collectorExpired', data.lang())
                );
            }
        );
    }
}
