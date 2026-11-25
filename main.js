
var canvas, stage;
var builder;
var touchdev = false;
var scalerate = 1;

// イベント関数
var timer_func = new Function();	timer_func = null;
var click_func = new Function();	click_func = null;
var move_func = new Function();		move_func = null;
var release_func = new Function();	release_func = null;

// 表示位置
var view = {w:640,h:560};

// ハトクラス
var Hato = function(){
	this.stat = 0;
	this.x = 0;
	this.y = 0;
	this.cnt = 0;
	this.cnt_max = 0;
	this.run = 0;		// 逃げてるフラグ
	this.dir = 0;
	this.pat = 0;		// wait 0-5 eat 0-3 walk 0-23
	this.frame = 0;		// フレーム番号
	this.spd = 1;
	this.near = -1;		// 近くにいるハト番号
	this.prev=0;		// 描画順前
	this.next=0;		// 描画順次
	this.eat_stat = 0;	// 食べてる時の状態
	this.fn = 0;		// エサ番号
}
var pmax = 30;					// 鳩の最大数
var hato = new Array();			// ハト情報
var first = 0;					// 最初に描画する鳩
var spr = new Array();			// ハトスプライト
var sprshadow = new Array();	// ハトスプライト
var lookie = 0;					// 新人ハト

var logo;			// GAMEDESIGNロゴスプライト
var lstat="up";	// ロゴ状態

// えさクラス
var Food = function(){
	this.stat = 0;	// 0.なし 1.空中移動中 2.地面
	this.x = 0;
	this.y = 0;
	this.ax = 0;	// 加算
	this.ay = 0;
	this.cnt = 0;	// カウンタ
	this.pea = 0;	// 豆粒の数
}
var fmax = 20;				// えさの最大数
var food = new Array();		// えさ情報
var food_num = 0;			// 現在のエサ番号
var sprfood = new Array();	// えさスプライト
var sprair = new Array();	// 空中移動中のえさスプライト
var aircntmax = 10;			// 移動カウント最大値
var gstart = -20;
var gadd = 5;

// 8方向の加算値
var xadd = new Array();
var yadd = new Array();
var dirpat = [2,3,3,2,1,0,0,1];		// 方向に対応したパターン
var dirscale = [1,1,-1,-1,-1,-1,1,1];	// 方向に対応した左右対称
var eatpat = [0,1,2,3,2,2,1,1,0];		// ハトがついばむ動作


