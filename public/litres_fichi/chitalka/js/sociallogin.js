/*socnet*/
function getAction(obj){
	if (litres.user > 0) {
		obj.action = 'attach_socnet';
	} else {
		obj.pre_action = 'socnet';
	}
	return obj;
}

var SocNetInit = function (p){
    var T = this;
    this.services = new Object;

    this.push = function(s,p){
        if(!s) return false;
        T.services[s] = T.services[s] || {};
        T.services[s].el_id = p && p.el_id ? p.el_id : T.services[s].el_id || null;
        T.services[s].onLoad = T.services[s].onLoad || [];
        if (p){

            if (p.onLoad) T.services[s].onLoad.push(p.onLoad);
            if (p.InitCall) T.InitCall(s);
        }
        return T;
    };

    this.WaitLoadJS = function(src, target, waitme, func){
        var T = this;
        var e = document.createElement('script'); e.async = true;
        e.src = src;
        document.getElementById(target).appendChild(e);

        var dc = 0;
        var checker = function(){
            if (window[waitme] !== undefined){
                func.call();
            } else if(dc++ < 100) {
                setTimeout(function(){ checker.call(); },500);
            }
        };
        checker.call();
    };

    this.InitCall = function(s){

        if (T.services.fb && (!s || s == 'fb')){
            window.fbAsyncInit = function() {
                FB.init({appId: '148369558555542', status: true, cookie: true, xfbml: true});
                for (var i=0; i<T.services.fb.onLoad.length; i++) T.services.fb.onLoad[i].call();
            };
            var e = document.createElement('script'); e.async = true;
            e.src = document.location.protocol +
                '//connect.facebook.net/ru_RU/all.js';
            document.getElementById(T.services.fb.el_id || 'fb-root').appendChild(e);
        }
        if (T.services.vk && (!s || s == 'vk')){

            requirejs(['vk'], function(VK){
                VK.init({
                    apiId: 2243292,
                    onlyWidgets: true
                });

                for (var i=0; i<T.services.vk.onLoad.length; i++) T.services.vk.onLoad[i].call();
            });
        }

        if (T.services.tw && (!s || s == 'tw')){
            var el = document.createElement("script");
            el.type = "text/javascript";
            el.id = "twitter-wjs";
            el.onload = function(){
                for (var i=0; i<T.services.tw.onLoad.length; i++) T.services.tw.onLoad[i].call();
            };
            el.src = document.location.protocol+"//platform.twitter.com/widgets.js";
            el.async = true;
            document.getElementById(T.services.tw.el_id || 'tw_init').appendChild(el);
        }

		if (T.services.ma && (!s || s == 'ma')){
            T.WaitLoadJS(
                '//connect.mail.ru/js/loader.js',
                T.services.ma.el_id || 'ma_init',
                'mailru',
                function(){
                    mailru.loader.require('api', function() {
                        mailru.connect.init(611986, '8f071e6a8bb671e07673f19b21f9c755');
                    });
                    for (var i=0; i<T.services.ma.onLoad.length; i++) T.services.ma.onLoad[i].call();
                }
            );
        }

        if (T.services.ok && (!s || s == 'ok')){
            if(document.location.protocol=='https:') return;
            var el = document.createElement("link");
            el.rel = "stylesheet";
            el.href = "http://stg.odnoklassniki.ru/share/odkl_share.css";
            el.async = true;
            document.getElementById(T.services.ok.el_id || 'ok_init').appendChild(el);
            T.WaitLoadJS(
                'http://stg.odnoklassniki.ru/share/odkl_share.js',
                T.services.ok.el_id || 'ok_init',
                'ODKL',
                function(){
                    ODKL.init();
                    /*
                     mailru.loader.require('api', function() {
                     mailru.connect.init(611986, '8f071e6a8bb671e07673f19b21f9c755');
                     });
                     //*/
                    for (var i=0; i<T.services.ok.onLoad.length; i++) T.services.ok.onLoad[i].call();
                }
            );
        }

        if (T.services.fapi && (!s || s == 'fapi')){

            T.WaitLoadJS(
                document.location.protocol+"//api.ok.ru/js/fapi5.js",
                T.services.fapi.el_id || 'fapi_init',
                'FAPI',
                function() {
                    //	FAPI.litparam = Array();
                    //	FAPI.litparam.client_id = 1247812096;
                }
            );

        }
    };

    $(function() {
        for (var i in T.services) {
            T.InitCall(i);
        }
        SNLoadCheck();
	});
};

function SNLoadCheck() {
    if(typeof VK !="undefined" && typeof FB != "undefined")
        CheckSNGroups();
    else
        setTimeout('SNLoadCheck()',3000);
}

var SocNet = new SocNetInit();

