angular.module('hexiaoApp')
	.controller('loginCtrl', function ($scope, $rootScope, $state, $ionicLoading, baseService, $ionicPopup){
		// 用户名和密码
		$scope.credential = {
			username: '',
			password: ''
		};
		// 获取用户名
		var username = localStorage.getItem('username');
		if(username != null){
			$scope.credential.username = username;
		}
		// 用户点击登录
		$scope.login = function(){
			$ionicLoading.show();
			// 登录信息
			var data = {
				login: $scope.credential.username,
				password: $scope.credential.password
			};
			baseService.post(API_SERVER + 'api/auth/login', data)
				.then(function (res){
					$ionicLoading.hide();
					// 判断是否为窗口管理员
					var isWinAdmin = res.data.is_win_admin;
					// 将用户名保存到localStorage
					var username = res.data.mobile;
					window.localStorage.setItem('username', username);
					window.localStorage.setItem('isWinAdmin', isWinAdmin);
					$state.go('tab.scan');
				}, function (err){
					$ionicLoading.hide();
					$ionicPopup.alert({
		        		title: '提示信息',
						template: '<p style="text-align: center;">'+ err.message +'</p>',
						okText: '我知道了'
		        	});
				});	
		};
		
	});