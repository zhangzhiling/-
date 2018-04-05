/*
 * add by tht 2017-8-1
 * for gift function
 */
/*=======================update log start=====================*/
/* v1.0.2:
 * content：开宝箱
 * author:mxm
 * date:2017-9-12
 * changeBoxStatus:activeOpenBox.js
 *
 */
/*=======================update log end=====================*/
(function($, window, document,undefined){
	var getOrderStatusUrl = "/wealth/recharge/status"; //金符钱订单状态
	//金符钱充值弹层
	var giftRechargeStr = ''+
			'<div class="pop_wrapGR js_all_gifts_pop" style="display:none">'+
				'<div class="popGR">'+
				    '<a class="closeGR js_closeG"></a>'+
				    '<div class="pop_conGR">'+
				    	'<div id="giftRecharge">'+
					    	'<div class="not_enough_tip_wrap">'+
						        '<div class="not_enough_tip">余额不足<span class="real_num js_real_num">***</span></div>'+
					        '</div>'+
					        '<div class="recharge_num_tip">扫一扫快速补充<span class="red js_must_real_num">100</span>金符钱</div>'+
					        '<div class="attach_num_tip js_attach_num_tip">***</div>'+
					        '<div class="qrcode_con">'+
					            '<img class="js_gift_recharge_gold_qrcode_img" src="" />'+
					            '<div class="qrcode_cover js_gift_recharge_qrcode_timeout" style="display:none;">'+
					                '<div class="con">'+
					                    '<div class="loadIcon"></div>'+
					                    '<p class="js_qrcode_error">二维码失效</p>'+
					                    '<p class="qrcode_reload js_reload_giftRechargeQrcode" data-status="true" data-text="点击重试">点击重试</p>'+
					                '</div>'+
					                '<div class="mask"></div>'+
					            '</div>'+
					        '</div>'+
					        '<div class="bottom_tip">扫码失败？试一试 <a class="recharge js_pay" data-btnType="rechargeGold">立即充值</a></div>'+
				        '</div>'+
				    '</div>'+
				'</div>'+
				'<div class="maskGR"></div>'+
			'</div>';
    function DaoBoxs(){
    	this.giftQrcodeTimer = null;  //二维码定时器
		this.giftQrcodeTimeOut = false;  //二维码是否过期： true:过期  false:没过期
    }
    DaoBoxs.prototype = {
        init:function(){
        	var _this = this;
        	if(!$("#giftRecharge").length){ //有金符钱充值层不再重复添加Dom
        		$(document.body).append(giftRechargeStr); //添加金符钱充值弹层元素
        	}
        	$(document).popErrAndSucD({type:"init"}); //错误、正确提示弹层初始化
        	_this.refreshGiftRechargeQrcodeFn();//刷新道具二维码
        	_this.rechargePopFn();  //关闭道具充值层，打开金符钱充值层
        },
        //获取宝箱状态
        getBoxStatusAjaxFn:function(typeBoxPost,typeGetBox){
        	var _this = this;
        	$.ajax({
				url:typeBoxPost,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
				},
				success:function(d){
						if(d.status=="success"){
							//宝箱开启成功调用订单号查询
							changeBoxStatus.paySuccgetOrderFn(d.data.orderNo);
							$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
						}else if(d.status=="getqr_success"){
							
							$(".js_gift_recharge_gold_qrcode_img").attr("src",d.data.qr_address); //存二维码地址
							$(".js_gift_recharge_gold_qrcode_img").attr("data-orderId",d.data.orderId);//存订单号
							
							var needGold = parseFloat(d.data.jinFu);
							var needGoldStr = needGold<=0?"":"(还差"+d.data.jinFu+"金符钱)";
							
							var attachSilver = parseInt(d.data.yinFu);
							var attachSilverStr = attachSilver==0?"":"(送"+d.data.yinFu+" 银符钱)";
							
							$(".js_real_num").text(needGoldStr);  //实际需要充值
							$(".js_must_real_num").text(d.data.rechargeJinFu);  //规定必须充值
							$(".js_attach_num_tip").text(attachSilverStr);  //充值赠送银符钱
							
							$(".js_gift_recharge_qrcode_timeout").hide(); //二维码过期层隐藏
							
							$("#giftRecharge").popGiftMall({
								type:"open",
								closeFn:function(){
									clearTimeout(_this.giftQrcodeTimer);  //清除道具支付二维码定时器
								}
								
							});
							
							_this.orderStatusFn(d.data.orderId,typeGetBox); //查询订单状态
							
							_this.giftQrcodeTimer = setTimeout(function(){
								clearTimeout(_this.giftQrcodeTimer);
								_this.giftQrcodeTimeOut = true;  //二维码过期 
								$(".js_gift_recharge_qrcode_timeout").show();
							},180000);  //3分钟
						}else if(d.status=="none-chance"){
							changeBoxStatus.createSureCoverOk(d.message);
						}else{
							//异常状态处理
                        	global_main.globalFn.callBackErrStatusOpreFn(d);
						}
				
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
        },
		//刷新二维码
		refreshGiftRechargeQrcodeFn:function(){
			var _this = this;
			$(".js_reload_giftRechargeQrcode").click(function(){
				_this.giftQrcodeTimeOut = false;  //二维码没过期
				
				_this.getBoxStatusAjaxFn();
				
			});
		},
		//查询订单状态
		orderStatusFn:function(orderNO,typeGetBox){
			var _this = this;
			$.ajax({
				url:getOrderStatusUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random(),
					orderNO :orderNO
				},
				success:function(d){
					var qrcodeCover = parseInt($("#giftRecharge:hidden").length)===0?true:false;  //二维码显示状态
					
					if(qrcodeCover){
						
						if(d.status=="success"){
							if(typeGetBox=="typeYin"){
								//订单成功调用开金宝箱
								changeBoxStatus.openYBox();
							}
                            if(typeGetBox=="typeJin"){
                            	//订单成功调用开银宝箱
    							changeBoxStatus.openJBox();
							}
						}else{
							if(d.status==="order-waitPay"&&!_this.giftQrcodeTimeOut){
								_this.orderStatusFn(orderNO,typeGetBox);
							}
						}
					}
					
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
		},
		//充值层中立即充值按钮，触发充值金符钱层
		rechargePopFn:function(){
			$(".js_pay").click(function(){
				$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
			});
		}
        
      
    };
    window.daoBoxs =  new DaoBoxs();
    daoBoxs.init();
    
})(jQuery, window, document);

