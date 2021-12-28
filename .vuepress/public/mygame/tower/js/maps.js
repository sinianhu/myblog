
//初始地图
var maps = [
[//序章
[1,2,2,2,2,5,2,2,2,2,1],
[1,2,2,2,2,4,2,2,2,2,1],
[1,2,2,2,2,4,2,2,2,2,1],
[1,2,2,2,2,4,2,2,2,2,1],
[1,2,2,2,2,4,2,2,2,2,1],
[1,2,2,2,2,4,2,2,2,2,1],
[1,1,2,2,2,4,2,2,2,1,1],
[1,1,1,1,1,2004,1,1,1,1,1],
[3,1,3,1,1001,4,4,1,3,1,3],
[3,3,3,3,3,4,3,3,3,3,3],
[3,3,3,3,3,4,3,3,3,3,3],
],
[//一层
[5,4,2001,3001,3002,3001,4,4,4,4,4],
[1,1,1,1,1,1,1,1,1,1,4],
[2007,4,3004,2004,4,1,2007,2001,2007,1,4],
[2001,3004,2007,1,4,1,2007,2001,2007,1,4],
[1,2004,1,1,4,1,1,1,3003,1,4],
[2001,3005,4,1,4,2004,3007,3001,3006,1,4],
[2011,4,2002,1,4,1,1,1,1,1,4],
[1,2004,1,1,4,4,4,4,4,4,4],
[4,3005,4,1,1,2006,1,1,1,2004,1],
[2007,2008,2001,1,2003,4,4,1,2001,3008,2001],
[2007,2009,2001,1,4,6,4,1,2001,2001,2001]
],
[//二层
[6,1,4,3009,4,1,2011,2010,2001,2003,1],
[4,1,2010,1,2008,1,2011,2010,2001,2002,1],
[4,1,2001,1,2001,1,2011,2010,2001,3010,1],
[4,1,2001,1,2001,1,1,1,1,2004,1,],
[4,1,4,1,4,4,4,2004,4,4,1],
[4,1,2004,1,1,2004,1,1,2004,1,1],
[4,8,4,4,4,4,1,4,3010,4,1],
[4,1,2004,1,1,2005,1,7,1,7,1],
[4,1,2001,1,2008,2007,1,4,1,4,1],
[4,1,2001,1,2008,2007,1,4,1,4,1],
[5,1,2011,1,2008,2007,1,1002,1,1003,1]
],
[//第三层
[2012,3002,2001,1,1004,1005,1006,1,1,1,1],
[3002,2001,4,1,4,4,4,1,4,3006,4],
[2001,3004,4,1,1,2004,1,1,4,1,4],
[1,2004,1,1,4,3004,4,1,2001,1,3002],
[4,4,4,1,1,1,4,1,2001,1,3006],
[3001,1,4,3006,3002,3006,4,1,2001,1,3002],
[3001,1,1,1,1,1,4,4,4,1,4],
[4,4,4,4,4,1,1,2004,1,1,4],
[1,1,1,1,3006,1,3002,4,3002,1,4],
[1,4,4,4,4,1,2010,3006,2001,1,4],
[6,4,1,1,1,1,2011,2008,2001,1,5]

]


];

//上下层初始位置 x1,y1飞楼或下层进入上层  x2,y2 下楼
var mapInitPosition= [
{//序章
	x1:10,
	y1:5,
	x2:1,
	y2:5
},{//一层
	x1:9,
	y1:5,
	x2:0,
	y2:1
},{//二层
	x1:1,
	y1:0,
	x2:9,
	y2:0
},{//三层
	x1:10,
	y1:1,
	x2:9,
	y2:10
}

]

var tipsData = {
	"2001":"获得一把黄钥匙！",
	"2002":"获得一把蓝钥匙！",
	"2003":"获得一把红钥匙！",
	"2007":"得到一个小血瓶生命加200！",
	"2008":"得到一个大血瓶生命加500！",
	"2009":"获得怪物图册，按L使用隐藏！",
	"2010":"获得蓝宝石 防御+3！",
	"2011":"获得红宝石 攻击+3！",
	"2012":"获得 铁剑 攻击+10！"
	
}

//怪物属性
var monstersData = {
	//生命、攻击、防御、金币、经验 ,名称
	"3001":[50, 20, 1, 1, 1, "绿头怪",3001],
	"3002":[70, 15, 2, 2, 2, "红头怪",3002],
	"3003":[200, 35, 10, 5, 5, "青头怪",3003],
	"3004":[110, 25, 5, 5, 4, "骷髅人",3004],
	"3005":[150, 40, 20, 8, 6, "骷髅士兵",3005],
	"3006":[100, 20, 5, 3, 3, "小蝙蝠",3006,],
	"3007":[125, 50, 25, 10, 7, "初级法师",3007],
	"3008":[300, 75, 45, 13, 10, "兽面人",3008],
	"3009":[900, 750, 650, 77, 70, "金队长",3009],
	"3010":[850, 350, 200, 45, 40, "金卫士",3010]
}



