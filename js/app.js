var name = "";

$(function() {
  SettingCheck();
  if(localStorage.getItem('space_id') &&localStorage.getItem('api_key')){
   getUserList();
  }
   setSetting();
  // 「スキャンする」を押したときのイベント
  /*$("#ScanButton").click(function() {
    scanBarcode();
    return false;
  });*/
  
    $("#returnButton").click(function() {
        if($("#ResultMessage").text()){
        var json = $("#ResultMessage").text();
        var data = JSON.parse(json)
        BacklogBorrow(data.issue,4,name);
        alert("返しました");
        }else{
          alert("スキャンしてください");
        }
    });

        $("#setting-complete").click(function() {
          localStorage.setItem('space_id', $("#space-id").val());
          localStorage.setItem('api_key', $("#api-key").val());
          localStorage.setItem('name_search_range', $("#name-search-range").val());
        alert("変更しました");
    });
  
      $("#borrowButton").click(function() {
        if(name){
          if($("#ResultMessage").text()){
            var json = $("#ResultMessage").text();
            var data = JSON.parse(json)
            BacklogBorrow(data.issue,2,name);
            alert("借りました");
          }else{
            alert("スキャンしてください");
          }
        }else{
          alert("名前を選択してください");
      }
    });
});
 
// 「スキャンする」を押したときに実行される関数
/*function scanBarcode() {
  var reader = new FileReader();
  reader.onload = function() {
    node.value = "";
    qrcode.callback = function(res) {
      if(res instanceof Error) {
        alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
      } else {
        node.parentNode.previousElementSibling.value = res;
      }
    };
    qrcode.decode(reader.result);
  };
  reader.readAsDataURL(node.files[0]);
}*/

function openQRCamera(node) {
  var reader = new FileReader();
  reader.onload = function() {
    node.value = "";
    qrcode.callback = function(res) {
      if(res instanceof Error) {
        alert("No QR code found. Please make sure the QR code is within the camera's frame and try again.");
      } else {
        node.parentNode.previousElementSibling.value = res;
      }
    };
    qrcode.decode(reader.result);
  };
  reader.readAsDataURL(node.files[0]);
}

function getUserList(){
    var path = 'https://'+ localStorage.getItem('space_id') +'.backlog.jp/api/v2/users?apiKey='+ localStorage.getItem('api_key');
    var json;
    var xhr=new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              json = JSON.parse(xhr.responseText);
              ObjArraySort(json, "mailAddress");
              var reg;
              if(localStorage.getItem('name_search_range')){
                reg = new RegExp(localStorage.getItem('name_search_range'));
                  for(var i in json) {
                    if(reg.test(json[i].mailAddress)){
                      $("#nameData").append("<option value=" +json[i].id + ">" + json[i].name +  "</option>");
                    }
                  };
              }else{
                  for(var i in json) {
                    $("#nameData").append("<option value=" +json[i].id + ">" + json[i].name +  "</option>");
                  };
              }
            } else {
                console.error(xhr.statusText);
            }
        }
    };
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    };
    xhr.send(null);
}

function setSetting(){
  if( localStorage.getItem('api_key')){
    $("#api-key").val(localStorage.getItem('api_key'));
  }
  if(localStorage.getItem('space_id')){
    $("#space-id").val(localStorage.getItem('space_id'));
  }
  if(localStorage.getItem('name_search_range')){
    $("#name-search-range").val(localStorage.getItem('name_search_range'));
  }
}


var BacklogBorrow = function(issue,statusId, name) {
    var path = 'https://'+ localStorage.getItem('space_id') +'.backlog.jp/api/v2/issues/' + issue + '?apiKey='+ localStorage.getItem('api_key');
    var xhr=new XMLHttpRequest();
    xhr.open( 'PATCH', path, false );
    // POST 送信の場合は Content-Type は固定.
    xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
    xhr.send( 'statusId='+ statusId + '&comment=' + name );
    xhr.abort(); // 再利用する際にも abort() しないと再利用できないらしい.
};


