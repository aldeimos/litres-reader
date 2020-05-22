/// <reference path="SelectionHead.ts" />

module SelectionModule {
	export class SelectionClass implements ISelectionClass {
		private SelectionState: boolean; // we have activated seletion by move
		private SelectionMoveTimer: number; // timer value
		private SelectionTimerValue: number; // timer obj
		private SelectedTextState: boolean; // we selected already something, set true
			// didnt check actualy selected text, just state
		private TemporaryNote: FB3Bookmarks.IBookmark;
		private Coordinates: IMoveCoordinates;
		private StartElPos: FB3ReaderAbstractClasses.IPosition;
		private TouchState: boolean; // touch move state, to disable move on PDA
		private TouchSelection:boolean = false;
		private TouchMoveTimer: number;
		private TouchTimerValue: number;
		private DateStart: number;
		private TouchStart:number = -1;
		private Debug: boolean;
		private RedrawTimeoutID: number;
		constructor (
			private Callback: IMouseCallback,
			private Owner: EventsModule.IEventActions
		) {
			this.StartElPos = [];
			this.ClearCoordinates();
			this.SelectedTextState = false;
			this.SelectionState = false;
			this.SelectionTimerValue = 50;
			this.TouchState = false;
			this.TouchTimerValue = 20;
			this.DateStart = 0;
			this.AddHandlers();
			this.Debug = false;
		}
		private ClearCoordinates () {
			this.Coordinates = { X: 0, Y: 0, Button: null };
		}

		public GetSelectionState():boolean {
			return this.SelectionState;
		}
		private AddHandlers() {
			this.Owner.AddEvents(this.OnTouchStart, null,null,this.Owner.GetCurrentBox(),this)							
		}
		private AddMoveHandlers() {
			this.Owner.AddEvents(null, this.OnTouchEnd,this.OnTouchMove,this.Owner.GetCurrentBox(),this)
		}

		private RemoveMoveHandlers() {
			this.DebugLog('RemoveMoveHandlers');
			this.Owner.RemoveEvents(this.Owner.GetCurrentBox(),this,false,true,true)
			
		}
		private ClearTimer() {
			clearTimeout(this.SelectionMoveTimer);
			this.SelectionMoveTimer = 0;
		}
		private SetTimer() {
			this.SelectionMoveTimer = setTimeout(() => this.MakeNewTemporary(), this.SelectionTimerValue);
		}
		private MakeNewTemporary() {
			if (this.TemporaryNote) {
				this.TemporaryNote.Detach();
			}
			if (!this.TemporaryNote) {
				this.TemporaryNote = new FB3Bookmarks.Bookmark(this.Owner.Bookmarks);
			}
			this.TemporaryNote.Group = 3;
			this.TemporaryNote.TemporaryState = 1;
			this.SelectionState = true;
		}

		private OnStart(e): void {
			this.DebugLog('OnStart');
			var Coords: IMoveCoordinates = this.Owner.GetCoordinates(e);
			if (this.CheckEventButton(e, Coords)) {
				if (!this.SelectionState) {
					this.Coordinates = Coords;
				}
				this.AddMoveHandlers();
			}
		}		
		private OnEnd(e): void {
			this.DebugLog('OnEnd');
			this.ClearTimer();
			this.RemoveMoveHandlers();
			this.ClearCoordinates();

			this.TouchState = false;
			if(this.Owner.CheckFirefoxTouchEvent(e) || !this.Owner.CheckIETouchEvent(e) || !e.touches) {
				this.Owner.GetCurrentBox().style.display = "block"		
				this.DebugLog("Remove readbox selection");
				this.Owner.RemoveEvents(this.Owner.ReaderBox,this,false,true,false)			

			}			
			if (this.SelectedTextState || (!this.SelectedTextState && this.SelectionState) ||
				(!this.Owner.PDA.state && this.SelectionState)) {
					// we have selected text
					// we have selection ON, but didnt selected text (to skip double fire)
					// we have selection and its not PDA, why? some sort of fix
					this.SelectedTextState = false;
					this.SelectionState = false;
					return;
			}
			this.SelectionState = false;
			this.DebugLog("selection state " + this.SelectionState)
			//this.Callback(e);
			if (this.CheckEventButton(e)) {
				this.Callback(e);
			}



		}
		private CheckEventButton(e, Coords?: IMoveCoordinates): boolean {
			var Coords: IMoveCoordinates = Coords || this.Owner.GetCoordinates(e);
			this.DebugLog("coords button " + Coords.Button)
			return Coords.Button <= 1 || this.Owner.PDA.state;
		}
		//метод OnMove работает следующим образом - если уже идет отрисовка, то ничего не делаем, а просто вешаем таймаут, 
		//до тех пор, пока прорисовка не закончится или не начнется новое событие OnMove
		//необходимо для того, чтобы отрисовка происходила быстрее и не вешало браузер
		private OnMove(e): void {
			clearTimeout(this.RedrawTimeoutID);
			if (!this.Owner.Reader.RedrawInProgress) {
				if (this.SelectionState) {
					var FailInit = false;
					// if we dont have any Temp notes, just ignor anything
					if (this.TemporaryNote && this.TemporaryNote.Group == 3) {
						var Coords: IMoveCoordinates = this.Owner.GetCoordinates(e, this.Coordinates);
						this.ClearCoordinates();
						Coords.X = this.HackCanvasCoordinateX(Coords.X);
						if (!isRelativeToViewport()) { // hack for touch-based devices
							Coords.X += window.pageXOffset;
							Coords.Y += window.pageYOffset;
						}
						this.FinishSelect(Coords);
					}
					// если метод был вызван неявно, а с помошью таймуата, может случиться ситуация, что мышь на самом деле уже не нажата
					// делаем доп. проверку, чтобы обойти эту проблему
				} else if (this.Owner.IsMouseDown) {
					this.SetTimer();
				}				
			} else {
				this.RedrawTimeoutID = setTimeout(() => { this.OnMove(e) }, 10);

			}

		}
		private FinishSelect(Coords: IMoveCoordinates) {
			var CurrentElPos: FB3ReaderAbstractClasses.IPosition = this.Owner.Reader.ElementAtXY(Coords.X, Coords.Y);
			if (!this.SelectedTextState)
			{
				this.StartElPos = CurrentElPos;
			}
			if (CurrentElPos && CurrentElPos.length && this.StartElPos && this.StartElPos.length)
			{
				if (FB3Reader.PosCompare(CurrentElPos, this.StartElPos) < 0)
				{
					this.UpdateRange(CurrentElPos, this.StartElPos);
				} else
				{
					this.UpdateRange(this.StartElPos, CurrentElPos);
				}
				this.UpdateTemporaryNote();
			}

		}
		public GetSelectedText(): string {
			return this.TemporaryNote.RawText;
		}

