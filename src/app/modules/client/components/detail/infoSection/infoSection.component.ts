import {Component, Input} from '@angular/core';
import {Entity} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-info-section',
	templateUrl: 'infoSection.component.html',
	styleUrls: ['./infoSection.component.less'],
})
export class InfoSectionComponent {

	@Input()
	public text: string;
	@Input()
	public entity: Entity;
}
