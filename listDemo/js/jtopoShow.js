/***************
1. 通过jtopoShowData里的数据渲染好拓扑结构图
2. 若有故障标志,则在拓扑结构里区分开来(动画显示当前故障节点)
3. 右键节点出现菜单栏(查看设备基本信息, 查看故障信息, 发送指令窗口)
4. 节点可以折叠与展开
5. TODO:当所有节点布局之后超出canvas的高度的时候需处理(应自适应)-- 暂时不做

**********************/

$(document).ready(function(){
    var canvas = document.getElementById('JtopoDemo');//获取画布
    var stage = new JTopo.Stage(canvas);//获取舞台
    var scene = new JTopo.Scene(stage);//把舞台添加到画布
    scene.background = 'img/background.jpg';//画布背景

    // // 不指定布局的时候，容器的布局为自动(容器边界随元素变化）
    // var container = new JTopo.Container('边界自动变化');
    // container.textPosition = 'Middle_Center';
    // container.fontColor = '100,255,0';
    // container.font = '18pt 微软雅黑';
    // container.borderColor = '255,0,0';
    // container.borderRadius = 30; // 圆角
    // scene.add(container);

    var nodeItemArr =[]; //	记住每个根节点的id
	var linkArr =[]; // 所有连线的数组
    var beginNode = null; // 连线的开始节点
    var currentNode = null; // 点击当前节点出现菜单栏

    //	获取到jtopoShowData里的数据dataList
    // console.log("dataList===================>", dataList)
    
    var resultNodeArr=[];// 新增节点函数返回的结果
    var resultLinkArr=[];
	for (var i = 0; i < dataList.length; i++) {
    	if (dataList[i].isRoot == true) {//	根节点
    		var sNode = new JTopo.Node("start node");    // 创建一个节点
		    // 为根节点添加 ID 属性
		    sNode.id = dataList[i].id;    // 在创建节点的时候添加自定义属性   
		    sNode.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
		    // 为根节点添加 parentId 属性
		    sNode.parentId = dataList[i].parentId;    
		    sNode.serializedProperties.push("parentId");
		    // 为根节点添加 breakdown (故障)属性
		    sNode.breakdown = dataList[i].alarm;    
		    sNode.serializedProperties.push("breakdown");
		    // 为根节点添加 deviceName (设备名)属性
		    sNode.deviceName = dataList[i].name;    // 在创建节点的时候添加自定义属性   
		    sNode.serializedProperties.push("deviceName"); // 把自定义属性加入进节点的属性组 serializedProperties 中
		    //	是否有子节点 hasLeaves 属性
		    sNode.hasLeaves = dataList[i].hasLeaves; 
		    sNode.serializedProperties.push("hasLeaves"); 
		    
		    scene.add(sNode); // 放入到场景中
		    console.log("sNode================>", sNode)
		    // container.add(sNode); // 放入容器当中
		    // 右键节点出现菜单选项
		    sNode.mouseup(function(e){
		    	rightClickMenue(e,sNode);
		    });

		  //   //	双击折叠节点
		  //   sNode.dbclick(function(){
				// foldNode(sNode);
		  //   });

    	}else{
    		if (dataList[i].parentId == sNode.id) {//	根节点下的第一层
	    		beginNode = sNode;
	    		resultNodeArr.push(addNode(beginNode, dataList[i], dataList[i].alarm));
	    	}else{
	    		for (var j = 0; j < resultNodeArr.length; j++) {
	    			if (dataList[i].parentId == resultNodeArr[j].id) {//	根节点下的第二层及下面的层
	    				beginNode = resultNodeArr[j];
	    				resultNodeArr.push(addNode(beginNode, dataList[i], dataList[i].alarm));
	    			}
	    		}
	    	}
    	}
    }

	// 新增节点函数
	function addNode(parentNode, nodeArgum, alarmFlag){
		// console.log("nodeArgum===============>", nodeArgum)
		var node = new JTopo.Node(nodeArgum.name);    // 创建一个节点
	    // 为根节点添加自定义属性
	    node.id = nodeArgum.id;   
	    node.serializedProperties.push("id");
	   	node.parentId = nodeArgum.parentId;      
	    node.serializedProperties.push("parentId"); 
	    node.deviceName = nodeArgum.name;  
	    node.serializedProperties.push("deviceName"); 
		// 为节点添加 breakdown (故障)属性
		node.breakdown = nodeArgum.alarm;    
		node.serializedProperties.push("breakdown");
		node.hasLeaves = nodeArgum.hasLeaves; 
		node.serializedProperties.push("hasLeaves"); 	    
	  //   if (Object.keys(nodeArgum).includes("leaves")) {
	  //   	node.leaves = nodeArgum.leaves;    // 在创建节点的时候添加自定义属性   
			// node.serializedProperties.push("leaves"); // 把自定义属性加入进节点的属性组 serializedProperties 中	
	  //   }
	    // node.dragable = false; // 不可拖拽
	    scene.add(node); // 放入到场景中
	    // container.add(node); // 放入容器当中

	    //	右键节点出现菜单选项
	    node.mouseup(function(e){
	    	rightClickMenue(e,node);
	    })

	    //	双击折叠节点
	    node.dbclick(function(){
			foldNode(node);
	    })

	    //	如果该节点报错则该节点变化显示(显示动画效果)
	    // if (alarmFlag) {
	    // 	// console.log("该节点出现故障!!")
	    // 	node.alarm ="warning";
	    // 	node.fillColor ='255, 0, 76';
	    // 	JTopo.Animate.stepByStep(node, {scaleX: 2}, 3000, true).start();  
	    // }
	    
	    if (alarmFlag) {
	    	// console.log("该节点出现故障!!")
	    	node.alarm ="warning";
            setInterval(function(){
                if(node.alarm == 'warning'){
                    node.alarm = null;
                    node.fillColor ='22,124,255';
                }else{
                    node.alarm = 'warning';
                    node.fillColor ='255, 0, 76';
                }
            }, 600); 
	    }

	   	// 监听新增节点画线事件
	   	var endNode = node;
	   	resultLinkArr.push(linkNode(parentNode, endNode, node.id.toString(), alarmFlag));

	   	return node;
	}

	// 右键节点出现菜单选项
	function rightClickMenue(e,nodeN){
        currentNode =nodeN;
        if(e.button == 2){// 右键
            // 当前位置弹出菜单（div）
            $("#contextmenu").css({
                top: e.pageY,
                left: e.pageX
            }).show(); 
        }
	}

	//	点击"设备信息" 菜单选项
	$("#basicDetail").click(function(event){
		// 当前位置弹出"设备信息" （div）
	    $("#basicDetailDiv").css({
	        top: event.pageY,
	        left: event.pageX
	    }).show();  

		//	填充详细字段信息 如: 自动显示设备名
        $("#device").text(currentNode.deviceName)
	})

	//	点击"故障信息" 菜单选项
	$("#errorDetail").click(function(event){
		// 当前位置弹出"故障信息" （div）
	    $("#errorDetailDiv").css({
	        top: event.pageY-50,
	        left: event.pageX-50
	    }).show();  
	})

	//	点击"操作窗口" 菜单选项
	$("#consoleDetail").click(function(event){
		// 当前位置弹出"操作窗口" （div）
	    $("#consoleDetailDiv").css({
	        top: event.pageY-50,
	        left: event.pageX-50
	    }).show();  

		//	填充详细字段信息 如: 自动显示设备Id
        $("#consoleId").text(currentNode.id)
	})

	//	点击"折叠" 菜单选项
	$("#foldNode").click(function(event){
		foldOpen(currentNode);
	});

	var parentIdArr =[];
	//	TODO: 向上递归查找当前节点的所有父节点
	function parentArr(nodeParent){
		parentIdArr.push(nodeParent.id);
		if (nodeParent.parent != undefined) {
			parentArr(nodeParent.parent);
		}
	}

	var circleNodeArr=[];
	function foldNode(nodeFold){
		// console.log("找到当前节点的所有父节点=========================>", nodeFold)
		if (nodeFold.parent != undefined) {
			parentArr(nodeFold.parent);
		}
		console.log("parentIdArr======找到当前节点的所有父节点==============>", parentIdArr)

		var flagNode = nodeFold;
		foldOpen(nodeFold);
		var circleNode = new JTopo.CircleNode('双击展开节点');
		circleNode.radius = 14; // 半径
		circleNode.fillColor = '10, 158, 162'; // 填充颜色
		circleNode.setLocation(currentNode.getLocation().x, currentNode.getLocation().y);
		circleNode.id = flagNode.id; 
		circleNode.serializedProperties.push("id"); 
		scene.add(circleNode); 
		//	折叠的时候隐藏掉其他的圆形节点(只需隐藏掉同一父节点下的子节点)
		circleNodeArr.push(circleNode); 
		console.log("circleNodeArr===================>", circleNodeArr)
		for (var j = 0; j < circleNodeArr.length; j++) {
			if (circleNodeArr[j].id > flagNode.id ) {
				circleNodeArr[j].visible = false;
			}
		}
		flagNode.visible = false;
		circleNode.dbclick(function(){
			// 双击圆形节点的时候需判断circleNodeArr里的是否出现
			for (var i = 0; i < circleNodeArr.length; i++) {
				if (circleNodeArr[i].id > flagNode.id) {
					circleNodeArr[i].visible = true;
				}

				if (circleNodeArr[i].id == circleNode.id) {
					console.log("在数组里移除掉这个点")
					circleNodeArr.splice(i);
				}
			}

			console.log("circleNodeArr=======删除掉之后的圆形节点数组============>", circleNodeArr)
			
			circleNode.visible = false;
			flagNode.visible = true;
			foldOpen(flagNode);
		})
	}

	var foldOpenStatus = {}; // 记录折叠状态
	function foldOpen(e){ // 折叠展开
		var thisNode = e.id; // 以当前节点id为 key
		var tarlink = e.outLinks;

		if(tarlink == undefined){
			return
		}
	
		if(tarlink.length != 0 && tarlink[0].visible === true){
			var status = [];
			for (var i = 0; i < tarlink.length; i++){
				status[i] = {node: tarlink[i].nodeZ.visible, link: tarlink[i].visible};
				foldOpenStatus[thisNode] = status;
				tarlink[i].nodeZ.visible = false;
				tarlink[i].visible = false;
				
				// 下一层还有节点
				if( tarlink[i].nodeZ.outLinks.length != 0){ 
					dbfold(tarlink[i].nodeZ.outLinks, foldOpenStatus[thisNode][i]);
				}
			}
		}else if(tarlink.length != 0 && tarlink[0].visible === false){
			for (var k = 0; k < tarlink.length; k++){
				tarlink[k].nodeZ.visible =  foldOpenStatus[thisNode][k].node;
				tarlink[k].visible = foldOpenStatus[thisNode][k].link;

				 // 下一层还有节点
				if( tarlink[k].nodeZ.outLinks.length != 0){
					dbOpen(tarlink[k].nodeZ.outLinks, foldOpenStatus[thisNode][k]);
				}
			}
		}

		function dbfold(dblink,foldStatus){
			var status = [];
			for(var j = 0; j < dblink.length; j++){
				status[j] = {node: dblink[j].nodeZ.visible, link: dblink[j].visible};
				foldStatus.status = status;
				dblink[j].nodeZ.visible = false;
				dblink[j].visible = false;

				if( dblink[j].nodeZ.outLinks.length != 0){ 
					dbfold(dblink[j].nodeZ.outLinks, foldStatus.status[j]);
				}
			}
		}
		function dbOpen(dblink, openStatus){
			for(var j = 0; j < dblink.length; j++){
				dblink[j].nodeZ.visible = openStatus.status[j].node;
				dblink[j].visible = openStatus.status[j].link;

				if( dblink[j].nodeZ.outLinks.length != 0){ 
					dbOpen(dblink[j].nodeZ.outLinks, openStatus.status[j]);
				}
			}
		}
	}

	//  当从右键菜单失去焦点的时候, 菜单隐藏
    $("#contextmenu").mouseleave(function(){
        $("#contextmenu").hide();
        currentNode =null;
    })

    //  当从"设备信息"失去焦点的时候, "设备信息"窗口隐藏
    $("#basicDetailDiv").mouseleave(function(){
        $("#basicDetailDiv").hide();
        currentNode =null;
    })

    //  当从"故障信息"失去焦点的时候, "故障信息"窗口隐藏
    $("#errorDetailDiv").mouseleave(function(){
        $("#errorDetailDiv").hide();
        currentNode =null;
    })

    //  当从"操作窗口"失去焦点的时候, "操作窗口"窗口隐藏
    $("#consoleDetailDiv").mouseleave(function(){
        $("#consoleDetailDiv").hide();
        currentNode =null;
    })

	//  实现连线
    function linkNode(nodeA, nodeB, text, alarmLinkFlag) {
    	if (!linkArr.includes(text)) {
		    linkArr.push(text);
	        var link = new JTopo.FoldLink(nodeA, nodeB, text);
	        link.arrowsRadius = 10; //箭头大小
	        link.lineWidth = 2; // 线宽
	        link.bundleOffset = 60; // 折线拐角处的长度
	        link.bundleGap = 20; // 线条之间的间隔
	        if (alarmLinkFlag == true) {
	        	link.dashedPattern = 5;
	        	link.strokeColor = '255, 0, 76'; // 线条颜色
	        }else{
	        	link.strokeColor = '234, 234, 20'; // 线条颜色
	        }
	       	// 为连线添加自定义属性
		    link.id = nodeB.id;    // 在创建节点的时候添加自定义属性   
		    link.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
		    scene.add(link);
	        return link;
        }else{
        	return "请勿重复连线!!";
        }
    }
    
    //	全自动布局(树形结构图)
	scene.doLayout(JTopo.layout.TreeLayout('down', 150, 150));

});