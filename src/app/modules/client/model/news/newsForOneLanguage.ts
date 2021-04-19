export class NewsForOneLanguage implements INewsForOneLanguage {
	public fromDate: string;
	public toDate: string;
	public heading: string;
	public text: string;
}

export interface INewsForOneLanguage {
	fromDate: string;
	toDate: string;
	heading: string;
	text: string;
}
