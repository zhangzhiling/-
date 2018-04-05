function fileQueueError(file, errorCode, message) {
    try {
        var imageName = "error.gif";
        var errorName = "";
        if (errorCode === SWFUpload.errorCode_QUEUE_LIMIT_EXCEEDED) {
            errorName = "You have attempted to queue too many files.";
        }

        if (errorName !== "") {
            alert(errorName);
            return;
        }

        switch (errorCode) {
            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                alert("该文件0字节，不能上传");
                break;
            case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                alert("请上传指定大小头像");
                break;
            case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
            case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
            	 alert("请上传指定格式头像");
            	 break;
            default:
                alert("您只能上传" + this.settings.file_upload_limit + "张图片");
                break;
        }

        addImage("../images/" + imageName);

    } catch (ex) {
        this.debug(ex);
    }

}

function fileDialogComplete(numFilesSelected, numFilesQueued) {
    try {
        if (numFilesQueued > 0) {
            this.startUpload();
        }
    } catch (ex) {
        this.debug(ex);
    }
}

function uploadProgress(file, bytesLoaded) {
    try {
        var percent = Math.ceil((bytesLoaded / file.size) * 144);

        var progress = new FileProgress(file, this.customSettings.upload_target);
        progress.setProgress(percent);
        if (percent === 144) {
            progress.setStatus("Creating thumbnail...");
            progress.toggleCancel(false, this);
        } else {
            progress.setStatus("Uploading...");
            progress.toggleCancel(true, this);
        }
    } catch (ex) {
        this.debug(ex);
    }
}

