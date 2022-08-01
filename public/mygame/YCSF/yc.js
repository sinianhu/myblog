Array.prototype.pushNoRepeat = function(){
    for(var i=0; i<arguments.length; i++){
      var ele = arguments[i];
      if(this.indexOf(ele) == -1){
          this.push(ele);
      }
  }
};
change();


var yc= new Vue({
	el:'#yc',
	data:{
		gNumber:400,//每代数量
		gs:[],
		gsLength:400,
		numbers:[{
			n:'111',//二进制
			x:0,//十进制x
			y:0//十进制y
		}],
		maxN:{
			x:0,
			y:0
		},
		midN:{
			x:0,
			y:0
		},
		totalY:0,
		singleLength:22,//基因段长度
		step:5,//步长
		mutate:1,//变异个数
		niandai :0,
		stepText:'等待'
	},
	methods:{
		draw:function(){
			this.stepText = '开始';
			this.niandai = 0;
			
			window.int = window.setInterval(function(){
				if(yc.gs.length==0){
					yc.firstG();
					yc.dp();
				}
			 	yc.niandai++;
			 	yc.selectArray();
			 	if(yc.niandai>=20){
			 		window.clearInterval(window.int);
			 	}
			},2100)
			
		},
		selectArray:function(){
			console.log('选择开始');
			// var halfgs = [];
			// console.log('选择50个随机');
			// for(var i=0;i<50;i++){
			// 	halfgs.pushNoRepeat(this.rand())
			// }
			// console.log('第一轮选择了：'+halfgs.length+'个');
			// while(halfgs.length<50){
			// 	halfgs.pushNoRepeat(this.rand())
			// }
			// console.log('50个随机选择完成');
			
			yc.gs = this.getMaxHalf();// halfgs;
			yc.gsLength = yc.gs.length;
			window.setTimeout(function(){
				console.log('选择完成重新绘制画布');
				change();
				console.log('重新绘制画布完成，开始绘制点');
				yc.dp();
				console.log('点绘制完成，准备调用变异');
				console.log('选择结束');
				window.setTimeout(yc.by(),0);
			},1000);
			
		},
		by:function(){//变异
			console.log('变异开始');
			//1.随机两条进行片段互换产生另一半的新数据  0 -->24  50 98   49+n*2+1   49+n*2+2
			for(var k = 0;k<this.gNumber/4;k++){
				//随机的两条数据
				var r1 = Math.round(Math.random()*(this.gNumber/2-1));
				var r2 = Math.round(Math.random()*(this.gNumber/2-1));
				while(r2==r1){
					r2 = Math.round(Math.random()*(this.gNumber/2-1));
				}
				
				//随机步长的N个位置
				var randomIndex = [];
				for(var i = 0;i<this.step;i++){
					var r1 = Math.round(Math.random()*(this.singleLength-1));
					randomIndex.pushNoRepeat(r1);
				}
				while(randomIndex.lenght<this.step){
					var r1 = Math.round(Math.random()*(this.singleLength-1));
					randomIndex.pushNoRepeat(r1);
				}
				
				var n1 = this.gs[r1];
				var n2 = this.gs[r2];
				
				var a1 = n1.split('');
				var a2 = n2.split('');
				
				for(var i = 0;i<this.step;i++){
					var c = 0;
					c = a1[randomIndex[i]];
					a1[randomIndex[i]] = a2[randomIndex[i]];
					a2[randomIndex[i]]  = c;
				}	
				
				var n11 = a1.join('');
				var n22 = a2.join('');
				
				this.gs[this.gNumber/2-1+k*2+1] = n11;
				this.gs[this.gNumber/2-1+k*2+2] = n22;
				
				this.gsLength = this.gs.length;
				
			}
			//2.随机字符进行变异
		
			//对孩子进行变异，保留父母，保证趋势是向更大发展
			for(var i= this.gs.length/2;i<this.gs.length;i++){	
				var a = this.gs[i];
				var ar = a.split('');
				for(var j = 0;j<this.mutate;j++){		
					var r1 = Math.round(Math.random()*(this.singleLength-1));
					if(ar[r1]==0){
						ar[r1]=1;
					}else{
						ar[r1]=0;
					}
				}
				this.gs[i]=ar.join('');
			}
			
			window.setTimeout(function(){
				change();
				yc.dp();
				console.log('变异结束');
			},1000);
		},
		firstG:function(){
			this.gs = [];
			for(var i = 0;i<this.gNumber;i++){
				var rn = this.getRandom2();
				this.gs.pushNoRepeat(rn.num);
			}
			while(this.gs.length<this.gNumber){
				var rn = this.getRandom2();
				this.gs.pushNoRepeat(rn.num);
			}
		},
		getRandom2:function(){//获得随机singleLength位2进制数
			var n = {
				num:''
			}
			for(var i = 0;i<this.singleLength;i++){
				var r = Math.floor((Math.random() * 2) + 1)-1;
				n.num += r;
			}
			return n;
		},
		toX:function(n){//获取2进制数字对应的 X坐标
			//2进制转10进制
			var n10 = parseInt(n,2);
			var nn = xLeftValue+n10*(xRightValue-xLeftValue)/(Math.pow(2, this.singleLength)-1);
			return Math.round(nn*Math.pow(10,6))/Math.pow(10,6);
		},
		dp:function(){
			var gs = this.gs;	
			this.numbers = [];
			this.totalY = 0;
			for(var i = 0;i<gs.length;i++){
				var x = gs[i];
				var xx = this.toX(x);
				var y = this.calcY(xx);
				this.numbers[i] = {
					n:x,//二进制
					x:xx,//十进制x
					y:y//十进制y
				}
				this.totalY += y;
				
			}
			this.numbers.sort(this.sortArr);
			for(var i = 0;i<gs.length;i++){
				var n = this.numbers[i]
				if(i==0||i==this.gs.length/2-1){
					if(i==0){
						this.maxN.x = n.x;
						this.maxN.y = n.y;
					}else{
						this.midN.x = n.x;
						this.midN.y = n.y;
					}
					drawPoint(n.x,n.y,true);
				}else{
					drawPoint(n.x,n.y,false);
				}
			}
			
		},
		calcY:function(x){
			var fun = document.getElementsByName("Fun")[1].value;
			return Calc(fun, ['x'], [x]);
		},
		sortArr:function(a,b){
			return b.y-a.y;
		},
		getMaxHalf:function(){//获取最大的一半
			this.numbers.sort(this.sortArr);
			var arr = [];
			for(var i = 0;i<this.gsLength/2;i++){
				arr.push(this.numbers[i].n);
			}
			return arr;
		},
		rand:function () {//根据权重取随机
		
			
		
		/*
		  const totalWeight = this.numbers.reduce(function (pre, cur, index) {
		    cur.startW = pre;
		    return cur.endW = pre + cur.y;
		  }, 0);
		  let random = Math.ceil(Math.random() * totalWeight);
		  let selectN = this.numbers.find(nn => nn.startW < random && nn.endW > random);
		  while(typeof(selectN)=='undefined'){//如果取不到数
			  selectN =  this.numbers.find(nn => nn.startW < random && nn.endW > random);
		  }
		  return selectN.n;
		*/
		  
		  
		}
	},
});