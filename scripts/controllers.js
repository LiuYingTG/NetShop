// 实例一个模块，用来专门管理所有的控制器
angular.module('Controllers', [])

// 导航菜单
    .controller('NavController', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$cookies','$interval', function ($scope, $location, $rootScope, $http, $routeParams, $cookies,$interval) {
        // 导航数据,获取导航栏目
        $http.get(PUBLIC + '/buyer/category/list')
            .then(function (res) {
                if (res.data.msg == 'success') {
                    var allProCategory = [{
                        categoryName: '全部商品',
                        categoryType: 'all'
                    }];
                    var others = [{
                        categoryName: '我的订单',
                        categoryType: 'order'
                    }, {
                        categoryName: '用户设置',
                        categoryType: 'setting'
                    }];
                    $scope.iconList = ['icon-menu', 'icon-apparel', 'icon-tie', 'icon-sports-shoe', 'icon-shuttlecock', 'icon-heart-fill', 'icon-cog']
                    $scope.categoryLists = allProCategory.concat(res.data.data.slice(1)).concat(others);
                    console.log($scope.categoryLists);
                }
            }, function (err) {
                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
            });
        //用户登录
        $scope.login = function () {
            if ($rootScope.loged == false) {//如果未登录
                $rootScope.showUserLogin = true;
                $rootScope.toggleDialog();
            }
        };
        /*根据商品类别获取类别下所有上架商品*/
        $scope.byCategory = function (categoryType) {
            $rootScope.categoryType = categoryType;
            if (categoryType == 'order') {
                /*查看用户订单*/
                if ($rootScope.loged) {
                    $rootScope.collapsed && $rootScope.toggle();
                    $location.path('/orderList');
                } else {
                    window.wxc.xcConfirm("需要登录哦，亲~","info",{
                        onOk:function () {
                            $rootScope.$apply(function () {
                                $rootScope.toggleDialog();
                            })
                        }
                    });

                }
            } else if (categoryType == 'setting') {
                /*查看用户设置*/
                if ($rootScope.loged) {
                    $rootScope.collapsed && $rootScope.toggle();
                    $location.path('/setting');
                } else {
                    window.wxc.xcConfirm("需要登录哦，亲~","info",{
                        onOk:function () {
                            $rootScope.$apply(function () {
                                $rootScope.toggleDialog();
                            })
                        }
                    });

                }
            }
            else {
                $rootScope.toggle();
                $location.path('/allPro/' + categoryType);
            }
        }
    }])
    //全部商品
    .controller('allProController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', function ($scope, $http, $rootScope, $location, $routeParams) {
        $rootScope.title = '商品列表';
        $rootScope.cartBtn = false;//显示购物车按钮
        $rootScope.categoryType = $routeParams.categoryType;
        /*自动加载下一页状态对象*/
        $scope.vm = {};
        $scope.vm.page = 1;
        $scope.isLast = false;
        $scope.nextLoading = false;
        $scope.allProLists = [];
        /*自动加载下一页*/
        $scope.vm.nextPage = function () {
            if ($scope.vm.busy) {
                return;
            }
            $scope.vm.busy = true;
            $scope.nextLoading = true;
            ($routeParams.categoryType == 'all') && ($routeParams.categoryType = '');
            //根据商品类目获取信息，如果是全部商品，请求all接口
            /*buyer/category/list?categoryType*/
            $http.get(PUBLIC + '/buyer/product/list',
                {
                    params: {
                        categoryType: $routeParams.categoryType,
                        page: $scope.vm.page
                    }
                })
                .then(function (res) {
                    if (res.data.msg == 'success') {
                        $rootScope.loaded = true;
                        $scope.nextLoading = false;//加载完成
                        $scope.allProLists = $scope.allProLists.concat(res.data.data.content);
                        /*如果加载信息成功，判断是否为最后一页*/
                        if (res.data.data.last) {
                            /*为最后一页*/
                            $scope.isLast = true;
                            $scope.vm.busy = true;
                        } else {
                            $scope.vm.page++;
                            $scope.vm.busy = false;
                        }
                    }
                }, function (err) {
                    window.wxc.xcConfirm('出错了，稍后再试哦亲~',"info");
                });
        };
        /*跳转至商品详情页，携带参数，正在浏览的*/
        $scope.proDetail = function (productId) {
            if ($rootScope.collapsed) {
                return;
            } else {
                $location.path('/proDetail/' + $rootScope.categoryType + '/' + productId);
            }
        }
    }])
    //商品详情
    .controller('proDetailController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '商品详情';
        $rootScope.categoryType = $routeParams.categoryType;
        console.log($rootScope.categoryType);
        var productId = $routeParams.productId;
        $scope.showed = false;//默认尺码选择对话框关闭
        $scope.num = 1;
        $scope.numDown = true;//默认禁止减少数量
        /*断网时，测试数据*/
        $http.get(PUBLIC + '/buyer/product/detail',
            {params: {productId: productId}}).then(function (res) {
            if (res.data.msg == 'success') {
                $rootScope.loaded = true;
                $scope.product = res.data.data;
                $scope.product.colorChoosed = 0;
                $scope.product.sizeChoosed = 0;
                $scope.productColor = $scope.product.productColor[0] || '';
                $scope.productSize = $scope.product.productSize[0] || '';
                $scope.product.proDetailImg = $scope.product.productDetailImg.split('|');
                $scope.product.productColor = $scope.product.productColor.split('_');
                $scope.color = '"' + $scope.product.productColor[0] + '"';
                if ($scope.product.productSize) {
                    $scope.product.productSize = $scope.product.productSize.split('_');
                    $scope.size = '"' + $scope.product.productSize[0] + '"';
                } else {
                    $scope.product.productSize = [];
                    $scope.size = '';
                }
            }
        }, function (err) {
            window.wxc.xcConfirm('出错了，稍后再试哦亲~','info');
        });
        $scope.chooseColor = function (index) {
            $scope.product.colorChoosed = index;
            $scope.productColor = $scope.product.productColor[index];
            $scope.color = '"' + $scope.product.productColor[index] + '"';
        };
        $scope.chooseSize = function (index) {
            $scope.product.sizeChoosed = index;
            $scope.productSize = $scope.product.productSize[index];
            $scope.size = '"' + $scope.product.productSize[index] + '"';
        };
        /*修改提交的商品数量*/
        $scope.changeNum = function (symbol) {
            if (symbol == "+") {
                if ($scope.product.productStock < ($scope.num + 1)) {
                    window.wxc.xcConfirm('数量超出范围~','info',{
                        onOk:function () {
                           return;
                        }
                    });
                } else {
                    $scope.num++;
                }
            } else if (!symbol) {
                if ($scope.product.productStock < $scope.num) {
                    window.wxc.xcConfirm('数量超出范围~','info',{
                        onOk:function () {
                            $scope.$apply(function () {
                                $scope.num=1;
                                return;
                            })
                        }
                    });
                }
                if ($scope.num < 1) {
                    window.wxc.xcConfirm('不能再少啦，亲~','info',{
                        onOk:function () {
                            $scope,$apply(function () {
                                $scope.num = 1
                            });
                        }
                    });
                }
            } else {
                $scope.num--;
            }
            $scope.numDown = $scope.num <= 1 ? true : false;
            // $scope.num =$scope.num <= 1?1:$scope.num;
        };
        /*弹出规格弹窗*/
        $scope.toggleDia = function (n) {
            $scope.showed = !$scope.showed;
            if (n) {
                $scope.type = n;
            }
        };
        /*当规格弹窗存在时，不允许页面滚动*/
        $scope.$watch('showed', function (newVal) {
            if (newVal) {
                $(".view").css('overflow-y', 'hidden');
            } else {
                $(".view").css('overflow-y', 'scroll');
            }
        });
        $scope.confirmOrder = function () {
            if (!$rootScope.loged) {
                window.wxc.xcConfirm('需要登录哦，亲~','info',{
                    onOk: function () {
                        $rootScope.$apply(function () {
                            $rootScope.toggleDialog();
                            return;
                        })
                    }
                });
            }else if ($scope.product.productStock < $scope.num) {
                window.wxc.xcConfirm('数量超出范围~','info',{
                    onOk :function () {
                        $rootScope.$apply(function () {
                            $scope.num=1;
                            return;
                        });
                    }
                });
            }else{
                if ($scope.type == 1) {//添加到购物车
                    $http.post(PUBLIC + '/buyer/cart/add',
                        {
                            productId: $scope.product.productId,
                            productColor: $scope.productColor,
                            productSize: $scope.productSize,
                            productQuantity: $scope.num
                        })
                        .then(function (res) {
                            if (res.data.msg == 'success') {
                                window.wxc.xcConfirm('添加购物车成功！','info',{
                                    onOk:function () {
                                        $rootScope.$apply(function () {
                                            $scope.showed = false;
                                            $rootScope.$broadcast('cartUpload', true);
                                        });
                                    }
                                });
                            }
                        }, function (err) {
                            window.wxc.xcConfirm('出错了，稍后再试哦亲~','info');
                        });
                }
                else if ($scope.type == 2) {//立即购买
                    $location.path('/createOrder').search({
                        params: [{
                            "productColor": $scope.productColor,
                            "productId": $scope.product.productId,
                            "img": $scope.product.productImgMd,
                            'name': $scope.product.productName,
                            "productQuantity": $scope.num,
                            "productSize": $scope.productSize,
                            'productPrice': $scope.product.productPrice
                        }], total: $scope.num * $scope.product.productPrice
                    });
                }
            }
        }
    }])
    //用户登录
    .controller('loginController', ['$scope', '$http', '$rootScope', '$location', '$cookies', function ($scope, $http, $rootScope, $location, $cookies) {
        /*用户登录*/
        $scope.userLog = {};
        $scope.forgetDialog = false;
        $scope.userEmail = '';
        $scope.userLogin = function (formValid) {
            if (formValid) {
                window.wxc.xcConfirm('输入信息有误哦，亲~','info',{
                    onOk:function () {
                        return;
                    }
                });
            }
            $http.post(PUBLIC + '/buyer/login',
                $scope.userLog)
                .then(function successCallback(res) {//登录成功
                    if (res.data.msg == 'success') {
                        window.wxc.xcConfirm('登录成功！','info',{
                            onOk:function () {
                                $rootScope.$apply(function () {
                                    $rootScope.toggleDialog();
                                    $rootScope.loged = true;
                                    $rootScope.userName = $scope.userLog.username;
                                    $rootScope.toggle();
                                    /*创建cookie，保持用户的登录状态*/
                                    var expireDate = new Date();
                                    expireDate.setHours(expireDate.getHours() + 1);
                                    $cookies.put('username', $scope.userLog.username, {expires: expireDate});
                                    $scope.userLog = {};
                                    window.location.reload();
                                })
                            }
                        });
                    }
                }, function failedCallback(err) {//登录失败
                    window.wxc.xcConfirm('用户名或密码错误~','info');
                });
        };
        /*忘记密码,发送邮件*/
        $scope.sendEmail = function (invalid) {
            if (invalid) {
                window.wxc.xcConfirm('输入信息有误哦，亲~','info');
                return;
            }
            $http.get(PUBLIC + '/buyer/getBackPwd', {params: {email: this.userEmail}})
                .then(function (res) {
                    console.log(res.data);
                    if (res.data.msg == 'success') {
                        window.wxc.xcConfirm('系统正在校验您的个人信息，稍后将发送密码至您的邮箱，请耐心等待哦，亲~','info',{
                            onOk:function () {
                                $scope.$apply(function () {
                                    $scope.forgetDialog = false;
                                })
                            }
                        });
                    }
                }, function (err) {
                    window.wxc.xcConfirm('邮箱未注册哦，亲~','info');
                });
        };
        $scope.$watch('forgetDialog', function () {
            console.log($scope.forgetDialog);
        })
        /*注册新用户*/
        $scope.register = function () {
            $rootScope.showUserLogin = false;
            $rootScope.showRegister = true;//显示注册页
        }
    }])
    //注册新用户
    .controller('registerController', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
        $scope.userRegister = function (btnValid) {
            var user = {
                username: this.newName,
                password: this.newPwd,
                phone: this.phone,
                email: this.email
            }
            if (btnValid) {//如果表单不可提交
                window.wxc.xcConfirm("输入信息有误哦，亲~","info");
                return;
            }
            $http({
                method: 'post',
                url: PUBLIC + '/buyer/save',
                data: user
            }).then(function (res) {
                window.wxc.xcConfirm("注册成功,快去登录吧~","info",{
                    onOk:function () {
                        $rootScope.$apply(function () {
                            $scope.registerInfo = {};
                            $rootScope.showRegister = false;
                            $rootScope.showUserLogin = true;
                        });
                    }
                });

            }, function (err) {
                console.log(err);
            });
        }
    }])
    //创建订单页
    .controller('createOrderController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', function ($scope, $http, $rootScope, $location, $routeParams) {
        $rootScope.title = '创建订单';
        $rootScope.loaded = true;
        $scope.products = $routeParams.params;
        $scope.total = $routeParams.total;
        $scope.orderRemark = '';
        if (!$scope.products[0].productId) {
            $scope.products = [];
            history.go('-1');
        }
        var items = '';
        var itemList = [];
        $scope.createOrder = function () {
            for (var i = 0; i < $scope.products.length; i++) {
                itemList.push({
                    "itemId": $scope.products[i].itemId || '',
                    "productColor": $scope.products[i].productColor,
                    "productId": $scope.products[i].productId,
                    "productQuantity": $scope.products[i].productQuantity,
                    "productSize": $scope.products[i].productSize
                });
            }
            items = JSON.stringify(itemList);
            $http.post(PUBLIC + '/buyer/order/create',
                {
                    buyerName: $scope.orderName,
                    buyerPhone: $scope.phone,
                    buyerAddress: $scope.addr,
                    items: items,
                    orderRemark: $scope.orderRemark
                })
                .then(function (res) {
                    if (res.data.msg == 'success') {
                        window.wxc.xcConfirm(res.data.data.msg,"info",{
                            onOk:function () {
                                $rootScope.$apply(function () {
                                    itemList = [];
                                    $rootScope.$broadcast('cartUpload', true);
                                    $location.path('/orderDetail/' + res.data.data.orderId);
                                })
                            }
                        });

                    } else {
                        window.wxc.xcConfirm(res.data.data.msg,"info");
                    }
                }, function (err) {
                    console.log(err);
                });
        }
    }])
    //购物车列表
    .controller('cartListController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '我的购物车';
        $scope.cartLists = [];
        $scope.items = [];
        $scope.checkAll = false;//默认不选中购物车全部商品
        $scope.checkNum = 0;
        $http.get(PUBLIC + '/buyer/cart/list')
            .then(function (res) {
                if (res.data.msg == 'success') {
                    $rootScope.loaded = true;
                    if (res.data.data.cartItems) {
                        var lists = eval(res.data.data.cartItems);
                        lists.map(function (item, index) {
                            $scope.cartLists.push(Object.assign({}, item, {checked: false}))
                        });
                    }
                } else {
                    window.wxc.xcConfirm("需要登录哦，亲~","info",{
                        onOk:function () {
                            $rootScope.$apply(function () {
                                $rootScope.toggleDialog();
                            });
                        }
                    });
                }
            }, function (err) {
                console.log('登录' + err);
            });
        /*进入商品详情页*/
        $scope.toProDetail = function (index) {
            if ($rootScope.collapsed) {
                return;
            } else {
                $location.path('/proDetail/all' + '/' + $scope.cartLists[index].productId);
            }
        };
        /*增减购物车商品数量*/
        $scope.proNumChange = function (symbol, index) {
            if (symbol == 'rv') {//减少购物车数量
                if ($scope.cartLists[index].productQuantity <= 1) {
                    return;
                } else {
                    $http.get(PUBLIC + '/buyer/cart/decrease',
                        {params: {itemId: $scope.cartLists[index].itemId}})
                        .then(function (res) {
                            if (res.data.msg == 'success') {
                                $scope.cartLists[index].productQuantity--;
                            }
                        }, function (err) {
                            window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                        });
                }
            } else {
                $http.get(PUBLIC + '/buyer/cart/increase',
                    {params: {itemId: $scope.cartLists[index].itemId}})
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            $scope.cartLists[index].productQuantity++;
                        }
                    }, function (err) {
                        window.wxc.xcConfirm("数量超出范围~","info");
                        $scope.cartLists[index].productQuantity=1;
                    });
            }
        };
        /*直接修改购物车内的商品数量*/
        $scope.editQuantity = function (productId, productQuantity, index) {
            if (productQuantity < 1) {
                window.wxc.xcConfirm("不能再少啦，亲~","info",{
                    onOk:function () {
                        $scope.$apply(function () {
                            $scope.cartLists[index].productQuantity = 1;
                        })
                    }
                });
            }
            $http.get(PUBLIC + '/buyer/cart/editQuantity', {
                params: {
                    itemId: $scope.cartLists[index].itemId,
                    quantity: productQuantity
                }
            })
                .then(function (res) {

                }, function (err) {
                    window.wxc.xcConfirm("数量超出范围~","info");
                    $scope.cartLists[index].productQuantity=1;
                });
        }
        /*单个删除购车商品*/
        $scope.delete = function (index) {
            window.wxc.xcConfirm('确定删除该商品吗？','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/cart/delete',
                            {params: {itemId: $scope.cartLists[index].itemId}})
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    var oldLists = $scope.cartLists;
                                    /*删除该数据*/
                                    $scope.cartLists = oldLists.slice(0, index).concat(oldLists.slice(index + 1));
                                    $rootScope.cartNum--;
                                }

                            }, function (err) {
                                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                            });
                    })
                },
                onCancel:function () {
                    return;
                }
            });
        };
        /*选择或取消选择全部商品*/
        $scope.checkAllPros = function () {
            if (!$rootScope.collapsed) {
                $scope.checkAll = !$scope.checkAll;
                for (var i = 0; i < $scope.cartLists.length; i++) {
                    $scope.cartLists[i].checked = $scope.checkAll;
                }
            }
        };
        /*批量删除*/
        $scope.batchDelete = function () {
            if ($scope.checkNum == 0) {
                window.wxc.xcConfirm("至少要选择一件商品哦，亲~","info");
            } else {
                window.wxc.xcConfirm('确定删除' + $scope.items.length + '件商品吗，亲？','confirm',{
                    onOk:function () {
                        $rootScope.$apply(function () {
                            var items = $scope.items.join('_');
                            $http.get(PUBLIC + '/buyer/cart/batchDelete', {
                                params: {itemIds: items}
                            })
                                .then(function (res) {
                                    if (res.data.msg == 'success') {
                                        window.location.reload();
                                    }
                                }, function (err) {
                                    window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                                });
                        })
                    },
                    onCancel:function () {
                        return;
                    }
                })
            }

        };
        /*当购物车列表中数据变化时，更新合计和结算*/
        $scope.$watch('cartLists', function () {
            $scope.cartTotal = 0;
            $scope.items = [];
            $scope.itemsDetail = [];
            $scope.checkNum = 0;
            for (var i = 0; i < $scope.cartLists.length; i++) {
                if ($scope.cartLists[i].checked) {
                    /*增加精度*/
                    var singleItem=parseFloat($scope.cartLists[i].productPrice * $scope.cartLists[i].productQuantity)*1000;
                    $scope.cartTotal=(singleItem+$scope.cartTotal*1000)/1000;
                    // $scope.cartTotal += parseFloat($scope.cartLists[i].productPrice * $scope.cartLists[i].productQuantity);
                    $scope.checkNum++;
                    $scope.items.push($scope.cartLists[i].itemId);
                    $scope.itemsDetail.push({
                        "itemId": $scope.cartLists[i].itemId,
                        "productColor": $scope.cartLists[i].productColor,
                        "productId": $scope.cartLists[i].productId,
                        "img": $scope.cartLists[i].productImgMd,
                        'name': $scope.cartLists[i].productName,
                        "productQuantity": $scope.cartLists[i].productQuantity,
                        "productSize": $scope.cartLists[i].productSize,
                        'productPrice': $scope.cartLists[i].productPrice
                    });
                }
            }
            if ($scope.checkNum != 0) {
                console.log($scope.checkNum + "-----" + $scope.cartLists.length);
                if ($scope.checkNum == $scope.cartLists.length) {
                    $scope.checkAll = true;
                } else {
                    $scope.checkAll = false;
                }
            }
        }, true);
        /*结算*/
        $scope.createOrder = function () {
            console.log('结算');
            if ($scope.itemsDetail.length) {
                $location.path('/createOrder').search({params: $scope.itemsDetail, total: $scope.cartTotal});
            } else {
                window.wxc.xcConfirm("至少要选择一件商品哦，亲~","info");
                return;
            }
        }
    }])
    /*订单列表*/
    .controller('orderListController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '我的订单';
        $rootScope.categoryType = 'order';
        /*自动加载下一页状态对象*/
        $scope.vm = {};
        $scope.vm.page = 1;
        $scope.isLast = false;
        $scope.orderLists = [];
        $scope.nextloaded = false;
        /*自动加载下一页*/
        $scope.vm.nextPage = function () {
            if ($scope.vm.busy) {
                return;
            }
            $scope.vm.busy = true;
            $http.get(PUBLIC + '/buyer/order/list',
                {
                    params: {
                        page: $scope.vm.page
                    }
                })
                .then(function (res) {
                    $scope.nextloaded = true;
                    if (res.data.msg == 'success') {
                        $rootScope.loaded = true;
                        $scope.orderLists = $scope.orderLists.concat(res.data.data.content);
                        /*如果加载信息成功，判断是否为最后一页*/
                        if (res.data.data.last) {
                            /*为最后一页*/
                            $scope.isLast = true;
                            $scope.vm.busy = true;
                        } else {
                            $scope.vm.page++;
                            $scope.vm.busy = false;
                        }
                    } else {
                        console.log('获取商品信息失败，稍后再试');
                    }
                }, function (err) {
                    console.log('获取商品信息失败，稍后再试err');
                });
        };
        /*删除订单*/
        $scope.delOrder = function (index) {
            window.wxc.xcConfirm('该订单信息将被删除，不再显示在订单页，是否继续？','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/order/delete', {
                            params: {
                                orderId: $scope.orderLists[index].orderId
                            }
                        })
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    window.wxc.xcConfirm("删除成功！","info",{
                                        onOk:function () {
                                            $scope.$apply(function () {
                                                $scope.orderLists = $scope.orderLists.slice(0, index).concat($scope.orderLists.slice(index + 1));
                                            })
                                        }
                                    });
                                }
                            }, function (err) {
                                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            })



        }
        /*取消订单*/
        $scope.cancelOrder = function (index) {
            window.wxc.xcConfirm('取消该订单吗，亲?','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/order/cancel', {
                            params: {
                                orderId: $scope.orderLists[index].orderId
                            }
                        })
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    window.wxc.xcConfirm("取消成功！","info",{
                                        onOk:function () {
                                            $scope.$apply(function () {
                                                $scope.orderLists[index].orderStatus = '1';
                                            })
                                        }
                                    });
                                } else {
                                    window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                                }
                            }, function (err) {
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            });
        };
        /*确认收货*/
        $scope.receiveOrder = function (index) {
            window.wxc.xcConfirm('确认收货后，默认交易完成，是否继续？','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/order/receive', {
                            params: {
                                orderId: $scope.orderLists[index].orderId
                            }
                        })
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    window.wxc.xcConfirm("确认成功！","info",{
                                        onOk:function () {
                                            $scope.$apply(function () {
                                                $scope.orderLists[index].orderStatus = '5';
                                            })
                                        }
                                    });
                                }
                            }, function (err) {
                                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            })
        };
        /*进入详情页*/
        $scope.orderDetail = function (index) {
            if (!$rootScope.collapsed) {
                $location.path('/orderDetail/' + $scope.orderLists[index].orderId);
            } else {
                return;
            }
        }
    }])
    /*订单详情*/
    .controller('orderDetailController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', '$q', function ($scope, $http, $rootScope, $location, $routeParams, $cookies, $q) {
        $rootScope.title = '订单详情';
        $rootScope.categoryType = 'order';
        $scope.hasDetail = false;
        $scope.hasExpress = false;
        $scope.showExDetail = false;
        $http.get(PUBLIC + '/buyer/order/detail', {
            params: {
                orderId: $routeParams.orderId
            }
        })
            .then(function (res) {
                if (res.data.msg == 'success') {
                    $scope.orderDetail = res.data.data;
                    $rootScope.loaded = true;
                    if ($scope.orderDetail.orderStatus == 4 || $scope.orderDetail.orderStatus == 5) {
                        $http.get(PUBLIC + '/express/findOne', {
                            params: {
                                orderId: $routeParams.orderId
                            }
                        }).then(function (res) {
                            if (res.data.msg == 'success') {
                                $scope.orderExpress = res.data.data;
                                $scope.hasExpress = true;
                                if ($scope.orderExpress.logisticsDetail) {
                                    $scope.hasDetail = true;
                                    $scope.logisticsDetail = eval('(' + $scope.orderExpress.logisticsDetail + ')').data;
                                    console.log($scope.logisticsDetail);
                                }
                            }
                        }, function (err) {
                            console.log(err.data);
                        });
                    }
                } else {
                    window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                }
            }, function (err) {
                console.log("orderDetail" + err);
            })
        /*查看物流详细信息*/
        $scope.showExpressDetail = function () {
            if (this.hasDetail) {//当有物流详情时，显示
                this.showExDetail = true;

            }
        }
        /*确认收货*/
        $scope.receiveOrder = function (orderId) {
            window.wxc.xcConfirm('确认收货后，默认交易完成，是否继续？','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/order/receive', {
                            params: {
                                orderId: orderId
                            }
                        })
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    window.wxc.xcConfirm("确认成功！","info",{
                                        onOk:function () {
                                            $scope.$apply(function () {
                                                $scope.orderDetail.orderStatus = '5';
                                            })
                                        }
                                    });
                                }
                            }, function (err) {
                                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            });
        };
        /*删除订单*/
        $scope.delOrder = function (orderId) {
            window.wxc.xcConfirm('该订单信息将被删除，不再显示在订单页，是否继续？','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/order/delete', {
                            params: {
                                orderId: orderId
                            }
                        })
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    window.wxc.xcConfirm("删除成功!","info",{
                                        onOk:function () {
                                            $scope.$apply(function () {
                                                $location.path('/orderList');
                                            })
                                        }
                                    });
                                }
                            }, function (err) {
                                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            })
        }
        /*取消订单*/
        $scope.cancelOrder = function (orderId) {
            window.wxc.xcConfirm('取消该订单吗，亲?','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/order/cancel', {
                            params: {
                                orderId: orderId
                            }
                        })
                            .then(function (res) {
                                if (res.data.msg == 'success') {
                                    window.wxc.xcConfirm("取消成功！","info",{
                                        onOk:function () {
                                            $scope.$apply(function () {
                                                $scope.orderDetail.orderStatus = '1';
                                            })
                                        }
                                    });
                                }
                            }, function (err) {
                                console.log('取消成功' + err);
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            })
        }
        /*进入商品详情页*/
        $scope.toProDetail = function (index) {
            if ($rootScope.collapsed) {
                return;
            } else {
                $location.path('/proDetail/all' + '/' + $scope.orderDetail.orderDetailList[index].productId);
            }
        };
    }])
    /*用户设置*/
    .controller('userSettingController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '用户设置';
        $rootScope.categoryType = 'order';
        $rootScope.loaded = true;
        var originStatus = {
            setDetail: true,
            editAddress: false,
            editPwd: false
        };
        $scope.setStatus = {
            editAddress: false,
            editPwd: false
        };
        /*用户注销*/
        $scope.userLogout = function () {
            window.wxc.xcConfirm('确定要退出吗，亲？','confirm',{
                onOk:function () {
                    $rootScope.$apply(function () {
                        $http.get(PUBLIC + '/buyer/logout')
                            .then(function (res) {
                                if (res.data.msg == 'success') {//退出成功
                                    window.wxc.xcConfirm("退出成功，期待下次光顾！","info",{
                                        onOk:function () {
                                            $rootScope.$apply(function () {
                                                $rootScope.loged = false;//更改登录状态
                                                $rootScope.cartNotEmp = false;
                                                $cookies.remove('username');
                                                $rootScope.categoryType = 'all';
                                                $location.path('/allPro/all');
                                            })
                                        }
                                    });
                                }
                            }, function (err) {
                                window.wxc.xcConfirm("出错了，稍后再试哦亲~","info");
                            });
                    });
                },
                onCancel:function () {
                    return;
                }
            })
        };
        /*修改密码*/
        $scope.confirmEditPwd = function (valid) {
            if (valid) {
                window.wxc.xcConfirm("输入信息有误哦，亲~","info");
                return;
            }
         $http.post(PUBLIC+'/buyer/editPwd',{
                 newPassword:this.newPwd
             })
             .then(function (res) {
                 window.wxc.xcConfirm("修改成功,请重新登录~","info",{
                     onOk:function () {
                         $rootScope.$apply(function () {
                             $rootScope.loged = false;//更改登录状态
                             $rootScope.toggle();
                             $rootScope.cartNotEmp = false;
                             $cookies.remove('username');
                             $rootScope.categoryType = 'all';
                             $location.path('/allPro/all');
                         })
                     }
                 });
             },function (err) {
                 window.wxc.xcConfirm("修改失败，稍后再试哦亲~","info");
             });
        }
    }])