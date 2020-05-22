/// <reference path="../FB3ReaderHeaders.ts" />

module FB3PPCache {
	export var MaxCacheRecords: number;
	export var LocalStorage: boolean;

	export interface IPageRenderInstructionsCacheEntry {
		Time: Date;
		Key: string;
		LastPage: number;
		Cache: FB3Reader.IPageRenderInstruction[];
		MarginsCache: any; // we are going to store a plain hash here for all "margined" elements
	}

	export interface IFB3PPCache {
		Encrypt: boolean;
		IsReady: boolean;
		Set(I: number, Instr: FB3Reader.IPageRenderInstruction): void;
		Get(I: number): FB3Reader.IPageRenderInstruction;
		Save(Key: string): void;
		Load(Key: string): void;
		SetMargin(XP: string, Margin: number): void;
		GetMargin(XP: string): number;
		Reset(): void;
		Length(): number;
		LastPage(LastPageN?: number): number;
		CheckIfKnown(From: FB3DOM.IXPath): number;
		LoadData(Callback?: Function): string;
		LoadDataAsync(ArtID: string);
		SaveData(Key: String, Data: IPageRenderInstructionsCacheEntry[], Callback?: Function): void;
	}

}