import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';

declare const jQuery: any;

@Injectable()
export class SeoService {

	private _html: any;
	private _head: any;
	private _siteTitle;

	constructor(private _title: Title, private _txt: TranslationService) {
		this._html = jQuery('html');
		this._head = this._html.find('head');
		this._siteTitle = this._txt.get('header.title', 'Online-Zugang zum Bundesarchiv');
	}

	public getTitle(): string {
		return this._title.getTitle();
	}

	public setTitle(title: string) {
		let seoTitle = title + ((title && title.length > 0) ? ' - ' : '') + this._siteTitle;
		this._title.setTitle(seoTitle);
	}

	public getElement(tag: string, attribute: string, value: string): any {
		return this._assertElement(tag, attribute, value);
	}

	public getMeta(name: string): string {
		return this._assertMeta(name).attr('content');
	}

	public setMeta(name: string, content: string) {
		this._assertMeta(name).attr('content', content);
	}

	private _assertElement(tag: string, attribute: string, attrValue: string): any {
		let elem: any;
		elem = this._head.find(tag + '[' + attribute + '=' + attrValue + ']');
		if (_util.isEmpty(elem)) {
			elem = jQuery('<' + tag + '></' + tag + '>').attr(attribute, attrValue);
			this._head.append(elem);
		}
		return elem;
	}

	private _assertMeta(name: string): any {
		return this._assertElement('meta', 'name', name);
	}

	public setLanguageInfo(language: string): void {
		try {
			this._html.attr('lang', language);
			this.setMeta('language', language);
		} catch (ex) {
			console.error(ex);
		}
	}

	public updatePageInfo(url: string): void {
		this._siteTitle = this._txt.get('header.title', 'Online-Zugang zum Bundesarchiv');
		let description = this._txt.get('page.description', 'recherche.admin.ch');

		try {
			this.setTitle('');
			this.setMeta('description', description);
		} catch (ex) {
			console.error(ex);
		}
	}
}
