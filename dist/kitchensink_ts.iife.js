"use strict";
(() => {
  // src/browser.ts
  var downloadBuffer = async (buf, file_name = "data.bin", mime_type = "application/octet-stream") => {
    const blob = new Blob([buf], { type: mime_type }), anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = file_name;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
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

  // src/eightpack-varint.ts
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
    start = start ?? 0;
    offset = offset ?? 0;
    if (length === void 0)
      return [start + offset, end === void 0 ? end : end + offset, length];
    end = end ?? length;
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
  var multipurpose_canvas;
  var multipurpose_ctx;
  var init_multipurpose_canvas = () => {
    multipurpose_canvas = document.createElement("canvas");
    multipurpose_ctx = multipurpose_canvas.getContext("2d");
  };
  var constructImageData = (img, crop_rect) => {
    const { width, height, x, y } = positiveRect({ x: 0, y: 0, width: Number(img.width), height: Number(img.height), ...crop_rect });
    if (!multipurpose_ctx)
      init_multipurpose_canvas();
    multipurpose_canvas.width = width;
    multipurpose_canvas.height = height;
    multipurpose_ctx.clearRect(0, 0, width, height);
    multipurpose_ctx.drawImage(img, -x, -y);
    return multipurpose_ctx.getImageData(0, 0, width, height);
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
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] *= arr[i] < 0 ? -1 : 1;
    return arr;
  };
  var neg = (arr, start = 0, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] *= -1;
    return arr;
  };
  var bcomp = (arr, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] = ~arr[i];
    return arr;
  };
  var band = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] &= value;
    return arr;
  };
  var bor = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] |= value;
    return arr;
  };
  var bxor = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] ^= value;
    return arr;
  };
  var blsh = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] <<= value;
    return arr;
  };
  var brsh = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] >>= value;
    return arr;
  };
  var bursh = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] >>>= value;
    return arr;
  };
  var add = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] += value;
    return arr;
  };
  var sub = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] -= value;
    return arr;
  };
  var mult = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] *= value;
    return arr;
  };
  var div = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] /= value;
    return arr;
  };
  var pow = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] **= value;
    return arr;
  };
  var rem = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] %= value;
    return arr;
  };
  var mod = (arr, value, start, end) => {
    start = start ?? 0;
    end = end ?? arr.length;
    for (let i = start; i < end; i++)
      arr[i] = (arr[i] % value + value) % value;
    return arr;
  };
})();
