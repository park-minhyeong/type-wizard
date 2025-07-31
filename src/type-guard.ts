import { TypeDescriptor, TypeGuard } from './types/TypeGuard';
import { I18nManager } from './i18n/i18n-manager';
import type { I18nProvider } from './i18n/messages';
import { isString, validateString } from './guard/string';
import { isNumber, validateNumber } from './guard/number';
import { isBoolean, validateBoolean } from './guard/boolean';
import { isArray, validateArray } from './guard/array';
import { isObject, validateObject } from './guard/object';
import { isValidEnum, validateEnum } from './guard/enum';
import { isDate, isDateString, validateDate } from './guard/date';
import { isJson, validateJson } from './guard/json';



export function createTypeGuard<T>(
	schema: Record<keyof T, TypeDescriptor>
): TypeGuard<T> {
	const i18n = I18nManager.getInstance();
	const baseGuard = (schemaArg: Record<keyof T, TypeDescriptor>) => {
		const guard = ((value: unknown): value is T => {
			if (typeof value !== 'object' || value === null) return false;
			const schemaKeys = Object.keys(schemaArg);
			const valueKeys = Object.keys(value as object);
			if (valueKeys.some(k => !schemaKeys.includes(k))) return false;
			for (const key in schemaArg) {
				const desc = schemaArg[key];
				if (!Object.prototype.hasOwnProperty.call(value, key)) {
					if (!desc.optional) return false;
					continue;
				}
				const val = (value as any)[key];
				if (!validateType(val, desc)) return false;
			}
			return true;
		}) as TypeGuard<T>;
		guard.optional = () =>
			baseGuard(
				Object.fromEntries(
					Object.entries(schemaArg).map(([k, v]) => {
						if (typeof v === "object" && v !== null && !Array.isArray(v)) {
							return [k, { ...v, optional: true }];
						} else {
							throw new Error(`TypeDescriptor for key '${k}' is not an object: ${JSON.stringify(v)}`);
						}
					})
				) as Record<keyof T, TypeDescriptor>
			);
		guard.message = (value: unknown): string | null => {
			if (typeof value !== 'object' || value === null) return i18n.translate('error.type.not_object');
			const schemaKeys = Object.keys(schemaArg);
			const valueKeys = Object.keys(value as object);
			for (const k of valueKeys) {
				if (!schemaKeys.includes(k)) return i18n.translate('error.type.unexpected_property', { property: k });
			}
			for (const key in schemaArg) {
				const desc = schemaArg[key];
				if (!Object.prototype.hasOwnProperty.call(value, key)) {
					if (!desc.optional) return i18n.translate('error.type.missing_required', { property: key });
					continue;
				}
				const val = (value as any)[key];
				const msg = validateTypeMessage(val, desc, key, i18n);
				if (msg) return msg;
			}
			return null;
		};
		return guard;
	};
	return baseGuard(schema);
}

function validateTypeMessage(val: unknown, desc: TypeDescriptor, path: string, i18n: I18nProvider): string | null {
	if (desc.nullable && val === null) return null;

	switch (desc.type) {
		case 'string':
			const stringError = validateString(val, path, i18n);
			if (stringError) return stringError;
			const stringEnumError = validateEnum(val, desc.enum, path, i18n);
			if (stringEnumError) return stringEnumError;
			return null;

		case 'number':
			const numberError = validateNumber(val, path, i18n);
			if (numberError) return numberError;
			const numberEnumError = validateEnum(val, desc.enum, path, i18n);
			if (numberEnumError) return numberEnumError;
			return null;

		case 'boolean':
			return validateBoolean(val, path, i18n);

		case 'date':
			return validateDate(val, path, i18n);

		case 'json':
			const jsonError = validateJson(val, path, i18n);
			if (jsonError) return jsonError;
			
			// of 속성이 있으면 추가 검증
			if (desc.of) {
				if (typeof desc.of === 'function') {
					if (!desc.of(val)) {
						return i18n.translate('error.type.json.expected', { 
							property: path, 
							type: 'invalid structure',
							details: '커스텀 검증 함수를 통과하지 못했습니다'
						});
					}
				} else if (typeof desc.of === 'object') {
					// JSON 객체의 경우 내부 구조 검증
					if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
						// 각 필드에 대해 검증
						for (const [key, fieldDesc] of Object.entries(desc.of)) {
							if (Object.prototype.hasOwnProperty.call(val, key)) {
								const fieldError = validateTypeMessage((val as any)[key], fieldDesc, `${path}.${key}`, i18n);
								if (fieldError) return fieldError;
							}
						}
					}
				}
			}
			return null;

		case 'object':
			const objectError = validateObject(val, path, desc.of, i18n);
			if (objectError) return objectError;
			
			if (!isObject(val)) return null; // 이미 validateObject에서 체크했지만 타입 안전성을 위해
			
			if (typeof desc.of === 'object') {
				const guard = createTypeGuard<Record<string, unknown>>(desc.of);
				const errorMessage = guard.message(val);
				return errorMessage ? `${path}.${errorMessage}` : null;
			}
			return null;

		case 'array':
			const arrayError = validateArray(val, path, desc.of, i18n);
			if (arrayError) return arrayError;
			
			if (!isArray(val)) return null; // 이미 validateArray에서 체크했지만 타입 안전성을 위해
			
			if (typeof desc.of === 'object') {
				const guard = createTypeGuard<{ item: unknown }>({ item: desc.of });
				for (let i = 0; i < val.length; ++i) {
					const msg = guard.message({ item: val[i] });
					if (msg) return `${path}[${i}].${msg}`;
				}
			}
			return null;

		default:
			return `${path}: unknown type descriptor`;
	}
}


function validateType(val: unknown, desc: TypeDescriptor): boolean {
	if (desc.nullable && val === null) return true;

	switch (desc.type) {
		case 'string':
			if (!isString(val)) return false;
			if (!isValidEnum(val, desc.enum)) return false;
			return true;

		case 'number':
			if (!isNumber(val)) return false;
			if (!isValidEnum(val, desc.enum)) return false;
			return true;

		case 'boolean':
			return isBoolean(val);

		case 'date':
			return isDate(val) || isDateString(val);

		case 'json':
			if (!isJson(val)) return false;
			
			// of 속성이 있으면 추가 검증
			if (desc.of) {
				if (typeof desc.of === 'function') {
					return desc.of(val);
				} else if (typeof desc.of === 'object') {
					// JSON 객체의 경우 내부 구조 검증
					if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
						for (const [key, fieldDesc] of Object.entries(desc.of)) {
							if (Object.prototype.hasOwnProperty.call(val, key)) {
								if (!validateType((val as any)[key], fieldDesc)) {
									return false;
								}
							}
						}
					}
				}
			}
			return true;

		case 'object':
			if (!isObject(val) || Array.isArray(val)) return false;
			if (typeof desc.of === 'function') return desc.of(val);
			if (typeof desc.of === 'object') return createTypeGuard(desc.of)(val);
			return false;

		case 'array':
			if (!isArray(val)) return false;
			if (typeof desc.of === 'function') return val.every(desc.of);
			if (typeof desc.of === 'object') {
				const guard = createTypeGuard<{ item: unknown }>({ item: desc.of });
				return val.every((item) => guard({ item }));
			}
			return false;

		default:
			return false;
	}
}
