import { MessageKey } from './messages';

export const koMessages: Record<MessageKey, string> = {
	'error.type.not_object': '객체가 아닙니다',
	'error.type.unexpected_property': '예상하지 못한 속성: ${property}',
	'error.type.missing_required': '${property}: 필수 속성이 누락되었습니다',
	'error.type.string.expected': '${property}: 문자열이어야 하는데 ${type}입니다',
	'error.type.number.expected': '${property}: 숫자여야 하는데 ${type}입니다',
	'error.type.boolean.expected': '${property}: 불리언이어야 하는데 ${type}입니다',
	'error.type.date.expected': '${property}: 날짜 또는 날짜 문자열이어야 합니다. 현재 타입: ${type}',
	'error.type.date.invalid_format': '${property}: 날짜 형식이 잘못되었습니다. YYYY-MM-DD 형식을 사용해주세요 (예: 1993-01-01)',
	'error.type.date.invalid': '${property}: 유효하지 않은 날짜입니다',
	'error.type.date_string.invalid': '${property}: 유효하지 않은 날짜 문자열입니다',
	'error.type.object.expected': '${property}: 객체여야 합니다',
	'error.type.array.expected': '${property}: 배열이어야 합니다',
	'error.type.array.item_invalid': '${property}: 유효하지 않은 배열 요소입니다 (${type})',
	'error.type.enum.not_allowed': '${property}: \'${value}\' 값은 허용되지 않습니다 (허용: ${allowed})',
	'error.type.json.expected': '${property}: JSON 객체 또는 배열이어야 합니다'
};
