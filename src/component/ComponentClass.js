import GLOBALS from '../consts/GLOBALS';
import clone from '../utils/clone';
import generateId from '../utils/generateId';
import Renderer from './utils/Renderer';
import PrivateStore from './utils/PrivateStore';

export default class Component {
  /**
   * @param {object} o
   * @param {string} [o.name]
   * @param {object} [o.mixins]
   * @param {object} [o.state]
   * @param {object} [o.props]
   * @param {object} [o.actions]
   * @param {function(Component): (HTMLElement|Component)} view
   */
  constructor(o) {
    this.name = o.name;

    this.addNonEnumerableProperties({
      $id: generateId(),
      $mixins: o.$mixins || {},
      $state: clone(o.state || {}),
      $props: clone(o.props || {}),
      $actions: o.actions || {},
      // Variables like state and props are actually stored here so that we can
      // have custom setters
      $privateStore: new PrivateStore(),
    });

    this.copyObjToInstance(this.$mixins);
    this.copyObjToInstance(this.$state);
    this.copyObjToInstance(this.$props);
    // The bind on this.handleAction is necessary
    this.copyObjToInstance(this.$actions, this.handleAction.bind(this));

    this.addNonEnumerableProperties({
      $view: o.view(this),
    });

    this.$view.unmount = this.unmount.bind(this);
    this.$view.mount = this.mount.bind(this);

    this.addNonEnumerableProperties({
      $renderer: new Renderer(this),
    });
  }

  /**
   * @private
   * @param {object} obj
   * @param {function(*): *} [handleItem=item => item]
   */
  copyObjToInstance(obj, handleItem = item => item) {
    for (const key in obj) {
      if (typeof this[key] !== 'undefined') {
        throw new Error(`[Radi.js] Error: Trying to write for reserved variable \`${i}\``);
      }
      this.addCustomField(key, handleItem(obj[key]));
    }
  }

  /**
   * @private
   * @param {function(*): *} action
   * @returns {function(...*): *}
   */
  handleAction(action) {
    return (...args) => {
      if (GLOBALS.FROZEN_STATE) return null;
      return action.call(this, args);
    };
  }

  /**
   * @param {object} props
   * @returns {Component}
   */
  setProps(props) {
    for (const key in props) {
      this.o.props[key] = props[key];
      if (typeof this.o.props[key] === 'undefined') {
        console.warn(`[Radi.js] Warn: Creating a prop \`${key}\` that is not defined in component`);
        this.addCustomField(key, props[key]);
        continue;
      }
      this[key] = props[key];
    }
    return this;
  }

  /**
   * @private
   * @param {object} obj
   */
  addNonEnumerableProperties(obj) {
    for (const key in obj) {
      Object.defineProperty(this, key, {
        value: obj[key],
      });
    }
  }

  /**
   * @private
   * @param {string} key
   * @param {*} value
   * @returns {*}
   */
  addCustomField(key, value) {
    Object.defineProperty(this, key, {
      get: () => this.$privateStore.getItem(key),
      set: value => this.$privateStore.setItem(key, value),
      enumerable: true,
      configurable: true,
    });
    this[key] = value;
  }

  /**
   * @param {string} key
   * @param {Listener} listener
   */
  addListener(key, listener) {
    this.$privateStore.addListener(key, listener);
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  isMixin(key) {
    return typeof this.$mixins[key] !== 'undefined';
  }

  mount() {
    if (typeof this.$actions.onMount === 'function') {
      this.$actions.onMount(this);
    }
    GLOBALS.ACTIVE_COMPONENTS[this.$id] = this;
  }

  unmount() {
    if (typeof this.$actions.onDestroy === 'function') {
      this.$actions.onDestroy(this);
    }
    delete GLOBALS.ACTIVE_COMPONENT[this.$id];
    return this.$view;
  }

  /**
   * @returns {HTMLElement}
   */
  render() {
    this.mount();
    return this.$renderer.render();
  }

  /**
   * @returns {boolean}
   */
  static isComponent() {
    return true;
  }
}