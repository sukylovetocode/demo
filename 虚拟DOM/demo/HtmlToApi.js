const VnodeToHtml = {
    parentNode: function(node){
        return node.parentNode
    },
    setTextContent: function(node, text){
        node.textContent = text
    },
    removeChild: function(node,child){
        node.removeChild(child)
    },
    appendChild: function(node, child){
        node.appendChild(child)
    },
    isText: function(node){
        return node.nodeType === 3
    },
    createTextNode: function(text){
        return document.createTextNode(text)
    },
    insertBefore:function(node,newNode,existingNode){
        node.insertBefore(newNode, existingNode)
    },
    nextSibling: function(node){
        return node.nextSibling
    }
}