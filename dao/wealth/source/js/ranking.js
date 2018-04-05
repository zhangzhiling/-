/*
 * add by tht 2017-12-04
 * for forum index function dongchunshui
 */
(function(){
	var	rankingListUrl="/wealth/rank/star";//排行榜列表接口
	var	getRankingInfoUrl="/wealth/rank";//我的排名信息接口
	var rankHtml=''+
	'<h3 class="rankTitle"><i class="rankTitle_icon">图标</i>论坛之星<span class="rankIng_time">2018年01月09日22:00:00截止</span></h3>'+
		'<div class="specRankInfo_wrap" id="js_specRankInfo_wrap">'+
			'<div class="mySpecRankInfo js_mySpecRankInfo hide">'+
				'<div class="lf mySpecRank">'+
					'<i class="mySpecRank_icon01">图标</i>我的排名<strong class="RankInfoNum js_ranks">***</strong>'+
				'</div>'+
				'<div class="ri mySpecRank">'+
					'<i class="mySpecRank_icon02">图标</i>当前心经<strong class="RankInfoNum js_giftCount">***</strong>'+
				'</div>'+
			'</div>'+
			'<p class="noLoginBtn js_noLoginBtn ">查看我的数据<i class="lookMySpecRank_icon">图标</i></p>'+
		'</div>'+
		'<ul class="rankingList js_rankingList">'+
		'</ul>';
	
    function ForumRanking(){
    }
    ForumRanking.prototype = {
		init:function(){
			var _this=this;
			if(!$("#js_specRankInfo_wrap").length){  //有排行榜位层不再重复添加Dom
        		$(".rankingBg").append(rankHtml); //添加排行榜
        	}
			//排行榜列表
			_this.getRankListFn();
			//我的排名信息
			_this.getRankingInfoFn();
			
		},
		//获取我的排名信息
		getRankingInfoFn:function(){
			$.ajax({
				url:getRankingInfoUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					var datas=d;
					if(datas.status=="success"){				//登录成功状态
						$(".js_noLoginBtn").hide();
						$(".js_mySpecRankInfo").show()
						$(".js_ranks").html(datas.data.ranks);
						$(".js_giftCount").html(datas.data.giftCount);
					}else if(datas.status=="incorrect-login"){		//未登录状态
							$(".js_mySpecRankInfo").hide();
							$(".js_noLoginBtn").show().click(function(){
								login_main.showLogin();
							});
					}else{		//异常
						$(".js_noLoginBtn").hide();
						$(".js_mySpecRankInfo").show()
						$(".js_ranks").html("—");
						$(".js_giftCount").html("—");
					}
				}
				
			})
			
		},
		//昵称头像图片等比缩放
		nickImgForScale:function(nickUrl){
			var nickUrlReg = /cos/ig;//正则匹配字符串里面有“cos”的字符
			var nickImg = nickUrl.replace(nickUrlReg,"pic");//替换字符串里面的cos未pic
				nickImg = nickImg +"?imageView2/2/w/31/h/31";
			return nickImg
		},
		//获取排行榜列表
		getRankListFn:function(){
			var _this=this;
			$.ajax({
				url:rankingListUrl,
				type:"get",
				dataType:"json",
				data:{
					r:Math.random()
				},
				success:function(d){
					var datas=d;
					
					if(datas.status=="success"){
						var htmlLi='';
						
						var dataList=datas.data;
						for(var i=0;i<dataList.length;i++){
							var userinfoid=dataList[i].daoId;

							//昵称头像
							var nickHeadIMg = dataList[i].avatarUrl ? _this.nickImgForScale(dataList[i].avatarUrl) : "http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";
							
                        	//昵称
                        	var nickName=$(document).filterDevKeywordFn(dataList[i].nickName)
                        		nickName=nickName?global_main.globalFn.nicknameCompleCode(nickName):"";
                        	//排行数量如果大于10000则显示1万，否则显示具体数字,如果排行数量返回异常显示0
                        	var rankNumMore10000 = dataList[i].giftCount>=10000?Math.floor((parseInt(dataList[i].giftCount)/10000) * 10) / 10+"万":dataList[i].giftCount;
                        	var rankNum=dataList[i].giftCount?rankNumMore10000:0;
                        	var liClassName = "",
                        		iClassName= "",
                        		redkingMoney="";
                        	if(i<5){
                        		liClassName = "rankingListIcon0"+i;
                        		iClassName = "jinCap";
                        		redkingMoney="redkingMoney";
                        	}
							htmlLi+='<li class="'+liClassName+'">'+
										'<i class="cap '+iClassName+'">cap</i>'+
										'<i class="rankingListIcon lf">'+parseInt(i+1)+'</i>'+
										'<span class="t_nickName js_checkEveryUserInfo lf" data-userinfoid="'+userinfoid+'">'+
											'<a href="/user?id='+userinfoid+'" target="_blank">'+
												'<span class="t_nickHead"><img class="headImg" src="'+nickHeadIMg+'" /></span>'+
												'<span class="t_nickUser">'+nickName+'</span>'+
											'</a>'+
										'</span>'+
										'<span class="rankingMoney ri '+redkingMoney+'">'+rankNum+'</span>'+
									'</li>';
						}
						
						$(".js_rankingList").html(htmlLi);
					}
				}
				
			})
		}
		
    };
    
    window.forumRanking = function(){
        return new ForumRanking();
    };
})();
$(function(){
	//论坛首页右侧排行榜
	forumRanking().init()
})
