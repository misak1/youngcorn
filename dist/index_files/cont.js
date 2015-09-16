(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.cont = new (function(){
	var _this = this;

	this.init = function(){
		/**
		 * initialize
		 */
		main.init(function(){
			main.it79.fnc({}, [
				function(it1, data){
					console.log('setup env...');
					setTimeout(function(){
						it1.next(data);
					}, 10);
				},
				function(it1, data){
					// プロジェクト一覧を取得
					main.socket.send('getProjectAll', {}, function(projects){
						data.projects = projects;
						it1.next(data);
					});
				} ,
				function(it1, data){
					// プロジェクト一覧を描画
					var tpl = $('#template-projectList').html();
					var $ul = $('<div class="list-group">');
					main.it79.ary(
						data.projects,
						function(it2, row, idx){
							// console.log(row);
							var html =
								twig({data: tpl})
								.render({projectIdx: idx, data: row})
							;
							$ul.append(html);
							it2.next();
						},
						function(){
							$('.cont_project_list').html('').append($ul);
							it1.next();
						}
					);
					console.log(data);
					it1.next(data);
				} ,
				function(it1, data){
					console.log('Started!');
				}
			]);
		});
	}

	this.createNewProject = function(form, modal){
		// プロジェクトを追加
		var value = {
			name: $(form).find('[name=name]').val(),
			path: $(form).find('[name=path]').val(),
			entry_script: $(form).find('[name=entry_script]').val()
		};
		main.socket.send('createNewProject', value, function(result){
			// alert(result);
			$(modal).modal('hide');
			_this.init();
		});
		return this;
	}

	this.removeProject = function( projectIdx ){
		if( !confirm('本当に削除してよろしいですか？') ){
			return this;
		}
		main.socket.send('removeProject', {'projectIdx': projectIdx}, function(result){
			// alert(result);
			_this.init();
		});
		return this;
	}

})();

},{}]},{},[1])