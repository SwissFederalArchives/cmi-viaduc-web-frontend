import {Component, Input} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Entity} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-entity-menu',
	templateUrl: 'entityMenu.component.html',
	styleUrls: ['./entityMenu.component.less'],
	animations: [
		trigger('menuState', [
			state('collapsed', style({
				height: 0
			})),
			state('expanded', style({
				height: '*'
			})),
			transition('void => expanded', [
				style({height: 0}),
				animate(250, style({height: '*'}))
			]),
			transition('* => expanded', [
				animate(250, style({height: '*'}))
			]),
			transition('expanded => collapsed', [
				animate(250, style({height: 0}))
			])
		])
	]
})
export class EntityMenuComponent {
	@Input()
	public state: string;

	@Input()
	public entity: Entity;

	constructor() {
	}

	public animationDone(event: any): void {
	}
}
