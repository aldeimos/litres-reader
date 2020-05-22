/// <reference path="../../../core/Site/FB3ReaderSite.ts" />
/// <reference path="../../../core/Reader/FB3Reader.ts" />
/// <reference path="../../../core/DOM/FB3DOM.ts" />
/// <reference path="../../../core/DataProvider/FB3AjaxDataProvider.ts" />
/// <reference path="../../../core/Bookmarks/FB3Bookmarks.ts" />
/// <reference path="../../../core/PagesPositionsCache/PPCache.ts" />
/// <reference path="Settings.ts" />
/// <reference path="UrlParser.ts" />
/// <reference path="LocalBookmarks.ts" />
/// <reference path="BarClass.ts" />
/// <reference path="History.ts" />
/// <reference path="FullScreen.ts" />
/// <reference path="../SocialSharing.ts" />
/// <reference path="../BookmarksWindow.ts" />
/// <reference path="../HelpWindow.ts" />
/// <reference path="../FinishWindow.ts" />
/// <reference path="../ContentsWindow.ts" />
/// <reference path="../ContextMenu.ts" />
/// <reference path="../Selection.ts" />
/// <reference path="../Events.ts" />
/// <reference path="IFrame.ts" />
/// <reference path="../HTMLPopup.ts" />
/// <reference path="../../../../litres/modules/catalit-web/CatalitWeb/CatalitWeb.ts" />
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
//localStorage.clear();
//alert(navigator.userAgent);
//window.onerror = (e, url, line) => {
//	alert(e + ', ' + url + ', ' + line);
//};
var TopMenu;
(function (TopMenu) {
    var TopMenuClass = /** @class */ (function () {
        function TopMenuClass(Owner) {
            this.Owner = Owner;
            this.AddHandlers();
            this.CurrentButton = undefined;
            this.ActiveClass = 'active';
        }
        TopMenuClass.prototype.AddHandlers = function () {
            var _this = this;
            for (var j = 0; j < this.Owner.WindowsCarry.WindowsStack.length; j++) {
                var WinObj = this.Owner.WindowsCarry.WindowsStack[j];
                if (!WinObj.button.length) {
                    continue;
                }
                for (var i = 0; i < WinObj.button.length; i++) {
                    var _class = '.top-menu li span.' + WinObj.button[i];
                    document.querySelector(_class).parentNode
                        .addEventListener('click', function (e) { return _this.ButtonClick(e); }, false);
                }
            }
        };
        TopMenuClass.prototype.ButtonClick = function (e) {
            this.Owner.RemoveSelection(); // if we have any temporary notes, this will delete them
            var e = this.Owner.GetEvent(e);
            var ClickedButton = (e.target || e.srcElement);
            ClickedButton = this.Owner.GetElement(ClickedButton, 'li');
            if (hasClass(ClickedButton, this.ActiveClass)) {
                this.Owner.WindowsCarry.HideAllWindows(); // we clicked already opened window, just hide them all
                return;
            }
            if ((this.CurrentButton && hasClass(this.CurrentButton, this.ActiveClass)) ||
                this.Owner.ZoomObj.ShowState) {
                this.Owner.WindowsCarry.HideAllWindows(); // we have opened window or zoomIn, close all
            }
            this.CurrentButton = ClickedButton;
            addClass(this.CurrentButton, this.ActiveClass);
            this.Owner.WindowsCarry.GetWindow(this.GetIconClass(this.CurrentButton)).obj.ButtonHandler(e);
        };
        TopMenuClass.prototype.RemoveActive = function () {
            if (this.CurrentButton) {
                removeClass(this.CurrentButton, this.ActiveClass);
                this.CurrentButton = undefined;
            }
        };
        TopMenuClass.prototype.GetIconClass = function (Obj) {
            return Obj.querySelector('span').className;
        };
        return TopMenuClass;
    }());
    TopMenu.TopMenuClass = TopMenuClass;
})(TopMenu || (TopMenu = {}));
var ABTesting;
(function (ABTesting) {
    function queryParams(params) {
        if (params === void 0) { params = {}; }
        return Object.keys(params)
            .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
            .join('&');
    }
    function withQuery(url, params) {
        if (params === void 0) { params = {}; }
        var queryString = queryParams(params);
        return queryString ? url + (url.indexOf('?') === -1 ? '?' : '&') + queryString : url;
    }
    function enterTest(requestParams, successCallback) {
        if (requestParams === void 0) { requestParams = {}; }
        var XMLHttp = new XMLHttpRequest();
        XMLHttp.open('GET', withQuery('/pages/get_ab_status_json/', requestParams), true);
        XMLHttp.send(null);
        XMLHttp.onload = function (evt) {
            var dataJSON;
            var testResult;
            try {
                dataJSON = JSON.parse(XMLHttp.responseText);
                var abTests = dataJSON.user[0].ab_tests;
                testResult = abTests["test" + requestParams.test];
            }
            catch (e) {
                testResult = undefined;
            }
            successCallback(testResult);
        };
    }
    ABTesting.enterTest = enterTest;
})(ABTesting || (ABTesting = {}));
// [96368] объект содержит в себе переводы для читалки
var FullUILangData = {
    "ru": {
        "lang": "ru",
        "page": "Страница ",
        "of": " из ",
        "fragment": "фрагмент",
        "table-of-contents": "Оглавление",
        "cancel": "Отмена",
        "share": "Поделиться",
        "your-comment": "Ваш комментарий",
        "save": "Сохранить",
        "delete": "Удалить",
        "added-to-bookmarks": "Добавлено в закладки",
        "removed-from-bookmarks": "Удалено из закладок",
        "quote-copied": "Цитата скопирована",
        "brightness": "Яркость",
        "font": "Шрифт",
        "size": "Размер",
        "margins": "Поля",
        "narrow": "широкие",
        "wide": "узкие",
        "line-spacing": "Высота<br />строк",
        "big": "большая",
        "small": "маленькая",
        "full-justification": "Выравнивание по ширине",
        "hyphenation": "Переносы",
        "click-to-turn-pages": "Листание кликом",
        "separate-into-2-columns": "Показывать текст в 2 колонки",
        "allot-paragraphs": "Выделять абзацы целиком",
        "sync-reader-position-with-request": "Синхронизировать позицию чтения с запросом",
        "custom-color-scheme": "Использовать свою цветовую схему",
        "color": "Цвет",
        "background": "Фон",
        "advanced-settings": "Расширенные настройки",
        "fragment-is-finished": "Бесплатный фрагмент закончился. Хотите читать дальше?",
        "buy-and-read-book": "Купить и читать книгу",
        "share-quote-on": "Поделиться цитатой для",
        "add-bookmark": "Поставить закладку",
        "remove-bookmark": "Удалить закладку",
        "save-selection": "Сохранить выделение",
        "remove-selection": "Удалить выделение",
        "copy": "Копировать",
        "edit": "Редактировать",
        "comment": "Комментировать",
        "book-is-loading-from-server": "(Загрузка книги с сервера)",
        "take-a-book": "Взять себе",
        "requset-from-a-librarian": "Запросить у библиотекаря",
        "cancel-request": "Отменить запрос",
        "take-in-the-library": "Взять в библиотеке",
        "give-the-book-to-the-reader": "Выдать книгу читателю",
        "no-bookmarks": "Нет заметок/закладок",
        "preordered-fragment-finished": "Вы прочитали фрагмент. Полная версия книги будет доступна после начала продаж",
        "more-about-book": "Подробнее о книге"
    },
    "en": {
        "lang": "en",
        "page": "Page: ",
        "of": " of ",
        "fragment": "fragment",
        "table-of-contents": "Table of contents",
        "cancel": "Cancel",
        "share": "Share",
        "your-comment": "Your comment",
        "save": "Save",
        "delete": "Delete",
        "added-to-bookmarks": "Bookmark added",
        "removed-from-bookmarks": "Bookmark removed",
        "quote-copied": "Quote copied",
        "brightness": "Brightness",
        "font": "Font",
        "size": "Size",
        "margins": "Margins",
        "narrow": "narrow",
        "wide": "wide",
        "line-spacing": "Line<br />spacing",
        "big": "big",
        "small": "small",
        "full-justification": "Full justification",
        "hyphenation": "Hyphenation",
        "click-to-turn-pages": "Click to turn pages",
        "separate-into-2-columns": "Separate into 2 columns",
        "allot-paragraphs": "Allot paragraphs",
        "sync-reader-position-with-request": "Sync reader position with request",
        "custom-color-scheme": "Custom color scheme",
        "color": "Color",
        "background": "Background",
        "advanced-settings": "Advanced settings",
        "fragment-is-finished": "This is the end of free fragment. Do you want to continue reading this?",
        "buy-and-read-book": "Buy and read this book",
        "share-quote-on": "Share quote on",
        "add-bookmark": "Add bookmark",
        "remove-bookmark": "Remove bookmark",
        "save-selection": "Save selection",
        "remove-selection": "Remove selection",
        "copy": "Copy",
        "edit": "Edit",
        "comment": "Comment",
        "book-is-loading-from-server": "(Book is loading from the server)",
        "take-a-book": "Take a book",
        "requset-from-a-librarian": "Request from a librarian",
        "cancel-request": "Cancel request",
        "take-in-the-library": "Take in the library",
        "give-the-book-to-the-reader": "Give the book to the reader",
        "no-bookmarks": "No notes/bookmarks",
        "preordered-fragment-finished": "You have read the fragment. The full version of the book will be available after the start of sales.",
        "more-about-book": "More about the book"
    },
    "pl": {
        "lang": "pl",
        "page": "Str: ",
        "of": " z ",
        "fragment": "Fragment",
        "table-of-contents": "Spis treści",
        "cancel": "Anuluj",
        "share": "Udostępnij",
        "your-comment": "Komentarz",
        "save": "Zapisz",
        "delete": "Usunąć",
        "added-to-bookmarks": "Dodano do zakładek",
        "removed-from-bookmarks": "Usunięte z zakładek",
        "quote-copied": "Cytat został skopiowany",
        "brightness": "Jasność",
        "font": "Czcionka",
        "size": "Rozmiar",
        "margins": "Marginesy",
        "narrow": "Wąskie",
        "wide": "Szerokie",
        "line-spacing": "Interlinia",
        "big": "Duzly",
        "small": "Maly",
        "full-justification": "Justowanie",
        "hyphenation": "Dzielenia wyrazów",
        "click-to-turn-pages": "Przewijanie stron kliknięciem",
        "separate-into-2-columns": "Dzielone na dwie kolumny",
        "allot-paragraphs": "Przywołać paragrafy",
        "sync-reader-position-with-request": "Synchronizuj pozycję czytnika z prośbą",
        "custom-color-scheme": "Niestandardowy schemat kolorów",
        "color": "Kolor",
        "background": "Tło",
        "advanced-settings": "Zaawansowane ustawiencia",
        "fragment-is-finished": "Jest to koniec wolnego fragmentu. Czy chcesz kontynuować czytanie?",
        "buy-and-read-book": "Kup i przeczytaj tę książkę",
        "share-quote-on": "Podziel się wycenią na",
        "add-bookmark": "Dodaj zakładkę",
        "remove-bookmark": "Usuń zakładkę",
        "save-selection": "Zapisz wybór",
        "remove-selection": "Usunięte z zakładek",
        "copy": "Kopiuj",
        "edit": "Edytować",
        "comment": "Komentarz",
        "book-is-loading-from-server": "(Książka ładuje się z serwera)",
        "take-a-book": "Weź książkę",
        "requset-from-a-librarian": "Wniosek bibliotekarza",
        "cancel-request": "Anulować żądanie",
        "take-in-the-library": "Weź w bibliotece",
        "give-the-book-to-the-reader": "Podaj książkę czytelnikowi",
        "no-bookmarks": "Brak notatek/zakładek",
        "preordered-fragment-finished": "Přečetl jste fragment. Plná verze knihy bude k dispozici po zahájení prodeje.",
        "more-about-book": "Więcej o książce"
    },
    "et": {
        "lang": "et",
        "page": "lk ",
        "of": ", ",
        "fragment": "Fragment",
        "table-of-contents": "Sisukord",
        "cancel": "Tühista",
        "share": "Jagada",
        "your-comment": "Sinu kommentaar",
        "save": "Salvesta",
        "delete": "Kustutada",
        "added-to-bookmarks": "Järjehoidja lisatud",
        "removed-from-bookmarks": "Järjehoidja eemaldatud",
        "quote-copied": "Tsitaat kopeeriti",
        "brightness": "Heledus",
        "font": "Kirjatüüp",
        "size": "Kirja suurus",
        "margins": "Veerised",
        "narrow": "Väike",
        "wide": "Suur",
        "line-spacing": "Reavahe",
        "big": "Suur",
        "small": "Väike",
        "full-justification": "Äärest-ääreni",
        "hyphenation": "Sidekriips",
        "click-to-turn-pages": "Pöörake lehti hiireklõpsuga",
        "separate-into-2-columns": "Jagada kahte tupla",
        "allot-paragraphs": "Lõigake punkte",
        "sync-reader-position-with-request": "Soovi korral sünkroonige lugeja positsiooni",
        "custom-color-scheme": "Kohandatud värviskeem",
        "color": "Fondi värv",
        "background": "Taustavärv",
        "advanced-settings": "Täpsemad seaded",
        "fragment-is-finished": "See on vaba fragmenti lõpp. Tahad jätka lugemist?",
        "buy-and-read-book": "Osta ja lugege seda raamatut",
        "share-quote-on": "Jaga pakkumist",
        "add-bookmark": "Lisa järjehoidja",
        "remove-bookmark": "Kustuta järjehoidja",
        "save-selection": "Salvesta valik",
        "remove-selection": "Kustuta järjehoidja",
        "copy": "Kopeeri",
        "edit": "Redigeeri",
        "comment": "Kommentaar",
        "book-is-loading-from-server": "(Raamat laaditakse serverist üles)",
        "take-a-book": "Võtke raamat",
        "requset-from-a-librarian": "Raamatukoguhoidja taotlus",
        "cancel-request": "Tühista soov",
        "take-in-the-library": "Võtke raamatukogus",
        "give-the-book-to-the-reader": "Anna raamatule lugeja",
        "no-bookmarks": "Märkmeid/järjehoidjaid pole",
        "preordered-fragment-finished": "Olete fragment läbi lugenud. Raamatu täielik versioon on saadaval pärast müügi alustamist.",
        "more-about-book": "Rohkem raamatust"
    }
};
var pda = {
    state: false,
    platform: '',
    form: 'phone',
    version: '0',
    browser: '',
    orientation: 0,
    portrait: true,
    top_hidden: false,
    pixelRatio: 1,
    currentHeight: 0
};
var win = window, doc = document, readerBox = doc.querySelector('#reader'), wrapperBox = doc.querySelector('#wrapper-reader'), footerBox = doc.querySelector('#footer'), footerBoxProgressBar = doc.querySelector('#footer-progressbar'), footerTopPda = 0, dotMouseClick = false;
var AppVersion = '1.7.5';
document.getElementById('empty-pixel').ondragstart = function () { return false; };
document.getElementById('empty-pixel').draggable = false;
var aldebaran_or4 = false; // stupid ugly workaround
// Reader without LitRes logo
var nn_or4 = false;
if (window.location.href.match(/aldebaran|or_alt/i)) {
    aldebaran_or4 = true;
}
if (window.location.href.match(/ornn/)) {
    nn_or4 = true;
}
var AFB3Reader;
var AFB3PPCache;
var BookmarksProcessor;
var start = 0;
var LitresURLParser = new URLparser.URLparserClass(FullUILangData);
var LitresLocalBookmarks = new LocalBookmarks.LocalBookmarksClass(LitresURLParser.ArtID);
var LitresHistory; // need proper interface
var LitresFullScreen;
var EventsSupport = new EventsModule.EventActions(readerBox, footerBox, wrapperBox);
var MouseObj;
var TopMenuObj;
var ContextObj;
var LitresBookmarksWindow;
var LitresHelpWindow;
var LitresFinishWindow;
var LitresContentsWindow;
var LitresSettingsWindow; // dummy class, need refactoring
var FacebookSharing;
var TwitterSharing;
var VkontakteSharing;
var progressBar;
var fontsizeBar;
var themeBar;
var readerMarginBar;
var lineHeightBar;
var UILangData;
var ResizeSupport = new EventsModule.ResizeClass(EventsSupport);
function extend(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}
var AuthorizeIFrame = new IFrame.AuthorizeIFrame('/pages/iframe-authorize/?v=1.0.0&art=' + LitresURLParser.ArtID, 'authorize');
AuthorizeIFrame.UserID = 0;
AuthorizeIFrame.OnShowCallbackCustom = function (El) {
    try {
        typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_auth_show');
        var contentWindow = El.contentWindow;
        var iframeConfig = extend(contentWindow.config || {}, {
            bookURL: LitresReaderSite.PatchLitresLink(window.location.origin + '/pages/biblio_book/?art=' + LitresURLParser.ArtID, true),
            textTrialButton: LitresURLParser.TextTrialButton
        });
        if (iframeConfig.userID <= 0) {
            // если метод init ещё не объявлен, значит скрипт фрейма не подгрузился
            // тогда подписываемся на событие подгрузки скрипта (это необходимо, так как скрипт подгружается асинхронно через require)
            if (El.contentWindow.init) {
                El.contentWindow.init(iframeConfig);
            }
            else {
                contentWindow.addEventListener('iframe-authorize-script-loaded', function () {
                    El.contentWindow.init(iframeConfig);
                });
            }
            return;
        }
        AuthorizeIFrame.UserID = contentWindow.litres.user;
        AuthorizeIFrame.Hide();
        var search = LitresURLParser.insertParam(window.location.search, 'user', AuthorizeIFrame.UserID);
        var match = search.match(/or_auth_reg=([0-9]+)/);
        if (match === null || !parseInt(match[1])) {
            search = LitresURLParser.insertParam('?' + search, 'or_auth_succs', 1);
        }
        window.location.search = '?' + search;
    }
    catch (e) {
        console.log(e.message);
        AuthorizeIFrame.Hide();
    }
};
/* [138576] Верстка страницы апсейла после прочтения книги в читалке */
var UpsaleIFrame = new IFrame.IFrame('/pages/upsale_in_or/?art=' + LitresURLParser.ArtID, 'upsale');
UpsaleIFrame.UserID = LitresURLParser.User;
UpsaleIFrame.OnShowCallbackCustom = function (El) {
    var contentWindow = El.contentWindow;
    var upsaleDocument = contentWindow.document;
    var artId = contentWindow.config.artID;
    UpsaleIFrame.SetPosition('bottom-hidden');
    // нет подходящей книги - не показываем фрейм вообще, но показываем попап с рейтингом
    if (upsaleDocument.body.classList.contains('no_upsale')) {
        UpsaleIFrame.Hide();
        RatingIFrame.Show();
    }
    else {
        UpsaleIFrame.SetPosition('center');
        El.style.transition = 'all 700ms';
    }
    // кнопка "Купить"
    var buyButton = upsaleDocument.getElementById('buy_button');
    if (buyButton) {
        buyButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // при нажатии на кнопку "Купить" открываем карточку с попапом прямо в окне читалки
            window.open(LitresReaderSite.PatchLitresLink('/pages/biblio_book/?art=' + artId, true), '_self');
        });
    }
    // ссылка на серии
    var seriesLink = upsaleDocument.getElementById('series_link');
    if (seriesLink) {
        seriesLink.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var link = this.getAttribute('href');
            window.open(LitresReaderSite.PatchLitresLink(link), '_blank');
        });
    }
    // кнопка закрытия
    var closeButton = upsaleDocument.querySelector('.close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            closeUpsaleIFrameAnimated();
        });
    }
    function closeUpsaleIFrameAnimated() {
        var onTransitionEnd = function () {
            UpsaleIFrame.Hide();
            RatingIFrame.Show();
            El.removeEventListener('transitionend', onTransitionEnd);
        };
        El.addEventListener('transitionend', onTransitionEnd);
        UpsaleIFrame.SetPosition('bottom-hidden');
    }
    // переопределеяем функцию перехода в читалку
    contentWindow.switchActionTrackerTo = function (artID, action, time, user, refURL) {
        if (action === 'read_fragment' && (typeof refURL === 'string') && !!refURL) {
            window.parent.open(refURL, '_self');
        }
    };
};
/* [138656] Верстка страницы с формой отзыва после прочтения книги в читалке */
var RatingIFrame = new IFrame.IFrame('/pages/comment_in_or/?art=' + LitresURLParser.ArtID, 'rating');
RatingIFrame.IsFullWidth = true;
RatingIFrame.isOverlayEnabled = false;
RatingIFrame.OnShowCallbackCustom = function (El) {
    var contentWindow = El.contentWindow;
    var contentBody = contentWindow.document.body;
    var actionsElement = contentBody.querySelector(".actions");
    var completedElement = contentBody.querySelector(".completed");
    var reviewTextArea = contentBody.querySelector('.review-textarea textarea');
    El.style.height = contentBody.offsetHeight + "px";
    RatingIFrame.SetPosition('bottom-hidden');
    RatingIFrame.SetPosition('bottom');
    El.style.transition = 'margin 700ms';
    contentBody.addEventListener('user-voted', function (e) {
        if (pda.state) {
            El.style.height = '100%';
        }
        else {
            El.style.height = contentBody.offsetHeight + 'px';
        }
        RatingIFrame.SetPosition('bottom');
    }, false);
    contentBody.addEventListener('user-closed', function (e) {
        closeRatingIFrameAnimated();
    }, false);
    contentBody.addEventListener('user-reviewed', function (e) {
        actionsElement.classList.add('hidden');
        reviewTextArea.setAttribute('disabled', "");
        completedElement.classList.remove('hidden');
    }, false);
    // при клике вне фрейма скрываем его
    var onWindowClickHandler = function (event) {
        if (!El.contains(event.target)) {
            window.removeEventListener('click', onWindowClickHandler);
            closeRatingIFrameAnimated();
        }
    };
    window.addEventListener('click', onWindowClickHandler);
    function closeRatingIFrameAnimated() {
        var onTransitionEnd = function () {
            RatingIFrame.Hide();
            El.removeEventListener('transitionend', onTransitionEnd);
        };
        El.addEventListener('transitionend', onTransitionEnd);
        RatingIFrame.SetPosition('bottom-hidden');
    }
};
/**
 * Переводит страницу на требуемый язык
 * @param rootEl Корневой элемент
 * @param langData Данные для перевода
 * @param selectorAttr Селектор атрибута. По-умолчанию равен 'data-i18n'
 */
