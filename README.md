# jtopoListDemo
jtoposhow.js里的功能主要有:
1. 通过jtopoShowData里的数据渲染好拓扑结构图
2. 若有故障标志,则在拓扑结构里区分开来(动画显示当前故障节点)
3. 右键节点出现菜单栏(查看设备基本信息, 查看故障信息, 发送指令窗口)
4. 节点可以折叠与展开
5. TODO:当所有节点布局之后超出canvas的高度的时候需处理(应自适应)-- 暂时不做
6: 动画效果从起点到不同的终点动画效果 (1:删除节点之后,该节点下的动画也消失; 2: 该节点被折叠后,该节点下的动画也消失)
7: 删除节点功能,包括其下面的子节点与连线
