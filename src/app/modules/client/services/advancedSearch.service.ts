import {Injectable} from '@angular/core';
import {
	FieldType, SearchFieldDefinition, SearchModel, SearchField,
	AdvancedSearchField, AdvancedSearchGroup, AdvancedSearchModel,
	DropdownSearchField, DropdownSearchFieldValue,
	ConfigService, ClientContext, Utilities as _util,
	CountriesService, TranslationService
} from '@cmi/viaduc-web-core';

@Injectable()
export class AdvancedSearchService {
	private possibleSearchDefinitions: SearchFieldDefinition[];

	constructor(private _config: ConfigService,
				private _context: ClientContext,
				private _countries: CountriesService,
				private _txt: TranslationService) {
	}

	public createNewSearchField(id: string, def: SearchFieldDefinition = null): AdvancedSearchField {
		def = def || this.possibleSearchDefinitions[0];

		const type = def ? def.type : undefined;
		let field: AdvancedSearchField;
		switch (type) {
			case FieldType.Dropdown:
				field = this._createDropdownSearchField(def, this._context.language);
				break;
			default:
				field = new AdvancedSearchField();
				break;
		}

		field.type = def.type;
		field.key = def.key;
		field.id = id;

		return field;
	}

	public addNewSearchField(grp: AdvancedSearchGroup, def: SearchFieldDefinition = null, autoFocus = false): AdvancedSearchField {
		def = def || this.possibleSearchDefinitions[0];

		let fieldix = grp.searchFields.length + 1;
		let fieldid = grp.id + '_' + fieldix;
		while (grp.searchFields.filter(f => f.id === fieldid).length > 0) {
			fieldix++;
			fieldid = grp.id + '_' + fieldix;
		}

		const field = this.createNewSearchField(fieldid, def);

		// First text field: autoFocus
		if (def.type === FieldType.Fulltext || def.type === FieldType.Text) {
			field.autoFocus = autoFocus;
		}

		return field;
	}

	public createNewGroup(groupid: any): AdvancedSearchGroup {
		const possibleFields = this.getPossibleSearchFields();

		const searchGroup = new AdvancedSearchGroup();
		searchGroup.id = groupid;

		const def = possibleFields[0];
		const fld = this.addNewSearchField(searchGroup, def);

		searchGroup.searchFields.push(fld);
		return searchGroup;
	}

	public getInitialSearchGroup(): AdvancedSearchGroup {
		const grp = new AdvancedSearchGroup();
		grp.id = 1;
		const lineCount: number = this._config.getSetting('search.defaultSearchFieldLines');
		let i = 0;

		for (const f of this.getPossibleSearchFields()) {
			if (i >= lineCount) {
				break;
			}
			const autoFocus = (i === 0);
			const field = this.addNewSearchField(grp, f, autoFocus);
			grp.searchFields.push(field);
			i++;
		}

		return grp;
	}

	public regenerateAdvancedModelFromBaseSearchModel(tempModel: SearchModel): AdvancedSearchModel {
		const definitions = this.getPossibleSearchFields();

		const model = new AdvancedSearchModel();
		let i = 1;
		model.groupOperator = tempModel.groupOperator;
		for (const tmpGrp of tempModel.searchGroups) {
			const grp = new AdvancedSearchGroup();
			grp.fieldOperator = tmpGrp.fieldOperator;
			grp.id = i;
			let j = 0;
			for (const tmpField of tmpGrp.searchFields) {
				const def = definitions.filter(d => d.key === tmpField.key)[0];
				const field = this.addNewSearchField(grp, def, (i === 1 && j === 0));
				field.value = tmpField.value;
				grp.searchFields.push(field);
				j++;
			}
			model.searchGroups.push(grp);
			i++;
		}

		return model;
	}

	public getPossibleSearchFields(): any[] {
		if (this.possibleSearchDefinitions && !_util.isEmpty(this.possibleSearchDefinitions)) {
			return this.possibleSearchDefinitions;
		}

		this.possibleSearchDefinitions = [];

		const fields: any[] = this._config.getSetting('search.advancedSearchFields');
		for (const f of fields) {
			let type: FieldType;
			switch (f.type.toLowerCase()) {
				case 'text':
					type = FieldType.Text;
					break;
				case 'date':
					type = FieldType.Date;
					break;
				case 'datespan':
					type = FieldType.Datespan;
					break;
				case 'dropdown':
					type = FieldType.Dropdown;
					break;
				case 'fulltext':
					type = FieldType.Fulltext;
					break;
				default:
					type = FieldType.Text;
			}

			const fieldDef = new SearchFieldDefinition(type, f.key, f.displayName);

			this.possibleSearchDefinitions.push(fieldDef);
		}
		return this.possibleSearchDefinitions;
	}

	private _toDropdownSearchFieldValue(value: string, label: string = null): DropdownSearchFieldValue {
		return <DropdownSearchFieldValue>{
			value: value || label,
			label: label || value
		};
	}

	private _createDropdownSearchField(def: SearchFieldDefinition, language: string): DropdownSearchField {
		const field = new DropdownSearchField();
		if (def.key.indexOf('zugänglichkeitGemässBga') >= 0) {
			field.values = [
				this._toDropdownSearchFieldValue('Frei*', this._txt.translate('Frei zugänglich', 'search.advanced.field.zugaenglichkeitGemaessBga.freiZugaenglich')),
				this._toDropdownSearchFieldValue('In*', this._txt.translate('In Schutzfrist', 'search.advanced.field.zugaenglichkeitGemaessBga.inSchutzfrist')),
				this._toDropdownSearchFieldValue('Prüfung*', this._txt.translate('Prüfung nötig', 'search.advanced.field.zugaenglichkeitGemaessBga.pruefungNoetig'))
			];
		} else if (def.key.indexOf('land') >= 0) {
			this.getElasticCountries(field);
		}

		return field;
	}

	private getElasticCountries(field: any)  {
		this._countries.getElasticCountries().toPromise().then(countries => {
			field.values = countries.map(c => this._toDropdownSearchFieldValue(c));
			}
		);
	}

	public getModelForQuery(viewModel: SearchModel): SearchModel {
		const queryModel: SearchModel = <SearchModel>_util.clone(viewModel);
		delete queryModel['possibleFields'];
		delete queryModel['_config'];

		for (const grp of queryModel.searchGroups) {
			for (let i = 0; i < grp.searchFields.length; i += 1) {
				const fld = grp.searchFields[i];
				grp.searchFields[i] = <SearchField>{
					key: fld.key,
					value: fld.value
				};
			}
		}

		return queryModel;
	}
}
