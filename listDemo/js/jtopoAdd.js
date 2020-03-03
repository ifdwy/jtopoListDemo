$(document).ready(function(){
    var canvas = document.getElementById('JtopoAdd');//获取画布
    var stage = new JTopo.Stage(canvas);//获取舞台
    var scene = new JTopo.Scene(stage);//把舞台添加到画布
    scene.background = 'img/background.jpg';//画布背景

    var currentNode = null;// 当前节点
    
    //	创建一个根节点
    var sNode = new JTopo.Node("start node");    // 创建一个节点
    sNode.setLocation(800,200);    // 设置节点坐标
    // 为根节点添加 ID 属性
    sNode.id = 0; 
    sNode.serializedProperties.push("id");
    scene.add(sNode); // 放入到场景中

    //	点击节点出现右键菜单
    sNode.addEventListener('mouseup', function(event){
        currentNode = this;
        handler(event);
    });

    function handler(event){
        if(event.button == 2){// 右键
            // 当前位置弹出菜单（div）
            $("#contextmenu").css({
                top: event.pageY,
                left: event.pageX
            }).show();    
         }
    }

    //	右键菜单处理    
    var map={};
    var mapArr=[];
    $("#contextmenu a").click(function(e){
        var text = $(this).text();
                
        if(text == '添加摄像点'){
        	// 弹出添加摄像点的新增窗口
        	$("#consoleDetailDiv").css({
        		top: e.pageY,
                left: e.pageX
            }).show();

        }if(text == '添加站点'){
        	var type ="站点";
        	var resNode = addNode(type);
        	resultMap(resNode);
        }else if(text == '添加卡口'){
        	console.log("===========添加卡口============");
        }
        $("#contextmenu").hide();
    });
            
    //	添加摄像点保存成功之后再加节点与线
    $("#submitBtn").click(function(){
        console.log("保存成功!");
        $("#consoleDetailDiv").hide();
            var type ="摄像点";
	        var resNode = addNode(type);
	        resultMap(resNode);
        });

    //	添加摄像点选择取消按钮
    $("#cancelBtn").click(function(){
        $("#consoleDetailDiv").hide();
    })


    //	实现添加摄像点
    var count =1;
    function addNode(type){
    	// 渲染节点
    	var node = new JTopo.Node(type+count);
	    node.id = count++;
	    node.serializedProperties.push("id");
	    node.typeName =type;
	    node.serializedProperties.push("typeName");
    	node.setLocation(currentNode.x+100, currentNode.y)
    	if(type == '站点'){
    		node.fillColor ='99, 234, 7';
    	}
    	scene.add(node);

    	// 出现右键菜单栏
    	node.addEventListener('mouseup', function(event){
	        currentNode = this;
	        handler(event);
    	});

		// 自动连线
    	autoLink(node);

    	return node;
    }
    // 实现自动连线
    function autoLink(node){
    	var link = new JTopo.FoldLink(currentNode, node);
    	link.strokeColor = '234, 234, 20'; // 线条颜色
	    link.arrowsRadius = 10; //箭头大小
	    link.lineWidth = 2; // 线宽
	    link.bundleOffset = 60; // 折线拐角处的长度
	    link.bundleGap = 20; // 线条之间的间隔
    	scene.add(link);

    	return link;
    }

    function resultMap(resNode){
		if (resNode.inLinks.length !=0) {
		    if($.isEmptyObject(map)){
		        mapArr.push({type: resNode.typeName, name: resNode.text, id: resNode.id});
		        map[resNode.inLinks[0].nodeA.text] =mapArr;
		    }else{
		        if (Object.keys(map).includes(resNode.inLinks[0].nodeA.text)) {
			        // 如果对象里已经有这个节点的对应数据了,则往里面加数据
			        for(var item in map){
			        	if (item == resNode.inLinks[0].nodeA.text) {
			        		map[item].push({type: resNode.typeName, name: resNode.text, id: resNode.id});
			        	}
			        }
		        }else{
		        	mapArr=[];
			        mapArr.push({type: resNode.typeName, name: resNode.text, id: resNode.id});
			        map[resNode.inLinks[0].nodeA.text] =mapArr;
		        }
		    }
		}
        console.log("map==========最终==============>", map)
    }
 
 

})