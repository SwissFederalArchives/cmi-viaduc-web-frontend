import {ActiveToast, ToastrService} from 'ngx-toastr';
import {CoreOptions, Entity, OrderItem} from '@cmi/viaduc-web-core';
import {AuthenticationService} from './authentication.service';
import {Router} from '@angular/router';
import {UrlService} from './url.service';
import {ShoppingCartService} from './shoppingCart.service';
import {of} from 'rxjs';
import {AuthorizationService} from './authorization.service';

describe('ShoppingCartService', () => {
	let shoppingCartService: ShoppingCartService;
	let serverBasket: OrderItem[] = [
		<OrderItem> {
			id: '1',
			veId: 1,
			title: 'History of Darth Vader\'s lightsaber',
			einsichtsbewilligungNotwendig: false
		}, <OrderItem> {
			id: '2',
			veId: 2,
			title: 'Han Solos Milenium Falken?!',
			einsichtsbewilligungNotwendig: true
		}
	];
	beforeEach(() => {
		let toastr: ToastrService = <any> {
			info: (message, title) => {
				return <ActiveToast<any>> {
					message: message,
					onTap: of(null),
				};
			},
		};
		let context: any = <any> {
			authenticated: true,
			_defaultLanguage: 'de',
		};
		let authentication: AuthenticationService;
		let authorization: AuthorizationService;

		let router: Router = <any> {
			navigateByUrl: navigateUrl => {}
		};
		let http: any = <any> {
			get: getUrl => {
				if (getUrl === 'www.scsTest.ch/api/Order/GetBasket') {
					return of(serverBasket);
				}
			},
			post: (postUrl, item) => {
				if (postUrl === 'www.scsTest.ch/api/Order/AddToBasket') {
					serverBasket.push(item);
					return of(item);
				}
				if (postUrl.startsWith('www.scsTest.ch/api/Order/AddUnknowToBasket?signatur=')) {
					let orderItem = <OrderItem> {
						id: item.archiveRecordId,
						veId: item.archiveRecordId,
						title: item.title,
					};
					return of(orderItem);
				}
			}
		};
		let url: UrlService = <any> {
			getDetailUrl: id => {
				return '/archiv/einheit/' + id;
			}
		};
		let options: CoreOptions = <any>{
			serverUrl: 'www.scsTest.ch',
			privatePort: '',
		};
		let cfg: any = <any> {

		};
		let txt: any = <any>{
			translate: (text, key) => {
				return text;
			}
		};
		let searchService: any = <any> {};
		shoppingCartService = new ShoppingCartService(toastr, context, authentication, authorization, router, http, url, options, cfg, txt, searchService);
	});

	describe('When a VE has a primaryDataLink and downloadIsAllowed set to true', () => {
		let entity = <Entity>{
			isDownloadAllowed: true,
			primaryDataLink: ['Behaeltnisverknuepfung'],
		};
		it('Should downloadPossible be true', () => {
			expect(shoppingCartService.downloadPossible(entity)).toBe(true);
		});
		it('Should canDownload be true', () => {
			expect(shoppingCartService.canDownload(entity)).toBe(true);
		});
	});
	describe('When a VE has no primaryDataLink and downloadIsAllowed set to true', () => {
		let entity = <Entity>{
			isDownloadAllowed: true,
			primaryDataLink: null,
		};
		it('Should downloadPossible be false', () => {
			expect(shoppingCartService.downloadPossible(entity)).toBe(false);
		});
		it('Should canDownload be false', () => {
			expect(shoppingCartService.canDownload(entity)).toBe(false);
		});
	});
	describe('When a VE has no primaryDataLink and downloadIsAllowed set to true', () => {
		let entity = <Entity>{
			isDownloadAllowed: true,
			primaryDataLink: null,
		};
		it('Should downloadPossible be false', () => {
			expect(shoppingCartService.downloadPossible(entity)).toBe(false);
		});
		it('Should canDownload be false', () => {
			expect(shoppingCartService.canDownload(entity)).toBe(false);
		});
	});
	describe('When a VE has a primaryDataLink and downloadIsAllowed set to false', () => {
		let entity = <Entity>{
			isDownloadAllowed: false,
			primaryDataLink: ['Behaeltnisverknuepfung'],
		};
		it('Should downloadPossible be true', () => {
			expect(shoppingCartService.downloadPossible(entity)).toBe(true);
		});
		it('Should canDownload be false', () => {
			expect(shoppingCartService.canDownload(entity)).toBe(false);
		});
	});
	describe('When getBasket is called', () => {
		it('Should the length of items be 2', () => {
			shoppingCartService.getBasket().subscribe(b => {
				expect(b.length).toBe(2);
			});
		});
		it('Should the title of the first VE be correct', () => {
			shoppingCartService.getBasket().subscribe(b => {
				expect(b[0].title).toBe('History of Darth Vader\'s lightsaber');
			});
		});
		it('Should the id of the first VE be 1', () => {
			shoppingCartService.getBasket().subscribe(b => {
				expect(b[0].veId).toBe(1);
			});
		});
		it('Should the title of the second VE be correct', () => {
			shoppingCartService.getBasket().subscribe(b => {
				expect(b[1].title).toBe('Han Solos Milenium Falken?!');
			});
		});
		it('Should the id of the second VE be 2', () => {
			shoppingCartService.getBasket().subscribe(b => {
				expect(b[1].veId).toBe(2);
			});
		});
	});
	describe('When the basket contains 1 item with and 1 without einsichtsgeuschNotwendig set to true getOrderableItems', () => {
		it('Should only find 1 item' , () => {
			shoppingCartService.getOrderableItems().subscribe(items => {
				expect(items.length).toBe(1);
			});
		});
		it('Should only return none einsichtsgesuchNotwendig items' , () => {
			shoppingCartService.getOrderableItems().subscribe(items => {
				expect(items.filter(i => i.einsichtsbewilligungNotwendig).length).toBe(0);
			});
		});
	});
	describe('When the basket contains 1 item with and 1 without einsichtsgeuschNotwendig set to true getItemsWhereEinsichtsGesuchNoeting', () => {
		it('Should only find 1 item' , () => {
			shoppingCartService.getItemsWhereEinsichtsGesuchNoeting().subscribe(items => {
				expect(items.length).toBe(1);
			});
		});
		it('Should only return none einsichtsgesuchNotwendig items' , () => {
			shoppingCartService.getItemsWhereEinsichtsGesuchNoeting().subscribe(items => {
				expect(items.filter(i => !i.einsichtsbewilligungNotwendig).length).toBe(0);
			});
		});
	});
});
