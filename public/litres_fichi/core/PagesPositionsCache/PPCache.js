var FB3PPCache;
(function (FB3PPCache) {
    FB3PPCache.INDEXED_DB = 'indexeddb';
    FB3PPCache.LOCAL_STORAGE = 'localstorage';
    FB3PPCache.NO_STORAGE = 'nostorage';
    function CheckStorageAvail() {
        if (CheckIndexedDBAvail()) {
            return FB3PPCache.INDEXED_DB;
        }
        if (CheckLocalStorageAvail()) {
            return FB3PPCache.LOCAL_STORAGE;
        }
        return FB3PPCache.NO_STORAGE;
    }
    FB3PPCache.CheckStorageAvail = CheckStorageAvail;
    function CheckLocalStorageAvail() {
        if (FB3PPCache.LocalStorage !== undefined) {
            return FB3PPCache.LocalStorage;
        }
        try {
            window.localStorage['working'] = 'true';
            FB3PPCache.LocalStorage = true;
            window.localStorage.removeItem('working');
        }
        catch (e) {
            FB3PPCache.LocalStorage = false;
        }
        return FB3PPCache.LocalStorage;
    }
    FB3PPCache.CheckLocalStorageAvail = CheckLocalStorageAvail;
    function CheckIndexedDBAvail() {
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        return window.indexedDB !== null;
    }
    FB3PPCache.CheckIndexedDBAvail = CheckIndexedDBAvail;
    FB3PPCache.MaxCacheRecords = 15;
    var SkipCache = false;
    var PPCache = (function () {
        function PPCache(Driver) {
            if (Driver === void 0) { Driver = FB3PPCache.LOCAL_STORAGE; }
            this.Encrypt = true;
            this.IsReady = false;
            if (Driver === FB3PPCache.LOCAL_STORAGE) {
                this.Driver = new LocalStorageDriver(this);
            }
            else if (Driver === FB3PPCache.INDEXED_DB) {
                this.Driver = new IndexedDBDriver(this);
            }
            this.Reset();
        }
        PPCache.prototype.Get = function (I) {
            return this.PagesPositionsCache[I];
        };
        PPCache.prototype.Set = function (I, Instr) {
            this.PagesPositionsCache[I] = Instr;
        };
        PPCache.prototype.Reset = function () {
            this.CacheMarkupsList = null;
            this.PagesPositionsCache = new Array();
            this.MarginsCache = {};
            this.IsReady = this.Driver.IsLocal;
        };
        PPCache.prototype.Length = function () {
            return this.PagesPositionsCache.length;
        };
        PPCache.prototype.Save = function (Key) {
            var _this = this;
            if (SkipCache) {
                return;
            }
            if (FB3PPCache.CheckStorageAvail() !== FB3PPCache.NO_STORAGE) {
                if (!this.CacheMarkupsList) {
                    this.LoadOrFillEmptyData(function () {
                        _this.SaveData(Key, _this.CacheMarkupsList);
                    });
                }
                else {
                    this.SaveData(Key, this.CacheMarkupsList);
                }
            }
        };
        PPCache.prototype.Load = function (Key) {
            var _this = this;
            if (SkipCache) {
                this.IsReady = true;
                return;
            }
            if (FB3PPCache.CheckStorageAvail() !== FB3PPCache.NO_STORAGE) {
                if (!this.CacheMarkupsList) {
                    this.LoadOrFillEmptyData(function (CacheMarkupsList) {
                        _this.Driver.Find(Key, function (CacheMarkupList) {
                            if (CacheMarkupList) {
                                _this.PagesPositionsCache = CacheMarkupList.Cache;
                                _this.MarginsCache = CacheMarkupList.MarginsCache;
                                _this.LastPageN = CacheMarkupList.LastPage;
                            }
                            _this.IsReady = true;
                        });
                    });
                }
            }
        };
        PPCache.prototype.LoadDataAsync = function (ArtID) { };
        PPCache.prototype.LoadOrFillEmptyData = function (Callback) {
            var _this = this;
            if (Callback === void 0) { Callback = function (CacheMarkupsList) { }; }
            this.LoadData(function (cacheData) {
                var DataInitDone = false;
                if (cacheData) {
                    try {
                        _this.CacheMarkupsList = cacheData;
                        DataInitDone = true;
                    }
                    catch (e) { }
                }
                if (!DataInitDone) {
                    _this.CacheMarkupsList = new Array();
                }
                Callback(_this.CacheMarkupsList);
            });
        };
        PPCache.prototype.LastPage = function (LastPageN) {
            if (LastPageN == undefined) {
                return this.LastPageN;
            }
            else {
                this.LastPageN = LastPageN;
            }
        };
        PPCache.prototype.SetMargin = function (XP, Margin) {
            this.MarginsCache[XP] = Margin;
        };
        PPCache.prototype.GetMargin = function (XP) {
            return this.MarginsCache[XP];
        };
        PPCache.prototype.CheckIfKnown = function (From) {
            for (var I = 1; I < this.PagesPositionsCache.length; I++) {
                if (FB3Reader.PosCompare(this.PagesPositionsCache[I].Range.From, From) === 0) {
                    return I;
                }
            }
            return undefined;
        };
        PPCache.prototype.LoadData = function (Callback) {
            if (Callback === void 0) { Callback = function (compressedCacheData) { }; }
            return this.Driver.LoadData(Callback);
        };
        PPCache.prototype.SaveData = function (Key, Data, Callback) {
            if (Callback === void 0) { Callback = function () { }; }
            this.Driver.SaveData(Key, {
                Time: new Date,
                Key: Key,
                Cache: this.PagesPositionsCache,
                LastPage: this.LastPageN,
                MarginsCache: this.MarginsCache
            }, Data, Callback);
        };
        return PPCache;
    }());
    FB3PPCache.PPCache = PPCache;
    var LocalStorageDriver = (function () {
        function LocalStorageDriver(Consumer) {
            this.IsLocal = true;
            this.Consumer = Consumer;
        }
        LocalStorageDriver.prototype.DecodeData = function (Data) {
            try {
                if (this.Consumer.Encrypt) {
                    return JSON.parse(LZString.decompressFromUTF16(Data));
                }
                return JSON.parse(Data);
            }
            catch (e) {
                return [];
            }
        };
        LocalStorageDriver.prototype.EncodeData = function (Data) {
            try {
                if (this.Consumer.Encrypt) {
                    return LZString.compressToUTF16(JSON.stringify(Data));
                }
                return JSON.stringify(Data);
            }
            catch (e) {
                return '';
            }
        };
        LocalStorageDriver.prototype.LRU = function (Key, CacheMarkupList) {
            for (var I = 0; I < this.CacheMarkupsList.length; I++) {
                if (this.CacheMarkupsList[I].Key == Key) {
                    this.CacheMarkupsList.splice(I, 1);
                }
            }
            if (this.CacheMarkupsList.length >= FB3PPCache.MaxCacheRecords) {
                this.CacheMarkupsList.shift();
            }
            this.CacheMarkupsList.push(CacheMarkupList);
        };
        LocalStorageDriver.prototype.LoadData = function (Callback) {
            if (Callback === void 0) { Callback = function (CacheMarkupsList) { }; }
            var Data = this.DecodeData(localStorage['FB3Reader1.0']);
            this.CacheMarkupsList = Data;
            Callback(Data);
            return '';
        };
        LocalStorageDriver.prototype.SaveData = function (Key, CacheMarkupList, Data, Callback) {
            this.CacheMarkupsList = Data;
            this.LRU(Key, CacheMarkupList);
            Callback(localStorage['FB3Reader1.0'] = this.EncodeData(Data));
        };
        LocalStorageDriver.prototype.Find = function (Key, Callback) {
            if (!this.CacheMarkupsList) {
                this.LoadData();
            }
            for (var I = 0; I < this.CacheMarkupsList.length; I++) {
                if (this.CacheMarkupsList[I].Key == Key) {
                    Callback(this.CacheMarkupsList[I]);
                    return;
                }
            }
            Callback(null);
        };
        return LocalStorageDriver;
    }());
    FB3PPCache.LocalStorageDriver = LocalStorageDriver;
    var DB_NAME = 'FB3ReaderDB';
    var STORE_NAME = 'FBReaderStore';
    var IndexedDBDriver = (function () {
        function IndexedDBDriver(Consumer) {
            this.db = null;
            this.openRequest = null;
            this.store = null;
            this.IsLocal = false;
            this.IsReady = false;
            this.Consumer = Consumer;
            this.InitDatabase();
        }
        IndexedDBDriver.prototype.InitDatabase = function () {
            this.IsReady = false;
            this.openRequest = window.indexedDB.open(DB_NAME, 1);
            this.openRequest.onsuccess = this.OnSuccess.bind(this);
            this.openRequest.onupgradeneeded = this.OnUpgradeEnded.bind(this);
        };
        IndexedDBDriver.prototype.OnSuccess = function (e) {
            this.db = event.target.result;
            this.IsReady = true;
        };
        IndexedDBDriver.prototype.OnUpgradeEnded = function (e) {
            this.db = e.target.result;
            this.store = this.CreateObjectStore();
        };
        IndexedDBDriver.prototype.UseDatabase = function (Callback) {
            var _this = this;
            if (Callback === void 0) { Callback = function () { }; }
            if (!this.IsReady) {
                this.openRequest.onsuccess = function (e) {
                    _this.OnSuccess(e);
                    Callback();
                };
                return;
            }
            Callback();
        };
        IndexedDBDriver.prototype.CreateObjectStore = function () {
            if (!this.db.objectStoreNames.contains(STORE_NAME)) {
                return this.db.createObjectStore(STORE_NAME, { keyPath: 'Key' });
            }
            return null;
        };
        IndexedDBDriver.prototype.GetObjectStore = function () {
            var transaction = this.db.transaction(STORE_NAME, 'readwrite');
            return transaction.objectStore(STORE_NAME);
        };
        IndexedDBDriver.prototype.OnError = function (e) {
            console.warn(e);
        };
        IndexedDBDriver.prototype.SaveData = function (Key, CachedMarkupList, Data, Callback) {
            var _this = this;
            if (Callback === void 0) { Callback = function () { }; }
            this.UseDatabase(function (e) {
                var store = _this.GetObjectStore();
                _this.db.onerror = _this.OnError.bind(_this);
                var request = store.put(CachedMarkupList);
                request.onsuccess = function (e) {
                    Callback();
                };
            });
        };
        IndexedDBDriver.prototype.Find = function (Key, Callback) {
            var _this = this;
            if (Callback === void 0) { Callback = function () { }; }
            this.UseDatabase(function (e) {
                var store = _this.GetObjectStore(), request = store.get(Key);
                request.onsuccess = function (e) {
                    Callback(request.result);
                };
            });
        };
        IndexedDBDriver.prototype.LoadData = function (Callback) {
            var _this = this;
            if (Callback === void 0) { Callback = function (data) { }; }
            this.UseDatabase(function (e) {
                var store = _this.GetObjectStore();
                _this.db.onerror = _this.OnError.bind(_this);
                var data = [];
                store.openCursor().onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        data.push(cursor.value);
                        cursor["continue"]();
                    }
                    else {
                        Callback(data);
                    }
                };
            });
            return '';
        };
        return IndexedDBDriver;
    }());
    FB3PPCache.IndexedDBDriver = IndexedDBDriver;
})(FB3PPCache || (FB3PPCache = {}));
//# sourceMappingURL=PPCache.js.map