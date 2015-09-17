/**
 * API: moduleEditor
 */
module.exports = function( data, callback, main, socket ){
	delete(require.cache[require('path').resolve(__filename)]);
	var it79 = require('iterate79');
	var path = require('path');
	var php = require('phpjs');
	var fs = require('fs');
	var rtn = {},
		px2proj;

	new Promise(function(rlv){rlv();})
		.then(function(){ return new Promise(function(rlv, rjt){
			// プロジェクト情報を取得する
			main.px2dtLDA.getProject(
				data.projectIdx,
				function( projectInfo ){
					rtn.projectInfo = projectInfo;
					rlv();
				}
			);
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// px2projオブジェクトを生成する
			main.getPx2Proj( rtn.projectInfo, function(_px2proj){
				px2proj = _px2proj;
				rlv();
			} );
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// Px2のコンフィグを取得する
			px2proj.get_config(function(config){
				// console.log('message: '+ JSON.stringify(conf));
				rtn.config = config;

				if( !rtn.config ){
					rtn.config = false;
					rjt();
					return;
				}
				rlv();
			});
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// パッケージ情報を取得
			data.moduleId.match( new RegExp('^([\\s\\S]*)\\:([\\s\\S]*)\\/([\\s\\S]*)$') );
			rtn.packageId = RegExp.$1;
			rtn.categoryId = RegExp.$2;
			rtn.moduleId = RegExp.$3;
			rtn.packageId = data.packageId;
			try {
				rtn.packageRealpath = rtn.config.plugins.px2dt.paths_module_template[data.packageId];
				rtn.packageRealpath = path.resolve( php.dirname( rtn.projectInfo.path + '/' + rtn.projectInfo.entry_script ), rtn.packageRealpath )+'/';
			} catch (e) {
				rtn.packageId = false;
				rtn.packageRealpath = false;
				rjt();
				return;
			}
			try {
				rtn.packageInfo = require( rtn.packageRealpath + 'info.json' );
			} catch (e) {
				rtn.packageInfo = false;
			}
			rtn.moduleRealpath = path.resolve( rtn.packageRealpath, rtn.categoryId, rtn.moduleId );
			rlv();
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			if( data.fnc == 'loadSrc' ){
				// モジュールコードを取得
				getModuleCode( rtn.moduleRealpath, function(src){
					rtn.src = src;
					rtn.result = true;
					rlv();
				} );

			}else if( data.fnc == 'saveSrc' ){
				// モジュールコードを保存
				var filepath = path.resolve(rtn.moduleRealpath, data.filename);
				fs.writeFile( filepath, data.src, function(err){
					rtn.result = !err;
					rlv();
				} );

			}else if( data.fnc == 'generatePreviewHTML' ){
				// プレビューHTMLを生成する
				buildPreviewHtml(rtn.moduleRealpath, function(html){
					rtn.html = html;
					rlv();
				});

			}else{
				rjt();return;
			}
		}); })
		.then(function(){ return new Promise(function(rlv, rjt){
			// 返却
			callback(rtn);
			rlv();
		}); })
	;

	/**
	 * モジュールコードを取得する
	 * @param  {String} moduleRealpath Realpath of Module Definition.
	 * @param  {Function} callback callback function.
	 * @return {Object}            this
	 */
	function getModuleCode( moduleRealpath, callback ){
		var rtn = {};
		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				rtn.src = {};
				function loadFile( filename ){
					var result = {};
					var filepath = path.resolve(moduleRealpath, filename);
					if( !fs.existsSync(filepath) || !fs.statSync(filepath).isFile() ){
						return false;
					}
					result.filename = filename;
					result.src = fs.readFileSync( filepath ).toString();
					return result;
				}
				rtn.src.infoJson = loadFile('info.json');
				rtn.src.html = loadFile('template.html');
				if( !rtn.src.html ){
					rtn.src.html = loadFile('template.html.twig');
				}
				rtn.src.css = loadFile('module.css.scss');
				if( !rtn.src.css ){
					rtn.src.css = loadFile('module.css');
				}
				rtn.src.js = loadFile('module.js');

				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// 返却
				callback(rtn.src);
				rlv();
			}); })
		;
		return;
	}


	/**
	 * プレビューHTMLを構成する
	 * @param  {Function} callback callback function.
	 * @return {Object}            this
	 */
	function buildPreviewHtml( moduleRealpath, callback ){
		var html = '',
			loaderHtml = '',
			moduleHtml = '';

		new Promise(function(rlv){rlv();})
			.then(function(){ return new Promise(function(rlv, rjt){
				getModuleCode( moduleRealpath, function(code){
					moduleHtml = code.html.src;
					rlv();
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				px2proj.query('/?PX=px2dthelper.document_modules.load', {
					"complete": function(loader, code){
						loaderHtml = loader;
						rlv();
					}
				});
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				html += '<!DOCTYPE html>';
				html += '<html>';
				html += '<head>';
				html += '<style>';
				html += 'body{background:#fff;}';
				html += '</style>';
				html += loaderHtml;
				html += '</head>';
				html += '<body>';
				html += '<div class="contents">';
				html += '<p style="background:#ddd; text-align:center;">(element before)</p>';
				html += moduleHtml;
				html += '<p style="background:#ddd; text-align:center;">(element after)</p>';
				html += '</div>';
				html += '</body>';
				html += '</html>';
				rlv();
			}); })
			.then(function(){ return new Promise(function(rlv, rjt){
				// 返却
				callback(html);
				rlv();
			}); })
		;
		return;
	}

	return;
}