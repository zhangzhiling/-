
/*
 * version:v1.0.0
 * date:2017-2
 * desc:所有站点可配置验证码
 * uthor: tht
*/

; (function () {

    //可配置验证码构造函数
    function configCaptchaSLS(Defaults) {

        //简单验证码html
        var simHtml = '<p>' +  
                        '<label>验证码：</label>' +
                        '<input type="text" value="" name="js_configCaptchaValue" />' +
                        '<img src="" class="js_configCaptchaImg js_refreshConfigCaptcha" />' +
                        '<a class="js_refreshConfigCaptcha">看不清？</a>' +
                    '</p>';

        //复杂验证码html
        var comHtml = '<div class="configCaptchaCom">'+   
                        '<p class="configCaptchaContainer_p01">'+
                            '<label class="configCaptcha_text">验证码：</label>'+
                            '<span class="configCaptchaInput_container">'+
                                '<em class="configCaptchaInput js_configCaptchaInput"><i class="configCaptchaImg js_configCaptchaImg"></i></em>' +
                                '<em class="configCaptchaInput js_configCaptchaInput"><i class="configCaptchaImg js_configCaptchaImg"></i></em>' +
                                '<em class="configCaptchaInput js_configCaptchaInput"><i class="configCaptchaImg js_configCaptchaImg"></i></em>' +
                                '<em class="configCaptchaInput js_configCaptchaInput"><i class="configCaptchaImg js_configCaptchaImg"></i></em>' +
                                '<em class="configCaptchaIcon configCaptchaInput configCaptcha_DeleteBtn js_deleteConfigCaptcha"></em>' +
                            '</span>'+
                            '<i class="configCaptchaIcon configCaptcha_Tip02 js_checkChinaCaptchaTip default"></i>'+
                        '</p>'+
                        '<p class="configCaptchaContainer_p02">'+
                            '<span class="configCaptchaImg js_configCaptchaImg configCaptchaImg_yes js_refreshConfigCaptcha"></span>' +
                            '<a class="configCaptchaChange js_refreshConfigCaptcha">看不清？</a>' +
                        '</p>'+
                        '<p class="configCaptchaContainer_p03">点击框内文字输入上图中<b class="configCaptcha_Tip03">汉字</b>相应文字</p>'+
                        '<div class="configCaptchaContainer_p04">'+
                            '<ul class="configCaptchaSelectCon js_ChinaCaptchaSelect">'+
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_0 js_captchaCaptchaSelect_img" data-code="0"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_1 js_captchaCaptchaSelect_img" data-code="1"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_2 js_captchaCaptchaSelect_img" data-code="2"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_3 js_captchaCaptchaSelect_img" data-code="3"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_4 js_captchaCaptchaSelect_img" data-code="4"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_5 js_captchaCaptchaSelect_img" data-code="5"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_6 js_captchaCaptchaSelect_img" data-code="6"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_7 js_captchaCaptchaSelect_img" data-code="7"></li>' +
                                '<li class="configCaptchaImg js_configCaptchaImg configCaptchaImg_8 js_captchaCaptchaSelect_img" data-code="8"></li>' +
                            '</ul>'+
                        '</div>'+
                    '</div> ';

        this.Defaults = {     //默认参数
            configCatpchaTypeUrl: "http://account.gyyx.cn/captcha/CorsNeedCaptcha_New",   //验证码类型接口
            createCaptchaUrl: "http://account.gyyx.cn/captcha/create",                    //验证码创建接口
            cssLinkSrc: "http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css", //自定义验证码样式
            data: {           //参数
                bid: "Vaqrk"  //区分不同业务 必须
                //account:$('.js_Account').val()  //示例：不同业务需要额外参数  
            },
            simHtml: simHtml, //简单验证码元素 自定义形式：1、jquery对象，2、字符串
            comHtml: comHtml, //复杂验证码元素  自定义形式：1、jquery对象，2、字符串
            inputName: "js_configCaptchaValue",  //自定义隐藏域name名称
            popDefaultTip: "请输入验证码完成登录", //弹层顶部默认提示语
            popErrorTip: "验证码输入错误", //弹层顶部后接口返回验证码错误提示语
            popWidth: "340px", //弹层宽度
            popHeight: "430px", //弹层高度
            flexStatus: false, //弹性布局开关  需要配合cssLinkSrc参数，使用弹性样式
            comIn: false,       //复杂验证码是否内嵌 true:内嵌  false：弹层 
            typeIsOnlyCom:false, //验证码类型是否只是复杂类型：true:只有复杂类型（无需接口判断验证码类型）；false：验证码类型可配（需要接口判断验证码类型）
            captchaInWrap: "#configCaptchaWrap",  //内嵌验证码容器（简单，复杂）
            subFn: function () { },        //弹层提交按钮执行函数（同一窗口有多个业务是弹层复杂验证码，在弹层打开函数中传入）
            closeFn: function () { },  //弹层关闭按钮执行函数（同一窗口有多个业务时弹层复杂验证码，在弹层打开函数中传入）
            errorTipFn: function (wrap) {  //内嵌复杂验证码错误提示
                wrap.find(".js_checkChinaCaptchaTip").addClass("error");
            },
            succTipFn: function (wrap) {   //内嵌复杂验证码正确提示
                wrap.find(".js_checkChinaCaptchaTip").removeClass("error").addClass("success");
            },
            initError: function () {   //验证码初始化失败
                alert("验证码初始化失败！");
            }
        };

        //IE6下默认不缓存背景图片，CSS里每次更改图片的位置时都会重新发起请求，用这个方法告诉IE6缓存背景图片 
        var isIE6 = /msie 6/i.test(navigator.userAgent);
        if (isIE6) {
            try { document.execCommand('BackgroundImageCache', false, true); } catch (e) { }
        }
        
        //不传bid时，使用默认值
        if (Defaults && Defaults.data && !Defaults.data.bid) {

            $.extend(Defaults.data, this.Defaults.data);  
        }

        $.extend(this.Defaults, Defaults);  //扩展参数

    }

    configCaptchaSLS.prototype = {

        //主程序入口
        init: function (confData) {

            this.isNeedCaptcha(confData);

        },

        //是否需要验证码
        isNeedCaptcha: function (confData) {
            var _this = this;

            var datas = {
                r: Math.random()
            };
            $.extend(datas, _this.Defaults.data);  //组合参数 bid
            if (confData && confData instanceof Object) {
                $.extend(datas, confData);  //组合业务专有参数
            }
            

            var configCaptchaWrap = $(_this.Defaults.captchaInWrap); //页面中内嵌验证码容器（简单或复杂）

            if (_this.Defaults.typeIsOnlyCom) {  //无需判断验证码类型，只有复杂验证码
                //设置验证码类型
                _this.captcahSwitchOpen = 1;

                _this.comCaptchaInitFn(configCaptchaWrap); //复杂验证码初始化

            } else {                     //验证码类型可配置，三种类型：-1：无验证码；0：简单验证码；1：复杂验证码

                $.ajax({
                    url: this.Defaults.configCatpchaTypeUrl,
                    type: "GET",
                    dataType: "jsonp",
                    jsonp: "jsoncallback",
                    data: datas,
                    success: function (data) {
                        if (data && data.type) {


                            //设置验证码类型
                            _this.captcahSwitchOpen = parseInt(data.type);

                            switch (parseInt(data.type)) {
                                case -1://无验证码
                                    configCaptchaWrap.html('<input type="hidden" name="js_configCaptchaValue"/>');  //清空验证码容器，添加验证码隐藏域
                                    break;
                                case 0://简单验证码
                                    _this.insertCaptchaHtmlFn(configCaptchaWrap, _this.Defaults.simHtml); //插入简单验证码html

                                    var srcs = _this.Defaults.createCaptchaUrl + "?bid=" + _this.Defaults.data.bid;  //简单验证码图片
                                    configCaptchaWrap.find(".js_configCaptchaImg").attr("src", srcs);

                                    _this.refreshCaptchaEvent(configCaptchaWrap);

                                    break;
                                case 1://需要复杂验证码

                                    _this.comCaptchaInitFn(configCaptchaWrap); //复杂验证码初始化

                                    break;
                                default:
                                    _this.initError();
                                    break;
                            }
                            _this.replaceInputNameFn();  //替换自定义input的name名称

                        }
                    },
                    error: function () {
                        _this.initError();
                    }
                });
            }
        },
        //复杂验证码初始化
        comCaptchaInitFn: function (wrap) {
            var _this = this;
            //引入中文验证码样式
            if (!document.getElementById("configCaptchaLink")) {  //不重复引入样式表

                $("head").append('<link href="' + _this.Defaults.cssLinkSrc + '" rel="stylesheet" type="text/css" id="configCaptchaLink">'); //引入样式
            }

            if (_this.Defaults.comIn) {  //内嵌形式

                _this.insertCaptchaHtmlFn(wrap, _this.Defaults.comHtml); //插入复杂验证码html
                wrap.append('<input type="hidden" name="js_configCaptchaValue"/>');
                _this.addEventForCaptcha();

            } else {
                wrap.html('<input type="hidden" name="js_configCaptchaValue"/>');  //清空验证码容器，添加验证码隐藏域
                _this.createCaptchaPop();
            }
        },
        //添加嵌入式验证码html元素
        insertCaptchaHtmlFn: function (wrap, innerHtml) {
            var _this = this;
            if (typeof innerHtml === "string") {
                wrap.html(innerHtml); //内嵌验证码元素
            } else if (innerHtml instanceof $) { //以id形式传入jquery对象
                innerHtml = innerHtml.clone().removeAttr("id").show(); //复制页面中自定义验证码元素，移除副本id,将副本设置可见
                wrap.html(innerHtml);
            } else {
                alert("传入的验证码html元素无效");
            }
        },
        //替换隐藏域name名称
        replaceInputNameFn: function () {
            var _this = this;
            if (_this.Defaults.inputName) {
                $(_this.Defaults.captchaInWrap).find("input[name='js_configCaptchaValue']").attr("name", _this.Defaults.inputName);
            } else {
                _this.Defaults.inputName = "js_configCaptchaValue";
            }
            
        },
        //生成验证码弹出层
        createCaptchaPop: function () {
            var _this = this;
            var popSizeUnit = "";
            //创建元素

            var outWrap = document.createElement("div");
            var wrap = document.createElement("div");

            var title = document.createElement("h3");
            var close = document.createElement("a");

            var tip = document.createElement("p");
            var callBackErrorTip = document.createElement("p");

            var pop = document.createElement("div");

            var btnWrap = document.createElement("p");
            var btn = document.createElement("span");

            var mask = document.createElement("div");

            //添加class
            outWrap.className = "configCaptchaPopOutWrap js_configCaptchaPop";
            wrap.className = "configCaptchaPopWrap";

            title.className = "configCaptcha_Title";
            close.className = "configCaptchaIcon configCaptcha_close js_configCaptcha_close";

            tip.className = "configCaptcha_Tip01 js_defaultTextTips";
            callBackErrorTip.className = "configCaptcha_Tip01_error js_errorTextTips";

            pop.className = "configCaptchaPop js_configCaptchaPopIn";

            btnWrap.className = "configCaptchaContainer_p05";
            btn.className = "configCaptchaSubmit_Btn js_chinaCaptchaBtn";

            mask.className = "configCaptchaMask";

            //计算弹层位置
            if (_this.Defaults.flexStatus) {
                popSizeUnit = "rem";
            } else {
                popSizeUnit = "px";
            }
            wrap.style.width = parseFloat(_this.Defaults.popWidth) + popSizeUnit;
            wrap.style.height = parseFloat(_this.Defaults.popHeight) + popSizeUnit;

            wrap.style.marginLeft = -parseFloat(_this.Defaults.popWidth) / 2 + popSizeUnit;
            wrap.style.marginTop = -parseFloat(_this.Defaults.popHeight) / 2 + popSizeUnit;

            //组装节点
            title.innerHTML = "输入验证码";
            title.appendChild(close);

            tip.innerHTML = "";
            callBackErrorTip.innerHTML = "";

            btn.innerHTML = "确定";
            btnWrap.appendChild(btn);

            wrap.appendChild(title);
            wrap.appendChild(tip);
            wrap.appendChild(callBackErrorTip);
            wrap.appendChild(pop);
            wrap.appendChild(btnWrap);

            outWrap.appendChild(wrap);
            outWrap.appendChild(mask);

            outWrap.style.display = "none";

            //关闭按钮
            close.onclick = function () {
                outWrap.style.display = "none";
            };

            //不重复添加复杂验证码弹层
            var outWrapExistLen = $(".js_configCaptchaPop").length;
            if (outWrapExistLen === 0) {
                document.body.appendChild(outWrap);
            }

        },
        //打开弹层
        openCaptchaPopSLS: function (subfn, closefn) {   //打开弹层时，传入提交按钮函数和关闭按钮函数，不传：默认为一个空函数。
            var _this = this;
            _this.insertCaptchaHtmlFn($(".js_configCaptchaPop").find(".js_configCaptchaPopIn"), _this.Defaults.comHtml);//添加弹层中验证码元素
            _this.refreshCaptcha($(".js_configCaptchaPop")); //验证码初始化
            _this.callbackCaptchaErrorFn(false);  //恢复弹层默认提示语
            $(".js_configCaptchaPop").show();
            //弹层事件
            _this.addEventForCaptcha();
            //弹层提交执行函数
            if (typeof subfn === "function") {
                _this.popSubmit(subfn);
            } else {
                _this.popSubmit(_this.Defaults.subFn);
            }
            //关闭弹层执行函数
            if (typeof closefn === "function") {
                _this.closeCaptchaPopFn(closefn);
            } else {
                _this.closeCaptchaPopFn(_this.Defaults.closeFn);
            }

        },
        //关闭弹层
        closeCaptchaPop: function () {
            $(".js_configCaptchaPop").hide();
        },
        //关闭弹层执行函数
        closeCaptchaPopFn: function (fn) {
            $(".js_configCaptcha_close").unbind("click").bind("click", function () {
                $(".js_configCaptchaPop").hide();
                if (typeof fn === "function") {
                    fn();
                }
            });
        },
        //弹层提交
        popSubmit: function (fn) {
            var _this = this;
            //提交(如果验证码格式通过则提交)
            $(".js_chinaCaptchaBtn").unbind("click").bind("click", function () {
                if (_this.configCaptchaCheck($(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']"), $(".js_configCaptchaPop"))) {
                    fn(_this.Defaults);
                }
                return false;
            });
        },
        //给复杂验证码元素添加事件
        addEventForCaptcha: function () {
            var _this = this;
            var selectCaptchaWrapObj = null; //包含复杂验证码元素
            //选择验证码
            if (_this.Defaults.comIn) {

                selectCaptchaWrapObj = $(_this.Defaults.captchaInWrap);

                _this.refreshCaptcha(selectCaptchaWrapObj); //验证码初始化

            } else {

                selectCaptchaWrapObj = $(".js_configCaptchaPop");

            }
            

            selectCaptchaWrapObj.find(".js_captchaCaptchaSelect_img").unbind("click").bind("click", function () {
                _this.selectCaptcha($(this), selectCaptchaWrapObj);
                return false;
            });
            //删除验证码
            selectCaptchaWrapObj.find(".js_deleteConfigCaptcha").unbind("click").bind("click", function () {
                _this.deleteCaptcha(selectCaptchaWrapObj);
                return false;
            });

            //刷新验证码
            _this.refreshCaptchaEvent(selectCaptchaWrapObj);

        },
        //选择验证码
        selectCaptcha: function ($obj, wrap) {
            var _this = this;
            var
                    obj = $obj,
                    objAttrCode = obj.attr("data-code"),
                    codeLen = parseInt($(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val().length),
                    checkcodeStr = $(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val() + objAttrCode;

            if (codeLen < 4) {

                //验证码真实值
                $(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val(checkcodeStr);
                wrap.find(".js_configCaptchaInput").eq(codeLen).find("i").addClass("configCaptchaImg_" + objAttrCode);

            }
            this.configCaptchaCheck($(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']"), wrap);
        },

        //删除验证码
        deleteCaptcha: function (wrap) {
            var _this = this;
            var
                    Len = parseInt($(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val().length),
                    checkcodeStr1 = $(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val();

            checkcodeStr1 = checkcodeStr1.substring(0, Len - 1);
            $(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val(checkcodeStr1);


            var deleteObj = wrap.find(".js_configCaptchaInput").eq(Len - 1).find("i");
            var classNames = deleteObj[0].className;
            classNames = classNames.replace(/configCaptchaImg_[0-8]/g, "");
            deleteObj[0].className = classNames;


            this.configCaptchaCheck($(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']"), wrap);
        },
        //刷新验证码事件
        refreshCaptchaEvent: function (wrap) {
            var _this = this;
            wrap.find(".js_refreshConfigCaptcha").unbind("click").bind("click", function () {
                _this.refreshCaptcha(wrap);
                return false;
            });
        },
        //刷新验证码
        refreshCaptcha: function (wrap) {
            var _this = this;

            switch (_this.captcahSwitchOpen) {
                case 0:
                    //获取中文验证码
                    wrap.find(".js_configCaptchaImg").attr("src", _this.Defaults.createCaptchaUrl + "?bid=" + _this.Defaults.data.bid + "&r=" + Math.random());

                    break;
                case 1:
                    //获取中文验证码
                    wrap.find(".js_configCaptchaImg").css("backgroundImage", "url(" + _this.Defaults.createCaptchaUrl + "?bid=" + _this.Defaults.data.bid + "&r=" + Math.random() + ")");

                    wrap.find(".js_configCaptchaInput i").each(function () { //去掉选中复杂验证码class
                        var $this = $(this);
                        var classNames = $this[0].className;
                        classNames = classNames.replace(/configCaptchaImg_[0-8]/g, "");
                        $this[0].className = classNames;
                    });

                    $(_this.Defaults.captchaInWrap).find("input[name='" + _this.Defaults.inputName + "']").val(""); //清空弹层中隐藏域中的值

                    wrap.find(".js_checkChinaCaptchaTip").removeClass("success error"); //情况提示标识

                    break;
                default:
                    break;
            }

        },
        //接口返回验证码错误
        callbackCaptchaErrorFn: function (status) {
            var _this = this;
            if (status) {
                $(".js_errorTextTips").show().html(_this.Defaults.popErrorTip);
                $(".js_defaultTextTips").hide();
            } else {
                $(".js_errorTextTips").hide();
                $(".js_defaultTextTips").show().html(_this.Defaults.popDefaultTip);
            }
            
        },

        //验证验证码格式
        configCaptchaCheck: function (obj, wrap) {
            var _this = this;
            if (_this.VerCheckConfigCaptcha(obj, wrap) === true) {
                _this.VerConfigCaptchaOK(obj, wrap);
                return true;
            } else {
                return false;
            }
        },

        //验证复杂验证码格式
        VerCheckConfigCaptcha: function (obj, wrap) {
            var _this = this;
            var exp = new RegExp("^\\d{4}$");
            if (!exp.test(obj.val())) {
                _this.Defaults.errorTipFn(wrap);
                return false;
            } else {
                return true;
            }
        },

        //复杂验证码格式正确
        VerConfigCaptchaOK: function (obj, wrap) {
            var _this = this;
            _this.Defaults.succTipFn(wrap);
            return true;
        }
    };

    window.configCaptchaSLS = function(obj){
        return new configCaptchaSLS(obj);
    };
})();