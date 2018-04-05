/*
 * add by tht 2017-10-23
 * for forum forumInfo function dongchunshui
 */
(function() {

    //个人主页-获取消息列表
    var messageList = "/user/profile/messageList";

    //回复评论，回复回贴
    var commentInfo = "/forum/comment/info";

    //回复主贴，给回帖点赞
    var postInfo = "/forum/post/info";
    
    function DaoMessageUser() {}
    DaoMessageUser.prototype = {
        init: function() {
            var _this = this;
            _this.messageList();
        },
        //格式化html标签内容
        formatHtmlTagConFn:function(htmlStr,len){  //htmlStr:需要格式化的HTML; len:格式化后字符串长度
            //视频个数正则表达式
            var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)','g');
            //图片个数正则表达式
            var expImg = new RegExp('(<IMG|<img)[^>]+(>|\/>)','g');
            
            //字符截取长度
            var cutLen = len?parseInt(len):31;
            
            var ImgsArr = (htmlStr).match(expImg)
            var videosArr = (htmlStr).match(expVideo);
            
            var formattedStr = "";
            var noHtmlTagStr = htmlStr.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, "");
            if (noHtmlTagStr.length) {
            	formattedStr = noHtmlTagStr.length > cutLen ? noHtmlTagStr.substring(0, cutLen) + "..." : noHtmlTagStr
            } else {
                if (ImgsArr || videosArr) {
                    if (ImgsArr) {
                    	formattedStr += "[图片]";
                    }
                    if (videosArr) {
                    	formattedStr += "[视频]";
                    }
                }
            }
            return formattedStr;
        },
        //获取评论信息内容接口
        getCommentInfo: function(dataD, typeStatus, _href) {
        	var _this = this;
            var postId = typeof (dataD) == "string" ? dataD : dataD.contentId;
            var htmlLi = "";
            $.ajax({
                type: "GET",
                url: commentInfo,
                data: {
                    r: Math.random(),
                    commentId: postId
                },
                dataType: "json",
                async: false,
                success: function(dsq) {
                    if (typeStatus == 1) {
                        if (dsq.data!=null) {
                            var ds = dsq.data;
                            //回复回帖
                            if (dataD.type == "replyPost") {
                                htmlLi += '<li class="handleForYouTie" content="' + ds.postId + '" >'+
			                                '<a class="lf" target="_blank" href="/user?id=' + dataD.fromId + '">'+
			                                	'<span class="sourceNick js_checkEveryUserInfo" data-userinfoid="' + dataD.fromId + '">' + dataD.fromNickname + '</span>'+
			                                '</a>'+
			                                '<div class="con lf">'+
			                                '<p class="infosC lf">'+
				                                '<span class="actionTo">回复 :</span>'+
				                                '<span class="tieInfo">'+
				                                	'<a class="commentLink" comment="'+postId+'" target="_blank" _href="/forum/thread?id=' + ds.threadId + '#' + ds.postId + '">' + _this.formatHtmlTagConFn(ds.content) + '</a>'+
				                                '</span>'+
			                                '</p>';
                                if (ds.toContent) {
                          
                                    htmlLi += '<p class="infosC infosHF lf">'+
			                                    	'<span class="actionTo">在回帖</span><span class="tieInfo">'+
			                                    		'<a target="_blank" class="postLink" _href="/forum/thread?id=' + ds.threadId + '#' + ds.postId + '">' + _this.formatHtmlTagConFn(ds.toContent) + '</a>'+
			                                    	'</span>'+
		                                    	'</p>'+
		                                    '</div>';
                                    htmlLi += '<div class="riCon lf">'+
			                                    	'<p class="times lf"><span>' + $(document).formatDate(dataD.createTime) + '</span></p>'+
			                                    	'<p class="show_report"><span class="acknowledge"></span></p>'+
		                                    	'</div></li>';
                                }
                            }
                            //回复评论
                            if (dataD.type == "replyComment") {
                                htmlLi += '<li class="handleForYouTie" content="' + ds.postId + '" >'+
			                                '<a class="lf" target="_blank" href="/user?id=' + dataD.fromId + '">'+
			                                	'<span class="sourceNick js_checkEveryUserInfo" data-userinfoid="' + dataD.fromId + '">' + dataD.fromNickname + '</span>'+
			                                '</a>'+
			                                '<div class="con lf">'+
			                                '<p class="infosC lf">'+
				                                '<span class="actionTo">回复 :</span>'+
				                                '<span class="tieInfo">'+
				                                	'<a target="_blank" comment="'+postId+'" class="commentLink" _href="/forum/thread?id=' + ds.threadId + '#' + ds.postId + '">' + _this.formatHtmlTagConFn(ds.content) + '</a>'+
				                                '</span>'+
			                                '</p>';
                                if (ds.toContent) {

                                    htmlLi += '<p class="infosC infosHF lf">'+
			                                    	'<span class="actionTo">在评论</span><span class="tieInfo">'+
			                                    		'<a target="_blank" class="commentLink" comment="'+ds.toContentId+'" _href="/forum/thread?id=' + ds.threadId + '#' + ds.postId + '">' + _this.formatHtmlTagConFn(ds.toContent) + '</a>'+
			                                    	'</span>'+
		                                    	'</p>'+
		                                    '</div>';
                                    htmlLi += '<div class="riCon lf">'+
			                                    	'<p class="times lf"><span>' + $(document).formatDate(dataD.createTime) + '</span></p>'+
			                                    	'<p class="show_report"><span class="acknowledge"></span></p>'+
		                                    	'</div>'+
		                                    '</li>';

                                }
                            }
                            //被点赞评论
                            if (dataD.type == "praiseComment") {
                                if (ds.content) {
                                    //赞了您的评论
                                    htmlLi += '<li class="handleForYouTie " content="' + ds.postId + '" >'+
				                                    '<div class="con lf">'+
					                                    '<p class="infosC lf">'+
						                                    '<a class="lf zanComment" target="_blank" href="/user?id=' + dataD.fromId + '">'+
						                                    	'<span class="sourceNick js_checkEveryUserInfo" data-userinfoid="' + dataD.fromId + '">' + dataD.fromNickname + '</span>'+
						                                    '</a>'+
						                                    '<span class="actionTo">赞了您的评论</span>'+
						                                    '<span class="tieInfo">'+
						                                    	'<a target="_blank" class="commentLink" _href="/forum/thread?id=' + ds.threadId + '#' + ds.postId + '" comment="'+postId+'">' + _this.formatHtmlTagConFn(ds.content) + '</a>'+
						                                    '</span>'+
					                                    '</p>'+
				                                    '</div>'+
				                                    '<div class="riCon lf">'+
					                                    '<p class="times lf"><span>' + $(document).formatDate(dataD.createTime) + '</span></p>'+
					                                    '<p class="show_report"><span class="acknowledge"></span></p>'+
				                                    '</div>'+
			                                    '</li>';
                                }
                            }
                            //被隐藏评论
                            if (dataD.type == "hideComment") {
                            	//主贴标题
                            	var forumTitle = ds.title; 
                            	//回帖内容
                            	var commentCon = _this.formatHtmlTagConFn(ds.content);
                            	var cutCommentConTen = commentCon.length>10?commentCon.substring(0, 10) + "...":commentCon;
                            	var cutPostCommentTwenty = commentCon.length>20?commentCon.substring(0, 20) + "...":commentCon;
                            	//隐藏原因
                            	var hidReason = dataD.content;
                            	var cutHidReason = hidReason.length>10?hidReason.substring(0, 10) + "...":hidReason;
                            	
                            	var conStr = '<span class="contentHidden">您的评论<a title="'+cutPostCommentTwenty+'" class="cont">"'+cutCommentConTen+'"</a>'+
                            				 '由于<a title="'+hidReason+'" class="cont">"'+cutHidReason+'"</a>'+
                            				 '已被隐藏，如有疑问请<a target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">联系客服</a>。</span>';
                            	var forumConStr = '<span class="contentHidden">在主贴'+
					               				 '<a class="tit">'+forumTitle+'</a></span>';
                            	
                            	htmlLi += '<li class="handleForYouTie" content="' + dataD.contentId + '">'+
				            					'<div class="con lf">'+
				            						'<p class="infosC lf actionNoMr">'+conStr+'</p>'+
				            						'<p class="infosC lf infosHF">'+forumConStr+'</p>'+
				        						'</div>'+
				        						'<div class="riCon lf">'+
				        							'<p class="times lf">'+
				        								'<span>'+$(document).formatDate(dataD.createTime)+'</span>'+
				    								'</p>'+
				    								'<p class="show_report">'+
				    									'<span class="acknowledge"></span>'+
													'</p>'+
												'</div>'+
											 '</li>';
                            }
                        }
                    } else {
                        if (dsq.status == "success") {
                            window.open(_href);
                        }else if(dsq.status == "suspend"){
                        	//异常状态处理
                        	global_main.globalFn.callBackErrStatusOpreFn(dsq);
                        } else {
                        	$(document).popErrorF({
                                type: "open",
                                tip: dsq.message
                            });
                        }
                    }
                }
            });
            return htmlLi
        },
        //获取回帖信息
        getPostInfo: function(dataD, typeStatus,_href) {
        	var _this = this;
            var postId = typeof (dataD) == "string" ? dataD : dataD.contentId;
            var htmlLi = "";
            $.ajax({
                type: "GET",
                url: postInfo,
                data: {
                    r: Math.random(),
                    postId: postId
                },
                dataType: "json",
                async: false,
                success: function(dszP) {
                    if (typeStatus == 1) {
                        if (dszP.data!=null) {
                        	var dsz = dszP.data;
                            //回复主贴
                            if (dataD.type == "replyThread") {

                                htmlLi += '<li class="handleForYouTie" content="' + postId + '">'+
			                                '<a class="lf" target="_blank" href="/user?id=' + dataD.fromId + '">'+
			                                	'<span class="sourceNick js_checkEveryUserInfo" data-userinfoid="' + dataD.fromId + '">' + dataD.fromNickname + '</span>'+
			                                '</a>'+
			                                '<div class="con lf">'+
				                                '<p class="infosC lf">'+
					                                '<span class="actionTo">回复 :</span>'+
					                                '<span class="tieInfo"><a target="_blank" class="postLink" _href="/forum/thread?id=' + dsz.threadId + '#' + postId + '">' + _this.formatHtmlTagConFn(dsz.content) + '</a></span>'+
				                                '</p>';
                                if (dsz.title) {
                                    htmlLi += '<p class="infosC infosHF lf">'+
		                                    		'<span class="actionTo">在主贴</span><span class="tieInfo">'+
		                                    			'<a target="_blank" href="/forum/thread?id=' + dsz.threadId + '">' + dsz.title.replace(/<\/?[^>]*>/g, '').replace(/&nbsp;/ig, "") + '</a>'+
		                                    		'</span>'+
		                                    	'</p>'+
		                                    '</div>';
                                }
                                htmlLi += '<div class="riCon lf">'+
                                	'<p class="times lf"><span>' + $(document).formatDate(dataD.createTime) + '</span></p>'+
                                	'<p class="show_report"><span class="acknowledge"></span></p>'+
                                	'</div></li>';

                            }
                            //给回帖/主贴点赞
                            if (dataD.type == "praisePost") {
                                htmlLi += '<li class="handleForYouTie" content="' + postId + '">'+
				                                '<div class="con lf"><p class="infosC lf">'+
					                                '<a class="lf postLink" target="_blank" href="/user?id=' + dataD.fromId + '"><span class="sourceNick js_checkEveryUserInfo" data-userinfoid="' + dataD.fromId + '">' + dataD.fromNickname + '</span></a>'+
					                                '<span class="actionTo">赞了您的回帖</span>'+
					                                '<span class="tieInfo"><a target="_blank" class="postLink" _href="/forum/thread?id=' + dsz.threadId + '#' + postId + '">' + _this.formatHtmlTagConFn(dsz.content) + '</a></span>'+
					                            '</p></div>'+
					                            '<div class="riCon lf">'+
					                                '<p class="times lf"><span>' + $(document).formatDate(dataD.createTime) + '</span></p>'+
					                                '<p class="show_report"><span class="acknowledge"></span></p>'+
				                                '</div>'+
			                               '</li>';
                            }
                            //获取被隐藏回帖内容
                            if(dataD.type == "hidePost"){
                            	//主贴标题
                            	var forumTitle = dsz.title; 
                            	//回帖内容
                            	var postCon = _this.formatHtmlTagConFn(dsz.content);
                            	var cutPostConTen = postCon.length>10?postCon.substring(0, 10) + "...":postCon;
                            	var cutPostConTwenty = postCon.length>20?postCon.substring(0, 20) + "...":postCon;
                            	//隐藏原因
                            	var hidReason = dataD.content;
                            	var cutHidReason = hidReason.length>10?hidReason.substring(0, 10) + "...":hidReason;
                            	
                            	var conStr = '<span class="contentHidden">您的回帖<a title="'+cutPostConTwenty+'" class="cont">"'+cutPostConTen+'"</a>'+
                            				 '由于<a title="'+hidReason+'" class="cont">"'+cutHidReason+'"</a>'+
                            				 '已被隐藏，如有疑问请<a target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">联系客服</a>。</span>';
                            	var forumConStr = '<span class="contentHidden">在主贴'+
					               				 '<a class="tit">'+forumTitle+'</a></span>';
                            	
                            	htmlLi += '<li class="handleForYouTie" content="' + dataD.contentId + '">'+
				            					'<div class="con lf">'+
				            						'<p class="infosC lf actionNoMr">'+conStr+'</p>'+
				            						'<p class="infosC lf infosHF">'+forumConStr+'</p>'+
				        						'</div>'+
				        						'<div class="riCon lf">'+
				        							'<p class="times lf">'+
				        								'<span>'+$(document).formatDate(dataD.createTime)+'</span>'+
				    								'</p>'+
				    								'<p class="show_report">'+
				    									'<span class="acknowledge"></span>'+
													'</p>'+
												'</div>'+
											 '</li>';
                            }
                        }

                    } else {
                        if (dszP.status == "success") {
                            window.open(_href);
                        }else if(dszP.status == "suspend"){
                        	//异常状态处理
                        	global_main.globalFn.callBackErrStatusOpreFn(dszP);
                        }else {
                        	$(document).popErrorF({
                                type: "open",
                                tip: dszP.message
                            });
                        }
                    }
                }
            });
            return htmlLi
        },
        //我的列表--获取消息列表
        messageList: function() {
            var _thisMess = this;
            $(".js_allMs").ajaxPage({
                url: messageList,
                type: "GET",
                pageObj: $("#tieInfo_Table_0_paginate"),
                pageIndex: 1,
                pageSize: 15,
                curPageCls: "paginate_active",
                pageInfo: {
                    obj: $("#tieInfo_Table_0_info"),
                    content: ""
                },
                paramObj: {//传参

                },
                clickFn:function(){
                	$(window).scrollTop(425)
                },
                dataFn: function(d) {
                        var htmlAll="";
                        if(d.status=="success"){
//                        	消息关闭
	   	   					 if($(".userInfo .icon2").hasClass("iconEmailHas")){
	   	   			   			 $(".myNews").fadeOut();
	   	   			  		     $(".ovF .icon2").removeClass("iconEmailHas");
	   	   			  		     $(".dynamicCenter .msgs .icoMN,.comingSoon").hide();
	   	   			  		     global_main.globalFn.read();
	   	   			   		 }
	   		   				 //当前弹幕关闭
	   		   				 if(!$(".myNews .msgAlert").is(':visible')){
	   		   					   clearTimeout(myNewsSet);
	   		   					    //实时弹幕
	   		   					   setTimeout(function(){
	   		   						   global_main.globalFn.barrage();
	   		   					   },1500)
	   		   			   	  }
                        	 var datas = d.data;
                        	 if (datas && datas.length > 0) {
                             	$(".comingSoon").hide();
                                 $(".dataTables_wrapper,.js_allMs").show();
                                 for (var i = 0; i < datas.length; i++) {
                                     var dataD = datas[i];

                                     switch(dataD.type){ //type:消息类型
                                     
                                     	case "replyComment":   //回复评论
                                     	case "replyPost":      //评论回帖
                                     	case "praiseComment":  //点赞评论
                                     	case "hideComment":    //隐藏评论
                                     		htmlAll += _thisMess.getCommentInfo(dataD, 1);  //获取评论信息
                                     		continue;
                                     	case "replyThread":    //回贴
                                     	case "praisePost":     //点赞回帖
                                     	case "hidePost":       //隐藏回贴
                                     		htmlAll += _thisMess.getPostInfo(dataD, 1);     //获取回帖信息
                                     		continue;
                                 		//best、top、goldChest、silverChest、forbidden、removeForbidden、hideThread 不显示昵称  
                                 		//content: 服务器端拼装返回
                                     	case "best":           //精品贴
                                     	case "top":            //置顶贴
                                     	case "goldchest":      //金宝箱
                                     	case "silverchest":    //银宝箱
                                     	case "forbidden":      //禁言
                                     	case "removeForbidden":  //解除禁言
                                     	case "hideThread":       //隐藏主贴
                                     	case "suspend":  //账号封停
										case "unBindRole": //社区解绑手机
										case "modifyPassword": //修改密码
                                     		htmlAll += '<li class="handleForYouTie" content="' + dataD.contentId + '">'+
                                     					'<div class="con lf">'+
                                     						'<p class="infosC lf actionNoMr">'+dataD.content+'</p>'+
                                 						'</div>'+
                                 						'<div class="riCon lf">'+
                                 							'<p class="times lf">'+
                                 								'<span>'+$(document).formatDate(dataD.createTime)+'</span>'+
                             								'</p>'+
                             								'<p class="show_report">'+
                             									'<span class="acknowledge"></span>'+
                         									'</p>'+
                     									'</div>'+
                 									 	'</li>';
                                             continue;
                                         //praiseThread、gift、关注  显示昵称
                                     	case "praiseThread":   //点赞主贴
                                     	case "gift":          //送礼
                                     	case "follow":	//关注
                                     		htmlAll += '<li class="handleForYouTie" content="' + dataD.contentId + '">'+
     			                    					'<div class="con lf">'+
     			                    						'<p class="infosC lf">'+
     				                    						'<a target="_blank" href="/user?id='+dataD.fromId+'">'+
     				                                            	'<span class="sourceNick js_checkEveryUserInfo" data-userinfoid="'+dataD.fromId+'">'+dataD.fromNickname+'</span>'+
     			                                            	'</a>'+dataD.content+
     		                                            	'</p>'+
     			                						'</div>'+
     			                						'<div class="riCon lf">'+
     			                							'<p class="times lf">'+
     			                								'<span>'+$(document).formatDate(dataD.createTime)+'</span>'+
     			            								'</p>'+
     			            								'<p class="show_report">'+
     			            									'<span class="acknowledge"></span>'+
     			        									'</p>'+
     			    									'</div>'+
     												 '</li>';
                                     		continue;
                                     }
                                 }
                             }else{
                                 $(".pageCut,.js_allMs").hide();
                                 $(".comingSoon").html("暂无消息").css("display", "block");
                             }
                        }
                        //未登录异常处理
                        $(document).errorDataOperateFn(d,null,{
 							loginErrorFn:function(){
 								//异常
 								 $(".pageCut,.js_allMs").hide();
 	                             $(".comingSoon").html("您暂无登录，请先登录").css("display", "block");
 							}
 						});	
                        $(".typeMsg").attr("repeat","yes");
                    return htmlAll;
                }
            });
        }
    };
    window.DaoMessageUser = function() {
        return new DaoMessageUser();
    }
    ;
}
)();
