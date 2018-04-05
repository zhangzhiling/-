(function(){

    var editor = null;

    UM.registerWidget('emotion',{

        tpl: "<link type=\"text/css\" rel=\"stylesheet\" href=\"<%=emotion_url%>emotion.css\">" +
            "<div class=\"edui-emotion-tab-Jpanel edui-emotion-wrapper\">" +
            "<ul class=\"edui-emotion-Jtabnav edui-tab-nav\">" +
            //"<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab0\" hideFocus=\"true\" class=\"edui-tab-text\"><%=lang_input_choice%></a></li>" +
            "<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab1\" class=\"edui-tab-text\"><%=lang_input_wddl%></a></li>" +
            "<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab2\" hideFocus=\"true\" class=\"edui-tab-text\"><%=lang_input_wdnan%></a></li>" +
            "<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab3\" hideFocus=\"true\" class=\"edui-tab-text\"><%=lang_input_wdnv%></a></li>" +
            "<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab4\" hideFocus=\"true\" class=\"edui-tab-text\"><%=lang_input_lvdouwa%></a></li>" +
            "<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab5\" hideFocus=\"true\" class=\"edui-tab-text\"><%=lang_input_bubble%></a></li>" +
            "<li class=\"edui-tab-item\"><a data-context=\".edui-emotion-Jtab6\" hideFocus=\"true\" class=\"edui-tab-text\"><%=lang_input_Tuzki%></a></li>" +
            "<li class=\"edui-emotion-tabs\"></li>" +
            "</ul>" +
            "<div class=\"edui-tab-content edui-emotion-JtabBodys\">" +
            //"<div class=\"edui-emotion-Jtab0 edui-tab-pane\"></div>" +
            "<div class=\"edui-emotion-Jtab1 edui-tab-pane\"></div>" +
            "<div class=\"edui-emotion-Jtab2 edui-tab-pane\"></div>" +
            "<div class=\"edui-emotion-Jtab3 edui-tab-pane\"></div>" +
            "<div class=\"edui-emotion-Jtab4 edui-tab-pane\"></div>" +
            "<div class=\"edui-emotion-Jtab5 edui-tab-pane\"></div>" +
            "<div class=\"edui-emotion-Jtab6 edui-tab-pane\"></div>" +
            "</div>" +
            "<div class=\"edui-emotion-JtabIconReview edui-emotion-preview-box\">" +
            "<img src=\"<%=cover_img%>\" class=\'edui-emotion-JfaceReview edui-emotion-preview-img\'/>" +
            "</div>",

        sourceData: {
            emotion: {
                tabNum:7, //切换面板数量
                SmilmgName:{ 'edui-emotion-Jtab1':['dl_00', 72], 'edui-emotion-Jtab2':['nan_00', 87], 'edui-emotion-Jtab3':['nv_00', 54], 'edui-emotion-Jtab4':['w_00', 52], 'edui-emotion-Jtab5':['i_f', 50], 'edui-emotion-Jtab6':['t_00', 40]}, //图片前缀名
                imageFolders:{ 'edui-emotion-Jtab1':'wddl/', 'edui-emotion-Jtab2':'wdnan/', 'edui-emotion-Jtab3':'wdnv/', 'edui-emotion-Jtab4':'ldw/', 'edui-emotion-Jtab5':'face/', 'edui-emotion-Jtab6':'tsj/'}, //图片对应文件夹路径
                imageCss:{'edui-emotion-Jtab1':'wddl', 'edui-emotion-Jtab2':'wdnan', 'edui-emotion-Jtab3':'wdnv', 'edui-emotion-Jtab4':'ldw', 'edui-emotion-Jtab5':'pp', 'edui-emotion-Jtab6':'tsj'}, //图片css类名
                imageCssOffset:{'edui-emotion-Jtab1':35, 'edui-emotion-Jtab2':35, 'edui-emotion-Jtab3':35, 'edui-emotion-Jtab4':35, 'edui-emotion-Jtab5':25, 'edui-emotion-Jtab6':35}, //图片偏移
                SmileyInfor:{
                    'edui-emotion-Jtab1':['灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼','灯笼'],
                    'edui-emotion-Jtab2':['道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥','道哥'],
                    'edui-emotion-Jtab3':['道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐','道姐'],
                    'edui-emotion-Jtab4':['大笑', '瀑布汗~', '惊讶', '臭美', '傻笑', '抛媚眼', '发怒', '我错了', 'money', '气愤', '挑逗', '吻', '怒', '胜利', '委屈', '受伤', '说啥呢？', '闭嘴', '不', '逗你玩儿', '飞吻', '眩晕', '魔法', '我来了', '睡了', '我打', '闭嘴', '打', '打晕了', '刷牙', '爆揍', '炸弹', '倒立', '刮胡子', '邪恶的笑', '不要不要', '爱恋中', '放大仔细看', '偷窥', '超高兴', '晕', '松口气', '我跑', '享受', '修养', '哭', '汗', '啊~', '热烈欢迎', '打酱油', '俯卧撑', '?'],
                    'edui-emotion-Jtab5':['微笑', '亲吻', '调皮', '惊讶', '耍酷', '发火', '害羞', '汗水', '大哭', '得意', '鄙视', '困', '夸奖', '晕倒', '疑问', '媒婆', '狂吐', '青蛙', '发愁', '亲吻', '', '爱心', '心碎', '玫瑰', '礼物', '哭', '奸笑', '可爱', '得意', '呲牙', '暴汗', '楚楚可怜', '困', '哭', '生气', '惊讶', '口水', '彩虹', '夜空', '太阳', '钱钱', '灯泡', '咖啡', '蛋糕', '音乐', '爱', '胜利', '赞', '鄙视', 'OK'],
                    'edui-emotion-Jtab6':['Kiss', 'Love', 'Yeah', '啊！', '背扭', '顶', '抖胸', '88', '汗', '瞌睡', '鲁拉', '拍砖', '揉脸', '生日快乐', '摊手', '睡觉', '瘫坐', '无聊', '星星闪', '旋转', '也不行', '郁闷', '正Music', '抓墙', '撞墙至死', '歪头', '戳眼', '飘过', '互相拍砖', '砍死你', '扔桌子', '少林寺', '什么？', '转头', '我爱牛奶', '我踢', '摇晃', '晕厥', '在笼子里', '震荡']
                }
            }
        },
        initContent:function( _editor, $widget ){

            var me = this,
                emotion = me.sourceData.emotion,
                lang = _editor.getLang( 'emotion' )['static'],
                emotionUrl = UMEDITOR_CONFIG.UMEDITOR_HOME_URL + 'dialogs/emotion/',
                options = $.extend( {}, lang, {
                    emotion_url: emotionUrl
                }),
                $root = me.root();

            if( me.inited ) {
                me.preventDefault();
                this.switchToFirst();
                return;
            }

            me.inited = true;

            editor = _editor;
            this.widget = $widget;

            emotion.SmileyPath = _editor.options.emotionLocalization === true ? emotionUrl + 'images/' : "http://img.baidu.com/hi/";
            emotion.SmileyBox = me.createTabList( emotion.tabNum );
            emotion.tabExist = me.createArr( emotion.tabNum );

            options['cover_img'] = emotion.SmileyPath + (editor.options.emotionLocalization ? '0.gif' : 'default/0.gif');

            $root.html( $.parseTmpl( me.tpl, options ) );

            me.tabs = $.eduitab({selector:".edui-emotion-tab-Jpanel"});

            //缓存预览对象
            me.previewBox = $root.find(".edui-emotion-JtabIconReview");
            me.previewImg = $root.find(".edui-emotion-JfaceReview");

            me.initImgName();

        },
        initEvent:function(){

            var me = this;

            //防止点击过后关闭popup
            me.root().on('click', function(e){
                return false;
            });

            //移动预览
            me.root().delegate( 'td', 'mouseover mouseout', function( evt ){

                var $td = $( this),
                    url = $td.attr('data-surl') || null;

                if( url ) {
                    me[evt.type]( this, url , $td.attr('data-posflag') );
                }

                return false;

            } );

            //点击选中
            me.root().delegate( 'td', 'click', function( evt ){

                var $td = $( this),
                    realUrl = $td.attr('data-realurl') || null;

                if( realUrl ) {
                    me.insertSmiley( realUrl.replace( /'/g, "\\'" ), evt );
                }

                return false;

            } );

            //更新模板
            me.tabs.edui().on("beforeshow", function( evt ){

                var contentId = $(evt.target).attr('data-context').replace( /^.*\.(?=[^\s]*$)/, '' );

                evt.stopPropagation();

                me.updateTab( contentId );

            });

            this.switchToFirst();

        },
        initImgName: function() {

            var emotion = this.sourceData.emotion;

            for ( var pro in emotion.SmilmgName ) {
                var tempName = emotion.SmilmgName[pro],
                    tempBox = emotion.SmileyBox[pro],
                    tempStr = "";

                if ( tempBox.length ) return;

                for ( var i = 1; i <= tempName[1]; i++ ) {
                    tempStr = tempName[0];
                    if ( i < 10 ) tempStr = tempStr + '0';
                    tempStr = tempStr + i + '.gif';
                    tempBox.push( tempStr );
                }
            }

        },
        /**
         * 切换到第一个tab
         */
        switchToFirst: function(){
            this.root().find(".edui-emotion-Jtabnav .edui-tab-text:first").trigger('click');
        },
        updateTab: function( contentBoxId ) {

            var me = this,
                emotion = me.sourceData.emotion;

            me.autoHeight( contentBoxId );

            if ( !emotion.tabExist[ contentBoxId ] ) {

                emotion.tabExist[ contentBoxId ] = true;
                me.createTab( contentBoxId );

            }

        },
        autoHeight: function( ) {
            this.widget.height(this.root() + 2);
        },
        createTabList: function( tabNum ) {
            var obj = {};
            for ( var i = 0; i < tabNum; i++ ) {
                obj["edui-emotion-Jtab" + i] = [];
            }
            return obj;
        },
        mouseover: function( td, srcPath, posFlag ) {

            posFlag -= 0;

            $(td).css( 'backgroundColor', '#ACCD3C' );

            this.previewImg.css( "backgroundImage", "url(" + srcPath + ")" );
            posFlag && this.previewBox.addClass('edui-emotion-preview-left');
            this.previewBox.show();

        },
        mouseout: function( td ) {
            $(td).css( 'backgroundColor', 'transparent' );
            this.previewBox.removeClass('edui-emotion-preview-left').hide();
        },
        insertSmiley: function( url, evt ) {
            var obj = {
                src: url
            };
            obj._src = obj.src;
            obj._emotion = "emotion"; //区分图片和表情
            editor.execCommand( 'insertimage', obj );
            if ( !evt.ctrlKey ) {
                //关闭预览
                this.previewBox.removeClass('edui-emotion-preview-left').hide();
                this.widget.edui().hide();
            }
        },
        createTab: function( contentBoxId ) {

            var faceVersion = "?v=1.1", //版本号
                me = this,
                $contentBox = this.root().find("."+contentBoxId),
                emotion = me.sourceData.emotion,
                imagePath = emotion.SmileyPath + emotion.imageFolders[ contentBoxId ], //获取显示表情和预览表情的路径
                positionLine = 11 / 2, //中间数
                iWidth = iHeight = 35, //图片长宽
                iColWidth = 3, //表格剩余空间的显示比例
                tableCss = emotion.imageCss[ contentBoxId ],
                cssOffset = emotion.imageCssOffset[ contentBoxId ],
                textHTML = ['<table border="1" class="edui-emotion-smileytable">'],
                i = 0, imgNum = emotion.SmileyBox[ contentBoxId ].length, imgColNum = 11, faceImage,
                sUrl, realUrl, posflag, offset, infor;

            for ( ; i < imgNum; ) {
                textHTML.push( '<tr>' );
                for ( var j = 0; j < imgColNum; j++, i++ ) {
                    faceImage = emotion.SmileyBox[ contentBoxId ][i];
                    if ( faceImage ) {
                        sUrl = imagePath + faceImage + faceVersion;
                        realUrl = imagePath + faceImage;
                        posflag = j < positionLine ? 0 : 1;
                        offset = cssOffset * i * (-1) - 1;
                        infor = emotion.SmileyInfor[ contentBoxId ][i];

                        textHTML.push( '<td  class="edui-emotion-' + tableCss + '" data-surl="'+ sUrl +'" data-realurl="'+ realUrl +'" data-posflag="'+ posflag +'" align="center">' );
                        textHTML.push( '<span>' );
                        textHTML.push( '<img  style="background-position:left ' + offset + 'px;" title="' + infor + '" src="' + emotion.SmileyPath + (editor.options.emotionLocalization ? '0.gif" width="' : 'default/0.gif" width="') + iWidth + '" height="' + iHeight + '"></img>' );
                        textHTML.push( '</span>' );
                    } else {
                        textHTML.push( '<td bgcolor="#FFFFFF">' );
                    }
                    textHTML.push( '</td>' );
                }
                textHTML.push( '</tr>' );
            }
            textHTML.push( '</table>' );
            textHTML = textHTML.join( "" );
            $contentBox.html( textHTML );
        },
        createArr: function( tabNum ) {
            var arr = [];
            for ( var i = 0; i < tabNum; i++ ) {
                arr[i] = 0;
            }
            return arr;
        },
        width:603,
        height:400
    });

})();

