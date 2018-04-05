/*
 * add by tht 2017-8-1
 * for gift function
 */
/*=======================update log start=====================*/
/* v1.0.2:
 * content：修复在公共脚本中多次调用道具函数时，初始化多个弹层，导致赠送道具数量是多个层数量的拼装
 * author:tht
 * date:2017-8-24
 *
 */
/*=======================update log end=====================*/
(function(){
	var getRecommendsUrl = "/wealth/gift/goods/recommend"; //获取推荐位信息
	var getGiftUsersUrl='/wealth/gift/users';//获取礼物数量接口
	var getGiftMallListUrl = "/wealth/gift/list"; //获取道具商城道具列表
	var getRestGoldAndSilverUrl = "/wealth/user/wealth"; //获取剩余金、银符钱余额
	var submitGiverGiftUrl = "/wealth/gift/giveGoods"; //获取道具上架状态,库存,提交赠送道具
	var getOrderStatusUrl = "/wealth/recharge/status"; //金符钱订单状态
	var chinaCaptchaMall = null;
	var chinaCaptchaRecommend = null;
	var chinaCaptchaConfirm = null;
	//添加推荐位弹层元素
	var singleGiftStr = ''+
		'<div class="popG single js_single_gift_pop js_captcha_parent_wrap" style="display:none">'+
		    '<div class="closeG js_closeG"></div>'+
		    '<div class="popG_con">'+
		        '<div class="single_gift" id="single_gift">'+
		            '<div class="single_gift_top">'+
		                '<div class="l">'+
		                    '<h2 class="gived_info">送给<span class="name js_to_nickName">***</span></h2>'+
		                '</div>'+
		                '<div class="r">'+
		                    '<span class="gold js_gift_gold">***</span>'+
		                    '<span class="silver js_gift_silver">***</span>'+
		                '</div>'+
		            '</div>'+
		            '<div class="single_gift_wrap">'+
		                '<img class="js_singleGift_imgUrl" src="">'+
		                '<div class="single_gift_info">'+
		                    '<p class="title"><label class="js_singleGift_title">***</label><span class="consume js_singleGift_price">**</span></p>'+
		                    '<p class="des js_singleGift_des">***</p>'+
		                    '<p class="tip js_singleGift_effectDes">***</p>'+
		                '</div>'+
		            '</div>'+
		            '<div class="gift_count_wrap">'+
		                '<div class="gift_count_list js_single_gift_select_counts">'+
		                    '<ul>'+
		                        '<li class="first" data-index="0">1</li>'+
		                        '<li data-index="1">99</li>'+
		                        '<li data-index="2">520</li>'+
		                        '<li data-index="3">999</li>'+
		                        '<li data-index="4">1314</li>'+
		                        '<li class="txt js_gift_input_wrap">'+
		                            '<input type="text" class="js_single_gift_input" placeholder="自定义" maxlength="5">'+
		                        '</li>'+
		                    '</ul>'+
		                    '<div class="selected js_selected"></div>'+
		                '</div>'+
		                '<a class="gift_btn js_giver_single_gift_btn" data-text="赠送" data-status="true">赠送</a>'+
						'<span class="error_yzm js_error_yzm">验证码错误</span>'+
		            '</div>'+
		            '<div class="js_gift_captcha_recommend_wrap js_gift_captcha_common_wrap">'+
                    '</div>'+
                    '<span class="warning_captcha">您当前正进行送礼，若非本人主动操作，请取消赠送</span>'+
		        '</div>'+
		        '<div class="arrow"></div>'+
		        '<div class="in_floor"></div>'+
		    '</div>'+
		'</div>';
	//道具商城弹层元素
	var giftMallStr = ''+
		'<div class="pop_wrapG js_all_gifts_pop js_captcha_parent_wrap" style="display:none">'+
		    '<div class="popG">'+
		        '<div class="closeG js_closeG"></div>'+
		        '<div class="popG_con">'+
		            '<div class="all_gifts" id="all_gifts">'+
		                '<div class="all_gifts_top">'+
		                    '<div class="l">'+
		                        '<h2 class="gived_info">送给<span class="name js_to_nickName">***</span></h2>'+
		                    '</div>'+
		                    '<div class="r">'+
		                        '<span class="gold js_gift_gold">***</span>'+
		                        '<span class="silver js_gift_silver">***</span>'+
		                    '</div>'+
		                '</div>'+
		                '<div class="gifts_wrap">'+
		                    '<div class="gifts_lists js_all_gift_warp">'+
		                    	'<div class="gifts_lists_con js_gifts_con">'+
			                         '<ul class="js_all_gift">'+
			                        '</ul>'+
			                        '<div class="gift_selected js_gifts_selected"></div>'+
			                        '<div class="gift_hover js_gifts_hover" style="display:none;">'+
			                        	'<p class="des js_allGift_des">***</p>'+
			                            '<p class="des js_allGift_effectDes">***</p>'+
			                            '<p class="val js_allGift_price">金符钱：<span>***</span></p>'+
			                        '</div>'+
		                        '</div>'+
		                    '</div>'+
		                    '<a class="prev dis js_all_gift_prev" style="display:none"></a>'+
		                    '<a class="next js_all_gift_next" style="display:none"></a>'+
		                '</div>'+
		                '<div class="gift_count_wrap">'+
		                    '<label class="title">选择数量：</label>'+
		                    '<div class="gift_count_list js_all_gift_select_counts">'+
		                        '<ul>'+
			                        '<li class="first" data-index="0">1</li>'+
			                        '<li data-index="1">99</li>'+
			                        '<li data-index="2">520</li>'+
			                        '<li data-index="3">999</li>'+
			                        '<li data-index="4">1314</li>'+
			                        '<li class="txt js_gift_input_wrap">'+
			                            '<input type="text" class="js_all_gift_input" placeholder="自定义" maxlength="5">'+
			                        '</li>'+
			                    '</ul>'+
		                        '<div class="selected js_selected"></div>'+
		                    '</div>'+
		                '</div>'+
		                '<div class="all_gifts_bottom">'+
		                	'<div class="gifts_price">'+
		                		'<label class="consume_title">道具总价：</label>'+
		                    	'<span class="consume js_giftConsumeNum">***</span>'+
		                    '</div>'+
		                    '<div class="js_gift_captcha_mall_wrap js_gift_captcha_common_wrap">'+
		                    '</div>'+
		                    '<a class="gift_btn js_giver_all_gift_btn" data-text="赠送" data-status="true">赠送</a>'+
							'<span class="error_yzm js_error_yzm">验证码错误</span>'+
		                '</div>'+
		                '<span class="warning_captcha">您当前正进行送礼，若非本人主动操作，请取消赠送</span>'+
		            '</div>'+
		        '</div>'+
		    '</div>'+
		    '<div class="maskG"></div>'+
		'</div>';
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
    function DaoGifts(){
        //constructure
    	this.giftQrcodeTimer = null;  //二维码定时器
		this.giftQrcodeTimeOut = false;  //二维码是否过期： true:过期  false:没过期
    }
    DaoGifts.prototype = {
        init:function(){
        	var _this = this;
        	if(!$("#single_gift").length){  //有道具推荐位层不再重复添加Dom
        		$(document.body).append(singleGiftStr); //添加推荐位弹层元素
        	}
        	if(!$("#all_gifts").length){ //有道具商城层不再重复添加Dom
        		$(document.body).append(giftMallStr); //添加道具商城弹层元素
        	}
        	if(!$("#giftRecharge").length){ //有金符钱充值层不再重复添加Dom
        		$(document.body).append(giftRechargeStr); //添加金符钱充值弹层元素
        	}
        	
        	$(document).popErrAndSucD({type:"init"}); //错误、正确提示弹层初始化
        	
        	_this.getRecommendsFn(); //获取推荐位信息
        	_this.showGiftMallFn();  //展示道具商城信息
        	_this.giverGiftBtnFn();//赠送按钮
        	_this.rechargePopFn();  //关闭道具充值层，打开金符钱充值层
        	
        	_this.getGiverListFn(); //获取礼物个数,送礼人头像 
        	_this.giftCaptchaFn("firstTwo"); //送礼弹层验证码
        	
        },
        //送礼弹层验证码
        giftCaptchaFn:function(type){
        	if(type=="firstTwo"){
        		//道具商城验证码
				chinaCaptchaMall = configCaptcha({
	                captchaInWrap: ".js_gift_captcha_mall_wrap",//内嵌验证码容器（简单，复杂）
	                cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
	                data: { //参数
	                    bid: "qnbtvsg"//区分不同业务 非空
	                },
	                isCaptchaOnePop:false, //简单、复杂验证码都在弹层显示
	                comIn: true, //复杂验证码是否内嵌 true:内嵌  false：弹层 
	                isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
	                inputaccName: "Account", //自定义隐藏域name名称
	                inputName: "js_img_yzm",//自定义账号name名称(失去焦点时验证是否需要验证码)
	                inputCookieName: "js_img_cookies"//自定义隐藏域cookie name名称
                });
            	//推荐道具验证码
				chinaCaptchaRecommend = configCaptcha({
	                captchaInWrap: ".js_gift_captcha_recommend_wrap",//内嵌验证码容器（简单，复杂）
	                cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
	                data: { //参数
	                    bid: "qnbtvsg"//区分不同业务 非空
	                },
	                isCaptchaOnePop:false, //简单、复杂验证码都在弹层显示
	                comIn: true, //复杂验证码是否内嵌 true:内嵌  false：弹层 
	                isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
	                inputaccName: "Account", //自定义隐藏域name名称
	                inputName: "js_img_yzm",//自定义账号name名称(失去焦点时验证是否需要验证码)
	                inputCookieName: "js_img_cookies"//自定义隐藏域cookie name名称
                });
            	chinaCaptchaMall.init();
            	chinaCaptchaRecommend.init();
        	}
        	
        },
        //获取推荐位信息
        getRecommendsFn:function(){
        	var _this = this;
        	$.ajax({
        		url:getRecommendsUrl,
        		type:"get",
        		dataType:"json",
        		data:{
        			r:Math.random()
        		},
        		success:function(d){
        			if(d.status=="success"&&d.data){
        				var gold = d.data.jinfu?d.data.jinfu:0;
        				var silver = d.data.yinfu?d.data.yinfu:0;
        				var list = d.data.goods;
        				var str = '';
        				if(list){
        					for(var i = 0,l=list.length;i<l;i++){
        						str+=''+
		        						'<div class="recommend js_single_gift_enter"'+
			        						'data-id="'+list[i].id+'"'+
			        						'data-gold="'+gold+'"'+
			        						'data-silver="'+silver+'"'+
			        						'data-picUrl="'+list[i].picUrl+'"'+
			        						'data-picGifUrl="'+list[i].picGifUrl+'"'+
			        						'data-effectDes="'+list[i].effectDescription+'"'+
			        						'data-price="'+list[i].price+'"'+
			        						'data-name="'+list[i].name+'"'+
			        						'data-des="'+list[i].description+'"'+
			        						'data-currencyType="'+list[i].currencyType+'"'+
		        						'>'+
			        			    		'<img src="'+list[i].picUrl+'"/>';
									if(list[i].count){  //库存量为0不显示
										var giftCount = list[i].count>=100?"99+":list[i].count;
										str+='<span class="num js_single_num">'+giftCount+'</span>';
									}
			        			    		
									str+='</div>';
		        			}
        					str+='<a class="dot js_all_gifts_enter" data-status="true" data-text="...">...</a>';
        				}
        				$(".js_recommends").html(str); //推荐位追加元素
        				
        				_this.recommendEventFn(); //推荐位绑事件
        				
        			}else{
        				$(document).errorDataOperateFn(d,null,{});
        			}
        		}
        	});
        },
        //推荐位事件，展示推荐位信息弹层
        recommendEventFn:function(){
        	var _this = this;
        	$(".js_replyList").off("mouseover",".js_single_gift_enter").on("mouseover",".js_single_gift_enter",function(){
        		var $this = $(this);
				var parentClass=$(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
        		$(".js_gift_captcha_common_wrap").hide().parents(parentClass).find(".js_error_yzm").hide().end().find("input[name='js_img_yzm']").val("");//初始化清空验证码值与隐藏及错误提示
        		var nickName = "";
        		var nickNameClass = nickName=="呀！跑路啦！"?"default":"";
        		var postId = $this.parents(".js_recommends").attr("data_replyid"); //帖子postId
        		var id = $this.attr("data-id"); //道具Id
        		var picUrl = $this.attr("data-picGifUrl"); //道具图片动图
        		var effectDes = $this.attr("data-effectDes"); //道具特效描述
        		var price = $this.attr("data-price"); //道具单价
        		var name = $this.attr("data-name"); //道具名称
        		var des = $this.attr("data-des"); //道具描述
        		var currencyType = $this.attr("data-currencyType"); //货币类型
        		var getData=$(document).data("userNickName");//获取储备数据
        		
        		for(var i=0,l=getData.length;i<l;i++){
        			if(getData[i].postId==postId){
        				nickName = getData[i].nikeName;
					}
        		}
        		$(".js_to_nickName").html(nickName).addClass(nickNameClass); //被送人昵称
        		_this.getRestGoldAndSilverFn($(".js_gift_gold"),$(".js_gift_silver"));  //获取金、银符钱余额
        		$(".js_singleGift_imgUrl").attr("src",picUrl);
        		$(".js_singleGift_title").html(name);
        		$(".js_singleGift_price").html(price);
        		if(currencyType=="yinfu"){
        			$(".js_singleGift_price").removeClass("silver gold");
        			$(".js_singleGift_price").addClass("silver");
        		}else{
        			$(".js_singleGift_price").removeClass("silver gold");
        			$(".js_singleGift_price").addClass("gold");
        		}
        		$(".js_singleGift_des").html(des);
        		$(".js_singleGift_effectDes").html(effectDes);
        		$(".js_giver_single_gift_btn").attr("data-giftId",id); //存推荐位道具id
        		
        		$(".js_giver_single_gift_btn").attr("data_replyid",postId); //存推荐位postId
        		$(".js_giver_single_gift_btn").attr("data-picurl",picUrl); //存推荐位imgUrl
        		$(".js_giver_single_gift_btn").attr("data-name",name); //存推荐位名称
        		$("#single_gift").popSingleGift("open",$this); //推荐位弹层显示
        		
        		_this.gitSelectedFn(".js_single_gift_select_counts",58); //选择道具效果
        		_this.setInputValFn(); //自定义输入框
        	});
        },
        //道具商城弹层列表相关效果（轮播、悬浮、点击）
    	giftScrollFn:function(options){
    		var _this = this;
    		var defaults = {
    				wrap:".js_all_gift_warp", //列表容器
    				prevBtn:".js_all_gift_prev", //左翻按钮
    				nextBtn:".js_all_gift_next",  //右翻按钮
    				width:119,
    				num:5,
    				time:500,
    				clickFn:function(){
    					//clickFn
    				}
    		};
    		$.extend(defaults,options);
    		
    		var liNum = $(defaults.wrap).find("li").length; //滚动元素个数
    		var widths = parseInt(defaults.width)*liNum+1; //滚动容器宽度(为了实现单边框样式所有元素都有-1px左外边距)
    		var movWid = parseInt(defaults.width)*parseInt(defaults.num); //移动宽度
    		var movNum = Math.ceil(parseInt(liNum)/parseInt(defaults.num)); //整个元素列表从始至终需移动次数
    		var cur = 0;
    		var ul = $(defaults.wrap).find("ul");
    		var ur_warp = $(defaults.wrap).find(".js_gifts_con");
    		ul.css("width",widths);
    		ur_warp.css("width",widths);
    		//初始化道具商城滚动列表
    		$(".js_gifts_selected").css("left","0px");  //道具默认选择第一个
    		$(".js_all_gift").find("li").removeClass("giftCur").end()
    			.find("li:first").addClass("giftCur"); //第一个道具选中供提交时用
    		ur_warp.css("left","0px"); //滚动元素置为其实位置
    		$(defaults.prevBtn).addClass("dis"); //上一屏按钮不可点
    		$(defaults.nextBtn).removeClass("dis");//下一屏按钮可点
    		
    		//下一屏
    		$(defaults.nextBtn).off("click").on("click",function(){
    			var $this = $(this);
    			if($this.hasClass("dis")){
    				return false;
    			}
    			cur++;
    			if(cur==movNum){	
    				return false;
    			}
    			ur_warp.stop(true).animate({"left":-movWid*cur+"px"},defaults.time,function(){
    				$(".js_gifts_selected").animate({"left":movWid*cur+"px"},defaults.time,function(){ //按钮切换，道具选中改屏第一个道具
        				_this.setSelGiftClassFn($(this).css("left")); //设置选中道具class
        			}); 
    			});
    			
    			if(cur==movNum-1){ //倒数第2屏，动完之后置翻屏状态
    				$this.addClass("dis");
    			}
    			$(defaults.prevBtn).removeClass("dis");
    		});
    		//上一屏
    		$(defaults.prevBtn).off("click").on("click",function(){
    			var $this = $(this);
    			if($this.hasClass("dis")){
    				return false;
    			}
    			cur--;
    			if(cur==-1){
    				return false;
    			}
    			ur_warp.stop(true).animate({"left":-movWid*cur+"px"},defaults.time,function(){
    				$(".js_gifts_selected").animate({"left":movWid*cur+"px"},defaults.time,function(){ //按钮切换，道具选中改屏第一个道具
        				_this.setSelGiftClassFn($(this).css("left")); //设置选中道具class
        			}); 
    			});
    			
    			if(cur==0){ //第1屏，动完之后置翻屏状态
    				$this.addClass("dis");
    			}
    			
    			$(defaults.nextBtn).removeClass("dis");
    		});
    		//道具鼠标悬浮(选中层也需要添加)
    		$(defaults.wrap).find("li,.js_gifts_selected").off("mouseenter").on("mouseenter",function(){
    			var $this = $(this);
    			var left = $this.position().left;
    			var liLeft = $this.position().left;
    			var selectLeft;
    			
    			left=left==0?0:left-1;
    			selectLeft = left==0?0:left+2; //selected时，left比li会少1px,且需要在原来基础减1px,所以加2px;
    			
    			var realLeft=$this.hasClass("js_gifts_selected")?selectLeft:liLeft;
    			
    			if($this.hasClass("js_gifts_selected")&&$this.is(":animated")){
    				return false;
    			}
    			
    			var selectedGiftInfo = _this.locationGiftInfoFn(realLeft);
    			
    			if(selectedGiftInfo.attr("data-currencyType")=="yinfu"){
        			$(".js_allGift_price").html("银符钱：<span>"+selectedGiftInfo.attr("data-price")+"</span>");
        		}else{
        			$(".js_allGift_price").html("金符钱：<span>"+selectedGiftInfo.attr("data-price")+"</span>");
        		}
        		$(".js_allGift_des").html(selectedGiftInfo.attr("data-des"));
        		$(".js_allGift_effectDes").html(selectedGiftInfo.attr("data-effectdes"));
        		
    			$(".js_gifts_hover").css("left",left+"px").show();
    		});
    		$(".js_gifts_hover,.js_gifts_selected").off("mouseleave").on("mouseleave",function(){
    			$(".js_gifts_hover").hide();
    		});
    		//道具点击选中 
    		$(".js_gifts_hover").off("click").on("click",function(){
    			var $this = $(this);
    			var left = $this.position().left;
    			$(".js_gifts_selected").css("left",left+"px");
    			_this.setSelGiftClassFn(left); //设置选中道具class
    			
    		});
    	},
    	giftInfoFn:function(){
    		var _this=this;
			var parentClass=$(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
    		$(".js_gift_captcha_common_wrap").hide().parents(parentClass).find(".js_error_yzm").hide().end().find("input[name='js_img_yzm']").val("");//初始化清空验证码值与隐藏及错误提示
    			$("#all_gifts").popGiftMall({type:"open"}); //先展示层  避免其他触发其他功能按钮出现层叠层的情况
				$.ajax({
    				url:getGiftMallListUrl,
    				type:"get",
    				dataType:"json",
    				data:{
    					r:Math.random()
    				},
    				success:function(d){
    					if(d.status=="success"){
    			        	var list=d.data;
    			        	for(var i=0,ko=$("#all_gifts .js_all_gift li").length;i<ko;i++){
    			        		if(list[i].count>0){
    			        			$("#all_gifts .js_all_gift li").eq(i).find(".num").text(list[i].count).show();
    			        		}else{
    			        			$("#all_gifts .js_all_gift li").eq(i).find(".num").hide();
    			        		}
    			        		
    			        	}
    					}
    				}
    			});
				_this.getRestGoldAndSilverFn($(".js_gift_gold"),$(".js_gift_silver"));  //获取金、银符钱余额
			
    	},
        //展示道具商城弹层
        showGiftMallFn:function(){
        	var _this = this;
        	$(".js_replyList").off("click",".js_all_gifts_enter").on("click",".js_all_gifts_enter",function(){
        		var $this = $(this);   
				var parentClass=$(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
        		$(".js_gift_captcha_common_wrap").hide().parents(parentClass).find(".js_error_yzm").hide().end().find("input[name='js_img_yzm']").val("");//初始化清空验证码值与隐藏及错误提示
        		var postId = $this.attr("data_replyid")?$this.attr("data_replyid"):$this.parents(".js_recommends").attr("data_replyid");
        		if($this.attr("data-status")=="true"){
        			$("#all_gifts").popGiftMall({type:"open"}); //先展示层  避免其他触发其他功能按钮出现层叠层的情况
    				$.ajax({
        				url:getGiftMallListUrl,
        				type:"get",
        				dataType:"json",
        				data:{
        					r:Math.random()
        				},
    					beforeSend:function(){
    						$this.setBtnStatusFn("false",$this.attr("data-text"));
    					},
        				success:function(d){
        					$this.setBtnStatusFn("true",$this.attr("data-text"));
        					if(d.status=="success"){
        						var postId = $this.attr("data_replyid")?$this.attr("data_replyid"):$this.parents(".js_recommends").attr("data_replyid");//获取回帖Id
        						var nickName="";
        						var getData=$(document).data("userNickName");	//获取储备数据数组
        						for(var i=0,l=getData.length;i<l;i++){	//便利数组，找到对应的postId的nickName
        							if(getData[i].postId==postId){
        								nickName = getData[i].nikeName;
        							}
        						}
        						
        						_this.renderGiftListFn(d,nickName,postId); //渲染道具商城列表信息

        					}else{
        						$(document).errorDataOperateFn(d);	
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true",$this.attr("data-text"));
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    				_this.getRestGoldAndSilverFn($(".js_gift_gold"),$(".js_gift_silver"));  //获取金、银符钱余额
    			}
        		
        	});
        },
        //渲染道具商城信息
        renderGiftListFn:function(d,nickName,postId){
        	var _this = this;
        	var str = "";
        	var firstClass;
        	var list = d.data
        	
        	//道具少于5个时，左、右翻按钮隐藏
        	if(list.length>5){
        		$(".js_all_gift_prev,.js_all_gift_next").show();
        	}else{
        		$(".js_all_gift_prev,.js_all_gift_next").hide();
        	}
        	//道具列表处理
        	for(var i = 0,l=list.length;i<l;i++){
        		if(i==0){
        			firstClass = "first";
        		}else{
        			firstClass = "";
        		}
        		str+='<li class="'+firstClass+'"'+
		        		'data-id="'+list[i].id+'"'+
						'data-picUrl="'+list[i].giftpicurl+'"'+
						'data-effectDes="'+list[i].gifteffectDescription+'"'+
						'data-price="'+list[i].giftprice+'"'+
						'data-name="'+list[i].giftname+'"'+
						'data-des="'+list[i].giftdescription+'"'+
						'data-currencyType="'+list[i].giftcurrencyType+'"'+
    				'>'+
        				'<img src="'+list[i].giftpicurl+'">'+
		                 '<p class="title">'+list[i].giftname+'</p>';
				if(list[i].count>0){
					str+='<div class="num">'+list[i].count+'</div>';
				}
		                 
				str+='</li>';
        	}
        	$(".js_all_gift").html(str);
        	
        	$(".js_to_nickName").html(nickName); //被送人昵称
        	$(".js_giver_all_gift_btn").attr("data_replyid",postId);//道具商城赠送按钮绑定postId
        	_this.giftScrollFn(); //列表滚动
        	_this.gitSelectedFn(".js_all_gift_select_counts",85,_this.calculateConsumeFn); //选择道具效果
        	_this.setInputValFn();
        	_this.calculateConsumeFn();//设置消费金额
        },
        
        //设置选中道具class为 giftcur  支持提交数据
        setSelGiftClassFn:function(left){
        	var _this = this;
        	var liLeft = parseInt(left)==0?0:parseInt(left)+1; //第一个道具(li)position.left是120,比浮层大1px;
        	var selectedGiftObj = _this.locationGiftInfoFn(liLeft);
			selectedGiftObj.addClass("giftCur").siblings().removeClass("giftCur");
			_this.calculateConsumeFn();//设置消费金额
        },
        //道具弹层，道具数量选择效果
        gitSelectedFn:function(obj,width,fn){
        	
        	$(obj).find(".js_selected").show().css("left","0px"); //默认位置是第一个
        	$(".js_all_gift_input,.js_single_gift_input").val(""); //清空自定义输入框
        	$(obj).find("li:not(.js_gift_input_wrap)").removeClass("selCur").end().find("li:not(.js_gift_input_wrap):first").addClass("selCur");
        	
        	$(obj).find("li:not(.js_gift_input_wrap)").off("click").on("click",function(){
        		var $this = $(this);
        		var left = parseInt($this.attr("data-index"));
        		$(".js_all_gift_input,.js_single_gift_input").val(""); //清空自定义输入框
        		$(obj).find(".js_selected").show().css("left",left*width);
        		//设置数量选中，供提交试用数据
        		$(obj).find("li:not(.js_gift_input_wrap)").removeClass("selCur");
        		$this.addClass("selCur");
        		if(fn){
        			fn();
        		}
        	});
        },
        //自定义输入框逻辑
        setInputValFn:function(){
        	var _this = this;
        	var exp = /[^\d]+/g; //非数字
        	var exp01 = new RegExp(/^0+/); //非数字
        	//道具商城弹层输入框
        	$(".js_all_gift_input").off("keyup").on("keyup",function(){
        		var $this = $(this);
        		selectCountsFn(".js_all_gift_select_counts",$this);
        		_this.calculateConsumeFn(); //计算消费金额
        		
        	});
        	//推荐位弹层输入框
        	$(".js_single_gift_input").off("keyup").on("keyup",function(){
        		var $this = $(this);
        		selectCountsFn(".js_single_gift_select_counts",$this);
        	});
        	//输入框值限制,更改选择框状态
        	function selectCountsFn(selWrap,obj){
        		var val = obj.val();
        		var valOper = val.replace(exp,"").replace(exp01,"");
        		obj.val(valOper);
        		if(obj.val()==""){
        			$(selWrap).find(".js_selected").show().css("left","0px"); //自定义无输入，选择框显示默认第一个
        			//设置第一个为选中class
        			$(selWrap).find("li:not(.js_gift_input_wrap)").removeClass("selCur"); 
        			$(selWrap).find("li:not(.js_gift_input_wrap):first").addClass("selCur")
        		}else{
        			$(selWrap).find(".js_selected").hide(); //自定义有输入，选择框消失
        			$(selWrap).find("li:not(.js_gift_input_wrap)").removeClass("selCur"); 
        		}
        		
        	}
        	
        },
        //计算消费金额（道具商城）
        calculateConsumeFn:function(){
        	var curObj = $(".js_all_gift").find(".giftCur");
        	var price = curObj.attr("data-price");
        	var currencyType = curObj.attr("data-currencytype");
        	var className = currencyType=="jinfu"?"gold":"silver";
        	var num = $(".js_all_gift_input").val()?$(".js_all_gift_input").val():$(".js_all_gift_select_counts").find(".selCur").html();
        	var allConsume = parseInt(price)*parseInt(num);
        	$(".js_giftConsumeNum").removeClass("gold silver").addClass(className).html(allConsume);
        },
        //获取用户剩余金、银符余额
        getRestGoldAndSilverFn:function(objGold,objSilver){
        	$.ajax({
				url:getRestGoldAndSilverUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					if(d.status=="success"){
						objGold.show().html(d.data.jinfu);
						objSilver.show().html(d.data.yinfu);
					}else{
						objGold.hide();	
						objSilver.hide();
					}
				}
			});
        },
        //定位聚焦道具
        locationGiftInfoFn:function(left){
        	var giftInfo;
        	$(".js_all_gift_warp").find("li").each(function(){
        		var $this = $(this);
        		var curLeft=$this.position().left;
        		if(parseInt(curLeft)==parseInt(left)){
        			giftInfo = $this;
        		}
        	});
        	return giftInfo;
        },
        //赠送按钮
        giverGiftBtnFn:function(){
        	var _this = this;
        	//推荐位赠送按钮
        	$(".js_giver_single_gift_btn").off("click").on("click",function(){
        		var $this = $(this);       		
        		var num = $(".js_single_gift_input").val()?$(".js_single_gift_input").val():$(".js_single_gift_select_counts .selCur").text(); //自定义框 空：提交选择数量   不空：框中输入数量
        		if($this.attr("data-status")=="true"){
        			if(_this.checkCaptchaEmptyFn($this)){
        				_this.getGiftStatusAjaxFn($this,num,$this.attr("data-giftid"),$this.attr("data_replyid"),$this.attr("data-picurl"),$this.attr("data-name"),"");
        			}
    			}	
        	});
        	//道具商城赠送按钮
        	$(".js_giver_all_gift_btn").off("click").on("click",function(){
        		var $this = $(this);     
        		var num = $(".js_all_gift_input").val()?$(".js_all_gift_input").val():$(".js_all_gift_select_counts .selCur").text(); //自定义框 空：提交选择数量   不空：框中输入数量
        		if($this.attr("data-status")=="true"&& $this.attr("data_replyid")){
        			if(_this.checkCaptchaEmptyFn($this)){
        				_this.getGiftStatusAjaxFn($this,num,$(".js_all_gift .giftCur").attr("data-id"),$this.attr("data_replyid"),$(".js_all_gift .giftCur").attr("data-picurl"),$(".js_all_gift .giftCur").attr("data-name"),"");
        			}
    			}	
        	});
        },
        //验证码层回滚上级目标层
        returnLastCaptchaPopFn:function(obj){
        	var _this=this;
			//显示上一级触发层
			if(obj.hasClass("js_giver_all_gift_btn")){
				//关闭当前确认层
				$(document).popErrAndSucD({
					type:"close"
				});
				//显示道具商城
				_this.giftInfoFn();  //展示道具商城信息
			}else if(obj.hasClass("js_giver_single_gift_btn")){
					//关闭当前确认层
					$(document).popErrAndSucD({
						type:"close"
					});
					$(".js_single_gift_pop").show();
			}
        },
        //获取道具状态ajax
        getGiftStatusAjaxFn:function($this,num,giftId,postId,imgUrl,title,orderNo,isFormRwm){
        	var _this = this;
        	var thisCaptchaWrap = $this.parents(".js_captcha_parent_wrap").find(".js_gift_captcha_common_wrap");  //验证码容器        			
			var easyCode=thisCaptchaWrap.find("input[name='js_img_yzm']").attr("maxlength",5).val();
        	var easyCookie=thisCaptchaWrap.find("input[name='js_img_cookies']").val();
        	$.ajax({
				url:submitGiverGiftUrl,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
					count:num,
					giftId:giftId,
					postId:postId,
					threadId:$(document).getLinkParamFn("id"),
					orderNo:orderNo,
					validateCode:easyCode,
					cookieValue:easyCookie
				},
				beforeSend:function(){
					$this.setBtnStatusFn("false","加载中");
				},
				success:function(d){
					$this.setBtnStatusFn("true",$this.attr("data-text"));
					if(d.status=="success"){
						if(d.data.desc=="success"){ //赠送成功
							$(document).popErrAndSucD({
								type:"open",
								className:"suc",
								cancelBtn:false,
								confirmBtn:false,
								countDownStatus:true,
								tip:num+"个"+title+"<img src="+imgUrl+" />赠送成功"
							});
							_this.giveSucChangeValFn($this,num,d.data.picUrl,global_main.globalFn.nicknameCompleCode(d.data.nickName),d.data.id); //赠送成功后之后改值操作
							$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
						}else if(d.data.desc=="inventory_not_enough"){ //下架商品库存不足
							$(document).popErrAndSucD({
								type:"open",
								className:"err",
								popOtherCon:"<div class='js_gift_confirm_captcha__wrap'></div>",  //验证码容器
								tip:"该道具库存量不足，是否要送出 <span>"+d.data.count+"个"+title+"</span><img src="+imgUrl+" />？"
							});
							//确定提交按钮不执行封装好的
							$(".js_confirmErrAndSucPopBtn").off("click").on("click",function(){
								if(_this.checkCaptchaEmptyFn($this)){
									_this.getGiftStatusAjaxFn($this,d.data.count,giftId,postId,imgUrl,title,"");
								}
							});
							$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
						}else if(d.data.desc=="balance_not_enough"){  //余额不足
							$(document).popErrAndSucD({
								type:"open",
								className:"err",
								cancelBtn:false,
								tip:"库存道具不足 赠送未完成 <br/><span class='blue'>"+d.data.nickName+"</span>  充值<span class='red'>"+d.data.jinfu+"</span> 金符钱",
								confirmFn:function(){
									$(document).popErrAndSucD({type:"close"});
								}
							});
							$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
						}else if(d.data.desc=="recharge"){  //充值
							$this.parents(".js_captcha_parent_wrap").find("input[name='js_img_yzm']").val("");
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
							
							_this.orderStatusFn($this,num,giftId,postId,imgUrl,title,d.data.orderId); //查询订单状态
							
							_this.giftQrcodeTimer = setTimeout(function(){
								clearTimeout(_this.giftQrcodeTimer);
								_this.giftQrcodeTimeOut = true;  //二维码过期 
								$(".js_gift_recharge_qrcode_timeout").show();
							},180000);  //3分钟
						}
						
						$("#all_gifts").popGiftMall({type:"close"});  //关闭道具商城弹层
						$("#single_gift").popSingleGift("close"); //关闭推荐位弹层
						
					}else if(d.status=="giftUnbindPhone"){
						var unbindPhoneHtml='道友没有绑定手机，收不到您的礼物~</a>';
						$(".js_alertMsg").html(unbindPhoneHtml);
						global_main.globalFn.tcCenter($(".alertMSG"));
					}else if(d.status=="needValidateCode"){
						//输入验证码
						if(isFormRwm=="qrcodeSuc"){
							$(document).popErrAndSucD({
								type:"open",
								className:"err",
								cancelBtn:false,
								tip:"道具赠送未完成<br/><span class='blue'>"+$(".userInfo .userName").text()+"</span>  充值<span class='red'>"+$(".js_must_real_num").text()+"</span> 金符钱",
								confirmFn:function(){
									$(document).popErrAndSucD({type:"close"});
								}
							});
						}else{
							_this.returnLastCaptchaPopFn($this);
							_this.captchaShowFn($this);
							
						}
						$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
					}else if(d.status=="validateCodeError"){
						_this.returnLastCaptchaPopFn($this);
						//验证码错误，刷新
						_this.checkCaptchaErrorFn($this);
						
					}else{
						//下架商品库存量为0在异常处理中
						$(document).errorDataOperateFn(d,null,{
							loginErrorFn:function(){
								$("#all_gifts").popGiftMall({type:"close"});  //关闭道具商城弹层
								$("#single_gift").popSingleGift("close"); //关闭推荐位弹层
								$(document).popErrAndSucD({
									type:"close"
								});
							}
						});
						//验证码隐藏
						_this.captchaHideFn($this);
					}
				},
				error:function(){
					$this.setBtnStatusFn("true",$this.attr("data-text"));
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
        },
		//查询订单状态
		orderStatusFn:function($this,num,giftId,postId,imgUrl,title,orderNO){
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
							//订单成功赠送逻辑
							_this.getGiftStatusAjaxFn($this,num,giftId,postId,imgUrl,title,orderNO,"qrcodeSuc");
						}else{
							if(d.status==="order-waitPay"&&!_this.giftQrcodeTimeOut){
								_this.orderStatusFn($this,num,giftId,postId,imgUrl,title,orderNO);
							}
						}
					}
					
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
		},
		//赠送成功改变相关元素值
		giveSucChangeValFn:function(obj,num,giverPic,giverNickName,giverId){   //obj:当前楼层中的元素，供查找当前楼层 ，num:礼物数  两者为帖子被赠送礼物数服务,giverPic:赠送人头像(只在调用礼物列表时用),giverNickName:赠送人昵称(只在调用礼物列表时用)
			var _this = this;
			_this.getRestGoldAndSilverFn($(".js_gift_gold"),$(".js_gift_silver"));  //获取金、银符钱余额
			_this.getRecommendsFn(); //获取推荐位信息
        	_this.showGiftMallFn();  //展示道具商城信息
        	_this.getGiverMan(obj,num,giverPic,giverNickName,giverId); //帖子被送礼信息
		},
		//判断验证码为空
		checkCaptchaEmptyFn:function(obj){
			var status = true;
			var thisCaptchaWrap = obj.parents(".js_captcha_parent_wrap").find(".js_gift_captcha_common_wrap");  //验证码容器
			var thisCaptchaShowWrap = obj.parents(".js_captcha_parent_wrap").find(".js_gift_captcha_common_wrap:visible"); //验证码容器显示状态
			
			if(thisCaptchaWrap.find("input[name='js_img_yzm']").val()==""&&thisCaptchaShowWrap.length>0){
				thisCaptchaWrap.find(".js_gift_captcha_common_wrap").show();
				var parentClass=obj.parents(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
				thisCaptchaWrap.parents(parentClass).find(".js_error_yzm").html("验证码不能为空").show();
				status = false;
			}
			return status;
		},
		//判断验证码错误
		checkCaptchaErrorFn:function(obj){
			var _this = this;
			var thisCaptchaWrap = obj.parents(".js_captcha_parent_wrap").find(".js_gift_captcha_common_wrap");  //验证码容器
			
			thisCaptchaWrap.show(); 
			var parentClass=obj.parents(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
			thisCaptchaWrap.parents(parentClass).find(".js_error_yzm").html("验证码错误").show();
			//刷新验证码
			_this.refreshPopCaptchaFn(obj);
			thisCaptchaWrap.find("input[name='js_img_yzm']").val("");
		},
		//验证码隐藏
		captchaHideFn:function(obj){
			var thisCaptchaWrap = obj.parents(".js_captcha_parent_wrap").find(".js_gift_captcha_common_wrap");  //验证码容器
			thisCaptchaWrap.hide();
			var parentClass=obj.parents(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
			thisCaptchaWrap.parents(parentClass).find(".js_error_yzm").html("").hide();
		},
		//显示验证码
		captchaShowFn:function(obj){
			var _this = this;
			var thisCaptchaWrap = obj.parents(".js_captcha_parent_wrap").find(".js_gift_captcha_common_wrap");  //验证码容器
			thisCaptchaWrap.show();
			var parentClass=obj.parents(".js_captcha_parent_wrap:visible").find("#single_gift").hasClass("single_gift")?".single_gift":".all_gifts_bottom";
			thisCaptchaWrap.parents(parentClass).find(".js_error_yzm").html("").hide();
			//刷新验证码
			if(!$("#commonErrAndSucPop").is(":visible")){
				_this.refreshPopCaptchaFn(obj);
			}
		},
		//刷新验证码
		refreshPopCaptchaFn:function(obj){
			if(obj.hasClass("js_giver_all_gift_btn")){
				chinaCaptchaMall.refreshCaptcha($(".js_gift_captcha_mall_wrap"));  
			}else if(obj.hasClass("js_giver_single_gift_btn")){
				chinaCaptchaRecommend.refreshCaptcha($(".js_gift_captcha_recommend_wrap"));  
			}else if(obj.hasClass("js_confirmErrAndSucPopBtn")){
				chinaCaptchaConfirm.refreshCaptcha($(".js_gift_confirm_captcha__wrap"));  
			}
		},
		//充值层中立即充值按钮，触发充值金符钱层
		rechargePopFn:function(){
			$(".js_pay").click(function(){
				$("#giftRecharge").popGiftMall({type:"close"});  //关闭充值层
			});
		},
      //展示发帖送礼人及数量
        getGiverListFn:function(){
        	var _this=this
        	$(".js_givers_list").each(function(){
        		var $this=$(this);
        		var contentId=$this.attr('data_replyid');
        		_this.getGiverAjaxFn(contentId,$this);
        		
        	})
        	
        },
        //点击赠送新增送礼人数
        getGiverMan:function(obj,giverNum,giverPic,giverNickName,giverId){
          var postId = obj.attr("data_replyid");
          var giverImg = giverPic?giverPic:"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";
        	var giverUrl = !giverId?"javascript:void(0);":'/user?id='+giverId;//昵称链接转码
        	$(".js_givers_list").each(function(){
        		var $this = $(this);
        		if($this.attr("data_replyid")==postId){
        			var num=$this.find(".js_giverText").attr("data_givernum");
        			var numNew=parseInt(num)+parseInt(giverNum);
        			var giverNameOld=$this.find(".js_giver_wrap").find(".js_roll");
        			var numNewShow=numNew>99?'99+':numNew;//大于99显示99+否则显示真是数据
        			var js_giverNumBg=numNew>99?"giver_numlarge":"giver_num";//大于99显示切换背景
                	
        			//礼物容器
        			var oWrapNum='<i class="giver_icon">礼物数</i><span class="'+js_giverNumBg+'">'+numNewShow+'</span>';
        			
        			//滚动头像容器
        			var oli='<li class="pull_left" title="'+giverNickName+'" dateId="'+giverId+'"><a href="'+giverUrl+'" target="_blank" class="smallimage"><img src="'+giverImg+'"/></a></li>'
        			$this.find(".js_giver_wrap").find(".js_roll li").each(function(){
        				var dateid=$(this).attr("dateId");
        				if(dateid==giverId){
        					$(this).remove();
        				}
        			});
        			giverNameOld.prepend(oli);//新获取送礼头像展示出来
        			
                	$this.find('.js_giverText').html(oWrapNum).attr("data_givernum",numNew);//新获取是数据展示出来
                	 //礼物数值大于0时显示具体数值，悬浮框
				    $this.textShowFn($this,parseInt($this.find(".js_giverText").attr("data_givernum")));
        		}
        	});
        },
        
        //获取礼物数据接口
        getGiverAjaxFn:function(contentId,$this){
        	$.ajax({
        		url:getGiftUsersUrl,
        		type:"get",
        		dataType:"json",
        		async:true,
        		data:{
        			contentType:'thread',
        			contentId:contentId,
        			r:Math.random()
        		},
        		success:function(data){
        			var d=data;
        			if(d.status=="success"){
        				
        				//操作成功
        				var html = '<div class="pull_left giver_wrap_num js_giverText" data_giverNum='+d.data.giftCount+'>';
        				var giftCount=d.data.giftCount;
        				var js_giverNumBg=d.data.giftCount>99?'giver_numlarge':'giver_num';
	        					if(giftCount==0){
    	        					html+='<i class="giver_icon">礼物数</i>';
    	        				}else if(giftCount>99){
    	        					html+='<i class="giver_icon">礼物数</i>'+
    					        	'<span class="'+js_giverNumBg+'">99+</span>';
    	        				}else{
    	        					html+='<i class="giver_icon">礼物数</i>'+
    					        	'<span class="giver_num">'+giftCount+'</span>';
    	        				}
	        				
						       html+= '</div>';
						       
						       if(d.data.userData){
						    	  
						        		var links = d.data.userData;
						        		html+='<div class="pull_left clearfix giver_wrap_person js_giver_wrap" data-num="'+d.data.userData.length+'">'+
    						        	'<span class="giver_prev pull_left js_giverPrev">prev</span>'+
    						        	'<div class="js_listBox pull_left clearfix ">'+
    						        	'<ul class="giver_touxiang js_roll">'
						        		for(var i=0;i<d.data.userData.length;i++){
						        			var linkNames = links[i].nikeName; //昵称
						        			var nikeNameLink = !linkNames?"javascript:void(0);":'/user?id='+links[i].id;//昵称换为userID
						        			var headPicImg = !links[i].headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":links[i].headPic; //昵称头像
						        				html +='<li class="pull_left" title='+linkNames+' dateId="'+links[i].id+'"><a href="'+nikeNameLink+'" target="_blank" class="smallimage"><img src="'+headPicImg+'"/></a></li>';
    						        	}
						        		html +='</ul>';
										
										html +='</div>'+
    						        	'<span class="giver_next pull_left js_giverNext">next</span>';
    						        	html +='</div>';
    						        	$this.html(html);
    						        	//头像滚动
    						        	$this.scrollPic($this);
						        	}else{
						        		html+='<div class="pull_left clearfix giver_wrap_person js_giver_wrap">'+
    						        	'<div class="js_listBox pull_left clearfix ">'+
    						        	'<ul class="giver_touxiang js_roll">'
						        		html +='</ul>';
										html +='</div>';
    						        	
    						        	html +='</div>';
    						        	$this.html(html);
						        	}
						       //礼物数值大于0时显示具体数值
						       $this.textShowFn($this,parseInt($this.find(".js_giverText").attr("data_givernum")));
        			}
        			
        		},
        		error:function(){
        			$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        		}
        	})
        }
    };
    window.daoGifts = function(){
        return new DaoGifts();
    };
})();



