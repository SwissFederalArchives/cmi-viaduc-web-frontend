import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserSettingSection} from '../../../model/account/userSettingSection';
import {UrlService} from '../../../services/url.service';
import {ClientContext, ConfigService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-usersetting-list',
	templateUrl: 'userSettingList.component.html',
	styleUrls: ['./userSettingList.component.less']
})
export class UserSettingListComponent implements OnInit {
	public loading: boolean;
	@Input()
	public sections: UserSettingSection[];
	public menues: any[];
	constructor(private _url: UrlService, private _ctx: ClientContext, private _cfg: ConfigService, private _router: Router) {
	}

	public ngOnInit(): void {
		this.sections = this._cfg.getSetting('account.settingSections') || [];
		this.menues = Array.from(new Set(this.sections.map(s => s.menu)));
		this.setActiveMenuItem(this._router.url);
	}

	public goTo(section: UserSettingSection): void {
		let lang = this._ctx.language;
		let translatedUrl = this._url.localizeUrl(lang, section.url);
		this._router.navigate([translatedUrl]);
	}

	public getSections(menu: string): UserSettingSection[] {
		return this.sections.filter(s => s.menu === menu);
	}

	public getTranslationKeyMenu(menu: string): string {
		return 'account.userSection.' + menu;
	}

	public getTranslationKeySection(section: UserSettingSection): string {
		return 'account.userSection.' + section.displayName;
	}

	private setActiveMenuItem(url: string) {
		// Mark all inactive
		this.sections.forEach(s => s.active = false);

		let lang = this._ctx.language;
		const activeItem = this.sections.find(s => this._url.localizeUrl(lang, s.url).replace(/\/$/, '').toLowerCase() === url);
		if (activeItem) {
			activeItem.active = true;
		}
	}
}
