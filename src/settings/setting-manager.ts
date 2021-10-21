import { BaseEntity } from 'typeorm';
import { Setting } from '.';
import { LangCode } from '../models/enums';
import { Lang } from '../services';

export class SettingManager {
    constructor(public settings: Setting<BaseEntity, any>[]) {}

    public find(input: string): Setting<BaseEntity, any> {
        return this.settings.find(setting => setting.name.toLowerCase() === input.toLowerCase());
    }

    public list(entity: BaseEntity, langCode: LangCode): string {
        return this.settings
            .map(setting => {
                let value = setting.value(entity);

                // If not set, set to default
                let isSet = value != null;
                if (!isSet) {
                    value = setting.default;
                }

                let valueDisplayName =
                    value != null
                        ? setting.valueDisplayName(value, langCode)
                        : Lang.getRef('other.na', langCode);

                return Lang.getRef('lists.settingItem', langCode, {
                    SETTING_NAME: setting.displayName(langCode),
                    SETTING_KEYWORD: setting.name,
                    SETTING_VALUE: isSet ? valueDisplayName : `*${valueDisplayName}*`,
                });
            })
            .join('\n')
            .trim();
    }
}
