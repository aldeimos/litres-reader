/// <reference path="or.ts" />
var defaultSettings = {
    settings_version: '1.1',
    allSettings: 0,
    enableClick: 1,
    font: 0,
    fontSize: 0,
    autoFontSize: 0,
    lineHeight: 2,
    readerMargin: 2,
    columns: 2,
    skipColumnChange: 0,
    textAlign: 1,
    hyphOn: 1,
    serverSync: 1,
    customColors: 0,
    colors: {
        bg: -1,
        font: -1
    },
    theme: 9,
    pda_fullscreen: true
};
var settings = defaultSettings;
var lineHeightList = [120, 130, 140, 150, 160];
var marginList = [-0.5, -0.25, 0, 0.25, 0.5];
var theme_colors = {
    0: ['#676767', '#000'],
    1: ['#858585', '#000'],
    2: ['#adadad', '#000'],
    3: ['#fff', '#000'],
    4: ['#000', '#e8dabe'],
    5: ['#000', '#ede1cb'],
    6: ['#000', '#f1e9d8'],
    7: ['#000', '#f6f0e5'],
    8: ['#000', '#faf8f2'],
    9: ['#000', '#fff']
};
var autoMinFontSize = 16;
var fontList = {
    0: ['Arial', 'sans-serif', 4, 0.9],
    1: ['Myriad Pro', 'sans-serif', false, false],
    2: ['Verdana', 'sans-serif', 6, 0.9],
    3: ['Helvetica', 'sans-serif', 10, 1],
    4: ['Times New Roman', 'serif', 0, 0.8],
    5: ['Minion Pro', 'serif', false, false],
    6: ['Georgia', 'serif', 2, 0.8],
    7: ['PT Sans', 'sans-serif', 11, 0.9],
    8: ['Calibri', 'sans-serif', 9, 0.9],
    9: ['Cambria', 'serif', 8, 0.9],
    10: ['PT Mono', false, 3, 1],
    11: ['PT Serif', 'serif', 7, 0.9]
};
var fontSizeArray = [14, 15, 16, 18, 20, 22, 25, 29, 32, 34, 38, 40];
var colors_def = [];
colors_def['font'] = {
    0: '#000000',
    1: '#637480',
    2: '#cbcbcb',
    3: '#ffffff',
    4: '#f5eaaa',
    5: '#ebdace',
    6: '#d1dcb2',
    7: '#064f6d'
};
colors_def['bg'] = {
    0: '#588c75',
    1: '#b0c47f',
    2: '#f3e395',
    3: '#f3ae73',
    4: '#ebf0f1',
    5: '#bdc4c8',
    6: '#7c8c8e',
    7: '#1e3c50'
};
var colors_def_night = { 6: true, 7: true };
var colors_def_night_top = { 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true };
var win = window, doc = document, scrollSettings = null;
var Settings;
(function (Settings) {
    var SettingsWindow = /** @class */ (function () {
        function SettingsWindow(Obj, Parent) {
            this.Obj = Obj;
            this.Parent = Parent;
            this.ButtonClass = ['menu-settings'];
            this.ShowState = false;
            this.Parent.WindowsCarry.RegisterWindow(this);
        }
        SettingsWindow.prototype.ButtonHandler = function () {
            if (!this.ShowState) {
                this.ShowWindow();
            }
            else {
                this.HideWindow();
            }
        };
        SettingsWindow.prototype.ShowWindow = function () {
            this.ShowState = true;
            this.Parent.Mask.Show('0');
            setCurrentFontSetting();
            if (getSetting('customColors') == 1) {
                showMoreSettings(null, true);
                showCustomColors();
            }
            else {
                hideMoreSettings();
                hideCustomColors();
            }
            this.ToggleWindow('block');
            this.UpdateHeight();
            calcSettingsArrowPos();
        };
        SettingsWindow.prototype.HideWindow = function () {
            this.Parent.Mask.Hide();
            this.ToggleWindow('none');
            this.ShowState = false;
        };
        SettingsWindow.prototype.ToggleWindow = function (state) {
            this.Obj.style.display = state;
        };
        SettingsWindow.prototype.UpdateHeight = function () {
            var maxHeight = doc.querySelector('.top-box').offsetHeight;
            maxHeight = doc.documentElement.clientHeight - maxHeight;
            if (!this.Parent.PDA.state) {
                // 7 - top arrow
                // 2 - border
                maxHeight -= 7 + 2;
            }
            if (this.Obj.querySelector('.settings_list').offsetHeight >= maxHeight) {
                this.Obj.style.height = maxHeight + 'px';
            }
            else {
                this.Obj.style.height = 'auto';
            }
            if (!this.Parent.PDA.state) {
                scrollSettings = new scrollbar(this.Obj.querySelector('.settings_list'), {});
                scrollSettings.refresh();
            }
        };
        return SettingsWindow;
    }());
    Settings.SettingsWindow = SettingsWindow;
})(Settings || (Settings = {}));
/* settings window */
var settingsBox = doc.querySelector('#settings');
function showSettings() {
    if (settingsBox.style.display == 'block') {
        settingsBox.style.display = 'none';
        EventsSupport.Mask.Hide();
    }
    else {
        EventsSupport.Mask.Show('0');
    }
}
// showSettings();
var more = settingsBox.querySelector('#more-settings .more-button');
function showMoreSettings(e, skipUpdate) {
    // setSetting(1, 'allSettings');
    hideFontChangeList();
    storeSettings();
    doc.querySelector('#more-settings').style.display = 'none';
    addClass(settingsBox.querySelector('.settings_list'), 'fullSettings');
    if (!skipUpdate) {
        LitresSettingsWindow.UpdateHeight();
    }
}
function hideMoreSettings() {
    // setSetting(0, 'allSettings');
    doc.querySelector('#more-settings').style.display = 'block';
    removeClass(settingsBox.querySelector('.settings_list'), 'fullSettings');
}
more.addEventListener('click', showMoreSettings, false);
/* line-height */
var NotesMod = 0.7;
function changeLineHeightHandler(val) {
    if (getSetting('lineHeight') == val)
        return;
    setSetting(val, 'lineHeight');
    setFontSize();
}
function changeLineHeight(skip) {
    //	var _const = 1.618,
    //		fontLineHeight = Math.floor(fontSizeArray[getSetting('fontSize')] * _const),
    //		fontNotesLineHeight = Math.floor((fontSizeArray[getSetting('fontSize')] * NotesMod) * _const);
    //	var lh = lineHeightList[getSetting('lineHeight')] / 100;
    //	var newLineHeight = fontLineHeight * lh;
    //	changeCSS('#reader', 'line-height',  newLineHeight.toFixed(2) + 'px');
    //	var newNotesLineHeight = fontNotesLineHeight * lh;
    //	changeCSS('div.FB2readerPage p.footnote', 'line-height', newNotesLineHeight.toFixed(2) + 'px');
    var fs = fontSizeArray[getSetting('fontSize')];
    var lh = lineHeightList[getSetting('lineHeight')] / 100;
    changeCSS('#reader, #zoomedImg', 'line-height', Math.floor(fs * lh) + 'px');
    changeCSS('div.FB2readerPage .footnote', 'line-height', Math.floor((fs * NotesMod) * lh) + 'px');
    // changeCSS('#reader, div.FB2readerPage .footnote', 'line-height', lineHeightList[getSetting('lineHeight')] + '%');
    if (!skip)
        applyReset();
}
/* set fontSize */
function changeFontSizeHandler(val) {
    if (getSetting('fontSize') == val)
        return;
    setSetting(val, 'fontSize');
    setFontSize();
}
function setFontSize() {
    changeCSS('#reader, #zoomedImg', 'font-size', fontSizeArray[getSetting('fontSize')] + 'px;');
    /*	var newFontSize = (fontSizeArray[getSetting('fontSize')] * NotesMod);
     changeCSS('div.FB2readerPage p.footnote', 'font-size', newFontSize.toFixed(2) + 'px;');*/
    setCiteFontSize();
    changeLineHeight();
}
function getFontSize() {
    return fontSizeArray[getSetting('fontSize')];
}
function setCiteFontSize() {
    var fontVal = getSetting('font');
    changeCSS('.readerStyles .tag_cite', 'font-size', (fontSizeArray[getSetting('fontSize')] * fontList[fontVal][3]) + 'px;');
}
/* theme */
function changeThemeHandler(val) {
    if (getSetting('theme') == val)
        return;
    setSetting(val, 'theme');
    storeSettings();
    setTheme();
}
function setTheme() {
    var currentTheme = theme_colors[getSetting('theme')];
    setColor('bg', currentTheme[1]);
    setColor('footerbox', currentTheme[1]);
    setColor('font', currentTheme[0]);
    setColor('font-footer', currentTheme[0]);
    doc.body.style.backgroundColor = currentTheme[1];
    if (getSetting('theme') >= 0 && getSetting('theme') < 4)
        setUINightTheme(true);
    else
        setUINightTheme(false);
    if (getSetting('theme') != 9)
        setUINightTop(true);
    else
        setUINightTop(false);
    if (getSetting('theme') < 4)
        setUINightLogo(true);
    else
        setUINightLogo(false);
}
function setUINightTheme(setState) {
    if (setState) {
        addClass(doc.body, 'night_theme');
    }
    else {
        removeClass(doc.body, 'night_theme');
    }
    if (viewInited) {
        fontsizeBar.chromeWorkaround();
        themeBar.chromeWorkaround();
        readerMarginBar.chromeWorkaround();
        lineHeightBar.chromeWorkaround();
    }
}
function setUINightTop(setState) {
    if (setState)
        addClass(doc.body, 'night_top');
    else
        removeClass(doc.body, 'night_top');
}
function setUINightLogo(setState) {
    if (setState)
        addClass(doc.body, 'night_logo');
    else
        removeClass(doc.body, 'night_logo');
}
/* columns */
function changeColumnAmountHangler() {
    if (this.checked == true) {
        setSetting(2, 'columns');
        setSetting(0, 'skipColumnChange');
    }
    else {
        setSetting(1, 'columns');
        setSetting(1, 'skipColumnChange');
    }
    changeColumnAmount();
    calcHeight(true);
}
function changeColumnAmount() {
    AFB3Reader.NColumns = getSetting('columns');
    applyReset();
}
var columns = doc.querySelector('#column-amount input');
/* text-align */
function changeTextAlignHandler() {
    if (this.checked == true)
        setSetting(1, 'textAlign');
    else
        setSetting(0, 'textAlign');
    changeTextAlign();
}
function changeTextAlign() {
    var align = 'left';
    if (getSetting('textAlign') == 1)
        align = 'justify';
    changeCSS('.FBReaderContentDiv', 'text-align', align);
    applyReset();
}
var textAlignSwitch = doc.querySelector('#text-justify input');
/* word break */
function changeHyphHandler() {
    if (this.checked == true)
        setSetting(1, 'hyphOn');
    else
        setSetting(0, 'hyphOn');
    changeHyph();
}
function changeHyph() {
    if (getSetting('hyphOn'))
        AFB3Reader.HyphON = true;
    else
        AFB3Reader.HyphON = false;
    applyReset();
}
var textHyph = doc.querySelector('#text-hyph input');
/* enable click */
function changeEnableClickHandler() {
    if (this.checked == true) {
        setSetting(1, 'enableClick');
        MouseObj.AddHandlers();
        //		removeTouchHandlers();
    }
    else {
        setSetting(0, 'enableClick');
        MouseObj.RemoveHandlers();
        //		addTouchHandlers();
    }
    EventsSupport.AddNavArrows();
    storeSettings();
}
var enableClick = doc.querySelector('#enable-click input');
/* font family */
var fontChangeBox = settingsBox.querySelector('#font-changer');
function toggleFontFamilyHandler() {
    var fontList = fontChangeBox.querySelector('.font-list');
    var iconFontList = fontChangeBox.querySelector('.icon-bottom');
    if (fontList.style.display == 'block') {
        hideFontChangeList();
    }
    else {
        fontList.style.display = 'block';
        addClass(iconFontList, 'icon-top');
    }
    LitresSettingsWindow.UpdateHeight();
}
function fontChangeSetHandlers() {
    var fontListAction = settingsBox.querySelectorAll('.font-list li');
    for (var j = 0; j < fontListAction.length; j++)
        fontListAction[j].addEventListener('click', changeFontFamilyHandler, false);
}
function setCurrentFontSetting() {
    var currentFont = fontChangeBox.querySelector('.font-current-row');
    currentFont.innerHTML = '<span class="icon icon-bottom"></span>' + fontList[getSetting('font')][0];
    currentFont.className = currentFont.className.replace(/(font\d+)/, 'font' + getSetting('font'));
    clearCurrentFont();
    addClass(fontChangeBox.querySelector('.font-list .font' + getSetting('font')), 'current');
}
function clearCurrentFont() {
    var fontsLi = fontChangeBox.querySelectorAll('.font-row');
    for (var j = 0; j < fontsLi.length; j++) {
        removeClass(fontsLi[j], 'current');
    }
}
function changeFontFamilyHandler() {
    toggleFontFamilyHandler();
    if (this.getAttribute('data-id') == getSetting('font'))
        return true;
    setSetting(this.getAttribute('data-id') * 1, 'font');
    setCurrentFontSetting();
    changeFontFamily();
}
function changeFontFamily() {
    var fontVal = getSetting('font');
    changeCSS('#reader', 'font-family', fontList[fontVal][0], fontList[fontVal][1] ? ', ' + fontList[fontVal][1] : '');
    var fontCite = fontList[fontVal][2];
    changeCSS('.readerStyles .tag_cite', 'font-family', fontList[fontCite][0], fontList[fontCite][1] ? ', ' + fontList[fontCite][1] : '');
    changeCSS('#zoomedImg .readerStyles', 'font-family', fontList[fontVal][0], fontList[fontVal][1] ? ', ' + fontList[fontVal][1] : '');
    setCiteFontSize();
    changeLineHeight(true);
    applyReset();
}
function hideFontChangeList() {
    fontChangeBox.querySelector('.font-list').style.display = 'none';
    var iconFontList = fontChangeBox.querySelector('.icon-bottom');
    if (iconFontList) {
        removeClass(iconFontList, 'icon-top');
    }
}
var fontFamily = doc.querySelector('#font-changer .font-current-row');
/* reader margin-left margin-right */
function changeReaderMarginHandler(val) {
    if (getSetting('readerMargin') == val)
        return;
    setSetting(val, 'readerMargin');
    storeSettings();
    calcHeight(true);
}
function changeReaderMargin() {
    var readerMarginValue = calcReaderMargin().toFixed(2);
    if (!LitresURLParser.Modal) {
        changeCSS('#footer', 'margin', '0');
        changeCSS('#footer', 'padding', '0 ' + readerMarginValue + 'px;');
        if (readerHeight > 0 && pda.state && !aldebaran_or4) {
            var trialsGap = 0;
            if (LitresURLParser.Trial) {
                trialsGap = 40;
            }
            changeCSS('#footer', 'margin-top', (0) + 'px;');
        }
    }
    if (LitresURLParser.Iframe) {
        changeCSS('#partnerLine', 'padding', '0 ' + readerMarginValue + 'px;');
    }
    applyReset();
}
function calcReaderMargin() {
    var columnWindth = win.innerWidth / getSetting('columns');
    var tmpReaderMargin = columnWindth / 12;
    if (pda.state) {
        tmpReaderMargin = tmpReaderMargin / 2;
    }
    return tmpReaderMargin + tmpReaderMargin * marginList[getSetting('readerMargin')];
}
/* custom color changer */
var themeBox = settingsBox.querySelector('#theme-box');
var colorsBox = settingsBox.querySelector('#color-box');
var colorButton = settingsBox.querySelector('#custom-color input + *');
var colorsList = false;
function makeColorList(type) {
    var output = '';
    var c = colors_def[type];
    var _class;
    var custom = getSetting('customColors');
    for (var j in c) {
        _class = '';
        if (j == getSetting('colors', type) && custom == 1)
            _class = ' class="current"';
        output += '<li' + _class + ' data-id="' + j + '" style="background:' + c[j] + ';"></li>\r\n';
    }
    return output;
}
function changeColorsHandler() {
    hideFontChangeList();
    if (colorsBox.style.display == 'block') {
        setSetting(0, 'customColors');
        setSetting(-1, 'colors', 'font');
        setSetting(-1, 'colors', 'bg');
        hideCustomColors(true);
    }
    else {
        showCustomColors();
    }
    LitresSettingsWindow.UpdateHeight();
    storeSettings();
}
function setColor(type, color) {
    switch (type) {
        case "bg":
            changeCSS('.content-box, #zoomedImg, .FBReaderNotesDiv', 'background-color', color + ';');
            break;
        case "font":
            changeCSS('.content-box, #zoomedImg', 'color', color + ';');
            break;
        case "font-footer":
            changeCSS('.footer-info', 'color', color + ';');
            break;
        case "footerbox":
            changeCSS('#footer', 'background', color + ';');
            break;
    }
}
function colorListActionHandler(e) {
    var target = (e.target || e.srcElement);
    var type = 'bg';
    if (target.parentNode.getAttribute('id') == 'color-font') {
        type = 'font';
    }
    clearCurrentColor(doc.querySelectorAll('#color-' + type + ' li'));
    // addClass(target, 'current');
    setSetting(parseInt(target.getAttribute('data-id')), 'colors', type);
    if (type === 'font') {
        setCustomFontColor(true);
    }
    else {
        setCustomBackgroundColor(true);
    }
    storeSettings();
}
function colorListSetHandlers() {
    var colorListAction = settingsBox.querySelectorAll('#color-box li');
    for (var j = 0; j < colorListAction.length; j++)
        colorListAction[j].addEventListener('click', colorListActionHandler, false);
}
function setCustomFontColor(clicked) {
    setSetting(1, 'customColors');
    setColor('font', colors_def['font'][getSetting('colors', 'font')]);
    if (clicked) {
        addClass(doc
            .querySelector('#color-font li[data-id="' + getSetting('colors', 'font') + '"]'), 'current');
    }
}
function setCustomBackgroundColor(clicked) {
    setSetting(1, 'customColors');
    setUINightTheme(colors_def_night[getSetting('colors', 'bg')] ? true : false);
    setUINightTop(colors_def_night_top[getSetting('colors', 'bg')] ? true : false);
    setUINightLogo(colors_def_night[getSetting('colors', 'bg')] ? true : false);
    setColor('bg', colors_def['bg'][getSetting('colors', 'bg')]);
    setColor('footerbox', colors_def['bg'][getSetting('colors', 'bg')]);
    // цвет футера ставится взависимости от текущей цветовой схемы
    var themeColor = colors_def_night[getSetting('colors', 'bg')] ? 9 : 0;
    setColor('font-footer', theme_colors[themeColor][1]);
    if (clicked) {
        addClass(doc
            .querySelector('#color-bg li[data-id="' + getSetting('colors', 'bg') + '"]'), 'current');
    }
}
function clearCurrentColor(c) {
    for (var j = 0; j < c.length; j++)
        removeClass(c[j], 'current');
}
function showCustomColors() {
    addClass(themeBox, 'disabled-row');
    themeBar.toggleDisabled();
    colorsBox.style.display = 'block';
    if (!colorsList) {
        colorsBox.querySelector('#color-font').innerHTML = makeColorList('font');
        colorsBox.querySelector('#color-bg').innerHTML = makeColorList('bg');
        colorListSetHandlers();
    }
    if (getSetting('customColors') != 1) {
        var currentFont = colorsBox.querySelector('#color-font .current');
        if (currentFont)
            removeClass(currentFont, 'current');
        var currentBg = colorsBox.querySelector('#color-bg .current');
        if (currentBg)
            removeClass(currentBg, 'current');
    }
    colorsList = true;
}
function hideCustomColors(fromButton) {
    removeClass(themeBox, 'disabled-row');
    themeBar.toggleDisabled(true);
    setTheme();
    colorsBox.style.display = 'none';
    if (!fromButton) {
        colorButton.previousElementSibling.checked = false;
    }
}
/* set reader height */
var readerMarginBottom = 0;
var readerHeight = 0;
function calcHeight(skipColumnChange) {
    /*	alert('availHeight: ' + win.screen.availHeight + ', height: ' + win.screen.height + '\n' +
            'availWidth: ' + win.screen.availWidth + ', width: ' + win.screen.width + '\n' +
            'innerHeight: ' + win.innerHeight + ', innerWidth: ' + win.innerWidth + '\n' +
            'devicePixelRatio: ' + win.devicePixelRatio + ', orientation: ' + (<any> win).orientation);*/
    //	if (pda.state && pda.currentHeight == win.innerHeight) {
    //		return;
    //	}
    checkPDAorientation();
    if (!pda.state && win.innerWidth > 500) {
        addClass(doc.body, 'not-pda'); // workaround to fix pda hover (@media sucks)
    }
    if (getSetting('skipColumnChange') != 1) {
        if (win.innerWidth < 1024) {
            setSetting(1, 'columns');
        }
        else {
            setSetting(2, 'columns');
            setCurrentChecboxSettings('column-amount', getSetting('columns'));
        }
    }
    var top = doc.querySelector('.top-box');
    // для PDA поле текста делать до самого скроллбара
    var guiHeight;
    if (pda.state) {
        guiHeight = footerBoxProgressBar.offsetHeight + top.offsetHeight;
    }
    else {
        guiHeight = footerBox.offsetHeight + top.offsetHeight;
    }
    var viewportHeight = win.innerHeight;
    var readerMarginReal = calcReaderMargin();
    var readerMarginValue = Math.floor(readerMarginReal / 2);
    readerMarginBottom = Math.floor(readerMarginReal * 1.5);
    if (!LitresURLParser.Trial && pda.state && !aldebaran_or4) {
        //top.style.position = "absolute";
        guiHeight -= top.offsetHeight;
        changeCSS(".content-box", "top", "-40px");
        changeCSS('.pda #settings', 'top', '40px');
        changeCSS('#mask', 'top', '40px');
        changeCSS("#contents", "top", "40px");
        changeCSS("#bookmarks", "top", "40px");
    }
    readerMarginBottom = readerMarginBottom > footerBox.offsetHeight ? readerMarginBottom - footerBox.offsetHeight : 0;
    readerHeight = Math.floor(viewportHeight - guiHeight - readerMarginBottom - readerMarginValue) - 1;
    if (LitresURLParser.Iframe) {
        readerHeight -= doc.querySelector('#partnerLine').offsetHeight;
    }
    var marginString = readerMarginValue + 'px 0px ';
    readerBox.setAttribute('style', 'height:' + readerHeight + 'px; ' +
        'margin:' + marginString + readerMarginBottom + 'px;');
    // alert('readerHeight: ' + readerHeight);
    //changeCSS('#add-bookmark', 'left', readerMarginReal + 'px;');
    changeCSS('.FBReaderNotesDiv', 'margin', '0 ' + (readerMarginValue * 2) + 'px 0;');
    changeCSS('div.FB2readerPage div.FBReaderContentDiv', 'padding', readerMarginValue + 'px ' + (readerMarginValue * 2) + 'px 0.3em;');
    changeCSS('.bottom-arrows a', 'width', (readerMarginValue * 2) + 'px;');
    if (getSetting('readerMargin') > 2) {
        changeCSS('.bottom-arrows a', 'opacity', '0');
    }
    else {
        changeCSS('.bottom-arrows a', 'opacity', '.3');
    }
    if (start) {
        EventsSupport.AddNavArrows();
    }
    var windowsHeight = viewportHeight - top.offsetHeight;
    changeCSS('#mask', 'height', windowsHeight + 'px;');
    changeCSS('.LWindow', 'height', (windowsHeight - (pda.top_hidden && !LitresURLParser.Trial ? 40 : 0)) + 'px;');
    calcFontSize();
    calcNotesWidth();
    if (start && !skipColumnChange) {
        LitresReaderSite.HidePagerBox();
        if (AFB3Reader.NColumns != getSetting('columns'))
            changeColumnAmount();
    }
    changeReaderMargin();
    calcSettingsArrowPos();
    // scroll bottom...
    if (pda.state) {
        win.scrollTo(0, 0);
        pda.currentHeight = win.innerHeight;
    }
}
function calcSettingsArrowPos() {
    var settingsWinRect = doc.querySelector('#settings').getBoundingClientRect();
    var settingsButtonRect = doc.querySelector('.menu-settings').getBoundingClientRect();
    var realLeft = Math.floor(settingsButtonRect.left - settingsWinRect.left + 3);
    changeCSS('.settings:before', 'left', realLeft + 'px;');
}
function calcNotesWidth() {
    var readerMarginReal = calcReaderMargin();
    var columnAmount = getSetting('columns');
    changeCSS('.FBReaderNotesDiv', 'width', Math.floor((win.innerWidth - readerMarginReal * 2) / columnAmount - readerMarginReal) + 'px;');
}
function calcFontSize() {
    if (!getSetting('autoFontSize')) {
        setSetting(1, 'autoFontSize');
        if (getSetting('font')) {
            // nothing
        }
        else {
            var columnAmount = getSetting('columns');
            var textAreaMargin = calcReaderMargin();
            var textAreaWidth = win.innerWidth - (textAreaMargin + textAreaMargin * columnAmount);
            var newFont = Math.floor(textAreaWidth / columnAmount / pda.pixelRatio * 0.0265), newFontID = 0;
            if (newFont < autoMinFontSize) {
                newFont = autoMinFontSize;
            }
            for (var j = 0; j < fontSizeArray.length; j++) {
                if (newFont == fontSizeArray[j] || (newFont > fontSizeArray[j] && newFont < fontSizeArray[j + 1])) {
                    newFontID = j;
                    break;
                }
            }
            if (newFont > fontSizeArray[fontSizeArray.length - 1]) {
                newFontID = fontSizeArray.length - 1;
            }
            setSetting(newFontID, 'fontSize');
        }
    }
    setFontSize();
}
function checkFonts() {
    var isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if (isMac) {
        doc.querySelector('.font3').style.display = 'block';
        /*(<HTMLElement> doc.querySelector('.font-list .font7')).style.display = 'block';
         (<HTMLElement> doc.querySelector('.font-list .font10')).style.display = 'block';
         (<HTMLElement> doc.querySelector('.font-list .font11')).style.display = 'block';*/
    }
    else {
        var NTversion;
        var tmp = navigator.appVersion.match(/\(Windows\sNT\s(\d(.\d)?);/i); // all webkit and some
        if (tmp == null && navigator.oscpu) { // firefox
            tmp = navigator.oscpu.match(/\(?Windows\sNT\s(\d(.\d)?);/i);
        }
        if (tmp == null) { // stupid ie9 and maybe ie family
            var tmp = navigator.userAgent.match(/Windows\sNT\s(\d(.\d)?);/i);
        }
        if (tmp && tmp.length) {
            NTversion = tmp[1];
            if (parseInt(NTversion) > 5.1) {
                doc.querySelector('.font8').style.display = 'block';
                doc.querySelector('.font9').style.display = 'block';
            }
        }
    }
}
function checkOperaPrestoClick() {
    var opera = navigator.userAgent.match(/Opera/i);
    if (opera && opera.length) {
        var opera_version = navigator.userAgent.match(/(Opera\s?|Version)\/?(\d+\.\d+)/i);
        if (opera_version && opera_version.length) {
            if (parseInt(opera_version.pop()) < 13) {
                doc.querySelector('#enable-click').style.display = 'none';
                setSetting(1, 'enableClick');
            }
        }
    }
}
function setSettingsEvents() {
    document.querySelector('#close-settings div').addEventListener('click', function () {
        hideFontChangeList();
        LitresSettingsWindow.ButtonHandler();
        TopMenuObj.RemoveActive();
    }, false);
    columns.addEventListener('click', changeColumnAmountHangler, false);
    textAlignSwitch.addEventListener('click', changeTextAlignHandler, false);
    textHyph.addEventListener('click', changeHyphHandler, false);
    enableClick.addEventListener('click', changeEnableClickHandler, false);
    colorButton.addEventListener('click', changeColorsHandler, false);
    fontFamily.addEventListener('click', toggleFontFamilyHandler, false);
    fontChangeSetHandlers();
}
function checkPDAstate() {
    var ua = navigator.userAgent;
    // hack for testing, do not uncomment this
    // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0; Touch)';
    // alert(ua);
    if ((ua.match(/Windows NT/i) != null && ua.match(/Touch/i) != null && ua.match(/Tablet PC/i) == null) ||
        ua.match(/iPhone|Android|Windows Phone|iPad/i) != null ||
        (win.innerWidth <= 501 && win.innerHeight <= 700)) {
        // workaround to fix pda styles
        // set always PDA, even we get greater width then 500
        addClass(doc.body, 'pda');
        pda.state = true;
        var tmp;
        tmp = ua.match(/Windows Phone/i);
        if (tmp != null) {
            pda.platform = 'winphone';
            tmp = ua.match(/IEMobile\/(\d+\.\d+)/i);
            if (tmp != null) {
                pda.browser = 'ie';
            }
        }
        if (pda.platform == 'winphone') {
            // stupid M$, why you added "Anroid 4.0" and "iPhone" in userAgent?????
            return;
        }
        tmp = ua.match(/Windows NT/i);
        if (tmp != null && ua.match(/Touch/i)) {
            pda.platform = 'windows';
            pda.form = 'tablet';
        }
        tmp = ua.match(/Android (\d\.\d(\.\d)?)/i);
        if (tmp != null) {
            pda.platform = 'android';
            pda.version = tmp[1];
            pda.browser = 'browser';
            tmp = ua.match(/Chrome\/[.0-9]* Mobile/i);
            if (tmp != null) {
                pda.browser = 'chrome';
                tmp = ua.match(/Version\/\d\.\d/i);
                if (tmp != null) {
                    pda.browser = 'browser';
                }
            }
            else {
                tmp = ua.match(/Chrome\/[.0-9]*/i);
                if (tmp != null) {
                    pda.form = 'tablet';
                    pda.browser = 'chrome';
                }
            }
        }
        tmp = ua.match(/iPhone os (\d_\d(_\d)?)/i);
        if (tmp != null) {
            pda.platform = 'ios';
            pda.version = tmp[1].replace(/_/g, '.');
            pda.browser = ua.match(/CriOS/i) != null ? 'chrome' : '';
            if (ua.match(/Safari/i) && ua.match(/CriOS/i) == null) {
                pda.browser = 'safari';
            }
            if (ua.match(/YaBrowser\/[.0-9]* Mobile/i) != null) {
                pda.browser = 'yandex';
            }
        }
        tmp = ua.match(/iPad/i);
        if (tmp != null) {
            pda.platform = 'ios';
            pda.form = 'tablet';
        }
    }
    else {
        pda.state = false;
    }
}
function checkPDAorientation() {
    // pda.orientation = (<any> win).orientation;
    if (win.innerHeight < win.innerWidth) {
        pda.portrait = false;
    }
    else {
        pda.portrait = true;
    }
}
/* save, load, check settings */
function loadSettings() {
    if (!FB3PPCache.CheckStorageAvail()) {
        return;
    }
    var local = window.localStorage;
    var localStorageTmp = JSON.parse(local.getItem('or4Settings'));
    if (localStorageTmp != null) {
        settings = localStorageTmp;
        patchSettings(localStorageTmp);
    }
    for (var j in settings) {
        checkSetting(j, settings[j]);
        var val = settings[j];
        switch (j) {
            case "font": break;
            case "fontSize": break;
            case "autoFontSize": break;
            case "lineHeight": break;
            case "readerMargin": break;
            case "columns":
                if (val > 1) {
                    setCurrentChecboxSettings('column-amount', val);
                }
                break;
            case "textAlign":
                setCurrentChecboxSettings('text-justify', val);
                break;
            case "hyphOn":
                setCurrentChecboxSettings('text-hyph', val);
                break;
            case "enableClick":
                setCurrentChecboxSettings('enable-click', val);
                break;
            case "serverSync": break;
            case "customColors":
                setCurrentChecboxSettings('custom-color', val);
                break;
            case "theme": break;
        }
    }
    setSetting(defaultSettings.settings_version, 'settings_version');
}
function patchSettings(data) {
    if (!data.settings_version || data.settings_version != defaultSettings.settings_version) {
        if (!data.settings_version ||
            (data.settings_version < defaultSettings.settings_version && data.settings_version != '1.0')) {
            // first settings patch, after we have settings_version
            if (settings['lineHeight'] > 0)
                settings['lineHeight'] *= 2;
            if (settings['readerMargin'] > 0)
                settings['readerMargin'] *= 2;
        }
        if (data.settings_version < defaultSettings.settings_version && data.settings_version == '1.0') {
            // stupid realisation to save old settings
            var OldMarginValueReverse = { '4': '0', '3': '1', '2': '2', '1': '3', '0': '4' };
            settings['readerMargin'] = OldMarginValueReverse[settings['readerMargin']];
        }
    }
}
function checkSetting(index, val) {
    switch (index) {
        case "font":
            if (!fontList[val])
                settings[index] = defaultSettings[index];
            break;
        case "fontSize":
            if (!fontSizeArray[val])
                settings[index] = defaultSettings[index];
            break;
        case "lineHeight":
            if (!lineHeightList[val])
                settings[index] = defaultSettings[index];
            break;
        case "readerMargin":
            if (!marginList[val])
                settings[index] = defaultSettings[index];
            break;
        case "columns":
            if (val > 2 || val < 1)
                settings[index] = defaultSettings[index];
            break;
        case "textAlign":
        case "hyphOn":
        case "serverSync":
        case "enableClick":
            if (val > 1 || val < 0)
                settings[index] = defaultSettings[index];
            break;
        case "colors":
            if (!colors_def['bg'][val.bg])
                settings[index]['bg'] = defaultSettings[index]['bg'];
            if (!colors_def['font'][val.font])
                settings[index]['font'] = defaultSettings[index]['font'];
            break;
        case "theme":
            if (!theme_colors[val])
                settings[index] = defaultSettings[index];
            break;
    }
}
function getSetting(index, sub) {
    var val = settings[index] == undefined ? defaultSettings[index] : settings[index];
    return sub ? val[sub] : val;
}
function setSetting(val, index, sub) {
    if (sub)
        settings[index][sub] = val;
    else
        settings[index] = val;
}
function setCurrentSettings(id, val) {
    doc.querySelector('#' + id + ' input[value="' + val + '"]')
        .setAttribute('checked', 'checked');
}
function setCurrentChecboxSettings(id, val) {
    if (val) {
        doc.querySelector('#' + id + ' input').setAttribute('checked', 'checked');
    }
}
function setCurrentColorSettings(type, val) {
    if (val) {
        var typeButton = doc.querySelector('.color-selector button[data-type="' + type + '"]');
        var color_span = typeButton.querySelector('span');
        var color = colors_def[type][val];
        color_span.style.backgroundColor = color;
        if (color == '#fff' || color == 'rgb(255, 255, 255)') {
            color_span.style.border = '1px solid #c5c5c5';
        }
    }
}
function storeSettings() {
    if (FB3PPCache.CheckStorageAvail()) {
        var local = window.localStorage;
        local.setItem('or4Settings', JSON.stringify(settings));
    }
    if (start) {
        updateSiteKey();
    }
}
function updateSiteKey() {
    var key = getSetting('font') + ':' +
        getSetting('fontSize') + ':' +
        getSetting('lineHeight') + ':' +
        // getSetting('readerMargin') + ':' +
        calcReaderMargin().toFixed(2) + ':' +
        readerMarginBottom + ':' +
        readerHeight;
    // console.log(key);
    AFB3Reader.Site.Key = key;
}
function applySettings() {
    changeReaderMargin();
    changeTextAlign();
    changeFontFamily();
    setTheme();
    if (getSetting('customColors')) {
        if (getSetting('colors', 'bg') !== -1) {
            setCustomBackgroundColor();
        }
        if (getSetting('colors', 'font') !== -1) {
            setCustomFontColor();
        }
    }
}
function beforeInitApplySetting() {
    changeHyph();
    changeColumnAmount();
    updateSiteKey();
}
function applyReset() {
    storeSettings();
    if (start) {
        AFB3Reader.Reset();
        LitresReaderSite.HidePagerBox();
    }
}