function uploadSuccess(file, serverData) {
	$(".js_cutArea").empty().html('<img id="imgs" width="0">');
	serverData = eval('(' + serverData + ')');
        var per = parseInt(serverData.width)/parseInt(serverData.height);
        if(per>3.3){
        	alert("又淘气，宽比高大太多啦！");
        	return;
        }else if(per<0.7){
        	alert("又淘气，高比宽大太多啦！");
        	return;
        }
        var images = document.getElementById("imgs");
        var imagePreview =$(".cut_img_area>img");
        var imgOpeHidth = Math.round((parseInt(serverData.height)/parseInt(serverData.width))*575);  //缩放后图片高度
        $(".cut_img_area>img").attr("src",serverData.url.replace(".costj",".pictj"));
     	images.setAttribute("src",serverData.url.replace(".costj",".pictj"));
        images.setAttribute("data-Width",575);
        images.setAttribute("data-Height",imgOpeHidth);
        images.setAttribute("width",575);
        images.setAttribute("height",imgOpeHidth);

       
        images.onload = function(){
            var imgSize = document.getElementById("imgs");
            var deW = parseInt(imgSize.getAttribute("data-Width"));
            var deH = parseInt(imgSize.getAttribute("data-Height"));
            $(imagePreview).css({
                width: deW,
                height:deH,
                marginLeft: 0,
                marginTop: 0
            }); 
            //初始化加载计算比例
            var deW01 = parseInt(imgSize.getAttribute("data-Width"));
            var redWH=deW01/serverData.width
            var rediosp=0;
            if(redWH>=1){
            	 rediosp= Math.ceil(redWH*100); //裁剪框缩放比例
            }else{
            	 rediosp= Math.floor(redWH*100); //裁剪框缩放比例
            }
            $(".js_cutSubmit").data({
            	"xaxis":0, 
            	"yaxis":0,
            	"cutWidth":Math.ceil(144/rediosp*100),
            	"cutHeight":Math.ceil(144/rediosp*100),
            	"imageFileUrl":serverData.url.replace(".costj",".pictj")+"?imageMogr2/thumbnail/!"+rediosp+'p'
            });
            function previewFor(img, selection) {
                if (!selection.width || !selection.height){
                    return;
                }
                //===================对接腾讯云图片缩放裁切比例计算=========================
                //比例：redWH  缩放后width/原图width 或者  缩放后height/原图height
                //比例：redWH>=1 :rediosp= Math.ceil(redWH*100);   redWH<1 :rediosp= Math.floor(redWH*100);
                
                //===================腾讯云裁切需要参数比例计算============================
                //参数横坐标(xaxis)：Math.ceil(selection.x1/rediosp*100)
                //参数纵坐标(yaxis)：Math.ceil(selection.y1/rediosp*100)
                //裁剪区宽度(cutWidth)：Math.ceil(parseInt(selection.x2-selection.x1)/rediosp*100)
                //裁剪区高度(cutHeight):Math.ceil(parseInt(selection.y2-selection.y1)/rediosp*100)
                //腾讯云缩放图片地址(imageFileUrl)：http://fastdfstest-1251840830.pictj.myqcloud.com/17/10/25/19/5bf187605f?imageMogr2/thumbnail/!+rediosp+p
                //                             说明：访问裁切后图片地址中比例参数即是rediosp
                var scaleX = 144 / selection.width;
                var scaleY = 144 / selection.height;
                var imgSize = document.getElementById("imgs");
                var deW = parseInt(imgSize.getAttribute("data-Width"));
                var deH = parseInt(imgSize.getAttribute("data-Height"));
                var redWH=deW/serverData.width
                var rediosp=0;
                if(redWH>=1){
                	 rediosp= Math.ceil(redWH*100); //裁剪框缩放比例
                }else{
                	 rediosp= Math.floor(redWH*100); //裁剪框缩放比例
                }
                $(imagePreview).css({
                    width: Math.round(scaleX * deW),
                    height: Math.round(scaleY * deH),
                    marginLeft: -Math.round(scaleX * selection.x1),
                    marginTop: -Math.round(scaleY * selection.y1)
                });
                //rediosp:
                $(".js_cutSubmit").data({
                	"xaxis":Math.ceil(selection.x1/rediosp*100),  
                	"yaxis":Math.ceil(selection.y1/rediosp*100),
                	"cutWidth":Math.ceil(parseInt(selection.x2-selection.x1)/rediosp*100),
                	"cutHeight":Math.ceil(parseInt(selection.y2-selection.y1)/rediosp*100),
                	"imageFileUrl":serverData.url.replace(".costj",".pictj")+"?imageMogr2/thumbnail/!"+rediosp+"p"
                });
                
            }
            if($(document).checkClientIsWabOrPcFn()=="pc"){
            	 //缩放比例
                $('#imgs').imgAreaSelect({
                    x1: 0, y1: 0, x2: 144, y2: 144,
                    aspectRatio: '1:1',
                    parent: '.js_cutArea',
                    minWidth:144,
                    minHeight:144,
                    handles: true,
                    persistent:true,  //点击未选择区域遮罩不消失
                    fadeSpeed: 10,
                    onSelectChange: previewFor
                }); 
            }else{
            	
                var $image = $('#imgs');
                
                var options = {
	                  background: false,
	                  dragCrop: false,
	                  guides:false,
	                  autoCropArea:1,
	                  zoomable:false,
	                  touchDragZoom: false,
	                  mouseWheelZoom: false,
	                  minCanvasWidth: 144,
	                  minCanvasHeight: 144,
	                  minCropBoxWidth: 144,
	                  minCropBoxHeight: 144,
	                  minContainerWidth: 144,
	                  minContainerHeight: 144,
	                  aspectRatio: 1 / 1,
	                  preview: '.cut_img_area',
	                  crop: function (data) {
	                	//左上角x1y1，右下角x1y1,裁剪框width,height
	                	  var u1=$(".cropper-crop-box").offset().left-$(".cropper-canvas").offset().left;
	                	  var u2=$(".cropper-crop-box").offset().top-$(".cropper-canvas").offset().top;
	                	  var select={};
	                	  select.x1=u1,
	                	  select.y1=u2,
	                	  select.width=$(".cropper-crop-box").width();
	                	  select.height=$(".cropper-crop-box").width();
	                	  select.x2=$(".cropper-crop-box").width()+u1;
	                	  select.y2=$(".cropper-crop-box").width()+u2;
	                	  previewFor($image,select);
                      }
                };
            	$image.cropper(options);
            }
           
 
        }; 
        
}

