var books=[],view='home',added=0,back='home',cur=null,deck=[],pos=0,flipped=false,mode='all',editing=false,draft={name:'',text:''},opts={rand:false,rev:false},aud={ids:[],i:0,on:false,tok:0,rate:1,loop:true};
try{books=JSON.parse(localStorage.getItem('fc_books')||'[]')}catch(e){books=[]}
try{opts=Object.assign(opts,JSON.parse(localStorage.getItem('fc_opts')||'{}'))}catch(e){}
function nid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
books.forEach(function(b){
  var old=b.wrong||[],legacy=b.words.some(function(w){return w.id==null});
  b.words.forEach(function(w){if(w.id==null)w.id=nid()});
  if(legacy)b.wrong=old.map(function(i){return b.words[i]&&b.words[i].id}).filter(Boolean);
});
function save(){try{localStorage.setItem('fc_books',JSON.stringify(books));localStorage.setItem('fc_opts',JSON.stringify(opts))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function parse(t){
  return t.replace(/^\uFEFF/,'').split(/\r?\n/).map(function(l){return l.trim()}).filter(Boolean).map(function(l){
    var i=l.indexOf('/');if(i<0)i=l.indexOf('\t');if(i<0)i=l.indexOf(',');
    if(i<0)return null;
    return{id:nid(),w:l.slice(0,i).trim(),m:l.slice(i+1).trim(),s:0};
  }).filter(function(x){return x&&x.w&&x.m});
}
var SPK='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M4 9.5h3l5-4v13l-5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/><path d="M20.5 4a11 11 0 0 1 0 16"/></svg>';
function lang(t){return /[가-힣]/.test(t)?'ko-KR':'en-US'}
function speak(t){try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=lang(t);speechSynthesis.speak(u)}catch(e){}}
function book(){return books[cur]}
function W(id){return book().words.filter(function(x){return x.id===id})[0]}
function sp(id){speak(W(id).w)}
function go(v){view=v;render()}
function tx(id,s){var e=document.getElementById(id);if(e)e.textContent=s}
function B(l,c,k){return '<button'+(k?' class="'+k+'"':'')+' onclick="'+c+'">'+l+'</button>'}
function hd(t,left,right){return '<div class="hd">'+(left?'<button class="sq" onclick="'+left+'">←</button>':'')+'<h1>'+esc(t)+'</h1>'+(right||'')+'</div>'}
function fab(c){return '<button class="fab" onclick="'+c+'">+</button>'}
function tg(l,on,c){return '<button class="tg" onclick="'+c+'"><span>'+l+'</span><span>'+(on?'■':'□')+'</span></button>'}
function tog(k){opts[k]=!opts[k];save();render()}
function rows(list){
  var h='';
  list.forEach(function(w){h+='<div class="w"><div class="wt"'+(editing?' onclick="editWord(\''+w.id+'\')"':'')+'><b>'+esc(w.w)+'</b><span>'+esc(w.m)+'</span></div><button class="ic" onclick="sp(\''+w.id+'\')">'+SPK+'</button>'+(editing?'<button class="ic" onclick="delWord(\''+w.id+'\')">✕</button>':'<button class="ic" onclick="star(\''+w.id+'\')">'+(w.s?'★':'☆')+'</button>')+'</div>'});
  return h;
}
function render(){
  var a=document.getElementById('app'),h='',b=books[cur];a.className=view==='study'?'s':'';
  if(view==='home'){
    h=hd('단어장');
    books.forEach(function(x,i){h+='<div class="bk" onclick="openBook('+i+')"><b>'+esc(x.name)+'</b>'+x.words.length+'개</div>'});
    h+='<div class="bk add" onclick="newBook()">+</div>';
  }else if(view==='new'){
    h=hd('새 묶음',"go('home')")
     +'<label class="t">이름</label><input type="text" value="'+esc(draft.name)+'" oninput="draft.name=this.value">'
     +'<label class="t">단어 붙여넣기</label><textarea placeholder="apple/사과&#10;banana/바나나&#10;grape/포도" oninput="draft.text=this.value;pv()">'+esc(draft.text)+'</textarea>'
     +'<div class="note" id="pv">'+parse(draft.text).length+'개 인식</div>'
     +'<label class="fl">파일 불러오기<input type="file" accept=".txt,.csv,text/plain" onchange="loadFile(this)"></label>'
     +B('만들기',"createBook()",'p').replace('<button','<button style="width:100%;min-height:60px"');
  }else if(view==='book'){
    var nf=b.words.filter(function(w){return w.s}).length;
    h=hd(b.name+' ('+b.words.length+')',"go('home')",'<button class="ed" onclick="editing=!editing;render()">'+(editing?'완료':'편집')+'</button>')
     +'<div class="g">'+B('듣기',"listen('all')",'p')+B('학습하기',"ready('all')",'p')+B('즐겨찾기 ('+nf+')',"go('fav')")+B('틀린단어 ('+(b.wrong||[]).length+')',"go('wrong')")+'</div>'
     +rows(b.words)+'<div class="w ar" onclick="newWord()">+</div>'
     +'<button style="width:100%;margin-top:28px" onclick="delBook()">이 단어장 삭제</button>';
  }else if(view==='fav'){
    var f=b.words.filter(function(w){return w.s});
    h=hd('즐겨찾기 ('+f.length+')',"go('book')")
     +(f.length?'<div class="g">'+B('듣기',"listen('star')",'p')+B('학습하기',"ready('star')",'p')+'</div>'+rows(f):'<div class="empty">비어 있어요</div>');
  }else if(view==='wrong'){
    var wr=(b.wrong||[]).map(W).filter(Boolean);
    h=hd('틀린단어 ('+wr.length+')',"go('book')")
     +(wr.length?'<div class="g g3">'+B('듣기',"listen('wrong')",'p')+B('학습',"ready('wrong')",'p')+B('↻ 리셋',"resetWrong()")+'</div>'+rows(wr):'<div class="empty">비어 있어요</div>');
  }else if(view==='setup'){
    h=hd('학습 설정',"go(back)")+tg('무작위 순서',opts.rand,"tog('rand')")+tg('반대로 (뜻 → 영어)',opts.rev,"tog('rev')")
     +B('시작',"study(mode)",'p').replace('<button','<button style="width:100%;min-height:68px;margin-top:10px;font-size:18px"');
  }else if(view==='study'){
    var w=W(deck[pos]),front=opts.rev?w.m:w.w,bk=opts.rev?w.w:w.m;
    h='<div class="st"><div class="hd"><button class="sq" onclick="go(back)">←</button><div class="bar"><i style="width:'+(pos/deck.length*100)+'%"></i></div><span>'+(pos+1)+'/'+deck.length+'</span></div>'
     +'<div class="card" id="cd" onclick="flip()">'+esc(flipped?bk:front)+'</div>'
     +'<div class="xv"><button onclick="mark(0)" '+(flipped?'':'disabled')+'>X</button><button onclick="mark(1)" '+(flipped?'':'disabled')+'>V</button></div>'
     +'<div class="tl">'+B(SPK,"sp('"+w.id+"')")+B('틀린단어',"go('wrong')")+B('↻ 리셋',"resetStudy()")+'</div></div>';
  }else if(view==='done'){
    h=hd('학습 완료',"go(back)")+'<div class="empty">틀린 단어 '+(b.wrong||[]).length+'개</div><div class="g">'+B('다시 학습',"study(mode)",'p')+B('틀린단어 보기',"go('wrong')")+'</div>';
  }else if(view==='addw'){
    h=hd('단어 추가',"go('book')")
     +'<input type="text" id="aw" placeholder="단어" autocapitalize="off" onkeydown="enterNext(event)"><input type="text" id="am" placeholder="뜻" onkeydown="enterAdd(event)">'
     +B('추가',"addWord()",'p').replace('<button','<button style="width:100%;min-height:60px"')
     +(added?'<div class="note">추가함 '+added+'개</div>':'')
     +'<label class="t">여러 개 한 번에</label><textarea id="bulk" placeholder="apple/사과&#10;banana/바나나"></textarea>'
     +'<label class="fl">파일 불러오기<input type="file" accept=".txt,.csv,text/plain" onchange="loadBulk(this)"></label>'
     +B('추가',"addBulk()").replace('<button','<button style="width:100%;min-height:60px"');
  }else if(view==='play'){
    var c=W(aud.ids[aud.i])||{w:'',m:''};
    h=hd('듣기',"leavePlay()")
     +'<div class="pl"><div id="ac">'+(aud.i+1)+' / '+aud.ids.length+'</div><div id="aw1">'+esc(c.w)+'</div><div id="am1">'+esc(c.m)+'</div></div>'
     +'<div class="ctl">'+B('◀◀',"jump(-1)")+B(aud.on?'❚❚':'▶',"toggleAud()",'p')+B('▶▶',"jump(1)")+'</div>'
     +'<div class="g">'+B('속도 '+aud.rate+'x',"aRate()")+B('반복 '+(aud.loop?'■':'□'),"aLoop()")+'</div>';
  }
  a.innerHTML=h;
  if(view==='addw'){var e=document.getElementById('aw');if(e)e.focus()}
  var cd=document.getElementById('cd');
  if(cd){var sx=null;cd.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});cd.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>50){if(!flipped)flip();else mark(dx>0?1:0)}})}
}
function pv(){tx('pv',parse(draft.text).length+'개 인식')}
function newBook(){draft={name:'',text:''};go('new')}
function newWord(){added=0;go('addw')}
function loadBulk(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){document.getElementById('bulk').value=String(r.result)};r.readAsText(f,'utf-8')}
function loadFile(inp){
  var f=inp.files[0];if(!f)return;var r=new FileReader();
  r.onload=function(){draft.text=String(r.result);if(!draft.name)draft.name=f.name.replace(/\.[^.]+$/,'');render()};
  r.readAsText(f,'utf-8');
}
function createBook(){
  books.push({name:draft.name.trim()||'새 단어장',words:parse(draft.text),wrong:[]});save();
  cur=books.length-1;editing=false;go('book');
}
function openBook(i){cur=i;editing=false;go('book')}
function delBook(){if(confirm('이 단어장을 삭제할까요?')){books.splice(cur,1);save();go('home')}}
function star(id){var w=W(id);w.s=w.s?0:1;save();render()}
function editWord(id){var w=W(id),a=prompt('단어',w.w);if(a===null)return;var m=prompt('뜻',w.m);if(m===null)return;a=a.trim();m=m.trim();if(a&&m){w.w=a;w.m=m;save()}render()}
function enterNext(e){if(e.key==='Enter'){e.preventDefault();document.getElementById('am').focus()}}
function enterAdd(e){if(e.key==='Enter'){e.preventDefault();addWord()}}
function addWord(){
  var w=document.getElementById('aw').value.trim(),m=document.getElementById('am').value.trim();
  if(!w||!m){alert('단어와 뜻을 입력해주세요.');return}
  book().words.push({id:nid(),w:w,m:m,s:0});added++;save();render();
}
function addBulk(){
  var p=parse(document.getElementById('bulk').value);
  if(!p.length){alert('인식된 단어가 없어요.');return}
  book().words=book().words.concat(p);added+=p.length;save();render();
}
function delWord(id){var b=book();b.words=b.words.filter(function(x){return x.id!==id});b.wrong=(b.wrong||[]).filter(function(x){return x!==id});save();render()}
function pick(m){var b=book(),ids=[];b.words.forEach(function(w){if(m==='all'||(m==='star'&&w.s)||(m==='wrong'&&(b.wrong||[]).indexOf(w.id)>=0))ids.push(w.id)});return ids}
function ready(m){mode=m;if(!pick(m).length){alert('단어가 없어요.');return}back=view;go('setup')}
function study(m){
  mode=m;var ids=pick(m);if(!ids.length)return;
  if(opts.rand){for(var i=ids.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=ids[i];ids[i]=ids[j];ids[j]=t}}
  deck=ids;pos=0;flipped=false;go('study');
}
function flip(){flipped=!flipped;render()}
function mark(ok){
  var b=book(),id=deck[pos];b.wrong=b.wrong||[];var k=b.wrong.indexOf(id);
  if(!ok&&k<0)b.wrong.push(id);if(ok&&k>=0)b.wrong.splice(k,1);save();
  pos++;flipped=false;if(pos>=deck.length)go('done');else render();
}
function resetStudy(){if(confirm('처음부터 다시 시작할까요? (틀린 단어 기록도 초기화)')){book().wrong=[];save();study(mode)}}
function resetWrong(){if(confirm('틀린 단어 기록을 비울까요?')){book().wrong=[];save();render()}}
/* audio (radio) */
var ka=null;
function keep(on){
  try{
    if(on&&!ka){
      var n=8000,b=new Uint8Array(44+n),d=new DataView(b.buffer),s=function(o,t){for(var i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i)};
      s(0,'RIFF');d.setUint32(4,36+n,true);s(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,8000,true);d.setUint32(28,8000,true);d.setUint16(32,1,true);d.setUint16(34,8,true);s(36,'data');d.setUint32(40,n,true);b.fill(128,44);
      ka=new Audio(URL.createObjectURL(new Blob([b],{type:'audio/wav'})));ka.loop=true;
    }
    if(ka){if(on)ka.play().catch(function(){});else ka.pause()}
    if('mediaSession' in navigator&&on){
      var ms=navigator.mediaSession;ms.metadata=new MediaMetadata({title:book().name,artist:'단어장'});
      ms.setActionHandler('play',playAud);ms.setActionHandler('pause',stopAud);
      ms.setActionHandler('nexttrack',function(){jump(1)});ms.setActionHandler('previoustrack',function(){jump(-1)});
    }
  }catch(e){}
}
function say(t,tk,cb){
  var u=new SpeechSynthesisUtterance(t),d=false;u.lang=lang(t);u.rate=aud.rate;
  function fin(){if(d)return;d=true;if(tk===aud.tok)cb()}
  u.onend=fin;u.onerror=fin;
  try{speechSynthesis.speak(u)}catch(e){fin()}
}
function wait(ms,tk,f){setTimeout(function(){if(tk===aud.tok&&aud.on)f()},ms)}
function paintAud(){var w=W(aud.ids[aud.i]);if(!w)return;tx('ac',(aud.i+1)+' / '+aud.ids.length);tx('aw1',w.w);tx('am1',w.m)}
function step(tk){
  if(tk!==aud.tok||!aud.on)return;
  var w=W(aud.ids[aud.i]);if(!w){stopAud();return}
  paintAud();
  say(w.w,tk,function(){wait(350,tk,function(){say(w.m,tk,function(){wait(800,tk,function(){
    aud.i++;
    if(aud.i>=aud.ids.length){if(aud.loop)aud.i=0;else{aud.i=0;stopAud();return}}
    step(tk);
  })})})});
}
function playAud(){
  aud.on=true;var tk=++aud.tok;keep(true);
  try{speechSynthesis.cancel()}catch(e){}
  setTimeout(function(){step(tk)},150);
  if(view==='play')render();
}
function stopAud(){
  aud.on=false;aud.tok++;
  try{speechSynthesis.cancel()}catch(e){}
  keep(false);if(view==='play')render();
}
function toggleAud(){if(aud.on)stopAud();else playAud()}
function jump(d){
  var n=aud.ids.length;aud.i=(aud.i+d+n)%n;
  if(aud.on){try{speechSynthesis.cancel()}catch(e){}var tk=++aud.tok;setTimeout(function(){step(tk)},150)}
  paintAud();
}
function aRate(){var r=[0.8,1,1.2,1.5],i=r.indexOf(aud.rate);aud.rate=r[(i+1)%r.length];render()}
function aLoop(){aud.loop=!aud.loop;render()}
function listen(m){
  var ids=pick(m);if(!ids.length){alert('단어가 없어요.');return}
  stopAud();aud.ids=ids;aud.i=0;back=view;view='play';playAud();
}
function leavePlay(){stopAud();go(back)}
document.addEventListener('keydown',function(e){if(view!=='study')return;if(e.key===' '||e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();flip()}else if(flipped&&e.key==='x')mark(0);else if(flipped&&e.key==='v')mark(1)});
render();

if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
