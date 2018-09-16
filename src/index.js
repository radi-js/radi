import GLOBALS from './consts/GLOBALS';
import { service } from './component';
import {
  customAttribute,
  customTag,
  html,
  patch,
} from './html';
import { Store } from './store';
import { mount } from './mount';
// import {} from './custom';
// import validate from './custom/validation/validate';
// import { Validator } from './custom/validation/Validator';

const Radi = {
  v: GLOBALS.VERSION,
  version: GLOBALS.VERSION,
  h: html,
  html,
  Store,
  customTag,
  customAttribute,
  patch,
  mount,
  service,
  // Validator,
};

// Pass Radi instance to plugins
Radi.plugin = (fn, ...args) => fn(Radi, ...args);

// Radi.plugin(validate);

if (window) window.Radi = Radi;
export default Radi;
