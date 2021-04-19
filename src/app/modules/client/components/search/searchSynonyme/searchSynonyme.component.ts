import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SynonymGruppe} from '../../../model/SynonymGruppe/SynonymGruppe';

@Component({
	selector: 'cmi-viaduc-synonyme',
	templateUrl: 'searchSynonyme.component.html',
	styleUrls: ['searchSynonyme.component.less']
})
export class SearchSynonymeComponent {

	@Input()
	public searchValue: string;

	@Input()
	public synonymList: SynonymGruppe[];

	@Output()
	public addSynonymToSearchClicked: EventEmitter<string> = new EventEmitter<string>();

	@Input()
	public set open(val: boolean) {
		this._open = val;
		this.openChange.emit(val);
	}
	public get open(): boolean {
		return this._open;
	}

	@Output()
	public openChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	public synonymSelectedList: Map<SynonymGruppe, string[]> = new Map<SynonymGruppe, string[]>();
	private _open: boolean;
	private _reservedWords = [
		'or', 'and', 'not'
	];

	public addSynonymToList(synonymGruppe: SynonymGruppe, synonym: string): void {
		let synonymForSearch = this._getStringForSearch(synonym);

		if (this.synonymSelectedList.has(synonymGruppe)) {
			let searchSynonymList = this.synonymSelectedList.get(synonymGruppe);
			this._addOrDeleteValueFromList(searchSynonymList, synonymForSearch);
		} else {
			this.synonymSelectedList.set(synonymGruppe, [synonymForSearch]);
		}
	}

	public onAddSynonymToSearchClicked(): void {
		let newSearchValue = this.searchValue;
		if (this.searchValue && this.searchValue.length) {
			let mergedSynonymSelectedList = this._getMergedSynonymes();
			newSearchValue = this._createSearchText(mergedSynonymSelectedList);
		}

		this.addSynonymToSearchClicked.emit(newSearchValue);
		this.synonymSelectedList.clear();
		this.open = false;
	}

	public close() {
		this.open = false;
	}

	private _createSearchText(mergedSynonymSelectedList: Map<SynonymGruppe, string[]>) {
		let searchValueWithSynonymes = '';
		let wordsTemp = this.searchValue.trim()
			.replace(/\s\s+/g, ' ')
			.replace(/"([^"\s]*?)(\s)([^"\s]*?)"/gm, '$1~~$3')  // Replace spaces within double quotes with ~~
			.split(' ');
		let words = wordsTemp.map(w => w.replace('~~', ' '));   // After split, replace subst with spaces again

		let synonymKeys = Array.from(mergedSynonymSelectedList.keys());

		for (let i = 0; i < words.length; i++) {
			let synonymGroupCandidates = synonymKeys.filter(k => k.treffer.toLowerCase().indexOf(words[i].toLowerCase()) >= 0);
			let synonymGroups = [];

			for (let g of synonymGroupCandidates) {
				if (g.treffer.toLowerCase() === words[i].toLowerCase()) {
					synonymGroups.push({
						toReplace: words[i],
						group: g
					});
				} else {
					let possibleHit = words[i];
					for (let j = i + 1; j < words.length; j++) {
						possibleHit += ' ' + words[j];

						if (g.treffer.toLowerCase() === possibleHit.toLowerCase()) {
							synonymGroups.push({
								toReplace: possibleHit,
								group: g
							});
							i += (j - i);
							break;
						}
					}
				}
			}

			if (synonymGroups.length > 0) {
				for (let g of synonymGroups) {
					let values = mergedSynonymSelectedList.get(g.group);
					let text = `(${this._getStringForSearch(g.group.treffer)} OR ${values.join(' OR ')})`;
					searchValueWithSynonymes = this._concatSynonym(searchValueWithSynonymes, text);
				}
			} else {
				searchValueWithSynonymes = this._concatText(searchValueWithSynonymes, words[i]);
			}
		}

		return searchValueWithSynonymes.trim();
	}

	private _concatText(str: string, word) {
		if (str.length > 0) {
			if (str.endsWith('")') && this._reservedWords.indexOf(word.toLowerCase()) < 0) {
				str += ` AND ${word}`;
			} else {
				str += ` ${word}`;
			}
		} else {
			str = word;
		}

		return str;
	}

	private _concatSynonym (str: string, word: string) {
		if (str.length > 0) {
			if (this._reservedWords.filter(r => str.toLowerCase().endsWith(` ${r}`)).length > 0) {
				str += ` ${word}`;
			} else {
				str += ` AND ${word}`;
			}
		} else {
			str = word;
		}
		return str;
	}

	private _getMergedSynonymes(): Map<SynonymGruppe, string[]> {
		let mergedSynonymSelectedList: Map<SynonymGruppe, string[]> = new Map<SynonymGruppe, string[]>();
		this.synonymSelectedList.forEach((value: string[], key: SynonymGruppe) => {
			let stringArray: string[] = null;
			mergedSynonymSelectedList.forEach((mvalue: string[], mkey: SynonymGruppe) => {
				if (mkey.treffer === key.treffer) {
					stringArray = mvalue;
				}
			});

			if (stringArray) {
				this._mergeStringList(stringArray, value);
			} else {
				mergedSynonymSelectedList.set(key, value);
			}
		});

		return mergedSynonymSelectedList;
	}

	private _addOrDeleteValueFromList(list: string[], value: string) {
		let index = list.indexOf(value);
		if (index < 0) {
			// Falls Eintrag nicht existiert ergänzen
			list.push(value);
		} else {
			// Falls Eintrag existiert löschen
			list.splice(index, 1);
		}
	}

	private _mergeStringList(list: string[], value: string[]) {
		for (let item of value) {
			if (!item) {
				continue;
			}

			let index = list.indexOf(item);
			if (index < 0) {
				// Falls Eintrag nicht existiert ergänzen
				list.push(item);
			}
		}
	}

	// Synonym mit Anführungszeichen ergänzen
	private _getStringForSearch(input: string): string {
		if (!input) {
			return '';
		}
		if (input.indexOf('"') >= 0) {
			return input;
		}

		return '"' + input + '"';
	}
}
