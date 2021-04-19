import {Component, Input} from '@angular/core';

@Component({
	selector: 'cmi-viaduc-explanation-treeview',
	templateUrl: 'explanationTreeView.component.html',
	styleUrls: ['./explanationTreeView.component.less']
})

export class ExplanationTreeViewComponent {
	@Input()
	public explanation: string;

	public explanationTreeView: ExplanationTreeViewComponent;

	private _htmlStrings: string[];

	public getExplanation(): string {
		this._htmlStrings = [];
		this._processExplanation(<ExplanationTypeComponent>JSON.parse(this.explanation));
		return this._htmlStrings.join('');
	}

	private _processExplanation(explanation: ExplanationTypeComponent): void {
		this._htmlStrings.push('<ul>');
		this._htmlStrings.push(this._createValueElement(explanation.value));
		this._htmlStrings.push(this._createDescriptionElement(explanation.description));

		for (let i = 0; i < explanation.details.length; i++) {
			this._htmlStrings.push(this._createDetailsElement());
			this._processExplanation(explanation.details[i]);
		}

		this._htmlStrings.push('</ul>');
	}

	private _createValueElement(value: string): string {
		return '<li>"value": ' + value + '</li>';
	}

	private _createDescriptionElement(description: string): string {
		return '<li>"description": ' + description + '</li>';
	}

	private _createDetailsElement(): string {
		return '<li>"details"</li>';
	}
}

class ExplanationTypeComponent {
	public value: string;
	public description: string;
	public details: ExplanationTypeComponent[];
}
