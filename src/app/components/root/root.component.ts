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
import MatomoTracker from '@jonkoops/matomo-tracker';
import {TrackPageViewParams} from '@jonkoops/matomo-tracker/src/types';

@Component({
	selector: 'cmi-viaduc-root',
	templateUrl: 'root.component.html',
	styleUrls: ['./root.component.less']
})
export class RootComponent implements OnInit, AfterViewInit{
	@ViewChild(ToastContainerDirective)
	public toastContainer: ToastContainerDirective;

	public preloading = false;
	public showEngagement = false;

	private _matomoTracker: MatomoTracker;
	private  trackPageViewParams: TrackPageViewParams

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
		) {
		const matomoUrl = this._config.getSetting('matomo.url', '');
		const matomoSiteId = this._config.getSetting('matomo.siteId', '');
		this._matomoTracker = new MatomoTracker({
			urlBase: matomoUrl, // https://track.zem.ch  'https://LINK.TO.DOMAIN',
			siteId: matomoSiteId,
			// userId: '', // 'UID76903202', // optional, default value: `undefined`.
			// trackerUrl: matomoUrl, // 'https://LINK.TO.DOMAIN/tracking.php', // optional, default value: `${urlBase}matomo.php`
			// srcUrl: '', // optional, default value: `${urlBase}matomo.js`
			// disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
			heartBeat: { // optional, enabled by default
				active: true, // optional, default value: true
				seconds: 10 // optional, default value: `15
			},

			// linkTracking: false, // optional, default value: true
			configurations: { // optional, default value: {}
				// any valid matomo configuration, all below are optional
				disableCookies: true,
				setSecureCookie: true,
				setRequestMethod: 'POST'
			}
		})
	}

	public ngOnInit(): void {
		this.toastrService.overlayContainer = this.toastContainer;

		this._router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd) {
				this.trackPageViewParams = {
					href: event.url,
				}
				this._matomoTracker.trackPageView(this.trackPageViewParams);
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

		const version = this._config.getSetting('service.version');
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
