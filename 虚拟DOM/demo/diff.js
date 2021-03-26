/** 性能更加优化的patch */
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
        type:'span',props:{},children:[],text:'item2'
    },{
        type:'p',props:{},children:[],text:'item3'
    }],text:''
}]}
const d = {type:'div',props:{ 'class': 'container1' },text:'text',children:[{
    type:'ul',props:{},children:[{
        type:'span',props:{},children:[],text:'item2'
    },{
        type:'p',props:{},children:[],text:'item3'
    },{
        type:'li',props:{},children:[],text:'item1'
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

/**
 *
 *
 * @param {*} oldVnode
 * @param {*} newVnode
 * @return {*} 
 */
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
        updateChildren(oldVnode.elm,oldVnode.children,newVnode.children)     
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

function updateChildren(parent, oldChildren,newChildren){
     /** 
         * 两方孩子比较情况
         * 1 头头对比 尾部增加或者减少了节点 ABCD => ABCDE
         * 2 尾尾对比 头部增加或者减少了节点 ABC => BC
         * 3 老尾新头对比 ABCD => DABC
         * 4 老头新尾对比 ABCD => BCDA 
         * 5 Key对比 ABCD => BCAD
         * 
         * 循环对比知道任一数组头指针超过尾指针d
    */
   let oldStartIdx = 0,oldStartVnode = oldChildren[0],oldEndIdx = oldChildren.length - 1,oldEndVnode = oldChildren[oldEndIdx]
   let newStartIdx = 0,newStartVnode = newChildren[0],newEndIdx = newChildren.length - 1,newEndVnode = newChildren[newEndIdx]
    // 循环对比知道任一数组头指针超过尾指针
    while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx){
        // 头头对比
        if(isSameVnode(oldStartVnode, newStartVnode)){
            console.log('头头对比')
            patch(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIdx]
            newStartVnode = newChildren[++newStartIdx]
        }else if(isSameVnode(oldEndVnode, newEndVnode)){
            // 尾尾对比
            console.log('尾尾对比')
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIdx]
            newEndVnode = newChildren[--newEndIdx]
        }else if(isSameVnode(oldEndVnode, newStartVnode)){
            // 老尾新头对比 ABCD => DABC
            console.log('老尾新头对比')
            patch(oldStartVnode, newEndVnode)
            VnodeToHtml.insertBefore(parent, oldEndVnode.elm, oldStartVnode.elm)
            oldEndVnode = oldChildren[--oldEndIdx]
            newStartVnode = newChildren[++newStartIdx]
        }else if(isSameVnode(oldStartVnode,newEndVnode)){
            // 新尾老头对比
            // 旧节点插入末尾
            console.log('新尾老头对比')
            VnodeToHtml.insertBefore(parent, oldStartVnode.elm, VnodeToHtml.nextSibling(oldEndVnode.elm))
            oldStartVnode = oldChildren[++oldStartIdx]
            newEndVnode = newChildren[--newEndIdx]
        }else{
            /** 5、4种情况都不相等
             * // 1. 从 oldChildren 数组建立 key --> index 的 map。
             // 2. 只处理 newStartVnode （简化逻辑，有循环我们最终还是会处理到所有 vnode），
            //    以它的 key 从上面的 map 里拿到 index；
            // 3. 如果 index 存在，那么说明有对应的 old vnode，patch 就好了；
            // 4. 如果 index 不存在，那么说明 newStartVnode 是全新的 vnode，直接
            //    创建对应的 dom 并插入。
            */
             /** 如果 oldKeyToIdx 不存在，
             * 1、创建 old children 中 vnode 的 key 到 index 的
             * 映射， 方便我们之后通过 key 去拿下标
             **/
            if(!oldKeyToIdx){
                oldKeyToIdx = createOldKeyToIdx(oldChildren, oldStartIdx, oldEndIdx)
            }
            // 2 尝试newStartVnode的key去拿下标
            oldIdxByKeyMap = oldKeyToIdx[newStartVnode.key]
            if(oldIdxByKeyMap === null){
                // 下标不存在 是一个全新的Vnode
                VnodeToHtml.insertBefore(parent, createElement(newStartVnode), oldStartVnode.elm)
                newStartVnode = newChildren[++newStartIdx]
            }else{
                // 下标存在 说明oldChildren 中有相同key的Vnode
                let elmToMove = oldChildren[oldIdxByKeyMap]
                // 比较type type不同要创建新的DOM
                if(elmToMove.type !== newStartVnode.type){
                    VnodeToHtml.insertBefore(parent, createElement(newStartVnode), oldStartVnode.elm)
                }else{
                    // type相同，key相同，需要仔细比较
                    patch(elmToMove, newStartVnode)
                    oldChildren[oldIdxByKeyMap] = undefined
                    VnodeToHtml.insertBefore(parent, elmToMove.elm, oldStartVnode)
                }
                newStartVnode = newChildren[++newStartIdx]
            }
        }
    }

    // 循环比较完，新节点还有数据就要创建Dom
    if(newStartIdx <= newEndIdx){
        for(;newStartIdx<= newEndIdx;++newStartIdx){
            let ch = newChildren[newStartIdx]
            if(ch !== null){
                VnodeToHtml.insertBefore(parent, createElement(ch),null)
            }
        }
    }
    // 循环比较完，旧节点还有数据就要移除节点
    if(oldStartIdx <= oldEndIdx){
        for(;oldStartIdx<= oldEndIdx;++oldStartIdx){
            let ch = oldChildren[oldStartIdx]
            if(ch){
                VnodeToHtml.removeChild(parent, ch.elm)
            }
        }
    }
   
}

function createOldKeyToIdx(children, startIdx, endIdx) {
    const map = {};
    let key;
    for (let i = startIdx; i <= endIdx; ++i) {
      let ch = children[i];
      if(ch != null){
        key = ch.key;
        if(!isUndef(key)) map[key] = i;
      }
    }
    return map;
  }
  


document.querySelector('#app').appendChild(createElement(c))
patch(c,d)
// console.log(c)
// console.log(d)

