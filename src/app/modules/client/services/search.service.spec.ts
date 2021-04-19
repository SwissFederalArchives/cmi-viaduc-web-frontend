import {
	AdvancedSearchModel,
	CoreOptions, Entity,
	FieldOperator,
	FieldType,
	GroupOperator,
	SearchField,
	EntityDecoratorService,
	SearchFieldDefinition,
	SearchGroup
} from '@cmi/viaduc-web-core';
import {of} from 'rxjs';
import {SearchService} from './search.service';
import {AdvancedSearchService} from './advancedSearch.service';

describe('SearchService', () => {
	let searchService: SearchService;
	let txt: any;
	let adv: AdvancedSearchService;
	let dec: EntityDecoratorService;
	let options: CoreOptions;
	let context: any;
	let http: any;

	beforeEach(() => {
		context = <any>{
			authenticated: true,
			_defaultLanguage: 'de'
		};

		http = <any>{
			get: getUrl => {
				return of(null);
			},
			post: (postUrl, item) => {
				return of(null);
			}
		};

		options = <any>{
			serverUrl: '',
			privatePort: ''
		};

		dec = <EntityDecoratorService>{
			decorate(entity: Entity, opt?: any): Entity {
				return entity;
			}
		};

		adv = <AdvancedSearchService>{
			getPossibleSearchFields(): any[] {
				return [
					new SearchFieldDefinition(FieldType.Datespan, 'creationPeriod', 'Entstehungszeitraum'),
					new SearchFieldDefinition(FieldType.Text, 'title', 'Titel'),
					new SearchFieldDefinition(FieldType.Text, 'withinInfo', 'Darin')
				];
			}
		};

		txt = <any>{
			get: (key, text) => {
				return text;
			}
		};

		searchService = new SearchService(options, http, context, dec, txt, adv);
	});

	describe('when translating a query to human readable', () => {

		it('should correctly translate a query with fieldOperator AND', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.AND,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Alle Begriffe (Titel: Bundesrat)');
		});

		it('should correctly translate a query with fieldOperator OR', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.AND,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.Or,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Mindestens ein Begriff (Titel: Bundesrat)');
		});

		it('should correctly translate a query with fieldOperator NOT', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.AND,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.Not,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Keiner der Begriffe (Titel: Bundesrat)');
		});

		it('should correctly translate a query AND chained groups', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.AND,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							}
						]
					},
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Meier'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Alle Begriffe (Titel: Bundesrat) UND Alle Begriffe (Titel: Meier)');
		});

		it('should correctly translate a query OR chained groups', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.OR,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							}
						]
					},
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Meier'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Alle Begriffe (Titel: Bundesrat) ODER Alle Begriffe (Titel: Meier)');
		});

		it('should correctly translate a query with three chained groups', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.OR,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							}
						]
					},
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Meier'
							}
						]
					},
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bern'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Alle Begriffe (Titel: Bundesrat) ODER Alle Begriffe (Titel: Meier) ODER Alle Begriffe (Titel: Bern)');
		});

		it('should correctly translate a sample query from PVW-70, AK-3', () => {
			let sm = <AdvancedSearchModel> {
				groupOperator: GroupOperator.AND,
				searchGroups: <SearchGroup[]> [
					<SearchGroup>{
						fieldOperator: FieldOperator.And,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'title',
								type: FieldType.Text,
								value: 'Bundesrat'
							},
							<SearchField> {
								key: 'creationPeriod',
								type: FieldType.Text,
								value: '1940-1950'
							}
						]
					},
					<SearchGroup>{
						fieldOperator: FieldOperator.Not,
						searchFields: <SearchField[]> [
							<SearchField> {
								key: 'withinInfo',
								type: FieldType.Text,
								value: 'Luzern'
							}
						]
					}
				]
			};

			let result  = searchService.toHumanReadableQueryString(sm);
			expect(result).toBe('Alle Begriffe (Titel: Bundesrat, Entstehungszeitraum: 1940-1950) UND Keiner der Begriffe (Darin: Luzern)');
		});

		describe('when providing translations', () => {
			let searchServiceFr;

			beforeEach(() => {
				let txtFr = <any>{
					get: (key, text) => {
						return `[!fr ${text}]`;
					}
				};
				searchServiceFr = new SearchService(options, http, context, dec, txtFr, adv);
			});

			it('should translate the labels and operators to users language (PVW-70, AK-3.1 + AK-3.4)', () => {
				let sm = <AdvancedSearchModel> {
					groupOperator: GroupOperator.AND,
					searchGroups: <SearchGroup[]> [
						<SearchGroup>{
							fieldOperator: FieldOperator.And,
							searchFields: <SearchField[]> [
								<SearchField> {
									key: 'title',
									type: FieldType.Text,
									value: 'Bundesrat'
								}
							]
						},
						<SearchGroup>{
							fieldOperator: FieldOperator.Or,
							searchFields: <SearchField[]> [
								<SearchField> {
									key: 'withinInfo',
									type: FieldType.Text,
									value: 'Luzern'
								}
							]
						}
					]
				};

				let result  = searchServiceFr.toHumanReadableQueryString(sm);
				expect(result).toBe('[!fr Alle Begriffe] ([!fr Titel]: Bundesrat) [!fr UND] [!fr Mindestens ein Begriff] ([!fr Darin]: Luzern)');
			});
		});
	});
});
