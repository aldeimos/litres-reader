/// <reference path="PPCacheHead.ts" />
/// <reference path="../plugins/lz-string.d.ts" />

module FB3PPCache {
	export const INDEXED_DB = 'indexeddb';
	export const LOCAL_STORAGE = 'localstorage';
	export const NO_STORAGE = 'nostorage';

	export function CheckStorageAvail(): string {
		if (CheckIndexedDBAvail()) {
			return INDEXED_DB;
		}

		if (CheckLocalStorageAvail()) {
			return LOCAL_STORAGE;
		}

		return NO_STORAGE;
	}

	export function CheckLocalStorageAvail(): boolean {
		if (FB3PPCache.LocalStorage !== undefined) {
			return FB3PPCache.LocalStorage;
		}
		try {
			window.localStorage['working'] = 'true';
			FB3PPCache.LocalStorage = true;
			window.localStorage.removeItem('working');
		} catch (e) {
			FB3PPCache.LocalStorage = false;
		}
		return FB3PPCache.LocalStorage;
	}

	export function CheckIndexedDBAvail(): boolean {
		// TS doesn't know about prefixes
		(<any>window).indexedDB = window.indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || (<any>window).msIndexedDB;

		return window.indexedDB !== null;
	}

	export var MaxCacheRecords: number = 15;
	export var LocalStorage: boolean; // global for window.localStorage check

	var SkipCache: boolean = false; // For debug purposes

	export class PPCache implements IFB3PPCache {
		private PagesPositionsCache: FB3Reader.IPageRenderInstruction[];
		private CacheMarkupsList: IPageRenderInstructionsCacheEntry[];
		private LastPageN: number;
		private MarginsCache: any; // we are going to store a plain hash here for all "margined" elements
		public Encrypt: boolean = true;
		public IsReady: boolean = false;

		private Driver;

		constructor(Driver: string = LOCAL_STORAGE) {
			if (Driver === LOCAL_STORAGE) {
				this.Driver = new LocalStorageDriver(this);
			} else if (Driver === INDEXED_DB) {
				this.Driver = new IndexedDBDriver(this);
			}

			this.Reset();
		}

		public Get(I: number): FB3Reader.IPageRenderInstruction {
			return this.PagesPositionsCache[I];
		}
		public Set(I: number, Instr: FB3Reader.IPageRenderInstruction): void {
			this.PagesPositionsCache[I] = Instr;
		}

		public Reset(): void {
			this.CacheMarkupsList = null;
			this.PagesPositionsCache = new Array();
			this.MarginsCache = {};
			this.IsReady = this.Driver.IsLocal;
		}

		public Length(): number {
			return this.PagesPositionsCache.length;
		}

		public Save(Key: string): void {
			if (SkipCache) {
				return;
			}
			// We are going to save no more than 50 cache entries
			// We reuse slots on write request based on access time

			if (FB3PPCache.CheckStorageAvail() !== NO_STORAGE) {
				// localStorage support required
				if (!this.CacheMarkupsList) {
					this.LoadOrFillEmptyData(() => {
						this.SaveData(Key, this.CacheMarkupsList);
					});
				} else {
					this.SaveData(Key, this.CacheMarkupsList);
				}

			}//  else { no luck, no store - recreate from scratch } 
		}

		public Load(Key: string): void {
			if (SkipCache) {
				this.IsReady = true;
				return;
			}
			if (FB3PPCache.CheckStorageAvail() !== NO_STORAGE) {
				if (!this.CacheMarkupsList) {
					this.LoadOrFillEmptyData((CacheMarkupsList) => {
						this.Driver.Find(Key, (CacheMarkupList) => {
							if (CacheMarkupList) {
								this.PagesPositionsCache = CacheMarkupList.Cache;
								this.MarginsCache = CacheMarkupList.MarginsCache;
								this.LastPageN = CacheMarkupList.LastPage;
							}

							this.IsReady = true;
						});
					});
				}
			}
		}

		public LoadDataAsync(ArtID: string) { }

		private LoadOrFillEmptyData(Callback = (CacheMarkupsList: IPageRenderInstructionsCacheEntry[]) => {}): void {
			this.LoadData((cacheData) => {
				var DataInitDone = false;
				if (cacheData) {
					try {
						this.CacheMarkupsList = cacheData;
						DataInitDone = true;
					} catch (e) { }
				}
				if (!DataInitDone) {
					this.CacheMarkupsList = new Array();
				}
				Callback(this.CacheMarkupsList);
			});
		}

		public LastPage(LastPageN?: number): number {
			if (LastPageN == undefined) {
				return this.LastPageN;
			} else {
				this.LastPageN = LastPageN;
			}
		}
		public SetMargin(XP: string, Margin: number): void {
			this.MarginsCache[XP] = Margin;
		}

		public GetMargin(XP: string): number {
			return this.MarginsCache[XP];
		}

		public CheckIfKnown(From: FB3DOM.IXPath): number {
			for (var I = 1; I < this.PagesPositionsCache.length; I++) {
				if (FB3Reader.PosCompare(this.PagesPositionsCache[I].Range.From, From) === 0) {
					return I;
				}
			}
			return undefined;
		}

		public LoadData(Callback = (compressedCacheData) => {}): string {
			return this.Driver.LoadData(Callback);
		}

		public SaveData(Key: String, Data: IPageRenderInstructionsCacheEntry[], Callback = () => {}): void {
			this.Driver.SaveData(Key, <IPageRenderInstructionsCacheEntry> {
				Time: new Date,
				Key: Key,
				Cache: this.PagesPositionsCache,
				LastPage: this.LastPageN,
				MarginsCache: this.MarginsCache
			}, Data, Callback);
		}
	}

