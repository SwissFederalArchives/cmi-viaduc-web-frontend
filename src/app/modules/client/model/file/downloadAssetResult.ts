import {AssetDownloadStatus} from './assetDownloadStatus';

export interface DownloadAssetResult {
	assetDownloadLink: string;
	callerId: string;
	status: AssetDownloadStatus;
	inQueueSince: Date;
	estimatedPreparationDuration: string;
	estimatedPreparationEnd: Date;
	fileSizeInBytes: number;
}
