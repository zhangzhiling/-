/*-------------------------------------------------------------------------
 * 作者：maoxiangmin
 * 创建时间： 2017/5
 * 版本号：v1.0
 * 作用域：用户中心-个人中心编辑
 * 
 * 来源:
 *   globalFn-->global.js
 *   configCaptcha-->http://s.gyyx.cn/Lib/configCaptcha/js/configCaptcha.min.js
 -------------------------------------------------------------------------*/

/*
 * 顶级变量控制
 *
 */
var regSpace=/\s+/,//空格验证
    nickErrorAlert="请您至少填写昵称",
    phoneNumbers=/^1[3|5|7|8]\d{9}$/,
    noTxZf=/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/,
    nickBlur=false, //昵称失焦后是否可以继续,
    phoneBlur=false,
    nickIsTurForNext=false, //判断昵称状态是否正常
    oneTrueForZM=true,//获取角色验证码提交
    capt=null;

var userInfo_main=(function(){
	 /*
     * 变量控制
     *
     */
	
	
    function userInfoWeb(){
    	
        var _this=this;
        /*
         * 接口定义
         *
         */
        this.userInfoPort={
            //签到


            //用户昵称是否重复
            checkNickName:"/user/member/checkNickname",

            //上传图片处理程序
            uploadImgUrl:"/user/cloudStorage/uploadImg",
            //http://up.gyyx.cn/Image/WebSiteSaveToReal.ashx
            
            //获取签名
            getGignForImg:"/forum/ueditor/sign",

            //图片裁切
            imageUp:"/user/member/cutImage",

            //通过区组获取服务器
            getServers:"/user/member/servers",

            //获取用户在区组服务下的包含角色
            getRoles:"/user/member/roles",
            
            //编辑保存
            setUserInfo:"/user/member/set"
        },
        /*
         * 验证规则
         *
         */
        this.regs={
            //字符长度计算
            getByteLen:function (val) {
                var len = 0;
                for (var i = 0; i < val.length; i++) {
                    if (val[i].match(/[^\x00-\xff]/ig) != null) //全角
                        len += 2;
                    else
                        len += 1;
                }
                return len;
            },

            //检查对象是否为空
            checkObjEmpt:function(obj){
                for(var i in obj){
                    return false;
                }
                return true;
            },

            //昵称规则错误提示
            nickNameRule:function(obj,msg){
                nickErrorAlert=msg;
                $(obj).parents(".errorIpt").next(".error").html(nickErrorAlert);
                $(obj).parent().find(".nicknameIconTrue").addClass("nicknameIconErr").show();
            	$(obj).addClass("nicknameTextBorder");
                if($(obj).hasClass("nickname")){
                	$(obj).focus();
                }
            },
        	//获取上传文件的后缀
        	getExt:function(file){
        	    return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
        	},
        	//获取文件名
        	fileFromPath:function(file){
        	    return file.replace(/.*(\/|\\)/, "");
        	}
        },
        /*
         * 当前页事件交互
         *
         */
        this.currentEventF={
            //验证码提交//获取用户在区组服务下的包含角色
            submitYZM:function () {
            	var _this=userInfo_main;
                var rolHtm="";
                if(!oneTrueForZM){
                	return false;
                }
                var isNeedChpta=capt.captcahSwitchOpen;
				var verifyCodes=isNeedChpta!=-1 ? $("input[name='Captcha']").val() : "";
				var cookieValue=isNeedChpta!=-1 ? $("input[name='cookies']").val() : "";
                $.ajax({
                    url: _this.userInfoPort.getRoles,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                    	captchaCode:verifyCodes,
                    	serverId:$("#server option:selected").val(),
                        cookieValue:cookieValue,
                        account:$(".js_daoAccount").val(),
                        r: Math.random()
                    },
                    beforeSend:function(){
                    	oneTrueForZM=false;
                    	$(".alertMSG .userInfoError,.alertMSG .js_close").hide();
                    	 var loading='<a href="javascript:void(0)" class="norol">获取中，请稍后...</a>';
                         $(".js_configCaptchaPop").hide();
                    	 $(".js_alertMsg").html(loading);
                         global_main.globalFn.tcCenter($(".alertMSG"));
                    },
                    success:function(d){
                        if(d.status=="success"){
                        	$(".alertMSG,.bgT").hide();
                            var rols=d.data;
                            for (var i = 0; i<rols.length; i++) {
                            	if(i==0){
                            		  rolHtm += "<span class='cur' roleId="+rols[i].roleId+" >"+rols[i].roleName+"</span>";
                            		  $(".userIns .role02").attr("newroleid",rols[i].roleId).attr("newrolename",rols[i].roleName);
                            	}else{
                            		rolHtm += "<span roleId="+rols[i].roleId+" >"+rols[i].roleName+"</span>";
                            	}
                                
                            }
                            $(".js_configCaptcha_close").click();
                            $(".userIns .quzu02").attr("newnettypecode",$("#quzu").val()).attr("newareaname",$("#quzu option:selected").html());
                            $(".userIns .server02").attr("newserverid",$("#server").val()).attr("newservername",$("#server option:selected").html());
                        }else if(d.status=="failed"||d.status=="captchaFailed"||d.status=="needPasswd"){
                        	if(d.message=="没有角色，换个区服试试吧"){
                        		 rolHtm='<a href="javascript:void(0)" class="norol">暂无相关角色</a>';
                          }
                          if(d.message=="手机号和账号不存在绑定关系，请前往社区绑定"){
                            rolHtm='<span class="alertInfoBlue">手机号和账号不存在绑定关系，请前往<a href=" http://security.gyyx.cn/Home/Index" target="_blank" class="norol">社区绑定</a></span>';
                          }else{
                            rolHtm=d.message;
                          }
                        	 capt.closeCaptchaPop();
                        	 $(".js_alertMsg").html(rolHtm);
                        	 $(".alertMSG .js_close").show();
                           global_main.globalFn.tcCenter($(".alertMSG"));
                        }else if(d.status=="unknown_error"){
                          rolHtm="获取角色失败，请重试";
                          $(".js_alertMsg").html(rolHtm);
                          $(".alertMSG .js_close").show();
                          global_main.globalFn.tcCenter($(".alertMSG"));
                        }else{
                          $(document).errorDataOperateFn(d);
                        }
                        if(d.message!="手机号和账号不存在绑定关系，请前往社区绑定"){
                          $(".roles").html(rolHtm);
                        }
                        
                        oneTrueForZM=true;
                    },
                    error:function(){
                    	oneTrueForZM=true;
                        $(".alertMSG .userInfoError,.js_configCaptchaPop").hide();
                        capt.closeCaptchaPop();
                        $(".alertMSG .js_close").show();
                   	 var getError='<a href="javascript:void(0)" class="norol">获取失败，请重试...</a>';
                   	    $(".js_alertMsg").html(getError);
                        global_main.globalFn.tcCenter($(".alertMSG"));
                    }
                });
            },
            
            //传参获取签名
            tenCentAjaxFn: function(){
            	$.ajax({
                    url: _this.userInfoPort.getGignForImg,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        r: Math.random()
                    },
                    success:function(){
                        //返回请求路径
                    }
                });
            	
            },
            
            //用户昵称是否重复
            checkNickName:function(fn){
            	var thatName=$(".nickname").val();
                $.ajax({
                    url: _this.userInfoPort.checkNickName,
                    type: "GET",
                    dataType: "JSON",
                    data: {
                        nickname:thatName,
                        r: Math.random()
                    },
                    success:function(d){
                    	if(d.status=="duplicate"||d.status=="failed"){
                    		nickIsTurForNext=false;
                            nickBlur=false;
                            $("#infoEdit .nickname").parent().find(".nicknameIconTrue").addClass("nicknameIconErr").show();
                            $("#infoEdit .nickname").addClass("nicknameTextBorder");
                            if(d.status=="duplicate"){
                            	userInfo_main.regs.nickNameRule($("#infoEdit .nickname"),"昵称被占用");
                            }
                            if(d.status=="failed"){
                            	userInfo_main.regs.nickNameRule($("#infoEdit .nickname"),d.message);
                            }
                            if(fn){
                            	fn();
                            }
                        }else if(d.status=="success"){
                        	$("#infoEdit .nickname").parent().find(".nicknameIconTrue").removeClass("nicknameIconErr").show();
                        	$("#infoEdit .nickname").removeClass("nicknameTextBorder");
                        	nickBlur=true;
                        	nickIsTurForNext=true;
                        	if(fn){
                            	fn();
                            }
                        }else{
                        	nickIsTurForNext=false;
                            nickBlur=false;
                       	    //未登录异常还能处理
                        	 $(document).errorDataOperateFn(d);	
                        }
                    }
                });
            },
            
            //昵称失去焦点
            nickNameBlur:function(fn){
                    var checkName=$("#infoEdit .nickname").val();
                    if(!checkName){
                    	userInfo_main.regs.nickNameRule($("#infoEdit .nickname"),"请您至少填写昵称");
                    	$(".nickname").focus();
                        return false;
                    }
                    var isTureForInputNickName=checkName.match(regSpace);
                    if(isTureForInputNickName){
                    	userInfo_main.regs.nickNameRule($("#infoEdit .nickname"),"格式错误，请勿输入空格");
                      	$(".nickname").focus();
                        return false;
                    }
                    if(checkName==""||checkName.length>10||checkName.length<2){
                	    userInfo_main.regs.nickNameRule($("#infoEdit .nickname"),"昵称长度为2-10个字符或汉字");
                	    $(".nickname").focus();
                        return false;
                    }
                    userInfo_main.currentEventF.checkNickName(fn);
            },
            
            //裁剪完成的保存
            saveCut:function(that){
                var _thisT = $(that),
                    datas = _thisT.data();
                if(_this.regs.checkObjEmpt(_thisT.data())){
                    $(".js_alertMsg").html("亲，先选个封面呗！");
                    global_main.globalFn.tcCenter($(".alertMSG"));
                    return false;
                }else{
                    datas = $.extend(datas,{r:Math.random()});
                    if($(_thisT).attr("keepRepeat")=="false"){
                        return false;
                    }
                    $(_thisT).attr("keepRepeat","false");
                    $.ajax({
                        url:_this.userInfoPort.imageUp,
                        type:"GET",
                        dataType:"json",
                        data:datas,
                        success:function(d){
                            if(d.status=="success"){
                                $("#hid_addImgUrl").val(d.data);
                                $("#js_curTX").attr("src",d.data).show();
                                $(".show_img_area .nicknameIconTrue").show();
                            }else if(d.status=="failed"){
                            	$(".js_alertMsg").html(d.message);
                                global_main.globalFn.tcCenter($(".alertMSG"));
                            }else{
                            	  //未登录异常处理
                            	 $(document).errorDataOperateFn(d);	
                            }
                        },
                        complete:function(){
                            $(_thisT).attr("keepRepeat","true");
                        }
                    });
                }
            },

            //通过区组获取服务器
            getServers:function(quV){
                if(quV!="0"){
                    var  optHtml = '<option value="0">服务器</option>';
                    $.ajax({
                        url: _this.userInfoPort.getServers,
                        type: "GET",
                        dataType: "JSON",
                        data: {
                            netType:quV,
                            r: Math.random()
                        },
                        beforeSend:function(){
                            $("#server").html("<option>正在读取中，请稍后...</option>");
                        },
                        success:function(d){
                            if(d.status=="success"){
                                var dCont = d.data;
                                for (var i = 0; i<dCont.length; i++) {
                                	if(dCont[i].serverName!="内测专区"){
                                		optHtml += "<option value='" + dCont[i].serverId + "'>" + dCont[i].serverName + "</option>";
                                	}
                                }
                            }else if(d.status=="failed"){
                                $(".js_alertMsg").html(d.message);
                                global_main.globalFn.tcCenter($(".alertMSG"));
                            }else{
                            	  //未登录异常处理
                            	 $(document).errorDataOperateFn(d);	
                            }
                            $("#server").html(optHtml);
                        }
                    });
                }
            },
            
            //编辑保存
            editSave:function(that){
                if($(that).attr("keepRepeat")=="false"){
                    return false;
                }
                var nickname=$(".nickname").val(),
                    hid_addImgUrl=$("#hid_addImgUrl").val();
                if($(".nickname").css("border-left-width")=="0px"){
                    nickname="";
                }
                var nettypecode="",
                    areaname="",
                    serverid="",
                    servername="",
                    roleid="",
                    rolename="";
                if($(".userIns .role02").attr("newroleid")){
                	 nettypecode=$(".userIns .quzu02").attr("newnettypecode");
                     areaname=$(".userIns .quzu02").attr("newareaname");
                     serverid=$(".userIns .server02").attr("newserverid");
                     servername=$(".userIns .server02").attr("newservername");
                     roleid=$(".userIns .role02").attr("newroleid");
                     rolename=$(".userIns .role02").attr("newrolename");
                }else{
                	 nettypecode=$(".userIns .quzu02").attr("netTypeCode");
                     areaname=$(".userIns .quzu02").html();
                     serverid=$(".userIns .server02").attr("serverId");
                     servername=$(".userIns .server02").html();
                     roleid=$(".userIns .role02").attr("roleId");
                     rolename=$(".userIns .role02").html();
                }
                $.ajax({
                    url: _this.userInfoPort.setUserInfo,
                    type: "POST",
                    dataType: "JSON",
                    data: {
                        nickname:nickname,
                        avatarUrl:hid_addImgUrl,
                        netTypeCode:nettypecode,
                        areaName:areaname,
                        serverId:serverid,
                        serverName:servername,
                        roleId:roleid,
                        roleName:rolename,
                        account:$(".js_daoAccount").val(),
                        r: Math.random()
                    },
                    beforeSend:function(){
                        $(that).addClass("dissaveinfo");
                        $(that).attr("keepRepeat","false");
                    },
                    success:function(d){
                        if(d.status=="success"){
                        	$(".hrefsGo").hide();
                        	$("#infoEdit .phoneNums").parents(".errorIpt").next(".error").html("");
                        	$("#infoEdit .phoneNums").removeClass("nicknameTextBorder");
                          $("#infoEdit .phoneNums").parents(".errorIpt").find(".nicknameIconTrue").removeClass("nicknameIconErr");
                          $(document).popErrorF({type:"open",tip:"保存成功",closeFn:function(){window.location.href="http://dao.gyyx.cn/forum"}});
                        }else if(d.status=="failed"){
                        	userInfo_main.regs.nickNameRule($("#infoEdit .nickname"),d.message)
                        }else{
                        	$(document).errorDataOperateFn(d)
                        }
                    },
                    complete:function(){
                    	 $(that).removeClass("dissaveinfo").attr("keepRepeat","true");
                    }
                });
            }
        }
    }
    
    return new userInfoWeb;
})();

