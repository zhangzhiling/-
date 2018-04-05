(function(){
	var submitForumUrl = "/forum/thread"; //提交新帖子
	var getDraftUrl = "/forum/thread/draft";//获取草稿  get：获取  post:保存草稿
	
	var forumSubmitTimer = null; //拦截频繁发主贴定时器
	var forumSubmitTimeNum = 0;  //定时器倒计时数字
	var postedChinaCaptcha = null;//防灌水发帖验证码

	var htmls = ''+
    '<div class="pop_f_wrap" style="display:none;">'+
        '<div class="pop_f standard"  id="forumPost">'+
            '<div class="f_post">'+
                '<div class="f_post_header">'+
                    '<h3>主帖<span class="postFontSize js_shit_title">（如您输入括号或尖括号可能造成内容显示不完整）</span></h3>'+
                    '<div class="f_post_tools">'+
                        '<a class="js_miniScreen" title="最小化">'+
                            '<i class="minIcon"></i>'+
                        '</a>'+
                        '<a class="js_fullScreen" title="全屏">'+
                            '<i class="fullIcon"></i>'+
                        '</a>'+
                        '<a class="js_closeForum" title="关闭">'+
                            '<i class="closeIcon"></i>'+
                        '</a>'+
                    '</div>'+
                '</div>'+
                '<div class="f_post_title">'+
                    '<input type="text" class="inp" id="newTopicTitle"  placeholder="帖子标题（30个汉字，60个英文）" maxlength="60">'+
                    '<span class="err js_title_err" style="display:none;">超出字数限制</span>'+
                '</div>'+
                '<div class="f_post_con">'+
                    '<div class="f_post_editor">'+
                        '<script type="text/plain" id="myEditor">正文</script>'+
                    '</div>'+
                    '<div class="count">'+
                        '<h3><span><i class="js_editor_count">0</i>/5000</span>个字</h3>'+
                        '<span class="err js_con_err" style="display:none">正文不能为空</span>'+
                    '</div>'+
                    '<div class="tag">'+
                        '<ul class="tag_selected js_tag_selected">'+
                        '</ul>'+
                        '<div id="OaSearchStaff" class="txt_con">'+
                            '<input type="text" value="" placeholder="编辑标签" class="txt js_oaSearch">'+
                            '<input type="hidden" class="js_oaSearchResult" name="" value="" />'+
                        '</div>'+
                        '<div class="tip js_tag_default" style="display:block;">（最多5个标签，每个标签不多于5个字，包括中英文, 仅支持三个标点符号：“.”, "—", "__"）</div>'+
                        '<span class="tag_err js_tag_err"></span>'+
                    '</div>'+
                    '<div class="recommend_tag">'+
                    	'<label class="recommend_title">推荐标签</label>'+
	                    '<ul class="tag_list js_recommend_tags">'+
	                    '</ul>'+
	                '</div>'+
                    '<div class="f_post_bottom">'+
                        '<div class="forms">' +
                            '<div class="captcha js_forum_captcha_wrap" style="display:none;">' +
                                '<div class="js_forum_captcha_box"></div>' +
                                '<span class="err js_captcha_err"></span>' +
                            '</div>' +
                            '<a class="btn js_submitForum" data-status="true">发表</a>' +
                        '</div>' +
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="mask_f js_mask_f"></div>'+
    '</div>';
    function DaoForum(){
        this.textNum = 0;
        
    }
    DaoForum.prototype = {
        init:function(obj){
        	var _this = this;
        	if($("#forumPost").length==0){
        		$(document.body).append(htmls); //添加主帖html
        	}
            //发帖验证码初始化start
        	postedChinaCaptcha = configCaptcha({
        	    captchaInWrap: ".js_forum_captcha_box",//内嵌验证码容器（简单，复杂）
        	    cssLinkSrc: "http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
        	    data: { //参数
        	        bid: "qnbnagvveevtngvat"//区分不同业务 非空
        	    },
        	    isCaptchaOnePop: false, //简单、复杂验证码都在弹层显示
        	    comIn: true, //复杂验证码是否内嵌 true:内嵌  false：弹层 
        	    isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
        	    inputaccName: "Account", //自定义隐藏域name名称
        	    inputName: "CaptchaForPostedMsg",//自定义账号name名称(失去焦点时验证是否需要验证码)
        	    inputCookieName: "cookiesForPostedMsg"//自定义隐藏域cookie name名称
        	});
        	postedChinaCaptcha.init();//初始化验证码
            //发帖验证码初始化end

        	//全局设置该模块内编辑器的展示方式 
        	window.UMEDITOR_HOME_URL = "/forum/static/ueditor/";  //相对路径
            var me = UM.getEditor('myEditor',{
                initialFrameHeight:231,
                initialFrameWidth:"100%",
                autoHeightEnabled:false
            });
            _this.titleFn(); 
            _this.contentFn(me); 
            _this.headerToolsFn(me);
            _this.submitForumFn(me);
            _this.saveDraftFn(me);
            //发帖入口
            _this.enterClickFn(obj,me);
            return me; //返回编辑器实例
        },
        //发帖入口
        enterClickFn:function(obj,me){
        	var _this = this;
        	//obj 是一个以逗号分隔各个入口按钮的class字符串
			$(document).on("click",obj,function(){
				var $this = $(this);
				var btnType = $this.attr("data-btnType");
				$(".js_closeForum").attr("data-btnType",btnType); //关闭按钮添加类型
				
				//标题、内容、标签、验证码错误提示清空
				$.formErrFn(".js_title_err","");
				$.formErrFn(".js_con_err","");
				$.formErrFn(".js_tag_err","");
				//隐藏验证码
				_this.captchaOperateFn("close");
				
				//清除拦截频繁发主贴定时器
				_this.clearForumLimitTimerFn($(".js_submitForum"));
				
				if(btnType=="add"){
					$("#forumPost .js_submitForum").attr("data-btnType","add");
					_this.getDraftFn(me);  //获取草稿
				}else if(btnType=="edit"){
					$("#forumPost .js_submitForum").attr("data-btnType","edit");
				}
			});
        },
        //获取草稿
        getDraftFn:function(me){
			$.ajax({
				url:getDraftUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					if(d.status=="success"){
						$("#forumPost").popPostF("open");
						if(d.data!==null){
							var titles = d.data.title;
							$("#newTopicTitle").val(titles); //标题
							me.setContent(d.data.content); //内容
							var con = me.getContentTxt();
							if(con=="正文"||con==" "){
								$(".js_editor_count").html("0");  //字体个数清零
							}else{
								var len = me.getContentLength(true);
								$(".js_editor_count").html(len);  //字体个数清零
							}
							var tags = d.data.tagNames.length>0?d.data.tagNames.join(" "):"";  //没有标签时空数组
							$(".js_oaSearchResult").val(tags);  //存默认标签
							
						}else{
							
							$("#newTopicTitle").val(""); //标题
							me.setContent("<p>正文</p>"); //内容
							$(".js_editor_count").html("0");  //字体个数清零
							$(".js_tag_selected").html("");  //已选择标签
							$(".js_oaSearchResult").val("");  //存默认标签
						}
						$("#OaSearchStaff").OaSearch();  //标签
					}else{
						$(document).errorDataOperateFn(d);		
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
        },
        saveDraftFn:function(me){
        	var _this = this;
        	$(".js_closeForum").click(function(){
        		var $this = $(this);
        		var tag = $(".js_oaSearchResult").val();
        		tag = tag.replace(" ",",");
        		if($this.attr("data-btnType")=="add"){
                	$.ajax({
        				url:getDraftUrl,
        				type:"post",
        				dataType:"json",
        				data:{
        					title:$.trim($("#newTopicTitle").val()),
        					content:$(document).filterDevKeywordFn(me.getContentUbb()), //草稿加html过滤
        					tags:tag,
        					r:Math.random()
        				},
        				success:function(){
        					$("#forumPost").popPostF("close");
        				},
        				error:function(){
        					$("#forumPost").popPostF("close");
        				}
        			});
        		}else if($this.attr("data-btnType")=="edit"){
        			
        			$("#forumPost").popPostF("close");
        		}
        		
        		//清除拦截频繁发主贴定时器
        		_this.clearForumLimitTimerFn($(".js_submitForum"));

        	});

        },
        titleFn:function(){  //贴吧标题
            var ph = $("#newTopicTitle").attr("place-holder");
            $("#newTopicTitle").on("focus",function() {
                var $this = $(this);
                $this.addClass("frm-active");
                if(ph == $this.val()){
                    $this.val("");
                }
            }).on("blur",function() {
                var $this = $(this);
                var val = $this.val();
                var subStrs = $(document).strLenFn(val);
                if($this.val() === ""){
                    $this.val(ph);
                    $this.removeClass("frm-active");
                }else if(subStrs!==null){  //如果不到40字符无需重新赋值，修复不能用左右键
                	$this.val(subStrs);  //截掉超过40字符的多余字符
                }
            });
        },
        headerToolsFn:function(me){ //顶部工具
             $(".js_fullScreen").click(function(){ //全屏、标准尺寸切换
                 var $this = $(this);
                 var fullState = $("#forumPost").hasClass("full");
                 $(".js_mask_f").show();  //显示遮罩
                 $(".js_miniScreen").show();//显示最小化按钮
                 if(fullState){  //切换到标准尺寸
                     $this.find("i").removeClass("fullIcon standardIcon").addClass("fullIcon").attr("title","全屏");
                     $("#forumPost").removeClass("full min standard").addClass("standard");
                     me.setHeight(231);
                 }else{    //切换到全屏尺寸
                    $this.find("i").removeClass("fullIcon standardIcon").addClass("standardIcon").attr("title","还原");
                    $("#forumPost").removeClass("full min standard").addClass("full");
                    me.setHeight($("#forumPost").height() - 321);
                 }
                 //shit 提示
                 $(".js_shit_title").show();
             });
             $(".js_miniScreen").click(function(){  //最小化
                 var $this = $(this);
                $(".js_mask_f").hide();//隐藏遮罩
                $("#forumPost").removeClass("full min standard").addClass("min");
                $(".js_fullScreen").find("i").removeClass("fullIcon standardIcon").addClass("fullIcon").attr("title","全屏");
                $this.hide();  //隐藏最小化按钮
                //shit 提示
                $(".js_shit_title").hide();
             });
        },
        contentFn:function(me){
        	var _this = this;
            me.addListener('contentChange', function(){  //编辑器添加contentChange事件
            	_this.setTxtNumFn(me);
                
                _this.clearEditorFn(me);
            });
            me.addListener('keyup', function(){  //编辑器添加keyup事件
            	_this.setTxtNumFn(me);
                
                _this.clearEditorFn(me);
            });
            me.$body.on('focus', function(){  //编辑器添加keyup事件
            	_this.clearEditorFn(me);
            });
        },
        //编辑器中默认文字清空
        clearEditorFn:function(me){
        	var _this = this;
        	var exp = new RegExp(/^\s{3,}$/);
        	var expImg = new RegExp(/<img|<IMG/);
        	var con = me.getContentTxt();
        	var conHtml = me.getContent();
            if(con=="正文"||exp.test(con)&&!expImg.test(conHtml)){
            	me.setContent("");
            	me.focus();
            	_this.setTxtNumFn(me);
            }
        },
        //编辑器计数
        setTxtNumFn:function(me){
        	var _this = this;
        	var len = me.getContentLength(true);
            $(".js_editor_count").text(len); //文字计数
            _this.textNum = len;  //用于计算编辑器中的内容
        },
        //帖子提交
        submitForumFn:function(me){
        	var _this = this;
        	$(".js_submitForum").click(function(){
        		var $this = $(this);
        		$(".js_editor_count").trigger("click");  //修复标签输入后直接点击发表按钮 出现添加了标签 同时又出现标签错误提示
        		var tag = $(".js_oaSearchResult").val();
        		tag = tag.replace(/\s{1}/g,",");
        		var datas = {
					title:$.trim($("#newTopicTitle").val()),
					content:$(document).filterDevKeywordFn(me.getContentUbb()),
					tags:tag,
					r:Math.random()
				};
        		if($this.attr("data-btnType")=="edit"){
        			$.extend(datas,{
        				threadId:$(document).getLinkParamFn("id")
        			});
        		}else{ 
        		    if ($(".js_forum_captcha_wrap:visible").length) { //发主贴时,验证码可见,添加验证码参数(新验证码)
        		        var isNeedChpta = postedChinaCaptcha.captcahSwitchOpen;//存储当前业务功能验证码类型 -1：无验证码；0：简单验证码；1：复杂验证码 ；
        		        var postedVerifyCodes = isNeedChpta != -1 ? $("input[name='CaptchaForPostedMsg']").val() : "";
        		        var postedcookieValue = isNeedChpta != -1 ? $("input[name='cookiesForPostedMsg']").val() : "";
        		        $.extend(datas, {
        		            cookieValue: postedcookieValue,
        		            verifyCode: postedVerifyCodes
        		        });
        		    }
        		}
    			if(_this.checkFormFn(me)&&$this.attr("data-status")=="true"){
    				$.ajax({
        				url:submitForumUrl,
        				type:"post",
        				dataType:"json",
        				data:datas,
    					beforeSend:function(){
    						$this.setBtnStatusFn("false","提交中");
    					},
        				success:function(d){
        					if(d.status=="success"){
        						$this.setBtnStatusFn("true","发表");
        						$(document).popErrorF({
            						type:"open",
            						tip:"提交成功",
            						closeFn:function(){
            							$("#forumPost").popPostF("close");
            							window.location.href = "/forum/thread?id="+d.data;
            						}
            					});
        					}else if(d.status=="limitCountDown"){  //拦截频繁发主贴
    							//发帖频繁开始倒计时
    							forumSubmitTimeNum = parseInt(d.message);
    							//返回时间小于等于0不执行定时器
    							if(forumSubmitTimeNum<=0){
    								return false;
    							}
    							forumSubmitTimer = setInterval(function(){
    								//倒计时开始后，按钮为不可操作状态
    								$this.attr("data-status","false").text(forumSubmitTimeNum+"s");
    								
    								forumSubmitTimeNum--;
    								
    								if(forumSubmitTimeNum==-1){
    									//清除拦截频繁发主贴定时器
    									_this.clearForumLimitTimerFn($this);
    									
    								}
    							},1000);
    							
    							
        					}else if(d.status=="limitCaptcha"){ //拦截频繁发主贴-简单验证码
        						$this.setBtnStatusFn("true","发表");
    							//显示验证码
    							_this.captchaOperateFn("open");
        					}else{
        						
        						$this.setBtnStatusFn("true","发表");
        						
        						$(document).errorDataOperateFn(d,null,{
        							loginErrorFn:function(){
        								$("#forumPost").popPostF("close");
        							},
        							noNickNameFn:function(){
        								$("#forumPost").popPostF("close");
        							},
        							limitCountDownFn:null,
        							otherFn:function(data){
        								if(data.message=="验证码不正确"){  //刷新验证码
        									_this.captchaRefreshFn();
        								}
        							}
        						});	
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true","发表");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}
        			
        	});
        },
        //帖子表单验证
        checkFormFn:function(me){
        	var len = me.getContentLength(true);  //编辑器内容长度
        	var con = me.getContentTxt();
        	var htmls = me.getContent();	
        	var expSpace = new RegExp(/^\s{1,}$/);
        	var expImgVideo = new RegExp('(<EMBED|<embed|<IMG|<img){1,}','g');
        	var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)','g');  //视频个数正则表达式
        	var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")[^>]+(>|\/>)','g'); //图片个数正则表达式
        	var imgLen = htmls.match(expImg)===null?0:htmls.match(expImg).length;  //图片总数
        	var videoLen = htmls.match(expVideo)===null?0:htmls.match(expVideo).length;  //视频总数
        	var expCaptcha = new RegExp('^[a-z0-9A-Z]{4,5}$');  //验证码正则表达式
        	var state = true;
        	//标题验证
    		if($.trim($("#newTopicTitle").val())==""){
    			$.formErrFn(".js_title_err","标题不能为空");
    			state = false;
    		}else{ //正确
    			$.formErrFn(".js_title_err","");
    		}
    		//编辑器内容验证
    		if(len==0||con=="正文"||(expSpace.test(con)&&!expImgVideo.test(htmls))){
    			$.formErrFn(".js_con_err","正文不能为空");
    			state = false;
    		}else if(len>5000){
    			$.formErrFn(".js_con_err","正文最长为5000字哟");
    			state = false;
    		}else if(imgLen>10){
    			$.formErrFn(".js_con_err","正文最多添加10张图片哟");
    			state = false;
    		}else if(videoLen>10){
    			$.formErrFn(".js_con_err","正文最多添加10个视频哟");
    			state = false;
    		}else{//正确
    			$.formErrFn(".js_con_err","");
    		}
    		//标签
    		if($.trim($(".js_oaSearchResult").val())==""){
    			$.formErrFn(".js_tag_err","标签不能为空");
    			state = false;
    		}else{//正确
    			$.formErrFn(".js_tag_err","");
    		}
    		//验证码
    		if($(".js_forum_captcha_wrap:visible").length){
    			
    		    if ($.trim($("input[name='CaptchaForPostedMsg']").val()) == "") {
    		        $.formErrFn(".js_captcha_err", "验证码不能为空");
    		        state = false;
    		    } else if ($.trim($("input[name='CaptchaForPostedMsg']").val()).length >5) {
    		        $.formErrFn(".js_captcha_err", "请输入5位正确验证码");
    		        state = false;
    		    } else if (!expCaptcha.test($("input[name='CaptchaForPostedMsg']").val())) {
    		        $.formErrFn(".js_captcha_err", "验证码不正确");
    		        state = false;
    		    } else {//正确
    		        $.formErrFn(".js_captcha_err", "");
    		    }
    		}
    		
    		return state;
    		
    		
        },
        //清除拦截频繁发主贴定时器
        clearForumLimitTimerFn:function(btn){
        	clearInterval(forumSubmitTimer);
        	btn.setBtnStatusFn("true","发表");
        },
        //验证码功能  close:关闭验证码; open:打开验证码;
        captchaOperateFn:function(type){ 
        	var _this = this;
        	if (type == "close") {
        	    //隐藏验证码
        		$(".js_forum_captcha_wrap").hide();
        	} else if (type == "open") {
        	    //显示验证码
        		$(".js_forum_captcha_wrap").show();
    			$.formErrFn(".js_captcha_err","");
    			_this.captchaRefreshFn();
        	}
        	

        },
        //验证码刷新功能
        captchaRefreshFn:function(){
            postedChinaCaptcha.refreshCaptcha($(".js_forum_captcha_box"));//刷新验证码
			
        }
    };
    window.daoForum = function(){
        return new DaoForum();
    };
})();
$.extend({
	formErrFn:function(obj,str){
		$(obj).show().html(str);
	}
});