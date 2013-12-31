/**
 * jquery.realAutoComplete.js
 * auto by Chen Bo
 */
(function ($){
	$.fn.RealAutoComplete = function (opts){
		$.each(this, function (i, v){
			var input = v;
			new auto_complete(input,opts);
		});
	};
	var auto_complete = function (el, opts){
		var that = this;
		if (typeof(opts) != "object"){
			opts = {};
		}
		that.options = $.extend(false, auto_complete.DEFAULT_OPTS, opts);
		if (typeof(el.jquery) == "undefined"){
			el = $(el);
		}
		that.data = that.options.data;	//数据
		that.input = el;	//input输入框
		that.build();	//生成ul框
		that.input.keyup(function (e) {that.keyupHandler(e);})	//文本框内容改变时
			.keydown(function (e) {that.keydownHandler(e);})	//当按下enter、up、down键时
			.dblclick(function () {that.reload();})	//双击文本框时
			.blur(function () {	//文本框失去焦点时
				$(document).one('click', function(){that.listHide();});
			});
	};
	auto_complete.options = {};
	//默认配置
	auto_complete.DEFAULT_OPTS = {
		dataType : 'json'	//网络得到数据的格式
		,url :'local'	//local表示本地数据
		,data:['one', 'two', 'three']	//表示本地全部数据
		,matchModel : 'pre'	//匹配模式，pre(开头匹配), every(包含匹配)
		,completeKey: 'right' //指定键将选中内容填写到文本框中, 分别为：enter、left、right
		,maxNum : 10 //列表最长长度,当数据来自网络时，js并不控制，而只是将这个信息传递给对方。
		,ajaxDataType : 'post'//ajax数据方式
	};
	auto_complete.prototype = {
		getData : function (){	//得到数据
			var b = this.input.val();
			if (typeof(b) != "string" || b == ''){
				return [];
			}
			var t = this;
			var returnData = [];
			var tempData;
			if (this.options.url == 'local'){
				tempData = this.data;
				$.each(tempData, function (i, v){
					if (returnData.length >= t.options.maxNum){
						return false;
					}
					if (t.options.matchModel == 'pre'){
						var tmpStr = v.substr(0, b.length);
						if (tmpStr == b){
							returnData.push(v);
						}
					}else if (t.options.matchModel == 'every'){
						if (v.search(b) >= 0){
							returnData.push(v);
						}
					}
				});
			}else{
				tempData = [];
				$.ajax({
					type:t.options.ajaxDataType
					,data : 'filter='+t.input.val()+'&matchModel='+t.options.matchModel+'&maxNum='+t.options.maxNum
					,dataType:t.options.dataType
					,url :t.options.url
					,timeout : 5000
					,async :false
					,success : function (data){
						$.each(data, function (k, v){
							tempData.push(v);
						});
					}
				});
				returnData = tempData;
			}
			return returnData;
		}
		,build: function (){
			var dataListView  = this.dataListView = $('<ul class="rac_competelist" style="position:absolute; z-index:9999; display:none;"></ul>');
			var inputPos = this.input.offset();
			var inputHeight = this.input.outerHeight();
			this.input.after(
				dataListView.width( this.input.width())
				.css({'left':inputPos.left, 'top': inputPos.top + inputHeight})
			);
			return this;
		}
		,reload : function (){
			var d = this.getData();
			if (typeof(d) != "object" || d.length == 0){
				return this.listHide();
			}
			var that = this;
			that.release();
			$.each(d, function (i,v){
				that.dataListView.prepend($('<li class="rac_nomal"><a>' + v + '</a></li>'));
			});
			return that.selectItem(that.dataListView.find("li:first"))
				.addMouseEventListItem()
				.listShow();
		}
		,listShow : function (){
			if (this.dataListView.css('display') == 'none'){
				this.dataListView.css('display', 'block');
			}
			return this;
		}
		,listHide : function (){
			if (this.dataListView.css('display') != 'none'){
				this.dataListView.css('display', 'none');
			}
			return this;
		}
		,keydownHandler: function(event) {
			switch (event.keyCode){
				case 13://enter
					if (this.options.completeKey == 'enter'){
						this.completeInput();
						event.stopPropagation();
					}
					break;
				case 16: // shift
				case 17: // ctrl
				case 37: // left
					if (this.options.completeKey == 'left'){
						this.completeInput();
						event.stopPropagation();
					}
					break;
				case 39: // right
					if (this.options.completeKey == 'right'){
						this.completeInput();
						event.stopPropagation();
					}
					break;
				case 38://up
					this.moveSelected('up');
					event.stopPropagation();
					break;
				case 40://down
					this.moveSelected('down');
					event.stopPropagation();
					break;
				case 27:	//esc
					this.listHide();
					event.stopPropagation();
					break;
				default :
			}
			return this;
		}
		,keyupHandler: function(event) {
			switch (event.keyCode){
				case 13://enter
				case 16: // shift
				case 17: // ctrl
				case 37: // left
				case 38://up
				case 39: // right
				case 40://down
					break;
				case 27:	//esc
					break;
				default :
					this.reload();
			}
			return this;
		}
		,selectItem : function(item){//改变选中项的背景色
			if (item.jquery == 'undefined'){
				item = $(item);
			}
			this.dataListView.find("li.rac_selected").removeClass('rac_selected');
			$(item).addClass('rac_selected');
			return this;
		}
		,completeInput : function (){
			var inputText = this.dataListView.find("li.rac_selected a").text();
			this.input.val(inputText);
			return this.release();
		}
		,moveSelected: function (d){
			var newItem ;
			if (d == 'up'){
				newItem = this.dataListView.find("li.rac_selected").prev();
				//按上下键时，让选中项循环
				if (newItem.length <= 0){
					newItem = this.dataListView.find("li.rac_nomal").last();
				}
			}else if (d == 'down'){
				newItem = this.dataListView.find("li.rac_selected").next();
				if (newItem.length <= 0){
					newItem = this.dataListView.find("li.rac_nomal").first();
				}
			}
			return this.selectItem(newItem)
		}
		,addMouseEventListItem: function (){	//添加鼠标事件
			var that = this;
			var listItem = this.dataListView.find("li.rac_nomal");
			listItem.mouseover(function(){
				that.selectItem(this);
			})
			.click(function(){
				that.completeInput();
			});
			return this;
		}
		,release : function (){//清空ul内的所有项
			this.dataListView.html('');
			return this.listHide();
		}
	}
})(jQuery);
