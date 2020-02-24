$(document).ready(function(){
    var canvas = document.getElementById('Jtopo');//获取画布
    var stage = new JTopo.Stage(canvas);//获取舞台
    //显示工具栏
    //showJTopoToobar(stage);
    var scene = new JTopo.Scene(stage);//把舞台添加到画布
    scene.background = 'img/background.jpg';//画布背景

    // 根节点
    var s1 = node(450, 43, 'set1.jpg', '设备1');

    var s = node(450, 143, 'set1.jpg');
    var link = linkNode(s1, s);
    //  将所有节点图片渲染出来
    function node(x, y, img, name) {
        var node = new JTopo.Node();
        node.setBound(x, y, 50, 50);
        node.setImage('img/'+img);
        node.text = name;
        node.dragable =false;
        scene.add(node);
        return node;
    }  

    // 第一个分支点
    var s2 = node(250, 283, 'set2.jpg', '设备2');
    
    var link1 = linkNode(s, s2);

    // 第二个分支点
    var s3 = node(450, 283, 'set3.jpg', '设备3');
    
    var link2 = linkNode(s, s3);

    // 第三个分支点
    var s4 = node(650, 283, 'set4.jpg', '设备4');
    
    var link3 = linkNode(s, s4);
    //  连线
    function linkNode(nodeA, nodeB) {
        var link = new JTopo.FoldLink(nodeA, nodeB);
        link.arrowsRadius = 10; //箭头大小
        link.lineWidth = 2; // 线宽
        link.bundleOffset = 60; // 折线拐角处的长度
        link.bundleGap = 20; // 线条之间的间隔
        link.strokeColor = '255, 0, 76'; // 线条颜色
        scene.add(link);
        return link;
    }
    s1.addEventListener('mouseup', function(event){
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

    //  当从右键菜单失去焦点的时候, 菜单隐藏
    $("#contextmenu").mouseleave(function(){
        $("#contextmenu").hide();
    })

    //  右键菜单--展开详情
    $("#showDetail").click(function(){
        $("#tabDetail").show();
    })

    //  右键菜单--隐藏详情
    $("#hideDetail").click(function(){
        $("#tabDetail").hide();
    })

    // 双击查看详情
    s1.addEventListener('dbclick', function(event){
        $("#tabDetail").show();
    });  

    // 可copy的节点
    var s5 = node(60, 83, 'set5.jpg', '可复制的节点');
    //  拖动这一操作的时候需要复制一个相同的节点
    //  1.若该节点被选中,则进行复制的操作
    
    var currentNode = null;
    s5.addEventListener('click', function(event){
        // console.log("getLocation=============>", s5.getLocation())
        // console.log("event=============>", event)
        // console.log("s5.selected=============>", s5.selected)
        var newNode = addNewNode(s5);
        //  弹出右键菜单
        newNode.mouseup(function(e){
            currentNode =this;
            if(e.button == 2){// 右键
                // 当前位置弹出菜单（div）
                $("#deleteNode").css({
                    top: e.pageY,
                    left: e.pageX
                }).show();    
            }
        });

        // 加线
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
    })

    // 生成copy的节点
    function addNewNode(curNode) {
        var newNode = new JTopo.Node()  ;
        newNode.setBound(160, 183,50, 50);
        newNode.setImage('img/set5.jpg');
        scene.add(newNode);
        return newNode;
    }
    
    // 删除节点
    $("#delete").click(function(){
        scene.remove(currentNode);
        currentNode = null;
        $("#deleteNode").hide();
    })

    //  当从右键菜单失去焦点的时候, 菜单隐藏
    $("#deleteNode").mouseleave(function(){
        $("#deleteNode").hide();
    })


    // var node = new JTopo.Node("Hello");//新节点 默认test=hello
    // node.setLocation(409, 269);//节点位置
    // scene.add(node);//将节点添加到场景

    // node.mousedown(function(event){//设置鼠标事件
    //     if(event.button == 2){
    //         node.text = '按下右键';
    //     }else if(event.button == 1){
    //         node.text = '按下中键';
    //     }else if(event.button == 0){
    //         node.text = '按下左键';
    //     }
    // });

    // node.mouseup(function(event){
    //     if(event.button == 2){
    //         node.text = '松开右键';
    //     }else if(event.button == 1){
    //         node.text = '松开中键';
    //     }else if(event.button == 0){
    //         node.text = '松开左键';
    //     }
    // });
    // node.click(function(event){
    //     console.log("单击");
    // });
    // node.dbclick(function(event){
    //     console.log("双击");
    // });
    // node.mousedrag(function(event){
    //     console.log("拖拽");
    // });
    // node.mouseover(function(event){
    //     console.log("mouseover");
    // });
    // node.mousemove(function(event){
    //     console.log("mousemove");
    // });
    // node.mouseout(function(event){
    //     console.log("mouseout");
    // });

});