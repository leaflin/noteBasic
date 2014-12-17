function getItem(id){
	
	$.mobile.notesdb.transaction(
	function(t){t.executeSql("SELECT * FROM my WHERE id=?",[id],function(t,result){
		var row = result.rows.item(0)
		//result.rows.item(1).username 取得id=1 的username的欄位值
		//result.rows.length       取得筆數長度
			$("#display h1").text(row.title);
			$("#showdetail").html("<p>" + row.details + "</p>");

		})
	}
	)}