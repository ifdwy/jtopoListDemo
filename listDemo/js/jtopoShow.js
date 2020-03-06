/***************
1. 通过jtopoShowData里的数据渲染好拓扑结构图
2. 若有故障标志,则在拓扑结构里区分开来(动画显示当前故障节点)
3. 右键节点出现菜单栏(查看设备基本信息, 查看故障信息, 发送指令窗口)
4. 节点可以折叠与展开
5. TODO:当所有节点布局之后超出canvas的高度的时候需处理(应自适应)-- 暂时不做
6: 动画效果从起点到不同的终点动画效果 (1:删除节点之后,该节点下的动画也消失; 2: 该节点被折叠后,该节点下的动画也消失)
7: 删除节点功能,包括其下面的子节点与连线

**********************/

$(document).ready(function(){
    var canvas = document.getElementById('JtopoDemo');//获取画布
    var stage = new JTopo.Stage(canvas);//获取舞台
    var scene = new JTopo.Scene(stage);//把舞台添加到画布
    scene.background = 'img/background.jpg';//画布背景

    var nodeItemArr =[]; //	记住每个根节点的id
	var linkArr =[]; // 所有连线的数组
    var beginNode = null; // 连线的开始节点
    var currentNode = null; // 点击当前节点出现菜单栏
	var aniNodeArr =[];// 产生的所有动画节点

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

		    // 右键节点出现菜单选项
		    sNode.mouseup(function(e){
		    	rightClickMenue(e,sNode);
		    });

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
		var node = new JTopo.Node(nodeArgum.name);    // 创建一个节点
		node.shadow = true;
		node.borderWidth =5;
		node.borderRadius = 12;
		node.borderColor ="0, 248, 255";
		node.dragable = false;
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
	    scene.add(node); // 放入到场景中


	    //	右键节点出现菜单选项
	    node.mouseup(function(e){
	    	rightClickMenue(e,node);
	    })

	    // 若节点出现故障
	    if (alarmFlag) {
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

	var foldOpenStatus = {}; // 记录折叠状态
	function foldOpen(e){ // 折叠展开
		var thisNode = e.id; // 以当前节点id为 key
		var tarlink = e.outLinks;

		if(tarlink == undefined){
			return ;
		}
		if(tarlink.length != 0 && tarlink[0].visible === true){
			var status = [];
			//	该颜色代表可以展开
			e.fillColor="51, 222, 15";
			for (var i = 0; i < tarlink.length; i++){
				status[i] = {node: tarlink[i].nodeZ.visible, link: tarlink[i].visible};
				foldOpenStatus[thisNode] = status;
				tarlink[i].nodeZ.visible = false;
				tarlink[i].visible = false;
				
				hideOshowAniNode(tarlink[i].nodeZ, true);

				// 下一层还有节点
				if( tarlink[i].nodeZ.outLinks.length != 0){ 
					dbfold(tarlink[i].nodeZ.outLinks, foldOpenStatus[thisNode][i]);
				}
			}
		}else if(tarlink.length != 0 && tarlink[0].visible === false){
			//	将颜色还原
			e.fillColor="22,124,255";
			for (var k = 0; k < tarlink.length; k++){
				tarlink[k].nodeZ.visible =  foldOpenStatus[thisNode][k].node;
				tarlink[k].visible = foldOpenStatus[thisNode][k].link;
				hideOshowAniNode(tarlink[k].nodeZ, false);
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

				hideOshowAniNode(dblink[j].nodeZ, true);

				if( dblink[j].nodeZ.outLinks.length != 0){ 
					dbfold(dblink[j].nodeZ.outLinks, foldStatus.status[j]);
				}
			}
		}
		function dbOpen(dblink, openStatus){
			for(var j = 0; j < dblink.length; j++){
				dblink[j].nodeZ.visible = openStatus.status[j].node;
				dblink[j].visible = openStatus.status[j].link;
				hideOshowAniNode(dblink[j].nodeZ, false);
				
				if( dblink[j].nodeZ.outLinks.length != 0){ 
					dbOpen(dblink[j].nodeZ.outLinks, openStatus.status[j]);
				}
			}
		}
	}

	// 点击删除该节点
	$("#delNode").click(function(){
		if (currentNode.id == 1) {
			alert("根节点不能删除!")
		}else{
			var outLinks =currentNode.outLinks;
			if (outLinks.length ==0) {
				scene.remove(currentNode);
				updateNodeArr(currentNode);// 删除节点之后更新以前保存的数组
			}else{
				for (var i = 0; i < outLinks.length; i++) {
					//	判断是否还有子节点
					if (outLinks[i].nodeZ.outLinks !=0) {
						untilDel(outLinks[i].nodeZ.outLinks);// 有则继续向下删
					}else{
						scene.remove(outLinks[i].nodeZ);
						updateNodeArr(outLinks[i].nodeZ);
					}
					scene.remove(outLinks[i].nodeA);
					updateNodeArr(outLinks[i].nodeA);
				}
			}

		}
		$("#contextmenu").hide();
	})

	// 删除该节点及该节点下的所有节点与连线
	function untilDel(deLink){
		for (var i = 0; i < deLink.length; i++) {
			//	判断是否还有子节点
			if (deLink[i].nodeZ.outLinks !=0) {
				untilDel(deLink[i].nodeZ.outLinks);// 有则继续向下删
			}else{
				scene.remove(deLink[i].nodeZ);
				updateNodeArr(deLink[i].nodeZ);

			}
			scene.remove(deLink[i].nodeA);
			updateNodeArr(deLink[i].nodeA);
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
	        var link = new JTopo.Link(nodeA, nodeB, text);
	        link.shadow = true;
	        link.alpha =0.8;
	        // link.arrowsRadius = 25; //箭头大小
	        link.lineWidth = 10; // 线宽
	        // link.bundleOffset = 60; // 折线拐角处的长度
	        // link.bundleGap = 20; // 线条之间的间隔
	        if (alarmLinkFlag == true) {
	        	link.dashedPattern = 5;
	        	link.strokeColor = '255, 0, 76'; // 线条颜色
	        }else{
	        	link.strokeColor = '234, 234, 20'; // 线条颜色
	        }
	       	// 为连线添加自定义属性
		    link.id = nodeB.id;    // 在创建节点的时候添加自定义属性   
		    link.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
		    // link.visible =false;
		    scene.add(link);
	        return link;
        }else{
        	return "请勿重复连线!!";
        }
    }

    //	全自动布局(树形结构图)
	scene.doLayout(JTopo.layout.TreeLayout('right', 80, 150));
	
	
	// 若有节点被删除则更新保存节点的数组
	function updateNodeArr(del){
		hideOshowAniNode(del, true);
		resultNodeArr = resultNodeArr.filter(function(item){
			return item.id != del.id;
		})
	}

	//	隐藏当前节点产生的所有动态节点
	function hideOshowAniNode(hideAni, hideFlag){
		for (var i = 0; i < aniNodeArr.length; i++) {
			if (aniNodeArr[i].id == hideAni.id) {
				if (hideFlag) {// 隐藏
					aniNodeArr[i].visible =false;
				}else{// 显示
					aniNodeArr[i].visible =true;
				}
			}
		}
	}
	
	// 实现开始节点到不同的终点的动画
	animateFun(resultNodeArr);
	function animateFun(res){
		for (var i = 0; i < res.length; i++) {
			if(res[i].inLinks.length !=0){
				var inLinks = res[i].inLinks;
				for (var j = 0; j < inLinks.length; j++) {
					for(var c=0; c<20; c++){
						var animateNode = new JTopo.CircleNode();
						animateNode.id =inLinks[j].nodeZ.id;
						animateNode.serializedProperties.push("id");
						animateNode.radius =5;
						animateNode.alpha =0.8;
						animateNode.fillColor = "204, 240, 241";
						animateNode.setLocation(inLinks[j].nodeA.getCenterLocation().x, inLinks[j].nodeA.getCenterLocation().y)
						scene.add(animateNode);
						JTopo.Animate.stepByStep(animateNode, {x: inLinks[j].nodeZ.getCenterLocation().x, y: inLinks[j].nodeZ.getCenterLocation().y+0.1}, 1000*c, true).start();
						aniNodeArr.push(animateNode);
	            	}
				}
			}
		}
	}

});