(function($,win,doc,unde){
	var daoTradeChinaCaptcha=null;//验证码创建
	//初始化短信类型
	daoTradeChinaCaptcha = configCaptcha({
		captchaInWrap: ".js_configCaptchaPopIn",//内嵌验证码容器（简单，复杂）
		cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
		data: { //参数
			bid: "wbheanyerpbeq"//区分不同业务 非空
		},
		isCaptchaOnePop:true, //简单、复杂验证码都在弹层显示
		comIn: false, //复杂验证码是否内嵌 true:内嵌  false：弹层 
		isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
		inputaccName: "Account", //自定义隐藏域name名称
		inputName: "tradeCaptcha",//自定义账号name名称(失去焦点时验证是否需要验证码)
		inputCookieName: "tradeCookies"//自定义隐藏域cookie name名称
	});
    daoTradeChinaCaptcha.init();//初始化验证码
	$.fn.pageFun = function(options){
		var defaults = {
			pageDiv   : $(this).find(".pageDiv"),
			pageDivLi : $(this).find(".pageDiv tr"),
			page      : $(this).find(".page"),
			pageMenu  : $(this).find(".pageMenu"),
			pageMenuLi: $(this).find(".pageDiv tr"),
			firstPage : $(this).find(".firstPage"),
			prevPage  : $(this).find(".prevPage"),
			pageNum   : $(this).find(".pageNum"),
			nextPage  : $(this).find(".nextPage"),
			pageObj   : $(this).find(".pageObj"),
			pageObjLi : $(this).find(".pageObj li"),
			lastPage  : $(this).find(".lastPage"),
            keuInput  : $(this).find(".keuInput"),
            btnSure   : $(this).find(".btnSure"),
			notContent: $(this).find(".notContent"),
			totalPage : $(this).find(".totalPage"),
			pNum      : 1,
			lastNum   : 0,
			cacheNum  : 1,
			min       : 0,
			res       :null
		};
		var opts = $.extend({},defaults,options);

		var Method = {
			init : function(){
				Method.getData(); /*请求接口获得数据*/
				Method.handleEvent(); /*事件处理*/
			},

			getData : function(){
				$.ajax({
					url: opts.interFace,
		            type: "GET",
		            dataType: "JSON",
		            data: opts.paramObj,
		            success: function (data) {
			                if(data.status == "success"){
								daoTradeChinaCaptcha.closeCaptchaPop();//关闭验证码
					    		opts.res = data.data;
					    	if((opts.res.length <= opts.displayCount)&&(opts.res.length > 0)){
								opts.displayCount = opts.res.length;
		                        opts.lastPage.addClass("disabled").show();
								opts.nextPage.addClass("disabled").show();
					    	}else if(opts.res.length == 0){
					    		opts.notContent.removeClass("hide");
					    		opts.firstPage.addClass("disabled").hide();
							 	opts.prevPage.addClass("disabled").hide();
							 	opts.lastPage.addClass("disabled").hide();
							 	opts.nextPage.addClass("disabled").hide();
							 	opts.firstPage.unbind("click");
							 	opts.lastPage.unbind("click");
							 	opts.prevPage.unbind("click");
							 	opts.nextPage.unbind("click");
							 	$(".js_cx").attr("keepRepeat","true");
								return;
					    	}
					    	else{
					    		opts.pNum = Math.ceil(opts.res.length / opts.displayCount);
					    	}

					    	opts.notContent.addClass("hide");
	                		for (var i = 0; i < opts.displayCount; i++) {
	                            opts.pageDiv.append(opts.dataFun(opts.res[i]));
	                        }

	                        for (var a = 0; a < opts.pNum; a++) {
	                            opts.pageObj.append(opts.pageFun(a+1));
	                        }

							opts.firstPage.addClass("disabled").show();
							opts.prevPage.addClass("disabled").show();
	                        opts.pageObj.find("li:first-child").addClass("active");
	                        if(opts.res.length <= opts.displayCount){
	                        	opts.nextPage.addClass("disabled").attr("disabled",true).show();
	                        }else{
	                        	 opts.nextPage.removeClass("disabled").attr("disabled",false).show();
	                        }
	                        opts.totalPage.text(opts.pNum);
	                        Method.showPageindex(0, opts.maxPage, 0);
							
	                	}else if(data.status=="incorrect-captcha"){
							daoTradeChinaCaptcha.callbackCaptchaErrorFn(true); //验证码错误提示
							daoTradeChinaCaptcha.refreshCaptcha($(".js_configCaptchaPopIn"));//刷新验证码
							opts.notContent.removeClass("hide");
							opts.firstPage.addClass("disabled").hide();
							opts.prevPage.addClass("disabled").hide();
							opts.lastPage.addClass("disabled").hide();
							opts.nextPage.addClass("disabled").hide();				
							opts.firstPage.unbind("click");
							opts.lastPage.unbind("click");
							opts.prevPage.unbind("click");
							opts.nextPage.unbind("click");
							$(".js_cx").attr("keepRepeat","true");
							return false;
	                	}
		            	 //页码位置居中显示
		            	$(".js_page").css({
		            		"display":"block",
		            		"left":"50%",
		            		"margin-left":-($(".js_page").width()/2)
		            	})
		            }
				});
			},
			handleEvent : function(){
				
				opts.pageObj.off("click","li").on("click","li",function(){ 
					
					if($(this).attr("disabled")=="disabled"){
						return false;
					}
					/*点击页码切换*/
					$(this).addClass("active");
					opts.pageDiv.empty();
					$(this).siblings("li").removeClass("active");

	                opts.cacheNum = $(this).text();
					if($(this).text() == 1){
						 opts.firstPage.addClass("disabled").attr('disabled',true);
						 opts.prevPage.addClass("disabled").attr('disabled',true);
						 opts.lastPage.removeClass("disabled").attr('disabled',false);
						 opts.nextPage.removeClass("disabled").attr('disabled',false);
	                    if (opts.pNum == 1) {
	                      	 opts.lastPage.addClass("disabled").attr('disabled',true);
							 opts.nextPage.addClass("disabled").attr('disabled',true);
							 Method.xhhtml($(this).text(),opts.res.length);
							 return ;
	                    }
                  
					}else if($(this).text() == opts.pNum){
						 opts.firstPage.removeClass("disabled").attr('disabled',false);
						 opts.prevPage.removeClass("disabled").attr('disabled',false);
						 opts.lastPage.addClass("disabled").attr('disabled',true);
						 opts.nextPage.addClass("disabled").attr('disabled',true);

					 	if(opts.res.length<(opts.displayCount*opts.pNum)){
							Method.xhhtml($(this).text(),opts.res.length);
							return
						}

					}else{
						opts.firstPage.removeClass("disabled").attr('disabled',false);
						 opts.prevPage.removeClass("disabled").attr('disabled',false);
						 opts.lastPage.removeClass("disabled").attr('disabled',false);
						 opts.nextPage.removeClass("disabled").attr('disabled',false);
					}
					Method.showPageindex(0, opts.maxPage, $(this).text());
					Method.xhhtml($(this).text(),$(this).text()*opts.displayCount);
				});

				opts.prevPage.off().click(function(){ /*点击上页*/
					opts.nextPage.removeClass("disabled").attr("disabled",false);
					if(opts.cacheNum == 1){
						$(this).attr("disabled",true);
						opts.nextPage.attr("disabled",true).addClass("disabled");
						
						return;
					}else{
						$(this).attr("disabled",false);
						
					}
					if($(this).attr("disabled")=="disabled"){
						return false;
					}
					if(opts.cacheNum == 2){
						opts.firstPage.addClass("disabled").attr("disabled",true);
						opts.prevPage.addClass("disabled").attr("disabled",true);
						opts.lastPage.removeClass("disabled").attr("disabled",false);
						opts.nextPage.removeClass("disabled").attr("disabled",false);
					}

					opts.pageDiv.empty();
					opts.cacheNum--
					//opts.lastPage.removeClass("disabled");
					opts.nextPage.attr('disabled',false);
					$(".pageObj li").eq(opts.cacheNum-1).addClass("active");
					$(".pageObj li").eq(opts.cacheNum-1).siblings("li").removeClass("active");
					Method.xhhtml(opts.cacheNum,opts.cacheNum*opts.displayCount);
					Method.showPageindex(0, opts.maxPage, opts.cacheNum);
				});

				opts.nextPage.off().click(function(){  /*点击下页*/
					//opts.prevPage.attr("disabled",false);
					if($(this).attr("disabled")=="disabled"){
						return false;
					}
					if(opts.cacheNum == opts.pNum){
						$(this).attr("disabled",true)
						return;
					}else{
						$(this).attr("disabled",false)
					}
					opts.pageDiv.empty();
					opts.cacheNum++
					$(".pageObj li").eq(opts.cacheNum-1).addClass("active");
					$(".pageObj li").eq(opts.cacheNum-1).siblings("li").removeClass("active");
				//	Method.showPageindex(0, opts.maxPage, opts.cacheNum);
					if(opts.cacheNum == opts.pNum){
						opts.lastPage.addClass("disabled").attr("disabled",true);
						opts.nextPage.addClass("disabled").attr("disabled",true);
						opts.firstPage.removeClass("disabled").attr("disabled",false);
						opts.prevPage.removeClass("disabled").attr("disabled",false);
					    Method.xhhtml(opts.cacheNum,opts.cacheNum*opts.displayCount);
						//Method.xhhtml(opts.cacheNum,opts.res.length);
					}else{
						Method.xhhtml(opts.cacheNum,opts.cacheNum*opts.displayCount);
						opts.firstPage.removeClass("disabled");
						opts.prevPage.removeClass("disabled").attr("disabled",false);
						//Method.xhhtml(opts.cacheNum,opts.cacheNum*opts.displayCount);
						Method.showPageindex(0, opts.maxPage, opts.cacheNum);
					}
					
				});
				opts.firstPage.on("click",function(){   /*点击首页*/
					if($(this).attr("disabled")=="disabled"){
						return false;
					}
					opts.pageDiv.empty();
					opts.firstPage.addClass("disabled").attr('disabled',"true");
					opts.prevPage.addClass("disabled").attr('disabled',"true");
					opts.lastPage.removeClass("disabled").removeAttr("disabled");
					opts.nextPage.removeClass("disabled").removeAttr("disabled");
					$(".pageObj li").eq(0).addClass("active");
					$(".pageObj li").eq(0).siblings("li").removeClass("active");
					Method.xhhtml(1,opts.displayCount);
					opts.cacheNum = 1;
					Method.showPageindex(0, opts.maxPage, 0);
				});

				opts.lastPage.on("click",function(){  /*点击尾页*/
					opts.pageDiv.empty();
					opts.firstPage.removeClass("disabled").removeAttr("disabled");
					opts.prevPage.removeClass("disabled").removeAttr("disabled");
					opts.lastPage.addClass("disabled").attr('disabled',"true");
					opts.nextPage.addClass("disabled").attr('disabled',"true");
					$(".pageObj li").eq(opts.pNum-1).addClass("active");
					$(".pageObj li").eq(opts.pNum-1).siblings("li").removeClass("active");
					opts.cacheNum = opts.pNum;
					Method.xhhtml(opts.pNum,opts.res.length);
					Method.showPageindex(0, opts.maxPage, opts.pNum);
				});

				opts.btnSure.on("click",function(){   /*输入页码 跳转*/
                    var val = opts.keuInput.val();
                    if((val == "")||val<=0){
                    	opts.keuInput.val(1);
                    	alert("请输入有效页码");
                        return
                    }

                    if((Number(val)>opts.pNum)){
                    	alert('共'+opts.pNum+'页');
                        return
                    }
                    opts.pageDiv.empty();

                    $(".pageObj li").eq(val-1).addClass("active");
                    $(".pageObj li").eq(val-1).siblings("li").removeClass("active");
                    opts.cacheNum = val;
                    Method.showPageindex(0, opts.maxPage, val);
                    if(val == "1"){
                        opts.firstPage.addClass("disabled").attr('disabled',"true");
                        opts.prevPage.addClass("disabled").attr('disabled',"true");
                        opts.lastPage.removeClass("disabled").removeAttr("disabled");
                        opts.nextPage.removeClass("disabled").removeAttr("disabled");
                        if(opts.pNum == 1){
                            opts.firstPage.addClass("disabled").attr('disabled',"true");
                            opts.prevPage.addClass("disabled").attr('disabled',"true");
                            opts.lastPage.addClass("disabled").attr('disabled',"true");
                            opts.nextPage.addClass("disabled").attr('disabled',"true");
						}
					}else if(val == opts.pNum){
						if($(this).attr("disabled")=="disabled"){
							return false;
						}
                        opts.firstPage.removeClass("disabled").removeAttr("disabled");
                        opts.prevPage.removeClass("disabled").removeAttr("disabled");
                        opts.lastPage.addClass("disabled").attr('disabled',"true");
                        opts.nextPage.addClass("disabled").attr('disabled',"true");
                        Method.xhhtml(val,opts.res.length);
                        return;
					}else {
                        opts.firstPage.removeClass("disabled").removeAttr("disabled");
                        opts.prevPage.removeClass("disabled").removeAttr("disabled");
                        opts.lastPage.removeClass("disabled").removeAttr("disabled");
                        opts.nextPage.removeClass("disabled").removeAttr("disabled");
					}
                    Method.xhhtml(val,val*opts.displayCount);
                });

			},
			xhhtml : function(index,count){
				for (var i = ((index-1)*opts.displayCount); i < count; i++) {
                    opts.pageDiv.append(opts.dataFun(opts.res[i]));
                }
                opts.keuInput.val(index);
			},
			showPageindex : function(min, max, index) {
                if (index <= Math.ceil(max / 2)) {
                    min = 0;
                    //max = max;
                }
                else if (opts.pNum - index < Math.ceil(max / 2)) {
                    min = opts.pNum - max;
                    max = opts.pNum ;
                } 
			 else {

                    min = Math.round(index - max / 2)-1;
                    max = Math.round(Number(index) + Number(max / 2))-1;
                }
                $(".pageObj li").hide();
                for (var i = min; i < max; i++) {
                    $(".pageObj li").eq(i).show();
                }
            }
		}

		Method.init();
	}
})(jQuery,window,document,undefined)