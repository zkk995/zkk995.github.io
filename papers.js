/* 论文清单公共脚本：供主页与 papers/index.html 使用。
 * 数据源：GitHub 公开接口实时读取 papers/ 目录（排除 index.html），
 * 每个文件按其最近一次提交时间排序（新加的在最上面）。
 * 结果按文件 sha 缓存在 localStorage，未变化的文件不重复请求。
 * 容错策略：单篇请求失败不影响整页；接口返回不全时用 papers-manifest.json 补齐；
 * 接口整体失败时退回 papers-manifest.json。 */
(function () {
  var REPO = 'zkk995/zkk995.github.io';
  var CACHE_KEY = 'papersCache_v2';
  var IN_PAPERS = location.pathname.replace(/\/$/, '').indexOf('/papers') !== -1;
  var PREFIX = IN_PAPERS ? '../' : '';

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
    // 原文内容和提交时间各自容错：谁失败都不拖垮整页
    var raw = fetch(rawUrl).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.text();
    }).catch(function () { return ''; });
    var commits = getJSON(commitUrl).catch(function () { return []; });
    return Promise.all([raw, commits]).then(function (res) {
      var text = res[0], commits = res[1];
      var title = (text.match(/<title>([^<]+)/) || [, entry.name.replace(/\.html$/, '')])[1].trim();
      var a = text.match(/arxiv\.org\/abs\/([0-9.]+)/i) || text.match(/arXiv:\s*([0-9.]+)/);
      var date = (commits[0] && commits[0].commit &&
        commits[0].commit.committer.date) || '';
      var meta = { name: entry.name, sha: entry.sha, title: title,
                   arxiv: a ? a[1] : '', date: date };
      if (text) cache[entry.sha] = meta;
      return meta;
    });
  }

  function manifestPapers(manifest) {
    return ((manifest && manifest.papers) || []).map(function (p) {
      var name = p.file.replace(/^papers\//, '');
      return { name: name, sha: 'mf:' + name, title: p.title,
               arxiv: p.arxiv || '', date: '' };
    });
  }

  function fetchPapers() {
    var cache = loadCache();
    var manifestUrl = (IN_PAPERS ? '../' : '') + 'papers-manifest.json?ts=' + Date.now();
    return Promise.all([
      getJSON('https://api.github.com/repos/' + REPO +
        '/contents/papers?ts=' + Date.now()).catch(function () { return null; }),
      getJSON(manifestUrl).catch(function () { return null; })
    ]).then(function (results) {
      var entries = results[0], manifest = results[1];
      if (!entries) return manifestPapers(manifest); // 接口整体失败：退回静态清单
      var files = entries.filter(function (e) {
        return e.type === 'file' && e.name.endsWith('.html') && e.name !== 'index.html';
      });
      return Promise.all(files.map(function (e) { return metaFor(e, cache); }))
        .then(function (papers) {
          saveCache(cache);
          // 接口返回不全（旧缓存/限流）时，用静态清单补齐缺的文章
          var seen = {};
          papers.forEach(function (p) { seen[p.name] = true; });
          manifestPapers(manifest).forEach(function (p) {
            if (!seen[p.name]) papers.push(p);
          });
          return papers;
        });
    }).then(function (papers) {
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
    return fetchPapers().then(render).catch(fail);
  };
})();
