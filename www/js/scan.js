angular.module('hexiaoApp')
	.controller('scanCtrl', function ($scope, $ionicPopup, deviceService, $state, baseService, $ionicPopup){
		// 扫描
		$scope.scan = function (){
			deviceService.scan()
				.then(function (res){
					if(res.cancelled == false && res.text != '' && res.format == 'QR_CODE'){
						var code = res.text;
						baseService.get(API_SERVER + 'api/code/' + code + '/check')
							.then(function (res){
								$state.go('tab.hexiao', {code: code});
							}, function (err){
								$ionicPopup.alert({
					        		title: '提示信息',
									template: '<p style="text-align: center;">'+ err.message +'</p>',
									okText: '我知道了'
					        	});
							});
					}
				}, function (err){
					$ionicPopup.alert({
		        		title: '提示信息',
						template: '<p style="text-align: center;">扫描失败，请重新尝试</p>',
						okText: '我知道了'
		        	});
				})
		}

		// 切换用户
		$scope.switchUser = function (){
			 // 提示对话框
			var switchPopup = $ionicPopup.show({
				title: '切换用户',
				template: '<p>你确定切换用户吗？</p>',
				buttons: [
					{
						text: 'Cancel',
						type: 'button-default',
						onTap: function (e){
							console.log('cancel');
						}
					},
					{
						text: 'OK',
						type: 'button-positive',
						onTap: function (e){
							$state.go('login');
						}
					}
				]
			});
		}

		//
	});	