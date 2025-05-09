import { I18nProvider } from '../i18n/messages';
import { Schema } from '../types/TypeGuard';

export function isObject(val: unknown): val is object {
    return typeof val === 'object' && val !== null;
}

export function validateObject(
    val: unknown,
    path: string,
    schema: Schema | ((v: unknown) => boolean),
    i18n: I18nProvider
): string | null {
    if (!isObject(val)) {
        return i18n.translate('error.type.object.expected', { property: path });
    }
    return null;
}