/*-------------------------------------------------------------------------
 * 作者：dongchunshui
 * 创建时间： 2017/7
 * 版本号：v1.0
 * 作用域：交易记录
 -------------------------------------------------------------------------*/
(function(){
    var isMoreThanLimitAccessCount="/wealth/record/needcaptcha";//查询交易记录，监测是否需要验证码
    var getWealthJournal="/wealth/record/journal";//交易记录，分页查询
    var wealthUrl="/wealth/user/wealth";//获取金银符数量
    var daoTradeChinaCaptcha=null;//验证码创建
    var that=null;
    var tradeStr=''+
    '<div class="tc tc02 js_tradePop">'+
	    '<i class="js_close cursor"></i>'+
	    '<div class="con">'+
	        '<div class="payTit">'+
	               '<span class="jyjl lf">交易记录</span>'+
	               '<p class="yF ri">'+
                   '<span class="c4">银符钱</span>'+
                   '<i class="js_wealthYf">***</i>'+
	               '</p>'+                            
                    '<p class="jF ri">'+
                        '<span class="c3">金符钱</span>'+
                        '<i class="js_wealthJf">***</i>'+
                    '</p>'+
	        '</div>'+
	        '<div class="typeQuery">'+
	           '<div class="cx">'+
	              '<span parm="jinfu" class="sel lf jfq active">金符钱</span>'+
	              '<span parm="yinfu" class="sel lf yfq">银符钱</span>'+
	              '<span class="tis lf">时间&nbsp;&nbsp;:&nbsp;&nbsp;</span>'+
	              '<select class="selTimes lf">'+
	                  '<option value="301707">2017年7月</option>'+
	              '</select>'+
	              '<span class="js_cx ri">查询</span>'+
	           '</div>'+
	           '<div class="pageBox">'+
	           '<table border="0" cellspacing="0" cellpadding="0" id="jxTable">'+
				  '<thead>'+
				    '<tr>'+
				      '<th>订单号</th>'+
				      '<th>交易类型</th>'+
				      '<th>交易金额</th>'+
				      '<th>余额</th>'+
				      '<th>交易状态</th>'+
				      '<th>时间</th>'+
				    '</tr>'+
				  '</thead>'+
				  '<tbody class="pageDiv">'+
					'</tbody>'+
		       '</table>'+ 
				'<p class="notContent hide">无数据</p>'+
				'<div class="page js_page" style="display:none">'+
					'<ul class="pageMenu clearfix">'+
						'<li class="prevPage"> 上一页 </li>'+
						'<div class="pageObj ">'+
						'</div>'+
						'<li class="nextPage"> 下一页  </li>'+
					'</ul>'+
				'</div>'+
		    '</div>'+
				'<p class="jlTiShi">若您需要查询3个月前的交易记录，请您联系<a href="http://kf.gyyx.cn/Home/IMIndex"  target="_blank" >光宇在线客服</a></p>'+
	        '</div>'+
	    '</div>'+
	'</div>';
    function Wealth_trade(){
        
    }
    Wealth_trade.prototype = {
    		init:function(){
    			var _this=that=this;
                //初始化短信类型
				daoTradeChinaCaptcha = configCaptcha({
	                captchaInWrap: ".js_configCaptchaPopIn",//内嵌验证码容器（简单，复杂）
	                cssLinkSrc:"http://s.gyyx.cn/Lib/configCaptcha/css/configCaptcha.min.css",
	                data: { //参数
	                    bid: "wbheanyerpbeq"//区分不同业务 非空
	                },
	                isCaptchaOnePop:true, //简单、复杂验证码都在弹层显示
	                comIn: false, //复杂验证码是否内嵌 true:内嵌  false：弹层 
	                isOpenCaptcha: false,//是否需要验证码开关(部分业务需求需要开启 如：登录)
	                inputaccName: "Account", //自定义隐藏域name名称
	                inputName: "tradeCaptcha",//自定义账号name名称(失去焦点时验证是否需要验证码)
	                inputCookieName: "tradeCookies"//自定义隐藏域cookie name名称
                });
                daoTradeChinaCaptcha.init();//初始化验证码
    			_this.tradeClickFn();
    		},
            //点击交易记录按钮
            tradeClickFn:function(){
                var _this=this;
                $(".js_tradRecord").on("click",function(){
                    $("#infoEdit .nickname").prop("disabled",true).removeClass("nicknameTextBorder");
                    if($(this).attr("data-status")=="false"){
                        return false;
                    }
                    $(this).attr("data-status","false");
                    global_main.globalFn.checkLoginStatus(function(d){
                        if(d.data.nickname){
                            _this.showTradePop();//展示交易弹层
                        }else{
                            login_main.settingNickPop();
                            $(".tc02").hide();
                            $(".js_tradRecord").attr("data-status","true");
                        }
                    })
                    
                })
            },
            //展示交易弹层
            showTradePop:function(){
                var _this=this;
            	if(!$(".js_tradePop").length){
					$("body").append(tradeStr);
				}
                _this.wealthAjaxFn();//获取金银付钱
                _this.choosePayForYarMou();
                _this.isMoreThanLimitAccessCount();//获取交易记录列表
                _this.searchFn();//查询交易记录
                _this.trailEventFn()//后续事件
                login_main.tcCenter($(".js_tradePop"));
                _this.closeLogin(".js_tradePop .js_close");
            },
            //查询操作
            searchFn:function(){
                var _this=this;
                $(".js_cx").on("click",function(){
                    if($(this).attr("keeprepeat")=="false"){
                        return false;
                    }
                   $(this).attr("keeprepeat","false");
                    _this.isMoreThanLimitAccessCount();
                });
            },
            //交易记录后续事件
            trailEventFn:function(){
                $(".cx .sel").click(function(){
                    $(this).siblings(".sel").removeClass("active").end().addClass("active");
                });
            },
            //关闭弹层
			closeLogin:function(closeBtn){
				$(document).on("click",closeBtn,function(){
                    $("#infoEdit .nickname").prop("disabled",false);
					$(this).parents(".js_tradePop").hide();
					$(".bgT").hide();
                    $(".js_tradRecord").attr("data-status","true");
                    $(".cx .sel:eq(0)").addClass("active").siblings().removeClass("active");
                    $(".pageBox .pageDiv").html("");
				})
			},
    		//时间转换
            formatDate:function(nS){
                var date = new Date(nS),
                    Y = date.getFullYear() + '/',
                    M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/',
                    D = date.getDate(),
                    H=date.getHours()+':',
                    Mi=date.getMinutes();
                if(D<10){
                    D="0"+D;
                }
                if(Mi<10){
                    Mi="0"+Mi;
                }
                return Y+M+D+"&nbsp;&nbsp;"+H+Mi;
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
            //关闭验证码弹层
			captchaCloseFn:function(obj){				
				$(".js_configCaptcha_close").on("click",function(){
					obj.attr("keepRepeat","true");
				});
			},
            //交易记录的时间查询年月选择
            choosePayForYarMou:function(){
               var _this=this;
                var options="";
                var tadatCent=new Date();
                var atYear=tadatCent.getFullYear();
                var atMouth=tadatCent.getMonth()+1;
                var allDays=_this.getLastDay(atYear,atMouth);
                var endK=0;
                for(var i=0;i<3;i++){
                  if(atMouth-i==0){
                    var sy=3-i;
                    atMouth=12
                    atYear-=1;
                    allDays=_this.getLastDay(atYear,atMouth);
                    for(var k=0;k<sy;k++){
                      if(endK<3){
                        endK++
                        if(atMouth<9){
                          options+='<option sp="'+atYear+'-0'+(atMouth-k)+'-01,'+atYear+'-0'+(atMouth-k)+'-'+allDays+'">'+atYear+'年'+(atMouth-k)+'月</option>';
                        }else{
                          options+='<option sp="'+atYear+'-'+(atMouth-k)+'-01,'+atYear+'-'+(atMouth-k)+'-'+allDays+'">'+atYear+'年'+(atMouth-k)+'月</option>';
                        }
                      }
                    }
                  }else{
                    if(endK<3){
                      endK++
                      if(atMouth<9){
                        options+='<option sp="'+atYear+'-0'+(atMouth-i)+'-01,'+atYear+'-0'+(atMouth-i)+'-'+allDays+'">'+atYear+'年'+(atMouth-i)+'月</option>';
                      }else{
                        options+='<option sp="'+atYear+'-'+(atMouth-i)+'-01,'+atYear+'-'+(atMouth-i)+'-'+allDays+'">'+atYear+'年'+(atMouth-i)+'月</option>';
                      }
                    }
                  }
                 
                }
                $(".cx .selTimes").html(options);
            },
            //查询交易记录，监测是否需要验证码
            isMoreThanLimitAccessCount:function(){
                var _this=this;
                $.ajax({
                    url: isMoreThanLimitAccessCount,
                    type:"get",
					dataType:"JSON",
					data:{
						r:Math.random()
					},
                    success:function(res){
                        if(res.status=="true"){
                            //新验证码获取时用到
                            if(daoTradeChinaCaptcha.captcahSwitchOpen!=-1){
                                daoTradeChinaCaptcha.openCaptchaOnePop(_this.getPageForPays);
                                _this.captchaCloseFn($(".js_cx"))
                                //调整验证码层级样式,第一个弹框，第二个参数是遮罩层
                                login_main.popLevelFn(".configCaptchaPopWrap",".configCaptchaMask",2002000,1003000);                                
                            }else{
                                _this.getPageForPays();//无验证码时执行
                            }
                           
                        }else if(res.status=="false"){
                            _this.getPageForPays();
                        }else{
                            //未登录异常处理
                            $(document).errorDataOperateFn(res);
                            $(".tc02").hide();
                        }
                    }
                });

            },
            //交易记录，分页查询
            getPageForPays:function(){
            	$(".pageDiv,.pageObj ").html("");            	
                var tim=$(".cx .selTimes option:selected").attr("sp").split(",");
                //新验证码获取时用到
                var isNeedChpta=daoTradeChinaCaptcha.captcahSwitchOpen;
                var verifyCodes=isNeedChpta!=-1 ? $("input[name='tradeCaptcha']").val() : "";
				var cookieValue=isNeedChpta!=-1 ? $("input[name='tradeCookies']").val() : "";

                $(".pageBox").pageFun({ 
        			interFace:getWealthJournal,  
        			displayCount:5,  //每页显示总条数
        			maxPage:6,  //每次最多加载多少页
        			paramObj: { //传参
                        currencyType : $(".cx .active").attr("parm"),//货币类型
                        cookieValue:cookieValue,//验证码cookieValue，新验证码获取时用到
	 					validateCode:verifyCodes,//验证码，新验证码获取时用到
                        startDate : tim[0],
                        r:Math.random(),
                        endDate : tim[1]
                    },
        			dataFun:function(data){
                    	var dataHtml ="";                        
        				if(data){                           
                           var dateTime=that.formatDate(data.createTime)
        					dataHtml = '<tr>'+
                            '<td><span title='+data.sourceOrderNo+' class="ellipsisTxt">'+data.sourceOrderNo+'</span></td>'+
                            '<td>'+data.sourceType+'</td>'+
                            '<td>'+data.amount+'</td><td>'+data.balance+'</td><td>成功</td>'+
                           '<td class="sourceTimes">'+dateTime+'</td></tr>';
           				    $(".js_cx").attr("keepRepeat","true");
        				}
        				return dataHtml;
        			},
        			pageFun:function(i){
        				var pageHtml = '<li class="pageNum">'+i+'</li>';
    						return pageHtml;
        			}
        			
        		});
              
            },
            //获取金银符数量
            wealthAjaxFn:function(){
            	$.ajax({
                    url:wealthUrl,
                    type:"GET",
                    dataType:"json",
                    data:{
                        r:Math.random()
                    },
                    success:function(d){
                        if(d.status=="success"){
                        	//金银付钱展示位
                        	$(".js_wealthJf").html(d.data.jinfu);
                        	$(".js_wealthYf").html(d.data.yinfu);
                        }else{
                            //未登录异常处理
                            $(document).errorDataOperateFn(d);
                            $(".tc02").hide();
                        }
                    }
                });
            }
    };
    window.Wealth_trade = function(){
        return new Wealth_trade();
    };
})();
$(function(){	
	Wealth_trade().init();	
});