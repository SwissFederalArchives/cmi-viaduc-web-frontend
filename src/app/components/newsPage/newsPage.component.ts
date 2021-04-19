import {Component} from '@angular/core';
import {INewsForOneLanguage, NewsForOneLanguage} from '../../modules/client/model';
import {NewsService} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-news-page',
	templateUrl: 'newsPage.component.html',
	styleUrls: ['./newsPage.component.less']
})

export class NewsPageComponent {

	private _news: NewsForOneLanguage[];

	constructor(private _newsService: NewsService) {
		this._getAndStoreNews();
	}

	public get news(): NewsForOneLanguage[] {
		return this._news;
	}

	public get hasNews(): boolean {
		if (this._news) {
			return this._news.length > 0;
		}
		return false;
	}

	private _getAndStoreNews(): void {
		let promise: Promise<INewsForOneLanguage[]> = this._newsService.getRelevantNewsForViaducClient();

		promise.then((data) => {
				this._news = <NewsForOneLanguage[]>data;
			},
			(error) => {
				console.log(error);
				this._news = [];
			});
	}
}