function SNRedirect(params){
    var hash = window.location.hash;
    var href = window.location.toString();
    href = href.replace(hash, "" );

    var nh = new Array;
    var rgx = new Array;
    for (var p in params){
        rgx.push(p);
        nh.push(p +'='+ params[p]);
    }
    rgx = new RegExp('\\b('+rgx.join('|')+')=[^&]*&?', "gi");
    href = href.replace(rgx,'');
    if (nh.length > 0){
        href += (window.location.search ? /[&?]$/.test(href) ? '' : '&' : '?') + nh.join('&');
    }
    if (hash) {
        href += hash;
    }
	window.location.href = href;
}

/* [110917] Переделать вызов экшна attach_socnet на аякс2 */
function SNAjaxRedir(params) {
    CSRF.sendRequest({
        url: '/pages/ajax_empty2/',
        params: params,
        Method: 'post',
        OnData: function (data) {
            if (data.status == 'error') {
                alert(data.error_msg);
                return;
            }
            if (data.status == 'ok') {

                if (data.redirect) {
                    window.location.href = data.redirect.location;
                } else {
                    window.location.reload();
                }
            }
        },
        OnDataFail: function(data) {
            window.location.reload();
        }
    });
}

function FBLoginClick(perms){
    if (typeof(FB) == 'undefined') {
        socNetQuickLoad({
            name: "fb",
            onload: function () {
                FBLogin(perms);
            }
        });
    } else {
        FBLogin(perms);
    }
}

function FBLogin(perms) {
    FB.login(function(r) {
        if (r.authResponse) {
            SNAjaxRedir(getAction({socnet: 'fb', access_token: r.authResponse.accessToken, redirect_off: 1}));
        } else {
            //alert('Вы не зарегистрированы на facebook');
        }
    }, {'scope':perms});
}

function VKGetMail(href){
    if (!VK._apiId) {
      return false;
    }
	var rparam = ParseHref(href);
    VK.Auth.getLoginStatus(function(r) {
        if (r.session) {
            //console.log(rparam,r);
            var param = {socnet: 'vk', access_token: r.session.sid, uids: r.session.user.id, redirect_off: 1};
            if (rparam){
                param.access_token = rparam.access_token;
                param.email = rparam.email;
            }
            SNAjaxRedir(getAction(param));
            /* Пользователь успешно авторизовался */
            if (r.settings) {
                /* Выбранные настройки доступа пользователя, если они были запрошены */
            }
        } else {
            /* Пользователь нажал кнопку Отмена в окне авторизации */
            //alert('Вы не зарегистрированы vkontakte');
        }
    }, true);
}

function OKGetUser(href) {
	var rparam = ParseHref(href);
	if (!rparam.access_token) return;
    SNAjaxRedir(getAction({socnet: 'ok', access_token: rparam.access_token, session_secret_key: rparam.session_secret_key, redirect_off: 1}));
}

