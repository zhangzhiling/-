/*-------------------------------------------------------------------------
 * 作者：dcs
 * 创建时间： 2018/8
 * 版本号：v1.0
 * 作用域：贴吧--首页
 * 
 -------------------------------------------------------------------------*/
(function () {
    var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)', 'g');  //视频个数正则表达式
    var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")(?![^>]+src="http://wanwd.gyyx.cn/Content/js/editor/dialogs/emotion)[^>]+(>|\/>)', 'g'); //图片个数正则表达式

    //获取轮播图展示
    var list = "/forum/recommend/content/list";
    //主贴列表
    var theradList = "/forum/thread/list";
    //最热帖
    var hotFourmListUrl = "/forum/thread/hotList";
    //分页初始化
    var pageIndex = 1;
    var flag = true;
    //设置页面min-height,避免标签切换跳动
    var minHeight = $(window).height();
    $(".swiper-wrapper").css("min-height", minHeight);

    function WaphomeFn() {
        //
    }
    WaphomeFn.prototype = {
        init: function () {
            var _this = this; 
            _this.homeFollowListFn(theradList, "all", pageIndex)//最热帖子列表
            _this.list(list);//轮播图
            _this.tieScroll();//左右滑动
            _this.newList();//刷新加载
            $(document).iconPc();//添加电脑端
        },
        //获取轮播图展示
        list: function (list) {
            $.ajax({
                url: list,
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
                            htmlList += '<li class="scrollImg"><a href="#"><img src="' + d.data[i].imgUrl + '" alt="" /></a></li>';
                        }
                        $(".scroll_box .slides").html(htmlList);
                        $(".scroll_box .slides li").hide();
					    $(".scroll_box .slides li").eq(0).show();
                        $('.flexslider').flexslider({
                            animation: "solid", //动画效果 
                            slideshowSpeed: 3000,// Integer: ms 滚动间隔时间  
                            directionNav: false,//是否显示左右箭头
                            pauseOnAction: false
                        });
                    } else {
                        $(".scroll_box .slides").html('<li class="scrollImg_zhan" style="display:block"><img src="http://img.gyyxcdn.cn/dao/forum/images/img01.jpg" alt=""></li>');
                    }
                },
                error: function () {
                    $(".scroll_box .slides").html('<li class="scrollImg_zhan" style="display:block"><img src="http://img.gyyxcdn.cn/dao/forum/images/img01.jpg" alt=""></li>');
                }
            });
        },
        
        //图片等比例缩放
        imgForScale: function (imgs) {
            var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
            var imgSrc = imgs.match(srcReg);
            var screenWidth = parseInt($("body").width());//设备屏宽
            var magrinLR = screenWidth * (1 / 6);//左右间距距离
            var imgWidth = parseInt((screenWidth - magrinLR) * (1 / 3));//图片宽        
            var imgHeight = parseInt(imgWidth * (3 / 4));//图片高
            if (imgSrc[1]) {
                imgs = imgs.replace(imgSrc[1], imgSrc[1] + "?imageMogr2/crop/!"+imgWidth+"x"+imgHeight+"a20a20");//智能截取图片的宽高
            }
            //过滤脚本关键字
            imgs = $(document).filterDevKeywordFn(imgs);
            return imgs;
        },
        //首页列表小图宽高展示
        smallImgListFn:function(){
            var imgWs=$(".news_list .videos_imgs li").find("img").attr("_src");
             var imgW=imgWs.substring(imgWs.indexOf('/!')+2,imgWs.indexOf('x'));
             var imgH=imgWs.substring(imgWs.indexOf(imgW)+4,imgWs.indexOf("a20a20"))
            $(".news_list .videos_imgs li").find("img").each(function(){
                $(this).css({
                    width:imgW,
                    height:imgH
                })
            });
        },
        //帖子分类滑动切换
        tieScroll: function () {
            var _this = this;
            var mySwiper = new Swiper('.swiper-container', {
                autoHeight: true,
                onSlideChangeStart: function () {
                    $(".lastPageShua,.lastPageShua2").hide();
                    $(".tabs .active").removeClass('active');
                    $(".tabs li").eq(mySwiper.activeIndex).addClass('active');
                    $(".swiper-wrapper,.swiper-slide").css("height", 'auto');
                    
                    if (mySwiper.activeIndex == 1) {//热门
                        pageIndex = 1;
                        flag = true;
                        _this.followTypeFn("hot");
                        $("#allList").html('');
                    } else if (mySwiper.activeIndex == 0) {//全部
                        pageIndex = 1;
                        flag = true;
                        _this.followTypeFn("all");
                        $("#hotList").html('');
                        
                    }
                }
            });
            //点击调用事件同滑动切换
            $(".tabs li").on('click', function (e) {
                e.preventDefault();
                $(".tabs .active").removeClass('active');
                $(this).addClass('active');
                mySwiper.swipeTo($(this).index());
            });
            $(".tabs li").click(function (e) {
                e.preventDefault();
            });
        },
        //判断帖子列表类型
        followTypeFn: function (txtType) {
            var _this = this;
            var urlTie = txtType == "hot" ? hotFourmListUrl : theradList;
            _this.homeFollowListFn(urlTie, txtType);
        },

        //帖子列表
        homeFollowListFn: function (urlTie, followType) {
            var _this = this;
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
            if (flag) {
                //进行请求数据
                flag = false;
                $.ajax({
                    url: urlTie,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        pageIndex: pageIndex,//分页
                        pageSize: 20,
                        r: Math.random()
                    },
                    beforeSend: function () {
                        var followTypeBox = followType == "hot" ? "#hotList" : "#allList";
                        $(followTypeBox).siblings("p").html('正在加载').show();
                        $(".lastPage").hide();
                    },
                    success: function (d) {
                        var htmlLi = "";
                        if (d.status == "success") {
                            if (d.message == "无数据") {
                                return false;
                            }
                            var followTypeBox = followType == "hot" ? "#hotList" : "#allList";

                            var datas = d.data;
                            var datasLen = datas.length;
                            if (datasLen > 0) {
                                //列表获取展示方法
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
                                    //游戏信息  大区   服务器  角色
                                    var gameInfoStr = detailData.userInfo.netType ? '<span class="t_server">' + detailData.userInfo.netType + '</span>|<span class="t_qz">' + detailData.userInfo.serverName + '</span>|<span class="t_nickNmae">' + detailData.userInfo.roleName + '</span>' : "暂无游戏信息";
                                    //昵称头像
                                    var nickImg = $(document).filterDevKeywordFn(detailData.userInfo.avatarUrl);
                                    var nickHeadIMg = nickImg ? $(document).nickHeaderForScale(nickImg, '.8rem', '.8rem') : "http://img.gyyxcdn.cn/dao/user/images/tc_tx.png";
                                    htmlLi += '<li class="tieDetail" nk=' + i + '><div class="conD"><p class="tie_tit">';
                                    //贴类型
                                    switch (detailData.category) {
                                        case "公告帖":
                                            htmlLi += '<i class="ico_tie ggTie"></i>';
                                            break;
                                        case "活动帖":
                                            htmlLi += '<i class="ico_tie hdTie"></i>';
                                            break;
                                        case "":
                                            break;
                                        default:
                                            htmlLi += '<i class="ico_tie hdTie"></i>';
                                            break;
                                    }
                                    //判断昵称不为空，并且不是公告帖的
                                    if (nickName != null && detailData.category != "公告帖") {
                                        htmlLi += '<div class="biaoqian">';
                                        //identityId,后期修改，去掉标签展示，将头像昵称移至此处，头像昵称悬浮有名片，点击跳转，更换回帖浏览量图标，头像显示真实用户头像
                                        htmlLi += '<p class="tiePeop lf" >' +
                                                    '<a  class="clearFloar nickImgWrap">' +
                                                        '<img class="headImg" src="' + nickHeadIMg + '" />' +
                                                        '<span class="t_nickUser">' + nickName + '</span>' ;
                                        if (detailData.userInfo.identityId > 0) {
                                            htmlLi += '<span class="t_currentSf shenfenD' + detailData.userInfo.identityId + '"></span>';
                                        } else {
                                            if (nickName == "道姐") {
                                                htmlLi += '<span class="t_currentSf daojiebq"></span>';
                                            } else if (nickName == "公告") {
                                                htmlLi += '<span class="t_currentSf gonggaobq"></span>';
                                            }
                                        }
                                        htmlLi +='</a>';
                                        htmlLi += '<span class="serverWrap">' + gameInfoStr + '</span>';

                                        htmlLi += '</p><section class="tie_title js_tie_title">';
                                    }
                                    //置顶
                                    if (detailData.isTop) {
                                        htmlLi += '<i class="ico_tie zhiding"></i>';
                                    }
                                    //精品
                                    if (detailData.isBest) {
                                        htmlLi += '<i class="ico_tie jingpin"></i>';
                                    }
                                    //道具等级
                                    if (detailData.level) {
                                        htmlLi += '<i class="ico_tie icon_wealthsTop ' + addClassWealths + '"></i>';
                                    }
                                    htmlLi += '<a href="/forum/thread?id=' + detailData.id + '" title="' + titles + '" class="tit lf js_title">' + titles + '</a>';
                                    htmlLi += '</section>'
                                    //视频区,图片展示
                                    var videoImgArr = [];
                                    var videos = (detailData.content).match(expVideo);
                                    
                                    var Imgs = (detailData.content).match(expImg);
                                    
                                     if (videos) {                                       
                                        for (var v = 0; v < videos.length; v++) {
                                            var voideImg = videos[v] = "";
                                            if (v < 3) {
                                                videoImgArr.push(voideImg);
                                            }
                                        }
                                    }
                                    if (Imgs) {
                                        for (var im = 0; im < Imgs.length; im++) {
                                            if (videoImgArr.length < 3 && im < 3) {
                                                //图片等比例
                                                var sNewIm = _this.imgForScale(Imgs[im]);
                                                //图片懒加载
                                                sNewIm = sNewIm.replace("src", "_src");
                                                videoImgArr.push(sNewIm);
                                            }
                                        }
                                    }
                                    //视频区,图片展示，并且不是公告贴标签
                                    if (videoImgArr.length > 0 && detailData.category != "公告帖") {
                                        htmlLi += '<a href="/forum/thread?id=' + detailData.id + '"  class="videoEbG" ><ul class="videos_imgs js_img_wrap">';
                                        for (var vI = 0; vI < videoImgArr.length; vI++) {
                                            if (vI < 3) {
                                                htmlLi += '<li>' + videoImgArr[vI] + '</li>';
                                            }
                                        }
                                        htmlLi += '</ul></a>';
                                    }
                                    //判断是最新回帖时间时且非公告贴标签
                                    if (detailData.latestTime) {
                                        htmlLi += '<div class="clearFloar detailData"><span class="t_fbTimes">最新回帖&nbsp;' + $(document).getDateDiff(detailData.latestTime) + '</span>';
                                    }
                                    //判断是最新回帖时间时且非公告贴标签
                                    if (detailData.createTime && !detailData.latestTime) {
                                        htmlLi += '<div class="clearFloar detailData"><span class="t_fbTimes">' + $(document).getDateDiff(detailData.createTime) + '</span>';
                                    }

                                    
                                        htmlLi += '<section class="postWrap tie_cz"><span class="look_num">' + pageViewNum + '浏览</span><span class="cz_num">' + replyNum + '回帖</span></section></div>';
                                    
                                    htmlLi += '</div></li>';
                                }//for循环结束
                                if ($(followTypeBox).html() == '') {//空页面追加内容
                                    $(followTypeBox).append(htmlLi);
                                } else {
                                    if (pageIndex == 1) {//浏览第一页替换页面结构
                                        $(followTypeBox).html(htmlLi);
                                    } else {//其他页码追加内容
                                        $(followTypeBox).append(htmlLi);
                                        
                                    }
                                }
                                $(followTypeBox).siblings("p").html('').hide();//正在加载提示消失
                                flag = true;
                                if (pageIndex == d.totalPage) {
                                    $(followTypeBox).append('<li class="nolist">没有更多内容了</li>')
                                    _this.weixin();
                                } else {
                                    pageIndex = pageIndex + 1;//下一页
                                }
                                $(".swiper-wrapper,.swiper-slide").css("height", 'auto');

                            }

                        }
                    },
                    complete: function () {
                        _this.postTagSizeFn();
                        _this.smallImgListFn();
                        $(document).imgLazyLoadExcuteFn(".js_img_wrap img");//图片懒加载
                        flag = true;
                    },
                    error: function () {
                        var followTypeBox = followType == "hot" ? "#hotList" : "#allList";
                        $(followTypeBox).siblings("p").html("服务器小哥开小差了，请稍后重试~").show();
                        flag = true;
                    }

                });
            } else {
                //不进行数据请求（避免重复调用）
            }
           
        },
        //获取标识图标个数
        postTagSizeFn: function () {
            $(".news_list ul li.tieDetail").each(function () {
                var tagLen = $(this).find("i").size();
                var ggTieWrap=$(this).find("i").hasClass("ggTie");//公告帖标签
                var hdTieWrap=$(this).find("i").hasClass("hdTie");//活动帖标签
                var zhidingWrap=$(this).find("i").hasClass("zhiding");//置顶帖标签
                var jingpinWrap=$(this).find("i").hasClass("jingpin");//精品帖标签
                var wealthsTopWrap=$(this).find("i").hasClass("icon_wealthsTop");//道具等级帖标签
                if(tagLen){
                    $(this).find(".js_title").css({
                        "text-indent": '.5rem'
                    });
                }
                if(ggTieWrap){  
                    $(this).find("i.ggTie").show().siblings().find("i").hide();
                    $(this).find(".js_title").css({
                        "text-indent": '.7rem'
                    });                   
                }else if(hdTieWrap){
                     $(this).find("i.hdTie").show().siblings().find("i").hide();
                     $(this).find(".js_title").css({
                        "text-indent": '.7rem'
                    });
                }else if(zhidingWrap){
                     $(this).find("i.zhiding").show().siblings().find("i").hide();
                }else if(jingpinWrap){
                     $(this).find("i.jingpin").show().siblings().find("i").hide();
                }else if(wealthsTopWrap){
                     $(this).find("i.icon_wealthsTop").show().siblings().find("i").hide();
                }
            })
        },
        //下拉刷新列表
        newList: function () {
            var _this = this;
            $(window).scroll(function () {
                //页面滚动到指定区域，标签置顶
                var offSetTop = parseInt($(".favor-header-bar").offset().top);
                var scrollTop2 = parseInt($(this).scrollTop());  //页面滚动卷入顶部距离
                if (scrollTop2 >= offSetTop) {
                    $(".tabs").addClass("favor-header-barFixed"); //开始飘 
                } else {
                    $(".tabs").removeClass("favor-header-barFixed"); //结束飘
                }
                //刷新数据
                var scrollTop = $(this).scrollTop();//滚动条向上的距离
                var windowHeight = $(this).height();//可视窗口高度
                var scrollHeight = $(document).height();//文档高度
                if ($(".tabs li").eq(0).hasClass("active")) {//全部
                    if ($("#allList").html() == '') {
                        //禁止重复调用
                    } else {                       
                        if (scrollHeight - scrollTop - windowHeight*1.5 < 0) {
                            if ($(".nolist").is(":visible")) {
                                //最后一页不刷新
                            } else {
                                if(flag){
                                    _this.homeFollowListFn(theradList, "all");
                                } else {
                                    //正在调用，不进行请求
                                }
                            }
                        }
                    }
                } else {//热门
                    if ($("#hotList").html() == '') {
                        //禁止重复调用
                    } else {
                        if (scrollHeight - scrollTop - windowHeight * 1.5 < 0) {
                            if ($(".nolist").is(":visible")) {
                                //最后一页不刷新
                            } else {
                                if (flag) {
                                    _this.homeFollowListFn(hotFourmListUrl, "hot");
                                } else {
                                    //正在调用，不进行请求
                                }
                            }
                        }
                    }
                }
            })

        },
        //是不是微信
        weixin:function(){
            //判断是否微信登陆
            function isWeiXin() {
                var ua = window.navigator.userAgent.toLowerCase();
                if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                    $(".nolist").css("padding", "0.3rem 0 0.3rem 0")
                }
            }
            isWeiXin();
        }
    };
    window.WaphomeFn = WaphomeFn;

})()
$(function () {
    var waphomeFn=new WaphomeFn()
    waphomeFn.init()
})