function ObjArraySort(ary, key, order) {
    var reverse = 1;
    if(order && order.toLowerCase() == "desc") 
        reverse = -1;
    ary.sort(function(a, b) {
		if(a[key] < b[key])
            return -1 * reverse;
		else if(a[key] == b[key])
            return 0;
        else
            return 1 * reverse;
	});
}

$('#nameData').change(function() {
    // 選択されているvalue属性値を取り出す
    var val = $('#nameData').val();
    console.log(val); // 出力：ABC
    // 選択されている表示文字列を取り出す
    name = $('#nameData option:selected').text();
});

function SettingCheck(){
    if(!localStorage.getItem('space_id')){
      alert("設定画面のスペースIDを入力してください");
  }
    if(!localStorage.getItem('api_key')){
      alert("設定画面のApiKeyを入力してください");
  }
}


var qrcode = {};
qrcode.imagedata = null;
qrcode.width = 0;
qrcode.height = 0;
qrcode.qrCodeSymbol = null;
qrcode.debug = false;
qrcode.maxImgSize = 1024*1024;

qrcode.sizeOfDataLengthInfo =  [  [ 10, 9, 8, 8 ],  [ 12, 11, 16, 10 ],  [ 14, 13, 16, 12 ] ];

qrcode.callback = null;

qrcode.vidSuccess = function (stream) 
{
    qrcode.localstream = stream;
    if(qrcode.webkit)
        qrcode.video.src = window.webkitURL.createObjectURL(stream);
    else
    if(qrcode.moz)
    {
        qrcode.video.mozSrcObject = stream;
        qrcode.video.play();
    }
    else
        qrcode.video.src = stream;
    
    qrcode.gUM=true;
    
    qrcode.canvas_qr2 = document.createElement('canvas');
    qrcode.canvas_qr2.id = "qr-canvas";
    qrcode.qrcontext2 = qrcode.canvas_qr2.getContext('2d');
    qrcode.canvas_qr2.width = qrcode.video.videoWidth;
    qrcode.canvas_qr2.height = qrcode.video.videoHeight;
    setTimeout(qrcode.captureToCanvas, 500);
}
        
qrcode.vidError = function(error)
{
    qrcode.gUM=false;
    return;
}

qrcode.captureToCanvas = function()
{
    if(qrcode.gUM)
    {
        try{
            if(qrcode.video.videoWidth == 0)
            {
                setTimeout(qrcode.captureToCanvas, 500);
                return;
            }
            else
            {
                qrcode.canvas_qr2.width = qrcode.video.videoWidth;
                qrcode.canvas_qr2.height = qrcode.video.videoHeight;
            }
            qrcode.qrcontext2.drawImage(qrcode.video,0,0);
            try{
                qrcode.decode();
            }
            catch(e){       
                console.log(e);
                setTimeout(qrcode.captureToCanvas, 500);
            };
        }
        catch(e){       
                console.log(e);
                setTimeout(qrcode.captureToCanvas, 500);
        };
    }
}

qrcode.setWebcam = function(videoId)
{
    var n=navigator;
    qrcode.video=document.getElementById(videoId);

    var options = true;
    if(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)
    {
        try{
            navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
              devices.forEach(function(device) {
                console.log("deb1");
                if (device.kind === 'videoinput') {
                  if(device.label.toLowerCase().search("back") >-1)
                    options=[{'sourceId': device.deviceId}] ;
                }
                console.log(device.kind + ": " + device.label +
                            " id = " + device.deviceId);
              });
            })
            
        }
        catch(e)
        {
            console.log(e);
        }
    }
    else{
        console.log("no navigator.mediaDevices.enumerateDevices" );
    }
    
    if(n.getUserMedia)
        n.getUserMedia({video: options, audio: false}, qrcode.vidSuccess, qrcode.vidError);
    else
    if(n.webkitGetUserMedia)
    {
        qrcode.webkit=true;
        n.webkitGetUserMedia({video:options, audio: false}, qrcode.vidSuccess, qrcode.vidError);
    }
    else
    if(n.mozGetUserMedia)
    {
        qrcode.moz=true;
        n.mozGetUserMedia({video: options, audio: false}, qrcode.vidSuccess, qrcode.vidError);
    }
}

