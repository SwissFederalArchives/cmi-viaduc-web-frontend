import {Component, Output, EventEmitter} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ConfigService} from '@cmi/viaduc-web-core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
	selector: 'cmi-viaduc-chatbot-dialog',
	templateUrl: 'chatbotDialog.component.html',
	styleUrls: ['./chatbotDialog.component.less']
})
export class ChatbotDialogComponent {
	public isMobile: boolean = false;

	@Output()
	public onHide: EventEmitter<void> = new EventEmitter<void>();

	constructor(private _device: DeviceDetectorService,
				private _cfg: ConfigService,
				private _sanitizer: DomSanitizer) {
		this.isMobile = this._device.isMobile();
	}

	public onHideClick() {
		this.onHide.emit();
	}

	public get dialogHeight(): number {
		let defaultHeight = 600;
		let additionalSpace = 230;

		let windowHeight = window.innerHeight;

		if (this.isMobile) {
			return Math.max(windowHeight - 155, 200);
		}
		if (defaultHeight + additionalSpace > windowHeight) {
			return Math.max(windowHeight - additionalSpace, 200);
		}

		return defaultHeight;
	}

	public get urlForChatbot(): SafeResourceUrl {
		return this._sanitizer.bypassSecurityTrustResourceUrl(this._cfg.getSetting('chatbot.urlForChatBot'));
	}
}
