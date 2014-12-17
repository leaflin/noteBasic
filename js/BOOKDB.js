// JavaScript Document
$(document).bind("mobileinit", function(){
    $.mobile.notesdb = openDatabase("noteBasic", "1.0", "noteBasic", 2*1024*1024);
    $.mobile.notesdb.transaction(function (t) {
	console.log("開始交易指令");
	t.executeSql("CREATE TABLE IF NOT EXISTS noteTB (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, details TEXT NOT NULL, listCustom TEXT NOT NULL);");			
//t.executeSql('INSERT INTO BookNewn(title,details,listCustom) VALUES (?,?,?);',["AA", "AA", "已加入"],null,null);
		//t.executeSql('DROP TABLE BookNew'); 
		if (isLoadData==null){  // 第一次載入預設的資料 
			localStorage.setItem("loading",true); // 第二次以後不載入預設的料	
  			// 以 js/FoodData.js 建立資料庫
			$.each(session, function(InfoIndex, Info) { 
				var title = Info["title"];
				var details = Info["details"];
				var listCustom = Info["listCustom"];
t.executeSql('INSERT INTO noteTB(title,details,listCustom) VALUES (?,?,?);',[title, details, listCustom]);

				

		    })
			//食物json引入 並建立資料庫
		}
   
    },
	
					function(tx){
					console.log("資料庫失敗");
					},
					function(tx){
					console.log("資料庫成功");
					}

	
	)

});
$(function(){
	$("#noteBook").bind("pageshow", getTitles);      // 將 title 欄位資料加入 ListView 清單
	$("#btn_insert").bind("click",insertItem);
	$("#delBtn").bind("click",delItem);
	$("#bulletsCall").bind("click",bullets);
	$("#update").bind("click",updateItem);
	$("#btnPhoto").bind("click", takePhoto); //拍相片
	bulletsShow();
	bullets();
	totalData();
	});

	
var isLoadData;
isLoadData=localStorage.getItem("loading");//下次新增資料表欄位時 更換getItem(key)
var note={limit:-1};  // -1 載入全部資料

function getTitles() {
	var listTitle = $("#recent");
	var items = [];
	$.mobile.notesdb.transaction(function(t) {
		t.executeSql("SELECT id, title,details,listCustom FROM noteTB ORDER BY id DESC LIMIT ?", [note.limit], function(t, result) {			    
				var i, len = result.rows.length,row;
				//$(".list").each(function(){})
				if (len > 0 ) {
					    
						for (i = 0; i < len; i += 1) {
							var row = result.rows.item(i);
							var a=result.rows.item(i).title;
							//if(a.length>1){//加上10字元substr(0,10)
							items.push("<li><a href='#display' data-trnote='" + row.id + "'>"+a.substr(0,20)+"..."+"</a></li>");
							//}			
						}
					
					listTitle.html(items.join('\n'));
					listTitle.listview("refresh");
					// 設定按下 ListView 清單的事件,將 data-trnote 屬性值當作參數傳遞給 getItem()函式，並切換至 display 頁面			
					$("a",listTitle).bind("click", function(e) {					
						getItem($(this).attr("data-trnote"));
					});
					
			    }
		 })	 // end of t.executeSql
	}); // end of $.mobile.notesdb
}

function getItem(id) {
	$.mobile.notesdb.transaction(function(t) {		
		t.executeSql("SELECT * FROM noteTB WHERE id = ?", [id], function(t, result) {
			var row = result.rows.item(0)
			$("#display h1").text(row.title);
			$("#showdetail").html("<p>"+row.details+"</p>");
			$("#delBtn,#bulletsCall,#update").attr("data-trnote",id);
            var getID=result.rows.item(0).id;
			console.log('得到'+getID);
			
			console.log("<a href='#display' data-trnote='" + row.id + "'>");//取得id後 按加入暫存清單傳送id
			$("#showdetail2").val(row.details);
			
			
		})
	})
}

function delItem() {  // 刪除指定 id 的資料
		var a = $(this).attr("data-trnote");
		$.mobile.notesdb.transaction(function(t) {
			t.executeSql("DELETE FROM noteTB WHERE id = ?",[a],
			$.mobile.changePage("#noteBook", "slide", false, true)
			,null);
		});
		totalData();

}

function insertItem(e){
	var title=$("#title").val();
	var details=$("#details").val();
	if(title==""){
		console.log("必須輸入標題");
		alert("必須輸入標題!");
		$("#title").focus();
		}else if(details==""){
		console.log("必須輸入內容");
		alert("必須輸入內容!");
		$("#details").focus();
			}else{
				<!---->
		    $.mobile.notesdb.transaction(function(t) {
			t.executeSql('INSERT into noteTB(title, details,listCustom) VALUES (?,?,?);',
			[title, details, "未加入"],
		function() {
				$.mobile.changePage("#noteBook", "slide", false, true);	//換頁並清除輸入欄位
				$("#title").val("");
				$("#details").val("");
				totalData();
			}, 
			null
			);
	                });
				 }
	}