// 起動
window.addEventListener("load", init);
function init() {
	var i,j,c,n;

	canvas = document.getElementById("myCanvas");
	stage = new createjs.Stage(canvas);
	
	if(createjs.Touch.isSupported() == true) {
	   createjs.Touch.enable(stage);
	   touchdev = true;
	}
//	   touchdev = true;
	// 内部サイズ
	stage.canvas.width = view.w;
	stage.canvas.height = view.h;
	// 表示サイズ
	var iw = window.innerWidth;
	var ih = window.innerHeight-100;
	scalerate = 1;
	if( touchdev ) scalerate = Math.min(iw/view.w, ih/view.h);
    canvas.style.width = view.w*scalerate+'px';
    canvas.style.height = view.h*scalerate+'px';
	
	// 背景
	var bmp = new createjs.Bitmap("bg.png");
	stage.addChild(bmp);

	// 八方向
	var r = 2.1;
	for( i=0; i<8; i++ ){
		var k = 22.5 + i*45;
		xadd[i] = r * Math.cos(Math.PI*k/180);
		yadd[i] = r * Math.sin(Math.PI*k/180) * 230/325;
	}
	
	// ハト
	for( i=0; i<pmax; i++ ){
		hato[i] = new Hato();
		hato[i].exist = (i==0) ? true : false;
		hato[i].dir = Math.floor(Math.random()*8);
		hato[i].x = Math.floor(Math.random()*view.w);
		hato[i].y = Math.floor(Math.random()*view.h);
		hato[i].prev = i-1;
		hato[i].next = i+1;
		start_wait(i);
	}
	// エサ
	for( i=0; i<fmax; i++ ){
		food[i] = new Food();
	}

	// 影スプライト
	for( i=0; i<pmax; i++ ){
		sprshadow[i] = new hatomc();
		stage.addChild(sprshadow[i]);
		sprshadow[i].gotoAndStop(150);
	}
	// えさスプライト
	for( i=0; i<fmax; i++ ){
		sprfood[i] = new createjs.Container();
		stage.addChild(sprfood[i]);
		for( j=0; j<5; j++ ){
			var mame = new hatomc();
			mame.gotoAndStop(151);
			mame.x = j*10;
			mame.y = j*10;
			sprfood[i].addChild(mame);
		}
	}
	// 鳩スプライト
	for( i=0; i<pmax; i++ ){
		spr[i] = new hatomc();
		stage.addChild(spr[i]);
		spr[i].regX = 100;	// 反転の中心
		spr[i].regY = 100;
	}
	// 空中のえさスプライト
	for( i=0; i<fmax; i++ ){
		sprair[i] = new hatomc();
		sprair[i].gotoAndStop(152);
		stage.addChild(sprair[i]);
		sprair[i].visible = false;
	}
	// ロゴ
	logo = new hatomc();
	stage.addChild(logo);
	logo.gotoAndStop(153);
	logo.x = 8;
	logo.y = view.h+200;
	
	stage.addEventListener("stagemousedown", mouseDownListner );
	stage.addEventListener("stagemousemove", mouseMoveListner );
	stage.addEventListener("stagemouseup", mouseUpListner );
	createjs.Ticker.addEventListener("tick", onTick);
	createjs.Ticker.setFPS(60);
	
	click_func = mouse_click;
	move_func = mouse_move;
	timer_func = game_main;
}

////////////////////////////////////////////////////
// イベントリスナー群
////////////////////////////////////////////////////

function mouseDownListner(e) {
	if( click_func != null ){ click_func(e); }
	canvas.style.cursor="default";  // マウスカーソルの変更
}
function mouseMoveListner(e) {
	if( move_func != null ){ move_func(e); }
	canvas.style.cursor="default";  // マウスカーソルの変更
}
function mouseUpListner(e) {
	if( release_func != null ){ release_func(e); }
	canvas.style.cursor="default";  // マウスカーソルの変更
}
function onTick() {
	if( timer_func != null ){ timer_func(); }
}

////////////////////////////////////////////////////
// game
////////////////////////////////////////////////////

function game_main(){
	var i,j,a,b;
	for( i=0; i<pmax; i++ ){
		if( !hato[i].exist ) continue;
		switch(hato[i].stat){
		case 1: waiting(i); break;
		case 2: walking(i); break;
		case 3: eating(i); break;
		}
	}
	
	// 近すぎる警告
	for( i=0; i<pmax; i++ ) hato[i].near = -1;
	a = first;
	for( i=0; i<pmax; i++ ){
		b = hato[a].next;
		var f=true;
		if( !hato[a].exist ) f=false;
		if( !hato[b].exist ) f=false;
		if( hato[a].near>=0 ) f=false;
		if( Math.abs(hato[a].x-hato[b].x)>80 ) f=false;
		if( Math.abs(hato[a].y-hato[b].y)>80 ) f=false;
		if( f ){
			hato[a].near = b;
			hato[b].near = a;
		}
		a = b;
		if( hato[a].next>=pmax ) break;
	}
	
	// 描画プライオリティ(Y座標によってaとbを入れ替える)
	a = first;
	for( i=0; i<pmax; i++ ){
		b = hato[a].next;
		if( hato[a].y > hato[b].y ){
			var pre = hato[a].prev;
			var nex = hato[b].next;
			if( pre>=0 ){ hato[pre].next=b; }else{ first=b; }
			if( nex<pmax ) hato[nex].prev=a;
			hato[a].prev = b;
			hato[a].next = nex;
			hato[b].prev = pre;
			hato[b].next = a;
		}
		a = b;
		if( hato[a].next>=pmax ) break;
	}
	// 描画位置修正
	var yadd = -20;
	// 描画
	for( i=0; i<pmax; i++ ){
		sprshadow[i].visible = hato[i].exist;
		sprshadow[i].gotoAndStop(150);
		sprshadow[i].x = hato[i].x;
		sprshadow[i].y = hato[i].y + yadd;
	}
	a = first;
	for( i=0; i<pmax; i++ ){
		spr[i].gotoAndStop(hato[a].frame);
		spr[i].x = hato[a].x;
		spr[i].y = hato[a].y + yadd;
		spr[i].scaleX = dirscale[hato[a].dir];
		spr[i].visible = hato[a].exist;
		a = hato[a].next;
		if( a>=pmax ) break;
	}
	
	// エサのアクション
	for( i=0; i<fmax; i++ ){
		if( food[i].stat==1 ){
			move_food(i);
		}
	}
	// エサの描画
	for( i=0; i<fmax; i++ ){
		sprfood[i].visible = false;
		sprair[i].visible = false;
		if( food[i].stat==1 ){
			sprair[i].visible = true;
			sprair[i].x = food[i].x;
			sprair[i].y = food[i].y;
		}else if( food[i].stat==2 ){
			sprfood[i].visible = true;
			sprfood[i].x = food[i].x;
			sprfood[i].y = food[i].y;
		}
	}
	
	// ロゴ
	if( lstat=="up" ){
		logo.y--;
		if( logo.y<view.h-20 ) {
			lstat="stop";
		}
	}else if( lstat=="down" ){
		logo.y++;
		if( logo.y>view.h ) {
			lstat="out";
			location.href = "https://www.gamedesign.jp/";
		}
	}
	
	stage.update();
}

