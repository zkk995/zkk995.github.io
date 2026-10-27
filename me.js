/* me.js — 首页「壹 AI助理」手记动态清单
 * 与 papers.js 同思路：清单自动来自 me/ 目录内容（GitHub Contents API，仓库公开无需凭据），
 * 新增文章只需把 HTML 放进 me/ 目录并经 viewer.html?src=me/… 打开，即自动收录。
 * 标题优先取 TITLES 映射，没有映射时回退为抓取页面 <title>，再退回文件名。
 */
(function () {
  var API = 'https://api.github.com/repos/zkk995/zkk995.github.io/contents/me';
  var TITLES = {
    'ai-two-days.html': '读读《我和AI的两天》手记',
    'amap-nav-guide.html': '灵光内唤醒高德导航'
  };
  var box = document.getElementById('me-list');
  if (!box) return;

  function addLink(name, text) {
    var a = document.createElement('a');
    a.className = 'book-link';
    a.href = 'viewer.html?src=me/' + encodeURIComponent(name);
    a.textContent = text + ' →';
    a.style.marginTop = (box.children.length ? '12px' : '0');
    a.style.display = 'inline-block';
    box.appendChild(a);
  }

  function fallback() {
    Object.keys(TITLES).forEach(function (name) { addLink(name, TITLES[name]); });
  }

  fetch(API, { headers: { 'Accept': 'application/vnd.github+json' } })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (items) {
      if (!Array.isArray(items)) throw 0;
      var files = items
        .filter(function (i) { return i.type === 'file' && /\.html$/i.test(i.name); })
        .sort(function (a, b) { return a.name < b.name ? 1 : -1; }); // 新的在前
      if (!files.length) throw 0;
      files.forEach(function (f) {
        var known = TITLES[f.name];
        if (known) { addLink(f.name, known); return; }
        addLink(f.name, f.name.replace(/\.html?$/i, ''));
        // 后台补抓页面标题，取到后替换按钮文字
        fetch('me/' + f.name).then(function (r) { return r.text(); }).then(function (html) {
          var m = html.match(/<title>([^<]*)<\/title>/i);
          if (m && m[1]) a.textContent = m[1].trim() + ' →';
        }).catch(function () {});
      });
    })
    .catch(fallback);
})();
