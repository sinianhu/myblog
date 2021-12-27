
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
		moveFlag:true,//是否可移动标志
		taklingFlag:false,//对话模式标志
		map:maps,
		hero:{
			faceTo:1,//0上，1下，2左，3右
			top:640,
			left:320,
		},
		dialogBox:{
			show:'none',//none:不显示,other:其他人对话，hero:英雄
			role:'1001',//头像
			roleName:'仙子：',//名称
			index:0,//第几个对话
			selfIndex:0,//第几次点击
			text:[],//文本内容
			allText:[]
		},
		angel:{
			talkStatus:null
		}
	},
	methods:{//方法
		//键盘按下事件
		keyDown:function(code){
			
			//优先判定移动，其次判定对话
			if(this.moveFlag){//移动标志
				if(37==code){//左
					this.goLeft();
				}else if(38==code){//上
					this.goUp();
				}else if(39==code){//右
					this.goRight();
				}else if(40==code){//下
					this.goDown();
				}
			}else if(this.taklingFlag){//对话标志
				if(32==code){//空格
					this.spacingTalking();

				}
			}
		},
		goUp:function(){
			this.hero.faceTo = 0;
			var top = this.hero.top-this.heroSize<0?this.hero.top:this.hero.top-this.heroSize;
			this.moveHero(top,this.hero.left);
		},
		goLeft:function(){
			this.hero.faceTo = 2;
			var left = this.hero.left-this.heroSize<0?this.hero.left:this.hero.left-this.heroSize;
			this.moveHero(this.hero.top,left);
		},
		goDown:function(){
			this.hero.faceTo = 1;
			var top = this.hero.top+this.heroSize>640?this.hero.top:this.hero.top+this.heroSize;
			this.moveHero(top,this.hero.left);
		},
		goRight:function(){
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
			if(this.map[this.floor][x][y]==5){//向上一层 获取上一层进入坐标
				top = mapInitPosition[this.floor+1].x1*this.heroSize;
				left = mapInitPosition[this.floor+1].y1*this.heroSize;
				this.floor++;
				this.hero.faceTo=1;
			}else if(this.map[this.floor][x][y]==6){//向下一层 获取下一层往上坐标
				top = mapInitPosition[this.floor-1].x2*this.heroSize;
				left = mapInitPosition[this.floor-1].y2*this.heroSize;
				this.floor--;
				this.hero.faceTo=1;
			}else if(this.map[this.floor][x][y]==1001){//小天使
				this.angelTalk(x,y);
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
				}
				this.spacingTalking();//手动触发一次
			}else if(this.floor==0&&this.angel.talkStatus=='startOver'){
				
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
		//按下空格继续对话
		spacingTalking:function(){
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

		}

	},	
	components: {//自定义组件
		
	},
	computed:{//计算
		talkingFlagChange(){//对话框状态变化
			const {taklingFlag} = this;
			return {taklingFlag};
		}
	},
	watch:{//监听
		talkingFlagChange:{
			handler(nN,oN){//第一个参数新数据，第二个参数旧数据
				//所有非雷格子都翻开了
				if(nN.taklingFlag){
					game.moveFlag = false;
				}else{
					game.moveFlag = true;
				}
			}
		}

	}
});