////////////////////////////////
// ハトのアクション
////////////////////////////////

function start_wait(n){
	hato[n].stat = 1;
	hato[n].cnt = 0;
	hato[n].cnt_max = 10+Math.random()*10;
	hato[n].run = 0;
	hato[n].pat = 0;
	var dir = hato[n].dir;
	hato[n].frame = dirpat[dir]*7;
}

function waiting(n){
	hato[n].cnt++;
	if( hato[n].cnt < hato[n].cnt_max ) return;
	hato[n].cnt = 0;
	hato[n].cnt_max = 20+Math.random()*20;
	var dir = hato[n].dir;
	hato[n].frame = dirpat[dir]*7 + 1 + Math.floor(Math.random()*5);
	

	// 方向を決めて、移動開始する
	if( Math.random()*2 < 1 ){
		// 餌がある場合は、一番近い餌に向かう
		var dir = turn_food( hato[n].x, hato[n].y );
		if( dir<0 ){
			// 餌が無い場合には、ゆるやかに中心に向かう
			dir = turn_gentle( view.w/2, view.h/2, hato[n].x, hato[n].y, hato[n].dir );
		}
		// 進行方向に他鳩がいる時はウエイトしなおし
		var b = hato[n].near;
		if( b>=0 ){
			if( is_front( hato[n].x, hato[n].y, dir, hato[b].x, hato[b].y )){
				hato[n].cnt = 0;
				return;
			}
		}
		start_walk( n, dir, 1 );
	}
}

function turn_food( px, py ){
	var ret = -1;
	var min = 99999;
	for( var i=0; i<fmax; i++ ){
		if( food[i].stat != 2 ) continue;
		var ax = food[i].x-px;
		var ay = food[i].y-py;
		var a = Math.abs(ax)+Math.abs(ay);
		if( a<10 ) continue;	// 近すぎる
		if( a>min ) continue;
		min = a;
		ret = get_dir(ax,ay);
	}
	return ret;
}

function start_walk( n, dir, spd ){
	
	hato[n].dir = dir;
	hato[n].spd = spd;
	hato[n].stat = 2;
	hato[n].cnt = 0;
	hato[n].cnt_max = 20+Math.random()*100;
	hato[n].frame = 48 + dirpat[dir]*25;
}

