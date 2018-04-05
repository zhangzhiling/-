/*-------------------------------------------------------------------------
 * 作者：dongchunshui
 * 创建时间： 2018/3
 * 版本号：v2.0
 * 作用域：签到
 * 
 * 来源:
 *  
 -------------------------------------------------------------------------*/
(function() {
    var signUrl = "/user/sign";//签到接口
    var signStatus = "/user/sign/status";//签到展示状态接口
    var prizestatusUrl = "/user/sign/prizestatus"//用户领奖状态接口
    var getPrize = "/user/sign/drawprize";//领取奖品接口
    //签到弹层html
    var signHtml = '<div class="signMask">' +
                    '<a href="javascript:;" class="closeSign">关闭</a>' +
                    '<div class="signBox">' +
                    '<h2></h2>' +
                    '<h3 class="tishi"></h3>' +
                    '<div class="signLeft">' +
                          '<div class="signDay">' +
                             '<ul class="qd_day" id="js_day"></ul>' +
                     '</div>' +
                    '<div class="giftBox">' +
                        '<h3>您本月连续签到最长<span class="js_lxSign redColor" code=""></span>，累计<span class="ljSign redColor" code=""></span></h3>' +
                         '<ul class="singleList">' +
                                '<li>' +
                                    ' <div class="jiaoIcon icon01"></div>' +
                                    '<div class="giftShow">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />50</span>' +
                                    '</div>' +
                                    '<a href="javascript:;" class="" word="50工资荣誉点" code=""></a>' +
                                '</li>' +
                                '<li>' +
                                    '<div class="jiaoIcon icon02"></div>' +
                                    '<div class="giftShow">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />100</span>' +
                                    '</div>' +
                                    '<a href="javascript:;" class="" word="100工资荣誉点" code=""></a>' +
                                '</li>' +
                                ' <li>' +
                                    '<div class="jiaoIcon icon03"></div>' +
                                    '<div class="giftShow">' +
                                    ' <img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />200</span>' +
                                    ' </div>' +
                                    '<a href="javascript:;" class="" word="200工资荣誉点"></a>' +
                                '</li>' +
                                '<li>' +
                                    ' <div class="jiaoIcon icon04"></div>' +
                                    '<div class="giftShow">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />300</span>' +
                                    '</div>' +
                                    ' <a href="javascript:;" class="" word="300工资荣誉点" code=""></a>' +
                                '</li>' +
                                '</ul>' +
                                '<ul class="shuangList">' +
                                '<li class="wid88">' +
                                    '<div class="jiaoIcon icon06"></div>' +
                                    '<div class="giftShow">' +
                                    ' <img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />100</span>' +
                                    ' </div>' +
                                    '<a href="javascript:;" class="" word="100工资荣誉点" code=""></a>' +
                                '</li>' +
                                ' <li class="wid134" >' +
                                    '<div class="jiaoIcon icon07"></div>' +
                                    '<div class="giftShow">' +
                                    '<div class="fl_50">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />500</span>' +
                                    '</div>' +
                                    '<div class="fl_50">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>天神护佑<br />赠品</span>' +
                                    '</div>' +
                                    '</div>' +
                                    '<a href="javascript:;" class="" word="500工资荣誉点、天神护佑" code=""></a>' +
                                ' </li>' +
                                '<li class="wid134">' +
                                    '<div class="jiaoIcon icon05"></div>' +
                                    '<div class="giftShow">' +
                                    '<div class="fl_50">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>工资荣誉点<br />300</span>' +
                                    '</div>' +
                                    '<div class="fl_50">' +
                                    '<img src="http://img.gyyxcdn.cn/dao/user/images/iconZhan.png" />' +
                                    '<span>牡丹花铭牌<br />（7天）</span>' +
                                    '</div>' +
                                    '</div>' +
                                    '<a href="javascript:;" class="" word="300工资荣誉点、牡丹花铭牌" code=""></a>' +
                                '</li>' +
                          '</ul>' +
                    '</div>' +
                    '</div>' +
                          //<!-- 签到规则 -->
                          '<div class="ruleSign">' +
                                '<h3>签到规则</h3>' +
                                '<p>1、签到天数按月计算，每月1号零点自动清零</p>' +
                                '<p>2、奖励领取后自动发放到账号绑定的游戏角色中，道友们可在游戏内【南极仙翁】处领取</p>' +
                                '<p>3、游戏内每天活的工资荣誉点上限500点。请道友同一天领取不要超过500点，超过部分将自动回收且不再补偿</p>' +
                            '</div>' +
                         '</div>' +
                    '</div> ' +
                  //<!-- 弹层 -->
                    '<div class="maskSign"></div>' +
                     '<div class="maskSignPop"></div>' +
                    '<div class="popSign">' +
                    '<a href="javascript:;" class="closeSignPop">关闭</a>' +
                    ' <div class="popContent">' +
                    '<h3>您还未绑定游戏角色</h3>' +
                    '<p class="wordPop">奖励将下发到您绑定的游戏角色中</p>' +
                    '<a href="javascript:;" class="btnPops">立即绑定</a>' +
                    '</div>' +
                    '</div>';
    function UserSignFn(){
        //签到
    }
    UserSignFn.prototype={
        init:function(){
            var _this = this;
            _this.showSignAjaxFn()//签到状态
            _this.showSign();//显示签到层
            _this.clickSignFn();//签到
            //关闭
            _this.closeSign(".closeSign");
            _this.closeSign(".closeSignPop");
            _this.closeSign(".btnPops");
            _this.location();
            

        },
        
        //显示签到层
        showSign: function () {
            if (!$(".signMask").length) {
                $("body").append(signHtml);
            }
        },
        //获取当前月份
        monthNow: function (data) {
            var monthNow = data.currentDate;
            var arrMonth = monthNow.split("-");
            var monthSingle = arrMonth[1];
            switch (monthSingle) {
                case "01":
                    monthSingle = '一';
                    break;
                case "02":
                    monthSingle = '二';
                    break;
                case "03":
                    monthSingle = '三';
                    break;
                case "04": 
                    monthSingle = '四';
                    break;
                case "05":
                    monthSingle = '五';
                    break;
                case "06":
                    monthSingle = '六';
                    break;
                case "07": 
                    monthSingle = '七';
                    break;
                case "08": 
                    monthSingle = '八';
                    break;
                case "09":
                    monthSingle = '九';
                    break;
                case "10": 
                    monthSingle = '十';
                    break;
                case "11": 
                    monthSingle = '十一';
                    break;
                case "12":  
                    monthSingle = '十二';
                    break;
                default:
                    break;
            }
            $(".signBox h2").html(monthSingle + '月签到')
        },
        //日历排版
        calendar:function() {
            var _this = this;
            $.ajax({
                url: signUrl,
                type: "get", 
                data: {
                    r: Math.random()
                },
                success: function (d) {
                    if (d.status == 'success') {
                        var Html = '', data = d.data;
                        _this.monthNow(data);//获取当前月份
                        $(".js_lxSign").html(data.maxContinuityCount + '天').attr("code", data.maxContinuityCount);
                        $(".ljSign").html(data.monthCount+'天').attr("code",data.monthCount);
                        if (data.firstDayOfMonth != "7") {
                            for (var i = 1; i < data.firstDayOfMonth; i++) {
                                Html += '<li  class="qd_no"></li>';
                            }
                        }
                        for (var q = 0 ; q < data.monthDays ; q++) {
                            Html += '<li data-day="' + parseInt(q + 1) + '"  class="">' + parseInt(q + 1) + '<span></span></li>';
                        }
                        $("#js_day").empty().html(Html);
                        //显示已经签到日期
                        for (var j = 0 ; j < data.signArray.length ; j++) {
                            $("#js_day").find("li[data-day=" + data.signArray[j] + "]").addClass("qd_suss");
                        }
                        $(".signMask,.maskSign").show();
                        _this.showSignAjaxFn();//获取签到按钮状态
                        _this.prizestatus();//获得用户领奖状态
                    } 
                    
                }
            });
        },
        //关闭
        closeSign:function(obj){
            $(document).on("click", obj, function () {
                if(obj=='.closeSign'){
                    $(".maskSign").hide();
                    $(this).parent().hide();
                } else if (obj=='.btnPops') {
                    $(".maskSignPop").hide();
                    $(".popSign").hide();
                } else {
                    $(".maskSignPop").hide();
                    $(this).parent().hide();
                    $(this).siblings(".popContent").children("a").attr('class', 'btnPops');
                }
            })
        },
        //5s自动关闭层
        closePopAutoFn:function(times){
            var s = times;
            var timmer;
            timmer = setInterval(function(){
                if(s<0){
                    clearInterval(timmer);
                    $(".maskSignPop,.popSign").hide();
                }
                s--;
            },1000);
        },
        //点击签到方法
        clickSignFn: function () {
            var _this = this;
            $(document).on("click", ".js_marks", function () {
                $.ajax({
                    url: signUrl,//签到接口
                    type: "post",
                    dataType: "JSON",
                    data: {
                        r: Math.random()
                    },
                    success: function (d) {
                        if (d.status == "success") {
                            if (d.message == '今日已经签过到了,请明日再来!') {
                                $(".tishi").html("今日签到成功,请明天再来呦~").addClass("bounceInDown animated")
                            } else {
                                $(".tishi").html(d.message).addClass("bounceInDown animated");
                            }
                            _this.calendar();//展示当月日历
                           
                        } else {
                            $(document).errorDataOperateFn(d);
                        }
                    },
                    error: function () {
                        _this.popShow();
                    }
                })
                
            })
        },
        //用户领奖状态
        prizestatus: function () {
            var _this = this;
            $.ajax({
                url: prizestatusUrl,
                type: "get",
                dataType: "JSON",
                data: {
                    r: Math.random()
                },
                success: function (d) {
                    if (d.status == "success"&&d.data) {
                        var dCont = d.data;
                        var className ; 
                        var continuityCount = $(".js_lxSign").attr("code");
                        var monthCount = $(".ljSign").attr("code"); 
                        for (var i = 0; i < dCont.length; i++) {
                            $(".giftBox a").eq(i).attr("code", dCont[i].code);
                            var lxSignCount = i < 4 ? monthCount : continuityCount;
                            switch (dCont[i].status) {
                                case "waitForAward"://领取
                                    className = 'Standard';
                                    $(".giftBox li a").eq(i).removeClass().addClass(className).html('领取').attr("flag", "true");
                                    break;
                                case "unsatisfied"://未达标
                                    className = 'noStandard';
                                    $(".giftBox li a").eq(i).removeClass().addClass(className).html(lxSignCount + '/' + dCont[i].monthCount);
                                    break;
                                case "awarded"://已经领取
                                    className = 'alreadyReceive';
                                    $(".giftBox li a").eq(i).removeClass().addClass(className).html('已领取');
                                    break;
                                default:
                                    break;
                            }
 
                        }
                        _this.getPrize();//领取奖励
                    }
                },
                error: function () {
                    _this.popShow();
                }
            })
        },
        //用户领取奖品
        getPrize: function () {
            var _this = this;
            $(document).on("click", ".Standard", function () {
                
                var flag = $(this).attr("flag");
                if (flag == "true") {
                    $(this).attr("flag", "false");
                    var prizeCode = $(this).attr("code");
                    var word = $(this).attr("word");
                    $.ajax({
                        url: getPrize,
                        type: "post",
                        dataType: "json",
                        data: {
                            r: Math.random(),
                            prizeCode: prizeCode
                        },
                        success: function (d) {
                            switch (d.status) {
                                case "success":
                                    _this.popshowMain('恭喜您', word + '<br />已下发到您的游戏角色', '确定', "smallClass", "hideBtn");
                                    break;
                                case "noGameInfo":
                                    _this.popshowMain('您还未绑定游戏角色', '', '立即绑定', "", "js_editos");
                                    break;
                                case "accountAwarded":
                                    _this.popshowMain('您的账号已领取奖励', '不能重复领取', '确定',"","");
                                    break;
                                case "noQualifications":
                                    _this.popshowMain('您的账号未达到领取资格', '再接再厉', '确定',"","");
                                    break;
                                default:
                                    $(document).errorDataOperateFn(d);
                            }
                            _this.prizestatus();
                            $(this).attr("flag", "true");
                        },
                        error: function () {
                            _this.popShow();
                            $(this).attr("flag", "true");
                        }
                    });
                }
                
            })
        },
        location: function () {
            $(document).on("click", ".js_editos", function () {
                if ($(".detailsGame .qsr span").length > 0 && $(this).hasClass("qsr")) {
                    return false;
                }
                if (location.pathname == "/user/member/") {
                    window.location.reload();
                } else {
                    window.location.href = "/user/member/?source=" + encodeURIComponent(window.location.href);
                }
            })
        },
            
        //提示弹层
        popshowMain: function (WordMes, titleFu, btnWord, smallClass, clickObj) {
            $(".popContent h3").html(WordMes).css("line-height", "32px");//标题
            $(".wordPop").html(titleFu).addClass(smallClass);//副标语
            $(".btnPops").html(btnWord).addClass(clickObj);//按钮
            $(".signMask,.maskSign").hide();
            $(".maskSignPop,.popSign").show();
            },          
        //错误提示弹层
        popShow: function () {
            $(".wordPop").html('');
            $(".btnPops").hide();
            $(".popContent h3").html('服务器小哥犯困了<br />请稍后重试').css("line-height", "49px");
            $(".signMask,.maskSign").hide();
            $(".maskSignPop,.popSign").show();
        },
        //签到按钮展示方法
        showSignAjaxFn: function () {
            $.ajax({
                url: signStatus,
                type: "get",
                dataType: "json",
                data: {
                    r: Math.random()
                },
                success: function (d) {
                    if (d.status == "success" && d.data) {
                        var signStatus = d.data.signStatus;//签到状态:haveSignedIn: 已签到,notSignIn: 未签到
                        var signTxt = signStatus == "haveSignedIn" ? "已签到" : "签到";
                        signStatus == "haveSignedIn" ? $(".js_marks").parents(".sign").addClass("cur_sign") : $(".js_marks").parents(".sign").removeClass("cur_sign");
                        $(".js_marks").text(signTxt);
                    } else {
                        $(".js_marks").text("签到");
                    }
                }
            });
        },
        

    };
    window.userSignFn=function(){
        return new UserSignFn()
    }
})()
$(function(){
    userSignFn().init();
})