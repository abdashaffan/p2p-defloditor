const Y = require('yjs');
const util = require('util');
const {isANode, ITEM} = require("./utils");


const ELEMENTS_KEY = 'elements';

class YjsSync {

  constructor() {
    this.ydoc = new Y.Doc();
  }

  addElement(elArr, callback) {
    this.ydoc.transact(() => {
      elArr.forEach(el => {
        let newEl = new Y.Map();
        if (isANode(el)) {
          newEl.set(ITEM.ID, el.id);
          newEl.set(ITEM.LABEL, el.data.label);
          newEl.set(ITEM.TYPE, "default");
          newEl.set(ITEM.POSITION, el.position);
          newEl.set(ITEM.BACKGROUND, el.style.backgroundColor);
          newEl.set(ITEM.BORDER, el.style.borderColor);
        } else {
          newEl.set(ITEM.ID, el.id);
          newEl.set(ITEM.SOURCE, el.source);
          newEl.set(ITEM.TARGET, el.target);
        }
        this.ydoc.getMap(ELEMENTS_KEY).set(el.id, newEl);
      })
    });
    if (callback) callback();
  }

  updateElement(elArr, callback) {
    this.ydoc.transact(() => {
      elArr.forEach(el => {
        let updatable;
        let updatableKey;
        if (isANode(el)) {
          updatable = [el.position, el.style.borderColor, el.style.backgroundColor];
          updatableKey = [ITEM.POSITION, ITEM.BORDER, ITEM.BACKGROUND];
        } else {
          updatable = [el.source, el.target];
          updatableKey = [ITEM.SOURCE, ITEM.TARGET];
        }
        for (let i = 0; i < updatable.length; i++) {
          const propertyName = updatableKey[i];
          const lastVal = this.ydoc.getMap(ELEMENTS_KEY).get(el.id).get(propertyName);
          const newVal = updatable[i];
          let changed = false;
          if (propertyName === ITEM.POSITION) {
            changed = (lastVal.x !== newVal.x || lastVal.y !== newVal.y);
          } else {
            changed = (newVal !== lastVal);
          }
          if (changed) {
            this.ydoc.getMap(ELEMENTS_KEY).get(el.id).set(propertyName, newVal);
          }
        }
      })
    });
    if (callback) callback();
  }

  deleteElement(idArr, callback) {
    this.ydoc.transact(() => {
      idArr.forEach(id => {
        this.ydoc.getMap(ELEMENTS_KEY).delete(id);
      });
      this.removeOrphanedEdge();
    });
    if (callback) callback();
  }

  removeOrphanedEdge() {
    const nodeCount = {};
    const edgeList = [];
    this.ydoc.getMap(ELEMENTS_KEY).forEach(el => {
      const currId = el.get(ITEM.ID);
      if (el.has(ITEM.SOURCE)) {
        edgeList.push(el);
      }
      if (!nodeCount[currId]) {
        nodeCount[currId] = 1;
      } else {
        nodeCount[currId]++;
      }
    });
    edgeList.forEach(edge => {
      if (!nodeCount[edge.get(ITEM.SOURCE)] || !nodeCount[edge.get(ITEM.TARGET)]) {
        this.ydoc.getMap(ELEMENTS_KEY).delete(edge.get(ITEM.ID));
      }
    });
  }

  sync(otherYdoc) {
    const changes = Y.encodeStateAsUpdate(otherYdoc);
    Y.applyUpdate(this.ydoc, changes);
  }

  getCrdtState() {
    return this.ydoc;
  }

  getDocSizeInBytes() {
    return Y.encodeStateAsUpdate(this.getCrdtState()).byteLength;
  }

  getState() {
    return {elements: this._getElements(), peers: []};
  }

  show(label) {
    console.log('\x1b[33m%s\x1b[0m', `\n\n\n[${label.toUpperCase()}:]`);
    console.log(util.inspect(this.getState(), {showHidden: false, depth: null}));
  }

  _getElements() {
    const elementArrCopy = [];
    const elementsYmap = this.ydoc.getMap(ELEMENTS_KEY);
    elementsYmap.forEach((el, key) => {
      const deepCopy = JSON.parse(JSON.stringify(el));
      let newElement;
      if (deepCopy[ITEM.ID].startsWith('node')) {
        newElement = {
          id: deepCopy[ITEM.ID],
          type: deepCopy[ITEM.TYPE],
          data: {label: deepCopy[ITEM.LABEL]},
          position: deepCopy[ITEM.POSITION],
          style: {
            backgroundColor: deepCopy[ITEM.BACKGROUND],
            borderColor: deepCopy[ITEM.BORDER]
          }
        }
      } else {
        newElement = {
          id: deepCopy[ITEM.ID],
          source: deepCopy[ITEM.SOURCE],
          target: deepCopy[ITEM.TARGET]
        }
      }
      elementArrCopy.push(newElement);
    });
    return elementArrCopy;
  }
}

module.exports = YjsSync;