
Array.prototype.pushNoRepeat = function(){
    for(var i=0; i<arguments.length; i++){
      var ele = arguments[i];
      if(this.indexOf(ele) == -1){
          this.push(ele);
      }
    }
};

document.onkeydown = function(e){
	var keyCode = window.event.keyCode;
	game.keyDown(keyCode);
}


var game = new Vue({
	el:"#tower",
	data:{//数据
		heroSize:64,//单个方块所占像素
		floor:0,//楼层
		loadGame:false,
		floorDown:false,//下楼标志
		floorImage:4,//地板图片 以防不同楼层地板不一样
		moveFlag:true,//是否可移动标志
		taklingFlag:false,//对话模式标志
		shadeStatus:false,//蒙版显示状态
		map:maps,//地图
		hero:{
			faceTo:1,//0上，1下，2左，3右
			top:640,
			left:320,
			tools:{//英雄道具
				cross:false,//十字架
				hammer:false,//星光神榔
				magicBar:false,//16层的法杖
				handBook:{//图鉴
					have:false,
					show:false,
					monsters:[
					]
				},
				compass:{//风之罗盘
					have:false,
					status:0, //0 说明状态 1跳跃状态
					show:false,
					selectFloor:1,
					maxFloor:0
				}
			},
			status:{//英雄状态
				level:1,//等级
				life:1000,//生命
				attack:10,//攻击
				defence:10,//防御
				exp:0,//经验
				gold:0,//金币
				yellowKey:0,//黄钥匙  将钥匙数量放入status方便钥匙商店与金币经验商店集中
				blueKey:0,//蓝钥匙
				redKey:0,//红钥匙
			},
			attackStatus:{//攻击状态
				isAttck:false,//是否处于攻击状态
				monster:{
					code:3001,
					name:'绿色史莱姆',
					life:50,
					attack:20,
					defence:1,
					gold:10,
					exp:10
				}
			}
		},
		dialogBox:{//文本对话框控制器
			show:'none',//none:不显示,other:其他人对话，hero:英雄
			role:'1001',//头像
			roleName:'仙子：',//名称
			index:0,//第几个对话
			selfIndex:0,//第几次点击
			text:[],//文本内容
			allText:[]
		},
		npc:{//npc状态记录
			angel:null,//null/start/startOver
			thief:null,//null/wait
			princess:null,//公主  null/wait
		},
		tips:{//提示框控制器
			sStatus:false,//战斗胜利字样显示状态
			status:false,//文本提示框显示状态
			autoDisappear:true,//自动消失
			text:''
		},
		shop:{//商店控制器
			show:false,//是否显示商店
			status:0,//0 说明 1选择
			selectItem:1, //1 第一项 2 第二项 3 第三项 4 离开  根据不同商店1,2,3不同
			text:{
				caption:'想要增加你的能力吗？如果你有 25 个金币，你可以任意选择一项：',
				item1:'增加 800 点生命',
				item2:'增加 4 点攻击',
				item3:'增加 4 点防御',
				leave:'离开商店'
			},
			control:{
				
			}
		}
	},
	methods:{//方法
		//键盘按下事件
		keyDown:function(code){
			//console.log(code);
			//优先判定移动，其次判定对话
			if(this.moveFlag){//移动标志 自由移动状态
				if(37==code){//左
					this.goLeft();
				}else if(38==code){//上
					this.goUp();
				}else if(39==code){//右
					this.goRight();
				}else if(40==code){//下
					this.goDown();
				}else if(76==code&&this.hero.tools.handBook.have){//拥有怪物图册并且按下L键
					this.showHideHandBook();
				}else if(74==code&&this.hero.tools.compass.have){//拥有风之罗盘，按下J键
					this.showHideJump();//展示隐藏跳楼选择
				}else if(82==code){//按下R，重新开始
					this.reStartGame();
				}else if(83==code){//S ,保存
					this.saveGame();
				}else if(65==code){//a ,读取
					this.readGame();
				}
			}else if(this.taklingFlag&&32==code){//对话标志 按下空格
				this.spacingTalking();
				
			}else if(this.tips.status&&32==code){//不自动消失的提示框 按下空格后提示框消失
				this.tips.status = false;
				this.tips.autoDisappear = true;
			}else if(76==code&&this.hero.tools.handBook.show){//拥有怪物图册并在显示
				this.showHideHandBook();
			}else if(74==code&&this.hero.tools.compass.show){//关闭风之罗盘
				this.showHideJump();
			}else if(32==code&&this.hero.tools.compass.show&&this.hero.tools.compass.status==0){
				//风之罗盘说明状态按下空格
				this.hero.tools.compass.status = 1;
			}else if(
				this.hero.tools.compass.show
				&&this.hero.tools.compass.status==1
				&&(
					code==38||
					code==40||
					code==104||
					code==98
				)
			){//风之罗盘按上(38)、下(40)、小键盘8(104),2(98)监听
				if(code==38||code==104){
					this.changeFloor(-1,false);
				}else{
					this.changeFloor(1,false);
				}
			}else if(this.hero.tools.compass.show
					&&this.hero.tools.compass.status==1
					&&(32==code||101==code)
					){
				//风之罗盘确认楼层 空格(32)或者5(101)
				this.changeFloor(1,true);
			}else if(32==code&&this.shop.show&&this.shop.status==0){
				//商店说明状态按下空格
				this.shop.status = 1;
			}else if(
				this.shop.show
				&&this.shop.status==1
				&&(
					code==38||
					code==40||
					code==104||
					code==98
				)
			){//商店按上(38)、下(40)、小键盘8(104),2(98)监听
				if(code==38||code==104){
					this.changShopItem(-1,false);
				}else{
					this.changShopItem(1,false);
				}
			}else if(this.shop.show
					&&this.shop.status==1
					&&(32==code||101==code)
					){
				//商店确认 空格(32)或者5(101)
				this.changShopItem(1,true);
			}
				
			
		},
		saveGame(){//保存
			localStorage.setItem('towerData',JSON.stringify(this._data));
			this.showTips('保存游戏成功！',false,true);
		},
		readGame(){//载入
			if(localStorage.getItem('towerData')==null
			||localStorage.getItem('towerData')=='undefined'
			||typeof(localStorage.getItem('towerData'))=='undefined'
			){
				alert('暂无存档！');
			}
			this.loadGame = true;//标志为加载游戏，防止楼层切换引起的英雄位置初始化
			var data = JSON.parse(localStorage.getItem('towerData'));
			this.floor = data.floor;
			this.map = data.map;
			this.hero = data.hero;
			this.npc = data.npc;
			
			window.setTimeout(function(){
				game.showTips('载入游戏成功！',false,true);
				game.loadGame = false;
			},500);
			
		},
		reStartGame(){//重新开始
			window.location.reload();
		},
		goUp:function(){//向上
			this.hero.faceTo = 0;
			var top = this.hero.top-this.heroSize<0?this.hero.top:this.hero.top-this.heroSize;
			this.moveHero(top,this.hero.left);
		},
		goLeft:function(){//向左
			this.hero.faceTo = 2;
			var left = this.hero.left-this.heroSize<0?this.hero.left:this.hero.left-this.heroSize;
			this.moveHero(this.hero.top,left);
		},
		goDown:function(){//向下
			this.hero.faceTo = 1;
			var top = this.hero.top+this.heroSize>640?this.hero.top:this.hero.top+this.heroSize;
			this.moveHero(top,this.hero.left);
		},
		goRight:function(){//向右
			this.hero.faceTo = 3;
			var left  = this.hero.left+this.heroSize>640?this.hero.left:this.hero.left+this.heroSize;
			this.moveHero(this.hero.top,left);
		},
		moveHero:function(top,left){//移动英雄至某个位置方法
			var x = Math.round(top/this.heroSize);
			var y = Math.round(left/this.heroSize);
			//判断即将前进的位置是否可以前进
			if(cannotgo.indexOf(this.map[this.floor][x][y])!=-1){
				return;
			}
			var touchType = this.map[this.floor][x][y];
			if(touchType==5){//向上一层
				this.floor++;
				return;
			}else if(touchType==6){//向下一层
				this.floorDown = true;
				this.floor--;	
				return;
			}else if(touchType==7){//铁栅栏
				this.fence(x,y);
				return;
			}else if(touchType==1001){//仙子
				this.npcTalk(x,y,touchType);
				return;
			}else if(1002<=touchType&&touchType<=1006){//各种道具商店
				this.showShop(this.floor,touchType);
				return;
			}else if(1007<=touchType&&touchType<=1999 ){//npc
				this.npcTalk(x,y,touchType);
				return;
			}else if(2001<=touchType&&touchType<=2999){//触碰道具
				this.touchTools(x,y,touchType);
				return;
			}else if(3001<=touchType&&touchType<=3999){//触碰怪物
				this.touchMonster(x,y,touchType);
				return;
			}else if(touchType==4){
				
			}else{
				return;
			}
			this.hero.top = top;
			this.hero.left = left;
		},
		npcTalk:function(x,y,type){
			if(type==1001){//仙子
				if(this.floor==0&&this.npc.angel==null){//第一次与天使对话
					this.getTalkingText('angel','start');
					this.overTalking = function(){//重写对话完成事件
						this.npc.angel = 'startOver';//对完话
						this.taklingFlag = false;//结束对话
						this.map[0][8][4] = 1001;//移动小精灵位置
						this.map[0][8][5] = 4;
						this.hero.status.yellowKey++;
						this.hero.status.blueKey++;
						this.hero.status.redKey++;
					}
				}else if(this.floor==0&&this.npc.angel=='startOver'&&!this.hero.tools.cross&&!this.hero.tools.magicBar){
					//0层，小天使，待机状态，没有十字架
					this.getTalkingText('angel','comeon');
					this.overTalking = function(){//重写对话完成事件
						this.taklingFlag = false;//结束对话
					}
				}else if(this.floor==0&&this.npc.angel=='startOver'&&!this.hero.tools.cross&&this.hero.tools.magicBar){
					//0层 仙子 待机状态 无十字架 有法杖
					this.getTalkingText('angel','magicBar');
					this.npc.angel = 'magicBar';//对完话
					this.overTalking = function(){//重写对话完成事件
						this.taklingFlag = false;//结束对话
					}
				}else if(this.floor==0&&this.npc.angel=='startOver'&&this.hero.tools.cross){//没拿到法杖来提交十字架
					//0层 仙子 待机状态 十字架 三维各增加1/3
					this.getTalkingText('angel','cross');
					this.npc.angel = "cross";
					this.overTalking = function(){//重写对话完成事件
						this.hero.status.life = parseInt(this.hero.status.life/3*4);
						this.hero.status.attack = parseInt(this.hero.status.attack/3*4);
						this.hero.status.defence = parseInt(this.hero.status.defence.life/3*4);
						this.showTips("获得仙女祝福，三维增加三分之一！",false,true);
						this.map[0][x][y] = 4;
						this.map[20][7][5]= 5;//开通上21的楼梯
						this.taklingFlag = false;//结束对话
						 
					}
				}else if(this.floor==0&&this.npc.angel=='magicBar'&&this.hero.tools.cross){//拿到法杖来提交十字架
					//0层 仙子 待机状态/法杖状态 十字架 三维各增加1/3
					this.getTalkingText('angel','crossAndBar');
					this.npc.angel = "cross";
					this.overTalking = function(){//重写对话完成事件
						this.hero.status.life = parseInt(this.hero.status.life/3*4);
						this.hero.status.attack = parseInt(this.hero.status.attack/3*4);
						this.hero.status.defence = parseInt(this.hero.status.defence/3*4);
						this.showTips("获得仙女祝福，三维增加三分之一！",false,true);
						this.map[0][x][y] = 4;
						this.map[20][7][5]= 5;//开通上21的楼梯
						this.map[21][0][5]= 5;//开通上22的楼梯
						this.taklingFlag = false;//结束对话
					}
				}
				else{
					this.overTalking = function(){//重写对话完成事件
						this.taklingFlag = false;//结束对话
					}
				}
			}else if(type==1007){//小偷
				if(this.npc.thief==null){//第一次与小偷对话
					this.getTalkingText('thief','start');
					this.overTalking = function(){//重写对话完成事件
						this.npc.thief = 'comeon';//对完话
						this.taklingFlag = false;//结束对话
						this.map[2][6][1]=4;//绿色墙变成道路
					}
				}else if(this.npc.thief=='comeon'&&!this.hero.tools.hammer){
					//小偷，待机状态，没有星光神榔
					this.getTalkingText('thief','comeon');
					this.overTalking = function(){//重写对话完成事件
						this.taklingFlag = false;//结束对话
					}
				}else if(this.npc.thief=='comeon'&&this.hero.tools.hammer){
					this.getTalkingText('thief','end');
					this.overTalking = function(){//重写对话完成事件
						this.map[18][8][5] = 4;
						this.map[18][9][5] = 4;
						this.map[4][0][5] = 4;
						this.taklingFlag = false;//结束对话
					}
				}
				
			}else if(type==1008){//神秘老人
				if(this.floor==2){//2层
					this.getTalkingText('oldman','start');
					this.overTalking = function(){//重写对话完成事件
						this.hero.status.attack += 70;//攻击加70;
						this.showTips("获得钢剑，攻击加70！",false,true);
						this.map[2][x][y] = 4;
						this.taklingFlag = false;//结束对话
					}
				}else if(this.floor == 15){//15层 500经验换120攻击
					if(this.hero.status.exp<500){
						this.getTalkingText('oldman','start');
						this.overTalking = function(){
							this.taklingFlag = false;//结束对话
						};
					}else{
						this.getTalkingText('oldman','end');
						this.overTalking = function(){//重写对话完成事件
							this.hero.status.exp -= 500;
							this.hero.status.attack += 120;//攻击加70;
							this.showTips("获得圣光剑，攻击加120！",false,true);
							this.map[15][x][y] = 4;
							this.taklingFlag = false;//结束对话
						}
					}
				}else if(this.floor == 16){
					this.getTalkingText('oldman','start');
					this.overTalking = function(){//重写对话完成事件
						this.map[this.floor][x][y] = 4;
						this.hero.tools.magicBar = true;
						this.taklingFlag = false;//结束对话
					}
					
				}
			}else if(type==1009){//商人npc
				if(this.floor==2){//2层
					this.getTalkingText('businessman','start');
					this.overTalking = function(){//重写对话完成事件
						this.hero.status.defence+= 30;//攻击加70;
						this.showTips("获得钢盾，防御加30！",false,true);
						this.map[2][x][y] = 4;
						this.taklingFlag = false;//结束对话
					}
				}else if(this.floor == 15){//15层 500金币换120防御
					if(this.hero.status.gold<500){
						this.getTalkingText('businessman','start');
						this.overTalking = function(){
							this.taklingFlag = false;//结束对话
						};
					}else{
						this.getTalkingText('businessman','end');
						this.overTalking = function(){//重写对话完成事件
							this.hero.status.gold -= 500;
							this.hero.status.defence += 120;//攻击加70;
							this.showTips("获得星光盾，防御加120！",false,true);
							this.map[15][x][y] = 4;
							this.taklingFlag = false;//结束对话
						}
					}
				}
			}else if(type==1010){//红衣魔王对话地板
				if(this.floor==16){
					this.getTalkingText('monster','start');
					this.overTalking = function(){//重写对话完成事件
						this.map[this.floor][x][y] = 4;//将对话地板改为正常地板
						this.taklingFlag = false;//结束对话
					}
				}
			}else if(type==1011){//公主
				if(this.floor==18&&this.npc.princess==null){
					this.getTalkingText('princess','start');
					this.overTalking = function(){//重写对话完成事件
						this.npc.princess = 'wait';
						this.map[18][10][10] = 5;//打通到19层的楼梯
						this.taklingFlag = false;//结束对话
					}
				}else if(this.floor==18&&this.npc.princess=='wait'){
					this.getTalkingText('princess','wait');
					this.overTalking = function(){//重写对话完成事件
						this.taklingFlag = false;//结束对话
					}
				}
				
			}
			
			this.spacingTalking();//手动触发一次
			
		},
		fence:function(x,y){//铁栅栏触发事件
			if((this.floor==2&&x==7&&y==7)
				||(this.floor==2&&x==7&&y==9)){//2层的两个老头
				if(this.map[2][6][8]==4){//看守的怪死掉了
					this.map[this.floor][x][y] = 4;
				}
			}else if((this.floor==4&&x==2&&y==5)){//4层小偷前
				if(this.map[4][4][5]==4){//看守的怪死掉了
					this.map[this.floor][x][y] = 4;
				}
			}else if(this.floor==7&&x==4&&y==4){//7层
				if(this.map[7][4][3]==4){//看守的怪死掉了
					this.map[this.floor][x][y] = 4;
				}
			}else if(this.floor==10&&x==6&&y==3){//10层，无条件，直接去掉，莫名其妙的栅栏。。。
				this.map[this.floor][x][y] = 4;
			}else if(this.floor==13&&x==6&&y==3){//13层，左边那个栅栏
				this.map[this.floor][x][y] = 4;
			}else if(this.floor==18&&x==5&&y==5){//18层，关着公主的栏杆
				this.map[this.floor][x][y] = 4;
			}else if(this.floor==19){//19层
				this.map[this.floor][x][y] = 4;
			}
			
		},
		overTalking:function(){//对话结束触发事件，被各个触碰角色回写

		},
		getTalkingText:function(role,talkStatus){//角色,对话状态
			var floor = this.floor;
			try{
				var talkText = towerTalking[floor][role][talkStatus];
				if(talkText.length!=0){
					this.taklingFlag = true;//开始对话
					this.dialogBox.allText = talkText;
					this.dialogBox.index = 0;
					this.dialogBox.selfIndex = 0;
				}
			}catch(e){
				console.log('根据【'+floor+"】层，【"+role+"】角色，【"+talkStatus+"】状态抓取对话失败！");
			}
		},
		spacingTalking:function(){//按下空格继续对话
			var allText = this.dialogBox.allText;
			if(this.dialogBox.index>=allText.length){//对话结束，关闭对话
				this.dialogBox.show = 'none';//关闭对话框
				if(typeof(this.overTalking)=='function'){//对话结束回调
					this.overTalking();
					this.overTalking = function(){this.taklingFlag = false;};//回调触发结束后清空回调
				}
				return;
			}
			var dialog = allText[this.dialogBox.index];
			if(dialog.role!='hero-1'){
				this.dialogBox.show = 'other';
			}else{
				this.dialogBox.show = 'hero';
			}
			var cutLength = 15;
			var text = dialog.text;
			var arr1 = text.split('|');//现根据竖线划分
			var textArr = [];
			for(var i = 0;i<arr1.length;i++){
				var t = arr1[i];
				t = "&&"+t;//开头增加两个占位
				var l = t.length;//获取字符串长度
				var time = Math.floor(l/cutLength)+1;//获取被切分了多少份，每份cutLength个长度
				for(var j = 0;j<time;j++){
					var ind = j*cutLength;
					var cutText = t.substr(ind,cutLength);
					if(j==0){
						cutText = cutText.substr(2,cutLength);
						cutText = '\u3000\u3000'+cutText;
					}
					if(cutText!=""){
						textArr.push(cutText);
					}
				}
			}
			if(this.dialogBox.selfIndex*2+1<=textArr.length){//如果还有对话，则显示对应对话
				this.dialogBox.role = dialog.role;
				this.dialogBox.roleName = dialog.roleName+":";
				this.dialogBox.text[0]= textArr[this.dialogBox.selfIndex*2];
				if(""==textArr[this.dialogBox.selfIndex*2+1]||textArr[this.dialogBox.selfIndex*2+1]=='undefined'){
					textArr[this.dialogBox.selfIndex*2+1] = "\u3000";
				}
				this.dialogBox.text[1]= textArr[this.dialogBox.selfIndex*2+1];
				this.$set(this.dialogBox.text,0,textArr[this.dialogBox.selfIndex*2]);
				this.$set(this.dialogBox.text,1,textArr[this.dialogBox.selfIndex*2+1]);
				this.dialogBox.selfIndex++;
			}else{//当前对象没有对话了，下一条对话
				this.dialogBox.index++;
				this.dialogBox.selfIndex = 0;
				this.spacingTalking(this.overTalking);
			}

		},
		touchTools:function(x,y,type){//触碰道具,x,y,类型
			var flag = true;//吃掉道具标志
			var showFlag = true;//显示提示标志
			var disappear = true;//提示框自动消失
			switch(type){
				case 2001://黄钥匙
					this.hero.status.yellowKey++;
					break;
				case 2002://蓝钥匙
					this.hero.status.blueKey++;
					break;
				case 2003://红钥匙
					this.hero.status.redKey++;
					break;
				case 2004://黄门
					if(this.hero.status.yellowKey>0){
					  this.hero.status.yellowKey--;
					}else{
						flag = false;
					}
					showFlag = false;
					break;
				case 2005://蓝门
					if(this.hero.status.blueKey>0){
					  this.hero.status.blueKey--;
					}else{
						flag = false;
					}
					showFlag = false;
					break;
				case 2006://红门
					if(this.hero.status.redKey>0){
						this.hero.status.redKey--;
					}else{
						flag = false;
					}
					showFlag = false;
					break;
				case 2007://小血瓶 血量+200
					this.hero.status.life+=200;
					break;
				case 2008://大血瓶 血量+500
					this.hero.status.life+=500;
					break;
				case 2009://怪物图册
					this.hero.tools.handBook.have=true;
					disappear = false;
					break;
				case 2010://蓝宝石
					this.hero.status.defence+=3;
					break;
				case 2011://红宝石
					this.hero.status.attack+=3;
					break;
				case 2012://铁剑
					this.hero.status.attack+=10;
					break;
				case 2013://钥匙串
					this.hero.status.yellowKey++;
					this.hero.status.blueKey++;
					this.hero.status.redKey++;
					break;
				case 2014://铁盾 防御加10
					this.hero.status.defence+=10;
					break;
				case 2015://小飞羽 等级+1  血量+1000 攻击+10 防御+10
					this.hero.status.level++;
					this.hero.status.life+=1000;
					this.hero.status.attack+=10;
					this.hero.status.defence+=10;
					break;
				case 2016://大金币 金币+300
					this.hero.status.gold += 300;
					break;
				case 2017://十字架
					this.hero.tools.cross = true;
					disappear = false;
					break;
				case 2018://星之罗盘 飞楼器
					this.hero.tools.compass.have = true;
					disappear = false;
					break;
				case 2019://青锋剑 攻击+70
					this.hero.status.attack += 70;
					break;
				case 2020://黄金盾 防御+85
					this.hero.status.defence += 85;
					break;
				case 2021://星光神榔 
					this.hero.tools.hammer = true;
					disappear = false;
					break;
				case 2022://大飞羽
					this.hero.status.level += 3;
					this.hero.status.life+=3000;
					this.hero.status.attack+=30;
					this.hero.status.defence+=30;
					break;
				case 2023://圣水瓶
					this.hero.status.life += this.hero.status.life;
					break;
				case 2024://星光神剑 攻击+150
					this.hero.status.attack += 150;
					break;
				case 2025://光芒神盾 防御+190
					this.hero.status.defence += 190;
					break;
				default:
					flag = false;
			}
			if(flag){//触碰道具后,道具是否消失
				this.map[this.floor][x][y] = this.floorImage;
			}
			if(showFlag){//触碰道具后是否显示提示
				this.showTips(tipsData[type],false,disappear);
			}
		},
		touchMonster:function(x,y,type){//碰触怪物,x,y,类型
			var willLose = this.checkCanAttack(type);
			if(willLose==-1
				||willLose>=this.hero.status.life
			){//无法攻击
				return;
			}else{
				this.attackStart(x,y,type);
			}
		},
		checkCanAttack:function(type){//获取掉血数，-1无法攻击，其他预估掉血数量
			var monster = monstersData[""+type+""];
			var ml = monster[0];//怪物生命
			var ma = monster[1];//怪物攻击
			var md = monster[2];//怪物防御
			var hl = this.hero.status.life;
			var ha = this.hero.status.attack;
			var hd = this.hero.status.defence;
			var ext = 0;
			if(type==3019){//白衣武士直接削1/4血量
				ext = parseInt(hl/4);
			}else if(type==3027||type==3036){//灵法师削1/3血量
				ext = parseInt(hl/3);
			}else if(type==3020){//麻衣法师 固定造成100点伤害
				ext = 100;
			}else if(type==3017){//红衣法师 固定300伤害
				ext = 300;
			}
			hl = parseInt(hl-ext);
			if(ha-md<=0){//英雄攻击小于怪物防御 无法攻击
				return -1;
			}
			var time = Math.ceil(ml/(ha-md));//怪物血量/(英雄攻击-怪物防御) 取整得到需要攻击的次数
			
			/*
			if((ma-hd)*(time-1)>=hl){//(怪物攻击-英雄防御)*攻击次数大于等于英雄剩余血量 无法攻击
				return -1;
			}
			*/
			var singleAttack = ma-hd<=0?0:ma-hd;
			
			var lossLife = Math.ceil((singleAttack)*(time-1)+ext);
			
			return lossLife;
		},
		attackStart:function(x,y,type){//攻击开始
			//生命、攻击、防御、金币、经验
			this.hero.attackStatus.monster.code = type;
			var ml = this.hero.attackStatus.monster.life =  monstersData[""+type+""][0];
			var ma = this.hero.attackStatus.monster.attack = monstersData[""+type+""][1];
			var md = this.hero.attackStatus.monster.defence = monstersData[""+type+""][2];
			var mg = this.hero.attackStatus.monster.gold = monstersData[""+type+""][3];
			var mexp = this.hero.attackStatus.monster.exp = monstersData[""+type+""][4];
			var heroA = Math.ceil(this.hero.status.attack-md);//英雄单次攻击
			
			var monsterA  = Math.ceil(ma-this.hero.status.defence);//怪物单次攻击
			if(monsterA<0){//怪物单次攻击比0小则设置为0，否则越打血越多！
				monsterA = 0;
			}
			this.hero.attackStatus.isAttck = true;//攻击开始
			var ext = 0;
			if(type==3019){//白衣武士魔法攻击 削1/4血量
				ext = parseInt(this.hero.status.life/4);	
			}else if(type==3027||type==3036){//灵法师 削1/3血量
				ext = parseInt(this.hero.status.life/3);
			}else if(type==3020){
				ext = 100;
			}else if(type==3017){
				ext = 300;
			}
			
			this.hero.status.life = parseInt(this.hero.status.life-ext);
			
			window.attInt = window.setInterval(function(){
				if(game.hero.attackStatus.monster.life <= heroA){
					game.hero.attackStatus.monster.life =0;				
					//game.hero.status.life -= monsterA; 英雄先攻，最后一次攻击英雄不掉血
					game.attackEnd(x,y,monstersData[""+type+""]);
					window.clearInterval(window.attInt);
				}else{
					game.hero.attackStatus.monster.life -= heroA;	
					window.setTimeout(function(){
						game.hero.status.life -= monsterA;
					},100)
				}
			},150);
			
		},
		attackEnd:function(x,y,monster){//攻击结束
			this.showTips("获得"+monster[3]+"金币,"+monster[4]+"经验",true);	
			this.hero.status.gold += monster[3];
			this.hero.status.exp += monster[4];
			this.map[this.floor][x][y] = 4;
			if(this.floor==19&&monster[6]==3034){//18层冥灵魔王打完显示对话
				window.setTimeout(function(){
					game.getTalkingText('monster','end');
					game.overTalking = function(){//重写对话完成事件
						game.taklingFlag = false;//结束对话
					}
					game.spacingTalking();//手动触发一次
				},350);
			}else if(this.floor==21&&monster[6]==3035){//21层大魔王挂掉
				window.setTimeout(function(){
					game.getTalkingText('monster','end');
					game.overTalking = function(){//重写对话完成事件
						game.taklingFlag = false;//结束对话
						if(game.map[21][0][5]==2){
							alert('恭喜通关！未成功解锁隐藏关，请再接再厉！');
						}
					}
					game.spacingTalking();//手动触发一次
				},350);
			}
			
		},
		showTips:function(text,attackFlag,disappear){//提示框  文本，战斗胜利？不自动消失？
			this.tips.text = text;
			if(attackFlag){//战斗胜利显示战斗胜利后，会自动显示提示
				this.tips.sStatus = true;
				this.hero.attackStatus.isAttck = false;
			}else{
				this.tips.status = true;
				this.tips.autoDisappear = disappear;
			}
		},
		showHideHandBook:function(){//显示隐藏怪物图册
			if(this.hero.tools.handBook.show){
				this.hero.tools.handBook.show = false;
				return;
			}else{
				var map = this.map[this.floor];
				var monsters = [];
				for(var i =0;i<map.length;i++){
					for(var j = 0;j<map[i].length;j++){
						if(map[i][j]>=3001&&map[i][j]<=3999){//怪物
							monsters.pushNoRepeat(map[i][j]);
						}
					}
				}
				this.hero.tools.handBook.monsters = new Array();
				for(var i = 0;i<monsters.length;i++){
					this.hero.tools.handBook.monsters.push(monstersData[monsters[i]]);
				}
				
			}
			this.hero.tools.handBook.show = !this.hero.tools.handBook.show;
		},
		showHideJump:function(){//显示隐藏跳楼器
			//判断此时任务是否在楼梯旁边
			var x = Math.round(this.hero.top/this.heroSize);
			var y = Math.round(this.hero.left/this.heroSize);
			var flag = false;//附近有楼梯标志  这个条件印象中有，实际游戏中没有了！
			var floor = this.floor;
			/*
			if(
			(x>0&&(this.map[floor][x-1][y]==5||this.map[floor][x-1][y]==6))
			||(x<10&&(this.map[floor][x+1][y]==5||this.map[floor][x+1][y]==6))
			||(y>0&&(this.map[floor][x][y-1]==5||this.map[floor][x][y-1]==6))
			||(y<10&&(this.map[floor][x][y+1]==5||this.map[floor][x][y+1]==6))
			){
				flag = true;
			}else{
				//alert('只有站在楼梯口才能使用风之罗盘');
				//return false;
			}
			*/

			if(this.floor == 21){//21层禁用
				return false;
			}
			
			if(this.hero.tools.compass.show){
				this.hero.tools.compass.show = false;
				this.hero.tools.compass.status  = 0;
				this.hero.tools.compass.selectFloor = 1;
				return;
			}
			this.hero.tools.compass.show = !this.hero.tools.compass.show;
		},
		changeFloor:function(upordown,flag){//进行楼层跳跃 up 1 down -1  flag确认楼层
			if(!flag){//上/下
				var selectFloor = this.hero.tools.compass.selectFloor;
				if(selectFloor+upordown>=1&&selectFloor+upordown<=this.hero.tools.compass.maxFloor){
					this.hero.tools.compass.selectFloor = selectFloor+upordown;
				}
			}else{
				this.floor =  this.hero.tools.compass.selectFloor;
				this.hero.tools.compass.show = false;
				this.hero.tools.compass.status  = 0;
				this.hero.tools.compass.selectFloor = 1;
			}
		},
		showShop:function(floor,type){//显示商店
			var shop = {};
			if(type>=1004&&type<=1006){
				if(floor==3){
					shop = shopSetting.gold3;
				}else if(floor==11){
					shop = shopSetting.gold11;
					this.shop.status = 1;
				}
			}else if(type==1002){//蓝色老头
				if(floor==5){
					shop = shopSetting.exp5;
					this.shop.status = 1;
				}else if(floor==13){
					shop = shopSetting.exp13;
					this.shop.status = 1;
				}
				
			}else if(type==1003){//红色老头
				if(floor==5){
					shop = shopSetting.keys5;
					this.shop.status = 1;
				}else if(floor==12){
					shop = shopSetting.keys12;
					this.shop.status = 1;
				}
			}
			
			//赋值文本
			this.shop.text = shop.text;
			this.shop.control = shop.control;
			this.shop.show = true;
		},
		changShopItem:function(upordown,flag){//进行商店选择  upordown 1往下走，-1往上走，flag 确定？
			if(!flag){//上/下
				var selectItem = this.shop.selectItem;
				if(selectItem+upordown>=1&&selectItem+upordown<=4){
					this.shop.selectItem = selectItem+upordown;
				}
			}else{//确定
				if(this.shop.selectItem==4){//关闭
					this.shop.show = false;
					this.shop.status  = 0;
					this.shop.selectItem = 1;
				}else{//
					var control = this.shop.control['item'+this.shop.selectItem];
					if(this.hero.status[control['condition']]<control['cnumber']){
						return;
					}else{
						this.hero.status[control['condition']] -=control['cnumber'];
						for(var i = 0;i<control.result.length;i++){
							this.hero.status[control.result[i]['item']] += control.result[i]['rnumber'];
						}
					}
				}
				
			}
		},
		floor16:function(){//16层判定
			var type = this.map[16][4][4];
			if(this.hero.tools.cross&&type==1008){//有了十字架，并且还是老头，则置为墙壁，隐藏失效
				this.map[16][4][4] = 1;
			}
		}

	},	
	components: {//自定义组件
		
	},
	computed:{//计算
		floorChange(){//楼层变化
			return this.floor;
		},
		tipssStatusChange(){//战斗胜利提示框
			return this.tips.sStatus;
		},
		tipStatusChange(){//提示状态变化
			return this.tips.status;
		},
		stopMoveChange() {//开始对话，进入攻击，出现蒙版,查看怪物属性，跳楼，打开商店    停止移动
	      return this.taklingFlag
	      		||this.hero.attackStatus.isAttck
	      		||this.shadeStatus
	      		||this.hero.tools.handBook.show
	      		||this.hero.tools.compass.show
				||this.shop.show;
	    }
	},
	watch:{//监听
		stopMoveChange:function(flag){
			if(game.taklingFlag==false){
				game.dialogBox.text = [];
				game.dialogBox.allText = [];
			}
			if(flag){
				game.moveFlag = false;
			}else{
				game.moveFlag = true;
			}
		},
		floorChange:function(floor){//楼层变化
			game.shadeStatus = true;
			if(game.floorDown){//下楼
				top = mapInitPosition[floor].x2*game.heroSize;
				left = mapInitPosition[floor].y2*game.heroSize;
				game.floorDown = false;
			}else{
				var top = mapInitPosition[floor].x1*game.heroSize;
				var left = mapInitPosition[floor].y1*game.heroSize;
				if(floor-1>game.hero.tools.compass.maxFloor){//上楼时判断下一层是否被记录走过的最大楼层
					game.hero.tools.compass.maxFloor = floor-1;
				}
			}
			if(floor==16){//如果是16层触发判定
				game.floor16();
			}
			if(!game.loadGame){
				game.hero.top = top;
				game.hero.left = left;
				game.hero.faceTo=1;
			}
			window.setTimeout(function(){
					game.shadeStatus = false;
			},100);
			
		},
		tipssStatusChange:function(flag){//战斗胜利提示框
			if(flag){
				game.moveFlag = false;
				window.setTimeout(function(){
					game.tips.sStatus = false;
					game.tips.status = true;
				},200);
			}
		},
		tipStatusChange:function(flag){//自动消失提示框
			if(flag){
				game.moveFlag = false;
				if(game.tips.autoDisappear){
					window.setTimeout(function(){
						game.tips.status = false;
					},100);
				}
			}else{
				game.moveFlag = true;
			}
		}

	}
});