function walking(n){
	
	hato[n].cnt += hato[n].spd;
	
	// 近くに餌があったら食べる
	if( hato[n].run==0 ){
		var fn = can_eat( n );
		if( fn>=0 ){
			start_eat( n, fn );
			return;
		}
	}
	// ある程度歩いたら止まる
	if( hato[n].cnt >= hato[n].cnt_max ){
		start_wait( n );
		return;
	}

	// 近くに鳩がいたら止まる
	if( hato[n].run==0 && hato[n].near>=0 ){
		var b = hato[n].near;
		if( is_front( hato[n].x, hato[n].y, hato[n].dir, hato[b].x, hato[b].y )){
			start_wait( n );
			return;
		}
	}
	
	// 歩くパターン
	var dir = hato[n].dir;
	hato[n].frame = 48 + dirpat[dir]*25 + hato[n].cnt%24;
	// 座標移動
	hato[n].x += xadd[dir]*hato[n].spd;
	hato[n].y += yadd[dir]*hato[n].spd;
}

function can_eat( n ){
	var ret = -1;
	for( var i=0; i<fmax; i++ ){
		if( food[i].stat != 2 ) continue;
		var ax = food[i].x-hato[n].x;
		var ay = food[i].y-hato[n].y;
		var a = Math.abs(ax)+Math.abs(ay);
		if( a<30 ) continue;
		if( a>55 ) continue;
		if( Math.sqrt(ax*ax+ay*ay)>55 ) continue;
		ret = i;
	}
	return ret;
}

// 食べる
function start_eat( n, fn ){
	
	var dir = get_dir( food[fn].x-hato[n].x, food[fn].y-hato[n].y );
	hato[n].dir = dir;
	hato[n].stat = 3;
	hato[n].cnt = 0;
	hato[n].cnt_max = 5+Math.random()*30;
	hato[n].eat_stat = 0;
	hato[n].fn = fn;
	hato[n].frame = 28 + dirpat[dir]*5;
}

function eating( n ){
	
	hato[n].cnt++;
	if( hato[n].eat_stat==0 ){
		// ウエイト
		if( hato[n].cnt < hato[n].cnt_max ) return;
		hato[n].eat_stat = 1;
		hato[n].cnt = 0;
	}else{
		// 動作パターン変更
		hato[n].frame = 28 + dirpat[hato[n].dir]*5 + eatpat[hato[n].cnt];
		// 食べた瞬間に豆つぶを減らす
		if( hato[n].cnt==3 ){
			var fn = hato[n].fn;
			food[fn].pea--;
			if( food[fn].pea<=0 ){
				food[fn].stat = 0;
			}
			// 豆を少し移動させる
			for( i=0; i<5; i++ ){
				var mc = sprfood[fn].getChildAt(i);
				if( i>=food[fn].pea ) mc.visible = false;
				if( Math.random()*2<1 ) continue;
				mc.x += mc.ax/4;
				mc.y += mc.ay/4;
			}
			// 新人がエサを食べたら、新しいハトを出現させる
			if( n==lookie ) appear_hato();
		}
		// 動作終了後
		if( hato[n].cnt>=eatpat.length ){
			var fn = can_eat( n );
			if( fn>=0 ){
				start_eat( n, fn );
			}else{
				start_wait( n );
			}
		}
	}
}

// 新しいハトの出現
function appear_hato(){
	
	var n = lookie+1;
	if( n>=pmax ) return;
	hato[n].exist = true;
	hato[n].dir = Math.floor(Math.random()*8);
	var t = Math.PI*Math.random()*2;
	hato[n].x = view.w/2 + view.w * Math.cos(t);
	hato[n].y = view.h/2 + view.w * Math.sin(t);
	start_wait(n);
	lookie = n;
}

////////////////////////////////////////////
// マウスアクション
////////////////////////////////////////////

function mouse_move(){
	scare_pigeon();
}

function mouse_click(){
	if( logo_click() ) return;
	scare_pigeon();
	feed();
}

