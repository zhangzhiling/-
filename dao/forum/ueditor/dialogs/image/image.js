(function () {

    var utils = UM.utils,
        browser = UM.browser,
        Base = {
                checkURL: function (url) {
                	var me=this;
                    if(!url){
                    	me.getUrlVal();
                    	return false;
                    }
                    url = utils.trim(url);
                    if (url.length <= 0) {
                    	me.getUrlVal();
                        return false;
                    }
                    if (url.search(/http:\/\/|https:\/\//) !== 0) {
                    	me.getUrlVal();
                        url += 'http://';
                        return false;
                    }

                    url=url.replace(/\?[\s\S]*$/,"");

                    if (!/(.gif|.jpg|.jpeg|.png|.bmp)$/i.test(url)) {
                    	me.getUrlVal();
                        return false;
                    }
                    return url;
                },
        getUrlVal:function(){
        	$(".urlErrorTxt").show();
        },
        getAllPic: function (sel, $w) {
            var arr = [],
                $imgs = $(sel, $w);

            $.each($imgs, function (index, node) {

                return arr.push({
                    _src: node.src,
                    src: node.src
                });
            });

            return arr;
        },
        scale: function (img, max, oWidth, oHeight) {
        	var oWidths=parseInt(oWidth),
        		oHeights=parseInt(oHeight);
            var width, height, percent,  widthS = img.width, heightS = img.height;
            if (oWidths > max || oHeights > max) {
                if (oWidths >= oHeights) {
                    if (parseInt(width = oWidths - max)) {
                        percent = (width / oWidths).toFixed(2); //四舍五入保留两位小数
                        img.height = oHeights - oHeights * percent;
                        img.width = max;
                    }
                } else {
                    if (height = oHeights - max) {
                        percent = (height / oHeights).toFixed(2);
                        img.width = oWidths - oWidths * percent;
                        img.height = max;
                    }
                }
            }else{
            	img.width = oWidth;
                img.height = oHeight;
            }
            img.widthS = widthS;
            img.heightS = heightS;
            return this;
        },
        close: function ($img) {
        	var marginTop=($img.parent().height() - $img.height()) / 2;
        	var marginLeft=($img.parent().width()-$img.width())/2;
        	
        		$img.css({
                    top: marginTop,
                    left: marginLeft
                	
                }).prev().on("click",function () {
                    if ( $(this).parent().remove().hasClass("edui-image-upload-item") ) {
                        //显示图片计数-1
                        Upload.showCount--;
                        Upload.updateView();
                    }

                });

            return this;
        },
        createImgBase64: function (img, file, $w) {
            if (browser.webkit) {
                //Chrome8+
                img.src = window.webkitURL.createObjectURL(file);
            } else if (browser.gecko) {
                //FF4+
                img.src = window.URL.createObjectURL(file);
            } else {
                //实例化file reader对象
                var reader = new FileReader();
                reader.onload = function () {
                    img.src = this.result;
                    $w.append(img);
                };
                reader.readAsDataURL(file);
            }
        },
       
        callback: function (editor, $w, url, state,message,imgWidth,imgHeight) {
        	if (state == "SUCCESS"||state == "success") {
                //显示图片计数+1
                Upload.showCount++;
                var $img = $("<img src='" + url.replace('costj','pictj') + "' class='edui-image-pic'/>"),
                $item = $("<div class='edui-image-item edui-image-upload-item'><div class='edui-image-close'></div></div>").append($img);
               
                if ($(".edui-image-upload2", $w).length < 1) {
                    $(".edui-image-content", $w).append($item);

                    Upload.render(".edui-image-content", 2)
                    .config(".edui-image-upload2");
                } else {
                    $(".edui-image-upload2", $w).before($item).show();
                }
                
                $img.on("load", function () {
                       Base.scale(this, 120,imgWidth,imgHeight);
                       Base.close($(this));
                       $(".edui-image-content", $w).focus();
                });
                
            } else {

            	if(state == "incorrect-login" || message == "incorrect-login"){
            		$(document).popErrorF({
						type:"open",
						tip:"哎哟，登录超时啦，重新登录下吧！",
						closeFn:function(){
							$("#forumPost").popPostF("close");
							$(document).reLoginFn();
						}
					});
					
				}else if(state == "failed"  || message == "failed"){
					currentDialog.showTip("图片不能超过10M");
                    window.setTimeout( function () {
                        currentDialog.hideTip();
                    }, 3000 );
				}else{
            		currentDialog.showTip( state );
                    window.setTimeout( function () {

                        currentDialog.hideTip();

                    }, 3000 );
            	}
                
            }

            Upload.toggleMask();

        }
    };

    /*
     * 本地上传
     * */
    var Upload = {
        showCount: 0,
        uploadTpl: '<div class="edui-image-upload%%">' +
            '<span class="edui-image-icon"></span>' +
            '<form class="edui-image-form" method="post" enctype="multipart/form-data" target="up">' +
            '<input style=\"filter: alpha(opacity=0); \" class="edui-image-file" type="file" readonlyunselectable="on" hidefocus name="upfile" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp"/>' +
            '</form>' +
            
            '</div>',
        init: function (editor, $w) {
            var me = this;

            me.editor = editor;
            me.dialog = $w;
            me.render(".edui-image-local", 1);
            me.config(".edui-image-upload1");
            me.submit();


            $(".edui-image-upload1").hover(function () {
                $(".edui-image-icon", this).toggleClass("hover");
            });

            return me;
        },
        render: function (sel, t) {
            var me = this;

            $(sel, me.dialog).append($(me.uploadTpl.replace(/%%/g, t)));

            return me;
        },
        config: function (sel,url) {
            var me = this;
                url=me.editor.options.imageUrl;
            	//初始form提交地址
            	url=url + (url.indexOf("?") == -1 ? "?" : "&") + "action=uploadimage&encode=utf-8&r="+Math.random();

            $("form", $(sel, me.dialog)).attr("action", url);

            return me;
        },
        uploadComplete: function(r,data){
            var me = this;
            try{
                var json =typeof r=='string'?eval('('+r+')'):r;
                json.url?Base.callback(me.editor, me.dialog, json.url, json.status,json.message,json.width,json.height):Base.callback(me.editor, me.dialog, json.data.source_url, json.message,json.message,data.width,data.height);
            }catch (e){
                var lang = me.editor.getLang('image');
                Base.callback(me.editor, me.dialog, '', (lang && lang.uploadError) || 'Error!',"failed");
            }
        },
        submit: function (callback) {
            var me = this,
                input = $( '<input style="filter: alpha(opacity=0); display:block;width:120px;height:120px;" readonlyunselectable="on" class="edui-image-file" type="file" hidefocus="" name="upfile" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp">');
                input = input[0];

            $(me.dialog).delegate( ".edui-image-file", "change", function (  ) { 
            	
            	var fileVal=this.value;
            	if (!/(.gif|.jpg|.jpeg|.png|.bmp)$/i.test(fileVal)) {
            		currentDialog.showTip("嘿，上传的图片格式不支持的哟");
                    window.setTimeout( function () {

                        currentDialog.hideTip();

                    }, 3000 );
                    return;
                }
                if ( !this.parentNode ) {
                    return;
                }
                if(window.File && window.FileReader && window.FileList && window.Blob) {  
                	var fileStream=this.files[0];//file的二进制流
                	if(fileStream.size>10485760){
                		currentDialog.showTip("上传图片不能大于10M哟");
                        window.setTimeout( function () {
                            currentDialog.hideTip();
                        }, 3000 );
                        return;
                	}
                	var tenCentAjaxFn = function(cloudData,tencentUrl){
                    	//模拟数据
                        var fd = new FormData();

                        fd.append('op', 'upload'); //必传
                        
                        var blob = new Blob([fileStream], { type: "application/octet-stream"});

                        fd.append("filecontent", blob);
                    	
                        //ajax
                        var xhr = new XMLHttpRequest();
                        
                        xhr.open("post", tencentUrl+cloudData.path, true);

                        //sign
                        xhr.setRequestHeader("Authorization",cloudData.sign);
                        
                        xhr.addEventListener('load', function (e) {
                            try {
                                var json = eval('('+e.target.response+')');
                                var url=json.data.source_url,
                                    getUrlWidthHeight=url.replace('costj','pictj')+'?imageInfo';
                                
                                $.ajax({
                             		url:getUrlWidthHeight,
                             		type:"get",
                             		dataType:"json",
                             		data:{
                             			r:Math.random()
                             		},
                             		success:function(data){
                             			me.uploadComplete(json,data)
                             		}
                             	});
                            } catch (er) {
                            	//error
                            }
                        });
                        xhr.send(fd);
                	};
                	//获取签名后上传腾讯云服务器
                	$(document).getTencentSignFn(tenCentAjaxFn);
                } else {  
                $('<iframe name="up"  style="display: none"></iframe>').insertBefore(me.dialog).on('load', function(){

                    var body = (this.contentDocument || this.contentWindow.document).body,
                    r = body.innerText || body.textContent || '';
                    me.uploadComplete(r);
                    $(this).unbind('load');
                    $(this).remove();

                });

                $(this).parent()[0].submit();
                }                
                Upload.updateInput( input );
                me.toggleMask("Loading....");
                callback && callback();
                

            });

            return me;
        },
        //更新input
        updateInput: function ( inputField ) {

            $( ".edui-image-file", this.dialog ).each( function ( index, ele ) {

                ele.parentNode.replaceChild( inputField.cloneNode( true ), ele );

            } );

        },
       
        //更新上传框
        updateView: function () {

            if ( Upload.showCount !== 0 ) {
                return;
            }

            $(".edui-image-upload2", this.dialog).hide();
            $(".edui-image-upload1", this.dialog).show();

        },
        drag: function () {
            var me = this;
            //做拽上传的支持
            if (!UM.browser.ie9below) {
                me.dialog.find('.edui-image-content').on('drop',function (e) {

                    //获取文件列表
                    var fileList = e.originalEvent.dataTransfer.files;
                    var img = document.createElement('img');
                    var hasImg = false;
                    $.each(fileList, function (i, f) {
                        if (/^image/.test(f.type)) {
                            //创建图片的base64
                            Base.createImgBase64(img, f, me.dialog);
                            var url=me.editor.options.imageUrl;
                            url=url + (url.indexOf("?") == -1 ? "?" : "&") + "action=uploadimage&encode=utf-8&type=ajax&r="+Math.random();
                            var xhr = new XMLHttpRequest();
                            xhr.open("post", url, true);
                            xhr.setRequestHeader({"X-Requested-With":"XMLHttpRequest","Content-Type":"application/x-www-form-urlencoded"});
                            //模拟数据
                            var fd = new FormData();
                            fd.append(me.editor.getOpt('imageFieldName'), f);

                            xhr.send(fd);
                            xhr.addEventListener('load', function (e) {
                                var r = e.target.response;
                                me.uploadComplete(r);
                                if (i == fileList.length - 1) {
                                    $(img).remove()
                                }
                            });
                            hasImg = true;
                        }
                    });
                    if (hasImg) {
                        e.preventDefault();
                        me.toggleMask("Loading....");
                    }

                }).on('dragover', function (e) {
                        e.preventDefault();
                    });
            }
        },
        toggleMask: function (html) {
            var me = this;

            var $mask = $(".edui-image-mask", me.dialog);
            if (html) {
                $(".edui-image-upload1", me.dialog).css( "display", "none" );
                $mask.addClass("edui-active").html(html);
            } else {

                $mask.removeClass("edui-active").html();

                if ( Upload.showCount > 0 ) {
                    return me;
                }

                $(".edui-image-upload1", me.dialog).css( "display", "block" );
            }

            return me;
        }
    };

    /*
     * 网络图片
     * */
    var NetWork = {
        init: function (editor, $w) {
            var me = this;

            me.editor = editor;
            me.dialog = $w;

            me.initEvt();
        },
        initEvt: function () {
            var me = this,
                url,
                $ele = $(".edui-image-searchTxt", me.dialog);

            $(".edui-image-searchAdd", me.dialog).on("click", function () {
            	
                url = Base.checkURL($ele.val());

                if (url) {
                    $("<img src='" + url + "' class='edui-image-pic' />").on("load", function () {

                        var $item = $("<div class='edui-image-item'><div class='edui-image-close'></div></div>").append(this);

                        $(".edui-image-searchRes", me.dialog).append($item);

                        Base.scale(this, 120,this.width,this.height);

                        Base.close($(this));
                        //清空输入框内容
                        $ele.val("");
                        //移除错误提示
                        $(".urlErrorTxt").hide();
                    });
                }
            }).hover(function () {
                    $(this).toggleClass("hover");
                });
            //移除焦点出发时间
            $(".edui-image-searchTxt").on("blur", function () {
            	 if($.trim($(this).val())==""){
            		 $(".edui-image-searchBar .urlErrorTxt").text("请输入图片地址哟~").show();
            	 }else{
            		 url = Base.checkURL($ele.val());
            		 $(".edui-image-searchBar .urlErrorTxt").text("输入图片地址有误呦~").show();
            	 }
            	 
            });
            //监听输入框值是否正确
            $(".edui-image-searchTxt").on("input propertychange",function(){
            	url = Base.checkURL($ele.val());
            	var searchTxt=$(this).val();
            	if(searchTxt==url){
            		 $(".urlErrorTxt").hide();
            	}
            })
        }
    };

    var $tab = null,
        currentDialog = null;

    UM.registerWidget('image', {
        tpl: "<link rel=\"stylesheet\" type=\"text/css\" href=\"<%=image_url%>image.css\">" +
            "<div class=\"edui-image-wrapper\">" +
            "<ul class=\"edui-tab-nav\">" +
            "<li class=\"edui-tab-item edui-active\"><a data-context=\".edui-image-local\" class=\"edui-tab-text\"><%=lang_tab_local%></a></li>" +
//            "<li  class=\"edui-tab-item\"><a data-context=\".edui-image-JimgSearch\" class=\"edui-tab-text\"><%=lang_tab_imgSearch%></a></li>" +
            "</ul>" +
            "<div class=\"edui-tab-content\">" +
            "<div class=\"edui-image-local edui-tab-pane edui-active\">" +
            "<div class=\"edui-image-content\"></div>" +
            "<div class=\"edui-image-mask\"></div>" +
            "</div>" +
            "<div class=\"edui-image-JimgSearch edui-tab-pane\">" +
            "<div id='eduiVideoTabHeads' style='padding-top:10px;'><span class='edui-video-focus' style='padding-left:10px;'>输入正确地址后，请点击【添加】存储图片~</span></div>"+
            "<div class=\"edui-image-searchBar\">" +
            "<table><tr><td><input class=\"edui-image-searchTxt\"  type=\"text\"></td>" +
            "<td><div class=\"edui-image-searchAdd\"><%=lang_btn_add%></div></td>" +
            "<td><span class='urlErrorTxt' style='display:none;'>输入图片地址有误呦~</span></td></tr></table>" +
            "</div>" +
            "<div class=\"edui-image-searchRes\"></div>" +
            "</div>" +
            "</div>" +
            "</div>",
        initContent: function (editor, $dialog) {
            var lang = editor.getLang('image')["static"],
                opt = $.extend({}, lang, {
                    image_url: UMEDITOR_CONFIG.UMEDITOR_HOME_URL + 'dialogs/image/'
                });

            Upload.showCount = 0;

            if (lang) {
                var html = $.parseTmpl(this.tpl, opt);
            }

            currentDialog = $dialog.edui();

            this.root().html(html);

        },
        initEvent: function (editor, $w) {
            $tab = $.eduitab({selector: ".edui-image-wrapper"})
                .edui().on("beforeshow", function (e) {
                    e.stopPropagation();
                });

            Upload.init(editor, $w);

            NetWork.init(editor, $w);
        },
        buttons: {
            'ok': {
                exec: function (editor, $w) {
                    var sel = "",
                    index = $tab.activate();
						 if (index == 0) {
		                        sel = ".edui-image-content .edui-image-pic";
		                    } else if (index == 1) {
		                        sel = ".edui-image-searchRes .edui-image-pic";
		                    }
		                    if (index != -1) {
		                    	  var list = Base.getAllPic(sel, $w, editor);
		                    	  editor.execCommand('insertimage', list);
		                    }   
                }
            },
            'cancel': {
            	exec: function(){
                    //清除图片
                    $(".edui-image-searchRes").html("");
                }
            }
        },
        width: 700,
        height: 408
    }, function (editor, $w, url, state,message) {
        Base.callback(editor, $w, url, state,message)
    })
})();