qrcode.decode = function(src){
    
    if(arguments.length==0)
    {
        if(qrcode.canvas_qr2)
        {
            var canvas_qr = qrcode.canvas_qr2;
            var context = qrcode.qrcontext2;
        }	
        else
        {
            var canvas_qr = document.getElementById("qr-canvas");
            var context = canvas_qr.getContext('2d');
        }
        qrcode.width = canvas_qr.width;
        qrcode.height = canvas_qr.height;
        qrcode.imagedata = context.getImageData(0, 0, qrcode.width, qrcode.height);
        qrcode.result = qrcode.process(context);
        if(qrcode.callback!=null)
            qrcode.callback(qrcode.result);
        return qrcode.result;
    }
    else
    {
        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload=function(){
            //var canvas_qr = document.getElementById("qr-canvas");
            var canvas_out = document.getElementById("out-canvas");
            if(canvas_out!=null)
            {
                var outctx = canvas_out.getContext('2d');
                outctx.clearRect(0, 0, 320, 240);
                outctx.drawImage(image, 0, 0, 320, 240);
            }

            var canvas_qr = document.createElement('canvas');
            var context = canvas_qr.getContext('2d');
            var nheight = image.height;
            var nwidth = image.width;
            if(image.width*image.height>qrcode.maxImgSize)
            {
                var ir = image.width / image.height;
                nheight = Math.sqrt(qrcode.maxImgSize/ir);
                nwidth=ir*nheight;
            }

            canvas_qr.width = nwidth;
            canvas_qr.height = nheight;
            
            context.drawImage(image, 0, 0, canvas_qr.width, canvas_qr.height );
            qrcode.width = canvas_qr.width;
            qrcode.height = canvas_qr.height;
            try{
                qrcode.imagedata = context.getImageData(0, 0, canvas_qr.width, canvas_qr.height);
            }catch(e){
                qrcode.result = Error("Cross domain image reading not supported in your browser! Save it to your computer then drag and drop the file!");
                if(qrcode.callback!=null)
                    qrcode.callback(qrcode.result);
                return;
            }
            
            try
            {
                qrcode.result = qrcode.process(context);
            }
            catch(e)
            {
                console.log(e);
                qrcode.result = Error("error decoding QR Code");
            }
            if(qrcode.callback!=null)
                qrcode.callback(qrcode.result);
        }
        image.onerror = function ()
        {
            if(qrcode.callback!=null) 
                qrcode.callback(Error("Failed to load the image"));
        }
        image.src = src;
    }
}

qrcode.isUrl = function(s)
{
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
}

qrcode.decode_url = function (s)
{
  var escaped = "";
  try{
    escaped = escape( s );
  }
  catch(e)
  {
    console.log(e);
    escaped = s;
  }
  var ret = "";
  try{
    ret = decodeURIComponent( escaped );
  }
  catch(e)
  {
    console.log(e);
    ret = escaped;
  }
  return ret;
}

qrcode.decode_utf8 = function ( s )
{
    if(qrcode.isUrl(s))
        return qrcode.decode_url(s);
    else
        return s;
}

qrcode.process = function(ctx){
    
    var start = new Date().getTime();

    var image = qrcode.grayScaleToBitmap(qrcode.grayscale());
    //var image = qrcode.binarize(128);
    
    if(qrcode.debug)
    {
        for (var y = 0; y < qrcode.height; y++)
        {
            for (var x = 0; x < qrcode.width; x++)
            {
                var point = (x * 4) + (y * qrcode.width * 4);
                qrcode.imagedata.data[point] = image[x+y*qrcode.width]?0:0;
                qrcode.imagedata.data[point+1] = image[x+y*qrcode.width]?0:0;
                qrcode.imagedata.data[point+2] = image[x+y*qrcode.width]?255:0;
            }
        }
        ctx.putImageData(qrcode.imagedata, 0, 0);
    }
    
    //var finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);
    
    var detector = new Detector(image);

    var qRCodeMatrix = detector.detect();
    
    if(qrcode.debug)
    {
        for (var y = 0; y < qRCodeMatrix.bits.Height; y++)
        {
            for (var x = 0; x < qRCodeMatrix.bits.Width; x++)
            {
                var point = (x * 4*2) + (y*2 * qrcode.width * 4);
                qrcode.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                qrcode.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
                qrcode.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
            }
        }
        ctx.putImageData(qrcode.imagedata, 0, 0);
    }
    
    
    var reader = Decoder.decode(qRCodeMatrix.bits);
    var data = reader.DataByte;
    var str="";
    for(var i=0;i<data.length;i++)
    {
        for(var j=0;j<data[i].length;j++)
            str+=String.fromCharCode(data[i][j]);
    }
    
    var end = new Date().getTime();
    var time = end - start;
    console.log(time);
    
    return qrcode.decode_utf8(str);
    //alert("Time:" + time + " Code: "+str);
}

