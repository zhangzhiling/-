/*
 * add by tht 2017-5-17
 * for recharge function
 */
;(function($){
	var getInfoUrl = "/wealth/recharge";  //获取充值层金符钱信息
	var submitGoldInfoUrl = "/wealth/recharge";  //提交金符钱信息
	var getOrderStatusUrl = "/wealth/recharge/status"; //金符钱订单状态
	var exchangeSilverUrl = "/wealth/buyYinfu";  //兑换银符钱
	var getRechargeSwitchStatus = "/wealth/recharge/switch/status";		//获取充值按钮开关	

	//充值金符钱、兑换银符钱弹层
	var str = ''+
		'<div class="recharge_con"  id="recharge">'+
			'<div class="money_con">'+
				'<ul class="money_remain_show">'+
					'<li class="gold">金符钱<span class="js_gold_remain">***</span></li>'+
					'<li class="silver">银符钱<span  class="js_silver_remain">***</span></li>'+
					'<li class="close_con"><a class="closeD"></a></li>'+
				'</ul>'+
				'<div class="tab_title">'+
					'<ul class="js_money_tab">'+
						'<li class="cur" data-cur="true">充值金符钱</li>'+
						'<li data-cur="false">兑换银符钱</li>'+
					'</ul>'+
				'</div>'+
				'<div class="tab_con js_tab_con">'+
					'<div class="p">'+
						'<label class="tag_title">充值账号：</label>'+
						'<span class="account js_form_account">***</span>'+
					'</div>'+
					'<div class="p m_t_12">'+
						'<label class="tag_title">充值数量：</label>'+
						'<ul class="gold_num js_gold_num">'+
							'<li class="cur" data-value="1">100枚</li>'+
							'<li data-value="10">1000枚<i>(送100枚 银符钱)</i></li>'+
							'<li data-value="50">5000枚<i>(送600枚 银符钱)</i></li>'+
							'<li data-value="100">10000枚<i>(送1500枚 银符钱)</i></li>'+
							'<li data-value="200">20000枚<i>(送3500枚 银符钱)</i></li>'+
						'</ul>'+
					'</div>'+
					'<div class="p m_t_24">'+
						'<label class="tag_title">支付方式：</label>'+
						'<ul>'+
							'<li class="cur" data-type="alipay"><label class="zfb">支付宝扫一扫</label></li>'+
						'</ul>'+
					'</div>'+
					'<div class="p m_t_16">'+
						'<label class="tag_title">应付金额：</label>'+
						'<div class="give_money"><span class="js_give_money">1元</span>（1元 = 100枚 金符钱）</div>'+
					'</div>'+
					'<div class="p rules m_t_5">'+
						'<input type="checkbox" id="gold_accept" checked="true"/>'+
						'<label for="guld_accept">同意</label>'+
						'<a target="_blank" href="http://kf.gyyx.cn/home/agreement?3">光宇玩家守则</a>'+
					'</div>'+
					'<div class="p sub_btn m_t_12">'+
						'<input type="hidden" id="js_give_money_hid" value="1"/>'+
						'<input type="hidden" id="js_pay_type_hid" value="alipay"/>'+
						'<div class="form_error js_form_error"></div>'+
						'<a class="js_gold_rechargeBtn" data-status="true">充值</a>'+
					'</div>'+
					'<div class="p rules notice m_t_24"><label>若出现支付异常，请您联系光宇在线客服</label><a target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">光宇在线客服</a></div>'+
				'</div>'+
				'<div class="tab_con js_tab_con" style="display:none;">'+
					'<div class="p">'+
						'<label class="tag_title">兑换账号：</label>'+
						'<span class="account js_form_account">***</span>'+
					'</div>'+
					'<div class="p m_t_12">'+
						'<label class="tag_title">兑换数量：</label>'+
						'<ul class="silver_num js_silver_num">'+
							'<li class="cur" data-value="1">10枚</li>'+
							'<li data-value="10">100枚</li>'+
							'<li data-value="100">1000枚</li>'+
							'<li data-value="1000">10000枚</li>'+
						'</ul>'+
					'</div>'+
					'<div class="p m_t_24">'+
						'<label class="tag_title">支付方式：</label>'+
						'<ul>'+
							'<li class="cur"><label class="gold">金符钱</label></li>'+
						'</ul>'+
					'</div>'+
					'<div class="p m_t_16">'+
						'<label class="tag_title">应付金额：</label>'+
						'<div class="give_money"><span class="js_give_gold">1枚  金符钱</span>（1枚 金符钱 = 10枚 银符钱）</div>'+
					'</div>'+
					'<div class="p rules m_t_5">'+
						'<input type="checkbox" id="silver_accept" checked="true"/>'+
						'<label for="guld_accept">同意</label>'+
						'<a target="_blank" href="http://kf.gyyx.cn/home/agreement?3">光宇玩家守则</a>'+
					'</div>'+
					'<div class="p sub_btn m_t_12">'+
						'<input type="hidden" id="js_give_gold_hid" value="1"/>'+
						'<div class="form_error js_form_silver_error"></div>'+
						'<a class="js_silver_exchangeBtn silverChangeBtn" data-status="true">我要兑换</a>'+
					'</div>'+
					'<div class="p rules notice m_t_24"><label>若出现支付异常，请您联系光宇在线客服</label><a target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">光宇在线客服</a></div>'+
				'</div>'+
			'</div>'+
			'<div class="tip_con js_qrcode_cover" style="display:none;">'+
				'<div class="account_confirm js_account_confirm" style="display:none;">'+
					'<p>您正在给<span class="js_confirm_account">***</span>充值</p>'+
					'<p class="consume">消费金额是<span class="js_confirm_consume">***</span></p>'+
					'<div class="btns">'+
						'<a class="suc js_confirm_gold_submitBtn" data-status="true">确认支付</a>'+
						'<a class="quit js_quit_qrcode_cover">取消</a>'+
					'</div>'+
				'</div>'+
				'<div class="qrcode_show js_qrcode_show" style="display:none;">'+
					'<div class="qrcode_con">'+
						'<img class="js_gold_qrcode_img" src="" />'+
						'<div class="qrcode_cover js_qrcode_timeout" style="display:none;">'+
							'<div class="con">'+
								'<div class="loadIcon"></div>'+
								'<p class="js_qrcode_error">二维码失效</p>'+
								'<p class="qrcode_reload js_reload_qrcode" data-status="true">点击重试</p>'+
							'</div>'+
							'<div class="mask"></div>'+
						'</div>'+
					'</div>'+
					'<p>请使用支付宝扫码支付</p>'+
					'<div class="btns">'+
						'<a class="quit js_quit_qrcode_cover">返回</a>'+
						'<a class="error" target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">支付异常</a>'+
					'</div>'+
				'</div>'+
				'<div class="recharge_suc js_recharge_suc" style="display:none;">'+
					'<div class="close_con js_recharge_suc_close">'+
						'<a class="close_btn"></a>'+
					'</div>'+
					'<div class="title">'+
						'<h2 class="js_subForm_sucTitle">支付宝支付成功</h2>'+
						'<p><span class="js_succHideTimer"></span>后自动跳转......</p>'+
					'</div>'+
					'<ul class="suc_info js_subForm_sucInfo">'+
						'<li>'+
							'<label>充值账号：</label>'+
							'<span class="account js_account_suc">***</span>'+
						'</li>'+
						'<li>'+
							'<label>订单金额：</label>'+
							'<span class="give_money js_money_suc">***</span>'+
						'</li>'+
						'<li>'+
							'<label>订单返利：</label>'+
							'<span class="js_fl_suc">***</span>'+
						'</li>'+
						'<li>'+
							'<label>支付方式：</label>'+
							'<span class="js_payType_suc">支付宝</span>'+
						'</li>'+
						'<li>'+
							'<label>支付时间：</label>'+
							'<span class="js_time_suc">***</span>'+
						'</li>'+
					'</ul>'+
				'</div>'+
				'<div class="mask_inner"></div>'+
			'</div>'+
		'</div>';
	//充值（金符钱充值、银符钱兑换）
	function DaoRecharge(){
		this.qrcodeTimer = null;  //二维码定时器
		this.succGuldTimer = null;  //支付成功层定时器
		this.qrcodeTimeOut = false;  //二维码是否过期： true:过期  false:没过期
	}
	DaoRecharge.prototype = {
		init:function(enterObj){  //enterObj  是一个入口集合，金符钱充值、银符钱兑换两种按钮需添加自定义属性为：data-btnType="rechargeGold"   data-btnType="exchangeSilver"
			var _this = this;
			// 弹层初始化
			$(document.body).append(str);
			$("#recharge").popD({
				width:"718px",
				height:"652px"
			});
			//tab切换
			$(document).tabConChangeFn($(".js_money_tab li"),$(".js_tab_con"),_this.resetFormFn);
			_this.enterClickFn(enterObj);
			//金符钱
			_this.goldNumChangeFn();
			_this.submitGoldFormFn();
			_this.confirmRechargeGoldFn();
			_this.quitQrcodeCoverBtnFn();
			_this.refreshQrcodeFn();//刷新二维码

			//银符钱
			_this.silverNumChangeFn();
			_this.exchangeSilverFn();
		},
		//入口click事件
		enterClickFn:function(obj){ 
			var _this = this;
			//obj 是一个以逗号分隔各个入口按钮的class字符串
			$(document).on("click",obj,function(){
				var $this = $(this);
				var btnType = $this.attr("data-btnType");
				
				_this.getGoldInfoFn(btnType);
				
			});
		},
		//金币数量兑换
		goldNumChangeFn:function(){
			$(".js_gold_num li").click(function(){
				var $this = $(this);
				var give_money = $this.attr("data-value");
				$(".js_gold_num li").removeClass("cur");
				$this.addClass("cur");
				$(".js_give_money").text(give_money+"元");
				$("#js_give_money_hid").val(give_money);

			});
		},
		//打开弹层
		openPopFn:function(btnType){
			var _this = this;
			_this.resetFormFn();
			$("#recharge").popD("open");
			_this.qrcodeCoverFn("close");  
			//重置tab状态   btnType  区分金符钱 、银符钱界面
			$(".js_money_tab li").removeClass("cur");
			$(".js_tab_con").hide();
			
			if(btnType==="rechargeGold"){
				$(".js_money_tab li:first").addClass("cur");
				$(".js_tab_con:first").show();
			}else{
				$(".js_money_tab li:last").addClass("cur");
				$(".js_tab_con:last").show();
			}

			
		},
		//充值开关
		rechargeCloseFn:function(){
			var _this=this;
			$.ajax({
				url:getRechargeSwitchStatus,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					if(d.status=="success"){
						$(".js_qrcode_show").show();
						$(".js_account_confirm,.js_recharge_suc").hide();
						$(".js_qrcode_timeout").hide();
						_this.qrcodeTimer = setTimeout(function(){
							clearTimeout(_this.qrcodeTimer);
							_this.qrcodeTimeOut = true;  //二维码过期 
							$(".js_qrcode_timeout").show();
						},180000);  //3分钟
					}else{
						_this.qrcodeCoverFn("close");//关闭确认支付层
						clearTimeout(_this.qrcodeTimer);  //清除二维码定时器
						$("#recharge").popD("close");//关闭充值提示弹框
						$(document).popErrorF({type:"open",tip:"充值关闭，敬请期待！"});
						}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			})
		},
		//兑换，充值金银符钱调取方法
		rechargeGoldAndSilverFn:function(d,btnType){
			var _this=this;
			var datas=d;
			var nike = datas.data.nickName=="暂时没有"?"":datas.data.nickName;
			$(".js_form_account").html(nike+"("+datas.data.maskPhone+")");
			$(".js_gold_remain").html(datas.data.jinfu);
			$(".js_silver_remain").html(datas.data.yinfu);
			_this.openPopFn(btnType);
		},
		//获取弹层金符钱信息
		getGoldInfoFn:function(btnType){
			var _this = this;
			$.ajax({
				url:getInfoUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					
						if(d.status=="success" ){
							_this.rechargeGoldAndSilverFn(d,btnType)	//调取金银符钱
						}else if(d.status == "rechargeClose"){	//判断按钮状态
							if(btnType =="rechargeGold"){
								$("#recharge").popD("close");//关闭充值提示弹框
								$(document).popErrorF({type:"open",tip:"充值关闭，敬请期待！"});
							}else{
								_this.rechargeGoldAndSilverFn(d,btnType)	//调取金银符钱
							}
						}else{
							if(d.status=="incorrect-login"){
								$(document).reLoginFn();
							}else if(d.status=="incorrect-nickName"){  //无昵称
								login_main.settingNickPop();
							}else{
								$(document).errorDataOperateFn(d);
							}	
						}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
		},
		//提交金符钱表单
		submitGoldFormFn:function(){
			var _this = this;
			$(".js_gold_rechargeBtn").click(function(){
				var $this = $(this);
				var checked = $("#gold_accept:checked").length;
				if(!checked){
					_this.setErrorTipFn($(".js_form_error"),"请勾选玩家守则");
				}else{
					_this.setErrorTipFn($(".js_form_error"),"");
					$(".js_confirm_gold_submitBtn").attr("data-type","gold"); //点击按钮执行充值金符钱
					
					_this.goldFormAjaxFn($this,["充值","提交中"]);	
									
				}
			});
			
		},
		//确认支付弹层 
		confirmRechargeGoldFn:function(){
			var _this = this;
			$(".js_confirm_gold_submitBtn").click(function(){
				var $this = $(this);
				var btnType = $this.attr("data-type");
				if(btnType==="gold"){
					_this.qrcodeCoverFn("open",2);
					orderStatus(); 	//查订单状态	
				}else if(btnType==="silver"){
					
					_this.silverFormAjaxFn($this,["确认支付","提交中"]); 
					
				}
				function orderStatus(){
					$.ajax({
						url:getOrderStatusUrl,
						type:"get",
						dataType:"json",
						data:{
							r:Math.random(),
							orderNO :$(".js_gold_qrcode_img").attr("data-orderId")
						},
						success:function(d){
							var qrcodeCover = parseInt($(".js_qrcode_cover:hidden").length)===0?true:false;  //二维码显示状态
							if(qrcodeCover){  
								if(d.status=="success"){
									var nikeSuc = d.data.nickName=="暂时没有"?"":d.data.nickName;
									var strObj = {};
									strObj.title = "支付宝支付成功";
									//支付宝支付成功信息
									strObj.str = ''+
												'<li>'+
													'<label>充值账号：</label>'+
													'<span class="account js_account_suc">'+nikeSuc+'('+d.data.maskPhone+')'+'</span>'+
												'</li>'+
												'<li>'+
													'<label>订单金额：</label>'+
													'<span class="give_money js_money_suc">'+d.data.rmb+"（"+d.data.jinfu+"）"+'</span>'+
												'</li>'+
												'<li>'+
													'<label>订单返利：</label>'+
													'<span class="js_fl_suc">'+d.data.decale+'</span></li>'+
												'<li>'+
													'<label>支付方式：</label>'+
													'<span class="js_payType_suc">'+d.data.payWay+'</span>'+
												'</li>'+
												'<li>'+
													'<label>支付时间：</label>'+
													'<span class="js_time_suc">'+d.data.rechargeDate+'</span>'+
												'</li>';		
									_this.qrcodeCoverFn("open",3,d,strObj);  //打开确认充值账号
								}else{
									if(d.status==="order-waitPay"&&!_this.qrcodeTimeOut){
										orderStatus();
									}
								}
							}
							
						},
						error:function(){
							$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
						}
					});
				}

			});

		},
		
		//二维码层
		qrcodeCoverFn:function(status,index,d,infoObj){  //index:  1:确认表单层  2：二维码层  3：充值成功层 ;  status: open:打开提示层  close:关闭提示层 ； infoObj:在 3：充值成功层（实参为对象） 和 1:确认表单层（实参为字符串） 使用；
			var _this = this;
			if(status=="open"){
				switch(parseInt(index))
				{
					case 1:
						if(typeof d ==="string"){
							var form_account = $(".js_form_account").html();
							$(".js_confirm_account").html(form_account);
						}else{
							var nike = d.data.nickName=="暂时没有"?"":d.data.nickName;
							$(".js_confirm_account").html(nike+"("+d.data.maskPhone+")");
						}
						
						$(".js_confirm_consume").html(infoObj.num+infoObj.title);
						$(".js_account_confirm").show();
						$(".js_qrcode_show,.js_recharge_suc").hide();
						
						break;
					case 2:
						_this.rechargeCloseFn()//充值开关
						break;
					case 3:
						var nikeSuc = d.data.nickName=="暂时没有"?"":d.data.nickName;
						$(".js_subForm_sucTitle").html(infoObj.title);  //成功标题
						$(".js_subForm_sucInfo").html(infoObj.str);  //成功信息
						//弹层公共信息   ##注意用户中心中的四个元素.gamesInfo .jinfu, .myRank .jinfu, .gamesInfo .yinfu, .myRank .yinfu
						$(".js_gold_remain,.gamesInfo .jinfu,.myRank .jinfu").html(d.data.jinfuTotal);  //金符钱余额
						$(".js_silver_remain,.gamesInfo .yinfu,.myRank .yinfu").html(d.data.yinfuTotal);  //银符钱余额
						$(".js_form_account").html(nikeSuc+"("+d.data.maskPhone+")");//更新充值账号，避免多个账号登录冲突，以最后登录账号为准

						var s = 5;
						_this.succGoldTimer = setInterval(function(){
							if(s<0){
								_this.submitSucPopSucdisFn();  //成功层关闭逻辑
							}else{
								$(".js_succHideTimer").html(s+"s");
							}
							
							s--;
					
						},1000);
						
						$(".js_recharge_suc_close").click(function(){  //成功层中关闭按钮
							_this.submitSucPopSucdisFn(); //成功层关闭逻辑
						});

						$(".js_recharge_suc").show();
						$(".js_account_confirm,.js_qrcode_show").hide();
						break;
					default:
						return;
				}
				$(".js_qrcode_cover").show("fast");
			}else{
				$(".js_qrcode_cover").hide("fast");
			}
			
		},
		//成功层关闭逻辑
		submitSucPopSucdisFn:function(){
			var _this = this;
			clearInterval(_this.succGoldTimer);
			$(".js_succHideTimer").empty();
			_this.qrcodeCoverFn("close");
			_this.resetFormFn();
		},
		//返回按钮隐藏二维码层
		quitQrcodeCoverBtnFn:function(){
			var _this = this;
			$(".js_quit_qrcode_cover").click(function(){
				_this.qrcodeCoverFn("close");
				clearTimeout(_this.qrcodeTimer);  //清除二维码定时器
			});
		},
		//刷新二维码
		refreshQrcodeFn:function(){
			var _this = this;
			$(".js_reload_qrcode").click(function(){
				var $this = $(this);
				_this.qrcodeTimeOut = false;  //二维码没过期
				
				_this.goldFormAjaxFn($this,["重新加载","加载中"]);
				
			});
		},
		//金符钱表单提交ajax
		goldFormAjaxFn:function(obj,strArr){
			var _this = this;
			if(obj.attr("data-status")=="true"){
						
				$.ajax({
					url:submitGoldInfoUrl,
					type:"post",
					dataType:"json",
					data:{
						r:Math.random(),
						payWay:$("#js_pay_type_hid").val(),
						rmb:$("#js_give_money_hid").val()
					},
					beforeSend:function(){
						obj.setBtnStatusFn("false",strArr[1]);
					},
					success:function(d){
						obj.setBtnStatusFn("true",strArr[0]);
						if(d.status=="success"){
							_this.setErrorTipFn($(".js_form_error"),"");

							var strObj = {};  //确认信息 title:货币类型（元，枚金符钱） num:数量
							strObj.title = "元";
							strObj.num = $("#js_give_money_hid").val(); 
							_this.qrcodeCoverFn("open",1,d,strObj);  //打开确认充值账号


							$(".js_gold_qrcode_img").attr("src",d.data.qr_address);  //二维码图片
							$(".js_gold_qrcode_img").attr("data-orderId",d.data.orderId);//存订单号
						}else{
							_this.qrcodeCoverFn("close");  //关闭遮罩层
							_this.setErrorTipFn($(".js_form_error"),d.message);
							if(d.status=="incorrect-login"){
							
								$("#recharge").popD("close");
								$(document).reLoginFn();
							}else if(d.status=="rechargeClose"){
								$("#recharge").popD("close");//关闭充值提示弹框
								$(document).popErrorF({type:"open",tip:"充值关闭，敬请期待！"});
							}else if(d.status=="incorrect-nickName"){  //无昵称
								$("#recharge").popD("close");
								login_main.settingNickPop();
							}else if(d.status=="suspend"){
								$("#recharge").popD("close");
								//贴吧登录状态退出
				    			global_main.globalFn.logoutFn(function(){
				    				$(".centerHeard .userInfo").hide();
				        			$(".centerHeard .users").show(); //展示贴吧登录容器
				    			});
				    			//封停原因
				    			var reason = d.message;
				    			var reasonAll = reason;
				    			var reasonCut = reason.length>5?reason.substring(0,5)+"...":reason;
				    			
				    			$(document).popErrorF({
				    				type:"open",
				    				tip:'<span class="suspend">您的账号因"<a title="'+reasonAll+'">'+reasonCut+'</a>"被限制登录</span><span class="suspend">如有疑问请联系<a class="link" target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">在线客服</a></span>'
				    			}); 
							}
						}
					},
					error:function(){
						obj.setBtnStatusFn("true",strArr[0]);
						$(document).popErrorF({
							type:"open",
							tip:"程序小哥打盹儿了，刷新页面试试！"
						});
					}
				});
			}
		},
		//重置充值表单
		resetFormFn:function(){
			//金符钱
			$(".js_gold_num li").removeClass("cur");
			$(".js_gold_num li:first").addClass("cur");
			$(".js_give_money").text("1元");
			$("#js_give_money_hid").val("1");
			$("#gold_accept").prop("checked",true);
			$(".js_form_error").html("");
			//银符钱
			$(".js_silver_num li").removeClass("cur");
			$(".js_silver_num li:first").addClass("cur");
			$(".js_give_gold").text("1枚 金符钱");
			$("#js_give_gold_hid").val("1");
			$("#silver_accept").prop("checked",true);
			$(".js_form_silver_error").html("");
		},
		//银符钱数量兑换
		silverNumChangeFn:function(){
			var _this = this;
			$(".js_silver_num li").click(function(){
				var $this = $(this);
				var give_gold = $this.attr("data-value");
				$(".js_silver_num li").removeClass("cur");
				$this.addClass("cur");
				$(".js_give_gold").text(give_gold+"枚 金符钱");
				$("#js_give_gold_hid").val(give_gold);
				_this.setErrorTipFn($(".js_form_silver_error"),"");

			});
		},
		//提交兑换银符钱表单
		exchangeSilverFn:function(){
			var _this = this;
			$(".js_silver_exchangeBtn").click(function(){
				var checked = $("#silver_accept:checked").length;
				if(!checked){
					_this.setErrorTipFn($(".js_form_silver_error"),"请勾选玩家守则");
				}else{
					_this.setErrorTipFn($(".js_form_silver_error"),"");
					$(".js_confirm_gold_submitBtn").attr("data-type","silver"); //点击按钮执行充值金符钱
					var strObj = {};  //确认信息 title:货币类型（元，枚金符钱） num:数量
					strObj.title = "枚 金符钱";
					strObj.num = $("#js_give_gold_hid").val(); 
					_this.qrcodeCoverFn("open",1,"",strObj);  //打开确认充值账号  不传入d  默认取层中充值账号					
				}
			});
		},
		//银符钱表单提交ajax
		silverFormAjaxFn:function(obj,strArr){
			var _this = this;
			if(obj.attr("data-status")=="true"){
						
				$.ajax({
					url:exchangeSilverUrl,
					type:"post",
					dataType:"json",
					data:{
						r:Math.random(),
						jinfu:$("#js_give_gold_hid").val()
					},
					beforeSend:function(){
						obj.setBtnStatusFn("false",strArr[1]);
					},
					success:function(d){
						obj.setBtnStatusFn("true",strArr[0]);
						if(d.status=="success"){
							_this.setErrorTipFn($(".js_form_silver_error"),"");
							var nikeSuc = d.data.nickName=="暂时没有"?"":d.data.nickName;
							var strObj = {};
							strObj.title = "银符钱兑换成功";
							//支付宝支付成功信息
							strObj.str = ''+
										'<li>'+
											'<label>兑换账号：</label>'+
											'<span class="account js_account_suc">'+nikeSuc+'('+d.data.maskPhone+')'+'</span>'+
										'</li>'+
										'<li>'+
											'<label>订单金额：</label>'+
											'<span class="give_money js_money_suc">'+d.data.jinfu+"（"+d.data.yinfu+"）"+'</span>'+
										'</li>'+
										'<li>'+
											'<label>支付方式：</label>'+
											'<span class="js_payType_suc">'+d.data.payWay+'</span>'+
										'</li>'+
										'<li>'+
											'<label>支付时间：</label>'+
											'<span class="js_time_suc">'+d.data.date+'</span>'+
										'</li>';		
							_this.qrcodeCoverFn("open",3,d,strObj);  //打开确认充值账号
		
						}else{
							_this.qrcodeCoverFn("close");  //关闭遮罩层
							_this.setErrorTipFn($(".js_form_silver_error"),d.message);
							if(d.status=="incorrect-login"){

								$("#recharge").popD("close");
								$(document).reLoginFn();
							}else if(d.status=="incorrect-nickName"){  //无昵称
								$("#recharge").popD("close");
								login_main.settingNickPop();
							}else if(d.status=="suspend"){
								$("#recharge").popD("close");
								//贴吧登录状态退出
				    			global_main.globalFn.logoutFn(function(){
				    				$(".centerHeard .userInfo").hide();
				        			$(".centerHeard .users").show(); //展示贴吧登录容器
				    			});
				    			//封停原因
				    			var reason = d.message;
				    			var reasonAll = reason;
				    			var reasonCut = reason.length>5?reason.substring(0,5)+"...":reason;
				    			
				    			$(document).popErrorF({
				    				type:"open",
				    				tip:'<span class="suspend">您的账号因"<a title="'+reasonAll+'">'+reasonCut+'</a>"被限制登录</span><span class="suspend">如有疑问请联系<a class="link" target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">在线客服</a></span>'
				    			}); 
							}
						}
					},
					error:function(){
						obj.setBtnStatusFn("true",strArr[0]);
						$(document).popErrorF({
							type:"open",
							tip:"程序小哥打盹儿了，刷新页面试试！"
						});
					}
				});				
			}
		},
		//错误提示
		setErrorTipFn:function(obj,str){
			obj.text(str);
		}
	};
	window.daoRecharge = function(){
		return new DaoRecharge();
	};
})(jQuery);
