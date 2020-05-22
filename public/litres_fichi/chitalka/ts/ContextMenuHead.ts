/// <reference path="viewHeaders.ts" />

module ContextMenu {
	export interface IContextPosition {
		X: number;
		Y: number;
	}
	export interface IContextOptions {
		[index: number]: IContextOption[];
	}
	export interface IContextOption {
		action: string;
		title: string;
		type?: number
	}
	export interface IContextMenuClass {
		ShowState: boolean;
		Position: IContextPosition;
		FoundedBookmark: FB3Bookmarks.IBookmark;
		GetBookmarkByXY(): void;
		GetBookmarkByPosition(Pos: FB3ReaderAbstractClasses.IPosition): void;
		DeleteBookmark();
		RepositionMenu(Obj?);
		HideWindow();
		ShowWindow(e);
	}
}