/*
生、攻、防、金、经
[125, 50, 25, 10, 7, "初级法师"]
[150, 65, 30, 10, 8, "大蝙蝠"]
[300, 75, 45, 13, 10, "兽面人"]
[400, 90, 50, 15, 12, "骷髅队长"]
[500, 115, 65, 15, 15, "石头怪人"]
[250, 120, 70, 20, 17, "麻衣法师"]
[450, 150, 90, 22, 19, "初级卫兵"]
[550, 160, 90, 25, 20, "红蝙蝠"]
[100, 200, 110, 30, 25, "高级法师"]
[700, 250, 125, 32, 30, "怪王"]
[1300, 300, 150, 40, 35, "白衣武士"]

[500, 400, 260, 47, 45, "红衣法师"]
[900, 450, 330, 50, 50, "兽面武士"]
[1250, 500, 400, 55, 55, "冥卫兵"]
[1500, 560, 460, 60, 60, "高级卫兵"]
[1200, 620, 520, 65, 75, "双手剑士"]
[2000, 680, 590, 70, 65, "冥战士"]

[1500, 830, 730, 80, 70, "灵法师"]
[2500, 900, 850, 84, 75, "冥队长"]
[1200, 980, 900, 88, 75, "灵武士"]
[3100, 1150, 1050, 92, 80, "影子战士"]
[15000, 1000, 1000, 100, 100, "红衣魔王"]
[20000, 1333, 1333, 133, 133, "红衣魔王"]
[30000, 1700, 1500, 250, 220, "冥灵魔王"]      
[45000, 2550, 2250, 312, 275, "冥灵魔王"]
[3333, 1200, 1133, 112, 100, "冥队长"]
[1800, 1306, 1200, 117, 100, "灵武士"]
[2400, 980, 900, 88, 75, "灵武士"]
[2000, 1106, 730, 106, 93, "灵法师"]
[1500, 830, 730, 132, 116, "灵法师"]
[60000, 3400, 3000, 390, 343, "冥灵魔王"]
[99999, 5000, 4000, 0, 0, "血影"]
[99999, 9999, 5000, 0, 0, "魔龙"]


*/


//无法行走的地方
var cannotgo = [
	1,2,3
];


//对话
	//层数
		//标志
			//role 角色图片编码
			//roleName：角色名称
			//text:对话内容
var towerTalking = {
	0:{//层数
		"angel":{//对话角色
			"start"://开局对话
				[
					{
						role:'hero-1',
						roleName:'勇士',
						text:'……'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'你醒了！'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'……|你是谁？我在哪里？'//逢|换行
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'我是这里的仙子,刚才你被这里的小怪打昏了。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'……|剑,剑,我的剑呢？'//逢|换行
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'你的剑被他们抢走了,我只来得及将你救出来。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'那,公主呢？我是来救公主的。'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'公主还在里面,你这样进去是打不过里面的小怪的。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'那我怎么办,我答应了国王一定要把公主救出来的,那我现在应该怎么办呢？'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'放心,我把我的力量借给你,你就可以打赢那些小怪了。不过,你得先帮我去找一样东西,找到了再来这里找我。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'找东西？找什么东西？'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'是一个十字架,中间有一颗红色的宝石。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'那个东西有什么用吗？'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'我本是这座塔的守护者,可不久前,从北方来了一批恶魔,他们占领了这座塔,并将我的魔力封在了这个十字架里面,如果你能将它带出塔来,那我的魔力便会慢慢地恢复,到那时我便可以把力量借给你去救出公主了。'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'要记住：只有用我的魔力才可以打开二十一层的门。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'……|好吧,我试试看。'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'刚才我去看过了,你的剑被放在三楼,你的盾在五楼上,而那个十字架被放在七楼。要到七楼,你得先取回你的剑和盾。|另外,在塔里的其他楼层上,还有一些存放了好几百年的宝剑和宝物,如果得到它们,对于你对付里面的怪物将有很大的帮助。'
					},
					{
						role:'hero-1',
						roleName:'勇士',
						text:'可是,我怎么进去呢？'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'我这里有三把钥匙,你先拿去,在它里面还有很多这样的钥匙,你一定要珍惜使用。'
					},
					{
						role:'1001',
						roleName:'仙子',
						text:'勇敢的去吧,勇士！'
					}
				],
			"comeon":
				[//等待无事发生
					{
						role:'1001',
						roleName:'仙女',
						text:'拿到十字架之后再来找我吧,十字架在七楼。'
					}
				]
			}
		}
}



