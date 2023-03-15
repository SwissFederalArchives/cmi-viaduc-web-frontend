import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class ChatBotService {

	public onOpenChatBotRequested: EventEmitter<void> = new EventEmitter<void>();

	public openChatBot() {
		this.onOpenChatBotRequested.emit();
	}
}
