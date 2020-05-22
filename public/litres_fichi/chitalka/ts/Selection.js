/// <reference path="SelectionHead.ts" />
var SelectionModule;
(function (SelectionModule) {
    var SelectionClass = /** @class */ (function () {
        function SelectionClass(Callback, Owner) {
            this.Callback = Callback;
            this.Owner = Owner;
            this.TouchSelection = false;
            this.TouchStart = -1;
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
        SelectionClass.prototype.ClearCoordinates = function () {
            this.Coordinates = { X: 0, Y: 0, Button: null };
        };
        SelectionClass.prototype.GetSelectionState = function () {
            return this.SelectionState;
        };
        SelectionClass.prototype.AddHandlers = function () {
            this.Owner.AddEvents(this.OnTouchStart, null, null, this.Owner.GetCurrentBox(), this);
        };
        SelectionClass.prototype.AddMoveHandlers = function () {
            this.Owner.AddEvents(null, this.OnTouchEnd, this.OnTouchMove, this.Owner.GetCurrentBox(), this);
        };
        SelectionClass.prototype.RemoveMoveHandlers = function () {
            this.DebugLog('RemoveMoveHandlers');
            this.Owner.RemoveEvents(this.Owner.GetCurrentBox(), this, false, true, true);
        };
        SelectionClass.prototype.ClearTimer = function () {
            clearTimeout(this.SelectionMoveTimer);
            this.SelectionMoveTimer = 0;
        };
        SelectionClass.prototype.SetTimer = function () {
            var _this = this;
            this.SelectionMoveTimer = setTimeout(function () { return _this.MakeNewTemporary(); }, this.SelectionTimerValue);
        };
        SelectionClass.prototype.MakeNewTemporary = function () {
            if (this.TemporaryNote) {
                this.TemporaryNote.Detach();
            }
            if (!this.TemporaryNote) {
                this.TemporaryNote = new FB3Bookmarks.Bookmark(this.Owner.Bookmarks);
            }
            this.TemporaryNote.Group = 3;
            this.TemporaryNote.TemporaryState = 1;
            this.SelectionState = true;
        };
        SelectionClass.prototype.OnStart = function (e) {
            this.DebugLog('OnStart');
            var Coords = this.Owner.GetCoordinates(e);
            if (this.CheckEventButton(e, Coords)) {
                if (!this.SelectionState) {
                    this.Coordinates = Coords;
                }
                this.AddMoveHandlers();
            }
        };
        SelectionClass.prototype.OnEnd = function (e) {
            this.DebugLog('OnEnd');
            this.ClearTimer();
            this.RemoveMoveHandlers();
            this.ClearCoordinates();
            this.TouchState = false;
            if (this.Owner.CheckFirefoxTouchEvent(e) || !this.Owner.CheckIETouchEvent(e) || !e.touches) {
                this.Owner.GetCurrentBox().style.display = "block";
                this.DebugLog("Remove readbox selection");
                this.Owner.RemoveEvents(this.Owner.ReaderBox, this, false, true, false);
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
            this.DebugLog("selection state " + this.SelectionState);
            //this.Callback(e);
            if (this.CheckEventButton(e)) {
                this.Callback(e);
            }
        };
        SelectionClass.prototype.CheckEventButton = function (e, Coords) {
            var Coords = Coords || this.Owner.GetCoordinates(e);
            this.DebugLog("coords button " + Coords.Button);
            return Coords.Button <= 1 || this.Owner.PDA.state;
        };
        //метод OnMove работает следующим образом - если уже идет отрисовка, то ничего не делаем, а просто вешаем таймаут, 
        //до тех пор, пока прорисовка не закончится или не начнется новое событие OnMove
        //необходимо для того, чтобы отрисовка происходила быстрее и не вешало браузер
        SelectionClass.prototype.OnMove = function (e) {
            var _this = this;
            clearTimeout(this.RedrawTimeoutID);
            if (!this.Owner.Reader.RedrawInProgress) {
                if (this.SelectionState) {
                    var FailInit = false;
                    // if we dont have any Temp notes, just ignor anything
                    if (this.TemporaryNote && this.TemporaryNote.Group == 3) {
                        var Coords = this.Owner.GetCoordinates(e, this.Coordinates);
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
                }
                else if (this.Owner.IsMouseDown) {
                    this.SetTimer();
                }
            }
            else {
                this.RedrawTimeoutID = setTimeout(function () { _this.OnMove(e); }, 10);
            }
        };
        SelectionClass.prototype.FinishSelect = function (Coords) {
            var CurrentElPos = this.Owner.Reader.ElementAtXY(Coords.X, Coords.Y);
            if (!this.SelectedTextState) {
                this.StartElPos = CurrentElPos;
            }
            if (CurrentElPos && CurrentElPos.length && this.StartElPos && this.StartElPos.length) {
                if (FB3Reader.PosCompare(CurrentElPos, this.StartElPos) < 0) {
                    this.UpdateRange(CurrentElPos, this.StartElPos);
                }
                else {
                    this.UpdateRange(this.StartElPos, CurrentElPos);
                }
                this.UpdateTemporaryNote();
            }
        };
        SelectionClass.prototype.GetSelectedText = function () {
            return this.TemporaryNote.RawText;
        };
        SelectionClass.prototype.UpdateRange = function (StartPos, EndPos) {
            this.TemporaryNote.Range.From = StartPos;
            this.TemporaryNote.Range.To = EndPos;
        };
        SelectionClass.prototype.UpdateTemporaryNote = function () {
            this.SelectedTextState = true;
            // logic - remove old one, create new, add new
            var NewNote = this.TemporaryNote.RoundClone(false);
            NewNote.TemporaryState = 1;
            this.TemporaryNote.Detach();
            this.TemporaryNote = NewNote;
            this.Owner.Bookmarks.AddBookmark(this.TemporaryNote);
            this.Refresh();
        };
        SelectionClass.prototype.HackCanvasCoordinateX = function (X) {
            var sideMargin = calcReaderMargin();
            var readerWidth = this.Owner.GetCurrentBox().offsetWidth - sideMargin;
            if (X < sideMargin) {
                X = sideMargin + 1;
            }
            else if (X > readerWidth + sideMargin) {
                X = readerWidth + sideMargin - 1;
            }
            return Math.floor(X);
        };
        SelectionClass.prototype.Refresh = function () {
            this.Owner.Refresh();
        };
        SelectionClass.prototype.Remove = function () {
            if (this.TemporaryNote) {
                this.TemporaryNote.Detach();
                this.TemporaryNote = undefined;
                this.Refresh();
                return false;
            }
            return true;
        };
        SelectionClass.prototype.ClearTouchTimer = function () {
            clearTimeout(this.TouchMoveTimer);
            this.TouchMoveTimer = 0;
            this.DateStart = 0;
        };
        SelectionClass.prototype.OnTouchStart = function (e) {
            this.DebugLog('OnTouchStart');
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
                this.OnStart(e);
                return;
            }
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
                this.OnEnd(e);
            }
            else {
                var Coords = this.Owner.GetCoordinates(e, this.Coordinates);
                var ele = document.elementFromPoint(Coords.X, Coords.Y);
                if (!hasClass(ele, "my_selectid", true)) {
                    this.OnEnd(e);
                }
            }
            if (!this.TouchState) {
                this.DateStart = Date.now();
                return this.OnStart(e);
            }
        };
        SelectionClass.prototype.OnTouchEnd = function (e) {
            this.DebugLog('OnTouchEnd');
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
                this.OnEnd(e);
                return;
            }
            this.ClearTouchTimer();
            if (ContextObj.ShowState)
                return;
            if (this.TouchState) {
                this.DebugLog('OnTouchEnd Touchstate == true');
                this.TouchState = false;
                this.Owner.GetCurrentBox().style.display = "none";
                this.Owner.AddEvents(null, this.OnTouchEnd, null, this.Owner.ReaderBox, this);
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
            var Coords = this.Owner.GetCoordinates(e, this.Coordinates);
            var ele = document.elementFromPoint(Coords.X, Coords.Y);
            if (!hasClass(ele, "my_selectid", true)) {
                this.OnEnd(e);
            }
        };
        SelectionClass.prototype.OnTouchMove = function (e) {
            var _this = this;
            if (!this.Owner.CheckFirefoxTouchEvent(e) && !this.Owner.CheckIETouchEvent(e) && !e.touches) {
                this.OnMove(e);
                return;
            }
            this.TouchMoveTimer = setTimeout(function () {
                if (_this.DateStart == 0 || Date.now() - _this.DateStart < 300) {
                    _this.ClearTimer();
                    return;
                }
                _this.TouchState = true;
                _this.OnMove(e);
            }, this.TouchTimerValue);
        };
        SelectionClass.prototype.DebugLog = function (str) {
            if (this.Debug) {
                console.log('[SelectionObj] ' + str);
            }
        };
        return SelectionClass;
    }());
    SelectionModule.SelectionClass = SelectionClass;
})(SelectionModule || (SelectionModule = {}));
