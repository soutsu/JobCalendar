// QRコードでカレンダーを渡す画面（作成ページ・閲覧ページ共通）
// 必要なもの: vendor/qrcode.js, common.js, i18n.js
(() => {
  'use strict';
  const I = window.JC_I18N;
  const t = I.t;

  const CSS = `
    dialog.share-dlg {
      border: none; border-radius: 14px; padding: 18px 18px 14px;
      width: min(380px, calc(100vw - 24px)); box-shadow: 0 8px 30px rgba(0,0,0,.25);
      font: inherit; color: #222; text-align: center;
    }
    dialog.share-dlg::backdrop { background: rgba(0,0,0,.4); }
    dialog.share-dlg h2 { margin: 0 0 2px; font-size: 17px; color: #b8662a; }
    dialog.share-dlg .sub { margin: 0 0 10px; font-size: 13px; color: #b8662a; min-height: 1em; }
    dialog.share-dlg .qr { width: min(280px, 72vw); margin: 0 auto; }
    dialog.share-dlg .qr svg { display: block; width: 100%; height: auto; }
    dialog.share-dlg .help { margin: 10px 0 14px; font-size: 13px; color: #555; line-height: 1.6; text-align: left; }
    dialog.share-dlg button {
      font: inherit; font-size: 15px; padding: 9px 28px; border-radius: 999px; cursor: pointer;
      border: 1px solid #e0605f; background: #e0605f; color: #fff;
    }
  `;

  let dlg;
  function ensureDialog() {
    if (dlg) return dlg;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    dlg = document.createElement('dialog');
    dlg.className = 'share-dlg';
    dlg.innerHTML = '<h2></h2><p class="sub"></p><div class="qr"></div><p class="help"></p><button type="button"></button>';
    dlg.querySelector('button').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });   // 枠の外をタップで閉じる
    document.body.appendChild(dlg);
    return dlg;
  }

  // data: 保存データ形式, titleIsAuto: タイトルが自動入力のままか
  function show(data, titleIsAuto) {
    const d = ensureDialog();
    const url = window.JC.shareUrl(data, titleIsAuto);
    const qr = window.qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    d.querySelector('h2').textContent = t('yearOption', data.startYear);
    d.querySelector('.sub').textContent = [titleIsAuto ? '' : data.title, data.subtitle].filter(Boolean).join(' ');
    d.querySelector('.qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 12, scalable: true });
    d.querySelector('.help').innerHTML = t('qrHelp');
    d.querySelector('button').textContent = t('close');
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }

  window.JC_SHARE = { show };
})();
