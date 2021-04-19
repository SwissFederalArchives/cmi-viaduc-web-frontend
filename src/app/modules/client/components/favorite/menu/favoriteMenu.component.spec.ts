import {CoreModule} from '@cmi/viaduc-web-core/';
import {TranslationService, ClientContext, ClientModel} from '@cmi/viaduc-web-core';
import {AuthenticationService, FavoriteService} from '../../../services/index';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {FavoriteMenuComponent} from './favoriteMenu.component';
import {Favorite, FavoriteList} from '../../../model';
import {ToastrService, ActiveToast, IndividualConfig} from 'ngx-toastr';

describe('favoriteMenu (PVW-63)', () => {

	let sut: FavoriteMenuComponent;
	let fixture: ComponentFixture<FavoriteMenuComponent>;
	let auth: AuthenticationService;
	let txt: TranslationService;
	let ctx: ClientContext;
	let fav: FavoriteService;
	let toastr: ToastrService;

	beforeEach(() => {
		let model: ClientModel = new ClientModel();
		ctx = new ClientContext(model);

		txt = <TranslationService>{
			get(text: string, key?: string, ...args): string {
				return text;
			},
			translate(text: string, key?: string, ...args): string {
				return text;
			}
		};

		auth = <AuthenticationService> {
			login(): void {
			}
		};

		fav = <FavoriteService> {
			addFavorite(listId: number, favorite: Favorite): Promise<Favorite> {
				favorite.id = new Date().getUTCMilliseconds();
				this.favorites.find(l => l.id === listId).items.push(favorite);
				return Promise.resolve(favorite);
			},
			addFavoriteList(name: string): Promise<FavoriteList> {
				let list = <FavoriteList> {
					id: 0,
					name: name,
					items: [],
					numberOfItems: 0
				};
				this.favorites.push(list);
				return Promise.resolve(list);
			},
			refreshItemsCount(): void {
			},
			removeFavorite(listId: number, id: number): Promise<void> {
				let list = this.favorites.find(l => l.id === listId);
				let index = (list.items || []).findIndex(i => i.id === id);
				list.items.slice(index, 1);
				return Promise.resolve();
			},

			getAllFavoriteListsForEntity(veId: string): Promise<FavoriteList[]> {
				let favs = this.favorites.filter(l => (l.items || []).filter(i => i.veId === veId).length > 0);
				for (let list of favs) {
					list.included = true;
				}
				return Promise.resolve(favs);
			},
			getFavoritesContainedOnList(listId: number): Promise<Favorite[]> {
				let favs = [];
				for (let list of this.favorites.filter(l => l.id === listId)) {
					favs.push(list.items);
				}
				return Promise.resolve(favs);
			},
			createDefaultFavoriteList(): Promise<FavoriteList> {
				return Promise.resolve(
					this.addFavoriteList('favorites.defaultNewName')
				);
			}
		};

		fav['favorites'] = [];

		toastr = <ToastrService>{
			warning(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast<any> | null {
				return null;
			},
			success(message?: string, title?: string, override?: Partial<IndividualConfig>): ActiveToast<any> | null {
				return null;
			}
		};

		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				RouterTestingModule.withRoutes([])
			],
			providers: [
				{ provide: ClientContext, useValue: ctx },
				{ provide: AuthenticationService, useValue: auth },
				{ provide: FavoriteService, useValue: fav },
				{ provide: TranslationService, useValue: txt },
				{ provide: ToastrService, useValue: toastr },
				{ provide: ClientModel, useValue: model }
			],
			declarations: [
				FavoriteMenuComponent
			]
		});
	});

	beforeEach(async(async() => {
		fixture = TestBed.createComponent(FavoriteMenuComponent);
		sut = fixture.componentInstance;
		await sut.ngOnInit();
		fixture.detectChanges();
		await fixture.whenRenderingDone();
	}));

	it('should create an instance', () => {
		expect(sut).toBeTruthy();
	});

	describe('when a guest opens favoriteMenu', () => {
		beforeEach(async(async() => {
			ctx = TestBed.inject(ClientContext);
			spyOnProperty(ctx, 'authenticated', 'get').and.returnValue(false);
			fixture = TestBed.createComponent(FavoriteMenuComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('it should show login button', () => {
			const loginButton = fixture.debugElement.query(By.css('a.btn')).nativeElement as HTMLElement;
			expect(loginButton.innerText).toBe('Anmelden');
		});
	});

	describe('when a registered user opens favoriteMenu', () => {
		beforeEach(async(async() => {
			ctx = TestBed.inject(ClientContext);
			spyOnProperty(ctx, 'authenticated', 'get').and.returnValue(true);
			fixture = TestBed.createComponent(FavoriteMenuComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it ('should show a default unchecked list (AK-1)', () => {
			const defaultListCheckbox = fixture.debugElement.query(By.css('input[type="checkbox"]')).nativeElement as HTMLInputElement;
			expect(defaultListCheckbox.checked).toBeFalsy();

			const span = defaultListCheckbox.nextElementSibling;
			expect(span.innerHTML).toBe('favorites.defaultNewName');
		});

		describe('when clicked on save, without choosing an option (AK-2)', () => {
			it('should show a warning toast', () => {
				toastr = TestBed.inject(ToastrService);
				const spy = spyOn(toastr, 'warning');

				sut.saveDialog();
				expect(spy).toHaveBeenCalled();
			});
		});
	});
});
