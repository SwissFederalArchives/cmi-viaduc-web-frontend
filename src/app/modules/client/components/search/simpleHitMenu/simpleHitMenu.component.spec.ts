import {SimpleHitMenuComponent} from '../..';
import {ElementRef} from '@angular/core';
import {CoreOptions, Entity, UiService} from '@cmi/viaduc-web-core';
import {AuthenticationService, AuthorizationService, ShoppingCartService, UrlService} from '../../../services';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {of} from 'rxjs';

describe('SimpleHitMenuComponent', () => {
	let simpleHitMenuComponent: SimpleHitMenuComponent;
	let elemRef: ElementRef;
	let scs: ShoppingCartService;
	beforeEach(() => {
		let ui = <UiService> {};
		elemRef = <ElementRef> {};
		let toastr: ToastrService = <any> {};
		let context: any = <any> {
			authenticated: true,
			_defaultLanguage: 'de',
		};

		let authService: AuthorizationService;
		let authentication: AuthenticationService;
		let router: Router = <any> {
			navigateByUrl: navigateUrl => {}
		};
		let http: any = <any> {
			get: getUrl => {
				return of([]);
			},
			post: (postUrl, item) => {
			}
		};
		let url: UrlService = <any> {};
		let options: CoreOptions = <any>{
			serverUrl: 'www.scsTest.ch',
			privatePort: '',
		};
		let cfg: any = <any> {};
		let txt: any = <any>{
			translate: (text, key) => {
				return text;
			}
		};
		let searchService: any = <any> {};

		scs = new ShoppingCartService(toastr, context, authentication, authService, router, http, url, options, cfg, txt, searchService);
		simpleHitMenuComponent = new SimpleHitMenuComponent(elemRef, ui, scs, router, url);
	});

	describe('When a VE has downloadAllowed set to true and has a primaryDataLink', () => {
		beforeEach(() => {
			simpleHitMenuComponent.entity = <Entity>{
				isDownloadAllowed: true,
				primaryDataLink: ['Behaeltnisverknuepfung'],
				canBeOrdered: true,
			};
			simpleHitMenuComponent.ngOnInit();
		});
		it('Should canDownload be true', () => {
			expect(scs.canDownload(simpleHitMenuComponent.entity)).toBe(true);
		});
		it('Should downloadPossible be true', () => {
			expect(scs.downloadPossible(simpleHitMenuComponent.entity)).toBe(true);
		});
		it('Should hasAccess be false', () => {
			expect(simpleHitMenuComponent.hasAccess).toBe(true);
		});
	});
	describe('When a VE has downloadAllowed set to false and has a primaryDataLink', () => {
		beforeEach(() => {
			simpleHitMenuComponent.entity = <Entity>{
				isDownloadAllowed: false,
				primaryDataLink: ['Behaeltnisverknuepfung'],
				canBeOrdered: true,
			};
			simpleHitMenuComponent.ngOnInit();
		});
		it('Should canDownload be false', () => {
			expect(scs.canDownload(simpleHitMenuComponent.entity)).toBe(false);
		});
		it('Should downloadPossible be true', () => {
			expect(scs.downloadPossible(simpleHitMenuComponent.entity)).toBe(true);
		});
		it('Should hasAccess be false', () => {
			expect(simpleHitMenuComponent.hasAccess).toBe(false);
		});
	});
	describe('When a VE has downloadAllowed set to false and has no primaryDataLink', () => {
		beforeEach(() => {
			simpleHitMenuComponent.entity = <Entity>{
				isDownloadAllowed: false,
				primaryDataLink: null,
				canBeOrdered: false,
			};
			simpleHitMenuComponent.ngOnInit();
		});
		it('Should canDownload be false', () => {
			expect(scs.canDownload(simpleHitMenuComponent.entity)).toBe(false);
		});
		it('Should downloadPossible be false', () => {
			expect(scs.downloadPossible(simpleHitMenuComponent.entity)).toBe(false);
		});
		it('Should hasAccess be false', () => {
			expect(simpleHitMenuComponent.hasAccess).toBe(false);
		});
	});
	describe('When a VE has downloadAllowed set to true and has no primaryDataLink', () => {
		beforeEach(() => {
			simpleHitMenuComponent.entity = <Entity>{
				isDownloadAllowed: true,
				primaryDataLink: null,
				canBeOrdered: false,
			};
			simpleHitMenuComponent.ngOnInit();
		});
		it('Should canDownload be false', () => {
			expect(scs.canDownload(simpleHitMenuComponent.entity)).toBe(false);
		});
		it('Should downloadPossible be false', () => {
			expect(scs.downloadPossible(simpleHitMenuComponent.entity)).toBe(false);
		});
		it('Should hasAccess be false', () => {
			expect(simpleHitMenuComponent.hasAccess).toBe(false);
		});
	});
});
