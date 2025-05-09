import { I18nProvider } from '../i18n/messages';

export function isNumber(val: unknown): val is number {
    return typeof val === 'number' && !isNaN(val);
}

export function validateNumber(val: unknown, path: string, i18n: I18nProvider): string | null {
    return !isNumber(val) ? i18n.translate('error.type.number.expected', { property: path, type: typeof val }) : null;
}