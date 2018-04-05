/* add by tht 2017-6-13
 * for post forum function
*/

(function ($) {
    $.fn.extend({
        OaSearch: function (options) {
            /*============================================*/
            /*  AjaxSearchUrl :  搜索接口地址*/
        	/*  AjaxRecommendUrl: 获取推荐位标签*/
            /*  InputObj :  搜索输入框*/
            /*  InputType : 搜索输入框限制格式  可选 all(不限制)，zhw(中文)*/
            /*  listKey : 显示在下拉列表里每项的数据键值，默认为RealName*/
            /*  InputKey : 选择搜索结果后存入搜索框的数据键值，默认为RealName(Code)*/
            /*  ManuallyEnter : 是否允许手动输入，默认为允许true*/
            /*  MaxNameLen : ["0",""]限制输入框最多显示几个人名，默认不限制为0，第二个参数为限制时 的提示信息 eg:["1","只能输入1个人名"] */
            /*==================================================*/
            var Defaults = {
                AjaxSearchUrl:"/forum/tag/list",
                AjaxRecommendUrl:"/forum/tag/recommend",  
                InputObj: ".js_oaSearch",
                InputType: "all",
                listKey: "RealName",
                InputKey: ["RealName", "Code"],
                ManuallyEnter: true,
                MaxNameLen:["5","最多输入5个标签哦"],
                selectedWrap:".js_tag_selected",
                errWrap:".js_tag_err"
            };
            Defaults = $.extend(Defaults, options);

            var $oaSearch = $(this);

            //初始化搜索框
            var _init = function () {

                $oaSearch.click(function () {
                    $(this).find(Defaults.InputObj).focus();
                });

                //初始化输入框里的值
                var initVal = $.trim($oaSearch.find(".js_oaSearchResult").val());
                if (initVal) {
                    var initValList = initVal.split(" ");
                    if (initValList.length > 0) {
                    	var htmls = "";
                        for (var i = 0; i < initValList.length; i++) {
                        	htmls+="<li data-tag='" + initValList[i] + "'><span>" + initValList[i] + "</span><i class='js_deleTag'>×</i></li>";

                        }
                        $(Defaults.selectedWrap).html(htmls);
                    }
                    $(".js_tag_default").hide();
                }else{
                	$(".js_tag_default").show();
                }
                //提示语click事件
                $(".js_tag_default").click(function(){
                	$(Defaults.InputObj).focus();
                });
                _deleteChoice();

            };
            //标签推荐位
            var _recommendTagsFn = function(){
            	$.ajax({
                    url: Defaults.AjaxRecommendUrl,
                    type: "get",
                    dataType: "json",
                    data: {
                        r: Math.random()
                    },
                    success: function (d) {
                    	if(d.status=="success"){
                    		var existTags = $(".js_oaSearchResult").val();  //已选择标签
                    		var existTagsArr = existTags.split(" ");   //已选择标签数组
                    		
                    		var recommendTagArr = d.data; //推荐位标签数组
                    		
                    		var recommendTagStr = '';
                    		
                    		if(!recommendTagArr||!recommendTagArr.length){
                    			recommendTagStr+='<li class="default">暂无推荐位</li>';
                    		}else{
                        		for(var i=0,l=recommendTagArr.length;i<l;i++){
                        			if($(document).checkArrayContainStrFn(existTagsArr,recommendTagArr[i].tag)){   //如果已选择标签与标签推荐位相同，标签推荐位添加选中状态
                        				recommendTagStr+='<li class="on">'+recommendTagArr[i].tag+'</li>';
                        			}else{
                        				recommendTagStr+='<li>'+recommendTagArr[i].tag+'</li>';
                        			}
                        		}
                    		}

                    		$(".js_recommend_tags").html(recommendTagStr);  //渲染推荐位列表
                            
                    	}else{
                    		$(document).errorDataOperateFn(d,null,{
                    			loginErrorFn:function(){
    								$("#forumPost").popPostF("close");
    							},
    							noNickNameFn:function(){
    								$("#forumPost").popPostF("close");
    							}
                    		});	
                    	}
                        
                    }
                });
            	_recommendTagsSelectEventFn();//推荐位点击事件
            };
            //标签推荐位选中状态
            var _recommendTagsSelectStatusFn = function(status,val){
        		$(".js_recommend_tags li").each(function(){
            		var $this = $(this);

        			if(status=="addClass"&&$this.text()==val&&!$this.hasClass("on")&&!$this.hasClass("default")){ //推荐标签添加选中状态
        				
            			$this.addClass("on");
            			
            		}else if(status=="removeClass"&&$this.text()==val&&$this.hasClass("on")){ //推荐标签取消选中状态
            			
            			$this.removeClass("on");
            			
            		}

            	});

            };
            //推荐位点击事件
            function _recommendTagsSelectEventFn(){
        		
        		$(document).off("click",".js_recommend_tags li").on("click",".js_recommend_tags li",function(){
        			var $this = $(this);
        			if(!$this.hasClass("default")){ //无推荐位提示语，点击时不添加选中标签功能
        				$(".js_tag_default").hide();  //隐藏默认提示
        			}
        			
        			if($this.hasClass("on")){
        				
        				$this.removeClass("on");
        				
        				$(".js_tag_selected li").each(function(){
        					
        					if($(this).attr("data-tag")==$this.text()){
        						$(this).remove();
        					}
        					
        				});
        				_resetSelTagAndResultValFn();//重置选中标签和标签隐藏域
        				
        			}else{
        				if(!$this.hasClass("default")){ //无推荐位提示语，点击时不添加选中标签功能
        					_showResultList($oaSearch.find(Defaults.InputObj),$this.text()); //添加选中标签
        				}
        				
        			}
        		});
            }
            //显示搜索结果面板，定位在输入框下方
            var _showSearchPanel = function () {

                //添加搜索结果面板
                if ($oaSearch.find($(".js_searchPanel")).length <1) {
                $oaSearch.append("<ul class='js_searchPanel tag_search_result' style='display:none;'></ul>");
                }
            };

            //隐藏搜索结果面板
            var _hideSearchPanel = function () {
                $oaSearch.find(".js_searchPanel").hide();
            };

            //搜索框获取焦点事件
            var _eventFocus = function () {
                var $obj = $oaSearch.find(Defaults.InputObj);
                $obj.focus(function () {
                	$(".js_tag_default").hide();  //隐藏默认提示
                });
            };

            //搜索框keyup事件
            var _eventKeyUp = function () {
                var $obj = $oaSearch.find(Defaults.InputObj);
                $obj.keyup(function () {
                    _inputErrTip("");
                    _showSearchPanel();
                    var _val = $.trim($(this).val());
                    var expSpace = new RegExp(/^\s{1}$/); //全角、半角空格及其他的可以形成空行、空字符的键入
                    //最后空格输入
                    if(expSpace.test($(this).val().substring($(this).val().length-1,$(this).val().length))){
                    	_checkInputTxt($obj,_val);
                    	_hideSearchPanel();
                    }else{
                    	if (_val.length !== 0) {
                            _getResult($(this));
                        } else {
                            _hideSearchPanel();
                        }
                    }
                });
            };

            //搜索框失去焦点效果。取点击事件判断是否隐藏结果面板
            var _eventBlur = function () {
            	var $obj = $oaSearch.find(Defaults.InputObj);
                $(document).click(function (e) {
                    var inputObj = Defaults.InputObj.substring(1, Defaults.InputObj.length);
                    if (!$(e.target).hasClass(inputObj)&&!$(e.target).parent().hasClass("js_searchPanel")&& !$(e.target).parents().hasClass("js_tag_selected") &&!$(e.target).hasClass("js_deleTag")) {
                    	var result = $obj.val();
                        result = $.trim(result);
                        _checkInputTxt($obj,result);
                        _hideSearchPanel();
                    }
                });
            };

            // ajax取得搜索结果并展示在结果面板
            function _getResult(obj) {

                var $obj = $(obj);
                var val = $.trim($obj.val());
                	val = encodeURI(val);

                $.ajax({
                    url: Defaults.AjaxSearchUrl + "?tag=" + val,
                    type: "get",
                    dataType: "json",
                    data: {
                        r: Math.random()
                    },
                    success: function (d) {
                    	if(d.status=="success"){
                    		var item = "";
                            if(d.data.length !== 0){
                                for(var i = 0; i < d.data.length; i++){
                                    item += '<li>' + d.data[i].tag + '</li>';
                                }
                            }
                            $oaSearch.find(".js_searchPanel").empty().append(item);
                            $oaSearch.find(".js_searchPanel").show();

                            _choiceResult(obj);
                            
                    	}else{
                    		if(d.status == "incorrect-login"){
                        		$(document).popErrorF({
            						type:"open",
            						tip:"哎哟，登录超时啦，重新登录下吧！",
            						closeFn:function(){
            							$("#forumPost").popPostF("close");
            							$(document).reLoginFn();
            						}
            					});
            					
            				}else{
            					$(document).popErrorF({
            						type:"open"
            					});
                        	}
                    	}
                        
                    }
                });

            }

            //结果面板里鼠标事件。
            function _choiceResult(obj) {
                $oaSearch.find(".js_searchPanel").find("li").hover(function () {
                    $(this).addClass("cur").siblings().removeClass("cur");
                });

                $oaSearch.find(".js_searchPanel").find("li").click(function () {
                    //取出当前选中项的各data属性，通过事先存储好的resultFormatKey取得每个data属性
                    var val = $(this).text();

                    _showResultList(obj, val);

                });

            }

            //添加新标签（输入、搜索列表选择）
            function _showResultList(obj, val) {
                
                //限制标签个数
                if(Defaults.MaxNameLen[0]!="0"&&$(Defaults.selectedWrap).find("li").length>=Defaults.MaxNameLen[0]){ 
                	_inputErrTip('最多5个标签');
                }else{
                	$(Defaults.selectedWrap).append("<li data-tag='" + val + "'><span>" + val + "</span><i class='js_deleTag'>×</i></li>");
                	_resetSelTagAndResultValFn(); //重置选中标签隐藏域
                	_recommendTagsSelectStatusFn("addClass",val); //如果输入与推荐标签一致，则推荐标签选中
                }

                obj.val("");
                _hideSearchPanel();

            }

            //删除已选择的项
            function _deleteChoice() {
            	$(document).off("click",Defaults.selectedWrap+" .js_deleTag").on("click",Defaults.selectedWrap+" .js_deleTag",function () {
            		
            		var delTag = $(this).parent("li").attr("data-tag"); //当前被删除的标签
            		
                    $(this).parent("li").remove();
                    
                    _resetSelTagAndResultValFn();//重置选中标签和标签隐藏域
                    
                    var selTagArr = $oaSearch.find(".js_oaSearchResult").val().split(" ");
                    
                    if(!$(document).checkArrayContainStrFn(selTagArr,delTag)){  //当已选好的标签中不在包含删除的标签时，推荐位对应的标签取消选中状态
                    	
                    	_recommendTagsSelectStatusFn("removeClass",delTag); //如果删除与推荐标签一致，则推荐标签取消选中
                    }
                    
                });
            }
            //重置选中标签隐藏域
            function _resetSelTagAndResultValFn(){
            	var newval = "";
                $(Defaults.selectedWrap).find("li").each(function (i) {
                    if (i === 0) {
                        newval += $(this).attr("data-tag");
                    } else {
                        newval += " " + $(this).attr("data-tag");
                    }
                });

                $oaSearch.find(".js_oaSearchResult").val($.trim(newval));
            }
            //验证输入项
            function _checkInputTxt(obj,val){
            	var expSymbol = new RegExp("^[0-9a-zA-Z.\\-_\u4e00-\u9fa5\u3007]{1,}$"); //匹配符号
            	var expLen = new RegExp("^[0-9a-zA-Z.\\-_\u4e00-\u9fa5\u3007]{1,5}$");  //匹配符号长度
                if(!expSymbol.test(val)&&val!==""){
                	_inputErrTip('标签包括中英文, 仅支持三个标点符号：".","-","_"');
                    obj.val("");
                }else if(!expLen.test(val)&&val!==""){
                	_inputErrTip('每个标签不多于5个字');
                    obj.val("");
                }else if(val==""){
                	return false;
                }else{
                	_showResultList(obj, val);
                }
                
            }
            function _inputErrTip(str){
            	$(Defaults.errWrap).html(str);
            }
            _init();
            _recommendTagsFn();
            _eventFocus();
            _eventKeyUp();
            _eventBlur();
           

        }
    });
})(jQuery);
