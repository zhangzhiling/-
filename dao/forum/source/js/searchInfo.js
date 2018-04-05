/*-------------------------------------------------------------------------
 * 作者：dongchunshui/zhangzhiling
 * 创建时间： 2018/1/21
 * 更新时间： 2018/1/25
 * 版本号：v1.0
 * 作用域:搜索结果页
 -------------------------------------------------------------------------*/
(function () {
    var userSearch = "/user/search/list";//用户搜索接口 
    var listShow = "/forum/search/list";//帖子列表搜索 
    var keywordToDB = "/forum/keyword";//搜索关键字入库接口
    var shenFenQiang = ['丹青妙笔', '妙语连珠', '点石成金', '官网记者', '优秀记者', '官网名记', '小作者', '签约作家', '优秀作家', '名人', '论坛之星'];
    var expVideo = new RegExp('(<EMBED|<embed)[^>]+(>|\/>)', 'g');  //视频个数正则表达式
    var expImg = new RegExp('(<IMG|<img)(?![^>]+class="emotion")(?![^>]+src="http://wanwd.gyyx.cn/Content/js/editor/dialogs/emotion)[^>]+(>|\/>)', 'g'); //图片个数正则表达式
    var searchNoContent = '' +
    '<div class="noSearchWrap js_noSearchWrap">' +
       '<div class="noSearchImg"></div>' +
       '<p class="noSearchTxt">换个关键词试试吧~</p>' +
       '<a href="/forum" target="_blank" class="goIndexLink">去首页逛逛</a>' +
    '</div>';
    
    function SearchInfo() {
        //嵌套注释,搜索功能函数
    }

    SearchInfo.prototype = {
        init: function () {
            var _this = this;
            if (!$(".search_listWrap .noSearchWrap").length) {
                $(".search_listWrap .msgTypeCont").append(searchNoContent);
            }
            //获取地址栏关键字搜索
            _this.getUrlKeyWordFn();
            _this.searchFun();
            _this.tabTrailEvent();
        },

        //帖子标签搜索结果
        searchPostListFun: function () {
            var _this = this;
            $(".js_searchList").show();
            if ($.trim($(".js_search_top_input").val()) == '') {//输入框为空，使用默认值进行搜素
                _this.searchPostListAjaxFn($(".js_top_search_recommends").html());//帖子默认关键词  
                _this.setNavTitleFn($(".js_top_search_recommends").html());
            } else {
                _this.searchPostListAjaxFn($.trim($(".js_search_top_input").val()));//帖子搜索词    
                _this.setNavTitleFn($.trim($(".js_search_top_input").val()));
            }
        },
        //用户名搜索结果
        searchUserListFun: function () {
            var _this = this;
            if ($.trim($(".js_search_top_input").val()) == '') {//输入框为空，使用默认值进行搜素
                 _this.searchUserListAjaxFn($(".js_top_search_recommends").html());//帖子默认关键词    
                _this.setNavTitleFn($(".js_top_search_recommends").html());
            } else {
                _this.searchUserListAjaxFn($.trim($(".js_search_top_input").val()));//帖子搜索词
                _this.setNavTitleFn($.trim($(".js_search_top_input").val()));
            }
        },
        //搜索--显示结果列表（帖子、用户）
        searchListFun: function (searchTpye) {
            var _this = this;
            $(".js_top_search_list").hide();
            switch (searchTpye) {
                case "thread":
                    _this.searchPostListFun();
                    break;
                case "user":
                    _this.searchUserListFun();
                    break;
                default:
                    $(".js_searchThread").hasClass("cur") ? _this.searchPostListFun() : _this.searchUserListFun();
                    break;

            }
        },
        //截取链接地址（搜索关键词）
        getQuery: function (name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
           
            if (r != null) {
                return r[2];
            }
            return null;
        },
        //自动填充地址栏关键字
        getUrlKeyWordFn: function () {
            var _this = this;
            var par = decodeURIComponent(window.location.search);
            var keyWord = _this.getQuery("keyWord", par);
            //解码
            keyWord = decodeURIComponent(keyWord);
            //进行搜索框填充,查询搜索结果
            $(".js_search_top_input").val(keyWord);
            $(".js_top_search_recommends").hide();
            _this.searchListFun();
        },
        //搜索操作
        searchFun: function () {
            var _this = this;
            //点击进行搜索
            $(".searchBtn").click(function () {
                _this.searchListFun();
            })
            //enter搜索（区别登录还是搜索回车）

            $(document).keydown(function (event) {
                var hasFocus = $('.js_search_top_input').is(':focus');
                if ($(".login_wrapper").is(":visible") && event.keyCode == 13) {
                    $(".js_ajaxLogin").click();
                } else if (!$(".login_wrapper").is(":visible") && event.keyCode == 13 && hasFocus) {
                        _this.searchListFun();

                }
            });
        },
        //导航标题赋值
        setNavTitleFn: function (searchTitle) {
            var getTitle = $(document).filterDevKeywordFn(searchTitle);//标题返回值过滤
            document.title = getTitle + " 搜索结果-道可道论坛";
        },

        // 将str中的html符号转义,默认将转义''&<">''四个字符，可自定义reg来确定需要转义的字符     
        unhtml: function (str) {
            return str ? str.replace(/[\&*<">^'(_)](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function (a, b) {
                if (b) {
                    return a;
                } else {
                    return {
                        '<': '&lt;',
                        '&': '&',  //避免帖子草稿时给&加转码
                        '"': '&quot;',
                        '>': '&gt;',
                        "'": '&#39;',
                        '(': '&#40;',
                        ')': '&#41;',
                        '*': '/*',
                        '^': '/^',
                        '\/': '\\',
                        '_': '_',
                        '|': '|',
                        '-': '-'
                    }[a]
                }

            }) : '';
        },
        
        //搜索用户列表
        searchUserListAjaxFn: function (word) {
            var _this=this;
            var paramObj = {
                keyword: word
            };
             _this.searchKeywordToDBAjaxFn(word);//搜索关键词入库    
            $(".js_searchList").html("");
            $(".js_searchList").ajaxPage({
                url: userSearch,
                type: "POST",
                pageObj: $("#tieInfo_Table_0_paginate"),
                pageIndex: 1,
                pageSize: 15,
                curPageCls: "paginate_active",               
                paramObj: paramObj,
                clickFn:function(){
                	 $(window).scrollTop(254)
                },
                dataFn: function (d) {
                	var userHtml="";                	
                	$(".comingSoon").show();
                	if (d.status == "success" && d.data && d.data.length > 0) {
                    	 var data=d.data;
                    		 $(".comingSoon,.js_noSearchWrap").hide();
                    		 $(".pageCut,.js_searchList").css("display","block");
                    		 for(var i=0,l =data.length ;i<l;i++){
                                 userHtml+='<li class="userSearchCon lf js_userSearchCon">';
                                    var nick = $(document).filterDevKeywordFn(data[i].nickname);    //昵称                                                 
                                         nick = nick?nick:"";  //昵称
                                        //标题关键词标红处理 
                                    var unHtmlWord=_this.unhtml(word);  
                                    var nickName = nick.replace(new RegExp(unHtmlWord, "gm"), "<font color='red' >" + word + "</font>");
                                    var fansAmount=data[i].followCount?data[i].followCount:"0"; //关注量
                                    var postCount=data[i].postCount?data[i].postCount:"0";  //发帖量
                                    var replyCount=data[i].replyCount?data[i].replyCount:"0";   //回帖量
                                    var gameInfoStr=data[i].areaName?data[i].areaName+'<span class="followLine">|</span>'+data[i].serverName+'<span class="followLine">|</span>'+data[i].roleName:"暂无游戏信息";//游戏信息  大区   服务器  角色
                                    var avatarUrl=data[i].avatarUrl?$(document).nickHeaderForScale(data[i].avatarUrl,"112","112"):"http://img.gyyxcdn.cn/dao/user/images/peop2.png";  //昵称图片地址 
                                    var userId=data[i].daoId;	//身份编号
                                    var urlLink=data[i].daoId?"/user?id="+data[i].daoId:"#";    //跳转链接地址
                                    var followStatus=data[i].followStatus?data[i].followStatus:"notFollowed";     //关注状态                                       			 
                                        userHtml+='<a class="searchUserLink" target="_blank" href="'+urlLink+'">'+
                                            '<div class="info_tx lf">'+
                                                '<img class="headImg" src="'+avatarUrl+'">'+
                                            '</div>'+
                                            '<div class="lf detailFor">'+
                                                '<p class="headNiakName js_headNiakName">'+nickName+'</p>'+
                                                '<p class="c99Font tc05_qsr">'+
                                                    gameInfoStr +
                                                '</p>'+                                            
                                            '</div>'+
                                        '</a>'+
                                        '<ul class="searchUserNum">'+
                                            '<li class="lf"><span class="js_follow_num" data-userinfoid="'+userId+'">'+fansAmount+'</span><span class="dhText">粉丝</span></li>'+
                                            '<li class="lf borderLR"><span class="tc05_thread">'+postCount+'</span><span class="dhText">发帖</span></li>'+
                                            '<li class="lf borderLR"><span class="tc05_post">'+replyCount+'</span><span class="dhText">回帖</span></li>'+
                                        '</ul>'+
                                        '<div class="clearFloat">';
                                            if(followStatus=="notFollowed"){
                                                userHtml+='<div class="lf followGropt js_follow_btn_wrap">'+
                                                    '<a class="follow js_followedBtn" data-userinfoid="'+userId+'" style="display:none;"><i></i>已关注</a>'+
                                                    '<a class="addFollow js_followBtn" data-insertHtml="false" data-status="true" data-userinfoid="'+userId+'"><i></i>加关注</a>'+
                                                    '<a class="eachOtherFollow js_follow_eachBtn" data-userinfoid="'+userId+'" style="display:none;"><i></i>互相关注</a>'+
                                                '</div>';
                                            }else if(followStatus=="followed"){
                                                userHtml+='<div class="lf followGropt js_follow_btn_wrap">'+
                                                    '<a class="follow js_followedBtn" data-userinfoid="'+userId+'"><i></i>已关注</a>'+
                                                    '<a class="addFollow js_followBtn" data-insertHtml="false" data-status="true" data-userinfoid="'+userId+'" style="display:none;"><i></i>加关注</a>'+
                                                    '<a class="eachOtherFollow js_follow_eachBtn" data-userinfoid="'+userId+'" style="display:none;"><i></i>互相关注</a>'+
                                                '</div>';
                                            }else if(followStatus=="eachOther"){
                                                userHtml+='<div class="lf followGropt js_follow_btn_wrap">'+
                                                    '<a class="follow js_followedBtn" data-userinfoid="'+userId+'" style="display:none;"><i></i>已关注</a>'+
                                                    '<a class="addFollow js_followBtn" data-insertHtml="false" data-status="true" data-userinfoid="'+userId+'" style="display:none;"><i></i>加关注</a>'+
                                                    '<a class="eachOtherFollow js_follow_eachBtn" data-userinfoid="'+userId+'"><i></i>互相关注</a>'+
                                                '</div>';
                                            }
                                            
                                      userHtml+='</div>'+
                                    '</li>';
                    		 }
                    	
                     }else{
                    	 $(".pageCut,.js_searchList,.comingSoon").hide();
                         $(".js_noSearchWrap").show(); 
                     }

                     if(userHtml==""){
            			 $(".pageCut,.js_searchList,.comingSoon").hide();
                         $(".js_noSearchWrap").show(); 
            		 }
                  return userHtml
                },
                successFn:function(){        			
        			//图片懒加载
                    $(document).imgLazyLoadExcuteFn(".js_searchList li img");
                }
            });
        },
        //帖子图片加载-图片等比例（降低复杂）
        detaiImgFn: function (Imgs, videoImgArr) {
            for (var im = 0; im < Imgs.length; im++) {
                if (videoImgArr.length < 3 && im < 3) {
                    //图片等比例
                    var sNewIm = global_main.globalFn.imgForScale(Imgs[im]);
                    //图片懒加载
                    sNewIm = sNewIm.replace("src", "_src");
                    videoImgArr.push(sNewIm);
                }
            }
            return videoImgArr;
        },
        //帖子列表页（降低复杂）
        detailDataFn: function (datasLen, datas, word) {
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
            var htmlLi = "";
            for (var i = 0; i < datasLen; i++) {
                var detailData = datas[i];
                var titles = $(document).filterDevKeywordFn(detailData.title); //标题
                //标题关键词标红处理   

                var unHtmlWord = _this.unhtml(word);
                var x = titles.replace(new RegExp(unHtmlWord, "gm"), "<font color='red' >" + unHtmlWord + "</font>");
                titles = x;
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
                    htmlLi += '<a target="_blank" href="/forum/thread?id=' + detailData.id + '" class="tit lf">' + newTitle + '</a>';
                } else {
                    htmlLi += '<a target="_blank" href="/forum/thread?id=' + detailData.id + '" class="tit lf">' + titles + '</a>';
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
                    //帖子图片等比例
                    _this.detaiImgFn(Imgs, videoImgArr)
                   
                }
                var testContent = $.trim(detailData.content.replace(/<\/?[^>]*>/g, '').replace(/\n[\s| | ]*\r/g, '\n').replace(/&nbsp;/ig, ''));
                if (testContent.length > 0 && detailData.category != "公告帖") {
                    if (videoImgArr.length > 0) {
                        htmlLi += '<p class="zhaiyao zhaiyaoPadForImg"><a target="_blank" href="/forum/thread?id=' + detailData.id + '">';
                    } else {
                        htmlLi += '<p class="zhaiyao"><a target="_blank" href="/forum/thread?id=' + detailData.id + '">';
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
                    htmlLi += '</ul><a target="_blank" class="videoZZc" href="/forum/thread?id=' + detailData.id + '"></a></div>';
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
                                    '<a target="_blank" class="clearFloar" href="/user?id=' + detailData.userInfo.id + '">' +
                                        '<span class="t_nickHead"><img class="headImg" src="' + nickHeadIMg + '" /></span>' +
                                        '<span class="t_nickUser">' + global_main.globalFn.nicknameCompleCode(nickName) + '</span>' +
                                    '</a>' +
                    '</span>';
                    if (detailData.userInfo.identityId > 0) {
                        htmlLi += '<span class="t_currentSf shenfenD' + detailData.userInfo.identityId + '"><i class="sfText">' +shenFenQiang[detailData.userInfo.identityId - 1] + '</i></span>';
                    } else {
                        if (global_main.globalFn.nicknameCompleCode(nickName) == "道姐") {
                            htmlLi += '<span class="t_currentSf daojiebq"><i class="sfText">道姐</i></span>';
                        } else if (global_main.globalFn.nicknameCompleCode(nickName) == "公告") {
                            htmlLi += '<span class="t_currentSf gonggaobq"><i class="sfText">公告</i></span>';
                        }
                    }
                    if (netType != null && netType != "null" && netType != "") {
                        htmlLi += '&nbsp;&nbsp;（<span class="t_server">' + netType + '</span>&nbsp;|&nbsp;<span class="t_qz">' +serverName + '</span>&nbsp;|&nbsp;<span class="t_nickNmae">' + detailData.userInfo.roleName + '</span>）';
                    }
                    htmlLi += '</p>';
                }
                //非公告帖时执行
                if (detailData.category != "公告帖") {
                    htmlLi += '<p class="tie_cz ri"><i class="cz numLook_Icon"></i><span class="look_num">' + pageViewNum + '</span><i class="cz num_pl"></i><span class="cz_num">' + replyNum + '</span></p></div>';
                }
                htmlLi += '</div></li>';
            }
            return htmlLi;
        },
        //搜索帖子列表
        searchPostListAjaxFn: function (word) {
            var _this = this;
            //接口参数
            var paramObj  = {
                keyword: word
            };

            _this.searchKeywordToDBAjaxFn(word);//搜索关键词入库         
           
            $(".js_searchList").html("");
            $(".js_searchList").ajaxPage({
                url: listShow,
                type: "POST",
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
                    $(window).scrollTop(254)
                },
                dataFn: function (d) {
                    var htmlLi = "";
                    $(".comingSoon").show();
                    if (d.status == "success") {
                        if (d.message == "无数据") {
                            //提示用户无结果
                            $(".js_noSearchWrap").show();
                            $(".comingSoon").hide();
                            return false;
                        }
                        var datas = d.data;
                        var datasLen = datas.length;
                        if (datasLen > 0) {
                            $(".js_noSearchWrap,.comingSoon").hide();
                            //列表数据拼接
                            htmlLi += _this.detailDataFn(datasLen, datas, word);
                        }
                        $(".js_searchList").show().html(htmlLi);
                        $(".pageCut").show();

                    } else {
                        $(".pageCut,.js_searchList,.comingSoon").hide();
                        $(".js_noSearchWrap").show();
                    }
                    return htmlLi;
                },
                successFn: function () {
                    //道具等级显示(腰缠万贯...)
                    $("body").on("mouseover", ".js_wealthsShow", function () {
                        $(this).find(".js_wealthNumTop").css("visibility", "visible")
                    });
                    $("body").on("mouseleave", ".js_wealthsShow", function () {
                        $(this).find(".js_wealthNumTop").css("visibility", "hidden")
                    });
                    //图片懒加载
                    $(document).imgLazyLoadExcuteFn(".js_img_wrap img");

                }
            });
        },
        //先选卡事件处理
        tabTrailEvent: function () {
            var _this = this;
            _this.tabMainClick();
        },
        //一级选项卡切换
        tabMainClick: function () {
            var that = this;
            $(".js_searchThreadTypes").show();
            $(document).on("click", ".tabMainSearch li", function () {
                var _this = $(this);
                $(".js_searchList").show().html(""); //清空列表数据

                $("#tieInfo_Table_0_paginate").html(""); //清空分页容器

                $(_this).siblings().removeClass("cur").end().addClass("cur");
               
                //搜索帖子
                if ($(_this).hasClass("js_searchThread")) {
                    //帖子搜索二级分类展示 默认选择第一个tab
                    $(".js_searchThreadTypes").show().find("li").removeClass("cur").end().find("li:first").addClass("cur");
                    // 帖子搜索二级分类隐藏

                    $(".js_searchUserTypes").hide();
                    that.searchListFun("thread");
                } else if ($(_this).hasClass("js_searchUser")) {//搜索用户  

                    //用户搜索二级分类展示 默认选择第一个tab
                    $(".js_searchUserTypes").show().find("li").removeClass("cur").end().find("li:first").addClass("cur");
                    // 用户搜索二级分类隐藏
                    $(".js_searchThreadTypes").hide();
                    that.searchListFun("user");
                } else {
                    $(".js_alertMsg").html("程序打盹了");
                    global_main.globalFn.tcCenter($(".alertMSG"));
                }
            })
        },
        //二级选显卡切换
        tabsecondClick: function () {
            //帖子搜索二级分类展示
            $(".js_searchThreadTypes li").click(function () {
                var _this = $(this);
                if ($(".tabMainSearch").attr("repeat") == "no") {

                    return false;
                }
                var _thisType = $(_this).attr("type");
                $(_this).siblings().removeClass("cur").end().addClass("cur");
                if (_thisType == "") {
                    $(".js_allMs,.dataTables_wrapper").hide();
                    $(".comingSoon").html("您暂无任内容").css("display", "block");
                    $(".typeMsg").attr("repeat", "yes");
                    return false;
                }
            });
        },
        //搜索关键词入库方法
        searchKeywordToDBAjaxFn: function (paramObj) {
            $.ajax({
                url: keywordToDB,
                type: "POST",
                dataType: "json",
                data: {
                    keyword: paramObj,
                    r: Math.random()
                },
                success: function () {
                    //搜索关键词入库方法
                }
            });

        }
    }
    window.searchInfo = function () {
        return new SearchInfo();
    }
})()
$(function () {
    searchInfo().init()
})