/* xBloom Bluetooth, browser side. Sources under research/fetched/ble/: brazzi (captures and
   a decompiled app, wins ties), mn (docs), jan (encoder and client), lui35 (connect shape).
   It loads and stores recipes. It cannot build a brew commit, start, cancel, or a grinder
   start. */
(function () {
  "use strict";

  var XBLE = {};

  // lui35 xbloom.ts, brazzi PROTOCOL.md "GATT". Write without response only.
  XBLE.SERVICE = "0000e0ff-3c17-d293-8e48-14fe2e4da212";
  XBLE.WRITE = "0000ffe1-0000-1000-8000-00805f9b34fb";
  XBLE.NOTIFY = "0000ffe2-0000-1000-8000-00805f9b34fb";

  // Never buildable. Low byte: commit 0x42, start 0x46, cancel 0x47. That also catches 8006
  // grinder-in and 8007 brewer-in; over-banning costs us nothing here.
  // Full id: brewer start 4506, start-and-quit 8017, tea make 4512, brewer restart 8021,
  // recipe restart 40524, easy-mode begin 8111, grinder start 3500, grinder stop 3505.
  // 40525 is inbound only.
  var BANNED_LOW = [0x42, 0x46, 0x47];
  var BANNED_CMD = [0x119a, 0x1f51, 0x11a0, 0x1f55, 0x9e4c, 0x1faf, 0x0dac, 0x0db1];
  // Mask first: the wire carries 16 bits, so 0x119A and 0x1119A are one command.
  function banned(cmd) {
    cmd = cmd & 0xffff;
    return BANNED_LOW.indexOf(cmd & 0xff) >= 0 || BANNED_CMD.indexOf(cmd) >= 0;
  }

  // CRC-16/KERMIT, poly 0x8408, init 0, no final XOR. brazzi xbloom.py crc16().
  XBLE.crc16 = function (bytes) {
    var crc = 0, i, b;
    for (i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (b = 0; b < 8; b++) crc = crc & 1 ? (crc >>> 1) ^ 0x8408 : crc >>> 1;
    }
    return crc & 0xffff;
  };

  XBLE.u32 = function (n) {
    return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
  };

  XBLE.f32 = function (x) {
    var b = new Uint8Array(4);
    new DataView(b.buffer).setFloat32(0, x, true);
    return [b[0], b[1], b[2], b[3]];
  };

  XBLE.hex = function (bytes) {
    var s = "", i;
    for (i = 0; i < bytes.length; i++) s += (bytes[i] < 16 ? "0" : "") + bytes[i].toString(16);
    return s.toUpperCase();
  };

  // 58 01 TYPE | CMD u16 LE | LEN u32 LE | 01 | DATA | CRC u16 LE. LEN is the whole frame.
  XBLE.frame = function (cmd, data, type) {
    if (banned(cmd)) throw new Error("This library cannot send that command.");
    cmd = cmd & 0xffff;
    data = data || [];
    var len = 12 + data.length, out = new Uint8Array(len), i;
    out[0] = 0x58;
    out[1] = 0x01;
    out[2] = type === undefined ? 1 : type;
    out[3] = cmd & 0xff;
    out[4] = (cmd >>> 8) & 0xff;
    out[5] = len & 0xff;
    out[6] = (len >>> 8) & 0xff;
    out[7] = (len >>> 16) & 0xff;
    out[8] = (len >>> 24) & 0xff;
    out[9] = 0x01;
    for (i = 0; i < data.length; i++) out[10 + i] = data[i] & 0xff;
    var crc = XBLE.crc16(out.subarray(0, len - 2));
    out[len - 2] = crc & 0xff;
    out[len - 1] = (crc >>> 8) & 0xff;
    return out;
  };

  var PATTERN = { centered: 0, center: 0, circular: 1, ring: 1, spiral: 2 };

  function isInt(n, lo, hi) {
    return typeof n === "number" && isFinite(n) && n === Math.round(n) && n >= lo && n <= hi;
  }

  XBLE.encodeRecipe = function (r) {
    r = r || {};
    if (!isInt(r.dose_g, 1, 18)) throw new Error("Dose must be a whole number of grams, 1 to 18, to send.");
    if (!isInt(r.grind, 1, 80)) throw new Error("Grind must be 1 to 80 to send.");
    var pours = r.pours;
    if (!Array.isArray(pours) || !pours.length)
      throw new Error("A recipe needs at least one pour to send.");

    var rpm = r.rpm === null || r.rpm === undefined ? 0 : r.rpm;
    if (!(rpm === 0 || isInt(rpm, 60, 120))) throw new Error("RPM must be 60 to 120 to send.");
    var flow = Math.round((r.flow_ml_s === undefined ? 3 : r.flow_ml_s) * 10);
    if (!isInt(flow, 30, 35)) throw new Error("Flow must be 3.0 to 3.5 ml/s to send.");

    var body = [], total = 0, i, p, t, pat, vib, ml;
    for (i = 0; i < pours.length; i++) {
      p = pours[i];
      if (!p || typeof p !== "object") throw new Error("A pour is missing. Rebuild the recipe to send.");
      t = p.temp_c === undefined ? r.temp_c : p.temp_c;
      if (t === "RT") throw new Error("Room-temperature water has no code in the protocol. Set a temperature to send.");
      if (t === "BP") t = 98; // brazzi encode_recipe docstring: the app sends 98 for BP.
      if (!isInt(t, 40, 98)) throw new Error("Temperature must be 40 to 98 °C to send.");
      pat = PATTERN[p.pattern === undefined ? r.pattern : p.pattern];
      if (pat === undefined) throw new Error("Pattern must be centered, circular or spiral to send.");
      ml = p.ml;
      // Pause 128 and up stops reading as a negated count. brazzi caps at 59, mn and jan
      // allow 255. We cap at 127.
      if (!isInt(ml, 1, 255) || !isInt(p.pause_s === undefined ? 0 : p.pause_s, 0, 127))
        throw new Error("Each pour must be 1 to 255 ml with a pause of 0 to 127 s to send.");
      total += ml;
      vib = (p.shake_before ? 1 : 0) | (p.shake_after ? 2 : 0);
      while (ml > 127) { body.push(127, t, pat, vib); ml -= 127; }
      body.push(ml, t, pat, vib,
        (256 - (p.pause_s || 0)) & 0xff, 0x00, i === 0 ? rpm : 0, flow);
    }

    var ratio = Math.round((total / r.dose_g) * 10);
    if (ratio > 255) throw new Error("Ratio 1:" + (ratio / 10).toFixed(1) + " is past what the machine accepts (1:25.5).");
    if (body.length > 255) throw new Error("Too many pours to send.");
    return new Uint8Array([body.length].concat(body, [r.grind, ratio]));
  };

  function step(o) {
    o.type = o.type || 1;
    o.expectAck = true;
    o.frame = XBLE.frame(o.cmd, o.data, o.type);
    return o;
  }

  XBLE.loadSequence = function (r) {
    var blob = XBLE.encodeRecipe(r);
    // brazzi CUP_TYPE_RANGES: the Omni dripper is 110/90, everything else 200/80.
    var cup = r.cup === "omni" ? [110, 90] : [200, 80];
    return [
      step({ cmd: 0x1fa4, data: XBLE.u32(185).concat(XBLE.u32(1)), label: "Session", waitMs: 500 }),
      step({ cmd: 0x1f56, data: [], label: "Home", waitMs: 2000 }),
      step({ cmd: 0x1fa6, data: XBLE.u32(0).concat(XBLE.u32(0), XBLE.u32(r.dose_g)), label: "Dose", waitMs: 400 }),
      step({ cmd: 0x1fa8, data: XBLE.f32(cup[0]).concat(XBLE.f32(cup[1])), label: "Cup", waitMs: 400 }),
      step({ cmd: 0x1f41, data: blob, label: "Recipe", waitMs: 400, expectState: 0x1f })
    ];
  };

  // A slot write leaves the machine in Pro mode until the last frame lands.
  var PRO_WARNING = " The machine may still be in Pro mode.";

  // mn easy-mode-slots.md: all three slots or the machine hangs at RETRY, and Pro mode only.
  XBLE.slotSequence = function (recipes) {
    if (!Array.isArray(recipes) || recipes.length !== 3)
      throw new Error("Auto Mode needs exactly three recipes, A, B and C.");
    var blobs = recipes.map(XBLE.encodeRecipe); // all three encode before any frame is built
    var out = [
      step({ cmd: 0x1fa4, data: XBLE.u32(185).concat(XBLE.u32(1)), label: "Session", waitMs: 500 }),
      step({ cmd: 0x2cf7, type: 2, data: [0, 0, 0, 0], label: "Pro mode", waitMs: 1000, expectState: 0x01, after: PRO_WARNING })
    ];
    blobs.forEach(function (blob, i) {
      // flags 0x12: bit 0x10 scale on, low nibble 0x02 grinder on (brazzi slot_flags).
      out.push(step({
        cmd: 0x2cf6, type: 2, data: [i, 0x12].concat(Array.from(blob)),
        label: "Slot " + "ABC"[i], waitMs: 1000,
        expectState: i === 2 ? 0x25 : undefined, after: i === 2 ? PRO_WARNING : undefined
      }));
    });
    out.push(step({ cmd: 0x2cf7, type: 2, data: [0x91, 0x32, 0x78, 0x56], label: "Auto mode", waitMs: 1000 }));
    return out;
  };

  XBLE.parse = function (value) {
    var b = value instanceof Uint8Array ? value
      : value && value.buffer ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
        : new Uint8Array(value || []);
    var out = [], o = 0, len;
    while (o + 12 <= b.length && b[o] === 0x58) {
      len = b[o + 5] | (b[o + 6] << 8) | (b[o + 7] << 16) | (b[o + 8] << 24);
      if (len < 12 || o + len > b.length) break;
      out.push({
        cmd: b[o + 3] | (b[o + 4] << 8),
        state: b[o + 3] === 0x57 && b[o + 9] === 0xc1 ? b[o + 10] : null
      });
      o += len;
    }
    return out;
  };

  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  XBLE.send = async function (sequence, hooks, opts) {
    hooks = hooks || {};
    var timeoutMs = opts && opts.timeoutMs !== undefined ? opts.timeoutMs : 15000;
    var acks = {}, states = {}, server = null, off = null;

    // One well-formed frame per step. Two frames concatenated into one value would hide a
    // commit behind a benign first one, so the declared length must be the whole array.
    sequence.forEach(function (s) {
      var f = s && s.frame;
      if (!f || f.length < 12 || f[0] !== 0x58 ||
        (f[5] | (f[6] << 8) | (f[7] << 16) | (f[8] << 24)) !== f.length ||
        banned(s.cmd) || banned(f[3] | (f[4] << 8)))
        throw new Error("This library cannot send that command.");
    });

    async function untilState(s, n) {
      var deadline = Date.now() + timeoutMs;
      while (!states[s.expectState]) {
        if (Date.now() > deadline)
          throw new Error("The machine stopped answering at step " + n + " (" + s.label
            + "). Check it is awake and in range, then retry." + (s.after || ""));
        await wait(25);
      }
    }

    try {
      if (!navigator.bluetooth)
        throw new Error("This browser cannot talk to the machine over Bluetooth. "
          + "Use Chrome on a Mac or Android phone.");
      if (hooks.onStatus) hooks.onStatus("Choose your xBloom in the picker");
      var device;
      try {
        device = await navigator.bluetooth.requestDevice({ filters: [{ services: [XBLE.SERVICE] }] });
      } catch (e) {
        throw e && e.name === "NotFoundError" ? new Error("You closed the picker. Nothing was sent.") : e;
      }
      server = device.gatt;
      if (!server) throw new Error("This device has no Bluetooth service.");
      var svc = await (await server.connect()).getPrimaryService(XBLE.SERVICE);
      var write = await svc.getCharacteristic(XBLE.WRITE);
      var notify = await svc.getCharacteristic(XBLE.NOTIFY);
      // Write-with-response is rejected with CBATTError 14, so there is no fallback.
      if (!write.writeValueWithoutResponse)
        throw new Error("This browser cannot write to the machine.");
      var onValue = function (e) {
        XBLE.parse(e.target.value).forEach(function (n) {
          acks[n.cmd & 0xff] = true;
          if (n.state !== null) states[n.state] = true;
        });
      };
      notify.addEventListener("characteristicvaluechanged", onValue);
      off = function () { notify.removeEventListener("characteristicvaluechanged", onValue); };
      await notify.startNotifications();
      for (var i = 0; i < sequence.length; i++) {
        var s = sequence[i];
        if (hooks.onStep) hooks.onStep(i + 1, sequence.length, s.label);
        if (hooks.onFrame) hooks.onFrame(XBLE.hex(s.frame));
        delete acks[s.cmd & 0xff];
        if (s.expectState !== undefined) delete states[s.expectState];
        await write.writeValueWithoutResponse(s.frame);
        // Pace the writes, do not round-trip acks (jan client.py, mn load-sequence.md).
        // Whether every command echoes is unverified, so acks are advisory.
        await wait(s.waitMs);
        if (hooks.onAck) hooks.onAck(i + 1, !!acks[s.cmd & 0xff]);
        if (s.expectState !== undefined) await untilState(s, i + 1);
      }
    } finally {
      if (off) off();
      if (server) server.disconnect();
    }
  };

  if (typeof window !== "undefined") window.XBLE = XBLE;
  if (typeof module !== "undefined") module.exports = XBLE;
})();
