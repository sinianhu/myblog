Array.prototype.pushNoRepeat = function(){
    for(var i=0; i<arguments.length; i++){
      var ele = arguments[i];
      if(this.indexOf(ele) == -1){
          this.push(ele);
      }
  }
};


var toolContent= new Vue({
	el:'#toolContent',
	data:{
		status:0,//状态：0 待机可进行设置，1 游戏中，不可进行设置 , 2 暂停，,3成功，-1 失败
		difficulty:'2',//默认中等难度
		rowNumber:16,//默认16*16
		colNumber:16,//默认16*16
		allMineNumber:40,
		customize:false,
		rare:0.4,
		time: 0,
		timerInt:null,
		btns:[
			{code:'startTimer',name:'开始'},
			{code:'pauseTimer',name:'暂停'},
			{code:'goonTimer',name:'继续'},
			{code:'clearTimer',name:'重置'}
		],
		lastNumber:40
	},
	methods:{
		//启动计时
		startTimer:function(){
			if(this.timerInt!=null){
				return;
			}
			this.time = 0;
			this.status = 1;
			this.lastNumber = this.allMineNumber;
			mineContent.initArray(this.rowNumber,this.colNumber);
			this.timerInt = window.setInterval(function(){
				toolContent.time = Math.round((toolContent.time+0.1)*10)/10;
			},100);
		},
		//启动计时无须初始化
		startTimerWithoutInit:function(){
			
			if(this.timerInt!=null){
				return;
			}
			this.time = 0;
			this.status = 1;
			this.lastNumber = this.allMineNumber;
			this.timerInt = window.setInterval(function(){
				toolContent.time = Math.round((toolContent.time+0.1)*10)/10;
			},100);
			
		},
		//暂停计时
		pauseTimer:function(){
			if(this.status!=1){
				return;
			}
			this.status = 2;
			if(this.timerInt!=null){
				window.clearInterval(this.timerInt);
				this.timerInt = null;
			}
		},
		//继续计时
		goonTimer:function(){
			if(this.status!=2){
				return;
			}
			this.status = 1;
			if(this.timerInt!=null){
				return;
			}
			this.timerInt = window.setInterval(function(){
				toolContent.time = Math.round((toolContent.time+0.1)*10)/10;
			},100);
		},
		//停止计时不清零（失败/成功）
		stopTimer:function(flag){
			this.status = -1;
			if(flag){
				this.status = 3;
			}
			if(this.timerInt!=null){
				window.clearInterval(this.timerInt);
				this.timerInt = null;
			}
		},
		//停止计时并清零
		clearTimer:function(){
			this.status = 0;
			if(this.timerInt!=null){
				window.clearInterval(this.timerInt);
				this.timerInt = null;
			}
			this.time = 0;
			mineContent.initArray(this.rowNumber,this.colNumber);
		},
		//按钮触发
		btnClick:function(code){
			//不同按钮启动不同的计时器功能
			this[code]();
		}
	},
	//按钮组件组
	components: {
		mybutton:{
			props:['btn'],
			template: '<button v-on:click="bClick(btn.code)">{{ btn.name }}</button>',
			methods:{
				bClick(code){
					this.$parent.btnClick(code);//调用父组件方法
				}
			}
		}
	},
	computed:{
		numberArea(){
			const {rowNumber,colNumber,allMineNumber,rare} = this;
			return {rowNumber,colNumber,allMineNumber,rare};
		},
		changeDifficulty(){
			const {difficulty} = this;
		return {difficulty};
		}
	},
	watch:{
		changeDifficulty:{
			handler(nN,oN){
				mineContent.customize = false;
				if(nN.difficulty==1){
					toolContent.rowNumber = 9;
					toolContent.colNumber = 9;
					toolContent.lastNumber = toolContent.allMineNumber = 10;	
				}else if(nN.difficulty==2){				
					toolContent.rowNumber = 16;
					toolContent.colNumber = 16;
					toolContent.lastNumber = toolContent.allMineNumber = 40;	
				}else if(nN.difficulty==3){
					toolContent.rowNumber = 16;
					toolContent.colNumber = 30;
					toolContent.lastNumber = toolContent.allMineNumber = 99;			
				}
				mineContent.rowNumber = toolContent.rowNumber;
				mineContent.colNumber = toolContent.colNumber;
				
				mineContent.initArray(mineContent.rowNumber,mineContent.colNumber);
				
			}
		},
		numberArea:{
			handler(nN,oN){//第一个参数新数据，第二个参数旧数据
				if(!mineContent.customize){//如果没有开启自定义,不触发此事件
					return;
				}
				if(nN.rowNumber<0){
					alert("行数不能为负数!");
					toolContent.rowNumber=10;
				}
				if(nN.colNumber<0){
					alert("列数不能为负数!");
					toolContent.colNumber=10;
				}
				if(nN.allMineNumber==oN.allMineNumber){//如果地雷总数没有变化，则默认生成40%的地雷
					toolContent.allMineNumber = Math.round(nN.rowNumber*nN.colNumber*0.4);
				}else if(nN.allMineNumber<0){
					alert('地雷总数不能为负数!');
					toolContent.allMineNumber = Math.round(nN.rowNumber*nN.colNumber*0.4);
				}
				mineContent.rowNumber = nN.rowNumber;
				mineContent.colNumber = nN.colNumber;
				mineContent.initArray(nN.rowNumber,nN.colNumber);
				toolContent.lastNumber = toolContent.allMineNumber;
			}
		}
	}
	
});


