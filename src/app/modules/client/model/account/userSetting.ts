import {Utilities as _util} from '@cmi/viaduc-web-core';

export enum UserSettingType {
	FamilyName,
	FirstName,
	Birthday,
	Organization,
	Street,
	StreetAttachment,
	Zipcode,
	Town,
	Country,
	PhoneNumber,
	Email,
	MobileNumber,
	Language
}

export class UserSetting {
	constructor(private _userSettingType: UserSettingType,
				private _caption: string,
				public value: string,
				private _isReadOnly: boolean,
				private _isRequired: boolean = false,
				private _regExPattern: string = null,
				private _errorMessage: string = null,
				private _description: string = null) {
	}

	public calculateInvalidRegex(): boolean {
		if (this._isNullOrEmpty(this._regExPattern)) {
			this.regexIsInvalid = false;
			return;
		}

		if (this._isNullOrEmpty(this.value)) {
			this.regexIsInvalid = false;
			return;
		}

		let regexp = new RegExp(this._regExPattern);

		this.regexIsInvalid = !regexp.test(this.value);
	}

	private _isNullOrEmpty(value: string): boolean {
		return _util.isEmpty(value);
	}

	public regexIsInvalid: boolean = false;

	get caption(): string {
		return this._caption;
	}

	get errorMessage(): string {
		return this._errorMessage;
	}

	get isReadOnly(): boolean {
		return this._isReadOnly;
	}

	get isRequired(): boolean {
		return this._isRequired;
	}

	get elementId(): string {
		return this.caption;
	}

	get regExPattern(): string {
		return this._regExPattern;
	}

	get hasRegExPattern(): boolean {
		return !_util.isEmpty(this._regExPattern);
	}

	get hasValue(): boolean {
		return !_util.isEmpty(this.value);
	}

	get isInvalid(): boolean {
		if (this.isRequired && !this.hasValue) {
			return true;
		}

		if (this.hasRegExPattern) {
			return this.regexIsInvalid;
		}
		return false;
	}

	get userSettingType(): UserSettingType {
		return this._userSettingType;
	}

	get hasDescription(): boolean {
		return !_util.isEmpty(this._description);
	}

	get isCountryCode(): boolean {
		return this._userSettingType === UserSettingType.Country;
	}

	get isLanguage(): boolean {
		return this._userSettingType === UserSettingType.Language;
	}

	get isEmail(): boolean {
		return this._userSettingType === UserSettingType.Email;
	}

	get addIsRequiredSymbolIfNeccessary(): string {
		return this.isRequired ? '*' : '';
	}

	get description(): string {
		return this._description;
	}
}
