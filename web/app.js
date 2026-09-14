/* OPE, the interface.

   Four panels, left to right: the projects, the versions of the one you picked,
   the files, and the code. Pick a version and every folder it touched gets a
   green box. Open one and the files it touched are boxed. Open a file and the
   lines it wrote are boxed. Everything reads from the project folder and from
   git, and everything you save goes straight back into the real file. */
(function(){
  var S = {root:'', repo:false, numbered:false, projects:[], project:null, version:null,
           changed:{}, gone:[], dirs:{}, files:[], open:{}, path:'', dirty:false, loadedText:'',
           editor:null, monaco:null, deco:[], promptText:'', recent:[], busy:false};
  var $ = function(id){ return document.getElementById(id); };
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function base(p){ return String(p).split('/').pop(); }
  function status(left, right){ if(left != null) $('statusLeft').textContent = left; if(right != null) $('statusRight').textContent = right; }

  /* ------------------------------------------------------------ the editor */
  var LANG = {js:'javascript', mjs:'javascript', cjs:'javascript', jsx:'javascript', ts:'typescript', tsx:'typescript',
    json:'json', html:'html', htm:'html', vue:'html', svelte:'html', css:'css', scss:'scss', less:'less', md:'markdown',
    py:'python', swift:'swift', go:'go', rs:'rust', java:'java', kt:'kotlin', rb:'ruby', php:'php', sh:'shell',
    zsh:'shell', bash:'shell', yml:'yaml', yaml:'yaml', sql:'sql', c:'c', h:'c', cpp:'cpp', cc:'cpp', hpp:'cpp',
    cs:'csharp', xml:'xml', plist:'xml', svg:'xml', toml:'ini', ini:'ini', env:'ini', dart:'dart', lua:'lua',
    r:'r', m:'objective-c', mm:'objective-c', graphql:'graphql', gql:'graphql', txt:'plaintext'};
  function langFor(path){
    var name = base(path).toLowerCase();
    if(name === 'dockerfile') return 'dockerfile';
    var ext = name.indexOf('.') >= 0 ? name.split('.').pop() : '';
    return LANG[ext] || 'plaintext';
  }

  function loadMonaco(){
    return new Promise(function(done){
      var baseUrl = location.href.replace(/[^\/]*$/, '');
      window.MonacoEnvironment = {getWorkerUrl: function(){
        return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(
          'self.MonacoEnvironment={baseUrl:"' + baseUrl + 'vendor/"};importScripts("' + baseUrl + 'vendor/vs/base/worker/workerMain.js");');
      }};
      require.config({paths:{vs:'vendor/vs'}});
      require(['vs/editor/editor.main'], function(){
        var m = window.monaco;
        m.editor.defineTheme('ope', {base:'vs-dark', inherit:true, rules:[], colors:{
          'editor.background':'#000000', 'editorGutter.background':'#000000', 'editor.lineHighlightBackground':'#0b1116',
          'editorLineNumber.foreground':'#4a535a', 'editorLineNumber.activeForeground':'#f2f2f2',
          'editor.selectionBackground':'#264f78', 'editorIndentGuide.background1':'#12191e',
          'scrollbarSlider.background':'#1f2a3180', 'minimap.background':'#000000'}});
        S.monaco = m;
        S.editor = m.editor.create($('code'), {value:'', language:'plaintext', theme:'ope', automaticLayout:true,
          fontFamily:'ui-monospace, "SF Mono", Menlo, monospace', fontSize:13, minimap:{enabled:true},
          scrollBeyondLastLine:false, renderLineHighlight:'line', smoothScrolling:false});
        S.editor.onDidChangeModelContent(function(){
          if(!S.path) return;
          setDirty(S.editor.getValue() !== S.loadedText);
        });
        S.editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyS, save);
        done();
      });
    });
  }

  function setDirty(d){
    S.dirty = d;
    $('dirty').classList.toggle('hidden', !d);
    $('saveBtn').disabled = !d;
  }

  /* ------------------------------------------------------------ the views */
  function show(which){
    $('welcome').classList.toggle('hidden', which !== 'welcome');
    $('code').classList.toggle('hidden', which !== 'code');
    $('blank').classList.toggle('hidden', which !== 'blank');
    var code = which === 'code';
    $('saveBtn').classList.toggle('hidden', !code);
    $('checkBtn').classList.toggle('hidden', !code || !S.repo);
    if(!code){ $('lineTag').classList.add('hidden'); $('dirty').classList.add('hidden'); }
    if(code && S.editor) S.editor.layout();
  }

  function welcome(){
    S.path = ''; setDirty(false);
    $('tabName').textContent = 'Welcome';
    var recent = (S.recent || []).filter(function(r){ return r !== S.root; });
    $('welcome').innerHTML =
      '<div class="term">'+
        '<h1>OPE</h1><p class="under">Out Past Engineering. See the app your AI built, version by version.</p>'+
        '<p class="line"><i>&gt;</i> step 1 <em>copy the OPE prompt and give it to your AI coder, once per project</em></p>'+
        '<p class="line"><i>&gt;</i> step 2 <em>tell it: "project 1.0, build me ..."</em></p>'+
        '<p class="line"><i>&gt;</i> step 3 <em>open the project folder here and pick a version</em></p>'+
        '<div class="acts2">'+
          '<button class="btn big go" id="copyPrompt" type="button">Copy the prompt</button>'+
          '<button class="btn big" id="openBtn" type="button">'+(S.root ? 'Open another project' : 'Open a project')+'</button>'+
        '</div>'+
        '<pre id="promptText">'+esc(unwrap(S.promptText) || 'Loading the prompt...')+'</pre>'+
        (recent.length ? '<div class="recent"><p class="line"><em>recent</em></p>'+
          recent.map(function(r){ return '<button type="button" data-recent="'+esc(r)+'">'+esc(r)+'</button>'; }).join('')+'</div>' : '')+
      '</div>';
    $('copyPrompt').onclick = copyPrompt;
    $('openBtn').onclick = pickProject;
    Array.prototype.forEach.call(document.querySelectorAll('[data-recent]'), function(b){
      b.onclick = function(){ openRoot(b.getAttribute('data-recent')); };
    });
    show('welcome');
  }

  /* the prompt is written with hard line breaks for a text editor; in a narrow
     box those breaks land mid line, so paragraphs are joined for reading only */
  function unwrap(text){
    var out = [], code = false;
    String(text || '').split('\n').forEach(function(l){
      if(/^```/.test(l)){ code = !code; out.push(l); return; }
      var prev = out.length ? out[out.length - 1] : '';
      var starts = /^\s*($|#|[-*] |\d+\. |```|---)/.test(l);
      var prevEnds = !prev || /^\s*(#|```|---)/.test(prev) || code;
      if(!code && !starts && !prevEnds && /\S/.test(prev)) out[out.length - 1] = prev + ' ' + l.trim();
      else out.push(l);
    });
    return out.join('\n');
  }

  function copyPrompt(){
    var b = $('copyPrompt'), text = S.promptText;
    var done = function(){ b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy the prompt'; }, 1600); };
    OPEBridge.call('copy', {text: text}).then(function(r){
      if(r.ok) return done();
      return navigator.clipboard.writeText(text).then(done);
    }).catch(function(){ b.textContent = 'Select the text below and copy it'; });
  }

  function blank(msg){ $('blank').innerHTML = '<div>'+msg+'</div>'; show('blank'); }

  /* ------------------------------------------------------------ opening */
  function pickProject(){
    OPEBridge.call('pick').then(function(r){
      if(r.root) return openRoot(r.root, true);
      if(r.manual) askPath();
    }).catch(function(e){ status(e.message); });
  }

  function askPath(){
    $('sheetCard').innerHTML = '<h2>Open a project</h2><p>The full path to the project folder.</p>'+
      '<input id="pathIn" placeholder="/Users/you/projects/my-app" autofocus>'+
      '<div class="acts"><button class="btn" id="cancelIn" type="button">Cancel</button>'+
      '<button class="btn go" id="okIn" type="button">Open</button></div>';
    $('sheet').classList.remove('hidden');
    var go = function(){ var v = $('pathIn').value.trim(); if(v){ $('sheet').classList.add('hidden'); openRoot(v); } };
    $('okIn').onclick = go; $('cancelIn').onclick = function(){ $('sheet').classList.add('hidden'); };
    $('pathIn').onkeydown = function(e){ if(e.key === 'Enter') go(); if(e.key === 'Escape') $('cancelIn').click(); };
    setTimeout(function(){ $('pathIn').focus(); }, 30);
  }

  function openRoot(path, already){
    var step = already ? Promise.resolve({root: path}) : OPEBridge.call('open', {path: path});
    return step.then(function(r){
      S.root = r.root; S.project = null; S.version = null; S.open = {}; S.path = ''; S.changed = {}; S.dirs = {}; S.gone = [];
      if(S.recent.indexOf(r.root) < 0) S.recent.unshift(r.root);
      if(r.library) S.library = r.library;
      $('where').textContent = r.root;
      return reload();
    }).then(function(){
      blank('Pick a project on the left, then a version.<br>Folders it touched get a green box.');
      $('tabName').textContent = base(S.root);
    }).catch(function(e){ status(e.message); });
  }

  function reload(){
    return OPEGit.loadVersions().then(function(d){
      S.repo = d.repo; S.numbered = d.numbered; S.projects = d.projects;
      if(S.project) S.project = S.projects.filter(function(p){ return p.id === S.project.id; })[0] || null;
      if(S.version && S.project){
        var keep = S.version.name;
        S.version = S.project.versions.filter(function(v){ return v.name === keep; })[0] || null;
      }
      return OPEGit.listFiles(S.repo);
    }).then(function(files){
      S.files = files;
      renderProjects(); renderVersions();
      return S.version ? markVersion(S.version) : renderTree();
    }).then(function(){
      status(S.repo ? (S.numbered ? 'Tracking versions with git' : 'Git history, no numbered versions yet') : 'Not tracked by git yet',
             S.version ? versionLine() : '');
    });
  }

  /* ------------------------------------------------------------ projects */
  /* THE LIBRARY. Every project folder you keep, in one list. The open one is
     expanded to show its numbered projects; any other opens with one click.
     The list lives on this Mac only, never in the app itself. */
  function inner(){
    if(!S.root) return '';
    if(!S.repo){
      return '<div class="empty sub"><b>No versions yet.</b><br>This folder is not saved with git, so OPE cannot see its history.'+
        '<br><br><button class="btn go" id="trackBtn" type="button">Start tracking as 1.0</button></div>';
    }
    if(!S.projects.length) return '<div class="empty sub"><b>No checkpoints yet.</b><br>When your AI saves version 1.0 it shows up here.</div>';
    return (S.numbered ? '' : '<div class="empty sub">Built without the OPE prompt, so every save shows as a step.</div>')+
      S.projects.map(function(p, i){
        var on = S.project && S.project.id === p.id;
        return '<button class="row sub'+(on ? ' sel' : '')+'" data-p="'+i+'" type="button"><span class="caret">'+(on ? '▾' : '▸')+'</span>'+
          '<span class="name">'+esc(p.title)+'</span><span class="meta">'+p.versions.length+'</span></button>';
      }).join('');
  }

  function renderProjects(){
    var box = $('projectList');
    var lib = (S.library || []).slice();
    if(S.root && !lib.some(function(x){ return x.path === S.root; })) lib.unshift({path: S.root, name: base(S.root)});
    var html = lib.map(function(item, i){
      var active = item.path === S.root, open = active && !S.innerShut;
      return '<div class="lib'+(active ? ' on' : '')+'">'+
        '<button class="row libname" data-lib="'+i+'" type="button" title="'+esc(item.path)+'">'+
          '<span class="caret">'+(open ? '▾' : '▸')+'</span><span class="name">'+esc(item.name || base(item.path))+'</span>'+
          '<span class="x" data-unlib="'+i+'" title="Take it off the list" role="button" aria-label="Take it off the list">×</span></button>'+
        (open ? inner() : '')+'</div>';
    }).join('');
    box.innerHTML = (html || '<div class="empty">Add a project folder to begin.</div>')+
      '<button class="row addlib" id="addLib" type="button"><span class="caret">+</span><span class="name">Add a project folder</span></button>';
    S.libShown = lib;

    Array.prototype.forEach.call(box.querySelectorAll('[data-lib]'), function(b){
      b.onclick = function(e){
        var item = S.libShown[+b.getAttribute('data-lib')];
        if(e.target.hasAttribute('data-unlib')){
          OPEBridge.call('libraryRemove', {path: item.path}).then(function(r){ S.library = r.items || []; renderProjects(); });
          return;
        }
        if(item.path === S.root){ S.innerShut = !S.innerShut; renderProjects(); return; }
        S.innerShut = false;
        openRoot(item.path);
      };
    });
    $('addLib').onclick = pickProject;
    var track = $('trackBtn');
    if(track) track.onclick = function(){
      if(!confirm('This saves the folder with git, which adds a hidden .git folder inside it.\n\n'+
                  'If this folder is uploaded as a website exactly as it is, that .git folder would go with it. Continue?')) return;
      track.disabled = true; track.textContent = 'Saving...';
      OPEGit.startTracking().then(reload).catch(function(e){ track.disabled = false; track.textContent = 'Start tracking as 1.0'; status(e.message); });
    };
    Array.prototype.forEach.call(box.querySelectorAll('[data-p]'), function(b){
      b.onclick = function(){
        var p = S.projects[+b.getAttribute('data-p')];
        S.project = (S.project && S.project.id === p.id) ? null : p;
        if(S.project && $('versions').classList.contains('shut')) fold('versions', false);
        if(!S.project){ S.version = null; clearMarks(); }
        renderProjects(); renderVersions();
      };
    });
  }

  function renderVersions(){
    var panel = $('versions');
    panel.classList.toggle('hidden', !S.project);
    if(!S.project) return;
    $('versionsHead').textContent = S.project.title.toUpperCase();
    var list = S.project.versions;
    $('versionList').innerHTML = list.map(function(v, i){
      var on = S.version && S.version.commit === v.commit;
      return '<button class="row ver'+(on ? ' sel' : '')+'" data-v="'+i+'" type="button"><b>'+esc(v.name)+'</b>'+
        (v.summary ? '<span>'+esc(v.summary)+'</span>' : '')+'</button>';
    }).join('');
    Array.prototype.forEach.call($('versionList').querySelectorAll('[data-v]'), function(b){
      b.onclick = function(){
        var v = list[+b.getAttribute('data-v')];
        if(S.version && S.version.commit === v.commit){ S.version = null; clearMarks(); renderVersions(); return; }
        S.version = v; renderVersions(); markVersion(v);
      };
    });
  }

  function versionLine(){
    var n = Object.keys(S.changed).length;
    return S.version ? S.version.name + ' · ' + n + (n === 1 ? ' file' : ' files') + ' touched' : '';
  }

  /* ------------------------------------------------------------ marking */
  function clearMarks(){
    S.changed = {}; S.dirs = {}; S.gone = [];
    renderTree(); status(null, '');
    if(S.path) paintLines();
  }

  function markVersion(v){
    return OPEGit.changes(v).then(function(files){
      if(S.version !== v) return;
      S.changed = {}; S.dirs = {}; S.gone = [];
      files.forEach(function(f){
        if(f.status === 'D'){ S.gone.push(f.path); }
        S.changed[f.path] = f.status;
        var parts = f.path.split('/');
        for(var i = 1; i < parts.length; i++) S.dirs[parts.slice(0, i).join('/')] = true;
      });
      renderTree();
      status(null, versionLine());
      if(S.path) paintLines();
    }).catch(function(e){ status(e.message); });
  }

  /* ------------------------------------------------------------ the tree */
  function buildTree(){
    var rootNode = {dirs:{}, files:[]};
    var all = S.files.slice();
    S.gone.forEach(function(g){ if(all.indexOf(g) < 0) all.push(g); });
    all.forEach(function(path){
      var parts = path.split('/'), node = rootNode;
      for(var i = 0; i < parts.length - 1; i++){
        node = node.dirs[parts[i]] = node.dirs[parts[i]] || {dirs:{}, files:[]};
      }
      node.files.push(path);
    });
    return rootNode;
  }

  function renderTree(){
    var box = $('tree');
    if(!S.root){ box.innerHTML = ''; $('fileCount').textContent = ''; return; }
    $('fileCount').textContent = S.files.length + ' files';
    var html = [];
    (function walk(node, prefix, depth){
      Object.keys(node.dirs).sort(function(a, b){ return a.localeCompare(b); }).forEach(function(name){
        var path = prefix ? prefix + '/' + name : name, open = !!S.open[path], green = !!S.dirs[path];
        html.push('<button class="row'+(green ? ' green' : '')+'" data-dir="'+esc(path)+'" type="button" style="padding-left:'+(10 + depth * 14)+'px">'+
          '<span class="caret">'+(open ? '▾' : '▸')+'</span><span class="name">'+esc(name)+'</span>'+
          (green ? '<span class="meta">'+esc(S.version.name)+'</span>' : '')+'</button>');
        if(open) walk(node.dirs[name], path, depth + 1);
      });
      node.files.sort(function(a, b){ return base(a).localeCompare(base(b)); }).forEach(function(path){
        var st = S.changed[path], gone = st === 'D';
        html.push('<button class="row'+(st && !gone ? ' green' : '')+(gone ? ' gone' : '')+(S.path === path ? ' sel' : '')+
          '" data-file="'+esc(path)+'" type="button" style="padding-left:'+(22 + depth * 14)+'px"'+(gone ? ' disabled' : '')+'>'+
          '<span class="name">'+esc(base(path))+'</span>'+
          (st ? '<span class="meta">'+({A:'new', M:'changed', D:'removed', T:'changed'}[st] || 'changed')+'</span>' : '')+'</button>');
      });
    })(buildTree(), '', 0);
    box.innerHTML = html.join('') || '<div class="empty">This folder is empty.</div>';
    Array.prototype.forEach.call(box.querySelectorAll('[data-dir]'), function(b){
      b.onclick = function(){ var p = b.getAttribute('data-dir'); S.open[p] = !S.open[p]; renderTree(); };
    });
    Array.prototype.forEach.call(box.querySelectorAll('[data-file]'), function(b){
      b.onclick = function(){ openFile(b.getAttribute('data-file')); };
    });
  }

  /* ------------------------------------------------------------ a file */
  function openFile(path){
    if(S.dirty && S.path && path !== S.path && !confirm('You have unsaved changes in ' + base(S.path) + '. Leave them?')) return;
    return OPEBridge.call('read', {path: path}).then(function(r){
      S.path = path; $('notice').classList.add('hidden');
      $('tabName').textContent = base(path); $('tab').title = path;
      renderTree();
      if(r.binary){ blank(esc(base(path)) + ' is not a text file, so there is no code to show.'); return; }
      if(r.tooBig){ blank(esc(base(path)) + ' is too big to open here.'); return; }
      if(!S.editor){ blank('The code view is still loading.'); return; }
      var m = S.monaco, uri = m.Uri.parse('ope:///' + encodeURI(path));
      var model = m.editor.getModel(uri);
      if(model) model.setValue(r.text); else model = m.editor.createModel(r.text, langFor(path), uri);
      m.editor.getModels().forEach(function(x){ if(x !== model) x.dispose(); });
      S.loadedText = r.text;
      S.editor.setModel(model);
      setDirty(false);
      show('code');
      paintLines();
    }).catch(function(e){ blank(esc(e.message)); });
  }

  function paintLines(){
    if(!S.editor || !S.path) return;
    var tag = $('lineTag');
    var clear = function(){ S.deco = S.editor.deltaDecorations(S.deco, []); tag.classList.add('hidden'); };
    if(!S.version || !S.repo || !S.changed[S.path]) return clear();
    var v = S.version, path = S.path;
    OPEGit.lines(v, path).then(function(nums){
      if(S.version !== v || S.path !== path) return;
      nums.sort(function(a, b){ return a - b; });
      var set = {}; nums.forEach(function(n){ set[n] = true; });
      var m = S.monaco, list = [];
      nums.forEach(function(n){
        var cls = 'ope-line' + (set[n - 1] ? '' : ' first') + (set[n + 1] ? '' : ' last');
        list.push({range: new m.Range(n, 1, n, 1), options:{isWholeLine:true, className: cls,
          linesDecorationsClassName:'ope-gutter', overviewRuler:{color:'#22C55E', position: m.editor.OverviewRulerLane.Left}}});
      });
      S.deco = S.editor.deltaDecorations(S.deco, list);
      tag.textContent = nums.length ? nums.length + ' lines from ' + v.name : 'nothing from ' + v.name + ' left in this file';
      tag.classList.remove('hidden');
      if(nums.length) S.editor.revealLineInCenterIfOutsideViewport(nums[0]);
    });
  }

  function save(){
    if(!S.path || !S.dirty) return;
    var text = S.editor.getValue(), b = $('saveBtn');
    b.disabled = true; b.textContent = 'Saving...';
    return OPEBridge.call('write', {path: S.path, text: text}).then(function(){
      S.loadedText = text; setDirty(false); b.textContent = 'Save';
      status('Saved ' + S.path);
    }).catch(function(e){ b.textContent = 'Save'; setDirty(true); status(e.message); });
  }

  function checkpointFile(){
    if(!S.path) return;
    var go = S.dirty ? save() : Promise.resolve();
    var b = $('checkBtn'); b.disabled = true; b.textContent = 'Saving...';
    Promise.resolve(go).then(function(){ return OPEGit.checkpoint(S.path); }).then(function(){
      status('Checkpoint saved for ' + S.path); return reload();
    }).catch(function(e){ status(e.message); })
      .then(function(){ b.disabled = false; b.textContent = 'Checkpoint'; });
  }

  /* ------------------------------------------------------------ live */
  var pending = null;
  OPEBridge.onChange(function(ev){
    if(!S.root) return;
    clearTimeout(pending);
    pending = setTimeout(function(){
      var paths = ev.paths || [];
      reload().then(function(){
        if(!S.path) return;
        var touched = !paths.length || paths.some(function(p){ return p === S.path || p.slice(-S.path.length) === S.path; });
        if(!touched) return;
        OPEBridge.call('read', {path: S.path}).then(function(r){
          if(r.text == null || r.text === S.editor.getValue()) return;
          if(!S.dirty){
            var pos = S.editor.getPosition(), top = S.editor.getScrollTop();
            S.loadedText = r.text; S.editor.getModel().setValue(r.text); setDirty(false);
            if(pos) S.editor.setPosition(pos); S.editor.setScrollTop(top);
            paintLines(); status('Updated ' + S.path + ' from disk');
          } else {
            var n = $('notice');
            n.innerHTML = '<span>' + esc(base(S.path)) + ' changed on disk while you were editing.</span>'+
              '<button class="btn" id="takeDisk" type="button">Load the new version</button>'+
              '<button class="btn" id="keepMine" type="button">Keep mine</button>';
            n.classList.remove('hidden');
            $('takeDisk').onclick = function(){ n.classList.add('hidden'); S.loadedText = r.text; S.editor.getModel().setValue(r.text); setDirty(false); paintLines(); };
            $('keepMine').onclick = function(){ n.classList.add('hidden'); };
          }
        }).catch(function(){});
      });
    }, 150);
  });

  /* ------------------------------------------------------------ folding */
  function fold(panel, shut){
    var el = $(panel);
    var now = shut == null ? !el.classList.contains('shut') : shut;
    el.classList.toggle('shut', now);
    var chev = el.querySelector('.chev');
    if(chev) chev.textContent = now ? '›' : '‹';
    try{ localStorage.setItem('ope-fold-' + panel, now ? '1' : ''); }catch(e){}
    if(S.editor) setTimeout(function(){ S.editor.layout(); }, 30);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-fold]'), function(h){
    h.onclick = function(){ fold(h.getAttribute('data-fold')); };
  });
  $('chatLogo').onclick = function(){ fold('chat'); };
  /* a narrow window folds the chat first, then the projects, once, as it crosses */
  var lastW = innerWidth;
  function narrow(){
    var w = innerWidth;
    if(w < 1240 && lastW >= 1240) fold('chat', true);
    if(w < 1040 && lastW >= 1040) fold('projects', true);
    lastW = w;
  }
  addEventListener('resize', narrow);
  if(innerWidth < 1240){ lastW = 9999; narrow(); }
  ['projects', 'chat'].forEach(function(p){
    try{ if(localStorage.getItem('ope-fold-' + p)) fold(p, true); }catch(e){}
  });

  /* OPE Chat: it can be clicked and typed into, and it is honest that it is not
     answering yet */
  $('askForm').onsubmit = function(e){
    e.preventDefault();
    var box = $('askIn'), text = box.value.trim();
    if(!text) return box.focus();
    var log = $('chatLog');
    var soon = log.querySelector('.soon'); if(soon) soon.remove();
    log.insertAdjacentHTML('beforeend', '<div class="chat-msg me">' + esc(text) + '</div>' +
      '<div class="chat-msg">OPE Chat is coming soon. Your project is not sent anywhere.</div>');
    log.scrollTop = log.scrollHeight;
    box.value = '';
  };
  $('askIn').onkeydown = function(e){ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); $('askForm').requestSubmit(); } };

  /* ------------------------------------------------------------ start */
  $('where').onclick = pickProject;
  $('saveBtn').onclick = save;
  $('checkBtn').onclick = checkpointFile;
  Array.prototype.forEach.call(document.querySelectorAll('.rail .ico'), function(b){
    b.onclick = function(){
      var v = b.getAttribute('data-view');
      if(v === 'open') return pickProject();
      document.querySelectorAll('.rail .ico').forEach(function(x){ x.classList.toggle('on', x === b); });
      if(v === 'prompt') welcome();
      if(v === 'projects'){ if(S.path) show('code'); else if(S.root) blank('Pick a project on the left, then a version.<br>Folders it touched get a green box.'); else welcome(); }
    };
  });
  window.addEventListener('beforeunload', function(e){ if(S.dirty){ e.preventDefault(); e.returnValue = ''; } });

  renderProjects(); renderTree();
  Promise.all([
    OPEBridge.call('hello').catch(function(){ return {}; }),
    OPEBridge.call('prompt').catch(function(){ return {text:''}; }),
    /* the code view must never stop the app from opening */
    Promise.race([loadMonaco(), new Promise(function(done){ setTimeout(done, 8000); })])
  ]).then(function(res){
    S.recent = res[0].recent || [];
    S.library = res[0].library || [];
    S.promptText = res[1].text || '';
    if(res[0].root) openRoot(res[0].root, true);
    else welcome();
  });
  window.OPE = {state: S, openRoot: openRoot};
})();
