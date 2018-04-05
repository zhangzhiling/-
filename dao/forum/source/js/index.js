/*-------------------------------------------------------------------------
 * 作者：maoxiangmin
 * 创建时间： 2017/7
 * 版本号：v1.0
 * 作用域：贴吧--首页
 * 
 * 注:global_main->global.js
 -------------------------------------------------------------------------*/
var tiebaIndex_main = (function () {
    var shenFenQiang = ['丹青妙笔', '妙语连珠', '点石成金', '官网记者', '优秀记者', '官网名记', '小作者', '签约作家', '优秀作家', '名人', '论坛之星','策划'];
    var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)', 'g');  //视频个数正则表达式
    var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")(?![^>]+src="http://wanwd.gyyx.cn/Content/js/editor/dialogs/emotion)[^>]+(>|\/>)', 'g'); //图片个数正则表达式
    var strIcon='&isPc=true';
	function tiebaIndex_web() {
        /*
	     * 局部变量
	     */
        var _this = this;

        /*
       * 接口定义
       */
        this.tiebaIndexPorts = {
            //获取轮播图展示
            list: "/forum/recommend/content/list",

            //获取帖子分类
            getForumTypeUrl: "/forum/tab/list",

            //精品列表
            bestList: "/forum/thread/bestList",

            //主贴列表
            theradList: "/forum/thread/list",

            //标签贴
            tagFourmListUrl: "/forum/thread/listByTag",

            //最热帖
            hotFourmListUrl: "/forum/thread/hotList"
        },

        /*
	     * 当页方法
	     */
		 this.tiebaIndexFn = {
		     //获取轮播图展示
		     list: function () {
		         $.ajax({
		             url: _this.tiebaIndexPorts.list,
		             type: "GET",
		             dataType: "json",
		             data: {
		                 number: 10,
		                 r: Math.random()
		             },
		             success: function (d) {
		                 if (d.status == "success") {
		                     var htmlList = ""
		                     for (var i = 0; i < d.data.length; i++) {
		                         htmlList += '<li class="scrollImg"><a href="' + d.data[i].postUrl + '" target="_blank"><img src="' + d.data[i].imgUrl + '" alt="" /></a></li>';
		                     }
		                     $(".scroll_box .slides").html(htmlList);

							 $(".scroll_box .slides li").hide();
							 $(".scroll_box .slides li").eq(0).show();
							 $('.flexslider').flexslider({ 
													slideshowSpeed: 3000,
													directionNav: true,
													pauseOnAction: false
												});
		                 } else {
		                     $("#container").hide();
		                     $(".scroll_box .slides").html('<li class="scrollImg_zhan" style="display:block"><img src="http://img.gyyxcdn.cn/dao/forum/images/img01.jpg" alt=""></li>');
		                 }
		             },
		             error: function () {
		                 $("#container").hide();
		                 $(".scroll_box .slides").html('<li class="scrollImg_zhan" style="display:block"><img src="http://img.gyyxcdn.cn/dao/forum/images/img01.jpg" alt=""></li>');
		                 $(".js_alertMsg").html("操作过于频繁，请稍后再试。");
		                 global_main.globalFn.tcCenter($(".alertMSG"));
		             }
		         });


			
		     },
		     //获取帖子分类
		     getForumTypeFn: function () {
		         $.ajax({
		             url: _this.tiebaIndexPorts.getForumTypeUrl,
		             type: "GET",
		             dataType: "json",
		             data: {
		                 r: Math.random()
		             },
		             success: function (d) {
		                 if (d.status == "success") {
		                     var htmlList = "";
		                     var htmlListHot;
		                     for (var i = 0; i < d.data.length; i++) {
		                         if (d.data[i].group.length > 0) {
		                             var hotTab = '<li data-type="new" class="tieHotType current">最新</li><li data-type="hot" class="tieHotType ">最热</li>';
		                             htmlListHot = '<div class="js_hotList"><ul>' + hotTab + '</ul></div>';

		                         } else {
		                             htmlListHot = '';

		                         }	
		                         if(i==0){
		                             htmlList += '<li class="tieType js_type cur" data-type="' + d.data[i].tabType + '">' + d.data[i].tabName + htmlListHot + '</li>'
		                         }else{
		                             htmlList += '<li class="tieType js_type" data-type="' + d.data[i].tabType + '">' + d.data[i].tabName + htmlListHot + '</li>'
		                         }
		                     }

		                     $(".js-tieType").html(htmlList);
		                     //当有最新最热的时候，显示全部帖子的最热内容展示
		                     if ($(".js_hotList li").length > 0) {
		                         $(".pingInfo").css("padding-top", "49px");
		                     } 
		                    tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.theradList, "");
		                     


		                 }
		             },
		             error: function () {
		                 //不捕获异常，为避免页面显示不友好
		             }
		         });
		     },
		     //主贴,精品列表

		     theradListAddBestList: function (urlTie, typeTie) {
		         //接口参数
		         var paramObj = {};
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
		         //是标签帖子传递帖子名称参数
		         if (typeTie) {
		             $.extend(paramObj, {
		                 tagName: encodeURI(typeTie)
		             });
		         }

		         $(".js-allInfo").html("").ajaxPage({
		             url: urlTie,
		             type: "GET",
		             pageObj: $("#tieInfo_Table_0_paginate"),
		             pageIndex: 1,
		             pageSize: 20,
		             curPageCls: "paginate_active",
		             pageInfo: {
		                 obj: $("#tieInfo_Table_0_info"),
		                 content: ""
		             },
		             paramObj: paramObj,
		             clickFn: function () {
		                 $(window).scrollTop(532)
		             },
		             dataFn: function (d) {
		                 var htmlLi = "";
		                 if (d.status == "success") {

		                     if (d.message == "无数据") {
		                         return false;
		                     }

		                     var datas = d.data;
		                     var datasLen = datas.length;
		                     if (datasLen > 0) {
		                         for (var i = 0; i < datasLen; i++) {
		                             var detailData = datas[i];
		                             var titles = $(document).filterDevKeywordFn(detailData.title); //标题
		                             var contentWealths = detailData.level;

		                             //评论数量如果大于10000则显示1万，否则显示具体数字,如果评论数量返回异常显示0
		                             var replyNumMore10000 = detailData.replys >= 10000 ? Math.floor((parseInt(detailData.replys) / 10000) * 10) / 10 + "万" : detailData.replys;
		                             var replyNum = detailData.replys ? replyNumMore10000 : 0;

		                             //浏览数量如果大于10000则显示1万，否则显示具体数字
		                             var pageViewNumMore10000 = detailData.pageView >= 10000 ? Math.floor((parseInt(detailData.pageView) / 10000) * 10) / 10 + "万" : detailData.pageView;
		                             var pageViewNum = detailData.pageView ? pageViewNumMore10000 : 0;

		                             //财富图标className
		                             var addClassWealths = wealthClassFn(contentWealths);
		                             //昵称
		                             var nickName = $(document).filterDevKeywordFn(detailData.userInfo.nickName);
		                             //大区
		                             var netType = $(document).filterDevKeywordFn(detailData.userInfo.netType);
		                             //服务器
		                             var serverName = $(document).filterDevKeywordFn(detailData.userInfo.serverName);
		                             //昵称头像
		                             var nickImg = $(document).filterDevKeywordFn(detailData.userInfo.avatarUrl);
		                             var nickHeadIMg = nickImg ? nickImg : "http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";
		                             htmlLi += '<li class="tieDetail" nk=' + i + '><div class="conD"><p class="tie_tit">';
		                             //贴类型
		                             switch (detailData.category) {
		                                 case "公告帖":
		                                     htmlLi += '<span class="lf tie_type ggTie">' + detailData.category + '</span>';
		                                     break;
		                                 case "活动帖":
		                                     htmlLi += '<span class="lf tie_type hdTie"><i class="icon"></i>' + detailData.category + '</span>';
		                                     break;
		                                 case "":
		                                     break;
		                                 default:
		                                     htmlLi += '<span class="lf tie_type ztTie">' + detailData.category + '</span>';
		                                     break;
		                             }

		                             if (titles.length > 65) {
		                                 var newTitle = titles.substring(0, 64) + "...";
		                                 htmlLi += '<a target="_blank" href="/forum/thread?id=' + detailData.id + strIcon +'" title="' + titles + '" class="tit lf">' + newTitle + '</a>';
		                             } else {
		                                 htmlLi += '<a target="_blank" href="/forum/thread?id=' + detailData.id + strIcon +'" title="' + titles + '" class="tit lf">' + titles + '</a>';
		                             }
		                             if (detailData.isTop) {
		                                 htmlLi += '<i class="ico_tie zhiding"></i>';
		                             }
		                             //判断是最新回帖时间时且非公告贴标签
		                             if (detailData.latestTime && detailData.category != "公告帖") {
		                                 htmlLi += '<span class="t_fbTimes">最新回帖于&nbsp&nbsp' + global_main.globalFn.formatDate(detailData.latestTime) + '</span>';
		                             }

		                             if (detailData.isBest) {
		                                 htmlLi += '<i class="ico_tie jingpin"></i>';
		                             }
		                             if (detailData.level) {
		                                 htmlLi += '<span class="ico_tie js_wealthsShow icon_wealthsTop ' + addClassWealths + '">' +
                                         '<span class="num js_marginLeft js_wealthNumTop" style="visibility: hidden; width: 60px; margin-left: -40px;">' + contentWealths + '<i class="arrow"></i></span>' +
                                         '</span>' +
                                         '</p>';
		                             }

		                             //视频区,图片展示
		                             var videoImgArr = [];
		                             var videos = (detailData.content).match(expVideo);
		                             var Imgs = (detailData.content).match(expImg);

		                             if (videos) {
		                                 for (var v = 0; v < videos.length; v++) {
		                                     if (v < 3) {
		                                         videoImgArr.push(videos[v]);
		                                     }
		                                 }
		                             }
		                             if (Imgs) {
		                                 for (var im = 0; im < Imgs.length; im++) {
		                                     if (videoImgArr.length < 3 && im < 3) {
		                                         //图片等比例
		                                         var sNewIm = global_main.globalFn.imgForScale(Imgs[im]);
		                                         //图片懒加载
		                                         sNewIm = sNewIm.replace("src", "_src");
		                                         videoImgArr.push(sNewIm);
		                                     }

		                                 }
		                             }
		                             var testContent = $.trim(detailData.content.replace(/<\/?[^>]*>/g, '').replace(/\n[\s| | ]*\r/g, '\n').replace(/&nbsp;/ig, ''));
		                             if (testContent.length > 0 && detailData.category != "公告帖") {
		                                 if (videoImgArr.length > 0) {
		                                     htmlLi += '<p class="zhaiyao zhaiyaoPadForImg"><a target="_blank" href="/forum/thread?id=' + detailData.id + strIcon+'">';
		                                 } else {
		                                     htmlLi += '<p class="zhaiyao"><a target="_blank" href="/forum/thread?id=' + detailData.id + strIcon+'">';
		                                 }

		                                 htmlLi += testContent + '</a></p>';
		                             }

		                             //视频区,图片展示，并且不是公告贴标签
		                             if (videoImgArr.length > 0 && detailData.category != "公告帖") {
		                                 htmlLi += '<div target="_blank" class="videoEbG" ><ul class="videos_imgs js_img_wrap">';
		                                 for (var vI = 0; vI < videoImgArr.length; vI++) {
		                                     if (vI < 3) {
		                                         htmlLi += '<li>' + videoImgArr[vI] + '</li>';
		                                     }
		                                 }
		                                 htmlLi += '</ul><a target="_blank" class="videoZZc" href="/forum/thread?id=' + detailData.id + strIcon+'"></a></div>';
		                             }

		                             //公告贴加浏览量、评论量
		                             if (detailData.category == "公告帖") {
		                                 htmlLi += '<div class="noticePost tie_cz"><i class="cz numLook_Icon"></i><span class="look_num">' + pageViewNum + '</span><i class="cz num_pl"></i><span class="cz_num">' + replyNum + '</span></div>';
		                             }
		                             //global_main.globalFn.formatDate

		                             //判断昵称不为空，并且不是公告帖的
		                             if (nickName != null && detailData.category != "公告帖") {
		                                 htmlLi += '<div class="biaoqian">';
		                                 //identityId,后期修改，去掉标签展示，将头像昵称移至此处，头像昵称悬浮有名片，点击跳转，更换回帖浏览量图标，头像显示真实用户头像
		                                 htmlLi += '<p class="tiePeop lf" >' +
                                                     '<span class="t_nickNmae js_checkEveryUserInfo lf" data-userinfoid="' + detailData.userInfo.id + '">' +
                                                         '<a target="_blank" class="clearFloar" href="/user?id=' + detailData.userInfo.id + strIcon+'">' +
                                                             '<span class="t_nickHead"><img class="headImg" src="' + nickHeadIMg + '" /></span>' +
                                                             '<span class="t_nickUser">' + global_main.globalFn.nicknameCompleCode(nickName) + '</span>' +
                                                         '</a>' +
                                         '</span>';
		                                 if (detailData.userInfo.identityId > 0) {
		                                     htmlLi += '<span class="t_currentSf shenfenD' + detailData.userInfo.identityId + '"><i class="sfText">' + shenFenQiang[detailData.userInfo.identityId - 1] + '</i></span>';
		                                 } else {
		                                     if (global_main.globalFn.nicknameCompleCode(nickName) == "道姐") {
		                                         htmlLi += '<span class="t_currentSf daojiebq"><i class="sfText">道姐</i></span>';
		                                     } else if (global_main.globalFn.nicknameCompleCode(nickName) == "公告") {
		                                         htmlLi += '<span class="t_currentSf gonggaobq"><i class="sfText">公告</i></span>';
		                                     }
		                                 }
		                                 if (netType != null && netType != "null" && netType != "") {
		                                     htmlLi += '&nbsp;&nbsp;（<span class="t_server">' + netType + '</span>&nbsp;|&nbsp;<span class="t_qz">' + serverName + '</span>&nbsp;|&nbsp;<span class="t_nickNmae">' + detailData.userInfo.roleName + '</span>）';
		                                 }
		                                 htmlLi += '</p>';
		                             }
		                             //非公告帖时执行
		                             if (detailData.category != "公告帖") {
		                                 htmlLi += '<p class="tie_cz ri"><i class="cz numLook_Icon"></i><span class="look_num">' + pageViewNum + '</span><i class="cz num_pl"></i><span class="cz_num">' + replyNum + '</span></p></div>';
		                             }
		                             htmlLi += '</div></li>';
		                         }

		                     }
		                     $(".js-allInfo").html(htmlLi);
		                 }

		                 return htmlLi;

		             },
		             successFn: function () {

		                 //图片懒加载
		                 $(document).imgLazyLoadExcuteFn(".js_img_wrap img");

		             }
		         });
		     }
		 }
    }

    return new tiebaIndex_web;

})();

