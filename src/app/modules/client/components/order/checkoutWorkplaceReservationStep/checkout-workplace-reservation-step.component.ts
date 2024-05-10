import {Component, EventEmitter, HostListener, OnInit, Output, Renderer2} from '@angular/core';
import {ConfigService, TranslationService} from '@cmi/viaduc-web-core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'cmi-checkout-workplace-reservation-step',
  templateUrl: './checkout-workplace-reservation-step.component.html',
  styleUrls: ['./checkout-workplace-reservation-step.component.less']
})
export class CheckoutWorkplaceReservationStepComponent implements OnInit {

	@Output()
	public onGoBackClicked: EventEmitter<void> = new EventEmitter<void>();
	@Output()
	public onNextClicked: EventEmitter<void> = new EventEmitter<void>();

	public loading: boolean;
	public form: FormGroup;
	public safeURL: any;
	public workplacealReadyReserved:  string;
	public showModalDialog: boolean = false;
	public showModalHit: boolean= false;

	constructor(private _cfg: ConfigService,
				private _sanitizer: DomSanitizer,
				private _formBuilder: FormBuilder,
				private _txt: TranslationService,
				private renderer: Renderer2) {
	}

	public async ngOnInit(): Promise<void> {
		this.loading = true;
		this.form = this._formBuilder.group({
			hasReservation: [false]
		});

		this.safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(	this._cfg.getSetting('reservation.urlReservation',
			'https://app.cituro.com/booking/3637098?presetService=Lesesaalreservation'));

		this.workplacealReadyReserved = this._txt.translate(
			'Informationen zur Reservation von Arbeitsplätzen finden Sie unter <a href="#/de/informationen/bestellen-und-konsultieren" target=\'_blank\'>Bestellen und Konsultieren</a>.', 'orderCheckoutPage.informationReveration');
		this.loading = false;
	}

	public goBack() {
		this.onGoBackClicked.emit();
	}

	public nextStep() {
		this.onNextClicked.emit();
	}

	public get isNextButtonDisabled() {
		return !this.form.controls.hasReservation.value;
	}

	public callbackIframe(e: MessageEvent){
		if(e.data.event && e.data.event.source == 'cituro'){
			if(e.data.event.type == 'onBookingCompleted'){
				this.form.controls.hasReservation.setValue(true);
			}
		}
	}

	public loadDone() {
		this.renderer.listen(window, 'message', (e) => this.callbackIframe(e));
	}

	public showDialog() {
		if (this.isNextButtonDisabled){
			this.goBack();
		} else {
			this.showModalDialog = true;
		}
	}

	@HostListener('window:beforeunload', ['$event'])
	// eslint-disable-next-line
	public unloadNotification($event: any) {
		this.showModalHit = true;
	}
}
