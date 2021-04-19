import {of as observableOf, from as observableFrom, BehaviorSubject, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {
	ClientContext, CookieOptions, CookieService, PreloadService, Session, TranslationService,
	Utilities as _util
} from '@cmi/viaduc-web-core';
import {SeoService} from './seo.service';

const languageKey = 'viaduc_language';

@Injectable()
export class ContextService {

	public context: BehaviorSubject<ClientContext>;

	private _languageCookieOptions: CookieOptions = new CookieOptions({
		path: '/',
		expires: new Date(new Date().getDate() + 365)
	});

	constructor(private _context: ClientContext,
				private _cookieService: CookieService,
				private _preloadService: PreloadService,
				private _txt: TranslationService,
				private _seo: SeoService) {
		this.context = new BehaviorSubject<ClientContext>(this._context);

		const language = this._cookieService.get(languageKey);
		if (!_util.isEmpty(language)) {
			this._context.language = language;
		}

		this._context.loadingLanguage = this._context.language;

		this._preloadService.translationsLoaded.subscribe(translations => {
			if (!translations) {
				return;
			}

			if (translations && translations.language === this._context.loadingLanguage) {
				this._onLanguageUpdated(this._context.loadingLanguage);
			}
		});
	}

	public updateLanguage(language: string): Observable<boolean> {
		this._cookieService.put(languageKey, language, this._languageCookieOptions);
		this._seo.setLanguageInfo(language);

		if (language !== this._context.language) {
			this._context.loadingLanguage = language;
			// console.log('ContextService.updateLanguage: ' + this._context.language + '->' + language, this._preloadService.hasTranslationsFor(language));
			if (this._preloadService.hasTranslationsFor(language)) {
				this._onLanguageUpdated(language);
			} else {
				return observableFrom(this._preloadService.loadTranslationsFor(language).then(() => {
					return true;
				}));
			}
		}

		return observableOf(true);
	}

	public updateSession(session: Session): void {
		this._context.currentSession = session;
		this.context.next(this._context);
	}

	private _onLanguageUpdated(language: string): void {
		this._context.language = language;
		this._context.loadingLanguage = undefined;
		this._txt.update();
		this._seo.updatePageInfo(null);
		this.context.next(this._context);
	}

}
