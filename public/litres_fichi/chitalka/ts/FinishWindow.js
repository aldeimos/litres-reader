/// <reference path="FinishWindowHead.ts" />
var Finish;
(function (Finish) {
    var FinishWindow = /** @class */ (function () {
        function FinishWindow(Obj, Parent) {
            this.Obj = Obj;
            this.Parent = Parent;
            this.ShowState = false;
            this.AddHandlers();
        }
        FinishWindow.prototype.AddHandlers = function () {
            var _this = this;
            this.Obj.addEventListener('click', function (e) {
                if (e.target == _this.Obj) {
                    _this.HideWindow();
                    TopMenuObj.RemoveActive();
                }
            }, false);
            this.Obj.querySelector(".finish-icon-close").addEventListener("click", function (e) {
                _this.HideWindow();
                TopMenuObj.RemoveActive();
            });
        };
        FinishWindow.prototype.ButtonHandler = function () {
            if (!this.ShowState) {
                this.ShowWindow();
            }
            else {
                this.HideWindow();
            }
        };
        FinishWindow.prototype.ShowWindow = function () {
            var TrialButton = document.querySelector('.finish-buy-button');
            TrialButton.innerHTML = this.ShowTrialEnd("finish-button");
            if (TrialButton.innerHTML == "") {
                return;
            }
            this.ShowState = true;
            this.ToggleWindow('block');
            this.Parent.ZoomObj.ZoomAnything(this.Obj);
            addTrialHandlers(TrialButton.querySelector('.trial-button'));
            var fileIdNumbers = LitresURLParser.FileID.split("");
            while (fileIdNumbers.length > 8) {
                fileIdNumbers.shift();
            }
            if (fileIdNumbers.length >= 7) {
                var orHost = aldebaran_or4 ? '//be2.aldebaran.ru' : '//www.litres.ru';
                changeCSS(".finish-cover-block", "background", "url(" + orHost + "/static/bookimages/" + fileIdNumbers[0] + fileIdNumbers[1] + "/" +
                    fileIdNumbers[2] + fileIdNumbers[3] + "/" + fileIdNumbers[4] + fileIdNumbers[5] + "/" + LitresURLParser.FileID + ".bin.dir/" +
                    LitresURLParser.FileID + ".cover_415.jpg) no-repeat center;");
                changeCSS(".finish-cover-block", "background-size", "contain");
            }
        };
        FinishWindow.prototype.ShowTrialEnd = function (ID) {
            if (LitresURLParser.PartID == 458582) {
                return '';
            }
            var trialBlockClass = '';
            if (!LitresURLParser.Trial) {
                return '';
            }
            var newWindow = LitresURLParser.Iframe ? 'target="_blank"' : '';
            return '<div id="' + ID + '"' + trialBlockClass + ' style="margin-top:9px;">' +
                '<a id="' + ID + '_1_2" href="" class="litreslink noload trial-button" ' + newWindow + '>' + textTrialButton() + '</a>' +
                '</div>';
        };
        FinishWindow.prototype.HideWindow = function () {
            this.ToggleWindow('none');
            this.ShowState = false;
        };
        FinishWindow.prototype.ToggleWindow = function (state) {
            changeCSS(".finish-buy-box", "display", state);
        };
        return FinishWindow;
    }());
    Finish.FinishWindow = FinishWindow;
})(Finish || (Finish = {}));