$(function(){
	//有登录状态执行函数
	//1、用户已绑定的手机 2、flash上传图片按钮初始化
	var loginSucFn = function (){
		  $("#btnUpImg").off().on("change",function(){
			   var _this=$(this);
		        var fileValue=$(_this).val();
		        if(fileValue==""){
		            //文件未选择
		            return false;
		        }
		        if(fileValue.indexOf(".")==-1){
		            $(".js_alertMsg").html("图片格式不对");
		            global_main.globalFn.tcCenter($(".alertMSG"));
		            $("#maskId,#uploadWord01").show();
		            $(_this).val("");
		            return false;
		        }
		        var fileType=userInfo_main.regs.getExt(fileValue);
		        if(!(/^(jpg|JPG|png|PNG|bmp|BMP|jpeg|JPEG)$/.test(fileType))){
		            $(".js_alertMsg").html("图片格式不对");
		            global_main.globalFn.tcCenter($(".alertMSG"));
		            $(_this).val("");
		            return false;
		        }
		        if(window.File && window.FileReader && window.FileList && window.Blob){//支持file类型方式
		        	 var fileStream=this.files[0];//file的二进制流
			         	//模拟数据
			             var fd = new FormData();

			             fd.append('Filename', $(".uploadName").val()); //必传
			             
			             var blob = new Blob([fileStream], { type: "application/octet-stream"});

			             fd.append("Filedata", blob);
			             fd.append("Upload","");
			         	
			             //ajax
			             var xhr = new XMLHttpRequest();
			             
			             xhr.open("post", userInfo_main.userInfoPort.uploadImgUrl, true);
			             
			             xhr.addEventListener('load', function (e) {
			                 try {
			                       uploadSuccess(fileStream,e.target.response);
			                       $(_this).val("");
			                 } catch (er) {
			                	 var errorMsg=eval('(' + e.currentTarget.response + ')').message;
				                	if(errorMsg=="Picture size greater than 5M"){
				                		 $(".js_alertMsg").html("请您选择不超过5M的图片");
				                	}else{
				                		 $(".js_alertMsg").html("上传失败，请重试");
			                	    }
			                      global_main.globalFn.tcCenter($(".alertMSG"));
			                      $(_this).val("");
			                      $("#imgsP,#js_curTX").attr("src","").css("style","");
			                	  $("#js_curTX").css("display","none");
			                	  $(".show_img_area .nicknameIconTrue").hide();
			                 }
			             });
			             xhr.send(fd);
		        }else{//不支持file使用ifram形式
		        	//走forum接口
		             $("#subnitUpSp").click();
		             var response="";
		             var interTimeFor=setInterval(function(){
		                 response=$("#spFrame").contents().find("body").html();
		                 if(response!=""){
		                	 responseEval = eval('(' + response + ')');
			                 if(responseEval.status=="success"){
			                     clearInterval(interTimeFor);
			                     uploadSuccess(this,response);
			                     $(_this).val("");
			                 }else{
			                	   clearInterval(interTimeFor);
			                	   if(responseEval.message=="Picture size greater than 5M"){
			                		   $(".js_alertMsg").html("请您选择不超过5M的图片");
			                	   }else{
			                		   $(".js_alertMsg").html("上传失败，请重试");
			                	   }
			                	   global_main.globalFn.tcCenter($(".alertMSG"));
			                      $(_this).val("");
			                      $("#imgsP,#js_curTX").attr("src","").css("style","");
			                	  $("#js_curTX").css("display","none");
			                	  $(".show_img_area .nicknameIconTrue").hide();
			                 }
		                 }
		             },500)
		        }
		    });
	  
	};
  
   //未登录时选择图片按钮点击事件
   $("body").off().on("click","#btnUpImg",function(e){
    if($("body").data("islogin")!=false){
      loginSucFn();
    }else{
      e.preventDefault();
      login_main.showLogin();
    }
  });
    
	//用户信息设置初始化为空-火狐
	$(".nickname,.phoneNums,.bindPhone").val("");
	$(".js_vcodes").val("发送验证码");
    $("#quzu option[value='0']").attr("selected",true);
    $("#server option[value='0']").attr("selected",true);
	
	//初始化角色验证码
    capt = configCaptcha({
         captchaInWrap: ".js_configCaptchaPopIn",//内嵌验证码容器（简单，复杂）
         cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
         data: { //参数
             bid: "qnbtrgebyr"//区分不同业务 非空
         },
         isCaptchaOnePop:true, //简单、复杂验证码都在弹层显示
         comIn: false, //复杂验证码是否内嵌 true:内嵌  false：弹层 
         isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
         inputaccName: "Account", //自定义隐藏域name名称
         inputName: "Captcha",//自定义账号name名称(失去焦点时验证是否需要验证码)
         inputCookieName: "cookies"//自定义隐藏域cookie name名称
	   });
    capt.init();//初始化验证码
    
    
    //验证码弹层关闭
    $(".js_captcha_close").click(function(){
        $(".bgT,#formmima").hide();
        $(".js_refreshChinaCaptcha").click();
    });

    //用户昵称是否重复及对应展示
    $("#infoEdit .nickname").blur(function(){
    	  if($("#infoEdit .nickname").css("border-left-width")=="0px"){
              return false;
        }
    	 userInfo_main.currentEventF.nickNameBlur()
    });
    
    $(".errorIpt .nickname,.errorIpt .vcodes").keyup(function(){
    	$(this).parents(".errorIpt").next(".error").html("");
    	$(this).removeClass("nicknameTextBorder");
    	$(this).parent().find(".nicknameIconTrue").hide();
    });
    
    //裁剪完成的保存
    $(".js_cutSubmit").click(function(){
        var _this=$(this);
        userInfo_main.currentEventF.saveCut(_this);
    });

    //通过区组获取服务器
    $("#quzu").change(function(){
        var _this=$(this);
    	$(".userIns .role02").attr("newroleid","");
    	$(".roles").html('<a href="javascript:void(0)" class="norol">请获取您的角色</a>');
        if($("#quzu").val()=="0"){
            $("#server").html('<option value="0">服务器</option>');
            return false;
        }
        userInfo_main.currentEventF.getServers(_this.val());
    });
    
    $("#server").change(function(){
    	$(".userIns .role02").attr("newroleid","")
    	$(".roles").html('<a href="javascript:void(0)" class="norol">请获取您的角色</a>');
        if($("server").val()=="0"){
            $("#server").html('<option value="0">服务器</option>');
            return false;
        }
    });

    //获取用户在区组服务下的包含角色
    $(".gain").click(function(){
        if(!$("body").data("islogin")){
          login_main.showLogin();
          return false;
        }
        if(!$(this).hasClass("js_tb")){
            	if($(".js_daoAccount").val()==""){
            		$(".js_alertMsg").html("请输入问道账号");
            		global_main.globalFn.tcCenter($(".alertMSG"));
            		return false;
            	}
                if($("#server option:selected").val()=="0"){
                    $(".js_alertMsg").html("请选择区组服务");
                    global_main.globalFn.tcCenter($(".alertMSG"));
                    return false;
                }
                //弹出验证码
                capt.openCaptchaOnePop(userInfo_main.currentEventF.submitYZM);
        }
    });

    //游戏角色选择
    $(".roles").on("click","span",function(){
        $(this).siblings().removeClass("cur").end().addClass("cur");
        $(".userIns .role02").attr("newroleid",$(".roles .cur").attr("roleId")).attr("newrolename",$(".roles .cur").html());
    });
    
    //无权限论坛，返回首页按钮
    $(".alertMSG .userInfoError").click(function(){
    	 $(".js_close").click();
    });
    
    //编辑保存
    $(".saveAll").click(function(){
        var _this=$(this);
        $("#infoEdit .error").html();
    	$(".alertMSG .userInfoError").hide();
    	if($("#infoEdit .nickname").css("border-left-width")=="0px"){
    		userInfo_main.currentEventF.editSave(_this);
    	}else{
    		userInfo_main.currentEventF.nickNameBlur(function(){
               	if(!nickBlur){
               		return false;
               	}
                if(!nickIsTurForNext){
                    $(".js_alertMsg").html(nickErrorAlert);
                    global_main.globalFn.tcCenter($(".alertMSG"));
                    return false;
                }
                userInfo_main.currentEventF.editSave(_this);
    		})
    	}
        
    });

});