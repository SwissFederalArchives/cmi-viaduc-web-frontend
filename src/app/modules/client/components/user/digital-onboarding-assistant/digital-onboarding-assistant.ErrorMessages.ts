
export class ErrorMessage {
	constructor(
		public forControl: string,
		public forValidator: string,
		public key: string,
		public text: string
	) { }
}

export const DigitalOnboardingAssistantErrorMessages = [
	new ErrorMessage('name', 'required', 'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),
	new ErrorMessage('name', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),
	new ErrorMessage('firstName', 'required',  'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),
	new ErrorMessage('firstName', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),

	new ErrorMessage('dateOfBirth', 'invalidDate', 'account.dateFieldFormat', 'Das Format entspricht keinem gültigen Datum (tt.mm.jjjj).'),

	new ErrorMessage('street', 'required',  'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),
	new ErrorMessage('street', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),
	new ErrorMessage('streetAttachment', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),
	new ErrorMessage('zipCode', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),
	new ErrorMessage('zipCode', 'required',  'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),
	new ErrorMessage('town', 'required',  'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),
	new ErrorMessage('town', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),
	new ErrorMessage('countryOfResidence', 'required',  'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),

	new ErrorMessage('email', 'email', 'main.errorMandatoryMailField', 'Dieses Feld muss eine gültige E-Mail-Adresse enthalten'),
	new ErrorMessage('email', 'maxlength', 'main.errorMaxLength60', 'Text darf nicht länger als 60 Zeichen sein.'),
	new ErrorMessage('email', 'required',  'main.errorMandatoryField', 'Dieses Feld muss ausgefüllt werden.'),
];
