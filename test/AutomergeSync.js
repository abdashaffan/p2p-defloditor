const Automerge = require('automerge');
const {isANode, ITEM} = require("./utils");
const util = require('util');


class AutomergeSync {

  constructor(actorID) {
    this.state = Automerge.from({elements: {}, peers: {}}, actorID);
  }

  show(label) {
    console.log('\x1b[33m%s\x1b[0m',`\n\n\n[${label.toUpperCase()}:]`);
    console.log(util.inspect(this._mapped(this.state), {showHidden: false, depth: null}));
  }

  addElement(elArr) {
    this.state = Automerge.change(this.state,'add elements', state => {
      elArr.forEach(el => {
        state.elements[el.id] = {};
        if (isANode(el)) {
          state.elements[el.id][ITEM.ID] = el.id;
          state.elements[el.id][ITEM.LABEL] = el.data.label;
          state.elements[el.id][ITEM.TYPE] = "default";
          state.elements[el.id][ITEM.POSITION] = el.position;
          state.elements[el.id][ITEM.BACKGROUND] = el.style.backgroundColor;
          state.elements[el.id][ITEM.BORDER] = el.style.borderColor;
        } else {
          state.elements[el.id][ITEM.ID] = el.id;
          state.elements[el.id][ITEM.SOURCE] = el.source;
          state.elements[el.id][ITEM.TARGET] = el.target;
        }
      });
    });
  }

  updateElement(elArr) {
    this.state = Automerge.change(this.state,'update elements', state => {
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
        let curr = state.elements[el.id];
        for (let i = 0; i < updatable.length; i++) {
          const propertyName = updatableKey[i];
          const lastVal = curr[propertyName];
          const newVal = updatable[i];
          let changed = false;
          if (propertyName === ITEM.POSITION) {
            changed = (lastVal.x !== newVal.x || lastVal.y !== newVal.y);
          } else {
            changed = (newVal !== lastVal);
          }
          if (changed) {
            //console.log(`${propertyName} updated`);
            state.elements[el.id][propertyName] = newVal;
          }
        }
      });
    });
  }

  deleteElement(idArr) {
    this.state = Automerge.change(this.state,'delete elements', state => {
      idArr.forEach(id => {
        delete state.elements[id];
      })
      this._removeOrphanedEdge();
    });
  }

  sync(otherState) {
    this.state = Automerge.merge(this.state, otherState);
  }

  getCrdtState() {
    return this.state;
  }

  getDocSizeInBytes() {
    return Automerge.save(this.state).length;
  }

  getState() {
    return this._mapped(this.state);
  }

  _removeOrphanedEdge() {
    this.state = Automerge.change(this.state,'remove orphaned edge', state => {
      // Find and remove edge with node with deleted source or target.
      const nodeCount = {};
      const edgeList = [];
      Object.keys(state.elements).forEach(key => {
        if (state.elements[key].source) {
          edgeList.push(key);
          return;
        }
        if (!nodeCount[key]) {
          nodeCount[key] = 1;
        } else {
          nodeCount[key]++;
        }
      });
      edgeList.forEach(edge => {
        if (!nodeCount[edge.source] || !nodeCount[edge.target]) {
          delete state.elements[edge.id];
        }
      });
    });
  }

  _mapped(state) {
    const deepCopy = JSON.parse(JSON.stringify(state));
    let elements = Object.values(deepCopy.elements);

    elements = elements.map(el => {
      if (el[ITEM.ID].startsWith('node')) {
        return ({
          id: el[ITEM.ID],
          type: el[ITEM.TYPE],
          data: {label: el[ITEM.LABEL]},
          position: el[ITEM.POSITION],
          style: {
            backgroundColor: el[ITEM.BACKGROUND],
            borderColor: el[ITEM.BORDER]
          }
        });
      } else {
        return ({
          id: el[ITEM.ID],
          source: el[ITEM.SOURCE],
          target: el[ITEM.TARGET]
        })
      }
    });
    return {elements, peers: []};
  }
}

module.exports = AutomergeSync;
