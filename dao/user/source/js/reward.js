/*-------------------------------------------------------------------------
 * 作者：maoxiangmin
 * 创建时间： 2017/11
 * 版本号：v1.0
 * 作用域：用户中心-领奖活动
 -------------------------------------------------------------------------*/
;(function(){
	
	var option=null;//初始化参数
	var rewardJK = "/user/reward";
	
	function ReWard(){
		//领奖活动功能
	}
	
	ReWard.prototype={
		init:function(opt){
			var _this=this;
			option=opt;
			_this.isshow();
		},
		isshow:function(){
			var _this=this;
			option.isShow ? $(".js_activeBoxpo").show(function(){_this.islogin()}) : $(".js_activeBoxpo").hide();
		},
		islogin:function(){
			var _this=this;
			if(option.isLogin){
				_this.rewardEvent();
			}else{
                 $(".js_activeBoxpo .js_activ01").off().on("click",function(){
                	 login_main.showLogin();
				});
			}
			_this.noLoginEvent();
		},
		//弹层信息
		popForReward:function(type,reH){
			var rewadTC="";
			if(type=="whrite"){
				rewadTC='<div class="tc rewardactive js_rewardactive">'+
				             '<i class="js_close cursor"></i>'+
							 '<div class="con">'+
					             '<span class="iconDang"></span>'+
					             '<div class="dngMsg">'+reH+'</div>'+
							  '</div>'+
						 '</div>';
			}
			if(type=="red"){
				rewadTC='<div class="tc rewardactiveRed js_rewardactiveRed">'+
				            '<i class="js_close cursor"></i>'+
							 '<div class="con">'+
					             '<div class="dngMsg">'+reH+'</div>'+
							  '</div>'+
							  '<img src="http://img.gyyxcdn.cn/dao/user/images/wuxjpm.png" />'+
				        '</div>';
			}
            $("body").append(rewadTC);
            if(type=="whrite"){
            	global_main.globalFn.tcCenter($(".js_rewardactive"));
            }
            if(type=="red"){
            	global_main.globalFn.tcCenter($(".js_rewardactiveRed"));
            }
		},
		rewardIsOpen:function(){
			if($(".js_boxForJYPOPpo .js_activ01").attr("iskeep")=="true"){
				return false;
			}
			var _this=this;
			var dh="";
			var bkwr="whrite";
			$.ajax({
        		type:"POST",
                url:rewardJK,
                data:{r:Math.random()},
                success:function(d){
                	if(d.status=="success"){
                		//红层直接msg
                		bkwr="red";
                		dh='<p class="f22">恭喜您领取到了!</p><p class="f18h">抽奖机会*1 + "无量心经" 礼品*50，</p><p class="fw">快去为好友冲榜吧~<a target="_blank" class="goCjForReward" href="http://actionv2.gyyx.cn/wd/daolottery/index">点击抽奖</a></p>';
                	}
                	if(d.status=="ineligible"){
                		//红层提示
                		bkwr="red";
                		if(d.message=="您的账号已经领取了，快去为好友冲榜吧"){
                			dh='<p class="f22">您的账号已经领取，</p><p class="f18">快去为好友冲榜吧~<a target="_blank" class="goCjForReward" href="http://actionv2.gyyx.cn/wd/daolottery/index">点击抽奖</a><p>';
                		}else if(d.message=="您的手机号已经领取了，快去为好友冲榜吧"){
                			dh='<p class="f22">您的手机号已经领取，</p><p class="f18">快去为好友冲榜吧~<a target="_blank" class="goCjForReward" href="http://actionv2.gyyx.cn/wd/daolottery/index">点击抽奖</a><p>';
                		}else if(d.message=="您昨日游戏内活跃度未达150点，游戏不够勤奋哦，请今日再接再厉，明日再来~" || d.message=="活动未开启" || d.message=="活动已结束"){
                			dh=d.message;
                		}
                	}
                	if(d.status=="failed"){
                		//白层提示直接msg
                		dh=d.message;
                	}
                	if(d.status=="incomplete-info"){
                		//白层跳转链接
                		if(d.message=="您未绑定手机号" || d.message=="您还未设置昵称"){
                			dh='<span>'+d.message+',</span><br/>请<a class="linkeUnd" target="_blank" href="/user/member/">前往绑定。<a/>';
                		}else if(d.message=="请您绑定游戏信息再来领取吧"){
                			dh='请您绑定游戏信息再来领取吧'+',<a target="_blank" class="linkeUnd" href="/user/member/">前往绑定</a>';
                		}
                	}
                	if(d.status=="grant-failure"){
                		//白层奖励发放失败，
                		dh=d.message+',如有疑问请<p><a target="_blank" class="linkeUnd" href="http://kf.gyyx.cn/Home/IMIndex">联系客服</a></p>';
                	}
                	if(!dh){
                		dh="未知错误，请重试！";
                	}
                	_this.popForReward(bkwr,dh);
                	$(".js_boxForJYPOPpo .js_activ01").attr("iskeep","false");
                },
                beforeSend:function(){
                	$(".js_boxForJYPOPpo .js_activ01").attr("iskeep","true");
                },
                error:function(){
                	_this.popForReward("whrite","未知错误，请重试！");
                	$(".js_boxForJYPOPpo .js_activ01").attr("iskeep","false");
                	return false;
                }
        	})
		},
		rewardEvent:function(){
			var _this=this;
			$(".js_boxForJYPOPpo .js_activ01").click(function(){
				_this.rewardIsOpen();
			});
			
			$("body").on("click",".js_rewardactiveRed .js_close,.js_rewardactive .js_close",function(){
				$(".js_rewardactive,.js_rewardactiveRed").remove();
				$(".bgT").hide();
			});
		},
		noLoginEvent:function(){
			$(".js_boxForJYPOPpo .js_activ01").hover(function(){
				$(this).find(".js_ljrules").show();
			},function(){
				$(this).find(".js_ljrules").hide();
			});
			
			$(".js_boxForJYPOPpo .js_activ02").hover(function(){
				$(this).parent().find(".js_ctalert").show();
			},function(){
				$(this).parent().find(".js_ctalert").hide();
			});
		}
	};
	
	window.reWard = function(){
		return new ReWard();
	};
	
})();