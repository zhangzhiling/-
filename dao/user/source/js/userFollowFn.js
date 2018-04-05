/*
 * add by tht 2017-11-14
 * for user follow  function
 */
/*=======================update log start=====================*/

/*=======================update log end=====================*/
(function(){
	/*====================接口-开始===================*/
	
	var followUserUrl = "/user/profile/follow";  //关注接口
	var removeFollowUserUrl = "/user/profile/follow/cancel";  //取消关注接口
	
	/*====================接口-结束===================*/
	
	function FollowUser(){
		//Constructor
	}
	FollowUser.prototype = {
		init:function(){
			var _this =this;
			
			//关注按钮
			_this.followBtnFn();
			//取消按钮展现效果
			_this.followRemoveBtnAnimateFn()
			//取消关注按钮
			_this.removeFollowUserFn();
		},
		//关注按钮功能
		followBtnFn:function(){
			var _this = this;
			$(document).off("click",".js_followBtn").on("click",".js_followBtn",function(){
				var $this = $(this);
    			if($this.attr("data-status")=="true"){
    				
    				var userId = $this.attr("data-userinfoid")?$this.attr("data-userinfoid"):$(document).getLinkParamFn("id"); //关注用户ID
    				
    				$.ajax({
        				url:followUserUrl,
        				type:"post",
        				dataType:"json",
        				data:{
        					r:Math.random(),
        					followDaoId:userId,
        					isNeedData:$this.attr("data-insertHtml")
        				},
    					beforeSend:function(){
    						$this.attr("data-status","false");
    					},
        				success:function(d){
        					$this.attr("data-status","true");
        					if(d.status=="success"){
        						
        						$this.hide(); //关注按钮隐藏
        						
        						if(d.data.followStatus=="followed"){  //已关注
        							
        							$this.siblings(".js_followedBtn").show();
        												 
        						}else if(d.data.followStatus=="eachOther"){ //互相关注
        							
        							$this.siblings(".js_follow_eachBtn").show();
        							
        						}
        						//成功动画
        						if($this.siblings(".js_follow_suc").length){
        							$this.siblings(".js_follow_suc").animate({
            							"opacity":"1"
            						},1000,function(){
            							$(this).animate({
            								"opacity":"0"
            							},1000);
            						});
        						}
        						//关注成功后相同信息改变
        						_this.followSucSameInfoChangeFn(d.data.followStatus,userId);
        						if($this.attr('data-insertHtml')=="true"){
        							//他人中心特殊按钮-需要前端自行追加数据
            						_this.appendHtmlToList(d.data,"notFollowed");
        						}
        						
        						
        					}else{
        						$(".js_sourceForNicePic").hide();//名片隐藏
        						$(document).errorDataOperateFn(d);	
        					}
        				},
        				error:function(){
        					$this.attr("data-status","true");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}
				
			});
		},
		//取消关注
		removeFollowUserFn:function(){
			var _this=this;
			$(document).off("click",".js_followRemoveBtn").on("click",".js_followRemoveBtn",function(){
				var $this=$(this);
				var userId=$this.attr("data-userinfoid")?$this.attr("data-userinfoid"):$(document).getLinkParamFn("id");
				if($this.attr("data-status")=="true"){
					$(document).popDeleteF({
						type:"open",
						tip:"确认要取消关注吗？",
						confirmFn:function(){
							$(document).popDeleteF({type:"close"}); //关闭删除弹层
							_this.removeFollowAjax($this,userId);				
						}
					});
					
				}
				
			})
		},
		//取消关注接口
		removeFollowAjax:function(obj,userId){
			var _this=this;
			$.ajax({
				url:removeFollowUserUrl,
    				type:"post",
    				dataType:"json",
    				data:{
    					r:Math.random(),
    					followDaoId:userId,
    				},
					beforeSend:function(){
						obj.attr("data-status","false");
					},
    				success:function(d){
    					obj.attr("data-status","true");
    					if(d.status=="success"){
    						obj.hide(); //取消关注按钮隐藏
    						//取消关注成功后相同信息改变
    						_this.followSucSameInfoChangeFn("removeFollow",userId);
    					}else{
    						$(".js_sourceForNicePic").hide();//名片隐藏
    						$(document).errorDataOperateFn(d);	
    					}
    				},
    				error:function(){
    					obj.attr("data-status","true");
    					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
    				}
			})	
		},
		//关注成功后页面中同一账号关注量、关注按钮状态改变
		followSucSameInfoChangeFn:function(btnStatus,userId){	//btnStatus：按钮关注状态
			
			//相同账号关注按钮改变状态
			$(".js_follow_btn_wrap").each(function(){
				
				var $this = $(this);
				
				if($this.attr("data-userinfoid")==userId){
					
					$this.find("a").hide();  
					
					if(btnStatus=="followed"){ //已关注
						
						$this.find(".js_followedBtn").show()
						
					}else if(btnStatus=="eachOther"){ //互相关注
						
						$this.find(".js_follow_eachBtn").show()
						
					}else if(btnStatus=="removeFollow"){
						$this.find(".js_followBtn").show()	//加关注
					}
				}
			});
			//相同账号关注量自加/减1
			$(".js_follow_num").each(function(){
				var $this = $(this);
				if($this.attr("data-userinfoid")==userId){
					var followNum=btnStatus=="removeFollow"?parseInt($this.text()) - 1:parseInt($this.text()) + 1
					$this.text(followNum);
				}
			});
			
		},
		//关注后添加假数据--只有他人中心中关注他的列表
		appendHtmlToList:function(data,followType){	//followType为追加关注类型
			//他人中心-他的粉丝列表已展示
			var heListShow = $(".js_followTab li.cur[data-followType='followHe']:visible").length;
			if(heListShow){
				$(".js_allMs").find(".follow_list").each(function(){
					var userinfoid=$(this).find(".js_follow_btn_wrap").attr("data-userinfoid");
					userinfoid==data.daoUserId?$(this).remove():"";
				})
				var htmlStr = userFollowList().followListHtmlStrFn(data,followType);
				$(".comingSoon").hide();
				$(".js_allMs").prepend(htmlStr).show();
			}
		},
		//取消按钮展现效果
		followRemoveBtnAnimateFn:function(){
			$(document).off("mouseenter",".js_followedBtn,.js_follow_eachBtn").on("mouseenter",".js_followedBtn,.js_follow_eachBtn",function(){
				var $this = $(this);
				$this.siblings(".js_followRemoveBtn").show();
			});
			$(document).off("mouseleave",".js_followRemoveBtn").on("mouseleave",".js_followRemoveBtn",function(){
				$(this).hide();
			});	
		}

	};
	window.followUser = function(){
		return new FollowUser();
	};
})();
$(function(){

	followUser().init();

});