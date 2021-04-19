import {Component, Input} from '@angular/core';

@Component({
	selector: 'cmi-viaduc-usage-section',
	templateUrl: 'usageSection.component.html',
	styleUrls: ['./usageSection.component.less'],
})
export class UsageSectionComponent {

	@Input()
	public text: string;

	constructor() {
	}

}
