import { I18nProvider } from '../i18n/messages';

export function isString(val: unknown): val is string {
    return typeof val === 'string';
}

export function validateString(val: unknown, path: string, i18n: I18nProvider): string | null {
    if (!isString(val)) {
        return i18n.translate('error.type.string.expected', { property: path });
    }
    return null;
}