"use strict";
(() => {
  // src/_dnt.polyfills.ts
  function findLastIndex(self, callbackfn, that) {
    const boundFunc = that === void 0 ? callbackfn : callbackfn.bind(that);
    let index = self.length - 1;
    while (index >= 0) {
      const result = boundFunc(self[index], index, self);
      if (result) {
        return index;
      }
      index--;
    }
    return -1;
  }
  function findLast(self, callbackfn, that) {
    const index = self.findLastIndex(callbackfn, that);
    return index === -1 ? void 0 : self[index];
  }
  if (!Array.prototype.findLastIndex) {
    Array.prototype.findLastIndex = function(callbackfn, that) {
      return findLastIndex(this, callbackfn, that);
    };
  }
  if (!Array.prototype.findLast) {
    Array.prototype.findLast = function(callbackfn, that) {
      return findLast(this, callbackfn, that);
    };
  }
  if (!Uint8Array.prototype.findLastIndex) {
    Uint8Array.prototype.findLastIndex = function(callbackfn, that) {
      return findLastIndex(this, callbackfn, that);
    };
  }
  if (!Uint8Array.prototype.findLast) {
    Uint8Array.prototype.findLast = function(callbackfn, that) {
      return findLast(this, callbackfn, that);
    };
  }

  // src/alias.ts
  var array_constructor = Array;
  var date_constructor = Date;
  var math_constructor = Math;
  var number_constructor = Number;
  var object_constructor = Object;
  var promise_constructor = Promise;
  var string_constructor = String;
  var symbol_constructor = Symbol;
  var console_object = console;
  var performance_object = performance;
  var array_isEmpty = (array) => array.length === 0;
  var array_from = /* @__PURE__ */ (() => array_constructor.from)();
  var array_isArray = /* @__PURE__ */ (() => array_constructor.isArray)();
  var date_now = /* @__PURE__ */ (() => date_constructor.now)();
  var math_min = /* @__PURE__ */ (() => math_constructor.min)();
  var math_round = /* @__PURE__ */ (() => math_constructor.round)();
  var math_random = /* @__PURE__ */ (() => math_constructor.random)();
  var number_MAX_VALUE = /* @__PURE__ */ (() => number_constructor.MAX_VALUE)();
  var number_POSITIVE_INFINITY = /* @__PURE__ */ (() => number_constructor.POSITIVE_INFINITY)();
  var number_isInteger = /* @__PURE__ */ (() => number_constructor.isInteger)();
  var number_parseInt = /* @__PURE__ */ (() => number_constructor.parseInt)();
  var object_assign = /* @__PURE__ */ (() => object_constructor.assign)();
  var object_defineProperty = /* @__PURE__ */ (() => object_constructor.defineProperty)();
  var object_entries = /* @__PURE__ */ (() => object_constructor.entries)();
  var object_getOwnPropertyDescriptor = /* @__PURE__ */ (() => object_constructor.getOwnPropertyDescriptor)();
  var object_getOwnPropertyNames = /* @__PURE__ */ (() => object_constructor.getOwnPropertyNames)();
  var object_getOwnPropertySymbols = /* @__PURE__ */ (() => object_constructor.getOwnPropertySymbols)();
  var object_getPrototypeOf = /* @__PURE__ */ (() => object_constructor.getPrototypeOf)();
  var promise_resolve = /* @__PURE__ */ promise_constructor.resolve.bind(promise_constructor);
  var string_toUpperCase = (str) => str.toUpperCase();
  var string_toLowerCase = (str) => str.toLowerCase();
  var string_fromCharCode = /* @__PURE__ */ (() => string_constructor.fromCharCode)();
  var symbol_iterator = /* @__PURE__ */ (() => symbol_constructor.iterator)();
  var symbol_toStringTag = /* @__PURE__ */ (() => symbol_constructor.toStringTag)();
  var console_assert = /* @__PURE__ */ (() => console_object.assert)();
  var console_error = /* @__PURE__ */ (() => console_object.error)();
  var console_log = /* @__PURE__ */ (() => console_object.log)();
  var performance_now = /* @__PURE__ */ performance_object.now.bind(performance_object);
  var dom_setTimeout = setTimeout;
  var dom_clearTimeout = clearTimeout;
  var dom_encodeURI = encodeURI;
  var dom_decodeURI = decodeURI;

  // src/binder.ts
  var bindMethodFactoryByName = (instance, method_name, ...args) => {
    return (thisArg) => {
      return instance[method_name].bind(thisArg, ...args);
    };
  };
  var bindMethodToSelfByName = (self, method_name, ...args) => self[method_name].bind(self, ...args);
  var prototypeOfClass = (cls) => {
    return cls.prototype;
  };
  var array_proto = /* @__PURE__ */ prototypeOfClass(Array);
  var map_proto = /* @__PURE__ */ prototypeOfClass(Map);
  var set_proto = /* @__PURE__ */ prototypeOfClass(Set);
  var string_proto = /* @__PURE__ */ prototypeOfClass(String);
  var bind_array_map = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "map");
  var bind_array_pop = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "pop");
  var bind_array_push = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "push");
  var bind_array_clear = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "splice", 0);
  var bind_stack_seek = /* @__PURE__ */ bindMethodFactoryByName(array_proto, "at", -1);
  var bind_set_add = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "add");
  var bind_set_delete = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "delete");
  var bind_set_has = /* @__PURE__ */ bindMethodFactoryByName(set_proto, "has");
  var bind_map_delete = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "delete");
  var bind_map_entries = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "entries");
  var bind_map_forEach = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "forEach");
  var bind_map_get = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "get");
  var bind_map_has = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "has");
  var bind_map_keys = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "keys");
  var bind_map_set = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "set");
  var bind_map_values = /* @__PURE__ */ bindMethodFactoryByName(map_proto, "values");
  var bind_string_charCodeAt = /* @__PURE__ */ bindMethodFactoryByName(string_proto, "charCodeAt");

  // src/numericmethods.ts
  var clamp = (value, min2 = -number_MAX_VALUE, max2 = number_MAX_VALUE) => value < min2 ? min2 : value > max2 ? max2 : value;
  var modulo = (value, mod2) => (value % mod2 + mod2) % mod2;
  var lerp = (x0, x1, t) => t * (x1 - x0) + x0;
  var lerpClamped = (x0, x1, t) => (t < 0 ? 0 : t > 1 ? 1 : t) * (x1 - x0) + x0;
  var lerpi = (v0, v1, t, i) => t * (v1[i] - v0[i]) + v0[i];
  var lerpiClamped = (v0, v1, t, i) => (t < 0 ? 0 : t > 1 ? 1 : t) * (v1[i] - v0[i]) + v0[i];
  var lerpv = (v0, v1, t) => {
    const len = v0.length, v = Array(len).fill(0);
    for (let i = 0; i < len; i++) {
      v[i] = t * (v1[i] - v0[i]) + v0[i];
    }
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
  var sign = (value) => value >= 0 ? 1 : -1;
  var absolute = (value) => (value >= 0 ? 1 : -1) * value;
  var roundFloat = (value, precision = 9) => {
    const large_number = 10 ** precision;
    return math_round(value * large_number) / large_number;
  };

  // src/array1d.ts
  function resolveRange(start, end, length, offset) {
    start ??= 0;
    offset ??= 0;
    if (length === void 0) {
      return [start + offset, end === void 0 ? end : end + offset, length];
    }
    end ??= length;
    start += start >= 0 ? 0 : length;
    end += end >= 0 ? 0 : length;
    length = end - start;
    return [start + offset, end + offset, max(0, length)];
  }
  var rotateArray = (arr, amount) => {
    const len = arr.length;
    amount = modulo(amount, len === 0 ? 1 : len);
    if (amount === 0) {
      return arr;
    }
    const right_removed_rows = arr.splice(len - amount, amount);
    arr.splice(0, 0, ...right_removed_rows);
    return arr;
  };
  var shuffleArray = (arr) => {
    const len = arr.length, rand_int = () => math_random() * len | 0, swap = (i1, i2) => {
      const temp = arr[i1];
      arr[i1] = arr[i2];
      arr[i2] = temp;
    };
    for (let i = 0; i < len; i++) {
      swap(i, rand_int());
    }
    return arr;
  };
  var shuffledDeque = function* (arr) {
    let i = arr.length;
    while (!array_isEmpty(arr)) {
      if (i >= arr.length) {
        i = 0;
        shuffleArray(arr);
      }
      i = max(i + ((yield arr[i]) ?? 1), 0);
    }
  };
  var spliceGenericStack = (stack, start = 0, deleteCount, ...items) => {
    const initial_length = stack.length, maxDeleteCount = initial_length - start;
    deleteCount ??= maxDeleteCount;
    deleteCount = min(deleteCount, maxDeleteCount);
    const end = start + deleteCount, retained_items = [], removed_items = [], retained_items_push = bind_array_push(retained_items), removed_items_push = bind_array_push(removed_items);
    for (let i = initial_length; i > end; i--) {
      retained_items_push(stack.pop());
    }
    for (let i = end; i > start; i--) {
      removed_items_push(stack.pop());
    }
    stack.push(...items, ...retained_items.toReversed());
    return removed_items.toReversed();
  };
  var rangeArray = (start, end, step = 1, decimal_precision = 6) => {
    return [...rangeIterator(start, end, step, decimal_precision)];
  };
  var rangeIterator = function* (start = 0, end, step = 1, decimal_precision = 6) {
    end ??= sign(step) * number_POSITIVE_INFINITY;
    const delta = end - start, signed_step = absolute(step) * sign(delta), end_index = delta / signed_step;
    let i = 0;
    for (; i < end_index; i++) {
      yield roundFloat(start + i * signed_step, decimal_precision);
    }
    return i;
  };
  var zipArrays = (...arrays) => {
    const output = [], output_push = bind_array_push(output), min_len = array_isEmpty(arrays) ? 0 : math_min(...arrays.map((arr) => arr.length));
    for (let i = 0; i < min_len; i++) {
      output_push(arrays.map((arr) => arr[i]));
    }
    return output;
  };
  var zipIterators = function* (...iterators) {
    if (array_isEmpty(iterators)) {
      return 0;
    }
    const pure_iterators = iterators.map((iter) => {
      return iter instanceof Iterator ? iter : iter[symbol_iterator]();
    }), pure_iterators_map = bind_array_map(pure_iterators);
    let length = 0, continue_iterating = true;
    const iterator_map_fn = (iter) => {
      const { value, done } = iter.next();
      if (done) {
        continue_iterating = false;
      }
      return value;
    };
    for (let tuple_values = pure_iterators_map(iterator_map_fn); continue_iterating; tuple_values = pure_iterators_map(iterator_map_fn)) {
      length++;
      yield tuple_values;
    }
    return length;
  };
  var zipIteratorsMapperFactory = (map_fn) => {
    return function* (...iterators) {
      let i = 0;
      for (const tuple of zipIterators(...iterators)) {
        yield map_fn(tuple, i);
        i++;
      }
      return i;
    };
  };
  var chunkGenerator = function* (chunk_size, array) {
    const len = array.length;
    for (let i = 0; i < len; i += chunk_size) {
      yield array.slice(i, i + chunk_size);
    }
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
  var constructorOf = (class_instance) => {
    return object_getPrototypeOf(class_instance).constructor;
  };
  var constructFrom = (class_instance, ...args) => {
    return new (constructorOf(class_instance))(...args);
  };
  var prototypeOfClass2 = (cls) => {
    return cls.prototype;
  };
  function prototypeChainOfObject(obj, config = {}) {
    let { start, end, delta } = config;
    const full_chain = [];
    while (obj = object_getPrototypeOf(obj)) {
      full_chain.push(obj);
    }
    full_chain.push(null);
    const full_chain_length = full_chain.length;
    if (isComplex(start)) {
      start = max(0, full_chain.indexOf(start));
    }
    if (isComplex(end)) {
      const end_index = full_chain.indexOf(end);
      end = end_index < 0 ? void 0 : end_index;
    }
    if (delta !== void 0 && (start ?? end) !== void 0) {
      if (start !== void 0) {
        end = start + delta;
      } else {
        start = end - delta;
      }
    }
    [start, end] = resolveRange(start, end, full_chain_length);
    return full_chain.slice(start, end);
  }
  var getOwnPropertyKeys = (obj) => {
    return [
      ...object_getOwnPropertyNames(obj),
      ...object_getOwnPropertySymbols(obj)
    ];
  };
  var getInheritedPropertyKeys = (obj, depth = prototypeOfClass2(Object)) => {
    const prototype_chain = prototypeChainOfObject(obj, { start: 0, end: depth }), inherited_keys = prototype_chain.map((prototype) => getOwnPropertyKeys(prototype)).flat(1);
    return [...new Set(inherited_keys)];
  };
  var getOwnGetterKeys = (obj) => {
    return getOwnPropertyKeys(obj).filter((key) => "get" in object_getOwnPropertyDescriptor(obj, key));
  };
  var getOwnSetterKeys = (obj) => {
    return getOwnPropertyKeys(obj).filter((key) => "set" in object_getOwnPropertyDescriptor(obj, key));
  };
  var mirrorObjectThroughComposition = (obj, config) => {
    const { baseKey, mirrorPrototype = true, propertyKeys = [], ignoreKeys = [], target = {} } = config, mirror_obj = target, property_keys = new Set(propertyKeys), ignore_keys = new Set(ignoreKeys), prototype_chain = isBoolean(mirrorPrototype) ? mirrorPrototype ? prototypeChainOfObject(obj, { end: prototypeOfClass2(Object) }) : [] : isArray(mirrorPrototype) ? mirrorPrototype : prototypeChainOfObject(obj, mirrorPrototype);
    prototype_chain.unshift(obj);
    mirror_obj[baseKey] = obj;
    for (const prototype of prototype_chain) {
      const prototype_keys = getOwnPropertyKeys(prototype);
      for (const key of prototype_keys) {
        if (key in mirror_obj || property_keys.has(key) || ignore_keys.has(key)) {
          continue;
        }
        const { value, ...description } = object_getOwnPropertyDescriptor(prototype, key);
        if (isFunction(value)) {
          object_defineProperty(mirror_obj, key, {
            ...description,
            value(...args) {
              return this[baseKey][key](...args);
            }
          });
        } else {
          property_keys.add(key);
        }
      }
    }
    for (const key of property_keys) {
      object_defineProperty(mirror_obj, key, {
        get() {
          return this[baseKey][key];
        },
        set(new_value) {
          this[baseKey][key] = new_value;
        }
      });
    }
    return mirror_obj;
  };
  var subclassThroughComposition = (cls, config = {}) => {
    const class_config = config.class ?? {}, instance_config = config.instance ?? {}, instance_base_key = instance_config.baseKey ?? "_super", class_ignore_keys = class_config.ignoreKeys ?? [], new_cls = class {
      constructor(...args) {
        const composite_instance = new cls(...args);
        this[instance_base_key] = composite_instance;
      }
    }, cls_prototype = prototypeOfClass2(cls), new_cls_prototype = prototypeOfClass2(new_cls);
    mirrorObjectThroughComposition(cls, {
      // NOTE: all classes extend the `Function` constructor (i.e. if we had `class A {}`, then `Object.getPrototypeOf(A) === Function.prototype`).
      //   but obviously, we don't want to mirror the `Function` methods within `cls` (aka the static methods of `Function`),
      //   which is why we set our default class's config `mirrorPrototype.end` to `Function.prototype`.
      mirrorPrototype: { start: 0, end: prototypeOfClass2(Function) },
      baseKey: "_super",
      ...class_config,
      // the ignore list ensures that we don't overwrite existing properties of the `target` class.
      // (even though there are checks in place that would prevent overwriting existing keys, it's better to be explicit)
      ignoreKeys: [...class_ignore_keys, "length", "name", "prototype"],
      target: new_cls
    });
    mirrorObjectThroughComposition(cls_prototype, {
      baseKey: instance_base_key,
      ...instance_config,
      target: new_cls_prototype
    });
    return new_cls;
  };
  var monkeyPatchPrototypeOfClass = (cls, key, value) => {
    object_defineProperty(prototypeOfClass2(cls), key, { value });
  };
  var isComplex = (obj) => {
    const obj_type = typeof obj;
    return obj_type === "object" || obj_type === "function";
  };
  var isPrimitive = (obj) => {
    return !isComplex(obj);
  };
  var isFunction = (obj) => {
    return typeof obj === "function";
  };
  var isObject = (obj) => {
    return typeof obj === "object";
  };
  var isArray = array_isArray;
  var isString = (obj) => {
    return typeof obj === "string";
  };
  var isNumber = (obj) => {
    return typeof obj === "number";
  };
  var isBigint = (obj) => {
    return typeof obj === "bigint";
  };
  var isNumeric = (obj) => {
    return typeof obj === "number" || typeof obj === "bigint";
  };
  var isBoolean = (obj) => {
    return typeof obj === "boolean";
  };
  var isSymbol = (obj) => {
    return typeof obj === "symbol";
  };

  // src/array2d.ts
  var shapeOfArray2D = (arr2d) => {
    const major_len = arr2d.length, minor_len = arr2d[0]?.length ?? 0;
    return [major_len, minor_len];
  };
  var Array2DShape = shapeOfArray2D;
  var newArray2D = (rows, cols, fill_fn) => {
    const col_map_fn = isFunction(fill_fn) ? () => Array(cols).fill(void 0).map(fill_fn) : () => Array(cols).fill(fill_fn);
    return Array(rows).fill(void 0).map(col_map_fn);
  };
  var transposeArray2D = (arr2d) => {
    const [rows, cols] = shapeOfArray2D(arr2d), arr_transposed = [];
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
    const [rows, cols] = shapeOfArray2D(arr2d);
    delete_count ??= max(rows - start, 0);
    return arr2d.splice(start, delete_count, ...insert_items);
  };
  var spliceArray2DMinor = (arr2d, start, delete_count, ...insert_items) => {
    const [rows, cols] = shapeOfArray2D(arr2d), insert_items_rowwise = insert_items.length > 0 ? transposeArray2D(insert_items) : Array(rows).fill([]);
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
    const [rows, cols] = shapeOfArray2D(arr2d);
    amount = modulo(amount, rows === 0 ? 1 : rows);
    if (amount === 0) {
      return arr2d;
    }
    const right_removed_rows = spliceArray2DMajor(arr2d, rows - amount, amount);
    spliceArray2DMajor(arr2d, 0, 0, ...right_removed_rows);
    return arr2d;
  };
  var rotateArray2DMinor = (arr2d, amount) => {
    const [rows, cols] = shapeOfArray2D(arr2d);
    amount = modulo(amount, cols === 0 ? 1 : cols);
    if (amount === 0) {
      return arr2d;
    }
    const right_removed_cols = spliceArray2DMinor(arr2d, cols - amount, amount);
    spliceArray2DMinor(arr2d, 0, 0, ...right_removed_cols);
    return arr2d;
  };
  var meshGrid = (major_values, minor_values) => {
    const axis1_len = minor_values.length, major_grid = major_values.map((major_val) => Array(axis1_len).fill(major_val)), minor_grid = major_values.map(() => minor_values.slice());
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
    const data_str = atob(data_base64), len = data_str.length, data_str_charCodeAt = bind_string_charCodeAt(data_str), data_buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      data_buf[i] = data_str_charCodeAt(i);
    }
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
  var detectReadableStreamType = async (stream) => {
    const [clone1, clone2] = stream.tee(), content = await clone1.getReader().read(), value = content.value, content_type = typeof value, stream_type = content_type === "object" ? isArray(value) ? "array" : value instanceof Uint8Array ? "uint8array" : value instanceof ArrayBuffer ? "arraybuffer" : value ?? false ? "object" : "null" : content_type;
    clone1.cancel();
    stream.cancel();
    return {
      kind: stream_type,
      stream: clone2
    };
  };

  // src/collections.ts
  var List = class extends Array {
    /** ensure that built-in class methods create a primitive `Array`, instead of an instance of this `List` class.
     * 
     * > [!note]
     * > it is extremely important that we set the `[Symbol.species]` static property to `Array`,
     * > otherwise any Array method that creates another Array (such as `map` and `splice`) will create an instance of `List` instead of an `Array`.
     * > this will eventually become a huge hindrance in future computationally heavy subclasses of this class that utilize the splice often.
     * 
     * related reading material:
     * - about the `Symbol.species` static property: [mdn link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species).
     * - about possible deprecation of this feature: [tc39 proposal link](https://github.com/tc39/proposal-rm-builtin-subclassing).
     * - about why use `Symbol.species` instead of `symbol_species` from "alias.ts": see the comment inside the body of {@link Deque[Symbol.iterator]}.
    */
    static [Symbol.species] = Array;
    constructor(items = []) {
      super();
      super.push(...items);
    }
    /** inserts an item at the specified index, shifting all items ahead of it one position to the front.
     * 
     * negative indices are also supported for indicating the position of the newly added item _after_ the array's length has incremented.
     * 
     * @example
     * ```ts
     * import { assertEquals } from "jsr:@std/assert"
     * 
     * const arr = new List([0, 1, 2, 3, 4])
     * arr.insert(-1, 5) // similar to pushing
     * assertEquals([...arr], [0, 1, 2, 3, 4, 5])
     * arr.insert(-2, 4.5)
     * assertEquals([...arr], [0, 1, 2, 3, 4, 4.5, 5])
     * arr.insert(1, 0.5)
     * assertEquals([...arr], [0, 0.5, 1, 2, 3, 4, 4.5, 5])
     * ```
    */
    insert(index, item) {
      const i = modulo(index, this.length) + (index < 0 ? 1 : 0);
      this.splice(i, 0, item);
    }
    /** deletes an item at the specified index, shifting all items ahead of it one position to the back.
     * 
     * negative indices are also supported for indicating the deletion index from the end of the array.
     * 
     * @example
     * ```ts
     * import { assertEquals } from "jsr:@std/assert"
     * 
     * const arr = new List([0, 0.5, 1, 2, 3, 4, 4.5, 5])
     * arr.delete(-1) // similar to popping
     * assertEquals([...arr], [0, 0.5, 1, 2, 3, 4, 4.5])
     * arr.delete(-2)
     * assertEquals([...arr], [0, 0.5, 1, 2, 3, 4.5])
     * arr.delete(1)
     * assertEquals([...arr], [0, 1, 2, 3, 4.5])
     * ```
    */
    delete(index) {
      return this.splice(index, 1)[0];
    }
    /** swap the position of two items by their index.
     * 
     * if any of the two indices is out of bound, then appropriate number of _empty_ elements will be created to fill the gap;
     * similar to how index-based assignment works (i.e. `my_list[off_bound_index] = "something"` will increase `my_list`'s length).
     * 
     * @example
     * ```ts
     * import { assertEquals } from "jsr:@std/assert"
     * 
     * const arr = new List<string>(["0", "4", "2", "3", "1", "5", "6"])
     * arr.swap(1, 4)
     * assertEquals(arr.slice(), ["0", "1", "2", "3", "4", "5", "6"])
     * 
     * // swapping elements with an out of bound index will create additional intermediate `empty` elements.
     * // moreover, the existing element that is swapped will have `undefined` put in its place instead of `empty`.
     * assertEquals(arr.length, 7)
     * arr.swap(5, 9)
     * assertEquals(arr.length, 10)
     * assertEquals(arr.slice(), ["0", "1", "2", "3", "4", undefined, "6", , , "5"]) // notice the empty entries.
     * ```
    */
    swap(index1, index2) {
      [this[index2], this[index1]] = [this[index1], this[index2]];
    }
    /** get an item at the specified `index`.
     * 
     * this is equivalent to using index-based getter: `my_list[index]`.
    */
    get(index) {
      return this[index];
    }
    /** sets the value at the specified index.
     * 
     * prefer using this method instead of index-based assignment, because subclasses may additionally cary out more operations with this method.
     * for attaining compatibility between `List` and its subclasses, it would be in your best interest to use the `set` method.
     * - **not recommended**: `my_list[index] = "hello"`
     * - **preferred**: `my_list.set(index, "hello")`
    */
    set(index, value) {
      return this[index] = value;
    }
    static from(arrayLike, mapfn, thisArg) {
      return new this(array_from(arrayLike, mapfn, thisArg));
    }
    static of(...items) {
      return this.from(items);
    }
  };
  var RcList = class extends List {
    /** the reference counting `Map`, that bookkeeps the multiplicity of each item in the list. */
    rc = /* @__PURE__ */ new Map();
    /** get the reference count (multiplicity) of a specific item in the list.
     * 
     * note that the reference count for a non-existing item is `undefined` instead of `0`.
    */
    getRc = bind_map_get(this.rc);
    /** set the reference count of a specific item in the list. */
    setRc = bind_map_set(this.rc);
    /** delete the reference counting of a specific item in the list. a `true` is returned if the item did exist in {@link rc}, prior to deletion. */
    delRc = bind_map_delete(this.rc);
    constructor(items = []) {
      super();
      this.push(...items);
    }
    /** this overridable method gets called when a new unique item is determined to be added to the list.
     * 
     * this method is called _before_ the item is actually added to the array, but it is executed right _after_ its reference counter has incremented to `1`.
     * 
     * > [!note]
     * > avoid accessing or mutating the array itself in this method's body (consider it an undefined behavior).
     * 
     * @param item the item that is being added.
    */
    onAdded(item) {
    }
    /** this overridable method gets called when a unique item (reference count of 1) is determined to be removed from the list.
     * 
     * this method is called _before_ the item is actually removed from the array, but it is executed right _after_ its reference counter has been deleted.
     * 
     * > [!note]
     * > avoid accessing or mutating the array itself in this method's body (consider it an undefined behavior).
     * 
     * @param item the item that is being removed.
    */
    onDeleted(item) {
    }
    /** increments the reference count of each item in the provided array of items.
     * 
     * @param items the items whose counts are to be incremented.
    */
    incRcs(...items) {
      const { getRc, setRc } = this;
      items.forEach((item) => {
        const new_count = (getRc(item) ?? 0) + 1;
        setRc(item, new_count);
        if (new_count === 1) {
          this.onAdded(item);
        }
      });
    }
    /** decrements the reference count of each item in the provided array of items.
     * 
     * @param items the items whose counts are to be decremented.
    */
    decRcs(...items) {
      const { getRc, setRc, delRc } = this;
      items.forEach((item) => {
        const new_count = (getRc(item) ?? 0) - 1;
        if (new_count > 0) {
          setRc(item, new_count);
        } else {
          delRc(item);
          this.onDeleted(item);
        }
      });
    }
    push(...items) {
      const return_value = super.push(...items);
      this.incRcs(...items);
      return return_value;
    }
    pop() {
      const previous_length = this.length, item = super.pop();
      if (this.length < previous_length) {
        this.decRcs(item);
      }
      return item;
    }
    shift() {
      const previous_length = this.length, item = super.shift();
      if (this.length < previous_length) {
        this.decRcs(item);
      }
      return item;
    }
    unshift(...items) {
      const return_value = super.unshift(...items);
      this.incRcs(...items);
      return return_value;
    }
    splice(start, deleteCount, ...items) {
      const removed_items = super.splice(start, deleteCount, ...items);
      this.incRcs(...items);
      this.decRcs(...removed_items);
      return removed_items;
    }
    swap(index1, index2) {
      const max_index = max(index1, index2);
      if (max_index >= this.length) {
        this.set(max_index, void 0);
      }
      super.swap(index1, index2);
    }
    /** sets the value at the specified index, updating the counter accordingly.
     * 
     * always use this method instead of index-based assignment, because the latter is not interceptable (except when using proxies):
     * - **don't do**: `my_list[index] = "hello"`
     * - **do**: `my_list.set(index, "hello")`
    */
    set(index, value) {
      const old_value = super.get(index), old_length = this.length, increase_in_array_length = index + 1 - old_length;
      if (increase_in_array_length === 1) {
        this.push(value);
      } else if (value !== old_value || increase_in_array_length > 1) {
        value = super.set(index, value);
        this.incRcs(value);
        if (increase_in_array_length > 0) {
          const { getRc, setRc } = this;
          setRc(void 0, (getRc(void 0) ?? 0) + increase_in_array_length);
        }
        this.decRcs(old_value);
      }
      return value;
    }
    static from(arrayLike, mapfn, thisArg) {
      return new this(array_from(arrayLike, mapfn, thisArg));
    }
  };
  var Deque = class {
    /** a double-ended circular queue, similar to python's `collection.deque`.
     * 
     * @param length specify the maximum length of the queue.
     *   pushing more items than the length will remove the items from the opposite side, so as to maintain the size.
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
    /** iterate over the items in this deque, starting from the rear-most item, and ending at the front-most item. */
    *[Symbol.iterator]() {
      const count = this.count;
      for (let i = 0; i < count; i++) {
        yield this.at(i);
      }
    }
    /** inserts one or more items to the rear of the deque.
     * 
     * if the deque is full, it will remove the front item before adding a new item.
    */
    pushBack(...items) {
      for (const item of items) {
        if (this.count === this.length) {
          this.popFront();
        }
        this.items[this.back] = item;
        this.back = modulo(this.back - 1, this.length);
        this.count++;
      }
    }
    /** inserts one or more items to the front of the deque.
     * 
     * if the deque is full, it will remove the rear item before adding a new item.
    */
    pushFront(...items) {
      for (const item of items) {
        if (this.count === this.length) {
          this.popBack();
        }
        this.items[this.front] = item;
        this.front = modulo(this.front + 1, this.length);
        this.count++;
      }
    }
    /** get the item at the back of the deque without removing/popping it. */
    getBack() {
      if (this.count === 0) {
        return void 0;
      }
      return this.seek(0);
    }
    /** get the item at the front of the deque without removing/popping it. */
    getFront() {
      if (this.count === 0) {
        return void 0;
      }
      return this.seek(-1);
    }
    /** removes/pops the item at the back of the deque and returns it. */
    popBack() {
      if (this.count === 0) {
        return void 0;
      }
      this.back = modulo(this.back + 1, this.length);
      const item = this.items[this.back];
      this.items[this.back] = void 0;
      this.count--;
      return item;
    }
    /** removes/pops the item at the front of the deque and returns it. */
    popFront() {
      if (this.count === 0) {
        return void 0;
      }
      this.front = modulo(this.front - 1, this.length);
      const item = this.items[this.front];
      this.items[this.front] = void 0;
      this.count--;
      return item;
    }
    /** rotates the deque `steps` number of positions to the right.
     * 
     * if `steps` is negative, then it will rotate in the left direction.
     * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
    */
    rotate(steps) {
      const { front, back, length, count, items } = this;
      if (count === 0) {
        return;
      }
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
      this.normalize();
      const { count, length, items } = this;
      items.reverse();
      this.front = 0;
      this.back = modulo(0 - count - 1, length);
    }
    /** normalize the internal `items` array so that it beings with the first element of the deque.
     * 
     * this method effectively makes it so that `this.back` becomes `this.length - 1`, and `this.front` becomes `this.count`.
     * this is useful for when you'd like to carry out a slightly complex re-indexing or mutation task on `this.items`,
     * but don't want to compute the indexes at every iteration of the subtasks involved.
    */
    normalize() {
      const { length, count, back, items } = this;
      if (length <= 0) {
        return;
      }
      const rear_item_index = modulo(back + 1, length), rear_segment = items.slice(rear_item_index, rear_item_index + count), remaining_items_count = count - rear_segment.length, front_segment = items.slice(0, remaining_items_count), empty_segment = Array(length - count).fill(void 0);
      items.splice(0, length, ...rear_segment, ...front_segment, ...empty_segment);
      this.back = length - 1;
      this.front = count;
    }
    /** provide an index relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`.
     * 
     * example:
     * - given that a `deque` has a `length` of `5` and a `count` of `3` (i.e. carrying three elements), then:
     * - `deque.items[deque.resolveIndex(0)] === "rear-most element of the deque"`
     * - `deque.items[deque.resolveIndex(-1)] === "fifth element ahead of the rear of the deque"`
     * - `deque.items[deque.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
     * - `deque.items[deque.resolveIndex(6)] === "rear-most element of the deque"`
    */
    resolveIndex(index) {
      return modulo(this.back + index + 1, this.length);
    }
    /** provide an index relative to `this.back + 1`, and get the resolved seek-index `i` that is always within the current {@link count} amount of elements.
     * the returned resolved index `i` can be used to retrieve the element at that index by using `this.items[i]`.
     * 
     * example:
     * - given that a `deque` has a `length` of `5` and a `count` of `3` (i.e. carrying three elements), then:
     * - `deque.items[deque.resolveSeekIndex(0)] === "rear-most element of the deque"`
     * - `deque.items[deque.resolveSeekIndex(-1)] === "third element ahead of the rear of the deque"`
     * - `deque.items[deque.resolveSeekIndex(2)] === "third element ahead of the rear of the deque"`
     * - `deque.items[deque.resolveSeekIndex(3)] === "rear-most element of the deque"`
    */
    resolveSeekIndex(seek_index) {
      const { front, back, count, length } = this, base_index = seek_index < 0 ? front : back + 1, normalized_seek_index = seek_index < 0 ? (seek_index + 1) % count - 1 : seek_index % count;
      return modulo(base_index + normalized_seek_index, length);
    }
    /** returns the item at the specified index, relative to the rear of the deque.
     * 
     * if the capacity (element {@link count}) of this deque is not full,
     * then you may receive `undefined` when you provide an index where an empty element exists.
     * in other words, this method is not aware of the number of elements currently stored in the deque.
     * 
     * to obtain an element that is _always_ within the current partial capacity limit, use the {@link seek} method instead.
     * 
     * @param index The index of the item to retrieve, relative to the rear-most element.
     * @returns The item at the specified index, or `undefined` if the index is out of range with respect to the current {@link count} number of items.
    */
    at(index) {
      return this.items[this.resolveIndex(index)];
    }
    /** returns the item at the specified index, relative to the rear of the deque,
     * ensuring that the index circulates back if it goes off the current item {@link count} amount.
     * 
     * if the capacity (element {@link count}) of this deque is not full,
     * then you may receive `undefined` when you provide an index where an empty element exists.
     * in other words, this method is not aware of the number of elements currently stored in the deque.
     * 
     * to obtain an element that is _always_ within the current partial capacity limit, use the {@link seek} method instead.
     * 
     * @param seek_index The index of the item to retrieve, relative to the rear-most element.
     * @returns The item at the specified index (within the element {@link count} amount of this deque), or `undefined` if there are absolutely no items in the deque.
    */
    seek(seek_index) {
      return this.items[this.resolveSeekIndex(seek_index)];
    }
    /** replaces the item at the specified index with a new item, always ensuring the index is bound to the current element {@link count} amount
     * (as opposed the the full deque {@link length}), so that unoccupied element slots are **not** replaced.
     * i.e. only existing items can be replaced.
    */
    replace(seek_index, item) {
      this.items[this.resolveSeekIndex(seek_index)] = item;
    }
    /** inserts additional items at the specified seek-index, shifting all items ahead of it to the front.
     * if the deque is full, it removes the front item before adding the new additional items.
     * 
     * ~~TODO: current implementation is incomplete, because it involves too many index computations, and I'm too lazy for that.
     * plus, president biden is going to drop the "ball" in times square today on new year's eve.
     * obviously I wouldn't want to miss this historic moment. /s~~
     * in place of a lackluster "ball drop", we got a much more exciting thunder show from the Almighty Himself!
    */
    insert(seek_index, ...insert_items) {
      this.normalize();
      const { count, length, items } = this, new_count = min(count + insert_items.length, length), insertion_index = this.resolveSeekIndex(seek_index) + (seek_index < 0 ? 1 : 0), forward_shifted_items = items.splice(insertion_index);
      items.push(...insert_items, ...forward_shifted_items);
      items.splice(length);
      this.count = new_count;
      this.front = new_count;
    }
    resize(new_length) {
      this.normalize();
      const { length, count, items } = this, length_difference = new_length - length, should_trim = length_difference < 0, start = should_trim ? new_length : length, new_count = min(count, start), deletions = should_trim ? -length_difference : 0, additions = should_trim ? 0 : length_difference;
      items.splice(start, deletions, ...Array(additions).fill(void 0));
      this.length = new_length;
      this.back = new_length - 1;
      this.front = new_count;
      this.count = new_count;
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
      const recursive_dfs_visitor = (id) => {
        for (const to_id of edges_get(id) ?? []) {
          const visits2 = visits_get(to_id);
          if (visits2) {
            visits_set(to_id, visits2 + 1);
          } else {
            recursive_dfs_visitor(to_id);
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
        source_ids.forEach(recursive_dfs_visitor);
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
        0 /* LOG */ && console_log(source_ids);
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
        0 /* LOG */ && console_log(next_ids);
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
  var TREE_VALUE_UNSET = /* @__PURE__ */ Symbol(1 /* MINIFY */ || "represents an unset value for a tree");
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
    static [Symbol.species] = Array;
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
    /** synchronize the ordering of the stack with the underlying {@link $set} object's insertion order (i.e. iteration ordering). <br>
     * the "f" in "fsync" stands for "forward"
    */
    fsync() {
      super.splice(0);
      return super.push(...this.$set);
    }
    /** synchronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
     * this process is more expensive than {@link fsync}, as it has to rebuild the entirety of the underlying set object. <br>
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
    /** push **new** items to stack. doesn't alter the position of already existing items. <br>
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
    /** insert **new** items to the rear of the stack. doesn't alter the position of already existing items. <br>
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
    static [Symbol.species] = Array;
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
  var ChainedPromiseQueue = class extends Array {
    static [Symbol.species] = Array;
    /** the chain of the "then" functions to run each newly pushed promise through. <br>
     * you may dynamically modify this sequence so that all newly pushed promises will have to go through a different set of "then" functions. <br>
     * do note that old (already existing) promises will not be affected by the modified chain of "then" functions.
     * they'll stick to their original sequence of thens because that gets decided during the moment when a promise is pushed into this collection.
    */
    chain = [];
    /** an array of promises consisting of all the final "then" calls, after which (when fulfilled) the promise would be shortly deleted since it will no longer be pending.
     * the array indexes of `this.pending` line up with `this`, in the sense that `this.pending[i] = this[i].then(this.chain.at(0))...then(this.chain.at(-1))`.
     * once a promise inside of `pending` is fulfilled, it will be shortly deleted (via splicing) from `pending`,
     * and its originating `Promise` which was pushed  into `this` collection will also get removed. <br>
     * (the removal is done by the private {@link del} method)
     * 
     * ```ts
     * const do_actions = new ChainedPromiseQueue<string>([
     * 	[(value: string) => value.toUpperCase()],
     * 	[(value: string) => "Result: " + value],
     * 	[(value: string) => new Promise((resolve) => {setTimeout(() => {resolve(value)}, 1000)})],
     * 	[(value: string) => console.log(value)],
     * ])
     * const chain_of_actions = do_actions.chain
     * const number_of_actions = chain_of_actions.length
     * 
     * // const my_promise = new Promise<string>((resolve, reject) => {
     * // 	//do async stuff
     * // })
     * // do_actions.push(my_promise)
     * // let index = do_actions.indexOf(my_promise) // === do_actions.length - 1
     * // 
     * // // the following two are functionally/structurally equivalent:
     * // do_actions.pending[index] == do_actions[index]
     * // 		.then(chain_of_actions[0]![0], chain_of_actions[0]![1])
     * // 		.then(chain_of_actions[1]![0], chain_of_actions[1]![1])
     * // 		// ... lots of thens
     * // 		.then(chain_of_actions[number_of_actions - 1]![0], chain_of_actions[number_of_actions - 1]![1])
     * ```
    */
    pending = [];
    onEmpty;
    constructor(then_functions_sequence = [], { onEmpty, isEmpty } = {}) {
      super();
      console.log(then_functions_sequence);
      this.chain.push(...then_functions_sequence);
      this.onEmpty = onEmpty;
      if (isEmpty) {
        onEmpty?.();
      }
    }
    push(...new_promises) {
      const new_length = super.push(...new_promises), chain = this.chain;
      this.pending.push(...new_promises.map((promise) => {
        chain.forEach(([onfulfilled, onrejected]) => {
          promise = promise.then(onfulfilled, onrejected);
        });
        const completed_promise_deleter = () => this.del(promise);
        promise.then(completed_promise_deleter, completed_promise_deleter);
        return promise;
      }));
      return new_length;
    }
    /** delete a certain promise that has been chained with the "then" functions.
     * @param completed_pending_promise the promise to be deleted from {@link pending} and {@link this} collection of promises
     * @returns `true` if the pending promise was found and deleted, else `false` will be returned
    */
    del(completed_pending_promise) {
      const pending = this.pending, idx = pending.indexOf(completed_pending_promise);
      if (idx >= 0) {
        pending.splice(idx, 1);
        super.splice(idx, 1);
        if (array_isEmpty(this)) {
          this.onEmpty?.();
        }
        return true;
      }
      return false;
    }
  };

  // src/cryptoman.ts
  var createCrc32Table = () => {
    const polynomial = -306674912, crc32_table2 = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let r = i;
      for (let bit = 8; bit > 0; --bit) {
        r = r & 1 ? r >>> 1 ^ polynomial : r >>> 1;
      }
      crc32_table2[i] = r;
    }
    return crc32_table2;
  };
  var crc32_table;
  var crc32 = (bytes, crc) => {
    crc = crc === void 0 ? 4294967295 : crc ^ -1;
    crc32_table ??= createCrc32Table();
    for (let i = 0; i < bytes.length; ++i) {
      crc = crc32_table[(crc ^ bytes[i]) & 255] ^ crc >>> 8;
    }
    return (crc ^ -1) >>> 0;
  };

  // src/dotkeypath.ts
  var getKeyPath = (obj, kpath) => {
    let value = obj;
    for (const k of kpath) {
      value = value[k];
    }
    return value;
  };
  var setKeyPath = (obj, kpath, value) => {
    const child_key = kpath.pop(), parent = getKeyPath(obj, kpath);
    kpath.push(child_key);
    parent[child_key] = value;
    return obj;
  };
  var bindKeyPathTo = (bind_to) => [
    (kpath) => getKeyPath(bind_to, kpath),
    (kpath, value) => setKeyPath(bind_to, kpath, value)
  ];
  var dotPathToKeyPath = (dpath) => dpath.split(".").map((key) => (
    // the reason why we explicitly check if the value is finite before parsing as an integer,
    // is because there are cases where `parseInt` would produce a finite number out of an incorrect string.
    // for instance: `parseInt("20abc") === 20` (one would expect it to be `NaN`, but it isn't).
    // however, `isFinite` solves this by _only_ being truthy when its input is purely numerical.
    // in other words: `isFinite("20abc") === false` (just as one would expect).
    // one more thing: notice that we use `globalThis.isFinite` instead of `Number.isFinite`. this is because the two are apparently not the same.
    // `globalThis.isFinite` is capable of parsing string inputs, while `Number.isFinite` strictly takes numeric inputs, and will return a false on string inputs.
    // you can verify it yourself: `Number.isFinite !== globalThis.isFinite`, but `Number.parseInt === globalThis.parseInt`, and `Number.parseFloat === globalThis.parseFloat`.
    isFinite(key) ? number_parseInt(key) : key
  ));
  var getDotPath = (obj, dpath) => getKeyPath(obj, dotPathToKeyPath(dpath));
  var setDotPath = (obj, dpath, value) => setKeyPath(obj, dotPathToKeyPath(dpath), value);
  var bindDotPathTo = (bind_to) => [
    (dpath) => getDotPath(bind_to, dpath),
    (dpath, value) => setDotPath(bind_to, dpath, value)
  ];

  // src/eightpack_varint.ts
  var encode_varint = (value, type) => {
    return encode_varint_array([value], type);
  };
  var encode_varint_array = (value, type) => {
    return type[0] === "u" ? encode_uvar_array(value) : encode_ivar_array(value);
  };
  var decode_varint = (buf, offset, type) => {
    const [value, bytesize] = decode_varint_array(buf, offset, type, 1);
    return [value[0], bytesize];
  };
  var decode_varint_array = (buf, offset, type, array_length) => {
    return type[0] === "u" ? decode_uvar_array(buf, offset, array_length) : decode_ivar_array(buf, offset, array_length);
  };
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
    if (array_length === void 0) {
      array_length = Infinity;
    }
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
      const sign2 = v >= 0 ? 1 : -1, lsb_to_msb = [];
      v = v * sign2;
      while (v > 63) {
        lsb_to_msb.push((v & 127) + 128);
        v >>= 7;
      }
      lsb_to_msb.push(v & 63 | (sign2 == -1 ? 192 : 128));
      lsb_to_msb[0] &= 127;
      bytes.push(...lsb_to_msb.reverse());
    }
    return Uint8Array.from(bytes);
  };
  var decode_ivar_array = (buf, offset = 0, array_length) => {
    if (array_length === void 0) {
      array_length = Infinity;
    }
    const array = [], offset_start = offset, buf_length = buf.length;
    let sign2 = 0, value = 0;
    for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++]) {
      if (sign2 === 0) {
        sign2 = (byte & 64) > 0 ? -1 : 1;
        value = byte & 63;
      } else {
        value <<= 7;
        value += byte & 127;
      }
      if (byte >> 7 === 0) {
        array.push(value * sign2);
        array_length--;
        sign2 = 0;
        value = 0;
      }
    }
    offset--;
    return [array, offset - offset_start];
  };
  var encode_uvar = (value) => {
    return encode_uvar_array([value]);
  };
  var decode_uvar = (buf, offset = 0) => {
    const [value_arr, bytesize] = decode_uvar_array(buf, offset, 1);
    return [value_arr[0], bytesize];
  };
  var encode_ivar = (value) => {
    return encode_ivar_array([value]);
  };
  var decode_ivar = (buf, offset = 0) => {
    const [value_arr, bytesize] = decode_ivar_array(buf, offset, 1);
    return [value_arr[0], bytesize];
  };

  // src/typedbuffer.ts
  var isTypedArray = (obj) => obj.buffer ? true : false;
  var typed_array_constructor_of = (type) => {
    if (type[2] === "c") {
      return Uint8ClampedArray;
    }
    type = type[0] + type[1];
    switch (type) {
      case "u1":
        return Uint8Array;
      case "u2":
        return Uint16Array;
      case "u4":
        return Uint32Array;
      //case "u8": return BigUint64Array as TypedArrayConstructor<DType>
      case "i1":
        return Int8Array;
      case "i2":
        return Int16Array;
      case "i4":
        return Int32Array;
      //case "i8": return BigInt64Array as TypedArrayConstructor<DType>
      case "f4":
        return Float32Array;
      case "f8":
        return Float64Array;
    }
    console_error(0 /* ERROR */ && 'an unrecognized typed array type `"${type}"` was provided');
    return Uint8Array;
  };
  var getEnvironmentEndianness = () => new Uint8Array(Uint32Array.of(1).buffer)[0] === 1 ? true : false;
  var env_is_little_endian = /* @__PURE__ */ getEnvironmentEndianness();
  var swapEndiannessInplace = (buf, bytesize) => {
    const len = buf.byteLength;
    for (let i = 0; i < len; i += bytesize) {
      buf.subarray(i, i + bytesize).reverse();
    }
    return buf;
  };
  var swapEndiannessFast = (buf, bytesize) => {
    const len = buf.byteLength, swapped_buf = new Uint8Array(len), bs = bytesize;
    for (let offset = 0; offset < bs; offset++) {
      const a = bs - 1 - offset * 2;
      for (let i = offset; i < len + offset; i += bs) {
        swapped_buf[i] = buf[i + a];
      }
    }
    return swapped_buf;
  };
  var concatBytes = (...arrs) => {
    const offsets = [0];
    for (const arr of arrs) {
      offsets.push(offsets[offsets.length - 1] + arr.length);
    }
    const outarr = new Uint8Array(offsets.pop());
    for (const arr of arrs) {
      outarr.set(arr, offsets.shift());
    }
    return outarr;
  };
  var concatTyped = (...arrs) => {
    const offsets = [0];
    for (const arr of arrs) {
      offsets.push(offsets[offsets.length - 1] + arr.length);
    }
    const outarr = new (constructorOf(arrs[0]))(offsets.pop());
    for (const arr of arrs) {
      outarr.set(arr, offsets.shift());
    }
    return outarr;
  };
  var splitTypedSubarray = (arr, step) => sliceSkipTypedSubarray(arr, step);
  var sliceSkip = (arr, slice_length, skip_length = 0, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const out_arr = [];
    for (let offset = start; offset < end; offset += slice_length + skip_length) {
      out_arr.push(arr.slice(offset, offset + slice_length));
    }
    return out_arr;
  };
  var sliceSkipTypedSubarray = (arr, slice_length, skip_length = 0, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const out_arr = [];
    for (let offset = start; offset < end; offset += slice_length + skip_length) {
      out_arr.push(arr.subarray(offset, offset + slice_length));
    }
    return out_arr;
  };
  var isIdentical = (arr1, arr2) => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return isSubidentical(arr1, arr2);
  };
  var isSubidentical = (arr1, arr2) => {
    const len = min(arr1.length, arr2.length);
    for (let i = 0; i < len; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  };
  var sliceContinuous = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i++) {
      out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i]));
    }
    return out_arr;
  };
  var sliceContinuousTypedSubarray = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i++) {
      out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i]));
    }
    return out_arr;
  };
  var sliceIntervals = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2) {
      out_arr.push(arr.slice(slice_intervals[i - 1], slice_intervals[i]));
    }
    return out_arr;
  };
  var sliceIntervalsTypedSubarray = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2) {
      out_arr.push(arr.subarray(slice_intervals[i - 1], slice_intervals[i]));
    }
    return out_arr;
  };
  var sliceIntervalLengths = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2) {
      out_arr.push(arr.slice(
        slice_intervals[i - 1],
        slice_intervals[i] === void 0 ? void 0 : slice_intervals[i - 1] + slice_intervals[i]
      ));
    }
    return out_arr;
  };
  var sliceIntervalLengthsTypedSubarray = (arr, slice_intervals) => {
    const out_arr = [];
    for (let i = 1; i < slice_intervals.length; i += 2) {
      out_arr.push(arr.subarray(
        slice_intervals[i - 1],
        slice_intervals[i] === void 0 ? void 0 : slice_intervals[i - 1] + slice_intervals[i]
      ));
    }
    return out_arr;
  };

  // src/eightpack.ts
  var txt_encoder = /* @__PURE__ */ new TextEncoder();
  var txt_decoder = /* @__PURE__ */ new TextDecoder();
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
    for (const item of items) {
      bufs.push(pack(...item));
    }
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
        if (type[1] === "v") {
          return type.endsWith("[]") ? encode_varint_array(value, type) : encode_varint(value, type);
        } else {
          return type.endsWith("[]") ? encode_number_array(value, type) : encode_number(value, type);
        }
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
        if (type[1] === "v") {
          return type.endsWith("[]") ? decode_varint_array(buf, offset, type, ...args) : decode_varint(buf, offset, type);
        } else {
          return type.endsWith("[]") ? decode_number_array(buf, offset, type, ...args) : decode_number(buf, offset, type);
        }
      }
    }
  };
  var encode_bool = (value) => {
    return Uint8Array.of(value ? 1 : 0);
  };
  var decode_bool = (buf, offset = 0) => {
    return [buf[offset] >= 1 ? true : false, 1];
  };
  var encode_cstr = (value) => {
    return txt_encoder.encode(value + "\0");
  };
  var decode_cstr = (buf, offset = 0) => {
    const offset_end = buf.indexOf(0, offset), txt_arr = buf.subarray(offset, offset_end), value = txt_decoder.decode(txt_arr);
    return [value, txt_arr.length + 1];
  };
  var encode_str = (value) => {
    return txt_encoder.encode(value);
  };
  var decode_str = (buf, offset = 0, bytesize) => {
    const offset_end = bytesize === void 0 ? void 0 : offset + bytesize, txt_arr = buf.subarray(offset, offset_end), value = txt_decoder.decode(txt_arr);
    return [value, txt_arr.length];
  };
  var encode_bytes = (value) => {
    return value;
  };
  var decode_bytes = (buf, offset = 0, bytesize) => {
    const offset_end = bytesize === void 0 ? void 0 : offset + bytesize, value = buf.slice(offset, offset_end);
    return [value, value.length];
  };
  var encode_number_array = (value, type) => {
    const [t, s, e] = type, typed_arr_constructor = typed_array_constructor_of(type), bytesize = number_parseInt(s), is_native_endian = e === "l" && env_is_little_endian || e === "b" && !env_is_little_endian || bytesize === 1 ? true : false, typed_arr = typed_arr_constructor.from(value);
    if (typed_arr instanceof Uint8Array) {
      return typed_arr;
    }
    const buf = new Uint8Array(typed_arr.buffer);
    if (is_native_endian) {
      return buf;
    } else return swapEndiannessFast(buf, bytesize);
  };
  var decode_number_array = (buf, offset = 0, type, array_length) => {
    const [t, s, e] = type, bytesize = number_parseInt(s), is_native_endian = e === "l" && env_is_little_endian || e === "b" && !env_is_little_endian || bytesize === 1 ? true : false, bytelength = array_length ? bytesize * array_length : void 0, array_buf = buf.slice(offset, bytelength ? offset + bytelength : void 0), array_bytesize = array_buf.length, typed_arr_constructor = typed_array_constructor_of(type), typed_arr = new typed_arr_constructor(is_native_endian ? array_buf.buffer : swapEndiannessFast(array_buf, bytesize).buffer);
    return [array_from(typed_arr), array_bytesize];
  };
  var encode_number = (value, type) => {
    return encode_number_array([value], type);
  };
  var decode_number = (buf, offset = 0, type) => {
    const [value_arr, bytesize] = decode_number_array(buf, offset, type, 1);
    return [value_arr[0], bytesize];
  };

  // src/mapper.ts
  var recordMap = (mapping_funcs, input_data) => {
    const out_data = {};
    for (const k in mapping_funcs) {
      out_data[k] = mapping_funcs[k](input_data[k]);
    }
    return out_data;
  };
  var recordArgsMap = (mapping_funcs, input_args) => {
    const out_data = {};
    for (const k in mapping_funcs) {
      out_data[k] = mapping_funcs[k](...input_args[k]);
    }
    return out_data;
  };
  var sequenceMap = (mapping_funcs, input_data) => {
    const out_data = [], len = mapping_funcs.length;
    for (let i = 0; i < len; i++) {
      out_data.push(mapping_funcs[i](input_data[i]));
    }
    return out_data;
  };
  var sequenceArgsMap = (mapping_funcs, input_args) => {
    const out_data = [], len = mapping_funcs.length;
    for (let i = 0; i < len; i++) {
      out_data.push(mapping_funcs[i](...input_args[i]));
    }
    return out_data;
  };

  // src/formattable.ts
  var formatEach = (formatter, v) => {
    return isArray(v) ? v.map(formatter) : formatter(v);
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
  var getBgCanvas = (init_width, init_height) => {
    bg_canvas ??= new OffscreenCanvas(init_width ?? 10, init_height ?? 10);
    return bg_canvas;
  };
  var getBgCtx = (init_width, init_height) => {
    if (bg_ctx === void 0) {
      bg_ctx = getBgCanvas(init_width, init_height).getContext("2d", { willReadFrequently: true });
      bg_ctx.imageSmoothingEnabled = false;
    }
    return bg_ctx;
  };
  var isBase64Image = (str) => {
    return str?.startsWith("data:image/") ?? false;
  };
  var getBase64ImageHeader = (str) => str.slice(0, str.indexOf(";base64,") + 8);
  var getBase64ImageMIMEType = (str) => str.slice(5, str.indexOf(";base64,"));
  var getBase64ImageBody = (str) => str.substring(str.indexOf(";base64,") + 8);
  var constructImageBlob = async (img_src, width, crop_rect, bitmap_options, blob_options) => {
    if (crop_rect) {
      crop_rect = positiveRect(crop_rect);
    }
    const bitmap_src = await constructImageBitmapSource(img_src, width), bitmap = crop_rect ? await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) : await createImageBitmap(bitmap_src, bitmap_options), canvas = getBgCanvas(), ctx = getBgCtx();
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.globalCompositeOperation = "copy";
    ctx.resetTransform();
    ctx.drawImage(bitmap, 0, 0);
    return canvas.convertToBlob(blob_options);
  };
  var constructImageData = async (img_src, width, crop_rect, bitmap_options, image_data_options) => {
    if (crop_rect) {
      crop_rect = positiveRect(crop_rect);
    }
    const bitmap_src = await constructImageBitmapSource(img_src, width), bitmap = crop_rect ? await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) : await createImageBitmap(bitmap_src, bitmap_options), canvas = getBgCanvas(), ctx = getBgCtx();
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.globalCompositeOperation = "copy";
    ctx.resetTransform();
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height, image_data_options);
  };
  var constructImageBitmapSource = async (img_src, width) => {
    if (isString(img_src)) {
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
    return img_src;
  };
  var intensityBitmap = (pixels_buf, channels, alpha_channel, alpha_bias = 1) => {
    const pixel_len = pixels_buf.length / channels, alpha_visibility = new Uint8ClampedArray(pixel_len).fill(1), intensity = new Uint8ClampedArray(pixel_len);
    if (alpha_channel !== void 0) {
      for (let i = 0; i < pixel_len; i++) {
        alpha_visibility[i] = pixels_buf[i * channels + alpha_channel] < alpha_bias ? 0 : 1;
      }
      pixels_buf = pixels_buf.filter((v, i) => i % channels === alpha_channel ? false : true);
      channels--;
    }
    for (let ch = 0; ch < channels; ch++) {
      for (let i = 0; i < pixel_len; i++) {
        intensity[i] += pixels_buf[i * channels + ch];
      }
    }
    if (alpha_channel !== void 0) {
      for (let i = 0; i < pixel_len; i++) {
        intensity[i] *= alpha_visibility[i];
      }
    }
    return new Uint8Array(intensity.buffer);
  };
  var getBoundingBox = (img_data, padding_condition, minimum_non_padding_value = 1) => {
    const { width, height, data } = img_data, channels = data.length / (width * height), rowAt = (y) => data.subarray(y * width * channels, (y * width + width) * channels), colAt = (x) => {
      const col = new Uint8Array(height * channels);
      for (let y = 0; y < height; y++) {
        for (let ch = 0; ch < channels; ch++) {
          col[y * channels + ch] = data[(y * width + x) * channels + ch];
        }
      }
      return col;
    }, nonPaddingValue = (data_row_or_col) => {
      let non_padding_value = 0;
      for (let px = 0, len = data_row_or_col.length; px < len; px += channels) {
        non_padding_value += padding_condition(data_row_or_col[px + 0], data_row_or_col[px + 1], data_row_or_col[px + 2], data_row_or_col[px + 3]);
      }
      return non_padding_value;
    };
    if (0 /* ASSERT */) {
      console_assert(number_isInteger(channels));
    }
    let [top, left, bottom, right] = [0, 0, height, width];
    for (; top < height; top++) {
      if (nonPaddingValue(rowAt(top)) >= minimum_non_padding_value) {
        break;
      }
    }
    for (; bottom >= top; bottom--) {
      if (nonPaddingValue(rowAt(bottom)) >= minimum_non_padding_value) {
        break;
      }
    }
    for (; left < width; left++) {
      if (nonPaddingValue(colAt(left)) >= minimum_non_padding_value) {
        break;
      }
    }
    for (; right >= left; right--) {
      if (nonPaddingValue(colAt(right)) >= minimum_non_padding_value) {
        break;
      }
    }
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  };
  var cropImageData = (img_data, crop_rect) => {
    const { width, height, data } = img_data, channels = data.length / (width * height), crop = positiveRect({ x: 0, y: 0, width, height, ...crop_rect }), [top, left, bottom, right] = [crop.y, crop.x, crop.y + crop.height, crop.x + crop.width];
    if (0 /* ASSERT */) {
      console_assert(number_isInteger(channels));
    }
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
    console_error(0 /* ERROR */ && "not implemented");
  };

  // src/lambda.ts
  var THROTTLE_REJECT = /* @__PURE__ */ Symbol(1 /* MINIFY */ || "a rejection by a throttled function");
  var TIMEOUT = /* @__PURE__ */ Symbol(1 /* MINIFY */ || "a timeout by an awaited promiseTimeout function");
  var debounce = (wait_time_ms, fn, rejection_value) => {
    let prev_timer, prev_reject = () => {
    };
    return (...args) => {
      dom_clearTimeout(prev_timer);
      if (rejection_value !== void 0) {
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
      if (rejection_value !== void 0) {
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
  var promiseTimeout = (wait_time_ms, should_reject) => {
    return new Promise((resolve, reject) => {
      dom_setTimeout(should_reject ? reject : resolve, wait_time_ms, TIMEOUT);
    });
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
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func();
    }
  };
  var vectorize1 = (map_func, write_to, arr1) => {
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func(arr1[i]);
    }
  };
  var vectorize2 = (map_func, write_to, arr1, arr2) => {
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func(arr1[i], arr2[i]);
    }
  };
  var vectorize3 = (map_func, write_to, arr1, arr2, arr3) => {
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func(arr1[i], arr2[i], arr3[i]);
    }
  };
  var vectorize4 = (map_func, write_to, arr1, arr2, arr3, arr4) => {
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i]);
    }
  };
  var vectorize5 = (map_func, write_to, arr1, arr2, arr3, arr4, arr5) => {
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i], arr5[i]);
    }
  };
  var vectorizeN = (map_func, write_to, ...arrs) => {
    const param_length = arrs.length;
    const params = Array(param_length).fill(0);
    for (let i = 0; i < write_to.length; i++) {
      for (let p = 0; p < param_length; p++) {
        params[p] = arrs[p][i];
      }
      write_to[i] = map_func(...params);
    }
  };
  var vectorizeIndexHOF = (index_map_func_hof, write_to, ...input_arrs) => {
    const map_func_index = index_map_func_hof(...input_arrs);
    for (let i = 0; i < write_to.length; i++) {
      write_to[i] = map_func_index(i);
    }
  };

  // src/numericarray.ts
  var transpose2D = (matrix) => matrix[0].map(
    (_row_0_col_i, i) => matrix.map(
      (row_arr) => row_arr[i]
    )
  );
  var diff = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const diff_arr = arr.slice(start + 1, end);
    for (let i = 0; i < diff_arr.length; i++) {
      diff_arr[i] -= arr[start + i];
    }
    return diff_arr;
  };
  var diff_right = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const diff_arr = arr.slice(start, end - 1);
    for (let i = 0; i < diff_arr.length; i++) {
      diff_arr[i] -= arr[start + i + 1];
    }
    return diff_arr;
  };
  var cumulativeSum = (arr) => {
    const len = arr.length, cum_sum = new (constructorOf(arr))(len + 1).fill(0);
    for (let i = 0; i < len; i++) {
      cum_sum[i + 1] = cum_sum[i] + arr[i];
    }
    return cum_sum;
  };
  var abs = (arr, start = 0, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] *= arr[i] < 0 ? -1 : 1;
    }
    return arr;
  };
  var neg = (arr, start = 0, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] *= -1;
    }
    return arr;
  };
  var bcomp = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] = ~arr[i];
    }
    return arr;
  };
  var band = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] &= value;
    }
    return arr;
  };
  var bor = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] |= value;
    }
    return arr;
  };
  var bxor = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] ^= value;
    }
    return arr;
  };
  var blsh = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] <<= value;
    }
    return arr;
  };
  var brsh = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] >>= value;
    }
    return arr;
  };
  var bursh = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] >>>= value;
    }
    return arr;
  };
  var add = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] += value;
    }
    return arr;
  };
  var sub = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] -= value;
    }
    return arr;
  };
  var mult = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] *= value;
    }
    return arr;
  };
  var div = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] /= value;
    }
    return arr;
  };
  var pow = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] **= value;
    }
    return arr;
  };
  var rem = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] %= value;
    }
    return arr;
  };
  var mod = (arr, value, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    for (let i = start; i < end; i++) {
      arr[i] = (arr[i] % value + value) % value;
    }
    return arr;
  };

  // src/stringman.ts
  var default_HexStringReprConfig = {
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
    const { sep: sep2, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix } = { ...default_HexStringReprConfig, ...options }, num_arr = arr.buffer ? array_from(arr) : arr, str = num_arr.map((v) => {
      let s = (v | 0).toString(radix);
      s = s.length === 2 ? s : "0" + s;
      return toUpperCase ? string_toUpperCase(s) : s;
    }).reduce((str2, s) => str2 + prefix + s + postfix + sep2, "");
    return bra + str.slice(0, trailingSep ? void 0 : -sep2.length) + ket;
  };
  var hexStringToArray = (hex_str, options) => {
    const { sep: sep2, prefix, postfix, bra, ket, radix } = { ...default_HexStringReprConfig, ...options }, [sep_len, prefix_len, postfix_len, bra_len, ket_len] = [sep2, prefix, postfix, bra, ket].map((s) => s.length), hex_str2 = hex_str.slice(bra_len, ket_len > 0 ? -ket_len : void 0), elem_len = prefix_len + 2 + postfix_len + sep_len, int_arr = [];
    for (let i = prefix_len; i < hex_str2.length; i += elem_len) {
      int_arr.push(number_parseInt(
        hex_str2[i] + hex_str2[i + 1],
        // these are the two characters representing the current number in hex-string format
        radix
      ));
    }
    return int_arr;
  };
  var toUpperOrLowerCase = (str, option) => {
    return option > 0 ? string_toUpperCase(str) : option < 0 ? string_toLowerCase(str) : str;
  };
  var findNextUpperCase = (str, start = 0, end = void 0) => {
    end = (end < str.length ? end : str.length) - 1;
    const str_charCodeAt = bind_string_charCodeAt(str);
    let c;
    while (c = str_charCodeAt(start++)) {
      if (c > 64 && c < 91) {
        return start - 1;
      }
    }
    return void 0;
  };
  var findNextLowerCase = (str, start = 0, end = void 0) => {
    end = (end < str.length ? end : str.length) - 1;
    const str_charCodeAt = bind_string_charCodeAt(str);
    let c;
    while (c = str_charCodeAt(start++)) {
      if (c > 96 && c < 123) {
        return start - 1;
      }
    }
    return void 0;
  };
  var findNextUpperOrLowerCase = (str, option, start = 0, end = void 0) => {
    if (option > 0) {
      return findNextUpperCase(str, start, end);
    } else if (option < 0) {
      return findNextLowerCase(str, start, end);
    } else {
      return void 0;
    }
  };
  var wordsToToken = (casetype, words) => {
    const [first_letter_upper, word_first_letter_upper, rest_word_letters_upper, delimiter = "", prefix = "", suffix = ""] = casetype, last_i = words.length - 1, token = words.map((w, i) => {
      const w_0 = toUpperOrLowerCase(w[0], i > 0 ? word_first_letter_upper : first_letter_upper), w_rest = toUpperOrLowerCase(w.slice(1), rest_word_letters_upper), sep2 = i < last_i ? delimiter : "";
      return w_0 + w_rest + sep2;
    }).reduce((str, word) => str + word, prefix) + suffix;
    return token;
  };
  var tokenToWords = (casetype, token) => {
    const [, word_first_letter_upper, , delimiter = "", prefix = "", suffix = ""] = casetype;
    token = token.slice(prefix.length, -suffix.length || void 0);
    let words;
    if (delimiter === "") {
      const idxs = [0];
      let i = 0;
      while (i !== void 0) {
        i = findNextUpperOrLowerCase(token, word_first_letter_upper, i + 1);
        idxs.push(i);
      }
      words = sliceContinuous(token, idxs);
    } else words = token.split(delimiter);
    return words.map((word) => string_toLowerCase(word));
  };
  var convertCase = (from_casetype, to_casetype, token) => wordsToToken(to_casetype, tokenToWords(from_casetype, token));
  var convertCase_Factory = (from_casetype, to_casetype) => {
    const bound_words_to_token = wordsToToken.bind(void 0, to_casetype), bound_token_to_words = tokenToWords.bind(void 0, from_casetype);
    return (token) => bound_words_to_token(bound_token_to_words(token));
  };
  var snakeCase = [-1, -1, -1, "_"];
  var kebabCase = [-1, -1, -1, "-"];
  var camelCase = [-1, 1, -1, ""];
  var pascalCase = [1, 1, -1, ""];
  var screamingSnakeCase = [1, 1, 1, "_"];
  var screamingKebabCase = [1, 1, 1, "-"];
  var snakeToKebab = /* @__PURE__ */ convertCase_Factory(snakeCase, kebabCase);
  var snakeToCamel = /* @__PURE__ */ convertCase_Factory(snakeCase, camelCase);
  var snakeToPascal = /* @__PURE__ */ convertCase_Factory(snakeCase, pascalCase);
  var kebabToSnake = /* @__PURE__ */ convertCase_Factory(kebabCase, snakeCase);
  var kebabToCamel = /* @__PURE__ */ convertCase_Factory(kebabCase, camelCase);
  var kebabToPascal = /* @__PURE__ */ convertCase_Factory(kebabCase, pascalCase);
  var camelToSnake = /* @__PURE__ */ convertCase_Factory(camelCase, snakeCase);
  var camelToKebab = /* @__PURE__ */ convertCase_Factory(camelCase, kebabCase);
  var camelToPascal = /* @__PURE__ */ convertCase_Factory(camelCase, pascalCase);
  var PascalToSnake = /* @__PURE__ */ convertCase_Factory(pascalCase, snakeCase);
  var PascalToKebab = /* @__PURE__ */ convertCase_Factory(pascalCase, kebabCase);
  var PascalTocamel = /* @__PURE__ */ convertCase_Factory(pascalCase, camelCase);
  var quote = (str) => '"' + str + '"';
  var reverseString = (input) => {
    return [...input.normalize("NFC")].toReversed().join("");
  };
  var commonPrefix = (inputs) => {
    const len = inputs.length;
    if (len < 1) return "";
    const inputs_lengths = inputs.map((str) => str.length), shortest_input_length = math_min(...inputs_lengths), shortest_input = inputs[inputs_lengths.indexOf(shortest_input_length)];
    let left = 0, right = shortest_input_length;
    while (left <= right) {
      const center = (left + right) / 2 | 0, prefix = shortest_input.substring(0, center);
      if (inputs.every((input) => input.startsWith(prefix))) {
        left = center + 1;
      } else {
        right = center - 1;
      }
    }
    return shortest_input.substring(0, (left + right) / 2 | 0);
  };
  var commonSuffix = (inputs) => {
    return reverseString(commonPrefix(inputs.map(reverseString)));
  };
  var escapeLiteralCharsRegex = /[.*+?^${}()|[\]\\]/g;
  var escapeLiteralStringForRegex = (str) => str.replaceAll(escapeLiteralCharsRegex, "\\$&");
  var replacePrefix = (input, prefix, value = "") => {
    return input.startsWith(prefix) ? value + input.slice(prefix.length) : void 0;
  };
  var replaceSuffix = (input, suffix, value = "") => {
    return input.endsWith(suffix) ? (suffix === "" ? input : input.slice(0, -suffix.length)) + value : void 0;
  };

  // src/pathman.ts
  var uriProtocolSchemeMap = /* @__PURE__ */ object_entries({
    "node:": "node",
    "npm:": "npm",
    "jsr:": "jsr",
    "blob:": "blob",
    "data:": "data",
    "http://": "http",
    "https://": "https",
    "file://": "file",
    "./": "relative",
    "../": "relative"
  });
  var forbiddenBaseUriSchemes = ["blob", "data", "relative"];
  var packageUriSchemes = ["jsr", "npm", "node"];
  var packageUriProtocols = ["jsr:", "npm:", "node:"];
  var sep = "/";
  var dotslash = "./";
  var dotdotslash = "../";
  var windows_directory_slash_regex = /\\/g;
  var windows_absolute_path_regex = /^[a-z]\:[\/\\]/i;
  var leading_slashes_regex = /^\/+/;
  var trailing_slashes_regex = /(?<!\/\.\.?)\/+$/;
  var leading_slashes_and_dot_slashes_regex = /^(\.?\/)+/;
  var reversed_trailing_slashes_and_dot_slashes_regex = /^(\/\.?(?![^\/]))*(\/(?!\.\.\/))?/;
  var filename_regex = /\/?[^\/]+$/;
  var basename_and_extname_regex = /^(?<basename>.+?)(?<ext>\.[^\.]+)?$/;
  var package_regex = /^(?<protocol>jsr:|npm:|node:)(\/*(@(?<scope>[^\/\s]+)\/)?(?<pkg>[^@\/\s]+)(@(?<version>[^\/\r\n\t\f\v]+))?)?(?<pathname>\/.*)?$/;
  var string_starts_with = (str, starts_with) => str.startsWith(starts_with);
  var string_ends_with = (str, ends_with) => str.endsWith(ends_with);
  var isAbsolutePath = (path) => {
    return string_starts_with(path, sep) || string_starts_with(path, "~") || windows_absolute_path_regex.test(path);
  };
  var getUriScheme = (path) => {
    if (!path || path === "") {
      return void 0;
    }
    for (const [protocol, scheme] of uriProtocolSchemeMap) {
      if (string_starts_with(path, protocol)) {
        return scheme;
      }
    }
    return isAbsolutePath(path) ? "local" : "relative";
  };
  var parsePackageUrl = (url_href) => {
    url_href = dom_decodeURI(isString(url_href) ? url_href : url_href.href);
    const { protocol, scope: scope_str, pkg, version: version_str, pathname: pathname_str } = package_regex.exec(url_href)?.groups ?? {};
    if (protocol === void 0 || pkg === void 0) {
      throw new Error(0 /* ERROR */ ? "invalid package url format was provided: " + url_href : "");
    }
    const scope = scope_str ? scope_str : void 0, version = version_str ? version_str : void 0, pathname = pathname_str ? pathname_str : sep, host = `${scope ? "@" + scope + sep : ""}${pkg}${version ? "@" + version : ""}`, href = dom_encodeURI(`${protocol}/${host}${pathname}`);
    return {
      protocol,
      scope,
      pkg,
      version,
      pathname,
      host,
      href
    };
  };
  var resolveAsUrl = (path, base) => {
    if (!isString(path)) {
      return path;
    }
    path = pathToPosixPath(path);
    let base_url = base;
    if (isString(base)) {
      const base_scheme = getUriScheme(base);
      if (forbiddenBaseUriSchemes.includes(base_scheme)) {
        throw new Error(0 /* ERROR */ ? "the following base scheme (url-protocol) is not supported: " + base_scheme : "");
      }
      base_url = resolveAsUrl(base);
    }
    const path_scheme = getUriScheme(path), path_is_package = packageUriSchemes.includes(path_scheme);
    if (path_scheme === "local") {
      return new URL("file://" + dom_encodeURI(path));
    } else if (path_is_package) {
      return new URL(parsePackageUrl(path).href);
    } else if (path_scheme === "relative") {
      const base_protocol = base_url ? base_url.protocol : void 0, base_is_package = packageUriProtocols.includes(base_protocol);
      if (!base_is_package) {
        return new URL(dom_encodeURI(path), base_url);
      }
      const { protocol, host, pathname } = parsePackageUrl(base_url), full_pathname = new URL(path, "x:" + pathname).pathname, href = `${protocol}/${host}${full_pathname}`;
      path = href;
    }
    return new URL(path);
  };
  var trimStartSlashes = (str) => {
    return str.replace(leading_slashes_regex, "");
  };
  var trimEndSlashes = (str) => {
    return str.replace(trailing_slashes_regex, "");
  };
  var trimSlashes = (str) => {
    return trimEndSlashes(trimStartSlashes(str));
  };
  var ensureStartSlash = (str) => {
    return string_starts_with(str, sep) ? str : sep + str;
  };
  var ensureStartDotSlash = (str) => {
    return string_starts_with(str, dotslash) ? str : string_starts_with(str, sep) ? "." + str : dotslash + str;
  };
  var ensureEndSlash = (str) => {
    return string_ends_with(str, sep) ? str : str + sep;
  };
  var trimStartDotSlashes = (str) => {
    return str.replace(leading_slashes_and_dot_slashes_regex, "");
  };
  var trimEndDotSlashes = (str) => {
    const reversed_str = [...str].toReversed().join(""), trimmed_reversed_str = reversed_str.replace(reversed_trailing_slashes_and_dot_slashes_regex, "");
    return trimmed_reversed_str === "." ? "" : [...trimmed_reversed_str].toReversed().join("");
  };
  var trimDotSlashes = (str) => {
    return trimEndDotSlashes(trimStartDotSlashes(str));
  };
  var joinSlash = (first_segment = "", ...segments) => {
    return segments.map(trimDotSlashes).reduce(
      (output, subpath) => (output === "" ? "" : ensureEndSlash(output)) + subpath,
      first_segment
    );
  };
  var normalizePosixPath = (path, config = {}) => {
    const { keepRelative = true } = isObject(config) ? config : {}, segments = path.split(sep), last_segment = segments.at(-1), output_segments = [".."], prepend_relative_dotslash_to_output_segments = keepRelative && segments[0] === ".", ends_with_dir_navigator_without_a_trailing_slash = segments.length >= 2 && (last_segment === "." || last_segment === "..");
    if (ends_with_dir_navigator_without_a_trailing_slash) {
      segments.push("");
    }
    for (const segment of segments) {
      if (segment === "..") {
        if (output_segments.at(-1) !== "..") {
          output_segments.pop();
        } else {
          output_segments.push(segment);
        }
      } else if (segment !== ".") {
        output_segments.push(segment);
      }
    }
    output_segments.shift();
    if (prepend_relative_dotslash_to_output_segments && output_segments[0] !== "..") {
      output_segments.unshift(".");
    }
    return output_segments.join(sep);
  };
  var normalizePath = (path, config) => {
    return normalizePosixPath(pathToPosixPath(path), config);
  };
  var pathToPosixPath = (path) => path.replaceAll(windows_directory_slash_regex, sep);
  var pathsToCliArg = (separator, paths) => {
    return quote(pathToPosixPath(paths.join(separator)));
  };
  var commonNormalizedPosixPath = (paths) => {
    const common_prefix = commonPrefix(paths), common_prefix_length = common_prefix.length;
    for (const path of paths) {
      const remaining_substring = path.slice(common_prefix_length);
      if (!string_starts_with(remaining_substring, sep)) {
        const common_dir_prefix_length = common_prefix.lastIndexOf(sep) + 1, common_dir_prefix = common_prefix.slice(0, common_dir_prefix_length);
        return common_dir_prefix;
      }
    }
    return common_prefix;
  };
  var commonPath = (paths) => {
    return commonNormalizedPosixPath(paths.map(normalizePath));
  };
  var commonPathTransform = (paths, map_fn) => {
    const normal_paths = paths.map(normalizePath), common_dir = commonNormalizedPosixPath(normal_paths), common_dir_length = common_dir.length, path_infos = array_from(normal_paths, (normal_path) => {
      return [common_dir, normal_path.slice(common_dir_length)];
    });
    return path_infos.map(map_fn);
  };
  var commonPathReplace = (paths, new_common_dir) => {
    new_common_dir = ensureEndSlash(new_common_dir);
    return commonPathTransform(paths, ([common_dir, subpath]) => {
      subpath = string_starts_with(subpath, dotslash) ? subpath.slice(2) : subpath;
      return new_common_dir + subpath;
    });
  };
  var parseNormalizedPosixFilename = (file_path) => {
    return trimStartSlashes(filename_regex.exec(file_path)?.[0] ?? "");
  };
  var parseBasenameAndExtname_FromFilename = (filename) => {
    const { basename = "", ext = "" } = basename_and_extname_regex.exec(filename)?.groups ?? {};
    return [basename, ext];
  };
  var parseFilepathInfo = (file_path) => {
    const path = normalizePath(file_path), filename = parseNormalizedPosixFilename(path), filename_length = filename.length, dirpath = filename_length > 0 ? path.slice(0, -filename_length) : path, dirname = parseNormalizedPosixFilename(dirpath.slice(0, -1)), [basename, extname] = parseBasenameAndExtname_FromFilename(filename);
    return { path, dirpath, dirname, filename, basename, extname };
  };
  var relativePath = (from_path, to_path) => {
    const [
      [common_dir, from_subpath],
      [, to_subpath]
    ] = commonPathTransform([from_path, to_path], (common_dir_and_subpath) => common_dir_and_subpath);
    if (common_dir === "") {
      throw new Error(0 /* ERROR */ ? `there is no common directory between the two provided paths:
	"${from_path}" and
	"to_path"` : "");
    }
    const upwards_traversal = Array(from_subpath.split(sep).length).fill("..");
    upwards_traversal[0] = ".";
    return normalizePosixPath(upwards_traversal.join(sep) + sep + to_subpath);
  };
  var joinPosixPaths = (...segments) => {
    segments = segments.map((segment) => {
      return segment === "." ? dotslash : segment === ".." ? dotdotslash : segment;
    });
    const concatenatible_segments = segments.reduce((concatenatible_full_path, segment) => {
      const prev_segment = concatenatible_full_path.pop(), prev_segment_is_dir = string_ends_with(prev_segment, sep), prev_segment_as_dir = prev_segment_is_dir ? prev_segment : prev_segment + sep;
      if (!prev_segment_is_dir) {
        const segment_is_rel_to_dir = string_starts_with(segment, dotslash), segment_is_rel_to_parent_dir = string_starts_with(segment, dotdotslash);
        if (segment_is_rel_to_dir) {
          segment = "." + segment;
        } else if (segment_is_rel_to_parent_dir) {
          segment = dotdotslash + segment;
        }
      }
      concatenatible_full_path.push(prev_segment_as_dir, segment);
      return concatenatible_full_path;
    }, [sep]);
    concatenatible_segments.shift();
    return normalizePosixPath(concatenatible_segments.join(""));
  };
  var joinPaths = (...segments) => {
    return joinPosixPaths(...segments.map(pathToPosixPath));
  };
  var resolvePosixPathFactory = (absolute_current_dir, absolute_segment_test_fn = isAbsolutePath) => {
    const getCwdPath = isString(absolute_current_dir) ? () => absolute_current_dir : absolute_current_dir;
    return (...segments) => {
      const last_abs_segment_idx = segments.findLastIndex(absolute_segment_test_fn);
      if (last_abs_segment_idx >= 0) {
        segments = segments.slice(last_abs_segment_idx);
      } else {
        segments.unshift(ensureEndSlash(getCwdPath()));
      }
      return joinPosixPaths(...segments);
    };
  };
  var resolvePathFactory = (absolute_current_dir, absolute_segment_test_fn = isAbsolutePath) => {
    if (isString(absolute_current_dir)) {
      absolute_current_dir = pathToPosixPath(absolute_current_dir);
    }
    const getCwdPath = isString(absolute_current_dir) ? () => absolute_current_dir : () => pathToPosixPath(absolute_current_dir()), posix_path_resolver = resolvePosixPathFactory(getCwdPath, absolute_segment_test_fn);
    return (...segments) => posix_path_resolver(...segments.map(pathToPosixPath));
  };
  var glob_pattern_to_regex_escape_control_chars = /[\.\+\^\$\{\}\(\)\|\[\]\\]/g;
  var glob_starstar_wildcard_token = "<<<StarStarWildcard>>>";
  var globPatternToRegex = (glob_pattern) => {
    const posix_pattern = pathToPosixPath(glob_pattern), regex_str = posix_pattern.replace(glob_pattern_to_regex_escape_control_chars, "\\$&").replace(/\*\*\/?/g, glob_starstar_wildcard_token).replace(/\*/g, "[^/]*").replace(/\?/g, ".").replace(/\[!(.*)\]/g, "[^$1]").replace(/\[(.*)\]/g, "[$1]").replace(/\{([^,}]+),([^}]+)\}/g, "($1|$2)").replace(glob_starstar_wildcard_token, ".*");
    return new RegExp("^" + regex_str + "$");
  };

  // src/timeman.ts
  var parseTimeFn = (time_fn) => {
    return time_fn === "perf" ? performance_now : time_fn === "date" ? date_now : time_fn;
  };
  var timeIt = (fn, ...args) => {
    const t1 = performance_now();
    fn(...args);
    return performance_now() - t1;
  };
  var asyncTimeIt = async (fn, ...args) => {
    const t1 = performance_now();
    await fn(...args);
    return performance_now() - t1;
  };
  var Stopwatch = class {
    /** the stack in which we push timestamps. */
    stack = [];
    /** a function that returns the current time */
    time;
    constructor(get_time_fn = "perf") {
      this.time = parseTimeFn(get_time_fn);
    }
    /** get the current time. */
    getTime() {
      return this.time();
    }
    /** push the current time into the stack, and get the value of the current time returned. */
    push() {
      const current_time = this.time();
      this.stack.push(current_time);
      return current_time;
    }
    /** push the current time into the stack, and get the time elapsed since the last push.
     * if this is the first push, then the returned value will be `undefined`.
    */
    pushDelta() {
      const current_time = this.time(), prev_time = this.seek();
      this.stack.push(current_time);
      return prev_time === void 0 ? prev_time : current_time - prev_time;
    }
    /** pop the top most time from the time stack.
     * if the time stack is empty, then an `undefined` will be returned.
    */
    pop() {
      return this.stack.pop();
    }
    /** get the time elapsed since the most recent push into the time stack, and also pop.
     * 
     * @throws `Error` this function will throw an error if the time stack was already empty.
     *   this is intentional, since it would hint that you are using this method non-deterministically, and thus incorrectly.
    */
    popDelta() {
      const current_time = this.time(), prev_time = this.pop();
      if (prev_time === void 0) {
        throw new Error(0 /* ERROR */ ? "there was nothing in the time stack to pop" : "");
      }
      return current_time - prev_time;
    }
    /** preview the top most time in the stack without popping.
     * if the time stack is empty, then an `undefined` will be returned.
    */
    seek() {
      return this.stack.at(-1);
    }
    /** preview the time elapsed since the most recent push into the time stack, without popping.
     * if there is nothing in the time stack, then an `undefined` will be returned.
    */
    seekDelta() {
      const current_time = this.time(), prev_time = this.seek();
      return prev_time === void 0 ? prev_time : current_time - prev_time;
    }
  };
  var defaultStopwatch = /* @__PURE__ */ new Stopwatch("perf");

  // src/typedefs.ts
  var isUnitInterval = (value) => value >= 0 && value <= 1 ? true : false;
  var isUByte = (value) => value >= 0 && value <= 255 && value === (value | 0) ? true : false;
  var isDegrees = (value) => value >= 0 && value <= 360 ? true : false;
  var isRadians = (value) => value >= 0 && value <= Math.PI ? true : false;
})();
