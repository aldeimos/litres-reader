/// <reference path="HTMLPopupHead.ts" />
var HTMLPopup;
(function (HTMLPopup_1) {
    var HTMLPopup = /** @class */ (function () {
        function HTMLPopup(Owner) {
            this.Owner = Owner;
            this.ButtonClass = [];
            this.Hidden = true;
            this.ReaderEl = doc.querySelector('#reader');
            this.El = document.querySelector('#popup');
            this.Owner.WindowsCarry.RegisterWindow(this);
        }
        HTMLPopup.prototype.Show = function (target, contents) {
            this.Owner.WindowsCarry.HideAllWindows(true);
            this.Owner.Mask.Show('0');
            this.El.querySelector('.popup-contents').innerHTML = contents;
            this.El.style.display = 'block';
            this.Reposition(target);
            this.Hidden = false;
        };
        HTMLPopup.prototype.Hide = function () {
            this.El.style.display = 'none';
            this.Hidden = true;
        };
        HTMLPopup.prototype.HideWindow = function () {
            this.Hide();
        };
        HTMLPopup.prototype.Reposition = function (target) {
            if (target) {
                var rect = target.getBoundingClientRect(), mainRect = this.ReaderEl.getBoundingClientRect();
                var left = rect.left, top = rect.top;
                this.El.style.left = left + target.offsetWidth / 2 - this.El.offsetWidth / 2 + 'px';
                // TODO: Dynamically apply half of triangle width
                this.El.style.top = top + target.offsetHeight + 6 + 'px';
            }
        };
        return HTMLPopup;
    }());
    HTMLPopup_1.HTMLPopup = HTMLPopup;
})(HTMLPopup || (HTMLPopup = {}));
