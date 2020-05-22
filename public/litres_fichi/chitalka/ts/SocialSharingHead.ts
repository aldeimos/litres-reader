/// <reference path="viewHeaders.ts" />
/// <reference path="../../core/plugins/fbsdk.d.ts" />

declare var VK: any;
declare var twttr: any;
declare var _gaq: any;
declare var yaCounter2199583: any;

module SocialSharing {
	export interface ISocialSharingClass {
		Parent: EventsModule.IEventActions;
		Caption: string; // book author (bottom)
		Text: string; // book quote
		Image: string; // book cover
		Name: string; // book name
		URL: string; // book url
		Comment: string; // user comment for quote
		TextLimit: number; // book quote text limit
		UserName: string;
		ShareEvent: string;
		CheckPopup(callback): void;
		ShareInit(): void;
		LoginInit(): void;
		CookText(text: string, textLimit?: number): string;
		CookComment(comment: string): string;
		FillData(text: string, comment: string): void;
		ShareCallback(response?): void;
		ShowLoading();
		HideLoading();
		TrackShare();
	}
}