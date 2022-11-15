import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {CollectionListItemDto, CoreModule} from '@cmi/viaduc-web-core';
import {ActivatedRoute, Router} from '@angular/router';
import {CollectionService} from '../../../modules/client/services/collection.service';
import {LocalizeLinkPipe, UrlService} from '../../../modules/client';
import {Observable, of} from 'rxjs';
import * as moment from 'moment';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {ToastrTestingModule} from '../mocks';
import {CollectionOverviewComponent} from './collection-overview.component';

describe('auto generate CollectionOverviewComponent', () => {
	beforeEach(waitForAsync(async() => {
		TestBed.configureTestingModule({
			imports: [
				CoreModule.forRoot(),
				RouterTestingModule.withRoutes(
					[{path: 'getHomeUrl', component: UrlService}, {path: 'simple', component: ActivatedRoute}])
				, ToastrTestingModule],
			providers: [
				{provide: CollectionService, useValue: collectionService},
				{provide: Router, useValue: router},
				{provide: UrlService, useValue: urlService},
				{provide: LocalizeLinkPipe, useValue: localizeLinkPipe},

			],
			declarations: [
				LocalizeLinkPipe,
				CollectionOverviewComponent
			]
		});

		fixture = TestBed.createComponent(CollectionOverviewComponent);
		sut = fixture.componentInstance;
		sut.parentId = 1;
		await sut.ngOnInit();
		await fixture.whenRenderingDone();
	}));

	let fixture:  ComponentFixture<CollectionOverviewComponent>;
	let sut: CollectionOverviewComponent;
	let collectionItems: CollectionListItemDto[] = [CollectionListItemDto.fromJS({
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
	}),
		CollectionListItemDto.fromJS({
			collectionId:32,
			title: ' Titel Blau',
			validFrom: moment(Date.now()).toDate(),
			validTo:  moment(Date.now()).toDate(),
			createdOn: moment(Date.now()).toDate(),
			modifiedOn: moment(Date.now()).toDate(),
			collectionTypeId: 0,
			descriptionShort: 'Short kurz',
			description: 'Test Lang',
			link: 'www.yahoo.de'
		}),
		CollectionListItemDto.fromJS({
			collectionId:13,
			title: '3 Titel',
			validFrom: moment(Date.now()).toDate(),
			validTo:  moment(Date.now()).toDate(),
			createdOn: moment(Date.now()).toDate(),
			modifiedOn: moment(Date.now()).toDate(),
			collectionTypeId: 0,
			descriptionShort: 'Short short',
			description: 'Test kind',
			imageMimeType: 'jpg',
			link: 'www.bing.de'
		})];
	let collectionService = <CollectionService>{
		getActiveCollections(parentId: number | null): Observable<CollectionListItemDto[] | null>  {

			return of(collectionItems);
		},
		getSizedImageURL(collectionId: number): string {
			return '/api/Collections/GetSizedImage/' + collectionId + '?mimeType=image/png&width=400&height=282';
		},
		getImageURL(collectionId: number): string {
			return '/api/Collections/GetImage/' + collectionId +  '?usePrecalculatedThumbnail=false';
		}
	};
	let localizeLinkPipe = <LocalizeLinkPipe>{
		transform(value: any, ...args: any[]): string {
			return 'any';
		}
	};
	let urlService = <UrlService>{
		getHomeUrl(): string {
			return 'suche/einfach';
		},
		localizeUrl(lang: string, url: string): string {
			return url;
		}
	};
	let router = <Router>{};

	it('should create an instance', () => {
		expect(sut).toBeTruthy();
	});

	it('should create Data', () => {
		expect(sut.collections).toBeTruthy();
		expect(sut.collections.length).toBe(3);
	});

	it('should the imageminetype was set image appears', () => {
		fixture.whenStable().then(
			() => {
				fixture.detectChanges();
				let elementArray = fixture.debugElement.queryAll(By.css('.card-img-top'));
				expect(elementArray.length).toBeGreaterThan(0);
			}
		);
	});

});
