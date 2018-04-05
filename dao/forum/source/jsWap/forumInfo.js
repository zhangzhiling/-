(function(){
	var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")[^>]+(>|\/>)','g'); //图片个数正则表达式(不包含表情)
	var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)', 'g');  //视频个数正则表达式
	var getReplayListUrl = "/forum/thread/show"; //获取详细页回帖列表
	var postZanAndCaiForumUrl = "/forum/poke"; //帖子（不分主贴和回帖）踩赞接口  1：赞  2：踩
	var getDescriptionForumUrl ="/forum/thread/level"; //道具等级显示
	var getCommentListUrl = "/forum/comment/list"; // 获取回帖评论列表
	var pageIndex = 1;
    var flag = true;
	var htmlswiper = '<div class="swiper-container">'+
    '<div class="swiper-wrapper">'+
    '</div>'+
    '<div class="swiper-pagination swiper-pagination-white"></div>'+
    '<div class="swiper-button-prev"></div>'+
    '<div class="swiper-button-next"></div>'+
  '</div>'+
  '<a href="javascript:;" class="noLink">×</a>'
  
    function DaoForumInfo(){
        //constructure
    }
    DaoForumInfo.prototype = {
        init:function(){
        	var _this = this;
            //详细页回帖列表
            _this.threadListAjax();
			_this.listImg();//切换查看图片
			_this.newList();//刷新加载
			 _this.caiAndZanForumsWapFn();//帖子（不区分主贴回帖）赞和踩
			$(document).iconPc();//添加电脑端			
			if (!$(".swiper-container").length) {
                $("body").append(htmlswiper);
  			}
			_this.replyFun();//进入评论详情页

        },
        
        //获取道具等级内容
        getDescription:function(id){
			var _this=this;
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
        				dataHtml +='<i class="wealths js_wealthsTop '+addClassWealths+'"></i>';
        				 $(".js_sub_forum .title .dengji").html(dataHtml);
        				 $(".js_wealthsTop").hoverAnimateFn(".js_wealthNumTop"); //财富值显示
        			}else{
        				$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        			}
        		},
				complete: function () {
					_this.postTagSizeFn();
				}
        	})
        },
		//获取标识图标个数
        postTagSizeFn: function () {
            $(".js_sub_forum .js_replyF_info").each(function () {
                var wealthsTopWrap = $(this).find(".title .dengji i").size();//道具等级帖标签
                var zhidingWrap=$(this).find(".title .top").size();//置顶帖标签
                var jingpinWrap=$(this).find(".title .best").size();//精品帖标签
                if(zhidingWrap||jingpinWrap||wealthsTopWrap){
                    $(this).find(".title h2").css({
                        "text-indent": '.5rem'
                    });
                }
                if(zhidingWrap){
					 $(this).find(".title .top").show();
					 $(this).find(".title .best,.title .dengji").hide();					 
                }else if(jingpinWrap){
                     $(this).find(".title .best").show();
					 $(this).find(".title .dengji").hide();
                }else if(wealthsTopWrap){
					 $(this).find(".title .dengji i").show();		 
                }
            })
        },
		//视频过滤方法
		videoShowImgFn:function(clearContent){
			var videoContent=clearContent
			var videos = (clearContent).match(expVideo);
			videoContent=videoContent.replace(expVideo,"");//去掉embed标签后的内容
			if (videos) {  
				var videoImgArr = [];
				for (var v = 0; v < videos.length; v++) {
					var voideImg = videos[v] = "<img src='http://img.gyyxcdn.cn/dao/forum/imagesWap/defaultVideoImg.png' class='videoShowImg' />";
					videoImgArr.push(voideImg);
				}
			}
			return {videoArr:videoImgArr,contentStr:videoContent};
		},
        //获取数据列表
		threadListAjax:function(){
			var _this = this;
			if (flag) {
                //进行请求数据
                flag = false;
			$.ajax({
				 url: getReplayListUrl,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        pageIndex: pageIndex,//分页
                        pageSize:20,
						threadId: $(document).getLinkParamFn("id"),
                        r: Math.random()
                    },
                    beforeSend: function () {
                        $(".js_sub_forum").siblings("p").html('正在加载').show();
                        $(".lastPage").hide();
                    },
                    success: function (data) {
						$(".lastPageShua").hide();
						var dataHtml = "";
						var threadHtml = "";
						 var dCont = data.data.posts;
						for (var i = 0; i < dCont.length; i++) {							
							if(dCont[i].isShow){  //帖子文字过滤已通过
								var clearContent = _this.forumInfoImgFn(dCont[i].content);
								clearContent = $(document).canBeTrustStrFn(clearContent);  //修复播放器插件地址被过滤掉get
								var videoImg=_this.videoShowImgFn(clearContent)
								var headPic=$(document).filterDevKeywordFn(dCont[i].headPic);
								var nikeName=$(document).filterDevKeywordFn(dCont[i].nikeName);
								var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
								var names = !nikeName?"呀！跑路啦！":nikeName; //昵称
								var js_userClass = !nikeName?"nikeDefaultF":"js_checkEveryUserInfo";
								//游戏信息  大区   服务器  角色
								var gameInfoStr = dCont[i].areaName ? '<span class="t_server">' + dCont[i].areaName + '</span>|<span class="t_qz">' + dCont[i].server + '</span>|<span class="t_nickNmae">' + dCont[i].role + '</span>' : "暂无游戏信息";
								if(parseInt(dCont[i].floor)==1){
									threadHtml +=_this.subForumAreaFn(data);//1楼展示内容,主贴区域
								}else{						
								 //回帖内容
								dataHtml +='<div class="info_f js_replyF_info postFBorder">'+
									'<div class="floorHash" id='+dCont[i].postId+'></div>'+
									'<div class="user_info">';
							dataHtml +=dCont[i].threadStarter ? '<span class="lz">楼主</span>' : "";
							dataHtml+='<img src="'+pics+'" alt="头像" class="headImg '+js_userClass+'"  data-userinfoid="'+dCont[i].id+'">';
							
							dataHtml+='<span class="t_nickUser '+js_userClass+'"  data-userinfoid="'+dCont[i].id+'">'+names+'</span>'+
									'<section class="serverWrap">'+gameInfoStr+'</section>' + 
									'</div>'+
									'<div class="forum_info">'+
										'<div class="top_tools">';
										 //评论数大于0展示评论列表
										var replyCont = parseInt(dCont[i].discussNum) > 0 ? "收起回复" : "回复";
										var replyCont_on = parseInt(dCont[i].discussNum) > 0 ? "on" : "";
										dataHtml +='<div class="replay_con '+replyCont_on+'">'+
													'<a class="replay js_comments_btn" data-num="'+dCont[i].discussNum+'" data_replyid="'+dCont[i].postId+'">'+replyCont+'</a>';
										dataHtml +='</div>';
									
										var floorNum=parseInt(dCont[i].floor)+'L<span class="floorNum">|</span>';//展示楼层数
										dataHtml +='<section class="times">'+floorNum+dCont[i].dateString+'</section>';//发布时间
										if(dCont[i].isLike){ //点赞状态
											dataHtml +='<a class="js_zan_forums zan on" data_replyid="'+dCont[i].postId+'">'+dCont[i].likeNum+'&nbsp;赞</a>';
										}else{
											dataHtml +='<a class="js_zan_forums zan" data_replyid="'+dCont[i].postId+'">'+dCont[i].likeNum+'&nbsp;赞</a>';
										} 
											dataHtml +='</div>';		                  
									dataHtml +='</div>';
									var showContent= videoImg.videoArr ? videoImg.videoArr[0]+videoImg.contentStr:clearContent;
										dataHtml +='<div class="content js_content">'+showContent+'</div>';//视频展示内容
										//回复功能--开始;
									var showblock=parseInt(dCont[i].discussNum)>0?"block":"none";//评论区域
									var discussNum=dCont[i].discussNum?dCont[i].discussNum:"0";//评论数
									dataHtml +='<div class="comments js_comments_module" style="display:'+showblock+'">';
									dataHtml +='<ul class="comment_list js_comment_list" data-index="'+dCont[i].postId+'"></ul>'+
												'<div class="page_wrap_no_b js_comment_page_wrap">'+
													'<div class="page js_commont_page" style="display:none;">'+
													'</div>'+
													'<a class="comment_num_btn js_comment_num_btn" data-num="'+discussNum+'" data_replyid="'+dCont[i].postId+'">全部'+discussNum+'条回复</a>'+
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
											
										//回复功能--结束
								dataHtml +='</div>';
								dataHtml +='</div>';
								
							}
						}
                    }
					if ($(".js_sub_forum").html() == '') {//空页面追加内容
						$(".js_firstPost").append(threadHtml);
						$(".js_replyFPost").append(dataHtml);
					}else {
						if (pageIndex == 1) {//浏览第一页替换页面结构
							$(".js_firstPost").html(threadHtml);
							$(".js_replyFPost").html(dataHtml);
						} else {//其他页码追加内容
							$(".js_replyFPost").append(dataHtml);
						}
					}
					flag = true;
					var totalPage=parseInt(data.data.count)/20;
					var defaultIndex=1;
					totalPage=totalPage > 0 && totalPage<defaultIndex ? defaultIndex : Math.ceil(totalPage);
					if (pageIndex == totalPage) {
						flag = false;
						if($(".js_replyFPost").html()==''){
							$(".js_sub_forum").append('<p class="nolist">还没有任何回帖哦~需要你的火力支援</p>')
						}else{
							$(".js_sub_forum").append('<p class="nolist">没有更多内容了</p>')
						}
						
					} else {						
						pageIndex = pageIndex + 1;//下一页
					}
					
				 $(".postFBorder").wrap('<div class="clickShowBox"></div>')
				 //超过屏幕缩放图片尺寸
					var width_screen=screen.width;
					$(".js_content").find("img:not(.emotion)").each(function(){    
					var img = $(this);
						var realWidth;//真实的宽度
						//这里做下说明，$("<img/>")这里是创建一个临时的img标签，类似js创建一个new Image()对象！
						$("<img/>").attr("src", $(img).attr("_src")).load(function() {
							realWidth = this.width;
								if(realWidth>width_screen){
									img.css("width", '100%'); 
								}
							});
						});
				},
				complete: function () {
					_this.postTagSizeFn();
					_this.loadForumCommentListFn();//每个回帖评论列表加载
					$(document).imgLazyLoadExcuteFn(".js_content img:not(.emotion)"); //图片顶部靠近屏幕底部开始加载
					document.title=$(".js_replyF_info:eq(0)").find(".title h2").text()+"-道可道论坛";
				}
			})
			}
		},
        //详细页帖子内容图片默认不加载处理
        forumInfoImgFn:function(data){
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
        //主贴区域
        subForumAreaFn:function(data){
        	var _this=this;
            var d = data.data;
			var dCont = d.posts;
            var tagStr = d.tags.split(",");
            var id = $(document).getLinkParamFn("id");
            var getTitle=$(document).filterDevKeywordFn(d.title);//标题返回值过滤
			var clearContent = _this.forumInfoImgFn(dCont[0].content);
				clearContent = $(document).canBeTrustStrFn(clearContent);  //修复播放器插件地址被过滤掉get
			var videoImg=_this.videoShowImgFn(clearContent);
			var headPic=$(document).filterDevKeywordFn(dCont[0].headPic);
			var nikeName=$(document).filterDevKeywordFn(dCont[0].nikeName);
			var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
			var names = !nikeName?"呀！跑路啦！":nikeName; //昵称
			var js_userClass = !nikeName?"nikeDefaultF":"js_checkEveryUserInfo";
			//游戏信息  大区   服务器  角色
			var gameInfoStr = dCont[0].areaName ? '<span class="t_server">' + dCont[0].areaName + '</span>|<span class="t_qz">' + dCont[0].server + '</span>|<span class="t_nickNmae">' + dCont[0].role + '</span>' : "暂无游戏信息";
         	//组装主贴信息
            var subFHtml = ''+
			'<div class="info_f js_replyF_info firstPost">'+
			'<div class="floorHash" id='+dCont[0].postId+'></div>'+
			'<div class="user_info">';
			if(dCont[0].threadStarter){
				subFHtml += '<span class="lz">楼主</span>';
			}
	subFHtml+='<img src="'+pics+'" alt="头像" class="headImg '+js_userClass+'"  data-userinfoid="'+dCont[0].id+'">';
	
	subFHtml+='<span class="t_nickUser '+js_userClass+'"  data-userinfoid="'+dCont[0].id+'">'+names+'</span>'+
			'<section class="serverWrap">'+gameInfoStr+'</section>' + 
			'</div>'+
			'<div class="forum_info">'+
				'<div class="top_tools">'+
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
                        	_this.getDescription(id)
                        }
            
                subFHtml+='</div>'+
                    '<div class="tags">';
					for(var i =0,l= tagStr.length;i<l;i++){  //主贴标签
						subFHtml+='<span>'+$(document).filterDevKeywordFn(tagStr[i])+'</span>';
					}
            subFHtml+='</div>';
               subFHtml+='<section class="times">'+dCont[0].dateString+'</section>'
			   if(dCont[0].isLike){ //点赞状态
					subFHtml +='<a class="js_zan_forums zan on" data_replyid="'+dCont[0].postId+'">'+dCont[0].likeNum+'&nbsp;赞</a>';
				}else{
					subFHtml +='<a class="js_zan_forums zan" data_replyid="'+dCont[0].postId+'">'+dCont[0].likeNum+'&nbsp;赞</a>';
				} 
				subFHtml +='</div></div>';
				var showContent= videoImg.videoArr ? videoImg.videoArr[0]+videoImg.contentStr:clearContent;

					subFHtml +='<div class="content js_content">'+showContent+'</div></div></div>';//视频展示内容
					subFHtml+='<section class="replyPostsNum">回帖&nbsp;('+data.data.replyPosts+')</section>';
				return subFHtml;           
        },
        //帖子（不区分主贴和回帖）踩 和 赞
        caiAndZanForumsWapFn:function(){
        	var _this = this;
        	//赞 按钮
        	$(document).on("click",".js_zan_forums",function(){
        		var $this = $(this);
        		_this.caiAndZanAjaxWapFn($this,1);
        	});
        	//踩 按钮
        	$(document).on("click",".js_cai_forums",function(){
        		var $this = $(this);
        		_this.caiAndZanAjaxWapFn($this,2);
        	});
        },
        //帖子（不区分主贴和回帖）踩 和 赞 ajax
        caiAndZanAjaxWapFn:function(obj,type){ 
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
						
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
        	});
        },
		joinHTMLFn:function(dCont){
        	var dataHtml = "";
        	for (var i = 0; i < dCont.length; i++) {
            	if(dCont[i].isShow){  //帖子文字过滤已通过
            		var commentContent = dCont[i].content;
                	commentContent = $(document).filterDevKeywordFn(commentContent);  //过滤脚本关键字
                	commentContent = $(document).deleteLabelFn("div",commentContent); //过滤div 避免影响帖子展示页
                	var nikeName=$(document).filterDevKeywordFn(dCont[i].nikeName);//过滤返回值
                	var toNikeName=$(document).filterDevKeywordFn(dCont[i].toNikeName);
                	
            		var names = !$(document).nicknameCompleCode(nikeName)?"呀！跑路啦！":$(document).nicknameCompleCode(nikeName); //昵称
            		var js_userClass = !$(document).nicknameCompleCode(nikeName)?"nikeDefaultF":"js_checkEveryUserInfo";
            		var namesTo = !$(document).nicknameCompleCode(toNikeName)?"呀！跑路啦！":$(document).nicknameCompleCode(toNikeName); //回复对象昵称
            		
            		var js_userClassTo = !$(document).nicknameCompleCode(toNikeName)?"nikeDefaultF":"js_checkEveryUserInfo"; //回复对象class
            	
							if(names.length>9){
							   names=names.substring(0,6)+"...";
							}
							if(namesTo.length>9){
							   namesTo=namesTo.substring(0,6)+"...";
							}
					dataHtml += ''+
                		'<li class="commentListLi">'+
	                		'<div class="commentListWrap">'+
                            '<div class="comment_con">'+
                                '<div class="con">'+
                                	'<a href="javascript:;" target="_blank" class="'+js_userClass+'" data-userinfoid="'+dCont[i].id+'" >'+names+'</a>';
                                	if(dCont[i].toNikeName!==null){
                                		dataHtml +='<span>回复</span><a href="javascript:;" target="_blank"  class="'+js_userClassTo+'" data-userinfoid="'+dCont[i].toId+'">'+namesTo+'</a>';
	                                	}	
	                                	dataHtml +='：'+commentContent+
	                            	'</div>'+
	                            '</div>'+
	                         '</div>'  
                            
					  dataHtml+='</div>'+
                        '</div>'+
                        '</li>';
                    
            	}
                
            }
        	return dataHtml;
			
        },

		//加载回帖列表每个回帖评论列表
        loadForumCommentListFn:function(){
        	var _this = this;
        	$(".js_comment_list").each(function(){
        		var $this = $(this);
        		var commentNum = $this.parents(".js_replyF_info").find(".js_comments_btn").attr("data-num"); //当前回帖评论数
        		//如果当前回帖评论数为0，不再请求评论列表接口
        		if(parseInt(commentNum)>0){
        			_this.loadForumCommentListAjaxFn($this);
        		}

        	});
        },
		//加载评论列表Ajax函数
        loadForumCommentListAjaxFn:function(commListWrap){
        	var _this = this;
        	$.ajax({
    			url:getCommentListUrl,
    			type:"get",
    			dataType:"json",
    			async:false,
    			data:{
    				r:Math.random(),
    				threadId: $(document).getLinkParamFn("id"),
                    postId:commListWrap.attr("data-index"), //属性data-index为回帖id
                    pageIndex: 1,
                    pageSize:2
    			},
    			success:function(data){
    				var dCont = data.data;
    				
    				var commentStr = _this.joinHTMLFn(dCont); 
    				commListWrap.html(commentStr); //初始加载页面渲染评论列表
    				if(parseInt(data.count)>2){ //回帖评论条数大于两条，评论条数按钮可点击
    					commListWrap.parents(".js_comments_module").find(".js_comment_num_btn").addClass("cur");
    				}else{ //回帖评论条数小于等于两条时，评论条数按钮不可点击
    					commListWrap.parents(".js_comments_module").find(".js_comment_num_btn").removeClass("cur");
    				}
    				commListWrap.parents(".js_comments_module").find(".js_comment_num_btn").show().html("全部"+data.count+"条回复");
    				
    			}
    		});
        },
		//下拉刷新列表
        newList: function () {
            var _this = this;
            $(window).scroll(function () {
                //刷新数据
                var scrollTop = $(this).scrollTop();//滚动条向上的距离
                var windowHeight = $(this).height();//可视窗口高度
                var scrollHeight = $(document).height();//文档高度                
				if ($(".js_sub_forum").html() == '') {
					 //禁止重复调用
				}else{
					if (scrollHeight - scrollTop - windowHeight*1.5 < 0) {
						if ($(".nolist").is(":visible")) {						
							//最后一页不刷新
						} else {
							flag?_this.threadListAjax():"";
						}
					}
				}
                
            })

        },

		//大图滑动切换
     listImg: function () {
			$(document).on("click", ".js_content img", function () {
				if($(this).hasClass("emotion")||$(this).hasClass("videoShowImg")){
					//点击的是表情,视频占位图
				}else{
			     if (!$(".swiper-container").length) {
					$("body").append(htmlswiper);
				}
				var htmlList = "";
				var imgShow = $(this).parent().parent(".js_content");
				var imgShowLength =imgShow.find("img:not(.emotion,.videoShowImg)");//当前图片集长度
				
				var index = imgShowLength.index(this);//获取点击图片索引值
			
				for (var i = 0; i < imgShowLength.length; i++) {
					var imgSrc = imgShowLength.eq(i).attr("_src");
					var winIndexof2 = imgSrc.indexOf('?imageView2/2/w/576');//含有处理过的标识
					var urlStr2=imgSrc.substring(0,winIndexof2);//截取?imageView2/2/w/576后的地址
					htmlList += '<div class="swiper-slide" data-swiper-slide-index="'+ i+'">'+
									'<div class="swiper-zoom-container">'+
									'<img src="'+ urlStr2+'">'+
									'</div>'+
								'</div>'
                          }
                 $(".swiper-wrapper").html(htmlList);
				$(".swiper-container,.blackBox").show();
				$(".blackBox").css("opacity","1")
				var swiper = new Swiper('.swiper-container', {
						zoom: true,
						loop: false,
						pagination: {
							el: '.swiper-pagination',
							type: 'fraction',
						}
					});
					swiper.slideToLoop(index, 10, false);//定位到指定展示图
                    
					//关闭图片弹层
					$(document).on("click", ".swiper-container", function () {
						$(".blackBox,.swiper-container").hide();
						$(".swiper-container").remove();
					})	
			    }
				
			}) 
             
         },
		 //点击跳转评论详情页面
		 replyFun:function(){
			 $(".js_sub_forum").on('click','.user_info,.forum_info,.postFBorder a',function(e){
				var obj2 = e.target;
				if(obj2.src){
					if($(obj2).hasClass("js_checkEveryUserInfo")){
						e.stopPropagation();
					}
				}else{
					e.stopPropagation();
				}
  			 });
			 $(".js_sub_forum").on('click','.postFBorder',function(e){
					e = window.event || e; 
					var obj = $(e.srcElement || e.target);
					if(!$(obj).is($(".js_content img:not(.emotion,.videoShowImg)")) ){
						var threadId = $(document).getLinkParamFn("id");//主帖Id
						var postId=$(this).parents(".clickShowBox").children(".postFBorder").children(".floorHash").attr("id") //帖子id
						window.location.href="http://dao.gyyx.cn/forum/comment/index?threadId="+threadId+"&postId="+postId;
					}
				
		    });
		 }
		 
    };
    window.DaoForumInfo = DaoForumInfo;
})();
$(function(){
	var daoForumInfo=new DaoForumInfo();
	daoForumInfo.init();
})

