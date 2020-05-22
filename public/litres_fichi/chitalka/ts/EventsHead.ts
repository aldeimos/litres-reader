/// <reference path="viewHeaders.ts" />

module EventsModule {
	export interface IPDAstate {
		state: boolean;
		platform: string;
		form: string;
		version: string;
		browser: string;
		orientation: number;
		portrait: boolean;
		top_hidden: boolean;
		pixelRatio: number;
		currentHeight: number;
	}
	export interface IEventActions {
		ReaderBox: HTMLElement;
		FooterBox: HTMLElement;
		WrapperBox: HTMLElement;
		WindowsCarry: IWindowsCarry; // Main windows handler, show|hide windows, hide all window etc
		Mask: IMask; // Mask object
		SelectionObj: SelectionModule.ISelectionClass;
		Reader: FB3Reader.IFBReader;
		Bookmarks: FB3Bookmarks.IBookmarks;
		IsMouseDown: boolean;
		PDA: IPDAstate;
		ZoomObj: IZoomClass;
		ChapterObj: IChapterClass;
		CopyToClipboard(text: string): void;
		GetEvent(e?);
		GetCoordinates(ev, Coords?: SelectionModule.IMoveCoordinates): SelectionModule.IMoveCoordinates;
		GetCurrentBox():HTMLElement;
		PageForward();
		PageBackward();
		RemoveSelection(): boolean;
		SetPreventDoubleCheck();
		CheckDoubleClick(): boolean;
		checkIEOrFFBrowser(): boolean;
		SkipOnElement(e): boolean;
		Resize();
		Refresh();
		CheckProgressBar();
		GoToBookmark(e): void;
		GetTitleFromTOC(Range: FB3DOM.IRange, TOC?: FB3DOM.ITOC[]): string;
		PrepareTitle(str: string): string;
		StopPropagation(e): boolean;
		GetElement(Obj: HTMLElement, Looking: string): HTMLElement;
		AddNavArrows(): void;
		CheckFirefoxTouchEvent(e):boolean;
		CheckIETouchEvent(e):boolean;
		AddEvents(TouchStartFunction: Function,TouchEndFunction: Function,TouchMoveFunction: Function,element:HTMLElement, context:any,priority?:boolean):void;
		RemoveEvents(element:HTMLElement, context:any,down?:boolean,up?:boolean,move?:boolean):void;
	}

	export interface IMouseClickClass {
		Owner: IEventActions;
		MousePosStartX: number;
		MousePosEndX: number;
		OnClickHandler(e: any, type: string);
        OnTouchHandler(e: any, type: string);
		onHideElements(e: any, type: string);
		AddHandlers();
		RemoveHandlers();
		onGestureDo(scale);
	}	

	export interface IMask {
		Show(Opacity?: string, Color?: string);
		Hide(Callback?);
	}

	export interface IWindowsCarry {
		WindowsStack;
		RegisterWindow(WindowObj); // push Obj in array
			// set Obj.ButtonHandler
		FireHandler(obj, e);
		ShowWindow(obj);
		HideWindow(obj);
		HideAllWindows(KeepSelection?: boolean, Callback?);
		GetWindow(_class: string);
	}

	export interface IZoomClass {
		Owner: IEventActions;
		ZoomObj: IZoomObj;
		ShowState: boolean;
		ResizeState: boolean;
		ZoomAnything(Obj: HTMLElement, w?: number, h?: number): void; // used by HelpWindow for now, maybe need to rename
		ZoomIMG(Path: string, W: number, H: number): void;
		ZoomHTML(HTML: FB3DOM.InnerHTML): void;
		ZoomOut(state?: boolean): void;
	}
	export interface IZoomObj {
		obj: HTMLElement;
		w?: number;
		h?: number;
	}
	export interface IDocumentSize {
		w: number;
		h: number;
	}

	export interface IChapterClass {
		ChapterObj: HTMLElement;
		ShowWindow(Range: FB3DOM.IRange): void;
		ClearWindow(): void;
		HideWindow(): void;
		HideWindowTimer(): void;
	}
}