(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.ecs = {}));
}(this, function (exports) { 'use strict';

  /**
   * @param {() => void} callee
   * @returns {() => void}
   */
  function debounce(callee) {
    let skip = false;
    const handler = () => {
      skip = false;
      callee();
    };
    return () => {
      if (skip) return;
      setTimeout(handler, 1);
      skip = true;
    };
  }

  var cleanup = debounce(() => {
    cleanupEntities();
  });

  /// <reference path="ambient.d.ts" />

  const deleted = [];
  const cache = [];

  let guid = 0;

  function removeNow(e) {
    // TODO: remove components now.
    cache.push(e);
  }

  function remove(e) {
    cleanup();
    deleted.push(e);
    skipCleanup = false;
  }

  let skipCleanup = true;
  function cleanupEntities() {
    if (skipCleanup) return; skipCleanup = true;
    for (const e of deleted)
      removeNow(e);
    deleted.length = 0;
  }

  const entities = {

    /** @returns {Entity} */
    create() {
      return cache.length > 0 ? cache.pop() : guid++;
    },

    /**
     * @param {Entity} entity
     * @param {boolean} immediate
     */
    delete(entity, immediate = false) {
      if (immediate)
        removeNow(entity);
      else
        remove(entity);
    }

  };

  exports.entities = entities;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
