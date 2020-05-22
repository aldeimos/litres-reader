/// <reference path="viewHeaders.ts" />

declare var scrollbar: any;

module Bookmarks {
	export interface IBookmarksWindow {
		CreateBookmarkState?: boolean;
		Parent: EventsModule.IEventActions;
		Obj: HTMLElement;
		CommentObj;
		ShareListObj;
		ShowWindow(data?: any): void;
		HideWindow(): void; // hide window
		ToggleWindow(state: string);
		ButtonHandler(): void; // toggle bookmark window, mask
		GetObj(N: string): HTMLElement;
		RegisterWindow(Obj: any): void;
		HideRegisteredWindows(): void;
		GetBookmark(ID: string);
		MakeHTML();
		SetObjectList();
		PrepareData();
		ButtonClass: string[];
		UILangData: Object;
	}
	export interface ICommentWindow {
		HTML: string;
		UpdateCommentState: boolean;
		CurrentObj: HTMLElement;
		SetHandlers(): void; // add events in Comment window
		MakeButton(N: string): string;
		MakeComment(text: string): string;
		HideWindow(): void;
		ShowTextBox(event);
		TextSave();
		SetBookmarkNote(Bookmark: FB3Bookmarks.IBookmark);
	}
	export interface IShareType {
		name: string;
		buttonClass: string;
		buttonName: string;
		shareButtonText: string;
		state: boolean;
		obj: SocialSharing.ISocialSharingClass;
	}
	export interface IShareList {
		HTML: string;
		CurrentObj: HTMLElement;
		ShareWindowObj: IShareWindow;
		SetHandlers(): void; // add events in Share list
		MakeButton(N: string): string;
		ShowListBox(event);
		ToggleWindow(state: string);
	}
	export interface IShareWindow {
		ShowState: boolean
		HideWindow(): void;
		CurrentObj: HTMLElement;
	}
}