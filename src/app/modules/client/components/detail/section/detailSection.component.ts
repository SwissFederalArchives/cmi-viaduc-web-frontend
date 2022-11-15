import {Component, Input, OnInit} from '@angular/core';
import {SectionRow} from '../../../model/detail/sectionRow';
import {EntityRenderService} from '../../../services/entityRender.service';
import {Entity, EntityMetadata} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-detail-section',
	templateUrl: 'detailSection.component.html',
	styleUrls: ['./detailSection.component.less']
})
export class DetailSectionComponent implements OnInit {

	@Input()
	public data: EntityMetadata;
	@Input()
	public entity: Entity;

	@Input()
	public isBarUser: boolean = false;

	@Input()
	public fields: Map<string, any> = new Map<string, any>();

	public rows: any[];

	constructor(private _renderService: EntityRenderService) {
	}

	public ngOnInit(): void {
		let rows = this.rows = [];

		for (let key in this.data) {
			if (this.data.hasOwnProperty(key)) {
				try {
					let row: SectionRow = this._renderService.renderSectionRow(this.entity, key, this.data[key]);
					if (row && (row.markup || row.html || row.text)) {
						rows.push(row);
						if (this.entity.isAnonymized && this.fields && this.fields.has(key) )	{
							let item: Partial<SectionRow> = {
								visibility: row.visibility,
								text: this.fields.get(key),
								label: row.label,
								isAnonymized : true
							};
							rows.push(item);
						}
					}
				} catch (e) {
					rows.push({label: key, text: 'Unexpected error while rendering data'});
				}
			}
		}
	}
}
