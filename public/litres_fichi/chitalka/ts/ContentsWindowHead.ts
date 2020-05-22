/// <reference path="viewHeaders.ts" />

module Contents {
	export interface IContentsWindow {
		Obj: HTMLElement;
		ShowWindow(): void;
		HideWindow(): void; // hide window
		ButtonHandler(): void; // toggle bookmark window, mask
	}
}