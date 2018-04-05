/*
 * add by tht 2017-6-12
 * for forum common function
 */
$.fn.extend({	
//接口错误处理
    errorDataOperateFn:function(d,obj,fnObj){  //obj只有吞楼和删除评论时用到
    	var defaults = {
			loginErrorFn:function(){
        		//登录异常处理
			},
			redirectFn:function(){
				//主贴异常处理
			},
			hiddenFloorFn:function(){
				//回帖异常处理
			},
			hiddenCommentFn:function(){
				//评论异常处理
			},
			noNickNameFn:function(){
				//无昵称处理
			},
			notUsedFn:function(){
				//未同步数据
			},
			forbiddenFn:function(){
				//禁言处理
			},
			loadingStatusFn:function(){
				//loading状态
			},
			suspendFn:function(){
        //封号处理
        $(document).logOutFn();
			},
			limitCountDownFn:function(){
				//频繁操作倒计时     发主贴、发回帖、发评论、点赞、关注好友
			},
			unBindPhoneFn:function(){
				//无手机号用户发帖、回帖、评论、送礼验证
				
			},
			otherFn:function(){
				//其他异常处理
			}
    	};
    	$.extend(defaults,fnObj);
    	
    	switch (d.status){
    		case "incorrect-login":  //登录异常
    			$(document).reLoginFn();
    			defaults.loginErrorFn();
    			break;
    		case "redirect":  //主贴异常跳转相应页面
    			defaults.redirectFn();
    			window.location.href = d.message;
    			break;
    		case "hiddenFloor": //回帖异常吞回帖楼层
    			$(document).popErrorF({
    				type:"open",
    				tip:d.message,
    				closeFn:function(){
    					defaults.hiddenFloorFn();
    					obj.parents(".js_replyF_info").hide();
    				}
    			}); 
    			break;
    		case "hiddenComment":  //评论异常吞本条评论
    			$(document).popErrorF({
    				type:"open",
    				tip:d.message,
    				closeFn:function(){
    					obj.parents("li").hide();	
    					defaults.hiddenCommentFn();
    				}
    			}); 
    			break;
    		case "incorrect-nickName":  //设置昵称
				defaults.noNickNameFn();
    			login_main.settingNickPop();
    			break;
    		case "forbidden":  //禁言
    			$(document).popErrorF({
    				type:"open",
    				tip:'呀！您暂被禁言啦，如有疑问请联系<a class="link" target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">在线客服</a>',
    				closeFn:function(){	
    					defaults.forbiddenFn();
    					
    				}
    			}); 
    			break;
    		case "suspend":
    			//封停原因
    			var reason = d.message;
    			var reasonAll = reason;
    			var reasonCut = reason.length>5?reason.substring(0,5)+"...":reason;
    			
    			$(document).popErrorF({
    				type:"open",
    				tip:'<span class="suspend">您的账号因"<a title="'+reasonAll+'">'+reasonCut+'</a>"被限制登录</span><span class="suspend">如有疑问请联系<a class="link" target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">在线客服</a></span>',
    				closeFn:function(){	
    					defaults.suspendFn();
    				}
    			}); 
    			break;
    		case "limitCountDown":
    			if(defaults.limitCountDownFn){ //主贴、回帖、评论  不需要走公用方法
    				//操作频繁倒计时
        			$(document).popErrorF({
        				type:"open",
        				tip:'操作太频繁啦！',
        				closeFn:function(){	
        					defaults.limitCountDownFn();
        					
        				}
        			}); 
    			}
    			
    			break;
    		case "unbindPhone":
    			//未绑定手机号,弹层提示去绑定手机号
    			defaults.unBindPhoneFn(d);
    			var unbindPhoneHtml='您未绑定手机号，请<a class="unbindPhoneLink" target="_blank" href="/user/member/?source='+encodeURIComponent(window.location.href)+'">前往绑定</a>!';
    			$(".js_alertMsg").html(unbindPhoneHtml);
    			global_main.globalFn.tcCenter($(".alertMSG"));
    			break;
    		case "failed":
    		case "unknown_error":
    			defaults.otherFn(d);
    			$(document).popErrorF({type:"open",tip:d.message});
    			break;
    		case "notUsed":
				defaults.notUsedFn();
    			//未同步数据
    			login_main.showSyncDataPop();
        		global_main.globalFn.showTopNickNameFn(d.data)//未同步数据,头部信息展示
    			break;
			case "loading":
				//loading状态
				defaults.loadingStatusFn();
				login_main.showLoading(d);
				break;
    		default:
    			break;
    	}
    	
    },
	//按钮可操作状态
	setBtnStatusFn:function(status,text){  //按钮上data-status="true" 属性自行添加
		var $this = $(this);
		$this.attr("data-status",status);
		$this.text(text);
	},
    //计算中文和字符长度
    strLenFn:function(str){
        var len = 0;  
        var saveStr = str;
        for (var i=0; i<str.length; i++) {  
            if (str.charCodeAt(i)>127 || str.charCodeAt(i)==94) {  
                len += 2;  
            } else {  
                len ++; 
            } 
            //超过40字节剪切
            if(len>40){
                str = str.substr(0,i);
            }
             
        } 
        if(saveStr.length>str.length){
        	return str; 
        }else{
        	return null;
        }
         
    },
	
	//宽度不固定，设置marginleft居中元素
	setMarginLeftFn:function(obj){
		obj.each(function(){
			var $this = $(this);
			var w = parseInt($this[0].offsetWidth);
			$this[0].style.marginLeft = -w/2+"px";
		});
  },
 
	//获取地址参数
	getLinkParamFn:function(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r!==null){
			return  unescape(r[2]);
		}else{
			return null;
		} 
	},
	//鼠标hover效果，使用visibility以便占位
	hoverAnimateFn:function(showObjStr){
		var $this = $(this);
		$this.hover(function(){
			$(this).find(showObjStr).css("visibility","visible");
		},function(){
			$(this).find(showObjStr).css("visibility","hidden");
		});
	},
	//昵称头像图片等比缩放,参数1：原头像地址，参数2:缩略图宽，参数3:缩略图高
	nickHeaderForScale:function(nickUrl,w,h){
		var nickUrlReg = /cos/ig;//正则匹配字符串里面有“cos”的字符
		var nickImg = nickUrl.replace(nickUrlReg,"pic");//替换字符串里面的cos未pic
			nickImg = nickImg +"?imageView2/2/w/"+w+"/h/"+h;
		return nickImg
	},
	
    //html标签过滤器，将白名单标签尖括号换为中括号
    filterHtmlTagsFn:function(con){
		var arrLowerStart = ["<p","<span","<ul","<ol","<li","<strong","<a","<img","<embed","<br","<div","<pre"];  //小写标签开始
		var arrLowerEnd = ["<\/p","<\/span","<\/ul","<\/ol","<\/li","<\/strong","<\/a","<\/img","<\/embed","<\/br","<\/div","<\/pre"];  //小写标签结束
		//匹配白名单标签正则字符串
		var expTagsStr = "("+arrLowerStart.join("|")+"|"+arrLowerEnd.join("|")+")[^>]*>";
		//匹配白名单标签正则表达式
		var expTags = new RegExp(expTagsStr,"gi");
		var expDelTags = new RegExp("<[^>]*>","gi");  //匹配所有标签正则
		var contents = con;   //标签内容都转换为小写
		var conArr = contents.match(expTags);
		if(conArr){
			for(var i = 0,l = conArr.length;i<l;i++){
				var replacedStr = conArr[i].replace("<","[").replace(">","]");
				contents = contents.replace(conArr[i],replacedStr);
			}
			
		}
		
		contents = contents.replace(expDelTags,""); //删除白名单以外标签
		contents = $(document).filterDevKeywordFn(contents);//过滤脚本关键字
		
		return contents;
    },
    //过滤脚本关键字
    filterDevKeywordFn:function(con){
    	var contents=con;
    	if(contents){
    		var expDelStr = new RegExp("java|script|ajax|\\.post|\\.get|\\$|jquery|\\.js|document|write|eval|iframe|frame|alert|console","gi");  //脚本有关单词
        	contents = contents.replace(expDelStr,""); //删除脚本有关单词
    	}

    	return contents;
    },
    canBeTrustStrFn:function(con){
    	var contents=con;
    	var expVideoFlashPlugin = new RegExp("http://www.macromedia.com/go/flashplayer","gi");  //视频插件错误地址
    	var videoFlashPluginYesStr = "http://www.macromedia.com/go/getflashplayer"; //视频插件正确地址
    	
    	if(contents){
    		//替换播放器插件地址
        	contents = contents.replace(expVideoFlashPlugin,videoFlashPluginYesStr); //删除脚本有关单词
    	}

    	return contents;
    	
    },
    //删除指定标签  开始标签、结束标签
    deleteLabelFn:function(label,str){
    	var resultStr = str;
    	//标签正则表达式
    	var expLabel = new RegExp("<[\/]?"+label+"[^>]*>","gi");
    	resultStr = resultStr.replace(expLabel,"");
    	return resultStr;
    	
    },
    //检查数组中是否包含某元素  为兼容ie8及以下，不然可以使用Array.indexOf(),很方便的。
    checkArrayContainStrFn:function(arr,str){
    	var status = false; //false: 待检测数组没有符合元素  true:待检测数组有符合元素
    	for(var i = 0,l =arr.length;i<l;i++){
    		if(arr[i]==str){
    			status = true;
    		}
    	}
    	return status;
    },
    //定时消失效果
    setTimeHideFn:function(obj,time){
    	return  setTimeout(function(){
    		obj.hide();
    	},parseInt(time));
    	
    },
   
    //图片懒加载触发函数：页面初始加载，页面滚动
    imgLazyLoadExcuteFn:function(objStr){
    	var $this = $(this);
    	//页面滚动
    	$(window).scroll(function(){
    		$this.imgLazyLoadFn(objStr);

        });
    	//页面加载
    	$this.imgLazyLoadFn(objStr);

    },
    //图片顶部距离屏幕底部距离小于等于50像素时，且  图片顶部向下距离屏幕顶部50像素时 开始加载
    imgLazyLoadFn:function(objStr){  //objStr：需要加载的Image元素串，如".js_content img:not(.emotion)"
		$(objStr).each(function(){
			
			var imgOffSetTop = parseInt($(this).offset().top);  //当前图片距离页面顶部距离
            var scrollTop = parseInt($(window).scrollTop());  //页面滚动卷入顶部距离
            var winHeight = parseInt($(window).height());  //浏览器可视区域高度
            if(imgOffSetTop<scrollTop+winHeight-50 && imgOffSetTop>scrollTop+50){
            	var srcStr = $(this).attr("_src");
            	if(!$(this).attr("src")){ //有了src属性，不再重复赋值加载图片
            		$(this).attr("src",srcStr);
            	}
            	
            }
            
		});
    },
    //计算锚点的高度  fn控制详细页滚动完毕执行图片加载功能
    scollHashHeightFn:function(objStr,hashName,fn){
    	$(objStr).each(function(){
    		var thisName = $(this).attr(hashName),
    			urlHash=window.location.hash.substr(1);//获取地址#id
    		if(urlHash){
    			if(thisName==urlHash){
    				var heightTop=parseInt($(this).offset().top);
    				$(window).scrollTop(heightTop);
    				return false;
    			}else{
    				$(window).scrollTop(0);
    			}
    		}else{
    			$(window).scrollTop(0);
    		}  
    		if(fn){
    			fn();
    		}
    	});
    },
	
    //时间转换
    formatDate:function(nS){
        var date = new Date(nS),
            Y = date.getFullYear() + '/',
            M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/',
            D = date.getDate(),
            H=date.getHours()<10? '0'+date.getHours()+":" : date.getHours()+":",
            Mi=date.getMinutes();
        if(D<10){
            D="0"+D;
        }
        if(Mi<10){
            Mi="0"+Mi;
        }
        return Y+M+D+"&nbsp;"+H+Mi;
    },

	//时间转换为几小时前，几分钟前
	getDateDiff:function(dateTimeStamp){
		var minute = 1000 * 60;
		var hour = minute * 60;
		var day = hour * 24;	
		var now = new Date().getTime();
		var diffValue = now - dateTimeStamp;
		var result=""; 
		if(diffValue>0){
			var dayC =diffValue/day;
			var hourC =diffValue/hour;
			var minC =diffValue/minute;   
			if(dayC>=1){
				result=$(document).formatDate(dateTimeStamp);
			}else if(hourC>1&&hourC<=24){
				result=parseInt(hourC) +"小时前";
			}else if(minC>1&&minC<=60){
				result=parseInt(minC) +"分钟前";
			}else{
				result="刚刚";
			}
		}         
		return result;
	},
    //字符串中的html转义符&lt;  &gt;  转换为 <>。 &#40;&#41; 转义 () 。&#39; 转义 '
    htmlEscapeFn:function(str){
    	return str.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#39;/g,"'");
    },
    //判断PC端和移动端
    checkClientIsWabOrPcFn:function(){  //返回值flag：pc：PC端；wap:移动端
        var flag ;
        if (navigator.platform.indexOf('Win32') != -1 || navigator.platform.indexOf('Win64') != -1 || navigator.platform.indexOf('MacPPC') != -1 || navigator.platform.indexOf('MacIntel') != -1) {
        	//PC
        	flag = "pc";  
        } else {
        	//Wap
        	flag = "wap";
        }
        return flag;
    },
  //验证码弹框层，层级显示
    popLevelFn:function(elePopWrap,eleShade,zIndexPopWrap,zIndexeleShade){
    	$(elePopWrap).css("z-index",zIndexPopWrap);//弹层
		$(eleShade).css("z-index",zIndexeleShade);//遮罩层
    },
    //存储备用数据
    saveBackupDataFn:function(dataName,datas){
    	var dataNames = $(document).data(dataName);
    	var concatDataArr;   //新旧拼接数组
    	var noRepeatEleArr;  //去重后数组
    	if(dataNames){  //已存在数据，将新旧数据拼接
    		//合并数组
    		concatDataArr = dataNames.concat(datas);
    		//去重
    		for(var i=0,l=concatDataArr.length;i<l;i++){
    			if(!$(document).checkArrayContainStrFn(noRepeatEleArr,concatDataArr[i])){
    		        noRepeatEleArr.push(concatDataArr[i]);
    		       }
    		}
    		$(document).data(dataName,noRepeatEleArr);
    	}else{  //不存在数据，创建新数据
    		$(document).data(dataName,datas);
    	}
    	
    },
	//异常提示层   目前成功、失败都有这个提示层(控制着帖子成功、失败层，积分体系中错误层在积分体系common中重复定义)
	popErrorF:function(option){
		var defaults = {
			str:''+   //字符串可自定义
					'<div class="popErrorTip js_popErrorTip" style="display:none;">'+
						'<div class="popErrorCon">'+
							'<div class="img"></div>'+
							'<p class="js_pop_error_tip">哎哟，登录超时啦，重新登录下吧！</p>'+
							'<a class="btn js_closeErrorPop">知道啦</a>'+
						'</div>'+
						'<div class="maskErrorD"></div>'+
					'</div>',
			type:"init",  //nint:初始化 如type为init不需要再传其他参数。  open:打开弹层  close:关闭弹层 外部也可调用关闭功能
			tip:"哎呀，程序美眉描眉呢，刷新下试试！",  //错误层提示语
			closeFn:function(){ //关闭按钮执行函数
				// 公用提示弹层关闭按钮执行函数
				  
			}
		};
		$.extend(defaults,option);
		switch(defaults.type){
			case "init":
				$(document.body).append(defaults.str);
				break;
			case "open":
				$(".js_pop_error_tip").html(defaults.tip);
				$(".js_popErrorTip").show();
				$(document).off("click",".js_closeErrorPop").on("click",".js_closeErrorPop",function(){
					$(document).popErrorF({type:"close"});
					if(defaults.closeFn){
						defaults.closeFn();
					}
				});
				break;
			case "close":
				$(".js_popErrorTip").hide();
				break;
			default:
				return;
		}
	},
	//切换到电脑端查看页面
	iconPc:function(){
		if (!$(".iconPc").length) {
                $("body").append('<a href="javascript:;" class="iconPc" flag ="true"></a>');
				$(document).on("click", ".iconPc", function () {
						var urlNow = window.location.href;
						var iconPc ;
						if(urlNow.indexOf("?")>-1){//已经含有问号的，使用&追加标识
							iconPc = '&isPc=true';
						}else{
							iconPc = '?isPc=true';
						}
						window.location.href=urlNow+iconPc;
				})
            }
	},
	//昵称替换特殊除理并转码
     nicknameCompleCode:function(forNickname){
           return forNickname;
     }
			
	
});
