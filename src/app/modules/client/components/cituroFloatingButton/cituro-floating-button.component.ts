import { Component, OnInit } from '@angular/core';
import {ConfigService} from '@cmi/viaduc-web-core';

@Component({
  selector: 'cmi-cituro-floating-button',
  templateUrl: './cituro-floating-button.component.html',
  styleUrls: ['./cituro-floating-button.component.less']
})
export class CituroFloatingButtonComponent implements OnInit {
	public link: string;

	constructor(private _cfg: ConfigService) {
	}

	public async ngOnInit(){
		this.link = this._cfg.getSetting('reservation.urlReservation',
			'https://app.cituro.com/booking/3637098?presetService=Lesesaalreservation');
	}
}
