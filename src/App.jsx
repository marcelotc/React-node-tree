import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import useClickOutside from './hooks/useClickOutside';
import './App.css'

function App() {
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nodeCounter, setNodeCounter] = useState(1); 
  const toolbarRef = useRef(null);

  const showToolbar = (event, nodeId) => {
    event.stopPropagation();
    setToolbarVisible(true);
    setSelectedNodeId(nodeId);
  };

  const hideToolbar = () => {
    setToolbarVisible(false);
  };

  const addNewNode = () => {

    if(treeData.length === 0) {
      const newChild = {
        id: uuidv4(),
        label: 'First Node',
      };
      setTreeData([newChild]);
      return;
    }

    if (selectedNodeId) {
      const updatedTreeData = [...treeData];

      const addChildToNode = (nodes, nodeId, newChild) => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              children: [...(node.children || []), newChild],
            };
          } else if (node.children) {
            return {
              ...node,
              children: addChildToNode(node.children, nodeId, newChild),
            };
          }
          return node;
        });
      };

      const newChild = {
        id: uuidv4(),
        label: `Child ${nodeCounter}`
      };

      setNodeCounter((prevCounter) => prevCounter + 1); 

      const updatedData = addChildToNode(updatedTreeData, selectedNodeId, newChild);

      setTreeData(updatedData);
    }
  };

  const deleteNode = () => {
    if (selectedNodeId) {
      const updatedTreeData = [...treeData];

      const deleteNodeById = (nodes, nodeId) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === nodeId) {
            nodes.splice(i, 1);
            return true;
          } else if (nodes[i].children) {
            if (deleteNodeById(nodes[i].children, nodeId)) {
              return true;
            }
          }
        }
        return false;
      };

      const nodeDeleted = deleteNodeById(updatedTreeData, selectedNodeId);

      if (nodeDeleted) {
        setTreeData(updatedTreeData);
        setSelectedNodeId(null);
      }
    }
  };

  useClickOutside(toolbarRef, hideToolbar);

  const [treeData, setTreeData] = useState([
    {
      id: uuidv4(),
      label: 'First Node',
      children: [
        { id: uuidv4(), label: 'One' },
        { id: uuidv4(), label: 'Two' },
        { id: uuidv4(), label: 'Three' },
      ],
    },
  ]);

  function TreeNode({ id, label, children }) {
    return (
      <li>
        <button type="button" aria-pressed="false" data-js="node" onClick={(e) => showToolbar(e, id)}>
          {label}
        </button>
        {children && (
          <ul>
            {children.map((child, index) => (
              <TreeNode key={index} id={child.id || null} {...child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <div>
      <p
        role="toolbar"
        aria-label="Node tools"
        aria-hidden="true"
        ref={toolbarRef}
        className={`toolbar ${toolbarVisible ? 'show' : ''}`}
      >
        <button type="button" data-js="promoteSibling">&laquo; Move left</button>
        <button type="button" data-js="demoteSibling">Move right &raquo;</button>
        <button type="button" data-js="addChild" onClick={addNewNode}>+ Add new</button>
        <button type="button" data-js="deleteNode" onClick={deleteNode}>
          &times; Delete
          <ins role="alert" aria-hidden="true" class="confirm" aria-label="Please confirm deletion">Are you sure?
            (press again to continue)</ins>
          <ins role="alert" aria-hidden="true" class="root" aria-label="You can't delete root">You can't delete the
            root node</ins>
        </button>
        <button type="button" data-js="editName">✎ Edit name</button>
      </p>

      <details>
        <summary>Customise your tree view</summary>
        <div class="grid">
          <p><label for="line-color">Line colour</label> <input type="color" id="line-color" name="line-color"
            value="#666" /></p>
          <p><label for="line-width">Line width</label> <input type="range" id="line-width" name="line-width"
            value="1" min="1" max="10" /></p>
          <p><label for="gutter">Gutters</label> <input type="range" id="gutter" name="gutter" value="5" min="1"
            max="10" /></p>
        </div>
      </details>
      {treeData.length === 0 && <button type="button" data-js="addChild" onClick={addNewNode}>+ Add new</button>}
      <ul className="tree">
        {treeData.map((item, index) => (
          <TreeNode key={index} {...item} />
        ))}
      </ul>
    </div>
  )
}

export default App
