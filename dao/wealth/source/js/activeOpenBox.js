/*
 * activeName:贴吧宝箱活动
 * author:maoxiangmin
 * time:20170905
 * 
 */
;(function($, window, document,undefined) {
	
    //定义Beautifier的构造函数
    var openBox = function(ele, opt) {
        this.$element = $(ele.selector);
        this.defaults = {
        	//登录状态
        	"loginState":false,  //未登录状态为不可操作宝箱实际情况，只能查看宝箱规则
    		//显示金宝箱
        	"showJBox":true,
        	//显示银宝箱
        	"showYBox":true,
        	//金宝箱闪动
        	"showJBoxFlicker":false,
        	//银宝箱闪动
        	"showYBoxFlicker":false,
            //宝箱展示方式
            "direction":"vertical",
            //银宝箱抽奖次数
     	    "showYBoxNum":"/wealth/box/silver",
     	    //金宝箱抽奖次数
     	    "showJBoxNum":"/wealth/box/gold",
     	    //查询奖品接口
     	    "searchGetAward":"/wealth/box/prize",
     	    //开银宝箱
     	    "costYMoney":"/wealth/box/opensilverbox",
     	    //开金宝箱
     	    "costJMoney":"/wealth/box/opengoldbox"
     	   
        };
        this.options = $.extend({}, this.defaults, opt);
        //金宝箱规则
        this.$directionDOM=this.$element.find("#"+this.options.direction+'Box').selector;
        this.init();
    }

    openBox.prototype = {
    		init:function(){
    			this.showJYBox();
    			//宝箱闪动状态
    			if(!this.options.loginState){
    				this.boxFlickerStatus(true,true);
    			}
    		},
    		
    		//宝箱闪动状态
    		boxFlickerStatus:function(jboxflicker,yboxflicker){
        	   this.options.showJBoxFlicker=jboxflicker;
        	   this.options.showYBoxFlicker=yboxflicker;
        	   this.showJYBox();
    		},
    		 //时间转换
            formatDate:function(nS){
                var date = new Date(nS),
                    H=date.getHours()<10? '0'+date.getHours()+":" : date.getHours()+":",
                    Mi=date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes()+":",
                    ss=date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds();
                return H+Mi+ss;
            },
    		//宝箱倒计时
            settimeForOpenBox:function(obj,countTime,jboxflicker,yboxflicker){
            	var _this=this;
            	var timer=null;
            	var s=Math.floor(countTime/1000);//将毫秒转换成秒
			    clearInterval(timer);
			    timer=setInterval(function(){
			    	if (s == 0) {
			    		clearInterval(timer);
			    		$(obj).empty();
			    		_this.boxFlickerStatus(jboxflicker,yboxflicker);
			    		return false;
			    	}else{
			    		var int_hour = Math.floor(s/3600%24);
			    		var int_minute = Math.floor(s/60%60);
			    		var int_second = Math.floor(s%60);
			    		$(obj).html(int_hour+":"+int_minute+":"+int_second);
			    		s--;
			    	}
			    },1000);
            },
    		//宝箱显示状态
	        showJYBox:function() {
	        	var _this=this;
	        	//宝箱状态
	        	if($(_this.$directionDOM).length){
	        		if(_this.options.showJBoxFlicker){
	        			 $(_this.$directionDOM).find(".jBox").addClass("jBoxFlicker");
	        			 if($(_this.$directionDOM).find(".jBoxNum").html()!=""){
	        				 $(_this.$directionDOM).find(".jBoxNum").show();
	        			 }else{
	        				 $(_this.$directionDOM).find(".jBoxNum").hide();
	        			 }
	            	}else{
	            		 $(_this.$directionDOM).find(".jBox").removeClass("jBoxFlicker");
	            	}
	        		
	        		if(_this.options.showYBoxFlicker){
	        			 $(_this.$directionDOM).find(".yBox").addClass("yBoxFlicker");
	        			 if($(_this.$directionDOM).find(".yBoxNum").html()!=""){
	        				 $(_this.$directionDOM).find(".yBoxNum").show();
	        			 }else{
	        				 $(_this.$directionDOM).find(".yBoxNum").hide();
	        			 }
	            	}else{
	            		 $(_this.$directionDOM).find(".yBox").removeClass("yBoxFlicker");
	            	}
	        		
	        	}else{
	        		if(!this.options.loginState){
	        			var boxHtml='<div class="boxForJYPOP isnologin" id="'+this.options.direction+'Box">';
	        		}else{
	        			var boxHtml='<div class="boxForJYPOP" id="'+this.options.direction+'Box">';
	        		}
	        		
		            if(this.options.showJBox){
		            	if(this.options.showJBoxFlicker){
		            		boxHtml+='<div class="boxs jBox jBoxFlicker"><i class="boxNum jBoxNum"></i><span class="strTime jBoxTime js_jBoxTime"></span></div>';
		            	}else{
		            		boxHtml+='<div class="boxs jBox"><i class="boxNum jBoxNum"></i><span class="strTime jBoxTime js_jBoxTime"></span></div>';
		            	}
		            	if(_this.options.loginState){
		            		_this.showJBoxStatus();
		            	}
		            }
		            if(this.options.showYBox){
		            	if(this.options.showYBoxFlicker){
		            		boxHtml+='<div class="boxs yBox yBoxFlicker"><i class="boxNum yBoxNum"></i><span class="strTime yBoxTime js_yBoxTime"></span></div>';

		            	}else{
		            		boxHtml+='<div class="boxs yBox"><i class="boxNum yBoxNum"></i><span class="strTime yBoxTime js_yBoxTime"></span>';
		            	}
		            	if(_this.options.loginState){
		            		_this.showYBoxStatus();
		            	}
		            	
		            }
		            boxHtml+='</div>';
		            _this.$element.html(boxHtml);
		            
		            //宝箱事件添加
	    		    this.boxDetailEven();
	        	}
	        	
	        },
	       
	        //银宝箱抽奖次数显示
	        showYBoxStatus:function(){
	        	var _this=this;
	        		//银宝箱抽奖次数
		        	$.ajax({
		        		  url: _this.options.showYBoxNum,
		                    type: "GET",
		                    dataType: "JSON",
		                    data: {
		                        r: Math.random()
		                    },
		                    success:function(d){
		                    	switch(d.status){
		                    		//有抽奖次数
		                    		case 'have-chance':
		                    			var yBoxNum=d.data.silverBoxChance?d.data.silverBoxChance:"";
		                    			$(_this.$directionDOM).find(".yBox .yBoxNum").html(yBoxNum).show();
		                    			//银宝箱闪烁
		                    			_this.boxFlickerStatus(_this.options.showJBoxFlicker,true);
		                    			//金宝箱状态
		                    			d.data.silverBoxChance>=3?_this.showJBoxStatus():""
		                    			break;
		                    		//倒计时
		                    		case 'count-down':
		                    			$(_this.$directionDOM).find(".yBox .yBoxNum").hide();
		                    			d.data.countDown?_this.settimeForOpenBox(".js_yBoxTime",d.data.countDown,false,true):_this.boxFlickerStatus(false,true);
		                    			_this.boxFlickerStatus(_this.options.showJBoxFlicker,false);
		                    			break;
		                    		//银宝箱默认闪烁
		                    		default:
		                    			//银宝箱闪烁
		                    			$(_this.$directionDOM).find(".yBox .yBoxNum").hide();
		                    			_this.boxFlickerStatus(_this.options.showJBoxFlicker,true);
		                    	}
		                    }
		        	});
	        },

	        //金宝箱抽奖次数显示
	        showJBoxStatus:function(){
	        	var _this=this;
	        		//金宝箱抽奖次数
		        	$.ajax({
		        		  url: _this.options.showJBoxNum,
		                    type: "GET",
		                    dataType: "JSON",
		                    data: {
		                        r: Math.random()
		                    },
		                    success:function(d){
		                    	
		                    	if(d.status=="have-chance"){
		                    		var jBoxNum=d.data.goldBoxChance?d.data.goldBoxChance:"";
		                    		//有抽奖次数
		                    			$(_this.$directionDOM).find(".jBox .jBoxNum").html(jBoxNum).show();
		                    			//金宝箱闪烁
		                    			_this.boxFlickerStatus(true,_this.options.showYBoxFlicker);
		                    	}else{
		                    		//没有抽奖机会，显示宝箱规则
		                    		$(_this.$directionDOM).find(".jBox .jBoxNum").hide();
		                    		_this.boxFlickerStatus(false,_this.options.showYBoxFlicker);
		                    	}
		                    }
		        	});
	        },
	        //获取订单接口回执，查询获取奖品
	        paySuccgetOrderFn:function(orderNo){
	        	var _this=this;
	        	$.ajax({
	        		url:_this.options.searchGetAward,//查询奖品接口
	        		type:"GET",
	        		dataType:"JSON",
	        		data:{
	        			r:Math.random(),
	        			order:orderNo,//订单号
	        		},
	        		success:function(d){
	        			var s
	        				if(d.status=="success"){
	        					$("#giftRecharge").popGiftMall({type:"close"});
	        					_this.createSureCoverOk("恭喜您，获得"+d.data);
	        					//金宝箱状态
	        					_this.showJBoxStatus();
	        					//宝箱状态
	        					_this.showYBoxStatus();	
	                    		return false;
	        				}else{
	        					var timer=null;
	        					$("#giftRecharge").popGiftMall({type:"close"});
	        					_this.createSureCoverOk("宝箱开启中...");
	        					clearInterval(timer);
	        					timer=setInterval(function(){
	        						s=5;
	        						clearInterval(timer);
		        					if(s==1){
		        						clearInterval(timer);
		        						return false;
		        					}else{
		        						_this.paySuccgetOrderFn(orderNo);
		        						s--;
		        					}
	        					},2000);
        					}
	    	        	
	        		}
	        	})
	        },
	       
	        //开银宝箱
	        openYBox:function(){
	        	
	        	var _this=this;
	        	$.ajax({
	        		  url: "/wealth/box/opensilverbox",
	                    type: "POST",
	                    dataType: "JSON",
	                    data: {
	                        r: Math.random()
	                    },
	                    success:function(d){
	                    	if(d.status=="success"){
	                    		//银宝箱抽奖次数
	                    		_this.showYBoxStatus();
	                    		//返回订单号
	                    		_this.paySuccgetOrderFn(d.data.orderNo);
	                    	}
	                    }
	        	});
	        },
	        
	        //开金宝箱
	        openJBox:function(){
	        	var _this=this;
	        	$.ajax({
	        		    url: "/wealth/box/opengoldbox",
	                    type: "POST",
	                    dataType: "JSON",
	                    data: {
	                        r: Math.random()
	                    },
	                    success:function(d){
	                    	if(d.status=="success"){
	                    		//金宝箱抽奖次数
	                    		_this.showJBoxStatus();
	                    		//返回订单号
	                    		_this.paySuccgetOrderFn(d.data.orderNo);
	                    	}
	                    }
	        	});
	        },
	      
	        //银宝箱规则
	        createBoxRule:function(isShow){
	        	var boxRule=''+
	        	'<div class="boxRule js_boxRule">'+
		        	'<div class="boxShowPicWrap">'+
		    			'<span class="yboxShowPic">0:00-10:00</span>'+
		    			'<span class="yboxShowPic">11:00-14:00</span>'+
		    			'<span class="yboxShowPic">18:00-22:00</span>'+
		    		'</div>'+
		    		'<div class=yBoxRuleContent>'+
			    		'<p>规则：</p>'+
			    		'<p><i class="boxTxtIcon">1</i>三个有效时间段内，完成回帖+送任一道具后，均可获得</p>'+
			    		'<p class="txt_indent20">一个银宝箱，三个有效时间段内银宝箱个数可累加；</p>'+
			    		'<p><i class="boxTxtIcon">2</i>获得银宝箱后当天有效，请在每天的23:59:59前来开宝箱领取</p>'+
			    		'<p class="txt_indent20">奖励。</p>'+
		    		'</div>'+
	        	'</div>'
	        	
	        	$(".boxForJYPOP").append(boxRule);
	        	if(isShow){
	        		$(".js_boxRule").show();
	        		$(".js_boxJRule").hide();
	        	}else{
	        		$(".js_boxRule").hide();
	        	}
	        	
	        },
	      //金宝箱规则
	        createJBoxRule:function(isShow){
	        	var boxJRule=''+
	        	'<div class="boxJRule js_boxJRule">'+
	        		'<div class="boxShowPicWrap">'+
	        			'<span class="yboxShowPic"></span>'+
	        			'<span class="boxAddIcon"></span>'+
	        			'<span class="yboxShowPic"></span>'+
	        			'<span class="boxAddIcon"></span>'+
	        			'<span class="yboxShowPic"></span>'+
	        			'<span class="boxEqualIcon"></span>'+
	        			'<span class="jboxShowPic"></span>'+
	        		'</div>'+
	        		'<div class=jBoxRuleContent>'+
	        		'<p>规则：</p>'+
	        		'<p><i class="boxTxtIcon">1</i>每天获得三个银宝箱可以获得一个金宝箱；</p>'+
	        		'<p><i class="boxTxtIcon">2</i>金宝箱在获得后的第二天18：00 失效，请在有效时间段内开</p>'+
	        		'<p class="txt_indent20">启领取奖励。</p>'+
	        		'</div>'+
	        	'</div>';
	        		
	        	$(".boxForJYPOP").append(boxJRule);
	        	if(isShow){
	        		$(".js_boxJRule").show();
	        		$(".js_boxRule").hide();
	        	}else{
	        		$(".js_boxJRule").hide();
	        	}
	        	
	        },
	      //兑换成功弹层
	        createSureCoverOk:function(msg){
	        	$(".alertTsg").remove();
	        	var sureCover='<div class="tc alertTsg"><i class="js_close cursor"></i><div class="con"><p class="js_alertMsg">'+msg+'</p></div></div>'
	        	$("body").append(sureCover);
	        	global_main.globalFn.tcCenter($(".alertTsg"));
	        },
	        //确认兑换
	        createSureCover:function(msg,alertMsg){
	        	var sureCover='<div class="tc alertSurePay"><i class="js_close cursor"></i><div class="con"><p class="js_alertMsg">'+msg+'</p><div class="jpayButton"><p class="userInfoExit lf"></p><p class="userInfoError lf"></p></div><p class="js_lastAlertMsg msgForDang">'+alertMsg+'</p></div></div>'
	        	$("body").append(sureCover);
	        	global_main.globalFn.tcCenter($(".alertSurePay"));
	        },
	        
	        //宝箱事件添加
	        boxDetailEven:function(){
	        	var _this=this;
	        	//点击宝箱操作
	        	$(".boxForJYPOP .boxs").click(function(){
	        		var _thisDom=$(this);
	        		global_main.globalFn.checkLoginStatus(function(){
	        			if($(_thisDom).hasClass("yBoxFlicker")&&$(_thisDom).find(".yBoxNum").is(":visible")){
	        				if($(".alertSurePay").length){
	        					$(".alertSurePay .js_alertMsg").html("支付50银符钱即有机会领取银元宝大奖");
	        					$(".alertSurePay .js_lastAlertMsg").html("宝箱将会在今日 23:59:59 后失效。");
	        					global_main.globalFn.tcCenter($(".alertSurePay"));
	        				}else{
	        					_this.createSureCover("支付50银符钱即有机会领取银元宝大奖","宝箱将会在今日 23:59:59 后失效。");
	        				}
	        				return false;
	        			}
	        			if($(_thisDom).hasClass("jBoxFlicker")&&$(_thisDom).find(".jBoxNum").is(":visible")){
	        				if($(".alertSurePay").length){
	        					$(".alertSurePay .js_alertMsg").html("支付50金符钱即有机会领取银元宝大奖");
	        					$(".alertSurePay .js_lastAlertMsg").html("宝箱将会在获得后第二天18:00 后失效。");
	        					global_main.globalFn.tcCenter($(".alertSurePay"));
	        				}else{
	        					_this.createSureCover("支付50金符钱即有机会领取银元宝大奖","宝箱将会在获得后第二天18:00 后失效。");
	        				}
	        				return false;
	        			}
	        		},true);
	        	});
	        	
	        	//银宝箱滑过操作
	        	$(".boxForJYPOP").on("mouseenter click",".yBox",function(){
	        		$(".js_boxRule,.js_boxJRule").remove();
	        		var _thisDom=$(this);
	        		 if(!$(".boxForJYPOP").hasClass("isnologin")){
	        			 if(!$(_thisDom).find(".yBoxNum").is(":visible")){
		        				$(".js_boxRule").length>0?$(".js_boxRule").show():_this.createBoxRule(true);
		        				return false;
		        			}
	        		 }
	        	});
	        	
	        	
	        	$(".boxForJYPOP .boxs").mouseleave(function(){
	        		$(".js_boxRule,.js_boxJRule").hide();
	        	});
	        	
	        	//金宝箱滑过
	        	$(".boxForJYPOP").on("mouseenter click",".jBox",function(){
	        		$(".js_boxRule,.js_boxJRule").remove();
	        		var _thisDom=$(this);
	        		var _thisDomParent=_thisDom.parent();
	        		if(!$(".boxForJYPOP").hasClass("isnologin")){
	        			//金宝箱闪烁或者有抽奖次数时不显示规则
	        			if($(_thisDom).hasClass("jBoxFlicker")||$(_thisDom).find(".jBoxNum").is(":visible")){
	        				_this.createJBoxRule(false);
	        			}else{
	        				//金显示宝箱规则
		        			_thisDomParent.find(".js_boxJRule").length>0?_thisDomParent.find(".js_boxJRule").show():_this.createJBoxRule(true);
		        			return false;
	        			}
	        			
	        		}
	        	});
	        	
	        	$(".boxForJYPOP").on("mouseenter",".js_boxRule",function(){
	        		$(".js_boxRule").show();
	        	}).mouseleave(function(){
	        		$(".js_boxRule,.js_boxJRule").hide();
	        	})
	        	
	        	$(".boxForJYPOP").on("mouseenter",".js_boxJRule",function(){
	        		$(".js_boxJRule").show();
	        	}).mouseleave(function(){
	        		$(".js_boxRule,.js_boxJRule").hide();
	        	})
	        	
	        	//确认
	        	$("body").on("click",".alertSurePay .userInfoError",function(){
	        		$(".bgT,.alertSurePay").hide();
	        		if($(".alertSurePay .js_alertMsg").html()=="支付50银符钱即有机会领取银元宝大奖"){
	        			daoBoxs.getBoxStatusAjaxFn(_this.options.costYMoney,"typeYin");
	        	    }
	        		if($(".alertSurePay .js_alertMsg").html()=="支付50金符钱即有机会领取银元宝大奖"){
	        			daoBoxs.getBoxStatusAjaxFn(_this.options.costJMoney,"typeJin");
		        	}
	        	});
	        	
	        	//取消
	        	$("body").on("click",".alertSurePay .userInfoExit,.alertSurePay .js_close,.alertTsg .js_close",function(){
	        		$(".bgT,.alertSurePay,.alertTsg").hide();
	        	});
	        	
	        }
    }
    
    $.fn.activeOpenBOX = function(options) {
    	   window.changeBoxStatus = new openBox(this, options);
//    	   changeBoxStatus.init();
    }
    
})(jQuery, window, document);