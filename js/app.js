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