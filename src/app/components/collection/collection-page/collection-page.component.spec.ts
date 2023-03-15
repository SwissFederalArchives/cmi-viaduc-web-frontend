import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CollectionDto, CoreModule, TranslationService} from '@cmi/viaduc-web-core';
import {ActivatedRoute, ParamMap,  Router} from '@angular/router';
import {CollectionPageComponent} from './collection-page.component';
import {CollectionService} from '../../../modules/client/services/collection.service';
import {SeoService, UrlService} from '../../../modules/client';
import {Observable, of} from 'rxjs';
import {CollectionItemResult} from '../../../modules/client/model/collection/collectionItemResult';
import moment from 'moment';
import {By, Title} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {ToastrTestingModule, MockUserSettingsParamMap} from '../mocks';

describe('auto generate CollectionPageComponent', () => {
	beforeEach(waitForAsync(async() => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule.forRoot(),
				RouterTestingModule.withRoutes(
					[{path: 'getHomeUrl', component: UrlService}, {path: 'simple', component: ActivatedRoute}])
				, ToastrTestingModule],
			providers: [
				{provide: Router, useValue: router},
				{provide: UrlService, useValue: urlService},
				{provide: CollectionService, useValue: collectionService},
				{provide: TranslationService, useValue: _txt},
				{provide: ActivatedRoute, useValue: activatedRoute},
				{provide: SeoService, useValue: _seoService},
			],
			declarations: [
				CollectionPageComponent
			]
		});

		fixture = TestBed.createComponent(CollectionPageComponent);
		sut = fixture.componentInstance;
		await sut.ngOnInit();
		fixture.detectChanges();
		await fixture.whenRenderingDone();
	}));
		let fixture:  ComponentFixture<CollectionPageComponent>;
		let sut: CollectionPageComponent;
		let activatedRoute = <ActivatedRoute>{
			get paramMap(): Observable<ParamMap> {
				return of ( new MockUserSettingsParamMap()).pipe();
			}
		};
		let router = <Router>{};
		let urlService = <UrlService>{
			getHomeUrl(): string {
				return 'suche/einfach';
			}
		};
		let _txt = <TranslationService>{
			get(key: string, defaultValue?: string, ...args): string {
				return defaultValue;
			},
			translate(text: string, key?: string, ...args): string {
				return text;
			}
		};
		let _title = <Title>{
			getTitle(): string {
				return this.testTitle;
			},
			setTitle(newTitle: string): void {
				this.testTitle = newTitle;
			}
		};
		let _seoService = new SeoService(_title, _txt);
		let collectionItemResult = CollectionItemResult.fromJS({
			item:  CollectionDto.fromJS({
				collectionId:3,
				title: 'Test Titel',
				validFrom: moment(Date.now()).toDate(),
				validTo:  moment(Date.now()).toDate(),
				createdOn: moment(Date.now()).toDate(),
				modifiedOn: moment(Date.now()).toDate(),
				collectionTypeId: 0,
				descriptionShort: 'Short short',
				description: 'Test kind',
				imageMimeType: 'png',
				link: 'www.google.de'
			})});
		let collectionService = <CollectionService>{
			get(id: number):Observable<CollectionItemResult | null> {

				return of(collectionItemResult);
			},
			getSizedImageURL(collectionId: number): string {
				return '/api/Collections/GetSizedImage/' + collectionId + '?mimeType=image/png&width=400&height=282';
			},
			getImageURL(collectionId: number): string {
				return '/api/Collections/GetImage/' + collectionId +  '?usePrecalculatedThumbnail=false';
			}
		};

		it('should create an instance', () => {
			expect(sut).toBeTruthy();
		});

		it('should create Data', () => {
			expect(sut).toBeTruthy();
			expect(sut.detailItem).toBeTruthy();
			expect(sut.detailItem.collectionId).toBe(3);
			expect(sut.isValid).toBeTruthy();
		});

		it('should the title was completed with the collection name', () => {
			expect(sut).toBeTruthy();
			let title = _seoService.getTitle();
			expect(title === collectionItemResult.item.title + ' - ' + _txt.get('header.title', 'Online-Zugang zum Bundesarchiv')  ).toBeTruthy();
		});

		it('should the imageminetype was set image appears', () => {
			const imageContainer = fixture.debugElement.query(By.css('.image-container')).nativeElement;
			expect(imageContainer).toBeTruthy();
			fixture.componentInstance.detailItem.imageMimeType = undefined;
			fixture.detectChanges();
			expect(fixture.debugElement.query(By.css('.image-container'))).toBeFalsy();
		});

		it('should the link was set button appears', () => {
			fixture.autoDetectChanges(true);
			const button = fixture.debugElement.query(By.css('.link')).nativeElement;
			expect(button).toBeTruthy();
			fixture.componentInstance.detailItem.link = undefined;
			fixture.detectChanges();
			expect(fixture.debugElement.query(By.css('.link'))).toBeFalsy();
		});
});