$(function () {
    //获取轮播图展示
    tiebaIndex_main.tiebaIndexFn.list();
    //首页广告图
    global_main.globalFn.recommendpicListAjax('home');
    //获取帖子分类
    tiebaIndex_main.tiebaIndexFn.getForumTypeFn();
    $(".js-tieType").off("click", ".js_type").on("click", ".js_type", function () {
        var $this = $(this);
        //帖子类型标识
        var fourmType = $this.attr("data-type");
        //帖子类型名称
        var fourmTypeName = $this.html();

        if (!$this.hasClass("cur")) {  //不是选中状态，不请求数据
            //数据请求配置
            if (fourmType == "all") {
                if ($(".js_hotList li").eq(0).hasClass("current")) {
                    tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.hotFourmListUrl, "");
                } else {
                    tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.theradList, "");
                }

            } else if (fourmType == "best") {
                tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.bestList, "");
            } else {
                tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.tagFourmListUrl, fourmTypeName);
            }
        }
        //选中状态设置,切换只显示自己下边的定位
        $this.siblings().removeClass("cur").end().addClass("cur");
        $this.siblings().children('.js_hotList').hide();
        $this.children('.js_hotList').show();
        if ($this.children('.js_hotList').length > 0) {
            $(".pingInfo").css("padding-top", "49px")
        } else {
            $(".pingInfo").css("padding-top", "0")
        }

    });
    //最新最热帖子切换
    $(".tieCon").off("click", ".tieHotType").on("click", ".tieHotType", function () {
        var $this = $(this);
        //帖子类型标识
        var fourmsType = $this.attr("data-type");

        if (!$this.hasClass("current")) {  //不是选中状态，不请求数据
            //数据请求配置
			fourmsType == "hot" ? tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.hotFourmListUrl, "") : tiebaIndex_main.tiebaIndexFn.theradListAddBestList(tiebaIndex_main.tiebaIndexPorts.theradList, "");
        }
        //选中状态设置
        $this.siblings().removeClass("current").end().addClass("current");

    });
    //图标当前身份显示
    $("body").on("mouseover", ".t_currentSf", function () {
        $(this).find(".sfText").show()
    });

    $("body").on("mouseleave", ".t_currentSf", function () {
        $(this).find(".sfText").hide()
    });
    //道具等级显示(腰缠万贯...)
    $("body").on("mouseover", ".js_wealthsShow", function () {
        $(this).find(".js_wealthNumTop").css("visibility", "visible")
    });
    $("body").on("mouseleave", ".js_wealthsShow", function () {
        $(this).find(".js_wealthNumTop").css("visibility", "hidden")
    });

});