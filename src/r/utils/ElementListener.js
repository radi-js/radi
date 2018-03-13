import listenerToNode from './listenerToNode';

export default class ElementListener {
  /**
   * @param {object} obj
   * @param {Listener} obj.listener
   * @param {Node} obj.element
   */
  constructor({ listener, element }) {
    this.listener = listener;
    this.element = element;
    this.listenerAsNode = [];
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  /**
   * Attaches listener to given element and starts listening.
   */
  attach() {
    if (!this.element.listeners) this.element.listeners = [];
    this.element.listeners.push(this);
    this.listener.onValueChange(this.handleValueChange);
  }

  /**
   * @param {*} value
   */
  handleValueChange(value) {
    const newNode = listenerToNode(value);
    for (const node of newNode) {
      // If listenerAsNode[0] is undefined we're dealing with a fragment so we can
      // just append
      if (!this.listenerAsNode[0]) {
        this.element.appendChild(node);
        continue;
      }
      this.element.insertBefore(node, this.listenerAsNode[0])
    }

    for (const node of this.listenerAsNode) node.remove();

    this.listenerAsNode = newNode;
  }

  /**
   * @param {Node} newElement
   */
  updateElement(newElement) {
    this.element = newElement;
    return this.element;
  }
}