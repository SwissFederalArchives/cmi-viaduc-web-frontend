import {Component, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
	selector: 'cmi-viaduc-static-page',
	templateUrl: 'staticPage.component.html'
})
export class StaticPageComponent implements OnDestroy {

	public contentUrl: string;
	private _navigationSubscription: any = null;

	constructor(_router: Router) {
		this._navigationSubscription = _router.events.subscribe(event => {
			if (event instanceof NavigationEnd ) {
				this.contentUrl = event.url;
			}
		});
	}

	public ngOnDestroy(): void {
		if (this._navigationSubscription) {
			this._navigationSubscription.unsubscribe();
		}
		this._navigationSubscription = null;
	}

}
