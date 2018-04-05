$(function () {
    var $image = $('#selectImgCut'),
    $dataX = $('#dataX'),
    $dataY = $('#dataY'),
    $dataHeight = $('#dataHeight'),
    $dataWidth = $('#dataWidth'),
    $dataRotate = $('#dataRotate'),
    options = {
      background: false,
      dragCrop: false,
      touchDragZoom: false,
      mouseWheelZoom: false,
      minCanvasWidth: 144,
      minCanvasHeight: 144,
      minCropBoxWidth: 144,
      minCropBoxHeight: 144,
      minContainerWidth: 144,
      minContainerHeight: 144,
      aspectRatio: 1 / 1,
      preview: '.img-preview',
      crop: function (data) {
        $dataX.val(Math.round(data.x));
        $dataY.val(Math.round(data.y));
        $dataHeight.val(Math.round(data.height));
        $dataWidth.val(Math.round(data.width));
        $dataRotate.val(Math.round(data.rotate));
      }
    };

	$image.on({
	        'build.cropper': function () {
	             //×¢ÊÍÇø
	      },
	        'built.cropper': function () {
	            //×¢ÊÍÇø
	      },
	        'dragstart.cropper': function () {
	            //×¢ÊÍÇø
	      },
	        'dragmove.cropper': function () {
	            //×¢ÊÍÇø
	      },
	        'dragend.cropper': function () {
	            //×¢ÊÍÇø
	      },
	        'zoomin.cropper': function () {
	            //×¢ÊÍÇø
	      },
	        'zoomout.cropper': function () {
	            //×¢ÊÍÇø
	      }
	}).cropper(options);

});
