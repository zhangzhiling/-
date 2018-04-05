/*
 * add by tht 2017-9-12
 * for forum info operate function 
 * notes: delete editor zan cai
 */
(function(){
	var getEditedForumStatusUrl = "/forum/thread/edit"; //获取编辑主贴状态
    function DaoForumInfoOperate(){
        //constructure
    }
    DaoForumInfoOperate.prototype = {
        init:function(forumEditorObj){
        	var _this = this;
            _this.forumEditFn(forumEditorObj);
        },
        //获取即将编辑主贴状态
        forumEditFn:function(forumEditorObj){
        	$(".js_replyList").off("click",".js_edit_forum").on("click",".js_edit_forum",function(){
        		var $this = $(this);
    			if($this.attr("data-status")=="true"){
    				$.ajax({
        				url:getEditedForumStatusUrl,
        				type:"get",
        				dataType:"json",
        				data:{
        					r:Math.random(),
        					threadId:$(document).getLinkParamFn("id")
        				},
    					beforeSend:function(){
    						$this.setBtnStatusFn("false","");
    					},
        				success:function(d){
        					$this.setBtnStatusFn("true","");
        					if(d.status=="success"){
        						//打开主贴层
        						if(d.data!==null){
        							var titles = d.data.title;
        							$("#newTopicTitle").val(titles); //标题
        							forumEditorObj.setContent(d.data.content); //内容
        							var con = forumEditorObj.getContentTxt();
        							if(con=="正文"||con==" "){
        								$(".js_editor_count").html("0");  //字体个数清零
        							}else{
        								var len = forumEditorObj.getContentLength(true);
        								$(".js_editor_count").html(len);  //字体个数清零
        							}

        							var tags = d.data.tags.length>0?d.data.tags.join(" "):"";  //没有标签时空数组
        							$(".js_oaSearchResult").val(tags);  //存默认标签
        							
        						}else{
        							
        							$("#newTopicTitle").val(""); //标题
        							forumEditorObj.setContent("<p>正文</p>"); //内容
        							$(".js_editor_count").html("0");  //字体个数清零
        							$(".js_tag_selected").html("");  //已选择标签
        							$(".js_oaSearchResult").val("");  //存默认标签
        						}
        						$("#OaSearchStaff").OaSearch();  //标签
        						$("#forumPost").popPostF("open");
        					}else{
        						$(document).errorDataOperateFn(d);	
        					}
        				},
        				error:function(){
        					$this.setBtnStatusFn("true","");
        					$(document).popErrorF({type:"open",tip:"程序小哥打盹儿了，刷新页面试试！"});
        				}
        			});
    			}
        			
        	});
        }
    };
    window.daoForumInfoOperate = function(){
        return new DaoForumInfoOperate();
    };
})();