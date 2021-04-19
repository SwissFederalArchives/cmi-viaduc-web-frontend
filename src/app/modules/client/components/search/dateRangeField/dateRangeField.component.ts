import {
	Component, Input, forwardRef, EventEmitter, Output, ViewEncapsulation
} from '@angular/core';
import { AdvancedSearchField, SearchField, Utilities as _util } from '@cmi/viaduc-web-core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';

export const DATE_RANGE_FIELD_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => DateRangeFieldComponent),
	multi: true
};

@Component({
	selector: 'cmi-viaduc-date-range-field',
	templateUrl: 'dateRangeField.component.html',
	styleUrls: ['./dateRangeField.component.less'],
	encapsulation: ViewEncapsulation.None,
	providers: [DATE_RANGE_FIELD_VALUE_ACCESSOR]
})
export class DateRangeFieldComponent implements ControlValueAccessor {

	// provided via ngModel
	public selectedField: SearchField;

	@Input()
	public uniqueName: string;

	@Input()
	public label: string = null;

	@Input()
	public labelBold = false;

	@Input()
	public description: string = null;

	@Input()
	public requiresTwoDigitDaysAndMonth: boolean = false;

	@Input()
	public allowMonthYearEntry: boolean = true;

	@Input()
	public allowSpaces: boolean = true;

	public isValid: boolean = true;

	@Input()
	public tabindex: number = 0;
	@Output()
	public enterPressed: EventEmitter<void> = new EventEmitter<void>();

	@Output()
	public onValidate: EventEmitter<boolean> = new EventEmitter<boolean>();

	private _onChangeCallback: (_: any) => void = () => { };

	public onEnter(event: any) {
		if (event.keyCode === 13) {
			this.validateInput();

			if (this.isValid) {
				this.enterPressed.emit();
			}
		}
	}

	public checkDate(date: string): boolean {
		if (date === '*') {
			return true;
		}

		if (this.requiresTwoDigitDaysAndMonth) {
			return moment(date, 'YYYY', 'de', true).isValid() // allowing 2017
				|| (moment(date, 'MM.YYYY', 'de', true).isValid() && this.allowMonthYearEntry) // allowing 3.2017 or 10.2017
				|| moment(date, 'DD.MM.YYYY', 'de', true).isValid(); // allowing 5.3.2017 or 05.03.2017

		} else {
			return moment(date, 'YYYY', 'de', true).isValid() // allowing 2017
				|| (moment(date, 'M.YYYY', 'de', true).isValid() && this.allowMonthYearEntry) // allowing 3.2017 or 10.2017
				|| moment(date, 'D.M.YYYY', 'de', true).isValid(); // allowing 5.3.2017 or 05.03.2017
		}
	}

	public getDate(date: string): moment.Moment {
		if (moment(date, 'YYYY', 'de', true).isValid()) {
			return moment(date, 'YYYY', 'de', true);
		}

		if (moment(date, 'M.YYYY', 'de', true).isValid()) {
			return moment(date, 'M.YYYY', 'de', true);
		}

		if (moment(date, 'D.M.YYYY', 'de', true).isValid()) {
			return moment(date, 'D.M.YYYY', 'de', true);
		}
	}

	public validateInput() {
		if (!this.selectedField || _util.isEmpty(this.selectedField.value)) {
			this._emitValidation(true);
			return;
		}

		let range = this.selectedField.value.trim();
		let from = '*';
		let to = '*';
		let valid = false;

		if (!this.allowSpaces) {
			if (range.indexOf(' ') > 0) {
				this._emitValidation(false);
				return;
			}
		}

		if (range.indexOf('-') < 0) {
			from = range;
			valid = this.checkDate(from);
		} else {
			let parts = range.split('-');
			if (parts && parts.length === 2) {
				let first = parts[0].trim();
				let second = parts[1].trim();

				if (first.length > 0) {
					from = first;
				}
				if (second.length > 0) {
					to = second;
				}
				valid = this.checkDate(from) && this.checkDate(to) && this.getDate(from) <= this.getDate(to);
			}
		}
		this._emitValidation(valid);
	}

	private _emitValidation(isValid) {
		this.isValid = isValid;

		if (this.selectedField instanceof AdvancedSearchField) {
			this.selectedField.containsValidationErrors = !isValid;
		}
		this.onValidate.emit(this.isValid);
		this._onChangeCallback(this.selectedField);
	}

	public writeValue(obj: SearchField): void {
		if (obj !== this.selectedField) {
			this.selectedField = obj;
		} else if (obj.value !== this.selectedField.value) {
			this.selectedField.value = obj.value;
		}
	}

	public registerOnChange(fn: any): void {
		this._onChangeCallback = fn;
	}

	public registerOnTouched(fn: any): void {
		return;
	}
}
