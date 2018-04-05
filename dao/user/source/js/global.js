/*-------------------------------------------------------------------------
 * 作者：maoxiangmin
 * 创建时间： 2017/5
 * 版本号：v1.0
 * 作用域：用户中心
 -------------------------------------------------------------------------*/

/*
 *
 * 顶级变量
 *
 * */
var nickNameRepeat=false;//昵称是否存在或合法
var timeSForPhone=''; //手机绑定倒计时
var myNewsSet=""; //弹幕消息间隔控制
var noReadMsg=[];
var global_main=(function(){
    /*
     * 变量控制
     *
     */
    var dmTrue=true;
    var shenfenDThis=null;//最近一次的用户身份图标类名
    var specificUser={
      "道姐":["url('http://img.gyyxcdn.cn/dao/user/images/daojieBgUser.jpg') no-repeat center top","光宇游戏","问道","社会你道姐","每分每秒都在活跃中","已经数不清楚了╮(╯_╰)╭","daojiebq"],
      "公告":["","光宇游戏","问道","官方公告","有公告的时候冒泡~","公告需要道行吗？","gonggaobq"]
    }
    function globalWeb(){
      var _this=this;
      
        /*
         * 接口定义
         *
         */
        this.globalPorts={
            //获取用户信息设置页
            checkUserInfo:"/user/member/info",

            //获取用户信息道行
            checkUserGames:"/user/profile/info",
            
            //是否有未读消息
            unread:"/user/profile/unread",
            
            //读取消息
            read:"/user/profile/read",
            
            //实时弹幕
            barrage:"http://conn.dao.gyyx.cn/barrage",

            //获取用户身份信息
            getUserTitle:"/user/profile/title",
            
            //我的礼物
            giftWall:"/user/profile/giftWall",

            //7天免登录o
            setLoginTime:"/user/session/setLoginTime",

            //获取任一用户信息
            userInfo:"/user/userInfo",
            //获取任一用户身份信息
            title:"/user/title",

            //用户中心账号状态检查
            checkLoginStatus:"/user/login/status",

            //用户中心账号退出
            logout:"/user/logout",

            //获取金银符数量
            wealth:"/wealth/user/wealth",

            //简单验证码
            easyCord:"http://api.gyyx.cn/Captcha/CreateVJ.ashx",
            
            //个人主页-获取消息列表
            messageList:"/user/profile/messageList",
            
            //回复评论，回复回贴
            commentInfo:"/forum/comment/info",
            
            //回复主贴，给回帖点赞
            postInfo:"/forum/post/info",

            //用户中心推荐图列表
            recommendpicList:"/forum/recommendpic/list",
            
            //当前用户与他人的关注关系
            getAttentionRelation:"/user/follow/info"  
        },

        /*
         * 全局方法
         *
         */
        this.globalFn={
          //防重复
          preventRepeat:function(obj,fn){
            if($(obj).attr("repeatForA")=="false"){
              if(fn){
                 fn();
              }
              return false;
            }
            $(obj).attr("repeatForA","false");
            return true;
          },
            
            //获取地址栏参数
            getLinkParamFn:function(name){
                var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                if(r!==null){
                    return  decodeURIComponent(r[2]);
                }else{
                    return null;
                }
            },

            //验证码倒计时
            settimeForYZM:function(obj,countTime){
                var countdown=countTime;
                    clearInterval(timeSForPhone);
                    
                timeSForPhone=setInterval(function() {
                    if (countdown == 0) {
                       clearInterval(timeSForPhone);
                        obj.prop("disabled",false);
                        obj.val("获取验证码");
                        countdown = countTime;
                        return false;
                    } else {
                        obj.prop("disabled",true);
                        obj.val("还差" + countdown + "s");
                        countdown--;
                    }
                },1000);
            },

            //昵称替换特殊除理并转码
            nicknameCompleCode:function(forNickname){
              return forNickname;
            },
            //时间转换
            formatDate:function(nS){
                var date = new Date(nS),
                    Y = date.getFullYear() + '/',
                    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/',
                    D = date.getDate(),
                    H=date.getHours()<10? '0'+date.getHours()+":" : date.getHours()+":",
                    Mi=date.getMinutes();
                if(D<10){
                    D="0"+D;
                }
                if(Mi<10){
                    Mi="0"+Mi;
                }
                return Y+M+D+"&nbsp;&nbsp;"+H+Mi;
            },
            
            //图片等比例缩放
            imgForScale:function(imgs){
              var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
              var imgSrc = imgs.match(srcReg);
              if(imgSrc[1]){
                imgs=imgs.replace(imgSrc[1],imgSrc[1]+"?imageView2/2/w/189/h/108");
              }
              //过滤脚本关键字
              imgs=$(document).filterDevKeywordFn(imgs);
              return imgs;
            },
            
            //获取当月天数
            getLastDay:function(year,month){
                var new_year = year;    //取当前的年份
                var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）
                if(month>12)            //如果当前大于12月，则年份转到下一年
                {
                    new_month -=12;        //月份减
                    new_year++;            //年份增
                }
                var new_date = new Date(new_year,new_month,1);                //取当年当月中的第一天
                var date_count =   (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月的天数
                return date_count;
            },

            //侧边导航固定
           navFixT:function(){
                if(location.pathname=="/forum/thread"){
                    $(".js_replyForumNavBtn").show(); //右侧回帖
                    $(".js_postForumNavBtn").hide(); //右侧发帖
                }else{
                  $(".js_replyForumNavBtn").hide(); //右侧回帖
                    $(".js_postForumNavBtn").show(); //右侧发帖
                }
                var navOffLeft=parseInt($(".conteCenter").css("margin-left").split("px")[0])+1225;
                var navOffRight=parseInt($(".conteCenter").css("margin-right").split("px")[0]);
                //金付钱提现边距取值
                var wealthWithdrawLeft=parseInt($(".conteCenter").css("margin-left").split("px")[0]);
                var wealthWithdrawRight=wealthWithdrawLeft+1225;
                //金符钱提取关闭按钮
                var wealthClose=$(".jinWealthWrap .js_jinWealth_close");
                wealthClose.off("click").on("click",function(){
                  $(this).parent().hide();//隐藏金符钱提现层
                });
                if(wealthWithdrawLeft>180){
                  $(".jinWealthWrap").css({
                    "right":wealthWithdrawRight+'px',
                        "left":"inherit",
                        "display":"block"
                    });
                }else{
                   $(".jinWealthWrap").css({
                         "right":"inherit",
                         "left":"23px",
                         "display":"block"
                     });
                }
                
                if(navOffRight>85){
                    $(".cbNav").css({
                        "right":"inherit",
                        "left":navOffLeft+'px',
                        "display":"block"
                    });
                }else{
                    $(".cbNav").css({
                        "left":"inherit",
                        "right":"23px",
                        "display":"block"
                    });
                }
            },
            
            //所有用户鼠标悬浮，展示用户信息
            checkEveryUserInfo:function(obj){
                var thisW=$(obj).width(),
                    thisOffsetTop=$(obj).offset().top,
                    thisOffsetLeft=$(obj).offset().left,
                    winCenter=$(window).width()/2,
                    liIndex=$(obj).parents(".handleForYouTie").index(),
                    forumIndex=$(obj).parents(".tieDetail").attr("nk");
                if(thisOffsetLeft<winCenter){
                    $(".js_sourceForNicePic .con").css({
                        "float":"right"
                    });
                    if((location.pathname.indexOf("/user/profile")>=0&&(liIndex==13||liIndex==14))||(location.pathname.indexOf("/forum")>=0&&(forumIndex==18||forumIndex==19))){
                         $(".js_sourceForNicePic").css({
                               "width":480+"px",
                               "top":(thisOffsetTop-200)+"px",
                               "left":(thisOffsetLeft)+thisW+"px"
                           });
                    }else{
                         $(".js_sourceForNicePic").css({
                               "width":480+"px",
                               "top":thisOffsetTop+"px",
                               "left":(thisOffsetLeft)+thisW+"px"
                           });
                    }
                 
                }else{
                    $(".js_sourceForNicePic .con").css({
                        "float":"left"
                    });
                    if((location.pathname.indexOf("/user/profile")>=0&&(liIndex==13||liIndex==14))||(location.pathname.indexOf("/forum")>=0&&(forumIndex==18||forumIndex==19))){
                        $(".js_sourceForNicePic").css({
                              "width":480+"px",
                              "top":(thisOffsetTop-200)+"px",
                              "left":(thisOffsetLeft-480-thisW)+"px"
                          });
                    }else{
                        $(".js_sourceForNicePic").css({
                              "width":480+"px",
                              "top":thisOffsetTop+"px",
                              "left":(thisOffsetLeft-480-thisW)+"px"
                          });
                    }
                  
                }
            },
            //弹层居中
            tcCenter:function(obj,fn){
                var w=$(window).width(),
                    h=$(window).height(),
                    objW=$(obj).width(),
                    objH=$(obj).height();
                $(obj).css({
                    "left":(w-objW)/2+'px',
                    "top":(h-objH)/2+'px'
                });
              //浏览器窗口改变时弹框居中显示-dcs
                $(window).resize(function(){
                   var r_w=$(window).width(),
                     r_h=$(window).height(),
                     r_obj=$(obj).width(),
                     r_objH=$(obj).height();
                  
                  $(obj).css({
                        "left":(r_w-r_obj)/2+'px',
                        "top":(r_h-r_objH)/2+'px'
                    });
                });
                $(".bgT").show();
                $(obj).show();
                if(fn){
                    fn();
                }
            },
            //身份墙移动
            identityWallMoveFn:function(){
              var ituLen=$("#shenFenTypes .itu").length,//身份墙当前总个数
                  widItu=$("#shenFenTypes .itu").eq(0).width()+3;//身份墙图标宽度
                $(".shenfes .yilun").click(function(){
                  var curItu=$(".js_cur").index(),
                      curMarginLeft=parseInt($("#shenFenTypes .itu").eq(0).css("margin-left").split("px")[0]);
                  if($(this).hasClass("zuoyi")){
                      if(curItu==0){
                          return false;
                      }
                      $("#shenFenTypes .itu").removeClass("js_cur").eq(curItu-1).addClass("js_cur").end().eq(0).css({
                          "margin-left":(curMarginLeft+widItu)+"px"
                      });
                  }else{
                      if(curItu==ituLen-7){
                          return false;
                      }
                      $("#shenFenTypes .itu").removeClass("js_cur").eq(curItu+1).addClass("js_cur").end().eq(0).css({
                          "margin-left":(curMarginLeft-widItu)+"px"
                      });
                  }
              });
              //修改用户身份信息
              $(".itu").click(function(){
                  if($(this).attr("class").indexOf("shenfen")>=0&&$(".shenfes").attr("keepRepeat")!="false"){
                      var titId=$(this).index()+1;
                      $(".shenfes").attr("keepRepeat",false);
                      userDynamic_main.userDynamicEventF.updateUserTitle(titId);
                  }
              });
            },
            //获取用户身份信息
            getUserTitle:function(){
              $.ajax({
                    url: _this.globalPorts.getUserTitle,
                    type: "get",
                    dataType: "JSON",
                    data: {
                        r: Math.random()
                    },
                    success:function(d){
                        if(d.status=="success"){
                          if($(".userInfo .userName").html()=="道姐"){
                            $(".shenfes .yilun").hide();
                            $(".rankInfo .currentSF").addClass("daojiebq");
                            $("#shenFenTypes").html('<span class="js_cur daojieSf"></span>');
                            return false;
                          }
                          if($(".userInfo .userName").html()=="公告"){
                            $(".shenfes .yilun").hide();
                            $(".rankInfo .currentSF").addClass("gonggaobq");
                            $("#shenFenTypes").html('<span class="js_cur gonggaoSf"></span>');
                            return false;
                          }
                          if(d.data.length>0){
                            var datas=d.data;
                            var ascheme='<span class="mr12 itu shenfenD12"></span>';
                              for(var i=0;i<datas.length;i++){                                
                                  if(i==0){
                                      //sfC-->当前使用身份
                                      $(".rankInfo .currentSF").addClass("shenfenD"+datas[i].titleId).attr("sfid",datas[i].titleId);
                                      //个人中心，当前使用
                                      if($(".UserInfoMain").length>0){
                                        $(".itu").eq(datas[i].titleId-1).addClass("shenfenD"+datas[i].titleId);
                                        if(datas[i].titleId==12&&!$("#shenFenTypes span").hasClass("shenfenD12")){
                                          $("#shenFenTypes").append(ascheme);
                                        }
                                      }
                                  }else{
                                      //个人中心
                                      //sf0-->已拥有身份,当前使用
                                      $(".UserInfoMain").length>0?$(".itu").eq(datas[i].titleId-1).addClass("shenfen0"+datas[i].titleId):"";
                                     if(datas[i].titleId==12&&!$("#shenFenTypes span").hasClass("shenfenD12")){
                                        $("#shenFenTypes").append(ascheme);
                                      }
                                      
                                  }
                              }
                          }
                      }
                    },
                    complete:function(){
                       global_main.globalFn.identityWallMoveFn();
                    }
                })


            },

            //获取用户信息
            checkUserInfo:function(){ 
                $.ajax({
                    url: _this.globalPorts.checkUserInfo,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        r: Math.random()
                    },
                    success:function(d){
                        if(d.status=="success"){
                            if(d.data&&d.data.nickname){
                              $("#infoEdit .nickname").val($(".js_nc").eq(0).text()).attr("readonly","readonly").attr("oldNickName",$(".js_nc").eq(0).text()).css({
                                "padding-left":"0",
                                "border":"0 none"
                              });
                            }
                            if(d.data&&d.data.roleName){
                              $(".quzu02").attr("netTypeCode",d.data.netTypeCode).attr("newNetTypeCode","").attr("areaName",d.data.areaName).attr("newAreaName","").html(d.data.areaName);
                              $(".server02").attr("serverId",d.data.serverId).attr("newServerId","").attr("serverName",d.data.serverName).attr("newServerName","").html(d.data.serverName);
                              $(".role02").attr("roleId",d.data.roleId).attr("newRoleId","").attr("roleName",d.data.roleName).attr("newRoleName","").html(d.data.roleName);
                              $(".userIns").show();
                            } 
                        }else{
                          $(document).errorDataOperateFn(d);  
                        }
                    }
                });
            },
        
        //获取用户游戏信息
        checkUserGames:function(){
                $.ajax({
                    url: _this.globalPorts.checkUserGames,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        r: Math.random()
                    },
                    success:function(d){
                            if(d.status=="success"){
                              var userNN=d.data.nickname;
                              var userGams=specificUser[userNN]
                              if(userGams){
                                if(userGams[0]){
                                   $(".userCenterMain").css('background',userGams[0]);
                                }
                                $(".quzu02").attr("netTypeCode",userGams[1]).html(userGams[1]);
                                $(".server02").attr("serverId",userGams[2]).html(userGams[2]);
                                $(".role02").attr("roleId",userGams[3]).html(userGams[3]);
                                $(".activeTable .active").html(userGams[4]);
                                $(".daohang .dh").html(userGams[5]);
                                $(".tc05 .hasSF .sf").addClass(userGams[6]);
                              }else{
                                    if(d.data.roleName){
                                      $(".quzu02").attr("netTypeCode",d.data.netTypeCode).html(d.data.areaName);
                                      $(".server02").attr("serverId",d.data.serverId).html(d.data.serverName);
                                      $(".role02").attr("roleId",d.data.roleId).html(d.data.roleName);
                                      $(".activeTable .active").html(d.data.activity);
                                      $(".daohang .dh").html(d.data.daoheng);
                                  }else{
                                      $(".detailsGame .daohang,.detailsGame .activeTable").css("visibility","hidden");
                                      $(".qsr").html("您还需要完善信息！").addClass("qsrNoInfos");
                                      $(".noGameI").css("display","block");
                                  }
                                }
                                $(".detailsGame").show();
                            }else if(d.status=="failed"){
                              $(".centerHeard .users").hide();
                              $(".centerHeard .userInfo").show();
                              $(".noGameI").css("display","block");
                              $(".detailsGame").remove();
                            }else{
                              $(document).errorDataOperateFn(d); 
                            }
                    },
                    error:function(){
                        //头部昵称获取判断
                        $(".centerHeard .users").hide();
                        $(".centerHeard .userInfo").show();
                        $(".noGameI").css("display","block");
                        $(".detailsGame").remove();
                    }
                });
        },
            
        //我的礼物
        giftWall:function(){
          $.ajax({
              url: _this.globalPorts.giftWall,
                    type: "GET",
                    dataType:"json",
                    data: {
                          r:Math.random()
                        },
                    success:function(d){
                      if(d.status=="success"&& d.data){
                        var datas=d.data;
                          var gifLen=datas.length,
                              gifAll="";
                            gifLen=gifLen>12?12:gifLen;
                        for(var i=0;i<gifLen;i++){
                          if(datas[i].giftId!=427&&datas[i].giftId!=428){
                              gifAll+='<li class="gi"><div class="fixdG"><img class="gPic lf" src="'+$(document).filterDevKeywordFn(datas[i].picUrl)+'" /><i class="giNum lf">';
                              gifAll+=datas[i].giftCount>99?'99+</i></div>':datas[i].giftCount+'</i></div>';
                              gifAll+='<p class="giName lf"><span class="nam">'+datas[i].giftName+'</span>x<span class="nms">'+datas[i].giftCount+'</span></p></li>'
                          }
                        }
                        $(".gitsInfo").removeClass("noGit").html(gifAll);
                      }else{
                        $(".gitsInfo").addClass("noGit").html("您还未收到任何礼物 ");
                      }
                    },
                    error:function(){
                      $(".gitsInfo").addClass("noGit").html("您还未收到任何礼物 ");
                    }
            });
        },
            
            //是否有未读消息
            unread:function(){
              $.ajax({
                type:"GET",
                    url:_this.globalPorts.unread,
                    data:{r:Math.random()},
                    success:function(d){
                      if(d.status=="success"||d.status=="offline_message"){
                        $(".ovF .icon2").addClass("iconEmailHas");
                         $(".dynamicCenter .msgs .icoMN").css("display","block");
                      }
                    }
              })
            },
            
            //读取消息
            read:function(){
              $.ajax({
                type:"POST",
                    url:_this.globalPorts.read,
                    data:{r:Math.random()},
                    success:function(){
                      //
                    }
              });
            },
           //实时弹幕
            barrage: function () {
                if (window.localStorage) {
                    //下次请求是否可以
                    try {
                        if (localStorage.getItem("isNextBarrage") == "false") {
                            setTimeout(function () {
                                _this.globalFn.barrage();
                            }, 1500)
                            return false;
                        }
                        localStorage.setItem("isNextBarrage", "false");
                    } catch (error) {
                        //
                    }
                }
              
            if (window.navigator.userAgent.indexOf("MSIE") >= 1) {
                var browser = navigator.appName
                var b_version = navigator.appVersion
                var version = b_version.split(";");
                var trim_Version = version[1].replace(/[ ]/g, "");
                if (browser == "Microsoft Internet Explorer" && trim_Version != "MSIE9.0") {
                    //下次请求是否可以
                    if (!dmTrue) {
                        return false;
                    }
                    dmTrue = false;

                }
            }
        
              $.ajax({
                type:"GET",
                    url:_this.globalPorts.barrage,
                    dataType:"jsonp",
                    data:{r:Math.random()},
                    jsonp:'callback',
                    success:function(d){
                      if(d.status=="offline_message"){
                        //消息总数
                        var msgAll="";
                      if(location.pathname=="/user/profile"){
                        msgAll='<p class="msgAlert">您有<span class="msgALL">'+d.data+'</span>条新消息，<a class="lookMsgs" href="#xx">请查看</a></p>'
                      }else{
                        msgAll='<p class="msgAlert">您有<span class="msgALL">'+d.data+'</span>条新消息，<a class="lookMsgs" href="/user/profile#xx" target="_blank">请查看</a></p>'
                      }
                      $(".myNews .xxts").html(msgAll);
                      //消息位置
                          $(".myNews").fadeIn();
                          $(".myNews .xxNew").hide();
                          $(".ovF .icon2").addClass("iconEmailHas");
                          
                          setTimeout(function(){
                                 $(".myNews").fadeOut();
                              //弹幕循环
                               dmTrue=true;
                               if(window.localStorage){
                                 localStorage.setItem("isNextBarrage","true");
                               }
                              _this.globalFn.barrage();
                              clearTimeout(myNewsSet);
                            },3000);
                      }
                      if(d.status=="success"){
                        //实时弹幕
                        var datas=d.data;
                            var dataD=datas;
                            var gifD="";
                            var arrHtml = [];
                            for(var i=0;i<dataD.length;i++){
                              switch(dataD[i].type){
                                case "top": //置顶
                                  gifD='<p class="qyXx">您有帖子被置顶</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "best": //精品
                                  gifD='<p class="qyXx">您有帖子被推选为精品</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "goldchest"://金宝箱
                                case "silverchest"://银宝箱  
                                  gifD='<p class="qyXx baoxNews"><span class="gxn">恭喜您</span><span class="boxGifName">'+dataD[i].content+'</span></p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "gift": //被赠礼物
                                  gifD='<p class="newMsg xxNew">'+
                                      '<span class="gxn">恭喜您收到</span> <a href="javascript:void(0)" class="soucerName">'+dataD[i].fromNickname+'</a>'+
                                   '</p>'+
                                     '<p class="newMsgLX xxNew"><span class="zsd">赠送的</span>'+dataD[i].content+'</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "replyThread":   //主贴被回复
                                case "replyPost":     //回帖被回复
                                case "replyComment":  //评论被回复
                                  gifD='<p class="qyXx"><span class="fromNick">'+dataD[i].fromNickname+'</span><span>回复了您</span></p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "praiseThread":   //主贴被赞
                                case "praisePost":   //回帖被赞
                                  gifD='<p class="qyXx"><span class="fromNick">'+dataD[i].fromNickname+'</span><span>赞了您的帖子</span></p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "praiseComment":  //评论被赞
                                  gifD='<p class="qyXx"><span class="fromNick">'+dataD[i].fromNickname+'</span><span>赞了您的评论</span></p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "forbidden":   //被禁言
                                  gifD='<p class="qyXx">您的账号已被禁言</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "removeForbidden":  //被解禁言
                                  gifD='<p class="qyXx">您的账号已被解除禁言</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "hideThread":  //主贴被隐藏
                                  gifD='<p class="qyXx">您的帖子被隐藏</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "hidePost":  //回贴被隐藏
                                  gifD='<p class="qyXx">您的回帖被隐藏</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                  
                                case "hideComment":  //评论被隐藏
                                  gifD='<p class="qyXx">您的评论被隐藏</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                case "suspend":  //账号被封停
                                  gifD='<p class="qyXx">您的账号已被封停</p>';
                                  arrHtml.push(gifD);
                                  continue;
                                default://关注
                                  var nickName=$("#testForNickname").html(dataD[i].fromNickname).text();
                                  nickName=nickName.length>=4?nickName.substring(0,4)+'...':nickName;
                                  gifD='<p class="qyXx"><span class="fromNick">'+nickName+'</span><span>'+dataD[i].content+'</span></p>';
                                  arrHtml.push(gifD);
                                  continue;
                              }
                          }
                          
                          noReadMsg=noReadMsg.concat(arrHtml);

                          //存在消息
                          if(window.localStorage){
                            localStorage.setItem("noReadBarrage",noReadMsg.join("&&&&"));
                          }  

                          if(navigator.appVersion .split(";")[1].replace(/[ ]/g,"")!="MSIE9.0"){
                            //当前页数据显示
                            var tt=0; //第一条数据时，定时器间隔为0，即立刻执行
                            var num=0; //默认读取第一条数据时的标识
                            var myBarrageSet=setInterval(function(){
                              
                              if(arrHtml[num]){
                                //处理异常不请求
                                localStorage.setItem("isNextBarrage","false");
                                dmTrue=false;
                                $(".ovF .icon2").addClass("iconEmailHas");
                                $(".dynamicCenter .msgs .icoMN").css("display", "block");
                                
                                $(".myNews .xxts").html(arrHtml[num]);
                                $(".myNews").fadeIn();
                                //3s后当前弹幕消息消失并重新请求下次弹幕
                                setTimeout(function(){
                                  $(".myNews").fadeOut();
                                },3000)
                              }else{
                                dmTrue=true;
                                clearInterval(myBarrageSet);
                                //重新请求处理!ie9和localstorage同时存在时下次请求
                                if(window.localStorage){
                                  //多页签
                                     //等待显示全部完成
                                     var waitTime=0;
                                     var waitAgain=setInterval(function(){
                                         waitTime++;
                                       //等待时间过长重新请求
                                      if(waitTime==15){
                                        localStorage.setItem("isNextBarrage","true");
                                        clearInterval(waitAgain);
                                        _this.globalFn.barrage();
                                      }else{
                                        if(localStorage.getItem("isNextBarrage")=="true"){
                                          clearInterval(waitAgain);
                                          _this.globalFn.barrage();
                                        }
                                      }
                                     },1000)

                                }else{
                                  //单页签
                                  _this.globalFn.barrage();
                                }
                              }
  
                              //除去第一条数据三秒后开始下一次读取
                              if(num==0){
                                tt=3000;
                              }
                              num++;
  
                            },tt)
                          }

                      }else{
                         //弹幕循环
                          myNewsSet=setTimeout(function(){
                              //弹幕循环
                            dmTrue=true;
                            if(window.localStorage){
                              localStorage.setItem("isNextBarrage","true");
                            }
                            _this.globalFn.barrage();
                            clearTimeout(myNewsSet);
                          },1500);
                      }
                    },
                    error:function(){
                      myNewsSet=setTimeout(function(){
                        //弹幕循环
                        dmTrue=true;
                        if(window.localStorage){
                          localStorage.setItem("isNextBarrage","true");
                        }
                        _this.globalFn.barrage();
                        clearTimeout(myNewsSet);
                      },1500);
                    }
              });
            },

            myLocalStorage:function(){
              //所属页显示
              var handle_storage=function(e){
                if(e.key=="noReadBarrage"&&e.newValue!=""){
                      $(".ovF .icon2").addClass("iconEmailHas");
                      $(".dynamicCenter .msgs .icoMN").css("display", "block");
                     
                      //解决多页面同时取数据存在的疑惑为空
                      setTimeout(function(){
                        var getMsgArrar=localStorage.getItem("noReadBarrage").split("&&&&");
                          //第一条数据时，定时器间隔为0，即立刻执行
                        var ttim=0;
                        var numT=0; //默认读取第一条数据时的标识
                        var myBarrageSet=setInterval(function(){
                          if(getMsgArrar[numT]){
                            $(".ovF .icon2").addClass("iconEmailHas");
                            $(".dynamicCenter .msgs .icoMN").css("display", "block");
                           
                            $(".myNews .xxts").html(getMsgArrar[numT]);
                            $(".myNews").fadeIn();
                            //3s后当前弹幕消息消失并重新请求下次弹幕
                            setTimeout(function(){
                              $(".myNews").fadeOut();
                            },3000)
                          }else{
                            clearInterval(myBarrageSet);
                              //处理正在请求中的防止重复请求
                            if(localStorage.getItem("isNextBarrage")=="true"||dmTrue){
                                setTimeout(function(){
                                  localStorage.setItem("isNextBarrage","true");
                                  dmTrue=true;
                                  _this.globalFn.barrage();
                                },3000)
                            }
                            return false;
                          }
                          //除去第一条数据三秒后开始下一次读取
                          if(numT==0){
                            ttim=3000;
                          }
                          numT++;
                        },ttim)
                   },500)
                }
              };
              
              if(window.addEventListener){
                  window.addEventListener("storage",handle_storage,false); 
                  window.addEventListener("setItemEvent",handle_storage,false); 
              }else if(window.attachEvent){
                  window.attachEvent("onstorage",handle_storage); 
                  window.attachEvent("setItemEvent",handle_storage);
              }
            },
            
            //登录状态检查 
            //sucStatusfn: status 为 success 时执行函数
            //errStatusFn: status 为 非success 时执行函数
            //completeFn: ajax的 complete 回调函数中 执行函数 如：帖子相关功能等 和登录状态无关功能
            checkLoginStatus:function(sucStatusfn,errStatusFn,completeFn){
               $.ajax({
                    type:"GET",
                    url:_this.globalPorts.checkLoginStatus,
                    data:{r:Math.random()},
                    success:function(d){
                      //登录成功执行函数
                      if(d.status=="success"){
                        $("body").data("islogin",true);
                        if(sucStatusfn){
                          sucStatusfn(d);
                        }
                      }else{                        
                        //登录状态异常操作
                        global_main.globalFn.callBackErrStatusOpreFn(d,errStatusFn);
                      }
                    },
                    error:function(){
                        $(".centerHeard  .users").show();
                    },
                    complete:function(){
                      if(completeFn){
                        completeFn();
                      }
                    }
                });
            },
            //返回值d.status 不是 success 异常处理
            callBackErrStatusOpreFn:function(d,options){
              var defaultFn = {
                suspendFn:function(d){
                   $(".centerHeard .userInfo").show();
                   $(".centerHeard .users,.centerHeard .users .js_userLogin").hide();
                  //封停原因提示层
                  global_main.globalFn.suspendReasonTipFn(d.message);
                  //个人中心页面
                  if(location.pathname=='/user/profile'){
                    //名片头像
                    $(".usStatus .usL").attr("src","http://img.gyyxcdn.cn/dao/user/images/peop2.png");
                    //名片清空昵称
                    $(".usStatus .usN").html("");
                    //名片账号隐藏
                    $(".usStatus .accnt").hide();
                  }
                  $(".users").show();

                },  
                noLoginFn:function(){      
                  //未登录状态处理程序
                   $(".centerHeard .userInfo").hide();
                   $(".centerHeard .users,.centerHeard .users .js_userLogin").show();
                  login_main.showLogin();
                  //个人中心页面
                  if(location.pathname=='/user/profile'){
                    //名片头像
                    $(".usStatus .usL").attr("src","http://img.gyyxcdn.cn/dao/user/images/peop2.png");
                    //名片清空昵称
                    $(".usStatus .usN").html("");
                    //名片账号隐藏
                    $(".usStatus .accnt").hide();
                  }
                  $(".users").show();
                },
                unNickNameFn:function(){
                  //用户未设置昵称
                },
                
                needPasswdFn:function(){
                  //未设置密码
                },
                notUsedFn:function(){
                  //未同步函数
                },
                //未知错误状态处理程序
                unknownErrFn:function(d){
                  $(document).popErrorF({
                    type:"open",
                    tip:d.message
                  }); 
                }
              };
              $.extend(defaultFn,options);
              $("body").data("islogin",true);
              if(d.status=="suspend"){     //封号
                defaultFn.suspendFn(d);
                
              }else if(d.status=="incorrect-login"){  //未登录
                $("body").data("islogin",false);
                defaultFn.noLoginFn(d);
                
              }else if(d.status=="needPasswd"){  //没有设置密码
              
                defaultFn.needPasswdFn();
                
              }else if(d.status=="incorrect-nickName"){//用户未设置昵称
              
                defaultFn.unNickNameFn();
                
              }else if(d.status=="notUsed"){  //旧用户没有同步信息
                
                defaultFn.notUsedFn(d);
                
              }else if(d.status=="unknown_error"||d.status=="failed"){  //未知错误
                
                defaultFn.unknownErrFn(d);
              }

            },
            //账号注销
            logoutFn:function(){
              $.ajax({
                   url:_this.globalPorts.logout,
                   type: "POST",
                   dataType: "JSON",
                   data: {
                      r:Math.random()
                   },
                   success:function(d){
                     if(d.status=="success"){
                       window.location.reload();
                     }
                   }
                })
            },
            //签到
            signData:function(that){
                if($(that).attr("keepRepeat")=="false"){
                    return false;
                }
                $(that).attr("keepRepeat","false");
                $.ajax({
                    url:_this.globalPorts,
                    type:"post",
                    dataType:"json",
                    data:{
                        r:Math.random()
                    },
                    success:function(){
                      //
                    },
                    complete:function(){
                        $(that).attr("keepRepeat","true");
                    }
                });
            },

            //7天免登录选择
            sevenChoose:function(that){
                var resultYN=2;
                if($(that).hasClass("y")){
                    resultYN=1;
                }
                $.get(_this.globalPorts.setLoginTime,{result:resultYN,r:Math.random()},function(d){
                    if(d.status=="success"){
                        $(".tc01").remove();
                        $(".bgT").hide();
                    }
                });
            },
          //当前用户与他人的关注关系
            getAttentionRelation:function(otherId){
              $.ajax({
                type:"GET",
                    url:_this.globalPorts.getAttentionRelation,
                    data:{
                      r:Math.random(),
                      id:otherId
                    },
                    success:function(d){
                      $(".myinfos .js_follow_btn_wrap a").hide();
                      $(".myinfos .js_follow_btn_wrap .js_guanzu").hide();
                      if(d.status=="success"){
                        var dataStatus=d.data.followStatus;
                          if(dataStatus=="notFollowed"){
                            //未关注
                            $(".myinfos .js_follow_btn_wrap .js_followBtn").show();
                            $(".js_sourceForNicePic .js_follow_num").html(d.data.fansAmount);
                          }else if(dataStatus=="followed"){
                            //已关注
                            $(".myinfos .js_follow_btn_wrap .js_followedBtn").show();
                            $(".js_sourceForNicePic .js_follow_num").html(d.data.fansAmount);
                          }else if(dataStatus=="eachOther"){
                            //互相关注
                            $(".myinfos .js_follow_btn_wrap .js_follow_eachBtn").show();
                            $(".js_sourceForNicePic .js_follow_num").html(d.data.fansAmount);
                          }
                      }else{
                          $(".myinfos .js_follow_btn_wrap a").hide();
                          $(".myinfos .js_follow_btn_wrap .js_guanzu").hide();
                          $(".myinfos .js_follow_btn_wrap .js_followBtn").show();
                      }
                    
                    },
                    error:function(){
                      //请求失败
                      $(".myinfos .js_follow_btn_wrap a").hide();
                      $(".myinfos .js_follow_btn_wrap .js_guanzu").hide();
                      $(".myinfos .js_follow_btn_wrap .js_followBtn").show();
                    }
                    
              });
            },
            //获取任一用户信息
            userInfo:function(userid){
                $.ajax({
                    url:_this.globalPorts.userInfo,
                    type:"GET",
                    dataType:"json",
                    data:{
                        id:userid,
                        r:Math.random()
                    },
                    success:function(d){
                        if(d.status=="success"){
                          var usNicN=d.data.nickname;
                            $(".tc05 .headNiakName").html(usNicN);
                            $(".tc05 .nicka,.tc05 .headFa,.tc05 .myPage").attr("href","/user?id="+d.data.id);
                            $(".myinfos .js_follow_btn_wrap a,.js_sourceForNicePic .js_follow_num").attr("data-userinfoid",d.data.id)//名片加关注按钮，关注量自增，加用户id号属性
                            //名片关注显示
                            _this.globalFn.getAttentionRelation(d.data.id);
                            if(d.data.avatarUrl){
                              var avatM=$(document).filterDevKeywordFn(d.data.avatarUrl)
                                $(".tc05 .headImg").attr("src",avatM);
                            }else{
                               $(".tc05 .headImg").attr("src","http://img.gyyxcdn.cn/dao/user/images/tc_tx.png");
                            }

                            var userGamsInfo=specificUser[usNicN]
                            if(userGamsInfo){
                                 $(".tc05 .daohang .tc05_dh").css("width","246px");
                                 $(".tc05 .daohang .dhText").html("道&nbsp;&nbsp;&nbsp;行&nbsp;:&nbsp;");
                                 $(".tc05 .myinfos").css("margin","30px 0 0 70px");
                                 $(".tc05 .headNiakName").html(usNicN);
                                 $(".tc05_quzu02").html(userGamsInfo[1]);
                                 $(".tc05_server02").html(userGamsInfo[2]);
                                 $(".tc05_role02").html(userGamsInfo[3]);
                                 $(".tc05_active").html(userGamsInfo[4]);
                                 $(".tc05_dh").html(userGamsInfo[5]);
                                 $(".tc05 .hasSF .sf").addClass(userGamsInfo[6]);
                            }else{
                               if(d.data.roleName){
                                     $(".tc05_quzu02").html(d.data.areaName);
                                     $(".tc05_server02").html(d.data.serverName);
                                     $(".tc05_role02").html(d.data.roleName);
                                     $(".tc05_dh").html(d.data.daoheng);
                                     $(".tc05_active").html(d.data.activity);
                                 }else{
                                      $(".tc05_quzu02").html("暂无");
                                      $(".tc05_server02").html("暂无");
                                      $(".tc05_role02").html("暂无");
                                      $(".tc05_dh").html("0");
                                      $(".tc05_active").html("0");
                                 }
                            }
                        }else{
                            $(".tc05 .headNiakName").html("昵称未设置");
                            $(".tc05 .myPage,.tc05 .headFa").attr("href","/user?id=");
                            $(".tc05 .nicka").attr("href","javascript:void(0)");
                            $(".tc05 .headImg").attr("src","http://img.gyyxcdn.cn/dao/user/images/tc_tx.png");
                            $(".tc05_quzu02").html("暂无");
                            $(".tc05_server02").html("暂无");
                            $(".tc05_role02").html("暂无");
                            $(".tc05_dh").html("0");
                            $(".tc05_active").html("0");
                        }
                    },
                    error:function(){
                        $(".tc05 .headNiakName").html("昵称未设置");
                        $(".tc05 .myPage,.tc05 .headFa").attr("href","/user?id=");
                        $(".tc05 .nicka").attr("href","javascript:void(0)");
                        $(".tc05 .headImg").attr("src","http://img.gyyxcdn.cn/dao/user/images/tc_tx.png");
                        $(".tc05_quzu02").html("暂无");
                        $(".tc05_server02").html("暂无");
                        $(".tc05_role02").html("暂无");
                        $(".tc05_dh").html("0");
                        $(".tc05_active").html("0");
                    },
                    complete:function(){
                      $(".js_sourceForNicePic .con .conDE").show();
                      $(".js_sourceForNicePic .loadingForInfos").hide();
                    }
                });
            },

            //获取任一用户身份信息
            title:function(userid){
                $.ajax({
                    url:_this.globalPorts.title,
                    type:"GET",
                    dataType:"json",
                    data:{
                        id:userid,
                        r:Math.random()
                    },
                    success:function(d){
                        if(d.status=="success"){
                            if(d.data.length>0){
                                shenfenDThis="shenfenD"+d.data[0].titleId;
                                $(".hasSF .currentSF").addClass("shenfenD"+d.data[0].titleId).attr("sfid",d.data[0].titleId);
                            }else{
                              if(shenfenDThis!=null){
                                $(".hasSF .currentSF").removeClass(shenfenDThis);
                              }
                                $(".hasSF .currentSF").removeAttr("sfid");
                            }
                        }else{
                          if(shenfenDThis!=null){
                            $(".hasSF .currentSF").removeClass(shenfenDThis);
                          }
                            $(".hasSF .currentSF").removeAttr("sfid");
                        }
                    },
                    error:function(){
                      if(shenfenDThis!=null){
                        $(".hasSF .currentSF").removeClass(shenfenDThis);
                      }
                        $(".hasSF .currentSF").removeAttr("sfid");
                    }
                });
            },

            //交易记录的时间查询年月选择
            choosePayForYarMou:function(){
                var options="";
                var tadatCent=new Date();
                var atYear=tadatCent.getFullYear();
                var atMouth=tadatCent.getMonth()+1;
                var allDays=_this.globalFn.getLastDay(atYear,atMouth);
                for(var i=0;i<3;i++){
                    if(atMouth<9){
                        options+='<option sp="'+atYear+'-0'+(atMouth-i)+'-01,'+atYear+'-0'+(atMouth-i)+'-'+allDays+'">'+atYear+'年'+(atMouth-i)+'月</option>';
                    }else{
                        options+='<option sp="'+atYear+'-'+(atMouth-i)+'-01,'+atYear+'-'+(atMouth-i)+'-'+allDays+'">'+atYear+'年'+(atMouth-i)+'月</option>';
                    }
                }
                $(".cx .selTimes").html(options);
            },
            //获取金银符数量处理超长
            numMore:function(dataNum, NumWord) {
                   if (dataNum > 100000000) {
                       NumWord.html (Math.floor((parseInt(dataNum) / 100000000) * 10) / 10 + "亿");
                   } else if (dataNum > 10000000) {
                       NumWord.html ( Math.floor((parseInt(dataNum) / 10000000) * 10) / 10 + "千万");
                   } else if (dataNum > 10000) {
                       NumWord.html ( Math.floor((parseInt(dataNum) / 10000) * 10) / 10 + "万");
                   } else {
                       NumWord.html(dataNum)
                     }
                  },

            //获取金银符数量
            wealth:function(){
                $.ajax({
                    url:_this.globalPorts.wealth,
                    type:"GET",
                    dataType:"json",
                    data:{
                        r:Math.random()
                    },
                    success:function(d){
                        if(d.status=="success"){
                            //用户中心-个人页
                            //超过万和亿的处理
                            global_main.globalFn.numMore(d.data.jinfu, $(".gamesInfo .jinfu,.myRank .jinfu"));//金元宝
                            global_main.globalFn.numMore(d.data.yinfu, $(".gamesInfo .yinfu,.myRank .yinfu"));//银元宝
                            
                        }
                    },
                    error:function(){
                      $(".gamesInfo .jinfu,.myRank .jinfu").html("...");
                      $(".gamesInfo .yinfu,.myRank .yinfu").html("...");
                    }
                });
            },
            //论坛活动函数---论坛资格赛活动
            daoActionPopFn:function(type){
              if(type=="success"){
                    global_main.globalFn.tcCenter($(".js_savePopUserInfo"));
              }
              //客户端类型
              var clientType = $(document).checkClientIsWabOrPcFn();
              //pc端
              if(clientType=="pc"){
                $(".js_savePopUserInfo").removeClass("wap");
                //滚动条
                    var actionScroll = new $.ym.Scrollbar($(".js_action_scrollBar"), {
                        scontainer: $(".js_action_scroll"),
                        arrowUp: $('.arrowUp'),  // 向上箭头
                        arrowDown: $('.arrowUp'),  // 向下箭头
                        track: '.track', // 滑道
                        thumb: '.thumb',  // 滑块
                        direction: 'vertical', // 方向[horizontal vertical]
                        autoCaculation: true  // 是否自动计算滚动条比例
                    });
                    actionScroll.reset();
              }else{
                $(".js_savePopUserInfo").addClass("wap");
              }

                //关闭按钮
                $(".js_closeForUserInfo").click(function(){
                  window.location.href="http://dao.gyyx.cn";
                });
            },
            //封号原因弹层提示函数
            suspendReasonTipFn:function(reason){
              //封停原因
            var reasonAll = reason;
            var reasonCut = reason.length>5?reason.substring(0,5)+"...":reason;
        
            $(document).popErrorF({
              type:"open",
              tip:'<span class="suspend">您的账号因"<a title="'+reasonAll+'">'+reasonCut+'</a>"被限制登录</span><span class="suspend">如有疑问请联系<a class="link" target="_blank" href="http://kf.gyyx.cn/Home/IMIndex">在线客服</a></span>',
              closeFn:function(){
                  global_main.globalFn.logoutFn();	
              }
            }); 
          
            },
            //用户信息展示
            showTopNickNameFn:function(data,first){
              $(".centerHeard .userInfo").show();//隐藏用户信息
          $(".centerHeard .users").hide(); //展示贴吧登录容器
          var headUrl="http://img.gyyxcdn.cn/dao/user/images/peopleBg.png";
          var headNcik="未设置昵称";
          if(data){
            headUrl=data.avatarUrl?$(document).filterDevKeywordFn(data.avatarUrl):headUrl;
            headNcik=data.nickname?data.nickname:"未设置昵称"; //头像昵称
          }
          if(headNcik=="未设置昵称"){
             $(".js_nc").hover(function(){
                      $(this).css("text-decoration","underline");
                    },function(){
                      $(this).css("text-decoration","none");
                  });
              }
           $(".usStatus .usL,.userInfo .icon,.js_touxiang").attr("src",headUrl);
           $(".js_nc").html(headNcik).attr("href","/user/member/?source="+encodeURIComponent(window.location.href)).attr("title",$(".js_nc").eq(0).text());
           
            if(location.pathname.indexOf("/forum")<0&&$("#js_otherInfoMainOnly").length==0){
               document.title =$(".js_nc").eq(0).text()+"的个人中心";
            }
              if(first=="first"){
                 if(data.nickname){
                 nickNameRepeat=true;
                     //头部昵称获取判断
                     var userNN=global_main.globalFn.nicknameCompleCode(data.nickname);
                     //个人中心-->userDynamic.vm
                     if($("#userCenterMain").length>0){
                       $(".usStatus .usN").html(userNN).attr("title",$(".usStatus .usN").text());
                         $(".noGameI").remove();
                         $(".detailsGame").show();
                     }
                     $(".hint").remove();
                     //个人中心编辑-userInfo.vm
                     if($("#userInfoMain").length>0){
                        userNN=="道姐"?$(".userInfoMain").css('background','url("http://img.gyyxcdn.cn/dao/user/images/daojieBgInfo.jpg") no-repeat center top'):"";
                        $("#infoEdit .nickname").val($(".js_nc").eq(0).text()).attr("readonly","readonly").attr("oldNickName",$(".js_nc").eq(0).text()).css({
                            "padding-left":"0",
                            "border":"0 none"
                        });
                     }
              }else{
                if($("#userCenterMain").length>0){
                      $(".usStatus .usN").html("未设置昵称").attr("title","未设置昵称");
                      $(".noGameI").css("display","block");
                   }
                     //头部昵称获取判断
                     $(".centerHeard .users").hide();
                     $(".centerHeard .userInfo").show();
              }
              }

            },
            //用户中心推荐图列表接口调用
            recommendpicListAjax:function(type){
              $.ajax({
                      type:"GET",
                          url:_this.globalPorts.recommendpicList,
                          data:{
                            r:Math.random(),
                            type:type
                          },
                          success:function(d){
                            if(d.status=="success" && d.data){
                                var datas=d.data;
                                var bannersImg="";
                                for (var i = 0; i < datas.length; i++) {
                                    var ImgUrl = datas[i].picUrl;//图片地址
                                    var ImgLinkUrl = datas[i].picRedirect;//图片链接地址
                                    bannersImg += '<a class="aDImge" href="' + ImgLinkUrl + '" target="_blank"><img src="' + ImgUrl + '" /></a>'
                                }
                                if (type == 'usercenter') {
                                    $(".js_bannersImg").html(bannersImg);
                                } else {
                                    $(".ggw").html(bannersImg);
                                }
                                			
                            }
                          }
                  });
            },
            
            //长轮循（礼物实时榜、弹幕）优化
            longPollingFn:function(){
                //页面加载完毕后长轮,礼物实时榜，弹幕
                  window.onload = function () {                     
                      location.pathname =="/forum/thread"?daoForumInfo().getGifHtmlCodeFn():"";
                      global_main.globalFn.barrage();	//页面加载完毕后长轮循弹幕开始 
                  }
            }
        }
    }

    return new globalWeb;
})();


