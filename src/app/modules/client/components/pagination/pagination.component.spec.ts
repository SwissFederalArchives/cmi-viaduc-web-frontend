import {PaginationComponent} from './pagination.component';
import {Paging, ConfigService} from '@cmi/viaduc-web-core/';
import {EventEmitter} from '@angular/core';
import {SearchService} from '../../services/search.service';
import {UserUiSettings} from '../../model/account/userUiSettings';
import {TranslationService} from '@cmi/viaduc-web-core';

describe('PaginationComponent', () => {

	let searchService: SearchService;
	let pagination: PaginationComponent;
	let configService: ConfigService;
	let txtService: TranslationService;

	beforeEach(() => {
		let settings: UserUiSettings = {
			pagingSize: 10,
			selectedSortingField: {},
			showInfoWhenEmptySearchResult: false
		};

		configService = <ConfigService> {
			getUserSettings: () => {
				return settings;
			},
			getValidPagingSize: () => {
				return settings.pagingSize;
			},
			getSettings: () => {
				return {};
			},
			getSetting(key: string) {
				return {};
			}
		};

		searchService = <SearchService> {
			elasticHitLimit: 10000
		};

		txtService = <TranslationService> {
			get: (key: string, defaultValue: string, ...args: string[]) => {
				return '';
			}
		};

		pagination = new PaginationComponent(searchService, txtService, configService);
		pagination.paging = <Paging> {skip: 0, take: 10, total: 19};

		pagination.onPaged = <EventEmitter<Paging> > {
			emit: p => {
				console.log('emitted!', p);
			}
		};

		pagination.ngOnInit();
	});

	it('onPaged emitter to have been called on setPageIndex', () => {
		pagination.paging = <Paging> {skip: 0, take: 10, total: 19};
		pagination.ngOnChanges(null);
		spyOn(pagination.onPaged, 'emit');

		pagination.setPageIndex(1);

		expect(pagination.onPaged.emit).toHaveBeenCalled();
	});

	it('Page index 1 should be navigable', () => {
		const result = pagination.pageIndexIsNavigable(1);
		expect(result).toBe(true);
	});

	it('Page index 2 must not be navigable', () => {
		const result = pagination.pageIndexIsNavigable(2);
		expect(result).not.toBe(true);
	});

	it('Page index 3 must not be navigable', () => {
		const result = pagination.pageIndexIsNavigable(3);
		expect(result).not.toBe(true);
	});

	it('Page index less than 0 must not be navigable', () => {
		const result = pagination.pageIndexIsNavigable(-1);
		expect(result).not.toBe(true);
	});

	it('Page index should be navigable if number of hits is equal to elastic hit limit', () => {
		pagination.paging = <Paging> {skip: 0, take: 100, total: 10000};
		pagination.ngOnChanges(null);
		const result = pagination.pageIndexIsNavigable(99);
		expect(result).toBe(true);
	});

	it('Page index must not navigable if number of hits exceeds elastic hit limit', () => {
		pagination.paging = <Paging> {skip: 0, take: 100, total: 10001};
		pagination.ngOnChanges(null);
		const result = pagination.pageIndexIsNavigable(100);
		expect(result).not.toBe(true);
	});
});
