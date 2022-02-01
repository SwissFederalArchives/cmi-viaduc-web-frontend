import {UserAccountComponent} from '../..';
import {
	CountriesService,
	Countries,
	CoreModule,
	TranslationService,
	ConfigService,
	ClientContext
} from '@cmi/viaduc-web-core';
import {
	AuthorizationService,
	UrlService,
	UserService
} from '../../../services';
import {ToastrService} from 'ngx-toastr';
import {User} from '../../../model';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {By} from '@angular/platform-browser';

describe('UserAccount', () => {
	let sut: UserAccountComponent;
	let fixture: ComponentFixture<UserAccountComponent>;

	let txt: any;
	let cfg: any;
	let url: UrlService;
	let authorizationService: AuthorizationService;
	let countriesService: CountriesService;
	let usrService: UserService;
	let context: any;
	let toastr: ToastrService;

	beforeEach(() => {
		toastr = <any>{};
		context = <any>{
			authenticated: true,
			_defaultLanguage: 'de'
		};
		usrService = <UserService>{
			getUser(): Promise<User> {
				return Promise.resolve(<User> { id: '123', emailAddress: 'darth.vader@cmiag.ch' });
			}
		};
		countriesService = <CountriesService>{
			getCountries(language: string): Countries {
				return <Countries> [];
			},
			sortCountriesByName(countries: Countries, clone: boolean = true): Countries {
				return countries;
			}
		};
		authorizationService = <AuthorizationService>{
			isInternalUser(): boolean {
				return false;
			},
			isExternalUser(): boolean {
				return !this.isInternalUser();
			},
			hasMoreThenOe2Rights(): boolean {
				return this.isInternalUser();
			},
			hasRole(r: string): boolean {
				return true;
			},
			roles: {
				Oe1: 'Ö1',
				Oe2: 'Ö2',
				Oe3: 'Ö3',
				BVW: 'BVW',
				AS: 'AS',
				BAR: 'BAR'
			}
		};
		url = <UrlService> {
			getExternalHostUrl(): string {
				return 'an external url';
			}
		};
		cfg = <ConfigService>{
			getSetting(key: string, defaultValue?: any): any {
				return defaultValue;
			}
		};
		txt = <TranslationService>{
			translate: (text, key) => {
				return text;
			},
			get(key: string, defaultValue?: string, ...args): string {
				return defaultValue;
			}
		};

		TestBed.configureTestingModule({
			imports: [
				CoreModule
			],
			providers: [
				{ provide: TranslationService, useValue: txt },
				{ provide: ConfigService, useValue: cfg },
				{ provide: ToastrService, useValue: toastr },
				{ provide: UserService, useValue: usrService },
				{ provide: CountriesService, useValue: countriesService },
				{ provide: AuthorizationService, useValue: authorizationService },
				{ provide: UrlService, useValue: url },
				{ provide: ClientContext, useValue: context }
			],
			declarations: [
				UserAccountComponent
			]
		});
	});

	beforeEach(waitForAsync(async() => {
		fixture = TestBed.createComponent(UserAccountComponent);
		sut = fixture.componentInstance;
		sut.ngOnInit();
		fixture.detectChanges();
		await fixture.whenRenderingDone();
	}));

	it('should create an instance', () => {
		expect(sut).toBeTruthy();
	});

	describe('when user is Ö2 OR Ö3', () => {
		beforeEach(() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isInternalUser').and.returnValue(false);
			sut.ngOnInit();
		});

		it('should show a hint to also edit the email in eiam (PVW-258, AK-1, AK-2)', waitForAsync(async() => {
			fixture.detectChanges();

			const emailSpan = fixture.debugElement.query(By.css('.email-hint'));
			expect(emailSpan.nativeElement.innerText).toContain('Mobiltelefon-Nummer und E-Mail-Adresse dienen zur Kontaktaufnahme');
		}));

		describe('when user is editing his data', () => {
			beforeEach(() => {
				sut.onChangeSettingsClicked();
				fixture.detectChanges();
			});

			it('should show a hint to also edit the email in eiam', () => {
				const emailSpan = fixture.debugElement.query(By.css('.email-hint'));
				expect(emailSpan.nativeElement.innerText).toContain('Mobiltelefon-Nummer und E-Mail-Adresse dienen zur Kontaktaufnahme');
			});

			it('should be possible to edit the email', () => {
				const emailInput = fixture.debugElement.query(By.css('#E-Mail')).nativeElement as HTMLElement;
				expect(emailInput.hasAttribute('readonly')).toBeFalsy();
			});
		});
	});

	describe('when user is BAR, BVW or AS', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isInternalUser').and.returnValue(true);
			sut.ngOnInit();
			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('should NOT show a hint to edit the email in eiam', waitForAsync(async() => {
			fixture.detectChanges();

			const emailSpan = fixture.debugElement.query(By.css('.email-hint'));
			expect(emailSpan).toBeFalsy();
		}));

		describe('when user is editing his data', () => {
			beforeEach(() => {
				sut.onChangeSettingsClicked();
				fixture.detectChanges();
			});

			it('should NOT show a hint to edit the email in eiam', () => {
				const emailSpan = fixture.debugElement.query(By.css('.email-hint'));
				expect(emailSpan).toBeFalsy();
			});

			it('should NOT be possible to edit the email', () => {
				const emailInput = fixture.debugElement.query(By.css('#E-Mail')).nativeElement as HTMLElement;
				expect(emailInput.hasAttribute('readonly')).toBeTruthy();
			});
		});
	});
});
