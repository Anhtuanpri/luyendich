const DONATE_NAME="Hoàng xxxxxxxxxxx Tuấn";
const DONATE_NOTE="Sự Ủng Hộ Của Bạn Sẽ Giúp Ích Rất Lớn Cho Chúng Tôi";
const DONATE_QR_IMG="https://www.facebook.com/share/17KTnVMyMs/?mibextid=wwXIfr";
const DONATE_PAY_URL="https://www.facebook.com/share/17KTnVMyMs/?mibextid=wwXIfr";
const ADMIN_PROXY="https://aichatgot.hackpubgso01vn.workers.dev/";

const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const x=document.createElement(t);if(c)x.className=c;if(h!=null)x.innerHTML=h;return x};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const S={items:"ls_items",idx:"ls_idx",attempts:"ls_attempts",api:"ai_key",mdl:"ai_model",ep:"ai_ep",dict:"dict_hist",avatar:"profile_avatar",name:"profile_name",wrp:"wr_prompt",wri:"wr_img"};

const store={
  get items(){try{return JSON.parse(localStorage.getItem(S.items)||"[]")}catch(_){return[]}},
  set items(v){localStorage.setItem(S.items,JSON.stringify(v||[]))},
  get idx(){return parseInt(localStorage.getItem(S.idx)||"0",10)||0},
  set idx(v){localStorage.setItem(S.idx,String(v|0))},
  get attempts(){try{return JSON.parse(localStorage.getItem(S.attempts)||"[]")}catch(_){return[]}},
  set attempts(v){localStorage.setItem(S.attempts,JSON.stringify(v||[]))},
  get key(){return localStorage.getItem(S.api)||""},
  set key(v){localStorage.setItem(S.api,v||"")},
  get mdl(){return localStorage.getItem(S.mdl)||"gpt-4o-mini"},
  set mdl(v){localStorage.setItem(S.mdl,v||"gpt-4o-mini")},
  get ep(){return localStorage.getItem(S.ep)||"https://api.openai.com/v1/chat/completions"},
  set ep(v){localStorage.setItem(S.ep,v||"https://api.openai.com/v1/chat/completions")},
  get dict(){try{return JSON.parse(localStorage.getItem(S.dict)||"[]")}catch(_){return[]}},
  set dict(v){localStorage.setItem(S.dict,JSON.stringify(v||[]))},
  get avatar(){return localStorage.getItem(S.avatar)||""},
  set avatar(v){localStorage.setItem(S.avatar,v||"")},
  get name(){return localStorage.getItem(S.name)||""},
  set name(v){localStorage.setItem(S.name,v||"")},
  get wrp(){return localStorage.getItem(S.wrp)||""},
  set wrp(v){localStorage.setItem(S.wrp,v||"")},
  get wri(){return localStorage.getItem(S.wri)||""},
  set wri(v){localStorage.setItem(S.wri,v||"")}
};

// ===== Helper JSON =====
function parseJSON(s){
  try { return JSON.parse(s); }
  catch { return null; }
}

const root=document.documentElement;
const prefersDark=matchMedia("(prefers-color-scheme: dark)").matches;
if(localStorage.getItem("theme")==="dark"||(!localStorage.getItem("theme")&&prefersDark)){
  root.classList.add("dark");$("#toggleTheme").textContent="🌙"
}
$("#toggleTheme").onclick=()=>{
  root.classList.toggle("dark");
  const d=root.classList.contains("dark");
  localStorage.setItem("theme",d?"dark":"light");
  $("#toggleTheme").textContent=d?"🌙":"🌤️"
};

function applyFooterPadding(){
  const f=$("#footerNav");if(!f)return;
  const h=f.offsetHeight||78;
  root.style.setProperty("--footer-h",h+"px")
}
new ResizeObserver(applyFooterPadding).observe(document.body);
window.addEventListener("load",applyFooterPadding);
window.addEventListener("resize",applyFooterPadding);
applyFooterPadding();

// ===== Tabs & state =====
const tabs=[
  ["#tabPractice","#secPractice"],
  ["#tabManual","#secManual"],
  ["#tabGenSent","#secGenSent"],
  ["#tabSpoken","#secSpoken"],
  ["#tabIELTSGen","#secIELTSGen"],
  ["#tabWriting","#secWriting"],
  ["#tabAsk","#secAsk"],
  ["#tabDict","#secDict"],
  ["#tabHistory","#secHistory"],
  ["#tabSettings","#secSettings"]
];

tabs.forEach(([b,s])=>$(b).onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll("section.card,section.grid").forEach(x=>x.style.display="none");
  $(b).classList.add("active");
  $(s).style.display="grid";
  if(s==="#secHistory")renderHistory();
  if(s==="#secAsk")setTimeout(()=>$("#askInput").focus(),50);
});
let items=store.items.length?store.items:[
  "Chúng tôi đang xem phim ở rạp chiếu phim, phim rất hay.",
  "Họ đang xây một ngôi nhà mới, nó sẽ rất lớn.",
  "Tôi đang học lái xe, tôi rất lo lắng."
];
let idx=clamp(store.idx,0,items.length-1);

function renderPractice(){
  const total=items.length||1;
  idx=clamp(idx,0,total-1);
  $("#viBox").textContent=items[idx]||"—";
  $("#answer").value="";
  $("#gIdea").textContent="—";
  $("#gVocab").textContent="—";
  $("#gGrammar").textContent="—";
  $("#gradeHeader").textContent="Chưa chấm.";
  $("#gradeDiff").innerHTML="";
  $("#gradeDiff").className="diff mono scrollBox simple";
  $("#gradeBreakdown").innerHTML="";
  $("#counter").textContent=`Câu ${idx+1}/${total}`;
  $("#progbar").style.width=`${Math.round(((idx+1)/total)*100)}%`;
  store.items=items;store.idx=idx;
}
renderPractice();

$("#btnPrev").onclick=()=>{idx=clamp(idx-1,0,items.length-1);renderPractice()};
$("#btnNext").onclick=()=>{idx=clamp(idx+1,0,items.length-1);renderPractice()};
window.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft")$("#btnPrev").click();
  if(e.key==="ArrowRight")$("#btnNext").click();
});