qrcode.getPixel = function(x,y){
    if (qrcode.width < x) {
        throw "point error";
    }
    if (qrcode.height < y) {
        throw "point error";
    }
    var point = (x * 4) + (y * qrcode.width * 4);
    var p = (qrcode.imagedata.data[point]*33 + qrcode.imagedata.data[point + 1]*34 + qrcode.imagedata.data[point + 2]*33)/100;
    return p;
}

qrcode.binarize = function(th){
    var ret = new Array(qrcode.width*qrcode.height);
    for (var y = 0; y < qrcode.height; y++)
    {
        for (var x = 0; x < qrcode.width; x++)
        {
            var gray = qrcode.getPixel(x, y);
            
            ret[x+y*qrcode.width] = gray<=th?true:false;
        }
    }
    return ret;
}

qrcode.getMiddleBrightnessPerArea=function(image)
{
    var numSqrtArea = 4;
    //obtain middle brightness((min + max) / 2) per area
    var areaWidth = Math.floor(qrcode.width / numSqrtArea);
    var areaHeight = Math.floor(qrcode.height / numSqrtArea);
    var minmax = new Array(numSqrtArea);
    for (var i = 0; i < numSqrtArea; i++)
    {
        minmax[i] = new Array(numSqrtArea);
        for (var i2 = 0; i2 < numSqrtArea; i2++)
        {
            minmax[i][i2] = new Array(0,0);
        }
    }
    for (var ay = 0; ay < numSqrtArea; ay++)
    {
        for (var ax = 0; ax < numSqrtArea; ax++)
        {
            minmax[ax][ay][0] = 0xFF;
            for (var dy = 0; dy < areaHeight; dy++)
            {
                for (var dx = 0; dx < areaWidth; dx++)
                {
                    var target = image[areaWidth * ax + dx+(areaHeight * ay + dy)*qrcode.width];
                    if (target < minmax[ax][ay][0])
                        minmax[ax][ay][0] = target;
                    if (target > minmax[ax][ay][1])
                        minmax[ax][ay][1] = target;
                }
            }
            //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
        }
    }
    var middle = new Array(numSqrtArea);
    for (var i3 = 0; i3 < numSqrtArea; i3++)
    {
        middle[i3] = new Array(numSqrtArea);
    }
    for (var ay = 0; ay < numSqrtArea; ay++)
    {
        for (var ax = 0; ax < numSqrtArea; ax++)
        {
            middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
            //Console.out.print(middle[ax][ay] + ",");
        }
        //Console.out.println("");
    }
    //Console.out.println("");
    
    return middle;
}

qrcode.grayScaleToBitmap=function(grayScale)
{
    var middle = qrcode.getMiddleBrightnessPerArea(grayScale);
    var sqrtNumArea = middle.length;
    var areaWidth = Math.floor(qrcode.width / sqrtNumArea);
    var areaHeight = Math.floor(qrcode.height / sqrtNumArea);

    var buff = new ArrayBuffer(qrcode.width*qrcode.height);
    var bitmap = new Uint8Array(buff);

    //var bitmap = new Array(qrcode.height*qrcode.width);
    
    for (var ay = 0; ay < sqrtNumArea; ay++)
    {
        for (var ax = 0; ax < sqrtNumArea; ax++)
        {
            for (var dy = 0; dy < areaHeight; dy++)
            {
                for (var dx = 0; dx < areaWidth; dx++)
                {
                    bitmap[areaWidth * ax + dx+ (areaHeight * ay + dy)*qrcode.width] = (grayScale[areaWidth * ax + dx+ (areaHeight * ay + dy)*qrcode.width] < middle[ax][ay])?true:false;
                }
            }
        }
    }
    return bitmap;
}

