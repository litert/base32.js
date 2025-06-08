const DEC_MAPPING_TABLE_OFFSET: u32 = 0x00;
const ENC_MAPPING_TABLE_OFFSET: u32 = 0x80;
const INPUT_OFFSET: u32 = 0x100;

/**
 * Initial the mapping table for base62x encoding.
 *
 * @param char 
 */
export function initTable(): void {

  for (let i: u32 = 0; i < INPUT_OFFSET; i++) {
    store<u8>(DEC_MAPPING_TABLE_OFFSET + i, 0xFF); // Invalid character
  }

  for (let c: u8 = 65, i: u8 = 0; c < 91; c++, i++) { // A-Z
    store<u8>(ENC_MAPPING_TABLE_OFFSET + i, c);
    store<u8>(DEC_MAPPING_TABLE_OFFSET + c, i);
    store<u8>(DEC_MAPPING_TABLE_OFFSET + c + 32, i); // ignore case sensitivity
  }

  for (let c: u8 = 50, i: u8 = 26; c < 56; c++, i++) { // 2-7
    store<u8>(ENC_MAPPING_TABLE_OFFSET + i, c);
    store<u8>(DEC_MAPPING_TABLE_OFFSET + c, i);
  }
}

@inline.always() function readInput(offset: u32): u8 {
  return load<u8>(INPUT_OFFSET + offset);
}

@inline.always() function encode5Bit(offset: u32, bits: u8): u32 {
  store<u8>(offset++, load<u8>(ENC_MAPPING_TABLE_OFFSET + bits));
  return offset;
}

@inline.always() function decode5Bit(char: u8): u8 {
  return load<u8>(DEC_MAPPING_TABLE_OFFSET + char);
}

export function encode(len: u32): u32 {

  let outOffset: u32 = INPUT_OFFSET + len;
  let t0: u8 = 0;
  let t1: u8 = 0;

  for (let i: u32 = 0; i < len; i += 5) {

    t0 = readInput(i);
    switch (len - i) {
      case 1: {

        // 0     1      2     3      4      5     6      7
        // 11111 111|00 00000 0|0000 0000|0 00000 00|000 00000

        encode5Bit(outOffset++, t0 >> 3);
        encode5Bit(outOffset++, (t0 & 0x07) << 2);

        store<u32>(outOffset, 0x3d3d3d3d); // Padding
        outOffset += 4;
        store<u16>(outOffset, 0x3d3d); // Padding
        outOffset += 2;

        break;
      }
      case 2: {

        // 0     1      2     3      4      5     6      7
        // 11111 111|11 11111 1|0000 0000|0 00000 00|000 00000

        t1 = readInput(i + 1);

        outOffset = encode5Bit(outOffset, t0 >> 3);
        outOffset = encode5Bit(outOffset, ((t0 & 0x07) << 2) | (t1 >> 6));
        outOffset = encode5Bit(outOffset, (t1 >> 1) & 0x1F);
        outOffset = encode5Bit(outOffset, (t1 & 0x01) << 4);

        store<u32>(outOffset, 0x3d3d3d3d); // Padding
        outOffset += 4;

        break;
      }
      case 3: {

        // 0     1      2     3      4      5     6      7
        // 11111 111|11 11111 1|1111 1111|0 00000 00|000 00000

        t1 = readInput(i + 1);

        outOffset = encode5Bit(outOffset, t0 >> 3);
        outOffset = encode5Bit(outOffset, ((t0 & 0x07) << 2) | (t1 >> 6));

        t0 = readInput(i + 2);

        outOffset = encode5Bit(outOffset, (t1 >> 1) & 0x1F);
        outOffset = encode5Bit(outOffset, ((t1 & 0x01) << 4) | (t0 >> 4));
        outOffset = encode5Bit(outOffset, (t0 & 0x0F) << 1);

        store<u32>(outOffset++, 0x3d); // Padding
        store<u32>(outOffset++, 0x3d); // Padding
        store<u32>(outOffset++, 0x3d); // Padding

        break;
      }
      case 4: {

        // 0     1      2     3      4      5     6      7
        // 11111 111|11 11111 1|1111 1111|1 11111 11|000 00000

        t1 = readInput(i + 1);

        outOffset = encode5Bit(outOffset, t0 >> 3);
        outOffset = encode5Bit(outOffset, ((t0 & 0x07) << 2) | (t1 >> 6));

        t0 = readInput(i + 2);

        outOffset = encode5Bit(outOffset, (t1 >> 1) & 0x1F);
        outOffset = encode5Bit(outOffset, ((t1 & 0x01) << 4) | (t0 >> 4));

        t1 = readInput(i + 3);

        outOffset = encode5Bit(outOffset, ((t0 & 0x0F) << 1) | (t1 >> 7));
        outOffset = encode5Bit(outOffset, (t1 >> 2) & 0x1F);
        outOffset = encode5Bit(outOffset, (t1 & 0x03) << 3);

        store<u32>(outOffset++, 0x3d); // Padding

        break;
      }
      default: { // >= 5

        // 0     1      2     3      4      5     6      7
        // 11111 111|11 11111 1|1111 1111|1 11111 11|111 11111

        t1 = readInput(i + 1);

        outOffset = encode5Bit(outOffset, t0 >> 3);
        outOffset = encode5Bit(outOffset, ((t0 & 0x07) << 2) | (t1 >> 6));

        t0 = readInput(i + 2);

        outOffset = encode5Bit(outOffset, (t1 >> 1) & 0x1F);
        outOffset = encode5Bit(outOffset, ((t1 & 0x01) << 4) | (t0 >> 4));

        t1 = readInput(i + 3);

        outOffset = encode5Bit(outOffset, ((t0 & 0x0F) << 1) | (t1 >> 7));

        t0 = readInput(i + 4);

        outOffset = encode5Bit(outOffset, (t1 >> 2) & 0x1F);
        outOffset = encode5Bit(outOffset, ((t1 & 0x03) << 3) | (t0 >> 5));
        outOffset = encode5Bit(outOffset, t0 & 0x1F);
        break;
      }
    }
  }

  return outOffset - INPUT_OFFSET - len;
}