function setBusy(on){
  document.querySelectorAll("button").forEach(b=>b.disabled=!!on)
}

// ===== OpenAI/Proxy Call =====
async function callOpenAI(sys, usr, max_tokens = 900) {
  let url, headers, model;

  if (store.key) { // Có API key cá nhân -> gọi thẳng OpenAI
    url = (store.ep || "https://api.openai.com/v1/chat/completions").replace(/\/+$/,'');
    url += "/v1/chat/completions".replace("/v1/chat/completions",""); // đảm bảo đúng endpoint nếu ep đã đủ
    headers = { "Authorization": "Bearer " + store.key, "Content-Type": "application/json" };
    model = store.mdl || "gpt-4o-mini";
  } else {         // Không có key -> đi qua Worker proxy
    const base = ADMIN_PROXY.replace(/\/+$/,'');       // xoá dấu / thừa cuối URL
    url = base + "/v1/chat/completions";               // ✨ BẮT BUỘC: thêm endpoint
    headers = { "Content-Type": "application/json" };
    model = store.mdl || "gpt-4o-mini";
  }

  const body = {
    model,
    temperature: 0.2,
    max_tokens,
    messages: [
      { role: "system", content: sys },
      { role: "user",   content: usr }
    ]
  };

  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });

  // đọc text để báo lỗi rõ ràng
  const txt = await r.text();
  let data;
  try { data = JSON.parse(txt); } catch { throw new Error(txt || `HTTP ${r.status}`); }
  if (!r.ok) throw new Error(data.error?.message || data.message || `HTTP ${r.status}`);

  return data.choices?.[0]?.message?.content || "";
}

