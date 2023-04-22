"use strict";
(() => {
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
      data_str_parts.push(String.fromCharCode(...sub_buf));
    }
    return btoa(data_str_parts.join(""));
  };

  // src/numericmethods.ts
  var max_f = Number.MAX_VALUE;
  var min_f = -max_f;
  var pinf_f = Number.POSITIVE_INFINITY;
  var ninf_f = Number.NEGATIVE_INFINITY;
  var clamp = (value, min = min_f, max = max_f) => value < min ? min : value > max ? max : value;
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

  // src/collections.ts
  var Deque = class {
    constructor(length) {
      this.length = length;
      this.items = Array(length);
      this.back = length - 1;
    }
    items;
    front = 0;
    back;
    count = 0;
    [Symbol.iterator] = () => {
      const { at, count } = this;
      let i = 0;
      return {
        next: () => i < count ? { value: at(i++), done: false } : { value: void 0, done: true }
      };
    };
    pushBack(...items) {
      for (const item of items) {
        if (this.count === this.length)
          this.popFront();
        this.items[this.back] = item;
        this.back = modulo(this.back - 1, this.length);
        this.count++;
      }
    }
    pushFront(...items) {
      for (const item of items) {
        if (this.count === this.length)
          this.popBack();
        this.items[this.front] = item;
        this.front = modulo(this.front + 1, this.length);
        this.count++;
      }
    }
    getBack() {
      if (this.count === 0)
        return void 0;
      return this.items[modulo(this.back + 1, this.length)];
    }
    getFront() {
      if (this.count === 0)
        return void 0;
      return this.items[modulo(this.front - 1, this.length)];
    }
    popBack() {
      if (this.count === 0)
        return void 0;
      this.back = modulo(this.back + 1, this.length);
      const item = this.items[this.back];
      this.items[this.back] = void 0;
      this.count--;
      return item;
    }
    popFront() {
      if (this.count === 0)
        return void 0;
      this.front = modulo(this.front - 1, this.length);
      const item = this.items[this.front];
      this.items[this.front] = void 0;
      this.count--;
      return item;
    }
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
    reverse() {
      const center = this.count / 2 | 0, { length, front, back, items } = this;
      for (let i = 1; i <= center; i++) {
        const b = modulo(back + i, length), f = modulo(front - i, length), temp = items[b];
        items[b] = items[f];
        items[f] = temp;
      }
    }
    resolveIndex = (index) => modulo(this.back + index + 1, this.length);
    at = (index) => this.items[this.resolveIndex(index)];
    replace(index, item) {
      this.items[modulo(this.back + index + 1, this.count)] = item;
    }
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
    const outarr = new arrs[0].constructor(offsets.pop());
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
    if (Array.isArray(v))
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
      return Promise.resolve(new ImageData(img_src, width));
    } else if (ArrayBuffer.isView(img_src)) {
      return constructImageBitmapSource(new Uint8ClampedArray(img_src.buffer), width);
    } else if (img_src instanceof ArrayBuffer) {
      return constructImageBitmapSource(new Uint8ClampedArray(img_src), width);
    } else if (img_src instanceof Array) {
      return constructImageBitmapSource(Uint8ClampedArray.from(img_src), width);
    }
    return Promise.resolve(img_src);
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
    console.assert(Number.isInteger(channels));
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
    console.assert(Number.isInteger(channels));
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
    const { sep, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix } = { ...default_HexStringRepr, ...options }, num_arr = arr.buffer ? Array.from(arr) : arr, str = num_arr.map((v) => {
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
