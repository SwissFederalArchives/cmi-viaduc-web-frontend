import {Component} from '@angular/core';
import {UnbluService} from '../../services/unblu.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ChatBotService} from '../../services';
import {PreloadService, ClientContext, ConfigService} from '@cmi/viaduc-web-core';

@Component({
	selector: 'cmi-viaduc-engagement-bubbles',
	templateUrl: 'engagementBubbles.component.html',
	styleUrls: ['./engagementBubbles.component.less']
})
export class EngagementBubblesComponent {

	public chatFabVisible: boolean = true;
	public chatbotFabVisible: boolean = false;
	public showChatbotDialog: boolean = false;

	constructor(private _unblu: UnbluService,
				private _device: DeviceDetectorService,
				private _pre: PreloadService,
				private _ctx: ClientContext,
				private _cfg: ConfigService,
				private _chatbotService: ChatBotService
				) {
		if (!this._pre.isPreloaded) {
			this._pre.preloaded.subscribe(() => {
				this._setChatbotVisibility();
			});
		} else {
			this._setChatbotVisibility();
		}

		this._chatbotService.onOpenChatBotRequested.subscribe(() => {
			this.toggleBot();
		});

		this._unblu.onOpenUnbluChat.subscribe(() => {
			if (this.chatFabVisible) {
				this.chatFabVisible = false;
			}
		});

	}

	private _setChatbotVisibility() {
		let isMobile = this._device.isMobile();

		const supportedLanguages = this._cfg.getSetting('chatbot.supportedLanguagesForChatBot', 'de').split(';');
		let isSupportedLanguage = supportedLanguages.filter(l => l === this._ctx.language).length > 0;

		this.chatbotFabVisible = !isMobile && isSupportedLanguage;
	}

	public startChat() {
		this.chatFabVisible = false;
		this.showChatbotDialog = false;
		this._unblu.openChat();
	}

	public openBot() {
		this.chatbotFabVisible = true;
		this.showChatbotDialog = true;
		this._unblu.closeChat();
	}

	public closeBot() {
		this.chatbotFabVisible = !this._device.isMobile();
		this.showChatbotDialog = false;
	}

	public toggleBot() {
		if (this.showChatbotDialog) {
			this.closeBot();
		} else {
			this.openBot();
		}
	}

	public onChatbotDialogHide() {
		this.closeBot();
	}
}
