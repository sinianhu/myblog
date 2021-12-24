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
		moveFlag:true,
		map:maps,
		hero:{
			faceTo:1,//0上，1下，2左，3右
			top:640,
			left:320,
		}
		
	},
	methods:{//方法
		//键盘按下事件
		keyDown:function(code){
			
			if(moveFlag){//移动标志
				if(37==code){//左
					this.goLeft();
				}else if(38==code){//上
					this.goUp();
				}else if(39==code){//右
					this.goRight();
				}else if(40==code){//下
					this.goDown();
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
				angel();
				return;
			}
			
			
			this.hero.top = top;
			this.hero.left = left;
			
		},
		angel:function(){//小天使对话
			
		}
		
	},	
	components: {//自定义组件
		
	},
	computed:{//计算
		
	},
	watch:{//监听
		
	}
});

