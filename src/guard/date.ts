import { I18nProvider } from '../i18n/messages';
import { isString } from './string';

export function isDate(val: unknown): val is Date {
	return val instanceof Date && !isNaN(val.getTime());
}

export function isDateString(val: unknown): boolean {
	if (!isString(val)) return false;
	const date = new Date(val as string);
	if (!isNaN(date.getTime())) return true;
	if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(val as string)) return false;
	const [year, month, day] = (val as string).split('-').map(Number);
	const simpleDate = new Date(year, month - 1, day);
	return simpleDate.getFullYear() === year &&
		simpleDate.getMonth() === month - 1 &&
		simpleDate.getDate() === day;
}

export function validateDate(val: unknown, path: string, i18n: I18nProvider): string | null {
	if (isDate(val)) return null;
	if (!isString(val)) return i18n.translate('error.type.date.expected', { property: path, type: typeof val });
	if (!isDateString(val)) return i18n.translate('error.type.date.invalid_format', { property: path });
	return null;
}