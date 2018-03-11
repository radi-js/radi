import clone from '../utils/clone';

export default class Listener {
  /**
   * @param {Component} component
   * @param {string} key
   * @param {string} [childPath]
   */
  constructor(component, key, childPath) {
    this.component = component;
    this.key = key;
    this.childPath = childPath;
    this.value = null;
    this.changeListeners = [];

    this.component.addListener(key, this);
    this.handleUpdate(this.component[this.key]);
  }

  /**
   * @param {*} value
   */
  handleUpdate(value) {
    this.value = this.getShallowValue(value);
    for (const changeListener of this.changeListeners) {
      changeListener(value);
    }
  }

  /**
   * @param {function(*)} changeListener
   */
  onValueChange(changeListener) {
    this.changeListeners.push(changeListener);
    changeListener(this.value);
  }

  /**
   * @private
   * @param {*} value
   */
  getShallowValue(value) {
    const cloned = clone(value);
    if (!this.childPath) return cloned;
    const pathNesting = this.childPath.split('.');
    let shallowValue = cloned;
    for (const pathNestingLevel of pathNesting) {
      shallowValue = shallowValue[pathNestingLevel];
    }
    return shallowValue;
  }
}
