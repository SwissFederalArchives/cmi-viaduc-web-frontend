import {CollectionDto} from '@cmi/viaduc-web-core';

export class CollectionItemResult implements ICollectionItemResult {
	public item?: CollectionDto | undefined;
	public breadcrumb?: { [key: string]: string; } | undefined;

	constructor(data?: ICollectionItemResult) {
		if (data) {
			for (let property in data) {
				if (data.hasOwnProperty(property)) {
					(<any>this)[property] = (<any>data)[property];
				}
			}
		}
	}

	public init(_data?: any) {
		if (_data) {
			this.item = _data['item'] ? CollectionDto.fromJS(_data['item']) : <any>undefined;
			if (_data['breadcrumb']) {
				this.breadcrumb = {} as any;
				for (let key in _data['breadcrumb']) {
					if (_data['breadcrumb'].hasOwnProperty(key)) {
						(<any>this.breadcrumb)![key] = _data['breadcrumb'][key];
					}
				}
			}
		}
	}

	public static fromJS(data: any): CollectionItemResult {
		data = typeof data === 'object' ? data : {};
		let result = new CollectionItemResult();
		result.init(data);
		return result;
	}

	public toJSON(data?: any) {
		data = typeof data === 'object' ? data : {};
		data['item'] = this.item ? this.item.toJSON() : <any>undefined;
		if (this.breadcrumb) {
			data['breadcrumb'] = {};
			for (let key in this.breadcrumb) {
				if (this.breadcrumb.hasOwnProperty(key)) {
					(<any>data['breadcrumb'])[key] = this.breadcrumb[key];
				}
			}
		}
		return data;
	}
}

export interface ICollectionItemResult {
	item?: CollectionDto | undefined;
	breadcrumb?: { [key: string]: string; } | undefined;
}