qrcode.grayscale = function()
{
    var buff = new ArrayBuffer(qrcode.width*qrcode.height);
    var ret = new Uint8Array(buff);
    //var ret = new Array(qrcode.width*qrcode.height);
    
    for (var y = 0; y < qrcode.height; y++)
    {
        for (var x = 0; x < qrcode.width; x++)
        {
            var gray = qrcode.getPixel(x, y);
            
            ret[x+y*qrcode.width] = gray;
        }
    }
    return ret;
}

function URShift( number,  bits)
{
    if (number >= 0)
        return number >> bits;
    else
        return (number >> bits) + (2 << ~bits);
}


$(document).ready(function() {
    var info = $('#info');
    var result = $('#result');
    qrcode.callback = function(res) {
      if (res == 'error decoding QR Code') {
        result.text('QRコードの解析に失敗');
      } else if (isURL(res)) {
        result.html('<a target="_blank" href="'+res+'">' + res + '</a>');
      } else {
        result.text(res);
      }
    };
    function binarization(canvas, blackBorder) {
      var ctx = canvas.getContext("2d");
      var src = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var dst = ctx.createImageData(canvas.width, canvas.height);    
      for (var i = 0; i < src.data.length; i += 4) {
        var v = src.data[i] + src.data[i+1] + src.data[i+2];
        var c;
        if (v <= blackBorder * 3) {
          c = 0;
        } else {
          c = 255;
        }
        dst.data[i] = c;
        dst.data[i+1] = c;
        dst.data[i+2] = c;
        dst.data[i+3] = src.data[i+3];
      }
      ctx.putImageData(dst, 0, 0);
    }
    function isURL(str) {
      if (str.match(/https?/)) {
        return true;
      }
      return false;
    }
    function loadImage(fileID) {
      var fileList = document.getElementById(fileID).files;
      var reader = new FileReader();
      file = fileList[0];
      if (file.type == 'image/jpeg' ||
        file.type == 'image/png'){
        reader.readAsDataURL(file, "utf-8");
        info.text('ファイル名 ' + file.name + ' を読み込み中');
        reader.onload = (function(theFile) {
          return function(e) {
          info.text('ファイル名 ' + file.name + ' のQRコードを解析中');
          var data = e.target.result;
          var img = new Image();
          img.src = data;
          img.onload = function() {
            var canvas = document.getElementById('qr-canvas');
            var limitSize = 400;
            var resizedWidth = img.width;
            var resizedHeight = img.height;
            if (resizedWidth > limitSize || resizedHeight > limitSize) {
              var s;
              if (resizedWidth > resizedHeight) {
                s = limitSize / resizedWidth;
              } else {
                s = limitSize / resizedHeight;
              }
              resizedWidth *= s;
              resizedHeight *= s;
            }
            canvas.width = limitSize;
            canvas.height = limitSize;
            if (canvas.style.width > canvas.style.height) {
              canvas.style.width = resizedWidth;
              canvas.style.height = resizedHeight;
            } else {
              canvas.style.width = resizedWidth;
              canvas.style.height = resizedHeight;
            }
            var mpImg = new MegaPixImage(img);
            mpImg.render(canvas, { width: canvas.width, height: canvas.height });
            binarization(canvas, 110);
            var resized_data = canvas.toDataURL("image/png");
            qrcode.decode(resized_data);
            info.text('ファイル名 ' + file.name + ' のQRコードを解析完了');
            };
          };
        })(file);
      } else {
        alert('JPEGかPNGファイルをアップして下さい');
      }
    }
    $('#file').change(function(e) {
      loadImage('file');
    });
  });
  