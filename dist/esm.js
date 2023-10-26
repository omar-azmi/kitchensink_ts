var noop = () => {
}, array_isEmpty = (array) => array.length === 0, string_fromCharCode = String.fromCharCode, string_toUpperCase = (str) => str.toUpperCase(), string_toLowerCase = (str) => str.toLowerCase(), promise_resolve = /* @__PURE__ */ Promise.resolve.bind(Promise), promise_reject = /* @__PURE__ */ Promise.reject.bind(Promise), promise_forever = () => new Promise(noop), promise_outside = () => {
  let resolve, reject;
  return [new Promise((_resolve, _reject) => {
    resolve = _resolve, reject = _reject;
  }), resolve, reject];
}, {
  from: array_from,
  isArray: array_isArray,
  of: array_of
} = Array, {
  isInteger: number_isInteger,
  MAX_VALUE: number_MAX_VALUE,
  NEGATIVE_INFINITY: number_NEGATIVE_INFINITY,
  POSITIVE_INFINITY: number_POSITIVE_INFINITY
} = Number, {
  assign: object_assign,
  defineProperty: object_defineProperty,
  entries: object_entries,
  fromEntries: object_fromEntries,
  keys: object_keys,
  getPrototypeOf: object_getPrototypeOf,
  values: object_values
} = Object, date_now = Date.now, {
  iterator: symbol_iterator,
  toStringTag: symbol_toStringTag
} = Symbol, dom_setTimeout = setTimeout, dom_clearTimeout = clearTimeout, dom_setInterval = setInterval, dom_clearInterval = clearInterval;
var clamp = (value, min2 = -number_MAX_VALUE, max2 = number_MAX_VALUE) => value < min2 ? min2 : value > max2 ? max2 : value, modulo = (value, mod2) => (value % mod2 + mod2) % mod2, lerp = (x0, x1, t) => t * (x1 - x0) + x0, lerpClamped = (x0, x1, t) => (t < 0 ? 0 : t > 1 ? 1 : t) * (x1 - x0) + x0, lerpi = (v0, v1, t, i) => t * (v1[i] - v0[i]) + v0[i], lerpiClamped = (v0, v1, t, i) => (t < 0 ? 0 : t > 1 ? 1 : t) * (v1[i] - v0[i]) + v0[i], lerpv = (v0, v1, t) => {
  let len = v0.length, v = Array(len).fill(0);
  for (let i = 0, len2 = v0.length; i < len2; i++)
    v[i] = t * (v1[i] - v0[i]) + v0[i];
  return v;
}, lerpvClamped = (v0, v1, t) => lerpv(v0, v1, t < 0 ? 0 : t > 1 ? 1 : t), invlerp = (x0, x1, x) => (x - x0) / (x1 - x0), invlerpClamped = (x0, x1, x) => {
  let t = (x - x0) / (x1 - x0);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}, invlerpi = (v0, v1, v, i) => (v[i] - v0[i]) / (v1[i] - v0[i]), invlerpiClamped = (v0, v1, v, i) => {
  let t = (v[i] - v0[i]) / (v1[i] - v0[i]);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}, limp = (u0, u1, x0) => u1[0] + (x0 - u0[0]) * (u1[1] - u1[0]) / (u0[1] - u0[0]), limpClamped = (u0, u1, x0) => {
  let t = (x0 - u0[0]) / (u0[1] - u0[0]);
  return (t < 0 ? 0 : t > 1 ? 1 : t) * (u1[1] - u1[0]) + u1[0];
}, sum = (values) => {
  let total = 0, len = values.length;
  for (let i = 0; i < len; i++)
    total += values[i];
  return total;
}, min = (v0, v1) => v0 < v1 ? v0 : v1, max = (v0, v1) => v0 > v1 ? v0 : v1;
var Array2DShape = (arr2d) => {
  let major_len = arr2d.length, minor_len = arr2d[0]?.length ?? 0;
  return [major_len, minor_len];
}, transposeArray2D = (arr2d) => {
  let [rows, cols] = Array2DShape(arr2d), arr_transposed = [];
  for (let c = 0; c < cols; c++)
    arr_transposed[c] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      arr_transposed[c][r] = arr2d[r][c];
  return arr_transposed;
}, spliceArray2DMajor = (arr2d, start, delete_count, ...insert_items) => {
  let [rows, cols] = Array2DShape(arr2d);
  return delete_count ??= max(rows - start, 0), arr2d.splice(start, delete_count, ...insert_items);
}, spliceArray2DMinor = (arr2d, start, delete_count, ...insert_items) => {
  let [rows, cols] = Array2DShape(arr2d), insert_items_rowwise = insert_items.length > 0 ? transposeArray2D(insert_items) : Array(rows).fill([]);
  return delete_count ??= max(cols - start, 0), transposeArray2D(
    arr2d.map(
      (row_items, row) => row_items.splice(
        start,
        delete_count,
        ...insert_items_rowwise[row]
      )
    )
  );
}, rotateArray2DMajor = (arr2d, amount) => {
  let [rows, cols] = Array2DShape(arr2d);
  if (amount = modulo(amount, rows === 0 ? 1 : rows), amount === 0)
    return arr2d;
  let right_removed_rows = spliceArray2DMajor(arr2d, rows - amount, amount);
  return spliceArray2DMajor(arr2d, 0, 0, ...right_removed_rows), arr2d;
}, rotateArray2DMinor = (arr2d, amount) => {
  let [rows, cols] = Array2DShape(arr2d);
  if (amount = modulo(amount, cols === 0 ? 1 : cols), amount === 0)
    return arr2d;
  let right_removed_cols = spliceArray2DMinor(arr2d, cols - amount, amount);
  return spliceArray2DMinor(arr2d, 0, 0, ...right_removed_cols), arr2d;
}, meshGrid = (major_values, minor_values) => {
  let axis0_len = major_values.length, axis1_len = minor_values.length, major_grid = major_values.map((major_val) => Array(axis1_len).fill(major_val)), minor_grid = major_values.map(() => minor_values.slice());
  return [major_grid, minor_grid];
}, meshMap = (map_fn, x_values, y_values) => {
  let axis0_len = x_values.length, axis1_len = y_values.length, z_values = Array(axis0_len).fill(void 0);
  for (let x_idx = 0; x_idx < axis0_len; x_idx++) {
    let row = Array(axis1_len).fill(0), x = x_values[x_idx];
    for (let y_idx = 0; y_idx < axis1_len; y_idx++)
      row[y_idx] = map_fn(x, y_values[y_idx]);
    z_values[x_idx] = row;
  }
  return z_values;
};
var positiveRect = (r) => {
  let { x, y, width, height } = r;
  return width < 0 && (width *= -1, x -= width), height < 0 && (height *= -1, y -= height), { x, y, width, height };
}, constructorOf = (class_instance) => object_getPrototypeOf(class_instance).constructor, constructFrom = (class_instance, ...args) => new (constructorOf(class_instance))(...args), prototypeOfClass = (cls) => cls.prototype, isComplex = (obj) => {
  let obj_type = typeof obj;
  return obj_type === "object" || obj_type === "function";
}, isPrimitive = (obj) => !isComplex(obj), monkeyPatchPrototypeOfClass = (cls, key, value) => {
  object_defineProperty(prototypeOfClass(cls), key, { value });
};
var bindMethodFactory = (func, ...args) => (thisArg) => func.bind(thisArg, ...args), bindMethodFactoryByName = (instance, method_name, ...args) => (thisArg) => instance[method_name].bind(thisArg, ...args), bindMethodToSelf = (self, func, ...args) => func.bind(self, ...args), bindMethodToSelfByName = (self, method_name, ...args) => self[method_name].bind(self, ...args), array_proto = /* @__PURE__ */ prototypeOfClass(Array), map_proto = /* @__PURE__ */ prototypeOfClass(Map), set_proto = /* @__PURE__ */ prototypeOfClass(Set), string_proto = /* @__PURE__ */ prototypeOfClass(String), bind_array_at = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "at"), bind_array_concat = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "concat"), bind_array_copyWithin = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "copyWithin"), bind_array_entries = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "entries"), bind_array_every = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "every"), bind_array_fill = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "fill"), bind_array_filter = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "filter"), bind_array_find = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "find"), bind_array_findIndex = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "findIndex"), bind_array_findLast = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "findLast"), bind_array_findLastIndex = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "findLastIndex"), bind_array_flat = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "flat"), bind_array_flatMap = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "flatMap"), bind_array_forEach = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "forEach"), bind_array_includes = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "includes"), bind_array_indexOf = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "indexOf"), bind_array_join = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "join"), bind_array_keys = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "keys"), bind_array_lastIndexOf = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "lastIndexOf"), bind_array_map = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "map"), bind_array_pop = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "pop"), bind_array_push = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "push"), bind_array_reduce = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "reduce"), bind_array_reduceRight = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "reduceRight"), bind_array_reverse = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "reverse"), bind_array_shift = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "shift"), bind_array_slice = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "slice"), bind_array_some = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "some"), bind_array_sort = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "sort"), bind_array_splice = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "splice"), bind_array_unshift = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "unshift"), bind_array_toLocaleString = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toLocaleString"), bind_array_toReversed = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toReversed"), bind_array_toSorted = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toSorted"), bind_array_toSpliced = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toSpliced"), bind_array_toString = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toString"), bind_array_values = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "values"), bind_array_with = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "with"), bind_array_clear = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "splice", 0), bind_stack_seek = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "at", -1), bind_set_add = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "add"), bind_set_clear = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "clear"), bind_set_delete = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "delete"), bind_set_entries = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "entries"), bind_set_forEach = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "forEach"), bind_set_has = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "has"), bind_set_keys = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "keys"), bind_set_values = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "values"), bind_map_clear = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "clear"), bind_map_delete = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "delete"), bind_map_entries = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "entries"), bind_map_forEach = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "forEach"), bind_map_get = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "get"), bind_map_has = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "has"), bind_map_keys = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "keys"), bind_map_set = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "set"), bind_map_values = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "values"), bind_string_at = /* @__PURE__ */ bindMethodFactoryByName(string_proto, "at"), bind_string_charAt = /* @__PURE__ */ bindMethodFactoryByName(string_proto, "charAt"), bind_string_charCodeAt = /* @__PURE__ */ bindMethodFactoryByName(string_proto, "charCodeAt"), bind_string_codePointAt = /* @__PURE__ */ bindMethodFactoryByName(string_proto, "codePointAt");
var downloadBuffer = (data, file_name = "data.bin", mime_type = "application/octet-stream") => {
  let blob = new Blob([data], { type: mime_type }), anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob), anchor.download = file_name, anchor.click(), URL.revokeObjectURL(anchor.href), anchor.remove();
}, blobToBase64 = (blob) => {
  let reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result), reader.onerror = reject, reader.readAsDataURL(blob);
  });
}, blobToBase64Split = (blob) => blobToBase64(blob).then((str_b64) => {
  let [head, body] = str_b64.split(";base64,", 2);
  return [head + ";base64,", body];
}), blobToBase64Body = (blob) => blobToBase64Split(blob).then((b64_tuple) => b64_tuple[1]), base64BodyToBytes = (data_base64) => {
  let data_str = atob(data_base64), len = data_str.length, data_str_charCodeAt = bind_string_charCodeAt(data_str), data_buf = new Uint8Array(len);
  for (let i = 0; i < len; i++)
    data_buf[i] = data_str_charCodeAt(i);
  return data_buf;
}, bytesToBase64Body = (data_buf) => {
  let data_str_parts = [];
  for (let i = 0; i < data_buf.length; i += 32766) {
    let sub_buf = data_buf.subarray(i, i + 32766);
    data_str_parts.push(string_fromCharCode(...sub_buf));
  }
  return btoa(data_str_parts.join(""));
};
var Deque = class {
  /** a double-ended circular queue, similar to python's `collection.deque` <br>
   * @param length maximum length of the queue. <br>
   * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
  */
  constructor(length) {
    this.length = length;
    this.items = Array(length), this.back = length - 1;
  }
  items;
  front = 0;
  back;
  count = 0;
  static {
    symbol_iterator;
  }
  /** inserts one or more items to the back of the deque. <br>
   * if the deque is full, it will remove the front item before adding a new item
  */
  pushBack(...items) {
    for (let item of items)
      this.count === this.length && this.popFront(), this.items[this.back] = item, this.back = modulo(this.back - 1, this.length), this.count++;
  }
  /** inserts one or more items to the front of the deque. <br>
   * if the deque is full, it will remove the rear item before adding a new item
  */
  pushFront(...items) {
    for (let item of items)
      this.count === this.length && this.popBack(), this.items[this.front] = item, this.front = modulo(this.front + 1, this.length), this.count++;
  }
  /** get the item at the back of the deque without removing/popping it */
  getBack() {
    if (this.count !== 0)
      return this.items[modulo(this.back + 1, this.length)];
  }
  /** get the item at the front of the deque without removing/popping it */
  getFront() {
    if (this.count !== 0)
      return this.items[modulo(this.front - 1, this.length)];
  }
  /** removes/pops the item at the back of the deque and returns it */
  popBack() {
    if (this.count === 0)
      return;
    this.back = modulo(this.back + 1, this.length);
    let item = this.items[this.back];
    return this.items[this.back] = void 0, this.count--, item;
  }
  /** removes/pops the item at the front of the deque and returns it */
  popFront() {
    if (this.count === 0)
      return;
    this.front = modulo(this.front - 1, this.length);
    let item = this.items[this.front];
    return this.items[this.front] = void 0, this.count--, item;
  }
  /** rotates the deque `steps` number of positions to the right. <br>
   * if `steps` is negative, then it will rotate in the left direction. <br>
   * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
  */
  rotate(steps) {
    let { front, back, length, count, items } = this;
    if (count !== 0) {
      if (steps = modulo(steps, count), count < length)
        for (let i = 0; i < steps; i++) {
          let b = modulo(back - i, length), f = modulo(front - i - 1, length);
          items[b] = items[f], items[f] = void 0;
        }
      this.front = modulo(front - steps, length), this.back = modulo(back - steps, length);
    }
  }
  /** reverses the order of the items in the deque. */
  reverse() {
    let center = this.count / 2 | 0, { length, front, back, items } = this;
    for (let i = 1; i <= center; i++) {
      let b = modulo(back + i, length), f = modulo(front - i, length), temp = items[b];
      items[b] = items[f], items[f] = temp;
    }
  }
  /** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
   * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
   * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
  */
  resolveIndex(index) {
    return modulo(this.back + index + 1, this.length);
  }
  /** returns the item at the specified index.
   * @param index The index of the item to retrieve, relative to the rear-most element
   * @returns The item at the specified index, or `undefined` if the index is out of range
  */
  at(index) {
    return this.items[this.resolveIndex(index)];
  }
  /** replaces the item at the specified index with a new item. */
  replace(index, item) {
    this.items[modulo(this.back + index + 1, this.count)] = item;
  }
  /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
   * if the deque is full, it removes the front item before adding the new item.
  */
  insert(index, item) {
    this.count === this.length && this.popFront();
    let i = this.resolveIndex(index);
    for (let j = this.front; j > i; j--)
      this.items[j] = this.items[j - 1];
    this.items[i] = item, this.count++;
  }
}, invertMap = (forward_map) => {
  let reverse_map_keys = [];
  forward_map.forEach((rset) => {
    reverse_map_keys.push(...rset);
  });
  let reverse_map = new Map(
    [...new Set(reverse_map_keys)].map(
      (rkey) => [rkey, /* @__PURE__ */ new Set()]
    )
  ), get_reverse_map = bind_map_get(reverse_map);
  for (let [fkey, rset] of forward_map)
    rset.forEach(
      (rkey) => get_reverse_map(rkey).add(fkey)
    );
  return reverse_map;
}, InvertibleMap = class {
  /** create an empty invertible map. <br>
   * optionally provide an initial `forward_map` to populate the forward mapping, and then automatically deriving the reverse mapping from it. <br>
   * or provide an initial `reverse_map` to populate the reverse mapping, and then automatically deriving the froward mapping from it. <br>
   * if both `forward_map` and `reverse_map` are provided, then it will be up to YOU to make sure that they are actual inverses of each other. <br>
   * @param forward_map initiallize by populating with an optional initial forward map (the reverse map will be automatically computed if `reverse_map === undefined`)
   * @param reverse_map initiallize by populating with an optional initial reverse map (the forward map will be automatically computed if `forward_map === undefined`)
   */
  constructor(forward_map, reverse_map) {
    let fmap = forward_map ?? (reverse_map ? invertMap(reverse_map) : /* @__PURE__ */ new Map()), rmap = reverse_map ?? (forward_map ? invertMap(forward_map) : /* @__PURE__ */ new Map()), fmap_set = bind_map_set(fmap), rmap_set = bind_map_set(rmap), fmap_delete = bind_map_delete(fmap), rmap_delete = bind_map_delete(rmap), size = fmap.size, rsize = rmap.size, forEach = bind_map_forEach(fmap), rforEach = bind_map_forEach(rmap), get = bind_map_get(fmap), rget = bind_map_get(rmap), has = bind_map_has(fmap), rhas = bind_map_has(rmap), entries = bind_map_entries(fmap), rentries = bind_map_entries(rmap), keys = bind_map_keys(fmap), rkeys = bind_map_keys(rmap), values = bind_map_values(fmap), rvalues = bind_map_values(rmap), add2 = (key, ...items) => {
      let forward_items = get(key) ?? (fmap_set(key, /* @__PURE__ */ new Set()) && get(key)), forward_items_has = bind_set_has(forward_items), forward_items_add = bind_set_add(forward_items);
      for (let item of items)
        forward_items_has(item) || (forward_items_add(item), rget(item)?.add(key) || rmap_set(item, /* @__PURE__ */ new Set([key])));
    }, radd = (key, ...items) => {
      let reverse_items = rget(key) ?? (rmap_set(key, /* @__PURE__ */ new Set()) && rget(key)), reverse_items_has = bind_set_has(reverse_items), reverse_items_add = bind_set_add(reverse_items);
      for (let item of items)
        reverse_items_has(item) || (reverse_items_add(item), get(item)?.add(key) || fmap_set(item, /* @__PURE__ */ new Set([key])));
    }, clear = () => {
      fmap.clear(), rmap.clear();
    }, fdelete = (key, keep_key = false) => {
      let forward_items = get(key);
      if (forward_items) {
        for (let item of forward_items)
          rget(item).delete(key);
        keep_key ? forward_items.clear() : keep_key = fmap_delete(key);
      }
      return keep_key;
    }, rdelete = (key, keep_key = false) => {
      let reverse_items = rget(key);
      if (reverse_items) {
        for (let item of reverse_items)
          get(item).delete(key);
        keep_key ? reverse_items.clear() : keep_key = rmap_delete(key);
      }
      return keep_key;
    };
    object_assign(this, {
      fmap,
      rmap,
      size,
      rsize,
      forEach,
      rforEach,
      get,
      rget,
      has,
      rhas,
      entries,
      rentries,
      keys,
      rkeys,
      values,
      rvalues,
      add: add2,
      radd,
      clear,
      delete: fdelete,
      rdelete,
      remove: (key, ...items) => {
        let forward_items = get(key);
        if (forward_items) {
          let forward_items_delete = bind_set_delete(forward_items);
          for (let item of items)
            forward_items_delete(item) && rget(item).delete(key);
        }
      },
      rremove: (key, ...items) => {
        let reverse_items = rget(key);
        if (reverse_items) {
          let reverse_items_delete = bind_set_delete(reverse_items);
          for (let item of items)
            reverse_items_delete(item) && get(item).delete(key);
        }
      },
      set: (key, value) => (fdelete(key, true), add2(key, ...value), this),
      rset: (key, value) => (rdelete(key, true), radd(key, ...value), this),
      [symbol_iterator]: entries,
      [symbol_toStringTag]: "InvertibleMap"
    });
  }
}, TopologicalScheduler = class {
  constructor(edges) {
    let prev_id, edges_get = bind_map_get(edges), stack = [], stack_pop = bind_array_pop(stack), stack_push = bind_array_push(stack), stack_clear = bind_array_clear(stack), seek = bind_stack_seek(stack), visits = /* @__PURE__ */ new Map(), visits_get = bind_map_get(visits), visits_set = bind_map_set(visits), recursive_dfs_visiter = (id) => {
      for (let to_id of edges_get(id) ?? []) {
        let visits2 = visits_get(to_id);
        visits2 ? visits_set(to_id, visits2 + 1) : recursive_dfs_visiter(to_id);
      }
      visits_set(id, 1);
    }, recursive_dfs_unvisiter = (id) => {
      visits_set(id, 0);
      for (let to_id of edges_get(id) ?? []) {
        let new_visits = (visits_get(to_id) ?? 0) - 1;
        new_visits > -1 && (visits_set(to_id, new_visits), new_visits < 1 && recursive_dfs_unvisiter(to_id));
      }
    }, compute_stacks_based_on_visits = () => {
      stack_clear();
      for (let [id, number_of_visits] of visits)
        number_of_visits > 0 && stack_push(id);
    }, pop = () => (prev_id = stack_pop(), prev_id !== void 0 && visits_set(prev_id, 0), prev_id), fire = (...source_ids) => {
      visits.clear(), source_ids.forEach(recursive_dfs_visiter), compute_stacks_based_on_visits();
    }, block = (...block_ids) => {
      array_isEmpty(block_ids) && prev_id !== void 0 && block_ids.push(prev_id), block_ids.forEach(recursive_dfs_unvisiter), compute_stacks_based_on_visits();
    }, clear = () => {
      visits.clear(), stack_clear();
    }, iterate = function* () {
      for (prev_id = pop(); prev_id !== void 0; )
        yield prev_id, prev_id = pop();
    };
    object_assign(this, {
      edges,
      stack,
      fire,
      block,
      clear,
      pop,
      seek,
      [symbol_iterator]: iterate
    });
  }
}, TopologicalAsyncScheduler = class {
  constructor(invertible_edges) {
    let { rforEach, get, rget } = invertible_edges, pending = /* @__PURE__ */ new Set(), pending_add = bind_set_add(pending), pending_delete = bind_set_delete(pending), ins_count = {}, rejected_ins_count = {}, clear = () => {
      pending.clear(), ins_count = {}, rejected_ins_count = {}, rforEach((from_ids, to_id) => {
        ins_count[to_id] = from_ids.size;
      });
    }, fire = (...source_ids) => {
      console.log(source_ids), clear(), source_ids.forEach(pending_add);
    }, resolve = (...ids) => {
      let next_ids = [];
      for (let id of ids)
        pending_delete(id) && get(id)?.forEach((to_id) => {
          let ins_count_of_id = (ins_count[to_id] ?? rget(to_id)?.size ?? 1) - 1;
          ins_count_of_id <= 0 && next_ids.push(to_id), ins_count[to_id] = ins_count_of_id;
        });
      return next_ids.forEach(pending_add), console.log(next_ids), next_ids;
    }, reject = (...ids) => {
      let next_rejected_ids = [];
      for (let id of ids)
        pending_delete(id), get(id)?.forEach((to_id) => {
          (rejected_ins_count[to_id] = (rejected_ins_count[to_id] ?? 0) + 1) >= (rget(to_id)?.size ?? 0) && next_rejected_ids.push(to_id);
        });
      return ids.concat(
        array_isEmpty(next_rejected_ids) ? next_rejected_ids : reject(...next_rejected_ids)
      );
    };
    object_assign(this, { pending, clear, fire, resolve, reject });
  }
}, HybridWeakMap = class {
  wmap = /* @__PURE__ */ new WeakMap();
  smap = /* @__PURE__ */ new Map();
  pick(key) {
    return isComplex(key) ? this.wmap : this.smap;
  }
  get(key) {
    return this.pick(key).get(key);
  }
  set(key, value) {
    return this.pick(key).set(key, value), this;
  }
  has(key) {
    return this.pick(key).has(key);
  }
  delete(key) {
    return this.pick(key).delete(key);
  }
}, TREE_VALUE_UNSET = /* @__PURE__ */ Symbol("represents an unset value for a tree"), treeClass_Factory = (base_map_class) => class Tree extends base_map_class {
  constructor(value = TREE_VALUE_UNSET) {
    super();
    this.value = value;
  }
  getDeep(reverse_keys, create_intermediate = true) {
    if (array_isEmpty(reverse_keys))
      return this;
    let key = reverse_keys.pop(), child = this.get(key);
    return !child && create_intermediate && this.set(key, child = new Tree()), child?.getDeep(reverse_keys, create_intermediate);
  }
  setDeep(reverse_keys, value, create_intermediate = true) {
    let deep_child = this.getDeep(reverse_keys, create_intermediate);
    return deep_child && (deep_child.value = value), deep_child;
  }
  /** check if a deep child exists with the provided array of reversed keys. <br>
   * this is implemented to be slightly quicker than {@link getDeep}
  */
  hasDeep(reverse_keys) {
    if (array_isEmpty(reverse_keys))
      return true;
    let key = reverse_keys.pop();
    return this.get(key)?.hasDeep(reverse_keys) ?? false;
  }
  delDeep(reverse_keys) {
    if (array_isEmpty(reverse_keys))
      return false;
    let [child_key, ...reverse_keys_to_parent] = reverse_keys;
    return this.getDeep(reverse_keys_to_parent, false)?.delete(child_key) ?? false;
  }
}, WeakTree = /* @__PURE__ */ treeClass_Factory(WeakMap), StrongTree = /* @__PURE__ */ treeClass_Factory(Map), HybridTree = /* @__PURE__ */ treeClass_Factory(HybridWeakMap), StackSet = class extends Array {
  $set = /* @__PURE__ */ new Set();
  $add = bind_set_add(this.$set);
  $del = bind_set_delete(this.$set);
  /** determines if an item exists in the stack. <br>
   * this operation is as fast as {@link Set.has}, because that's what's being used internally.
   * so expect no overhead.
  */
  includes = bind_set_has(this.$set);
  /** peek at the top item of the stack without popping */
  top = bind_stack_seek(this);
  /** syncronize the ordering of the stack with the underlying {@link $set} object's insertion order (i.e. iteration ordering). <br>
   * the "f" in "fsync" stands for "forward"
  */
  fsync() {
    return super.splice(0), super.push(...this.$set);
  }
  /** syncronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
   * this process is more expensive than {@link fsync}, as it has to rebuild the entirity of the underlying set object. <br>
   * the "r" in "rsync" stands for "reverse"
  */
  rsync() {
    let { $set, $add } = this;
    return $set.clear(), super.forEach($add), this.length;
  }
  /** reset a `StackSet` with the provided initializing array of unique items */
  reset(initial_items = []) {
    let { $set, $add } = this;
    $set.clear(), initial_items.forEach($add), this.fsync();
  }
  constructor(initial_items) {
    super(), this.reset(initial_items);
  }
  /** pop the item at the top of the stack. */
  pop() {
    let value = super.pop();
    return this.$del(value), value;
  }
  /** push __new__ items to stack. doesn't alter the position of already existing items. <br>
   * @returns the new length of the stack.
  */
  push(...items) {
    let includes = this.includes, $add = this.$add, new_items = items.filter(includes);
    return new_items.forEach($add), super.push(...new_items);
  }
  /** push items to front of stack, even if they already exist in the middle. <br>
   * @returns the new length of the stack.
  */
  pushFront(...items) {
    return items.forEach(this.$del), items.forEach(this.$add), this.fsync();
  }
  /** remove the item at the bottom of the stack. */
  shift() {
    let value = super.shift();
    return this.$del(value), value;
  }
  /** insert __new__ items to the rear of the stack. doesn't alter the position of already existing items. <br>
   * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
   * @returns the new length of the stack.
  */
  unshift(...items) {
    let includes = this.includes, new_items = items.filter(includes);
    return super.unshift(...new_items), this.rsync();
  }
  /** inserts items to the rear of the stack, even if they already exist in the middle. <br>
   * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
   * @returns the new length of the stack.
  */
  unshiftRear(...items) {
    return this.delMany(...items), super.unshift(...items), this.rsync();
  }
  /** delete an item from the stack */
  del(item) {
    return this.$del(item) ? (super.splice(super.indexOf(item), 1), true) : false;
  }
  /** delete multiple items from the stack */
  delMany(...items) {
    items.forEach(this.$del), this.fsync();
  }
}, LimitedStack = class extends Array {
  /** minimum capacity of the stack. <br>
   * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
   * bottom of the stack) are discarded so that the size goes down to the minimum specified here
  */
  min;
  /** maximum capacity of the stack. <br>
   * when the stack size hits this maximum capacity, the oldest items (at the
   * bottom of the stack) are discarded so that the size goes down to {@link min}
  */
  max;
  /** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
  resize_cb;
  constructor(min_capacity, max_capacity, resize_callback) {
    super(), this.min = min_capacity, this.max = max_capacity, this.resize_cb = resize_callback;
  }
  /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
  resize(arg) {
    let len = this.length, discard_quantity = len - this.max > 0 ? len - this.min : 0;
    if (discard_quantity > 0) {
      let discarded_items = super.splice(0, discard_quantity);
      this.resize_cb?.(discarded_items);
    }
    return arg;
  }
  push(...items) {
    return this.resize(super.push(...items));
  }
}, LimitedStackSet = class extends StackSet {
  /** minimum capacity of the stack. <br>
   * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
   * bottom of the stack) are discarded so that the size goes down to the minimum specified here
  */
  min;
  /** maximum capacity of the stack. <br>
   * when the stack size hits this maximum capacity, the oldest items (at the
   * bottom of the stack) are discarded so that the size goes down to {@link min}
  */
  max;
  /** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
  resize_cb;
  constructor(min_capacity, max_capacity, resize_callback) {
    super(), this.min = min_capacity, this.max = max_capacity, this.resize_cb = resize_callback;
  }
  /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
  resize(arg) {
    let len = this.length, discard_quantity = len - this.max > 0 ? len - this.min : 0;
    if (discard_quantity > 0) {
      let discarded_items = super.splice(0, discard_quantity);
      discarded_items.forEach(this.$del), this.resize_cb?.(discarded_items);
    }
    return arg;
  }
  push(...items) {
    return this.resize(super.push(...items));
  }
  pushFront(...items) {
    return this.resize(super.pushFront(...items));
  }
}, ChainedPromiseQueue = class extends Array {
  /** the chain of the "then" functions to run each newly pushed promise through. <br>
   * you may dynamically modify this sequence so that all newly pushed promises will have to go through a different set of "then" functions. <br>
   * do note that old (already existing) promises will not be affected by the modified chain of "then" functions.
   * they'll stick to their original sequence of thens because that gets decided during the moment when a promise is pushed into this collection.
  */
  chain = [];
  /** an array of promises consisting of all the final "then" calls, after which (when fullfilled) the promise would be shortly deleted since it will no longer be pending.
   * the array indexes of `this.pending` line up with `this`, in the sense that `this.pending[i] = this[i].then(this.chain.at(0))...then(this.chain.at(-1))`.
   * once a promise inside of `pending` is fulfilled, it will be shortly deleted (via splicing) from `pending`,
   * and its originating `Promise` which was pushed  into `this` collection will also get removed. <br>
   * (the removal is done by the private {@link del} method)
   * 
   * ```ts
   * declare const do_actions: ChainedPromiseQueue<string>
   * const chain_of_actions = do_actions.chain
   * const my_promise = new Promise<string>((resolve, reject) => {
   * 	//do async stuff
   * })
   * do_actions.push(my_promise)
   * let index = do_actions.indexOf(my_promise) // === do_actions.length - 1
   * // the following are functionally/structurally equivalent:
   * do_actions.pending[index] == do_actions[index]
   * 		.then(chain_of_actions[0])
   * 		.then(chain_of_actions[1])
   * 		// ... lots of thens
   * 		.then(chain_of_actions[chain_of_actions.length - 1])
   * ```
  */
  pending = [];
  onEmpty;
  constructor(then_functions_sequence, { onEmpty, isEmpty } = {}) {
    super(), this.chain.push(...then_functions_sequence), this.onEmpty = onEmpty, isEmpty && onEmpty?.();
  }
  push(...new_promises) {
    let new_length = super.push(...new_promises), chain = this.chain;
    return this.pending.push(...new_promises.map((promise) => {
      chain.forEach(([onfulfilled, onrejected]) => {
        promise = promise.then(onfulfilled, onrejected);
      });
      let completed_promise_deleter = () => this.del(promise);
      return promise.then(completed_promise_deleter, completed_promise_deleter), promise;
    })), new_length;
  }
  /** delete a certain promise that has been chained with the "then" functions.
   * @param completed_pending_promise the promise to be deleted from {@link pending} and {@link this} collection of promises
   * @returns `true` if the pending promise was found and deleted, else `false` will be returned
  */
  del(completed_pending_promise) {
    let pending = this.pending, idx = pending.indexOf(completed_pending_promise);
    return idx >= 0 ? (pending.splice(idx, 1), super.splice(idx, 1), array_isEmpty(this) && this.onEmpty?.(), true) : false;
  }
};
var crc32_table, init_crc32_table = () => {
  crc32_table = new Int32Array(256);
  let polynomial = -306674912;
  for (let i = 0; i < 256; i++) {
    let r = i;
    for (let bit = 8; bit > 0; --bit)
      r = r & 1 ? r >>> 1 ^ polynomial : r >>> 1;
    crc32_table[i] = r;
  }
}, Crc32 = (bytes, crc) => {
  crc = crc === void 0 ? 4294967295 : crc ^ -1, crc32_table === void 0 && init_crc32_table();
  for (let i = 0; i < bytes.length; ++i)
    crc = crc32_table[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
  return (crc ^ -1) >>> 0;
};
var getKeyPath = (obj, kpath) => {
  let value = obj;
  for (let k of kpath)
    value = value[k];
  return value;
}, setKeyPath = (obj, kpath, value) => {
  let child_key = kpath.pop(), parent = getKeyPath(obj, kpath);
  return parent[child_key] = value, obj;
}, bindKeyPathTo = (bind_to) => [
  (kpath) => getKeyPath(bind_to, kpath),
  (kpath, value) => setKeyPath(bind_to, kpath, value)
], getDotPath = (obj, dpath) => getKeyPath(obj, dotPathToKeyPath(dpath)), setDotPath = (obj, dpath, value) => setKeyPath(obj, dotPathToKeyPath(dpath), value), bindDotPathTo = (bind_to) => [
  (dpath) => getDotPath(bind_to, dpath),
  (dpath, value) => setDotPath(bind_to, dpath, value)
], dotPathToKeyPath = (dpath) => dpath.split(".").map((k) => k === "0" ? 0 : parseInt(k) || k);
var encode_varint = (value, type) => encode_varint_array([value], type), encode_varint_array = (value, type) => type[0] === "u" ? encode_uvar_array(value) : encode_ivar_array(value), decode_varint = (buf, offset, type) => {
  let [value, bytesize] = decode_varint_array(buf, offset, type, 1);
  return [value[0], bytesize];
}, decode_varint_array = (buf, offset, type, array_length) => type[0] === "u" ? decode_uvar_array(buf, offset, array_length) : decode_ivar_array(buf, offset, array_length), encode_uvar_array = (value) => {
  let len = value.length, bytes = [];
  for (let i = 0; i < len; i++) {
    let v = value[i];
    v = v * (v >= 0 ? 1 : -1);
    let lsb_to_msb = [];
    do
      lsb_to_msb.push((v & 127) + 128), v >>= 7;
    while (v > 0);
    lsb_to_msb[0] &= 127, bytes.push(...lsb_to_msb.reverse());
  }
  return Uint8Array.from(bytes);
}, decode_uvar_array = (buf, offset = 0, array_length) => {
  array_length === void 0 && (array_length = 1 / 0);
  let array = [], offset_start = offset, buf_length = buf.length, value = 0;
  for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++])
    value <<= 7, value += byte & 127, byte >> 7 || (array.push(value), array_length--, value = 0);
  return offset--, [array, offset - offset_start];
}, encode_ivar_array = (value) => {
  let len = value.length, bytes = [];
  for (let i = 0; i < len; i++) {
    let v = value[i], sign = v >= 0 ? 1 : -1, lsb_to_msb = [];
    for (v = v * sign; v > 63; )
      lsb_to_msb.push((v & 127) + 128), v >>= 7;
    lsb_to_msb.push(v & 63 | (sign == -1 ? 192 : 128)), lsb_to_msb[0] &= 127, bytes.push(...lsb_to_msb.reverse());
  }
  return Uint8Array.from(bytes);
}, decode_ivar_array = (buf, offset = 0, array_length) => {
  array_length === void 0 && (array_length = 1 / 0);
  let array = [], offset_start = offset, buf_length = buf.length, sign = 0, value = 0;
  for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++])
    sign === 0 ? (sign = (byte & 64) > 0 ? -1 : 1, value = byte & 63) : (value <<= 7, value += byte & 127), byte >> 7 || (array.push(value * sign), array_length--, sign = 0, value = 0);
  return offset--, [array, offset - offset_start];
}, encode_uvar = (value) => encode_uvar_array([value]), decode_uvar = (buf, offset = 0) => {
  let [value_arr, bytesize] = decode_uvar_array(buf, offset, 1);
  return [value_arr[0], bytesize];
}, encode_ivar = (value) => encode_ivar_array([value]), decode_ivar = (buf, offset = 0) => {
  let [value_arr, bytesize] = decode_ivar_array(buf, offset, 1);
  return [value_arr[0], bytesize];
};
var isTypedArray = (obj) => !!obj.buffer, typed_array_constructor_of = (type) => {
  if (type[2] === "c")
    return Uint8ClampedArray;
  switch (type = type[0] + type[1], type) {
    case "u1":
      return Uint8Array;
    case "u2":
      return Uint16Array;
    case "u4":
      return Uint32Array;
    case "i1":
      return Int8Array;
    case "i2":
      return Int16Array;
    case "i4":
      return Int32Array;
    case "f4":
      return Float32Array;
    case "f8":
      return Float64Array;
    default:
      return console.error('an unrecognized typed array type `"${type}"` was provided'), Uint8Array;
  }
}, getEnvironmentEndianess = () => new Uint8Array(Uint32Array.of(1).buffer)[0] === 1, env_is_little_endian = /* @__PURE__ */ getEnvironmentEndianess(), swapEndianess = (buf, bytesize) => {
  let len = buf.byteLength;
  for (let i = 0; i < len; i += bytesize)
    buf.subarray(i, i + bytesize).reverse();
  return buf;
}, swapEndianessFast = (buf, bytesize) => {
  let len = buf.byteLength, swapped_buf = new Uint8Array(len), bs = bytesize;
  for (let offset = 0; offset < bs; offset++) {
    let a = bs - 1 - offset * 2;
    for (let i = offset; i < len + offset; i += bs)
      swapped_buf[i] = buf[i + a];
  }
  return swapped_buf;
}, concatBytes = (...arrs) => {
  let offsets = [0];
  for (let arr of arrs)
    offsets.push(offsets[offsets.length - 1] + arr.length);
  let outarr = new Uint8Array(offsets.pop());
  for (let arr of arrs)
    outarr.set(arr, offsets.shift());
  return outarr;
}, concatTyped = (...arrs) => {
  let offsets = [0];
  for (let arr of arrs)
    offsets.push(offsets[offsets.length - 1] + arr.length);
  let outarr = new (constructorOf(arrs[0]))(offsets.pop());
  for (let arr of arrs)
    outarr.set(arr, offsets.shift());
  return outarr;
};
function resolveRange(start, end, length, offset) {
  return start ??= 0, offset ??= 0, length === void 0 ? [start + offset, end === void 0 ? end : end + offset, length] : (end ??= length, start += start >= 0 ? 0 : length, end += end >= 0 ? 0 : length, length = end - start, [start + offset, end + offset, length >= 0 ? length : 0]);
}
var splitTypedSubarray = (arr, step) => sliceSkipTypedSubarray(arr, step), sliceSkip = (arr, slice_length, skip_length = 0, start, end) => {
  [start, end] = resolveRange(start, end, arr.length);
  let out_arr = [];
  for (let offset = start; offset < end; offset += slice_length + skip_length)
    out_arr.push(arr.slice(offset, offset + slice_length));
  return out_arr;
}, sliceSkipTypedSubarray = (arr, slice_length, skip_length = 0, start, end) => {
  [start, end] = resolveRange(start, end, arr.length);
  let out_arr = [];
  for (let offset = start; offset < end; offset += slice_length + skip_length)
    out_arr.push(arr.subarray(offset, offset + slice_length));
  return out_arr;
}, isIdentical = (arr1, arr2) => arr1.length !== arr2.length ? false : isSubidentical(arr1, arr2), isSubidentical = (arr1, arr2) => {
  let len = Math.min(arr1.length, arr2.length);
  for (let i = 0; i < len; i++)
    if (arr1[i] !== arr2[i])
      return false;
  return true;
}, sliceContinuous = (arr, slice_intervals) => {
  let out_arr = [];
  for (let i = 1; i < slice_intervals.length; i++)
    out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i]));
  return out_arr;
}, sliceContinuousTypedSubarray = (arr, slice_intervals) => {
  let out_arr = [];
  for (let i = 1; i < slice_intervals.length; i++)
    out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i]));
  return out_arr;
}, sliceIntervals = (arr, slice_intervals) => {
  let out_arr = [];
  for (let i = 1; i < slice_intervals.length; i += 2)
    out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i]));
  return out_arr;
}, sliceIntervalsTypedSubarray = (arr, slice_intervals) => {
  let out_arr = [];
  for (let i = 1; i < slice_intervals.length; i += 2)
    out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i]));
  return out_arr;
}, sliceIntervalLengths = (arr, slice_intervals) => {
  let out_arr = [];
  for (let i = 1; i < slice_intervals.length; i += 2)
    out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i] === void 0 ? void 0 : slice_intervals[i - 1] + slice_intervals[i]));
  return out_arr;
}, sliceIntervalLengthsTypedSubarray = (arr, slice_intervals) => {
  let out_arr = [];
  for (let i = 1; i < slice_intervals.length; i += 2)
    out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i] === void 0 ? void 0 : slice_intervals[i - 1] + slice_intervals[i]));
  return out_arr;
};
var txt_encoder = /* @__PURE__ */ new TextEncoder(), txt_decoder = /* @__PURE__ */ new TextDecoder(), readFrom = (buf, offset, type, ...args) => {
  let [value, bytesize] = unpack(type, buf, offset, ...args);
  return [value, offset + bytesize];
}, writeTo = (buf, offset, type, value, ...args) => {
  let value_buf = pack(type, value, ...args);
  return buf.set(value_buf, offset), [buf, offset + value_buf.length];
}, packSeq = (...items) => {
  let bufs = [];
  for (let item of items)
    bufs.push(pack(...item));
  return concatBytes(...bufs);
}, unpackSeq = (buf, offset, ...items) => {
  let values = [], total_bytesize = 0;
  for (let [type, ...args] of items) {
    let [value, bytesize] = unpack(type, buf, offset + total_bytesize, ...args);
    values.push(value), total_bytesize += bytesize;
  }
  return [values, total_bytesize];
}, pack = (type, value, ...args) => {
  switch (type) {
    case "bool":
      return encode_bool(value);
    case "cstr":
      return encode_cstr(value);
    case "str":
      return encode_str(value);
    case "bytes":
      return encode_bytes(value);
    default:
      return type[1] === "v" ? type.endsWith("[]") ? encode_varint_array(value, type) : encode_varint(value, type) : type.endsWith("[]") ? encode_number_array(value, type) : encode_number(value, type);
  }
}, unpack = (type, buf, offset, ...args) => {
  switch (type) {
    case "bool":
      return decode_bool(buf, offset);
    case "cstr":
      return decode_cstr(buf, offset);
    case "str":
      return decode_str(buf, offset, ...args);
    case "bytes":
      return decode_bytes(buf, offset, ...args);
    default:
      return type[1] === "v" ? type.endsWith("[]") ? decode_varint_array(buf, offset, type, ...args) : decode_varint(buf, offset, type) : type.endsWith("[]") ? decode_number_array(buf, offset, type, ...args) : decode_number(buf, offset, type);
  }
}, encode_bool = (value) => Uint8Array.of(value ? 1 : 0), decode_bool = (buf, offset = 0) => [buf[offset] >= 1, 1], encode_cstr = (value) => txt_encoder.encode(value + "\0"), decode_cstr = (buf, offset = 0) => {
  let offset_end = buf.indexOf(0, offset), txt_arr = buf.subarray(offset, offset_end);
  return [txt_decoder.decode(txt_arr), txt_arr.length + 1];
}, encode_str = (value) => txt_encoder.encode(value), decode_str = (buf, offset = 0, bytesize) => {
  let offset_end = bytesize === void 0 ? void 0 : offset + bytesize, txt_arr = buf.subarray(offset, offset_end);
  return [txt_decoder.decode(txt_arr), txt_arr.length];
}, encode_bytes = (value) => value, decode_bytes = (buf, offset = 0, bytesize) => {
  let offset_end = bytesize === void 0 ? void 0 : offset + bytesize, value = buf.slice(offset, offset_end);
  return [value, value.length];
}, encode_number_array = (value, type) => {
  let [t, s, e] = type, typed_arr_constructor = typed_array_constructor_of(type), bytesize = parseInt(s), is_native_endian = !!(e === "l" && env_is_little_endian || e === "b" && !env_is_little_endian || bytesize === 1), typed_arr = typed_arr_constructor.from(value);
  if (typed_arr instanceof Uint8Array)
    return typed_arr;
  let buf = new Uint8Array(typed_arr.buffer);
  return is_native_endian ? buf : swapEndianessFast(buf, bytesize);
}, decode_number_array = (buf, offset = 0, type, array_length) => {
  let [t, s, e] = type, bytesize = parseInt(s), is_native_endian = !!(e === "l" && env_is_little_endian || e === "b" && !env_is_little_endian || bytesize === 1), bytelength = array_length ? bytesize * array_length : void 0, array_buf = buf.slice(offset, bytelength ? offset + bytelength : void 0), array_bytesize = array_buf.length, typed_arr_constructor = typed_array_constructor_of(type), typed_arr = new typed_arr_constructor(is_native_endian ? array_buf.buffer : swapEndianessFast(array_buf, bytesize).buffer);
  return [Array.from(typed_arr), array_bytesize];
}, encode_number = (value, type) => encode_number_array([value], type), decode_number = (buf, offset = 0, type) => {
  let [value_arr, bytesize] = decode_number_array(buf, offset, type, 1);
  return [value_arr[0], bytesize];
};
var recordMap = (mapping_funcs, input_data) => {
  let out_data = {};
  for (let k in mapping_funcs)
    out_data[k] = mapping_funcs[k](input_data[k]);
  return out_data;
}, recordArgsMap = (mapping_funcs, input_args) => {
  let out_data = {};
  for (let k in mapping_funcs)
    out_data[k] = mapping_funcs[k](...input_args[k]);
  return out_data;
}, sequenceMap = (mapping_funcs, input_data) => {
  let out_data = [];
  for (let i = 0; i < mapping_funcs.length; i++)
    out_data.push(mapping_funcs[i](input_data[i]));
  return out_data;
}, sequenceArgsMap = (mapping_funcs, input_args) => {
  let out_data = [];
  for (let i = 0; i < mapping_funcs.length; i++)
    out_data.push(mapping_funcs[i](...input_args[i]));
  return out_data;
};
var formatEach = (formatter, v) => array_isArray(v) ? v.map(formatter) : formatter(v), percent_fmt = (v) => ((v ?? 1) * 100).toFixed(0) + "%", percent = (val) => formatEach(percent_fmt, val), ubyte_fmt = (v) => clamp(v ?? 0, 0, 255).toFixed(0), ubyte = (val) => formatEach(ubyte_fmt, val), udegree_fmt = (v) => (v ?? 0).toFixed(1) + "deg", udegree = (val) => formatEach(udegree_fmt, val), hex_fmt = (v) => (v < 16 ? "0" : "") + (v | 0).toString(16), rgb_hex_fmt_map = [
  hex_fmt,
  hex_fmt,
  hex_fmt
], rgb_hex_fmt = (v) => "#" + sequenceMap(rgb_hex_fmt_map, v).join(""), rgba_hex_fmt_map = [
  hex_fmt,
  hex_fmt,
  hex_fmt,
  (a) => hex_fmt(clamp((a ?? 1) * 255, 0, 255))
], rgba_hex_fmt = (v) => "#" + sequenceMap(rgba_hex_fmt_map, v).join(""), rgb_fmt = (v) => "rgb(" + sequenceMap([ubyte_fmt, ubyte_fmt, ubyte_fmt], v).join(",") + ")", rgba_fmt = (v) => "rgba(" + sequenceMap([ubyte_fmt, ubyte_fmt, ubyte_fmt, percent_fmt], v).join(",") + ")", hsl_fmt = (v) => "hsl(" + sequenceMap([udegree_fmt, percent_fmt, percent_fmt], v).join(",") + ")", hsla_fmt = (v) => "hsla(" + sequenceMap([udegree_fmt, percent_fmt, percent_fmt, percent_fmt], v).join(",") + ")";
var bg_canvas, bg_ctx, getBGCanvas = (init_width, init_height) => (bg_canvas ??= new OffscreenCanvas(init_width ?? 10, init_height ?? 10), bg_canvas), getBGCtx = (init_width, init_height) => (bg_ctx === void 0 && (bg_ctx = getBGCanvas(init_width, init_height).getContext("2d", { willReadFrequently: true }), bg_ctx.imageSmoothingEnabled = false), bg_ctx), isBase64Image = (str) => str === void 0 ? false : str.startsWith("data:image/"), getBase64ImageHeader = (str) => str.slice(0, str.indexOf(";base64,") + 8), getBase64ImageMIMEType = (str) => str.slice(5, str.indexOf(";base64,")), getBase64ImageBody = (str) => str.substring(str.indexOf(";base64,") + 8), constructImageBlob = async (img_src, width, crop_rect, bitmap_options, blob_options) => {
  crop_rect && (crop_rect = positiveRect(crop_rect));
  let bitmap_src = await constructImageBitmapSource(img_src, width), bitmap = crop_rect ? await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) : await createImageBitmap(bitmap_src, bitmap_options), canvas = getBGCanvas(), ctx = getBGCtx();
  return canvas.width = bitmap.width, canvas.height = bitmap.height, ctx.globalCompositeOperation = "copy", ctx.resetTransform(), ctx.drawImage(bitmap, 0, 0), canvas.convertToBlob(blob_options);
}, constructImageData = async (img_src, width, crop_rect, bitmap_options, image_data_options) => {
  crop_rect && (crop_rect = positiveRect(crop_rect));
  let bitmap_src = await constructImageBitmapSource(img_src, width), bitmap = crop_rect ? await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) : await createImageBitmap(bitmap_src, bitmap_options), canvas = getBGCanvas(), ctx = getBGCtx();
  return canvas.width = bitmap.width, canvas.height = bitmap.height, ctx.globalCompositeOperation = "copy", ctx.resetTransform(), ctx.drawImage(bitmap, 0, 0), ctx.getImageData(0, 0, bitmap.width, bitmap.height, image_data_options);
}, constructImageBitmapSource = (img_src, width) => {
  if (typeof img_src == "string") {
    let new_img_element = new Image();
    return new_img_element.src = img_src, new_img_element.decode().then(() => new_img_element);
  } else {
    if (img_src instanceof Uint8ClampedArray)
      return promise_resolve(new ImageData(img_src, width));
    if (ArrayBuffer.isView(img_src))
      return constructImageBitmapSource(new Uint8ClampedArray(img_src.buffer), width);
    if (img_src instanceof ArrayBuffer)
      return constructImageBitmapSource(new Uint8ClampedArray(img_src), width);
    if (img_src instanceof Array)
      return constructImageBitmapSource(Uint8ClampedArray.from(img_src), width);
  }
  return promise_resolve(img_src);
}, intensityBitmap = (pixels_buf, channels, alpha_channel, alpha_bias = 1) => {
  let pixel_len = pixels_buf.length / channels, alpha_visibility = new Uint8ClampedArray(pixel_len).fill(1), intensity = new Uint8ClampedArray(pixel_len);
  if (alpha_channel !== void 0) {
    for (let i = 0; i < pixel_len; i++)
      alpha_visibility[i] = pixels_buf[i * channels + alpha_channel] < alpha_bias ? 0 : 1;
    pixels_buf = pixels_buf.filter((v, i) => i % channels !== alpha_channel), channels--;
  }
  for (let ch = 0; ch < channels; ch++)
    for (let i = 0; i < pixel_len; i++)
      intensity[i] += pixels_buf[i * channels + ch];
  if (alpha_channel !== void 0)
    for (let i = 0; i < pixel_len; i++)
      intensity[i] *= alpha_visibility[i];
  return new Uint8Array(intensity.buffer);
}, getBoundingBox = (img_data, padding_condition, minimum_non_padding_value = 1) => {
  let { width, height, data } = img_data, channels = data.length / (width * height), rowAt = (y) => data.subarray(y * width * channels, (y * width + width) * channels), colAt = (x) => {
    let col = new Uint8Array(height * channels);
    for (let y = 0; y < height; y++)
      for (let ch = 0; ch < channels; ch++)
        col[y * channels + ch] = data[(y * width + x) * channels + ch];
    return col;
  }, nonPaddingValue = (data_row_or_col) => {
    let non_padding_value = 0;
    for (let px = 0, len = data_row_or_col.length; px < len; px += channels)
      non_padding_value += padding_condition(data_row_or_col[px + 0], data_row_or_col[px + 1], data_row_or_col[px + 2], data_row_or_col[px + 3]);
    return non_padding_value;
  };
  console.assert(number_isInteger(channels));
  let [top, left, bottom, right] = [0, 0, height, width];
  for (; top < height && !(nonPaddingValue(rowAt(top)) >= minimum_non_padding_value); top++)
    ;
  for (; bottom >= top && !(nonPaddingValue(rowAt(bottom)) >= minimum_non_padding_value); bottom--)
    ;
  for (; left < width && !(nonPaddingValue(colAt(left)) >= minimum_non_padding_value); left++)
    ;
  for (; right >= left && !(nonPaddingValue(colAt(right)) >= minimum_non_padding_value); right--)
    ;
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
}, cropImageData = (img_data, crop_rect) => {
  let { width, height, data } = img_data, channels = data.length / (width * height), crop = positiveRect({ x: 0, y: 0, width, height, ...crop_rect }), [top, left, bottom, right] = [crop.y, crop.x, crop.y + crop.height, crop.x + crop.width];
  console.assert(number_isInteger(channels));
  let row_slice_len = crop.width * channels, skip_len = (width - right + (left - 0)) * channels, trim_start = (top * width + left) * channels, trim_end = ((bottom - 1) * width + right) * channels, cropped_data_rows = sliceSkipTypedSubarray(data, row_slice_len, skip_len, trim_start, trim_end), cropped_data = concatTyped(...cropped_data_rows);
  return channels === 4 ? new ImageData(cropped_data, crop.width, crop.height) : {
    width: crop.width,
    height: crop.height,
    data: cropped_data,
    colorSpace: img_data.colorSpace ?? "srgb"
  };
}, trimImagePadding = (img_data, padding_condition, minimum_non_padding_value = 1) => cropImageData(
  img_data,
  getBoundingBox(img_data, padding_condition, minimum_non_padding_value)
), coordinateTransformer = (coords0, coords1) => {
  let { x: x0, y: y0, width: w0, channels: c0 } = coords0, { x: x1, y: y1, width: w1, channels: c1 } = coords1, x = (x1 ?? 0) - (x0 ?? 0), y = (y1 ?? 0) - (y0 ?? 0);
  return (i0) => c1 * (i0 / c0 % w0 - x + ((i0 / c0 / w0 | 0) - y) * w1);
}, randomRGBA = (alpha) => {
  console.error("not implemented");
};
var THROTTLE_REJECT = /* @__PURE__ */ Symbol("a rejection by a throttled function"), TIMEOUT = /* @__PURE__ */ Symbol("a timeout by an awaited promiseTimeout function"), debounce = (wait_time_ms, fn, rejection_value) => {
  let prev_timer, prev_reject = () => {
  };
  return (...args) => (dom_clearTimeout(prev_timer), rejection_value !== void 0 && prev_reject(rejection_value), new Promise((resolve, reject) => {
    prev_reject = reject, prev_timer = dom_setTimeout(
      () => resolve(fn(...args)),
      wait_time_ms
    );
  }));
}, debounceAndShare = (wait_time_ms, fn) => {
  let prev_timer, current_resolve, current_promise, swap_current_promise_with_a_new_one = (value) => (current_promise = new Promise(
    (resolve, reject) => current_resolve = resolve
  ).then(swap_current_promise_with_a_new_one), value);
  return swap_current_promise_with_a_new_one(), (...args) => (dom_clearTimeout(prev_timer), prev_timer = dom_setTimeout(
    () => current_resolve(fn(...args)),
    wait_time_ms
  ), current_promise);
}, throttle = (delta_time_ms, fn) => {
  let last_call = 0;
  return (...args) => {
    let time_now = date_now();
    return time_now - last_call > delta_time_ms ? (last_call = time_now, fn(...args)) : THROTTLE_REJECT;
  };
}, throttleAndTrail = (trailing_time_ms, delta_time_ms, fn, rejection_value) => {
  let prev_timer, prev_reject = () => {
  }, throttled_fn = throttle(delta_time_ms, fn);
  return (...args) => {
    dom_clearTimeout(prev_timer), rejection_value !== void 0 && prev_reject(rejection_value);
    let result = throttled_fn(...args);
    return result === THROTTLE_REJECT ? new Promise((resolve, reject) => {
      prev_reject = reject, prev_timer = dom_setTimeout(
        () => resolve(fn(...args)),
        trailing_time_ms
      );
    }) : promise_resolve(result);
  };
}, promiseTimeout = (wait_time_ms, should_reject) => new Promise((resolve, reject) => {
  dom_setTimeout(should_reject ? reject : resolve, wait_time_ms, TIMEOUT);
}), memorizeCore = (fn, weak_ref = false) => {
  let memory = weak_ref ? new HybridWeakMap() : /* @__PURE__ */ new Map(), get = bindMethodToSelfByName(memory, "get"), set = bindMethodToSelfByName(memory, "set"), has = bindMethodToSelfByName(memory, "has");
  return { fn: (arg) => {
    let arg_exists = has(arg), value = arg_exists ? get(arg) : fn(arg);
    return arg_exists || set(arg, value), value;
  }, memory };
}, memorize = (fn) => memorizeCore(fn).fn, memorizeAtmostN = (n, fn) => {
  let memorization_controls = memorizeCore(fn), memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"), memorized_fn = memorization_controls.fn;
  return (arg) => memory_has(arg) || --n >= 0 ? memorized_fn(arg) : fn(arg);
}, memorizeAfterN = (n, fn, default_value) => {
  let memorization_controls = memorizeCore(fn), memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"), memorized_fn = memorization_controls.fn;
  return (arg) => {
    let value = memory_has(arg) || --n >= 0 ? memorized_fn(arg) : default_value;
    return n === 0 && (default_value ??= value), value;
  };
}, memorizeLRU = (min_capacity, max_capacity, fn) => {
  let memorization_controls = memorizeCore(fn), memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"), memory_del = bindMethodToSelfByName(memorization_controls.memory, "delete"), memorized_fn = memorization_controls.fn, memorized_args_lru = new LimitedStack(min_capacity, max_capacity, (discarded_items) => {
    discarded_items.forEach(memory_del);
  }), memorized_args_lru_push = bindMethodToSelfByName(memorized_args_lru, "push");
  return (arg) => (memory_has(arg) || memorized_args_lru_push(arg), memorized_fn(arg));
}, memorizeOnce = (fn) => memorizeAfterN(1, fn), memorizeMultiCore = (fn, weak_ref = false) => {
  let tree = weak_ref ? new HybridTree() : new StrongTree();
  return { fn: (...args) => {
    let subtree = tree.getDeep(args.toReversed()), args_exist = subtree.value !== TREE_VALUE_UNSET, value = args_exist ? subtree.value : fn(...args);
    return args_exist || (subtree.value = value), value;
  }, memory: tree };
}, memorizeMulti = (fn) => memorizeMultiCore(fn, false).fn, memorizeMultiWeak = (fn) => memorizeMultiCore(fn, true).fn, curry = (fn, thisArg) => fn.length > 1 ? (arg) => curry(fn.bind(void 0, arg)) : fn.bind(thisArg), curryMulti = (fn, thisArg, remaining_args = fn.length) => (...args_a) => {
  remaining_args -= args_a.length;
  let curried_fn = fn.bind(void 0, ...args_a);
  return remaining_args <= 0 ? curried_fn.call(thisArg) : curryMulti(curried_fn, thisArg, remaining_args);
};
var vectorize0 = (map_func, write_to) => {
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func();
}, vectorize1 = (map_func, write_to, arr1) => {
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func(arr1[i]);
}, vectorize2 = (map_func, write_to, arr1, arr2) => {
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func(arr1[i], arr2[i]);
}, vectorize3 = (map_func, write_to, arr1, arr2, arr3) => {
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func(arr1[i], arr2[i], arr3[i]);
}, vectorize4 = (map_func, write_to, arr1, arr2, arr3, arr4) => {
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i]);
}, vectorize5 = (map_func, write_to, arr1, arr2, arr3, arr4, arr5) => {
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i], arr5[i]);
}, vectorizeN = (map_func, write_to, ...arrs) => {
  let param_length = arrs.length, params = Array(param_length).fill(0);
  for (let i = 0; i < write_to.length; i++) {
    for (let p = 0; p < param_length; p++)
      params[p] = arrs[p][i];
    write_to[i] = map_func(...params);
  }
}, vectorizeIndexHOF = (index_map_func_hof, write_to, ...input_arrs) => {
  let map_func_index = index_map_func_hof(...input_arrs);
  for (let i = 0; i < write_to.length; i++)
    write_to[i] = map_func_index(i);
};
var transpose2D = (matrix) => matrix[0].map(
  (_row_0_col_i, i) => matrix.map(
    (row_arr) => row_arr[i]
  )
), diff = (arr, start, end) => {
  [start, end] = resolveRange(start, end, arr.length);
  let d = arr.slice(start + 1, end);
  for (let i = 0; i < d.length; i++)
    d[i] -= arr[start + i - 1];
  return d;
}, diff_right = (arr, start, end) => {
  [start, end] = resolveRange(start, end, arr.length);
  let d = arr.slice(start, end - 1);
  for (let i = 0; i < d.length; i++)
    d[i] -= arr[start + i + 1];
  return d;
}, cumulativeSum = (arr) => {
  let len = arr.length, cum_sum = new (constructorOf(arr))(len + 1).fill(0);
  for (let i = 0; i < len; i++)
    cum_sum[i + 1] = cum_sum[i] + arr[i];
  return cum_sum;
};
var abs = (arr, start = 0, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] *= arr[i] < 0 ? -1 : 1;
  return arr;
}, neg = (arr, start = 0, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] *= -1;
  return arr;
}, bcomp = (arr, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] = ~arr[i];
  return arr;
}, band = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] &= value;
  return arr;
}, bor = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] |= value;
  return arr;
}, bxor = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] ^= value;
  return arr;
}, blsh = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] <<= value;
  return arr;
}, brsh = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] >>= value;
  return arr;
}, bursh = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] >>>= value;
  return arr;
}, add = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] += value;
  return arr;
}, sub = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] -= value;
  return arr;
}, mult = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] *= value;
  return arr;
}, div = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] /= value;
  return arr;
}, pow = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] **= value;
  return arr;
}, rem = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] %= value;
  return arr;
}, mod = (arr, value, start, end) => {
  start ??= 0, end ??= arr.length;
  for (let i = start; i < end; i++)
    arr[i] = (arr[i] % value + value) % value;
  return arr;
};
var default_HexStringRepr = {
  sep: ", ",
  prefix: "0x",
  postfix: "",
  trailingSep: false,
  bra: "[",
  ket: "]",
  toUpperCase: true,
  radix: 16
}, hexStringOfArray = (arr, options) => {
  let { sep, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix } = { ...default_HexStringRepr, ...options }, num_arr = arr.buffer ? array_from(arr) : arr, str = num_arr.map((v) => {
    let s = (v | 0).toString(radix);
    return s = s.length === 2 ? s : "0" + s, toUpperCase ? string_toUpperCase(s) : s;
  }).reduce((str2, s) => str2 + prefix + s + postfix + sep, "");
  return bra + str.slice(0, trailingSep ? void 0 : -sep.length) + ket;
}, hexStringToArray = (hex_str, options) => {
  let { sep, prefix, postfix, bra, ket, radix } = { ...default_HexStringRepr, ...options }, [sep_len, prefix_len, postfix_len, bra_len, ket_len] = [sep, prefix, postfix, bra, ket].map((s) => s.length), hex_str2 = hex_str.slice(bra_len, ket_len > 0 ? -ket_len : void 0), elem_len = prefix_len + 2 + postfix_len + sep_len, int_arr = [];
  for (let i = prefix_len; i < hex_str2.length; i += elem_len)
    int_arr.push(
      parseInt(
        hex_str2[i] + hex_str2[i + 1],
        // these are the two characters representing the current number in hex-string format
        radix
      )
    );
  return int_arr;
}, toUpperOrLowerCase = (str, option) => option === 1 ? string_toUpperCase(str) : option === -1 ? string_toLowerCase(str) : str, findNextUpperCase = (str, start = 0, end = void 0) => {
  end = (end < str.length ? end : str.length) - 1;
  let str_charCodeAt = bind_string_charCodeAt(str), c;
  for (; c = str_charCodeAt(start++); )
    if (c > 64 && c < 91)
      return start - 1;
}, findNextLowerCase = (str, start = 0, end = void 0) => {
  end = (end < str.length ? end : str.length) - 1;
  let str_charCodeAt = bind_string_charCodeAt(str), c;
  for (; c = str_charCodeAt(start++); )
    if (c > 96 && c < 123)
      return start - 1;
}, findNextUpperOrLowerCase = (str, option, start = 0, end = void 0) => option === 1 ? findNextUpperCase(str, start, end) : option === -1 ? findNextLowerCase(str, start, end) : void 0, wordsToToken = (casetype, words) => {
  let [first_letter_upper, word_first_letter_upper, rest_word_letters_upper, delimiter = "", prefix = "", suffix = ""] = casetype, last_i = words.length - 1;
  return words.map((w, i) => {
    let w_0 = toUpperOrLowerCase(w[0], i > 0 ? word_first_letter_upper : first_letter_upper), w_rest = toUpperOrLowerCase(w.slice(1), rest_word_letters_upper), sep = i < last_i ? delimiter : "";
    return w_0 + w_rest + sep;
  }).reduce((str, word) => str + word, prefix) + suffix;
}, tokenToWords = (casetype, token) => {
  let [, word_first_letter_upper, , delimiter = "", prefix = "", suffix = ""] = casetype;
  token = token.slice(prefix.length, -suffix.length || void 0);
  let words;
  if (delimiter === "") {
    let idxs = [0], i = 0;
    for (; i !== void 0; )
      i = findNextUpperOrLowerCase(token, word_first_letter_upper, i + 1), idxs.push(i);
    words = sliceContinuous(token, idxs);
  } else
    words = token.split(delimiter);
  return words.map((word) => string_toLowerCase(word));
}, convertCase = (from_casetype, to_casetype, token) => wordsToToken(to_casetype, tokenToWords(from_casetype, token)), convertCase_Factory = (from_casetype, to_casetype) => {
  let bound_words_to_token = wordsToToken.bind(void 0, to_casetype), bound_token_to_words = tokenToWords.bind(void 0, from_casetype);
  return (token) => bound_words_to_token(bound_token_to_words(token));
}, snakeCase = [-1, -1, -1, "_"], kebabCase = [-1, -1, -1, "-"], camelCase = [-1, 1, -1, ""], pascalCase = [1, 1, -1, ""], screamingSnakeCase = [1, 1, 1, "_"], screamingKebabCase = [1, 1, 1, "-"], kebabToCamel = /* @__PURE__ */ convertCase_Factory(kebabCase, camelCase), camelToKebab = /* @__PURE__ */ convertCase_Factory(camelCase, kebabCase), snakeToCamel = /* @__PURE__ */ convertCase_Factory(snakeCase, camelCase), camelToSnake = /* @__PURE__ */ convertCase_Factory(camelCase, snakeCase), kebabToSnake = /* @__PURE__ */ convertCase_Factory(kebabCase, snakeCase), snakeToKebab = /* @__PURE__ */ convertCase_Factory(snakeCase, kebabCase);
var isUnitInterval = (value) => value >= 0 && value <= 1, isUByte = (value) => value >= 0 && value <= 255 && value === (value | 0), isDegrees = (value) => value >= 0 && value <= 360, isRadians = (value) => value >= 0 && value <= Math.PI;
export {
  Array2DShape,
  ChainedPromiseQueue,
  Crc32,
  Deque,
  HybridTree,
  HybridWeakMap,
  InvertibleMap,
  LimitedStack,
  LimitedStackSet,
  StackSet,
  StrongTree,
  THROTTLE_REJECT,
  TIMEOUT,
  TREE_VALUE_UNSET,
  TopologicalAsyncScheduler,
  TopologicalScheduler,
  WeakTree,
  abs,
  add,
  array_from,
  array_isArray,
  array_isEmpty,
  array_of,
  band,
  base64BodyToBytes,
  bcomp,
  bindDotPathTo,
  bindKeyPathTo,
  bindMethodFactory,
  bindMethodFactoryByName,
  bindMethodToSelf,
  bindMethodToSelfByName,
  bind_array_at,
  bind_array_clear,
  bind_array_concat,
  bind_array_copyWithin,
  bind_array_entries,
  bind_array_every,
  bind_array_fill,
  bind_array_filter,
  bind_array_find,
  bind_array_findIndex,
  bind_array_findLast,
  bind_array_findLastIndex,
  bind_array_flat,
  bind_array_flatMap,
  bind_array_forEach,
  bind_array_includes,
  bind_array_indexOf,
  bind_array_join,
  bind_array_keys,
  bind_array_lastIndexOf,
  bind_array_map,
  bind_array_pop,
  bind_array_push,
  bind_array_reduce,
  bind_array_reduceRight,
  bind_array_reverse,
  bind_array_shift,
  bind_array_slice,
  bind_array_some,
  bind_array_sort,
  bind_array_splice,
  bind_array_toLocaleString,
  bind_array_toReversed,
  bind_array_toSorted,
  bind_array_toSpliced,
  bind_array_toString,
  bind_array_unshift,
  bind_array_values,
  bind_array_with,
  bind_map_clear,
  bind_map_delete,
  bind_map_entries,
  bind_map_forEach,
  bind_map_get,
  bind_map_has,
  bind_map_keys,
  bind_map_set,
  bind_map_values,
  bind_set_add,
  bind_set_clear,
  bind_set_delete,
  bind_set_entries,
  bind_set_forEach,
  bind_set_has,
  bind_set_keys,
  bind_set_values,
  bind_stack_seek,
  bind_string_at,
  bind_string_charAt,
  bind_string_charCodeAt,
  bind_string_codePointAt,
  blobToBase64,
  blobToBase64Body,
  blobToBase64Split,
  blsh,
  bor,
  brsh,
  bursh,
  bxor,
  bytesToBase64Body,
  camelCase,
  camelToKebab,
  camelToSnake,
  clamp,
  concatBytes,
  concatTyped,
  constructFrom,
  constructImageBitmapSource,
  constructImageBlob,
  constructImageData,
  constructorOf,
  convertCase,
  convertCase_Factory,
  coordinateTransformer,
  cropImageData,
  cumulativeSum,
  curry,
  curryMulti,
  date_now,
  debounce,
  debounceAndShare,
  decode_bool,
  decode_bytes,
  decode_cstr,
  decode_ivar,
  decode_ivar_array,
  decode_number,
  decode_number_array,
  decode_str,
  decode_uvar,
  decode_varint,
  decode_varint_array,
  diff,
  diff_right,
  div,
  dom_clearInterval,
  dom_clearTimeout,
  dom_setInterval,
  dom_setTimeout,
  dotPathToKeyPath,
  downloadBuffer,
  encode_bool,
  encode_bytes,
  encode_cstr,
  encode_ivar,
  encode_ivar_array,
  encode_number,
  encode_number_array,
  encode_str,
  encode_uvar,
  encode_uvar_array,
  encode_varint,
  encode_varint_array,
  env_is_little_endian,
  findNextLowerCase,
  findNextUpperCase,
  findNextUpperOrLowerCase,
  formatEach,
  getBGCanvas,
  getBGCtx,
  getBase64ImageBody,
  getBase64ImageHeader,
  getBase64ImageMIMEType,
  getBoundingBox,
  getDotPath,
  getEnvironmentEndianess,
  getKeyPath,
  hexStringOfArray,
  hexStringToArray,
  hex_fmt,
  hsl_fmt,
  hsla_fmt,
  intensityBitmap,
  invertMap,
  invlerp,
  invlerpClamped,
  invlerpi,
  invlerpiClamped,
  isBase64Image,
  isComplex,
  isDegrees,
  isIdentical,
  isPrimitive,
  isRadians,
  isSubidentical,
  isTypedArray,
  isUByte,
  isUnitInterval,
  kebabCase,
  kebabToCamel,
  kebabToSnake,
  lerp,
  lerpClamped,
  lerpi,
  lerpiClamped,
  lerpv,
  lerpvClamped,
  limp,
  limpClamped,
  max,
  memorize,
  memorizeAfterN,
  memorizeAtmostN,
  memorizeCore,
  memorizeLRU,
  memorizeMulti,
  memorizeMultiCore,
  memorizeMultiWeak,
  memorizeOnce,
  meshGrid,
  meshMap,
  min,
  mod,
  modulo,
  monkeyPatchPrototypeOfClass,
  mult,
  neg,
  noop,
  number_MAX_VALUE,
  number_NEGATIVE_INFINITY,
  number_POSITIVE_INFINITY,
  number_isInteger,
  object_assign,
  object_defineProperty,
  object_entries,
  object_fromEntries,
  object_getPrototypeOf,
  object_keys,
  object_values,
  pack,
  packSeq,
  pascalCase,
  percent,
  percent_fmt,
  positiveRect,
  pow,
  promiseTimeout,
  promise_forever,
  promise_outside,
  promise_reject,
  promise_resolve,
  prototypeOfClass,
  randomRGBA,
  readFrom,
  recordArgsMap,
  recordMap,
  rem,
  resolveRange,
  rgb_fmt,
  rgb_hex_fmt,
  rgba_fmt,
  rgba_hex_fmt,
  rotateArray2DMajor,
  rotateArray2DMinor,
  screamingKebabCase,
  screamingSnakeCase,
  sequenceArgsMap,
  sequenceMap,
  setDotPath,
  setKeyPath,
  sliceContinuous,
  sliceContinuousTypedSubarray,
  sliceIntervalLengths,
  sliceIntervalLengthsTypedSubarray,
  sliceIntervals,
  sliceIntervalsTypedSubarray,
  sliceSkip,
  sliceSkipTypedSubarray,
  snakeCase,
  snakeToCamel,
  snakeToKebab,
  spliceArray2DMajor,
  spliceArray2DMinor,
  splitTypedSubarray,
  string_fromCharCode,
  string_toLowerCase,
  string_toUpperCase,
  sub,
  sum,
  swapEndianess,
  swapEndianessFast,
  symbol_iterator,
  symbol_toStringTag,
  throttle,
  throttleAndTrail,
  toUpperOrLowerCase,
  tokenToWords,
  transpose2D,
  transposeArray2D,
  treeClass_Factory,
  trimImagePadding,
  typed_array_constructor_of,
  ubyte,
  ubyte_fmt,
  udegree,
  udegree_fmt,
  unpack,
  unpackSeq,
  vectorize0,
  vectorize1,
  vectorize2,
  vectorize3,
  vectorize4,
  vectorize5,
  vectorizeIndexHOF,
  vectorizeN,
  wordsToToken,
  writeTo
};
