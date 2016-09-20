// 服务器地址
var API_SERVER = 'http://37shenghuo.com/';

angular.module('hexiaoApp', ['ionic','ngMessages','ngCordova','oc.lazyLoad'])
.run(function ($ionicPlatform, $rootScope, $ionicPopup, $timeout, $state, $ionicHistory) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }
    });

    // 用于显示提示信息
    $rootScope.showMsg = function (message) {
        var myPopup = $ionicPopup.show({
            title: message
        });
        $timeout(function () {
            myPopup.close();
        }, 2000);
    };

    // 用于隐藏tabs，子页面隐藏tab
    $rootScope.hideTabs = function () {
        if ($state.is('tab.scan') || $state.is('tab.count')) {
            return false;
        } else {
            return true;
        }
    };

    // 双击物理键退出
    $rootScope.doubleclick = 0;
    $ionicPlatform.registerBackButtonAction(function (event) {
        event.preventDefault();
    }, 100);
    $ionicPlatform.onHardwareBackButton(function (e) {
        e.preventDefault();
        if ($rootScope.doubleclick == 0) {
            if ($state.is('tab.scan') || $state.is('tab.count') || $state.is('login')) {
                $rootScope.doubleclick = 1;
                $rootScope.showMsg('再按一次退出程序');
                $timeout(function () {
                    $rootScope.doubleclick = 0;
                }, 2000);
            } else {
                $ionicHistory.goBack();
            }
        } else {
            ionic.Platform.exitApp();
        }
    });
})
.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.scrolling.jsScrolling(true);
    // 将tab放置在程序底部
    $ionicConfigProvider.tabs.position("bottom");
    $ionicConfigProvider.tabs.style("standard");

    $stateProvider
        .state('tab', {
            url: '/tab',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl',
            resolve: {
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad){
                    return $ocLazyLoad.load('js/login.js');
                }]
            }
        })
        .state('tab.scan', {
            url: '/scan',
            views: {
                'tab-scan': {
                    templateUrl: 'templates/scan.html',
                    controller: 'scanCtrl'
                }
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad){
                    return $ocLazyLoad.load('js/scan.js');
                }]
            }
        })
        .state('tab.hexiao', {
            url: '/hexiao/{code}',
            views: {
                'tab-scan': {
                    templateUrl: 'templates/hexiao.html',
                    controller: 'hexiaoCtrl'
                }
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad){
                    return $ocLazyLoad.load('js/hexiao.js');
                }]
            }
        })
        .state('tab.count', {
            url: '/count',
            views: {
                'tab-count': {
                    templateUrl: 'templates/count.html',
                    controller: 'countCtrl'
                }
            },
            resolve: {
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad){
                    return $ocLazyLoad.load('js/count.js');
                }]
            }
        });

    $urlRouterProvider.otherwise('/login');
})
.factory('baseService', function ($http, $q) {
    var form_config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: function (data) {
            if (!angular.isObject(data)) {
                return ((data == null) ? "" : data.toString());
            }
            var buffer = [];
            for (var p in data) {
                if (!data.hasOwnProperty(p))
                    continue;
                var val = data[p];
                if (val == null) {
                    val = "";
                } else if (typeof (val) == 'object') {
                    val = angular.toJson(val);
                }
                buffer.push(encodeURIComponent(p) + "=" + encodeURIComponent(val));
            }
            return buffer.join("&").replace(/%20/g, "+");
        }
    }
    return {
        // 错误响应
        errorMsg: function (error) {
            var msg = {
                message: '',
                status: error.status,
                errors: []
            }
            switch (error.status) {
                case 401:
                    msg.message = '您的登录已超时，请重新登录';
                    break;
                case 403:
                    msg.message = '您无权进行该操作';
                    break;
                case 404:
                    msg.message = 'api地址或参数不正确';
                    break;
                case 422:
                    msg.errors = error.data.errors;
                    msg.message = '';
                    $.each(msg.errors, function (key, value) {
                        msg.message += value + "<br/>";
                    });
                    break;
                default:
                    msg.message = error.data.message;
            }
            this.debug(error);
            return msg;
        },
        debug: function (rs) {
            if (window.debug) {
                if (rs.status >= 300) {
                    console.group(rs.config.method + ' ' + rs.config.url);
                    console.warn(rs.status);
                    console.warn(rs.data);

                } else {
                    console.groupCollapsed(rs.config.method + ' ' + rs.config.url);
                    console.info(rs.data);
                }
                console.groupEnd();
            }
        },
        get: function (url, params) {
            var delay = $q.defer(), that = this, settings = {params: []};
            if (typeof (params) != 'undefined') {
                settings = {params: params}
            }
            settings['params']['rnd'] = Math.random();
            $http.get(url, settings)
                .then(function (result) {
                    that.debug(result);
                    delay.resolve(result.data);
                }, function (error) {
                    var errInfo = error.data;
                    if(errInfo == null){
                        delay.reject({message: '网络连接出现异常，请确认网络连接', status: 0});
                    } else {
                        delay.reject({message: errInfo.message, status: 1});
                    }
                });
            return delay.promise;
        },
        post: function (url, params) {
            var delay = $q.defer(), that = this;
            //remove last /
            url = url.replace(/\/+$/, '');
            $http.post(url, params, form_config)
                .then(function (result) {
                    that.debug(result);
                    delay.resolve(result.data);
                }, function (error) {
                    var errInfo = error.data;
                    if(errInfo == null){
                        delay.reject({message: '网络连接出现异常，请确认网络连接', status: 0});
                    } else {
                        delay.reject({message: errInfo.message, status: 1});
                    }
                });
            return delay.promise;
        }
    };
})
.factory('deviceService', function ($q, $cordovaBarcodeScanner, $ionicPlatform){
    return {
        scan: function (){
            var delay = $q.defer();
            $ionicPlatform.ready(function (){
                $cordovaBarcodeScanner.scan()
                    .then(function (data){
                        delay.resolve(data);
                    }, function (err){
                        delay.reject({message: '扫码失败，请重新尝试'});
                    });
            });
            return delay.promise;
        }
    }
})