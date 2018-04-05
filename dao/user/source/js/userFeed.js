/*-------------------------------------------------------------------------
 * 作者：maoxiangmin
 * 创建时间： 2017/5
 * 版本号：v1.0
 * 作用域：用户中心-个人中心
 * 
 * 来源:
 *    global_main-->global.js
 *
 -------------------------------------------------------------------------*/

var userDynamic_main=(function(){
	/*
	 * 变量控制
	 * */

    function userDynamicWeb(){
       var _this=this;

        /*
         * 接口定义
         *
         */
        this.userDynamicPort={
            //修改用户身份信息
            updateUserTitle:"/user/profile/updateTitle",
            
            //回复评论，回复回贴
            commentInfo:"/forum/comment/info",
            
            //回复主贴，给回帖点赞
            postInfo:"/forum/post/info",
           
        },

        /*
         * 当前页事件交互
         *
         */
         this.userDynamicEventF={
            //修改用户身份信息
            updateUserTitle:function(titId){
                $.ajax({
                    url: _this.userDynamicPort.updateUserTitle,
                    type: "POST",
                    dataType: "JSON",
                    data: {
                        r: Math.random(),
                        oldTitleId:parseInt($(".rankInfo .currentSF").attr("sfid")),
                        newTitleId:titId
                    },
                    success:function(d){
                        if(d.status=="success"){
                        	//获取登录用户身份信息
                            window.location.reload();
                        }else if(d.status=="failed"){
                            $(".js_alertMsg").html("身份更改失败");
                            global_main.globalFn.tcCenter($(".alertMSG"));
                        }else{
                        	 //未登录异常处理
                            $(document).loginError(d);
                        }
                    },
                    complete:function(){
                        $(".shenfes").attr("keepRepeat",true);
                    }
                })
            }
		   
        }
    }
    
    return new userDynamicWeb;
})();

$(function(){	
    
    //用户中心广告图
	global_main.globalFn.recommendpicListAjax('usercenter');
    //我的礼物--更多
    $(".moreGift").click(function(){
    	 if(!nickNameRepeat){
    		 login_main.settingNickPop();
             return false;
         }
    	 global_main.globalFn.tcCenter($(".gifsPop"));
    });
   
});
