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
    var currentNode = null; // 点击当前节点出现菜单栏
	var aniNodeArr =[];// 产生的所有动画节点

	//  实现连线
    let linkNode=(nodeA, nodeB, text, alarmLinkFlag) =>{
    	if (!linkArr.includes(text)) {
		    linkArr.push(text);
	        var link = new JTopo.Link(nodeA, nodeB, text);
	        link.shadow = true;
	        link.alpha =0.8;
	        link.lineWidth = 10; // 线宽
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

    // 新增节点函数
	let addNode =(parentNode, nodeArgum) =>{
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
	    node.mouseup(e =>rightClickMenue(e,node));

	    // 若节点出现故障
	    if (nodeArgum.alarm) {
	    	node.alarm ="warning";
            setInterval(() =>{
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
	   	resultLinkArr.push(linkNode(parentNode, endNode, node.id.toString(), nodeArgum.alarm));

	   	return node;
	}
    
    var resultNodeArr=[];// 新增节点函数返回的结果
    var resultLinkArr=[];
    for(let elem of dataList.values()){
    	if (elem.isRoot) {
    		var sNode = new JTopo.Node("start node");    // 创建一个节点
		    // 为根节点添加 ID 属性
		    sNode.id = elem.id;    // 在创建节点的时候添加自定义属性   
		    sNode.serializedProperties.push("id"); // 把自定义属性加入进节点的属性组 serializedProperties 中
		    // 为根节点添加 parentId 属性
		    sNode.parentId = elem.parentId;    
		    sNode.serializedProperties.push("parentId");
		    // 为根节点添加 breakdown (故障)属性
		    sNode.breakdown = elem.alarm;    
		    sNode.serializedProperties.push("breakdown");
		    // 为根节点添加 deviceName (设备名)属性
		    sNode.deviceName = elem.name;
		    sNode.serializedProperties.push("deviceName");
		    
		    scene.add(sNode); // 放入到场景中

		    // 右键节点出现菜单选项
		    sNode.mouseup(e=> rightClickMenue(e,sNode));
    	}else{
    		if (elem.parentId == sNode.id) {//	根节点下的第一层
	    		resultNodeArr.push(addNode(sNode, elem));
	    	}else{
	    		for(let oElem of resultNodeArr.values()){
	    			if (elem.parentId == oElem.id) {//	根节点下的第二层及下面的层
	    				resultNodeArr.push(addNode(oElem, elem));
	    			}
	    		}
	    	}
    	}
    }

	// 右键节点出现菜单选项
	var rightClickMenue= (e,nodeN)=>{
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
	$("#basicDetail").click(event=>{
		// 当前位置弹出"设备信息" （div）
	    $("#basicDetailDiv").css({
	        top: event.pageY,
	        left: event.pageX
	    }).show();  

		//	填充详细字段信息 如: 自动显示设备名
        $("#device").text(currentNode.deviceName)
	})

	//	点击"故障信息" 菜单选项
	$("#errorDetail").click(event=>{
		// 当前位置弹出"故障信息" （div）
	    $("#errorDetailDiv").css({
	        top: event.pageY-50,
	        left: event.pageX-50
	    }).show();  
	})

	//	点击"操作窗口" 菜单选项
	$("#consoleDetail").click(event=>{
		// 当前位置弹出"操作窗口" （div）
	    $("#consoleDetailDiv").css({
	        top: event.pageY-50,
	        left: event.pageX-50
	    }).show();  

		//	填充详细字段信息 如: 自动显示设备Id
        $("#consoleId").text(currentNode.id)
	})

	//	点击"折叠" 菜单选项
	$("#foldNode").click(event =>foldOpen(currentNode));

	let foldOpenStatus = {}; // 记录折叠状态
	let dbfold= (dblink,foldStatus)=>{
		var status = [];
		for(let [index, dbElem] of dblink.entries()){
			status[index] = {node: dbElem.nodeZ.visible, link: dbElem.visible};
			foldStatus.status = status;
			dbElem.nodeZ.visible = false;
			dbElem.visible = false;

			hideOshowAniNode(dbElem.nodeZ, true);

			if( dbElem.nodeZ.outLinks.length != 0){ 
				dbfold(dbElem.nodeZ.outLinks, foldStatus.status[index]);
			}
		}
	}
	
	let dbOpen= (dblink, openStatus)=>{
		for(let [index, dbElem] of dblink.entries()){
			dbElem.nodeZ.visible = openStatus.status[index].node;
			dbElem.visible = openStatus.status[index].link;
			hideOshowAniNode(dbElem.nodeZ, false);
				
			if( dbElem.nodeZ.outLinks.length != 0){ 
				dbOpen(dbElem.nodeZ.outLinks, openStatus.status[index]);
			}
		}
	}

	var foldOpen= e =>{ // 折叠展开
		var thisNode = e.id; // 以当前节点id为 key
		var tarlink = e.outLinks;

		if(tarlink == undefined){
			return ;
		}
		if(tarlink.length != 0 && tarlink[0].visible === true){
			var status = [];
			//	该颜色代表可以展开
			e.fillColor="51, 222, 15";
			for (let [index, tarElem] of tarlink.entries()){
				status[index] = {node: tarElem.nodeZ.visible, link: tarElem.visible};
				foldOpenStatus[thisNode] = status;
				tarElem.nodeZ.visible = false;
				tarElem.visible = false;
				
				hideOshowAniNode(tarElem.nodeZ, true);

				// 下一层还有节点
				if( tarElem.nodeZ.outLinks.length != 0){ 
					dbfold(tarElem.nodeZ.outLinks, foldOpenStatus[thisNode][index]);
				}
			}
		}else if(tarlink.length != 0 && tarlink[0].visible === false){
			//	将颜色还原
			e.fillColor="22,124,255";
			for (let [index, tarElem] of tarlink.entries()){
				tarElem.nodeZ.visible =  foldOpenStatus[thisNode][index].node;
				tarElem.visible = foldOpenStatus[thisNode][index].link;
				hideOshowAniNode(tarElem.nodeZ, false);
				 // 下一层还有节点
				if( tarElem.nodeZ.outLinks.length != 0){
					dbOpen(tarElem.nodeZ.outLinks, foldOpenStatus[thisNode][index]);
				}
			}
		}
	} 

	// 点击删除该节点
	$("#delNode").click(()=>{
		if (currentNode.id == 1) {
			alert("根节点不能删除!")
		}else{
			var outLinks =currentNode.outLinks;
			if (outLinks.length ==0) {
				scene.remove(currentNode);
				updateNodeArr(currentNode);// 删除节点之后更新以前保存的数组
			}else{
				for (let outElem of outLinks.values()) {
					//	判断是否还有子节点
					if (outElem.nodeZ.outLinks !=0) {
						untilDel(outElem.nodeZ.outLinks);// 有则继续向下删
					}else{
						scene.remove(outElem.nodeZ);
						updateNodeArr(outElem.nodeZ);
					}
					scene.remove(outElem.nodeA);
					updateNodeArr(outElem.nodeA);
				}
			}

		}
		$("#contextmenu").hide();
	})

	// 删除该节点及该节点下的所有节点与连线
	let untilDel= deLink =>{
		for (let deElem of deLink.values()) {
			//	判断是否还有子节点
			if (deElem.nodeZ.outLinks !=0) {
				untilDel(deElem.nodeZ.outLinks);// 有则继续向下删
			}else{
				scene.remove(deElem.nodeZ);
				updateNodeArr(deElem.nodeZ);

			}
			scene.remove(deElem.nodeA);
			updateNodeArr(deElem.nodeA);
		}		
	}

	//  当从右键菜单失去焦点的时候, 菜单隐藏
	let domHide = idName =>{
		$("#"+idName).hide();
        currentNode =null;
	}

	//  当从右键菜单失去焦点的时候, 菜单隐藏
    $("#contextmenu").mouseleave(()=> domHide('contextmenu'))

    //  当从"设备信息"失去焦点的时候, "设备信息"窗口隐藏
    $("#basicDetailDiv").mouseleave(()=> domHide('basicDetailDiv') )

    //  当从"故障信息"失去焦点的时候, "故障信息"窗口隐藏
    $("#errorDetailDiv").mouseleave(()=> domHide('errorDetailDiv') )

    //  当从"操作窗口"失去焦点的时候, "操作窗口"窗口隐藏
    $("#consoleDetailDiv").mouseleave(()=> domHide('consoleDetailDiv') )

    //	全自动布局(树形结构图)
	scene.doLayout(JTopo.layout.TreeLayout('right', 80, 150));
	
	// 若有节点被删除则更新保存节点的数组
	let updateNodeArr= del=>{
		hideOshowAniNode(del, true);
		resultNodeArr = resultNodeArr.filter(item=>{
			return item.id != del.id;
		})
	}

	//	隐藏当前节点产生的所有动态节点
	let hideOshowAniNode= (hideAni, hideFlag)=>{
		for (let aniElem of aniNodeArr.values()) {
			if (aniElem.id == hideAni.id) {
				if (hideFlag) {// 隐藏
					aniElem.visible =false;
				}else{// 显示
					aniElem.visible =true;
				}
			}
		}
	}
	
	// 实现开始节点到不同的终点的动画
	let animateFun= res=>{
		for (let resElem of res.values()) {
			if(resElem.inLinks.length !=0){
				var inLinks = resElem.inLinks;
				for (let inElem of inLinks.values()) {
					for(var c=0; c<20; c++){
						var animateNode = new JTopo.CircleNode();
						animateNode.id =inElem.nodeZ.id;
						animateNode.serializedProperties.push("id");
						animateNode.radius =5;
						animateNode.alpha =0.8;
						animateNode.fillColor = "204, 240, 241";
						animateNode.setLocation(inElem.nodeA.getCenterLocation().x, inElem.nodeA.getCenterLocation().y)
						scene.add(animateNode);
						JTopo.Animate.stepByStep(animateNode, {x: inElem.nodeZ.getCenterLocation().x, y: inElem.nodeZ.getCenterLocation().y+0.1}, 1000*c, true).start();
						aniNodeArr.push(animateNode);
	            	}
				}
			}
		}
	}
	animateFun(resultNodeArr);

});