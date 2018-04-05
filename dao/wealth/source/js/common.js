/*
 * add by tht 2017-5-17
 * for recharge common function
 */
$.fn.extend({
	popD:function(option){
		var _this = $(this);
		if(typeof option =="string"){
			if(option=="open"){
				_this.parents(".pop_wrapD").show();
			}else{
				_this.parents(".pop_wrapD").hide();
			}
		}else{
			var defaults = {
					width:"720px",
					height:"655px",
					closeFn:function(){  //关闭按钮函数
						
					},
					closePos:"in"   //out:在弹层框架中   in:内容中
				};
				$.extend(defaults,option);
				
				var pop_wrap = document.createElement("div");
				var pop = document.createElement("div");
				var close;
				var pop_con = document.createElement("div");
				var mask = document.createElement("div");
				
				pop_wrap.className = "pop_wrapD";
				pop.className = "popD";
				
				pop_con.className = "pop_conD";
				mask.className = "maskD";
				
				pop.style.width = parseInt(defaults.width)+"px";
				pop.style.height = parseInt(defaults.height)+"px";
				pop.style.marginLeft = -parseInt(defaults.width)/2+"px";
				pop.style.marginTop = -parseInt(defaults.height)/2+"px";
				
				pop_con.appendChild(_this[0]);
				
				
				pop.appendChild(pop_con);
				
				pop_wrap.appendChild(pop);
				pop_wrap.appendChild(mask);
				
				pop_wrap.style.display = "none";
				
				document.body.appendChild(pop_wrap);
				
				if(defaults.closePos=="in"){
					close = _this.find(".closeD");
					close = close[0];
				}else{
					close = document.createElement("a");
					close.className = "closeD";
					pop.appendChild(close);
				}
				close.onclick = function(){
					pop_wrap.style.display = "none";
					if(defaults.closeFn){
						defaults.closeFn();
					}
				};
			
		}
		
	},
	popErrAndSucD:function(option){  //成功、失败层；确定、取消按钮
		var defaults = {
			str:''+   //字符串可自定义
					'<div class="pop_wrapT js_popErrAndSucTip js_captcha_parent_wrap" style="display:none;">'+
				        '<div class="popT" id="commonErrAndSucPop">'+
				            '<a class="closeT js_closeErrAndSucPop"></a>'+
				            '<div class="pop_conT">'+
				                '<div class="pop_tips js_pop_errAndSuc">'+
				                    '<div class="tip_icon"></div>'+
				                    '<div class="pop_tips_con js_pop_errAndSuc_tip"></div>'+
				                '</div>'+
				                '<div class="pop_other_con js_pop_other_con">'+
				                '</div>'+
				                '<div class="pop_btns_wrap">'+
				                    '<a class="cancel js_cancelErrAndSucPopBtn js_closeErrAndSucPop">取消</a>'+
				                    '<a class="confirm js_confirmErrAndSucPopBtn" data-text="确定" data-status="true">确定</a>'+
				                '</div>'+
				            '</div>'+
				        '</div>'+
				        '<div class="maskT"></div>'+
				    '</div>',
			type:"init",  //nint:初始化 如type为init不需要再传其他参数。  open:打开弹层  close:关闭弹层 外部也可调用关闭功能
			tip:"哎呀，程序美眉描眉呢，刷新下试试！",  //错误层提示语
			className:"suc", //提示图标
			cancelBtn:true, //true:显示, false:不显示   
			confirmBtn:true, //true:显示, false:不显示
			countDownStatus:false, //弹层消失倒计时  false:弹层不需要倒计时关闭；  true：倒计时
			countDownNum:2,  //倒计时默认2s
			popOtherCon:"",   //弹层中附加内容，例如：简单验证码
			closeFn:function(){ 
				// 公用提示弹层关闭按钮执行函数
				  
			},
			confirmFn:function(){
				//公用提示弹层确认按钮执行函数
			}
		};
		$.extend(defaults,option);
		switch(defaults.type){
			case "init":
				if(!$("#commonErrAndSucPop").length){
					$(document.body).append(defaults.str);
				}
				break;
			case "open":
				var time = parseInt(defaults.countDownNum);
				$(".js_pop_errAndSuc_tip").html(defaults.tip);
				$(".js_pop_errAndSuc").removeClass("suc err").addClass(defaults.className);//添加提示图标
				
				//添加弹层附加内容
				$(".js_pop_other_con").html(defaults.popOtherCon);
				//取消按钮
				if(defaults.cancelBtn){
					$(".js_cancelErrAndSucPopBtn").show();
				}else{
					$(".js_cancelErrAndSucPopBtn").hide();
				}
				//确认按钮
				if(defaults.confirmBtn){
					$(".js_confirmErrAndSucPopBtn").show();
				}else{
					$(".js_confirmErrAndSucPopBtn").hide();
				}
				
				//弹层展示
				$(".js_popErrAndSucTip").show();
				
				//弹层消失倒计时
				if(defaults.countDownStatus){
					var timers = setInterval(function(){
						time--;
						if(time==0){
							clearInterval(timers);
							$(document).popErrAndSucD({type:"close"});
							if(defaults.closeFn){
								defaults.closeFn();
							}
						}
					},1000);
				}
				//关闭按钮click执行函数
				$(document).off("click",".js_closeErrAndSucPop").on("click",".js_closeErrAndSucPop",function(){
					$(document).popErrAndSucD({type:"close"});
					if(defaults.closeFn){
						defaults.closeFn();
					}
				});
				//确认按钮click执行函数
				$(document).off("click",".js_confirmErrAndSucPopBtn").on("click",".js_confirmErrAndSucPopBtn",function(){
					if(defaults.confirmFn){
						defaults.confirmFn();
					}
				});
				break;
			case "close":
				$(".js_popErrAndSucTip").hide();
				break;
			default:
				return;
		}
		
	},
	//推荐位弹层
	popSingleGift:function(str,obj){
		var $this = $(this);
		if(typeof str == "string"){
			switch (str){
			case "open":
				var left = parseInt(obj.offset().left); //相对视口左侧距离
				var top = parseInt(obj.offset().top); //相对视口顶部距离
				$this.parents(".js_single_gift_pop").show().css({"left":(left-242)+"px","top":(top-295)+"px"});
				break;
			case "close":
				$this.parents(".js_single_gift_pop").hide();
				break;
			default:
				break;
				
			}
			//关闭按钮
			$this.parents(".js_single_gift_pop").find(".js_closeG").click(function(){
				$this.parents(".js_single_gift_pop").hide();
			});
			//点击非弹层区，弹层消失
			$(document.body).mouseover(function(e){
				//不是推荐位弹层本身、也不是推荐位
				if(!$(e.target).parents(".js_single_gift_pop").length&&!$(e.target).parents(".js_single_gift_enter").length){
					$this.parents(".js_single_gift_pop").hide();
				}
			});
		}
	},
	//道具商城弹层  商城、金符钱充值层 在用
	popGiftMall:function(options){
		var $this = $(this);
		var defaults = {
				type:"open",     //open:打开弹层  ; close:关闭弹层 
				closeFn:function(){
					//关闭按钮执行函数
				}
		};
		$.extend(defaults,options);
		if(typeof defaults.type == "string"){
			switch (defaults.type){
			case "open":  
				$this.parents(".js_all_gifts_pop").show();
				
				//关闭按钮(打开弹层时添加事件)
				$this.parents(".js_all_gifts_pop").find(".js_closeG").click(function(){
					$this.parents(".js_all_gifts_pop").hide();
					if(defaults.closeFn){  //关闭按钮执行函数
						defaults.closeFn();
					}
				});
				
				break;
			case "close":
				$this.parents(".js_all_gifts_pop").hide();
				break;
			default:
				break;
			}
			
		}
	},
	//按钮可操作状态
	setBtnStatusFn:function(status,text){  //按钮上data-status="true" 属性自行添加
		var $this = $(this);
		$this.attr("data-status",status);
		$this.text(text);
	},
	//tab切换功能
	tabConChangeFn:function(tabClickObj,tabConObj,fn){
		tabClickObj.click(function(){
			var $this = $(this);
			tabClickObj.removeClass("cur");
			$this.addClass("cur");
			tabConObj.hide();
			tabConObj.eq($this.index()).show();
			if(fn){
				fn();
			}
		});
	},
	//tab标签跟随效果  tabObj:tab直接容器对象   folObj:跟随对象
	tabFollowCommonFn:function(tabObj,folObj,clickFn){
		var tabChildObj = tabObj.children();  //tab子节点
		
		var timers = null; //定时器

		tabChildObj.each(function(){
			var _this = $(this);
			var _thisCur = _this.attr("data-cur");
			
			//初始值处理
			if(_thisCur == "true"){
				folObj.css({
					"width":_this[0].offsetWidth,
					"left":_this[0].offsetLeft
				});
			}
			//点击出发滑块运动
			_this.click(function(){
				var $this = $(this);
				//重置滑块宽度
				folObj.css({
					"width":$this[0].offsetWidth
				});
				$this.attr("data-cur","true").siblings().attr("data-cur","false");
				clearInterval(timers);
				//定时器控制滑块运动
				timers = setInterval(function(){
					var FollowLeft = parseInt(folObj.css("left"));
					var curOffsetLeft = parseInt($this[0].offsetLeft);
					var speed = (curOffsetLeft-FollowLeft)/6;  //滑块速度控制
					speed = speed>0?Math.ceil(speed):Math.floor(speed);
					
					folObj.css({"left":FollowLeft+speed+"px"});
					
				},10);
				//click事件函数
				if(clickFn){
					clickFn($this.index());
				}
			});
		});
	},
	//判断当前是否为指定的日期
	getIsDateFn:function(num){
		var date = new Date();
		var userIsDate = date.getDate();
		return userIsDate==parseInt(num);
	},
	 scrollPic:function(obj){
	    	var _this=this;
	      var wraper =$(_this).find(".js_giver_wrap");
	   	  var prev = wraper.find(".js_giverPrev");
	   	  var next = wraper.find(".js_giverNext");
	   	  var img = wraper.find('.js_listBox').find('ul');
	   	  var w = img.find('li').outerWidth(true);
	   	  var num=0;
	   	  var liSize=wraper.attr("data-num");
	   	  if(liSize<=5){
	   		  next.css("visibility","hidden");
	   		  prev.css("visibility","hidden");
	   		  }else if(num==0){
	   			  prev.css("visibility","hidden");
	   			  next.css("visibility","visible");
	   		  }
	   	  $(document).off("click",".js_giver_wrap .js_giverNext").on("click",".js_giver_wrap .js_giverNext",function(){
	   		  num++
	   		  var scollNum=$(this).parents(".js_giver_wrap").find(".js_roll li").size();
	   		  $(this).attr("disabled",true);		 
	    		  if(num===scollNum-5){
	    			$(this).parents(".js_giver_wrap").find(".js_giverPrev").css("visibility","visible");
	    			$(this).css("visibility","hidden");
	    		  }else if(num>=0){
	    			  $(this).parents(".js_giver_wrap").find(".js_giverPrev").css("visibility","visible");
	    			  $(this).css("visibility","visible");
	    		  }
	    		  var imgWrap = $(this).parents(".js_giver_wrap").find('.js_listBox').find('ul')
	    	      imgWrap.animate({'margin-left':-w},function(){
	    	    	  imgWrap.find('li').eq(0).appendTo(imgWrap);
	    	    	  imgWrap.css({'margin-left':0});
	    	    		$(this).parents(".js_giver_wrap").find(".js_giverNext").attr("disabled",false); 
	    	      })
	   	  })
	   	  
	   	   $(document).off("click",".js_giver_wrap .js_giverPrev").on("click",".js_giver_wrap .js_giverPrev",function(){
	   		   num-- ;
	   		   $(this).attr("disabled",true);
	    		  if(num<=0){
	    			  $(this).css("visibility","hidden");
	    			  $(this).parents(".js_giver_wrap").find(".js_giverNext").css("visibility","visible");
	    		  }else{
	    			  $(this).css("visibility","visible");
	    			   $(this).parents(".js_giver_wrap").find(".js_giverNext").css("visibility","visible");
	      		  }
	    		  var imgWrap = $(this).parents(".js_giver_wrap").find('.js_listBox').find('ul')
	    		  imgWrap.find('li:last').prependTo(imgWrap);
	    		  imgWrap.css({'margin-left':-w});
	    		  imgWrap.animate({'margin-left':0}); 
	    		  $(this).parents(".js_giver_wrap").find(".js_giverPrev").attr("disabled",false); 
	   	   })
	    },
	    //鼠标悬停礼物数值大于99s显示具体数值
	    textShowFn:function(obj,len){
	    	var _this=this;
	    	var wrap=$(_this).find(".js_giverText");
	    	var showNum='<span class="js_showBox">'+len+'<i class="arrow"></i></span>';
	    	var showNoNum='<span class="js_showTxtBox showNoGiverNum">小主还没有礼物嘞~<i class="arrow showNoGiverNumIcon"></i></span>';
	    	if(len>0){
	    		wrap.hover(function(){
	    			wrap.append(showNum).show();
	    			$(_this).find(".js_showTxtBox").remove();
	        	},function(){
	        		$(_this).find(".js_showBox").remove()
	        	})
	    	}else{
	    		wrap.append(showNoNum).show();

	    	}
	    	
	    }
});