function translateHTML(rootEl, langData, selectorAttr) {
    if (selectorAttr === void 0) { selectorAttr = 'data-i18n'; }
    try {
        if (!(rootEl instanceof Element) || typeof langData !== 'object') {
            return;
        }
        doc.title = langData["book-is-loading-from-server"];
        var childEls = rootEl.querySelectorAll("[" + selectorAttr + "]");
        for (var i = 0; i < childEls.length; i++) {
            translateHTMLElement(childEls[i]);
        }
        var imagesPath = "images/uilang/" + langData["lang"] + "/";
        doc.querySelector('.logo_normal').setAttribute("src", imagesPath + "logo-normal.svg");
        doc.querySelector('.logo_night').setAttribute("src", imagesPath + "logo-night.svg");
        doc.querySelector('.tip-img').style.background = "url('" + imagesPath + "help-window.png') center center no-repeat";
    }
    catch (e) {
        console.warn('Error translating html file:', e.message);
    }
    function translateHTMLElement(el) {
        var translation = langData[el.getAttribute(selectorAttr)];
        if (translation === undefined) {
            return;
        }
        el.innerHTML = translation;
    }
}
function addClass(obj, _class) {
    var list = [];
    if (obj.getAttribute('class')) {
        list = obj.getAttribute('class').split(' ');
    }
    if (!list || list.length == 0) {
        return obj.setAttribute('class', _class);
    }
    for (var j = 0; j < list.length; j++) {
        if (list[j] == _class) {
            return;
        }
    }
    list.push(_class);
    obj.setAttribute('class', list.join(' '));
}
function removeClass(obj, _class) {
    var list = [];
    if (obj.getAttribute('class')) {
        list = obj.getAttribute('class').split(' ');
    }
    if (!list || list.length == 0) {
        return;
    }
    for (var j = 0; j < list.length; j++) {
        if (list[j] == _class) {
            list.splice(j, 1);
            break;
        }
    }
    obj.setAttribute('class', list.join(' '));
}
function hasClass(obj, _class, regular) {
    var list = [];
    if (obj.getAttribute('class')) {
        list = obj.getAttribute('class').split(' ');
    }
    if (!list || list.length == 0) {
        return false;
    }
    if (regular) {
        for (var j = 0; j < list.length; j++) {
            if (list[j].indexOf(_class) > -1) {
                return true;
            }
        }
    }
    else {
        for (var j = 0; j < list.length; j++) {
            if (list[j] == _class) {
                return true;
            }
        }
    }
    return false;
}
function finishFunction() {
    if (LitresURLParser.Trial) {
        typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_buy_dialog');
        LitresFinishWindow && LitresFinishWindow.ShowWindow();
    }
    else if (LitresURLParser.UpsalePopup && !LitresURLParser.Biblio && LitresURLParser.User) {
        if (pda.state) {
            AFB3Reader.Site.UpsaleIFrame.IsFullWidth = true;
            AFB3Reader.Site.UpsaleIFrame.IsFullHeight = true;
        }
        else {
            AFB3Reader.Site.UpsaleIFrame.Width = 940;
            AFB3Reader.Site.UpsaleIFrame.Height = 700;
        }
        AFB3Reader.Site.UpsaleIFrame.Show();
    }
}
function preloadIFrames() {
    if (!LitresURLParser.Trial && LitresURLParser.UpsalePopup && !LitresURLParser.Biblio && LitresURLParser.User) {
        AFB3Reader.Site.UpsaleIFrame.Load();
        AFB3Reader.Site.RatingIFrame.Load();
    }
}
function textTrialButton() {
    if (!LitresURLParser.Trial) {
        return '';
    }
    var buttonText = (UILangData && UILangData["buy-and-read-book"]) || "Купить и читать книгу";
    var trialBlockClass = '';
    if (LitresURLParser.FreeBook) {
        buttonText = (UILangData && UILangData["take-a-book"]) || "Взять себе";
    }
    else if (LitresURLParser.Biblio) {
        buttonText = (UILangData && UILangData["requset-from-a-librarian"]) || "Запросить у библиотекаря";
    }
    else if (LitresURLParser.RequestUser) {
        buttonText = (UILangData && UILangData["cancel-request"]) || "Отменить запрос";
    }
    else if (LitresURLParser.SelfBiblio) {
        buttonText = (UILangData && UILangData["take-in-the-library"]) || "Взять в библиотеке";
    }
    else if (LitresURLParser.Librarian) {
        buttonText = (UILangData && UILangData["give-the-book-to-the-reader"]) || "Выдать книгу читателю";
    }
    if (LitresURLParser.TextTrialButton) {
        buttonText = LitresURLParser.TextTrialButton;
    }
    if (LitresURLParser.PreorderBuy) {
        buttonText = (UILangData && UILangData["more-about-book"]) || "Подробнее о книге";
    }
    return buttonText;
}
function addTrialHandlers(el) {
    if (el) {
        var host = aldebaran_or4 ? '//www.litres.ru' : window.location.origin;
        var trial_url;
        if (LitresURLParser.RedirectUrl) {
            trial_url = host + LitresURLParser.RedirectUrl;
        }
        else {
            trial_url = host + '/pages/biblio_book/?art=' + LitresURLParser.ArtID;
        }
        el.setAttribute('href', LitresReaderSite.PatchLitresLink(trial_url, true));
    }
}
//метод для поиска элемента по координатам, если указана глубина, то возвращает количество элементов указанное в этом параметре, если нет, то возвращает все
function getListElementFromPoint(x, y, depth) {
    var ele = document.elementFromPoint(x, y);
    if (ele.id.indexOf("wrapper") > -1 || ele.nodeName.toLowerCase() == "area" || ele.id.indexOf("empty") > -1) {
        if (document.all && !window.atob) {
            var filter = Array.prototype.filter, result = AFB3Reader.Site.Canvas.querySelectorAll('span, div, a, p, img'), elements = [];
            if (!depth || depth > 1) {
                elements = filter.call(result, function (node) {
                    var pos = node.getBoundingClientRect();
                    if (x > pos.left && x < pos.right && y > pos.top && y < pos.bottom) {
                        return node;
                    }
                    return null;
                });
            }
            else {
                var sieve = Array.prototype.some;
                sieve.call(AFB3Reader.Site.Canvas.querySelectorAll('span, img'), function (node) {
                    var pos = node.getBoundingClientRect();
                    if (x > pos.left && x < pos.right && y > pos.top && y < pos.bottom) {
                        elements.push(node);
                        return true;
                    }
                    return false;
                });
            }
            elements.reverse();
            return elements;
        }
        var elements = [], previousPointerEvents = [], current, i, d;
        // get all elements via elementFromPoint, and remove them from hit-testing in order
        while ((current = document.elementFromPoint(x, y)) && elements.indexOf(current) === -1 && current != null) {
            // push the element and its current style
            elements.push(current);
            previousPointerEvents.push({
                value: current.style.getPropertyValue('pointer-events'),
                priority: current.style.getPropertyPriority('pointer-events')
            });
            // add "pointer-events: none", to get to the underlying element
            current.style.setProperty('pointer-events', 'none', 'important');
            if (depth && depth > 0 && elements.length > (depth + 1)) {
                break;
            }
        }
        // restore the previous pointer-events values
        for (i = previousPointerEvents.length; d = previousPointerEvents[--i];) {
            elements[i].style.setProperty('pointer-events', d.value ? d.value : '', d.priority);
        }
        // return our results
        if (elements.length == 0) {
            return null;
        }
        elements.shift();
        elements.shift();
        return elements;
    }
}
function changeCSS(theClass, element, value, add) {
    //Last Updated on July 4, 2011
    //documentation for this script at
    //http://www.shawnolson.net/a/503/altering-css-class-attributes-with-javascript.html
    var cssRules;
    var doc = document;
    var add = add || '';
    for (var s = 0; s < doc.styleSheets.length; s++) {
        try {
            doc.styleSheets[s].insertRule(theClass + ' { ' + element + ': ' + value + '' + add + '; }', doc.styleSheets[s][cssRules].length);
        }
        catch (err) {
            try {
                doc.styleSheets[s].addRule(theClass, element + ': ' + value + '' + add + ';');
            }
            catch (err) {
                try {
                    if (doc.styleSheets[s]['rules']) {
                        cssRules = 'rules';
                    }
                    else if (doc.styleSheets[s]['cssRules']) {
                        cssRules = 'cssRules';
                    }
                    else {
                        //no rules found... browser unknown
                    }
                    for (var r = 0; r < doc.styleSheets[s][cssRules].length; r++) {
                        if (doc.styleSheets[s][cssRules][r].selectorText == theClass) {
                            if (doc.styleSheets[s][cssRules][r].style[element]) {
                                doc.styleSheets[s][cssRules][r].style[element] = value + '' + add;
                                break;
                            }
                        }
                    }
                }
                catch (err) { }
            }
        }
    }
}
var relativeToViewport;
function isRelativeToViewport() {
    // https://github.com/moll/js-element-from-point/blob/master/index.js
    if (relativeToViewport != null) {
        return relativeToViewport;
    }
    var x = window.pageXOffset ? window.pageXOffset + window.innerWidth - 1 : 0;
    var y = window.pageYOffset ? window.pageYOffset + window.innerHeight - 1 : 0;
    if (!x && !y) {
        return true;
    }
    // Test with a point larger than the viewport. If it returns an element,
    // then that means elementFromPoint takes page coordinates.
    return relativeToViewport = !document.elementFromPoint(x, y);
}
/* left top flag */
var NativeNote;
var addBookmarkTouch = false; // webkit hack
var addBookmark = doc.querySelector('#add-bookmark');
addBookmark.addEventListener('touchstart', function () {
    // webkit browsers fire touch events at first
    addBookmarkTouch = true;
}, false);
addBookmark.addEventListener('click', BookmarkIconAction, false);
addBookmark.addEventListener('mouseenter', ToggleBookmarkIcon, false);
addBookmark.addEventListener('mouseleave', ToggleBookmarkIcon, false);
if (!aldebaran_or4) {
    var menuMobileOpen = doc.querySelector('.icon-menu');
    menuMobileOpen.addEventListener('click', function (e) {
        if (LitresFullScreen.fullScreen) {
            LitresFullScreen.showHiddenElements();
        }
    }, false);
}
function ToggleBookmarkIcon(event) {
    if (MouseObj.Owner.CheckFirefoxTouchEvent(event) || MouseObj.Owner.CheckIETouchEvent(event) || addBookmarkTouch) {
        return;
    }
    var target = (event.target || event.srcElement);
    if (hasClass(target, 'hover')) {
        removeClass(target, 'hover');
    }
    else {
        addClass(target, 'hover');
    }
}
function BookmarkIconAction() {
    InitBookmark(this);
}
function InitBookmark(target) {
    if (!EventsSupport.CheckDoubleClick()) {
        EventsSupport.SetPreventDoubleCheck();
        if (target && hasClass(target, 'clicked')) {
            var BookmarksToDelete = LitresReaderSite.GetBookmarksOnPage();
            for (var j = 0; j < BookmarksToDelete.length; j++) {
                for (var i = 0; i < BookmarksProcessor.Bookmarks.length; i++) {
                    if (BookmarksToDelete[j].ID == BookmarksProcessor.Bookmarks[i].ID) {
                        BookmarksProcessor.Bookmarks[i].Detach();
                        break;
                    }
                }
            }
            removeClass(addBookmark, 'clicked');
            ShowBookmarkTooltip('deleted');
        }
        else {
            if (NativeNote) {
                NativeNote.Detach();
            }
            if (!NativeNote) {
                NativeNote = new FB3Bookmarks.Bookmark(BookmarksProcessor);
            }
            var ObjectPos;
            // need fix for
            // LitresLocalBookmarks.GetCurrentPosition()
            // [71, 126]
            if (target) {
                var NoteRange = AFB3Reader.GetVisibleRange();
                if (!NoteRange) {
                    NoteRange = BookmarksProcessor.Bookmarks[0].Range;
                }
                else if (NoteRange.From.length > 1 && NoteRange.From[0] != NoteRange.To[0]) {
                    var NextEl = AFB3Reader.FB3DOM.GetElementByAddr([1 + NoteRange.From[0]]);
                    if (NextEl && NextEl.TagName != 'title') {
                        NoteRange.From = [1 + NoteRange.From[0]];
                    }
                    NoteRange.To = NoteRange.From;
                }
                ObjectPos = AFB3Reader.FB3DOM.GetElementByAddr(NoteRange.From).Position();
            }
            else {
                ObjectPos = AFB3Reader.ElementAtXY(ContextObj.Position.X, ContextObj.Position.Y);
            }
            if (!ObjectPos || ObjectPos.length < 1) {
                NativeNote = undefined;
                return undefined;
            }
            NativeNote.Range.From = ObjectPos.slice(0);
            NativeNote.Range.To = ObjectPos;
            NativeNote = NativeNote.RoundClone(true);
            if (target) {
                NativeNote = NoteCheckTag(NativeNote);
            }
            NativeNote.Group = 1;
            NativeNote.Title = EventsSupport.GetTitleFromTOC(NativeNote.Range).substr(0, 100);
            if (!NativeNote.Title) {
                NativeNote.Title = 'Закладка';
            }
            BookmarksProcessor.AddBookmark(NativeNote);
            NativeNote = undefined;
            addClass(addBookmark, 'clicked');
            ShowBookmarkTooltip('created');
        }
        AFB3Reader.Redraw();
        AFB3Reader.Site.StoreBookmarksHandler(200);
    }
    if (target) {
        target.blur();
    }
}
function NoteCheckTag(Note) {
    var pos = Note.Range.From[0];
    while (Note.Owner.FB3DOM.Childs[pos].TagName == 'empty-line') {
        pos++;
        if (Note.Owner.FB3DOM.Childs[pos]) {
            Note.Range.From = pos.slice(0);
            Note.Range.To = pos;
        }
        else {
            break;
        }
    }
    return Note;
}
var HideBookmarkTooltipTimer = 0;
function ShowBookmarkTooltip(type) {
    ClearBookmarkTooltip();
    var Obj = document.querySelector('#bookmarkStatus');
    addClass(Obj, 'bookmark-' + type);
    EventsSupport.ZoomObj.ZoomAnything(Obj, Obj.offsetWidth, Obj.offsetHeight);
    HideBookmarkTooltip(type);
}
function ClearBookmarkTooltip() {
    clearTimeout(HideBookmarkTooltipTimer);
    var Obj = document.querySelector('#bookmarkStatus');
    Obj.className = 'tooltip bookmark-tooltips';
}
function HideBookmarkTooltip(type) {
    clearTimeout(HideBookmarkTooltipTimer);
    HideBookmarkTooltipTimer = setTimeout(function () {
        ClearBookmarkTooltip();
    }, 1000);
}
var Popup = new HTMLPopup.HTMLPopup(EventsSupport);
var LitresReaderSite;
(function (LitresReaderSite) {
    function CheckBookmarksOnPage(Range) {
        if (BookmarksProcessor.GetBookmarksInRange(1, Range).length) {
            return true;
        }
        else {
            return false;
        }
    }
    LitresReaderSite.CheckBookmarksOnPage = CheckBookmarksOnPage;
    function GetBookmarksOnPage() {
        return BookmarksProcessor.GetBookmarksInRange(1);
    }
    LitresReaderSite.GetBookmarksOnPage = GetBookmarksOnPage;
    function HidePagerBox() {
        footerBox.querySelector('.pager-box').style.visibility = 'hidden';
        footerBox.querySelector('#pager-max-box').style.display = 'none';
    }
    LitresReaderSite.HidePagerBox = HidePagerBox;
    function HistoryAfterUpdate() { }
    LitresReaderSite.HistoryAfterUpdate = HistoryAfterUpdate;
    function HistoryAfterLast() { }
    LitresReaderSite.HistoryAfterLast = HistoryAfterLast;
    // [95004] Передаем значение для параметра `trial`
    function PatchLitresLink(link, needHash) {
        if (needHash === void 0) { needHash = false; }
        var takeBtn = LitresURLParser.SelfBiblio || LitresURLParser.Biblio || LitresURLParser.Gift || LitresURLParser.Librarian;
        if (LitresURLParser.Lfrom) {
            link += (/\?/.test(link) ? '&' : '?') +
                'lfrom=' + LitresURLParser.Lfrom;
        }
        if (needHash) {
            if (takeBtn) {
                link += "#take_yourself";
            }
            else {
                !LitresURLParser.User ? link += "#buy_now_noreg" : link += "#buy_now_reg";
            }
        }
        return link;
    }
    LitresReaderSite.PatchLitresLink = PatchLitresLink;
    var LitresSite = /** @class */ (function (_super) {
        __extends(LitresSite, _super);
        function LitresSite(canvas) {
            var _this = _super.call(this, canvas) || this;
            _this.StoreBookmarkTimer = 0;
            _this.Canvas = canvas;
            _this.IdleThreadProgressor = new LitresCacheProgress(doc.querySelector('.cache'));
            return _this;
        }
        LitresSite.prototype.HeadersLoaded = function (Meta) {
            var Author = '';
            var authorObj = Meta.Authors[0];
            if (authorObj) {
                if (authorObj.First && authorObj.Last) {
                    Author = authorObj.First + ' ' + authorObj.Last;
                }
                else if (authorObj.Last) {
                    Author = authorObj.Last;
                }
            }
            var Title = Meta.Title;
            doc.title = Author + ' - ' + Title;
            doc.querySelector('#author').innerHTML = Author + " «" + Title + "»";
            doc.querySelector('#author-footer').innerHTML = Author + " «" + Title + "»";
            doc.querySelector('.top-box').style.visibility = "visible";
            if (!nn_or4) {
                doc.querySelector('#author').addEventListener("click", function (e) {
                    if (!LitresURLParser.Iframe) {
                        // [95004] Передаем значение для параметра `trial`
                        if (LitresURLParser.RedirectUrl) {
                            window.location.href = LitresReaderSite.PatchLitresLink(LitresURLParser.RedirectUrl);
                        }
                        else {
                            window.location.href = LitresReaderSite.PatchLitresLink('/pages/biblio_book/?art=' + LitresURLParser.ArtID);
                        }
                    }
                    else {
                        window.open(LitresReaderSite.PatchLitresLink('/' + LitresURLParser.ArtID));
                    }
                });
            }
            if (LitresURLParser.Trial) {
                if (pda.state) {
                    doc.querySelector('.top-box').style.top = "0px";
                    changeCSS(".title-text-block", "transition", "margin-left .5s;");
                    if (typeof yaCounter2199583 !== 'undefined') {
                        yaCounter2199583.reachGoal('FragmentOpenPda');
                    }
                }
                if (!aldebaran_or4 && !LitresURLParser.Modal && !LitresURLParser.Iframe) {
                    doc.querySelector('.fragment').style.display = 'block';
                    if (!LitresURLParser.PreorderBuy) {
                        var buyBook = doc.querySelector('#buy-book');
                        buyBook.style.display = "inline-block";
                        doc.querySelector('.buy-box').style.display = 'block';
                        if (typeof yaCounter2199583 !== 'undefined') {
                            yaCounter2199583.reachGoal('FragmentOpenLitres');
                        }
                    }
                }
                else {
                    if (typeof yaCounter2199583 !== 'undefined') {
                        yaCounter2199583.reachGoal('FragmentOpenPartners');
                    }
                }
            }
            else {
                doc.querySelector('.top-box').style.visibility = "visible";
                if (pda.state && !aldebaran_or4) {
                    doc.querySelector('.title-text-block').style.marginLeft = "-100%";
                }
            }
            if (LitresURLParser.Iframe) {
                var BookName = doc.querySelector('#bookName');
                BookName.innerHTML = '&laquo;' + Title + '&raquo;';
                BookName.setAttribute('href', LitresReaderSite.PatchLitresLink('/' + LitresURLParser.ArtID));
                if (aldebaran_or4) {
                    BookName.setAttribute('href', 'https://litres.ru/pages/biblio_book/?art=' + LitresURLParser.ArtID + '&lfrom=344052255');
                }
                doc.querySelector('#bookAuthor').innerHTML = Author;
            }
            if (AFB3Reader.HasFB3Fragment()) {
                progressBar.initFB3Mode(AFB3Reader.GetFB3Fragment(), finishFunction);
            }
            // [106837] При открытии онлайн-читалки фрагмента файрить экшн book_view_register
            if (!aldebaran_or4) {
                var XMLHttp = new XMLHttpRequest();
                XMLHttp.open('GET', "/pages/fake/?action=book_view_register&book_action=read_fragment&art=" + LitresURLParser.ArtID, true);
                XMLHttp.send(null);
            }
            if (LitresURLParser.PreorderBuy) {
                var finishTitleSelector = doc.querySelector('.finish-title');
                finishTitleSelector.setAttribute("data-i18n", "preordered-fragment-finished");
                finishTitleSelector.innerHTML = (UILangData && UILangData["preordered-fragment-finished"]) || "Вы прочитали фрагмент. Полная версия книги будет доступна после начала продаж";
            }
        };
        LitresSite.prototype.AfterTurnPageDone = function (Data, callback) {
            if (Data.TurnByProgressBar) {
                EventsSupport.ChapterObj.ShowWindow(BookmarksProcessor.Bookmarks[0].Range);
            }
            this.UpdateCurPage(Data);
            progressBar.setValue(Data.Percent);
            LitresLocalBookmarks.SetCurrentPosition(Data.Pos);
            LitresLocalBookmarks.SetCurrentDateTime(BookmarksProcessor.Bookmarks[0].DateTime);
            if (pda.state && getSetting('pda_fullscreen') && pda.top_hidden) {
                LitresFullScreen.showHiddenElements();
            }
            if (Data.Percent > 50) {
                typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_auth_after');
            }
            typeof callback === 'function' ? callback() : this.StoreBookmarksHandler(3000);
        };
        LitresSite.prototype.IsAuthorizeMode = function () {
            return !LitresURLParser.User && !LitresURLParser.Iframe && LitresURLParser.Half
                && LitresURLParser.Trial && !nn_or4
                && !AuthorizeIFrame.UserID && !aldebaran_or4;
        };
        LitresSite.prototype.IsAlreadyClicked = function () {
            var storageItem = sessionStorage.getItem('FB3ReaderTrialCounters');
            var counters = storageItem ? JSON.parse(storageItem) : {};
            var artID = LitresURLParser.ArtID, counter = Number(counters[artID]);
            counter = counters[artID] = counter > 0 ? ++counter : 1;
            sessionStorage.setItem('FB3ReaderTrialCounters', JSON.stringify(counters));
            return counter >= 5;
        };
        LitresSite.prototype.BookCacheDone = function (Data) {
            this.UpdateCurPage(Data);
        };
        LitresSite.prototype.UpdateCurPage = function (Data) {
            if (Data.CurPage === undefined) {
                LitresReaderSite.HidePagerBox();
                return;
            }
            if (LitresFinishWindow) {
                LitresFinishWindow.HideWindow();
            }
            var maxPage = Data.MaxPage ? parseInt(Data.MaxPage.toFixed(0)) : 0;
            var CurPage = (Data.CurPage + 1) >= maxPage && maxPage ? maxPage : (Data.CurPage + 1);
            var PercentRead = CurPage / maxPage;
            footerBox.querySelector('#pager-current').innerHTML = CurPage.toString();
            footerBox.querySelector('.pager-box').style.visibility = 'visible';
            if (PercentRead == 1) {
                finishFunction();
            }
            else if (PercentRead >= 0.95) {
                // [150447] пр 95% прочитанного загружаем фреймы
                preloadIFrames();
            }
            if (maxPage) {
                footerBox.querySelector('#pager-max').innerHTML = maxPage.toString();
                footerBox.querySelector('#pager-max-box').style.display = 'inline';
            }
        };
        LitresSite.prototype.StoreBookmarksHandler = function (timer, callback, failureCallback) {
            if (timer === void 0) { timer = 0; }
            if (callback === void 0) { callback = function () { }; }
            if (failureCallback === void 0) { failureCallback = function () { }; }
            this.AfterStoreBookmarksCallback = callback;
            this.AfterStoreBookmarksFailureCallback = failureCallback;
            BookmarksProcessor.MakeStoreXMLAsync(function (XML) {
                if (XML)
                    LitresLocalBookmarks.StoreBookmarks(XML);
            });
            if (this.StoreBookmarkTimer) {
                clearTimeout(this.StoreBookmarkTimer);
            }
            this.StoreBookmarkTimer = setTimeout(function () {
                BookmarksProcessor.Store();
            }, timer);
        };
        LitresSite.prototype.BeforeBookmarksAction = function () {
            if (LitresURLParser.User)
                return true;
            return false;
        };
        LitresSite.prototype.AfterStoreBookmarks = function () {
            if (typeof this.AfterStoreBookmarksCallback === 'function') {
                this.AfterStoreBookmarksCallback();
            }
        };
        LitresSite.prototype.AfterStoreBookmarksFailure = function () {
            if (typeof this.AfterStoreBookmarksFailureCallback === 'function') {
                this.AfterStoreBookmarksFailureCallback();
            }
        };
        LitresSite.prototype.ZoomImg = function (obj) {
            EventsSupport.ZoomObj.ZoomIMG(obj.getAttribute('data-path'), obj.getAttribute('data-w'), obj.getAttribute('data-h'));
        };
        LitresSite.prototype.ZoomHTML = function (HTML) {
            EventsSupport.ZoomObj.ZoomHTML(HTML);
        };
        LitresSite.prototype.HistoryHandler = function (Pos) {
            LitresHistory.push(Pos);
        };
        //		public PatchNoteNode(Node: HTMLElement): HTMLElement {
        //			addClass(Node, 'scrollableNote');
        //			return Node;
        //		}
        LitresSite.prototype.SetScrollableNote = function () {
            var Reader = AFB3Reader;
            for (var I = Reader.CurVisiblePage; I < Reader.CurVisiblePage + Reader.NColumns; I++) {
                var items = Reader.Pages[I].ParentElement.querySelectorAll('.scrollableNote');
                for (var J = 0; J < items.length; J++) {
                    var scroll = new scrollbar(items[J], {});
                }
            }
        };
        return LitresSite;
    }(FB3ReaderSite.ExampleSite));
    LitresReaderSite.LitresSite = LitresSite;
    var LitresCacheProgress = /** @class */ (function () {
        // dummy class for progressbar only
        function LitresCacheProgress(Obj) {
            this.Obj = Obj;
            this.Progresses = {};
        }
        LitresCacheProgress.prototype.Progress = function (Owner, Progress) {
            this.Progresses[Owner] = Progress;
            var N = 0;
            var OverallProgress = 0;
            for (var ProgressInst in this.Progresses) {
                N++;
                OverallProgress = this.Progresses[ProgressInst];
            }
            OverallProgress = OverallProgress / N;
            OverallProgress = OverallProgress.toFixed(1);
            // console.log(OverallProgress);
            if (OverallProgress >= 100) {
                this.Obj.style.display = 'none';
            }
            else {
                this.Obj.style.display = 'block';
            }
            this.Obj.style.width = OverallProgress + '%';
        };
        LitresCacheProgress.prototype.HourglassOn = function (Owner, LockUI, Message) { };
        LitresCacheProgress.prototype.HourglassOff = function (Owner) { };
        LitresCacheProgress.prototype.Alert = function (Message) { };
        LitresCacheProgress.prototype.Tick = function (Owner) {
            if (!this.Progresses[Owner]) {
                this.Progresses[Owner] = 1;
            }
            else if (this.Progresses[Owner] < 99) {
                this.Progresses[Owner] += 1;
            }
            this.Progress(Owner, this.Progresses[Owner]);
        };
        return LitresCacheProgress;
    }());
})(LitresReaderSite || (LitresReaderSite = {}));
function initEngine(Callback) {
    var Canvas = document.getElementById('reader');
    var AReaderSite = new LitresReaderSite.LitresSite(Canvas);
    AReaderSite.AuthorizeIFrame = AuthorizeIFrame;
    AReaderSite.UpsaleIFrame = UpsaleIFrame;
    AReaderSite.RatingIFrame = RatingIFrame;
    AFB3PPCache = new FB3PPCache.PPCache(LitresURLParser.IndexedDB ? FB3PPCache.INDEXED_DB : FB3PPCache.LOCAL_STORAGE);
    var DataProvider = new FB3DataProvider.AJAXDataProvider(LitresURLParser.BaseURL, LitresURLParser.ArtID2URL);
    DataProvider.json_redirected = aldebaran_or4;
    var AReaderDOM = new FB3DOM.DOM(AReaderSite, AReaderSite.Progressor, DataProvider, AFB3PPCache);
    BookmarksProcessor = new FB3Bookmarks.LitResBookmarksProcessor(AReaderDOM, LitresURLParser.SID, LitresLocalBookmarks.GetCurrentArtBookmarks(), LitresURLParser.Catalit2);
    BookmarksProcessor.aldebaran = aldebaran_or4;
    BookmarksProcessor.FB3DOM.Bookmarks.push(BookmarksProcessor);
    BookmarksProcessor.ReadyCallback = function () {
        var Range = AFB3Reader.GetVisibleRange();
        AFB3Reader.CanvasReadyCallback(Range);
        BookmarksProcessor.ReadyCallback = undefined;
    };
    AFB3Reader = new FB3Reader.Reader(true, AReaderSite, AReaderDOM, BookmarksProcessor, AppVersion, AFB3PPCache, LitresURLParser.TrackReading);
    EventsSupport.Reader = AFB3Reader;
    EventsSupport.Bookmarks = BookmarksProcessor;
    AFB3Reader.CanvasReadyCallback = function (Range) {
        var ele = AFB3Reader.FB3DOM.Site.Canvas;
        var map = document.getElementById("clone-canvas");
        while (map.firstChild) {
            map.removeChild(map.firstChild);
        }
        var activeZones = AFB3Reader.ActiveZones();
        var activeZoneEl;
        if (activeZones.length <= 0) {
            return;
        }
        for (var i = 0; i < activeZones.length; i++) {
            var rect = activeZones[i].rect;
            var mainrect = readerBox.getBoundingClientRect();
            var area = document.createElement('area');
            area.coords = (rect.left - mainrect.left) + "," + (rect.top - mainrect.top) + "," + (rect.right - mainrect.left) + "," + (rect.bottom - mainrect.top);
            area.shape = "rect";
            var cursor = "pointer";
            area.style.cursor = cursor;
            map.appendChild(area);
            area.style.display = "block";
            activeZoneEl = activeZones[i].el;
            //если элемент не ссылка, но клик по нему должен производить какое-то действие, то пробрасываем это событие в данный элемент
            (function (_i) {
                var element = activeZones[_i].el;
                area.onclick = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    function simulate(element, eventName) {
                        var options = extend(defaultOptions, arguments[2] || {});
                        var oEvent, eventType = null;
                        for (var name in eventMatchers) {
                            if (eventMatchers[name].test(eventName)) {
                                eventType = name;
                                break;
                            }
                        }
                        if (!eventType)
                            throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
                        if (document.createEvent) {
                            oEvent = document.createEvent(eventType);
                            if (eventType == 'HTMLEvents') {
                                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
                            }
                            else {
                                oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
                            }
                            element.dispatchEvent(oEvent);
                        }
                        return element;
                    }
                    var eventMatchers = {
                        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
                        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
                    };
                    var defaultOptions = {
                        pointerX: 0,
                        pointerY: 0,
                        button: 0,
                        ctrlKey: false,
                        altKey: false,
                        shiftKey: false,
                        metaKey: false,
                        bubbles: true,
                        cancelable: true
                    };
                    // No need for event simulation if we've found corresponding fire method
                    if (AFB3Reader.CallActiveZoneCallback(activeZones[_i].id)) {
                        return;
                    }
                    if (element.click) {
                        element.click();
                    }
                    else {
                        simulate(element, "click");
                    }
                };
            })(i);
        }
        if (LitresReaderSite.CheckBookmarksOnPage(Range)) {
            addClass(addBookmark, 'clicked');
        }
        else {
            removeClass(addBookmark, 'clicked');
        }
    };
    LitresHistory = new WebHistory.HistoryClass(AFB3Reader);
    if (Callback)
        Callback();
    if (AFB3Reader.HyphON) { // Android 2.* is unable to work with soft hyphens properly
        AFB3Reader.HyphON = !(/Android [12]\./i.test(navigator.userAgent));
    }
    AFB3Reader.Init(LitresLocalBookmarks.GetCurrentPosition(), LitresLocalBookmarks.GetCurrentDateTime());
    window.addEventListener('resize', function () {
        AFB3Reader.AfterCanvasResize();
        setTimeout(function () {
            if (pda.state && !aldebaran_or4) {
                doc.querySelector('.buy-box').style.width = doc.querySelector('.pda-buy-box').style.width = window.innerWidth + "px";
            }
        }, 200);
    });
    // social and windows
    FacebookSharing = new SocialSharing.FacebookSharing(LitresURLParser.ArtID, EventsSupport, LitresURLParser.FileID, doc.querySelector('#facebook .share-button'));
    TwitterSharing = new SocialSharing.TwitterSharing(LitresURLParser.ArtID, EventsSupport, LitresURLParser.FileID, false);
    VkontakteSharing = new SocialSharing.VkontakteSharing(LitresURLParser.ArtID, EventsSupport, LitresURLParser.FileID, false);
    LitresBookmarksWindow = new Bookmarks.BookmarksWindow(doc.querySelector('#bookmarks'), EventsSupport, UILangData);
    LitresHelpWindow = new Help.HelpWindow(doc.querySelector('#tip'), EventsSupport, UILangData);
    LitresFinishWindow = new Finish.FinishWindow(doc.querySelector('#finishBuyBox'), EventsSupport);
    LitresContentsWindow = new Contents.ContentsWindow(doc.querySelector('#contents'), EventsSupport, finishFunction);
    LitresSettingsWindow = new Settings.SettingsWindow(doc.querySelector('#settings'), EventsSupport);
    TopMenuObj = new TopMenu.TopMenuClass(EventsSupport);
    if (LitresURLParser.Modal) {
        var CloseButton = document.querySelector('.menu-close').parentNode;
        CloseButton.removeAttribute('style');
        CloseButton.addEventListener('click', function () {
            if (LitresFullScreen.fullScreen) {
                LitresFullScreen.ButtonHandler();
            }
            AFB3Reader.Destroy = true;
            window.parent.CloseReadFrame();
        }, false);
        document.querySelector('#author').style.display = 'none';
        document.querySelector('.pager-box').style.textAlign = 'center';
    }
    start = new Date().getTime();
    AFB3Reader.StartTime = start;
    AReaderSite.FontSize = getFontSize();
    if (LitresURLParser.TrackReading)
        window.onbeforeunload = function () { return AFB3Reader.ReadProgress.SendReadReport(); };
}
var LitRes = LitRes || {};
function setTrialLink() {
    var buyButton = doc.querySelector('#buy-book');
    var btnText = textTrialButton();
    if (btnText.indexOf("Купить и читать дальше за") > -1 && pda.state) {
        btnText = "Полная версия " + btnText.substr(btnText.indexOf("за") - 1);
    }
    updateTrialButton(buyButton, btnText);
    addTrialHandlers(buyButton);
}
function updateTrialButton(button, value) {
    button.innerHTML = value; // for IE 8 and below
    if (LitresURLParser.RequestUser) {
        var buyBoxTxt = doc.querySelector('.fragment');
        buyBoxTxt.textContent = '';
        buyBoxTxt.style.marginLeft = '0';
    }
}
var viewInited = false;
function startView() {
    if (FullUILangData) {
        if (LitresURLParser.UILang && FullUILangData[LitresURLParser.UILang]) {
            UILangData = FullUILangData[LitresURLParser.UILang];
        }
        else {
            UILangData = FullUILangData['ru'];
        }
        translateHTML(document.body, UILangData);
    }
    document.onselectstart = function () { return false; };
    if (LitresURLParser.Modal) {
        addClass(document.body, 'modal');
        window.focus();
    }
    if (LitresURLParser.PartID != 458582) {
        if (!aldebaran_or4 && !LitresURLParser.Modal) {
            var obj = footerBox.querySelector('.logo');
            doc.querySelector('.icon-back').addEventListener("click", function () {
                if (!LitresURLParser.Iframe) {
                    // [95004] Передаем значение для параметра `trial`
                    if (LitresURLParser.RedirectUrl) {
                        window.location.href = LitresReaderSite.PatchLitresLink(LitresURLParser.RedirectUrl);
                    }
                    else {
                        window.location.href = LitresReaderSite.PatchLitresLink('/pages/biblio_book/?art=' + LitresURLParser.ArtID);
                    }
                }
                else {
                    window.open(LitresReaderSite.PatchLitresLink('/' + LitresURLParser.ArtID));
                }
            });
            if (obj) {
                obj.setAttribute('href', LitresReaderSite.PatchLitresLink('/' + LitresURLParser.ArtID, true));
                if (LitresURLParser.Iframe) {
                    obj.setAttribute('target', '_blank');
                    addClass(doc.querySelector('#partnerLine'), 'active');
                }
            }
        }
        if (LitresURLParser.Trial) {
            if (LitresURLParser.Iframe) {
                var obj = doc.querySelector('#partnersBuy');
                obj.setAttribute('href', LitresReaderSite.PatchLitresLink('/' + LitresURLParser.ArtID));
                if (aldebaran_or4) {
                    obj.setAttribute('href', 'https://litres.ru/pages/biblio_book/?art=' + LitresURLParser.ArtID + '&lfrom=344052255');
                    addClass(doc.querySelector('#partnerLine'), 'active');
                }
            }
            else {
                var setupObject = { or4: true };
                if (LitresURLParser.Fund == "new") {
                    setupObject["newFund"] = true;
                }
                LitRes.Setup = setupObject;
                if (LitresURLParser.PartID == 723763) {
                    LitRes.Setup.width = '712px';
                    LitRes.Setup.height = '650px';
                }
                if (LitresURLParser.Lfrom) {
                    LitRes.Setup.lfrom = LitresURLParser.Lfrom;
                }
            }
        }
    }
    else {
        doc.querySelector('.top-box').style.display = 'none';
    }
    if (win.devicePixelRatio) {
        pda.pixelRatio = win.devicePixelRatio;
    }
    checkPDAstate();
    if (LitresURLParser.Trial) {
        setTrialLink();
    }
    function CheckElementAtXY(Node) {
        return !Node || !Node.nodeName.match(/span|img/i) || !Node.id.match(/n(_\d+)+/);
    }
    EventsSupport.PDA = pda;
    if (pda.state && !aldebaran_or4) {
        doc.querySelector('.pda-buy-box').style.width = window.innerWidth + "px";
        if (doc.querySelector('#partnerLine.active')) {
            doc.querySelector('#partnerLine.active').style.bottom = "40px";
            doc.querySelector('#partnerLine.active .partners-box').style.margin = "10px 0";
            doc.querySelector('#footer').style.bottom = "40px";
            doc.querySelector('#footer').style.marginBottom = "0px";
        }
        else {
            doc.querySelector('#footer').style.marginBottom = "20px";
        }
    }
    var ContextMenuTouchObj = new EventsModule.ContextMenuTouch(EventsSupport);
    MouseObj = new EventsModule.MouseClickClass(EventsSupport);
    if (LitresURLParser.PartID != 458582) {
        EventsSupport.SelectionObj = new SelectionModule.SelectionClass(function (e) { return MouseObj.onHideElements(e, 'click'); }, EventsSupport);
    }
    checkFonts();
    loadSettings();
    if (LitresURLParser.PartID == 458582 && !pda.state) {
        // useless workaround
        EventsSupport.ReaderBox.addEventListener('mouseup', function (e) { return MouseObj.OnClickHandler(e, 'click'); }, false);
        setSetting(1, 'enableClick');
        MouseObj.RemoveHandlers();
    }
    checkOperaPrestoClick();
    applySettings();
    calcHeight();
    if (pda.state) {
        FB3PPCache.MaxCacheRecords = 5; // Локалсторадж маленький и работает медленно, ограничим свои аппетиты
        FB3ReaderPage.PrerenderBlocks = 3; // Для построения страницы сколько блоков нам пригодится? Страница маленькая, хватит 3-х
        LitresFullScreen = new FullScreenSupport.PDAFullScreenClass(function (state) {
            // TODO: little ugly code
            var obj = doc.body;
            if (state) {
                if (!LitresURLParser.Trial) {
                    addClass(obj, 'pda-top-hidden');
                }
                addClass(obj, 'pda-top-absolute');
            }
            else {
                if (!LitresURLParser.Trial) {
                    removeClass(obj, 'pda-top-hidden');
                }
                removeClass(obj, 'pda-top-absolute');
            }
            setSetting(state, 'pda_fullscreen');
            calcHeight(true);
        }, function (state) {
            pda.top_hidden = state;
        }, EventsSupport);
        /*if (getSetting('pda_fullscreen')) {
            LitresFullScreen.ButtonHandler();
        }*/
        if (LitresURLParser.Trial) {
            changeCSS('#settings', 'top', '0px');
        }
    }
    else {
        LitresFullScreen = new FullScreenSupport.FullScreenClass(function () { return TopMenuObj.RemoveActive(); }, footerBox, EventsSupport);
    }
    BarClassRe.checkHTML5Support();
    progressBar = new BarClassRe.BarClass('progress', '#footer .progressbar', pda.state, function (val, type) {
        if (type == 'action_move' || type == 'action_start') {
            EventsSupport.ChapterObj.ClearWindow();
        }
        if (type != 'action_end_doc') {
            if (AFB3Reader.Site.IsAuthorizeMode() && AFB3Reader.Site.IsAlreadyClicked()) {
                if (AFB3Reader.Site.AuthorizeIFrame.Hidden) {
                    AFB3Reader.Site.AuthorizeIFrame.SetPercent(val);
                    AFB3Reader.Site.AuthorizeIFrame.Show();
                }
            }
            else {
                AFB3Reader.GoToPercent(val, true);
            }
        }
        if (type == 'action_end' || type == 'action_click' || type == 'action_end_doc') {
            EventsSupport.ChapterObj.HideWindowTimer();
        }
    });
    // progressBar.setValue(50);
    fontsizeBar = new BarClassRe.BarClass('setting', '#fontsize-box .progressbar', pda.state, changeFontSizeHandler, false, fontSizeArray, getSetting('fontSize'));
    themeBar = new BarClassRe.BarClass('setting', '#theme-box .progressbar', pda.state, changeThemeHandler, false, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], getSetting('theme'));
    readerMarginBar = new BarClassRe.BarClass('setting', '#reader-margin .progressbar', pda.state, changeReaderMarginHandler, false, marginList, getSetting('readerMargin'), true, true);
    lineHeightBar = new BarClassRe.BarClass('setting', '#line-height .progressbar', pda.state, changeLineHeightHandler, false, lineHeightList, getSetting('lineHeight'), true, true);
    initEngine(beforeInitApplySetting);
    ContextObj = new ContextMenu.ContextMenuClass(EventsSupport, UILangData);
    EventsSupport.AddNavArrows();
    var MouseWheelSupport = new EventsModule.MouseWheelClass(EventsSupport);
    var KeydownSupport = new EventsModule.KeydownClass(EventsSupport);
    setSettingsEvents();
    viewInited = true;
}
startView();
document.addEventListener("yacounter2199583inited", function (event) {
    try {
        if (typeof yaCounter2199583 !== 'undefined') {
            if (LitresURLParser.AuthReg) {
                yaCounter2199583.reachGoal('or_auth_reg');
                window.history.pushState({}, '', '?' + LitresURLParser.insertParam(window.location.search, 'or_auth_reg', 0));
            }
            else if (LitresURLParser.AuthSuccs) {
                yaCounter2199583.reachGoal('or_auth_succs');
                window.history.pushState({}, '', '?' + LitresURLParser.insertParam(window.location.search, 'or_auth_succs', 0));
            }
        }
    }
    catch (e) {
        console.warn(e.message);
    }
}, false);