	interface IStorageDriver {
		IsLocal: boolean;
		LoadData(Callback: Function): string;
		SaveData(Key: String, CacheMarkupList: IPageRenderInstructionsCacheEntry, Data?: IPageRenderInstructionsCacheEntry[], Callback?: Function): void;
		Find(Key, Callback?: (CacheMarkupList) => {});
	}

	export class LocalStorageDriver implements IStorageDriver {
		private Consumer: IFB3PPCache;
		private CacheMarkupsList: IPageRenderInstructionsCacheEntry[];

		public readonly IsLocal: boolean = true;

		constructor(Consumer: IFB3PPCache) {
			this.Consumer = Consumer;	
		}

		private DecodeData(Data) {
			try {
				if (this.Consumer.Encrypt) {
					return JSON.parse(LZString.decompressFromUTF16(Data));
				}
				return JSON.parse(Data);
			} catch (e) {
				return [];
			}
		}

		private EncodeData(Data) {
			try {
				if (this.Consumer.Encrypt) {
					return LZString.compressToUTF16(JSON.stringify(Data));
				}
				return JSON.stringify(Data);
			} catch (e) {
				return '';
			}
		}

		private LRU(Key, CacheMarkupList) {
			for (var I = 0; I < this.CacheMarkupsList.length; I++) {
				if (this.CacheMarkupsList[I].Key == Key) {
					this.CacheMarkupsList.splice(I, 1);
				}
			}

			if (this.CacheMarkupsList.length >= MaxCacheRecords) {
				this.CacheMarkupsList.shift();
			}

			this.CacheMarkupsList.push(CacheMarkupList);
		}

		public LoadData(Callback = (CacheMarkupsList: IPageRenderInstructionsCacheEntry[]) => {}): string {
			var Data = this.DecodeData(localStorage['FB3Reader1.0']); 

			this.CacheMarkupsList = Data;
			Callback(Data);

			return '';
		}

		public SaveData(Key: String, CacheMarkupList: IPageRenderInstructionsCacheEntry, Data?: IPageRenderInstructionsCacheEntry[], Callback?: Function): void {
			this.CacheMarkupsList = Data;
			this.LRU(Key, CacheMarkupList);
			Callback(localStorage['FB3Reader1.0'] = this.EncodeData(Data));
		}

		public Find(Key, Callback?: (CacheMarkupList) => {}) {
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
		}
	}

	const DB_NAME = 'FB3ReaderDB';
	const STORE_NAME = 'FBReaderStore';

	interface IndexedDBEventTarget extends EventTarget {
		result: any;
	}

	export class IndexedDBDriver implements IStorageDriver {
		private db: IDBDatabase = null;
		private Consumer: IFB3PPCache;
		private openRequest: IDBOpenDBRequest = null;
		private store: IDBObjectStore = null;

		public readonly IsLocal: boolean = false;
		public IsReady: boolean = false;

		constructor(Consumer: IFB3PPCache) {
			this.Consumer = Consumer;
			this.InitDatabase();
		}

		private InitDatabase() {
			this.IsReady = false;
			this.openRequest = window.indexedDB.open(DB_NAME, 1);
			this.openRequest.onsuccess = this.OnSuccess.bind(this);
			this.openRequest.onupgradeneeded = this.OnUpgradeEnded.bind(this);
		}

		private OnSuccess(e) {
			this.db = (<IndexedDBEventTarget> event.target).result;
			this.IsReady = true;
		}

		private OnUpgradeEnded(e) {
			this.db = e.target.result;
			this.store = this.CreateObjectStore();
		}

		private UseDatabase(Callback: Function = () => {}) {
			if (!this.IsReady) {
				this.openRequest.onsuccess = (e) => {
					this.OnSuccess(e);
					Callback();
				};
				return;
			}

			Callback();
		}

		private CreateObjectStore() {
			if (!this.db.objectStoreNames.contains(STORE_NAME)) {
				return this.db.createObjectStore(STORE_NAME, {keyPath: 'Key'});
			}

			return null;
		}

		private GetObjectStore() {
			var transaction = this.db.transaction(STORE_NAME, 'readwrite');
			return transaction.objectStore(STORE_NAME);
		}

		private OnError(e) {
			console.warn(e);
		}

		public SaveData(Key: String, CachedMarkupList: IPageRenderInstructionsCacheEntry, Data?: IPageRenderInstructionsCacheEntry[], Callback = () => {}): void {
			this.UseDatabase((e) => {
				var store = this.GetObjectStore();

				this.db.onerror = this.OnError.bind(this);

				var request = store.put(CachedMarkupList);

				request.onsuccess = (e) => {
					Callback();
				}
			});
		}

		public Find(Key: string, Callback: Function = () => {}) {
			this.UseDatabase((e) => {
				var store = this.GetObjectStore(),
					request = store.get(Key);

				request.onsuccess = (e) => {
					Callback(request.result);
				}
			})
		}

		public LoadData(Callback = (data) => {}) {
			this.UseDatabase((e) => {
				var store = this.GetObjectStore();

				this.db.onerror = this.OnError.bind(this);

				var data = [];
				store.openCursor().onsuccess = (e) => {
					var cursor = (<IndexedDBEventTarget> e.target).result;

					if (cursor) {
						data.push(cursor.value);
						cursor.continue();
					} else {
						Callback(data);
					}
				}
			});
			
			return '';
		}
	}

}