export function decode(len: u32): i32 {

  let outOffset: u32 = INPUT_OFFSET + len;
  let t0: u8 = 0;
  let t1: u8 = 0;
  let t2: u8 = 0;

  for (let i: u32 = 0; i < len; i += 8) {

    t0 = decode5Bit(readInput(i));
    t1 = decode5Bit(readInput(i + 1));

    if (t0 == 0xFF || t1 == 0xFF) {
      return -1; // Invalid input
    }

    if (load<u8>(INPUT_OFFSET + i + 2) == 0x3d) { // 7 padding characters

      // 0     1      2     3      4      5     6      7
      // 11111 111|00 00000 0|0000 0000|0 00000 00|000 00000

      store<u8>(outOffset++, (t0 << 3) | (t1 >> 2));

      break;
    }

    if (load<u8>(INPUT_OFFSET + i + 4) == 0x3d) { // 4 padding characters

      // 0     1      2     3      4      5     6      7
      // 11111 111|11 11111 1|0000 0000|0 00000 00|000 00000

      store<u8>(outOffset++, (t0 << 3) | (t1 >> 2));

      t0 = decode5Bit(readInput(i + 2));
      t2 = decode5Bit(readInput(i + 3));

      if (t0 == 0xFF || t2 == 0xFF) {
        return -1; // Invalid input
      }

      store<u8>(outOffset++, ((t1 & 0x03) << 6) | (t0 << 1) | (t2 >> 4));
      break;
    }

    if (load<u8>(INPUT_OFFSET + i + 6) == 0x3d) { // 3 padding characters

      // 0     1      2     3      4      5     6      7
      // 11111 111|11 11111 1|1111 1111|0 00000 00|000 00000

      store<u8>(outOffset++, (t0 << 3) | (t1 >> 2));

      t0 = decode5Bit(readInput(i + 2));
      t2 = decode5Bit(readInput(i + 3));

      if (t0 == 0xFF || t2 == 0xFF) {
        return -1; // Invalid input
      }

      store<u8>(outOffset++, ((t1 & 0x03) << 6) | (t0 << 1) | (t2 >> 4));

      t0 = decode5Bit(readInput(i + 4));

      if (t0 == 0xFF) {
        return -1; // Invalid input
      }

      store<u8>(outOffset++, ((t2 & 0x0F) << 4) | (t0 >> 1));
      break;
    }

    if (load<u8>(INPUT_OFFSET + i + 7) == 0x3d) { // 1 padding characters

      // 0     1      2     3      4      5     6      7
      // 11111 111|11 11111 1|1111 1111|1 11111 11|000 00000

      store<u8>(outOffset++, (t0 << 3) | (t1 >> 2));

      t0 = decode5Bit(readInput(i + 2));
      t2 = decode5Bit(readInput(i + 3));

      if (t0 == 0xFF || t2 == 0xFF) {
        return -1; // Invalid input
      }

      store<u8>(outOffset++, ((t1 & 0x03) << 6) | (t0 << 1) | (t2 >> 4));

      t0 = decode5Bit(readInput(i + 4));

      if (t0 == 0xFF) {
        return -1; // Invalid input
      }

      store<u8>(outOffset++, ((t2 & 0x0F) << 4) | (t0 >> 1));

      t1 = decode5Bit(readInput(i + 5));
      t2 = decode5Bit(readInput(i + 6));

      if (t1 == 0xFF || t2 == 0xFF) {
        return -1; // Invalid input
      }

      store<u8>(outOffset++, ((t0 & 0x01) << 7) | (t1 << 2) | (t2 >> 3));
      break;
    }

    // 0     1      2     3      4      5     6      7
    // 11111 111|11 11111 1|1111 1111|1 11111 11|111 11111

    store<u8>(outOffset++, (t0 << 3) | (t1 >> 2));

    t0 = decode5Bit(readInput(i + 2));
    t2 = decode5Bit(readInput(i + 3));

    if (t0 == 0xFF || t2 == 0xFF) {
      return -1; // Invalid input
    }

    store<u8>(outOffset++, ((t1 & 0x03) << 6) | (t0 << 1) | (t2 >> 4));

    t0 = decode5Bit(readInput(i + 4));

    if (t0 == 0xFF) {
      return -1; // Invalid input
    }

    store<u8>(outOffset++, ((t2 & 0x0F) << 4) | (t0 >> 1));

    t1 = decode5Bit(readInput(i + 5));
    t2 = decode5Bit(readInput(i + 6));

    if (t1 == 0xFF || t2 == 0xFF) {
      return -1; // Invalid input
    }

    store<u8>(outOffset++, ((t0 & 0x01) << 7) | (t1 << 2) | (t2 >> 3));

    t0 = decode5Bit(readInput(i + 7));
    
    if (t0 == 0xFF) {
      return -1; // Invalid input
    }

    store<u8>(outOffset++, ((t2 & 0x07) << 5) | t0);
  }

  return outOffset - INPUT_OFFSET - len;
}

export function getReserverMemorySize(): u32 {
  return INPUT_OFFSET;
}
