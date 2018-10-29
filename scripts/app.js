var NetShop = angular.module('NetShop', ['ngRoute', 'ngCookies', 'infinite-scroll', 'Controllers', 'Directives']);
/*解决href=‘JavaScript：void(0)’报错*/
NetShop.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms):/);
    }]);
NetShop.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider.when('/allPro/:categoryType', {//全部商品
        templateUrl: './templates/allPro.html',
        controller: 'allProController'
    }).when('/proDetail/:productId', {//商品详情
        templateUrl: './templates/proDetail.html',
        controller: 'proDetailController'
    })
        .when('/cartList', {
            templateUrl: './templates/cartList.html',
            controller: 'cartListController'
        })
        .when('/createOrder', {
            templateUrl: './templates/createOrder.html',
            controller: 'createOrderController'
        })
        .when('/orderList', {
            templateUrl: './templates/orderList.html',
            controller: 'orderListController'
        })
        .when('/orderDetail/:orderId', {
            templateUrl: './templates/orderDetail.html',
            controller: 'orderDetailController'
        })
        .otherwise({
            redirectTo: '/allPro/all'
        });

}]);
/*配置cookie跨域问题*/
NetShop.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    // $httpProvider.defaults.headers.common['Authorization'] = "89757";
}]);

NetShop.run(['$rootScope', '$cookies', '$http', function ($rootScope, $cookies, $http) {
    // 设置类名初始值
    $rootScope.collapsed = false;//默认关闭导航栏
    $rootScope.showDialogue = false;//默认隐藏弹窗
    $rootScope.showUserLogin = false;//默认隐藏登录页
    $rootScope.showRegister = false;//默认隐藏注册页
    //获取购物车内商品数量
    $rootScope.$on('cartUpload', function (event) {
        $rootScope.cartNotEmp = true;
        $http.get(PUBLIC + '/netshop/buyer/cart/list').then(
            function (res) {
                $rootScope.cartNum = 0;
                var num = eval(res.data.data.cartItems);
                if (num) {
                    $rootScope.cartNum = num.length;
                }
                $rootScope.cartChaged = true;
            }, function (err) {
                console.log(err);
            });
        $rootScope.cartChaged = false;
    });
    $rootScope.loged = (function () {
        var username = $cookies.get('username');
        if (username) {
            $rootScope.username = username;
            $rootScope.$broadcast('cartUpload', true);
            return true;
        } else {
            $rootScope.username = '登录';
            return false;
        }
    })();
    $rootScope.categoryType = 'all';//默认展开的商品类别
    // 全局方法
    $rootScope.toggle = function () {
        // 改变类名初始值
        $rootScope.collapsed = !$rootScope.collapsed;

        // 获取所有导航
        var navs = document.querySelectorAll('.navs dd');

        if ($rootScope.collapsed) {//如果侧边栏展开时
            for (var i = 0; i < navs.length; i++) {
                navs[i].style.transform = 'translate(0)';
                navs[i].style.transitionDelay = '0.2s';
                navs[i].style.transitionDuration = (i + 1) * 0.15 + 's';
            }
            /* $('.body').click(function (e) {
                 console.log('关闭啊亲');
                 $rootScope.collapsed=false;
                 console.log('已关闭');
                 stopPropagation(e);
             });*/
        } else {
            var len = navs.length - 1;
            for (var j = len; j > 0; j--) {
                // console.log(navs.length - j + 1);
                navs[j].style.transform = 'translate(-100%)';
                navs[j].style.transitionDelay = '';
                navs[j].style.transitionDuration = (len - j) * 0.15 + 's';
            }
        }
    };
    /*关闭弹窗*/
    $rootScope.closeDialog = function () {
        $rootScope.showDialogue = false;//关闭弹窗
        $rootScope.showUserLogin = false;//关闭弹窗
        $rootScope.showRegister = false;//关闭弹窗
        $(".viewport").css('position', 'relative');//回复页面滑动
    }
    /*点击购物车icon跳转*/
}]);
/*common模块彻底解决post请求头和请求数据不规范的问题，可以直接引用模块名：common*/
NetShop.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = "application/x-www-form-urlencoded;charset=UTF-8";
    $httpProvider.defaults.transformRequest = function (data) {
        var arr = [];
        for (var key in data) {
            arr.push(key + '=' + data[key]);
        }
        return arr.join('&');
    }
}]);