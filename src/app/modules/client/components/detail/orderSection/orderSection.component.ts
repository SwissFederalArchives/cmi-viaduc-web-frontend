import {Component, Input} from '@angular/core';
import {AuthenticationService} from '../../../services/authentication.service';
import {ShoppingCartService} from '../../../services/shoppingCart.service';
import {ClientContext, Entity, TranslationService} from '@cmi/viaduc-web-core';
import {UrlService} from '../../../services';

@Component({
	selector: 'cmi-viaduc-order-section',
	templateUrl: 'orderSection.component.html',
	styleUrls: ['./orderSection.component.less']
})
export class OrderSectionComponent {
	@Input()
	public entity: Entity;
	public pleaseLoginText: string;
	constructor(private _context: ClientContext,
		private _authentication: AuthenticationService,
		private _scs: ShoppingCartService,
		private _txt: TranslationService,
		private _url: UrlService) {
		this._setTranslationTexts();
	}

	public get authenticated(): boolean {
		return this._context.authenticated;
	}

	public orderVe(): void {
		this.loginIfNotAuthenticated();
	}

	public loginIfNotAuthenticated() {
		if (!this._context.authenticated) {
			this._authentication.login();
		} else {
			this._scs.addToCart(this.entity).subscribe();
		}
	}

	private _setTranslationTexts() {
		const textA = this._txt.translate('Bitte melden Sie sich an, um die Unterlagen zu bestellen', 'downloadSection.pleaseLogin');
		const textB = this._txt.translate('Details unter', 'downloadSection.pleaseLoginDetailsAt');
		const registerPart = this._txt.translate('Registrieren und Identifizieren', 'downloadSection.registerAndIdentify');
		const url = this._url.getExternalRegisterAndIdentifyUrl();

		const linkPart = '<a href="' + url + '" target="_blank" rel="noopener">' + registerPart + '</a>';
		this.pleaseLoginText = `${textA} (${textB} ${linkPart})`;
	}

	public login(event: any = null) {
		if (event) {
			event.preventDefault();
		}
		this._authentication.login();
	}
}
