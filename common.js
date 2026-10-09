// 作成ページ・閲覧ページ共通の処理（祝日計算・年度・保存データの読み書き）
(() => {
  'use strict';

  // ================= 日付 =================
  const pad = n => String(n).padStart(2, '0');
  const keyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  const keyOfDate = dt => keyOf(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());

  // 4月始まりの年度（2026年4月〜2027年3月 → 2026）
  const fiscalYearOf = (dt = new Date()) => dt.getMonth() >= 3 ? dt.getFullYear() : dt.getFullYear() - 1;

  // 対象区間の13か月（4月〜翌年4月）
  function monthsOf(y) {
    const list = [];
    for (let i = 0; i < 13; i++) {
      const m = ((3 + i) % 12) + 1;
      list.push({ y: y + (m < 4 || i === 12 ? 1 : 0), m });
    }
    return list;
  }

  // ================= 祝日計算（内閣府の現行ルール） =================
  // m月の第n月曜日の日付
  function nthMonday(y, m, n) {
    const dow1 = new Date(y, m - 1, 1).getDay();
    return 1 + ((8 - dow1) % 7) + 7 * (n - 1);
  }
  const vernalEquinox = y => Math.floor(20.8431 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));
  const autumnalEquinox = y => Math.floor(23.2488 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4));

  const holidayCache = {};
  function holidaysOf(y) {
    if (holidayCache[y]) return holidayCache[y];
    const h = {};
    const add = (m, d, name) => { h[keyOf(y, m, d)] = name; };

    add(1, 1, '元日');
    add(1, nthMonday(y, 1, 2), '成人の日');
    add(2, 11, '建国記念の日');
    add(2, 23, '天皇誕生日');
    add(3, vernalEquinox(y), '春分の日');
    add(4, 29, '昭和の日');
    add(5, 3, '憲法記念日');
    add(5, 4, 'みどりの日');
    add(5, 5, 'こどもの日');
    if (y === 2020) { add(7, 23, '海の日'); add(7, 24, 'スポーツの日'); add(8, 10, '山の日'); }
    else if (y === 2021) { add(7, 22, '海の日'); add(7, 23, 'スポーツの日'); add(8, 8, '山の日'); }
    else { add(7, nthMonday(y, 7, 3), '海の日'); add(8, 11, '山の日'); add(10, nthMonday(y, 10, 2), 'スポーツの日'); }
    add(9, nthMonday(y, 9, 3), '敬老の日');
    add(9, autumnalEquinox(y), '秋分の日');
    add(11, 3, '文化の日');
    add(11, 23, '勤労感謝の日');

    // 国民の休日：祝日に挟まれた平日
    for (const k of Object.keys(h)) {
      const d = new Date(k + 'T00:00:00');
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const next2 = new Date(d); next2.setDate(d.getDate() + 2);
      const k1 = keyOfDate(next), k2 = keyOfDate(next2);
      if (!h[k1] && h[k2] && next.getDay() !== 0) h[k1] = '国民の休日';
    }
    // 振替休日：日曜の祝日の後の最初の平日
    for (const k of Object.keys(h).sort()) {
      const d = new Date(k + 'T00:00:00');
      if (d.getDay() !== 0) continue;
      const n = new Date(d);
      do { n.setDate(n.getDate() + 1); } while (h[keyOfDate(n)]);
      if (n.getFullYear() === y) h[keyOfDate(n)] = '振替休日';
    }
    return (holidayCache[y] = h);
  }
  const holidayName = dt => holidaysOf(dt.getFullYear())[keyOfDate(dt)] || null;

  // 土日祝は既定で休日。overrides に含まれる日はそれを反転
  function isOff(dt, overrides) {
    const dow = dt.getDay();
    const def = dow === 0 || dow === 6 || !!holidayName(dt);
    return def !== overrides.has(keyOfDate(dt));
  }

  // ================= 保存データ =================
  // 年度ごとのカレンダーをブラウザ内に保存する（作成ページと閲覧ページで共有）
  const CAL_KEY = 'jobcalendar.calendars.v1';
  const OLD_VIEWER_KEY = 'jobcalendar.viewer.v1';   // 旧版の閲覧ページが記憶していたデータ

  // ファイル・保存データを検証して整える。不正なら例外
  function normalize(d) {
    if (!d || d.app !== 'jobcalendar' || !Number.isInteger(d.startYear)) throw new Error('invalid calendar data');
    return {
      app: 'jobcalendar',
      version: 1,
      startYear: d.startYear,
      title: typeof d.title === 'string' ? d.title : '',
      subtitle: typeof d.subtitle === 'string' ? d.subtitle : '',
      overrides: Array.isArray(d.overrides)
        ? [...new Set(d.overrides.filter(s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)))].sort()
        : [],
    };
  }

  function writeAll(map) {
    try { localStorage.setItem(CAL_KEY, JSON.stringify(map)); return true; } catch (e) { return false; }
  }

  // { "2026": {...}, "2027": {...} }
  function loadAll() {
    let map = {};
    try {
      const raw = localStorage.getItem(CAL_KEY);
      if (raw) {
        for (const v of Object.values(JSON.parse(raw) || {})) {
          try { const d = normalize(v); map[d.startYear] = d; } catch (e) { /* 壊れた項目は無視 */ }
        }
      } else {
        // 旧版からの引き継ぎ：閲覧ページで最後に開いていたカレンダー
        const old = localStorage.getItem(OLD_VIEWER_KEY);
        if (old) {
          const d = normalize(JSON.parse(old));
          map[d.startYear] = d;
          if (writeAll(map)) localStorage.removeItem(OLD_VIEWER_KEY);
        }
      }
    } catch (e) { /* 読めない場合は空として扱う */ }
    return map;
  }

  function saveCalendar(d) {
    const data = normalize(d);
    const map = loadAll();
    map[data.startYear] = data;
    return writeAll(map) ? data : null;
  }

  const savedYears = () => Object.keys(loadAll()).map(Number).sort((a, b) => a - b);

  // ================= QRコード用の共有コード =================
  // 形式: 1.<年度>.<反転した日のビット列>.<タイトル>.<サブタイトル>（各要素は base64url）
  // 4月1日〜翌年4月30日の各日を1ビットで表すので、どの年度でも約70文字に収まる
  const PAGES_URL = 'https://soutsu.github.io/JobCalendar/';

  const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromB64url = str => {
    if (!/^[A-Za-z0-9_-]*$/.test(str)) throw new Error('invalid base64url');
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  };

  // 区間の全日付（YYYY-MM-DD）
  function rangeKeys(y) {
    const keys = [];
    for (const dt = new Date(y, 3, 1), end = new Date(y + 1, 3, 30); dt <= end; dt.setDate(dt.getDate() + 1)) {
      keys.push(keyOfDate(dt));
    }
    return keys;
  }

  // titleIsAuto: タイトルが自動入力のままなら空にして送る（受け取り側の言語で表示される）
  function toShareCode(d, titleIsAuto) {
    const data = normalize(d);
    const keys = rangeKeys(data.startYear);
    const set = new Set(data.overrides);
    const bits = new Uint8Array(Math.ceil(keys.length / 8));
    keys.forEach((k, i) => { if (set.has(k)) bits[i >> 3] |= 1 << (i & 7); });
    const enc = new TextEncoder();
    return ['1', data.startYear, b64url(bits),
      b64url(enc.encode(titleIsAuto ? '' : data.title)), b64url(enc.encode(data.subtitle))].join('.');
  }

  function fromShareCode(code) {
    const parts = String(code).split('.');
    if (parts.length !== 5 || parts[0] !== '1') throw new Error('unsupported share code');
    const y = Number(parts[1]);
    if (!Number.isInteger(y) || y < 2000 || y > 2100) throw new Error('invalid year');
    const keys = rangeKeys(y);
    const bits = fromB64url(parts[2]);
    if (bits.length !== Math.ceil(keys.length / 8)) throw new Error('invalid day data');
    const dec = new TextDecoder('utf-8', { fatal: true });
    return normalize({
      app: 'jobcalendar', startYear: y,
      title: dec.decode(fromB64url(parts[3])),
      subtitle: dec.decode(fromB64url(parts[4])),
      overrides: keys.filter((k, i) => bits[i >> 3] & (1 << (i & 7))),
    });
  }

  // QRコードに入れるURL（公開サイト上なら同じ場所、ローカルファイルなら公開サイト）
  function shareUrl(d, titleIsAuto) {
    const base = /^https?:$/.test(location.protocol) ? new URL('viewer.html', location.href).href : PAGES_URL + 'viewer.html';
    return `${base}#cal=${toShareCode(d, titleIsAuto)}`;
  }

  window.JC = {
    pad, keyOf, keyOfDate, fiscalYearOf, monthsOf,
    holidayName, isOff,
    CAL_KEY, normalize, loadAll, saveCalendar, savedYears,
    toShareCode, fromShareCode, shareUrl,
  };
})();
