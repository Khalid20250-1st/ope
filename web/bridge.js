/* THE BRIDGE. The interface never touches the disk or git itself. It asks.

   In the Mac app the Swift side answers (mac/main.swift). In a browser, for
   building and testing, scripts/dev-server.mjs answers the same commands over
   HTTP. Nothing else in the interface knows which one it is talking to. */
(function(){
  var handlers = [];
  var native = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ope);

  function call(cmd, args){
    var msg = Object.assign({cmd: cmd}, args || {});
    var p = native
      ? window.webkit.messageHandlers.ope.postMessage(msg)
      : fetch('/bridge', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(msg)})
          .then(function(r){ return r.json(); });
    return Promise.resolve(p).then(function(out){
      if(out && out.error) throw new Error(out.error);
      return out || {};
    });
  }

  /* the disk changed: files written by the AI, a checkpoint saved, an edit */
  function onChange(fn){ handlers.push(fn); }
  function emit(ev){ handlers.forEach(function(fn){ try{ fn(ev || {}); }catch(e){ console.error(e); } }); }
  if(!native && window.EventSource){
    var es = new EventSource('/events');
    es.onmessage = function(m){ try{ emit(JSON.parse(m.data)); }catch(e){} };
  }

  /* a fault in the interface is said out loud, in the status bar and in the
     app's own log, instead of leaving a blank window */
  function report(msg){
    try{ var el = document.getElementById('statusLeft'); if(el) el.textContent = 'Something went wrong: ' + msg; }catch(e){}
    try{ call('log', {text: String(msg)}).catch(function(){}); }catch(e){}
  }
  window.addEventListener('error', function(e){ report((e.message || 'error') + ' at ' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  window.addEventListener('unhandledrejection', function(e){ report(e.reason && e.reason.message || String(e.reason)); });

  window.OPEBridge = { native: native, call: call, onChange: onChange, emit: emit, report: report };
})();
