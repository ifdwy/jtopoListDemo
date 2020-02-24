$(document).ready(function(){
    var canvas = document.getElementById('Jtopo');//获取画布
    var stage = new JTopo.Stage(canvas);//获取舞台
    //显示工具栏
    //showJTopoToobar(stage);
    var scene = new JTopo.Scene(stage);//把舞台添加到画布
    scene.background = 'img/background.jpg';//画布背景

    //	左边可控制区域canvas
    var canvTool = document.getElementById('toolDiv');//获取画布
    var stageTool = new JTopo.Stage(canvTool);//获取舞台
    var sceneTool = new JTopo.Scene(stageTool);//把舞台添加到画布
    sceneTool.background = 'img/toolBg.jpg';//画布背景
    //	tool-title
    var msgNode = new JTopo.TextNode("可操作节点区域");
    msgNode.zIndex++;
    msgNode.setBound(120, 0);
    msgNode.fontColor = "1, 1, 21";
    msgNode.font = "22px Consolas"
    sceneTool.add(msgNode);

    //	循环遍历所有可添加的节点
	var sliceNodeArr = [];
	for(var i=0, len=nodeArr.length; i<len; i+=5) {
	   sliceNodeArr.push(nodeArr.slice(i,i+5));
	}
	for (var i = 0; i < sliceNodeArr.length; i++) {
		var data = sliceNodeArr[i]; 
		for (var j = 0; j < data.length; j++) {
			var node = new JTopo.Node(data[j].name);
			node.setLocation(j*100, (i+1)*100);
			node.setImage(data[j].img);
		    node.setSize(50, 50);
			node.fontColor = "1, 1, 21";
		    node.dragable =false;
			sceneTool.add(node); 
		}
	}
	var currentNode =null;
	//	点击左侧的节点生成相应的节点
	sceneTool.click(function(e){
		console.log("e===============>", e.scene.selectedElements[0])
		var nodeName = e.scene.selectedElements[0].text;
		var imgData = e.scene.selectedElements[0].image.src;
		var imgPath =imgData.substr(imgData.lastIndexOf('/'),imgData.length); //  /set1.jpg
		var newNode = new JTopo.Node(nodeName);
        newNode.setBound(560, 183,50, 50);
        newNode.setImage('img' + imgPath);
        scene.add(newNode);

        //	复制节点的右键菜单--删除
	    // newNode.mouseup(function(e){
	    // 	console.log("e.button============>", e.button)
	    //     currentNode =this;
	    //     if(e.button == 2){// 右键
	    //         // 当前位置弹出菜单（div）
	    //         $("#deleteNode").css({
	    //             top: e.pageY,
	    //             left: e.pageX
	    //         }).show();    
	    //     }
	    // });
	
	});

	//	连线
    var beginNode = null;
    var tempNodeA = new JTopo.Node('tempA');
    tempNodeA.setSize(1, 1);
            
    var tempNodeZ = new JTopo.Node('tempZ');
    tempNodeZ.setSize(1, 1);
            
    var link = new JTopo.Link(tempNodeA, tempNodeZ);	

    scene.mouseup(function(e){
        if(e.button == 2){
            scene.remove(link);
            return;
        }
        if(e.target != null && e.target instanceof JTopo.Node){
            if(beginNode == null){
                beginNode = e.target;
                scene.add(link);
                tempNodeA.setLocation(e.x, e.y);
                tempNodeZ.setLocation(e.x, e.y);
            }else if(beginNode !== e.target){
                var endNode = e.target;
                var l = new JTopo.Link(beginNode, endNode);
                scene.add(l);
                beginNode = null;
                scene.remove(link);
            }else{
                beginNode = null;
            }
        }else{
            scene.remove(link);
        }
    }); 
    
    scene.mousedown(function(e){
        if(e.target == null || e.target === beginNode || e.target === link){
            scene.remove(link);
        }
    });
            
    scene.mousemove(function(e){
        tempNodeZ.setLocation(e.x, e.y);
    });

    scene.click(function(e){
    	console.log("scene.selectedElements=================>", e.scene.selectedElements)
    	var deleteCurLink = e.scene.selectedElements[0];
    	if (deleteCurLink!= null && deleteCurLink.elementType == "link") {
    		scene.remove(deleteCurLink);
    	}
    })

})
