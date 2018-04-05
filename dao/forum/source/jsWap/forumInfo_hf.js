(function(){
	var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")[^>]+(>|\/>)','g'); //图片个数正则表达式(不包含表情)
	var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)', 'g');  //视频个数正则表达式
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
    '</div>'
  
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
			if (!$(".swiper-container").length) {
                $("body").append(htmlswiper);
  			}
			_this.iconPcFun();
        },
         iconPcFun:function(){
			if (!$(".iconPc").length) {
                $("body").append('<a href="javascript:;" class="iconPc" flag ="true"></a>');
				$(document).on("click", ".iconPc", function () {
						var iconPc = '&isPc=true';
						//获取主帖Id
						var threadId = $(document).getLinkParamFn("threadId");
						window.location.href="http://dao.gyyx.cn/forum/thread?id="+threadId +iconPc;
				})
            }
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
        			}
        		},
				complete: function () {
					_this.postTagSizeFn();
				},
				error:function(){
					$(document).errorDataOperateFn;
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
			$.ajax({
				 url: getCommentListUrl,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        threadId: $(document).getLinkParamFn("threadId"),
						postId:$(document).getLinkParamFn("postId"), //属性data-index为回帖id
						pageIndex: 1,
						pageSize:20
                    },
                    beforeSend: function () {
                        $(".js_sub_forum").siblings("p").html('正在加载').show();
                        $(".lastPage").hide();
						$(document).errorDataOperateFn;
                    },
                    success: function (data) {
						$(".lastPageShua").hide();
						var dataHtml ="";
						var threadHtml = "";
						
						if(data.data!=null){
						 var dCont = data.data[0];//数据内容			
							if(dCont.postInfoViewModel.isShow){  //帖子文字过滤已通过
								//回帖区域主内容	
									threadHtml +=_this.subForumAreaFn(data);//1楼展示内容,主贴区域
								//回复内容功能--开始;
									var showblock=parseInt(dCont.postInfoViewModel.discussNum)>0?"block":"none";//评论区域
									dataHtml +='<div class="comments js_comments_module js_commentBox" style="display:'+showblock+'">';
									dataHtml +='<ul class="comment_list js_comment_list" data-index="'+dCont.postId+'"></ul>'+
												'<div class="page_wrap_no_b js_comment_page_wrap">'+
													'<div class="page js_commont_page" style="display:none;">'+
													'</div>'+
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
											'</div></div>';
								//回复功能--结束
						}
						$(".js_firstPost").html(threadHtml);
						$(".js_replyFPost").html(dataHtml);
						  //如果当前回帖评论数为0，不再请求评论列表接口
							var commentNum = $(".js_replyF_info").attr("data-num"); //当前回帖评论数
							if(parseInt(commentNum)>0){
								_this.loadForumCommentListAjaxFn();//每个回帖评论列表加载
							}else{
								$(".js_replyFPost").append('<p class="wordTs">还没有任何回复哦~需要你的火力支援</p>');
							}
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
						}
						
				},
				complete: function () {
					_this.postTagSizeFn();
					$(document).imgLazyLoadExcuteFn(".js_content img:not(.emotion)"); //图片顶部靠近屏幕底部开始加载
				}
			})
			
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
			var d = data.data[0].postInfoViewModel;
			document.title = data.count+'条回复';
			var clearContent = _this.forumInfoImgFn(d.content);
				clearContent = $(document).canBeTrustStrFn(clearContent);  //修复播放器插件地址被过滤掉get
			var videoImg=_this.videoShowImgFn(clearContent);
			var headPic=$(document).filterDevKeywordFn(d.headPic);
			var nikeName=$(document).filterDevKeywordFn(d.nikeName);
			var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
			var names = !nikeName?"呀！跑路啦！":nikeName; //昵称
			var js_userClass = !nikeName?"nikeDefaultF":"js_checkEveryUserInfo";
			//游戏信息  大区   服务器  角色
			var gameInfoStr = d.areaName ? '<span class="t_server">' + d.areaName + '</span>|<span class="t_qz">' + d.server + '</span>|<span class="t_nickNmae">' + d.role + '</span>' : "暂无游戏信息";
         	//组装主贴信息
            var subFHtml = ''+
			'<div class="info_f js_replyF_info firstPost" data-num="'+d.discussNum +'">'+
			'<div class="floorHash" id='+d.postId+'></div>'+
			'<div class="user_info">';
			if(d.threadStarter){
				subFHtml += '<span class="lz">楼主</span>';
			}
			subFHtml+='<img src="'+pics+'" alt="头像" class="headImg '+js_userClass+'"  data-userinfoid="'+d.id+'">';
	
			subFHtml+='<span class="t_nickUser '+js_userClass+'"  data-userinfoid="'+d.id+'">'+names+'</span>'+
			'<section class="serverWrap">'+gameInfoStr+'</section>' + 
			'</div>'+
			'<div class="forum_info">'+
				'<div class="top_tools">'+
                '<div class="l">'+
                    '<div class="title">';
                subFHtml+='</div>';
                    
				var floorNum=parseInt(d.floor)+'L<span class="floorNum">|</span>';//展示楼层数
				subFHtml +='<section class="times" style="padding: 0 0 0 1rem;;">'+floorNum+d.dateString+'</section>';//发布时间
              // subFHtml+='<section class="times" >'+d.dateString+'</section>'
			   if(d.isLike){ //点赞状态
					subFHtml +='<a class="js_zan_forums zan on" data_replyid="'+d.postId+'">'+d.likeNum+'&nbsp;赞</a>';
				}else{
					subFHtml +='<a class="js_zan_forums zan" data_replyid="'+d.postId+'">'+d.likeNum+'&nbsp;赞</a>';
				} 
				subFHtml +='</div></div>';
				var showContent= videoImg.videoArr ? videoImg.videoArr[0]+videoImg.contentStr:clearContent;

					subFHtml +='<div class="content js_content" style="padding-left: 1rem;">'+showContent+'</div></div></div><div class="commentNum"><b class="js_commentNum">'+ data.count+'</b>条回复</div>';//视频展示内容
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
    				threadId:$(document).getLinkParamFn("threadId"),
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
	
		//加载评论列表Ajax函数
        loadForumCommentListAjaxFn:function(){
			if (flag) {
                //进行请求数据
                flag = false;
			$.ajax({
    			url:getCommentListUrl,
    			type:"get",
    			dataType:"json",
    			data:{
    				r:Math.random(),
    				threadId: $(document).getLinkParamFn("threadId"),
                    postId:$(document).getLinkParamFn("postId"), //属性data-index为回帖id
                    pageIndex:pageIndex,
                    pageSize:20
    			},
				 beforeSend: function () {
                        $(".js_sub_forum").siblings("p").html('正在加载').show();
                        $(".lastPage").hide();
						$(document).errorDataOperateFn;
                    },
    			success:function(data){
					$(".lastPageShua").hide();
					var dataHtml_list="" ;//列表内容数据追加区
					
					if(data.data!=null){
					var dCont = data.data;//数据内容	
					for (var i = 0; i < dCont.length; i++) {
						if(dCont[i].isShow){  //帖子文字过滤已通过
						var headPic=$(document).filterDevKeywordFn(dCont[i].headPic)
						var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
						var commentContent = dCont[i].content;
						commentContent = $(document).filterDevKeywordFn(commentContent);  //过滤脚本关键字
						commentContent = $(document).deleteLabelFn("div",commentContent); //过滤div 避免影响帖子展示页
						var nikeName=$(document).filterDevKeywordFn(dCont[i].nikeName);//过滤返回值
						var toNikeName=$(document).filterDevKeywordFn(dCont[i].toNikeName);
						var names = !$(document).nicknameCompleCode(nikeName)?"呀！跑路啦！":$(document).nicknameCompleCode(nikeName); //昵称
						var js_userClass = !$(document).nicknameCompleCode(nikeName)?"nikeDefaultF":"js_checkEveryUserInfo";
						var namesTo = !$(document).nicknameCompleCode(toNikeName)?"呀！跑路啦！":$(document).nicknameCompleCode(toNikeName); //回复对象昵称
						var js_userClassTo = !$(document).nicknameCompleCode(toNikeName)?"nikeDefaultF":"js_checkEveryUserInfo"; //回复对象class
						
						//游戏信息  大区   服务器  角色
						var gameInfoStr = dCont[i].areaName ? '<span class="t_server">' + dCont[i].areaName + '</span>|<span class="t_qz">' + dCont[i].server + '</span>|<span class="t_nickNmae">' + dCont[i].role + '</span>' : "暂无游戏信息";
						//评论回复内容	
						dataHtml_list +='<li class="commentListLi">'+
								'<div class="commentListWrap">'+
								'<div class="user_info">';
								dataHtml_list +=dCont[i].threadStarter ? '<span class="lz">楼主</span>' : "";
								dataHtml_list+='<img src="'+pics+'" alt="头像" class="headImg '+js_userClass+'"  data-userinfoid="'+dCont[i].id+'">';
								
								dataHtml_list+='<span class="t_nickUser '+js_userClass+'"  data-userinfoid="'+dCont[i].id+'">'+names+'</span>'+
										'<section class="serverWrap">'+gameInfoStr+'</section>' + 
										'</div>'+
										'<div class="forum_info">'+
											'<div class="top_tools">';
											//评论数大于0展示评论列表
											var replyCont = parseInt(dCont[i].count) > 0 ? "收起回复" : "回复";
											var replyCont_on = parseInt(dCont[i].count) > 0 ? "on" : "";
											dataHtml_list +='<div class="replay_con '+replyCont_on+'">'+
														'<a class="replay js_comments_btn" data-num="'+data.count+'" data_replyid="'+dCont[i].postId+'">'+replyCont+'</a>';
											dataHtml_list +='</div>';
											dataHtml_list +='<section class="times">'+dCont[i].dateString+'</section>';//发布时间
											if(dCont[i].isLike){ //点赞状态
												dataHtml_list +='<a class="js_zan_forums zan on" data_replyid="'+dCont[i].postId+'">'+dCont[i].likeNum+'&nbsp;赞</a>';
											}else{
												dataHtml_list +='<a class="js_zan_forums zan" data_replyid="'+dCont[i].postId+'">'+dCont[i].likeNum+'&nbsp;赞</a>';
											} 
												dataHtml_list +='</div>';		                  
										dataHtml_list +='</div>';
								'<a href="javascript:;" target="_blank" class="imgLink"><img src="'+pics+'" class="nike_img '+js_userClass+'" data-userinfoid="'+dCont[i].id+'" ></a>'+
								'<div class="comment_con">'+
									'<div class="con">';
										if(dCont[i].toNikeName!==null){
											dataHtml_list +='<div style="padding-left:1rem;"><span style="float:left;">回复</span><a href="javascript:;" target="_blank"  class="'+js_userClassTo+'" data-userinfoid="'+dCont[i].toId+'">'+namesTo+'：</a>';
										}else{
											dataHtml_list +='<div style="padding-left:1rem;">';
										}	
										dataHtml_list +=commentContent+'</div>'+
										'</div>'+
									'</div>'+
								'</div>'  
								
						dataHtml_list+='</div>'+
							'</div>'+
							'</li>';
					}
					
				}

				   if ($(".js_comment_list").html() == '') {//空页面追加内容
						$(".js_comment_list").append(dataHtml_list);
					}else {
						if (pageIndex == 1) {//浏览第一页替换页面结构
							$(".js_comment_list").html(dataHtml_list);
						} else {//其他页码追加内容
							$(".js_comment_list").append(dataHtml_list);
						}
					}
					flag = true;
					if (pageIndex == data.totalPage) {
						flag = false;
						$(".js_sub_forum").append('<p class="nolist">没有更多内容了</p>')
					} else {						
						pageIndex = pageIndex + 1;//下一页
					}
				}else{
					//没有评论
					$(".js_comment_list").html('还没有任何回复哦~需要你的火力支援');
				}
        			
    			},
				error:function(){
					$(document).errorDataOperateFn;
				}
    		});
			}
        	
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
						if ($(".nolist").is(":visible")||$(".js_comment_list").html()=='') {					
							//最后一页不刷新
						}else{
							flag?_this.loadForumCommentListAjaxFn():"";
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
    };
    window.DaoForumInfo = DaoForumInfo;
})();
$(function(){
	var daoForumInfo=new DaoForumInfo();
	daoForumInfo.init();
})

