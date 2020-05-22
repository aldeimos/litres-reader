var DataProvider;
(function (DataProvider_1) {
    var DataProvider = (function () {
        function DataProvider(method, url, data) {
            this.method = method;
            this.url = url;
            this.stringifiedData = JSON.stringify(data);
        }
        DataProvider.prototype.parseResult = function (xhr) {
            return {
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: xhr.getAllResponseHeaders(),
                data: xhr.responseText,
                JSON: JSON.parse(xhr.responseText)
            };
        };
        DataProvider.prototype.HTTPRequest = function (successCallback, failureCallback) {
            var _this = this;
            if (failureCallback == null) {
                failureCallback = function () { };
            }
            var xhr = new XMLHttpRequest();
            xhr.open(this.method, this.url);
            var data = new FormData();
            data.append("jdata", this.stringifiedData);
            xhr.send(data);
            xhr.onload = function (evt) {
                if (xhr.status == 200) {
                    successCallback(_this.parseResult(xhr));
                }
                else {
                    failureCallback();
                }
            };
            xhr.onerror = function (evt) {
                failureCallback();
            };
            xhr.ontimeout = function (evt) {
                failureCallback();
            };
        };
        return DataProvider;
    }());
    DataProvider_1.DataProvider = DataProvider;
})(DataProvider || (DataProvider = {}));
//# sourceMappingURL=DataProvider.js.map