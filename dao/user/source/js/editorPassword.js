/*-------------------------------------------------------------------------
 * 作者：dongchunshui
 * 创建时间： 2018/1/5
 * 版本号：v1.0
 * 作用域：修改密码
 -------------------------------------------------------------------------*/
(function(){
	var getVerifyCode="/user/password/getVerifyCode";//获取短信验证码
	var maskPhone="/user/password/maskPhone";//获取手机号码加*显示	
	var passwordModify="/user/password/modify";//修改密码提交接口
	var daoPwdChinaCaptcha=null;//修改密码验证码创建
	var pwdPopHtml=''+
     '<div class="userEditPwd_wrapper js_userEditPwdPop tc"  style="overflow:visible">'+
		'<i class="js_close cursor" style="right:-40px"></i>'+
		
		'<h3 class="title">修改密码</h3>'+
		'<div class="userEditPwd_content">'+
			'<div class="verify_phone js_verifyPhone">*****</div>'+
			'<ul class="userEditPwd_ul">'+
				'<li>'+
					'<input type="text" class="pwd_getCode js_getCode" maxlength="5" placeholder="短信验证码" />'+
					'<input class="code_btn js_pwdVCodes" type="button" value="获取验证码">'+
				'</li>'+
				'<li><input type="password" class="pwd js_setPwd" placeholder="设置新的论坛独立密码" /></li>'+
				'<li>'+
					'<input type="password" class="pwd js_confirmPwd" placeholder="确认新密码" />'+
					'<span class="setting_error js_loginError">请输入手机号</span>'+
				'</li>'+
				'<li class="setPwd_btn">'+
					'<button data-status="false" class="submitPwd_btn js_userEditPwd">确认</button>'+
				'</li>'+
			'</ul>'+
		'</div>'+
	'</div>'
	function User_editorPwd(){
		//用户中心修改密码
    }
    User_editorPwd.prototype = {
    		init:function(){    			
    			var _this=this;
				//初始化短信类型
				daoPwdChinaCaptcha = configCaptcha({
	                captchaInWrap: ".js_configCaptchaPopIn",//内嵌验证码容器（简单，复杂）
	                cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
	                data: { //参数
	                    bid: "qnbpunatrcjq"//区分不同业务 非空
	                },
	                isCaptchaOnePop:true, //简单、复杂验证码都在弹层显示
	                comIn: false, //复杂验证码是否内嵌 true:内嵌  false：弹层 
	                isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
	                inputaccName: "Account", //自定义隐藏域name名称
	                inputName: "captchaForPwd",//自定义账号name名称(失去焦点时验证是否需要验证码)
	                inputCookieName: "cookiesForPwd"//自定义隐藏域cookie name名称
                });
 				daoPwdChinaCaptcha.init();//初始化验证码

                $(".js_editPwdBtn").on("click",function(){					
					global_main.globalFn.checkLoginStatus(function(d){ //验证登录状态
                        if(d.data.nickname){
                            _this.showPwdPop();//展示修改密码弹层
							_this.showPhoneNum();//展示带*的手机号码
							$(".js_userEditPwd").attr("data-status","false");												
                        }else{
                            login_main.settingNickPop();
                            $(".js_userEditPwdPop ").hide();                           
                        }
                	})
                });				

    		},
    		//显示修改密码层
            showPwdPop:function(){
                var _this=this;
                if(!$(".js_userEditPwdPop").length){
                    $("body").append(pwdPopHtml);
					_this.trailPwdEvent();               
                }
                login_main.tcCenter($(".js_userEditPwdPop"));
                login_main.closeLogin(".js_userEditPwdPop .js_close","password");
            },			
			//展示手机号码接口
			showPhoneNum:function(){
				$.ajax({
					url:maskPhone,
					type: "GET",
					dataType: "JSON",
					data: {
						r: Math.random()
					},
					success:function(d){
						if(d.status=="success"){
							$(".js_verifyPhone").text(d.data);							
						}else{
							$(document).errorDataOperateFn(d);//异常处理
						}
					}
				});
			},
			//修改密码获取验证码接口
			pwdCaptchaAjaxFn:function(){
				var isNeedCapt=true;
				var cookieValue=$("input[name='cookiesForPwd']").val();
				var captchaCode=$("input[name='captchaForPwd']").val();
				if(daoPwdChinaCaptcha.captcahSwitchOpen==-1){
					cookieValue="";
					captchaCode="";
					isNeedCapt=false;
				}
				$.ajax({
					url:getVerifyCode,
					type: "POST",
					dataType: "JSON",
					data: {
						cookieValue:cookieValue,//cookieValue
						captchaCode:captchaCode,//验证码值						
						r: Math.random()
					},
					beforeSend:function(){
						$(".js_pwdVCodes").attr("data-statuss","false");
					},
					success:function(d){
						if(d.status=="success"){
							 //60秒倒计时
							 $(".js_pwdVCodes").attr("data-statuss","false");						
							 login_main.settimeForYZM($(".js_pwdVCodes"),$(".js_verifyPhone"),d.data.CountDownTime);//倒计时
							 daoPwdChinaCaptcha.closeCaptchaPop();//关闭验证码弹层
							 login_main.errorShow("","succ");
						}else if(d.status=="captchaFailed"){
	                    	 if(isNeedCapt){
	                    		 daoPwdChinaCaptcha.callbackCaptchaErrorFn(true); //验证码错误提示
	                    		 daoPwdChinaCaptcha.refreshCaptcha($(".js_configCaptchaPopIn"));//刷新验证码
	                    	 }else{
	                    		 login_main.errorShow(d.message);
	                    	 }
	                    	 $(".js_pwdVCodes").attr("data-statuss","true");
	                     }else{
	                    	 if(isNeedCapt){
	                    		 daoPwdChinaCaptcha.closeCaptchaPop();
	                    	 }
	                    	 login_main.errorShow(d.message);
	                    	 $(".js_pwdVCodes").attr("data-statuss","true");
	                     }
					},
					error:function(){
						$(".js_pwdVCodes").attr("data-statuss","true");
					}
				})
			},
			
			//修改密码提交接口
			editorPwdAjaxFn:function(){				
				var _this=this;
				var setPwd=$(".js_setPwd").val();
				var stConfirm=$(".js_confirmPwd").val();	
				var setCode=$(".pwd_getCode").val();
				_this.formVerify("code");	
				$.ajax({
					url:passwordModify,
					type: "POST",
					dataType: "JSON",
					data: {
						password:setPwd,//新密码
						confirm:stConfirm,//确认新密码
						verifyCode:setCode,//短信验证码
						r: Math.random()
					},
					beforeSend:function(){
						$(".js_userEditPwd").attr("data-status","false");
					},
					success:function(d){
						if(d.status=="success"){	
							$(".js_userEditPwdPop .js_close").click();						
							$(document).popErrorF({
								type:"open",
								tip:"修改成功",
								closeFn:function(){
									location.reload();//刷新页面	
								}
							});
													
						}else{			
							login_main.errorShow(d.message,"error");			
							
						}
					},
					complete:function(){
						$(".js_userEditPwd").attr("data-status","true");
					}
				})
			},
			//修改密码验证验证
			formVerify:function(inputType){
				var regEmpty = new RegExp(/.+/);//空
			    var regsetPwdPwd = new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{4,16}$/);//4-16数字和字符
				var setPwd=$(".js_setPwd").val();
				var stConfirm=$(".js_confirmPwd").val();	
				var setCode=$(".pwd_getCode").val();
				switch(inputType){
					case 'password':
						if(!regEmpty.test(setPwd)){
							login_main.errorShow("请输入论坛密码","error");
							login_main.forbidSpacingFn($("input[type='password']"));								
							$(".js_userEditPwd").attr("data-status","false");
							return false;
						}else{
							if(!regsetPwdPwd.test(setPwd)){
								login_main.errorShow("请输入4-16位英文和数字组成的密码","error");	
								login_main.forbidSpacingFn($("input[type='password']"));
								$(".js_userEditPwd").attr("data-status","false");
								return false;
							}else if(setPwd!==stConfirm&&regEmpty.test(stConfirm)){
								login_main.errorShow("两次输入的密码不一致，请重新输入","error");							
								login_main.forbidSpacingFn($("input[type='password']"));
								$(".js_userEditPwd").attr("data-status","false");
								return false;							
							}else{								
								verifySucc("请输入论坛密码");										
							}
						}
					break;
					case 'confirm':
						if(!regEmpty.test(stConfirm)){
							login_main.errorShow("请输入确认密码","error");
							login_main.forbidSpacingFn($("input[type='password']"));
							$(".js_userEditPwd").attr("data-status","false");
							return false;
						}else{
							if(!regsetPwdPwd.test(stConfirm)){					
								login_main.errorShow("请输入4-16位英文和数字组成的确认密码","error");	
								login_main.forbidSpacingFn($(".userEditPwd_content .js_confirmPwd"));
								$(".js_userEditPwd").attr("data-status","false");
								return false;
							}else if(setPwd!==stConfirm&&regEmpty.test(setPwd)){
								login_main.forbidSpacingFn($("input[type='password']"));
								login_main.errorShow("两次输入的密码不一致，请重新输入","error");							
								$(".js_userEditPwd").attr("data-status","false");
								return false;							
							}else{								
								verifySucc("请输入确认密码");		
							}
						}
					break;
					default:
						if(!regEmpty.test(setCode)){
							login_main.errorShow("短信验证码不能为空","error");	
							$(".js_userEditPwd").attr("data-status","false");
							return false;
						}else if(!regEmpty.test(setPwd)){
							login_main.errorShow("请输入论坛密码","error");							
							login_main.forbidSpacingFn($("input[type='password']"));
							$(".js_userEditPwd").attr("data-status","false");
							return false;
						}else if(!regEmpty.test(stConfirm)){
							login_main.errorShow("请输入确认密码","error");
							login_main.forbidSpacingFn($("input[type='password']"));
							$(".js_userEditPwd").attr("data-status","false");
							return false;
						}else if(setPwd!==stConfirm){
							login_main.errorShow("两次输入的密码不一致，请重新输入","error");							
							login_main.forbidSpacingFn($("input[type='password']"));
							$(".js_userEditPwd").attr("data-status","false");
							return false;
						}else{
							login_main.errorShow("","succ");
							$(".js_userEditPwd").attr("data-status","true");
						}
					break;
				}
				function verifySucc(errorTxt){
					login_main.errorShow("","succ");							
					if(setPwd==stConfirm&&regEmpty.test(setCode)){								
						$(".js_userEditPwd").attr("data-status","true");
						return true;
					}else if(setPwd!==stConfirm&&regEmpty.test(setCode)&&regEmpty.test(stConfirm)){
						login_main.errorShow("两次输入的密码不一致，请重新输入","error");
						$(".js_userEditPwd").attr("data-status","false");
						return false;
					}else if(setPwd!==stConfirm&&regEmpty.test(setCode)&&!regEmpty.test(stConfirm)){
						login_main.errorShow("请输入确认密码","error");
						$(".js_userEditPwd").attr("data-status","false");
						return false;
					}else{
						var errorContent=!regEmpty.test(setCode)?"短信验证码不能为空":errorTxt
						login_main.errorShow(errorContent,"error");
						$(".js_userEditPwd").attr("data-status","false");
						return false;
					}
				}
			},
			//关闭验证码弹层后继续按钮操作
			captchaCloseFn:function(obj){
				obj.attr("data-status","false");
				$(".js_configCaptcha_close").on("click",function(){
					obj.attr("data-statuss","true");
				});
			},
			//后置事件处理
			trailPwdEvent:function(){					
				var _this=this;				
				$(".js_pwdVCodes").on("click",function(){	
					login_main.errorShow("","succ");
					if($(this).attr("data-statuss")=="false"){
						return false;						
					}
					$(this).attr("data-statuss","false");
					if(daoPwdChinaCaptcha.captcahSwitchOpen!=-1){						
						daoPwdChinaCaptcha.openCaptchaOnePop(user_editorPwd().pwdCaptchaAjaxFn);							
						//调整验证码层级样式,第一个弹框，第二个参数是遮罩层
						login_main.popLevelFn(".configCaptchaPopWrap",".configCaptchaMask",2002000,1003000);
						_this.captchaCloseFn($(".js_pwdVCodes"))
						return false;
					}
						_this.pwdCaptchaAjaxFn();
				});
				
				$(".js_setPwd").on("blur",function(){
					_this.formVerify("password");	
				});
				$(".js_confirmPwd").on("blur",function(){
					_this.formVerify("confirm");
				});
							
				$(".js_getCode").on("blur",function(){
					if($(".js_getCode").val()==""&&$(".js_setPwd").val()==""&&$(".js_confirmPwd").val()==""){						
						login_main.errorShow("短信验证码不能为空","error");								
					}else{
						_this.formVerify("code");
					}
					
				});
				$(".js_userEditPwd").on("click",function(){	
					if($(".js_getCode").val()==""&&$(".js_setPwd").val()==""&&$(".js_confirmPwd").val()==""){						
						login_main.errorShow("短信验证码不能为空","error");								
					}							
					if($(this).attr("data-status")=="false"){
						return false;
					}				
					_this.formVerify("code");
					_this.editorPwdAjaxFn();//提交修改密码
				});
			}
    };
    window.user_editorPwd = function(){
        return new User_editorPwd();
    };
})();
$(function(){
   user_editorPwd().init()   
})