function uploadComplete(file) {
    try {
        /*  I want the next upload to continue automatically so I'll call startUpload here */
        if (this.getStats().files_queued > 0) {
            this.startUpload();
        } else {
            var progress = new FileProgress(file, this.customSettings.upload_target);

            progress.setComplete();
            progress.setStatus("All images received.");
            progress.toggleCancel(false);
        }
    } catch (ex) {
        this.debug(ex);
    }
}

function uploadError(file, errorCode, message) {
    var imageName = "error.gif";
    var progress;
    try {
        switch (errorCode) {
            case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                try {
                    progress = new FileProgress(file, this.customSettings.upload_target);
                    progress.setCancelled();
                    progress.setStatus("Cancelled");
                    progress.toggleCancel(false);
                }
                catch (ex1) {
                    this.debug(ex1);
                }
                break;
            case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                    try {
                        progress = new FileProgress(file, this.customSettings.upload_target);
                        progress.setCancelled();
                        progress.setStatus("Stopped");
                        progress.toggleCancel(true);
                    }
                    catch (ex2) {
                        this.debug(ex2);
                    }
            case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                imageName = "uploadlimit.gif";
                break;
            default:
                alert(message);
                break;
        }

        addImage("images/" + imageName);

    } catch (ex3) {
        this.debug(ex3);
    }

}


function addImage(src) {
    var newImg = document.createElement("img");
    newImg.style.margin = "5px";

    document.getElementById("thumbnails").appendChild(newImg);
    if (newImg.filters) {
        try {
            newImg.filters.item("DXImageTransform.Microsoft.Alpha").opacity = 0;
        } catch (e) {
            // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
            newImg.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + 0 + ')';
        }
    } else {
        newImg.style.opacity = 0;
    }

    newImg.onload = function () {
        fadeIn(newImg, 0);
    };
    newImg.src = src;
}

function fadeIn(element, opacity) {
    var reduceOpacityBy = 5;
    var rate = 30; // 15 fps


    if (opacity < 144) {
        opacity += reduceOpacityBy;
        if (opacity > 144) {
            opacity = 144;
        }

        if (element.filters) {
            try {
                element.filters.item("DXImageTransform.Microsoft.Alpha").opacity = opacity;
            } catch (e) {
                // If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
                element.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + opacity + ')';
            }
        } else {
            element.style.opacity = opacity / 144;
        }
    }

    if (opacity < 144) {
        setTimeout(function () {
            fadeIn(element, opacity);
        }, rate);
    }
}



/* ******************************************
*	FileProgress Object
*	Control object for displaying file info
* ****************************************** */
var fname = [];
function FileProgress(file, targetID) {
    this.fileProgressID = "divFileProgress";

    this.fileProgressWrapper = document.getElementById(this.fileProgressID);
    if (!this.fileProgressWrapper) {
        this.fileProgressWrapper = document.createElement("div");
        this.fileProgressWrapper.className = "progressWrapper";
        this.fileProgressWrapper.id = this.fileProgressID;

        this.fileProgressElement = document.createElement("div");
        this.fileProgressElement.className = "progressContainer";

        var progressCancel = document.createElement("a");
        progressCancel.className = "progressCancel";
        progressCancel.href = "#";
        progressCancel.style.visibility = "hidden";
        progressCancel.appendChild(document.createTextNode(" "));

        var progressText = document.createElement("div");
        progressText.className = "progressName";
        //progressText.appendChild(document.createTextNode(file.name));

        var progressBar = document.createElement("div");
        progressBar.className = "progressBarInProgress";

        var progressStatus = document.createElement("div");
        progressStatus.className = "progressBarStatus";
        progressStatus.innerHTML = "&nbsp;";

        this.fileProgressElement.appendChild(progressCancel);
        this.fileProgressElement.appendChild(progressText);
        this.fileProgressElement.appendChild(progressStatus);
        this.fileProgressElement.appendChild(progressBar);

        this.fileProgressWrapper.appendChild(this.fileProgressElement);

        document.getElementById(targetID).appendChild(this.fileProgressWrapper);
        fadeIn(this.fileProgressWrapper, 0);

    }

    this.height = this.fileProgressWrapper.offsetHeight;
    var imgname = file.name;
}



