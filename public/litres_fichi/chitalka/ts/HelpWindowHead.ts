/// <reference path="viewHeaders.ts" />

module Help {
	export interface IHelpWindow {
		Obj: HTMLElement;
		ShowWindow(): void;
		HideWindow(): void; // hide window
		ButtonHandler(): void; // toggle bookmark window, mask
	}
}