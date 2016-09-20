angular.module('hexiaoApp')
	.controller('hexiaoCtrl', function ($scope, $ionicPopup, $stateParams, $state, $ionicHistory, baseService, $ionicLoading){
		// 二维码信息
		$scope.code = $stateParams.code;
		// 获取核销信息
		$scope.getInfo = function (){
			$ionicLoading.show();
			baseService.get(API_SERVER + 'api/code/' + $scope.code + '/check')
				.then(function (res){
					$ionicLoading.hide();
					$scope.card = res.data;
					$scope.start = $scope.card.batch_valid_time.split(' ')[0];
					$scope.end =  $scope.card.batch_exceed_time.split(' ')[0];
				}, function (err){
					$ionicLoading.hide();
					$ionicPopup.alert({
		        		title: '提示信息',
						template: '<p style="text-align: center;">'+ err.message +'</p>',
						okText: '我知道了'
		        	});
				})
		}
		$scope.getInfo();

		// 确认核销
		$scope.hexiao = function (){
			$ionicLoading.show();
			baseService.post(API_SERVER + 'api/code/' + $scope.code + '/check')
				.then(function (res){
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: '提示信息',
						template: '<p style="text-align: center;">'+ res.message +'</p>',
						okText: '我知道了'
		        	});
					alertPopup.then(function (result){
						$state.go('tab.scan');
					});
				}, function (err){
					$ionicLoading.hide();
					$ionicPopup.alert({
		        		title: '提示信息',
						template: '<p style="text-align: center;">'+ err.message +'</p>',
						okText: '我知道了'
		        	});
				})
		}

		// 返回
		$scope.goBack = function (){
			$ionicHistory.goBack()
		}
	});	