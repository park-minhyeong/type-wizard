import { I18nProvider } from "../i18n/messages";

export function createEnumGuard<T extends readonly unknown[]>(allowed: T) {
	return (v: unknown): v is T[number] => {
		if (allowed.length === 0) return false;
		return typeof v === typeof allowed[0] && (allowed as readonly unknown[]).includes(v);
	};
}

export function validateEnum(val: unknown, enumValues: readonly unknown[] | undefined, path: string, i18n: I18nProvider): string | null {
	if (!enumValues) return null;
	const guard = createEnumGuard(enumValues);
	return !guard(val) ? i18n.translate('error.type.enum.not_allowed', {
		property: path,
		value: String(val),
		allowed: enumValues.join(', ')
	}) : null;
}

export function isValidEnum(val: unknown, enumValues: readonly unknown[] | undefined): boolean {
	if (!enumValues) return true;
	const guard = createEnumGuard(enumValues);
	return guard(val);
}