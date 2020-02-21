$(document).ready(function(){
    var canvas = document.getElementById('JtopoDemo');//获取画布
    var stage = new JTopo.Stage(canvas);//获取舞台
    var scene = new JTopo.Scene(stage);//把舞台添加到画布
    scene.background = 'img/background.jpg';//画布背景

    //	创建一个根节点
    var sNode = new JTopo.Node("start node");    // 创建一个节点
    sNode.setLocation(800,200);    // 设置节点坐标
    // 为根节点添加 ID 属性
    sNode.id = 0;    // 在创建节点的时候添加自定义属性   
    sNode.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
    scene.add(sNode); // 放入到场景中

    // console.log("test Data=================>", testData)
    
    //	根节点的点击事件(获取对应的关联数据来画层级节点)
	sNode.click(function(e){
		// 发送ajax请求获取到对应的数据floor1
		//	若有数据返回则向下添加节点
		addFloor(floor1);
	})

	//	实现若有数据返回则向下添加节点
    function addFloor(floorData){
		console.log("floorData===============>", floorData)
		if (floorData.length !=0 ) {
			for (var i = 0; i < floorData.length; i++) {
				// 调用创建节点函数
				addNode(floorData[i]);
			}
		}
    } 

	// 新增节点函数
	function addNode(nodeArgum){
		var node = new JTopo.Node(nodeArgum.name);    // 创建一个节点
	    node.setLocation(Math.floor(Math.random()*(1 - 100) + 1)+800, Math.floor(Math.random()*(1 - 100) + 1)+200);    // 设置节点坐标
	    // 为根节点添加自定义属性
	    node.id = nodeArgum.id;    // 在创建节点的时候添加自定义属性   
	    node.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
	   	node.parentId = nodeArgum.parentId;    // 在创建节点的时候添加自定义属性   
	    node.serializedProperties.push("parentId"); // 把自定义属性加入进节点的属性组 serializedProperties 中
	    scene.add(node); // 放入到场景中

	    // console.log("node================>", node)
	    // 监听新增节点拖动之后的位置
	    removeLocation(node);

	   	// 监听新增节点画线事件
	    clickNode(node);
	}

	// 监听新增节点画线事件
	function clickNode(clickNode) {
		var floordata;

		//	TODO: 判断鼠标是右键的情况下才增加节点,防止移动的时候也新增了节点
		

		//	单击节点获取数据新增node
		clickNode.click(function(){
			// 发送ajax请求获取到对应的数据
			if (clickNode.id == 1) {
				floordata =floor2;
			}else if (clickNode.id == 7) {
				floordata =floor3;
			}
			//	若有数据返回则向下添加节点
			addFloor(floordata);
		});

		//	双击节点画线
		clickNode.dbclick(function(){
			// 画线,连接两个节点
			// console.log("获取当前点击节点的位置=============>", clickNode.getLocation())
			// console.log("clickNode 获取当前点击节点的属性=============>", clickNode)
			//	实现连线(只向上画一次)
			linkNode(sNode, clickNode, clickNode.id.toString());		
		})
	}

	//  实现连线
	var linkArr =[];
    function linkNode(nodeA, nodeB, text) {
    	if (!linkArr.includes(text)) {
		    linkArr.push(text);
	        var link = new JTopo.FoldLink(nodeA, nodeB, text);
	        link.arrowsRadius = 10; //箭头大小
	        link.lineWidth = 2; // 线宽
	        link.bundleOffset = 60; // 折线拐角处的长度
	        link.bundleGap = 20; // 线条之间的间隔
	        link.strokeColor = '255, 0, 76'; // 线条颜色
	       	// 为连线添加自定义属性
		    link.id = nodeB.id;    // 在创建节点的时候添加自定义属性   
		    link.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
		    scene.add(link);
	        return link;
        }else{
        	return "请勿重复连线!!";
        }
    }


	// 监听新增节点拖动之后的位置
	function removeLocation(removeNode){
		removeNode.mouseup(function(e){
			// console.log("removeNode.getLocation()===================>", removeNode.getLocation())
			//	若移动了则改变该节点原型链上位置
			removeNode.__proto__.x =removeNode.getLocation().x;
			removeNode.__proto__.x =removeNode.getLocation().y;
		})

	}


});