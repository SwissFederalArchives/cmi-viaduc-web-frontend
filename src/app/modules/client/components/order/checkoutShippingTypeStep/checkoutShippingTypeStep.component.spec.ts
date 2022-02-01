import {ClientModel, CoreModule, OrderItem, ShippingType} from '@cmi/viaduc-web-core/';
import {TranslationService, Ordering, ClientContext, ConfigService} from '@cmi/viaduc-web-core';
import {CheckoutShippingTypeStepComponent} from './checkoutShippingTypeStep.component';
import {AuthorizationService, ShoppingCartService, UrlService} from '../../../services';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {By} from '@angular/platform-browser';
import {ReactiveFormsModule} from '@angular/forms';
import {LocalizeLinkPipe} from '../../../pipes';
import {Observable, of} from 'rxjs';
import {KontingentResult} from '../../../model';

describe('CheckoutShippingTypeStep', () => {

	let sut: CheckoutShippingTypeStepComponent;
	let fixture: ComponentFixture<CheckoutShippingTypeStepComponent>;
	let auth: AuthorizationService;
	let txt: TranslationService;
	let cfg: ConfigService;
	let shoppingCartService: ShoppingCartService;

	beforeEach(() => {
		shoppingCartService = <any> {
			getTotalItemsInCart(): number {
				return 1;
			},
			getActiveOrder(): Ordering {
				return null;
			},
			getShowDigitizationWarningSetting(): boolean {
				return false;
			},
			getKontingent(): Observable<KontingentResult> {
				return of({ bestellkontingent: 999, aktiveDigitalisierungsauftraege: 1, digitalisierungesbeschraenkung: 999});
			},
			getOrderableItems(): Observable<OrderItem[]> {
				return of([]);
			}
		};

		txt = <TranslationService>{
			translate(text: string, key?: string, ...args): string {
				return text;
			}
		};

		cfg = <ConfigService>{
			getSetting(key: string, defaultValue: any): any {
				return defaultValue;
			}
		};

		auth = <AuthorizationService> {
			isBvwUser(): boolean {
				return true;
			},
			isAsUser(): boolean {
				return false;
			}
		};
		let ctx = <any> {
			language(): string {
				return 'de';
			}
		};

		let urlService = <UrlService> {
			localizeUrl(lang: string, url: string): string {
				return url;
			}
		};

		TestBed.configureTestingModule({
			imports: [
				CoreModule,
				ReactiveFormsModule,
				RouterTestingModule
			],
			providers: [
				{ provide: TranslationService, useValue: txt},
				{ provide: ConfigService, useValue: cfg },
				{ provide: ShoppingCartService, useValue: shoppingCartService },
				{ provide: AuthorizationService, useValue: auth },
				{ provide: LocalizeLinkPipe },
				{ provide: ClientContext, useValue: ctx},
				{ provide: UrlService, useValue: urlService },
				{ provide: ClientModel, useClass: ClientModel }
			],
			declarations: [
				CheckoutShippingTypeStepComponent,
				LocalizeLinkPipe
			]
		});
	});

	beforeEach(waitForAsync(async() => {
		fixture = TestBed.createComponent(CheckoutShippingTypeStepComponent);
		sut = fixture.componentInstance;
		await sut.ngOnInit();
		fixture.detectChanges();
		await fixture.whenRenderingDone();
	}));

	describe('when a AS user visits the page', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isAsUser').and.returnValue(true);
			spyOn(authService, 'isBvwUser').and.returnValue(false);
			fixture = TestBed.createComponent(CheckoutShippingTypeStepComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('it should show Verwaltungsausleihe option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInsAmtBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});

		it('it should show Lesesaal option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInLeseSaalBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});

		it('it should show Digitalisat option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkAlsDigitalisatBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});
	});

	describe('when a BVW user visits the page', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isBvwUser').and.returnValue(true);
			spyOn(authService, 'isAsUser').and.returnValue(false);
			fixture = TestBed.createComponent(CheckoutShippingTypeStepComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('it should show Verwaltungsausleihe option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInsAmtBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});

		it('it should show Lesesaal option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInLeseSaalBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});

		it('it should show Digitalisat option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkAlsDigitalisatBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});
	});

	describe('when other users visits the page', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isBvwUser').and.returnValue(false);
			spyOn(authService, 'isAsUser').and.returnValue(false);
			fixture = TestBed.createComponent(CheckoutShippingTypeStepComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('it should hide Verwaltungsausleihe option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInsAmtBestellen'));
			expect(vwOption).toBeFalsy();
		});

		it('it should show Lesesaal option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInLeseSaalBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});

		it('it should show Digitalisat option', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkAlsDigitalisatBestellen')).nativeElement as HTMLElement;
			expect(vwOption).toBeTruthy();
		});

		it('the Lesesaal option should be selected', () => {
			const vwOption = fixture.debugElement.query(By.css('#chkInLeseSaalBestellen')).nativeElement as HTMLInputElement;
			expect(vwOption.checked).toBeTruthy();
		});
	});

	describe('when the warning option is set', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isBvwUser').and.returnValue(false);
			spyOn(authService, 'isAsUser').and.returnValue(false);
			let scs = TestBed.inject(ShoppingCartService);
			spyOn(scs, 'getShowDigitizationWarningSetting').and.returnValue(true);
			fixture = TestBed.createComponent(CheckoutShippingTypeStepComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('selecting the Digitalisierung option results in showing a warning', waitForAsync(async() => {
			const vwOption = fixture.debugElement.query(By.css('#chkAlsDigitalisatBestellen')).nativeElement as HTMLInputElement;
			vwOption.click();
			sut.form.controls.shippingType.setValue(ShippingType.Digitalisierungsauftrag);

			fixture.detectChanges();
			await fixture.whenStable();

			const warning = fixture.debugElement.query(By.css('#alsDigitalisatBestellenWarning')).nativeElement as HTMLElement;
			expect(warning).toBeTruthy();
		}));
	});

	describe('when the warning option is not set', () => {
		beforeEach(waitForAsync(async() => {
			let authService = TestBed.inject(AuthorizationService);
			spyOn(authService, 'isBvwUser').and.returnValue(false);
			spyOn(authService, 'isAsUser').and.returnValue(false);
			fixture = TestBed.createComponent(CheckoutShippingTypeStepComponent);
			sut = fixture.componentInstance;
			await sut.ngOnInit();

			fixture.detectChanges();
			await fixture.whenStable();
		}));

		it('selecting the Digitalisierung option does not show a warning', waitForAsync(async() => {
			const vwOption = fixture.debugElement.query(By.css('#chkAlsDigitalisatBestellen')).nativeElement as HTMLInputElement;
			vwOption.click();
			sut.form.controls.shippingType.setValue(ShippingType.Digitalisierungsauftrag);
			fixture.detectChanges();
			await fixture.whenStable();

			const warning = fixture.debugElement.query(By.css('#alsDigitalisatBestellenWarning'));
			expect(warning).toBeFalsy();
		}));
	});
});
