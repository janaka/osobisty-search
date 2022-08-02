/**
 * A more intuitive API for a collection of type {Map}.
 */
interface Map<K, V> {
  /**
   * This method is an alias for set()
   * @param {K} name unique name for the document also used for the Map `key`
   * @param data (optional) document data payload
   * @returns {V} instance of type {V}
   */
  add: (name: K, data?:object) => V;

  /**
   * This method is an alias for delete()
   * @param {string} name - name of the item to remove from the colletion
   */
  remove: (name: K) => boolean;

  
}