		private UpdateRange(StartPos: FB3ReaderAbstractClasses.IPosition, EndPos: FB3ReaderAbstractClasses.IPosition) {
			this.TemporaryNote.Range.From = StartPos;
			this.TemporaryNote.Range.To = EndPos;
		}
		private UpdateTemporaryNote() {
			this.SelectedTextState = true;
			// logic - remove old one, create new, add new
			var NewNote: FB3Bookmarks.IBookmark = this.TemporaryNote.RoundClone(false);
			NewNote.TemporaryState = 1;
			this.TemporaryNote.Detach();
			this.TemporaryNote = NewNote;
			this.Owner.Bookmarks.AddBookmark(this.TemporaryNote);
			this.Refresh();
		}
		private HackCanvasCoordinateX(X: number): number {
			var sideMargin = calcReaderMargin();
			var readerWidth = this.Owner.GetCurrentBox().offsetWidth - sideMargin;
			if (X < sideMargin) {
				X = sideMargin + 1;
			} else if (X > readerWidth + sideMargin) {
				X = readerWidth + sideMargin - 1;
			}
			return Math.floor(X);
		}
		private Refresh() {
			this.Owner.Refresh();
		}
		public Remove(): boolean {
			if (this.TemporaryNote) {
				this.TemporaryNote.Detach();
				this.TemporaryNote = undefined;
				this.Refresh();
				return false;
			}
			return true;
		}
		private ClearTouchTimer() {
			clearTimeout(this.TouchMoveTimer);
			this.TouchMoveTimer = 0;
			this.DateStart = 0;
		}
		private OnTouchStart(e): void {
			this.DebugLog('OnTouchStart');
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
				this.OnStart(e);
				return;
			}
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
				this.OnEnd(e);
			} else {
				var Coords: IMoveCoordinates = this.Owner.GetCoordinates(e, this.Coordinates);
				var ele = <HTMLElement>document.elementFromPoint(Coords.X,Coords.Y)
				if(!hasClass(ele,"my_selectid",true)) {
					this.OnEnd(e);
				}				
			}


			if(!this.TouchState) {

				this.DateStart = Date.now();								
				return this.OnStart(e)
			}
		}
		private OnTouchEnd(e): void {
			this.DebugLog('OnTouchEnd');
			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
				this.OnEnd(e);
				return;
			}			
			this.ClearTouchTimer();
			if(ContextObj.ShowState) return;
			if (this.TouchState) {
				this.DebugLog('OnTouchEnd Touchstate == true');
				this.TouchState = false;

				this.Owner.GetCurrentBox().style.display = "none"
				this.Owner.AddEvents(null,this.OnTouchEnd, null,this.Owner.ReaderBox,this)	
				this.RemoveMoveHandlers();				
				if (this.SelectedTextState || (!this.SelectedTextState && this.SelectionState)) {
					// we have selected text
					// we have selection ON, but didnt selected text (to skip double fire)
					// we have selection and its not PDA, why? some sort of fix
						this.SelectedTextState = false;
						this.SelectionState = false;
						return;
				}
				this.SelectionState = false;
				return;
			}
			this.TouchState = false;
			var Coords: IMoveCoordinates = this.Owner.GetCoordinates(e, this.Coordinates);
			var ele = <HTMLElement>document.elementFromPoint(Coords.X,Coords.Y)
			if(!hasClass(ele,"my_selectid",true)) {
				this.OnEnd(e);
			}							
		}
		private OnTouchMove(e): void {

			if(!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
				this.OnMove(e);
				return;
			}			
			this.TouchMoveTimer = setTimeout(() => {

				if(this.DateStart == 0 || Date.now() - this.DateStart < 300) {
					this.ClearTimer();

					return;
				}
				this.TouchState = true;
				this.OnMove(e);			
			}, this.TouchTimerValue);
		}
		private DebugLog(str) {
			if (this.Debug) {
				console.log('[SelectionObj] ' + str);
			}
		}
	}
}