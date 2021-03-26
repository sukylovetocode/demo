/*
* 渲染结构： 
*     <div class="container">
        <ul>    
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
      </div>

    期待的样子: 维护的对象表
    {type:'div',props:{ 'class': 'container' },children:[]}
*/

const c = {type:'div',props:{ 'class': 'container1' },text:'text',children:[{
    type:'ul',props:{},children:[{
        type:'li',props:{},children:[],text:'item1'
    },{
        type:'li',props:{},children:[{
            type:'span',props:{},children:[],text:'123'
        },{
            type:'span',props:{},children:[],text:'234'
        }],text:''
    },{
        type:'li',props:{},children:[],text:'item3'
    }],text:''
}]}
const d = {type:'div',props:{ 'class': 'container1' },text:'text',children:[{
    type:'ul',props:{},children:[{
        type:'li',props:{},children:[{
            type:'span',props:{},children:[],text:'123'
        },{
            type:'span',props:{},children:[],text:'234'
        }],text:''
    },{
        type:'li',props:{},children:[],text:'item1'
    },{
        type:'li',props:{},children:[],text:'item3'
    }],text:''
}]}
/** 根据VDOM对象表生成实际的DOM节点，为了优化渲染要保存一个唯一的Key值 */
function createElement(node){
    node.elm = document.createElement(node.type)
    // 假如有文本节点且是最后
    if(node.text && node.children.length === 0){
       VnodeToHtml.appendChild(node.elm, VnodeToHtml.createTextNode(node.text))
     }
    /** 处理属性 */
    for(let prop in node.props){
        node.elm.setAttribute(prop, node.props[prop])
    }
    /** 有子节点遍历 */
    if(node.children){
        for(let child of node.children){
            node.elm.appendChild(createElement(child))
        }
    }
    return node.elm
}

/** diff 找出不一致的地方进行更新 同层级比较 O(n) 先序深度优先，广度优先 */
// 是否为同一个节点，且属性值是否相等
function isSameVnode(oldVnode, newVnode){
    return oldVnode.type === newVnode.type && oldVnode.key === newVnode.key
}

// 比较属性是否相等
function updateProps(oldVnode, newVnode){
    let oldProps = oldVnode.props
    let newProps = newVnode.props
    for(let prop in oldProps){
        // 没有这个属性
        if(oldProps[prop] !== newProps[prop]){
            // 查看是哪里没有
            if(oldProps[prop] === null){
                // 新节点增加
                oldVnode.elm.removeAttribute(prop, newProps[prop])
            }else{
                // 减少这个节点
                oldVnode.elm.setAttribute(prop, newProps[prop])
            }
        }
    }
}


function patch(oldVnode, newVnode){
    // 比较节点是否相等
    if(isSameVnode(oldVnode, newVnode)){
        console.log('节点相等，继续比较')
        // 比较属性值是否相等
        updateProps(oldVnode, newVnode);     
        // 重头戏：比较孩子  
        // 1 假如孩子是简单的文本节点
        if(oldVnode.text && oldVnode.children.length === 0 && newVnode.text && newVnode.children.length === 0 && oldVnode.text !== newVnode.text){
            console.log('节点文本不等，更换文本')
            VnodeToHtml.setTextContent(oldVnode.elm, newVnode.text)
            return
        }
        
        // 2 假如只有一方有孩子
        if(oldVnode.children[0] && !newVnode.children[0]){
            // 新节点没有子节点，删除子节点
            console.log('删除子节点')
           for(let child of oldVnode.children){
               VnodeToHtml.removeChild(oldVnode.elm, child.elm)
           }
           if(newVnode.text){ // 删除文本
                VnodeToHtml.setTextContent(oldVnode.elm, newVnode.text)
            }
           return
        }else if(!oldVnode.children[0] && newVnode.children[0]){
            // 新节点有子节点旧元素没有，增加子节点
            console.log('增加子节点')
            if(oldVnode.text){ // 删除文本
                VnodeToHtml.setTextContent(oldVnode.elm, '')
            }
            for(let child of newVnode.children){
                VnodeToHtml.appendChild(oldVnode.elm, createElement(child))
            }
            return
        }

        // 3 两方都有孩子，要对孩子做具体比较,只能比较和原来的节点有何不同 
        // 暴力解法 只要有一方的节点不相等就直接删除并且重新赋值
        for(let count =0;count<oldVnode.children.length;count++){
            // 存在直接比较
            if(newVnode.children[count]){
                patch(oldVnode.children[count], newVnode.children[count])
            }else{
                // 不存在表示新节点这里已经删除
                console.log('删除节点')
                VnodeToHtml.removeChild(oldVnode.elm,oldVnode.children[count].elm)
            }
        }
        // 没到结尾，就新增新节点
        let newLen = newVnode.children.length
        if(newLen > oldVnode.children.length){
            let gap = newLen - oldVnode.children.length + 1
            for(let i = gap;i < newLen;i++){
                console.log('增加新节点')
                VnodeToHtml.appendChild(oldVnode.elm,createElement(newVnode.children[i]))
            }
        }
        
        return
    }else{
        console.log('节点不等，直接替换')
        let parent = VnodeToHtml.parentNode(oldVnode.elm)
        if(parent !== null){
            VnodeToHtml.removeChild(parent, oldVnode.elm)
            VnodeToHtml.appendChild(parent, createElement(newVnode))
        }else{
            // 直接生成新节点
            return createElement(newVnode)
        }
    }
}


document.querySelector('#app').appendChild(createElement(c))
patch(c,d)
// console.log(c)
// console.log(d)

