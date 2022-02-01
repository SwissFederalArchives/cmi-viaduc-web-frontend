import {
	CountriesService,
	Countries,
	CoreModule,
	TranslationService,
	ConfigService,
	ClientContext, ClientModel
} from '@cmi/viaduc-web-core';
import {
	AuthorizationService, SeoService,
	UrlService,
	UserService
} from '../../../modules/client/services';
import {ToastrService} from 'ngx-toastr';
import {User} from '../../../modules/client/model';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {RegisterPageComponent} from './registerPage.component';
import {RouterTestingModule} from '@angular/router/testing';

describe('RegisterPage', () => {
	let sut: RegisterPageComponent;
	let fixture: ComponentFixture<RegisterPageComponent>;

	let txt: any;
	let cfg: any;
	let url: UrlService;
	let authorizationService: AuthorizationService;
	let countriesService: CountriesService;
	let usrService: UserService;
	let context: any;
	let toastr: ToastrService;
	let seo: SeoService;

	beforeEach(() => {
		toastr = <any>{};
		context = <any>{
			authenticated: true,
			_defaultLanguage: 'de'
		};
		usrService = <UserService>{
			getUser(): Promise<User> {
				return Promise.resolve(<User> { id: '123', emailAddress: 'darth.vader@cmiag.ch' });
			},
			getUserDataFromClaims(): Promise<User> {
				return this.getUser();
			}
		};
		countriesService = <CountriesService>{
			getCountries(language: string): Countries {
				return <Countries> [];
			},
			sortCountriesByName(countries: Countries, clone: boolean = true): Countries {
				return countries;
			},
			loadCountries(language: string, defaultLanguage: string = null): Promise<Countries> {
				return Promise.resolve(this.getCountries());
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
			},
			getHomeUrl(): string {
				return 'a home url';
			},
			getNutzungsbestimmungenUrl(): string {
				return 'an url';
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
		seo = <SeoService> {
			setTitle(title: string) {
			}
		};

		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				RouterTestingModule
			],
			providers: [
				{ provide: TranslationService, useValue: txt },
				{ provide: ConfigService, useValue: cfg },
				{ provide: ToastrService, useValue: toastr },
				{ provide: UserService, useValue: usrService },
				{ provide: CountriesService, useValue: countriesService },
				{ provide: AuthorizationService, useValue: authorizationService },
				{ provide: UrlService, useValue: url },
				{ provide: ClientContext, useValue: context },
				{ provide: SeoService, useValue: seo },
				{ provide: ClientModel, useClass: ClientModel }
			],
			declarations: [
				RegisterPageComponent
			]
		});
	});

	beforeEach(waitForAsync(async() => {
		fixture = TestBed.createComponent(RegisterPageComponent);
		sut = fixture.componentInstance;
		await sut.ngOnInit();
		fixture.detectChanges();
		await fixture.whenRenderingDone();
	}));

	it('should create an instance', () => {
		expect(sut).toBeTruthy();
	});

	describe('when user is Ö2 OR Ö3', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isInternalUser').and.returnValue(false);
			fixture = TestBed.createComponent(RegisterPageComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('should be possible to edit the email', () => {
			const emailInput = fixture.debugElement.query(By.css('input[name="emailAddress"]')).nativeElement as HTMLElement;
			expect(emailInput.hasAttribute('disabled')).toBeFalsy();
		});

		it('should not have a required organization field', () => {
			fixture.detectChanges();
			const organizationField = fixture.debugElement.query(By.css('input[name="organization"')).nativeElement as HTMLElement;
			expect(organizationField.hasAttribute('required')).toBeFalsy();
		});
	});

	describe('when user is BAR, BVW or AS', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isInternalUser').and.returnValue(true);
			fixture = TestBed.createComponent(RegisterPageComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('should NOT be possible to edit the email', () => {
			fixture.detectChanges();
			const emailInput = fixture.debugElement.query(By.css('input[name="emailAddress"]')).nativeElement as HTMLElement;
			expect(emailInput.hasAttribute('disabled')).toBeTruthy();
		});

		it('should have a required organization field', () => {
			fixture.detectChanges();
			const organizationField = fixture.debugElement.query(By.css('input[name="organization"')).nativeElement as HTMLElement;
			expect(organizationField.hasAttribute('required')).toBeTruthy();
		});
	});
});
