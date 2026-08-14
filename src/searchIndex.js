/**
 * @param {object[]} articles - published articles from fetchArticles
 * @returns {{ slug: string, title: string, excerpt: string }[]}
 */
export function buildSearchIndex(articles) {
  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt ?? "",
  }));
}

/**
 * Standalone vanilla-JS snippet for sites that host their own search UI.
 * Loads Fuse.js from jsDelivr, fetches the index JSON, wires an input element.
 *
 * @param {{ indexUrl: string, basePath: string, inputSelector?: string, resultsSelector?: string }} options
 * @returns {string}
 */
export function searchWidgetScript(options) {
  const { indexUrl, basePath, inputSelector = "#kb-search-input", resultsSelector = "#kb-search-results" } =
    options;

  return `(function(){
  var indexUrl=${JSON.stringify(indexUrl)};
  var basePath=${JSON.stringify(basePath)};
  var inputSel=${JSON.stringify(inputSelector)};
  var resultsSel=${JSON.stringify(resultsSelector)};
  var input=document.querySelector(inputSel);
  var results=document.querySelector(resultsSel);
  if(!input||!results) return;
  var fuse=null;
  function loadFuse(cb){
    if(typeof Fuse!=="undefined"){cb();return;}
    var s=document.createElement("script");
    s.src="https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.min.js";
    s.onload=cb;
    document.head.appendChild(s);
  }
  fetch(indexUrl).then(function(r){return r.json()}).then(function(items){
    loadFuse(function(){
      fuse=new Fuse(items,{keys:["title","excerpt"],threshold:0.35,ignoreLocation:true});
    });
  }).catch(function(){});
  input.addEventListener("input",function(){
    if(!fuse) return;
    var q=input.value.trim();
    if(!q){results.hidden=true;results.innerHTML="";return;}
    var hits=fuse.search(q,{limit:8});
    results.innerHTML=hits.map(function(h){
      var a=h.item;
      var ex=a.excerpt?'<p>'+a.excerpt.replace(/</g,"&lt;")+'</p>':"";
      return '<li><a href="'+basePath+'/'+a.slug+'">'+a.title.replace(/</g,"&lt;")+'</a>'+ex+'</li>';
    }).join("");
    results.hidden=!hits.length;
  });
})();`;
}
