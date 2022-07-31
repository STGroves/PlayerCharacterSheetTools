/**
 * Provides functions to simulate class behaviour similar to C#.
 */
export default class ClassExtension {
  /** @typedef {{get: function, set: function}} ProtectedObject */
  /**
   * Creates a new ProtectedObject.
   * @returns
   */
  static #ProtectedObject() {
    const TAG = {
      VALUE: 0,
      FUNCTION: 1,
    };

    const items = {};

    /**
     * Gets the value associated with the provided ID.
     * @param {string} id The ID of the value to be retrieved.
     * @returns {any} The stored value or a ProtectedObjectIterator if the value is a function.
     */
    function get(id) {
      if (!Object.prototype.hasOwnProperty.call(items, id)) throw new Error(`Unable to find ${id}!`);

      const target = items[id];

      let idx = -1;

      switch (target.tag) {
        case TAG.VALUE:
          return target.value;

        case TAG.FUNCTION:
          return {
            /** @typedef {} */
            /**
             *
             * @param  {...any} params
             * @returns
             */
            next(...params) {
              idx++;

              return {
                value: target.value[idx] === undefined ? idx : target.value[idx].apply(null, [this, params].flat()),
                done: idx >= target.value.length,
              };
            },
          };
        default:
      }

      return items[id];
    }

    /**
     * Sets the value and associates it with the given ID.
     * @param {string} id
     * @param {any} value
     * @param {boolean} retainPrevious
     * @returns {ProtectedObject} The updated ProtectedObject.
     */
    function set(id, value, retainPrevious = true) {
      if (typeof value !== 'function') {
        items[id] = {
          tag: TAG.VALUE,
          value,
        };

        return this;
      }

      if (!Object.prototype.hasOwnProperty.call(items, id) || !retainPrevious) {
        items[id] = {
          tag: TAG.FUNCTION,
          value: [value],
        };
      } else {
        items[id].value.splice(0, 0, value);
      }

      return this;
    }

    return {
      set,
      get,
      items,
    };
  }

  /**
   * Creates a new ProtectedObject.
   * @returns {ProtectedObject}
   */
  static createProtectedObject() {
    return ClassExtension.#ProtectedObject();
  }

  static enforceFinalClass(target, type) {
    if (target !== type) throw new Error(`${type} is a final class! It cannot be inherited from!`);
  }

  static enforceAbstractClass(target, type) {
    if (target === type) throw new Error(`${type} is an abstract class! It cannot be constructed!`);
  }

  static enforceAbstractMethod(name, type) {
    throw new Error(`${name} is an abstract method! It cannot be called from ${type}!`);
  }

  static enforceProtectedObject(target, type, reference) {
    return target === type ? ClassExtension.#ProtectedObject() : reference;
  }
}
