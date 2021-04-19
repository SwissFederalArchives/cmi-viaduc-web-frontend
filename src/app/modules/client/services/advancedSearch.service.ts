import {Injectable} from '@angular/core';
import {
	FieldType, SearchFieldDefinition, SearchModel, SearchField,
	AdvancedSearchField, AdvancedSearchGroup, AdvancedSearchModel,
	DropdownSearchField, DropdownSearchFieldValue,
	ConfigService, ClientContext, Utilities as _util,
	CountriesService
} from '@cmi/viaduc-web-core';

@Injectable()
export class AdvancedSearchService {
	private possibleSearchDefinitions: SearchFieldDefinition[];

	constructor(private _config: ConfigService,
				private _context: ClientContext,
				private _countries: CountriesService) {
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

	public addNewSearchField(grp: AdvancedSearchGroup, def: SearchFieldDefinition = null, autoFocus: boolean = false): AdvancedSearchField {
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
		let possibleFields = this.getPossibleSearchFields();

		let searchGroup = new AdvancedSearchGroup();
		searchGroup.id = groupid;

		let def = possibleFields[0];
		let fld = this.addNewSearchField(searchGroup, def);

		searchGroup.searchFields.push(fld);
		return searchGroup;
	}

	public getInitialSearchGroup(): AdvancedSearchGroup {
		let grp = new AdvancedSearchGroup();
		grp.id = 1;
		let lineCount: Number = this._config.getSetting('search.defaultSearchFieldLines');
		let i = 0;

		for (let f of this.getPossibleSearchFields()) {
			if (i >= lineCount) {
				break;
			}
			let autoFocus = (i === 0);
			let field = this.addNewSearchField(grp, f, autoFocus);
			grp.searchFields.push(field);
			i++;
		}

		return grp;
	}

	public regenerateAdvancedModelFromBaseSearchModel(tempModel: SearchModel): AdvancedSearchModel {
		let definitions = this.getPossibleSearchFields();

		let model = new AdvancedSearchModel();
		let i = 1;
		model.groupOperator = tempModel.groupOperator;
		for (let tmpGrp of tempModel.searchGroups) {
			let grp = new AdvancedSearchGroup();
			grp.fieldOperator = tmpGrp.fieldOperator;
			grp.id = i;
			let j = 0;
			for (let tmpField of tmpGrp.searchFields) {
				let def = definitions.filter(d => d.key === tmpField.key)[0];
				let field = this.addNewSearchField(grp, def, (i === 1 && j === 0));
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

		let fields: any[] = this._config.getSetting('search.advancedSearchFields');
		for (let f of fields) {
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

			let fieldDef = new SearchFieldDefinition(type, f.key, f.displayName);

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
			// Zugänglichkeiten werden aktuell nicht übersetzt
			field.values = [
				this._toDropdownSearchFieldValue('Frei*', 'Frei zugänglich'),
				this._toDropdownSearchFieldValue('In*', 'In Schutzfrist'),
				this._toDropdownSearchFieldValue('Prüfung*', 'Prüfung nötig')
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

		for (let grp of queryModel.searchGroups) {
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
