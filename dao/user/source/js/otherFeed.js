/*-------------------------------------------------------------------------
 * 作者：maoxiangmin
 * 创建时间： 2017/7
 * 版本号：v1.0
 * 作用域：用户中心-他人页
 * 
 * 注:global_main->global.js
 -------------------------------------------------------------------------*/
;var otherDynamic_main=(function(){
	function otherDynamic_web(){
		/*
	     * 局部变量
	     */    
		var _this=this;
		
    var specificUser={
      "道姐":["url('http://img.gyyxcdn.cn/dao/user/images/daojieBgUser.jpg') no-repeat center top","光宇游戏","问道","社会你道姐","每分每秒都在活跃中","已经数不清楚了╮(╯_╰)╭","daojiebq"],
      "公告":["","光宇游戏","问道","官方公告","有公告的时候冒泡~","公告需要道行吗？","gonggaobq"]
    }
		
		  /*
	     * 接口定义
	     */
		this.otherDynamicPorts={
			//获取用户信息
		    userInfo:"/user/userInfo",
		    
		    //获取用户身份信息
		    title:"/user/title",
		    
		    //他人礼物
		    giftWall:"/user/giftWall",
		    
       //当前用户与他人的关注关系
       getAttentionRelation:"/user/follow/info"
		},
		
		/*
	     * 当页方法
	     */
		 this.otherDynamicFn={
				//获取用户信息
			    userInfo:function(otherId){
			    	$.ajax({
			    		    url: _this.otherDynamicPorts.userInfo,
		                    type: "GET",
		                    dataType:"json",
		                    data: {
		                    	     id:otherId,
		                    	     r:Math.random()
		                    	  },
		                    success:function(d){
		                    	
		                    	if(d.status=="success"){
		                    		if(d.data.avatarUrl){
		                    			var ataI=$(document).filterDevKeywordFn(d.data.avatarUrl)
		                    			$(".usLOther").attr("src",ataI);
		                    		}else{
                              $(".tc05 .headImg").attr("src","http://img.gyyxcdn.cn/dao/user/images/tc_tx.png");
                            }
		                    		var userNkN=d.data.nickname;
		                    		$(".usNOther").html(userNkN);
                            document.title =$(".usNOther").text()+"的个人中心";
                            
                            var otherIdInfo=specificUser[userNkN];
	                        		if(otherIdInfo){
	                        			if(otherIdInfo[0]){
	                        				$(".userCenterMain").css('background',otherIdInfo[0]);
	                        			}
                                $(".quzuOther").html(otherIdInfo[1]);
                                $(".serverOther").html(otherIdInfo[2]);
                                $(".roleOther").html(otherIdInfo[3]);
                                $(".activeOther").html(otherIdInfo[4]);
                                $(".daohangOther .dh").html(otherIdInfo[5]);
	                    			}else{
			                    		if(d.data.areaName){
                                  $(".quzuOther").html(d.data.areaName);
                                  $(".serverOther").html(d.data.serverName);
                                  $(".roleOther").html(d.data.roleName);
                                  $(".daohangOther .dh").html(d.data.daoheng);
                                  $(".activeOther").html(d.data.activity);
			                    		}else{
			                    			$(".gamesInfo").html("暂无信息").addClass("noOtherInfo");
			                    		}
	                    			}
		                    		
		                    	}
		                    }
			    	});
			    },
			    
			    //获取用户身份信息
			    title:function(otherId){
			    	$.ajax({
			    		    url: _this.otherDynamicPorts.title,
		                    type: "GET",
		                    dataType:"json",
		                    data: {
		                    	    id:otherId,
		                    	    r:Math.random()
		                    	  },
		                    success:function(d){
	                    	   if(d.status=="success"){
	                               var datas=d.data;
	                               if(datas.length>0){
	                            	   var shenfenDHtml="";
	                                   for(var i=0;i<datas.length;i++){	 
										   if(i==0){
	                                		   shenfenDHtml+='<span class="js_cur ituOther shenfenD'+datas[i].titleId+'"></span>';
	                                	   }else{
	                                		   shenfenDHtml+='<span class="ituOther shenfen0'+datas[i].titleId+'"></span>';
	                                	   }
	                                   }
	                                   $("#shenFenTypes").html(shenfenDHtml);
	                                   if(datas.length>7){
	                                	   $(".shenfes .yilun").css("visibility","visible");
	                                   }
	                               }else{
	                            	   if(global_main.globalFn.getLinkParamFn("id")==49){
	                            		   $(".shenfes .yilun").hide();
	                            		   $("#shenFenTypes").html('<span class="js_cur ituOther daojieSf"></span>');
	                            	   }else if(global_main.globalFn.getLinkParamFn("id")==12472){
	                            		   $(".shenfes .yilun").hide();
	                            		   $("#shenFenTypes").html('<span class="js_cur ituOther gonggaoSf"></span>');
	                            	   }else{
	                            		   $("#shenFenTypes").html("暂未获得任何身份").css({
		                            		   "line-height":"60px",
		                            		   "color":"#5eaeef"
		                            	   });
	                            	   }
	                               }
	                           }
		                    }
			    	});
			    },
			    
			    //他人礼物
			    giftWall:function(otherId){
			    	$.ajax({
		    		    url: _this.otherDynamicPorts.giftWall,
	                    type: "GET",
	                    dataType:"json", 
	                    data: {
	                    	    id:otherId,
	                    	    r:Math.random()
	                    	  },
	                    success:function(d){
	                    	if(d.status=="success"&&d.data){
	                    		var datas=d.data;
	                    			var gifLen=datas.length,
                    			    gifAll="";
	                    			if(gifLen>12){
	                    		    	gifLen=12;
	                    		    }
                    				for(var i=0;i<gifLen;i++){
                    					if(datas[i].giftId!=427&&datas[i].giftId!=428){
	                        				gifAll+='<li class="gi"><div class="fixdG"><img class="gPic lf" src="'+$(document).filterDevKeywordFn(datas[i].picUrl)+'" /><i class="giNum lf">';
											if(datas[i].giftCount>99){
	                        					gifAll+='99+</i></div>';
	                        				}else{
	                        					gifAll+=datas[i].giftCount+'</i></div>';
	                        				}
	                        				gifAll+='<p class="giName lf"><span class="nam">'+datas[i].giftName+'</span>x<span class="nms">'+datas[i].giftCount+'</span></p></li>'
                    					}
                        				
                        			}
	                    			$(".gitsInfo").removeClass("noGit").html(gifAll);
	                    	}else{
	                    		$(".gitsInfo").addClass("noGit").html("他还没有任何礼物 ");
	                    	}
	                    	
	                    }
		    	    });
			    },
	            //当前用户与他人的关注关系
	            getAttentionRelation:function(otherId){
	            	$.ajax({
	            		type:"GET",
	                    url:_this.otherDynamicPorts.getAttentionRelation,
	                    data:{
	                    	r:Math.random(),
	                    	id:otherId
	                    },
	                    success:function(d){
                        $(".myinfos .js_follow_btn_wrap a").hide();
                        $(".usStatus .js_follow_btn_wrap .js_guanzu").hide();
	                    	if(d.status=="success"){
                          var dataStatus=d.data.followStatus;
	                        	if(dataStatus=="notFollowed"){
	                        		//未关注
	                        		$(".usStatus .js_follow_btn_wrap .js_followBtn").show();
	                        	}else if(dataStatus=="followed"){
	                        		//已关注
	                        		$(".usStatus .js_follow_btn_wrap .js_followedBtn").show();
	                        	}else if(dataStatus=="eachOther"){
	                        		//互相关注
	                        		$(".usStatus .js_follow_btn_wrap .js_follow_eachBtn").show();
	                        	}
	                    	}else{
                          $(".myinfos .js_follow_btn_wrap a").hide();
	                    		$(".usStatus .js_follow_btn_wrap .js_guanzu").hide();
	                        	$(".usStatus .js_follow_btn_wrap .js_followBtn").show();
	                    	}
	                    
	                    },
	                    error:function(){
                        //请求失败
                        $(".myinfos .js_follow_btn_wrap a").hide();
	                    	$(".usStatus .js_follow_btn_wrap .js_guanzu").hide();
	                    	$(".usStatus .js_follow_btn_wrap .js_followBtn").show();
	                    }
	                    
	            	});
	            }
		}
	}
	
	return new otherDynamic_web;
})();
$(function(){
	var otherId=global_main.globalFn.getLinkParamFn("id");
	$(".usStatus .js_follow_btn_wrap").attr("data-userinfoid",otherId);
	if(otherId!=null&&otherId!=""){
		//获取用户信息
		otherDynamic_main.otherDynamicFn.userInfo(otherId);
		
		//获取用户身份信息
		otherDynamic_main.otherDynamicFn.title(otherId);
		
		//他人礼物
		otherDynamic_main.otherDynamicFn.giftWall(otherId);
		
		//当前用户与他人的关注关系
		otherDynamic_main.otherDynamicFn.getAttentionRelation(otherId);
	}
	//用户中心广告图
	global_main.globalFn.recommendpicListAjax('usercenter');
	 //身份墙移动
    $(".shenfes .yilun").click(function(){
    	var ituLen=$("#shenFenTypes .ituOther").length;//身份墙当前总个数
        var widItu=$("#shenFenTypes .ituOther").eq(0).width()+3;//身份墙图标宽度
        var curItu=$(".js_cur").index(),
            curMarginLeft=parseInt($("#shenFenTypes .ituOther").eq(0).css("margin-left").split("px")[0]);
        if($(this).hasClass("zuoyi")){
            if(curItu==0){
                return false;
            }
            $("#shenFenTypes .ituOther").removeClass("js_cur").eq(curItu-1).addClass("js_cur").end().eq(0).css({
                "margin-left":(curMarginLeft+widItu)+"px"
            });
        }else{
            if(curItu==ituLen-7){
                return false;
            }
            $("#shenFenTypes .ituOther").removeClass("js_cur").eq(curItu+1).addClass("js_cur").end().eq(0).css({
                "margin-left":(curMarginLeft-widItu)+"px"
            });
        }
    });
    
    //我的礼物,更多
    $(".moreGift").click(function(){
        if (otherId != null && otherId != "") {
            //我的礼物
    	}
    })
});