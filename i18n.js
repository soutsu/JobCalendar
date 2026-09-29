// 表示言語の切り替え（日本語 / සිංහල / English）。作成ページ・閲覧ページ共通。
// 翻訳の修正はこのファイルだけで済みます。
(() => {
  'use strict';

  const LANGS = [
    { code: 'ja', label: '日本語' },
    { code: 'si', label: 'සිංහල' },
    { code: 'en', label: 'English' },
  ];
  const STORE_KEY = 'jobcalendar.lang';

  const S = {
    ja: {
      dow: ['日', '月', '火', '水', '木', '金', '土'],
      autoTitle: y => `${y} - ${y + 1}（令和${y - 2018} - ${y - 2017} 年）`,
      monthYear: y => `${y}年`,
      work: '出勤', off: '休日',
      // 上部の帯
      editorHere: '勤務カレンダー作成', toViewer: '閲覧ページへ',
      viewerHere: '閲覧ページ', toEditor: '編集ページへ',
      // 作成ページ
      yearLabel: '年度（4月始まり）',
      yearOption: y => `${y}年4月 〜 ${y + 1}年4月`,
      titleLabel: 'タイトル', subLabel: 'サブタイトル', subPlaceholder: '例：A班専用Calendar',
      save: '名前をつけて保存', saveTip: '編集内容をファイルに保存します',
      open: '開く', openTip: '保存したファイルを読み込みます',
      print: '印刷・PDF', printTip: 'A4で印刷／PDFに保存',
      reset: '初期状態に戻す', resetTip: '手動で変更した日付をすべて元に戻します',
      editorHelp: '日付をクリック（タップ）すると <b>出勤（黒）</b> ⇄ <b class="off">休日（赤）</b> が切り替わります。太字は手動で変更した日です（印刷時は通常の太さ）。',
      totals: (w, o, c) => `区間合計：出勤 <b>${w}</b> 日 ／ 休日 <b class="off">${o}</b> 日（手動変更 ${c} 日）`,
      monthCount: (w, o) => `出勤 <b>${w}</b> ／ 休日 <b class="off">${o}</b>`,
      dayInfo: (m, d, dow, hn, isOff) => `${m}/${d}（${dow}）${hn ? hn + '・' : ''}${isOff ? '休日' : '出勤'}`,
      confirmYear: '年度を変更すると、手動で変更した日付はリセットされます。よろしいですか？',
      noChanges: '変更はありません',
      confirmReset: '手動で変更した日付をすべて元に戻します。よろしいですか？',
      fileBase: (y, sub) => `${y}年度 ${sub || 'カレンダー'}`,
      fileTypeDesc: 'カレンダーデータ',
      promptName: '保存するファイル名を入力してください',
      savedTo: n => `「${n}」に保存しました`,
      downloaded: n => `「${n}」としてダウンロードしました`,
      opened: n => `「${n}」を開きました`,
      loadError: 'このファイルは読み込めませんでした。\nこのツールで保存した .json ファイルを選んでください。',
      // 閲覧ページ
      appTitle: '勤務カレンダー',
      thisMonth: '今月', openShort: '開く',
      legend: '<b>黒</b>＝出勤　<b class="off">赤</b>＝休日　日付をタップで詳細',
      emptyMsg: 'カレンダー作成ツールで保存した<br>カレンダーファイル（.json）を選んでください。',
      emptyNote: '一度読み込めば、次回からは自動で表示されます。',
      chooseFile: 'ファイルを選ぶ',
      loaded: n => `「${n}」を読み込みました`,
      outOfRange: '今月はこのカレンダーの期間外です',
    },

    en: {
      dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      autoTitle: y => `${y} - ${y + 1}`,
      monthYear: y => `${y}`,
      work: 'Work day', off: 'Day off',
      editorHere: 'Work Calendar Editor', toViewer: 'Open viewer',
      viewerHere: 'Calendar Viewer', toEditor: 'Open editor',
      yearLabel: 'Year (starts in April)',
      yearOption: y => `Apr ${y} – Apr ${y + 1}`,
      titleLabel: 'Title', subLabel: 'Subtitle', subPlaceholder: 'e.g. Team A Calendar',
      save: 'Save as…', saveTip: 'Save your edits to a file',
      open: 'Open', openTip: 'Load a saved file',
      print: 'Print / PDF', printTip: 'Print on A4 or save as PDF',
      reset: 'Reset', resetTip: 'Undo all manual changes',
      editorHelp: 'Click (tap) a date to switch between <b>work day (black)</b> ⇄ <b class="off">day off (red)</b>. Bold dates were changed manually (printed in normal weight).',
      totals: (w, o, c) => `Total: <b>${w}</b> work days / <b class="off">${o}</b> days off (${c} changed manually)`,
      monthCount: (w, o) => `Work <b>${w}</b> / Off <b class="off">${o}</b>`,
      dayInfo: (m, d, dow, hn, isOff) => `${m}/${d} (${dow}) ${hn ? hn + ' · ' : ''}${isOff ? 'Day off' : 'Work day'}`,
      confirmYear: 'Changing the year will reset your manual changes. Continue?',
      noChanges: 'There are no changes to reset',
      confirmReset: 'Undo all manual changes?',
      fileBase: (y, sub) => `${y} ${sub || 'calendar'}`,
      fileTypeDesc: 'Calendar data',
      promptName: 'Enter a file name',
      savedTo: n => `Saved to "${n}"`,
      downloaded: n => `Downloaded as "${n}"`,
      opened: n => `Opened "${n}"`,
      loadError: 'This file could not be loaded.\nPlease choose a .json file saved with this tool.',
      appTitle: 'Work Calendar',
      thisMonth: 'This month', openShort: 'Open',
      legend: '<b>Black</b> = work day · <b class="off">Red</b> = day off · Tap a date for details',
      emptyMsg: 'Choose the calendar file (.json)<br>saved from the calendar editor.',
      emptyNote: 'Once loaded, it will be shown automatically next time.',
      chooseFile: 'Choose file',
      loaded: n => `Loaded "${n}"`,
      outOfRange: 'This month is outside the calendar period',
    },

    si: {
      dow: ['ඉරි', 'සඳු', 'අඟ', 'බදා', 'බ්‍රහ', 'සිකු', 'සෙන'],
      autoTitle: y => `${y} - ${y + 1}`,
      monthYear: y => `${y}`,
      work: 'වැඩ දිනය', off: 'නිවාඩු දිනය',
      editorHere: 'රාජකාරි දින දර්ශනය සැකසීම', toViewer: 'බැලීමේ පිටුවට',
      viewerHere: 'දින දර්ශනය බැලීම', toEditor: 'සංස්කරණ පිටුවට',
      yearLabel: 'වර්ෂය (අප්‍රේල් සිට)',
      yearOption: y => `${y} අප්‍රේල් – ${y + 1} අප්‍රේල්`,
      titleLabel: 'මාතෘකාව', subLabel: 'උප මාතෘකාව', subPlaceholder: 'උදා: A කණ්ඩායමේ දින දර්ශනය',
      save: 'නමක් දී සුරකින්න', saveTip: 'සංස්කරණය කළ දේ ගොනුවකට සුරකින්න',
      open: 'විවෘත කරන්න', openTip: 'සුරකින ලද ගොනුවක් විවෘත කරන්න',
      print: 'මුද්‍රණය / PDF', printTip: 'A4 මත මුද්‍රණය කරන්න හෝ PDF ලෙස සුරකින්න',
      reset: 'මුල් තත්ත්වයට', resetTip: 'අතින් කළ සියලු වෙනස්කම් ඉවත් කරන්න',
      editorHelp: 'දිනයක් ක්ලික් (තට්ටු) කිරීමෙන් <b>වැඩ දිනය (කළු)</b> ⇄ <b class="off">නිවාඩු දිනය (රතු)</b> මාරු වේ. තද අකුරින් ඇති දින අතින් වෙනස් කළ ඒවාය (මුද්‍රණයේදී සාමාන්‍ය අකුරින්).',
      totals: (w, o, c) => `එකතුව: වැඩ දින <b>${w}</b> / නිවාඩු දින <b class="off">${o}</b> (අතින් වෙනස් කළ දින ${c})`,
      monthCount: (w, o) => `වැඩ <b>${w}</b> / නිවාඩු <b class="off">${o}</b>`,
      dayInfo: (m, d, dow, hn, isOff) => `${m}/${d} (${dow}) ${hn ? hn + ' · ' : ''}${isOff ? 'නිවාඩු දිනය' : 'වැඩ දිනය'}`,
      confirmYear: 'වර්ෂය වෙනස් කළහොත් අතින් කළ වෙනස්කම් ඉවත් වේ. ඉදිරියට යන්නද?',
      noChanges: 'ඉවත් කිරීමට වෙනස්කම් නැත',
      confirmReset: 'අතින් කළ සියලු වෙනස්කම් ඉවත් කරන්නද?',
      fileBase: (y, sub) => `${y} ${sub || 'දින දර්ශනය'}`,
      fileTypeDesc: 'දින දර්ශන දත්ත',
      promptName: 'ගොනු නාමයක් ඇතුළත් කරන්න',
      savedTo: n => `"${n}" වෙත සුරකින ලදී`,
      downloaded: n => `"${n}" ලෙස බාගත කරන ලදී`,
      opened: n => `"${n}" විවෘත කරන ලදී`,
      loadError: 'මෙම ගොනුව විවෘත කළ නොහැක.\nමෙම මෙවලමෙන් සුරකින ලද .json ගොනුවක් තෝරන්න.',
      appTitle: 'රාජකාරි දින දර්ශනය',
      thisMonth: 'මේ මාසය', openShort: 'විවෘත',
      legend: '<b>කළු</b> = වැඩ දිනය · <b class="off">රතු</b> = නිවාඩු දිනය · විස්තර සඳහා දිනය තට්ටු කරන්න',
      emptyMsg: 'දින දර්ශන සැකසුම් මෙවලමෙන් සුරකින ලද<br>දින දර්ශන ගොනුව (.json) තෝරන්න.',
      emptyNote: 'එක් වරක් විවෘත කළ පසු, ඊළඟ වතාවේ සිට ස්වයංක්‍රීයව පෙන්වයි.',
      chooseFile: 'ගොනුව තෝරන්න',
      loaded: n => `"${n}" විවෘත කරන ලදී`,
      outOfRange: 'මේ මාසය මෙම දින දර්ශනයේ කාල සීමාවෙන් පිටතය',
    },
  };

  // 祝日名（日本語名 → 各言語）
  const HOLIDAYS = {
    '元日':         { en: "New Year's Day",           si: 'නව වසර දිනය' },
    '成人の日':     { en: 'Coming of Age Day',        si: 'වැඩිවියට පත්වීමේ දිනය' },
    '建国記念の日': { en: 'National Foundation Day',  si: 'ජාතික ආරම්භක දිනය' },
    '天皇誕生日':   { en: "Emperor's Birthday",       si: 'අධිරාජයාගේ උපන් දිනය' },
    '春分の日':     { en: 'Vernal Equinox Day',       si: 'වසන්ත විෂුව දිනය' },
    '昭和の日':     { en: 'Showa Day',                si: 'ෂෝවා දිනය' },
    '憲法記念日':   { en: 'Constitution Day',         si: 'ආණ්ඩුක්‍රම ව්‍යවස්ථා දිනය' },
    'みどりの日':   { en: 'Greenery Day',             si: 'හරිත දිනය' },
    'こどもの日':   { en: "Children's Day",           si: 'ළමා දිනය' },
    '海の日':       { en: 'Marine Day',               si: 'සාගර දිනය' },
    '山の日':       { en: 'Mountain Day',             si: 'කඳු දිනය' },
    '敬老の日':     { en: 'Respect for the Aged Day', si: 'වැඩිහිටියන්ට ගෞරව කිරීමේ දිනය' },
    '秋分の日':     { en: 'Autumnal Equinox Day',     si: 'සරත් විෂුව දිනය' },
    'スポーツの日': { en: 'Sports Day',               si: 'ක්‍රීඩා දිනය' },
    '文化の日':     { en: 'Culture Day',              si: 'සංස්කෘතික දිනය' },
    '勤労感謝の日': { en: 'Labor Thanksgiving Day',   si: 'කම්කරු ස්තුති දිනය' },
    '国民の休日':   { en: "Citizens' Holiday",        si: 'ජාතික නිවාඩු දිනය' },
    '振替休日':     { en: 'Substitute Holiday',       si: 'ආදේශක නිවාඩු දිනය' },
  };

  function detect() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved && S[saved]) return saved;
    } catch (e) { /* 無視 */ }
    const nav = (navigator.language || 'ja').toLowerCase();
    if (nav.startsWith('ja')) return 'ja';
    if (nav.startsWith('si')) return 'si';
    return 'en';
  }

  let lang = detect();
  const listeners = [];

  function t(key, ...args) {
    const v = S[lang][key] ?? S.ja[key];
    return typeof v === 'function' ? v(...args) : v;
  }

  // data-i18n 属性の付いた要素に訳文を当てはめる
  function applyStatic(root = document) {
    document.documentElement.lang = lang;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  }

  // 言語選択欄を用意する
  function bindSelect(sel) {
    sel.textContent = '';
    for (const l of LANGS) {
      const o = document.createElement('option');
      o.value = l.code; o.textContent = l.label;
      sel.appendChild(o);
    }
    sel.value = lang;
    sel.addEventListener('change', () => setLang(sel.value));
  }

  function setLang(code) {
    if (!S[code] || code === lang) return;
    lang = code;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* 無視 */ }
    applyStatic();
    listeners.forEach(fn => fn(lang));
  }

  window.JC_I18N = {
    t,
    get lang() { return lang; },
    applyStatic,
    bindSelect,
    onChange: fn => listeners.push(fn),
    holiday: name => (name && lang !== 'ja' && HOLIDAYS[name]) ? HOLIDAYS[name][lang] : name,
    // どの言語の自動タイトルとも一致するか（自動タイトルなら言語に合わせて表示を切り替える）
    isAutoTitle: (title, y) => Object.values(S).some(s => s.autoTitle(y) === title),
  };
})();
