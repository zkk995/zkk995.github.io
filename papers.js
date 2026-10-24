/* 论文清单公共脚本：供主页与 papers/index.html 使用。
 * 数据源：GitHub 公开接口实时读取 papers/ 目录（排除 index.html），
 * 每个文件按其最近一次提交时间排序（新加的在最上面）。
 * 结果按文件 sha 缓存在 localStorage，未变化的文件不重复请求。 */
(function () {
  var REPO = 'zkk995/zkk995.github.io';
  var CACHE_KEY = 'papersCache_v2';
  var IN_PAPERS = location.pathname.replace(/\/$/, '').indexOf('/papers') !== -1;
  var PREFIX = IN_PAPERS ? '' : 'papers/';

  function loadCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveCache(c) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    });
  }

  function metaFor(entry, cache) {
    var hit = cache[entry.sha];
    if (hit) return Promise.resolve(hit);
    var rawUrl = 'https://raw.githubusercontent.com/' + REPO + '/master/papers/' + entry.name;
    var commitUrl = 'https://api.github.com/repos/' + REPO +
      '/commits?path=papers/' + entry.name + '&per_page=1';
    return Promise.all([
      fetch(rawUrl).then(function (r) { return r.text(); }),
      getJSON(commitUrl)
    ]).then(function (res) {
      var text = res[0], commits = res[1];
      var title = (text.match(/<title>([^<]+)/) || [, '论文解读'])[1].trim();
      var a = text.match(/arxiv\.org\/abs\/([0-9.]+)/i) || text.match(/arXiv:\s*([0-9.]+)/);
      var date = (commits[0] && commits[0].commit &&
        commits[0].commit.committer.date) || '';
      var meta = { name: entry.name, sha: entry.sha, title: title,
                   arxiv: a ? a[1] : '', date: date };
      cache[entry.sha] = meta;
      return meta;
    });
  }

  function fetchPapers() {
    var cache = loadCache();
    return getJSON('https://api.github.com/repos/' + REPO +
        '/contents/papers?ts=' + Date.now())
      .then(function (entries) {
        var files = entries.filter(function (e) {
          return e.type === 'file' && e.name.endsWith('.html') && e.name !== 'index.html';
        });
        return Promise.all(files.map(function (e) { return metaFor(e, cache); }));
      })
      .then(function (papers) {
        saveCache(cache);
        papers.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
        return papers;
      });
  }

  function render(papers) {
    var box = document.getElementById('paper-list');
    if (!box) return;
    box.innerHTML = papers.map(function (p) {
      var meta = p.date ? p.date.slice(0, 10) + ' 加入' : '';
      if (p.arxiv) {
        meta += (meta ? ' · ' : '') + 'arXiv:' + p.arxiv +
          ' · <a style="color:inherit" href="https://arxiv.org/abs/' + p.arxiv +
          '" target="_blank" rel="noopener">原文</a>';
      }
      return '<a class="paper" href="' + (IN_PAPERS ? '../' : '')
        + 'paper-viewer.html?src=papers/' + p.name + '">'
        + '<span class="p-tag">论文解读</span>'
        + '<div class="p-title">' + p.title + ' <span class="arrow">→</span></div>'
        + (meta ? '<div class="p-meta">' + meta + '</div>' : '')
        + '</a>';
    }).join('');
  }

  function fail() {
    var box = document.getElementById('paper-list');
    if (box) box.innerHTML =
      '<div class="card" style="color:var(--ink-soft)">清单加载失败，请稍后刷新。</div>';
  }

  window.renderPaperList = function () {
    return fetchPapers().then(render).catch(function () {
      // 实时接口失败时退回静态清单
      fetch((IN_PAPERS ? '../' : '') + 'papers-manifest.json?ts=' + Date.now())
        .then(function (r) { return r.json(); })
        .then(function (data) {
          render((data.papers || []).map(function (p) {
            return { name: p.file.replace(/^papers\//, ''), title: p.title, arxiv: p.arxiv, date: '' };
          }));
        })
        .catch(fail);
    });
  };
})();
