import { I18nProvider } from "../i18n/messages";

/**
 * JSON 값(객체 또는 배열)인지 확인하는 타입 가드 함수
 * @param val - 검사할 값
 * @returns val이 JSON 객체 또는 배열인지 여부
 */
export function isJson<T = JSON>(val: unknown): val is T {
    try {
        // null 체크
        if (val === null) {
            return false;
        }
        // 객체 또는 배열 타입 체크
        if (typeof val !== 'object') {
            return false;
        }
        // Date, RegExp, Error 등 내장 객체 체크
        if (val instanceof Date || 
            val instanceof RegExp || 
            val instanceof Error ||
            val instanceof Map ||
            val instanceof Set ||
            val instanceof WeakMap ||
            val instanceof WeakSet) {
            return false;
        }
        // 함수 체크
        if (typeof val === 'function') {
            return false;
        }
        // 배열인 경우
        if (Array.isArray(val)) {
            // 배열의 모든 요소가 JSON 직렬화 가능한지 확인
            JSON.stringify(val);
            return true;
        }
        // 객체인 경우 - 프로토타입 체크 (순수 객체인지 확인)
        const prototype = Object.getPrototypeOf(val);
        if (prototype !== Object.prototype && prototype !== null) {
            return false;
        }
        // JSON 직렬화 가능한지 확인
        JSON.stringify(val);
        return true;
    } catch (error) {
        // JSON 직렬화 중 오류가 발생하면 false 반환
        return false;
    }
}

/**
 * JSON 값 검증 함수 (createTypeGuard 시스템용)
 * @param val - 검사할 값
 * @param path - 검증 경로
 * @param i18n - i18n 제공자
 * @returns 에러 메시지 또는 null
 */
export function validateJson(val: unknown, path: string, i18n: I18nProvider): string | null {
    // null 체크
    if (val === null) {
        return i18n.translate('error.type.json.expected', { 
            property: path, 
            type: 'null',
            details: 'JSON은 null 값을 허용하지 않습니다'
        });
    }
    
    // undefined 체크
    if (val === undefined) {
        return i18n.translate('error.type.json.expected', { 
            property: path, 
            type: 'undefined',
            details: 'JSON은 undefined 값을 허용하지 않습니다'
        });
    }
    
    // 기본 타입 체크
    if (typeof val !== 'object') {
        return i18n.translate('error.type.json.expected', { 
            property: path, 
            type: typeof val,
            details: `JSON은 객체 또는 배열이어야 합니다. 현재 타입: ${typeof val}`
        });
    }
    
    try {
        // 내장 객체 체크 - 각각 구체적인 에러 메시지
        if (val instanceof Date) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'Date',
                details: 'Date 객체는 JSON으로 직렬화할 수 없습니다. ISO 문자열로 변환하세요'
            });
        }
        
        if (val instanceof RegExp) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'RegExp',
                details: 'RegExp 객체는 JSON으로 직렬화할 수 없습니다. 문자열로 변환하세요'
            });
        }
        
        if (val instanceof Error) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'Error',
                details: 'Error 객체는 JSON으로 직렬화할 수 없습니다. message 속성만 사용하세요'
            });
        }
        
        if (val instanceof Map) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'Map',
                details: 'Map 객체는 JSON으로 직렬화할 수 없습니다. 일반 객체로 변환하세요'
            });
        }
        
        if (val instanceof Set) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'Set',
                details: 'Set 객체는 JSON으로 직렬화할 수 없습니다. 배열로 변환하세요'
            });
        }
        
        if (val instanceof WeakMap) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'WeakMap',
                details: 'WeakMap 객체는 JSON으로 직렬화할 수 없습니다'
            });
        }
        
        if (val instanceof WeakSet) {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'WeakSet',
                details: 'WeakSet 객체는 JSON으로 직렬화할 수 없습니다'
            });
        }
        
        // 함수 체크
        if (typeof val === 'function') {
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'function',
                details: '함수는 JSON으로 직렬화할 수 없습니다'
            });
        }
        
        // 객체인 경우 프로토타입 체크
        if (!Array.isArray(val)) {
            const prototype = Object.getPrototypeOf(val);
            if (prototype !== Object.prototype && prototype !== null) {
                const constructorName = val.constructor?.name || 'Unknown';
                return i18n.translate('error.type.json.expected', { 
                    property: path, 
                    type: constructorName,
                    details: `커스텀 클래스 인스턴스(${constructorName})는 JSON으로 직렬화할 수 없습니다. 순수 객체로 변환하세요`
                });
            }
        }
        
        // JSON 직렬화 테스트
        try {
            JSON.stringify(val);
        } catch (serializeError) {
            let errorDetails = '알 수 없는 직렬화 오류';
            
            if (serializeError instanceof Error) {
                if (serializeError.message.includes('circular')) {
                    errorDetails = '순환 참조가 감지되었습니다. 객체 간 순환 참조를 제거하세요';
                } else if (serializeError.message.includes('BigInt')) {
                    errorDetails = 'BigInt 값은 JSON으로 직렬화할 수 없습니다. Number로 변환하세요';
                } else if (serializeError.message.includes('Symbol')) {
                    errorDetails = 'Symbol 값은 JSON으로 직렬화할 수 없습니다';
                } else {
                    errorDetails = `직렬화 오류: ${serializeError.message}`;
                }
            }
            
            return i18n.translate('error.type.json.expected', { 
                property: path, 
                type: 'invalid',
                details: errorDetails
            });
        }
        
        return null;
    } catch (error) {
        // 예상치 못한 오류
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        return i18n.translate('error.type.json.expected', { 
            property: path, 
            type: 'error',
            details: `검증 중 오류 발생: ${errorMessage}`
        });
    }
}