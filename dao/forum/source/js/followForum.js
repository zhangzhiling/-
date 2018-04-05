/*
 * add by tht 2017-8-9
 * for forum forumInfo function dongchunshui
 */
(function(){
	
    function DaoNoticeForum(){
		//
    }
    DaoNoticeForum.prototype = {
    		init:function(){
    			var _this=this;
    			_this.onleyLookFn();
    		},
    		//只看他按钮事件
    		onleyLookFn:function(){
    			$(document).on("click",".js_onlyLook",function(){
    				$(document).popErrorF({type:"open",tip:"敬请期待！"});
    			})
    		}
    };
    window.DaoNoticeForum = function(){
        return new DaoNoticeForum();
    };
})();