function scare_pigeon(){
	var mx = stage.mouseX;
	var my = stage.mouseY;
	if( mx<0 || mx>view.w || my<0 || my>view.h ) return;
	for( var i=0; i<pmax; i++ ){
		if( hato[i].run>0 ) continue;
		var abx = Math.abs(mx-hato[i].x);
		var aby = Math.abs(my-hato[i].y);
		if( abx>80 ) continue;
		if( aby>80 ) continue;
		hato[i].run = 1;
		var dir = get_dir(hato[i].x-mx,hato[i].y-my);
		var spd = (Math.random()*3<1)?3:2;
		start_walk( i, dir, spd );
	}
}

////////////////////////////////////////////
// エサ
////////////////////////////////////////////

function feed(){
	var mx = stage.mouseX;
	var my = stage.mouseY;
	if( mx<0 || mx>view.w || my<0 || my>view.h ) return;
	
	var n = food_num;
	food[n].stat = 1;
	food[n].pea = 5;
	var ox = view.w/2;
	var oy = my;
	food[n].ax = (mx-ox)/aircntmax;
	food[n].ay = (my-oy)/aircntmax;
	food[n].x = ox;
	food[n].g = gstart;
	food[n].cnt = 0;
	// クリックした場所に豆が来るように遡ってyを決める
	var y = 0;
	var g = gstart;
	for( i=0; i<aircntmax; i++ ){
		y += g;
		g += gadd;
	}
	food[n].y = oy-y;
	
	food_num++;
	if( food_num>=fmax ) food_num = 0;
}

// 投げられたエサの動き
function move_food(n){
	food[n].cnt++;
	food[n].x += food[n].ax;
	food[n].y += food[n].ay + food[n].g;
	food[n].g += gadd;
	// 着地
	if( food[n].cnt>=aircntmax ){
		food[n].stat=2;
		// スプライト
		var rx = 10;
		var ry = rx*7/10;
		for( var i=0; i<5; i++ ){
			var mc = sprfood[n].getChildAt(i);
			var k = 360*i/5+Math.random()*40;
			mc.x = rx*Math.cos(Math.PI*k/180);
			mc.y = (Math.random()*ry)*Math.sin(Math.PI*k/180);
			mc.ax = mc.x;
			mc.ay = mc.y;
			mc.visible = true;
		}
	}
}


////////////////////////////////////////////

// 方向転換
function change_dir(n,dir){

	hato[n].dir = dir;
//	mc.dirpat = dirpat[dir];
//	mc._xscale = 100 * dirlr[dir];
}

// 位置から方向を返す
function get_dir( ax, ay )
{
	var dir = 0;	// 目的地の方向
	var abx = Math.abs(ax);
	var aby = Math.abs(ay);
	if( ax>0 ){
		if( ay>0 ){
			dir = (abx>aby) ? 0 : 1; 
		}else{
			dir = (abx>aby) ? 7 : 6; 
		}
	}else{
		if( ay>0 ){
			dir = (abx>aby) ? 3 : 2; 
		}else{
			dir = (abx>aby) ? 4 : 5; 
		}
	}
	return dir;
}

// (x2,y2)は、その方向にあるかどうか
function is_front( x1, y1, dir, x2, y2 ){
	// 相対位置
	var ax = x2 - x1;
	var ay = y2 - y1;
	var d = get_dir( ax, ay );
	if( d == dir ) return true;
	return false;
}

// 目的地への方向取得（緩やかな方向転換）
function turn_gentle( dx, dy, px, py, dir ){
	var ax = dx-px;
	var ay = dy-py;
	var ndir = get_dir( ax,ay );	// 目的地の方向
	var s = ndir-dir;
	if( s>4 ) s-=8;
	if( s<-4 ) s+=8;
	var a = 0;
	if( s<0 ) a=-1;
	if( s>0 ) a=1;
	var ret = (dir+a+8)%8;
	if( px<-50 || px>view.w+50 || py<-50 || py>view.h+50 ) ret = ndir;
	return ret;
}


// ロゴクリック
function logo_click(){
	if( lstat!="stop" ) return false;
	
	var mx = stage.mouseX;
	var my = stage.mouseY;
	if( my<logo.y-4 ) return false;
	if( mx>logo.x+118 ) return false;
	
	lstat="down";
	return true;
}

