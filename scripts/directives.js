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
                /*if(!scope[attrs.ngModel]){
                    return;
                }*/
                element.bind('focus', function () {
                    ctrl.$setValidity('unique', true);//不存在，可以注册
                }).bind('blur', function () {
                    // var url='netshop/buyer/'+attrs.ensureUnique+'?'+attrs.ngModel+'='+scope.username;
                    /*测试用地址*/
                    var url = 'http://106.14.183.207:8085/netshop/buyer/' + attrs.ensureUnique + '?' + attrs.ngModel + '=' + (scope[attrs.ngModel]);
                    if (scope[attrs.ngModel] != null) {
                        $http.get(url)
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    ctrl.$setValidity('unique', true);//不存在，可以注册
                                } else {
                                    console.log('存在');
                                    ctrl.$setValidity('unique', false);//存在
                                }
                            }, function (err) {
                                ctrl.$setValidity('unique', false);//存在
                                // alert('网络出错啦，稍后再试哦');
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
                        if (scope.pwd == scope.repwd) {
                            ctrl.$setValidity('same', true);
                        } else {
                            ctrl.$setValidity('same', false);
                        }
                    }
                );
            }
        }
    }])
    /*滚动加载数据*/
    // .directive('whenScrolled',function () {
    //         return function (scope,elm,attr) {
    //             console.log(elm);
    //             var raw=elm[0];
    //             elm.bind('click',function () {
    //                 console.log('点击');
    //             });
    //             elm.bind('mouseenter',function () {
    //                 /*if(raw.scrollTop+raw.offsetHeight>=raw.scrollHeight){
    //                     scope.$apply(attr.whenScrolled);
    //                 }*/
    //                 console.log('鼠标滚动');
    //                 scope.$apply(attr.whenScrolled);
    //             })
    //         }
    //     })
    /*显示订单状态*/
    .directive('orderStatus', function () {
        return {
            restrict: 'A',
            template: '<span>{{status}}</span>',
            replace: true,
            link: function (scope, ele, attr) {
                var status = '';
                scope.$watch(attr.orderStatus, function (newVal) {
                    switch (newVal) {
                        case '0':
                            scope.status = '未完成';
                            return;
                        case '1':
                            scope.status = '已完成';
                            return;
                        case '2':
                            scope.status = '已取消';
                            return;
                    }
                })
            }
        }
    })
    //显示商品物流信息
    .directive('logisticsInfo', function () {
        return {
            restrict: 'A',
            template: '<p>{{logInfo}}</p>',
            link: function (scope, ele, attr) {
                var status = '';
                scope.$watch(attr.logisticsInfo, function (newVal) {
                    switch (newVal) {
                        case '0':
                            scope.logInfo = '订单处理中';
                            return;
                        case '1':
                            scope.logInfo = '订单已结束，欢迎下次光临';
                            return;
                        case '2':
                            scope.logInfo = '该订单已取消';
                            return;
                    }
                    /* scope.status=;*/
                    /*ele.html((function(){
                        switch (newVal){
                            case '0': return '未完成';
                            case '1': return '已完成';
                            case '2': return '已取消'
                        }
                    })());*/
                })
            }
        }
    })