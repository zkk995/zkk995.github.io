/* 论文解读页通用留言板：在页面底部注入 giscus（留言存于仓库 Discussions）。
 * 新增论文页时，在 </body> 前加一行 <script src="comments.js" defer></script> 即可。 */
(function () {
  function mount() {
    var section = document.createElement('section');
    section.className = 'comments';
    section.setAttribute('style',
      'max-width:760px;margin:48px auto 64px;padding:0 20px;' +
      'border-top:1px solid #e5e7eb;padding-top:28px;');
    var h = document.createElement('h2');
    h.textContent = '留言';
    h.setAttribute('style', 'font-size:1.1em;margin:0 0 14px;');
    section.appendChild(h);

    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.setAttribute('data-repo', 'zkk995/zkk995.github.io');
    s.setAttribute('data-repo-id', 'MDEwOlJlcG9zaXRvcnkyODA3Njg2MA==');
    s.setAttribute('data-category', 'General');
    s.setAttribute('data-category-id', 'DIC_kwDOAaxrPM4DJfoG');
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '1');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', 'light');
    s.setAttribute('data-lang', 'zh-CN');
    s.setAttribute('data-loading', 'lazy');
    s.setAttribute('crossorigin', 'anonymous');
    s.setAttribute('async', '');
    section.appendChild(s);
    document.body.appendChild(section);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
