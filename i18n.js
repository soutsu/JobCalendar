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
      save: '保存', saveTip: 'この年度のカレンダーを保存します（閲覧ページに反映されます）',
      exportFile: 'ファイルに書き出し', exportTip: '他のスマホやPCへ移すためのファイルを作ります',
      importFile: 'ファイルから読み込み', importTip: '書き出したファイルを読み込みます',
      print: '印刷・PDF', printTip: 'A4で印刷／PDFに保存',
      reset: '初期状態に戻す', resetTip: '手動で変更した日付をすべて元に戻します',
      editorHelp: '日付をクリック（タップ）すると <b>出勤（黒）</b> ⇄ <b class="off">休日（赤）</b> が切り替わります。太字は手動で変更した日です（印刷時は通常の太さ）。編集が終わったら「保存」を押すと閲覧ページに反映されます。',
      stateSaved: '✓ 保存済み（閲覧ページに反映されています）',
      leaveTitle: '変更があります。保存しますか？', leaveSave: '保存して移動', leaveDiscard: '保存せずに移動', cancel: 'キャンセル',
      stateDirty: '● 保存していない変更があります',
      stateNew: '● この年度はまだ保存されていません',
      savedOk: y => `${y}年度を保存しました`,
      saveFailed: '保存できませんでした（ブラウザの設定で保存が禁止されている可能性があります）',
      totals: (w, o, c) => `区間合計：出勤 <b>${w}</b> 日 ／ 休日 <b class="off">${o}</b> 日（手動変更 ${c} 日）`,
      monthCount: (w, o) => `出勤 <b>${w}</b> ／ 休日 <b class="off">${o}</b>`,
      dayInfo: (m, d, dow, hn, isOff) => `${m}/${d}（${dow}）${hn ? hn + '・' : ''}${isOff ? '休日' : '出勤'}`,
      confirmYear: '保存していない変更があります。保存せずに年度を切り替えますか？',
      noChanges: '変更はありません',
      confirmReset: '手動で変更した日付をすべて元に戻します。よろしいですか？',
      exportName: y => `work-calendar-${y}.json`,
      exported: n => `「${n}」を書き出しました`,
      importedDraft: y => `${y}年度のファイルを読み込みました。「保存」で確定します`,
      loadError: 'このファイルは読み込めませんでした。\nこのツールで保存した .json ファイルを選んでください。',
      // 閲覧ページ
      appTitle: '勤務カレンダー',
      thisMonth: '今月',
      prevYear: '前の年度', nextYear: '次の年度',
      legend: '<b>黒</b>＝出勤　<b class="off">赤</b>＝休日　日付をタップで詳細',
      emptyMsg: 'まだカレンダーが保存されていません。<br>編集ページで作成して「保存」を押すと、ここに表示されます。',
      emptyNote: '他のスマホやPCで書き出したファイルがある場合は、「ファイルから読み込み」で取り込めます。',
      openEditor: '編集ページを開く',
      importNote: '他のスマホやPCで書き出したファイルを取り込む',
      loaded: y => `${y}年度を読み込みました`,
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
      save: 'Save', saveTip: 'Save this year (it will appear in the viewer)',
      exportFile: 'Export file', exportTip: 'Create a file to move this calendar to another phone or PC',
      importFile: 'Import file', importTip: 'Load an exported file',
      print: 'Print / PDF', printTip: 'Print on A4 or save as PDF',
      reset: 'Reset', resetTip: 'Undo all manual changes',
      editorHelp: 'Click (tap) a date to switch between <b>work day (black)</b> ⇄ <b class="off">day off (red)</b>. Bold dates were changed manually (printed in normal weight). When you are done, press "Save" to show it in the viewer.',
      stateSaved: '✓ Saved (shown in the viewer)',
      leaveTitle: 'You have unsaved changes. Save them?', leaveSave: 'Save and continue', leaveDiscard: "Don't save", cancel: 'Cancel',
      stateDirty: '● You have unsaved changes',
      stateNew: '● This year has not been saved yet',
      savedOk: y => `Saved ${y}`,
      saveFailed: 'Could not save (saving may be blocked in your browser settings)',
      totals: (w, o, c) => `Total: <b>${w}</b> work days / <b class="off">${o}</b> days off (${c} changed manually)`,
      monthCount: (w, o) => `Work <b>${w}</b> / Off <b class="off">${o}</b>`,
      dayInfo: (m, d, dow, hn, isOff) => `${m}/${d} (${dow}) ${hn ? hn + ' · ' : ''}${isOff ? 'Day off' : 'Work day'}`,
      confirmYear: 'You have unsaved changes. Switch the year without saving?',
      noChanges: 'There are no changes to reset',
      confirmReset: 'Undo all manual changes?',
      exportName: y => `work-calendar-${y}.json`,
      exported: n => `Exported "${n}"`,
      importedDraft: y => `Loaded the ${y} file. Press "Save" to keep it`,
      loadError: 'This file could not be loaded.\nPlease choose a .json file saved with this tool.',
      appTitle: 'Work Calendar',
      thisMonth: 'This month',
      prevYear: 'Previous year', nextYear: 'Next year',
      legend: '<b>Black</b> = work day · <b class="off">Red</b> = day off · Tap a date for details',
      emptyMsg: 'No calendar has been saved yet.<br>Create one in the editor and press "Save" to show it here.',
      emptyNote: 'If you have a file exported from another phone or PC, use "Import file".',
      openEditor: 'Open editor',
      importNote: 'Import a file exported from another phone or PC',
      loaded: y => `Loaded ${y}`,
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
      save: 'සුරකින්න', saveTip: 'මෙම වර්ෂය සුරකින්න (බැලීමේ පිටුවේ පෙන්වයි)',
      exportFile: 'ගොනුවට අපනයනය', exportTip: 'වෙනත් දුරකථනයකට හෝ පරිගණකයකට ගෙන යාමට ගොනුවක් සාදන්න',
      importFile: 'ගොනුවෙන් ආයාතය', importTip: 'අපනයනය කළ ගොනුවක් විවෘත කරන්න',
      print: 'මුද්‍රණය / PDF', printTip: 'A4 මත මුද්‍රණය කරන්න හෝ PDF ලෙස සුරකින්න',
      reset: 'මුල් තත්ත්වයට', resetTip: 'අතින් කළ සියලු වෙනස්කම් ඉවත් කරන්න',
      editorHelp: 'දිනයක් ක්ලික් (තට්ටු) කිරීමෙන් <b>වැඩ දිනය (කළු)</b> ⇄ <b class="off">නිවාඩු දිනය (රතු)</b> මාරු වේ. තද අකුරින් ඇති දින අතින් වෙනස් කළ ඒවාය (මුද්‍රණයේදී සාමාන්‍ය අකුරින්). අවසන් වූ පසු බැලීමේ පිටුවේ පෙන්වීමට "සුරකින්න" ඔබන්න.',
      stateSaved: '✓ සුරකින ලදී (බැලීමේ පිටුවේ පෙන්වයි)',
      leaveTitle: 'නොසුරකින ලද වෙනස්කම් ඇත. සුරකින්නද?', leaveSave: 'සුරැක ඉදිරියට යන්න', leaveDiscard: 'නොසුරැක ඉදිරියට යන්න', cancel: 'අවලංගු කරන්න',
      stateDirty: '● නොසුරකින ලද වෙනස්කම් ඇත',
      stateNew: '● මෙම වර්ෂය තවම සුරකින ලද නැත',
      savedOk: y => `${y} සුරකින ලදී`,
      saveFailed: 'සුරැකීමට නොහැකි විය (බ්‍රවුසර සැකසුම් මගින් සුරැකීම අවහිර කර තිබිය හැක)',
      totals: (w, o, c) => `එකතුව: වැඩ දින <b>${w}</b> / නිවාඩු දින <b class="off">${o}</b> (අතින් වෙනස් කළ දින ${c})`,
      monthCount: (w, o) => `වැඩ <b>${w}</b> / නිවාඩු <b class="off">${o}</b>`,
      dayInfo: (m, d, dow, hn, isOff) => `${m}/${d} (${dow}) ${hn ? hn + ' · ' : ''}${isOff ? 'නිවාඩු දිනය' : 'වැඩ දිනය'}`,
      confirmYear: 'නොසුරකින ලද වෙනස්කම් ඇත. සුරකින්නේ නැතිව වර්ෂය මාරු කරන්නද?',
      noChanges: 'ඉවත් කිරීමට වෙනස්කම් නැත',
      confirmReset: 'අතින් කළ සියලු වෙනස්කම් ඉවත් කරන්නද?',
      exportName: y => `work-calendar-${y}.json`,
      exported: n => `"${n}" අපනයනය කරන ලදී`,
      importedDraft: y => `${y} ගොනුව විවෘත කරන ලදී. තබා ගැනීමට "සුරකින්න" ඔබන්න`,
      loadError: 'මෙම ගොනුව විවෘත කළ නොහැක.\nමෙම මෙවලමෙන් සුරකින ලද .json ගොනුවක් තෝරන්න.',
      appTitle: 'රාජකාරි දින දර්ශනය',
      thisMonth: 'මේ මාසය',
      prevYear: 'පෙර වර්ෂය', nextYear: 'ඊළඟ වර්ෂය',
      legend: '<b>කළු</b> = වැඩ දිනය · <b class="off">රතු</b> = නිවාඩු දිනය · විස්තර සඳහා දිනය තට්ටු කරන්න',
      emptyMsg: 'තවම දින දර්ශනයක් සුරකින ලද නැත.<br>සංස්කරණ පිටුවේ සාදා "සුරකින්න" එබූ විට මෙහි පෙන්වයි.',
      emptyNote: 'වෙනත් දුරකථනයකින් හෝ පරිගණකයකින් අපනයනය කළ ගොනුවක් ඇත්නම්, "ගොනුවෙන් ආයාතය" භාවිතා කරන්න.',
      openEditor: 'සංස්කරණ පිටුව විවෘත කරන්න',
      importNote: 'වෙනත් දුරකථනයකින් හෝ පරිගණකයකින් අපනයනය කළ ගොනුවක් ආයාත කරන්න',
      loaded: y => `${y} විවෘත කරන ලදී`,
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
