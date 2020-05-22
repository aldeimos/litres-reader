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
var IFrame;
(function (IFrame_1) {
    /**
     * Класс организует показ фрейма в читалке
     */
    var IFrame = /** @class */ (function () {
        function IFrame(URL, Name) {
            this.URL = URL;
            this.Name = Name;
            this.ClassName = 'iframe';
            this.OverlayClass = 'iframe-overlay';
            this.MaskedClass = 'iframe-masked';
            this.IconWrapperClass = 'icon-wrapper';
            this.LoaderHTML = "\n            <svg class=\"loader-icon\" width=\"40px\" height=\"40px\" viewBox=\"0 0 20 20\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n                <g stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n                    <g transform=\"translate(-691.000000, -331.000000)\">\n                        <g transform=\"translate(282.000000, 231.000000)\">\n                            <g transform=\"translate(409.000000, 100.000000)\">\n                                <path d=\"M10,20 C4.4771525,20 0,15.5228475 0,10 C0,4.4771525 4.4771525,0 10,0 C15.5228475,0 20,4.4771525 20,10 C20,15.5228475 15.5228475,20 10,20 Z M10,18 C14.418278,18 18,14.418278 18,10 C18,5.581722 14.418278,2 10,2 C5.581722,2 2,5.581722 2,10 C2,14.418278 5.581722,18 10,18 Z\"\n                                    fill-opacity=\"0.101619112\" fill=\"#000000\" fill-rule=\"nonzero\"></path>\n                                <path d=\"M19,10 C19,5.02943725 14.9705627,1 10,1\" stroke=\"#FFFFFF\" stroke-width=\"2\" stroke-linecap=\"round\"></path>\n                            </g>\n                        </g>\n                    </g>\n                </g>\n            </svg>\n        ";
            this.Width = 460;
            this.Height = 190;
            this.OnShowCallbackCustom = function () { }; // коллбэк, который вызывается при показе фрейма (устанавливается вне класса по желанию)
            this.OnLoadCallbackCustom = function () { }; // коллбэк, который вызывается при загрузке фрейма (устанавливается вне класса по желанию)
            this.Hidden = true;
            this.UserID = 0;
            this.isOverlayEnabled = true;
            this.IsLoaded = false;
            this.IsLoading = false;
            this.IsFullWidth = false;
            this.IsFullHeight = false;
            this.HasBorder = false;
            this.El = document.createElement('iframe');
            this.El.name = Name;
            this.OverlayEl = this.CreateOverlay();
            this.LoaderEl = document.createElement('div');
            this.LoaderEl.className = this.IconWrapperClass;
            this.LoaderEl.innerHTML = this.LoaderHTML;
            this.PrimaryURL = window.location.origin + URL;
        }
        IFrame.prototype.onHideCallback = function () {
            this.Hide();
        };
        /**
         * Покажет фрейм
         */
        IFrame.prototype.Show = function () {
            var _this = this;
            var El = this.El;
            this.Hidden = false;
            El.className = this.ClassName;
            if (!this.HasBorder) {
                El.setAttribute('frameborder', '0');
            }
            if (this.isOverlayEnabled) {
                this.ShowOverlay(!this.IsLoaded);
            }
            if (!this.IsLoaded) {
                this.Load(function () {
                    _this.OnShowCallback(El);
                });
            }
            else {
                this.OnShowCallback(El);
            }
        };
        /**
         * Сделает фрейм на всю ширину или длину, если такие опции были указаны
         */
        IFrame.prototype.ApplyFullScreenOptions = function () {
            var El = this.El;
            if (!this.IsFullWidth) {
                El.width = this.Width + 'px';
            }
            else {
                El.width = '100%';
            }
            if (!this.IsFullHeight) {
                El.height = this.Height + 'px';
            }
            else {
                El.height = '100%';
            }
        };
        /**
         * Загрузит фрейм с соответсвующего ресурса
         * @param {Function} successCallback - функция, которая будет вызвана по оканчании загрузки фрейма
         */
        IFrame.prototype.Load = function (successCallback) {
            var _this = this;
            if (successCallback === void 0) { successCallback = function () { }; }
            if (this.IsLoaded) {
                return;
            }
            this.IsLoading = true;
            var El = this.El;
            El.src = this.URL;
            El.addEventListener('load', function () {
                _this.IsLoading = false;
                _this.IsLoaded = true;
                successCallback();
                _this.OnLoadCallback(El);
                _this.OnLoadCallbackCustom();
            });
            document.body.appendChild(El);
        };
        /**
         * Спрячет фрейм, скроет фоновое затеменение
         */
        IFrame.prototype.Hide = function () {
            this.El.width = '0';
            this.El.height = '0';
            this.El.style.transition = 'none';
            this.Hidden = true;
            if (this.isOverlayEnabled) {
                this.HideOverlay();
            }
        };
        /**
         * Установит попап горизонтально по центру и с выборочным вертикальным положением
         * @param {string} verticalPos - 'center', 'bottom', 'bottom-hidden'
         */
        IFrame.prototype.SetPosition = function (verticalPos) {
            var El = this.El, IframeStyle = getComputedStyle(El);
            El.style.position = 'absolute';
            // в зависимости от настроек ровням по центру или же делаем на весь экран
            if (!this.IsFullWidth) {
                El.style.left = '50%';
                El.style.marginLeft = -1 * parseFloat(IframeStyle.width) / 2 + 'px';
            }
            if (verticalPos == 'center') {
                El.style.top = '50%';
                El.style.marginTop = (-1) * parseFloat(IframeStyle.height) / 2 + 'px';
            }
            else if (verticalPos == 'top') {
                El.style.top = '0';
                El.style.marginTop = '0';
            }
            else if (verticalPos == 'bottom') {
                El.style.top = '100%';
                El.style.marginTop = (-1) * parseFloat(IframeStyle.height) + 'px';
            }
            else if (verticalPos == 'bottom-hidden') {
                El.style.top = '100%';
                El.style.marginTop = '0';
            }
        };
        /**
         * Покажет фоновое затемнение
         * @param {boolean} IsLoading - показывать ли индикатор загрузки вместе с фоновым затемнением
         */
        IFrame.prototype.ShowOverlay = function (IsLoading) {
            if (IsLoading === void 0) { IsLoading = false; }
            if (IsLoading) {
                this.ShowLoading();
            }
            if (!document.body.classList.contains(this.MaskedClass)) {
                document.body.classList.add(this.MaskedClass);
                document.body.appendChild(this.OverlayEl);
                this.OverlayEl.style.display = 'block';
            }
        };
        /**
         * Скорет фоновое затемнение
         */
        IFrame.prototype.HideOverlay = function () {
            this.HideLoading();
            if (document.body.classList.contains(this.MaskedClass)) {
                document.body.classList.remove(this.MaskedClass);
                this.OverlayEl.style.display = 'none';
            }
        };
        /**
         * Покажет индикатор загрузки (крутящийся кружочек)
         */
        IFrame.prototype.ShowLoading = function () {
            this.OverlayEl.appendChild(this.LoaderEl);
            this.LoaderEl.style.display = 'block';
        };
        /**
         * Скорет индикатор загрузки
         */
        IFrame.prototype.HideLoading = function () {
            this.LoaderEl.style.display = 'none';
        };
        /**
         * Метод, который вызывается при показе фрейма (сделано для перезаписи дочерними классами)
         * @param El - элемент фрейма
         */
        IFrame.prototype.OnShowCallback = function (El) {
            this.HideLoading();
            this.ApplyFullScreenOptions();
            this.SetPosition('center');
            this.OnShowCallbackCustom(El);
        };
        /**
         * Метод, который вызывается при загрузке фрейма (сделано для перезаписи дочерними классами)
         * @param El - элемент фрейма
         */
        IFrame.prototype.OnLoadCallback = function (El) { };
        /**
         * Создаст необходимые элементы для фонового затемнения и проставит стили
         * @returns {HTMLElement} - элемент фонового затемнения
         */
        IFrame.prototype.CreateOverlay = function () {
            var OverlayEl = this.OverlayEl;
            if (!this.OverlayEl) {
                OverlayEl = document.createElement('div');
                OverlayEl.className = this.OverlayClass;
            }
            return OverlayEl;
        };
        IFrame.Count = 0;
        return IFrame;
    }());
    IFrame_1.IFrame = IFrame;
    /**
     * Наследуемый от IFrame класс организует показ фрейма авторизации в читалке
     */
    var AuthorizeIFrame = /** @class */ (function (_super) {
        __extends(AuthorizeIFrame, _super);
        function AuthorizeIFrame() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Обновит текущее значение прочитанного процента книги для данного экземпляра класса
         * @param {number} Percent - текущее значение прочитанного процента книги
         */
        AuthorizeIFrame.prototype.SetPercent = function (Percent) {
            this.Percent = Percent;
        };
        /**
         * Статический метод, который вызывается при инициализации авторизации и отправляет данные в метрику
         */
        AuthorizeIFrame.onInitAuth = function () {
            typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_auth_start');
        };
        /**
         * Статический метод, который вызывается при успешной регистрации и обновляет состояние страницы
         */
        AuthorizeIFrame.onRegistrationCallback = function () {
            window.history.pushState({}, '', '?' + LitresURLParser.insertParam(window.location.search, 'or_auth_reg', 1));
        };
        /**
         * Метод, вызывающийся после нажатия на кнопку "Купить" и отправляющий соответствующие метрики
         * @param btn - элемент кнопки
         * @param {string} href - ссылка для редиректа
         */
        AuthorizeIFrame.prototype.onBtnBuyClick = function (btn, href) {
            typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_buy_start');
            if (this.Percent < 50) {
                typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_buy_1st');
            }
            else {
                typeof yaCounter2199583 !== 'undefined' && yaCounter2199583.reachGoal('or_buy_2nd');
            }
            window.location.href = href;
        };
        /**
         * Метод (перезаписанный с родителя), который вызывается при загрузке попапа и биндит необходимые методы
         * @param El - элемент фрейма
         */
        AuthorizeIFrame.prototype.OnLoadCallback = function (El) {
            if (this.IsLoaded) {
                El.contentWindow.onHideCallback = this.onHideCallback.bind(this);
                El.contentWindow.onInitAuth = AuthorizeIFrame.onInitAuth.bind(this);
                El.contentWindow.onRegistrationCallback = AuthorizeIFrame.onRegistrationCallback.bind(this);
                El.contentWindow.onBtnBuyClick = this.onBtnBuyClick.bind(this);
            }
        };
        return AuthorizeIFrame;
    }(IFrame));
    IFrame_1.AuthorizeIFrame = AuthorizeIFrame;
})(IFrame || (IFrame = {}));
