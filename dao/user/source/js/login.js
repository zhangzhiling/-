/*
 * mxm
 *登录功能，含短信，密码，二维码 
 * 1.0
 * 0:短信登录 1：密码:登录
 */

var login_main=(function(){
	//提交同步数据接口
	var sysData = "/user/sync/data";
	//获取需要同步的道具信息
	var getWealthInfoList = "/wealth/user/combined/info";
	//获取需要同步的发帖量、回帖量、评论量
	var getForumPostList = "/forum/sync/getThreadInfo";
	//获取需要同步的用户信息
	var getUserInfoList = "/user/sync/getUserInfoList"
	//论坛设置密码接口
	 var setPasswordUrl = "/user/password/set";
	 //新用户进入论坛设置昵称接口
	 var setNickdUrl = "/user/member/nickname";
	 //提交登录
	 var sureLogin="/user/login/sms";
	 //密码登录
	 var loginPassword="/user/login/password";
	 //获取短信验证码
    var getVerifyCode="/user/login/getVerifyCode";
    //短信验证码创建
    var daoLoginChinaCaptcha=null;
    //账号验证码创建
    var daoLoginChinaCaptchaAccount=null;
    //手机绑定倒计时
    var timeSForPhone=null; 
	//二维码扫描开关接口
	var qrCodeNew="/user/qrCode/new";
	//二维码状态接口
	var qrCodeStatus="http://conn.dao.gyyx.cn/qrCode/status";
	//二维码登录接口
	var qrCodeLogin="/user/qrCode/login";
    //loading层
	var loadPop=''+
	'<div class="tc tc04 js_loading">'+
		'<div class="con">'+
			'<p class="js_loadMsg">数据同步中，请稍后....</p>'+
		'</div>'+
	'</div>'
	//同步数据弹层
	var syncDataPop=''+
	'<div class="selectNewAccount_wrapper js_syncDataPop tc">'+
	'<div class="selectNewAccount_scroll">'+
		'<div class="selectNewAccount_top">'+
			'<h3 class="selectAccount_title">生成您的新账号</h3>'+
			'<p class="selectAccount_content">检测到该手机号下关联的帐号，已在论坛活跃过，所以相关昵称、银符钱、动态等需要进行合并，请仔细查看下面的最终合并结果。</p>'+
		'</div>'+
		'<div class="account_userNick">'+
			'<h3 class="nick_title">请选择新账号的昵称</h3>'+
			'<div class="nick_wrapper js_nickWrapper">'+
			'</div>'+
		'</div>'+
		'<div class="account_userNick">'+
			'<h3 class="nick_title">新账号信息</h3>'+
			'<ul class="account_info">'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">身份:</span>'+
					'<div class="lf info_identity js_infoIdentity">'+
					'</div>'+
					'<span class="info_notice ri">所有账号的身份信息</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">金符钱:</span>'+
					'<span class="lf info_num js_wealthJin">0</span>'+
					'<span class="info_notice ri">所有账号的金符钱之和</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">银符钱:</span>'+
					'<span class="lf info_num js_wealthYin">0</span>'+
					'<span class="info_notice ri">所有账号的银符钱之和</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf ">粉丝数:</span>'+
					'<span class="lf info_num js_followMeCount">0</span>'+
					'<span class="info_notice ri">所有账号的粉丝数</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">关注数:</span>'+
					'<span class="lf info_num js_meFollowCount">0</span>'+
					'<span class="info_notice ri">所有账号的关注数</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">发帖数:</span>'+
					'<span class="lf info_num js_fourmCount">0</span>'+
					'<span class="info_notice ri">所有账号的发帖之和</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">回帖数:</span>'+
					'<span class="lf info_num js_replyCount">0</span>'+
					'<span class="info_notice ri">所有账号的回帖之和</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">评论数:</span>'+
					'<span class="lf info_num js_commentCount">0</span>'+
					'<span class="info_notice ri">所有账号的评论之和</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">收取道具:</span>'+
					'<div class="inventory_wrapper js_receivedGifts lf"></div>'+
					'<span class="info_notice ri">所有账号的收取道具之和</span>'+
				'</li>'+
				'<li class="account_infoLi">'+
					'<span class="info_title lf">库存道具:</span>'+
					'<div class="inventory_wrapper js_inventory lf"></div>'+
					'<span class="info_notice ri">所有账号的库存道具之和</span>'+
				'</li>'+
			'</ul>'+
			'<span class="submit_error js_loginError">请提交失败，请您重新提交</span>'+
			'<button data-status="true" class="submit_btn js_submit">提交</button>'+
		'</div>'+
	'</div>'+
'</div>'
	//设置论坛密码弹层
	var settingPop=''+
	'<div class="setting_pop js_settingPop tc">'+
		'<h3 class="title">设置论坛密码</h3>'+
		'<ul class="setPwd_wrapper">'+
			'<li class="setPwd_li">'+
				'<input type="password" class="js_setPwd" maxlength="16" placeholder="设置论坛独立密码，非光宇账号密码" /> '+
			'</li>'+
			'<li class="setPwd_li">'+
				'<input type="password" class="js_verifyPwd" maxlength="16" placeholder="确认密码" /> '+
				'<span class="setting_error js_loginError"></span>'+
			'</li>'+
			'<li class="setPwd_btn">'+
				'<button data-status="false" class="submitPwd_btn js_setPwdBtn">确认</button>'+
			'</li>'+
			'<li class="remind">提示：为了您的安全，建议不要使用社区密码</li>'+
		'</ul>'+
	'</div>';
	//设置昵称弹层
	var settingNick=''+
	'<div class="setting_pop js_settingNick tc">'+
		'<h3 class="title">设置昵称</h3>'+
		'<ul class="setPwd_wrapper">'+
			'<li class="setPwd_li">'+
				'<input type="text" class="js_setNick" maxlength="10" placeholder="昵称最多10个字" />'+
				'<span class="setting_error js_loginError"></span>'+
			'</li>'+
			'<li class="setPwd_btn">'+
				'<button data-status="false" class="submitPwd_btn js_setNickBtn">确认</button>'+
			'</li>'+
			'<li class="setPwd_txt"><a class="skip js_skip">以后再说</a></li>'+
			'<li class="code_txt">提示：昵称设置后不可修改</li>'+
		'</ul>'+
	'</div>';
	 
	 //登录模块
	 var loginHtml='<div class="login_wrapper js_userForLogin tc" style="overflow:visible">'+
					'<i class="js_close cursor" style="right:-40px"></i>'+
					 '<div class="lf login_left">'+
					 '<div class="nocodeImg"></div>'+
					  '<div class="code_wrapper js_codeWrapper">'+
					   '<div class="code_icon">'+
					    '<div class="code_box" id="js_codeBox"></div>'+
					    '<div class="login_code_shade js_codeShade">'+
					     '<div class="login_code_cover js_clickCode">'+
					      '<i class="login_code_getNew">图标</i>'+
					      '<p class="login_code_get">点击刷新</p>'+
					     '</div>'+
					    '</div>'+
					   '</div>'+
					   '<p class="code_lefTxt">使用<a href="http://wd.gyyx.cn/huodong/app/index.html" target= _blank>光宇游戏APP</a>扫码安全登录</p>'+
					   '<span class="codeError js_codeError"></span>'+
					  '</div>'+
					 '</div>'+
					 '<div class="ri login_right">'+
					  '<ul class="login_head_tab js_loginType">'+
					   '<li class="lf cur">短信登录</li>'+
					   '<li class="ri">密码登录</li>'+
					  '</ul>'+
					  '<div class="login_content_tab js_login_content_tab">'+
					   '<ul class="message_login">'+
					    '<li class="phone_li"><input type="text" class="phone js_phonev" maxlength="11" placeholder="手机号" /></li>'+
					    '<li class="phone_li"><input type="text" class="phone_code js_phoneCode" maxlength="5" placeholder="短信验证码" /><input class="code_btn js_loginVCodes" readonly="readonly" type="button" value="获取验证码" /></li>'+
					   '</ul>'+
					   '<ul class="pwd_login">'+
					    '<li class="phone_li"><input type="text" class="phone js_phonev" maxlength="11" placeholder="手机号"/></li>'+
					    '<li class="phone_li"><input type="password" class="phone js_phonePwd" maxlength="16" placeholder="论坛独立密码，非光宇账号密码" /></li>'+
					   '</ul>'+
					   '<div class="login_public">'+
					    '<span class="phone_error js_loginError"></span>'+
					    '<div class="login_li"><button class="login_btn js_ajaxLogin">登录</button></div>'+
					    '<div class="login_li"><input type="checkbox" checked class="seven_days js_seven_days"/>7天自动登录</div>'+
					    '<div class="code_txt">提示：新用户请直接用短信登录</div>'+
					   '</div>'+
					  '</div>'+
					 '</div>'+
					'</div>';
		
	function UserLogin(){		
		this.qrCodeStatusTimer = false;  //二维码状态是否过期，true，有效，false，失效
	}
	/*
	 * 扩展方法
	 * */
	UserLogin.prototype={
			//初始化登录
			init:function(){
				
				var _this=this;
				//初始化短信类型
				daoLoginChinaCaptcha = configCaptcha({
	                captchaInWrap: ".js_configCaptchaPopIn",//内嵌验证码容器（简单，复杂）
	                cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
	                data: { //参数
	                    bid: "qnbcubarert"//区分不同业务 非空
	                },
	                isCaptchaOnePop:true, //简单、复杂验证码都在弹层显示
	                comIn: false, //复杂验证码是否内嵌 true:内嵌  false：弹层 
	                isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
	                inputaccName: "Account", //自定义隐藏域name名称
	                inputName: "CaptchaForPhoneMsg",//自定义账号name名称(失去焦点时验证是否需要验证码)
	                inputCookieName: "cookiesForPhoneMsg"//自定义隐藏域cookie name名称
                });
				//初始化账号类型
			   daoLoginChinaCaptchaAccount = configCaptcha({
		            captchaInWrap: ".js_configCaptchaPopIn",//内嵌验证码容器（简单，复杂）
		            cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
		            data: { //参数
		                bid: "qnbcnffjbeqert"//区分不同业务 非空
		            },
		            isCaptchaOnePop:true, //简单、复杂验证码都在弹层显示
		            comIn: false, //复杂验证码是否内嵌 true:内嵌  false：弹层 
		            isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
		            inputaccName: "Account", //自定义隐藏域name名称
		            inputName: "CaptchaForAccount",//自定义账号name名称(失去焦点时验证是否需要验证码)
		            inputCookieName: "cookiesForAccount"//自定义隐藏域cookie name名称
			   });
			   daoLoginChinaCaptcha.init();//初始化验证码
			   daoLoginChinaCaptchaAccount.init();//初始化验证码
				$(".js_userLogin").on("click",function(){
					  _this.showLogin();	  
					  
				});
			},
			//弹层居中
            tcCenter:function(obj,fn){
                var w=$(window).width(),
                    h=$(window).height(),
                    objW=$(obj).width(),
                    objH=$(obj).height();
                $(obj).css({
                    "left":(w-objW)/2+'px',
                    "top":(h-objH)/2+'px'
                });
              //浏览器窗口改变时弹框居中显示-dcs
                $(window).resize(function(){
                	 var r_w=$(window).width(),
	                	 r_h=$(window).height(),
	                	 r_obj=$(obj).width(),
	                	 r_objH=$(obj).height();
                	
                	$(obj).css({
                        "left":(r_w-r_obj)/2+'px',
                        "top":(r_h-r_objH)/2+'px'
                    });
                });
                $(".bgT").show();
                $(obj).show();
                if(fn){
                    fn();
                }
            },
            //验证码弹框层，层级显示
            popLevelFn:function(elePopWrap,eleShade,zIndexPopWrap,zIndexeleShade){
            	$(elePopWrap).css("z-index",zIndexPopWrap);//弹层
        		$(eleShade).css("z-index",zIndexeleShade);//遮罩层
            },
			//loading层展示
			showLoading:function(d){
				var _this=this;
				if(!$(".js_loading").length){
					$("body").append(loadPop);
					$(".js_loading .js_loadMsg").html(d.message);
					$(".js_settingPop,.js_userForLogin,.js_settingNick").hide();//隐藏其他弹框
				}
				_this.tcCenter($(".js_loading"));
			},
            //展示同步数据层
            showSyncDataPop:function(){
            	var _this=this;
            	if(!$(".js_syncDataPop").length){
					$("body").append(syncDataPop);
					$(".js_settingPop,.js_userForLogin,.js_settingNick").hide();//隐藏登录弹框
					_this.setSyncDataFn()
				}
            	_this.synchroUserInfoAjax();//展示同步数据用户信息
            	_this.synchroForumPostAjax();//展示同步数据发帖量、回帖量、评论量
            	_this.synchroWealthInfoAjax();//展示同步数据，财富、道具，库存信息
				_this.tcCenter($(".js_syncDataPop"));
            },
			//展示设置论坛密码层
			settingPop:function(){
				var _this=this;
				if(!$(".js_settingPop").length){
					$("body").append(settingPop);
					$(".js_userForLogin,.js_userForLogin,.js_syncDataPop").hide();//隐藏登录弹框
					_this.setDaoPwdFn();
				}
				_this.tcCenter($(".js_settingPop"));
			},
			//展示设置昵称码层
			settingNickPop:function(){
				var _this=this;
				if(!$(".js_settingNick").length){
					$("body").append(settingNick);
					$(".js_settingPop,.js_userForLogin,.js_syncDataPop").hide();//隐藏设置论坛密码弹框
					_this.setDaoNickFn();
				}
				_this.tcCenter($(".js_settingNick"));
			},
			//显示登录层
			showLogin:function(){
				var _this=this;
				if(!$(".js_userForLogin").length){
					$("body").append(loginHtml);
					$(".js_settingPop,.js_settingNick,.js_syncDataPop").hide();//隐藏设置论坛密码弹框	
					_this.loginType(0);
					_this.trailLoginEvent();					
				}
				_this.qrCodeStatusTimer=true; //二维码状态是否过期，true，有效，false，失效
				_this.codeLoginOpenAndClosedAjax()//二维码展示开关
				_this.tcCenter($(".js_userForLogin"));
				_this.closeLogin(".js_userForLogin .js_close","login");
			},
			//密码禁止输入空格
			forbidSpacingFn:function(obj){
				var _this=this;
				var spacing=/\s/; //空格
				if(spacing.exec(obj.val())!==null){
					_this.errorShow("密码包含空格,请输入4-16位英文和数字","error");
					return false;
				}	
			},
			//关闭登录弹层
			closeLogin:function(closeBtn,type){//type为类型
				var _this=this;
				$(document).on("click",closeBtn,function(){
					var thisParents=$(this).parents(".tc");					
					if(type=="password"){
						thisParents.find(".userEditPwd_ul .js_pwdVCodes").attr("data-statuss","true").prop("disabled",false).val("获取验证码").removeClass("notAllowed");
						thisParents.find("input[type='password'],.pwd_getCode").val("");
					}else{
						$(".js_login_content_tab input[type='text'],.js_login_content_tab input[type='password']").val("");					
						$(".js_loginVCodes").data("repeatForA",true).prop("disabled",false).val("获取验证码").removeClass("notAllowed");	
						$("#infoEdit .nickname").prop("disabled",false);					
						$(".js_phonev").prop("disabled",false).removeClass("notAllowed");					
						$(".js_loginType li:eq(0)").addClass("cur").siblings().removeClass("cur");
						_this.loginType(0);
						$(".js_login_content_tab>ul").hide().eq(0).show();						
					}
					_this.qrCodeStatusTimer=false;//二维码状态是否过期，true，有效，false，失效
					_this.codeLoginOpenAndClosedAjax();
					$(".js_tradRecord").attr("data-status","true")
					clearInterval(timeSForPhone);//清楚倒计时定时器
					_this.errorShow("");
					$(".js_codeError").html("");
					thisParents.hide();
					$(".bgT").hide();
				})
			},
			//登录类型
			loginType:function(type){
				$(".js_ajaxLogin").data("loginType",type);
			},
	        //验证码倒计时
            settimeForYZM:function(objCode,disObj,countTime){
                var countdown=countTime;
                timeSForPhone=setInterval(function() {
                	$(".js_loginVCodes").data("repeatForA",true);
					//修改密码验证码按钮状态设置
					$(".js_pwdVCodes").attr("data-statuss","true");
                    if (countdown == 0) {
                    	 clearInterval(timeSForPhone);
                    	 disObj.prop("disabled",false).removeClass("notAllowed");
                    	 objCode.prop("disabled",false).removeClass("notAllowed");
                    	 objCode.val("获取验证码");
                        countdown = countTime;
                        return false;
                    } else {
                    	disObj.prop("disabled",true).addClass("notAllowed");
                    	objCode.prop("disabled",true).addClass("notAllowed");
                        objCode.val("还差" + countdown + "s");
                        countdown--;
                    }
                },1000);
            },
			//获取短信验证码
			loginCaptchaAjaxFn:function(obj){
				var _this=this;
				if(obj!="me"){
					_this=login_main;
				}
				var isNeedCapt=true;
				var cookieValue=$("input[name='cookiesForPhoneMsg']").val();
				var codeValue=$("input[name='CaptchaForPhoneMsg']").val();
				if(daoLoginChinaCaptcha.captcahSwitchOpen==-1){
					cookieValue="";
					codeValue="";
					isNeedCapt=false;
				}
				var phoneValue=$.trim($(".js_phonev:visible").val());//手机号
				 $.ajax({
	        		 url:getVerifyCode,
	                 type: "POST",
	                 dataType: "JSON",
	                 data: {
	                	 cookieValue:cookieValue,//cookieValue
				 		 captchaCode:codeValue,//验证码值
				 		 phone:phoneValue,//手机号
	                	 r: Math.random()
	                 },
	                 beforeSend:function(){
	                	 $(".js_loginVCodes").data("repeatForA",false);
	                 },
	                 success:function(d){
	                     if(d.status=="success"){
	                    	 //60秒倒计时
	                    	 $(".js_loginVCodes").data("repeatForA",false);
	                    	 _this.settimeForYZM($(".js_loginVCodes"),$(".js_phonev:visible"),d.data.CountDownTime);
                    		 daoLoginChinaCaptcha.closeCaptchaPop();
                    		 _this.errorShow("");
	                     }else if(d.status=="captchaFailed"){
	                    	 if(isNeedCapt){
	                    		 daoLoginChinaCaptcha.callbackCaptchaErrorFn(true); //验证码错误提示
	                    		 daoLoginChinaCaptcha.refreshCaptcha($(".js_configCaptchaPopIn"));//刷新验证码
	                    	 }else{
	                    		 _this.errorShow(d.message);
	                    	 }
	                    	 $(".js_loginVCodes").data("repeatForA",true);
	                     }else{
	                    	 if(isNeedCapt){
	                    		 daoLoginChinaCaptcha.closeCaptchaPop();
	                    	 }
	                    	 _this.errorShow(d.message);
	                    	 $(".js_loginVCodes").data("repeatForA",true);
	                     }
	                 },
	                 error:function(){
	                	 $(".js_loginVCodes").data("repeatForA",true);
	                 }
	             });
				
			},
			//登录错误提示
			errorShow:function(msg,status){
				var fontColor = status=="succ"?"#67db44":"#f85959";
				$(".js_loginError").html("").css("visibility","hidden");
				if(msg){
					$(".js_loginError").html(msg).css({
						"visibility":"visible",
						"color":fontColor
					});
				}
			},
			//表单验证
			formVerify:function(type,detectionC){
				var _this=this;
			    var regEmpty = new RegExp(/.+/);
			    var regPhone = new RegExp(/^1\d{10}$/);
			    var regPhonePwd = new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{4,16}$/);
			    function regPhones(){
			    	var phoneV=$(".js_phonev:visible").val();
			    	if(!regEmpty.test(phoneV)){
		    		   _this.errorShow("请输入手机号","error");
		    		   return false;
					}else if(!regPhone.test(phoneV)){
						_this.errorShow("请输入11位有效手机号","error");
						return false;
					}
			    	return true;
			    }

			    switch(type){
			      case 'phone':
			    	   //短信登录验证
					    function regPhonesCode(){
					    	var phoneCodeV=$(".js_phoneCode").val();
					    	if(!regEmpty.test(phoneCodeV)){
					    		_this.errorShow("请输入验证码","error");
					    		return false;
					    	}
							_this.errorShow("","succ");	
					    	return true;
				        }
			    	   if(detectionC=="all"){
			    		  return regPhones()&&regPhonesCode();
			    	   }else if(detectionC=="phones"){
			    		   return regPhones();
			    	   }else if(detectionC=="phonesCode"){
			    		   return regPhonesCode();
			    	   }
			    	   break;
			      case 'pwdlogin':
			    	  //密码登录验证
					    function regPassWord(){
					    	var phonePwd=$(".js_phonePwd").val();
					    	if(!regEmpty.test(phonePwd)){
					    		_this.errorShow("请输入密码","error");
								_this.forbidSpacingFn($("input[type='password']"));
					    		return false;
					    	}else if(!regPhonePwd.test(phonePwd)){
					    		_this.errorShow("请输入4-16位英文和数字组成的密码","error");
								_this.forbidSpacingFn($("input[type='password']"));
					    		return false;
					    	}
							_this.errorShow("","succ");	
					    	return true;
				        }
					    
			    	   if(detectionC=="all"){
				    		return regPhones()&&regPassWord();
				       }else if(detectionC=="phones"){
				    		return regPhones();
				       }else if(detectionC=="phonePwd"){
				    		return regPassWord();
				       }
			    	   break;
					default:
                    break;
			    }
			},
			//头部未设置昵称方法
			headNoNickNameFn:function(){
				$(".centerHeard .js_userLogin").hide();
    			$(".centerHeard .userInfo").show();
    			$(".userInfo .js_nc,.details .usN").text("未设置昵称");
												
			},			
			//短信登录提交
			loginAjax:function(){
				var _this=this;
				var isChecked=$(".js_seven_days").is(":checked") ? true : false ;
				var phoneNum=$(".js_phonev:visible").val();
				var verifyCodes=$(".js_phoneCode").val();
			   	 $.ajax({
	        		 url:sureLogin,
	                 type: "POST",
	                 dataType: "JSON",
	                 data: {
	                	flag:isChecked,
	 					phone:phoneNum,
	 					verifyCode:verifyCodes,
	 					r:Math.random()
	                 },
	                 beforeSend:function(){
	                	 $(".js_ajaxLogin").data("repeatForA",false);
	                 },
	                 success:function(d){
	                	 _this.errorShow("","succ");
	                	 if(d.status=="success"){
							 location.reload();//刷新页面
	                	 }else if(d.status=="suspend"){
	                		 $(".js_userForLogin,.bgT").hide();//隐藏登录弹框
	                		 $(document).errorDataOperateFn(d); 	                         
	                	 }else{
	                		 if(d.message=="验证短信验证码异常"){
	                			 d.message="短信验证码错误";
	                		 }
	                		 _this.errorShow(d.message,"error");
	                	 }
	                 },
	                 error:function(){
	                	 _this.errorShow("登录异常，请重试","error"); 
	                 },
	                 complete:function(){
	                	 $(".js_ajaxLogin").data("repeatForA",true);
	                 }
	             });
			},
			//密码登录提交
			loginAjaxForPwd:function(obj){
				var _this=this;
				if(obj!="me"){
					_this=login_main;
				}
				var isChecked=$(".js_seven_days").is(":checked") ? true : false ;				
				var phoneNum=$.trim($(".pwd_login .js_phonev").val());
				var password=$.trim($(".pwd_login .js_phonePwd").val());					
					password=hex_md5(password);
				var isNeedChpta=daoLoginChinaCaptchaAccount.captcahSwitchOpen;
				var verifyCodes=isNeedChpta!=-1 ? $("input[name='CaptchaForAccount']").val() : "";
				var cookieValue=isNeedChpta!=-1 ? $("input[name='cookiesForAccount']").val() : "";
			   	 $.ajax({
	        		 url:loginPassword,
	                 type: "POST",
	                 dataType: "JSON",
	                 data: {
	 					phone:phoneNum,
	 					password:password,
	 					cookieValue:cookieValue,
	 					verifyCode:verifyCodes,
	 					flag:isChecked,
	 					r:Math.random()
	                 },
	                 beforeSend:function(){
	                	 $(".js_ajaxLogin").data("repeatForA",false);
	                 },
	                 success:function(d){
	                	 _this.errorShow("","succ");
	                	 if(d.status=="success"){
	                		 location.reload();
	                	 }else if(d.status=="suspend"){
	                		 daoLoginChinaCaptcha.closeCaptchaPop();//关闭验证码
	                		 $(".js_userForLogin,.bgT").hide();//隐藏登录弹框
	                		 $(document).errorDataOperateFn(d); 	                         
	                	 }else{
	                		 if(d.message=="验证码错误"&&isNeedChpta!=-1){
	                			 daoLoginChinaCaptchaAccount.callbackCaptchaErrorFn(true); //验证码错误提示
                         daoLoginChinaCaptchaAccount.refreshCaptcha($(".js_configCaptchaPopIn"));//刷新验证码
                         
	                		 }else{
	                			 daoLoginChinaCaptcha.closeCaptchaPop();//关闭验证码
								 $(".js_loginVCodes").data("repeatForA",true);
	                			 
	                			 _this.errorShow(d.message,"error");
	                			 
	                		 }
	                	 }
	                 },
	                 error:function(){
	                	 _this.errorShow("登录异常，请重试","error"); 
	                 },
	                 complete:function(){
	                	 $(".js_ajaxLogin").data("repeatForA",true);
	                 }
	             });
			},
			
			//关闭验证码弹层后继续登录按钮操作
			captchaCloseFn:function(obj){
				obj.data("repeatForA",false);
				$(".js_configCaptcha_close").on("click",function(){
					obj.data("repeatForA",true);
				});
			},
			//后置事件处理
			trailLoginEvent:function(){
				var _this=this;
				//登录类型选择
				$(".js_loginType li").on("click",function(){					
					var index=$(this).index();
					_this.errorShow("","error");
					$(this).siblings().removeClass("cur").end().addClass("cur");
					_this.loginType(index);
					$(".js_login_content_tab>ul").hide().eq(index).show();
				});
				//获取短信验证码
				$(".js_loginVCodes").on("click",function(){
					if($(this).data("repeatForA")==false){
						return false;
					}
					_this.errorShow("","error");
					if(_this.formVerify("phone","phones")){
						if(daoLoginChinaCaptcha.captcahSwitchOpen!=-1){
							daoLoginChinaCaptcha.openCaptchaOnePop(_this.loginCaptchaAjaxFn);
							_this.captchaCloseFn($(".js_loginVCodes"))
							//调整验证码层级样式,第一个弹框，第二个参数是遮罩层
							_this.popLevelFn(".configCaptchaPopWrap",".configCaptchaMask",2002000,1003000);
							return false;
						}
						_this.loginCaptchaAjaxFn("me");
					}
				   
				});
 
                //登录按钮回车事件
				$("body").keyup(function(e){
					if($(".login_wrapper").is(":visible") && e.keyCode==13){
						$(".js_ajaxLogin").click();
					}
				})

				//登录提交
				$(".js_ajaxLogin").on("click",function(){
					if($(this).data("repeatForA")==false){
						return false;
					}
					if(!$(".js_ajaxLogin").data("loginType")){
						//短信登录
						if(_this.formVerify("phone","all")){
							_this.loginAjax();
						}
					}else{
						//密码登录
						if(_this.formVerify("pwdlogin","all")){	
											
							if(daoLoginChinaCaptchaAccount.captcahSwitchOpen!=-1){								
								daoLoginChinaCaptchaAccount.openCaptchaOnePop(_this.loginAjaxForPwd);
								_this.captchaCloseFn($(".js_ajaxLogin"))
								//调整验证码层级样式,第一个弹框，第二个参数是遮罩层
								_this.popLevelFn(".configCaptchaPopWrap",".configCaptchaMask",2002000,1003000);
							}else{
								_this.loginAjaxForPwd("me");
							}
							
						}
					}
				});
				_this.clickGetNewCode();//更新二维码事件
			},

			//同步数据——财富/收取道具/库存道具
			synchroWealthInfoAjax:function(){
        		var _this=this;
				$.ajax({
					url:getWealthInfoList,
					type:"get",
					dataType:"JSON",
					data:{
						r:Math.random()
					},
					success:function(d){
						if(d.data.wealth){	//财富信息
							var wealth = d.data.wealth;
							wealth.jinfu?$(".js_wealthJin").text(wealth.jinfu):$(".js_wealthJin").text("0");//金符钱
	                		wealth.yinfu?$(".js_wealthYin").text(wealth.yinfu):$(".js_wealthYin").text("0");//银符钱
						}
						if(d.data.receivedGifts&&d.data.receivedGifts.length>0){	//收取道具信息
							var receivedHtml="";
							var receivedGifts = d.data.receivedGifts;
							for(var i=0;i<receivedGifts.length;i++){
								receivedHtml+='<div class="lf info_wealth">'+
													'<img src="'+receivedGifts[i].picUrl+'" class="lf prop_img" />'+
													'<span class="giver_num">×'+receivedGifts[i].amount+'</span>'+
												'</div>';
							}
							$(".js_receivedGifts").html(receivedHtml);
						}else{
							$(".js_receivedGifts").html("无");
						}
						if(d.data.inventory&&d.data.inventory.length>0){	//库存道具
							var inventoryHtml = "";
							var inventory = d.data.inventory;
							for(var ii=0;ii<inventory.length;ii++){
								inventoryHtml+='<div class="lf info_wealth">'+
												'<img src="'+inventory[ii].picUrl+'" class="lf prop_img" />'+
												'<span class="giver_num">×'+inventory[ii].amount+'</span>'+
											'</div>';
							}
							$(".js_inventory").html(inventoryHtml);
						}else{
							$(".js_inventory").html("无");
						}
					},
					error:function(d){
						_this.errorShow(d.message,"error"); 
					}
				})
			},
			//同步数据——展示发帖量、回帖量、评论量信息接口
			synchroForumPostAjax:function(){
				var _this=this;
				$.ajax({
					url:getForumPostList,
					type:"get",
					dataType:"JSON",
					data:{
						r:Math.random()
					},
					success:function(d){
						if(d.status=="success"){
							d.data.threadCount?$(".js_fourmCount").text(d.data.threadCount):$(".js_fourmCount").text("0");//发帖量
	                		d.data.postCount?$(".js_replyCount").text(d.data.postCount):$(".js_replyCount").text("0");//回帖量
	                		d.data.commentCount?$(".js_commentCount").text(d.data.commentCount):$(".js_commentCount").text("0");//评论量
						}
					},
					error:function(d){
						_this.errorShow(d.message,"error"); 
					}
				})
			},
			//同步数据——展示账号信息接口
			synchroUserInfoAjax:function(){
				var _this=this;
				$.ajax({
					url:getUserInfoList,
					type:"get",
					dataType:"JSON",
					data: {
	 					r:Math.random()
	                 },
	                 success:function(d){
	                	 if(d.status=="success"){
	                		 d.data.followMeCount?$(".js_followMeCount").text(d.data.followMeCount):$(".js_followMeCount").text("0");//粉丝量
	                		 d.data.meFollowCount?$(".js_meFollowCount").text(d.data.meFollowCount):$(".js_meFollowCount").text("0");//关注量
	                		 //用户信息
	                		 if(d.data.userList){
	                			 var userData=d.data.userList;
	                			 var userList="";
	                			 for(var i=0;i<userData.length;i++){
			                		 var avatarUrl=userData[i].avatarUrl?userData[i].avatarUrl:"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";//用户头像地址
			                		 var nickName=userData[i].nickname?userData[i].nickname:""; //昵称
			                		 var gameInfoStr=userData[i].areaName?userData[i].areaName+'<span class="synchroLine">|</span>'+userData[i].serverName+'<span class="followLine">|</span>'+userData[i].roleName:"暂无游戏信息";//游戏信息  大区   服务器  角色
			                		 var daoheng=userData[i].daoheng?userData[i].daoheng:"0";
			                		 var daoId=userData[i].daoId;
			                		 	 userList+=''+
					                		'<dl class="nick_dl lf js_wrapClick">'+
					     					'<dt class="nick_dt lf"><img src="'+avatarUrl+'" /></dt>'+
					     					'<dd class="nick_dd ri">'+
					     						'<h3 class="nick_title">'+nickName+'</h3>'+
					     						'<div class="nick_areaServe">'+gameInfoStr+'</div>'+
												 '<div class="hoverBox">'+gameInfoStr+'<i class="arrow"></i></div>'+
					     						'<div class="nick_grade">道行：'+daoheng+'</div>'+
					     					  '</dd>'+
					     					  '<span class="checkbox_imitate" data-user="'+daoId+'"></span>'+
					     					'</dl>'
		                		 } 
	                			 $(".js_nickWrapper").html(userList);
	                			 _this.areaServeHoverShowFn()
	                		 }
	                		 //身份信息
	                		 if(d.data.titleList&&d.data.titleList.length>0){
	                			 var identity=d.data.titleList;
	                			 var imgHtml="";
	                			 for(var j=0;j<identity.length;j++){
	                				 var titleId=identity[j].titleId;//身份ID
	                				 var titlePicUrl=identity[j].titlePicUrl;//身份图片路径
	                				 imgHtml+=''+
	                				 '<img src="'+titlePicUrl+'" class="lf identity_img js_identityImg" data-identity="'+titleId+'" />';
	                			 }
	                			 $(".js_infoIdentity").html(imgHtml);
	                		 }else{
	                		 	 $(".js_infoIdentity").html("暂无身份信息");
	                		 }
	                	 }
	                 },
	                 error:function(d){
	                	 _this.errorShow(d.message,"error"); 
	                 }
				})
			},

			//鼠标悬停区服的时候显示文字
			areaServeHoverShowFn:function(){
				$(".nick_dd").on("mouseenter",".nick_areaServe",function(){
					$(this).parents(".nick_dd").find(".hoverBox").show();					
				})

				$(".nick_dd").on("mouseleave",".nick_areaServe",function(){
					$(this).parents(".nick_dd").find(".hoverBox").hide()
				})	
			},
			//提交同步数据接口
			synchroDataAjax:function(obj,daoId,arrTitleId){
				var _this=this;
				$.ajax({
					url:sysData,
					type:"POST",
					dataType:"JSON",
					data: {
	                	daoId:daoId,
	                	titleIdStr:arrTitleId,
	 					r:Math.random()
	                 },
	                 beforeSend:function(){
	                 	 _this.errorShow("","succ");
						obj.setBtnStatusFn("false","同步数据请稍后...");	                 	
	                 },
	                 success:function(d){
	                	 if(d.status=="success"){
							obj.setBtnStatusFn("false","同步成功");
							location.reload();
	                	 }else{
	                		_this.errorShow(d.message,"error");
							obj.setBtnStatusFn("true","提交");	
	                	 }
	                 },
	                 complete:function(){
						 obj.setBtnStatusFn("true","提交");	                 	
	                 }
				})
			},
			//设置论坛密码接口
			setPasswordAjaxFn:function(obj){
				var _this=this;
				var password=$(".js_setPwd").val();
				var confirm=$(".js_verifyPwd").val();
				$.ajax({
					 url:setPasswordUrl,
	                 type: "POST",
	                 dataType: "JSON",
	                 data: {
	                	password:password,
	                	confirm:confirm,
	 					r:Math.random()
	                 },
	                 beforeSend:function(){
						 obj.setBtnStatusFn("false","确定");  
	                	 _this.errorShow("提交中~","succ");
	                 },
	                 success:function(d){
	                	 _this.errorShow("","succ");
	                	 if(d.status=="success"){
	                		 _this.errorShow("设置密码成功~","succ");
	                	 }else if(d.status=="notUsed" || d.status=="incorrect-nickName"){
	                		 $(document).errorDataOperateFn(d); 
							 obj.setBtnStatusFn("true","确定");	                         
	                	 }else{
	                		 _this.errorShow(d.message,"error");
							 obj.setBtnStatusFn("true","确定");
	                	 }
	                 },
	                 error:function(){
	                	 _this.errorShow("密码设置失败","error"); 
	                 },
	                 complete:function(){
						 obj.setBtnStatusFn("true","确定"); 	                	 
	                 }
				})
			},
			//设置昵称接口
			setNickAjaxFn:function(obj,setNick){
				var _this=this;
				$.ajax({
					url:setNickdUrl,
	                 type: "POST",
	                 dataType: "JSON",
	                 data: {
	                	nickname:setNick,
	 					r:Math.random()
	                 },
	                 beforeSend:function(){
						 obj.setBtnStatusFn("false","确定");
	                 },
	                 success:function(d){
	                	 _this.errorShow("","succ");
	                	 if(d.status=="success"){
	                		 _this.errorShow("设置昵称成功~","succ");
							 if(location.pathname=="/user/member/"){
									window.location.reload();
								}
	                		  $(".js_showUserInfor,.UserInfoMain .ovF .js_nc").hover(function(){
	                		  		 	//获取登录用户身份信息
										$(".rankInfo .js_nc").text(setNick).attr("title",setNick);
								        $("#identity").show();
								        $("#identityForNick").hide();										
	                		  }, function () {
	                		      $("#identity,#identityForNick").hide();
	                		  });

	                		 $(".userInfo .userName,.details .usN").text(setNick).attr("title",setNick);
							 $(".details .js_editos,.usStatus .accnt").hide();//昵称设置成功后隐藏未设置昵称提示
	                		 setTimeout(function(){
	                			 $(".js_settingNick").hide();
	                			 $(".bgT").hide();
	                		 },1000);	                		 
	                	 }else if(d.status=="incorrect-login" || d.status=="suspend"){ 
	                		 $(document).errorDataOperateFn(d);
							 obj.setBtnStatusFn("true","确定");	
	                	 }else{
	                		 _this.errorShow(d.message,"error");
							  obj.setBtnStatusFn("true","确定");
	                	 }
	                 },
	                 complete:function(){
						  obj.setBtnStatusFn("true","确定");
	                 }
				})
			},
			//设置同步数据执行事件
			setSyncDataFn:function(){
				var _this=this;
				$(".account_info li:odd").addClass("nobg");
				$(".js_syncDataPop").on("click",".js_wrapClick",function(){
					$(this).find(".checkbox_imitate").addClass("checked").end().siblings().find(".checkbox_imitate").removeClass("checked")
				})
				$(document).on("click",".js_submit",function(){
					if($(this).attr("data-status")=="false"){
						return false;
					}
					
					var isUserChecked = $(".js_nickWrapper").find(".checked");
					if(isUserChecked.length>0){
						var daoId=$(".js_nickWrapper").find(".checked").attr("data-user");
						var arrTitleId=[];
						var allIdentity=$(".js_infoIdentity").find(".js_identityImg");
						allIdentity.each(function(){
							arrTitleId.push($(this).attr("data-identity"));
						})
						arrTitleId=arrTitleId.join(",");//身份信息转换成字符串用逗号分割开
						_this.synchroDataAjax($(this),daoId,arrTitleId);//提交同步数据接口方法
					}else{
						$(this).attr("data-status","true");
						_this.errorShow("请选择新账号的昵称","error");
					}
				})
			},
			//设置昵称执行事件
			setDaoNickFn:function(){
				var _this=this;
				var regEmpty = new RegExp(/.+/);//空
				var setNick="";
				//设置论坛昵称验证内容合法性
				$(".js_settingNick  .js_setNick").on("blur",function(){
					setNick = $.trim($(".js_setNick").val());
					setNickFn(setNick);					
				});
				//设置昵称
				$(".js_setNickBtn").on("click",function(){
					if($(this).attr("data-status")=="false"){
						return false;
					}
					_this.setNickAjaxFn($(this),setNick)
					
				});
				//跳过设置昵称
				_this.closeLogin(".setPwd_wrapper .js_skip","login");
				//设置昵称验证
				function setNickFn(setNick){
					if(!regEmpty.test(setNick)){
						_this.errorShow("请输入昵称","error");
						$('.js_setNickBtn').attr("data-status","false");
						return false;
					}else{
						_this.errorShow("","succ");
						$('.js_setNickBtn').attr("data-status","true");
					}
				}
			},
			formVerifySetPwd:function(inputType){
				var _this=this;
				var regEmpty = new RegExp(/.+/);//空
			    var regsetPwdPwd = new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{4,16}$/);//4-16数字和字符
			    var	password=$(".js_setPwd").val();//密码
			    var	confirm=$(".js_verifyPwd").val();//确认密码
				switch(inputType){
					case 'password':
						if(!regEmpty.test(password)){
							_this.errorShow("请输入密码","error");
							_this.forbidSpacingFn($(".js_setPwd"));
							$('.js_setPwdBtn').attr("data-status","false");
							return false;
						}else{
							if(!regsetPwdPwd.test(password)){
								_this.errorShow("请输入4-16位英文和数字组成的密码","error");
								_this.forbidSpacingFn($(".js_setPwd"));
								$('.js_setPwdBtn').attr("data-status","false");
								return false;
							}else if(password!==confirm&&password!=""&&confirm!=""){
								_this.errorShow("两次输入的密码不一致，请重新输入","error");
								_this.forbidSpacingFn($(".js_setPwd"));
								$('.js_setPwdBtn').attr("data-status","false");
								return false;
							}else if(password==confirm&&password!=""&&confirm!=""){
								$('.js_setPwdBtn').attr("data-status","true");
								_this.errorShow("","succ");
							}else if(regsetPwdPwd.test(password)&&regEmpty.test(password)&&!regEmpty.test(confirm)){
								_this.errorShow("","error");
							}							
						}
					break;
					case 'confirm':
						if(!regEmpty.test(confirm)){
							_this.errorShow("确认密码不能为空","error");
							_this.forbidSpacingFn($(".js_verifyPwd"));
							$('.js_setPwdBtn').attr("data-status","false");
							return false;
						}else{
							if(!regsetPwdPwd.test(confirm)){
								_this.errorShow("请输入4-16位英文和数字组成的密码","error");
								_this.forbidSpacingFn($(".js_verifyPwd"));
								$('.js_setPwdBtn').attr("data-status","false");
								return false;
							}else if(!regEmpty.test(password)){
								_this.errorShow("请输入密码","error");
								_this.forbidSpacingFn($(".js_setPwd"));
								$('.js_setPwdBtn').attr("data-status","false");
								return false;
							}else if(password!==confirm&&password!=""&&confirm!=""){
								_this.errorShow("两次输入的密码不一致，请重新输入","error");
								_this.forbidSpacingFn($(".js_verifyPwd"));
								$('.js_setPwdBtn').attr("data-status","false");
								return false;
							}else if(password==confirm&&password!=""&&confirm!=""){
								$('.js_setPwdBtn').attr("data-status","true");
								_this.errorShow("","succ");
							}else if(regsetPwdPwd.test(confirm)&&regEmpty.test(confirm)&&!regEmpty.test(password)){
								_this.errorShow("","error");
							}
						}
					break;	
					default:	
						if(!regEmpty.test(password)){
								_this.errorShow("请输入密码","error");
								_this.forbidSpacingFn($(".js_setPwd"));
								$('.js_setPwdBtn').attr("data-status","false");
								return false;
							}else{
								if(!regEmpty.test(confirm)){
									_this.errorShow("确认密码不能为空","error");
									_this.forbidSpacingFn($(".js_verifyPwd"));
									$('.js_setPwdBtn').attr("data-status","false");
									return false;
								}
							}
					break;
					}
			},
			//设置论坛密码执行事件
			setDaoPwdFn:function(){
				var _this=this;				
				//设置论坛密码验证内容合法性				
				$(".setPwd_wrapper .js_setPwd").on("blur",function(){					
					_this.formVerifySetPwd("password");	
				})
				
				$(".setPwd_wrapper .js_verifyPwd").on("blur",function(){					
					_this.formVerifySetPwd("confirm");
				})
				
				$(".js_setPwdBtn").on("click",function(){							
					_this.formVerifySetPwd("all");	
					if($(this).attr("data-status")=="false"){
						return false;
					}
					_this.setPasswordAjaxFn($(this))
				});

				
			},
			//二维码生成接口
			codeLoginOpenAndClosedAjax:function(){	
				var _this=this;			
				$('.js_codeShade').hide();//二维码失效层隐藏
				if(_this.qrCodeStatusTimer){	
					$.ajax({
						url:qrCodeNew,
						type: "POST",
						dataType: "JSON",
						data: {
							r:Math.random()
						},
						success:function(d){						
							if(d.status=="success"){
								$('#js_codeBox').empty();
									new QRCode('js_codeBox', {
										text: d.data,
										width: 132,
										height: 132,
										colorDark: '#000',
										colorLight: '#ffffff',
										correctLevel: QRCode.CorrectLevel.H
									});
									$('#js_codeBox').attr({
										'data-code':d.data,
										'title':''
									})
									$(".login_left .code_wrapper").show();
									$(".login_left .nocodeImg").hide();							 
								_this.ewmLoginStatusFn(d.data);							 							
							}else if(d.status=="qrCodeClose"){		//二维码关闭状态
								$(".login_left .nocodeImg").show();
								$(".login_left .js_codeWrapper").hide();							
							}
						},
						error: function () {
							$('.js_codeShade').show();//二维码刷新图片显示
						}
					})
				}	
			},
			//点击更新二维码
			clickGetNewCode:function(){
				var _this=this;
				$(".js_codeShade").on("click",function(){
					_this.codeLoginOpenAndClosedAjax(); //获取二维码
				})
			},
			//二维码登录接口
			qrCodeLoginAjaxFn:function(qrCodeNum){
				$.ajax({
					url:qrCodeLogin,
					type: "POST",
					dataType: "JSON",
					data: {	
						content:qrCodeNum,
						r:Math.random()
					},
					success:function(d){
						if(d.status=="success"){
							window.location.reload();//刷新页面
						}else{ //二维码异常
							$(".js_codeError").html("验证失败，请重新扫码或使用其他登录方式");
							$('.js_codeShade').show();		
						}
					},
					error: function () {
						$('.js_codeShade').show();						
					}
				});
			},
			//二维码状态接口
			ewmLoginStatusFn:function(qrCodeNum){
				var _this=this;
				var oldqrCodeNum=$("#js_codeBox").attr("data-code");				
				if(_this.qrCodeStatusTimer && oldqrCodeNum==qrCodeNum){	
					$.ajax({
						url: qrCodeStatus,
						type:"get",
						dataType:"jsonp",
						jsonp:'callback',
						data: { 
							content:qrCodeNum,
							r: Math.random() 
						},
						success: function (d) {	
							if (d.status=="success" && oldqrCodeNum==qrCodeNum) {
								//状态成功，登录;第一个参数：新二维码，第二个参数以前生成过的二维码	
								_this.qrCodeLoginAjaxFn(qrCodeNum,oldqrCodeNum);					
							}else if(d.status=="qrCodeInvalid" && oldqrCodeNum==qrCodeNum){	//二维码无效状态								
								_this.codeLoginOpenAndClosedAjax(); //获取二维码
							}else if(d.status=="qrCodeValid" && oldqrCodeNum==qrCodeNum){								
								$("#js_codeBox").show(); //有效状态展示二维码	
								_this.ewmLoginStatusFn(qrCodeNum);	//打开获取二维码状态											
							}else if(d.status=="qrCodeClose"){ //二维码关闭状态
								$(".login_left .nocodeImg").show();
								$(".login_left .js_codeWrapper").hide();
							}else{ //二维码异常
								$(".js_codeError").html("验证失败，请重新扫码或使用其他登录方式");
								$('.js_codeShade').show();		
							}
						},
						error: function () {
							$('.js_codeShade').show();
						}
					})							
				}		
			}
			
		};
	
	return new UserLogin();
})();
$(function(){	
	login_main.init();
	
});