(function () {

    var utils = UM.utils,
        browser = UM.browser,
        uploadedFile = [],
        Base = {
        checkURL: function (url) {
            if(!url)    return false;
            url = utils.trim(url);
            if (url.length <= 0) {
                return false;
            }
            if (url.search(/http:\/\/|https:\/\//) !== 0) {
                url += 'http://';
            }

            url=url.replace(/\?[\s\S]*$/,"");

            if (!/(.gif|.jpg|.jpeg|.png)$/i.test(url)) {
                return false;
            }
            return url;
        },
        getAllPic: function (sel, $w, editor) {
            var me = this,
                arr = [],
                $imgs = $(sel, $w);

            $.each($imgs, function (index, node) {
                return arr.push({
                    _src: $(node).attr('data-src'),
                    src: $(node).attr('data-src')//,
                    //width: '100%'
                });
            });

            return arr;
        },
        scale: function (img, max, oWidth, oHeight) {
            var width = 0, height = 0, percent, ow = img.width || oWidth, oh = img.height || oHeight;
            if (ow > max || oh > max) {
                if (ow >= oh) {
                    if (width = ow - max) {
                        percent = (width / ow).toFixed(2);
                        img.height = oh - oh * percent;
                        img.width = max;
                    }
                } else {
                    if (height = oh - max) {
                        percent = (height / oh).toFixed(2);
                        img.width = ow - ow * percent;
                        img.height = max;
                    }
                }
            }

            return this;
        },
        close: function ($img) {

            $img.css({
                top: ($img.parent().height() - $img.height()) / 2,
                left: ($img.parent().width()-$img.width())/2
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
                reader.onload = function (e) {
                    img.src = this.result;
                    $w.append(img);
                };
                reader.readAsDataURL(file);
            }
        },
        callback: function (editor, $w, url, state) {

            if (state == "SUCCESS") {
                //显示图片计数+1
                Upload.showCount++;
        
                var $item = $(
                    '<li class="edui-image-item edui-image-upload-item">' +
                        '<div class="frm-img-item gb-thumb-img" data-src="' + url + '" style="background-image: url(\'' + url + '\');">' +
                            '<span class="ico-del-img"></span>' +
                            '<span class="frm-img-tips" data-hide="modal">插入正文</span>' +
                            //'<p class="frm-upload-progress gb-undis"><span style="width: 25%;"></span></p>' +
                        '</div>' +
                    '</li>'
                );

                $('#imageListUl').append($item);

                Upload.updateView();

                $item.find('.ico-del-img').click(function(){
                    var $li = $(this).parents('li.edui-image-item');
                    uploadedFile.splice($li.index()-1,1);
                    $li.remove();
                    Upload.showCount--;
                    Upload.updateView();
                });
                $item.find('.frm-img-tips').click(function(){
                    editor.execCommand('insertimage', [{
                        _src: $item.find('.frm-img-item').attr('data-src'),
                        src: $item.find('.frm-img-item').attr('data-src')//,
                        //width: '100%'
                    }]);
                    editor.focus();
                });

            } else {
                alert(state+"=====test");
                currentDialog.showTip( state );
                window.setTimeout( function () {

                    currentDialog.hideTip();

                }, 3000 );
            }

            Upload.toggleMask();
            $w.data('eduiisLoading', false);

        }
    };

    /*
     * 本地上传
     * */
    var Upload = {
        showCount: 0,
        uploadTpl: '<li>' +
                '<div class="frm-img-item frm-img-add edui-image-upload%%">' +
                    '<span></span>' +
                    '<form class="edui-image-form" method="post" enctype="multipart/form-data" target="up">' +
                        '<input style=\"filter: alpha(opacity=0);\" class="edui-image-file" type="file" hidefocus name="%fieldName%" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp"/>' +
                    '</form>' +
                '</div>' +
            '</li>',
        init: function (editor, $w) {
            var me = this;

            me.editor = editor;
            me.dialog = $w;
            me.render("#imageListUl", 1);
            me.config(".edui-image-upload1");
            me.submit();

            if(uploadedFile.length){
                $.each(uploadedFile,function(i,url){
                    Base.callback(me.editor, me.dialog, url, "SUCCESS");
                })
            }

            Upload.updateView();

            $(".edui-image-upload1").hover(function () {
                $(".edui-image-icon", this).toggleClass("hover");
            });

            return me;
        },
        render: function (sel, t) {
            var me = this;

            $(sel, me.dialog).append($(me.uploadTpl.replace(/%fieldName%/, me.editor.getOpt('imageFieldName')).replace(/%%/g, t)));

            return me;
        },
        config: function (sel) {
            var me = this,
                url=me.editor.options.imageUrl;

            url=url + (url.indexOf("?") == -1 ? "?" : "&") + "action=uploadimage&r="+Math.random();//me.editor.id;//初始form提交地址;
        	//url = "http://up.gyyx.cn/Image/WebSiteSaveToTemp.ashx?group=official_site&width=200&height=200";
            $("form", $(sel, me.dialog)).attr("action", url);

            return me;
        },
        uploadComplete: function(r){
            var me = this;
            try{
                var json = eval('('+r+')');
                console.log(json);
                Base.callback(me.editor, me.dialog, json.url, json.state);
                uploadedFile.push(json.url);
            }catch (e){
                var lang = me.editor.getLang('image');
                Base.callback(me.editor, me.dialog, '', (lang && lang.uploadError) || 'Error!');
            }
        },
        submit: function (callback) {

            var me = this,
                input = $( '<input style="filter: alpha(opacity=0);" class="edui-image-file" type="file" hidefocus="" name="upfile" accept="image/gif,image/jpeg,image/png,image/jpg,image/bmp">'),
                input = input[0];

            $(me.dialog).delegate( ".edui-image-file", "change", function ( e ) {
                
                if ( !this.parentNode ) {
                    return;
                }
                document.domain='gyyx.cn';
                //modal.js将通过改值决定是否点击背景会触发隐藏图片上传模块
                me.dialog.data('eduiisLoading', true);

                $('<iframe name="up"  style="display: none"></iframe>').insertBefore(me.dialog).on('load', function(){
                    var body = (this.contentDocument || this.contentWindow.document).body,
                        r = body.innerText || body.textContent || '';
                    if(r == '')return;
                    me.uploadComplete(r);
                    $(this).unbind('load');
                    $(this).remove();

                });

                $(this).parent()[0].submit();
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
            if ( Upload.showCount >= 8 ) {
                $(".edui-image-upload1", this.dialog).hide();
            } else {
                $(".edui-image-upload1", this.dialog).show();
            }
        },
        toggleMask: function (html) {
            var me = this;

            var $mask = $(".edui-image-mask", me.dialog);

            if (html) {

                //$(".edui-image-upload1", me.dialog).css( "display", "none" );
                $mask.addClass("edui-active").html(html);

            } else {

                $mask.removeClass("edui-active").html();
                if ( Upload.showCount > 0 ) {
                    return me;
                }
                //$(".edui-image-upload1", me.dialog).css( "display", "block" );

            }

            return me;
        }
    };

    var currentDialog = null;

    UM.registerWidget('imageList', {
        tpl: "<link rel=\"stylesheet\" type=\"text/css\" href=\"<%=image_url%>imageList.css\">" +
            '<div class="frm-img-list" id="popUploadImg">' +
                '<div class="frm-img-list-header">' +
                    '<a id="imageListInsertAll" href="javascript:void(0)" data-hide="modal" class="gb-button gb-button-uploadall">全部插入</a>' +
                    // '<div id="imageListPager" class="frm-img-page">' +
                    //     '<span class="imageListPager">1/2</span>' +
                    //     '<a id="imageListPageerLeft" href="javascript:void(0)" class="frm-img-page-btn frm-btn-visible"><i class="gbico ico-tb-left"></i></a>' +
                    //     '<a id="imageListPageerRight" href="javascript:void(0)" class="frm-img-page-btn"><i class="gbico ico-tb-right"></i></a>' +
                    // '</div>' +
                '</div>' +
                '<div class="frm-img-list-cont">' +
                    '<div class="img-list-scroll">' +
                        '<ul id="imageListUl" class="gb-clear"></ul>' +
                    '</div>' +
                '</div>' +
                '<div class="edui-image-mask"></div>' +
            '</div>',
        initContent: function (editor, $dialog) {
            var lang = editor.getLang('image')["static"],
                opt = $.extend({}, lang, {
                    image_url: UMEDITOR_CONFIG.UMEDITOR_HOME_URL + 'dialogs/imageList/'
                });

            Upload.showCount = 0;

            if (lang) {
                var html = $.parseTmpl(this.tpl, opt);
            }

            currentDialog = $dialog.edui();

            this.root().html(html);

        },
        initEvent: function (editor, $w) {
            Upload.init(editor, $w);
            $('#imageListInsertAll').click(function(){
                var list = Base.getAllPic('.frm-img-item:not(.frm-img-add)', $w, editor);
                editor.execCommand('insertimage', list);
                editor.focus();
            });
        },
        width: '100%',
        height: 130
    }, function (editor, $w, url, state) {
        Base.callback(editor, $w, url, state)
    })
})();