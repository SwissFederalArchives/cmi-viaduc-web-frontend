import {SearchSynonymeComponent} from './searchSynonyme.component';
import {SynonymGruppe} from '../../../model/SynonymGruppe/SynonymGruppe';

describe('SearchSynonyme', () => {

	let synonymComponent: SearchSynonymeComponent;

	beforeEach(() => {
		synonymComponent = new SearchSynonymeComponent();
	});

	it('should support multiple search terms', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'Zürich Standesinitiative';
		setupSynonym('Standesinitiative', ['cantonal initiative']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('Zürich AND ("Standesinitiative" OR "cantonal initiative")');
	});

	it('should support synonym with spaces', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'allgemeinverbindlicher Bundesbeschluss';
		setupSynonym('allgemeinverbindlicher Bundesbeschluss', ['general federal decree', 'general decree']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('("allgemeinverbindlicher Bundesbeschluss" OR "general federal decree" OR "general decree")');
	});

	it('should support case insensitive words', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'bUnDeSGeRIchtsGESETZ';
		setupSynonym('Bundesgerichtsgesetz', ['BGG', 'FSCA']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('("Bundesgerichtsgesetz" OR "BGG" OR "FSCA")');
	});

	it('should AND multiple synonymgroups', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'Bundesgerichtsgesetz Standesinitiative';

		let g1 = createSynonymGroup('Bundesgerichtsgesetz', ['BGG']);
		let g2 = createSynonymGroup('Standesinitiative', ['Kt. Iv.']);
		synonymComponent.synonymList = [g1, g2];

		for (let s of g1.synonyme) {
			synonymComponent.addSynonymToList(g1, s);
		}

		for (let s of g2.synonyme) {
			synonymComponent.addSynonymToList(g2, s);
		}

		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('("Bundesgerichtsgesetz" OR "BGG") AND ("Standesinitiative" OR "Kt. Iv.")');
	});

	it('should respect existing ANDs', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'Bundesgerichtsgesetz AND Standesinitiative';
		setupSynonym('Bundesgerichtsgesetz', ['BGG', 'FSCA']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('("Bundesgerichtsgesetz" OR "BGG" OR "FSCA") AND Standesinitiative');
	});

	it('should respect existing ORs', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'Standesinitiative OR Bundesgerichtsgesetz';
		setupSynonym('Bundesgerichtsgesetz', ['BGG', 'FSCA']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('Standesinitiative OR ("Bundesgerichtsgesetz" OR "BGG" OR "FSCA")');
	});

	it('should have AND between a synonym group and a text', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = 'Motion Pfister';
		setupSynonym('motion', ['Mo.']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('("motion" OR "Mo.") AND Pfister');
	});

	it('should support search terms in double quotes', () => {
		// arrange
		let result = '';
		synonymComponent.searchValue = '"cantonal initiative"';
		setupSynonym('cantonal initiative', ['Standesinitiative']);
		synonymComponent.addSynonymToSearchClicked.subscribe(res => {
			result = res;
		});

		// act
		synonymComponent.onAddSynonymToSearchClicked();

		// assert
		expect(result).toBe('("cantonal initiative" OR "Standesinitiative")');
	});

	function setupSynonym (term: string, synonyms: string[]) {
		let g = createSynonymGroup(term, synonyms);
		synonymComponent.synonymList = [g];

		for (let s of synonyms) {
			synonymComponent.addSynonymToList(g, s);
		}
	}

	function createSynonymGroup(term: string, synonyms: string[]) {
		let g = <SynonymGruppe> {
		};

		g.synonyme = synonyms;
		g.treffer = term;
		g.length = g.treffer.length;
		g.index = synonymComponent.searchValue.indexOf(g.treffer);

		return g;
	}
});
