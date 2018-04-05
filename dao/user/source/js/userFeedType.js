/*-------------------------------------------------------------------------
 * 作者：dongchunshui
 * 创建时间： 2017/10
 * 版本号：v1.0
 * 作用域：用户中心-个人中心
 * 
 * 来源:
 *    global_main-->global.js
 *
 -------------------------------------------------------------------------*/
(function(){
	var getUserFeedList = "/user/profile/feedList";  //获取个人动态接口    参数type； all：全部类型动态
	var getThreadInfoUrl = "/forum/thread/info/ofThread" //获取主贴内容接口
	var getPostInfoUrl = "/forum/post/info"; //获取回帖内容接口
	var getCommentInfoUrl = "/forum/comment/info"; //获取评论内容接口
	
	/*====================接口-结束===================*/
    
    var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)','g');  //视频个数正则表达式
    var	expImg = new RegExp('(<IMG|<img)[^>]+(>|\/>)','g'); //图片个数正则表达式
	
		function userFeedDynamic(){
			//Constructor
		}
		userFeedDynamic.prototype={
			init:function(){
				var _this = this;
				_this.oneselfReplyDynamic("all")
			},
		 //图片地址处理
        imgForSrc:function(imgs){
        	var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        	var imgSrc = imgs.match(srcReg);
        	if(imgSrc[1]){
        		imgs=imgs.replace(imgSrc[1],imgSrc[1]+"?imageView2/2/w/189/h/108");
        	}
        	imgs=$(document).filterDevKeywordFn(imgs);
        	return imgs;
        },
      //个人动态类型
		oneselfReplyDynamic:function(onselfDynamicType){
			var _this=this;
		    	$(".js_allMs").ajaxPage({
                    url:getUserFeedList,
                    type: "GET",
                    pageObj: $("#tieInfo_Table_0_paginate"),
                    pageIndex: 1,
                    pageSize: 10,
                    curPageCls: "paginate_active",
                    pageInfo: {
                        obj: $("#tieInfo_Table_0_info"),
                        content: ""
                    },
                    paramObj: {//传参
                        type:onselfDynamicType
                    },
                    clickFn:function(){
                    	$(window).scrollTop(425);
                    },
                    dataFn: function (d) {
                    	var htmlLi="";
                    	$(".js_allMs").html("");
                    	$(".comingSoon").css("display","block");
                         if(d.status=="success"){
                        	 var dataD=d.data;
                        	 if(dataD&&dataD.length>0){
                        		 $(".comingSoon").hide();
                        		 $(".dataTables_wrapper,.js_allMs").show();
                        		 for(var i=0;i<dataD.length;i++){
                        			
                        			 var dataDType=dataD[i].type;//帖子类型
                        			//获取信息内容
                        			 switch (dataDType){
                        			    //主贴
                        			 	case "addThread":
                        			 		var addThreadHtml = _this.getThreadInfoFn(dataD[i]).forumStr;
                        			 		htmlLi += addThreadHtml;
                        			 		continue;
                        			 		
                        			 	//回帖
                        			 	case "replyThread":
                        			 		var postHtml = _this.getPostInfoFn(dataD[i],1).postStr;//1无点击状态，0点击状态
                        			 		htmlLi += postHtml;
                        			 		continue;
                        			 	//评论
                        			 	case "replyComment":
                        			 	case "replyPost":
                        			 		var commentHtml = _this.getCommentInfoFn(dataD[i],null,1,null);//1无点击状态，0点击状态
                        			 		htmlLi += commentHtml;
                        			 		continue;
                        			 	//送礼
                        			 	case "gift":
                        			 		var giftHtml = _this.getGiftInfoFn(dataD[i]);
                        			 		htmlLi += giftHtml;
                        			 		continue;
                        			 	default:
                        			 		continue;
                        			 }
                        		 }
                        		 if(htmlLi==""){
                        			 $(".pageCut,.js_allMs").hide();
                            		 $(".comingSoon").html("您暂无任何动态").css("display","block");
                        		 }
                        	 }else{
                        		 $(".pageCut,.js_allMs").hide();
                        		 $(".comingSoon").html("您暂无任何动态").css("display","block");
                        	 }
                         }else if(d.status=="needPasswd"){
 								$(".comingSoon").html("您暂无任何动态").css("display","block");
						 }else{
                        	 //未登录异常还能处理
                        	  $(document).errorDataOperateFn(d,null,{
       							loginErrorFn:function(){
       								$(".pageCut,.js_allMs").hide();
                              		$(".comingSoon").html("您暂无登录，请先登录").css("display","block");
       							}
       						  });	
                         }
                         $(".typeMsg").attr("repeat","yes");
                         return htmlLi;
                    },
                    successFn:function(){
            			$(".js_wealthsTop").hoverAnimateFn(".js_wealthNumTop"); //财富值显示
            			//图片懒加载
                        $(document).imgLazyLoadExcuteFn(".js_allMs li img");
                    }
                });
		},
		//获取回贴内容
		getPostInfoFn:function(listData,typeStatus,_href){
			var postStr = "";
			var postId = typeof (listData) == "string" ? listData : listData.contentId;//回帖id
			var createTime = listData?listData.createTime:""; //帖子时间
			var toNickName = listData?listData.toNickname:""; //目标昵称
			var datas=null;
			 $.ajax({
				 type: "GET",
	             url: getPostInfoUrl,
	             data: {
	            	 r: Math.random(),
	            	 id:$(document).getLinkParamFn("id"),
	            	 postId:postId
	             },
	             dataType: "json",
				 async:false,
				 success:function(d){
					 datas=d.data;
					 if (typeStatus == 1) {
						 if(d.status == "success"){
							 var postCon=datas.content.replace(/<\/?[^>]*>/g,'').replace(/&nbsp;/ig, ""); //删除回帖内容中的html标签
							 var Imgs=(datas.content).match(expImg);  //匹配图片
							 var videos=(datas.content).match(expVideo);  //匹配视频
							 var commentCounts=datas.discussNum ? parseInt(datas.discussNum) : 0;//评论数
							 var likeNums=datas.likeNum ? parseInt(datas.likeNum) :0 ;//点赞数

							 if(postCon.length){  //优先显示文字
								 postCon=postCon.length>31?postCon.substring(0,31)+"...":postCon
							 }else{
								 if(Imgs||videos){
									if(Imgs){
										postCon+="[图片]";
									}
									if(videos){ 
										postCon+="[视频]";
									}
							     }
							 }   
					 postStr+='<li class="dynamicAll dynamic_li" >'+
								'<div class="first_line">'+
									'<span class="iconPost">回帖</span>'+
									'<a target="_blank" class="show_title js_postLink" content="' + postId + '"  _href="/forum/thread?id='+datas.threadId+'#'+postId+'">'+postCon+'</a>'+
									'<div class="fun_btn_wrap"style="display:none" >'+
										'<span class="forThisReply"><a target="_blank" href="/forum/thread?id='+datas.threadId+'">回复</a></span>'+
										'<span class="forThisShare" style="display:none"></span>'+
									'</div>'+
								'</div>'+
								'<div class="second_line">'+
									'<div class="reply_forum_to_con">'+
										'<span>回复</span>'+
										'<span class="nick_name">'+toNickName+'</span>'+
										'<span>的主帖</span>'+
										'<span class="content">'+
											'<a target="_blank" href="/forum/thread?id='+datas.threadId+'">'+datas.title+'</a>'+
										'</span>'+
									'</div>'+
								'</div>'+
								'<div class="third_line">'+
									'<div class="time">'+createTime+'</div>'+
									'<div class="about_num">'+
										'<span class="comment">'+commentCounts+'</span>'+
										'<span class="line">|</span>'+
										'<span class="zan">'+likeNums+'</span>'+
									'</div>'+
								'</div>'+
							  '</li>';
						 }
					 }else{
						 if (d.status == "success") {
	                            window.open(_href);
	                        }else if(d.status == "suspend"){
	                        	//异常状态处理
	                        	global_main.globalFn.callBackErrStatusOpreFn(d);
	                        }else {
	                        	$(document).popErrorF({
	                                type: "open",
	                                tip: d.message
	                            });
	                        }
					 }
					 
					 
				 }
			 });
			 return {
				 postStr:postStr,
				 datas:datas
			 };
		},
		//获取主贴内容
		getThreadInfoFn:function(listData){
			var forumStr = "";
			var threadId = listData.contentId; //主贴id
			var dataDCreateTime=listData.createTime;//主贴时间
			var datas=null;
			 $.ajax({
				 type: "GET",
	             url: getThreadInfoUrl,
	             data: {
	            	 r: Math.random(),
	            	 threadId:threadId
	             },
	             dataType: "json",
				 async:false,
				 success:function(d){
					 datas=d.data;
					 if(d.status=="success"){
						 //主贴标题
						 var title = datas.title;
						 title = title.length>31?title.substring(0,31)+"...":datas.title;
						 
						 var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)','g');  //视频个数正则表达式
						 var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")(?![^>]+src="http://wanwd.gyyx.cn/Content/js/editor/dialogs/emotion)[^>]+(>|\/>)','g'); //图片个数正则表达式
						 var seeNum = datas.pageView?datas.pageView:0; //帖子查看量
						 var commentNum = datas.replys?datas.replys:0; //帖子评论量
						 var zanNum = datas.likeNum?datas.likeNum:0; //帖子点赞量

						 //帖子财富标签
						 var contentWealths=datas.level; 
						 var wealthClassFn = function(str){
		                	    var classNames;
		                	    switch(str){
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
		                	};
		                var addClassWealths=wealthClassFn(contentWealths);
		                //视频区,图片展示
						var videoImgArr=[];
						var videos=(datas.content).match(expVideo); 
						var Imgs=(datas.content).match(expImg);
						if(videos){
							for(var v=0;v<videos.length;v++){
								if(v<3){
									videoImgArr.push(videos[v]);
								}
							}
						}
						if(Imgs){
						    for(var im=0;im<Imgs.length;im++){
								if(videoImgArr.length<3&&im<3){
									//图片等比例
									var sNewIm=global_main.globalFn.imgForScale(Imgs[im]);
									//图片懒加载
									sNewIm = sNewIm.replace("src","_src");
									videoImgArr.push(sNewIm);
							   }
								
						    }
						}
						 forumStr+='<li class="dynamicAll dynamic_li">'+
							'<div class="first_line">'+
								'<span class="iconPost">发帖</span>'+
								'<a target="_blank" class="show_title" href="/forum/thread?id='+datas.id+'">'+title+'</a>'+
								'<div class="title_icon_wrap">';
				 
				 			if(datas.isBest){
				 				forumStr+='<i class="title_icon best"></i>';
				 			}
				 			
				 			forumStr+='<span class="title_icon wealths js_wealthsTop '+addClassWealths+'">'+
										'<div class="num js_marginLeft js_wealthNumTop" data-wealthsum="'+contentWealths+'">'+contentWealths+'<i class="arrow"></i></div>'+
									'</span>'+
								'</div>'+
								'<div class="fun_btn_wrap" style="display:none">'+
									'<span class="forThisReply"><a target="_blank" href="/forum/thread?id='+datas.id+'">回复</a></span>'+
									'<span class="forThisShare" style="display:none"></span>'+
								'</div>'+
							'</div>'+
							'<div class="second_line">'+
								'<div class="reply_forum_to_con" style="display:none;">'+
									'<span>回复</span>'+
									'<span class="nick_name">昵称</span>'+
									'<span>的回帖</span>'+
									'<span class="content">目标内容</span>'+
								'</div>'+
								'<div class="forum_to_con">';
								//视频区,图片展示
                         	if(videoImgArr.length>0){
                         		forumStr+='<ul class="forum_to_img">';
						 			for(var vI=0;vI<videoImgArr.length;vI++){
										 if(vI<3){
                         					forumStr+='<li>'+videoImgArr[vI]+'</li>';
                        				}
                         		}
						 			forumStr+='</ul>';
                         	}
				 			
				 			forumStr+='<a class="a_link" target="_blank" href="/forum/thread?id='+datas.id+'"></a>'+
								'</div>'+
							'</div>'+
							'<div class="third_line">'+
								'<div class="time">'+dataDCreateTime+'</div>'+
								'<div class="about_num">'+
									'<span class="pvs">'+seeNum+'</span>'+
									'<span class="line">|</span>'+
									'<span class="comment">'+commentNum+'</span>'+
									'<span class="line">|</span>'+
									'<span class="zan">'+zanNum+'</span>'+
								'</div>'+
							'</div>'+
						  '</li>';
					 }
					 
				 }
			 });
			 return {
				 forumStr:forumStr,
				 datas:datas
			 };
		},
		//获取评论内容
		getCommentInfoFn:function(listData,daoId,typeStatus,_href){
			var commentId=typeof (listData) == "string" ? listData : listData.contentId;//评论id
			var id =listData.daoId? listData.daoId :daoId;//贴吧用户id
			var toNickname=listData.toNickname?listData.toNickname:"";//评论人
			var createTime=listData?listData.createTime:"";//评论时间
			var commentStr="";
			 $.ajax({
				 type: "GET",
	             url: getCommentInfoUrl,
	             data: {
	            	 r: Math.random(),
	            	 id:id,
	            	 commentId:commentId
	             },
	             dataType: "json",
				 async:false,
				 success:function(d){
				 if (typeStatus == 1) {
					if(d.status!="hiddenComment"&& d.status!="deleteComment" && d.data){
						var datas = d.data;
						var threadId = datas.threadId;  //主贴id
						var postId = datas.postId;  //回帖床
						var likeNums = datas.likeNum; //点赞数
						var contentImgs=(datas.content).match(expImg);
						var toContentImgs=(datas.toContent).match(expImg);
						var toContentVideos=(datas.toContent).match(expVideo);  //匹配回帖视频
						//评论内容，被评论内容	
						var commentContent=datas.content.replace(/<\/?[^>]*>/g,'').replace(/&nbsp;/ig, "");
						var toContent=datas.toContent.replace(/<\/?[^>]*>/g,'').replace(/&nbsp;/ig, "");
						//评论内容图片
						if(commentContent.length>0){
							commentContent=commentContent.length>31?commentContent.substring(0,31)+"...":commentContent;
						}else{
							if(contentImgs){
								commentContent+="[图片]";
							}
						}
						//被评论内容图片
						if(toContent.length>0){
							toContent=toContent.length>31?toContent.substring(0,31)+"...":toContent;
						}else{
							if(toContentImgs){
								toContent+="[图片]";
							}							
							if (listData.type == "replyPost" && toContentVideos) {  //回帖视频
									toContent+="[视频]";
							}
						}
						
						toContent=toContent.length>31?toContent.substring(0,31)+"...":toContent;
						
						//回帖或评论字符串
						var replyConTip = listData.type=="replyPost"?"回帖":"评论";
						var toContentId,commentClass,attrClass;
						if(replyConTip=="回帖"){
							toContentId=datas.postId;
							commentClass="js_postLink";
							attrClass='content';
						}else{
							toContentId=datas.toContentId;
							commentClass="js_commentLink";
							attrClass='comment';
						}
						commentStr+='<li class="dynamicAll dynamic_li" dao='+id+'>'+
										'<div class="first_line">'+
											'<span class="iconPost">评论</span>'+
											'<a target="_blank" class="show_title js_commentLink" comment="'+commentId+'" _href="/forum/thread?id='+threadId+'#'+postId+'">'+commentContent+'</a>'+
											'<div class="fun_btn_wrap" style="display:none">'+
												'<span class="forThisReply"><a target="_blank" href="/forum/thread?id='+threadId+'#'+postId+'">回复</a></span>'+
												'<span class="forThisShare" style="display:none"></span>'+
											'</div>'+
										'</div>'+
										'<div class="second_line">'+
											'<div class="reply_forum_to_con">'+
												'<span>回复</span>'+
												'<span class="nick_name">'+toNickname+'</span>'+
												'<span>的'+replyConTip+'</span>'+
												'<span class="content">'+
												'<a target="_blank" class="'+commentClass+'" '+attrClass+'="'+toContentId+'" _href="/forum/thread?id='+threadId+'#'+postId+'">'+toContent+'</a>'+
												'</span>'+
											'</div>'+
										'</div>'+
										'<div class="third_line">'+
											'<div class="time">'+createTime+'</div>'+
											'<div class="about_num">'+
												'<span class="zan">'+likeNums+'</span>'+
											'</div>'+
										'</div>'+
									  '</li>';
						 
					 }
				}else{
					 if (d.status == "success") {
                         window.open(_href);
                     }else if(d.status == "suspend"){
                     	//异常状态处理
                     	global_main.globalFn.callBackErrStatusOpreFn(d);
                     }else {
                     	$(document).popErrorF({
                             type: "open",
                             tip: d.message
                         });
                     }
				}
					
					 
				 }
			 });
			 return commentStr;
		},
		//获取送礼内容
		getGiftInfoFn:function(listData){
			var _this = this;
			var toNickname=listData.toNickname?listData.toNickname:"";//评论人
			var createTime=listData.createTime;//评论时间
			var giftInfoArr = listData.note.split(","); //礼物信息
			var giftName = giftInfoArr[0];
			var giftNum = giftInfoArr[1];
			var giftImg = giftInfoArr[2];
			var giftConType = listData.contentType;
			var giftStr="";
			var giftToConLinkStr = "";
			var callbackData = null;
			var giftToCon = "";
			var threadId = "";
			var postId = listData.contentId; //回帖id
			var giftConTip = listData.contentType=="thread"?"主贴":"回帖";
			if(giftConType=="thread" ){
				callbackData = _this.getThreadInfoFn(listData).datas;
				threadId = callbackData.id;
				giftToCon = callbackData.title?callbackData.title:"";
				giftToCon = giftToCon.length>31?giftToCon.substring(0,31)+"...":giftToCon;
				giftToConLinkStr = '<a target="_blank" href="/forum/thread?id='+threadId+'">'+giftToCon+'</a>';
			}else if(_this.getPostInfoFn(listData,1,null).datas){
				callbackData = _this.getPostInfoFn(listData,1,null).datas;
				threadId = callbackData.threadId;
				var postCon=callbackData.content.replace(/<\/?[^>]*>/g,'').replace(/&nbsp;/ig, ""); //删除回帖内容中的html标签
				var Imgs=(callbackData.content).match(expImg);  //匹配图片
				var videos=(callbackData.content).match(expVideo);  //匹配视频

				if(postCon.length){  //优先显示文字
					postCon=postCon.length>31?postCon.substring(0,31)+"...":postCon
				}else{
					if(Imgs||videos){
						if(Imgs){
							postCon+="[图片]";
						}
						if(videos){
							postCon+="[视频]";
						}
				    }
				} 
				
				if(giftConTip=="主贴"){
					giftToConLinkStr = '<a target="_blank" href="/forum/thread?id='+threadId+'#'+postId+'">'+postCon+'</a>';
				}else{
					giftToConLinkStr = '<a target="_blank" class="js_postLink" content="'+postId+'" _href="/forum/thread?id='+threadId+'#'+postId+'">'+postCon+'</a>'
				}
				
			}
			
			//回帖或主贴字符串
			giftStr+='<li class="dynamicAll dynamic_li">'+
							'<div class="first_line">'+
								'<span class="iconPost">送礼</span>'+
								'<img src="'+$(document).filterDevKeywordFn(giftImg)+'" class="giver_icon" />'+
		 						'<a class="show_title_gift">'+giftName+'<span class="giver_name03">×'+giftNum+'</span><span  class="giver_name02">给</span><span class="giver_name01">'+toNickname+'</span></a>'+
								'<div class="fun_btn_wrap">'+
									'<span class="forThisShare" style="display:none"></span>'+
								'</div>'+
							'</div>'+
							'<div class="second_line">'+
								'<div class="reply_forum_to_con">'+
									'<span>在'+giftConTip+'</span>'+
									'<span class="content">'+giftToConLinkStr+'</span>'+
								'</div>'+
							'</div>'+
							'<div class="third_line">'+
								'<div class="time">'+createTime+'</div>'+
							'</div>'+
						  '</li>';

			 return giftStr;
		}
	}
	window.userFeedDynamic = function(){
		return new userFeedDynamic();
	};
})()
$(function(){
	$(".js_dynamicTypes").show(); 
	//动态二级分类展示
	$(".js_dynamicTypes li").click(function(){
		var _this=$(this);
			 if($(".typeMsg").attr("repeat")=="no"){
			    	return false;
			    }
				 var _thisType=$(_this).attr("type");
				 $(_this).siblings().removeClass("cur").end().addClass("cur");
				 if(_thisType==""){
		     		 $(".js_allMs,.dataTables_wrapper").hide();
		     		$(".comingSoon").html("您暂无任何动态").css("display","block");
		     		$(".typeMsg").attr("repeat","yes");
		     		return false;
		     	}else{
		     		userFeedDynamic().oneselfReplyDynamic(_thisType);
		     	}
	});
	
	 //个人动态列表回帖信息点击事件
    $("body").on("click",".dynamic_li .js_postLink",function(){
    	var contentId=$(this).attr("content");
    	var _href=$(this).attr("_href");
    	userFeedDynamic().getPostInfoFn(contentId,0,_href,$(this));
    })
	 //个人动态列表评论信息点击事件
    $("body").on("click",".dynamic_li .js_commentLink",function(){
    	var contentId=$(this).attr("comment");
    	var _href=$(this).attr("_href");
    	var daoId=$(this).parents(".dynamic_li").attr("dao");
    	userFeedDynamic().getCommentInfoFn(contentId,daoId,0,_href,$(this));
    })
	 //地址栏跳转对应
	 if(location.hash.indexOf("#xx")==-1){  //修复火狐执行顺序，会在消息列表展示动态内容
		 userFeedDynamic().oneselfReplyDynamic("all");
	 }
	
	
});
