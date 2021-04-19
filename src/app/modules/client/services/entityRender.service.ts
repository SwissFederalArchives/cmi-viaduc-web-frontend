import {Injectable} from '@angular/core';
import {Entity, EntityImage, TranslationService, Utilities as _util} from '@cmi/viaduc-web-core';
import {SectionRow} from '../model/detail/sectionRow';
import * as moment from 'moment';

@Injectable()
export class EntityRenderService {

	constructor(private _txt: TranslationService) {
	}

	public renderSection(entity: Entity, key: string): any {
		const data = entity._metadata[key];
		const expanded = true;
		let title = this._txt.get('metadata.title.' + key, key);

		if (data && _util.isString(data._title)) {
			title = data._title;
		}

		return {
			title: title,
			data: data,
			isExpanded: expanded
		};
	}

	public renderSectionRow(entity: Entity, key: string, val: any): SectionRow {
		if (_util.isEmpty(key) || _util.startsWith(key, '_')) {
			return null;
		}

		let row: SectionRow = new SectionRow();
		row.visibility = val.visibility;
		row.label = (val && _util.isString(val.label)) ? val.label : this._txt.get('metadata.label.' + key, key);
		row.entity = entity;

		let s = this._renderValue(row, key, val);
		if (s) {
			if (_util.isAngularMarkup(s)) {
				row.markup = s;
			} else if (_util.isHtmlMarkup(s)) {
				row.html = s;
			} else {
				row.text = s;
			}
			return row;
		}
		return null;
	}

	// types
	// int, bool, float, string
	// ElasticTimePeriod
	// ElasticDateWithYear
	// ElasticBase64
	// ElasticHyperLink
	// ElasticEntityLink

	private _renderValue(row: SectionRow, path: string, val: any): string {
		let s = '';
		if (_util.isString(val)) {
			s = val;
			if (s.indexOf('\r') >= 0 || s.indexOf('\n') >= 0) {
				s = s.replace(/\r\n/g, '<br/>');
				s = s.replace(/\n/g, '<br/>');
				s = '<span>' + s + '</span>';
			}
		} else if (_util.isNumber(val)) {
			s = '' + val;
		} else if (_util.isDate(val)) {
			const d = <Date>val;
			if (d.getHours() !== 0 || d.getMinutes() !== 0) {
				s = moment(val).format('DD.MM.YYYY HH:mm');
			} else {
				s = moment(val).format('DD.MM.YYYY');
			}
		} else if (_util.isArray(val)) {
			s = this._renderArray(row, path, val, this._renderValue.bind(this));
		} else if (_util.isObject(val)) {
			if (val['markup']) {
				s = val['markup'];
			} else if (val['html']) {
				s = val['html'];
			} else {
				let t: string = (val['type'] || '').toLowerCase();
				if (t.indexOf('timeperiod') >= 0) {
					s = this._renderTimePeriod(row, path, val);
				} else if (t.indexOf('datewithyear') >= 0) {
					s = this._renderDateWithYear(row, path, val);
				} else if (t.indexOf('hyperlink') >= 0) {
					s = this._renderHyperLink(row, path, val);
				} else if (t.indexOf('entitylink') >= 0) {
					s = this._renderEntityLink(row, path, val);
				} else if (t.indexOf('base64') >= 0) {
					s = this._renderBase64(row, path, val);
				} else if (val.value && _util.isArray(val.value)) {
					s = this._renderArray(row, path, val.value, this._renderValue.bind(this));
				} else {
					t = val['text'] || val['title'] || val['value'];
					if (!_util.isEmpty(t)) {
						s = this._renderValue(row, path, t);
					} else {
						s = _util.toJson(val);
					}
				}
			}
		}
		return s;
	}

	private _renderTimePeriod(row: SectionRow, path: string, val: any): string {
		if (_util.isArray(val)) {
			return this._renderArray(row, path, val, this._renderTimePeriod.bind(this));
		} else if (_util.isObject(val)) {
			return val['text'];
		}
	}

	private _renderDateWithYear(row: SectionRow, path: string, val: any): string {
		if (_util.isArray(val)) {
			return this._renderArray(row, path, val, this._renderDateWithYear.bind(this));
		} else if (_util.isObject(val)) {
			return val['text'] || val['year'];
		}
	}

	private _renderHyperLink(row: SectionRow, path: string, val: any): string {
		if (_util.isArray(val.value)) {
			return this._renderArray(row, path, val.value, this._renderHyperLink.bind(this));
		} else if (_util.isObject(val)) {
			const href = val['url'];
			const text = val['text'] || href;
			return '<a class="external-link" href="' + href + '" target="_blank" rel="noopener">' + text + '</a>';
		}
	}

	private _renderEntityLink(row: SectionRow, path: string, val: any): string {
		if (_util.isArray(val.value)) {
			return this._renderArray(row, path, val.value, this._renderEntityLink.bind(this));
		} else if (_util.isObject(val)) {
			const veId = val['entityRecordId'];
			const text = val['value'];
			if (this._isVeEntity(val['entityType'])) {
				const href = '#{{ \'/de/' + veId + '\' | localizeLink }}';
				return '<a class="entity-link" href="' + href + '">' + text + '</a>';
			} else {
				return text;
			}
		}
	}

	private _renderBase64(row: SectionRow, path: string, val: any): string {
		if (_util.isArray(val.value)) {
			return this._renderArray(row, path, val.value, this._renderBase64.bind(this));
		} else if (_util.isObject(val)) {
			if (path.toLowerCase().indexOf('bildvorschau') >= 0) {
				const lrg = row.entity.customFields['bildAnsicht'] || {};
				row.data = (row.data || {});
				let images = row.data.images = (row.data.images || []);
				images.push(<EntityImage>{
					smallImageAsBase64: this._getImageSrc(val['mimeType'], val['value']),
					largeImageAsBase64: this._getImageSrc(lrg['mimeType'], lrg['value']),
					caption: row.entity.title
				});
				return '<cmi-viaduc-detail-images [images]="context.data.images"></cmi-viaduc-detail-images>';
			}
			return null;
		}
	}

	private _renderArray(row: SectionRow, path: string, arr: any[], fn: (row: SectionRow, path: string, val: any) => string): string {
		let s = '';
		arr.forEach((val, i) => {
			s = _util.addToString(s, '<br/>', fn(row, path, val));
		});
		return s;
	}

	private _getImageSrc(mime: string, data: string): string {
		return `data:${mime};base64,${data}`;
	}

	private _veEntityTypes: any = {
		'verzeichnungseinheiten': true
	};

	private _isVeEntity(entityType: string): boolean {
		return !_util.isEmpty(entityType) && (this._veEntityTypes[entityType.toLowerCase()] === true);
	}
}
