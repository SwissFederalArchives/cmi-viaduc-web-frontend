import {Entity} from '@cmi/viaduc-web-core';

export class SectionRow {
	public markup: string;
	public html: string;
	public text: string;
	public label: string;
	public visibility: number;
	public entity: Entity;
	public isAnonymized: boolean;

	public data: any;
}
