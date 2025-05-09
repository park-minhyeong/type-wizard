export type MessageKey =
	| 'error.type.not_object'
	| 'error.type.unexpected_property'
	| 'error.type.missing_required'
	| 'error.type.string.expected'
	| 'error.type.number.expected'
	| 'error.type.boolean.expected'
	| 'error.type.date.expected'
	| 'error.type.date.invalid'
	| 'error.type.date.invalid_format'
	| 'error.type.date_string.invalid'
	| 'error.type.object.expected'
	| 'error.type.array.expected'
	| 'error.type.array.item_invalid'
	| 'error.type.enum.not_allowed';

export type MessageParams = Record<string, string | number | boolean | undefined>;

export interface I18nProvider {
	translate(key: MessageKey, params?: MessageParams): string;
}

export const defaultMessages: Record<MessageKey, string> = {
	'error.type.not_object': 'value is not an object',
	'error.type.unexpected_property': 'unexpected property: ${property}',
	'error.type.missing_required': '${property}: missing required property',
	'error.type.string.expected': '${property}: expected string, got ${type}',
	'error.type.number.expected': '${property}: expected number, got ${type}',
	'error.type.boolean.expected': '${property}: expected boolean, got ${type}',
	'error.type.date.expected': '${property}: expected date or date string, got ${type}',
	'error.type.date.invalid_format': '${property}: invalid date format.',
	'error.type.date.invalid': '${property}: invalid date',
	'error.type.date_string.invalid': '${property}: invalid date string',
	'error.type.object.expected': '${property}: expected object',
	'error.type.array.expected': '${property}: expected array',
	'error.type.array.item_invalid': '${property}: invalid array item, got ${type}',
	'error.type.enum.not_allowed': '${property}: value \'${value}\' is not allowed (allowed: ${allowed})'
};

export class DefaultI18nProvider implements I18nProvider {
	constructor(private messages: Record<MessageKey, string> = defaultMessages) { }

	translate(key: MessageKey, params?: MessageParams): string {
		const template = this.messages[key];
		if (!template) return key;

		return template.replace(/\${(\w+)}/g, (_, param) => {
			return params?.[param]?.toString() ?? param;
		});
	}
}

export const defaultI18nProvider = new DefaultI18nProvider();