$(function(){    
  if(location.pathname!="/forum/thread"){
    //发帖
    daoForum().init(".js_post,.js_postForumNavBtn"); //首页主按钮、非详细页右侧发帖按钮                  
  }
  //长轮循（礼物实时榜、弹幕）优化
  global_main.globalFn.longPollingFn();
  //页面初始加载 登录状态检查
  global_main.globalFn.checkLoginStatus(function(d){
      if (window.localStorage) {
          global_main.globalFn.myLocalStorage();
          //初始化数据
          if (localStorage.getItem("noReadBarrage")) {
              localStorage.setItem("noReadBarrage", "");
          }
          if (localStorage.getItem("isNextBarrage")) {
              localStorage.setItem("isNextBarrage", "true");
          }
      }

    //首次加载页面允许后续操作
        if(d.data){
          global_main.globalFn.showTopNickNameFn(d.data,"first")//用户信息展示
            //未读消息状态
            global_main.globalFn.unread();
            //账号中心页
            if(d.data.flag){
              global_main.globalFn.tcCenter($(".tc01"));
                $(".bgT,.tc01").show();
            }else{
                $(".tc01").hide();
            }

            if(location.pathname=="/user/member/"){
              //获取用户个人名片信息
              global_main.globalFn.checkUserInfo();
           }
            
            if($("#userCenterMain").length>0){
               //获取用户游戏信息
               global_main.globalFn.checkUserGames();
              //获取金银符数量
                global_main.globalFn.wealth();
               //获取用户身份信息
                global_main.globalFn.getUserTitle();
                //获取用户礼物墙
                global_main.globalFn.giftWall();
            }
            //领取奖励活动
            reWard().init({
              "isShow":true,
              "isLogin":true
            });
        }
    
    //消息查看地址或其它页转入
    if(location.pathname=='/user/profile'){
      //地址栏跳转对应
           if(location.hash.indexOf("#xx")==0){
           $(".typeMsg .msgs").click();
           
         }else{
           userFeedDynamic().init();//个人中心动态列表页面
         }           
      $(".myNews .lookMsgs,.userInfo .icon2").attr("href","#xx");
      $(".newsTarget").attr("href", "#xx");
    }else{
        $(".myNews .lookMsgs,.userInfo .icon2").attr("href", "/user/profile#xx").attr("target", "_blank");
        $(".newsTarget").attr("href", "/user/profile#xx").attr("target", "_blank");
    }

  },{
    suspendFn:function(d){     
      //封停原因提示层
      global_main.globalFn.suspendReasonTipFn(d.message);

        //领取奖励活动
      reWard().init({
              "isShow":true,
              "isLogin":false
            });
      
    },  
    notUsedFn:function(d){
            //未同步函数
            login_main.showSyncDataPop();
            global_main.globalFn.showTopNickNameFn(d.data)//未同步数据,头部信息展示
    },
    unNickNameFn:function(){
            //用户未设置昵称
            login_main.headNoNickNameFn();
            login_main.settingNickPop();
    },
                
    needPasswdFn:function(){
            //未设置密码
            login_main.headNoNickNameFn();
            login_main.settingPop();
    },
    noLoginFn:function(){      
            //用户中心手动登录
            $(".tc01").remove();
            $(".centerHeard .userInfo").hide();
            $(".centerHeard .users,.centerHeard .users .js_userLogin").show();
            if($(".js_userForLogin")&&location.pathname.indexOf("/forum")<0&&location.search.indexOf("?id")<0){
              login_main.showLogin();             
              
            }
          
          //领取奖励活动
          reWard().init({
              "isShow":true,
              "isLogin":false
            });

    },
    unknownErrFn:function(){
      //用户中心手动登录
            $(".tc01").remove();
            $(".centerHeard .userInfo").hide();
            $(".centerHeard .users").show();
    }
  },function(){
      //帖子相关功能入口
      if(location.pathname=="/forum/thread"&&$(".js_single_gift_pop").length==0){
            daoForumInfo().init();  //帖子详细
            daoReplyForum().init(".js_replyForumNavBtn,.js_replyForum","add");  //详细页中两个回帖触发按钮
            DaoNoticeForum().init();//关注
            daoCommentReplyForum().init(); //回帖评论
        }
  });
  
  
    //动态、消息标签切换
    $(document).on("click",".typeMsg li",function(){
      var _this=$(this);
      $(".js_allMs,.js_dynamicTypes").show();
      $(".js_allMs").html(""); //清空列表数据
      $("#tieInfo_Table_0_paginate").html(""); //清空分页容器
      if($(".typeMsg").attr("repeat")=="no"){
        return false;
      }
     $(_this).siblings().removeClass("cur").end().addClass("cur");
     if($(_this).hasClass("msgs")){
       $(".js_dynamicTypes,.dataTables_wrapper,.js_followTab").hide();//动态二级,分页隐藏
        //消息列表
          DaoMessageUser().init();
     }else if($(_this).hasClass("dt")){ //个人中心 动态
       $(".js_dynamicTypes").show().find("li").removeClass("cur").end().find("li:first").addClass("cur"); //动态二级分类展示 默认选择第一个tab
       $(".js_followTab").hide(); // 关注二级分类隐藏
       userFeedDynamic().init();
     }else if($(_this).hasClass("js_otherUserDynamic")){  //他人中心 动态  无需登录
       $(".js_dynamicTypes").show().find("li").removeClass("cur").end().find("li:first").addClass("cur"); //动态二级分类展示 默认选择第一个tab
       $(".js_followTab").hide(); // 关注二级分类隐藏
       otherUserDynamic().init();
       return false;
     }else if($(_this).hasClass("js_myfrinds")||$(_this).hasClass("js_otherfrinds")){      //个人和他人中心 关注
       $(".js_followTab").show().find("li").removeClass("cur").end().find("li:first").addClass("cur"); //关注二级分类展示 默认选择第一个tab
       $(".js_dynamicTypes").hide();//动态二级分类隐藏
           userFollowList().followListTypeConfFn(_this);//个人关注列表
     }else{
       $(".js_alertMsg").html("程序打盹了");
             global_main.globalFn.tcCenter($(".alertMSG"));
     }
    })
    
    //用户登录信息，弹幕容器
    $("body").on("click",".myNews .lookMsgs",function(){
    //消息列表只有在个人中心点击头部账号信息时才重新加载消息列表
    if(location.pathname=='/user/profile'){
      DaoMessageUser().init();
      $(".typeMsg li").siblings().removeClass("cur").eq(1).addClass("cur");
    }
    });
    
  $("body").on("click",".msgAlert .lookMsgs",function(){
     if(location.hash.indexOf("#xx")==0&&$("#userCenterMain").length>0){
        $(".typeMsg .msgs").click();
     }
  });
  
    $(".myNews .msgClose").click(function(){
      clearTimeout(myNewsSet);
      $(".myNews").hide();
       //当前弹幕关闭
         dmTrue=true;
       //实时弹幕
       setTimeout(function(){
         global_main.globalFn.barrage();
       },1500)
    });
    
  
  //logo
  $(".header .logo").click(function(){
    window.location.href="http://dao.gyyx.cn/forum";
  })
  
  //他人中心
  if($("#js_otherInfoMainOnly").length>0){
    $(".detailsGame .jfB,.detailsGame .yfB").remove();  
  }
  
  //个人信息设置按钮，来源网址添加 
  $(".tc04 a").attr("href","/user/member/?source="+encodeURIComponent(window.location.href));
  

    //用户头像处编辑图标按钮、个人名片需要完善资料按钮、  登录后顶部用户头像 、 昵称 
    $(".js_editos,.detailsGame .qsr,.js_touxiang,.js_nc").click(function(){
      var _this=$(this);
      if($(".detailsGame .qsr span").length>0&&$(this).hasClass("qsr")){
        return false;
      }
      if(($(_this).hasClass("js_touxiang")||$(_this).hasClass("js_nc")) && nickNameRepeat){
          window.location.href="/user/profile";
          return false;
    }
      if(location.pathname=="/user/member/"){
           window.location.reload();
        }else{
          window.location.href="/user/member/?source="+encodeURIComponent(window.location.href);
       }
    });
    
     //充值，兑换
   daoRecharge().init(".js_pay,.js_convert");
    
    //关闭弹层
    $(".js_close").click(function(){
      $(".bgT").css("z-index",1001000);
      //用户信息设置页，无论坛资格
      if($(this).parent().find(".js_alertMsg").html()=="您暂无论坛资格，敬请期待"){
        var sourceU =global_main.globalFn.getLinkParamFn("source");
        if(sourceU){
          window.location.href=sourceU;
        }else{
          window.location.href="/user/profile/";
        }
      }
      //三项注册资料完善刷新
      if($(this).parent().find(".js_sxrel").length>0){
        window.location.reload();
      }
        //交易记录重置
        if(!$(this).parent().hasClass("tc03")&&$(".tc02").is(":visible")){
            $(".cx .sel").removeClass("active").eq(0).addClass("active");
            $(".selTimes option:first").prop("selected",true);
            $("#jxTable tbody").html("");
            $(".tc03").hide();
        }
        //交易记录验证码框重置
        if($(".tc03").is(":visible")){
            $(".js_cordUp").unbind("click");
            $(".tc03 .easyvcord").val("");
            $(".cordErr").html("");
        }
        $(this).parent().hide();
        $(".js_cx,.js_cordUp").attr("keepRepeat","true");
        if(!$(this).parent().hasClass("tc03")){
            $(".bgT").hide();
        }
    });

    //顶部头像悬浮信息展示
    $(".js_showUserInfor").hover(function(){
        //获取金银符数量
        global_main.globalFn.wealth();
        //获取登录用户身份信息
        global_main.globalFn.getUserTitle();
        if(nickNameRepeat){
            $("#identity").show();
        }else{
            $("#identityForNick").show();
        }

      //注销
        $("body").on("click",".frpExi .js_logout,#identityForNick .js_logout",function(){
          global_main.globalFn.logoutFn();
      });
       
    },function(){
       $("#identity,#identityForNick").hide();
    });
    
    $("#identity,#identityForNick").on("mouseenter",function(){
      $(this).show();
    });
    
    $("#identity,#identityForNick").on("mouseleave",function(){
      $(this).hide();
    });
    
    //任一用户信息,任一用户身份信息
    $("body").on("mouseenter",".js_checkEveryUserInfo",function(){
         $(".tc05 .hasSF .sf").attr("class","sf currentSF");
         $(".js_sourceForNicePic .con .conDE").hide();
         $(".js_sourceForNicePic,.js_sourceForNicePic .loadingForInfos").show();
         $(".tc05 .daohang .tc05_dh").css("width","145px");
         $(".tc05 .daohang .dhText").html("道&nbsp;&nbsp;行&nbsp;:&nbsp;");
         $(".tc05 .myinfos").css("margin","50px 0 0 70px");
         var userId=$(this).attr("data-userinfoid");
           if(userId!=""){
              global_main.globalFn.userInfo(userId);
              global_main.globalFn.title(userId);
           }
           global_main.globalFn.checkEveryUserInfo($(this));
    });
    
    $("body").on("mouseleave",".js_checkEveryUserInfo",function(){
      $(".tc05").hide();
    });
    
    $(".tc05").hover(function(){
      $(this).show();
    },function(){
      $(this).hide();
    })


    $(".js_getCord").click(function(){
        $(this).attr("src","http://api.gyyx.cn/Captcha/CreateVJ.ashx?r="+Math.random());
    });

    $(".tc03 .cordCancel").click(function(){
      $(".bgT").css("z-index",1001000)
        $(".js_cordUp").unbind("click");
        $(this).parents(".tc03").hide();
        $(".js_cx,.js_cordUp").attr("keepRepeat","true");
        $(".tc03 .easyvcord").val("");
        $(".cordErr").html("");
    });
    
    //侧边导航
    var id =global_main.globalFn.getLinkParamFn("id");
    if(id){
        $(".js_replyForumNavBtn").attr("data-forumId",id);
    }

    global_main.globalFn.navFixT();

    $(window).resize(function() {
      global_main.globalFn.navFixT();
    });

    $(".cbNav a").hover(function(){
        $(this).siblings().removeClass("cur").end().addClass("cur");
    },function(){
        $(this).removeClass("cur");
    });
    
    //礼物浮层
    $("body").on("mouseenter",".gitsInfo .fixdG",function(){
      $(".gitsInfo li .giName").hide();
      $(this).siblings().show();
    });
    
    $("body").on("mouseleave",".gitsInfo .fixdG",function(){
      $(".gitsInfo li .giName").hide();
    });
    //消息列表评论信息点击事件
    $("body").on("click",".tieInfo .commentLink",function(){
      var commentId=$(this).attr("comment");
      var _href=$(this).attr("_href");
      DaoMessageUser().getCommentInfo(commentId,0,_href);
    });
     //消息列表回帖信息点击事件
    $("body").on("click",".tieInfo .postLink",function(){
      var contentId=$(this).parents(".handleForYouTie").attr("content");
      var _href=$(this).attr("_href");
      DaoMessageUser().getPostInfo(contentId,0,_href);
    });
    //消息定位
    $("body").on("click",".userInfo .ovF .icon2",function(){
      if(location.pathname=='/user/profile'){
         $(".typeMsg .msgs").click();
        
      }
    });
});