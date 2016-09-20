angular.module('hexiaoApp')
	.controller('countCtrl', function ($scope, $ionicPopup, baseService, $ionicLoading){
		// 优惠券数据
		$scope.cards = '';
		// 判断是否为窗口管理员
		$scope.isWinAdmin = window.localStorage.getItem('isWinAdmin');
		// 提示信息
		$scope.message = '';
		// 统计数据
		$scope.count = function (){
			$ionicLoading.show();
			if($scope.isWinAdmin == 'true') {
				baseService.get(API_SERVER + 'api/my/win')
					.then(function (res){
						$ionicLoading.hide();
						$scope.cards = res.data;
					}, function (err){
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: '提示信息',
							template: '<p style="text-align: center;">'+ err.message +'</p>',
							okText: '我知道了'
						});
					});
			} else {
				$ionicLoading.hide();
				$scope.message = '您无权查看！';
			}
		}
		$scope.count();
	});	