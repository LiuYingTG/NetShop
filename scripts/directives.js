angular.module('Directives', [])

// 自定义指令,当加载时显示动画
    .directive('loading', function () {
        return {
            restrict: 'A',
            replace: true,
            template: '<img src="" alt="" />'
        }
    })
    //鼠标移除时进行验证
    .directive('ngCheck', function () {
        var check_class = 'ng-checked';//当鼠标击中时添加样式
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                ctrl.$checked = true;
                element.bind('focus', function (evt) {
                    element.addClass(check_class);
                    scope.$apply(function () {
                        ctrl.$checked = true;
                    });
                }).bind('blur', function (evt) {
                    element.removeClass(check_class);
                    scope.$apply(function () {
                        ctrl.$checked = false;
                    })
                })
            }
        }
    })
    //验证属性是否重复
    .directive('ensureUnique', ['$http', function ($http) {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.bind('focus', function () {
                    ctrl.$setValidity('unique', true);//不存在，可以注册
                }).bind('blur', function () {
                    /*测试用地址*/
                    console.log(scope[attrs.ngModel]);
                    var url = PUBLIC+'/buyer/' + attrs.ensureUnique + '?' + attrs.name + '=' + (scope[attrs.ngModel]);
                    if (scope[attrs.ngModel] != null) {
                        $http.get(url)
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    ctrl.$setValidity('unique', true);//不存在，可以注册
                                } else {
                                    ctrl.$setValidity('unique', false);//存在
                                }
                            }, function (err) {
                                ctrl.$setValidity('unique', false);//存在
                                console.log('网络出错啦，稍后再试哦');
                            });
                    }
                })
            }
        }
    }
    ])
    /*验证重新输入密码是否一致*/
    .directive('ensureSame', [function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.bind('focus', function () {
                    ctrl.$setValidity('same', true);//获取焦点时不验证
                }).bind('blur', function () {
                        if (scope.newPwd == scope.repwd) {
                            ctrl.$setValidity('same', true);
                        } else {
                            ctrl.$setValidity('same', false);
                        }
                    }
                );
            }
        }
    }])
    /*显示订单状态*/
    .directive('orderStatus', function () {
        return {
            restrict: 'A',
            template: '<span>{{status}}</span>',
            replace: true,
            controller: ['$scope', '$element', '$attrs', '$rootScope', function ($scope, $element, $attrs, $rootScope) {
                var status = '';
                $scope.$watch($attrs.orderStatus, function (newVal) {
                    if($rootScope.listStatus){
                        $scope.status=$rootScope.listStatus[newVal];
                    }
                })
            }]
        }
    })
    //显示商品物流信息
    .directive('logisticsInfo', function () {
        return {
            restrict: 'A',
            template: '<p style="white-space: pre-wrap;">{{logInfo}}</p>',
            link: function (scope, ele, attr) {
                var status = '';
                scope.$watch(attr.logisticsInfo, function (newVal) {
                    switch (newVal) {
                        case '0':
                            scope.logInfo = '下单成功,请尽快付款哦';
                            return;
                        case '1':
                            scope.logInfo = '订单已取消';
                            return;
                        case '2':
                            scope.logInfo = '卖家处理中，等待发货';
                            return;
                        case '3':
                            scope.logInfo = '退款中，请耐心等待';
                            return;
                        case '4':
                            scope.logInfo = '包裹已寄出，请耐心等待';
                            return;
                        case '5':
                            scope.logInfo = '订单已结束，欢迎下次光临！';
                            return;
                        /*case '6':
                            scope.logInfo = '卖家处理中，等待发货';
                            return;*/
                    }
                })
            }
        }
    })
    //导航栏出现时，禁止右侧页面滚动
    .directive('navCollapse', function () {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, ele, attr) {
                scope.$watch(attr.navCollapse, function (newVal) {
                    if (newVal) {//如果导航栏显示
                        $(".view").css('overflow-y', 'hidden');//禁止页面滑动
                    } else {
                        $(".view").css('overflow-y', 'scroll');//禁止页面滑动
                    }
                });
            }
        }
    })
    /*为商品描述进行换行显示*/
    .directive('handleDescription', function () {
        return {
            restrict: 'A',
            template: '<p style="white-space: pre-wrap;">{{productDescription}}</p>',
            replace: true,
            link: function (scope, ele, attr) {
                scope.$watch(attr.handleDescription, function (newVal) {
                    if(newVal){
                        var str=newVal.split('\n').join('&#10;');
                        scope.productDescription=newVal;
                    }
                })
            }
        }
    })