// ===== Diff & Metrics =====
function tokenize(s){
  return (s||"").replace(/\s+/g," ").trim()
    .split(/(\s+|[.,!?;:;()'"-])/).filter(x=>x!=="")
}
function diffCompact(a,b,maxSameRun=28){
  const A=tokenize(a),B=tokenize(b);
  const m=A.length,n=B.length;const dp=[...Array(m+1)].map(()=>Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)
    dp[i][j]=A[i]===B[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0,buf=[],sameRun=0;
  const flushSame=()=>{if(sameRun>0){
    if(sameRun>maxSameRun)buf.push('<span class="ellipsis"> … </span>');
    else for(let k=0;k<sameRun;k++)buf.push(esc(A[i-sameRun+k]));
    sameRun=0}};
  while(i<m&&j<n){
    if(A[i]===B[j]){sameRun++;i++;j++;if(sameRun>maxSameRun+10){flushSame()}}
    else if(dp[i+1][j]>=dp[i][j+1]){flushSame();buf.push(`<span class="del">${esc(A[i])}</span>`);i++}
    else{flushSame();buf.push(`<span class="ins">${esc(B[j])}</span>`);j++}
  }
  while(i<m){flushSame();buf.push(`<span class="del">${esc(A[i++])}</span>`)}
  while(j<n){flushSame();buf.push(`<span class="ins">${esc(B[j++])}</span>`)}
  flushSame();return buf.join("")
}
function diffWriting(userText,revisionText,severity="near"){
  const A=tokenize(userText),B=tokenize(revisionText);
  const m=A.length,n=B.length;const dp=[...Array(m+1)].map(()=>Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)
    dp[i][j]=(A[i]===B[j])?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
  let i=0,j=0,buf=[];
  const mark=t=>(t.trim()==="")?esc(t):`<span class="${severity}">${esc(t)}</span>`;
  while(i<m&&j<n){
    if(A[i]===B[j]){buf.push(esc(B[j]));i++;j++}
    else if(dp[i+1][j]>=dp[i][j+1]){i++}
    else{buf.push(mark(B[j]));j++}
  }
  while(j<n){buf.push(mark(B[j++]))}
  return buf.join("")
}
function similarity(a,b){
  const tok=s=>new Set((s||"").toLowerCase().match(/[a-z']+/g)||[]);
  const A=tok(a),B=tok(b);let inter=0;A.forEach(x=>{if(B.has(x))inter++});
  const uni=A.size+B.size-inter||1;return inter/uni
}
// ===== Prompts =====
const SIMPLE_PROMPT=`You are a VERY STRICT English corrector for Vietnamese→English translations. Your task: always return STRICT JSON ONLY with this schema: {"score": 10-100,"explain_vi": "ngắn gọn bằng tiếng Việt","correction": "English corrected sentence (always natural & grammatically correct)"}`;
const SIMPLE_PROMPT_LONG=`You are a VERY STRICT English corrector for Vietnamese→English translation of a long text. Your task: always return STRICT JSON ONLY with this schema: {"score": 10-100,"explain_vi": "ngắn gọn bằng tiếng Việt","correction": "English corrected paragraph (always natural & grammatically correct)"}`;
const IELTS_PROMPT=`You are a VERY STRICT IELTS-style grader for short English output from a Vietnamese source. Return STRICT JSON ONLY:{"overall_score":0-100,"criteria":{"grammar":{"score":0-25,"explain_vi":"...","suggest":"..."},"vocabulary":{"score":0-25,"explain_vi":"...","suggest":"..."},"coherence":{"score":0-25,"explain_vi":"...","suggest":"..."},"task":{"score":0-25,"explain_vi":"...","suggest":"..."}},"errors":[{"type":"...","from":"…","to":"…","explain_vi":"…"}],"suggest_revision":"..."}`;
const IELTS_WR_SYS=`You are a STRICT IELTS Writing examiner for Task 1/Task 2. Return STRICT JSON ONLY:{"overall_score":0-100,"criteria":{"grammar":{"score":0-25,"explain_vi":"...","suggest":"..."},"vocabulary":{"score":0-25,"explain_vi":"...","suggest":"..."},"coherence":{"score":0-25,"explain_vi":"...","suggest":"..."},"task":{"score":0-25,"explain_vi":"...","suggest":"..."}},"errors":[{"type":"...","from":"…","to":"…","explain_vi":"…"}],"suggest_revision":"..."}`;

// ===== Grading utils =====
function bandFromScore(s){
  if(s>=95)return 9;if(s>=85)return 8;if(s>=75)return 7;if(s>=65)return 6;
  if(s>=55)return 5;if(s>=45)return 4;if(s>=35)return 3;if(s>=25)return 2;
  return 1
}
function metrics(text){
  const t=(text||"").replace(/\s+/g," ").trim();
  const words=(t.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g)||[]);
  const wordCount=words.length;
  const types=new Set(words.map(w=>w.toLowerCase())).size;
  const ttr=wordCount?types/wordCount:0;
  const sentences=(t.split(/[.!?]+/).map(s=>s.trim()).filter(Boolean));
  const sentCount=sentences.length||0;
  const avgLen=wordCount&&sentCount?wordCount/sentCount:wordCount;
  const clauseMarkers=(t.match(/\b(and|but|because|although|however|which|that|who|while|whereas|moreover|therefore|in addition|on the other hand)\b/gi)||[]).length;
  const linking=(t.match(/\b(firstly|secondly|finally|overall|in general|to conclude|in conclusion|as a result|for example|for instance)\b/gi)||[]).length;
  return{wordCount,ttr,sentCount,avgLen,clauseMarkers,linking}
}
function capByMode(text,mode){
  const m=metrics(text);let cap=9;
  if(m.wordCount<10)cap=4.5;
  else if(m.sentCount<=1&&m.wordCount<20)cap=Math.min(cap,5);
  if(m.clauseMarkers<1)cap=Math.min(cap,6);
  if(m.avgLen<10)cap=Math.min(cap,6);
  if(m.ttr<0.35)cap=Math.min(cap,6.5);
  if(m.ttr<0.28)cap=Math.min(cap,6);
  if(mode==="task2"){
    if(m.wordCount<180)cap=Math.min(cap,6);
    else if(m.wordCount<220)cap=Math.min(cap,7)
  }
  if(mode==="task1"){
    if(m.wordCount<150)cap=Math.min(cap,6.5);
    if(!/\boverall|in general\b/i.test(text))cap=Math.min(cap,6.5)
  }
  if(mode==="spoken"){
    if(m.wordCount<120||m.sentCount<3)cap=Math.min(cap,6)
  }
  return{cap,m}
}
function showGradingResult(userText,js,headEl,diffEl,breakdownEl,label,mode){
  const baseBand=bandFromScore(js.overall_score);
  const {cap,m}=capByMode(userText,mode||null);
  let band=Math.min(baseBand,cap);
  let adjScore=js.overall_score;
  if(baseBand>band){adjScore=Math.max(0,Math.round(js.overall_score*(band/baseBand)))}
  const sim=similarity(userText,js.suggest_revision||"");
  headEl.innerHTML=`<b>${label}: ${adjScore} — Band ${band.toFixed(1)}</b> <span class="subtle">(${m.wordCount}w, ${m.sentCount}s, TTR ${(m.ttr||0).toFixed(2)})</span>${sim>=0.92?" • Ít chỉnh":""}`;
  const finalRev=(sim>=0.92)?userText:(js.suggest_revision||userText);
  const isWriting=(mode==="spoken"||mode==="task1"||mode==="task2");
  diffEl.className="diff mono scrollBox "+(isWriting?"writing":"simple");
  if(isWriting){
    const sev=(band>=7?"good":(band>=5?"near":"bad"));
    diffEl.innerHTML=diffWriting(userText,finalRev,sev)
  }else{
    diffEl.innerHTML=diffCompact(userText,finalRev)
  }
  const c=js.criteria||{};
  breakdownEl.innerHTML=`
    <div class="card row"><b>Grammar</b>: ${c.grammar?.score??0}/25<div class="subtle">${esc(c.grammar?.explain_vi||"")}</div><div class="mono">${esc(c.grammar?.suggest||"")}</div></div>
    <div class="card row"><b>Vocabulary</b>: ${c.vocabulary?.score??0}/25<div class="subtle">${esc(c.vocabulary?.explain_vi||"")}</div><div class="mono">${esc(c.vocabulary?.suggest||"")}</div></div>
    <div class="card row"><b>Coherence</b>: ${c.coherence?.score??0}/25<div class="subtle">${esc(c.coherence?.explain_vi||"")}</div><div class="mono">${esc(c.coherence?.suggest||"")}</div></div>
    <div class="card row"><b>Task/Complexity</b>: ${c.task?.score??0}/25<div class="subtle">${esc(c.task?.explain_vi||"")}</div><div class="mono">${esc(c.task?.suggest||"")}</div></div>
    ${Array.isArray(js.errors)&&js.errors.length?`<div class="card row"><b>Lỗi</b><div>${js.errors.map(e=>`<span class="errtag mono">[${esc(e.type)}] "${esc(e.from)}" → "${esc(e.to)}" — ${esc(e.explain_vi)}</span>`).join("")}</div></div>`:""}
  `;
}
// ===== Simple/IELTS graders =====
function splitBySentences(text){
  const s=(text||"").trim().replace(/\s+/g," ");
  return s.length?s.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean):[];
}
function groupChunks(sents,maxWords=60,maxSents=3){
  const groups=[];let cur=[];let wc=0;
  for(const s of sents){
    const w=(s.match(/[A-Za-z]+/g)||[]).length;
    if(cur.length&&(wc+w>maxWords||cur.length>=maxSents)){
      groups.push(cur.join(" "));cur=[s];wc=w;
    }else{cur.push(s);wc+=w}
  }
  if(cur.length)groups.push(cur.join(" "));
  return groups;
}
async function gradeSimpleSmart(vi,en){
  const words=(en.match(/[A-Za-z]+/g)||[]).length;
  if(words<=40){
    const r=parseJSON(await callOpenAI(SIMPLE_PROMPT,`VI: ${vi}\nEN: ${en}`,500));
    if(!r||typeof r.score!=="number"||!r.correction)throw"Bad result";
    return{score:r.score,explain:r.explain_vi||"",corr:r.correction};
  }
  const sents=splitBySentences(en);
  const chunks=groupChunks(sents,80,3).slice(0,6);
  let totalScore=0,totalLen=0,allExplain=[],corrParts=[];
  for(const ch of chunks){
    const len=(ch.match(/[A-Za-z]+/g)||[]).length||1;
    const usr=`FULL_VI:\n${vi}\n\nEN_CHUNK:\n${ch}`;
    const r=parseJSON(await callOpenAI(SIMPLE_PROMPT_LONG,usr,450));
    if(!r||typeof r.score!=="number"||!r.correction)continue;
    totalScore+=r.score*len;totalLen+=len;
    allExplain.push(r.explain_vi||"");
    corrParts.push(r.correction.trim());
  }
  if(!totalLen)throw"Không chấm được";
  const avgScore=Math.round(totalScore/totalLen);
  const corr=corrParts.join(" ").replace(/\s+/g," ").trim();
  const explain=allExplain.filter(Boolean).slice(0,4).join(" | ");
  return{score:avgScore,explain,corr};
}

// ===== Buttons: Practice =====
$("#btnUseManual").onclick=()=>{
  const raw=($("#manualVI").value||"").trim();
  if(!raw){$("#manualHint").textContent="Bạn chưa nhập nội dung.";return}
  const lines=raw.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if(!lines.length){$("#manualHint").textContent="Không có câu hợp lệ.";return}
  items=items.concat(lines);store.items=items;idx=items.length-lines.length;
  $("#manualHint").textContent=`Đã thêm ${lines.length} câu.`;
  setTimeout(()=>{$("#manualHint").textContent="";$("#tabPractice").click();renderPractice()},900);
};

$("#btnSuggest").onclick=async()=>{
  const vi=items[idx];
  const sys=`Bạn là AI Teacher. Trả JSON {"idea_en":"","idea_vi":"","vocab_en":[""],"vocab_vi":[""],"grammar_en":[""],"grammar_vi":[""]}`;
  try{
    setBusy(true);$("#hint").textContent="Đang gợi ý...";
    const js=parseJSON(await callOpenAI(sys,"Vietnamese: "+vi,450));
    if(!js)throw"Lỗi";
    const showVI=$("#toggleViGloss").checked;
    $("#gIdea").textContent=(js.idea_en||"—")+(showVI&&js.idea_vi?` — ${js.idea_vi}`:"");
    $("#gVocab").textContent=(js.vocab_en||[]).join(", ")+(showVI&&js.vocab_vi?.length?` — ${js.vocab_vi.join(", ")}`:"");
    $("#gGrammar").textContent=(js.grammar_en||[]).join("; ")+(showVI&&js.grammar_vi?.length?` — ${js.grammar_vi.join("; ")}`:"");
    $("#hint").textContent="";
  }catch(e){$("#hint").textContent=e+""}finally{setBusy(false)}
};

$("#btnTranslateNow").onclick=async()=>{
  const vi=items[idx];
  const sys=`Translate Vietnamese to natural English. Return plain text.`;
  try{
    setBusy(true);$("#hint").textContent="Đang dịch...";
    const en=await callOpenAI(sys,vi,250);
    $("#answer").value=en.trim();$("#hint").textContent="Đã dịch.";
  }catch(e){$("#hint").textContent="Lỗi: "+e}finally{setBusy(false)}
};

$("#btnGradeSimple").onclick=async()=>{
  const vi=items[idx],en=($("#answer").value||"").trim();
  if(!en){$("#hint").textContent="Bạn chưa nhập bản dịch.";return}
  try{
    setBusy(true);$("#hint").textContent="Đang chấm...";
    const r=await gradeSimpleSmart(vi,en);
    $("#gradeHeader").innerHTML=`<b>Điểm (Simple): ${Math.round(r.score)}</b> — ${esc(r.explain||"")}`;
    $("#gradeDiff").className="diff mono scrollBox simple";
    $("#gradeDiff").innerHTML=diffCompact(en,r.corr);
    $("#gradeBreakdown").innerHTML="";
    $("#hint").textContent="";
    addHistory({type:"simple",input:vi,score:r.score,band:null,ok:r.score>=90});
  }catch(e){
    $("#gradeHeader").textContent="Lỗi: "+e;
    $("#gradeDiff").innerHTML="";$("#gradeBreakdown").innerHTML="";
  }finally{setBusy(false)}
};

$("#btnGradeIELTS").onclick=async()=>{
  const vi=items[idx],en=($("#answer").value||"").trim();
  if(!en){$("#hint").textContent="Bạn chưa nhập bản dịch.";return}
  try{
    setBusy(true);$("#hint").textContent="Đang chấm IELTS...";
    const r=parseJSON(await callOpenAI(IELTS_PROMPT,`VI: ${vi}\nEN: ${en}`,900));
    if(!r||!r.criteria)throw"Lỗi";
    showGradingResult(en,r,$("#gradeHeader"),$("#gradeDiff"),$("#gradeBreakdown"),"IELTS Overall","spoken");
    addHistory({type:"ielts",input:vi,score:r.overall_score,band:bandFromScore(r.overall_score),ok:false});
    $("#hint").textContent="";
  }catch(e){
    $("#gradeHeader").textContent="Lỗi: "+e;
    $("#gradeDiff").innerHTML="";$("#gradeBreakdown").innerHTML="";
  }finally{setBusy(false)}
};
// ===== Generate Sentences (VI) =====
$("#btnGSGen").onclick=async()=>{
  const band=$("#gsBand").value, len=$("#gsLen").value,
        n=clamp(parseInt($("#gsCount").value||"6",10)||6,1,30),
        topic=$("#gsTopic").value.trim()||"chung",
        ctx=$("#gsContext").value.trim();
  const lengthHint=len==="short"?"~8–15":"~12–20";
  const sys=`Sinh câu TIẾNG VIỆT theo band CEFR. Trả JSON {"sentences":["..."]}`;
  const usr=`Band: ${band}\nSố câu: ${n}\nĐộ dài: ${lengthHint} từ\nChủ đề: ${topic}\nNgữ cảnh: ${ctx||"(trống)"}`;
  try{
    setBusy(true);$("#gsHint").textContent="Đang tạo...";
    const js=parseJSON(await callOpenAI(sys,usr,600));
    if(!js?.sentences?.length)throw"Lỗi";
    $("#gsOut").textContent=js.sentences.join("\n");
    $("#gsHint").textContent="Đã tạo.";
  }catch(e){
    $("#gsOut").textContent="Lỗi: "+e;$("#gsHint").textContent="";
  }finally{setBusy(false)}
};
$("#btnGSUse").onclick=()=>{
  const t=$("#gsOut").textContent.trim();if(!t)return;
  const arr=t.split(/\n+/).map(s=>s.trim()).filter(Boolean);if(!arr.length)return;
  items=items.concat(arr);store.items=items;idx=items.length-arr.length;
  renderPractice();$("#tabPractice").click();
};

// ===== Spoken essay (VI) =====
$("#btnSpGen").onclick=async()=>{
  const topic=$("#spTopic").value.trim()||"đời sống",
        len=$("#spLen").value,
        words=len==="short"?110:(len==="long"?260:180),
        ctx=$("#spContext").value.trim();
  const sys=`Sinh bài VĂN NÓI TIẾNG VIỆT ~${words} từ. Trả JSON {"spoken_vi":"..."}`;
  const usr=`Chủ đề: ${topic}\nNgữ cảnh: ${ctx||"(trống)"}`;
  try{
    setBusy(true);$("#spHint").textContent="Đang tạo...";
    const js=parseJSON(await callOpenAI(sys,usr,800));
    if(!js?.spoken_vi)throw"Lỗi";
    $("#spOut").textContent=js.spoken_vi.trim();
    $("#spHint").textContent="OK";
  }catch(e){
    $("#spOut").textContent="Lỗi: "+e;$("#spHint").textContent="";
  }finally{setBusy(false)}
};
$("#btnSpUse").onclick=()=>{
  const t=$("#spOut").textContent.trim();
  if(!t){$("#spHint").textContent="Chưa có";return}
  items=items.concat([t]);store.items=items;idx=items.length-1;
  $("#spHint").textContent="Đã thêm";
  setTimeout(()=>{$("#spHint").textContent="";$("#tabPractice").click();renderPractice()},800);
};
$("#btnSpTransGrade").onclick=async()=>{
  const vi=$("#spOut").textContent.trim();
  if(!vi){$("#spHint").textContent="Chưa có";return}
  try{
    setBusy(true);$("#spHint").textContent="Đang dịch...";
    const en=await callOpenAI("Translate VI to natural English essay",vi,1200);
    const r=parseJSON(await callOpenAI(IELTS_WR_SYS,`PROMPT:\n[SPOKEN]\n\nESSAY:\n${en}`,1200));
    if(!r||!r.criteria)throw"Lỗi";
    $("#tabWriting").click();
    $("#wrEssay").value=en.trim();
    showGradingResult(en,r,$("#wrHead"),$("#wrDiff"),$("#wrBreakdown"),"IELTS Overall (Spoken→EN)","spoken");
    $("#wrResult").style.display="grid";$("#spHint").textContent="";
  }catch(e){$("#spHint").textContent="Lỗi: "+e}finally{setBusy(false)}
};

// ===== IELTS Gen (VI) =====
$("#btnGenEssayVI").onclick=async()=>{
  const kind=$("#genEssayType").value, len=$("#genEssayLen").value,
        words=(len==="short"?140:(len==="long"?280:210));
  const sys=`Sinh bài VĂN VI theo IELTS ${kind==="task1"?"Task 1":"Task 2"} ~${words} từ. Trả JSON {"essay_vi":"..."}`;
  try{
    setBusy(true);$("#ieltsGenHint").textContent="Đang tạo...";
    const js=parseJSON(await callOpenAI(sys,"",900));
    if(!js?.essay_vi)throw"Lỗi";
    $("#ieltsGenOut").textContent=js.essay_vi.trim();
    $("#ieltsGenHint").textContent="OK";
  }catch(e){
    $("#ieltsGenOut").textContent="Lỗi: "+e;$("#ieltsGenHint").textContent="";
  }finally{setBusy(false)}
};
$("#btnIELTSUse").onclick=()=>{
  const t=$("#ieltsGenOut").textContent.trim();
  if(!t){$("#ieltsGenHint").textContent="Chưa có";return}
  items=items.concat([t]);store.items=items;idx=items.length-1;
  $("#ieltsGenHint").textContent="Đã thêm";
  setTimeout(()=>{$("#ieltsGenHint").textContent="";$("#tabPractice").click();renderPractice()},800);
};
$("#btnIELTSTransGrade").onclick=async()=>{
  const vi=$("#ieltsGenOut").textContent.trim();if(!vi){$("#ieltsGenHint").textContent="Chưa có";return}
  const kind=$("#genEssayType").value;
  try{
    setBusy(true);$("#ieltsGenHint").textContent="Đang dịch...";
    const sysTr=kind==="task1"?"Translate VI to IELTS Task1 English":"Translate VI to IELTS Task2 English";
    const en=await callOpenAI(sysTr,vi,1200);
    const r=parseJSON(await callOpenAI(IELTS_WR_SYS,`PROMPT:\n[${kind.toUpperCase()}]\n\nESSAY:\n${en}`,1200));
    if(!r||!r.criteria)throw"Lỗi";
    $("#tabWriting").click();$("#wrEssay").value=en.trim();
    showGradingResult(en,r,$("#wrHead"),$("#wrDiff"),$("#wrBreakdown"),`IELTS Overall (${kind})`,kind==="task1"?"task1":"task2");
    $("#wrResult").style.display="grid";$("#ieltsGenHint").textContent="";
  }catch(e){$("#ieltsGenHint").textContent="Lỗi: "+e}finally{setBusy(false)}
};
// ===== Writing page =====
$("#wrPrompt").value=store.wrp||"";
if(store.wri){
  const img=$("#chartImg");img.src=store.wri;img.style.display="block";
  $("#chartBox").querySelector("span")?.remove();
}
$("#chartBox").onclick=()=>$("#chartPicker").click();
$("#chartPicker").onchange=(e)=>{
  const f=e.target.files?.[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const img=$("#chartImg");img.src=r.result;img.style.display="block";
    store.wri=r.result;$("#chartBox").querySelector("span")?.remove();
  };
  r.readAsDataURL(f);
};
$("#btnGenPrompt").onclick=async()=>{
  const type=$("#wrType").value;
  const sys=`Bạn là người ra đề Writing. Trả JSON {"prompt":"...","hints":["..."]}`;
  const usr=type==="task1"?"Sinh đề Task1 + gợi ý":"Sinh đề Task2 + gợi ý";
  try{
    setBusy(true);$("#wrPromptHint").textContent="Đang tạo...";
    const js=parseJSON(await callOpenAI(sys,usr,450));
    if(!js||!js.prompt)throw"Lỗi";
    $("#wrPrompt").value=js.prompt+(Array.isArray(js.hints)?("\n\nGợi ý:\n- "+js.hints.join("\n- ")):"");
    store.wrp=$("#wrPrompt").value;
    $("#wrPromptHint").textContent="OK";
  }catch(e){$("#wrPromptHint").textContent="Lỗi: "+e}finally{setBusy(false)}
};
$("#btnGradeEssay").onclick=async()=>{
  const prompt=$("#wrPrompt").value.trim(),essay=$("#wrEssay").value.trim();
  if(!essay){$("#wrHint").textContent="Chưa có";return}
  const mode=$("#wrType").value==="task1"?"task1":"task2";
  try{
    setBusy(true);$("#wrHint").textContent="Đang chấm...";
    const js=parseJSON(await callOpenAI(IELTS_WR_SYS,`PROMPT:\n${prompt||"(no prompt)"}\n\nESSAY:\n${essay}`,1200));
    if(!js||!js.criteria)throw"Lỗi";
    showGradingResult(essay,js,$("#wrHead"),$("#wrDiff"),$("#wrBreakdown"),"IELTS Overall",mode);
    $("#wrResult").style.display="grid";$("#wrHint").textContent="";
    addHistory({type:"writing",input:(prompt||"—").slice(0,80),score:js.overall_score,band:bandFromScore(js.overall_score),ok:false});
  }catch(e){
    $("#wrHead").textContent="Lỗi: "+e;
    $("#wrDiff").innerHTML="";$("#wrBreakdown").innerHTML="";
    $("#wrResult").style.display="grid";
  }finally{setBusy(false)}
};

// ===== Translate VI → EN (Task) =====
$("#btnTranslateTask").onclick=async()=>{
  const vi=$("#trTaskInput").value.trim();
  if(!vi){$("#trTaskHint").textContent="Chưa có";return}
  const kind=$("#trTaskType").value;
  const sys=kind==="task1"?"Translate VI to IELTS Task1":"Translate VI to IELTS Task2";
  try{
    setBusy(true);$("#trTaskHint").textContent="Đang dịch...";
    const out=await callOpenAI(sys,vi,1200);
    $("#trTaskOut").textContent=out.trim();$("#trTaskHint").textContent="";
  }catch(e){
    $("#trTaskOut").textContent="Lỗi: "+e;$("#trTaskHint").textContent="";
  }finally{setBusy(false)}
};
$("#btnGradeTranslated").onclick=async()=>{
  const en=$("#trTaskOut").textContent.trim();
  if(!en){$("#trTaskHint").textContent="Chưa có";return}
  const mode=$("#trTaskType").value==="task1"?"task1":"task2";
  try{
    setBusy(true);$("#trTaskHint").textContent="Đang chấm...";
    const js=parseJSON(await callOpenAI(IELTS_WR_SYS,`PROMPT:\n[${mode.toUpperCase()}]\n\nESSAY:\n${en}`,1200));
    if(!js||!js.criteria)throw"Lỗi";
    $("#tabWriting").click();
    showGradingResult(en,js,$("#wrHead"),$("#wrDiff"),$("#wrBreakdown"),"IELTS Overall (Dịch)",mode);
    $("#wrResult").style.display="grid";$("#trTaskHint").textContent="";
  }catch(e){$("#trTaskHint").textContent="Lỗi: "+e}finally{setBusy(false)}
};
// ===== Chat "Hỏi AI" =====
function appendMsg(t,m=false,ty=false){
  const r=el("div","msg"+(m?" me":""));
  const b=el("div","bubble");
  b.innerHTML=ty?'<span class="type">&nbsp;</span>':esc(t);
  r.appendChild(b);$("#chatBox").appendChild(r);
  $("#chatBox").scrollTop=$("#chatBox").scrollHeight;
  return b;
}
async function typeOut(e,t,s=12){
  e.innerHTML="";let i=0;
  return new Promise(a=>{
    const id=setInterval(()=>{
      e.textContent+=t[i++]||"";
      $("#chatBox").scrollTop=$("#chatBox").scrollHeight;
      if(i>=t.length){clearInterval(id);a()}
    },s)
  })
}
let chatLock=false;
async function sendAsk(){
  if(chatLock)return;
  const q=($("#askInput").value||"").trim();
  if(!q){$("#askHint").textContent="Nhập câu hỏi.";return}
  chatLock=true;$("#askHint").textContent="";
  appendMsg(q,true);
  const b=appendMsg("",false,true);
  try{
    const sys="Bạn là trợ lý tiếng Anh hữu ích. Giải thích ngắn gọn, có ví dụ; nếu người dùng đưa câu, hãy sửa và nêu lý do. Dùng tiếng Việt khi giải thích, ví dụ bằng EN.";
    const ans=await callOpenAI(sys,q,650);
    await typeOut(b,ans.replace(/^```[\s\S]*?```/g,""),10);
  }catch(e){b.textContent="Lỗi: "+e}
  finally{chatLock=false}
}
$("#btnAsk").onclick=sendAsk;
const askI=$("#askInput");
if(askI&&!askI.dataset.enterBound){
  askI.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing&&!e.repeat){
      e.preventDefault();sendAsk()
    }
  });
  askI.dataset.enterBound="1"
}

// ===== Dictionary =====
function renderHistDict(){
  const h=store.dict.slice(-14).reverse();
  $("#dictHistory").innerHTML=h.length?h.map(w=>`<span class="errtag">${esc(w)}</span>`).join(""):"Chưa có."
}
renderHistDict();

async function dictAPI(q){
  const sys=`Bạn là từ điển EN⇄VI chuẩn. Trả JSON:
{"headword":"","ipa_uk":"","ipa_us":"","pos":[""],"senses":[
 {"label":"nghĩa chính","gloss_en":"","gloss_vi":"","examples":[{"en":"","vi":""}]},
 {"label":"nghĩa khác/ngữ cảnh","gloss_en":"","gloss_vi":"","examples":[{"en":"","vi":""}]}
], "phrases":[{"phrasal":"","gloss_vi":"","example_en":"","example_vi":""}]}`;
  const out=await callOpenAI(sys,"Lookup: "+q,900);
  return parseJSON(out)
}
function showDict(d){
  const b=$("#dictOut");b.innerHTML="";
  if(!d){b.innerHTML='<div class="mono">Không có dữ liệu.</div>';return}
  b.append(el("div","",`<h2 class="sectionTitle" style="margin:0">${esc(d.headword)} <span class="subtle">(${(d.pos||[]).join(", ")})</span></h2>`));
  b.append(el("div","subtle",`IPA UK: /${esc(d.ipa_uk||"-")}/ • IPA US: /${esc(d.ipa_us||"-")}/`));
  (d.senses||[]).forEach((s,i)=>b.append(el("div","card row",`
<b>${i+1}. ${esc(s.label||s.gloss_en||"")}</b>
<div>${esc(s.gloss_en||"")}</div>
<div class="subtle">${esc(s.gloss_vi||"")}</div>
${(s.examples||[]).map(e=>`<div class="mono">• ${esc(e.en)} — <span class="subtle">${esc(e.vi||"")}</span></div>`).join("")}
`)));
  if(Array.isArray(d.phrases)&&d.phrases.length){
    b.append(el("div","card row",`
<b>Phrasal/Collocation</b>
${d.phrases.map(p=>`<div class="mono">• <b>${esc(p.phrasal)}</b> — ${esc(p.gloss_vi)}<br><span class="subtle">${esc(p.example_en)}</span> — ${esc(p.example_vi||"")}</div>`).join("")}
`))
  }
}
$("#btnLookup").onclick=async()=>{
  const q=($("#q").value||"").trim();
  if(!q){$("#dictHint").textContent="Nhập từ/cụm cần tra.";return}
  try{
    setBusy(true);$("#dictHint").textContent="Đang tra...";
    const data=await dictAPI(q);showDict(data);
    const hist=store.dict;hist.push(q);store.dict=hist.slice(-50);
    renderHistDict();$("#dictHint").textContent=""
  }catch(e){
    $("#dictOut").innerHTML='<div class="mono">Lỗi: '+esc(e+"")+"</div>";
    $("#dictHint").textContent=""
  }finally{setBusy(false)}
};
$("#btnLookupFromVI").onclick=async()=>{
  const vi=(items[idx]||"").trim();
  if(!vi){$("#dictHint").textContent="Chưa có câu để gợi ý.";return}
  try{
    setBusy(true);$("#dictHint").textContent="Đang gợi ý...";
    const sys='Từ câu tiếng Việt sau, gợi ý 1–3 từ/cụm TIẾNG ANH nên tra. Trả JSON {"candidates":["..."]}';
    const js=parseJSON(await callOpenAI(sys,vi,200));
    const cand=js?.candidates?.[0]||"";
    if(!cand){$("#dictHint").textContent="Không gợi ý được.";setBusy(false);return}
    $("#q").value=cand;$("#dictHint").textContent="Đang tra "+cand+"...";
    const data=await dictAPI(cand);showDict(data);
    const hist=store.dict;hist.push(cand);store.dict=hist.slice(-50);
    renderHistDict();$("#dictHint").textContent=""
  }catch(e){
    $("#dictOut").innerHTML='<div class="mono">Lỗi: '+esc(e+"")+"</div>";
    $("#dictHint").textContent=""
  }finally{setBusy(false)}
};
// ===== History & Profile & Donate =====
function addHistory({type,input,score,band,ok}){
  const at=store.attempts;at.push({at:Date.now(),type,input,score,band,ok});store.attempts=at;
}
function renderHistory(){
  const at=store.attempts,t=at.length,
        avg=t?Math.round(at.reduce((s,a)=>s+(a.score||0),0)/t):0,
        cor=at.filter(a=>a.type==="simple"&&a.ok).length,
        rate=t?Math.round(100*cor/t):0;
  $("#hisTotal").textContent=t;$("#hisAvg").textContent=avg;
  $("#hisCorrect").textContent=cor;$("#hisRate").textContent=rate+"%";
  const tb=$("#hisTable tbody");
  tb.innerHTML=at.slice().reverse().map(a=>`<tr>
    <td>${new Date(a.at).toLocaleString()}</td>
    <td>${esc(a.type)}</td>
    <td class="mono">${esc(a.input||"")}</td>
    <td>${a.band?("Band "+a.band.toFixed(1)):Math.round(a.score||0)}</td>
    <td>${a.ok?"✅":"—"}</td>
  </tr>`).join("");
}

const drawer=$("#drawer"),bd=$("#backdrop"),av=$("#avatar"),nameI=$("#displayName");
function renderDonate(){
  $("#dnName").textContent=DONATE_NAME;
  $("#dnNote").textContent=DONATE_NOTE;
  $("#dnQR").src=DONATE_QR_IMG;
  $("#dnPay").href=DONATE_PAY_URL;
  $("#dnCopy").onclick=async()=>{
    try{
      await navigator.clipboard.writeText(DONATE_PAY_URL);
      $("#dnCopy").textContent="Đã copy ✓";
      setTimeout(()=>$("#dnCopy").textContent="Copy link",1000);
    }catch(_){alert(DONATE_PAY_URL)}
  };
}
function openDrawer(){drawer.classList.add("show");bd.classList.add("show");fillProfile();renderDonate()}
function closeDrawer(){drawer.classList.remove("show");bd.classList.remove("show")}
$("#btnHamburger").onclick=openDrawer;$("#btnCloseDrawer").onclick=closeDrawer;bd.onclick=closeDrawer;

function fillProfile(){
  const at=store.attempts,t=at.length,
        avg=t?Math.round(at.reduce((s,a)=>s+(a.score||0),0)/t):0,
        cor=at.filter(a=>a.type==="simple"&&a.ok).length,
        rate=t?Math.round(100*cor/t):0;
  $("#pAvg").textContent=avg;$("#pTotal").textContent=t;$("#pRate").textContent=rate+"%";
  av.src=store.avatar||'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="%23e8ecf3"/><text x="50%" y="54%" font-size="36" text-anchor="middle" fill="%23555">🙂</text></svg>';
  nameI.value=store.name||"";
}
av.onclick=()=>$("#filePicker").click();
$("#filePicker").onchange=e=>{
  const f=e.target.files?.[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{store.avatar=r.result;av.src=r.result};
  r.readAsDataURL(f);
};
nameI.oninput=()=>{store.name=nameI.value.trim()};

$("#btnExportCSV").onclick=()=>{
  const at=store.attempts;
  if(!at.length){alert("Chưa có dữ liệu.");return}
  let csv="time,type,input,score,band,ok\n";
  at.forEach(a=>{
    const q=(a.input||"").replace(/"/g,'""');
    csv+=`${new Date(a.at).toISOString()},"${(a.type||"").replace(/"/g,'""')}","${q}",${a.score??""},${a.band??""},${a.ok||false}\n`;
  });
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="history.csv";
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
};
$("#btnResetProfile").onclick=()=>{
  if(confirm("Xoá toàn bộ lịch sử?")){
    store.attempts=[];fillProfile();renderHistory();
  }
};
// ===== Settings =====
$("#apiKey").value=store.key;$("#model").value=store.mdl;$("#endpoint").value=store.ep;
$("#btnSave").onclick=()=>{
  store.key=$("#apiKey").value.trim();
  store.mdl=$("#model").value;
  store.ep=$("#endpoint").value.trim();
  $("#saveMsg").textContent="Đã lưu.";
  setTimeout(()=>$("#saveMsg").textContent="",1000);
};

// ===== Init =====
function applyFooterPaddingOnce(){
  const f = $("#footerNav");
  if(!f) return;
  const h = f.getBoundingClientRect().height || 78;
  document.documentElement.style.setProperty("--footer-h", Math.max(48, Math.ceil(h)) + "px");
  document.body.style.paddingBottom = (Math.max(48, Math.ceil(h)) + 12) + "px";
}

function init(){
  renderPractice();
  fillProfile();
  applyFooterPaddingOnce();
  window.fixScrollLayout?.();
}
init();

// ===== Scroll Patch: fix "scroll không hết" khi có footer =====
(function(){
  let lastFooterH = 0;

  function getFooterH(){
    const f = document.querySelector("#footerNav");
    if(!f) return 0;
    const h = f.getBoundingClientRect().height || 78;
    return Math.max(48, Math.ceil(h));
  }
  function updateVH(){
    const vh = (window.visualViewport?.height || window.innerHeight || 700);
    document.documentElement.style.setProperty("--vh", vh + "px");
  }
  function applyFooterPaddingNew(){
    const h = getFooterH();
    lastFooterH = h;
    document.documentElement.style.setProperty("--footer-h", h + "px");
    document.body.style.paddingBottom = (h + 12) + "px";
  }
  function fitScrollBoxes(){
    const avail = (window.visualViewport?.height || window.innerHeight || 700);
    const boxes = document.querySelectorAll(".scrollBox,#chatBox");
    boxes.forEach(el=>{
      const rect = el.getBoundingClientRect();
      const max = Math.max(160, Math.floor(avail - rect.top - lastFooterH - 24));
      el.style.maxHeight = max + "px";
    });
  }
  window.fixScrollLayout = function(){
    updateVH();
    applyFooterPaddingNew();
    fitScrollBoxes();
  };
  window.addEventListener("resize", ()=>window.fixScrollLayout());
  window.addEventListener("orientationchange", ()=>setTimeout(window.fixScrollLayout, 400));
  window.addEventListener("load", ()=>window.fixScrollLayout());
  window.fixScrollLayout();
})();
// === POPUP THÔNG BÁO — KHỐI ĐỘC LẬP (DÁN CUỐI app.js) ===
(function(){
  // CẤU HÌNH NHANH
  // FORCE_POPUP: "T" = luôn hiện, "F" = luôn ẩn, "" = theo 24h (mặc định)
  const FORCE_POPUP = "";                 // <-- đổi tuỳ ý
  const CONTACT_URL = "https://zalo.me/your-admin-link"; // link liên hệ
  const TTL_MS = 24*60*60*1000; // 24 giờ

  const pp = document.getElementById("appPopup");
  if(!pp) return; // chưa đặt HTML popup thì thôi

  // phần tử con
  const $in = sel => pp.querySelector(sel);
  const btnClose   = $in("#ppClose");
  const btnHide24h = $in("#ppHide24h");
  const btnContact = $in("#ppContact");

  // khoá/mở cuộn khi popup bật
  const lockScroll = on => {
    document.documentElement.style.overflow = on ? "hidden" : "";
    document.body.style.overflow = on ? "hidden" : "";
  };

  const showPP = () => { pp.style.display = "grid"; lockScroll(true); };
  const hidePP = () => { pp.style.display = "none"; lockScroll(false); };

  // quyết định có hiện không
  let shouldShow = false;
  if (FORCE_POPUP === "T") shouldShow = true;
  else if (FORCE_POPUP === "F") shouldShow = false;
  else {
    const until = parseInt(localStorage.getItem("ppHideUntil")||"0", 10);
    shouldShow = !(until && Date.now() < until);
  }

  // gắn link liên hệ
  if (btnContact) btnContact.href = CONTACT_URL;

  // sự kiện
  if (btnClose) btnClose.onclick = hidePP;
  if (btnHide24h) btnHide24h.onclick = () => {
    localStorage.setItem("ppHideUntil", Date.now() + TTL_MS);
    hidePP();
  };
  // click ra nền để đóng
  pp.addEventListener("click", (e) => {
    if (e.target === pp) hidePP();
  });
  // Esc để đóng
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hidePP();
  });

  // khởi tạo
  shouldShow ? showPP() : hidePP();
})();
