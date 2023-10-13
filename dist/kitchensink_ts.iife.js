"use strict";
(() => {
  // src/_dnt.polyfills.ts
  if (!Object.hasOwn) {
    Object.defineProperty(Object, "hasOwn", {
      value: function(object, property) {
        if (object == null) {
          throw new TypeError("Cannot convert undefined or null to object");
        }
        return Object.prototype.hasOwnProperty.call(Object(object), property);
      },
      configurable: true,
      enumerable: false,
      writable: true
    });
  }

  // src/builtin_aliases_deps.ts
  var {
    from: array_from,
    isArray: array_isArray,
    of: array_of
  } = Array;
  var array_isEmpty = (array) => array.length === 0;
  var string_fromCharCode = String.fromCharCode;
  var promise_resolve = Promise.resolve;
  var {
    isInteger: number_isInteger,
    MAX_VALUE: number_MAX_VALUE,
    NEGATIVE_INFINITY: number_NEGATIVE_INFINITY,
    POSITIVE_INFINITY: number_POSITIVE_INFINITY
  } = Number;
  var {
    assign: object_assign,
    defineProperty: object_defineProperty,
    keys: object_keys,
    getPrototypeOf: object_getPrototypeOf,
    values: object_values
  } = Object;
  var date_now = Date.now;
  var {
    iterator: symbol_iterator,
    toStringTag: symbol_toStringTag
  } = Symbol;
  var dom_setTimeout = setTimeout;
  var dom_clearTimeout = clearTimeout;
  var dom_setInterval = setInterval;
  var dom_clearInterval = clearInterval;
  var noop = () => {
  };

  // src/numericmethods.ts
  var number_MIN_VALUE = -number_MAX_VALUE;
  var clamp = (value, min2 = number_MIN_VALUE, max2 = number_MAX_VALUE) => value < min2 ? min2 : value > max2 ? max2 : value;
  var modulo = (value, mod2) => (value % mod2 + mod2) % mod2;
  var lerp = (x0, x1, t) => t * (x1 - x0) + x0;
  var lerpClamped = (x0, x1, t) => (t < 0 ? 0 : t > 1 ? 1 : t) * (x1 - x0) + x0;
  var lerpi = (v0, v1, t, i) => t * (v1[i] - v0[i]) + v0[i];
  var lerpiClamped = (v0, v1, t, i) => (t < 0 ? 0 : t > 1 ? 1 : t) * (v1[i] - v0[i]) + v0[i];
  var lerpv = (v0, v1, t) => {
    const len = v0.length, v = Array(len).fill(0);
    for (let i = 0, len2 = v0.length; i < len2; i++)
      v[i] = t * (v1[i] - v0[i]) + v0[i];
    return v;
  };
  var lerpvClamped = (v0, v1, t) => lerpv(v0, v1, t < 0 ? 0 : t > 1 ? 1 : t);
  var invlerp = (x0, x1, x) => (x - x0) / (x1 - x0);
  var invlerpClamped = (x0, x1, x) => {
    const t = (x - x0) / (x1 - x0);
    return t < 0 ? 0 : t > 1 ? 1 : t;
  };
  var invlerpi = (v0, v1, v, i) => (v[i] - v0[i]) / (v1[i] - v0[i]);
  var invlerpiClamped = (v0, v1, v, i) => {
    const t = (v[i] - v0[i]) / (v1[i] - v0[i]);
    return t < 0 ? 0 : t > 1 ? 1 : t;
  };
  var limp = (u0, u1, x0) => u1[0] + (x0 - u0[0]) * (u1[1] - u1[0]) / (u0[1] - u0[0]);
  var limpClamped = (u0, u1, x0) => {
    const t = (x0 - u0[0]) / (u0[1] - u0[0]);
    return (t < 0 ? 0 : t > 1 ? 1 : t) * (u1[1] - u1[0]) + u1[0];
  };
  var sum = (values) => {
    let total = 0, len = values.length;
    for (let i = 0; i < len; i++) {
      total += values[i];
    }
    return total;
  };
  var min = (v0, v1) => v0 < v1 ? v0 : v1;
  var max = (v0, v1) => v0 > v1 ? v0 : v1;

  // src/array2d.ts
  var Array2DShape = (arr2d) => {
    const major_len = arr2d.length, minor_len = arr2d[0]?.length ?? 0;
    return [major_len, minor_len];
  };
  var transposeArray2D = (arr2d) => {
    const [rows, cols] = Array2DShape(arr2d), arr_transposed = [];
    for (let c = 0; c < cols; c++) {
      arr_transposed[c] = [];
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr_transposed[c][r] = arr2d[r][c];
      }
    }
    return arr_transposed;
  };
  var spliceArray2DMajor = (arr2d, start, delete_count, ...insert_items) => {
    const [rows, cols] = Array2DShape(arr2d);
    delete_count ??= max(rows - start, 0);
    return arr2d.splice(start, delete_count, ...insert_items);
  };
  var spliceArray2DMinor = (arr2d, start, delete_count, ...insert_items) => {
    const [rows, cols] = Array2DShape(arr2d), insert_items_rowwise = insert_items.length > 0 ? transposeArray2D(insert_items) : Array(rows).fill([]);
    delete_count ??= max(cols - start, 0);
    return transposeArray2D(
      arr2d.map(
        (row_items, row) => row_items.splice(
          start,
          delete_count,
          ...insert_items_rowwise[row]
        )
      )
    );
  };
  var rotateArray2DMajor = (arr2d, amount) => {
    const [rows, cols] = Array2DShape(arr2d);
    amount = modulo(amount, rows === 0 ? 1 : rows);
    if (amount === 0) {
      return arr2d;
    }
    const right_removed_rows = spliceArray2DMajor(arr2d, rows - amount, amount);
    spliceArray2DMajor(arr2d, 0, 0, ...right_removed_rows);
    return arr2d;
  };
  var rotateArray2DMinor = (arr2d, amount) => {
    const [rows, cols] = Array2DShape(arr2d);
    amount = modulo(amount, cols === 0 ? 1 : cols);
    if (amount === 0) {
      return arr2d;
    }
    const right_removed_cols = spliceArray2DMinor(arr2d, cols - amount, amount);
    spliceArray2DMinor(arr2d, 0, 0, ...right_removed_cols);
    return arr2d;
  };
  var meshGrid = (major_values, minor_values) => {
    const axis0_len = major_values.length, axis1_len = minor_values.length, major_grid = major_values.map((major_val) => Array(axis1_len).fill(major_val)), minor_grid = major_values.map(() => minor_values.slice());
    return [major_grid, minor_grid];
  };
  var meshMap = (map_fn, x_values, y_values) => {
    const axis0_len = x_values.length, axis1_len = y_values.length, z_values = Array(axis0_len).fill(void 0);
    for (let x_idx = 0; x_idx < axis0_len; x_idx++) {
      const row = Array(axis1_len).fill(0), x = x_values[x_idx];
      for (let y_idx = 0; y_idx < axis1_len; y_idx++) {
        row[y_idx] = map_fn(x, y_values[y_idx]);
      }
      z_values[x_idx] = row;
    }
    return z_values;
  };

  // src/struct.ts
  var positiveRect = (r) => {
    let { x, y, width, height } = r;
    if (width < 0) {
      width *= -1;
      x -= width;
    }
    if (height < 0) {
      height *= -1;
      y -= height;
    }
    return { x, y, width, height };
  };
  var constructorOf = (class_instance) => object_getPrototypeOf(class_instance).constructor;
  var constructFrom = (class_instance, ...args) => new (constructorOf(class_instance))(...args);
  var prototypeOfClass = (cls) => cls.prototype;
  var isComplex = (obj) => {
    const obj_type = typeof obj;
    return obj_type === "object" || obj_type === "function";
  };
  var isPrimitive = (obj) => {
    return !isComplex(obj);
  };
  var monkeyPatchPrototypeOfClass = (cls, key, value) => {
    object_defineProperty(prototypeOfClass(cls), key, { value });
  };

  // src/binder.ts
  var bindMethodFactory = (func, ...args) => (thisArg) => func.bind(thisArg, ...args);
  var bindMethodFactoryByName = (instance, method_name, ...args) => {
    return (thisArg) => {
      return instance[method_name].bind(thisArg, ...args);
    };
  };
  var bindMethodToSelf = (self, func, ...args) => func.bind(self, ...args);
  var bindMethodToSelfByName = (self, method_name, ...args) => self[method_name].bind(self, ...args);
  var array_proto = /* @__PURE__ */ prototypeOfClass(Array);
  var map_proto = /* @__PURE__ */ prototypeOfClass(Map);
  var set_proto = /* @__PURE__ */ prototypeOfClass(Set);
  var bind_array_at = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "at");
  var bind_array_concat = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "concat");
  var bind_array_copyWithin = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "copyWithin");
  var bind_array_entries = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "entries");
  var bind_array_every = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "every");
  var bind_array_fill = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "fill");
  var bind_array_filter = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "filter");
  var bind_array_find = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "find");
  var bind_array_findIndex = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "findIndex");
  var bind_array_findLast = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "findLast");
  var bind_array_findLastIndex = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "findLastIndex");
  var bind_array_flat = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "flat");
  var bind_array_flatMap = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "flatMap");
  var bind_array_forEach = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "forEach");
  var bind_array_includes = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "includes");
  var bind_array_indexOf = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "indexOf");
  var bind_array_join = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "join");
  var bind_array_keys = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "keys");
  var bind_array_lastIndexOf = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "lastIndexOf");
  var bind_array_map = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "map");
  var bind_array_pop = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "pop");
  var bind_array_push = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "push");
  var bind_array_reduce = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "reduce");
  var bind_array_reduceRight = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "reduceRight");
  var bind_array_reverse = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "reverse");
  var bind_array_shift = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "shift");
  var bind_array_slice = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "slice");
  var bind_array_some = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "some");
  var bind_array_sort = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "sort");
  var bind_array_splice = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "splice");
  var bind_array_unshift = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "unshift");
  var bind_array_toLocaleString = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toLocaleString");
  var bind_array_toReversed = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toReversed");
  var bind_array_toSorted = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toSorted");
  var bind_array_toSpliced = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toSpliced");
  var bind_array_toString = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "toString");
  var bind_array_values = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "values");
  var bind_array_with = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "with");
  var bind_array_clear = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "splice", 0);
  var bind_stack_seek = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "at", -1);
  var bind_set_add = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "add");
  var bind_set_clear = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "clear");
  var bind_set_delete = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "delete");
  var bind_set_entries = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "entries");
  var bind_set_forEach = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "forEach");
  var bind_set_has = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "has");
  var bind_set_keys = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "keys");
  var bind_set_values = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "values");
  var bind_map_clear = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "clear");
  var bind_map_delete = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "delete");
  var bind_map_entries = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "entries");
  var bind_map_forEach = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "forEach");
  var bind_map_get = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "get");
  var bind_map_has = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "has");
  var bind_map_keys = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "keys");
  var bind_map_set = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "set");
  var bind_map_values = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "values");

  // src/browser.ts
  var downloadBuffer = (data, file_name = "data.bin", mime_type = "application/octet-stream") => {
    const blob = new Blob([data], { type: mime_type }), anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = file_name;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    anchor.remove();
  };
  var blobToBase64 = (blob) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  var blobToBase64Split = (blob) => blobToBase64(blob).then((str_b64) => {
    const [head, body] = str_b64.split(";base64,", 2);
    return [head + ";base64,", body];
  });
  var blobToBase64Body = (blob) => blobToBase64Split(blob).then((b64_tuple) => b64_tuple[1]);
  var base64BodyToBytes = (data_base64) => {
    const data_str = atob(data_base64), len = data_str.length, data_buf = new Uint8Array(len);
    for (let i = 0; i < len; i++)
      data_buf[i] = data_str.charCodeAt(i);
    return data_buf;
  };
  var bytesToBase64Body = (data_buf) => {
    const max_args = 2 ** 15 - 2, data_str_parts = [];
    for (let i = 0; i < data_buf.length; i += max_args) {
      const sub_buf = data_buf.subarray(i, i + max_args);
      data_str_parts.push(string_fromCharCode(...sub_buf));
    }
    return btoa(data_str_parts.join(""));
  };

  // src/collections.ts
  var Deque = class {
    /** a double-ended circular queue, similar to python's `collection.deque` <br>
     * @param length maximum length of the queue. <br>
     * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
    */
    constructor(length) {
      this.length = length;
      this.items = Array(length);
      this.back = length - 1;
    }
    items;
    front = 0;
    back;
    count = 0;
    static {
      /* @__PURE__ */ monkeyPatchPrototypeOfClass(this, symbol_iterator, function() {
        const count = this.count;
        let i = 0;
        return {
          next: () => i < count ? { value: this.at(i++), done: false } : { value: void 0, done: true }
        };
      });
    }
    /** inserts one or more items to the back of the deque. <br>
     * if the deque is full, it will remove the front item before adding a new item
    */
    pushBack(...items) {
      for (const item of items) {
        if (this.count === this.length)
          this.popFront();
        this.items[this.back] = item;
        this.back = modulo(this.back - 1, this.length);
        this.count++;
      }
    }
    /** inserts one or more items to the front of the deque. <br>
     * if the deque is full, it will remove the rear item before adding a new item
    */
    pushFront(...items) {
      for (const item of items) {
        if (this.count === this.length)
          this.popBack();
        this.items[this.front] = item;
        this.front = modulo(this.front + 1, this.length);
        this.count++;
      }
    }
    /** get the item at the back of the deque without removing/popping it */
    getBack() {
      if (this.count === 0)
        return void 0;
      return this.items[modulo(this.back + 1, this.length)];
    }
    /** get the item at the front of the deque without removing/popping it */
    getFront() {
      if (this.count === 0)
        return void 0;
      return this.items[modulo(this.front - 1, this.length)];
    }
    /** removes/pops the item at the back of the deque and returns it */
    popBack() {
      if (this.count === 0)
        return void 0;
      this.back = modulo(this.back + 1, this.length);
      const item = this.items[this.back];
      this.items[this.back] = void 0;
      this.count--;
      return item;
    }
    /** removes/pops the item at the front of the deque and returns it */
    popFront() {
      if (this.count === 0)
        return void 0;
      this.front = modulo(this.front - 1, this.length);
      const item = this.items[this.front];
      this.items[this.front] = void 0;
      this.count--;
      return item;
    }
    /** rotates the deque `steps` number of positions to the right. <br>
     * if `steps` is negative, then it will rotate in the left direction. <br>
     * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
    */
    rotate(steps) {
      const { front, back, length, count, items } = this;
      if (count === 0)
        return;
      steps = modulo(steps, count);
      if (count < length) {
        for (let i = 0; i < steps; i++) {
          const b = modulo(back - i, length), f = modulo(front - i - 1, length);
          items[b] = items[f];
          items[f] = void 0;
        }
      }
      this.front = modulo(front - steps, length);
      this.back = modulo(back - steps, length);
    }
    /** reverses the order of the items in the deque. */
    reverse() {
      const center = this.count / 2 | 0, { length, front, back, items } = this;
      for (let i = 1; i <= center; i++) {
        const b = modulo(back + i, length), f = modulo(front - i, length), temp = items[b];
        items[b] = items[f];
        items[f] = temp;
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
      if (this.count === this.length)
        this.popFront();
      const i = this.resolveIndex(index);
      for (let j = this.front; j > i; j--)
        this.items[j] = this.items[j - 1];
      this.items[i] = item;
      this.count++;
    }
  };
  var invertMap = (forward_map) => {
    const reverse_map_keys = [];
    forward_map.forEach((rset) => {
      reverse_map_keys.push(...rset);
    });
    const reverse_map = new Map(
      [...new Set(reverse_map_keys)].map(
        (rkey) => [rkey, /* @__PURE__ */ new Set()]
      )
    ), get_reverse_map = bind_map_get(reverse_map);
    for (const [fkey, rset] of forward_map) {
      rset.forEach(
        (rkey) => get_reverse_map(rkey).add(fkey)
      );
    }
    return reverse_map;
  };
  var InvertibleMap = class {
    /** create an empty invertible map. <br>
     * optionally provide an initial `forward_map` to populate the forward mapping, and then automatically deriving the reverse mapping from it. <br>
     * or provide an initial `reverse_map` to populate the reverse mapping, and then automatically deriving the froward mapping from it. <br>
     * if both `forward_map` and `reverse_map` are provided, then it will be up to YOU to make sure that they are actual inverses of each other. <br>
     * @param forward_map initiallize by populating with an optional initial forward map (the reverse map will be automatically computed if `reverse_map === undefined`)
     * @param reverse_map initiallize by populating with an optional initial reverse map (the forward map will be automatically computed if `forward_map === undefined`)
     */
    constructor(forward_map, reverse_map) {
      const fmap = forward_map ?? (reverse_map ? invertMap(reverse_map) : /* @__PURE__ */ new Map()), rmap = reverse_map ?? (forward_map ? invertMap(forward_map) : /* @__PURE__ */ new Map()), fmap_set = bind_map_set(fmap), rmap_set = bind_map_set(rmap), fmap_delete = bind_map_delete(fmap), rmap_delete = bind_map_delete(rmap), size = fmap.size, rsize = rmap.size, forEach = bind_map_forEach(fmap), rforEach = bind_map_forEach(rmap), get = bind_map_get(fmap), rget = bind_map_get(rmap), has = bind_map_has(fmap), rhas = bind_map_has(rmap), entries = bind_map_entries(fmap), rentries = bind_map_entries(rmap), keys = bind_map_keys(fmap), rkeys = bind_map_keys(rmap), values = bind_map_values(fmap), rvalues = bind_map_values(rmap);
      const add2 = (key, ...items) => {
        const forward_items = get(key) ?? (fmap_set(key, /* @__PURE__ */ new Set()) && get(key)), forward_items_has = bind_set_has(forward_items), forward_items_add = bind_set_add(forward_items);
        for (const item of items) {
          if (!forward_items_has(item)) {
            forward_items_add(item);
            if (!rget(item)?.add(key)) {
              rmap_set(item, /* @__PURE__ */ new Set([key]));
            }
          }
        }
      };
      const radd = (key, ...items) => {
        const reverse_items = rget(key) ?? (rmap_set(key, /* @__PURE__ */ new Set()) && rget(key)), reverse_items_has = bind_set_has(reverse_items), reverse_items_add = bind_set_add(reverse_items);
        for (const item of items) {
          if (!reverse_items_has(item)) {
            reverse_items_add(item);
            if (!get(item)?.add(key)) {
              fmap_set(item, /* @__PURE__ */ new Set([key]));
            }
          }
        }
      };
      const clear = () => {
        fmap.clear();
        rmap.clear();
      };
      const fdelete = (key, keep_key = false) => {
        const forward_items = get(key);
        if (forward_items) {
          for (const item of forward_items) {
            rget(item).delete(key);
          }
          if (keep_key) {
            forward_items.clear();
          } else {
            keep_key = fmap_delete(key);
          }
        }
        return keep_key;
      };
      const rdelete = (key, keep_key = false) => {
        const reverse_items = rget(key);
        if (reverse_items) {
          for (const item of reverse_items) {
            get(item).delete(key);
          }
          if (keep_key) {
            reverse_items.clear();
          } else {
            keep_key = rmap_delete(key);
          }
        }
        return keep_key;
      };
      const remove = (key, ...items) => {
        const forward_items = get(key);
        if (forward_items) {
          const forward_items_delete = bind_set_delete(forward_items);
          for (const item of items) {
            if (forward_items_delete(item)) {
              rget(item).delete(key);
            }
          }
        }
      };
      const rremove = (key, ...items) => {
        const reverse_items = rget(key);
        if (reverse_items) {
          const reverse_items_delete = bind_set_delete(reverse_items);
          for (const item of items) {
            if (reverse_items_delete(item)) {
              get(item).delete(key);
            }
          }
        }
      };
      const set = (key, value) => {
        fdelete(key, true);
        add2(key, ...value);
        return this;
      };
      const rset = (key, value) => {
        rdelete(key, true);
        radd(key, ...value);
        return this;
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
        remove,
        rremove,
        set,
        rset,
        [symbol_iterator]: entries,
        [symbol_toStringTag]: "InvertibleMap"
      });
    }
  };
  var TopologicalScheduler = class {
    constructor(edges) {
      let prev_id = void 0;
      const edges_get = bind_map_get(edges), stack = [], stack_pop = bind_array_pop(stack), stack_push = bind_array_push(stack), stack_clear = bind_array_clear(stack), seek = bind_stack_seek(stack), visits = /* @__PURE__ */ new Map(), visits_get = bind_map_get(visits), visits_set = bind_map_set(visits);
      const recursive_dfs_visiter = (id) => {
        for (const to_id of edges_get(id) ?? []) {
          const visits2 = visits_get(to_id);
          if (visits2) {
            visits_set(to_id, visits2 + 1);
          } else {
            recursive_dfs_visiter(to_id);
          }
        }
        visits_set(id, 1);
      };
      const recursive_dfs_unvisiter = (id) => {
        visits_set(id, 0);
        for (const to_id of edges_get(id) ?? []) {
          const new_visits = (visits_get(to_id) ?? 0) - 1;
          if (new_visits > -1) {
            visits_set(to_id, new_visits);
            if (new_visits < 1) {
              recursive_dfs_unvisiter(to_id);
            }
          }
        }
      };
      const compute_stacks_based_on_visits = () => {
        stack_clear();
        for (const [id, number_of_visits] of visits) {
          if (number_of_visits > 0) {
            stack_push(id);
          }
        }
      };
      const pop = () => {
        prev_id = stack_pop();
        if (prev_id !== void 0) {
          visits_set(prev_id, 0);
        }
        return prev_id;
      };
      const fire = (...source_ids) => {
        visits.clear();
        source_ids.forEach(recursive_dfs_visiter);
        compute_stacks_based_on_visits();
      };
      const block = (...block_ids) => {
        if (array_isEmpty(block_ids) && prev_id !== void 0) {
          block_ids.push(prev_id);
        }
        block_ids.forEach(recursive_dfs_unvisiter);
        compute_stacks_based_on_visits();
      };
      const clear = () => {
        visits.clear();
        stack_clear();
      };
      const iterate = function* () {
        prev_id = pop();
        while (prev_id !== void 0) {
          yield prev_id;
          prev_id = pop();
        }
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
  };
  var TopologicalAsyncScheduler = class {
    constructor(invertible_edges) {
      const { rforEach, get, rget } = invertible_edges, pending = /* @__PURE__ */ new Set(), pending_add = bind_set_add(pending), pending_delete = bind_set_delete(pending);
      let ins_count = {}, rejected_ins_count = {};
      const clear = () => {
        pending.clear();
        ins_count = {};
        rejected_ins_count = {};
        rforEach((from_ids, to_id) => {
          ins_count[to_id] = from_ids.size;
        });
      };
      const fire = (...source_ids) => {
        console.log(source_ids);
        clear();
        source_ids.forEach(pending_add);
      };
      const resolve = (...ids) => {
        const next_ids = [];
        for (const id of ids) {
          if (pending_delete(id)) {
            get(id)?.forEach((to_id) => {
              const ins_count_of_id = (ins_count[to_id] ?? rget(to_id)?.size ?? 1) - 1;
              if (ins_count_of_id <= 0) {
                next_ids.push(to_id);
              }
              ins_count[to_id] = ins_count_of_id;
            });
          }
        }
        next_ids.forEach(pending_add);
        console.log(next_ids);
        return next_ids;
      };
      const reject = (...ids) => {
        const next_rejected_ids = [];
        for (const id of ids) {
          pending_delete(id);
          get(id)?.forEach((to_id) => {
            if ((rejected_ins_count[to_id] = (rejected_ins_count[to_id] ?? 0) + 1) >= (rget(to_id)?.size ?? 0)) {
              next_rejected_ids.push(to_id);
            }
          });
        }
        return ids.concat(
          array_isEmpty(next_rejected_ids) ? next_rejected_ids : reject(...next_rejected_ids)
        );
      };
      object_assign(this, { pending, clear, fire, resolve, reject });
    }
  };
  var HybridWeakMap = class {
    wmap = /* @__PURE__ */ new WeakMap();
    smap = /* @__PURE__ */ new Map();
    pick(key) {
      return isComplex(key) ? this.wmap : this.smap;
    }
    get(key) {
      return this.pick(key).get(key);
    }
    set(key, value) {
      this.pick(key).set(key, value);
      return this;
    }
    has(key) {
      return this.pick(key).has(key);
    }
    delete(key) {
      return this.pick(key).delete(key);
    }
  };
  var TREE_VALUE_UNSET = /* @__PURE__ */ Symbol("represents an unset value for a tree");
  var treeClass_Factory = (base_map_class) => {
    return class Tree extends base_map_class {
      constructor(value = TREE_VALUE_UNSET) {
        super();
        this.value = value;
      }
      getDeep(reverse_keys, create_intermediate = true) {
        if (array_isEmpty(reverse_keys)) {
          return this;
        }
        const key = reverse_keys.pop();
        let child = this.get(key);
        if (!child && create_intermediate) {
          this.set(key, child = new Tree());
        }
        return child?.getDeep(reverse_keys, create_intermediate);
      }
      setDeep(reverse_keys, value, create_intermediate = true) {
        const deep_child = this.getDeep(reverse_keys, create_intermediate);
        if (deep_child) {
          deep_child.value = value;
        }
        return deep_child;
      }
      /** check if a deep child exists with the provided array of reversed keys. <br>
       * this is implemented to be slightly quicker than {@link getDeep}
      */
      hasDeep(reverse_keys) {
        if (array_isEmpty(reverse_keys)) {
          return true;
        }
        const key = reverse_keys.pop(), child = this.get(key);
        return child?.hasDeep(reverse_keys) ?? false;
      }
      delDeep(reverse_keys) {
        if (array_isEmpty(reverse_keys)) {
          return false;
        }
        const [child_key, ...reverse_keys_to_parent] = reverse_keys, deep_parent = this.getDeep(reverse_keys_to_parent, false);
        return deep_parent?.delete(child_key) ?? false;
      }
    };
  };
  var WeakTree = /* @__PURE__ */ treeClass_Factory(WeakMap);
  var StrongTree = /* @__PURE__ */ treeClass_Factory(Map);
  var HybridTree = /* @__PURE__ */ treeClass_Factory(HybridWeakMap);
  var StackSet = class extends Array {
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
      super.splice(0);
      return super.push(...this.$set);
    }
    /** syncronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
     * this process is more expensive than {@link fsync}, as it has to rebuild the entirity of the underlying set object. <br>
     * the "r" in "rsync" stands for "reverse"
    */
    rsync() {
      const { $set, $add } = this;
      $set.clear();
      super.forEach($add);
      return this.length;
    }
    /** reset a `StackSet` with the provided initializing array of unique items */
    reset(initial_items = []) {
      const { $set, $add } = this;
      $set.clear();
      initial_items.forEach($add);
      this.fsync();
    }
    constructor(initial_items) {
      super();
      this.reset(initial_items);
    }
    /** pop the item at the top of the stack. */
    pop() {
      const value = super.pop();
      this.$del(value);
      return value;
    }
    /** push __new__ items to stack. doesn't alter the position of already existing items. <br>
     * @returns the new length of the stack.
    */
    push(...items) {
      const includes = this.includes, $add = this.$add, new_items = items.filter(includes);
      new_items.forEach($add);
      return super.push(...new_items);
    }
    /** push items to front of stack, even if they already exist in the middle. <br>
     * @returns the new length of the stack.
    */
    pushFront(...items) {
      items.forEach(this.$del);
      items.forEach(this.$add);
      return this.fsync();
    }
    /** remove the item at the bottom of the stack. */
    shift() {
      const value = super.shift();
      this.$del(value);
      return value;
    }
    /** insert __new__ items to the rear of the stack. doesn't alter the position of already existing items. <br>
     * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
     * @returns the new length of the stack.
    */
    unshift(...items) {
      const includes = this.includes, new_items = items.filter(includes);
      super.unshift(...new_items);
      return this.rsync();
    }
    /** inserts items to the rear of the stack, even if they already exist in the middle. <br>
     * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
     * @returns the new length of the stack.
    */
    unshiftRear(...items) {
      this.delMany(...items);
      super.unshift(...items);
      return this.rsync();
    }
    /** delete an item from the stack */
    del(item) {
      const item_exists = this.$del(item);
      if (item_exists) {
        super.splice(super.indexOf(item), 1);
        return true;
      }
      return false;
    }
    /** delete multiple items from the stack */
    delMany(...items) {
      items.forEach(this.$del);
      this.fsync();
    }
  };
  var LimitedStack = class extends Array {
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
      super();
      this.min = min_capacity;
      this.max = max_capacity;
      this.resize_cb = resize_callback;
    }
    /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
    resize(arg) {
      const len = this.length, discard_quantity = len - this.max > 0 ? len - this.min : 0;
      if (discard_quantity > 0) {
        const discarded_items = super.splice(0, discard_quantity);
        this.resize_cb?.(discarded_items);
      }
      return arg;
    }
    push(...items) {
      return this.resize(super.push(...items));
    }
  };
  var LimitedStackSet = class extends StackSet {
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
      super();
      this.min = min_capacity;
      this.max = max_capacity;
      this.resize_cb = resize_callback;
    }
    /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
    resize(arg) {
      const len = this.length, discard_quantity = len - this.max > 0 ? len - this.min : 0;
      if (discard_quantity > 0) {
        const discarded_items = super.splice(0, discard_quantity);
        discarded_items.forEach(this.$del);
        this.resize_cb?.(discarded_items);
      }
      return arg;
    }
    push(...items) {
      return this.resize(super.push(...items));
    }
    pushFront(...items) {
      return this.resize(super.pushFront(...items));
    }
  };

  // src/crypto.ts
  var crc32_table;
  var init_crc32_table = () => {
    crc32_table = new Int32Array(256);
    const polynomial = -306674912;
    for (let i = 0; i < 256; i++) {
      let r = i;
      for (let bit = 8; bit > 0; --bit)
        r = r & 1 ? r >>> 1 ^ polynomial : r >>> 1;
      crc32_table[i] = r;
    }
  };
  var Crc32 = (bytes, crc) => {
    crc = crc === void 0 ? 4294967295 : crc ^ -1;
    if (crc32_table === void 0)
      init_crc32_table();
    for (let i = 0; i < bytes.length; ++i)
      crc = crc32_table[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
    return (crc ^ -1) >>> 0;
  };

  // src/dotkeypath.ts
  var getKeyPath = (obj, kpath) => {
    let value = obj;
    for (const k of kpath)
      value = value[k];
    return value;
  };
  var setKeyPath = (obj, kpath, value) => {
    const child_key = kpath.pop(), parent = getKeyPath(obj, kpath);
    parent[child_key] = value;
    return obj;
  };
  var bindKeyPathTo = (bind_to) => [
    (kpath) => getKeyPath(bind_to, kpath),
    (kpath, value) => setKeyPath(bind_to, kpath, value)
  ];
  var getDotPath = (obj, dpath) => getKeyPath(obj, dotPathToKeyPath(dpath));
  var setDotPath = (obj, dpath, value) => setKeyPath(obj, dotPathToKeyPath(dpath), value);
  var bindDotPathTo = (bind_to) => [
    (dpath) => getDotPath(bind_to, dpath),
    (dpath, value) => setDotPath(bind_to, dpath, value)
  ];
  var dotPathToKeyPath = (dpath) => dpath.split(".").map((k) => k === "0" ? 0 : parseInt(k) || k);

  // src/eightpack_varint.ts
  var encode_varint = (value, type) => encode_varint_array([value], type);
  var encode_varint_array = (value, type) => type[0] === "u" ? encode_uvar_array(value) : encode_ivar_array(value);
  var decode_varint = (buf, offset, type) => {
    const [value, bytesize] = decode_varint_array(buf, offset, type, 1);
    return [value[0], bytesize];
  };
  var decode_varint_array = (buf, offset, type, array_length) => type[0] === "u" ? decode_uvar_array(buf, offset, array_length) : decode_ivar_array(buf, offset, array_length);
  var encode_uvar_array = (value) => {
    const len = value.length, bytes = [];
    for (let i = 0; i < len; i++) {
      let v = value[i];
      v = v * (v >= 0 ? 1 : -1);
      const lsb_to_msb = [];
      do {
        lsb_to_msb.push((v & 127) + 128);
        v >>= 7;
      } while (v > 0);
      lsb_to_msb[0] &= 127;
      bytes.push(...lsb_to_msb.reverse());
    }
    return Uint8Array.from(bytes);
  };
  var decode_uvar_array = (buf, offset = 0, array_length) => {
    if (array_length === void 0)
      array_length = Infinity;
    const array = [], offset_start = offset, buf_length = buf.length;
    let value = 0;
    for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++]) {
      value <<= 7;
      value += byte & 127;
      if (byte >> 7 === 0) {
        array.push(value);
        array_length--;
        value = 0;
      }
    }
    offset--;
    return [array, offset - offset_start];
  };
  var encode_ivar_array = (value) => {
    const len = value.length, bytes = [];
    for (let i = 0; i < len; i++) {
      let v = value[i];
      const sign = v >= 0 ? 1 : -1, lsb_to_msb = [];
      v = v * sign;
      while (v > 63) {
        lsb_to_msb.push((v & 127) + 128);
        v >>= 7;
      }
      lsb_to_msb.push(v & 63 | (sign == -1 ? 192 : 128));
      lsb_to_msb[0] &= 127;
      bytes.push(...lsb_to_msb.reverse());
    }
    return Uint8Array.from(bytes);
  };
  var decode_ivar_array = (buf, offset = 0, array_length) => {
    if (array_length === void 0)
      array_length = Infinity;
    const array = [], offset_start = offset, buf_length = buf.length;
    let sign = 0, value = 0;
    for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++]) {
      if (sign === 0) {
        sign = (byte & 64) > 0 ? -1 : 1;
        value = byte & 63;
      } else {
        value <<= 7;
        value += byte & 127;
      }
      if (byte >> 7 === 0) {
        array.push(value * sign);
        array_length--;
        sign = 0;
        value = 0;
      }
    }
    offset--;
    return [array, offset - offset_start];
  };
  var encode_uvar = (value) => encode_uvar_array([value]);
  var decode_uvar = (buf, offset = 0) => {
    const [value_arr, bytesize] = decode_uvar_array(buf, offset, 1);
    return [value_arr[0], bytesize];
  };
  var encode_ivar = (value) => encode_ivar_array([value]);
  var decode_ivar = (buf, offset = 0) => {
    const [value_arr, bytesize] = decode_ivar_array(buf, offset, 1);
    return [value_arr[0], bytesize];
  };

  // src/typedbuffer.ts
  var isTypedArray = (obj) => obj.buffer ? true : false;
  var typed_array_constructor_of = (type) => {
    if (type[2] === "c")
      return Uint8ClampedArray;
    type = type[0] + type[1];
    switch (type) {
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
      default: {
        console.error('an unrecognized typed array type `"${type}"` was provided');
        return Uint8Array;
      }
    }
  };
  var getEnvironmentEndianess = () => new Uint8Array(Uint32Array.of(1).buffer)[0] === 1 ? true : false;
  var env_le = getEnvironmentEndianess();
  var swapEndianess = (buf, bytesize) => {
    const len = buf.byteLength;
    for (let i = 0; i < len; i += bytesize)
      buf.subarray(i, i + bytesize).reverse();
    return buf;
  };
  var swapEndianessFast = (buf, bytesize) => {
    const len = buf.byteLength, swapped_buf = new Uint8Array(len), bs = bytesize;
    for (let offset = 0; offset < bs; offset++) {
      const a = bs - 1 - offset * 2;
      for (let i = offset; i < len + offset; i += bs)
        swapped_buf[i] = buf[i + a];
    }
    return swapped_buf;
  };
  var concatBytes = (...arrs) => {
    const offsets = [0];
    for (const arr of arrs)
      offsets.push(offsets[offsets.length - 1] + arr.length);
    const outarr = new Uint8Array(offsets.pop());
    for (const arr of arrs)
      outarr.set(arr, offsets.shift());
    return outarr;
  };
  var concatTyped = (...arrs) => {
    const offsets = [0];
    for (const arr of arrs)
      offsets.push(offsets[offsets.length - 1] + arr.length);
    const outarr = new (constructorOf(arrs[0]))(offsets.pop());
    for (const arr of arrs)
      outarr.set(arr, offsets.shift());
    return outarr;
  };
  function resolveRange(start, end, length, offset) {
    start ??= 0;
    offset ??= 0;
    if (length === void 0)
      return [start + offset, end === void 0 ? end : end + offset, length];
    end ??= length;
    start += start >= 0 ? 0 : length;
    end += end >= 0 ? 0 : length;
    length = end - start;
    return [start + offset, end + offset, length >= 0 ? length : 0];
  }
  var splitTypedSubarray = (arr, step) => sliceSkipTypedSubarray(arr, step);
  var sliceSkip = (arr, slice_length, skip_length = 0, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const out_arr = [];
    for (let offset = start; offset < end; offset += slice_length + skip_length)
      out_arr.push(arr.slice(offset, offset + slice_length));
    return out_arr;
  };
  var sliceSkipTypedSubarray = (arr, slice_length, skip_length = 0, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const out_arr = [];
    for (let offset = start; offset < end; offset += slice_length + skip_length)
      out_arr.push(arr.subarray(offset, offset + slice_length));
    return out_arr;
  };
  var isIdentical = (arr1, arr2) => {
    if (arr1.length !== arr2.length)
      return false;
    return isSubidentical(arr1, arr2);
  };
  var isSubidentical = (arr1, arr2) => {
    const len = Math.min(arr1.length, arr2.length);
    for (let i = 0; i < len; i++)
      if (arr1[i] !== arr2[i])
        return false;
    return true;
  };
  var sliceContinuous = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i++)
      out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i]));
    return out_arr;
  };
  var sliceContinuousTypedSubarray = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i++)
      out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i]));
    return out_arr;
  };
  var sliceIntervals = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2)
      out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i]));
    return out_arr;
  };
  var sliceIntervalsTypedSubarray = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2)
      out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i]));
    return out_arr;
  };
  var sliceIntervalLengths = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2)
      out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i] === void 0 ? void 0 : slice_intervals[i - 1] + slice_intervals[i]));
    return out_arr;
  };
  var sliceIntervalLengthsTypedSubarray = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2)
      out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i] === void 0 ? void 0 : slice_intervals[i - 1] + slice_intervals[i]));
    return out_arr;
  };

  // src/eightpack.ts
  var txt_encoder = new TextEncoder();
  var txt_decoder = new TextDecoder();
  var readFrom = (buf, offset, type, ...args) => {
    const [value, bytesize] = unpack(type, buf, offset, ...args);
    return [value, offset + bytesize];
  };
  var writeTo = (buf, offset, type, value, ...args) => {
    const value_buf = pack(type, value, ...args);
    buf.set(value_buf, offset);
    return [buf, offset + value_buf.length];
  };
  var packSeq = (...items) => {
    const bufs = [];
    for (const item of items)
      bufs.push(pack(...item));
    return concatBytes(...bufs);
  };
  var unpackSeq = (buf, offset, ...items) => {
    const values = [];
    let total_bytesize = 0;
    for (const [type, ...args] of items) {
      const [value, bytesize] = unpack(type, buf, offset + total_bytesize, ...args);
      values.push(value);
      total_bytesize += bytesize;
    }
    return [values, total_bytesize];
  };
  var pack = (type, value, ...args) => {
    switch (type) {
      case "bool":
        return encode_bool(value);
      case "cstr":
        return encode_cstr(value);
      case "str":
        return encode_str(value);
      case "bytes":
        return encode_bytes(value);
      default: {
        if (type[1] === "v")
          return type.endsWith("[]") ? encode_varint_array(value, type) : encode_varint(value, type);
        else
          return type.endsWith("[]") ? encode_number_array(value, type) : encode_number(value, type);
      }
    }
  };
  var unpack = (type, buf, offset, ...args) => {
    switch (type) {
      case "bool":
        return decode_bool(buf, offset);
      case "cstr":
        return decode_cstr(buf, offset);
      case "str":
        return decode_str(buf, offset, ...args);
      case "bytes":
        return decode_bytes(buf, offset, ...args);
      default: {
        if (type[1] === "v")
          return type.endsWith("[]") ? decode_varint_array(buf, offset, type, ...args) : decode_varint(buf, offset, type);
        else
          return type.endsWith("[]") ? decode_number_array(buf, offset, type, ...args) : decode_number(buf, offset, type);
      }
    }
  };
  var encode_bool = (value) => Uint8Array.of(value ? 1 : 0);
  var decode_bool = (buf, offset = 0) => [buf[offset] >= 1 ? true : false, 1];
  var encode_cstr = (value) => txt_encoder.encode(value + "\0");
  var decode_cstr = (buf, offset = 0) => {
    const offset_end = buf.indexOf(0, offset), txt_arr = buf.subarray(offset, offset_end), value = txt_decoder.decode(txt_arr);
    return [value, txt_arr.length + 1];
  };
  var encode_str = (value) => txt_encoder.encode(value);
  var decode_str = (buf, offset = 0, bytesize) => {
    const offset_end = bytesize === void 0 ? void 0 : offset + bytesize, txt_arr = buf.subarray(offset, offset_end), value = txt_decoder.decode(txt_arr);
    return [value, txt_arr.length];
  };
  var encode_bytes = (value) => value;
  var decode_bytes = (buf, offset = 0, bytesize) => {
    const offset_end = bytesize === void 0 ? void 0 : offset + bytesize, value = buf.slice(offset, offset_end);
    return [value, value.length];
  };
  var encode_number_array = (value, type) => {
    const [t, s, e] = type, typed_arr_constructor = typed_array_constructor_of(type), bytesize = parseInt(s), is_native_endian = e === "l" && env_le || e === "b" && !env_le || bytesize === 1 ? true : false, typed_arr = typed_arr_constructor.from(value);
    if (typed_arr instanceof Uint8Array)
      return typed_arr;
    const buf = new Uint8Array(typed_arr.buffer);
    if (is_native_endian)
      return buf;
    else
      return swapEndianessFast(buf, bytesize);
  };
  var decode_number_array = (buf, offset = 0, type, array_length) => {
    const [t, s, e] = type, bytesize = parseInt(s), is_native_endian = e === "l" && env_le || e === "b" && !env_le || bytesize === 1 ? true : false, bytelength = array_length ? bytesize * array_length : void 0, array_buf = buf.slice(offset, bytelength ? offset + bytelength : void 0), array_bytesize = array_buf.length, typed_arr_constructor = typed_array_constructor_of(type), typed_arr = new typed_arr_constructor(is_native_endian ? array_buf.buffer : swapEndianessFast(array_buf, bytesize).buffer);
    return [Array.from(typed_arr), array_bytesize];
  };
  var encode_number = (value, type) => encode_number_array([value], type);
  var decode_number = (buf, offset = 0, type) => {
    const [value_arr, bytesize] = decode_number_array(buf, offset, type, 1);
    return [value_arr[0], bytesize];
  };

  // src/mapper.ts
  var recordMap = (mapping_funcs, input_data) => {
    const out_data = {};
    for (const k in mapping_funcs)
      out_data[k] = mapping_funcs[k](input_data[k]);
    return out_data;
  };
  var recordArgsMap = (mapping_funcs, input_args) => {
    const out_data = {};
    for (const k in mapping_funcs)
      out_data[k] = mapping_funcs[k](...input_args[k]);
    return out_data;
  };
  var sequenceMap = (mapping_funcs, input_data) => {
    const out_data = [];
    for (let i = 0; i < mapping_funcs.length; i++)
      out_data.push(mapping_funcs[i](input_data[i]));
    return out_data;
  };
  var sequenceArgsMap = (mapping_funcs, input_args) => {
    const out_data = [];
    for (let i = 0; i < mapping_funcs.length; i++)
      out_data.push(mapping_funcs[i](...input_args[i]));
    return out_data;
  };

  // src/formattable.ts
  var formatEach = (formatter, v) => {
    if (array_isArray(v))
      return v.map(formatter);
    return formatter(v);
  };
  var percent_fmt = (v) => ((v ?? 1) * 100).toFixed(0) + "%";
  var percent = (val) => formatEach(percent_fmt, val);
  var ubyte_fmt = (v) => clamp(v ?? 0, 0, 255).toFixed(0);
  var ubyte = (val) => formatEach(ubyte_fmt, val);
  var udegree_fmt = (v) => (v ?? 0).toFixed(1) + "deg";
  var udegree = (val) => formatEach(udegree_fmt, val);
  var hex_fmt = (v) => (v < 16 ? "0" : "") + (v | 0).toString(16);
  var rgb_hex_fmt_map = [
    hex_fmt,
    hex_fmt,
    hex_fmt
  ];
  var rgb_hex_fmt = (v) => "#" + sequenceMap(rgb_hex_fmt_map, v).join("");
  var rgba_hex_fmt_map = [
    hex_fmt,
    hex_fmt,
    hex_fmt,
    (a) => hex_fmt(clamp((a ?? 1) * 255, 0, 255))
  ];
  var rgba_hex_fmt = (v) => "#" + sequenceMap(rgba_hex_fmt_map, v).join("");
  var rgb_fmt = (v) => "rgb(" + sequenceMap([ubyte_fmt, ubyte_fmt, ubyte_fmt], v).join(",") + ")";
  var rgba_fmt = (v) => "rgba(" + sequenceMap([ubyte_fmt, ubyte_fmt, ubyte_fmt, percent_fmt], v).join(",") + ")";
  var hsl_fmt = (v) => "hsl(" + sequenceMap([udegree_fmt, percent_fmt, percent_fmt], v).join(",") + ")";
  var hsla_fmt = (v) => "hsla(" + sequenceMap([udegree_fmt, percent_fmt, percent_fmt, percent_fmt], v).join(",") + ")";

  // src/image.ts
  var bg_canvas;
  var bg_ctx;
  var getBGCanvas = (init_width, init_height) => {
    bg_canvas ??= new OffscreenCanvas(init_width ?? 10, init_height ?? 10);
    return bg_canvas;
  };
  var getBGCtx = (init_width, init_height) => {
    if (bg_ctx === void 0) {
      bg_ctx = getBGCanvas(init_width, init_height).getContext("2d", { willReadFrequently: true });
      bg_ctx.imageSmoothingEnabled = false;
    }
    return bg_ctx;
  };
  var isBase64Image = (str) => str === void 0 ? false : str.startsWith("data:image/");
  var getBase64ImageHeader = (str) => str.slice(0, str.indexOf(";base64,") + 8);
  var getBase64ImageMIMEType = (str) => str.slice(5, str.indexOf(";base64,"));
  var getBase64ImageBody = (str) => str.substring(str.indexOf(";base64,") + 8);
  var constructImageBlob = async (img_src, width, crop_rect, bitmap_options, blob_options) => {
    if (crop_rect)
      crop_rect = positiveRect(crop_rect);
    const bitmap_src = await constructImageBitmapSource(img_src, width), bitmap = crop_rect ? await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) : await createImageBitmap(bitmap_src, bitmap_options), canvas = getBGCanvas(), ctx = getBGCtx();
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.globalCompositeOperation = "copy";
    ctx.resetTransform();
    ctx.drawImage(bitmap, 0, 0);
    return canvas.convertToBlob(blob_options);
  };
  var constructImageData = async (img_src, width, crop_rect, bitmap_options, image_data_options) => {
    if (crop_rect)
      crop_rect = positiveRect(crop_rect);
    const bitmap_src = await constructImageBitmapSource(img_src, width), bitmap = crop_rect ? await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) : await createImageBitmap(bitmap_src, bitmap_options), canvas = getBGCanvas(), ctx = getBGCtx();
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.globalCompositeOperation = "copy";
    ctx.resetTransform();
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height, image_data_options);
  };
  var constructImageBitmapSource = (img_src, width) => {
    if (typeof img_src === "string") {
      const new_img_element = new Image();
      new_img_element.src = img_src;
      return new_img_element.decode().then(() => new_img_element);
    } else if (img_src instanceof Uint8ClampedArray) {
      return promise_resolve(new ImageData(img_src, width));
    } else if (ArrayBuffer.isView(img_src)) {
      return constructImageBitmapSource(new Uint8ClampedArray(img_src.buffer), width);
    } else if (img_src instanceof ArrayBuffer) {
      return constructImageBitmapSource(new Uint8ClampedArray(img_src), width);
    } else if (img_src instanceof Array) {
      return constructImageBitmapSource(Uint8ClampedArray.from(img_src), width);
    }
    return promise_resolve(img_src);
  };
  var intensityBitmap = (pixels_buf, channels, alpha_channel, alpha_bias = 1) => {
    const pixel_len = pixels_buf.length / channels, alpha_visibility = new Uint8ClampedArray(pixel_len).fill(1), intensity = new Uint8ClampedArray(pixel_len);
    if (alpha_channel !== void 0) {
      for (let i = 0; i < pixel_len; i++)
        alpha_visibility[i] = pixels_buf[i * channels + alpha_channel] < alpha_bias ? 0 : 1;
      pixels_buf = pixels_buf.filter((v, i) => i % channels === alpha_channel ? false : true);
      channels--;
    }
    for (let ch = 0; ch < channels; ch++)
      for (let i = 0; i < pixel_len; i++)
        intensity[i] += pixels_buf[i * channels + ch];
    if (alpha_channel !== void 0)
      for (let i = 0; i < pixel_len; i++)
        intensity[i] *= alpha_visibility[i];
    return new Uint8Array(intensity.buffer);
  };
  var getBoundingBox = (img_data, padding_condition, minimum_non_padding_value = 1) => {
    const { width, height, data } = img_data, channels = data.length / (width * height), rowAt = (y) => data.subarray(y * width * channels, (y * width + width) * channels), colAt = (x) => {
      const col = new Uint8Array(height * channels);
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
    for (; top < height; top++)
      if (nonPaddingValue(rowAt(top)) >= minimum_non_padding_value)
        break;
    for (; bottom >= top; bottom--)
      if (nonPaddingValue(rowAt(bottom)) >= minimum_non_padding_value)
        break;
    for (; left < width; left++)
      if (nonPaddingValue(colAt(left)) >= minimum_non_padding_value)
        break;
    for (; right >= left; right--)
      if (nonPaddingValue(colAt(right)) >= minimum_non_padding_value)
        break;
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  };
  var cropImageData = (img_data, crop_rect) => {
    const { width, height, data } = img_data, channels = data.length / (width * height), crop = positiveRect({ x: 0, y: 0, width, height, ...crop_rect }), [top, left, bottom, right] = [crop.y, crop.x, crop.y + crop.height, crop.x + crop.width];
    console.assert(number_isInteger(channels));
    const row_slice_len = crop.width * channels, skip_len = (width - right + (left - 0)) * channels, trim_start = (top * width + left) * channels, trim_end = ((bottom - 1) * width + right) * channels, cropped_data_rows = sliceSkipTypedSubarray(data, row_slice_len, skip_len, trim_start, trim_end), cropped_data = concatTyped(...cropped_data_rows), cropped_img_data = channels === 4 ? new ImageData(cropped_data, crop.width, crop.height) : {
      width: crop.width,
      height: crop.height,
      data: cropped_data,
      colorSpace: img_data.colorSpace ?? "srgb"
    };
    return cropped_img_data;
  };
  var trimImagePadding = (img_data, padding_condition, minimum_non_padding_value = 1) => cropImageData(
    img_data,
    getBoundingBox(img_data, padding_condition, minimum_non_padding_value)
  );
  var coordinateTransformer = (coords0, coords1) => {
    const { x: x0, y: y0, width: w0, channels: c0 } = coords0, { x: x1, y: y1, width: w1, channels: c1 } = coords1, x = (x1 ?? 0) - (x0 ?? 0), y = (y1 ?? 0) - (y0 ?? 0);
    return (i0) => c1 * (i0 / c0 % w0 - x + ((i0 / c0 / w0 | 0) - y) * w1);
  };
  var randomRGBA = (alpha) => {
    console.error("not implemented");
  };

  // src/lambda.ts
  var debounce = (wait_time_ms, fn, rejection_value) => {
    let prev_timer, prev_reject = () => {
    };
    return (...args) => {
      dom_clearTimeout(prev_timer);
      if (rejection_value) {
        prev_reject(rejection_value);
      }
      return new Promise((resolve, reject) => {
        prev_reject = reject;
        prev_timer = dom_setTimeout(
          () => resolve(fn(...args)),
          wait_time_ms
        );
      });
    };
  };
  var debounceAndShare = (wait_time_ms, fn) => {
    let prev_timer, current_resolve, current_promise;
    const swap_current_promise_with_a_new_one = (value) => {
      current_promise = new Promise(
        (resolve, reject) => current_resolve = resolve
      ).then(swap_current_promise_with_a_new_one);
      return value;
    };
    swap_current_promise_with_a_new_one();
    return (...args) => {
      dom_clearTimeout(prev_timer);
      prev_timer = dom_setTimeout(
        () => current_resolve(fn(...args)),
        wait_time_ms
      );
      return current_promise;
    };
  };
  var THROTTLE_REJECT = /* @__PURE__ */ Symbol("a rejection by a throttled function");
  var throttle = (delta_time_ms, fn) => {
    let last_call = 0;
    return (...args) => {
      const time_now = date_now();
      if (time_now - last_call > delta_time_ms) {
        last_call = time_now;
        return fn(...args);
      }
      return THROTTLE_REJECT;
    };
  };
  var throttleAndTrail = (trailing_time_ms, delta_time_ms, fn, rejection_value) => {
    let prev_timer, prev_reject = () => {
    };
    const throttled_fn = throttle(delta_time_ms, fn);
    return (...args) => {
      dom_clearTimeout(prev_timer);
      if (rejection_value) {
        prev_reject(rejection_value);
      }
      const result = throttled_fn(...args);
      if (result === THROTTLE_REJECT) {
        return new Promise((resolve, reject) => {
          prev_reject = reject;
          prev_timer = dom_setTimeout(
            () => resolve(fn(...args)),
            trailing_time_ms
          );
        });
      }
      return promise_resolve(result);
    };
  };
  var memorizeCore = (fn, weak_ref = false) => {
    const memory = weak_ref ? new HybridWeakMap() : /* @__PURE__ */ new Map(), get = bindMethodToSelfByName(memory, "get"), set = bindMethodToSelfByName(memory, "set"), has = bindMethodToSelfByName(memory, "has"), memorized_fn = (arg) => {
      const arg_exists = has(arg), value = arg_exists ? get(arg) : fn(arg);
      if (!arg_exists) {
        set(arg, value);
      }
      return value;
    };
    return { fn: memorized_fn, memory };
  };
  var memorize = (fn) => {
    return memorizeCore(fn).fn;
  };
  var memorizeAtmostN = (n, fn) => {
    const memorization_controls = memorizeCore(fn), memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"), memorized_fn = memorization_controls.fn, memorized_atmost_n_fn = (arg) => {
      if (memory_has(arg) || --n >= 0) {
        return memorized_fn(arg);
      }
      return fn(arg);
    };
    return memorized_atmost_n_fn;
  };
  var memorizeAfterN = (n, fn, default_value) => {
    const memorization_controls = memorizeCore(fn), memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"), memorized_fn = memorization_controls.fn, memorized_after_n_fn = (arg) => {
      const value = memory_has(arg) || --n >= 0 ? memorized_fn(arg) : default_value;
      if (n === 0) {
        default_value ??= value;
      }
      return value;
    };
    return memorized_after_n_fn;
  };
  var memorizeLRU = (min_capacity, max_capacity, fn) => {
    const memorization_controls = memorizeCore(fn), memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"), memory_del = bindMethodToSelfByName(memorization_controls.memory, "delete"), memorized_fn = memorization_controls.fn, memorized_args_lru = new LimitedStack(min_capacity, max_capacity, (discarded_items) => {
      discarded_items.forEach(memory_del);
    }), memorized_args_lru_push = bindMethodToSelfByName(memorized_args_lru, "push"), memorized_lru_fn = (arg) => {
      const arg_memorized = memory_has(arg);
      if (!arg_memorized) {
        memorized_args_lru_push(arg);
      }
      return memorized_fn(arg);
    };
    return memorized_lru_fn;
  };
  var memorizeOnce = (fn) => {
    return memorizeAfterN(1, fn);
  };
  var memorizeMultiCore = (fn, weak_ref = false) => {
    const tree = weak_ref ? new HybridTree() : new StrongTree(), memorized_fn = (...args) => {
      const subtree = tree.getDeep(args.toReversed()), args_exist = subtree.value !== TREE_VALUE_UNSET, value = args_exist ? subtree.value : fn(...args);
      if (!args_exist) {
        subtree.value = value;
      }
      return value;
    };
    return { fn: memorized_fn, memory: tree };
  };
  var memorizeMulti = (fn) => {
    return memorizeMultiCore(fn, false).fn;
  };
  var memorizeMultiWeak = (fn) => {
    return memorizeMultiCore(fn, true).fn;
  };
  var curry = (fn, thisArg) => {
    return fn.length > 1 ? (arg) => curry(fn.bind(void 0, arg)) : fn.bind(thisArg);
  };
  var curryMulti = (fn, thisArg, remaining_args = fn.length) => {
    return (...args_a) => {
      remaining_args -= args_a.length;
      const curried_fn = fn.bind(void 0, ...args_a);
      return remaining_args <= 0 ? curried_fn.call(thisArg) : curryMulti(curried_fn, thisArg, remaining_args);
    };
  };

  // src/lambdacalc.ts
  var vectorize0 = (map_func, write_to) => {
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func();
  };
  var vectorize1 = (map_func, write_to, arr1) => {
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func(arr1[i]);
  };
  var vectorize2 = (map_func, write_to, arr1, arr2) => {
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func(arr1[i], arr2[i]);
  };
  var vectorize3 = (map_func, write_to, arr1, arr2, arr3) => {
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func(arr1[i], arr2[i], arr3[i]);
  };
  var vectorize4 = (map_func, write_to, arr1, arr2, arr3, arr4) => {
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i]);
  };
  var vectorize5 = (map_func, write_to, arr1, arr2, arr3, arr4, arr5) => {
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i], arr5[i]);
  };
  var vectorizeN = (map_func, write_to, ...arrs) => {
    const param_length = arrs.length;
    const params = Array(param_length).fill(0);
    for (let i = 0; i < write_to.length; i++) {
      for (let p = 0; p < param_length; p++)
        params[p] = arrs[p][i];
      write_to[i] = map_func(...params);
    }
  };
  var vectorizeIndexHOF = (index_map_func_hof, write_to, ...input_arrs) => {
    const map_func_index = index_map_func_hof(...input_arrs);
    for (let i = 0; i < write_to.length; i++)
      write_to[i] = map_func_index(i);
  };

  // src/numericarray.ts
  var transpose2D = (matrix) => matrix[0].map(
    (_row_0_col_i, i) => matrix.map(
      (row_arr) => row_arr[i]
    )
  );
  var diff = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const d = arr.slice(start + 1, end);
    for (let i = 0; i < d.length; i++)
      d[i] -= arr[start + i - 1];
    return d;
  };
  var diff_right = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const d = arr.slice(start, end - 1);
    for (let i = 0; i < d.length; i++)
      d[i] -= arr[start + i + 1];
    return d;
  };
  var cumulativeSum = (arr) => {
    const len = arr.length, cum_sum = new (constructorOf(arr))(len + 1).fill(0);
    for (let i = 0; i < len; i++) {
      cum_sum[i + 1] = cum_sum[i] + arr[i];
    }
    return cum_sum;
  };
  var abs = (arr, start = 0, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] *= arr[i] < 0 ? -1 : 1;
    return arr;
  };
  var neg = (arr, start = 0, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] *= -1;
    return arr;
  };
  var bcomp = (arr, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] = ~arr[i];
    return arr;
  };
  var band = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] &= value;
    return arr;
  };
  var bor = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] |= value;
    return arr;
  };
  var bxor = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] ^= value;
    return arr;
  };
  var blsh = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] <<= value;
    return arr;
  };
  var brsh = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] >>= value;
    return arr;
  };
  var bursh = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] >>>= value;
    return arr;
  };
  var add = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] += value;
    return arr;
  };
  var sub = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] -= value;
    return arr;
  };
  var mult = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] *= value;
    return arr;
  };
  var div = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] /= value;
    return arr;
  };
  var pow = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] **= value;
    return arr;
  };
  var rem = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] %= value;
    return arr;
  };
  var mod = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++)
      arr[i] = (arr[i] % value + value) % value;
    return arr;
  };

  // src/stringman.ts
  var default_HexStringRepr = {
    sep: ", ",
    prefix: "0x",
    postfix: "",
    trailingSep: false,
    bra: "[",
    ket: "]",
    toUpperCase: true,
    radix: 16
  };
  var hexStringOfArray = (arr, options) => {
    const { sep, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix } = { ...default_HexStringRepr, ...options }, num_arr = arr.buffer ? array_from(arr) : arr, str = num_arr.map((v) => {
      let s = (v | 0).toString(radix);
      s = s.length === 2 ? s : "0" + s;
      if (toUpperCase)
        return s.toUpperCase();
      return s;
    }).reduce((str2, s) => str2 + prefix + s + postfix + sep, "");
    return bra + str.slice(0, trailingSep ? void 0 : -sep.length) + ket;
  };
  var hexStringToArray = (hex_str, options) => {
    const { sep, prefix, postfix, bra, ket, radix } = { ...default_HexStringRepr, ...options }, [sep_len, prefix_len, postfix_len, bra_len, ket_len] = [sep, prefix, postfix, bra, ket].map((s) => s.length), hex_str2 = hex_str.slice(bra_len, ket_len > 0 ? -ket_len : void 0), elem_len = prefix_len + 2 + postfix_len + sep_len, int_arr = [];
    for (let i = prefix_len; i < hex_str2.length; i += elem_len)
      int_arr.push(
        parseInt(
          hex_str2[i] + hex_str2[i + 1],
          // these are the two characters representing the current number in hex-string format
          radix
        )
      );
    return int_arr;
  };
  var up = (str) => str.toUpperCase();
  var low = (str) => str.toLowerCase();
  var getUpOrLow = (str, option) => option === 1 ? up(str) : option === -1 ? low(str) : str;
  var findUp = (str, start = 0, end = void 0) => {
    end = (end < str.length ? end : str.length) - 1;
    for (let i = start, c = str.charCodeAt(i++); i < end; c = str.charCodeAt(i++))
      if (c > 64 && c < 91)
        return i - 1;
    return void 0;
  };
  var findLow = (str, start = 0, end = void 0) => {
    end = (end < str.length ? end : str.length) - 1;
    for (let i = start, c = str.charCodeAt(i++); i < end; c = str.charCodeAt(i++))
      if (c > 96 && c < 123)
        return i - 1;
    return void 0;
  };
  var findUpOrLow = (str, option, start = 0, end = void 0) => option === 1 ? findUp(str, start, end) : option === -1 ? findLow(str, start, end) : void 0;
  var wordsToToken = (words, casetype) => {
    const [flu, wflu, rwlu, d = "", pre = "", suf = ""] = casetype, last_i = words.length - 1, token = words.map((w, i) => {
      const w_0 = getUpOrLow(w[0], i > 0 ? wflu : flu), w_rest = getUpOrLow(w.slice(1), rwlu), sep = i < last_i ? d : "";
      return w_0 + w_rest + sep;
    }).reduce((str, word) => str + word, pre) + suf;
    return token;
  };
  var tokenToWords = (token, casetype) => {
    const [flu, wflu, rwlu, d = "", pre = "", suf = ""] = casetype;
    token = token.slice(pre.length, -suf.length || void 0);
    let words;
    if (d === "") {
      const idxs = [0];
      let i = 0;
      while (i !== void 0) {
        i = findUpOrLow(token, wflu, i + 1);
        idxs.push(i);
      }
      words = sliceContinuous(token, idxs);
    } else
      words = token.split(d);
    return words.map((word) => low(word));
  };
  var convertCase = (token, from_casetype, to_casetype) => wordsToToken(tokenToWords(token, from_casetype), to_casetype);
  var makeCaseConverter = (from_casetype, to_casetype) => (token) => convertCase(token, from_casetype, to_casetype);
  var snakeCase = [-1, -1, -1, "_"];
  var kebabCase = [-1, -1, -1, "-"];
  var camelCase = [-1, 1, -1, ""];
  var pascalCase = [1, 1, -1, ""];
  var screamingSnakeCase = [1, 1, 1, "_"];
  var screamingKebabCase = [1, 1, 1, "-"];
  var kebabToCamel = makeCaseConverter(kebabCase, camelCase);
  var camelToKebab = makeCaseConverter(camelCase, kebabCase);
  var snakeToCamel = makeCaseConverter(snakeCase, camelCase);
  var camelToSnake = makeCaseConverter(camelCase, snakeCase);
  var kebabToSnake = makeCaseConverter(kebabCase, snakeCase);
  var snakeToKebab = makeCaseConverter(snakeCase, kebabCase);

  // src/typedefs.ts
  var isUnitInterval = (value) => value >= 0 && value <= 1 ? true : false;
  var isUByte = (value) => value >= 0 && value <= 255 && value === (value | 0) ? true : false;
  var isDegrees = (value) => value >= 0 && value <= 360 ? true : false;
  var isRadians = (value) => value >= 0 && value <= Math.PI ? true : false;
})();
