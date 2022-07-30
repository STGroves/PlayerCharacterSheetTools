/**
 * Provides functions to simulate class behaviour similar to C#.
 */
class ClassExtension {
  /** @typedef {{get: function, set: function}} ProtectedObject*/
  /**
   * Creates a new ProtectedObject.
   * @returns 
   */
  static #ProtectedObject() {
    const TAG = {
      VAlUE: 0,
      FUNCTION: 1
    };

    let items = {};

    /**
     * Gets the value associated with the provided ID.
     * @param {string} id The ID of the value to be retrieved.
     * @returns {any} The stored value or a ProtectedObjectIterator if the value is a function.
     */
    function get(id) {
      if (!items.hasOwnProperty(id))
        throw `Unable to find ${id}!`;

      const target = items[id];

      switch (target.tag) {
        case TAG.VALUE:
          return target.value;
        
        case TAG.FUNCTION:
          let idx = -1;
          
          return {
            /** @typedef {} */
            /**
             * 
             * @param  {...any} params 
             * @returns 
             */
            next: function(...params) {
              idx++;

              return {
                value: target.value[idx] == undefined ? idx : target.value[idx].apply(null, [this, params].flat()),
                done: idx >= target.value.length
              };
            }
          };
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
      if (typeof value != "function") {
        items[id] = {
          tag: TAG.VALUE,
          value: value
        };

        return this;
      }

      if (!items.hasOwnProperty(id) || !retainPrevious) {
        items[id] = {
          tag: TAG.FUNCTION,
          value: [value]
        };
      } else {
        items[id].value.splice(0, 0, value);
      }

      return this;
    }

    return {
      set: set,
      get: get,
      items: items
    };
  };
  
  /**
   * Creates a new ProtectedObject.
   * @returns {ProtectedObject}
   */
  static createProtectedObject() {
    return ClassExtension.#ProtectedObject();
  }
  
  static enforceFinalClass(target, type) {
    if (target !== type)
      throw `${type} is a final class! It cannot be inherited from!`;
  }
  
  static enforceAbstractClass(target, type) {
    if (target === type)
      throw `${type} is an abstract class! It cannot be constructed!`;
  }

  static enforceAbstractMethod(name, type) {
    throw `${name} is an abstract method! It cannot be called from ${type}!`;
  }

  static enforceProtectedObject(target, type, reference) {
    return target === type ? ClassExtension.#ProtectedObject() : reference;
  }
}