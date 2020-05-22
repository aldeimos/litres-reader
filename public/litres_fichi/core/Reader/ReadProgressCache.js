var FB3ReadProgressCache;
(function (FB3ReadProgressCache) {
    var SkipCache = false;
    var ReadProgressDump = (function () {
        function ReadProgressDump(Data) {
            var _this = this;
            var DumpObject;
            if (typeof (Data) == 'string') {
                try {
                    DumpObject = JSON.parse(Data);
                }
                catch (e) {
                    DumpObject = { CharactersRead: 0, LastReportReadPos: 0, ReadRanges: [] };
                }
            }
            else {
                DumpObject = Data;
            }
            ['CharactersRead', 'LastReportReadPos', 'ReadRanges'].forEach(function (e) { if (DumpObject.hasOwnProperty(e))
                _this[e] = DumpObject[e]; });
        }
        ReadProgressDump.prototype.toString = function () {
            return JSON.stringify(this);
        };
        return ReadProgressDump;
    }());
    FB3ReadProgressCache.ReadProgressDump = ReadProgressDump;
    var ReadProgressCache = (function () {
        function ReadProgressCache(Reader, Encrypt) {
            if (Encrypt === void 0) { Encrypt = true; }
            this.Encrypt = Encrypt;
            this.Reader = Reader;
            SkipCache = !FB3PPCache.CheckStorageAvail();
        }
        ReadProgressCache.prototype.getKey = function () {
            if (!this.Reader.FB3DOM.MetaData || !this.Reader.FB3DOM.MetaData.UUID) {
                SkipCache = true;
                return undefined;
            }
            if (this.Key !== undefined) {
                return this.Key;
            }
            return this.Key = ['FB3ReaderProgress', this.Reader.Version, this.Reader.FB3DOM.MetaData.UUID, this.Reader.Site.Key].join(':');
        };
        ReadProgressCache.prototype.Store = function (Data) {
            if (SkipCache) {
                return false;
            }
            return this.SaveData(this.EncodeData(Data));
        };
        ReadProgressCache.prototype.Retrieve = function () {
            if (SkipCache) {
                return undefined;
            }
            return this.DecodeData(this.LoadData());
        };
        ReadProgressCache.prototype.DecodeData = function (Data) {
            if (this.Encrypt) {
                return LZString.decompressFromUTF16(Data);
            }
            return Data;
        };
        ReadProgressCache.prototype.EncodeData = function (Data) {
            if (this.Encrypt) {
                return LZString.compressToUTF16(Data);
            }
            return Data;
        };
        ReadProgressCache.prototype.LoadData = function () {
            if (FB3PPCache.CheckStorageAvail()) {
                return this.DecodeData(localStorage[this.getKey()]);
            }
            return undefined;
        };
        ReadProgressCache.prototype.SaveData = function (Data) {
            if (FB3PPCache.CheckStorageAvail()) {
                localStorage[this.getKey()] = this.EncodeData(Data);
                return true;
            }
            return false;
        };
        return ReadProgressCache;
    }());
    FB3ReadProgressCache.ReadProgressCache = ReadProgressCache;
})(FB3ReadProgressCache || (FB3ReadProgressCache = {}));
//# sourceMappingURL=ReadProgressCache.js.map