/*
 * add by tht 2017-12-05
 * for top search function
 */
/*=======================update log start=====================*/

/*=======================update log end=====================*/
(function () {
    /*====================接口-开始===================*/

    var searchRecommendUrl = "/forum/tag/recommend";  //推荐标签接口
    var getTopSearchKeyWordListUrl = "/forum/keyword/list";  //获取顶部搜索关键字列表

    /*====================接口-结束===================*/

    function TopSearch() {
        //Constructor
    }
    TopSearch.prototype = {
        init: function () {
            var _this = this;
            $(".js_search_top_input").val('')
            //地址栏初始化搜索框
            _this.linkKeyWordFn();
            //推荐搜索功能
            _this.recommendSearchFn();
            //点击进行搜索
            _this.searchWordFun();
            //实时输入事件
            _this.listenToInputFn();
            $(".js_top_search_guides").hide()
         
        },
        //搜索跳页判断，记录搜索关键词
        searchFuntion: function () {
            var keyWord;
            keyWord = $.trim($(".js_search_top_input").val()) == '' ? $(".js_top_search_recommends").html() : $.trim($(".js_search_top_input").val());
            var iconTe = keyWord.replace(new RegExp("&", "g"), "%26");
            window.location.href = 'http://dao.gyyx.cn/forum/search?keyWord=' + iconTe
        },
        //搜索功能
        searchWordFun: function () {
            var _this = this;
            $(".searchBtn").click(function () {

                _this.searchFuntion();
            })
            //enter搜索（区别登录还是搜索回车）
            $(document).keydown(function (event) {
                var hasFocus = $('.js_search_top_input').is(':focus');
                if ($(".login_wrapper").is(":visible") && event.keyCode == 13) {
                    $(".js_ajaxLogin").click();
                } else if (!$(".login_wrapper").is(":visible") && event.keyCode == 13 && hasFocus) {
                        _this.searchFuntion();
                }

            });
        },
        //地址中关键字
        linkKeyWordFn: function () {
            if ($(document).getLinkParamFn("kw")) {
                $(".js_search_top_input").val($(document).getLinkParamFn("kw"));
                $(".js_top_search_recommends").hide();
            } else {
                $(".js_top_search_recommends").show();
            }
        },
        //获取搜索推荐内容
        recommendSearchFn: function () {
            var _this = this;
            $.ajax({
                url: searchRecommendUrl,
                type: "get",
                dataType: "json",
                data: {
                    r: Math.random()
                },
                success:function(d){
                	if(d.status=="success"){
                		var recommendData = d.data;
                		if(recommendData.length){	
                			//随机取值范围：Math.random()*N   N:取值范围 ; 如：取第1个-第3个元素中的随机一个,N就为3
                    		var mathNum = parseInt(Math.random()*recommendData.length);
                    		$(".js_top_search_recommends").html(recommendData[mathNum].tag);
                		}                		
                	}
                }
			});
			//点击搜索推荐处理
			$(document).off("click",".js_top_search_recommends,.js_search_top_input").on("click",".js_top_search_recommends,.js_search_top_input",function(){				
				$(".js_search_top_input").focus();
				_this.listenToInputFn();
				_this.searchInputFocusFn();	
				//获取顶部搜索关键字列表
				_this.getTopSearchKeyWordListFn();
			});
			//模拟焦点移除事件
			_this.searchSimulateBlurFn("js_search_top_input","js_top_search_list")
			_this.searchInputKeyUpFn();
		},
		//点击搜索关键字列表跳转搜索结果页面
		searchClidkListFn:function(){
			$(document).off("click",".js_top_search_list li").on("click",".js_top_search_list li",function(){
			    var searchHot = $(this).find("a").text();
			    var urlName = window.location.pathname;//获取当前网页名
			    $(".js_search_top_input").val(searchHot);
			    var keyWords = $.trim($(".js_search_top_input").val());//搜索词
				//隐藏关键字列表
			    $(".js_top_search_list").hide();
			    //隐藏默认/说明
			    $(".js_top_search_recommends,.js_top_search_guides").hide()
			    //跳转进行搜索
				if (urlName.indexOf("search") >= 0) {//在搜索页面不新开页面
				    $(".searchBtn").click();
				} else {//新开页面进行记录搜索
				    window.location.href = 'http://dao.gyyx.cn/forum/search?keyWord=' + keyWords
				}
				
			});
		},
		//搜索框获取焦点
		searchInputFocusFn:function(){
			$(".js_search_top_input").focus(function(){
				if ($.trim($(".js_search_top_input").val()) == "") {
				    $(".js_top_search_guides").html('搜索标题/标签/用户').show();
					
					$(".js_top_search_recommends").hide();
					$(".js_search_top_input").val("");
				}
			});
			
		},
		//搜索框失去焦点
		searchInputBlurFn:function(){
			$(".js_search_top_input").blur(function(){
			    if ($.trim($(".js_search_top_input").val()) == "") {
					$(".js_top_search_guides").hide();
					$(".js_top_search_recommends").show();
				}
				//隐藏关键字列表
    			$(".js_top_search_list").hide();
			});
		},
		//监听输入框事件(无内容则显示输入提示语)
		listenToInputFn:function(){
			$(".js_search_top_input").on("input propertychange",function(){
			    if ($.trim($(".js_search_top_input").val()) == "") {
				    $(".js_top_search_guides").html('搜索标题/标签/用户').show();
					$(".js_top_search_recommends").hide();	
				} else {
				    
				    $(".js_top_search_recommends,.js_top_search_guides").hide()
				}
			})
		},
		
		//模拟失去焦点事件
		searchSimulateBlurFn:function(prevId, nextId){
			 $(document).bind('click', function (e) {
				var el = e || window.event; //浏览器兼容性     
				var elem = el.target || el.srcElement;
				while (elem) { //循环判断至跟节点，防止点击的是div子元素     
				    if (elem.id && (elem.id == nextId || elem.id == prevId)) {
						return;
					}
					elem = elem.parentNode;
				}
				if ($.trim($(".js_search_top_input").val()) == "") {
					 $(".js_top_search_guides").hide();
					 $(".js_top_search_recommends").show();	
				} else {

					$(".js_top_search_recommends").hide();	
				}
				$('.' + nextId).css('display', 'none'); //点击的不是div或其子元素 
			});

		},
		//搜索框keyup事件
		searchInputKeyUpFn:function(){
			$(".js_search_top_input").keyup(function(){		
			    if ($.trim($(".js_search_top_input").val()) == "") {
					$(".js_top_search_guides").show();
				}else{
					$(".js_top_search_guides").hide();
				}
			});
			
		},
		//获取顶部搜索关键字列表
		getTopSearchKeyWordListFn:function(){
			var _this=this;
			$.ajax({
				url:getTopSearchKeyWordListUrl,
				type:"get",
				dataType:"json",
				data: {
                    r: Math.random()
                },
                success:function(d){
                	if(d.status=="success"){
                		var keywordData = d.data;
                		if(keywordData.length){	
                			var liStr = '';
                			for(var i=0,l=keywordData.length;i<l;i++){
                				var j = i+1;
                			   //前3条红色标记
                				var classNames = i < 3 ? "hot" : '';
                				liStr += '<li class="'+classNames+'"><i class="nums">'+j+'</i><a>'+keywordData[i]+'</a></li>';
                				
                			}
                			$(".js_top_search_list ul").html(liStr);
                			//显示关键字列表
                			$(".js_top_search_list").show();

                		    //推荐列表显示，并且输入框内容为空（鼠标在输入框内）则显示输入说明提示语js_top_search_guides
                			if ($.trim($(".js_search_top_input").val()) == '') {
                			    $(".js_top_search_guides").html('搜索标题/标签/用户').show();
                			    $(".js_top_search_recommends").hide();
                			}
							_this.searchClidkListFn();
                		}
                		
                	}

                }
            });
        }

    };
    window.topSearch = function () {
        return new TopSearch();
    };
})();
$(function () {

    topSearch().init();

});