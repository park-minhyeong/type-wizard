import { I18nProvider } from '../i18n/messages';

export function isBoolean(val: unknown): val is boolean {
    return typeof val === 'boolean';
}

export function validateBoolean(val: unknown, path: string, i18n: I18nProvider): string | null {
    return !isBoolean(val) ? i18n.translate('error.type.boolean.expected', { property: path, type: typeof val }) : null;
}