/// <reference path="../../../core/DataProvider/FB3AjaxDataProvider.ts" />
var URLparser;
(function (URLparser) {
    var URLparserClass = /** @class */ (function () {
        function URLparserClass(UILangData) {
            this.UILangData = UILangData;
            this.Gift = false;
            this.href = decodeURIComponent(window.location.href);
            this.CheckTrial();
            this.CheckSubscription();
            this.CheckTrackReading();
            this.CheckBiblio();
            this.CheckSelfBiblio();
            this.CheckRequestUser();
            this.CheckLibrarian();
            this.CheckHalf();
            this.GetUUID();
            this.GetArtID();
            this.GetBaseURL();
            this.GetSID();
            this.GetUser();
            this.GetFileID();
            this.CheckFreeBook();
            this.GetLfrom();
            this.GetPartId();
            this.GetIframe();
            this.GetModal();
            this.GetPreorderBuy();
            this.CheckTextTrialButton();
            this.GetUILang();
            this.GetFund();
            this.GetAuthReg();
            this.GetAuthSuccs();
            this.CheckCatalit2();
            this.CheckIndexedDB();
            this.CheckUpsalePopup();
            this.CheckGift();
            this.CheckRedirectUrl();
        }
        URLparserClass.prototype.ArtID2URL = function (Chunk) {
            var OutURL = this.BaseURL + 'json/';
            if (Chunk == null) {
                OutURL += 'toc.js';
            }
            else if (Chunk.match(/\./)) {
                OutURL += Chunk;
            }
            else {
                OutURL += FB3DataProvider.zeroPad(Chunk, 3) + '.js';
            }
            return OutURL;
        };
        // [95156] [Сайт] ЭКСПЕРИМЕНТ: просмотр фрагментов 10% без регистрации
        URLparserClass.prototype.insertParam = function (search, key, value) {
            key = encodeURI(key);
            value = encodeURI(value);
            var search = search || document.location.search, kvp = search.substr(1).split('&');
            var i = kvp.length;
            var x;
            while (i--) {
                x = kvp[i].split('=');
                if (x[0] == key) {
                    x[1] = value;
                    kvp[i] = x.join('=');
                    break;
                }
            }
            if (i < 0) {
                kvp[kvp.length] = [key, value].join('=');
            }
            return kvp.join('&');
        };
        URLparserClass.prototype.CheckURLVal = function (index) {
            if (this.href.match(index)) {
                return true;
            }
            return false;
        };
        URLparserClass.prototype.CheckTextTrialButton = function () {
            this.TextTrialButton = this.GetURLVal('texttrialbutton=([^&]+)');
        };
        URLparserClass.prototype.CheckBiblio = function () {
            this.Biblio = this.CheckURLVal('buser');
        };
        URLparserClass.prototype.CheckSelfBiblio = function () {
            this.SelfBiblio = this.CheckURLVal('self_user');
        };
        URLparserClass.prototype.CheckRequestUser = function () {
            this.RequestUser = this.CheckURLVal('request_user');
        };
        URLparserClass.prototype.CheckLibrarian = function () {
            this.Librarian = this.CheckURLVal('librarian');
        };
        URLparserClass.prototype.CheckTrial = function () {
            this.Trial = this.GetURLVal('trials=([0-1])');
        };
        URLparserClass.prototype.CheckSubscription = function () {
            this.IsSubscription = this.CheckURLVal('subscription');
        };
        URLparserClass.prototype.CheckTrackReading = function () {
            this.TrackReading = this.CheckURLVal('track_reading');
        };
        URLparserClass.prototype.GetURLVal = function (regexpStr) {
            var tmp = this.href.match(new RegExp('\\b' + regexpStr + '', 'i'));
            if (tmp == null || !tmp.length) {
                return '';
            }
            return tmp[1];
        };
        URLparserClass.prototype.GetUUID = function () {
            this.UUID = this.GetURLVal('uuid=([-0-9a-z]+)');
        };
        URLparserClass.prototype.GetArtID = function () {
            this.ArtID = this.GetURLVal('art=([0-9]+)');
        };
        URLparserClass.prototype.GetBaseURL = function () {
            this.BaseURL = this.GetURLVal('baseurl=([0-9\/a-z\:\._]+)');
        };
        URLparserClass.prototype.GetUser = function () {
            this.User = 0;
            var UserTmp = this.GetURLVal('user=([0-9]+)');
            if (UserTmp != '') {
                this.User = parseInt(UserTmp);
            }
        };
        URLparserClass.prototype.GetUILang = function () {
            var UILangTmp = this.GetURLVal('uilang=([a-z]+)');
            if ((this.UILangData) && (UILangTmp in this.UILangData)) {
                this.UILang = UILangTmp;
            }
            else {
                this.UILang = 'ru';
            }
        };
        URLparserClass.prototype.GetSID = function () {
            this.SID = this.GetURLVal('sid=([0-9a-zA-Z]+)');
            if (this.SID == '') {
                var Cookies = document.cookie.match(/(?:(?:^|.*;\s*)SID\s*\=\s*([^;]*).*$)|^.*$/);
                if (Cookies.length) {
                    this.SID = Cookies[1];
                }
            }
        };
        URLparserClass.prototype.GetFileID = function () {
            this.FileID = this.GetURLVal('file=([0-9]+)');
            if (this.FileID == '') {
                if (this.BaseURL == '') {
                    return undefined;
                }
                var urlData = this.BaseURL.split('/');
                this.FileID = urlData[urlData.length - 2].replace('.', '');
            }
            this.FileID = this.lpad(this.FileID, '0', 8);
        };
        URLparserClass.prototype.lpad = function (str, padString, length) {
            while (str.length < length)
                str = padString + str;
            return str;
        };
        URLparserClass.prototype.CheckFreeBook = function () {
            this.FreeBook = this.CheckURLVal('free');
        };
        URLparserClass.prototype.GetLfrom = function () {
            this.Lfrom = 0;
            var LfromTmp = this.GetURLVal('lfrom=([0-9]+)');
            if (LfromTmp != '') {
                this.Lfrom = parseInt(LfromTmp);
            }
            else {
                var Cookies = document.cookie.match(/(?:(?:^|.*;\s*)TMPLF\s*\=\s*([^;]*).*$)|^.*$/);
                this.Lfrom = parseInt(Cookies[1]);
            }
        };
        URLparserClass.prototype.GetPartId = function () {
            this.PartID = 0;
            var PartIDTmp = this.GetURLVal('scecpartid=([0-9]+)');
            if (PartIDTmp != '') {
                this.PartID = parseInt(PartIDTmp);
            }
        };
        URLparserClass.prototype.GetIframe = function () {
            this.Iframe = this.CheckURLVal('iframe');
        };
        URLparserClass.prototype.GetModal = function () {
            this.Modal = this.CheckURLVal('modal');
        };
        URLparserClass.prototype.GetPreorderBuy = function () {
            this.PreorderBuy = this.CheckURLVal('preorder_buy');
        };
        URLparserClass.prototype.CheckHalf = function () {
            this.Half = 0;
            var HalfTmp = this.GetURLVal('half=([0-9]+)');
            if (HalfTmp != '') {
                this.Half = parseInt(HalfTmp);
            }
        };
        URLparserClass.prototype.GetFund = function () {
            var Fund = this.GetURLVal('fund=([a-z]+)');
            if (Fund) {
                this.Fund = Fund;
            }
            else {
                this.Fund = "";
            }
        };
        URLparserClass.prototype.GetAuthReg = function () {
            this.AuthReg = 0;
            var AuthRegTmp = this.GetURLVal('or_auth_reg=([0-9]+)');
            if (AuthRegTmp != '') {
                this.AuthReg = parseInt(AuthRegTmp);
            }
        };
        URLparserClass.prototype.GetAuthSuccs = function () {
            this.AuthSuccs = 0;
            var AuthSuccsTmp = this.GetURLVal('or_auth_succs=([0-9]+)');
            if (AuthSuccsTmp != '') {
                this.AuthSuccs = parseInt(AuthSuccsTmp);
            }
        };
        URLparserClass.prototype.CheckCatalit2 = function () {
            this.Catalit2 = this.CheckURLVal('catalit2');
        };
        URLparserClass.prototype.CheckIndexedDB = function () {
            this.IndexedDB = this.CheckURLVal('indexeddb');
        };
        URLparserClass.prototype.CheckUpsalePopup = function () {
            this.UpsalePopup = this.CheckURLVal('upsale');
        };
        URLparserClass.prototype.CheckGift = function () {
            this.Gift = this.CheckURLVal('in_gifts');
        };
        URLparserClass.prototype.CheckRedirectUrl = function () {
            this.RedirectUrl = this.GetURLVal('return_url=([^&]+)');
        };
        return URLparserClass;
    }());
    URLparser.URLparserClass = URLparserClass;
})(URLparser || (URLparser = {}));
