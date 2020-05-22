var CatalitWeb;
(function (CatalitWeb) {
    var CatalitWebApp = (function () {
        function CatalitWebApp(SID, websiteDomain) {
            this.secretKey = 'iOpDvZqDCZ53doSkajYjMes11OabXliP3BhT8nBoK9ab2zVAPqSpq4BgAgMdvib4RyWRcS';
            this.appID = '115';
            this.requestsArray = [];
            this.SID = SID;
            this.CatalitApiUrl = CatalitWebApp.createCatalitApiUrl(websiteDomain);
        }
        CatalitWebApp.prototype.generateSha256 = function () {
            var result = CatalitWebApp.getCurrentTime() + this.secretKey;
            return sha256(result);
        };
        ;
        CatalitWebApp.getCurrentTime = function () {
            var currentDate = new Date();
            var timezoneOffset = -currentDate.getTimezoneOffset(), dif = timezoneOffset >= 0 ? '+' : '-', pad = function (num) {
                var norm = Math.floor(Math.abs(num));
                return (norm < 10 ? '0' : '') + norm;
            };
            return currentDate.getFullYear() +
                '-' + pad(currentDate.getMonth() + 1) +
                '-' + pad(currentDate.getDate()) +
                'T' + pad(currentDate.getHours()) +
                ':' + pad(currentDate.getMinutes()) +
                ':' + pad(currentDate.getSeconds()) +
                dif + pad(timezoneOffset / 60) +
                ':' + pad(timezoneOffset % 60);
        };
        ;
        CatalitWebApp.getTimestampFromString = function (time) {
            return Date.parse(time) / 1000;
        };
        CatalitWebApp.prototype.requestAPI = function (successCallback, failureCallback) {
            var _this = this;
            if (failureCallback == null) {
                failureCallback = function () { };
            }
            if (this.requestsArray.length == 0) {
                failureCallback();
                return;
            }
            var processApiRequest = function (val, arr) {
                var response = {};
                for (var _i = 0, _a = arr.requestsArray; _i < _a.length; _i++) {
                    var obj = _a[_i];
                    if (val[obj.id]) {
                        response[obj.id] = val[obj.id];
                        response['success'] = val[obj.id].success;
                    }
                }
                _this.clearRequestsArray();
                successCallback(response);
            };
            var serverObject = {
                time: '',
                sid: '',
                requests: []
            };
            serverObject.mobile_app = this.appID;
            serverObject.sha = this.generateSha256();
            serverObject.time = CatalitWebApp.getCurrentTime();
            serverObject.sid = this.SID;
            serverObject.requests = this.requestsArray;
            var newHTTPRequest = new DataProvider.DataProvider('post', this.CatalitApiUrl, serverObject);
            var self = this;
            newHTTPRequest.HTTPRequest(function (xhrResult) {
                processApiRequest(JSON.parse(xhrResult.data), self);
            }, failureCallback);
        };
        CatalitWebApp.prototype.addNewRequest = function (newRequestObject) {
            this.requestsArray.push(newRequestObject);
        };
        CatalitWebApp.prototype.clearRequestsArray = function () {
            this.requestsArray = [];
        };
        CatalitWebApp.createCatalitApiUrl = function (websiteDomain) {
            return window.location.protocol + '//' + websiteDomain + "/catalitv2";
        };
        return CatalitWebApp;
    }());
    CatalitWeb.CatalitWebApp = CatalitWebApp;
})(CatalitWeb || (CatalitWeb = {}));
//# sourceMappingURL=CatalitWeb.js.map