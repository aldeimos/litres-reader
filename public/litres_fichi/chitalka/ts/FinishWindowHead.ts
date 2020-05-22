/// <reference path="viewHeaders.ts" />

module Finish {
	export interface IFinishWindow {
		Obj: HTMLElement;
		ShowWindow(): void;
		HideWindow(): void; // hide window
		ButtonHandler(): void; // toggle bookmark window, mask
	}
}