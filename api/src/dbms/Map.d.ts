interface Map<K, V> {
  /**
   * More intuitive API for adding items to the collections
   * @param name unique name for the document also used for the Map `key`
   * @param data (optional) document data payload
   * @returns instance of `V`
   */
  //add: (value: V) => V; 
  add: (name: K, data?: object) => V;
  
}