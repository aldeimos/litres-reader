var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FB3BookReadProgress;
(function (FB3BookReadProgress) {
    var Catalit = (function (_super) {
        __extends(Catalit, _super);
        function Catalit() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Catalit.prototype.sendReport = function (param, successCallback, failureCallback) {
            param['t'] = this.isTrial ? 1 : 0;
            param['f'] = this.isSubscription ? 1 : 0;
            this.addNewRequest({
                func: 'w_read_report',
                id: 'w_read_report',
                param: param
            });
            this.requestAPI(successCallback, failureCallback);
        };
        Catalit.prototype.SendReadReport = function (CharactersRead, Promille, successCallback, failureCallback) {
            this.clearRequestsArray();
            var param = {
                art: this.artID,
                h: CharactersRead,
                p: Promille
            };
            this.sendReport(param, successCallback, failureCallback);
        };
        Catalit.prototype.SendPageFlipReport = function (Promille, EventsNumber, successCallback, failureCallback) {
            this.clearRequestsArray();
            var param = {
                art: this.artID,
                h: 0,
                n: EventsNumber,
                p: Promille
            };
            this.sendReport(param, successCallback, failureCallback);
        };
        Catalit.prototype.setArtID = function (artID) {
            return this.artID = artID;
        };
        Catalit.prototype.setTrialSign = function (isTrial) {
            return this.isTrial = isTrial;
        };
        Catalit.prototype.setSubscriptionSign = function (isSubscription) {
            return this.isSubscription = isSubscription;
        };
        Catalit.prototype.setCaller = function (readProgress) {
            return this.readProgress = readProgress;
        };
        return Catalit;
    }(CatalitWeb.CatalitWebApp));
    var BookReadProgressInfo = (function () {
        function BookReadProgressInfo(Reader) {
            this.Reader = Reader;
            this.CharactersRead = 0;
            this.LastReportReadPos = 0;
            this.FlippedPagesNumber = 0;
            this.ReadRanges = [];
            this.isChanged = true;
        }
        BookReadProgressInfo.prototype.Dump = function () {
            var Dump = new FB3ReadProgressCache.ReadProgressDump(this);
            return Dump.toString();
        };
        BookReadProgressInfo.prototype.Restore = function (Data) {
            if (!Data) {
                return false;
            }
            var Dump = new FB3ReadProgressCache.ReadProgressDump(Data);
            this.CharactersRead = Dump.CharactersRead;
            this.ReadRanges = Dump.ReadRanges;
            this.LastReportReadPos = Dump.LastReportReadPos;
            return true;
        };
        BookReadProgressInfo.prototype.Inc = function (Pos) {
            var newPos = Pos.slice(0);
            if (Pos.length > 0) {
                Pos[Pos.length - 1] += 1;
            }
            return Pos;
        };
        BookReadProgressInfo.prototype.CompactReadRanges = function () {
            if (this.ReadRanges.length < 2)
                return;
            var newRanges = this.ReadRanges.slice(0, 1);
            for (var i = 1; i < this.ReadRanges.length; i++) {
                var To = newRanges[newRanges.length - 1].To;
                var To2 = newRanges[newRanges.length - 1].To.slice(0);
                To2[To2.length - 1]++;
                var From = this.ReadRanges[i].From.toString();
                if (To.toString() == From || To2.toString() == From) {
                    newRanges[newRanges.length - 1].To = this.ReadRanges[i].To;
                    continue;
                }
                newRanges.push(this.ReadRanges[i]);
            }
            this.ReadRanges = newRanges;
        };
        BookReadProgressInfo.prototype.isGreater = function (RangeA, RangeB, IsLeft, IsEnclosed) {
            if (IsLeft === void 0) { IsLeft = false; }
            if (IsEnclosed === void 0) { IsEnclosed = false; }
            if (IsEnclosed) {
                if (RangeA.length == 0 && RangeB.length == 0)
                    return false;
                if (RangeA.length == 0 && RangeB.length > 0)
                    return !IsLeft;
                if (RangeB.length == 0)
                    return IsLeft;
            }
            if (RangeA[0] > RangeB[0])
                return true;
            if (RangeA[0] == RangeB[0]) {
                return this.isGreater(RangeA.slice(1), RangeB.slice(1), IsLeft, true);
            }
            return false;
        };
        BookReadProgressInfo.prototype.isGreaterLeft = function (RangeA, RangeB) {
            var IsLeft = true;
            return this.isGreater(RangeA, RangeB);
        };
        BookReadProgressInfo.prototype.isGreaterRight = function (RangeA, RangeB) {
            return this.isGreater(RangeA, RangeB);
        };
        BookReadProgressInfo.prototype.CalculateRangeLength = function (From, To, IsEnclosed, Childs) {
            if (IsEnclosed === void 0) { IsEnclosed = false; }
            var contentLength = 0;
            var debugText = '';
            if (!IsEnclosed) {
                if (!this.Reader.FB3DOM || !this.Reader.FB3DOM.Childs || this.Reader.FB3DOM.Childs.length == 0) {
                    return 0;
                }
                return this.CalculateRangeLength(From, To, true, this.Reader.FB3DOM.Childs);
            }
            var min = (From.length > 0) ? From[0] : 0;
            var max = (To.length > 0) ? To[0] : Childs.length - 1;
            for (var i = min; i <= max; i++) {
                var NextFrom = (From.length > 1 && i > From[0]) ? [] : From.slice(1);
                var NextTo = (i == max) ? To.slice(1) : [];
                if (Childs[i].text.length == 0) {
                }
                else if (Childs[i].text && Childs[i].text.length > 0 && From.length <= 1) {
                    contentLength += Childs[i].Chars;
                    debugText += Childs[i].text;
                }
                if (Childs[i].Childs) {
                    contentLength += this.CalculateRangeLength(NextFrom, NextTo, true, Childs[i].Childs);
                }
            }
            return contentLength;
        };
        BookReadProgressInfo.prototype.WalkReadRange = function (Page, DoUpdateRange) {
            var Range = {
                'From': Page.WholeRangeToRender.From.slice(0),
                'To': Page.WholeRangeToRender.To.slice(0)
            };
            var ContentLength = Page.ContentLength;
            for (var i = 0; i < this.ReadRanges.length; i++) {
                if (this.isGreaterLeft(Range.From, Range.To))
                    break;
                var canContinue = (i < this.ReadRanges.length - 1);
                if (this.isGreaterLeft(Range.From, this.ReadRanges[i].From)) {
                    if (this.isGreaterLeft(Range.From, this.ReadRanges[i].To)) {
                        if (canContinue)
                            continue;
                        break;
                    }
                    if (this.isGreaterRight(Range.To, this.ReadRanges[i].To)) {
                        if (canContinue) {
                            ContentLength -= this.CalculateRangeLength(Range.From, this.ReadRanges[i].To);
                            Range.From = this.Inc(this.ReadRanges[i].To);
                            continue;
                        }
                        ContentLength -= this.CalculateRangeLength(Range.From, this.ReadRanges[i].To);
                        if (DoUpdateRange)
                            this.ReadRanges[i].To = Range.To;
                        return ContentLength;
                    }
                    ContentLength -= this.CalculateRangeLength(Range.From, Range.To);
                    return ContentLength;
                }
                if (this.isGreaterRight(Range.To, this.ReadRanges[i].From)) {
                    if (this.isGreaterRight(Range.To, this.ReadRanges[i].To)) {
                        if (canContinue) {
                            ContentLength -= this.CalculateRangeLength(this.ReadRanges[i].From, this.ReadRanges[i].To);
                            if (DoUpdateRange)
                                this.ReadRanges[i].From = Range.From;
                            Range.From = this.Inc(this.ReadRanges[i].To);
                            continue;
                        }
                        ContentLength -= this.CalculateRangeLength(this.ReadRanges[i].From, this.ReadRanges[i].To);
                        if (DoUpdateRange)
                            this.ReadRanges[i] = Range;
                        return ContentLength;
                    }
                    ContentLength -= this.CalculateRangeLength(this.ReadRanges[i].From, Range.To);
                    if (DoUpdateRange)
                        this.ReadRanges[i].From = Range.From;
                    return ContentLength;
                }
                else {
                    if (DoUpdateRange)
                        this.ReadRanges.splice(i, 0, Range);
                    return ContentLength;
                }
            }
            if (DoUpdateRange)
                this.ReadRanges.push(Range);
            return ContentLength;
        };
        BookReadProgressInfo.prototype.Contains = function (Page) {
            return this.WalkReadRange(Page);
        };
        BookReadProgressInfo.prototype.AddPage = function (Page) {
            var DoUpdateRange = true;
            var contentLength = this.WalkReadRange(Page, DoUpdateRange);
            if (contentLength > 0) {
                this.CharactersRead += contentLength;
                this.CompactReadRanges();
                this.isChanged = true;
            }
            return contentLength;
        };
        return BookReadProgressInfo;
    }());
    var BookReadProgress = (function () {
        function BookReadProgress(Reader) {
            this.Reader = Reader;
            this.Cache = new FB3ReadProgressCache.ReadProgressCache(Reader);
            this.Info = new BookReadProgressInfo(Reader);
            this.Catalit = new Catalit(LitresURLParser.SID, window.location.host);
            this.Catalit.setArtID(LitresURLParser.ArtID);
            this.Catalit.setTrialSign('1' == LitresURLParser.Trial);
            this.Catalit.setSubscriptionSign(LitresURLParser.IsSubscription);
            this.Catalit.setCaller(this);
        }
        BookReadProgress.prototype.AddPage = function (Page) {
            var Data = this.Cache.Retrieve();
            if (Data) {
                this.Info.Restore(Data);
            }
            if (!Page || !Page.WholeRangeToRender) {
                return 0;
            }
            this.SendPageFlipReport();
            var charactersRead = this.Info.AddPage(Page);
            if (this.Cache.Store(this.Info.Dump())) {
            }
        };
        BookReadProgress.prototype.FlipPage = function (PageNumber) {
            if (PageNumber === void 0) { PageNumber = 1; }
            this.Info.FlippedPagesNumber += PageNumber;
            if (0 > this.Info.FlippedPagesNumber) {
                console.log('Flip page number is negative: ' + this.Info.FlippedPagesNumber + ' we should look into it');
                this.Info.FlippedPagesNumber = 0;
            }
            return this.Info.FlippedPagesNumber;
        };
        BookReadProgress.prototype.ResetFlippedPagesCounter = function () {
            this.Info.FlippedPagesNumber = 0;
        };
        BookReadProgress.prototype.Contains = function (Page) {
            return this.Info.Contains(Page);
        };
        BookReadProgress.prototype.GetPromille = function () {
            var promille = Math.floor(this.Reader.CurPosPercent() * 10);
            return promille > 0 ? promille : 1;
        };
        BookReadProgress.prototype.SendReadReport = function () {
            var _this = this;
            if (!this.Info.isChanged) {
                return;
            }
            var charactersRead = this.Info.CharactersRead - this.Info.LastReportReadPos;
            if (0 >= charactersRead) {
                console.log('NOTE: very strange, negative or zero characters read amount. report was not sent.');
                return;
            }
            this.Catalit.SendReadReport(charactersRead, this.GetPromille(), function (response) {
                _this.Info.isChanged = false;
                _this.Info.LastReportReadPos = _this.Info.CharactersRead;
                _this.Cache.Store(_this.Info.Dump());
            }, function () { return console.log('unable to send read report, characters read: ' + charactersRead + ' last report pos ' + _this.Info.LastReportReadPos + ' total read: ' + _this.Info.CharactersRead); });
        };
        BookReadProgress.prototype.SendPageFlipReport = function () {
            var _this = this;
            var pagesNumber = this.Info.FlippedPagesNumber - this.Reader.GetPagesQueueLen();
            if (1 >= pagesNumber)
                return;
            this.Catalit.SendPageFlipReport(this.GetPromille(), pagesNumber, function (response) {
                _this.FlipPage(-pagesNumber);
                _this.Cache.Store(_this.Info.Dump());
            }, function () { return console.log('unable to send page flip report, pages: ' + pagesNumber); });
        };
        return BookReadProgress;
    }());
    FB3BookReadProgress.BookReadProgress = BookReadProgress;
})(FB3BookReadProgress || (FB3BookReadProgress = {}));
//# sourceMappingURL=ReadProgress.js.map