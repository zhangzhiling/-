(function(){
	var getCommentListUrl = routePath+"/comment/list"; // 获取回帖评论列表
	var postCommentUrl = routePath+"/comment";// get: 获取即将回复评论状态  post:添加回复的评论
	var deleteCommentUrl = routePath+"/comment/delete";// get: 获取即将删除评论状态  post:删除该评论
	
	var postZanAndCaiForumCommentUrl = routePath+"/poke"; //帖子（不分主贴和回帖）踩赞接口  1：赞  2：踩
	
	var commentSubmitTimer = null; //拦截频繁发评论定时器
	var commentSubmitTimeNum = 0;  //定时器倒计时数字
	
    function DaoCommentReplyForum(){
    	//constructure
    }
    DaoCommentReplyForum.prototype = {
        init:function(){
        	var _this = this;
        	
        	UMEDITOR_CONFIG.imageScaleEnabled=false;
        	UMEDITOR_CONFIG.toolbar=['emoji'];
        	UMEDITOR_CONFIG.whiteList = {  //过滤网页粘贴内容  只允许p标签
    			p:[],
    			img:['src','class','_url']
        	};
            
        	_this.showReplyListFn(); //展示回帖评论列表页
        	_this.deleteCommentFn(); //评论删除
        	_this.replyCommnetFn();//回复评论
        	_this.caiAndZanForumCommentFn();//帖子（不区分主贴回帖）赞和踩
        },
        //回复展开
        showReplyListFn:function(){
        	var _this = this;
        	
            $(".js_replyList").off("click",".js_comments_btn").on("click",".js_comments_btn",function(){
            	var $this = $(this);
            	var parentObj = $this.parent(); //回复按钮直接父级
            	var replyNum = $this.attr("data-num"); //每楼评论数
            	var replyNumStr = replyNum==="0"?"":"("+replyNum+")"; //拼装评论数字符串
            	var postId = $this.attr("data_replyid");  //回帖id
            	var commListWrap = $this.parents(".js_replyF_info").find(".js_comment_list"); //回帖评论列表容器
            	var commListPageWrap = $this.parents(".js_replyF_info").find(".js_commont_page"); //回帖评论分页容器
            	
            	UM.clearCache("commentEditor");  //清除下评论编辑器缓存，否则第二次通过删除已有编辑器标签再次渲染时无效。
            	
            	
            	//评论列表容器统一处理

            	if(parentObj.hasClass("on")){  //当前回帖评论已展示
            		
            		parentObj.removeClass("on");
            		$this.text("回复"+replyNumStr);
            		
            		$this.parents(".js_replyF_info").find(".js_comments_module").slideUp(100); //评论区域隐藏
            		
            	}else{                        //当前回帖评论未展示

            		parentObj.addClass("on");
            		$this.text("收起回复");
            		
                	//执行函数
                	
                	_this.getReplyCommentListFn(postId,commListWrap,commListPageWrap,$this,1);  //获取帖子列表ajax 实参为回帖id
                	
                	
                	$this.parents(".js_replyF_info").find(".js_comments_module").slideDown(100);
                	//评论数为0不展示分页和说一说按钮
                	if(parseInt(replyNum)==0){
                		$this.parents(".js_replyF_info").find(".js_comment_page_wrap").hide();
                	}else{
                		$this.parents(".js_replyF_info").find(".js_comment_page_wrap").show();
                	}
                	

                	$this.parents(".js_replyF_info").find(".js_comment_num_btn").hide();  //用户主动收起回复又打开回复时，当前评论列表评论数隐藏
                	
                	_this.showEditorOperateFn($this);  //展示编辑器操作

            	}	
            	
            });
        },
        //展示编辑器相关操作
        showEditorOperateFn:function($this){
        	var _this = this;
        	var editorScriptHtml = '<script type="text/plain" id="commentEditor"><p>如您输入括号或尖括号可能造成内容显示不完整</p></script>';  //编辑器初始化标签
        	var commCountWrap = $this.parents(".js_replyF_info").find(".js_comment_editor_count"); //回帖评论编辑器字数容器
        	var commErrorTipWrap = $this.parents(".js_replyF_info").find(".js_comment_editor_error"); //错误提示
        	var commSubmitBtn = $this.parents(".js_replyF_info").find(".js_comm_submitBtn"); //评论提交按钮
        	
        	$(".js_replyF_info").find(".js_comment_editor").html("");  //删除所有评论编辑器
        	
        	//添加编辑器
        	$this.parents(".js_replyF_info").find(".js_comment_editor").append(editorScriptHtml);
        	var cm = UM.getEditor('commentEditor',{ 
                initialFrameHeight:58,
                initialFrameWidth:"100%",
                autoHeightEnabled:false				
            });
        	
        	//编辑器操作相关函数
        	_this.commentConFn(cm,commCountWrap,commErrorTipWrap);  //编辑器添加事件
        	_this.submitCommentFn(cm,commSubmitBtn,commErrorTipWrap,commCountWrap);  //提交评论按钮
        	
        	$this.parents(".js_replyF_info").find(".js_comment_editor_wrap").show(); //展示评论编辑器
        	
        	//当前编辑器回复默认
        	$this.parents(".js_replyF_info").find(".js_comment_editor_error").hide();//默认隐藏错误提示
        	$this.parents(".js_replyF_info").find(".js_comment_editor_count").text(0);  //当前编辑器字数默认设置0
        	commSubmitBtn.attr({  //评论提交按钮回复默认
        		"data-commentid":"",
        		"data-tonickname":""
    		});
        	
        	$this.parents(".js_replyF_info").find(".js_comment_talk_btn").removeClass("cur"); //当前评论列表说一说置为不可点击
        	
        	//其他回帖,评论为0：恢复默认收起状态；评论大于0：保持展开状态,编辑器消失
        	$this.parents(".js_replyF_info").siblings().find(".js_comments_module").each(function(){
        		var replyNum = $(this).find(".js_comment_num_btn").attr("data-num");
        		if(parseInt(replyNum)<=0){  //其他回帖评论数为0，评论区收起；否则保持原状态不变
        			$(this).slideUp(100);
        		}else{
        			$(this).find(".js_comment_editor_wrap").hide();
        			$(this).find(".js_comment_talk_btn").addClass("cur");
        		}
        	});
        	//其他回帖，评论为0：收起回复切换为回复；评论不为0：保持收起回复不变
        	$this.parents(".js_replyF_info").siblings().find(".js_comments_btn").each(function(){
        		var replyNum = $(this).attr("data-num"); //每楼评论数
        		if(parseInt(replyNum)<=0){  //其他回帖数评论为0，收起回复变为回复(没有回复数)；否则保持原状态不变
                	$(this).text("回复");
                	$(this).parent().removeClass("on"); //去他回帖说一说按钮可点击
        		}
        	});
        },
        getReplyCommentListFn:function(postId,listWrap,pageWrap,btnObj,pageIndex){
        	var _this = this;
        	listWrap.ajaxPage({
                url: getCommentListUrl,
                type: "get",
                dataType: "json",
                pageData: "data.count",
                pageSize:5,
                paramObj: {
                    threadId: $(document).getLinkParamFn("id"),
                    postId:postId
                },
                pageIndex:pageIndex,  //当前页
                pageObj: pageWrap,
                pageBtn:{
                	first: "首页",
                    last: "末页",
                	prev: "上一页",
                    next: "下一页"
                },
                clickFn: function (setting) {
                    
                    var id = $(document).getLinkParamFn("id");
                    setting.paramObj.threadId = id;
                    setting.paramObj.postId = postId;
                },
                dataFn: function (data) {
                    var dataHtml = "";
                    var dCont = data.data;
                    $(document).saveBackupDataFn("reattachmentComment",dCont);
                    if(data.count!==0){
                    	var count=data.count
                    	btnObj.attr("data-num",count);   //回复数量更新
                    	dataHtml += _this.joinHTMLFn(dCont);
                    }
                    
                    return dataHtml;
                },
                //操作数据之前，处理错误页跳转
                beforeDoDataFn:$(document).errorDataOperateFn
            });
        },
        //加载回帖列表每个回帖评论列表
        loadForumCommentListFn:function(){
        	var _this = this;
        	$(".js_comment_list").each(function(){
        		var $this = $(this);
        		var commentNum = $this.parents(".js_replyF_info").find(".js_comments_btn").attr("data-num"); //当前回帖评论数
        		//如果当前回帖评论数为0，不再请求评论列表接口
        		if(parseInt(commentNum)>0){
        			_this.loadForumCommentListAjaxFn($this);
        		}

        	});
        },
        //加载评论列表Ajax函数
        loadForumCommentListAjaxFn:function(commListWrap){
        	var _this = this;
        	$.ajax({
    			url:getCommentListUrl,
    			type:"get",
    			dataType:"json",
    			async:false,
    			data:{
    				r:Math.random(),
    				threadId: $(document).getLinkParamFn("id"),
                    postId:commListWrap.attr("data-index"), //属性data-index为回帖id
                    pageIndex: 1,
                    pageSize:2
    			},
    			success:function(data){
    				var dCont = data.data;
    				$(document).saveBackupDataFn("reattachmentComment",dCont);
    				var commentStr = _this.joinHTMLFn(dCont); 
    				commListWrap.html(commentStr); //初始加载页面渲染评论列表
    				if(parseInt(data.count)>2){ //回帖评论条数大于两条，评论条数按钮可点击
    					commListWrap.parents(".js_comments_module").find(".js_comment_num_btn").addClass("cur");
    				}else{ //回帖评论条数小于等于两条时，评论条数按钮不可点击
    					commListWrap.parents(".js_comments_module").find(".js_comment_num_btn").removeClass("cur");
    				}
    				commListWrap.parents(".js_comments_module").find(".js_comment_num_btn").show().html("共"+data.count+"条回复");
    				//帖子评论数量按钮(事件)
    				_this.forumCommentNumBtnFn();
    				//帖子评论说一说按钮(事件)
    				_this.talkEnterBtnFn();
    			}
    		});
        },
        //帖子评论数量按钮
        forumCommentNumBtnFn:function(){
        	var _this = this;
        	//点击评论数量按钮加载评论列表
        	$(".js_replyList").off("click",".js_comment_num_btn").on("click",".js_comment_num_btn",function(){
        		var $this = $(this);
        		if($this.hasClass("cur")){
        			var postId = $this.attr("data_replyid");  //回帖id
                	var commListWrap = $this.parents(".js_replyF_info").find(".js_comment_list"); //回帖评论列表容器
                	var commListPageWrap = $this.parents(".js_replyF_info").find(".js_commont_page"); //回帖评论分页容器
                	$this.hide();  //帖子评论数消失
            		_this.getReplyCommentListFn(postId,commListWrap,commListPageWrap,$this,1);  //获取帖子列表ajax 实参为回帖id
        		}
            	

        	});
        },
        //说一说按钮
        talkEnterBtnFn:function(){
    		var _this = this;
        	//点击评论说一说按钮
        	$(".js_replyList").off("click",".js_comment_talk_btn").on("click",".js_comment_talk_btn",function(){
        		var $this = $(this);
        		
        		UM.clearCache("commentEditor");  //清除下评论编辑器缓存，否则第二次通过删除已有编辑器标签再次渲染时无效。
        		
        		if($this.hasClass("cur")){ //如果当前按钮可点击
        			
        			_this.showEditorOperateFn($this);
        		}
        		
        	});
        },
        joinHTMLFn:function(dCont){
        	var dataHtml = "";
        	for (var i = 0; i < dCont.length; i++) {
            	if(dCont[i].isShow){  //帖子文字过滤已通过
            		var headPic=$(document).filterDevKeywordFn(dCont[i].headPic)
            		var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
            		
            		var commentContent = dCont[i].content;
                	commentContent = $(document).filterDevKeywordFn(commentContent);  //过滤脚本关键字
                	commentContent = $(document).deleteLabelFn("div",commentContent); //过滤div 避免影响帖子展示页
                	var nikeName=$(document).filterDevKeywordFn(dCont[i].nikeName);//过滤返回值
                	var nikeNameLink=$(document).filterDevKeywordFn(dCont[i].nikeNameLink);
                	var toNikeName=$(document).filterDevKeywordFn(dCont[i].toNikeName);
                	var toNikeNameLink=$(document).filterDevKeywordFn(dCont[i].toNikeNameLink);
                	var dateString=dCont[i].dateString;
                	
            		var names = !global_main.globalFn.nicknameCompleCode(nikeName)?"呀！跑路啦！":global_main.globalFn.nicknameCompleCode(nikeName); //昵称
            		var hrefs = !global_main.globalFn.nicknameCompleCode(nikeName)?"javascript:void(0);":nikeNameLink+'?id='+dCont[i].id;//链接
            		var js_userClass = !global_main.globalFn.nicknameCompleCode(nikeName)?"nikeDefaultF":"js_checkEveryUserInfo";
            		var namesTo = !global_main.globalFn.nicknameCompleCode(toNikeName)?"呀！跑路啦！":global_main.globalFn.nicknameCompleCode(toNikeName); //回复对象昵称
            		var hrefsTo = !global_main.globalFn.nicknameCompleCode(toNikeName)?"javascript:void(0);":toNikeNameLink+'?id='+dCont[i].toId;//回复对象链接
            		var js_userClassTo = !global_main.globalFn.nicknameCompleCode(toNikeName)?"nikeDefaultF":"js_checkEveryUserInfo"; //回复对象class
            		dataHtml += ''+
                		'<li class="commentListLi">'+
	                		'<div class="commentListWrap">'+
                            '<a href="'+hrefs+'" target="_blank" class="imgLink"><img src="'+pics+'" class="nike_img '+js_userClass+'" data-userinfoid="'+dCont[i].id+'" ></a>'+
                            '<div class="comment_con">'+
                                '<div class="con">'+
                                	'<a href="'+hrefs+'" target="_blank" class="'+js_userClass+'" data-userinfoid="'+dCont[i].id+'" >'+names+'</a>';
                                	if(dCont[i].toNikeName!==null){
                                		dataHtml +='<span>回复</span><a href="'+hrefsTo+'" target="_blank"  class="'+js_userClassTo+'" data-userinfoid="'+dCont[i].toId+'">'+namesTo+'</a>';
	                                	}	
	                                	dataHtml +='：'+commentContent+
	                            	'</div>'+
	                            '</div>'+
	                         '</div>'+  
                            '<div class="botton_tools">'+
                            '<div class="l">';
	                            dataHtml+='<span>'+dateString+'</span>';
	                        dataHtml+='</div>'+
                            '<div class="r">';
				        		
								if(dCont[i].isTalkButton){
									dataHtml+='<a class="dialog hide">查看对话</a><span class="cutOff hide">|</span>';
								}
								dataHtml+='<a class="jb hide">举报</a><span class="cutOff hide">|</span>';
								if(dCont[i].isDeleteButton){
								  	dataHtml+='<a class="delete js_delete_comment" data-status="true" data_replyid="'+dCont[i].postId+'" data_commentid="'+dCont[i].commentId+'">删除</a><span class="cutOff">|</span>';
								}
								if(dCont[i].isReplyButton){
									dataHtml+='<a class="replay js_reply_comment" data-status="true" data_replyid="'+dCont[i].postId+'" data_commentid="'+dCont[i].commentId+'" data-backup="reattachmentComment">回复</a><span class="cutOff">|</span>';
								}
								if(dCont[i].isLike){
				          			dataHtml+='<a class="js_zan_comments zan on" data_replyid="'+dCont[i].postId+'" data_commentid="'+dCont[i].commentId+'">'+dCont[i].likeNum+'</a><span class="cutOff">|</span>';
				          		}else{
				          			dataHtml+='<a class="js_zan_comments zan" data_replyid="'+dCont[i].postId+'" data_commentid="'+dCont[i].commentId+'">'+dCont[i].likeNum+'</a><span class="cutOff">|</span>';
				          		}
				          		
				          		if(dCont[i].isDown){
				          			dataHtml+='<a class="js_cai_comments cai on" data_replyid="'+dCont[i].postId+'" data_commentid="'+dCont[i].commentId+'">'+dCont[i].downNum+'</a>';
				          		}else{
				          			dataHtml+='<a class="js_cai_comments cai" data_replyid="'+dCont[i].postId+'" data_commentid="'+dCont[i].commentId+'">'+dCont[i].downNum+'</a>';
				          		}         
				     
					  dataHtml+='</div>'+
                        '</div>'+
                        '</li>';
                    
            	}
                
            }
        	return dataHtml;
        },
        commentConFn:function(me,obj,err){
        	var _this = this;
            me.addListener('contentChange', function(){  //编辑器添加内容改变事件
            	_this.setTxtNumFn(me,obj,err);
                
                _this.clearEditorFn(me,obj,err);
            });
            me.addListener('keyup', function(){  //编辑器添加键盘事件
            	_this.setTxtNumFn(me,obj,err);
                
                _this.clearEditorFn(me,obj,err);
            });
            me.$body.on('focus', function(){  //编辑器添加keyup事件
            	_this.clearEditorFn(me,obj,err);
            });
            //有回复对象时空删除，将回复对象删除
            $(".js_replyList").off("keydown","#commentEditor").on("keydown","#commentEditor",function(e){  //编辑器添加键盘事件
            	var len = me.getContentLength(true);
            	if(len==0&&e.keyCode==8){  //backspace当内容为空时删除回复对象
            		$(".js_replyToNickname").remove();
            	}
            	
            });
        },
        //编辑器中默认文字清空
        clearEditorFn:function(me,obj,err){
        	var _this = this;
        	var exp = new RegExp(/^\s{3,}$/);
        	var expImg = new RegExp(/<img|<IMG/);
        	var con = me.getContentTxt();
        	var conHtml = me.getContent();
            if(con=="如您输入括号或尖括号可能造成内容显示不完整"||exp.test(con)&&!expImg.test(conHtml)){
            	me.setContent("");
            	me.focus();
            	_this.setTxtNumFn(me,obj,err);
            }
        },
        //编辑器计数
        setTxtNumFn:function(me,obj,err){
        	var len = me.getContentLength(true);
        	obj.text(len); //文字计数
        	if(len<=100){
        		err.hide();
        	}
        },
        //帖子评论提交
        submitCommentFn:function(me,btn,err){
        	var _this = this;
        	
        	//清除拦截频繁发评论定时器
        	_this.clearCommentLimitTimerFn(btn);
        	
        	btn.off("click").on("click",function(){
        		var $this = $(this);
        		
    			if(_this.checkFormFn(me,err)&&$this.attr("data-status")=="true"){
    				var expBr = new RegExp("<p>(<br/>|<br>|(&nbsp;\\s*){0,})</p>{1,}","g");  //去掉空行
    				var expLastEscape = new RegExp("(&nbsp;\\s*){0,}</p>$","g");  //去掉最末尾空格
    				var expChangeP = new RegExp("</p><p>","g");  //P标签之间添加1个空格
    				var expImg = new RegExp('(\[IMG|\[img)(?![^>]+class="wd_emoji")[^>]+(>|\/\])','g'); //非表情图片，过滤粘贴图片
    				
    				var contents = $(document).filterDevKeywordFn(me.getContentUbb());
    				contents = contents.replace(expImg,"");
    				contents = contents.replace(expBr,"");
    				contents = contents.replace(expChangeP,"\[/p\]&nbsp;\[p\]");
    				contents = contents.replace(expLastEscape,"\[/p\]");
    				
    				var datas = {
	        						threadId:$(document).getLinkParamFn("id"),
	            					postId:$this.attr("data_replyid"),
	            					content:contents,
	            					r:Math.random()
        					    };
    				if($(".js_replyToNickname").length>0){
    					$.extend(datas,{commentId:$this.attr("data-commentid")});
    				}
    				$.ajax({
        				url:postCommentUrl,
        				type:"post",
        				dataType:"json",
        				data:datas,
    					beforeSend:function(){
    						$this.setBtnStatusFn("false","");
    					},
        				success:function(d){
        					if(d.status=="success"){
        						$this.setBtnStatusFn("true","");
        						var listWrap = $this.parents(".js_replyF_info").find(".js_comment_list"); //当前评论列表容器
        						var commentCount = $this.parents(".js_replyF_info").find(".js_comment_editor_count");
        					
        						
        						//回复按钮，评论按钮操作评论数
    							_this.forumCommentNumOperFn($this,"add");
        						
        						//首次添加评论，显示说一说按钮且不可点击
        						var talkBtnAndPageBtnWrap = $this.parents(".js_replyF_info").find(".js_comment_page_wrap"); //评论按钮分页按钮容器
        						var pageBtn = talkBtnAndPageBtnWrap.find(".js_commont_page"); //分页按钮
        						var talkNumBtn = talkBtnAndPageBtnWrap.find(".js_comment_num_btn"); //评论数按钮
        						var talkHideBtn = talkBtnAndPageBtnWrap.find(".js_comment_talk_btn:hidden"); //隐藏状态说一说按钮
        						if(talkHideBtn.length>0){
        							talkBtnAndPageBtnWrap.show(); //分页、评论按钮容器
            						pageBtn.hide(); //分页消失
            						talkNumBtn.hide(); //评论数按钮消失
            						talkHideBtn.show(); //说一说按钮展示
        						}
        						
        						
        						//清空当前回复编辑器相关内容
        						me.setContent("<p>如您输入括号或尖括号可能造成内容显示不完整</p>");
        						commentCount.html("0");
        						//清除回复对象
        						$(".js_replyToNickname").remove();  
        						
        						$(document).popErrorF({
            						type:"open",
            						tip:"提交成功",
            						closeFn:function(){
            							var pageId = $("#hd_curpage_"+$this.attr("data_replyid"));	
            			        		var pageArr = pageId.length===0 ? "no|no" : pageId.val();  //没有数据时给"no|no"
            			        		pageArr = pageArr.split("|");
            							if(pageArr[0]===pageArr[1]&&d.data.isShow){  //帖子文字过滤已通过
            								_this.addCommentDataFn(d,listWrap);
            							}
            						}
            					});
        					}else if(d.status=="limitCountDown"){  //拦截频繁发评论
    							//发评论频繁开始倒计时
        						commentSubmitTimeNum = parseInt(d.message);
        						//返回时间小于等于0不执行定时器
    							if(commentSubmitTimeNum<=0){
    								return false;
    							}
    							
    							commentSubmitTimer = setInterval(function(){
    								//倒计时开始后，按钮为不可操作状态
    								$this.attr("data-status","false").text(commentSubmitTimeNum+"s");
    								
    								commentSubmitTimeNum--;
    								
    								if(commentSubmitTimeNum==-1){
    									//清除拦截频繁发评论定时器
    									_this.clearCommentLimitTimerFn($this);
    									
    								}
    							},1000);
    							
    							
        					}else{
        						$this.setBtnStatusFn("true","");
								
        						$(document).errorDataOperateFn(d,$this,{
        							limitCountDownFn:null,
									hiddenCommentFn:function(){  //吞评论时需要更新评论数和评论展示条数
										//查找被回复评论的回复按钮
										var replyComnetId = $this.attr("data-commentid");
										var commentLiObj = $this.parents(".js_replyF_info").find(".js_reply_comment");
										var replyCommentBtnobj = null;  
										
										commentLiObj.each(function(){
											if($(this).attr("data_commentid")==replyComnetId){
												replyCommentBtnobj = $(this);
											}else{
												replyCommentBtnobj = $this;
											}
										});

										_this.forumCommentNumOperFn(replyCommentBtnobj,"minus");  //更新评论数
										//评论消失后评论区和评论数状态
										_this.forumCommentHideOperFn(replyCommentBtnobj);
									}
        						});
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true","");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}
        			
        	});
        },
        //帖子表单验证
        checkFormFn:function(me,err){
        	var len = me.getContentLength(true);  //编辑器内容长度
        	var con = me.getContentTxt();
        	var conHtml= me.getContent();
        	var expSpace = new RegExp(/^\s{1,}$/);
        	var expImgEmoji = new RegExp('(<IMG|<img){1,}','g');
        	var expImg = new RegExp('(<IMG|<img)(?![^>]+class="wd_emoji")[^>]+(>|\/>)','g'); //非表情图片，过滤粘贴图片
        	var expImgEmotion = new RegExp('(<IMG|<img)([^>]+class="wd_emoji")[^>]+(>|\/>)','g'); //表情图片
        	var expAllTag = new RegExp('<[^>]+>|(&nbsp;)*','g'); //所有标签
        	var ie11PaseStr = conHtml.replace(expAllTag,"");  //ie11粘贴文字
        	var state = true;
        	clearTimeout($(document).setTimeHideFn(err,2000)); //清除定时器
    		//编辑器内容验证
        	if(!expImgEmotion.test(conHtml)&&ie11PaseStr==""&&!expSpace.test(con)){
    			err.text("动动小手，敲敲字吧~").show();
    			$(document).setTimeHideFn(err,1000); //两秒消失
    			state = false;
    		}else if(len==0||con=="如您输入括号或尖括号可能造成内容显示不完整"||(expSpace.test(con)&&!expImgEmoji.test(conHtml))){
    			err.text("评论内容不能为空哦~").show();
    			$(document).setTimeHideFn(err,1000); //两秒消失
    			state = false;
    		}else if(len>100){
    			err.text("评论内容不能超过100字~").show();
    			$(document).setTimeHideFn(err,1000);//两秒消失
    			state = false;
    		}else if(expImg.test(conHtml)){
    			err.text("请不要输入非表情库图片").show();
    			$(document).setTimeHideFn(err,1000);//两秒消失
    			state = false;
    		}else{//正确
    			err.text("").hide();
    		}
    		
    		return state;
    		
    		
        },
        //追加评论内容
        addCommentDataFn:function(d,obj){
        	var dCont = d.data;
        	var commentContent = dCont.content;
        	commentContent = $(document).filterDevKeywordFn(commentContent);  //过滤脚本关键字
        	commentContent = $(document).deleteLabelFn("div",commentContent); //过滤div 避免影响帖子展示页
        	var dataHtml = "";
        	var headPic=$(document).filterDevKeywordFn(dCont.headPic)//头像返回值过滤
        	var pics = !headPic?"http://img.gyyxcdn.cn/dao/user/images/tc_tx.png":headPic; //头像
        	var nikeName=$(document).filterDevKeywordFn(dCont.nikeName);
        	var nikeNameLink=$(document).filterDevKeywordFn(dCont.nikeNameLink);
        	var toNikeName=$(document).filterDevKeywordFn(dCont.toNikeName);
        	var toNikeNameLink=$(document).filterDevKeywordFn(dCont.toNikeNameLink);
        	var dateString=dCont.dateString;
        	
        	
        	var names = !nikeName?"呀！跑路啦！":nikeName; //昵称
    		var hrefs = !nikeName?"javascript:void(0);":nikeNameLink+'?id='+dCont.id;
    		var js_userClass = !nikeName?"nikeDefaultF":"js_checkEveryUserInfo";
    		
    		var namesTo = !toNikeName?"呀！跑路啦！":toNikeName; //回复对象昵称
    		var hrefsTo = !toNikeName?"javascript:void(0);":toNikeNameLink+'?id='+dCont.toId;//回复对象链接
    		var js_userClassTo = !toNikeName?"nikeDefaultF":"js_checkEveryUserInfo";//回复对象class
    		
        		dataHtml += ''+
            		'<li class="commentListLi">'+
            			'<div class="commentListWrap">'+
	                        '<a href="'+hrefs+'" class="imgLink"><img src="'+pics+'" class="nike_img '+js_userClass+'" data-userinfoid="'+dCont.id+'" ></a>'+
	                        '<div class="comment_con">'+
	                            '<div class="con">'+
	                            	'<a href="'+hrefs+'" class="'+js_userClass+'" data-userinfoid="'+dCont.id+'" >'+names+'</a>';
	                            	if(dCont.toNikeName!==null){
	                            		dataHtml +='<span>回复</span><a href="'+hrefsTo+'" class="'+js_userClassTo+'" data-userinfoid="'+dCont.toId+'" >'+namesTo+'</a>';
	                            	}	
		                            	dataHtml +='：'+commentContent+
	                        	'</div>'+
	                       '</div>'+ 
                        '</div>'+
	                    '<div class="botton_tools">'+
	                        '<div class="l">';
		                      dataHtml+='<span>'+dateString+'</span>';
	    		  dataHtml+='</div>'+
	                        '<div class="r">';
								if(dCont.isTalkButton){
									dataHtml+='<a class="dialog hide">查看对话</a><span class="cutOff hide">|</span>';
								}
						        dataHtml+='<a class="jb hide">举报</a><span class="cutOff hide">|</span>';
								if(dCont.isDeleteButton){
								  	dataHtml+='<a class="delete js_delete_comment" data-status="true" data_replyid="'+dCont.postId+'" data_commentid="'+dCont.commentId+'">删除</a><span class="cutOff">|</span>';
								}
					 
								if(dCont.isReplyButton){
									dataHtml+='<a class="replay js_reply_comment" data-status="true" data_replyid="'+dCont.postId+'" data_commentid="'+dCont.commentId+'" data-userinfoid="'+dCont.id+'" data-backup="reattachmentComment">回复</a><span class="cutOff">|</span>';
								}
								if(dCont.isLike){
	                    			dataHtml+='<a class="js_zan_comments zan on"  data_replyid="'+dCont.postId+'" data_commentid="'+dCont.commentId+'">'+dCont.likeNum+'</a><span class="cutOff">|</span>';
	                    		}else{
	                    			dataHtml+='<a class="js_zan_comments zan"  data_replyid="'+dCont.postId+'" data_commentid="'+dCont.commentId+'">'+dCont.likeNum+'</a><span class="cutOff">|</span>';
	                    		}
	                    		if(dCont.isDown){
	                    			dataHtml+='<a class="js_cai_comments cai on"  data_replyid="'+dCont.postId+'" data_commentid="'+dCont.commentId+'">'+dCont.downNum+'</a>';
	                    		}else{
	                    			dataHtml+='<a class="js_cai_comments cai"  data_replyid="'+dCont.postId+'" data_commentid="'+dCont.commentId+'">'+dCont.downNum+'</a>';
	                    		}
	                        '</div>'+
	                    '</div>'+
                    '</li>';
					
                        
				  obj.append(dataHtml);	
        	
        },
        deleteCommentFn:function(){
        	var _this = this;
        	$(".js_replyList").off("click",".js_delete_comment").on("click",".js_delete_comment",function(){
        		var $this = $(this);
        		if($this.attr("data-status")=="true"){
    				$.ajax({
        				url:deleteCommentUrl,
        				type:"get",
        				dataType:"json",
        				data:{
        					r:Math.random(),
                			threadId:$(document).getLinkParamFn("id"),
                			postId:$this.attr("data_replyid"),
                			commentId:$this.attr("data_commentid")
        				},
    					beforeSend:function(){
    						$this.setBtnStatusFn("false","删除中");
    					},
        				success:function(d){
        					$this.setBtnStatusFn("true","删除");
        					if(d.status=="success"){
        						$(document).popDeleteF({
            						type:"open",
            						tip:"确认要删除吗？",
            						confirmFn:function(){
            							$(document).popDeleteF({type:"close"}); //关闭删除弹层
            							_this.deleteCommentSubmitFn($this);  							
            						}
            					});
        					}else{
        						$(document).errorDataOperateFn(d,$this);
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true","删除");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}

        	});
        	
        },
        //删除评论提交
        deleteCommentSubmitFn:function(obj){
        	var _this = this;
        	$.ajax({
				url:deleteCommentUrl,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
        			threadId:$(document).getLinkParamFn("id"),
        			postId:obj.attr("data_replyid"),
        			commentId:obj.attr("data_commentid")
				},
				success:function(d){
					if(d.status=="success"){
						$(document).popErrorF({
    						type:"open",
    						tip:"删除成功！",
    						closeFn:function(){
    							
    							//回复按钮，评论按钮操作评论数
    							_this.forumCommentNumOperFn(obj,"minus");
    							
    							//评论消失后评论区和评论数状态
    							_this.forumCommentHideOperFn(obj);
    							
    						}
    					});
					}else{
						$(document).errorDataOperateFn(d,obj);
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
			});
        },
        //评论消失后评论区和评论数状态
        forumCommentHideOperFn:function(obj){
        	var _this = this;
        	var replyBtn = obj.parents(".js_replyF_info").find(".js_comments_btn"); //回复按钮
			var commNumBtn = obj.parents(".js_replyF_info").find(".js_comment_num_btn"); //评论数按钮
			var commNumBtnHideStatus = obj.parents(".js_replyF_info").find(".js_comment_num_btn:hidden"); //评论数按钮隐藏状态
			var commListWrap = obj.parents(".js_replyF_info").find(".js_comment_list"); //回帖评论列表容器
			//删除最后一条评论时评论区展示处理
			var editorCur = obj.parents(".js_replyF_info").find("#commentEditor");
			if(commNumBtn.attr("data-num")==0){  //减去删除条数，评论数为0
				
				//删除后执行操作  删除该条评论      1:第1页 (包括从0添加n条);  2: 最后一页; 只删除dom不重新加载列表  3:回复数为2且按钮展示
				obj.parents("li").hide();
				
				if(editorCur.length<=0){ //无编辑器时,评论区恢复无评论不展开状态
					
					var commentWrap = obj.parents(".js_replyF_info").find(".js_comments_module"); //评论区
					commentWrap.hide();  //评论区隐藏
					replyBtn.text("回复").parent().removeClass("on"); //回复按钮取消选中状态
					
				}else{ //有编辑器时，删除最后一条，分页，评论数，说一说隐藏
					
					var pageBtnAndTalkBtnWrap = obj.parents(".js_replyF_info").find(".js_comment_page_wrap");
					pageBtnAndTalkBtnWrap.hide();
				}
				
			}else{ //减去删除条数，评论数大于0
				var commLiLen = commListWrap.find("li:visible").length;  //已展示的评论条数
				
				if(commNumBtnHideStatus.length>0){ //查看评论数，不展示状态
					
					var commListPageHideWrap = obj.parents(".js_replyF_info").find(".js_commont_page:visible"); //回帖评论分页容器
					
					
					if(commListPageHideWrap.length==0){  //分页隐藏
						//删除后执行操作  删除该条评论      1:第1页 (包括从0添加n条);  2: 最后一页; 只删除dom不重新加载列表  3:回复数为2且按钮展示
						obj.parents("li").hide();
						
					}else{   //分页展示
						_this.forumCommentPageFn(obj,commLiLen,commListWrap,replyBtn);
					}
					
				}else{ //查看评论数，展示状态
					if(commNumBtn.attr("data-num")<=1){  //此时评论列表展示为2条，因先减掉的评论数
                		//删除后执行操作  删除该条评论      1:第1页 (包括从0添加n条);  2: 最后一页; 只删除dom不重新加载列表  3:回复数为2且按钮展示
						obj.parents("li").hide();
					}else if(commNumBtn.attr("data-num")>1){  //此时评论列表展示大于2条，因先减掉的评论数
						/******
						 * 如果评论展示大于2条
						 * 删除后执行操作  删除该条评论      1:第1页 (包括从0添加n条);  2: 最后一页; 只删除dom不重新加载列表  3:回复数为2且按钮展示
						 * 否则评论展示小于2条
						 * ********/						
						commLiLen>=3?obj.parents("li").hide():_this.loadForumCommentListAjaxFn(commListWrap);
					}
					
				}
			}
        },
		//评论分页展示方法
		forumCommentPageFn:function(obj,commLiLen,commListWrap,replyBtn){
			var _this=this;
			var postId = obj.parents(".js_comment_list").attr("data-index");  //回帖id	
			var commListPageWrap = obj.parents(".js_replyF_info").find(".js_commont_page"); //回帖评论分页容器
			var pageId = obj.parents(".js_replyF_info").find(".js_comment_list").attr("data-index");
			var hidInput = $("#hd_curpage_"+pageId).val(); //帖子评论页列表分页隐藏域
			var pageArr = hidInput.split("|");
			var curPage =parseInt(pageArr[0]); //当前页
			var allPage =parseInt(pageArr[1]); //总页数
			var pageIndexs;
			
			if(curPage==allPage&&commLiLen==1){ //列表分多页，当前页 为末页，且只有一条展示评论  删除后请求上一页数据
				
				//删除后执行操作  删除该条评论      1:第1页 (包括从0添加n条);  2: 最后一页; 只删除dom不重新加载列表  3:回复数为2且按钮展示
				obj.parents("li").hide();
				
				pageIndexs = curPage -1;
				_this.getReplyCommentListFn(postId,commListWrap,commListPageWrap,replyBtn,pageIndexs);  //获取帖子列表ajax 实参为回帖id
			
			}else if(curPage==allPage&&commLiLen>1){  //列表分多页，当前页为末页，展示评论大于1
				
				//删除后执行操作  删除该条评论      1:第1页 (包括从0添加n条);  2: 最后一页; 只删除dom不重新加载列表  3:回复数为2且按钮展示
				obj.parents("li").hide();
				
			}else{  //列表分多页，处于中间页时，直接请求当前页数据
				pageIndexs = curPage;
				_this.getReplyCommentListFn(postId,commListWrap,commListPageWrap,replyBtn,pageIndexs);  //获取帖子列表ajax 实参为回帖id
			}
		},
        //操作回帖评论数（每个帖子回复按钮，评论数按钮；只有这两个地方有帖子评论数） status: add:+1 ; minus:-1
        forumCommentNumOperFn:function(obj,status){ 
        	
        	
        	//回复按钮，回复数减1
			var replyBtn = obj.parents(".js_replyF_info").find(".js_comments_btn");
			var replyNum = replyBtn.attr("data-num");
			
			//查看评论数按钮，回复数减1
			var commNumBtn = obj.parents(".js_replyF_info").find(".js_comment_num_btn");
			var commNum = commNumBtn.attr("data-num");
			
			if(status=="add"){ //回复数+1
        		replyNum = parseInt(replyNum)+1;
        		commNum = parseInt(commNum)+1;
        	}else{ //回复数-1
        		replyNum = parseInt(replyNum)-1;
        		commNum = parseInt(commNum)-1;
        	}
			
			replyBtn.attr("data-num",replyNum);
			
			commNumBtn.attr("data-num",commNum).text("共"+commNum+"条回复");
			
        },
        replyCommnetFn:function(){
        	var _this = this;
        	$(".js_replyList").off("click",".js_reply_comment").on("click",".js_reply_comment",function(){
        		var $this = $(this);
        		$.ajax({ //先检测用户、帖子状态
    				url:postCommentUrl,
    				type:"get",
    				dataType:"json",
    				data:{
    					threadId:$(document).getLinkParamFn("id"),
    					postId:$this.attr("data_replyid"),
    					commentId:$this.attr("data_commentid"),
    					r:Math.random()
    				},
					beforeSend:function(){ 
						$this.setBtnStatusFn("false","回复");
					},
    				success:function(d){
    					$this.setBtnStatusFn("true","回复");
    					if(d.status=="success"){
    						
    						//渲染编辑器
    						UM.clearCache("commentEditor");  //清除下评论编辑器缓存，否则第二次通过删除已有编辑器标签再次渲染时无效。
    						_this.showEditorOperateFn($this);
    						
    		        		var editorFrag = $("#commentEditor");  //编辑器容器
    		        		//jquery库处理<script>异常，需要将><替换
    		        		var strToNickNameVal = "";
    		        		var reatComment=$(document).data("reattachmentComment");
    		        		var commentid=$this.attr("data_commentid");
    		        		for(var i=0,l=reatComment.length;i<l;i++){
    		        			if(reatComment[i].commentId==commentid){
    		        				strToNickNameVal=reatComment[i].nikeName;
    		        			}
    		        		}
    		        		var strToNickName = '<p class="reply_to_nickname js_replyToNickname">回复'+strToNickNameVal+'：</p>';
    		        		$(".js_replyToNickname").remove();
    		        		editorFrag.before(strToNickName);  //添加回复标签
    		        		$(".js_comm_submitBtn").attr("data-commentid",$this.attr("data_commentid")); //评论提交按钮data_commentid赋值
    		        	
    					}else{
    						
    						$(document).errorDataOperateFn(d,$this,{
    							hiddenCommentFn:function(){  //吞评论时需要更新评论数和评论展示条数
    								_this.forumCommentNumOperFn($this,"minus");  //更新评论数
    								//评论消失后评论区和评论数状态
        							_this.forumCommentHideOperFn($this);
    							}
    						});
    					}
    				},
    				error:function(){
    					$this.setBtnStatusFn("true","回复");
    					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
    				}
    			});
	
        	});
        },
        //帖子（不区分主贴和回帖）踩 和 赞
        caiAndZanForumCommentFn:function(){
        	var _this = this;
        	//赞 按钮
        	$(document).on("click",".js_zan_comments",function(){
        		var $this = $(this);
        		_this.caiAndZanCommentAjaxFn($this,1);
        	});
        	//踩 按钮
        	$(document).on("click",".js_cai_comments",function(){
        		var $this = $(this);
        		_this.caiAndZanCommentAjaxFn($this,2);
        	});
        },
        //帖子（不区分主贴和回帖）踩 和 赞 ajax
        caiAndZanCommentAjaxFn:function(obj,type){ 
        	$.ajax({
        		url:postZanAndCaiForumCommentUrl,
				type:"post",
				dataType:"json",
				data:{
					r:Math.random(),
    				threadId:$(document).getLinkParamFn("id"), 	//主贴id
    				contentType:"comment", 	//类型
    				postId:obj.attr("data_replyid"), 	//回帖id
    				contentId :obj.attr("data_commentid"), 	//类型id 帖子id或者评论id
    				poke:type		//1支持,2:反对 
    				
				},
				success:function(d){
					if(d.status=="success"){
			        	//操作成功
						var num = parseInt(obj.text());
						if(obj.hasClass("on")){
							obj.removeClass("on").text(num-1);
						}else{
							var siblingStr = parseInt(type)==1?".js_cai_comments":".js_zan_comments";
							var siblingObj = obj.siblings(siblingStr);
							var nextNum = parseInt(siblingObj.text());
							var optNum = nextNum==0?0:nextNum-1;
							obj.addClass("on").text(num+1);
							if(siblingObj.hasClass("on")){
								siblingObj.removeClass("on").text(optNum);
							}
						}
						
					}else{
						$(document).errorDataOperateFn(d,obj);
					}
				},
				error:function(){
					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
				}
        	});
        },
        //清除拦截频繁发评论定时器
        clearCommentLimitTimerFn:function(btn){
        	clearInterval(commentSubmitTimer);
        	btn.setBtnStatusFn("true","");
        }
    };
    window.daoCommentReplyForum = function(){
        return new DaoCommentReplyForum();
    };
})();
$.extend({
	formErrFn:function(obj,str){
		$(obj).show().html(str);
	}
});