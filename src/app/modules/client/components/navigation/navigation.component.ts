import {Component, OnInit, OnDestroy} from '@angular/core';
import {ContextService} from '../../services/context.service';

@Component({
	selector: 'cmi-viaduc-nav',
	templateUrl: 'navigation.component.html',
	styleUrls: ['./navigation.component.less']
})
export class NavigationComponent implements OnInit, OnDestroy {

	private _contextSubscription: any = null;
	public reload: boolean = false;

	private _language: string = null;
	private _mobileNavOpen: boolean = false;

	constructor(private _contextService: ContextService) {

	}

	public ngOnInit(): void {
		this._contextSubscription = this._contextService.context.subscribe((ctx) => {
			if (ctx.language !== this._language) {
				let _component = this;
				this._language = ctx.language;
				this.reload = true;
				window.setTimeout(function () {
					_component.reload = false;
				}, 0);
			}
		});
	}

	public ngOnDestroy(): void {
		if (this._contextSubscription) {
			this._contextSubscription.unsubscribe();
		}
		this._contextSubscription = null;
	}

	public onMobileNavToggle(open: boolean) {
		this._mobileNavOpen = open;
	}

	public getNavCss(): string {
		return this._mobileNavOpen ? 'nav-main yamm navbar nav-open' : 'nav-main yamm navbar';
	}

}