function ParseHref(href) {
		var rparam = new Object;
    if (href){
        var arr = href.split(/#/);
        if (arr && arr[1]){
            arr = arr[1].split(/&/);
            for (var i=0; i<arr.length; i++) {
                var p = arr[i].split(/=/);
                if (p.length > 1) rparam[p[0]] = p[1];
            }
        }
    }

	return rparam;
}

function VKLoginClick(perms) {
    if (typeof(VK) == 'undefined') {
        socNetQuickLoad({
            name: "vk",
            onload: function () {
                VKLogin(perms);
            }
        });
    } else {
        VKLogin(perms);
    }
}

function VKLogin(perms) {
    var channel, url;
    if (!VK._apiId) {
        return false;
    }
    channel = window.location.protocol + '//' + window.location.hostname;
    url = VK._domain.main + VK._path.login + '?client_id='+VK._apiId+'&display=popup&redirect_uri='+channel+'%2Fstatic%2Fvkcallback.html&response_type=token';
    if (perms && parseInt(perms, 10) > 0) {
        url += '&scope=' + perms;
    }
    VK.UI.popup({
        width: 665,
        height: 370,
        url: url
    });
}

function socNetQuickLoad(params) {
	SocNet.push(params.name, {onLoad: params.onload});
}

function OKLoginClick(app_id) {
    if (!app_id) {
        return;
    }

    var leftPos = document.documentElement.clientWidth / 2 - 286;
    var channel = window.location.protocol + '//' + window.location.hostname;
    var url = 'https://connect.ok.ru/oauth/authorize?client_id=' + app_id + '&redirect_uri=' + channel + '%2Fstatic%2Fokcallback.html&response_type=token&scope=VALUABLE_ACCESS,GET_EMAIL';
    var okAuthWindow = window.open(url, 'Одноклассники', 'width=572,height=481,top=260,left=' + leftPos);

    if (!okAuthWindow) {
        alert('Окно авторизации через Одноклассники было заблокировано.');
    }
}

function MRLoginClick(perms) {
    if (typeof(mailru) == 'undefined') {
        socNetQuickLoad({
            name: "ma",
            onload: function () {
                MRLogin(perms);
            }
        });
    } else {
        MRLogin(perms);
    }
}

function MRLogin(perms) {
    var mrTimer = setTimeout(function mrCheck() {
        if (mailru.events === undefined) {
            mrTimer = setTimeout(mrCheck, 500);
        } else {
            mailru.events.listen(mailru.connect.events.login, function(s){
                if (s) {
                    SNAjaxRedir({pre_action: 'socnet', socnet: 'ma', access_token: s.session_key, uids: s.oid, exp: s.exp, redirect_off: 1});
                } else {
                    //alert('Вы не авторизованы на Mail.ru');
                }
            });
            mailru.connect.login(perms);
        }
    }, 0);
}

function GPLoginClick(authResult) {
	if (authResult['access_token']) {
		SNAjaxRedir(getAction({socnet: 'gp', access_token:authResult['access_token']}));
	}
}

function TWLoginClick(){
    SNRedirect(getAction({socnet: 'tw', ref_url: litres.ref_url}));
}

function OILoginClick(id,host){
    var oi = document.getElementById(id);
    if (oi) oi = oi.value;
    if (/^[\w-@.\/:]+$/.test(oi)){
        if (host){
            var r = new RegExp('\.'+host.replace(/\./g,'\.'),"i");
            if (!r.test(oi)) oi += '.'+host;
        }
        SNAjaxRedir({pre_action: 'socnet', socnet: 'oi', user_open_id: oi, redirect_off: 1});
    } else {
        alert('Неверный формат OpenID');
    }
    return false;
}

function ShowOIForm(id,eid){
    var a = ['openid_form', 'lj_form'];
    for (var i = 0; i < a.length; i++){
        var f = document.getElementById(a[i]+'_'+eid);
        if (f){
            if (a[i] == id){
                f.style.display = f.style.display == 'block' ? 'none' : 'block';
            } else {
                f.style.display = 'none';
            }
        }
    }
}

function CheckSNGroups(f) {
    if(getCookie('ingroup_vk')) {
        ContactOK=getCookie('ingroup_vk');
        if(typeof f=='function') f();
    } else {
        // Тупой ВКонтакт не умеет сам правильно определять авторизован ли пользователь
        // будем через try
        try {
            VK.api('groups.isMember',{gid: 23482323, v: 5.73},function(k) {
                if (k == undefined){
                    ContactOK = -1;
                } else {
                    ContactOK = k.response == undefined ? -1 : k.response;
                    setCookie('ingroup_vk',ContactOK,0,'/',2);
                }
                if(typeof f=='function') f();
            });
        } catch(e) {
            ContactOK = -1;
            if(typeof f=='function') f();
        }
    }
    if(getCookie('ingroup_fb')) {
        FBOk=getCookie('ingroup_fb');
        if(typeof f=='function') f();
    } else {
        if (FB.getAuthResponse() != null){
            FB.api({method: 'pages.isFan', page_id: 'mylitres'},function(k){
                FBOk = k == undefined ? -1 : k == 1 ? 1 : 0;
                FBOk_out=k.error_code;
                if(FBOk_out==104) FBOk=-1;
                setCookie('ingroup_fb',FBOk,0,'/',2);
                if(typeof f=='function') f();
            });
        } else {
            FBOk=-1;
            if(typeof f=='function') f();
        }
    }
}

/* init socials */
function launchSocNet() {
	if (typeof SocNet != 'undefined') {
		if (typeof (FB) == 'undefined') {
			SocNet.push('fb', { InitCall: true });
		}
		if (typeof (VK) == 'undefined' || (typeof VK === 'object' && !VK._apiId)) {
			SocNet.push('vk', { InitCall: true });
		}
		if (typeof (mailru) == 'undefined') {
			SocNet.push('ma', { InitCall: true });
		}
	}
}

/* [110925] Прикрутить на www авторизацию через Яндекс */
function YaLoginClick() {
    openYaOAuth();
}

function openYaOAuth() {
    var YaWindowUrl = 'https://www.litres.ru/pages/';
    if (litres.user) {
        YaWindowUrl += 'my_social/?action=attach_socnet&socnet=ya'
    } else {
        YaWindowUrl += 'my_settings/?pre_action=socnet&socnet=ya';
    }
    var leftPos = document.documentElement.clientWidth / 2 - 300;
    window.YaOAuthWindow = window.open(YaWindowUrl, 'Яндекс.OAuth', 'width=460,height=460,top=200,left=' + leftPos);

    if (!YaOAuthWindow) {
        alert('Окно авторизации через Яндекс.OAuth было заблокировано.');
        return;
    }
}