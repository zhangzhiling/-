/*-------------------------------------------------------------------------
 * 作者：dongchunshui
 * 创建时间： 2017/11/13
 * 版本号：v1.0
 * 作用域：用户中心-个人中心
 *
 -------------------------------------------------------------------------*/
(function(){
	
	/*====================接口-开始===================*/
	
	var getuserFollowListAllUrl = "/user/follow/ta/friends";  	//获取他人关注接口 
	var getFansUrl="/user/follow/ta/fans";							//获取他的粉丝关注接口
	
	var getMyFollowUrl = "/user/profile/meFollow";  		//获取我的关注列表接口 
	var getFollowMesUrl="/user/profile/followMe";						//获取关注我的列表接口
	
	/*====================接口-结束===================*/
	
	function UserFollowList(){
		//Constructor
	}
	UserFollowList.prototype={
		init:function(){
			var _this=this;
			_this.followListEnterBtnFn();
		},
		//关注好友列表入口按钮
		followListEnterBtnFn:function(){
			var _this = this;
			$(document).off("click",".js_followUser").on("click",".js_followUser",function(){
				var $this = $(this)
				if(!$this.hasClass("cur")){
					$(this).siblings().removeClass("cur").end().addClass("cur");
					_this.followListTypeConfFn($this);
				}
			})
		},
		followListTypeConfFn:function(obj){
			var _this = this;
			var listType = obj.attr("data-followType");  //加载列表类型 hisFollow：他的关注列表，followHe：他的粉丝列表，myFollow：我的关注列表，followMe：我的粉丝列表
			var listOpra = {};  //列表函数参数
			switch(listType){
				case 'hisFollow':
					listOpra = {
						url:getuserFollowListAllUrl,
						str:'TA还没有关注任何好友'
					}
					break;
				case 'followHe':
					var userId=$(document).getLinkParamFn("id");
					var fansStr='还没有人关注TA，<a href="javascript:void(0)" data-userinfoid="'+userId+'" class="followFansBtn js_followBtn" data-insertHtml="true" data-status="true">点击关注</a>'
					listOpra = {
						url:getFansUrl,
						str:fansStr
					}
					break;
				case 'myFollow':
					listOpra = {
						url:getMyFollowUrl,
						str:'您还没有关注任何好友，快去关注吧'
					}
					break;
				case 'followMe':
					listOpra = {
						url:getFollowMesUrl,
						str:'您还没有任何好友关注，快去发帖吧'
					}
				    break;
			        default:
			}
			_this.followList(listOpra);
		
		},
	    //TA的关注、TA的粉丝,我的关注、我的粉丝列表
		followList:function(obj){
			$(".js_allMs").ajaxPage({
                url:obj.url,
                type: "GET",
                pageObj: $("#tieInfo_Table_0_paginate"),
                pageIndex: 1,
                pageSize: 10,
                curPageCls: "paginate_active",
                pageInfo: {
                    obj: $("#tieInfo_Table_0_info"),
                    content: ""
                },
                paramObj: {
                	//传参
                    id:$(document).getLinkParamFn("id")
                },
                clickFn:function(){
                	$(window).scrollTop(425)
                },
                dataFn: function (d) {
                	var htmlLi="";
                	$(".js_allMs").html("");
                	$(".comingSoon").show();
                     if(d.status=="success"){
                    	 var datas=d.data;
                    	 if(datas&&datas.length>0){
                    		 $(".comingSoon").hide();
                    		 $(".pageCut,.js_allMs").css("display","block");
                    		 for(var i=0,l =datas.length ;i<l;i++){
                    			 //拼接关注列表字符串
                    			 htmlLi += userFollowList().followListHtmlStrFn(datas[i]);
                    		 }
                    	 }else{
                    		 $(".pageCut,.js_allMs").hide();
                    		 $(".comingSoon").html(obj.str).css("display","block");
                    	 }
                     }else{
                    	 //错误提示语
                    	 $(document).errorDataOperateFn(d);
                     }
                     return htmlLi;
                }
            });
			
		},
		followListHtmlStrFn:function(data,followType){
			var htmlStr = "";
			var nickName=data.nickName?global_main.globalFn.nicknameCompleCode(data.nickName):"";//昵称
			var fansAmount=data.fansAmount?data.fansAmount:"0";//粉丝量
			var postCount=data.postCount?data.postCount:"0";//发帖量
			var replyCount=data.replyCount?data.replyCount:"0";//回帖量
			var gameInfoStr=data.areaName?data.areaName+'<span class="followLine">|</span>'+data.serverName+'<span class="followLine">|</span>'+data.roleName:"暂无游戏信息";//游戏信息  大区   服务器  角色
			var avatarUrl=data.avatarUrl?data.avatarUrl:"http://img.gyyxcdn.cn/dao/user/images/peop2.png";
			var userId=data.daoUserId;
			var followStatus=followType?"notFollowed":data.followStatus;//关注状态
			
			var followBtnHtmlStr = "";  //关注相关按钮
			if(followStatus=="notFollowed"){
				followBtnHtmlStr+='<a class="followAdd js_followBtn" data-userinfoid="'+userId+'" data-insertHtml="false" data-status="true">加关注</a>'+
		       					'<a class="followIng js_followedBtn" data-userinfoid="'+userId+'" style="display:none;">已关注</a>'+
		       					'<a class="eachOther js_follow_eachBtn" data-userinfoid="'+userId+'" style="display:none;">互相关注</a>'+
		       					'<a class="followdel js_followRemoveBtn" data-userinfoid="'+userId+'" data-insertHtml="false" style="display:none;" data-status="true">取消关注</a>';
           	}else if(followStatus=="followed"){
           		followBtnHtmlStr+='<a class="followAdd js_followBtn" data-userinfoid="'+userId+'" data-insertHtml="false" data-status="true" style="display:none;">加关注</a>'+
								'<a class="followIng js_followedBtn" data-userinfoid="'+userId+'">已关注</a>'+
								'<a class="eachOther js_follow_eachBtn" data-userinfoid="'+userId+'" style="display:none;">互相关注</a>'+
								'<a class="followdel js_followRemoveBtn" data-userinfoid="'+userId+'" data-insertHtml="false" style="display:none;" data-status="true">取消关注</a>';
           	}else if(followStatus=="eachOther"){
           		followBtnHtmlStr+='<a class="followAdd js_followBtn" data-userinfoid="'+userId+'" data-insertHtml="false" data-status="true" style="display:none;">加关注</a>'+
								'<a class="followIng js_followedBtn" data-userinfoid="'+userId+'" style="display:none;">已关注</a>'+
								'<a class="eachOther js_follow_eachBtn" data-userinfoid="'+userId+'">互相关注</a>'+
								'<a class="followdel js_followRemoveBtn" data-userinfoid="'+userId+'" data-insertHtml="false" style="display:none;" data-status="true">取消关注</a>';
           	}
			
			htmlStr+='<li class="follow_list">'+
			           	'<a target="_blank" href="/user?id='+userId+'" class="lf followHeaderImg"><img src="'+$(document).filterDevKeywordFn(avatarUrl)+'" /></a>'+
			           	'<div class="lf followContent">'+
			           		'<a target="_blank" href="/user?id='+userId+'" class="followTitle">'+nickName+'</a>'+
			           		'<div class="followFans">粉丝：<span data-userinfoid="'+userId+'" class="js_follow_num">'+fansAmount+'</span></div>'+
			           		'<div class="followAllNum">'+
			               		'发帖量：<span class="followNum">'+postCount+'</span>'+
			               		'回帖量：<span class="followNum">'+replyCount+'</span>'+
			           		'</div>'+
			           		'<div class="followNickName">'+gameInfoStr+'</div>'+
			           	'</div>'+
			           	'<div class="lf followGroupBtn">'+
			           		'<a href="/user?id='+userId+'" target="_black" class="followLink">个人主页</a>';
						
				htmlStr += '<div class="followBtn js_follow_btn_wrap" data-userinfoid="'+userId+'">'+followBtnHtmlStr+
						   		'<p class="follow_suc_tip js_follow_suc">关注成功！</p>'+
					   	   '</div>'+		
			           	'</div>'+
			           '</li>';
			return htmlStr;
		}
	}
    //关注状态操作;
	window.userFollowList = function(){
		return new UserFollowList();
	};
})()

$(function(){
	//动态二级分类展示
	
	$(".js_followTab li").click(function(){
		userFollowList().init();//粉丝关注列表
	});
});