//計算總比數	
function totalData(){
	
	$.mobile.notesdb.transaction(function(tx){
		tx.executeSql('SELECT id, title, details, listCustom  FROM noteTB',[],function(tx,result)
		{
		for(var i=0; i<result.rows.length;i++){
			console.log("總筆數"+result.rows.length);
			$("#entries").text(result.rows.length);
			};
		
		});
		});
	};

	
function bullets(){
	
	var getid=$(this).attr("data-trnote");
	
	
	$.mobile.notesdb.transaction(function(tx){
		tx.executeSql('SELECT listCustom FROM noteTB WHERE id = ?',[getid],
		function(t,result){
			//console.log(result.rows.item(0).id);
			var checkText=result.rows.item(0).listCustom//檢查項目
			console.log("查詢成功"+checkText)
//少個local儲存 和更正欄位值 已加入
			if(checkText=="未加入"){
				console.log("未加入，快加入暫存")
 				var a=confirm("確定加入暫存清單?")
				if(a==true){
				//更正listCustom欄位值=='已加入'
				//var reUpdate=row.listCustom
				tx.executeSql('UPDATE noteTB SET listCustom=? WHERE id=?',['已加入',getid],console.log("已成功更新"),console.log("更新失敗"));
				localStorage.setItem(getid,null);
			    $.mobile.changePage("#bullets", "slide", false, true);	
		    	//$("#showBulldata").append("<p>"+row.title+row.details+"</p>");//會消失
				//bulletsShow()
				
				}else if(a==false){console.log("不加入暫存")}
			 
			}else if(checkText=="已加入" )
			{
 				console.log("您已加入，不能在加入了")
			 	confirm("已加入了")
			}
		}
		
		
		)
		
		
		
		})
	
	
}

//編輯機制找不到id
function updateItem(){
	var txtEdit=$("#showdetail2").val();
	var getId=$(this).attr("data-trnote");
	console.log('給更改傳送id'+getId)

    $.mobile.notesdb.transaction(function(t){
		
		t.executeSql('UPDATE noteTB SET details=? WHERE id=?',[txtEdit,getId])
		
		//$.mobile.changePage("#noteBook", "flip", false, true),

		
		},
	console.log("更改失敗"),console.log("更改成功"))
	
	
}


function bulletsShow(){//load 暫存清單所有資料for 查欄位有無登記 or 直接調localStorage
		
		$.mobile.notesdb.transaction(function(t){
		t.executeSql("SELECT id,title,details,listCustom FROM noteTB", [],function(t,result){
		for(var i=0; i<result.rows.length; i++){
		console.log(result.rows.item(i).id+result.rows.item(i).listCustom)
		var checkBULL=result.rows.item(i).listCustom
		var checkTitle=result.rows.item(i).title
		if(checkBULL=="已加入"){
		$("#showBulldata").append(result.rows.item(i).id+checkBULL+checkTitle+"<br>")
		
		}
		}
		})
		})


}

function takePhoto() { //拍相片
	var tPhoto=$("#showPhoto"), prePhoto = $('#prePhoto');
	var fName=getNow();
	navigator.camera.getPicture(function(imageURI) { //拍照，傳回相片檔imageURI
		window.resolveLocalFileSystemURI(imageURI, function(fileEntry){
			window.requestFileSystem(LocalFileSystem.PERSISTENT,0, function(fileSystem){
				var direc = fileSystem.root.getDirectory("/mnt/sdcard/car/", {create: true},function( parent ){ //如果目錄不存在就建立
					fileEntry.copyTo(parent, fName+".jpg", function(){ //複製檔案
					}, onFileFail);
				},onFileFail);
			}, onFileFail); 
		},onFileFail);
		tPhoto.attr("src", imageURI); //顯示相片
		$('<img/>') //取得相片長寬
		 .attr('src', imageURI)                
		 .appendTo(prePhoto)                
		 .load(function() { 
			 if($(this).width() > $(this).height()) { //相片橫放
					tPhoto.attr("width", "300");
					tPhoto.attr("height", "225");
			 } else { //相片直放
					tPhoto.attr("width", "225");
					tPhoto.attr("height", "300");
			}
		 });
		 $.mobile.changePage("#photo", "fade", false, true);
	}, onFileFail, {quality: 100, destinationType: navigator.camera.DestinationType.FILE_URI }                    
	);  
}
