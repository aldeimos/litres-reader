/// <reference path="SocialSharingHead.ts" />
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
var SocialSharing;
(function (SocialSharing) {
    var SocialSharingClass = /** @class */ (function () {
        function SocialSharingClass(ArtID, Parent, FileID, button) {
            var _this = this;
            this.ArtID = ArtID;
            this.Parent = Parent;
            this.TextLimit = 0;
            this.URL = 'http://www.litres.ru/' + this.ArtID;
            this.Caption = '';
            this.Name = '';
            this.FillBookData();
            this.MakeCoverURL(FileID);
            this.AlertText = 'Разрешите в браузере вплывающие окна!';
            this.CallbackFinish = function () {
                _this.Parent.WindowsCarry.HideAllWindows();
            };
        }
        SocialSharingClass.prototype.MakeCoverURL = function (FileID) {
            // FileID = '09501201';
            this.Image = 'http://www.litres.ru/static/bookimages/' +
                FileID.substr(0, 2) + '/' +
                FileID.substr(2, 2) + '/' +
                FileID.substr(4, 2) + '/' +
                FileID + '.bin.dir/' + FileID + '.cover.jpg';
        };
        SocialSharingClass.prototype.CookText = function (text, textLimit) {
            var output = text.replace(/<\/?p>/gi, '');
            if (output.match(/[“”]/) == null || !output.match(/[“”]/).length) {
                output = output.replace(/«/g, '“').replace(/»/g, '”');
            }
            /*
            var textLimit = textLimit || this.TextLimit || 0;
            if (textLimit && output.length > textLimit) {
                output = output.substr(0, textLimit) + '…';
            }
            */
            output = output.replace(/\[(\/)?b[^\]]*\]/gi, '');
            output = output.replace(/\[(\/)?i[^\]]*\]/gi, '');
            var dot = false;
            if (output.match(/\.$/)) {
                output = output.replace(/\.$/, '');
                dot = true;
            }
            else if (output.match(/[?!\]\}\)]+$/)) {
                // nothing
            }
            else if (output.match(/[!?,;:‒–—―\[\(\{‐\-⁄„“«”‘’‹’'"]$/)) {
                output = output.slice(0, -1);
                output += '…';
            }
            else {
                output += '…';
            }
            output = '«' + output + '»';
            if (dot) {
                output += '.';
            }
            return output;
        };
        SocialSharingClass.prototype.CookComment = function (comment) {
            var output = comment.replace(/<\/?p>/gi, '');
            return output;
        };
        SocialSharingClass.prototype.FillData = function (text, comment) {
            if (comment === void 0) { comment = ''; }
            this.Text = text;
            this.Comment = comment;
        };
        SocialSharingClass.prototype.FillBookData = function () {
            var _this = this;
            if (!this.Parent.Reader.FB3DOM.MetaData) {
                setTimeout(function () { return _this.FillBookData(); }, 10);
                return;
            }
            var Authors = this.Parent.Reader.FB3DOM.MetaData.Authors;
            var authorObj = Authors[0];
            this.Caption = '';
            if (authorObj) {
                if (authorObj.First && authorObj.Last) {
                    this.Caption = authorObj.First + ' ' + authorObj.Last;
                }
                else if (authorObj.Last) {
                    this.Caption = authorObj.Last;
                }
            }
            if (Authors.length > 1) {
                this.Caption += ' др.';
            }
            this.Name = this.Parent.Reader.FB3DOM.MetaData.Title;
        };
        // TODO: understand this
        SocialSharingClass.prototype.CheckPopup = function (callback) {
            var _this = this;
            setTimeout(function () {
                var pop = window.open('about:blank', 'popup_tester', 'height=1, width=1, modal=yes, alwaysRaised=yes');
                if (typeof pop === 'undefined' || !pop || pop.closed || pop.closed == undefined || pop == undefined) {
                    alert(_this.AlertText);
                }
                else {
                    pop.close();
                    callback();
                }
            }, 200);
        };
        SocialSharingClass.prototype.ShareInit = function () { };
        SocialSharingClass.prototype.ShareCallback = function (response) {
            if (this.CallbackFinish) {
                this.CallbackFinish();
            }
        };
        SocialSharingClass.prototype.LoginInit = function () { };
        SocialSharingClass.prototype.ShowLoading = function () {
            this.ToggleLoading('block');
        };
        SocialSharingClass.prototype.HideLoading = function () {
            this.ToggleLoading('none');
        };
        SocialSharingClass.prototype.ToggleLoading = function (state) {
            document.querySelector('.tooltip-loading').style.display = state;
        };
        SocialSharingClass.prototype.TrackShare = function () {
            _gaq.push([this.ShareEvent]);
            yaCounter2199583.reachGoal(this.ShareEvent);
        };
        return SocialSharingClass;
    }());
    SocialSharing.SocialSharingClass = SocialSharingClass;
    // Facebook Sharing
    var FacebookSharing = /** @class */ (function (_super) {
        __extends(FacebookSharing, _super);
        function FacebookSharing(Art, Parent, BaseURL, button) {
            var _this = _super.call(this, Art, Parent, BaseURL, button) || this;
            _this.ShareEvent = 'or4_socnet_share_fb';
            _this.CallbackFinish = function () {
                _this.HideLoading();
                _this.Parent.WindowsCarry.HideAllWindows();
            };
            _this.CallbackBeforeClick = function () { return _this.ShowLoading(); };
            _this.TextLimit = 1000;
            window.fbAsyncInit = function () {
                // for test ID 1425469670876826 can be used (148369558555542 for release)
                FB.init({
                    appId: '148369558555542',
                    xfbml: true,
                    version: 'v2.9',
                    status: true
                });
            };
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/ru_RU/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
            return _this;
        }
        FacebookSharing.prototype.MakeShareData = function () {
            return {
                message: this.Text + (this.Text != '' && this.Comment != '' ? '\r\n' : '') + this.Comment,
                description: this.Caption,
                name: this.Name,
                picture: this.Image,
                link: this.URL,
                actions: {
                    name: 'Читать',
                    link: this.URL
                },
                privacy: {
                    value: 'EVERYONE'
                }
            };
        };
        FacebookSharing.prototype.ShareDialog = function () {
            var _this = this;
            var MakeShareDataInstance = this.MakeShareData();
            FB.ui({
                method: 'share',
                href: MakeShareDataInstance.link,
                quote: MakeShareDataInstance.message,
                display: 'popup'
            }, function (response) { return _this.ShareCallback(response); });
            this.TrackShare();
        };
        FacebookSharing.prototype.FacebookLogin = function () {
            var _this = this;
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') { // connected with AppID
                    _this.FacebookLoginCallback(response);
                }
                else {
                    FB.login(function (response) { return _this.FacebookLoginCallback(response); });
                }
            });
        };
        FacebookSharing.prototype.FacebookLoginCallback = function (response) {
            if (response.authResponse) {
                this.ShareDialog();
            }
            else {
                if (this.CallbackFinish) {
                    this.CallbackFinish();
                }
            }
        };
        FacebookSharing.prototype.ShareInit = function () {
            this.CallbackBeforeClick();
            this.FacebookLogin();
        };
        return FacebookSharing;
    }(SocialSharingClass));
    SocialSharing.FacebookSharing = FacebookSharing;
    // declare var twttr: any;
    var TwitterSharing = /** @class */ (function (_super) {
        __extends(TwitterSharing, _super);
        function TwitterSharing(Art, Parent, BaseURL, button) {
            var _this = _super.call(this, Art, Parent, BaseURL, button) || this;
            _this.ShareEvent = 'or4_socnet_share_tw';
            _this.popupCount = 0;
            _this.TextLimit = 190;
            //			window.twttr = (function (d, s, id) {
            //				var t, js, fjs = d.getElementsByTagName(s)[0];
            //				if (d.getElementById(id)) { return; }
            //				js = d.createElement(s);
            //				js.id = id;
            //				js.src = "//platform.twitter.com/widgets.js";
            //				fjs.parentNode.insertBefore(js, fjs);
            //				return window.twttr || (t = {_e: [], ready: function (f) { t._e.push(f); }})
            //			} (document, 'script', 'twitter-wjs'));
            //			twttr.ready(function (twttr) {
            //				console.log('Twitter SDK loaded');
            //				twttr.events.bind('tweet', function (event) {
            //					console.log('tweeter');
            //					alert('tweeted');
            //				});
            //			});
            window.addEventListener('message', function (event) {
                if (event && /twitter\.com/ig.test(event.origin)) {
                    if (event.data == "__ready__") {
                        _this.popupCount++;
                        if (_this.popupCount > 1) {
                            _this.popupCount = 0;
                            _this.ShareCallback();
                        }
                    }
                }
            }, false);
            return _this;
        }
        TwitterSharing.prototype.ShareDialog = function () {
            var text = encodeURIComponent(this.Text + (this.Text != '' && this.Comment != '' ? '\r\n' : '') + this.Comment);
            var url = encodeURIComponent(this.URL);
            var top = window.innerHeight / 2 - 225;
            var left = window.innerWidth / 2 - 275;
            var shareWindow = window.open('http://twitter.com/intent/tweet?url=' + url + '&text=' + text + '&', 'twitterwindow', 'height=450, width=550, top=' + top + ', left=' + left +
                ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
            if (window.focus) {
                shareWindow.focus();
            }
            this.TwtterShareCallback();
            this.TrackShare();
        };
        TwitterSharing.prototype.ShareInit = function () {
            var _this = this;
            this.CheckPopup(function () {
                _this.ShareDialog();
            });
        };
        TwitterSharing.prototype.TwtterShareCallback = function () {
            if (this.CallbackFinish) {
                this.CallbackFinish();
            }
        };
        return TwitterSharing;
    }(SocialSharingClass));
    SocialSharing.TwitterSharing = TwitterSharing;
    var VkontakteSharing = /** @class */ (function (_super) {
        __extends(VkontakteSharing, _super);
        function VkontakteSharing(Art, Parent, BaseURL, button) {
            var _this = _super.call(this, Art, Parent, BaseURL, button) || this;
            _this.ShareEvent = 'or4_socnet_share_vk';
            _this.TextLimit = 720;
            window.vkAsyncInit = function () {
                // use 6110739 for test (for release 2243292)
                VK.init({
                    apiId: '2243292'
                });
            };
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//vk.com/js/api/openapi.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'vk_api'));
            return _this;
        }
        VkontakteSharing.prototype.MakeShareData = function () {
            return {
                owner_id: this.UserID,
                attachments: this.URL,
                message: this.Text + (this.Text != '' && this.Comment != '' ? '\r\n' : '') + this.Comment,
                v: 5.73
                // attachments: 'photo' + this.UserID + this.Image + '', this.URL
            };
        };
        VkontakteSharing.prototype.ShareDialog = function () {
            var _this = this;
            /*
            VK.Api.call('photos.getWallUploadServer', { group_id: this.UserID }, (response) => {
                this.SendCover2VK(response.response.upload_url, 'post', 'photo=' + this.Image);
            }, (e) => this.VKApiErrorHandler(e));
            return;
            */
            VK.Api.call('wall.post', this.MakeShareData(), function (response) { return _this.ShareCallback(response); }, function (e) { return _this.VKApiErrorHandler(e); });
            this.TrackShare();
        };
        VkontakteSharing.prototype.VkontaktekLogin = function () {
            var _this = this;
            VK.Auth.getLoginStatus(function (response) {
                if (response.status === 'connected') { // connected with AppID
                    _this.VkontakteLoginCallback(response);
                }
                else {
                    VK.Auth.login(function (response) { return _this.VkontakteLoginCallback(response); }, 8192 + 4);
                }
            }, true);
        };
        VkontakteSharing.prototype.VkontakteLoginCallback = function (response) {
            // got here when mozzila blocked this popup
            // TODO: fix somehow!
            if (response.status == 'unknown') {
                if (this.CallbackFinish) {
                    this.CallbackFinish();
                }
            }
            else {
                this.UserID = response.session.mid;
                this.CheckPermissions(response);
            }
        };
        VkontakteSharing.prototype.CheckPermissions = function (response) {
            var _this = this;
            if (response && response.status === 'unknown') {
                if (this.CallbackFinish) {
                    this.CallbackFinish();
                }
                return;
            }
            VK.Api.call('account.getAppPermissions', { user_id: this.UserID, v: 5.73 }, function (response) { return _this.CheckPermissionsCallback(response); }, function (e) { return _this.VKApiErrorHandler(e); });
        };
        VkontakteSharing.prototype.CheckPermissionsCallback = function (response) {
            // TODO: check premissions
            this.ShareDialog();
        };
        VkontakteSharing.prototype.VKApiErrorHandler = function (e) {
        };
        VkontakteSharing.prototype.ShareInit = function () {
            var _this = this;
            this.CheckPopup(function () {
                // this.CallbackBeforeClick();
                _this.VkontaktekLogin();
            });
        };
        return VkontakteSharing;
    }(SocialSharingClass));
    SocialSharing.VkontakteSharing = VkontakteSharing;
})(SocialSharing || (SocialSharing = {}));
