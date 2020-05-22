var WebHistory;
(function (WebHistory) {
    var HistoryClass = /** @class */ (function () {
        function HistoryClass(Reader, skipHash) {
            var _this = this;
            this.Reader = Reader;
            this.skipHash = skipHash;
            this.MaxLen = 10;
            this.HistoryData = [];
            this.JustAddedHash = false;
            if (!this.skipHash) {
                window.onhashchange = function () { return _this.backAction(); };
            }
        }
        HistoryClass.prototype.push = function (Data) {
            if (this.checkHistory() >= this.MaxLen) {
                this.HistoryData.shift();
            }
            if (!this.skipHash) {
                this.JustAddedHash = true;
                window.location.hash = 'back_' + Data.join('_');
            }
            this.HistoryData.push(Data);
            LitresReaderSite.HistoryAfterUpdate();
        };
        HistoryClass.prototype.checkHistory = function () {
            return this.HistoryData.length;
        };
        HistoryClass.prototype.back = function () {
            return this.HistoryData.pop();
        };
        HistoryClass.prototype.backAction = function () {
            if (this.JustAddedHash) {
                this.JustAddedHash = false;
                return;
            }
            // console.log('hashchange');
            if (this.checkHistory()) {
                this.Reader.GoTO(this.back());
                if (this.checkHistory() == 0) {
                    LitresReaderSite.HistoryAfterLast();
                }
            }
        };
        return HistoryClass;
    }());
    WebHistory.HistoryClass = HistoryClass;
})(WebHistory || (WebHistory = {}));
