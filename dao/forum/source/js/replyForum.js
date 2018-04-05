(function(){
	var submitReplyForumUrl = routePath+"/post"; //提交新帖子
	var getReplyDraftUrl = routePath+"/post/draft";//获取回帖草稿  get：获取  post:保存草稿
	var postSubmitTimer = null; //拦截频繁回贴定时器
	var postSubmitTimeNum = 0;  //定时器倒计时数字
	var repliesChinaCaptcha = null;
	
	var htmls = ''+
    '<div class="pop_f_wrap reply" style="display:none;">'+
        '<div class="pop_f standard"  id="forumReply">'+
            '<div class="f_post">'+
                '<div class="f_post_header">'+
                    '<h3>回帖<span class="postFontSize js_shit_title">（如您输入括号或尖括号可能造成内容显示不完整）</span></h3>'+
                    '<div class="f_post_tools">'+
                        '<a class="js_miniScreenR" title="最小化">'+
                            '<i class="minIcon"></i>'+
                        '</a>'+
                        '<a class="js_fullScreenR" title="全屏">'+
                            '<i class="fullIcon"></i>'+
                        '</a>'+
                        '<a class="js_closeReplyForum" title="关闭">'+
                            '<i class="closeIcon"></i>'+
                        '</a>'+
                    '</div>'+
                '</div>'+
                '<div class="f_post_con">'+
                    '<div class="f_post_editor">'+
                        '<script type="text/plain" id="replayEditor">正文</script>'+
                    '</div>'+
                    '<div class="count">'+
                        '<h3><span><i class="js_editor_reply_count">0</i>/5000</span>个字</h3>'+
                        '<span class="err js_con_f_err" style="display:none">正文不能为空</span>'+
                    '</div>'+
                    '<div class="f_post_bottom">'+
                        '<span class="tag_err"></span>'+ 
                        '<div class="forms">'+
                            '<div class="captcha js_reply_captcha_wrap" style="display:none;">'+
                                '<div class="js_reply_captcha_box"></div>' +
                                '<span class="err js_captcha_f_err"></span>' +
                            '</div>'+
                            '<a class="btn js_submitReplyForum" data-status="true">发表</a>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="mask_f js_mask_f_r"></div>'+
    '</div>';
    function DaoReplyForum(){
        this.textNum = 0;
        
    }
    DaoReplyForum.prototype = {
        init:function(obj){
        	var _this = this;
        	if($("#forumReply").length==0){
        		$(document.body).append(htmls); //添加回帖html
        	}

            //发帖验证码初始化start
        	repliesChinaCaptcha = configCaptcha({
        	    captchaInWrap: ".js_reply_captcha_box",//内嵌验证码容器（简单，复杂）
        	    cssLinkSrc: "http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
        	    data: { //参数
        	        bid: "qnbnagvveevtngvat"//区分不同业务 非空
        	    },
        	    isCaptchaOnePop: false, //简单、复杂验证码都在弹层显示
        	    comIn: true, //复杂验证码是否内嵌 true:内嵌  false：弹层 
        	    isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
        	    inputaccName: "Account", //自定义隐藏域name名称
        	    inputName: "CaptchaForReplyMsg",//自定义账号name名称(失去焦点时验证是否需要验证码)
        	    inputCookieName: "cookiesForReplyMsg"//自定义隐藏域cookie name名称
        	});
        	repliesChinaCaptcha.init();//初始化验证码
            //发帖验证码初始化end

            var mer = UM.getEditor('replayEditor',{
                initialFrameHeight:276,
                initialFrameWidth:"100%",
                autoHeightEnabled:false
            });
            _this.contentFn(mer); 
            _this.headerToolsFn(mer);
            _this.submitForumFn(mer);
            _this.saveDraftFn(mer);
            //发帖入口
            _this.enterClickFn(obj,mer);
        },
        //发帖入口
        enterClickFn:function(obj,me){
        	var _this = this;
        	//obj 是一个以逗号分隔各个入口按钮的class字符串
			$(document).on("click",obj,function(){
				var $this = $(this);
				var btnType = $this.attr("data-btnType");
				$(".js_closeReplyForum").attr("data-btnType",btnType); //关闭按钮添加类型
				
				//清除拦截频繁回贴定时器
				_this.clearPostLimitTimerFn($(".js_submitReplyForum"));
				
				$.formErrFn(".js_con_f_err",""); //内容错误提示清空
				
				//隐藏验证码
				_this.captchaOperateFn("close");
				
				if(btnType=="add"){
					_this.getDraftFn(me);  //获取草稿
				}
			});
        },
        //获取草稿
        getDraftFn:function(me){
			$.ajax({
				url:getReplyDraftUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					if(d.status=="success"){
						$("#forumReply").popPostF("open");
						if(d.data!==null){
							me.setContent(d.data.content); //内容
							var con = me.getContentTxt();
							if(con=="正文"||con==" "){
								$(".js_editor_reply_count").html("0");  //字体个数清零
							}else{
								var len = me.getContentLength(true);
								$(".js_editor_reply_count").html(len);  //字体个数清零
							}
						
						}else{
							me.setContent("<p>正文</p>"); //内容
							$(".js_editor_reply_count").html("0");  //字体个数清零
						}
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
        	$(".js_closeReplyForum").click(function(){
        		var $this = $(this);
        		if($this.attr("data-btnType")=="add"){
        			var con = $(document).filterDevKeywordFn(me.getContentUbb());
        			var postCon = con===""?"[p]正文[/p]":con;   //处理草稿保存为空时默认存正文提示文字
                	$.ajax({
        				url:getReplyDraftUrl,
        				type:"post",
        				dataType:"json",
        				data:{
        					content:postCon,//草稿加html过滤
        					r:Math.random()
        				},
        				success:function(){
        					$("#forumReply").popPostF("close");
        				},
        				error:function(){
        					$("#forumReply").popPostF("close");
        				}
        			});
        		}
        		//清除拦截频繁回贴定时器
        		_this.clearPostLimitTimerFn($(".js_submitReplyForum"));

        	});

        },
        headerToolsFn:function(me){ //顶部工具
             $(".js_fullScreenR").click(function(){ //全屏、标准尺寸切换
                 var $this = $(this);
                 var fullState = $("#forumReply").hasClass("full");
                 $(".js_mask_f_r").show();  //显示遮罩
                 $(".js_miniScreenR").show();//显示最小化按钮
                 if(fullState){  //切换到标准尺寸
                     $this.find("i").removeClass("fullIcon standardIcon").addClass("fullIcon").attr("title","全屏");
                     $("#forumReply").removeClass("full min standard").addClass("standard");
                     me.setHeight(276);
                 }else{    //切换到全屏尺寸
                    $this.find("i").removeClass("fullIcon standardIcon").addClass("standardIcon").attr("title","还原");
                    $("#forumReply").removeClass("full min standard").addClass("full");
                    me.setHeight($("#forumReply").height() - 208);
                 }
                 //shit 提示
                 $(".js_shit_title").show();
             });
             $(".js_miniScreenR").click(function(){  //最小化
                 var $this = $(this);
                $(".js_mask_f_r").hide();//隐藏遮罩
                $("#forumReply").removeClass("full min standard").addClass("min");
                $(".js_fullScreenR").find("i").removeClass("fullIcon standardIcon").addClass("fullIcon").attr("title","全屏"); 
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
            $(".js_editor_reply_count").text(len); //文字计数
            _this.textNum = len;  //用于计算编辑器中的内容
        },
        //帖子提交
        submitForumFn:function(me){
        	var _this = this;
        	$(".js_submitReplyForum").click(function(){
        		var $this = $(this);
        		
        		var datas = {
        				threadId:$(document).getLinkParamFn("id"),
    					content:$(document).filterDevKeywordFn(me.getContentUbb()),
    					r:Math.random()
    				};
        		if ($(".js_reply_captcha_wrap:visible").length) { //回贴时,验证码可见,添加验证码参数
        		    var isNeedChpta = repliesChinaCaptcha.captcahSwitchOpen;//存储当前业务功能验证码类型 -1：无验证码；0：简单验证码；1：复杂验证码 ；
        		    var repliesVerifyCodes = isNeedChpta != -1 ? $("input[name='CaptchaForReplyMsg']").val() : "";
        		    var repliescookieValue = isNeedChpta != -1 ? $("input[name='cookiesForReplyMsg']").val() : "";
    				$.extend(datas,{
    				    cookieValue: repliescookieValue,
    				    verifyCode: repliesVerifyCodes
        			});
    			}
    			if(_this.checkFormFn(me)&&$this.attr("data-status")=="true"){
    				$.ajax({
        				url:submitReplyForumUrl,
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
            							$("#forumReply").popPostF("close");
            							var cur = $("#hd_curpage_js_reply").val();  //当前页码和全部页码
            							cur = cur.split("|");
            							if(cur[0]==cur[1]&&d.data.isShow){  //是否过敏感词过滤  是否是末页
            								$(document).saveBackupDataFn("userNickName",d.data)
            								$(".js_replyList").append(_this.addReplyToLastPageFn(d));  //最末页追加新添加回帖数据
            								//添加道具功能
            								daoGifts().getRecommendsFn();
            								//获取礼物个数,送礼人头像
            								daoGifts().getGiverAjaxFn($(".js_replyList .js_replyF_info:last").find(".js_givers_list").attr("data_replyid"),$(".js_replyList .js_replyF_info:last").find(".js_givers_list"));  
            							}        							
            						}
            					});
        						
        					}else if(d.status=="limitCountDown"){  //拦截频繁回贴
    							//回贴频繁开始倒计时
        						postSubmitTimeNum = parseInt(d.message);
        						//返回时间小于等于0不执行定时器
    							if(postSubmitTimeNum<=0){
    								return false;
    							}
    							postSubmitTimer = setInterval(function(){
    								//倒计时开始后，按钮为不可操作状态
    								$this.attr("data-status","false").text(postSubmitTimeNum+"s");
    								
    								postSubmitTimeNum--;
    								
    								if(postSubmitTimeNum==-1){
    									//清除拦截频繁回贴定时器
    									_this.clearPostLimitTimerFn($this);
    									
    								}
    							},1000);
    							
    							
        					}else if(d.status=="limitCaptcha"){ //拦截频繁回贴-简单验证码
        						$this.setBtnStatusFn("true","发表");
    							//显示验证码
    							_this.captchaOperateFn("open");
        					}else{
        						$this.setBtnStatusFn("true","发表");
        						$(document).errorDataOperateFn(d,null,{
        							loginErrorFn:function(){
        								$("#forumReply").popPostF("close");
        							},
        							noNickNameFn:function(){
        								$("#forumReply").popPostF("close");
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

    		//编辑器内容验证
    		if(len==0||con=="正文"||(expSpace.test(con)&&!expImgVideo.test(htmls))){
    			$.formErrFn(".js_con_f_err","正文不能为空");
    			state = false;
    		}else if(len>5000){
    			$.formErrFn(".js_con_f_err","正文最长为5000字哟");
    			state = false;
    		}else if(imgLen>10){
    			$.formErrFn(".js_con_f_err","正文最多添加10张图片哟");
    			state = false;
    		}else if(videoLen>10){
    			$.formErrFn(".js_con_f_err","正文最多添加10个视频哟");
    			state = false;
    		}else{//正确
    			$.formErrFn(".js_con_f_err","");
    		}
    		//验证码
    		if($(".js_reply_captcha_wrap:visible").length){
    			
    		    if ($.trim($("input[name='CaptchaForReplyMsg']").val()) == "") {
        			$.formErrFn(".js_captcha_f_err","验证码不能为空");
        			state = false;
    		    } else if ($.trim($("input[name='CaptchaForReplyMsg']").val()).length > 5) {
    		        $.formErrFn(".js_captcha_err", "请输入5位正确验证码");
    		        state = false;
    		    } else if (!expCaptcha.test($("input[name='CaptchaForReplyMsg']").val())) {
        			$.formErrFn(".js_captcha_f_err","验证码不正确");
        			state = false;
        		}else{//正确
        			$.formErrFn(".js_captcha_f_err","");
        		}
    		}
    		
    		return state;
    		
    		
        },
	   //哔哩哔哩网址跳转方法
		videoBibiFn:function(str){
			var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)', 'g');  //视频个数正则表达式
			var embedArr=str.match(expVideo);
            for(var i=0;i<embedArr.length;i++){
				var embedStr=embedArr[i];
				var srcStr=embedStr.indexOf('src="')+5;
				var srcEnd=embedStr.indexOf('">');
				var srcLink=embedStr.slice(srcStr,srcEnd);
				var videoSrc="<a href='"+srcLink+"' target='_blank' class='voidBiliLink'></a>"+str;
			}
			return videoSrc;
		},
        //如果末页追加假数据
        addReplyToLastPageFn:function(d){
			var _this=this;
        	var dataHtml = "";
            var dCont = d.data;
            var replyContent = dCont.content;
            replyContent = $(document).filterDevKeywordFn(replyContent);  //过滤脚本关键字
            replyContent = $(document).deleteLabelFn("div",replyContent);  //过滤div 避免影响帖子展示页
            replyContent = $(document).canBeTrustStrFn(replyContent);  //修复播放器插件地址被过滤掉get
			if(replyContent.indexOf("static.hdslb")>-1){
				replyContent=_this.videoBibiFn(replyContent);
			}
            var pics = !dCont.headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":dCont.headPic; //头像
            var names = !global_main.globalFn.nicknameCompleCode(dCont.nikeName)?"呀！跑路啦！":global_main.globalFn.nicknameCompleCode(dCont.nikeName); //昵称
    		var hrefs = !global_main.globalFn.nicknameCompleCode(dCont.nikeName)?"javascript:void(0);":dCont.nikeNameLink+'?id='+dCont.id;
    		var js_userClass = !global_main.globalFn.nicknameCompleCode(dCont.nikeName)?"nikeDefaultF":"js_checkEveryUserInfo";
        	dataHtml += '' +
        	'<div class="info_f js_replyF_info">'+
	            '<div class="user_info">';
	            	if(dCont.threadStarter){
	            		dataHtml += '<i class="lz"></i>';
	            	}
	                
	        		dataHtml +='<a href="'+hrefs+'" target="_blank"><img src="'+pics+'" alt="头像" class="'+js_userClass+'"  data-userinfoid="'+dCont.id+'"></a>'+
	                '<a href="'+hrefs+'" target="_blank"><span class="nike '+js_userClass+'"  data-userinfoid="'+dCont.id+'">'+names+'</span></a>'+
	                '<p class="follow_num">关注量：<label class="js_follow_num" data-userinfoid="'+dCont.id+'">'+dCont.followCount+'</label></p>'+
	        		'<div class="clearfix userTopLine">'+
		 				'<div class="follow_wrap js_follow_btn_wrap" data-userinfoid="'+dCont.id+'">';
		 					//好友关注
	                        if(dCont.followStatus=="followed"){ //已关注
	                        	dataHtml +='<a class="followed pull_left js_followedBtn"><i>已关注图标</i>已关注</a>';
	                        	dataHtml +='<a class="follow pull_left js_followBtn" data-status="true" data-userinfoid="'+dCont.id+'" data-insertHtml="false" style="display:none;"><i>关注图标</i>关注</a>';
	                        	dataHtml +='<a class="follow_each pull_left js_follow_eachBtn" style="display:none;"><i>互相关注图标</i>互相关注</a>';
	                        }else if(dCont.followStatus=="notFollowed"||!dCont.followStatus){  //关注
	                        	dataHtml +='<a class="followed pull_left js_followedBtn" style="display:none;"><i>已关注图标</i>已关注</a>';
	                        	dataHtml +='<a class="follow pull_left js_followBtn" data-status="true" data-userinfoid="'+dCont.id+'" data-insertHtml="false"><i>关注图标</i>关注</a>';
	                        	dataHtml +='<a class="follow_each pull_left js_follow_eachBtn" style="display:none;"><i>互相关注图标</i>互相关注</a>';
	                        }else if(dCont.followStatus=="eachOther"){  //互相关注
	                        	dataHtml +='<a class="followed pull_left js_followedBtn" style="display:none;"><i>已关注图标</i>已关注</a>';
	                        	dataHtml +='<a class="follow pull_left js_followBtn" data-status="true" data-userinfoid="'+dCont.id+'" data-insertHtml="false" style="display:none;><i>关注图标</i>关注</a>';
	                        	dataHtml +='<a class="follow_each pull_left js_follow_eachBtn""><i>互相关注图标</i>互相关注</a>';
	                        }
	         dataHtml +='</div>'+
	                    '<a class="only pull_right js_onlyLook"><i>只看他图标</i>只看他</a>'+
	                '</div>'+
	            '</div>'+
	            '<div class="forum_info">'+
	                '<div class="top_tools">'+
                    	'<span class="times">'+dCont.dateString+'</span>'+
	                    '<span class="floor"><i class="js_floor_num">'+dCont.floor+'F</i></span>';
	                    if(dCont.isEditor){
	                    	if(parseInt(dCont.floor)<=1){
                        		dataHtml +='<a class="delete js_delete_forum" data-status="true"></a>'+
                    						'<a class="edit js_edit_forum hide" data-status="true"></a>';
                        	}else{
                        		dataHtml +='<a class="delete js_delete_replyForum" data_replyid="'+dCont.postId+'" data-status="true"></a>'+
                    						'<a class="edit js_edit_replyForum hide" data_replyid="'+dCont.postId+'" data-status="true"></a>';
                        	}
	                    }
	                    if(parseInt(dCont.wealthSum)>0){
	                    	dataHtml +='<span class="wealth js_wealths">'+
	                                        '<div class="num js_marginLeft js_wealthNum" style="visibility:hidden;">'+dCont.wealthSum+'<i class="arrow"></i></div>'+
	                                    '</span>';
	                    }
	    dataHtml +='</div>'+
	                '<div class="content js_content">'+replyContent+'</div>'+
                    '<div class="gifts_wrap">'+
	                    '<a class="griver_btn js_all_gifts_enter" data_replyid="'+dCont.postId+'" data-backup="userNickName" data-status="true" data-text="送礼">送礼</a>'+
	                    '<div class="js_recommends recommends" data_replyid="'+dCont.postId+'" data-backup="userNickName">'+
	            		'</div>'+
	            	'</div>'+
	                '<div class="bottom_tools">'+
		                '<div class="l js_givers_list"  data_replyid="'+dCont.postId+'">'+
		                '<div class="js_s_givers_box"></div>'+			                
	                    '</div>'+
	                  
	                    '<div class="r">'+
	                    	'<a class="jb hide">举报</a>'+
	                    	'<a class="dj hide">使用道具</a>';
	    					dataHtml +='<div class="replay_con">';  //新添加回帖没有评论数，无需打开展示评论列表区
							 if(parseInt(dCont.floor)>1){ //1楼没有回复功能
								 
								 if(parseInt(dCont.discussNum)>0){
									dataHtml +='<a class="replay js_comments_btn" data-num="'+dCont.discussNum+'" data_replyid="'+dCont.postId+'">回复('+dCont.discussNum+')</a>';
					          	 }else{
					          		 dataHtml +='<a class="replay js_comments_btn" data-num="'+dCont.discussNum+'" data_replyid="'+dCont.postId+'">回复</a>';
					          	 }
							 }
							 dataHtml +='</div>';
	                    	
	                    	if(dCont.isDown){ //踩状态
	                    		dataHtml +='<a class="js_cai_forums cai on" data_replyid="'+dCont.postId+'">'+dCont.downNum+'</a>';
	                    	}else{
	                    		dataHtml +='<a class="js_cai_forums cai" data_replyid="'+dCont.postId+'">'+dCont.downNum+'</a>';
	                    	}
	                    	if(dCont.isLike){ //点赞状态
	                    		dataHtml +='<a class="js_zan_forums zan on" data_replyid="'+dCont.postId+'">'+dCont.likeNum+'</a>';
	                    	}else{
	                    		dataHtml +='<a class="js_zan_forums zan" data_replyid="'+dCont.postId+'">'+dCont.likeNum+'</a>';
	                    	}
	                    	dataHtml +='<a class="share hide">分享</a>'+
	                        
	        	 			 
	                    '</div>'+
	                '</div>'+
	                '<div class="comments js_comments_module" style="display:none;">'+
	                    '<ul class="comment_list js_comment_list" data-index="'+dCont.postId+'">'+
	                    '</ul>'+
                        '<div class="page_wrap_no_b js_comment_page_wrap">'+
	                        '<div class="page js_commont_page">'+
	                        '</div>'+
	                        '<a class="comment_num_btn js_comment_num_btn" data-num="0" data_replyid="'+dCont.postId+'">***</a>'+
	                        '<a class="comment_talk_btn js_comment_talk_btn">说一说</a>'+
	                    '</div>'+
	                    '<div class="comment_add_editor js_comment_editor_wrap" style="display:none;">'+
	                    	'<p class="comment_tip ">'+
	                    		'<span class="error js_comment_editor_error" style="display:none;">文字最多为50个字哦~</span>'+
	                		'</p>'+
	                        '<div class="comment_editor_con_f">'+
	                            '<div class="comment_editor js_comment_editor">'+
	                            '</div>'+
	                            '<a class="sub_comm_btn js_comm_submitBtn" data-status="true" data_replyid="'+dCont.postId+'" data-commentid="" data-tonickname=""></a>'+
	                        '</div>'+
	                    '</div>'+
	                '</div>'+
	            '</div>'+
	        '</div>';
        	 return dataHtml;
        },
        //清除拦截频繁回贴定时器
        clearPostLimitTimerFn:function(btn){
        	clearInterval(postSubmitTimer);
        	btn.setBtnStatusFn("true","发表");
        },
        //验证码功能  close:关闭验证码; open:打开验证码;
        captchaOperateFn:function(type){ 
        	var _this = this;
        	if(type=="close"){
        		$(".js_reply_captcha_wrap").hide();
        	}else if(type=="open"){
        		$(".js_reply_captcha_wrap").show();
    			$.formErrFn(".js_captcha_f_err","");
    			_this.captchaRefreshFn();
        	}
        	

        },
        //验证码刷新功能
        captchaRefreshFn: function () {
            repliesChinaCaptcha.refreshCaptcha($(".js_reply_captcha_box"));
        }
    };
    window.daoReplyForum = function(){
        return new DaoReplyForum();
    };
})();
$.extend({
	formErrFn:function(obj,str){
		$(obj).show().html(str);
	}
});