var mineContent = new Vue({
	el:'#mineContent',
	data:{
		mineTds:[],
		mine:null,
		boom:false,
		openNum:0,//翻开格子的数量
		_firstButton:null,//先触发的按键
		checkFlag:false//执行标志
	},
	methods:{
		//初始化表格
		initArray:function(row,col,flag,erow,ecol){
			this.boom = false;
			this.openNum = 0;
			mineContent.mine = new Array();
			for(var i = 0;i<row;i++){
				mineContent.mine[i] = new Array();
				for(var j = 0;j<col;j++){
					mineContent.mine[i][j] = {isMine:false,hasClick:false,roundNum:0,status:0};  
					//状态 0常规/1确定是雷/2怀疑/3已翻开/4炸了
				}
			}
			this.setRandomMine(flag,erow,ecol);
		},
		//点击某个格子 js不支持左右键同时按下的监听，需要使用定时器进行控制
		tdClick:function(row,col,e){
			
			if(toolContent.status==0){//待机状态直接开始
				//第一个点击的格子如果是雷，重新初始化
				if(mineContent.mine[row][col].isMine){
					mineContent.initArray(toolContent.rowNumber,toolContent.colNumber,true,row,col);
				}
				toolContent.startTimerWithoutInit();
				
			}else if(toolContent.status==2||toolContent.status==-1||toolContent.status==3){//暂停/失败/成功状态
				return;
			}
			
			var btn = e.button;//记录点击的按键是哪个
			if(this._firstButton==null){
				this._firstButton = btn;
				mineContent.mine[row][col].timeout = window.setTimeout(function(){
					if(!this.checkFlag){//0.1s后若未按下另一个按键，则执行单击事件
						mineContent.oneClick(row,col,e);
						mineContent._firstButton = null;
					}
				},100);
			}else{
				this.checkFlag = true;
				window.clearTimeout(mineContent.mine[row][col].timeout);
				
				//上一个按钮不为空，且这个按钮不等于上一个按钮，则执行左右键同时点击事件
				if(this._firstButton!=btn){
					mineContent.leftAndRightClick(row,col,e);
					
				}else if(btn==0){//左键0.1秒内点击两次！
					console.log('非人力也！');
					
				}else if(btn==2){//右键0.1秒内点击两次！
					console.log('非人力也！');
				}
				
				this.checkFlag = false;
				this._firstButton=null;
				
			}
		},
		oneClick(row,col,e){
			var currentTd = this.mine[row][col];
			
			if(e.button == 0){//左键
				if(currentTd.status==1||currentTd.status==3){//标记为确定是雷的左键点击不响应
					return;
				}else{
					this.openTd(row,col,currentTd);
				}
			}else if(e.button == 2){//右键 切换状态
				var s = currentTd.status;
				if(s==3||s==4){
					return;
				}
				currentTd.status = (s+1)%3;	
				//剩余雷数量-1
				if(currentTd.status ==1){
					toolContent.lastNumber--;
				}else if(currentTd.status == 2){
					toolContent.lastNumber++;
				}
				this.$set(mineContent.mine,row,mineContent.mine[row]);
			}	
		},
		//左右键同时点击
		leftAndRightClick:function(row,col,e){
			//1.判断是否翻开，没翻开，直接跳过
			var td = this.mine[row][col];
			if(td.status==3){//翻开了
				//2.判断周围标志为雷的个数是否与本身个数一致 不一致跳过
				var roundNum = td.roundNum;//显示的周围雷个数	
				var roundNotOpen = [];//周围未翻开格子
				var left = col-1<0?0:col-1;
				var right = col+1>=toolContent.colNumber?toolContent.colNumber-1:col+1;
				var top = row-1<0?0:row-1;
				var bottom = row+1>=toolContent.rowNumber?toolContent.rowNumber-1:row+1;
				var mineNo = 0;
				for(var i = 0;i<=bottom-top;i++){
					var x = top+i;
					for(var j = 0;j<=right-left;j++){
						var y = left +j;
						if(y==col&&x==row){
							continue;
						}
						//状态 0常规/1确定是雷/2怀疑/3已翻开/4炸了
						if(this.mine[x][y].status==1){
							mineNo++;
						}else if(this.mine[x][y].status ==0){
							roundNotOpen.push({'x':x,'y':y,'td':this.mine[x][y]});
						}
					}	
				}
				
				//3.依次触发周围未被翻开格子的打开事件
				if(roundNum==mineNo){
					for(var i =0;i<roundNotOpen.length;i++){
						this.openTd(roundNotOpen[i].x,roundNotOpen[i].y,roundNotOpen[i].td);
					}
				}
				
			}

			
	
		},
		
		openTd:function(row,col,currentTd){//翻开格子
			
			//如果是雷，爆炸并结束
			if(currentTd.isMine){
				currentTd.status = 4;
				this.boom = true;
				toolContent.stopTimer();
				this.$set(mineContent.mine,row,mineContent.mine[row]);
				return;
			}
		
			if(currentTd.status==0){
				this.openNum++;//翻开的格子数+1;
			}
			currentTd.status = 3;
			var left = col-1<0?0:col-1;
			var right = col+1>=toolContent.colNumber?toolContent.colNumber-1:col+1;
			var top = row-1<0?0:row-1;
			var bottom = row+1>=toolContent.rowNumber?toolContent.rowNumber-1:row+1;
			
			var mineNo = 0;
			for(var i = 0;i<=bottom-top;i++){
				var x = top+i;
				for(var j = 0;j<=right-left;j++){
					var y = left +j;
					if(y==col&&x==row){
						continue;
					}
					if(this.mine[x][y].isMine){
						mineNo++;
					}
				}	
			}
			//如果是0，自动翻开周围格子
			if(mineNo==0){
				for(var i = 0;i<=bottom-top;i++){
					var x = top+i;
					for(var j = 0;j<=right-left;j++){
						var y = left +j;
						if(x==col&&y==row){
							continue;
						}
						var arroundTd = this.mine[x][y];
						if(arroundTd.status==0){//待定状态格子才能被自动打开
							this.openTd(x,y,arroundTd);
						}
					}	
				}
			}else{
				this.mine[row][col].roundNum = mineNo;
			}
			this.$set(mineContent.mine,row,mineContent.mine[row]);
			
		},
		//设置随机位置地雷
		setRandomMine:function(flag,erow,ecol){
			if(this.mine==null){
				return;
			}
			
			this.mineTds = new Array();
			var mineNumber = toolContent.allMineNumber;//地雷总数
			var row = toolContent.rowNumber;//行数
			var col = toolContent.colNumber;//列数
		
			//先执行地雷个数次
			for(var i = 0;i<mineNumber;i++){
				//随机行
				var rr = Math.round(Math.random()*(row-1));
				//随机列
				var rc = Math.round(Math.random()*(col-1));
				if(flag&&rr==erow&&ecol==rc){
					continue;
				}
				this.mineTds.pushNoRepeat(rr+","+rc);
				mineContent.mine[rr][rc].isMine  = true;
			}
			//当随机位置小于地雷个数，再次随机
			while(this.mineTds.length<mineNumber){
				//随机行
				var rr = Math.round(Math.random()*(row-1));
				//随机列
				var rc = Math.round(Math.random()*(col-1));
				this.mineTds.pushNoRepeat(rr+","+rc);
				mineContent.mine[rr][rc].isMine = true;
			}
		}
	},
	computed:{
		checkNumber(){
			const {openNum,rightMineNum,falgMineNum} = this;
			return {openNum,rightMineNum,falgMineNum};
		}
	},
	watch:{
		checkNumber:{
			handler(nN,oN){//第一个参数新数据，第二个参数旧数据
				//所有非雷格子都翻开了
				if(nN.openNum==Math.round(toolContent.rowNumber*toolContent.colNumber-toolContent.allMineNumber)){
					toolContent.lastNumber = 0;
					toolContent.stopTimer(true);
					alert('成功！');
				}
			}
		}
	}
	
});
toolContent.difficulty=1;