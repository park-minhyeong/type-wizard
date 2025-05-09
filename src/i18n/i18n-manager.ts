import { defaultMessages, I18nProvider, MessageKey, MessageParams } from './messages';
import { koMessages } from './ko';

export type SupportedLanguage = 'en' | 'ko';

export class I18nManager implements I18nProvider {
	private static instance: I18nManager;
	private currentLanguage: SupportedLanguage;
	private providers: Record<SupportedLanguage, Record<MessageKey, string>> = {
		en: defaultMessages,
		ko: koMessages
	};

	private constructor() {
		this.currentLanguage = this.detectLanguage();
	}

	private static acceptLanguageHeader: string | null = null;

	static setAcceptLanguageHeader(header: string | null): void {
		this.acceptLanguageHeader = header;
	}
	private detectLanguage(): SupportedLanguage {
		// 브라우저 환경인 경우
		if (typeof window !== 'undefined') {
			const browserLang = window.navigator.language.toLowerCase();
			return this.getLanguageFromCode(browserLang);
		}
		// Accept-Language 헤더가 설정된 경우 (예: Postman)
		if (I18nManager.acceptLanguageHeader) {
			const languages = I18nManager.acceptLanguageHeader.split(',');
			const primaryLang = languages[0].trim().toLowerCase();
			return this.getLanguageFromCode(primaryLang);
		}

		return 'en';
	}

	private getLanguageFromCode(langCode: string): SupportedLanguage {
		const supportedLanguages: Record<string, SupportedLanguage> = {
			'ko': 'ko',
			'ko-kr': 'ko',
			'en': 'en',
			'en-us': 'en',
			'en-gb': 'en'
		};

		return supportedLanguages[langCode] || 'en';
	}

	static getInstance(): I18nManager {
		if (!I18nManager.instance) {
			I18nManager.instance = new I18nManager();
		}
		return I18nManager.instance;
	}

	setLanguage(lang: SupportedLanguage): void {
		this.currentLanguage = lang;
	}

	getCurrentLanguage(): SupportedLanguage {
		return this.currentLanguage;
	}

	translate(key: MessageKey, params?: MessageParams): string {
		const template = this.providers[this.currentLanguage][key];
		if (!template) return key;

		return template.replace(/\${(\w+)}/g, (_, param) => {
			return params?.[param]?.toString() ?? param;
		});
	}
}
