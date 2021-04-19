import { MatomoInjector, MatomoTracker } from 'ngx-matomo';
import { AfterViewInit, Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ClientContext, ConfigService, PreloadService } from '@cmi/viaduc-web-core';
import {
	AuthenticationService,
	ContextService,
	FavoriteService,
	ShoppingCartService,
	UrlService
} from '../../modules/client/services';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
	selector: 'cmi-viaduc-root',
	templateUrl: 'root.component.html',
	styleUrls: ['./root.component.less']
})
export class RootComponent implements OnInit, AfterViewInit {
	@ViewChild(ToastContainerDirective)
	public toastContainer: ToastContainerDirective;

	public preloading: boolean = false;
	public showEngagement: boolean = false;

	constructor(private _context: ClientContext,
		private _contextService: ContextService,
		private _authentication: AuthenticationService,
		private _preloadService: PreloadService,
		private _config: ConfigService,
		private _scs: ShoppingCartService,
		private _fav: FavoriteService,
		private toastrService: ToastrService,
		private _renderer: Renderer2,
		private _router: Router,
		private _urlService: UrlService,
		private _matomoInjector: MatomoInjector,
		private _matomoTracker: MatomoTracker) {

			const matomoUrl = _config.getSetting('matomo.url', '');
			const matomoSiteId = _config.getSetting('matomo.siteId', '');
			if (matomoUrl) {
				this._matomoInjector.init(matomoUrl, matomoSiteId);
			}
	}

	public ngOnInit(): void {
		this.toastrService.overlayContainer = this.toastContainer;

		this._router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd) {
				this._matomoTracker.trackPageView(event.url);
			}
		});

		this._contextService.context.subscribe((ctx) => {
			if (ctx.authenticated) {
				this._scs.refreshItemsCount();
				this._fav.refreshItemsCount();
			}
		});

		this._preloadService.translationsLoaded.subscribe((translations) => {
			if (!translations) {
				return;
			}

			setTimeout(() => {
				// Komponenten ausserhalb router-outlet müssen neu gerendert werden für die übersetzungen
				this.showEngagement = true;
			}, 50);
		});

		let version = this._config.getSetting('service.version');
		this._context.client.setVersion(version);

		this._authentication.tryActivateExistingSession().then((success) => {
			this._authentication.isSigningIn = false;
			this._authentication.onSignedIn.next(success);
		}).catch(err => {
			this._authentication.isSigningIn = false;
			this._authentication.onSignedIn.next(false);
			if (err && err.status === 403) {
				// _router.navigate doesn't work for some reason....
				window.location.href = this._urlService.getExternalBaseUrl() + '#' + this._urlService.getErrorSmartcardUrl();
				location.reload();
			} else {
				this._router.navigate([this._urlService.getErrorUrl()]);
			}
		});
	}

	public ngAfterViewInit(): void {
		this._renderer.removeClass(document.documentElement, 'cmi-boot');
	}
}
