
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
		floorDown:false,//下楼标志
		floorImage:4,//地板图片 以防不同楼层地板不一样
		moveFlag:true,//是否可移动标志
		taklingFlag:false,//对话模式标志
		shadeStatus:false,//蒙版显示状态
		tipText:'',//提示文字
		map:maps,//地图
		hero:{
			faceTo:1,//0上，1下，2左，3右
			top:640,
			left:320,
			tools:{//英雄道具
				cross:false,//十字架
				yellowKey:0,//黄钥匙
				blueKey:0,//蓝钥匙
				redKey:0,//红钥匙
				handBook:{//图鉴
					have:false,
					show:false,
					monsters:[
					]
				}
			},
			status:{//英雄状态
				level:1,//等级
				life:1000,//生命
				attack:10,//攻击
				defence:10,//防御
				exp:0,//经验
				gold:0,//金币
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
		angel:{//天使控制器
			talkStatus:null
		},
		tips:{//提示框控制器
			sStatus:false,//战斗胜利字样显示状态
			status:false,//文本提示框显示状态
			autoDisappear:true,//自动消失
			text:''
		}
	},
	methods:{//方法
		//键盘按下事件
		keyDown:function(code){
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
				}
				
			}else if(this.taklingFlag&&32==code){//对话标志 按下空格
				this.spacingTalking();
				
			}else if(this.tips.status&&32==code){//不自动消失的提示框 按下空格后提示框消失
				this.tips.status = false;
				this.tips.autoDisappear = true;
			}
			
			
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
		//移动英雄至某个位置方法
		moveHero:function(top,left){
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
			}else if(touchType==1001){//小天使
				this.angelTalk(x,y);
				return;
			}else if(2001<=touchType&&touchType<=2999){//触碰道具
				this.touchTools(x,y,touchType);
				return;
			}else if(3001<=touchType&&touchType<=3999){//触碰怪物
				this.touchMonster(x,y,touchType);
				return;
			}
			this.hero.top = top;
			this.hero.left = left;
		},
		angelTalk:function(x,y){//小天使对话
		
			if(this.floor==0&&this.angel.talkStatus==null){//第一次与天使对话
				this.getTalkingText('angel','start');
				this.overTalking = function(){//重写对话完成事件
					this.angel.talkStatus = 'startOver';//对完话
					this.taklingFlag = false;//结束对话
					this.map[0][8][4] = 1001;//移动小精灵位置
					this.map[0][8][5] = 4;
					this.hero.tools.yellowKey++;
					this.hero.tools.blueKey++;
					this.hero.tools.redKey++;
				}
				this.spacingTalking();//手动触发一次
			}else if(this.floor==0&&this.angel.talkStatus=='startOver'&&!this.hero.tools.cross){
				//0层，小天使，待机状态，没有十字架
				this.getTalkingText('angel','comeon');
				this.overTalking = function(){//重写对话完成事件
					this.taklingFlag = false;//结束对话
				}
				this.spacingTalking();//手动触发一次
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
				var time = Math.round(l/cutLength)+1;//获取被切分了多少份，每份cutLength个长度
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
					this.hero.tools.yellowKey++;
					break;
				case 2002://蓝钥匙
					this.hero.tools.blueKey++;
					break;
				case 2003://红钥匙
					this.hero.tools.redKey++;
					break;
				case 2004://黄门
					if(this.hero.tools.yellowKey>0){
					  this.hero.tools.yellowKey--;
					}else{
						flag = false;
					}
					showFlag = false;
					break;
				case 2005://蓝门
					if(this.hero.tools.blueKey>0){
					  this.hero.tools.blueKey--;
					}else{
						flag = false;
					}
					showFlag = false;
					break;
				case 2006://红门
					if(this.hero.tools.redKey>0){
						this.hero.tools.redKey--;
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
		touchMonster:function(x,y,type){
			if(this.checkCanAttack(type)==-1){//无法攻击
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
			if(type==3019){//TODO 预留魔法攻击怪物 直接削1/3血量
				ext = Math.round(hl/3);
				hl = Math.round(hl-ext);
			}
			if(ha-md<=0){//英雄攻击小于怪物防御 无法攻击
				return -1;
			}
			var time = Math.ceil(ml/(ha-md));//怪物血量/(英雄攻击-怪物防御) 取整得到需要攻击的次数
			if((ma-hd)*time>=hl){//(怪物攻击-英雄防御)*攻击次数大于等于英雄剩余血量 无法攻击
				return -1;
			}
			var lossLife = ma-hd<=0?0:Math.ceil(ext+(ma-hd)*(time-1));
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
			var heroA = Math.round(this.hero.status.attack-md);//英雄单次攻击
			
			var monsterA  = Math.round(ma-this.hero.status.defence);//怪物单次攻击
			this.hero.attackStatus.isAttck = true;//攻击开始
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
			},300);//TODO 这里临时调整为每0.1秒判定一次   0.3秒判定一次比较合理
			
		},
		attackEnd:function(x,y,monster){//攻击结束
			this.showTips("获得"+monster[3]+"金币,"+monster[4]+"经验",true);	
			this.hero.status.gold += monster[3];
			this.hero.status.exp += monster[4];
			this.map[this.floor][x][y] = 4;
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
			
		}

	},	
	components: {//自定义组件
		
	},
	computed:{//计算
		floorChange(){//楼层变化
			return this.floor;
		},
		talkingFlagChange(){//对话框状态变化
			return this.taklingFlag;
		},
		attackFlagChange(){//攻击状态变化
			return this.hero.attackStatus.isAttck;
		},
		shadeStatusChange(){//蒙版状态变化
			return this.shadeStatus;
		},
		tipssStatusChange(){//战斗胜利提示框
			return this.tips.sStatus;
		},
		tipStatusChange(){//提示状态变化
			return this.tips.status;
		}
	},
	watch:{//监听
		floorChange:function(floor){//楼层变化
			game.shadeStatus = true;
			if(game.floorDown){//下楼
				top = mapInitPosition[floor].x2*game.heroSize;
				left = mapInitPosition[floor].y2*game.heroSize;
				game.floorDown = false;
			}else{
				var top = mapInitPosition[floor].x1*game.heroSize;
				var left = mapInitPosition[floor].y1*game.heroSize;
			}
			game.hero.top = top;
			game.hero.left = left;
			game.hero.faceTo=1;
			window.setTimeout(function(){
				game.shadeStatus = false;
			},100);
		},
		talkingFlagChange:function(flag){//对话框状态
			if(flag){
				game.moveFlag = false;
			}else{
				game.moveFlag = true;
			}
		},
		attackFlagChange:function(flag){//攻击状态标志切换
			if(flag){
				game.moveFlag = false;
			}else{
				game.moveFlag = true;
			}
		},
		shadeStatusChange:function(flag){//切换楼层遮罩框
			if(flag){
				game.moveFlag = false;
			}else{
				game.moveFlag = true;
			}
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

