/* xBloom cloud push. Plain script, no deps, global XCLOUD.
 Body = Base64( RSA-1024 PKCS#1 v1.5 ( compact JSON ) ), 117-byte chunks -> 128-byte blocks. */
(function (g) {
 "use strict";
 var BASE = "https://client-api.xbloom.com/";
 var SKEY = "testskey";
 var PUBKEY =
  "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC4LF40GZ72SdhMyl765K/i4nY5CPcHz2Q1IKWKZ9S7" +
  "9xmK7G8pUhbVf4EZLvnNF1+9IvOFQUKV5Z7ZNNviqSpnql9tAT+8+J/He0R7pcirvVSxgdr2i9V/C/gm" +
  "qAEZ5qVTzRnd3uWdFoKzPdEBxP0IporJ1VBbCv90yBSOhVxO+QIDAQAB";
 var E_TEMP = "The app needs a number for temperature. RT and BP cannot be sent.";
 var E_POUR = "The recipe has no pours to send.";
 var E_DOSE = "Dose must be between 1 and 31 g.";
 var E_GRIND = "Grind must be a number.";
 var E_SUM = "Pours do not add up to the total.";
 var E_AUTH = "Connect the xBloom app first.";
 var E_KEY = "Your key has expired. Capture it again.";
 var E_BAD = "The app did not accept the recipe.";
 var E_NET = "The app did not answer.";
 var E_DER = "The key is not readable.";
 // Pattern codes follow C: centered 1, circular 2, spiral 3. Unknown names -> spiral.
 var PAT = { centered: 1, center: 1, circular: 2, ring: 2, spiral: 3 };
 var WHY = ["msg", "message", "errorMsg", "errorMessage", "error", "reason", "tips", "info"];

 function own(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
 function die(m) { throw new Error(m); }
 function bin(s) {
  s = atob(s);
  var a = new Uint8Array(s.length), i;
  for (i = 0; i < s.length; i++) a[i] = s.charCodeAt(i);
  return a;
 }
 function b64(a) {
  var s = "", i;
  for (i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s);
 }
 function big(a) {
  var h = "", i;
  for (i = 0; i < a.length; i++) h += a[i].toString(16).padStart(2, "0");
  return h ? BigInt("0x" + h) : 0n;
 }
 function modpow(b, e, m) {
  var r = 1n;
  b %= m;
  while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; }
  return r;
 }
 // One DER element at pos: {tag, start, next}. Long-form length supported.
 function tlv(b, pos, tag) {
  var t = b[pos++], len = b[pos++], n, i;
  if (t !== tag || len === undefined) die(E_DER);
  if (len & 0x80) {
   n = len & 0x7f;
   if (n < 1 || n > 4) die(E_DER);
   for (len = 0, i = 0; i < n; i++) {
    if (b[pos] === undefined) die(E_DER);
    len = len * 256 + b[pos++];
   }
  }
  if (pos + len > b.length) die(E_DER);
  return { start: pos, next: pos + len };
 }
 function parseKey(spki) {
  if (typeof spki !== "string" || !spki) die(E_DER);
  var b;
  try { b = bin(spki); } catch (e) { die(E_DER); }
  var seq = tlv(b, 0, 0x30);
  var alg = tlv(b, seq.start, 0x30);
  var bits = tlv(b, alg.next, 0x03);
  if (b[bits.start] !== 0) die(E_DER);
  var inner = tlv(b, bits.start + 1, 0x30);
  var ni = tlv(b, inner.start, 0x02);
  var ei = tlv(b, ni.next, 0x02);
  var nb = b.subarray(ni.start, ni.next);
  if (nb[0] === 0) nb = nb.subarray(1);   // DER sign byte, not key length
  return { n: big(nb), e: big(b.subarray(ei.start, ei.next)), k: nb.length };
 }
 function nonzero(len) {
  var a = new Uint8Array(len), one = new Uint8Array(1), i;
  g.crypto.getRandomValues(a);
  for (i = 0; i < len; i++) while (a[i] === 0) { g.crypto.getRandomValues(one); a[i] = one[0]; }
  return a;
 }
 function rsaWrap(text, spki) {
  var key = parseKey(spki || PUBKEY), k = key.k;
  var msg = new TextEncoder().encode(String(text));
  var blocks = Math.max(1, Math.ceil(msg.length / 117));
  var out = new Uint8Array(blocks * k), i, j, ps, em, hex, chunk;
  for (i = 0; i < blocks; i++) {
   chunk = msg.subarray(i * 117, i * 117 + 117);
   ps = k - 3 - chunk.length;
   if (ps < 8) die("The key is too small.");
   em = new Uint8Array(k);
   em[1] = 2;
   em.set(nonzero(ps), 2);
   em.set(chunk, 3 + ps);
   hex = modpow(big(em), key.e, key.n).toString(16).padStart(k * 2, "0");
   for (j = 0; j < k; j++) out[i * k + j] = parseInt(hex.substr(j * 2, 2), 16);
  }
  return b64(out);
 }

 function num(v) { return typeof v === "number" && isFinite(v) ? v : null; }
 function rtbp(v) { var s = String(v).trim().toUpperCase(); return s === "RT" || s === "BP"; }
 function bool(v) { return v ? 1 : 2; }
 function pat(v) {
  if (v === 1 || v === 2 || v === 3) return v;
  var k = String(v).toLowerCase();
  return own(PAT, k) ? PAT[k] : 3;
 }

 function toRecipeVo(recipe, name, opts) {
  var r = recipe && typeof recipe === "object" ? recipe : {};
  var o = opts && typeof opts === "object" ? opts : {};
  if (rtbp(r.temp_c)) die(E_TEMP);
  var pours = Array.isArray(r.pours) ? r.pours : [];
  if (!pours.length) die(E_POUR);
  var dose = num(r.dose_g);
  if (dose === null || dose < 1 || dose > 31) die(E_DOSE);
  var grind = num(r.grind);
  if (grind === null || grind < 1) die(E_GRIND);
  var total = 0;
  var list = pours.map(function (raw, i) {
   var p = raw && typeof raw === "object" ? raw : {};
   if (rtbp(p.temp_c)) die(E_TEMP);
   var ml = num(p.ml);
   if (ml === null) die(E_POUR);
   total += ml;
   var t = num(p.temp_c);
   if (t === null) t = num(r.temp_c);
   if (t === null) die(E_TEMP);
   var f = num(p.flow_ml_s);
   if (f === null) f = num(r.flow_ml_s);
   return {
    theName: typeof p.label === "string" && p.label.trim() ? p.label.trim()
     : (i ? "Pour " + (i + 1) : "Bloom"),
    volume: ml, temperature: t, flowRate: f === null ? 3 : f,
    pattern: pat(p.pattern != null ? p.pattern : r.pattern),
    pausing: Math.round(num(p.pause_s) || 0),
    isEnableVibrationBefore: bool(p.shake_before != null ? p.shake_before : p.agitate_before),
    isEnableVibrationAfter: bool(p.shake_after != null ? p.shake_after : p.agitate_after)
   };
  });
  var given = num(r.total_ml);
  if (given !== null && Math.abs(total - given) > 0.5) die(E_SUM);
  // The page carries ratio at one decimal. Trust it when it matches the pours.
  var ratio = num(r.ratio);
  if (ratio === null || Math.abs(dose * ratio - total) > 1) ratio = Math.round(total / dose * 100) / 100;
  var cup = String(o.cup != null ? o.cup : r.cup).toLowerCase();
  var rpm = num(r.rpm);
  var nm = typeof name === "string" && name.trim() ? name.trim()
   : (typeof r.name === "string" && r.name.trim() ? r.name.trim() : "xBloom recipe");
  return {
   theName: nm.slice(0, 40).replace(/[\uD800-\uDBFF]$/, ""),
   dose: dose, grandWater: ratio, grinderSize: grind,
   rpm: rpm === null ? 120 : Math.round(rpm),
   cupType: cup === "xpod" ? 1 : cup === "other" ? 3 : 2,
   adaptedModel: 1, isEnableBypassWater: 2, isSetGrinderSize: 1,
   theColor: typeof o.color === "string" && o.color ? o.color : "#C9D5B8",
   theSubsetId: 0, bypassTemp: 85.0, bypassVolume: 5.0, subSetType: 2, appPlace: [4],
   createTimeStamp: Date.now(), isShortcuts: 2, pourList: list
  };
 }

 function ENVELOPE(auth) {
  var a = auth || {};
  return {
   interfaceVersion: 20240918, skey: SKEY, phoneType: "Android",
   memberId: a.memberId, clientType: 2, languageType: 1, token: a.token
  };
 }
 function buildBody(vo, auth) {
  var body = ENVELOPE(auth), k;
  for (k in vo) {
   if (!own(vo, k)) continue;
   if (k === "pourList") body.pourDataJSONStr = JSON.stringify(vo.pourList);
   else body[k] = vo[k];
  }
  return body;
 }

 function why(j) {
  for (var i = 0, v; i < WHY.length; i++) {
   v = j && j[WHY[i]];
   if (typeof v === "string" && v.trim()) return v;
  }
  return E_BAD;
 }
 function post(url, body, f) {
  var p;
  try {
   p = (f || g.fetch)(url, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: body
   });
  } catch (e) { return Promise.reject(new Error(E_NET)); }
  return Promise.resolve(p).catch(function () { die(E_NET); }).then(function (res) {
   if (res.status === 401 || res.status === 403) die(E_KEY);
   if (!res.ok) die("The app did not answer (HTTP " + res.status + ").");
   return res.json().catch(function () { die(E_NET); });
  });
 }

 function push(recipeVo, auth, opts) {
  var o = opts || {}, a = auth || {}, wrapped;
  if (!(typeof a.memberId === "number" && isFinite(a.memberId) && a.memberId > 0 &&
   Math.floor(a.memberId) === a.memberId) || typeof a.token !== "string" || !a.token.trim()) {
   return Promise.reject(new Error(E_AUTH));
  }
  try {
   wrapped = rsaWrap(JSON.stringify(buildBody(recipeVo, a)), o.pubkey || PUBKEY);
   if (o.quoted) wrapped = JSON.stringify(wrapped);
  } catch (e) { return Promise.reject(e); }
  return post((o.base || BASE) + "tuRecipeAdd.tuhtml", wrapped, o.fetch).then(function (j) {
   if (!j || j.result !== "success") die(why(j));
   if (j.tableId == null) die(E_BAD);
   return j;
  });
 }

 function read(tableId, opts) {
  var o = opts || {}, id = Number(tableId);
  if (!isFinite(id) || id <= 0) return Promise.reject(new Error(E_NET));
  var body = JSON.stringify({ tableId: Math.trunc(id), interfaceVersion: 19700101, skey: SKEY });
  return post((o.base || BASE) + "tRecipeDetail.thtml", body, o.fetch).then(function (j) {
   if (!j || j.result !== "success") die(why(j));
   if (!j.recipeVo || typeof j.recipeVo !== "object") die(E_NET);
   return j.recipeVo;
  });
 }

 function parseAuth(text) {
  if (typeof text !== "string") return null;
  var s = text.trim();
  if (!s) return null;
  var j = null, id, tk, i;
  try { j = JSON.parse(s); } catch (e) { j = null; }
  if (j && typeof j === "object") {
   if (Array.isArray(j)) return null;
   id = j.memberId != null ? j.memberId : (j.member && j.member.tableId);
   if (typeof id === "boolean") return null;
   id = Number(id);
   tk = typeof j.token === "string" ? j.token.trim() : null;
  } else {
   i = s.indexOf(":");
   if (i < 1) return null;
   id = Number(s.slice(0, i).trim());
   tk = s.slice(i + 1).trim();
  }
  if (!isFinite(id) || id <= 0 || Math.floor(id) !== id || !tk) return null;
  return { memberId: id, token: tk };
 }

 var XCLOUD = {
  BASE: BASE, SKEY: SKEY, PUBKEY: PUBKEY, ENVELOPE: ENVELOPE,
  parseKey: parseKey, rsaWrap: rsaWrap, toRecipeVo: toRecipeVo,
  buildBody: buildBody, push: push, read: read, parseAuth: parseAuth
 };
 g.XCLOUD = XCLOUD;
 if (typeof module !== "undefined") module.exports = XCLOUD;
})(typeof globalThis !== "undefined" ? globalThis : this);
