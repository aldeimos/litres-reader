/// <reference path="viewHeaders.ts" />

module SelectionModule {
	export interface IMoveCoordinates {
		X: number;
		Y: number;
		Button: number;
	}
	export interface ISelectionClass {
		GetSelectedText(): string;
		Remove(): boolean;
		GetSelectionState(): boolean;
	}
	export interface IMouseCallback { (e: any): void; }
}