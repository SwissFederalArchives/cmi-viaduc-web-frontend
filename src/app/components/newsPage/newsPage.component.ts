import {Component, OnInit} from '@angular/core';
import {NewsForOneLanguage} from '../../modules/client/model';
import {NewsService} from '../../modules/client/services';

@Component({
	selector: 'cmi-viaduc-news-page',
	templateUrl: 'newsPage.component.html',
	styleUrls: ['./newsPage.component.less']
})

export class NewsPageComponent implements OnInit {

	public news: NewsForOneLanguage[];

	constructor(private _newsService: NewsService) {
	}

	public async ngOnInit(): Promise<void> {
		this.news = await this._newsService.getRelevantNewsForViaducClient();
	}

	public get hasNews(): boolean {
		if (this.news) {
			return this.news.length > 0;
		}
		return false;
	}
}
