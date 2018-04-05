(function(){
	var getReplayListUrl = routePath+"/thread/show"; //获取详细页回帖列表
	var getDeleteForumUrl = routePath+"/thread/delete"; //获取即将删除主贴状态  get:获取即将删除主贴状态  post:删除该主贴
	var getDeleteReplyForumUrl = routePath+"/post/delete"; //获取即将删除回贴状态  get:获取即将删除回贴状态  post:删除该回贴
	var postZanAndCaiForumUrl = routePath+"/poke"; //帖子（不分主贴和回帖）踩赞接口  1：赞  2：踩
	var getDescriptionForumUrl = routePath+"/thread/level"; //道具等级显示
	var getGiftRankForumUrl = "http://conn.dao.gyyx.cn/gift/rank"; //礼物实时榜
	var getGifRankAllList=routePath+"/gift/rank";//礼物实时榜列表数据接口
    function DaoForumInfo(){
        //constructure
    }
    DaoForumInfo.prototype = {
        init:function(){
        	var _this = this;
        	
            _this.forumEditorObj = daoForum().init(".js_edit_forum","edit");  //编辑主贴  放在首位方便getListDateFn函数调用
            _this.deleteForumFn(); //主贴删除
            _this.deleteReplyForumFn();  //回帖删除
            _this.caiAndZanForumsFn();//帖子（不区分主贴回帖）赞和踩
            _this.getGiftRankAllListFn()//礼物实时榜
            //判断url是否有锚点参数
            _this.getIsUrlLinkFn();			
        },
        
        //获取道具等级内容
        getDescriptionFn:function(id){
			//财富图标className
			var wealthClassFn = function (str) {
				var classNames;
				switch (str) {
					case "腰缠万贯":
						classNames = "js_wealthsIcon01";
						break;
					case "富可敌国":
						classNames = "js_wealthsIcon02";
						break;
					case "富甲天下":
						classNames = "js_wealthsIcon03";
						break;
					case "富可通神":
						classNames = "js_wealthsIcon04";
						break;
					default:
						classNames = "js_wealthsIconNone";
						break;
				}
				return classNames;
			}
        	$.ajax({
        		url:getDescriptionForumUrl,
        		type:"get",
        		dataType:"json",
        		data:{
        			r:Math.random(),
        			threadId:id
        		},
        		success:function(data){
        			var d=data;
        			if(d.status=="success"){
        				var dataHtml="";
        				var contentWealths=d.data;
						//财富图标className
						var addClassWealths = wealthClassFn(contentWealths);
        				dataHtml +='<span class="wealths js_wealthsTop '+addClassWealths+'">'+
                        '<div class="num js_marginLeft js_wealthNumTop" style="visibility:hidden;width:60px;top:-30px;left:-20px;" data-wealthSum="'+contentWealths+'">'+contentWealths+'<i class="arrow"></i></div>'+
                        '</span>';
        				 $(".js_sub_forum .title .dengji").html(dataHtml);
        				 $(".js_wealthsTop").hoverAnimateFn(".js_wealthNumTop"); //财富值显示
        			}else{
        				$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        			}
        		}
        	})
        },
   
        //判断地址栏中是否存在锚点地址
        getIsUrlLinkFn:function(){
        	var _this=this,
        		urlAllHash=window.location.hash.substr(1),
        		urlHashStr=urlAllHash.substring(0,urlAllHash.indexOf("&")),
        		urlHash;
        	if(urlAllHash){
        		if(urlAllHash.indexOf("&")>-1){
        			urlHash=urlHashStr;
        		}else{
        			urlHash=urlAllHash;
        		}
        	}else{
        		urlHash=null;
        	}
        	var winUrl=window.location,
        	winUrlNew=winUrl.href,
        	winIndexof=winUrlNew.indexOf("&");
        	if(winIndexof>-1){
    			 var  cur = $(document).getLinkParamFn("pageIndex");
				 if(cur==null){
					_this.getListDateFn(1,urlHash)
				}else{
					_this.getListDateFn(cur,urlHash)
				}
 	    	  
 	        }else{
 	        	_this.getListDateFn(1,urlHash)
 	        }
        	
        	
        },
		//哔哩哔哩视频跳转
		videoLinkFn:function(){	
			var embedEle=$(".js_content").find("embed");
			embedEle.each(function(){
				var srcLink=$(this).attr("src");
				if(srcLink.indexOf("static.hdslb")>-1){
					$(this).parent().css("position","relative")
					$(this).after("<a href='"+srcLink+"' target='_blank' class='voidBiliLink'></a>");
				}
				
			});			
		},
      //更新地址栏，为地址栏添加分页码
        updateUrlFn:function(cur){
        	var _this=this;
        	var winUrl=window.location,
        	winUrlNew=winUrl.href,
            winIndexof=winUrlNew.indexOf("&");
			var winIndexof2=winUrlNew.indexOf("&pageIndex");
			var urlStr2=winUrlNew.substring(0,winIndexof2);//截取含有pageIndex后的地址
	        if(winIndexof>-1){
			   if(urlStr2.length>0){
				   window.location.href=urlStr2+'&pageIndex='+cur;
			   }else{
					window.location.href=winUrl+'&pageIndex='+cur;
			   }
	        }
	        _this.getListDateFn(cur,null);
        },
        //获取数据列表
        getListDateFn:function(pageIndex,anchorId){
            var _this = this;
            $(".js_replyList").ajaxPage({
                url: getReplayListUrl,
                type: "get",
                dataType: "json",
                pageData: "data.data.count",
                callBackPageIndex:"data.data.pageIndex",
                pageSize:20,
                paramObj: {
                    threadId: $(document).getLinkParamFn("id"),
                    anchorId:anchorId
                },
                pageIndex:pageIndex,  //当前页
                pageObj: $(".js_page"),
                pageBtn:{
                	first: "首页",
                    last: "末页",
                	prev: "上一页",
                    next: "下一页"
                },
                clickFn: function (setting,cur) {
                    var id = $(document).getLinkParamFn("id");
                    setting.paramObj.threadId = id;
                    setting.paramObj.anchorId = null;
                    setting.callBackPageIndex = null;
                    _this.updateUrlFn(cur);//更新地址栏
                    $(window).scrollTop(340)

                },
                editorObj:_this.forumEditorObj,  //编辑器实例 
                dataFn: function (data) {
                    var dataHtml = "";
                    var dCont = data.data.posts;
                    //存储备用数据供送礼用
                    $(document).saveBackupDataFn("userNickName",dCont);
                    _this.subForumAreaFn(data); //主贴区域
                    _this.setNavTitleFn(data);  // 设置导航标题及链接

                    for (var i = 0; i < dCont.length; i++) {
                    	if(dCont[i].isShow){  //帖子文字过滤已通过
                    		var clearContent = _this.forumInfoImgFn(dCont[i].content);
                    		clearContent = $(document).canBeTrustStrFn(clearContent);  //修复播放器插件地址被过滤掉get
                    		var headPic=$(document).filterDevKeywordFn(dCont[i].headPic);
                    		var nikeName=$(document).filterDevKeywordFn(dCont[i].nikeName);
                    		var nikeNameLink=$(document).filterDevKeywordFn(dCont[i].nikeNameLink);
                    		var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
                    		var names = !global_main.globalFn.nicknameCompleCode(nikeName)?"呀！跑路啦！":global_main.globalFn.nicknameCompleCode(nikeName); //昵称
                        	var hrefs = !global_main.globalFn.nicknameCompleCode(nikeName)?"javascript:void(0);":nikeNameLink+'?id='+dCont[i].id;
                    		var js_userClass = !global_main.globalFn.nicknameCompleCode(nikeName)?"nikeDefaultF":"js_checkEveryUserInfo";
                    		dataHtml += '' +
                            '<div class="info_f js_replyF_info">'+
                            	'<div class="floorHash" id='+dCont[i].postId+'></div>'+
                                '<div class="user_info">';
                                	if(dCont[i].threadStarter){
                                		dataHtml += '<i class="lz"></i>';
                                	}
                        if(hrefs=="javascript:void(0);"){
                          dataHtml+='<a href="'+hrefs+'">';
                        }else{
                          dataHtml +='<a href="'+hrefs+'" target="_blank">'
                        }
                        dataHtml+='<img src="'+pics+'" alt="头像" class="'+js_userClass+'"  data-userinfoid="'+dCont[i].id+'">'+
                           '</a>';
                           if(hrefs=="javascript:void(0);"){
                            dataHtml+= '<a href="'+hrefs+'">';
                           }else{
                            dataHtml+= '<a href="'+hrefs+'" target="_blank">';
                           }
                           dataHtml+='<span class="nike '+js_userClass+'"  data-userinfoid="'+dCont[i].id+'">'+names+'</span>'+
                                	'</a>'+
                                    '<p class="follow_num">粉丝量：<label class="js_follow_num" data-userinfoid="'+dCont[i].id+'">'+dCont[i].followCount+'</label></p>'+
                                    '<div class="clearfix userTopLine">'+
                    	 				'<div class="follow_wrap js_follow_btn_wrap" data-userinfoid="'+dCont[i].id+'">';
                    	 					//好友关注
		                                    if(dCont[i].followStatus=="followed"){ //已关注
		                                    	dataHtml +='<a class="followed pull_left js_followedBtn"><i>已关注图标</i>已关注</a>';
		                                    	dataHtml +='<a class="follow pull_left js_followBtn" data-status="true" data-userinfoid="'+dCont[i].id+'" data-insertHtml="false" style="display:none;"><i>关注图标</i>关注</a>';
		                                    	dataHtml +='<a class="follow_each pull_left js_follow_eachBtn" style="display:none;"><i>互相关注图标</i>互相关注</a>';
		                                    }else if(dCont[i].followStatus=="notFollowed"||!dCont[i].followStatus){  //关注
		                                    	dataHtml +='<a class="followed pull_left js_followedBtn" style="display:none;"><i>已关注图标</i>已关注</a>';
		                                    	dataHtml +='<a class="follow pull_left js_followBtn" data-status="true" data-userinfoid="'+dCont[i].id+'" data-insertHtml="false"><i>关注图标</i>关注</a>';
		                                    	dataHtml +='<a class="follow_each pull_left js_follow_eachBtn" style="display:none;"><i>互相关注图标</i>互相关注</a>';
		                                    }else if(dCont[i].followStatus=="eachOther"){  //互相关注
		                                    	dataHtml +='<a class="followed pull_left js_followedBtn" style="display:none;"><i>已关注图标</i>已关注</a>';
		                                    	dataHtml +='<a class="follow pull_left js_followBtn" data-status="true" data-userinfoid="'+dCont[i].id+'" data-insertHtml="false" style="display:none;"><i>关注图标</i>关注</a>';
		                                    	dataHtml +='<a class="follow_each pull_left js_follow_eachBtn"><i>互相关注图标</i>互相关注</a>';
		                                    }
                             dataHtml +='</div>'+
	                                    '<a class="only pull_right js_onlyLook"><i>只看他图标</i>只看他</a>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="forum_info">'+
                                    '<div class="top_tools">'+
                                    	'<span class="times">'+dCont[i].dateString+'</span>'+
                                        '<span class="floor"><i class="js_floor_num">'+dCont[i].floor+'F</i></span>';
                                        if(dCont[i].isEditor){
                                        	if(parseInt(dCont[i].floor)<=1){
                                        		dataHtml +='<a class="delete js_delete_forum" data-status="true"></a>'+
                                    						'<a class="edit js_edit_forum" data-status="true" data-btntype="edit"></a>';
                                        	}else{
                                        		dataHtml +='<a class="delete js_delete_replyForum" data_replyid="'+dCont[i].postId+'" data-status="true"></a>'+
                                    						'<a class="edit js_edit_replyForum hide" data_replyid="'+dCont[i].postId+'" data-status="true"></a>';
                                        	}
                                        	
                                        }
                        dataHtml +='</div>'+
                                    '<div class="content js_content">'+clearContent+'</div>'+
                                    '<div class="gifts_wrap">'+
	                                    '<a class="griver_btn js_all_gifts_enter" data_replyid="'+dCont[i].postId+'" data-backup="userNickName" data-status="true" data-text="送礼">送礼</a>'+
	                                    '<div class="js_recommends recommends" data_replyid="'+dCont[i].postId+'" data-backup="userNickName">'+
                                		'</div>'+
                                	'</div>'+
                                    '<div class="bottom_tools">'+
                                    '<div class="l js_givers_list"  data_replyid="'+dCont[i].postId+'">'+
                                    '<div class="js_s_givers_box"></div>'+
                                    '</div>'+
                                        '<div class="r">'+
                                        '<a class="jb hide">举报</a>'+
                                        '<a class="dj hide">使用道具</a>';
						                  if(parseInt(dCont[i].floor)>1){ //1楼没有回复功能
											  //评论数大于0展示评论列表
											  var replyCont = parseInt(dCont[i].discussNum) > 0 ? "收起回复" : "回复";
											  var replyCont_on = parseInt(dCont[i].discussNum) > 0 ? "on" : "";
												dataHtml +='<div class="replay_con '+replyCont_on+'">'+
						                              	   '<a class="replay js_comments_btn" data-num="'+dCont[i].discussNum+'" data_replyid="'+dCont[i].postId+'">'+replyCont+'</a>';
						       	 				dataHtml +='</div>';
					       	 			 	}
                                        	      
						                  	dataHtml +='<a class="share hide">分享</a>';
                                        	if(dCont[i].isDown){ //踩状态
                                        		dataHtml +='<a class="js_cai_forums cai on" data_replyid="'+dCont[i].postId+'">'+dCont[i].downNum+'</a>';
                                        	}else{
                                        		dataHtml +='<a class="js_cai_forums cai" data_replyid="'+dCont[i].postId+'">'+dCont[i].downNum+'</a>';
                                        	}
                                        		
                                        	if(dCont[i].isLike){ //点赞状态
                                            	dataHtml +='<a class="js_zan_forums zan on" data_replyid="'+dCont[i].postId+'">'+dCont[i].likeNum+'</a>';
                                            }else{
                                            	dataHtml +='<a class="js_zan_forums zan" data_replyid="'+dCont[i].postId+'">'+dCont[i].likeNum+'</a>';
                                            }  
		                                	 
                            	 dataHtml +='</div>'+
                                    '</div>';
                            	 	//回复功能--开始
                                    if(parseInt(dCont[i].floor)>1){ //1楼没有回复功能
                                    	if(parseInt(dCont[i].discussNum)>0){
                                    		dataHtml +='<div class="comments js_comments_module" style="display:block;">';
                                    	}else{
                                    		dataHtml +='<div class="comments js_comments_module" style="display:none;">';
                                    	}
			                        			dataHtml +='<ul class="comment_list js_comment_list" data-index="'+dCont[i].postId+'">'+
					                                    	'</ul>'+
						                                    '<div class="page_wrap_no_b js_comment_page_wrap">'+
						                                        '<div class="page js_commont_page" style="display:none;">'+
						                                        '</div>'+
						                                        '<a class="comment_num_btn js_comment_num_btn" data-num="'+dCont[i].discussNum+'" data_replyid="'+dCont[i].postId+'">***</a>'+
						                                        '<a class="comment_talk_btn cur js_comment_talk_btn">说一说</a>'+
						                                    '</div>'+
						                                    '<div class="comment_add_editor js_comment_editor_wrap" style="display:none;">'+
						                                    	'<p class="comment_tip ">'+
						                                    		'<span class="error js_comment_editor_error" style="display:none;">文字最多为50个字哦~</span>'+
					                                    		'</p>'+
						                                        '<div class="comment_editor_con_f">'+
						                                            '<div class="comment_editor js_comment_editor">'+
						                                            '</div>'+
						                                            '<a class="sub_comm_btn js_comm_submitBtn" data-status="true" data_replyid="'+dCont[i].postId+'" data-commentid="" data-tonickname=""></a>'+
						                                        '</div>'+
						                                    '</div>'+
					                                    '</div>';
	                                    }
                                    //回复功能--结束
                                    
                        dataHtml +='</div>'+
                            '</div>';
                       
                    	}
                    } 
                    return dataHtml;
                },
                //操作数据之前，处理错误页跳转
                beforeDoDataFn:$(document).errorDataOperateFn,
                //数据装载完毕后元素执行操作
                successFn:_this.dataListOperateFn
            });
           
        },
        //详细页帖子内容图片默认不加载处理
        forumInfoImgFn:function(data){
        	var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")[^>]+(>|\/>)','g'); //图片个数正则表达式(不包含表情)
        	var imgStrArr = data.match(expImg);
        	var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        	if(imgStrArr){
        		for(var j = 0;j<imgStrArr.length;j++){
        			var imgStrReplaced = imgStrArr[j].replace("src","_src");  //src中转
        			var imgSrc = imgStrArr[j].match(srcReg);
        			data = data.replace(imgStrArr[j],imgStrReplaced);  //内容字符串中img替换为_src img
                	if(imgSrc[1]){
                		data=data.replace(imgSrc[1],imgSrc[1]+"?imageView2/2/w/576")
                	}
                	
        		}
        	}
        	//过滤脚本关键字
        	data = $(document).filterDevKeywordFn(data);
        	//过滤div 避免影响帖子展示页
        	data = $(document).deleteLabelFn("div",data);
        	return data;
        },
        //导航标题赋值
        setNavTitleFn:function(data){
        	var d = data.data;
        	var getTitle=$(document).filterDevKeywordFn(d.title);//标题返回值过滤
        	$(".js_home_link").html(getTitle);
        	document.title=$(".js_home_link").text()+"-道可道论坛";
        },
        //主贴区域
        subForumAreaFn:function(data){
        	var _this=this;
            var d = data.data;
            var tagStr = d.tags.split(",");
            var id = $(document).getLinkParamFn("id");
            var getTitle=$(document).filterDevKeywordFn(d.title);//标题返回值过滤
         //组装主贴信息
            var subFHtml = ''+
                '<div class="l">'+
                    '<div class="title">'+
                        '<h2>'+getTitle+'</h2>';
                        if(d.isTop){  //是否置顶
                            subFHtml+='<span class="top"></span>';
                        }

                        if(d.isBest){ //是否精品
                            subFHtml+='<span class="best"></span>';
                        }
                        if(d.wealthSumTotal){
                        	subFHtml+='<span class="dengji"></span>';
                        	_this.getDescriptionFn(id)
                        }
            
                subFHtml+='</div>'+
                    '<div class="tags">';
                        for(var i =0,l= tagStr.length;i<l;i++){  //主贴标签
                            subFHtml+='<a href="javascript:void(0);">'+$(document).filterDevKeywordFn(tagStr[i])+'</a>';
                        }
            subFHtml+='</div>'+
                '</div>'+
                '<div class="r">';
                    if(d.IsPostFollow){  //关注状态
                        subFHtml+='<a class="followed hide">已关注</a>';
                    }else{
                        subFHtml+='<a class="follow js_followBtn js_onlyLook" data-forumId="'+id+'">关注</a>';
                    }
                    subFHtml+='<a class="replay js_replyForum" data-btnType="add">回帖</a>'+
                '</div>';
            $(".js_sub_forum").html(subFHtml);
            //页面滚动接近主贴区域，主贴置顶显示
            $(window).scroll(function(){
                var $this = $(this);
                var offSetTop = parseInt($(".js_sub_forum_wrap").offset().top);  //不要用浮动元素本身，如果设置为fix时，会出现window的scrolltop瞬间变小,浮条浮动
                var scrollTop = parseInt($this.scrollTop());  //页面滚动卷入顶部距离
                if(scrollTop>=offSetTop){
                	$(".js_sub_forum").addClass("sub_f_fixed"); //开始飘   	
                	_this.giftRightShow(".js_all_giver_list",1,$this);
                }else{
                	$(".js_sub_forum").removeClass("sub_f_fixed"); //结束飘
                	_this.giftRightShow(".js_all_giver_list",2,$this);
                }

            });
        },
        
        //装载完列表后，元素交互操作
        dataListOperateFn:function(){
            $(document).setMarginLeftFn($(".js_marginLeft")); //财富数字水平居中
            daoGifts().init();  //道具
            daoCommentReplyForum().loadForumCommentListFn();//每个回帖评论列表加载
            daoForumInfoOperate().init(arguments[3]); //帖子相关操作 arguments[3]:第4个参数时编辑器实例
            $(document).scollHashHeightFn(".reply_list .floorHash","id",function(){
            	$(document).imgLazyLoadExcuteFn(".js_content img:not(.emotion)"); //图片顶部靠近屏幕底部开始加载
            });//锚点滚动到对应的楼层
           daoForumInfo().videoLinkFn();//哔哩哔哩视频跳转
        },
        //监听实时榜状态
        listenGiftRight:function(ele,type,obj,marginLeft,sideWidth){
        	 if(type==1){
            	 $(ele).css({
                  	"position": "fixed",
                  	"left": "50%",
                  	"top": "96px",
                  	"z-index": "11",
                  	"margin-left": marginLeft
                  })
	             if(sideWidth<0){
	            	 $(".info_wrap_f .reply_list").css( "border-right","none");
	            	 $(ele).css("border-left","1px solid #e8e8e8");
	             }else{
	            	 $(".info_wrap_f .reply_list").css("border-right","1px solid #e8e8e8");
	            	 $(ele).css("border-left","none");
	             }
             }else{
            	 $(ele).css({
                 	"position": "absolute",
                 	"left": "960px",
                 	"top": "0",
                 	"margin":"0",
                 	"width":"238px"
                 })
             }
        },
        //礼物实时榜局右浮动显示
        giftRightShow:function(ele,type,obj){
        	var _this=this;
        	 var screenWidth = $(window).width();//获取屏宽
             var wrapWidth = $(".js_sub_forum_wrap").width();//主题内容宽
             var giftWidth = 239;//实时榜宽
             var sideWidth = (screenWidth - wrapWidth)/2;//距离固定内容的边缘宽
             var screenAndGift=screenWidth/2 - giftWidth;
             var marginLeft =sideWidth>0?screenAndGift - sideWidth:screenAndGift;
             _this.listenGiftRight(ele,type,obj,marginLeft,sideWidth);
          
        },
        //获取即将删除主贴状态
        deleteForumFn:function(){
        	var _this = this;
        	$(".js_replyList").off("click",".js_delete_forum").on("click",".js_delete_forum",function(){
        		var $this = $(this);
    			if($this.attr("data-status")=="true"){
    				$.ajax({
        				url:getDeleteForumUrl,
        				type:"get",
        				dataType:"json",
        				data:{
        					r:Math.random(),
            				threadId:$(document).getLinkParamFn("id")
        				},
    					beforeSend:function(){
    						$this.setBtnStatusFn("false","");
    					},
        				success:function(d){
        					$this.setBtnStatusFn("true","");
        					if(d.status=="success"){
        						$(document).popDeleteF({
            						type:"open",
            						tip:"确认要删除吗？",
            						confirmFn:function(){
            							$(document).popDeleteF({type:"close"}); //关闭删除弹层
            							_this.deleteForumSubmitFn();  							
            						}
            					});
        					}else{
        						$(document).errorDataOperateFn(d);	
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true","");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}
        			
        	});
        },
        //删除主贴提交
        deleteForumSubmitFn:function(){
        	$.ajax({
        		url:getDeleteForumUrl,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
    				threadId:$(document).getLinkParamFn("id")
				},
				success:function(d){
					if(d.status=="success"){
						$(document).popErrorF({
    						type:"open",
    						tip:"删除成功！",
    						closeFn:function(){
    							//删除后执行操作  跳转首页
    							window.location.href = "http://dao.gyyx.cn/forum/";
    							
    						}
    					});
					}else{
						
						$(document).errorDataOperateFn(d);
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
        	});
        },
        //获取即将删除回帖状态
        deleteReplyForumFn:function(){
        	var _this = this;
        	$(".js_replyList").off("click",".js_delete_replyForum").on("click",".js_delete_replyForum",function(){
        		var $this = $(this);
    			if($this.attr("data-status")=="true"){
    				$.ajax({
        				url:getDeleteReplyForumUrl,
        				type:"get",
        				dataType:"json",
        				data:{
        					r:Math.random(),
            				threadId:$(document).getLinkParamFn("id"),
            				postId:$this.attr("data_replyid")
        				},
    					beforeSend:function(){
    						$this.setBtnStatusFn("false","");
    					},
        				success:function(d){
        					$this.setBtnStatusFn("true","");
        					if(d.status=="success"){
        						$(document).popDeleteF({
            						type:"open",
            						tip:"确认要删除吗？",
            						confirmFn:function(){
            							$(document).popDeleteF({type:"close"}); //关闭删除弹层
            							_this.deleteReplyForumSubmitFn($this);  							
            						}
            					});
        					}else{
        						$(document).errorDataOperateFn(d,$this);	
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true","");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}
        			
        	});
        },
        //删除回贴提交
        deleteReplyForumSubmitFn:function(obj){
        	var _this = this;
        	$.ajax({
        		url:getDeleteReplyForumUrl,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
    				threadId:$(document).getLinkParamFn("id"),
    				postId:obj.attr("data_replyid")
				},
				success:function(d){
					if(d.status=="success"){
						$(document).popErrorF({
    						type:"open",
    						tip:"删除成功！",
    						closeFn:function(){
    							//删除后执行操作  删除改楼层
    							_this.replyForumHideOperFn(obj);
    							
    						}
    					});
					}else{
						$(document).errorDataOperateFn(d,obj);
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
        	});
        },
        //回帖消失后评论区和评论数状态
        replyForumHideOperFn:function(obj){
        	var _this = this;
        	var hidInput = $("#hd_curpage_js_reply").val(); //回帖列表分页隐藏域
        	var replyForumLen = $(".js_replyList .js_replyF_info").length;
        	var pageArr = hidInput.split("|");
        	var curPage =parseInt(pageArr[0]); //当前页
        	var allPage =parseInt(pageArr[1]); //总页数
        	var pageIndexs;
        	
        	if(curPage==allPage&&replyForumLen==1){ //列表分多页，当前页 为末页，且只有一条展示回帖  删除后请求上一页数据
        		
        		//删除后执行操作  
				obj.parents(".js_replyF_info").hide();
				
        		pageIndexs = curPage -1;
        		_this.getListDateFn(pageIndexs,null);  //获取帖子列表ajax 实参为上一页码
        	
        	}else if(curPage==allPage&&replyForumLen>1){  //列表分多页，当前页为末页，展示评论大于1
        		
        		//删除后执行操作  
        		obj.parents(".js_replyF_info").hide();
        		
        	}else{  //列表分多页，处于中间页时，直接请求当前页数据
        		pageIndexs = curPage;
        		_this.getListDateFn(pageIndexs,null);  //获取帖子列表ajax 实参为当前页码
        	}
        },
        //帖子（不区分主贴和回帖）踩 和 赞
        caiAndZanForumsFn:function(){
        	var _this = this;
        	//赞 按钮
        	$(document).on("click",".js_zan_forums",function(){
        		var $this = $(this);
        		_this.caiAndZanAjaxFn($this,1);
        	});
        	//踩 按钮
        	$(document).on("click",".js_cai_forums",function(){
        		var $this = $(this);
        		_this.caiAndZanAjaxFn($this,2);
        	});
        },
        //帖子（不区分主贴和回帖）踩 和 赞 ajax
        caiAndZanAjaxFn:function(obj,type){ 
        	$.ajax({
        		url:postZanAndCaiForumUrl,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
    				threadId:$(document).getLinkParamFn("id"),
    				contentType:"thread",
    				contentId:obj.attr("data_replyid"),
    				poke:type		
				},
				success:function(d){
					if(d.status=="success"){
			        	//操作成功
						var num = parseInt(obj.text());
						if(obj.hasClass("on")){
							obj.removeClass("on").text(num-1);
						}else{
							var siblingStr = parseInt(type)==1?".js_cai_forums":".js_zan_forums";
							var siblingObj = obj.siblings(siblingStr);
							var nextNum = parseInt(siblingObj.text());
							var optNum = nextNum==0?0:nextNum-1;
							obj.addClass("on").text(num+1);
							if(siblingObj.hasClass("on")){
								siblingObj.removeClass("on").text(optNum);
							}
						}
						
					}else{
						$(document).errorDataOperateFn(d,obj);
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
        	});
        },
        //礼物墙滚动条
        giftRankScrollFn:function(){
        	var rankHeight=$(".js_all_giver_list ul.giver_list").height();//获取信息列表的总高度，ul的高度
        	if(rankHeight>380){
        		$(".js_all_giver_list .giver_scoll").css({
                	"height":380,
                	"overflow-y":"scroll",
                	"overflow-x":"hidden"
                });
        		
            	//滚动条监听
        		$(window).scroll(function(){
            		var $this = $(this);	
            		var wHeight=parseFloat($this.height());//获取窗口的高度
            		var totalheight = wHeight + parseFloat($this.scrollTop());//获取滚动的高度
                	var documentheight = parseFloat($(document).height());//获取文档的高度
            		if(documentheight - totalheight > 200){
            			$(".js_all_giver_list .giver_scoll").css({
                    		"height":380,
                    		"overflow-y":"scroll",
                    		"overflow-x":"hidden"
                    	});
            			
            		}else if(documentheight - totalheight <= 200){
            			$(".js_all_giver_list .giver_scoll").css({
                    		"height":wHeight-450,
                    		"overflow-y":"scroll",
                    		"overflow-x":"hidden"
                    	});
            		}
            		
        		})
        	}
        },
        //转意符换成普通字符
        escape2Html:function(str){
        	var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
        	 return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
        },
        //首次获取礼物实时榜列表
        getGiftRankAllListFn:function(code){
        			var codes=code==undefined?0:code;
                	var _this=this;
                	$.ajax({
                		url:getGifRankAllList,
                		type:"get",
                		dataType:"json",
                		data:{
                			r:Math.random(),
            				threadId:$(document).getLinkParamFn("id"),
            				count:10,//条数
            				start:codes
                		},
                		success:function(data){
                			$(".js_all_giver_list ul.giver_list").html("");
                			var d=data;
                			if(d.status=="success"){
                				//操作成功
                				if(d.data.length){
                					var oLi='';
                					
                					for(var i=0;i<d.data.length;i++){
                						
                    					var floor=d.data[i].floor;//楼层
                    					var fromUserNick=$(document).filterDevKeywordFn(d.data[i].fromUserNick);//送礼人
                    					var toUserNick=$(document).filterDevKeywordFn(d.data[i].toUserNick);//收礼人
                    					var dataGiftPicUrl=$(document).filterDevKeywordFn(d.data[i].giftPicUrl)
                    					
                    					var amount=d.data[i].amount;//送礼个数
                    					var fromUserNickImp=fromUserNick.length>5?"giver_nameLarge":"giver_nameLess";//判断送礼人名称字数
                    					var toUserNickImp=toUserNick.length>5?"giver_nameLarge":"giver_nameLess";//判断收礼人名称字数
                    					var giftPicUrl=dataGiftPicUrl?dataGiftPicUrl:"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";//礼物图片
        			        			var fromUserLink = !fromUserNick?"javascript:void(0);":'/user?id='+d.data[i].fromId;//昵称改为userId
        			        			var toUserNickLink = !toUserNick?"javascript:void(0);":'/user?id='+d.data[i].toId;//昵称改为userId
        			        			var code=d.data[i].code
        			        			
                    					oLi+='<li class="giver_content clearfix" >'+
            			        			'<span class="giver_floor pull_left" codeNum='+code+'>'+floor+'F</span>'+
            			        			'<div class="pull_left giver_txt">'+
            				        			'<a href="'+fromUserLink+'" target="_blank" class="'+fromUserNickImp+'">'+fromUserNick+'</a>'+
            				        			'<span class="giver_name02">送给</span>'+
            				        			'<a href="'+toUserNickLink+'" target="_blank" class="'+toUserNickImp+'">'+toUserNick+'</a>'+            				        			
            				        			'<div class="pull_left clearfix "><span class="giver_flower"><img src='+giftPicUrl+' style="width:21px; height:21px;"/></span>'+
            				        			'<span class="giver_name03">'+'&times;'+amount+'</span></div>'+
            				        		'</div></li>'
            				        	
                    				}
                					$(".js_all_giver_list ul.giver_list").prepend(oLi);
                    				//滚动条
                        			_this.giftRankScrollFn();
                        			_this.getScollGiftFn(d.data,10);
                        			
                        			
                				}else{
                					oLi='<li class="giver_content clearfix defaultGiftTxt">送礼有好礼~~</li>';
                					$(".js_all_giver_list ul.giver_list").html(oLi);
                					
                				}
                				
                			}else{
                				$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
                			}
                		}
                	})
                } ,
                getGiftRankScollListFn:function(codes){
                	var _this=this;
                	$.ajax({
                		url:getGifRankAllList,
                		type:"get",
                		dataType:"json",
                		data:{
                			r:Math.random(),
            				threadId:$(document).getLinkParamFn("id"),
            				count:7,//条数
            				start:codes
                		},
                		success:function(data){
                			var d=data;
                			if(d.status=="success" && d.data.length){
                				//操作成功                				
                					var oLi="";
                					for(var i=0;i<d.data.length;i++){
                						var floor=d.data[i].floor;//楼层
                    					var fromUserNick=$(document).filterDevKeywordFn(d.data[i].fromUserNick);//送礼人
                    					var toUserNick=$(document).filterDevKeywordFn(d.data[i].toUserNick);//收礼人
                    					var dataGiftPicUrl=$(document).filterDevKeywordFn(d.data[i].giftPicUrl);
                    					
                    					var amount=d.data[i].amount;//送礼个数
                    					var fromUserNickImp=fromUserNick.length>5?"giver_nameLarge":"giver_nameLess";//判断送礼人名称字数
                    					var toUserNickImp=toUserNick.length>5?"giver_nameLarge":"giver_nameLess";//判断收礼人名称字数
                    					var giftPicUrl=dataGiftPicUrl?dataGiftPicUrl:"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";//礼物图片
        			        			var fromUserLink = !fromUserNick?"javascript:void(0);":'/user?id='+d.data[i].fromId;//昵称改为userId
        			        			var toUserNickLink = !toUserNick?"javascript:void(0);":'/user?id='+d.data[i].toId;//昵称改为userId
        			        			var code=d.data[i].code
                    					oLi+='<li class="giver_content clearfix" >'+
            			        			'<span class="giver_floor pull_left" codeNum='+code+'>'+floor+'F</span>'+
            			        			'<div class="pull_left giver_txt">'+
            				        			'<a href="'+fromUserLink+'" target="_blank" class="'+fromUserNickImp+'">'+fromUserNick+'</a>'+
            				        			'<span class="giver_name02">送给</span>'+
            				        			'<a href="'+toUserNickLink+'" target="_blank" class="'+toUserNickImp+'">'+toUserNick+'</a>'+
            				        			
            				        			'<div class="pull_left clearfix "><span class="giver_flower"><img src='+giftPicUrl+' style="width:21px; height:21px;"/></span>'+
            				        			'<span class="giver_name03">'+'&times;'+amount+'</span></div>'+
            				        		'</div></li>'
                					}
                					$(".js_all_giver_list ul.giver_list").append(oLi);
                					_this.getScollGiftFn(d.data,7);                				
                			}
                		}
                	})
                },
                //滚动条向下滚动时加载数据
                getScollGiftFn:function(code,pageNum){
                	var _this=this;
                    if(code){
                    	var stop=true; 
                    	$('.giver_scoll').scroll(function(){
                			var scrollTop =$(this).scrollTop();//滚动高度
                			var viewH =$(this).height();//可见高度
                			var contentH =$(this).get(0).scrollHeight;//内容高度
                			//到达底部100px时,加载新内容
                			if(scrollTop/(contentH -viewH)>=0.95 && stop){
								stop=false; 
								var codes=code.length>=pageNum?code[pageNum-1].code:"";
								code.length>=pageNum?_this.getGiftRankScollListFn(codes,pageNum):"";
                			}
                		})
                    }             	
                },
         //获取第二个接口的code值
         getGifHtmlCodeFn:function(){
        	 var _this=this;
        	 var code=$(".giver_list li:eq(0) .giver_floor ").attr("codenum");
        	 try{
        		 //第二接口
        		 code?_this.getGiftRankAjaxFn(code):_this.getGiftRankAjaxFn(0);					
        	 }catch(e){
        		 //
        	 }
         },
        //礼物实时榜Ajax
        getGiftRankAjaxFn:function(code){
        	var _this=this;
        	$.ajax({
        		url:getGiftRankForumUrl,
        		type:"get",
        		dataType:"jsonp",
        		jsonp:'callback',
        		data:{
        			r:Math.random(),
    				threadId:$(document).getLinkParamFn("id"),
    				code:code
        		},
        		success:function(data){
        			
        			var d=data;
        			if(d.status=="success" && d.data.length){
        				//操作成功
						var oLi='';
						for(var i=0;i<d.data.length;i++){
							var floor=d.data[i].floor;//楼层
							var fromUserNick=$(document).filterDevKeywordFn(d.data[i].fromUserNick);//过滤送礼人
								fromUserNick=global_main.globalFn.nicknameCompleCode(fromUserNick);//送礼人
							var toUserNick=$(document).filterDevKeywordFn(d.data[i].toUserNick);//过滤收礼人
								toUserNick=global_main.globalFn.nicknameCompleCode(toUserNick);//收礼人
							var amount=d.data[i].amount;//送礼个数
							var fromUserNickImp=_this.escape2Html(fromUserNick).length>5?"giver_nameLarge":"giver_nameLess";//判断送礼人名称字数
							var toUserNickImp=_this.escape2Html(toUserNick).length>5?"giver_nameLarge":"giver_nameLess";//判断收礼人名称字数
							var dataGiftPicUrl=$(document).filterDevKeywordFn(d.data[i].giftPicUrl);

							var	giftPicUrl=dataGiftPicUrl?dataGiftPicUrl:"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";//礼物图片
							var fromUserLink = !fromUserNick?"javascript:void(0);":'/user?id='+d.data[i].fromId;//昵称改为userId
							var toUserNickLink = !toUserNick?"javascript:void(0);":'/user?id='+d.data[i].toId;//昵称改为userId
							var code=d.data[i].code
							oLi+='<li class="giver_content clearfix">'+
								'<span class="giver_floor pull_left" codenum='+code+'>'+floor+'F</span>'+
								'<div class="pull_left giver_txt">'+
									'<a href="'+fromUserLink+'" target="_blank" class="'+fromUserNickImp+'">'+fromUserNick+'</a>'+
									'<span class="giver_name02">送给</span>'+
									'<a href="'+toUserNickLink+'" target="_blank" class="'+toUserNickImp+'">'+toUserNick+'</a>'+
									
									'<div class="pull_left clearfix "><span class="giver_flower"><img src='+giftPicUrl+' style="width:21px; height:21px;"/></span>'+
									'<span class="giver_name03">'+'&times;'+amount+'</span></div>'+
								'</div></li>'
						}
						$(".js_all_giver_list ul.giver_list").prepend(oLi);
							var oLiSize=$(".js_all_giver_list ul.giver_list li").size();
							oLiSize>1?$(".js_all_giver_list ul.giver_list .defaultGiftTxt").html(""):"";
						//滚动条
						_this.giftRankScrollFn();
        			}

        			//1.5s请求获取礼物信息
        			var giftRankList=setTimeout(function(){
                		clearTimeout(giftRankList);
                		_this.getGifHtmlCodeFn();
                	},1500);        		
        		}
        	})
        } 
    };
    window.daoForumInfo = function(){
        return new DaoForumInfo();
    };
})();