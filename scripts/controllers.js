// 实例一个模块，用来专门管理所有的控制器
angular.module('Controllers', [])

// 导航菜单
    .controller('NavController', ['$scope', '$location', '$rootScope', '$http', '$routeParams', '$cookies', function ($scope, $location, $rootScope, $http, $routeParams, $cookies) {
        // 导航数据,获取导航栏目
        $http.get(PUBLIC + '/netshop/buyer/category/list')
            .then(function (res) {
                if (res.data.msg == 'success') {
                    var allProCategory = [{
                        categoryName: '全部商品',
                        categoryType: 'all'
                    }];
                    var myOrder = [{
                        categoryName: '我的订单',
                        categoryType: 'order'
                    }];
                    $scope.iconList = ['icon-menu', 'icon-apparel', 'icon-tie', 'icon-sports-shoe', 'icon-shuttlecock', 'icon-heart-fill']
                    $scope.categoryLists = allProCategory.concat(res.data.data.slice(1)).concat(myOrder);
                    console.log($scope.categoryLists);
                } else {
                    alert('获取商品列表失败，请刷新！');
                }
            }, function (err) {
                alert('获取商品列表失败，请刷新！');
            });
        //用户登录
        $scope.login = function () {
            if ($rootScope.loged == false) {//如果未登录
                $rootScope.showUserLogin = true;
                $rootScope.toggleDialog();
            }
        };
        /*用户注销*/
        $scope.userLogout = function () {
            if (window.confirm('确定要注销吗，亲？')) {
                $http.get(PUBLIC + '/netshop/buyer/logout')
                    .then(function (res) {
                        if (res.data.msg == 'success') {//注销成功
                            alert('注销成功！');
                            $rootScope.loged = false;//更改登录状态
                            $rootScope.toggle();
                            $rootScope.cartNotEmp = false;
                            $cookies.remove('username');
                            $rootScope.categoryType = 'all';
                            $location.path('/allPro/all');
                        } else {
                            alert('出错了哦，请稍后再试！');
                        }
                    }, function (err) {
                        alert('出错了哦，请稍后再试！');
                    });
            } else {
                return;
            }

        };
        /*根据商品类别获取类别下所有上架商品*/
        $scope.byCategory = function (categoryType) {
            $rootScope.categoryType = categoryType;
            if (categoryType == 'order') {
                /*查看用户订单*/
                if($rootScope.loged){
                    $rootScope.collapsed&&$rootScope.toggle();
                    $location.path('/orderList');
                }else{
                    alert('请登录！');
                    $rootScope.toggleDialog();
                }
            } else {
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
        $rootScope.loaded = true;
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
            /*netshop/buyer/category/list?categoryType*/
            $http.get(PUBLIC + '/netshop/buyer/product/list',
                {
                    params: {
                        categoryType: $routeParams.categoryType,
                        page: $scope.vm.page
                    }
                })
                .then(function (res) {
                    if (res.data.msg == 'success') {
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
                    } else {
                        alert('获取商品信息失败，稍后再试');
                    }
                }, function (err) {
                    alert('获取商品信息失败，稍后再试');
                });
        };
        /*跳转至商品详情页，携带参数，正在浏览的*/
        $scope.proDetail = function (productId) {
            if ($rootScope.collapsed) {
                return;
            } else {
                $location.path('/proDetail/'+$rootScope.categoryType+'/' + productId);
            }
        }
    }])
    //商品详情
    .controller('proDetailController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '商品详情';
        $rootScope.categoryType = $routeParams.categoryType;
        $rootScope.loaded = true;
        var productId = $routeParams.productId;
        $scope.showed = false;//默认尺码选择对话框关闭
        $scope.num = 1;
        $scope.numDown = true;//默认禁止减少数量
        /*断网时，测试数据*/
        $http.get(PUBLIC + '/netshop/buyer/product/detail',
            {params: {productId: productId}}).then(function (res) {
            if (res.data.msg == 'success') {
                $scope.product = res.data.data;
                $scope.product.colorChoosed = 0;
                $scope.product.sizeChoosed = 0;
                $scope.productColor = $scope.product.productColor[0] || '';
                $scope.productSize = $scope.product.productSize[0] || '';
                $scope.product.proDetailImg = $scope.product.productDetailImg.split('|');
                $scope.product.productColor = $scope.product.productColor.split('_');
                if ($scope.product.productSize) {
                    $scope.product.productSize = $scope.product.productSize.split('_');
                } else {
                    $scope.product.productSize = [];
                }
            } else {
                alert('网络卡了，稍后再试');
            }
        }, function (err) {
            alert('网络卡了，稍后再试');
        })
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
            (symbol == '-') ? ($scope.num--) : ($scope.num++);
            $scope.numDown = $scope.num <= 1 ? true : false;
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
                alert('请登录！');
                $rootScope.toggleDialog();
                return;
            }
            if ($scope.type == 1) {//添加到购物车
                $http.post(PUBLIC + '/netshop/buyer/cart/add',
                    {
                        productId: $scope.product.productId,
                        productColor: $scope.productColor,
                        productSize: $scope.productSize,
                        productQuantity: $scope.num
                    })
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            alert('添加购物车成功');
                            $scope.showed = false;
                            $rootScope.$broadcast('cartUpload', true);
                        } else {
                            alert('请登录');
                        }
                    }, function (err) {
                        alert('网络异常，请稍后再试');
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
    }])
    //用户登录
    .controller('loginController', ['$scope', '$http', '$rootScope', '$location', '$cookies', function ($scope, $http, $rootScope, $location, $cookies) {
        /*用户登录*/
        $scope.userLog = {};
        $scope.userLogin = function () {
            $http.post(PUBLIC + '/netshop/buyer/login',
                $scope.userLog)
                .then(function successCallback(res) {//登录成功
                    if (res.data.msg == 'success') {
                        alert('登录成功！');
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
                    }
                    else {
                        alert('用户名或密码错误！');
                    }
                }, function failedCallback(err) {//登录失败
                    alert('用户名或密码错误！');
                });
        };
        /*忘记密码*/
        $scope.forgetPwd = function () {

        };
        /*注册新用户*/
        $scope.register = function () {
            $rootScope.showUserLogin = false;
            $rootScope.showRegister = true;//显示注册页
        }
    }])
    //注册新用户
    .controller('registerController', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {
        $scope.userRegister = function () {
            var user={
                username: this.newName,
                password: this.newPwd,
                phone: this.phone,
                email: this.email
            };
            $http({
                method: 'post',
                url: PUBLIC + '/netshop/buyer/save',
                data: user
            }).then(function (res) {
                alert('注册成功！请登录');
                $rootScope.showRegister=false;
                $rootScope.showUserLogin=true;
            }, function (err) {
                alert('网络错误，请稍后重试');
            });
        }
    }])
    //创建订单页
    .controller('createOrderController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', function ($scope, $http, $rootScope, $location, $routeParams) {
        $rootScope.title = '创建订单';
        $rootScope.loaded = true;
        $scope.products = $routeParams.params;
        $scope.total=$routeParams.total;

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
            $http.post(PUBLIC + '/netshop/buyer/order/create',
                {
                    buyerName: $scope.orderName,
                    buyerPhone: $scope.phone,
                    buyerAddress: $scope.addr,
                    items: items
                })
                .then(function (res) {
                    if (res.data.msg == 'success') {
                        alert(res.data.data.msg);
                        itemList = [];
                        $rootScope.$broadcast('cartUpload', true);
                        // history.go(-1);
                        $location.path('/orderDetail/' + res.data.data.orderId);
                    } else {
                        alert(res.data.msg);
                    }
                }, function (err) {
                    alert('网络错误，稍后再试！');
                });
        }
    }])
    //购物车列表
    .controller('cartListController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '我的购物车';
        $rootScope.loaded = true;
        $scope.cartLists = [];
        $scope.items = [];
        $scope.checkAll = false;//默认不选中购物车全部商品
        $scope.checkNum = 0;
        $http.get(PUBLIC + '/netshop/buyer/cart/list')
            .then(function (res) {
                if (res.data.msg == 'success') {
                    if (res.data.data.cartItems) {
                        var lists = eval(res.data.data.cartItems);
                        lists.map(function (item, index) {
                            $scope.cartLists.push(Object.assign({}, item, {checked: false}))
                        });
                    }
                } else {
                    alert('请登录');
                    $rootScope.toggleDialog();
                }
            }, function (err) {
                alert('网络错误，稍后重试');
            });

        /*增减购物车商品数量*/
        $scope.proNumChange = function (symbol, index) {
            if (symbol == 'rv') {//减少购物车数量
                if ($scope.cartLists[index].productQuantity <= 1) {
                    return;
                } else {
                    $http.get(PUBLIC + '/netshop/buyer/cart/decrease',
                        {params: {itemId: $scope.cartLists[index].itemId}})
                        .then(function (res) {
                            if (res.data.msg == 'success') {
                                $scope.cartLists[index].productQuantity--;
                            } else {
                                alert('网络出错了，稍等一下！');
                            }
                        }, function (err) {
                            alert('网络出错了，稍等一下！');
                        });
                }
            } else {
                $http.get(PUBLIC + '/netshop/buyer/cart/increase',
                    {params: {itemId: $scope.cartLists[index].itemId}})
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            $scope.cartLists[index].productQuantity++;
                        } else {
                            alert('网络出错了，稍等一下！');
                        }
                    }, function (err) {
                        alert('网络出错了，稍等一下！');
                    });
            }
        };
        /*单个删除购车商品*/
        $scope.delete = function (index) {
            if (window.confirm('确定删除该商品吗？')) {
                $http.get(PUBLIC + '/netshop/buyer/cart/delete',
                    {params: {itemId: $scope.cartLists[index].itemId}})
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            var oldLists = $scope.cartLists;
                            /*删除该数据*/
                            $scope.cartLists = oldLists.slice(0, index).concat(oldLists.slice(index + 1));
                            $rootScope.cartNum--;
                        } else {
                            alert('网络出错了，稍等一下！');
                        }

                    }, function (err) {
                        alert('网络出错了，稍等一下！');
                    });
            } else {
                return;
            }
        };
        /*选择或取消选择全部商品*/
        $scope.checkAllPros = function () {
            if(!$rootScope.collapsed){
                $scope.checkAll = !$scope.checkAll;
                for (var i = 0; i < $scope.cartLists.length; i++) {
                    $scope.cartLists[i].checked = $scope.checkAll;
                }
            }
        };
        /*批量删除*/
        $scope.batchDelete = function () {
            if($scope.checkNum==0){
                alert('请至少选择一件商品！');
            }else{
                if (window.confirm('确定删除' + $scope.items.length + '件商品吗，亲？')) {
                    var items = $scope.items.join('_');
                    $http.get(PUBLIC + '/netshop/buyer/cart/batchDelete', {
                        params: {itemIds: items}
                    })
                        .then(function (res) {
                            if (res.data.msg == 'success') {
                                history.go(0);
                            } else {
                                alert('出错了，稍后再试');
                            }
                        }, function (err) {
                            alert('出错了，稍后再试');
                        });
                } else {
                    return;
                }
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
                    $scope.cartTotal += parseFloat($scope.cartLists[i].productPrice * $scope.cartLists[i].productQuantity);
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
            if($scope.checkNum!=0){
                console.log($scope.checkNum+"-----"+$scope.cartLists.length);
                if($scope.checkNum==$scope.cartLists.length){
                    $scope.checkAll=true;
                }else{
                    $scope.checkAll=false;
                }
            }
        }, true);
        /*结算*/
        $scope.createOrder = function () {
            console.log('结算');
            if($scope.itemsDetail.length){
                $location.path('/createOrder').search({params: $scope.itemsDetail, total: $scope.cartTotal});
            }else{
                alert('请选择要购买的商品！');
                return;
            }
        }
    }])
    /*订单列表*/
    .controller('orderListController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '我的订单';
        $rootScope.categoryType = 'order';
        $rootScope.loaded = true;
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
                $http.get(PUBLIC + '/netshop/buyer/order/list',
                    {
                        params: {
                            page: $scope.vm.page
                        }
                    })
                    .then(function (res) {
                        $scope.nextloaded = true;
                        if (res.data.msg == 'success') {
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
                            alert('获取商品信息失败，稍后再试');
                        }
                    }, function (err) {
                        alert('获取商品信息失败，稍后再试');
                    });
            };

        /*删除订单*/
        $scope.delOrder = function (index) {
            if (window.confirm('该订单信息将被删除，不再显示在订单页，是否继续？')) {
                $http.get(PUBLIC + '/netshop/buyer/order/delete', {
                    params: {
                        orderId: $scope.orderLists[index].orderId
                    }
                })
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            alert('删除成功');
                            $scope.orderLists = $scope.orderLists.slice(0, index).concat($scope.orderLists.slice(index + 1));
                        }
                    }, function (err) {
                        alert('网络异常，稍后再试');
                    });
            } else {
                return;
            }

        }
        /*取消订单*/
        $scope.cancelOrder = function (index) {
            if (window.confirm('取消该订单吗？')) {
                $http.get(PUBLIC + '/netshop/buyer/order/cancel', {
                    params: {
                        orderId: $scope.orderLists[index].orderId
                    }
                })
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            alert('取消成功!');
                            $scope.orderLists[index].orderStatus = '2';
                        }
                    }, function (err) {
                        alert('网络异常，稍后再试!');
                    });
            } else {
                return;
            }
        }
        /*进入详情页*/
        $scope.orderDetail = function (index) {
            if(!$rootScope.collapsed){
                $location.path('/orderDetail/' + $scope.orderLists[index].orderId);
            }else{
                return;
            }
        }
    }])
    /*订单详情*/
    .controller('orderDetailController', ['$scope', '$http', '$rootScope', '$location', '$routeParams', '$cookies', function ($scope, $http, $rootScope, $location, $routeParams, $cookies) {
        $rootScope.title = '订单详情';
        $rootScope.categoryType = 'order';
        $rootScope.loaded = true;
        $http.get(PUBLIC + '/netshop/buyer/order/detail', {
            params: {
                orderId: $routeParams.orderId
            }
        })
            .then(function (res) {
                if (res.data.msg == 'success') {
                    $scope.orderDetail = res.data.data;
                    console.log($scope.orderDetail);
                } else {
                    alert("网络出错了，稍后再试");
                }
            }, function (err) {
                alert("网络出错了，稍后再试");
            })
        /*删除订单*/
        $scope.delOrder = function (orderId) {
            if (window.confirm('该订单信息将被删除，不再显示在订单页，是否继续？')) {
                $http.get(PUBLIC + '/netshop/buyer/order/delete', {
                    params: {
                        orderId: orderId
                    }
                })
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            alert('删除成功');
                            history.go(-1);
                        }
                    }, function (err) {
                        alert('网络异常，稍后再试');
                    });
            } else {
                return;
            }

        }
        /*取消订单*/
        $scope.cancelOrder = function (orderId) {
            if (window.confirm('取消该订单吗？')) {
                $http.get(PUBLIC + '/netshop/buyer/order/cancel', {
                    params: {
                        orderId: orderId
                    }
                })
                    .then(function (res) {
                        if (res.data.msg == 'success') {
                            alert('取消成功');
                            $scope.orderDetail.orderStatus = '2';
                        }
                    }, function (err) {
                        alert('网络异常，稍后再试');
                    });
            } else {
                return;
            }
        }
    }])
