/// <reference path="SocialSharingHead.ts" />

module SocialSharing {
	export class SocialSharingClass implements ISocialSharingClass {
		public Caption: string;
		public Text: string;
		public Image: string;
		public Name: string;
		public URL: string;
		public Comment: string;
		public TextLimit: number;
		public UserName: string;
		public CallbackFinish;
		public CallbackBeforeClick;
		public AlertText: string;
		public ShareEvent: string;
		constructor (private ArtID: string,
								 public Parent: EventsModule.IEventActions,
								 FileID,
								 button) {
			this.TextLimit = 0;
			this.URL = 'http://www.litres.ru/' + this.ArtID;
			this.Caption = '';
			this.Name = '';
			this.FillBookData();
			this.MakeCoverURL(FileID);
			this.AlertText = 'Разрешите в браузере вплывающие окна!';
			this.CallbackFinish = () => {
				this.Parent.WindowsCarry.HideAllWindows();
			};
		}
		private MakeCoverURL(FileID: string) {
			// FileID = '09501201';
			this.Image = 'http://www.litres.ru/static/bookimages/' +
				FileID.substr(0, 2) + '/' +
				FileID.substr(2, 2) + '/' +
				FileID.substr(4, 2) + '/' +
				FileID + '.bin.dir/' + FileID + '.cover.jpg';
		}
		public CookText(text: string, textLimit?: number): string {
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
			} else if (output.match(/[?!\]\}\)]+$/)) {
				// nothing
			} else if (output.match(/[!?,;:‒–—―\[\(\{‐\-⁄„“«”‘’‹’'"]$/)) {
				output = output.slice(0, -1);
				output += '…';
			} else {
				output += '…';
			}
			output = '«' + output + '»';
			if (dot) {
				output += '.';
			}
			return output;
		}
		public CookComment(comment: string): string {
			var output = comment.replace(/<\/?p>/gi, '');
			return output;
		}
		public FillData(text: string, comment: string = ''): void {
			this.Text = text;
			this.Comment = comment;
		}
		private FillBookData() {
			if (!this.Parent.Reader.FB3DOM.MetaData) {
				setTimeout(() => this.FillBookData(), 10);
				return;
			}
			var Authors = this.Parent.Reader.FB3DOM.MetaData.Authors;
			var authorObj = Authors[0];

			this.Caption = '';
			if (authorObj) {
				if (authorObj.First && authorObj.Last) {
					this.Caption = authorObj.First + ' ' + authorObj.Last
				} else if (authorObj.Last) {
					this.Caption = authorObj.Last;
				}
			}

			if (Authors.length > 1) {
				this.Caption += ' др.';
			}
			this.Name = this.Parent.Reader.FB3DOM.MetaData.Title;
		}
		// TODO: understand this
		public CheckPopup(callback): void {
			setTimeout(() => {
				var pop = window.open('about:blank', 'popup_tester', 'height=1, width=1, modal=yes, alwaysRaised=yes');
				if (typeof pop === 'undefined' || !pop || pop.closed || pop.closed == undefined || pop == undefined) {
					alert(this.AlertText);
				} else {
					pop.close();
					callback();
				}
			}, 200);
		}
		public ShareInit(): void {}
		public ShareCallback(response?): void {
			if (this.CallbackFinish) {
				this.CallbackFinish();
			}
		}
		public LoginInit(): void {}
		public ShowLoading() {
			this.ToggleLoading('block');
		}
		public HideLoading() {
			this.ToggleLoading('none');
		}
		private ToggleLoading(state: string) {
			(<HTMLElement> document.querySelector('.tooltip-loading')).style.display = state;
		}
		public TrackShare() {
			_gaq.push([this.ShareEvent]);
			yaCounter2199583.reachGoal(this.ShareEvent);
		}
	}

 // Facebook Sharing
	export class FacebookSharing extends SocialSharingClass implements ISocialSharingClass {
		constructor (Art, Parent, BaseURL, button) {
			super(Art, Parent, BaseURL, button);
			this.ShareEvent = 'or4_socnet_share_fb';
			this.CallbackFinish = () => {
				this.HideLoading();
				this.Parent.WindowsCarry.HideAllWindows();
			};
			this.CallbackBeforeClick = () => this.ShowLoading();
			this.TextLimit = 1000;
			window.fbAsyncInit = function () {
				// for test ID 1425469670876826 can be used (148369558555542 for release)
				FB.init({
					appId      : '148369558555542',
					xfbml      : true,
					version    : 'v2.9',
					status     : true
				});
			};
			(function (d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) { return; }
				js = d.createElement(s);
				js.id = id;
				js.src = "//connect.facebook.net/ru_RU/sdk.js";
				fjs.parentNode.insertBefore(js, fjs);
			} (document, 'script', 'facebook-jssdk'));
		}
		private MakeShareData() {
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
		}
		private ShareDialog() {
			let MakeShareDataInstance = this.MakeShareData();
			FB.ui({
	  			method: 'share',
				href: MakeShareDataInstance.link,
	  			quote: MakeShareDataInstance.message,
				display: 'popup'
			}, (response) => this.ShareCallback(response));
			this.TrackShare();
		}
		private FacebookLogin() {
			FB.getLoginStatus((response) => {
				if (response.status === 'connected') { // connected with AppID
					this.FacebookLoginCallback(response);
				} else {
					FB.login((response) => this.FacebookLoginCallback(response));
				}
			});
		}
		private FacebookLoginCallback(response) {
			if (response.authResponse) {
				this.ShareDialog();
			} else {
				if (this.CallbackFinish) {
					this.CallbackFinish();
				}
			}
		}
		public ShareInit(): void {
			this.CallbackBeforeClick();
			this.FacebookLogin();
		}
	}

	// declare var twttr: any;

	export class TwitterSharing extends SocialSharingClass implements ISocialSharingClass {
		private popupCount;
		constructor (Art, Parent, BaseURL, button) {
			super(Art, Parent, BaseURL, button);
			this.ShareEvent = 'or4_socnet_share_tw';
			this.popupCount = 0;
			this.TextLimit = 190;
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
			window.addEventListener('message', (event) => {
				if (event && /twitter\.com/ig.test(event.origin)) {
					if (event.data == "__ready__") {
						this.popupCount++;
						if (this.popupCount > 1) {
							this.popupCount = 0;
							this.ShareCallback();
						}
					}
				}
			}, false);
		}
		private ShareDialog() {
			var text = encodeURIComponent(this.Text + (this.Text != '' && this.Comment != '' ? '\r\n' : '') + this.Comment);
			var url = encodeURIComponent(this.URL);
			var top = window.innerHeight / 2 - 225;
			var left = window.innerWidth / 2 - 275;
			var shareWindow = window.open('http://twitter.com/intent/tweet?url=' + url + '&text=' + text + '&',
				'twitterwindow', 'height=450, width=550, top=' + top + ', left=' + left +
					', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
            if (window.focus) {shareWindow.focus();}
            this.TwtterShareCallback();
			this.TrackShare();
		}
		public ShareInit(): void {
			this.CheckPopup(() => {
				this.ShareDialog();
			});
		}
        private TwtterShareCallback() {
			if (this.CallbackFinish) {
				this.CallbackFinish();
			}
        }
	}

	export class VkontakteSharing extends SocialSharingClass implements ISocialSharingClass {
		private UserID: string;
		constructor (Art, Parent, BaseURL, button) {
			super(Art, Parent, BaseURL, button);
			this.ShareEvent = 'or4_socnet_share_vk';
			this.TextLimit = 720;
			(<any> window).vkAsyncInit = function () {
				// use 6110739 for test (for release 2243292)
				VK.init({
					apiId: '2243292'
				});
			};
			(function (d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) { return; }
				js = d.createElement(s);
				js.id = id;
				js.src = "//vk.com/js/api/openapi.js";
				fjs.parentNode.insertBefore(js, fjs);
			} (document, 'script', 'vk_api'));
		}
		private MakeShareData() {
			return {
				owner_id: this.UserID,
				attachments: this.URL,
				message: this.Text + (this.Text != '' && this.Comment != '' ? '\r\n' : '') + this.Comment,
				v: 5.73
				// attachments: 'photo' + this.UserID + this.Image + '', this.URL
			};
		}
		private ShareDialog() {
			/*
			VK.Api.call('photos.getWallUploadServer', { group_id: this.UserID }, (response) => {
				this.SendCover2VK(response.response.upload_url, 'post', 'photo=' + this.Image);
			}, (e) => this.VKApiErrorHandler(e));
			return;
			*/
			VK.Api.call(
				'wall.post',
				this.MakeShareData(),
				(response) => this.ShareCallback(response),
				(e) => this.VKApiErrorHandler(e)
			);
			this.TrackShare();
		}
		private VkontaktekLogin() {
			VK.Auth.getLoginStatus((response) => {
				if (response.status === 'connected') { // connected with AppID
					this.VkontakteLoginCallback(response);
				} else {
					VK.Auth.login((response) => this.VkontakteLoginCallback(response), 8192 + 4);
				}
			}, true);
		}
		private VkontakteLoginCallback(response) {
			// got here when mozzila blocked this popup
			// TODO: fix somehow!
			if (response.status == 'unknown') {
				if (this.CallbackFinish) {
					this.CallbackFinish();
				}
			} else {
				this.UserID = response.session.mid;
				this.CheckPermissions(response);
			}
		}
		private CheckPermissions(response) {
			if (response && response.status === 'unknown') {
				if (this.CallbackFinish) {
					this.CallbackFinish();
				}
				return;
			}
			VK.Api.call(
				'account.getAppPermissions',
				{ user_id: this.UserID, v: 5.73 },
				(response) => this.CheckPermissionsCallback(response),
				(e) => this.VKApiErrorHandler(e)
			);
		}
		private CheckPermissionsCallback(response) {
			// TODO: check premissions
			this.ShareDialog();
		}
		private VKApiErrorHandler(e) {
		}
		public ShareInit(): void {
			this.CheckPopup(() => {
				// this.CallbackBeforeClick();
				this.VkontaktekLogin();
			});
		}
	}
}
