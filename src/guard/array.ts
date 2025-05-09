import { I18nProvider } from '../i18n/messages';
import { TypeDescriptor } from '../types/TypeGuard';

export function isArray(val: unknown): val is unknown[] {
    return Array.isArray(val);
}

export function validateArray(
    val: unknown,
    path: string,
    itemDescriptor: TypeDescriptor | ((v: unknown) => boolean),
    i18n: I18nProvider
): string | null {
    if (!isArray(val)) {
        return i18n.translate('error.type.array.expected', { property: path });
    }
    if (typeof itemDescriptor === 'function') {
        for (let i = 0; i < val.length; i++) {
            if (!itemDescriptor(val[i])) {
                return i18n.translate('error.type.array.item_invalid', {
                    property: `${path}[${i}]`,
                    type: typeof val[i]
                });
            }
        }
    }

    return null;
}