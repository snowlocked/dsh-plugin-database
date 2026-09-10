window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-database-console",
  factory: (require) => {
    "use strict";
    var __dsh_db_module = { exports: {} };
    var __dsh_db_exports = __dsh_db_module.exports;
    Object.defineProperty(__dsh_db_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_db_console_module__=(()=>{var pe=Object.defineProperty;var at=Object.getOwnPropertyDescriptor;var nt=Object.getOwnPropertyNames;var st=Object.prototype.hasOwnProperty;var F=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(a,o)=>(typeof require<"u"?require:a)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var ot=(e,a)=>{for(var o in a)pe(e,o,{get:a[o],enumerable:!0})},rt=(e,a,o,d)=>{if(a&&typeof a=="object"||typeof a=="function")for(let t of nt(a))!st.call(e,t)&&t!==o&&pe(e,t,{get:()=>a[t],enumerable:!(d=at(a,t))||d.enumerable});return e};var dt=e=>rt(pe({},"__esModule",{value:!0}),e);var Ot={};ot(Ot,{apply:()=>Dt,cssText:()=>le,inject:()=>Lt});var re=F("react");var Ee=F("react");var ke="dsh-database-console.persist.v1";function ae(){try{let e=window.localStorage.getItem(ke);if(!e)return{};let a=JSON.parse(e);return a&&typeof a=="object"?a:{}}catch{return{}}}function oe(e){try{let a={...ae(),...e};window.localStorage.setItem(ke,JSON.stringify(a))}catch{}}var Z=ae().panelOpen===!0,Ne=null,ge=new Set,Ce=e=>{if(typeof document>"u")return;let a=0,o=()=>{let d=Array.from(document.querySelectorAll('[role="tab"]')).filter(t=>t.closest("#dsh-database-console")===null).find(t=>{let f=t.textContent?.trim().toLowerCase()??"",c=`${t.getAttribute("aria-label")??""} ${t.title??""}`.toLowerCase();return e==="database"?f==="database"||f==="\u6570\u636E\u5E93"||c.includes("database")||c.includes("\u6570\u636E\u5E93"):f==="chat"||f==="\u5BF9\u8BDD"||c.includes("chat")||c.includes("\u5BF9\u8BDD")});if(d!==void 0){d.click();return}++a<8&&setTimeout(o,16)};o()},ue=()=>{for(let e of ge)e()},Se=!1,Re=Object.freeze({panelOpen:!0,activeConnectionId:null}),Le=Object.freeze({panelOpen:!1,activeConnectionId:null}),De=Z?Re:Le,me=()=>{De=Z?Re:Le},Te=()=>{try{oe({panelOpen:Z})}catch{}},Q={open(){Z||(Z=!0,me(),Te(),ue()),Ce("database")},close(){Z=!1,me(),Te(),ue(),Ce("chat")},toggle(){Se?Q.close():Q.open()},setDocked(e){Se=e},getSnapshot:()=>De,subscribe(e){return ge.add(e),()=>ge.delete(e)},setActiveConnection(e){Ne!==e&&(Ne=e,me(),ue())}};function Pe(){return(0,Ee.useSyncExternalStore)(Q.subscribe,Q.getSnapshot,Q.getSnapshot)}var G=F("react/jsx-runtime"),it=(0,G.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,G.jsx)("ellipse",{cx:7.5,cy:11,rx:5.5,ry:2.75}),(0,G.jsx)("path",{d:"M7.5 11V5.5"}),(0,G.jsx)("path",{d:"M2.75 6.25c0-1.1 2.1-2 4.75-2s4.75.9 4.75 2"}),(0,G.jsx)("path",{d:"M7.5 8.25c1.9 0 3.4-.45 3.9-1.1M5.25 4.35V3.5"})]});function Oe(e){let{wide:a=!0,t:o=(c=>c)}=e,d=o,t=(0,re.useSyncExternalStore)(Q.subscribe,Q.getSnapshot,Q.getSnapshot),f=(0,re.useCallback)(()=>{Q.toggle()},[]);return(0,G.jsxs)("button",{type:"button","data-d-sh-plugin":"database","data-active":t.panelOpen||void 0,"aria-label":d("sidebar.aria"),title:d("sidebar.title"),onClick:f,className:"db-sidebar-entry",children:[(0,G.jsx)("span",{className:"db-sidebar-entry-icon","aria-hidden":"true",children:it}),a?(0,G.jsx)("span",{className:"db-sidebar-entry-label",children:d("sidebar.label")}):null]})}var ie=F("react"),He=F("react-dom/client");var V=F("react");var Y={postgresql:"PostgreSQL",mysql:"MySQL",mongodb:"MongoDB",sqlite:"SQLite",dameng:"\u8FBE\u68A6 DM"},lt="/api/dsh-database-console",ee=class extends Error{status;code;constructor(a,o,d){super(a),this.status=o,this.code=d}};async function ct(e,a){let o;try{o=await fetch(`${lt}${e}`,a)}catch(t){throw new ee(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${t instanceof Error?t.message:String(t)}`,0)}let d=null;try{d=await o.json()}catch{d=null}if(!o.ok){let t=d&&typeof d=="object"?d:{};throw new ee(String(t.error??`HTTP ${o.status}`),o.status,String(t.code??""))}return d}function bt(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)}}function j(e,a){return ct(e,bt(a??{}))}var I={state:()=>j("/state"),connections:()=>j("/connections/list"),meta:e=>j("/connection/meta",{id:e}),save:e=>j("/connections/save",e),remove:e=>j("/connection/remove",{id:e}),test:e=>j("/connections/test",e),databases:e=>j("/connection/databases",{id:e}),schemas:(e,a)=>j("/connection/schemas",{id:e,...a?{database:a}:{}}),tables:(e,a,o)=>j("/connection/tables",{id:e,...a?{schema:a}:{},...o?{database:o}:{}}),columns:(e,a,o,d)=>j("/connection/columns",{id:e,table:a,...o?{schema:o}:{},...d?{database:d}:{}}),rows:(e,a,o,d,t,f,c)=>j("/connection/rows",{id:e,table:a,...o?{schema:o}:{},...f?{database:f}:{},limit:d,offset:t,...c?.sort?{sort:c.sort}:{},...c?.filters&&Object.keys(c.filters).length>0?{filters:c.filters}:{}}),cellUpdate:e=>j("/connection/cell/update",{id:e.id,table:e.table,...e.schema?{schema:e.schema}:{},...e.database?{database:e.database}:{},column:e.column,pk:e.pk,value:e.value,isNull:e.isNull}),query:(e,a,o,d,t)=>j("/query",{id:e,sql:a,readOnly:o,...t?{database:t}:{},...d?{limit:d}:{}}),aiModels:()=>j("/ai/models"),aiGenerate:(e,a,o,d)=>j("/ai/generate",{id:e,question:a,...d?{database:d}:{},...o?.provider?{provider:o.provider}:{},...o?.model?{model:o.model}:{}}),aiRun:(e,a,o,d,t)=>j("/ai/run",{id:e,question:a,...t?{database:t}:{},...o?.provider?{provider:o.provider}:{},...o?.model?{model:o.model}:{},...d?{limit:d}:{}})};function ne(e){return e==="postgresql"||e==="dameng"}function ze(e){switch(e){case"postgresql":return 5432;case"mysql":return 3306;case"mongodb":return 27017;case"dameng":return 5236;default:return null}}function J(e){if(e==null)return"NULL";if(typeof e=="object")try{return JSON.stringify(e)}catch{return String(e)}return String(e)}var $=F("react");var H=F("react");var b=F("react/jsx-runtime");function W({kind:e,text:a}){return a?(0,b.jsx)("div",{className:`db-banner db-banner-${e}`,children:a}):null}function Me({result:e}){if(!e)return null;let a=[`\u8017\u65F6 ${e.durationMs}ms`];return(e.rowCount>0||e.columns.length>0)&&a.push(`${e.rowCount} \u884C`),e.affectedRows!==void 0&&a.push(`\u5F71\u54CD ${e.affectedRows} \u884C`),e.truncated&&a.push(`\u26A0\uFE0F \u5DF2\u622A\u65AD\uFF08\u4EC5\u663E\u793A ${e.rows.length} \u884C\uFF09`),(0,b.jsxs)("div",{className:"db-row db-muted",style:{padding:"6px 2px"},children:[(0,b.jsx)("span",{className:e.kind==="change"?"db-ok":"",children:a.join(" \xB7 ")}),e.message?(0,b.jsx)("span",{className:"db-ok",children:e.message}):null]})}async function _(e){return e instanceof ee||e instanceof Error?e.message:String(e)}function pt(e){let a=(e.length+6)*8+40;return Math.min(420,Math.max(120,a))}function fe({columns:e,rows:a,active:o,onCellClick:d,interaction:t}){let[f,c]=(0,H.useState)({}),x=(0,H.useRef)(null),h=m=>Math.min(720,Math.max(72,Math.round(m))),D=m=>f[m]??pt(e[m]??""),N=e.reduce((m,p,v)=>m+D(v),0),y=(m,p)=>{p.preventDefault(),p.stopPropagation();let v=p.clientX,E=D(m),r=i=>{let P=h(E+(i.clientX-v));c(w=>w[m]===P?w:{...w,[m]:P})},R=()=>{window.removeEventListener("pointermove",r),window.removeEventListener("pointerup",R),document.body.style.cursor="",document.body.style.userSelect=""};document.body.style.cursor="col-resize",document.body.style.userSelect="none",window.addEventListener("pointermove",r),window.addEventListener("pointerup",R)},C=()=>(0,b.jsx)("colgroup",{children:e.map((m,p)=>(0,b.jsx)("col",{style:{width:D(p)}},`col-${p}`))});return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"db-gridx-head",ref:x,children:(0,b.jsxs)("table",{className:"db-gridx-t",style:{width:N},children:[C(),(0,b.jsx)("thead",{children:(0,b.jsx)("tr",{children:e.map((m,p)=>{let v=t&&t.sort?.col===p?t.sort.dir:0,E=t?!!t.filters[p]:!1;return(0,b.jsxs)("th",{title:m,style:{width:D(p),minWidth:D(p)},children:[(0,b.jsxs)("span",{className:"db-gridx-th-main",children:[t?(0,b.jsxs)("button",{className:"db-sort-label",title:"\u70B9\u51FB\u6392\u5E8F\uFF1A\u5347\u5E8F \u2192 \u964D\u5E8F \u2192 \u53D6\u6D88",onClick:()=>t.onSort(p),children:[m,(0,b.jsx)("span",{className:v===0?"db-sort-idle":"db-sort-on",children:v===1?" \u25B2":v===-1?" \u25BC":" \u2195"})]}):(0,b.jsx)("span",{className:"db-gridx-th",children:m}),t?(0,b.jsx)("span",{className:E?"db-filter-toggle db-filter-on":"db-filter-toggle",title:E?`\u8FC7\u6EE4\uFF1A${t.filters[p]}\uFF08\u70B9\u51FB\u7F16\u8F91\uFF09`:"\u5217\u8FC7\u6EE4",onClick:()=>t.onFilterOpen(t.filterOpen===p?null:p),children:E?"\u2715":"\u26B2"}):null]}),t&&t.filterOpen===p?(0,b.jsx)("input",{className:"db-gridx-filter",autoFocus:!0,value:t.filters[p]??"",placeholder:`\u8FC7\u6EE4 ${m}\u2026`,spellCheck:!1,onChange:r=>t.onFilter(p,r.target.value),onKeyDown:r=>{(r.key==="Escape"||r.key==="Enter")&&t.onFilterOpen(null)}}):null,(0,b.jsx)("span",{className:"db-colresize",onPointerDown:r=>y(p,r),title:"\u62D6\u52A8\u8C03\u6574\u5217\u5BBD"})]},m)})})})]})}),(0,b.jsx)("div",{className:"db-gridx-body",onScroll:m=>{x.current&&(x.current.scrollLeft=m.currentTarget.scrollLeft)},children:(0,b.jsxs)("table",{className:"db-gridx-t",style:{width:N},children:[C(),(0,b.jsx)("tbody",{children:a.map((m,p)=>(0,b.jsx)("tr",{children:m.map((v,E)=>{let r=J(v),R=o?.row===p&&o?.col===E;return(0,b.jsx)("td",{className:R?"db-cell-active":"db-cell",title:r,style:{width:D(E)},onClick:()=>d(p,E),children:v==null?(0,b.jsx)("span",{className:"db-null",children:"NULL"}):typeof v=="object"?(0,b.jsx)("span",{className:"db-mono",children:r}):r},`${p}-${E}`)})},p))})]})})]})}function $e({connection:e,table:a,schema:o,database:d,tableName:t,queryColumns:f,metaColumns:c,row:x,colIndex:h,onClose:D,onSaved:N,onMessage:y}){let C=f[h]??"",m=x[h],p=c.find(S=>S.name===C),[v,E]=(0,H.useState)(()=>m==null?"":J(m)),[r,R]=(0,H.useState)(m==null),[i,P]=(0,H.useState)(""),[w,u]=(0,H.useState)(!1),k=new Map;f.forEach((S,q)=>k.set(S,q));let l=c.filter(S=>S.primary).map(S=>({column:S.name,value:x[k.get(S.name)??-1]??null})).filter(S=>k.has(S.column)),z=l.length>0?l.map(S=>`${S.column}=${J(S.value)}`).join(" & "):"",O=l.length>0,A=e.type==="mongodb",g=async()=>{if(!(!O||!a)){P("\u4FDD\u5B58\u4E2D\u2026");try{let S=await I.cellUpdate({id:e.id,table:a.name,schema:o,...d?{database:d}:{},column:C,pk:l,value:r?null:v,isNull:r});S.ok&&(y(`\u2713 \u5DF2\u66F4\u65B0 ${S.affectedRows} \u884C\uFF08${t}.${C}\uFF09`,"ok"),N())}catch(S){y(await _(S),"error")}finally{P("")}}};return(0,b.jsxs)("div",{className:"db-celldetail",children:[(0,b.jsxs)("div",{className:"db-celldetail-title",children:[(0,b.jsx)("span",{children:"\u270F\uFE0F \u5355\u5143\u683C\u7F16\u8F91"}),(0,b.jsx)("button",{className:"db-btn-ghost",onClick:D,disabled:i!=="",children:"\u2715"})]}),(0,b.jsxs)("div",{className:"db-celldetail-meta",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{className:"db-muted",children:"\u8868"})," ",t]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{className:"db-muted",children:"\u5217"})," ",C," ",(0,b.jsx)("span",{className:"db-badge db-badge-type",children:p?.type??""})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("span",{className:"db-muted",children:"\u5B9A\u4F4D"})," ",z||"\uFF08\u65E0\u4E3B\u952E\uFF09"]})]}),(0,b.jsx)("button",{className:"db-row db-row-toggle",onClick:()=>u(S=>!S),title:w?"\u70B9\u51FB\u6536\u8D77\u6574\u884C\u6570\u636E":"\u70B9\u51FB\u5C55\u5F00\u6574\u884C\u6570\u636E",children:(0,b.jsxs)("span",{children:[w?"\u25BE":"\u25B8"," \u6574\u884C\u6570\u636E\uFF08",f.length," \u5217\uFF09"]})}),w&&(0,b.jsx)("div",{className:"db-celldetail-row",children:f.map((S,q)=>(0,b.jsxs)("div",{title:`${S} = ${J(x[q])}`,children:[(0,b.jsx)("span",{className:"db-chip",children:S})," = ",J(x[q])]},S))}),A||!O?(0,b.jsx)("div",{className:"db-empty",style:{padding:"8px"},children:A?"MongoDB \u96C6\u5408\u6682\u4E0D\u652F\u6301\u5355\u5143\u683C\u7F16\u8F91\uFF08\u6CA1\u6709\u4E3B\u952E\u5217\u6982\u5FF5\uFF09":"\u8BE5\u8868\u6CA1\u6709\u4E3B\u952E\uFF0C\u65E0\u6CD5\u5B89\u5168\u5B9A\u4F4D\u884C\uFF0C\u7F16\u8F91\u5DF2\u7981\u7528"}):null,(0,b.jsx)("label",{className:"db-muted",style:{display:"block",margin:"8px 0 4px"},children:"\u65B0\u503C\uFF08\u5B58\u4E3A NULL \u53EF\u7559\u7A7A\uFF09\uFF1A"}),(0,b.jsxs)("label",{className:"db-row",style:{gap:6,cursor:"pointer",fontSize:12},children:[(0,b.jsx)("input",{type:"checkbox",checked:r,onChange:S=>R(S.target.checked)})," \u5B58\u4E3A NULL"]}),(0,b.jsx)("textarea",{className:"db-code",style:{minHeight:90,width:"100%",boxSizing:"border-box",marginTop:6},value:v,disabled:r,spellCheck:!1,onChange:S=>E(S.target.value),placeholder:"\u8F93\u5165\u65B0\u503C\u2026"}),(0,b.jsxs)("div",{className:"db-row",style:{gap:8,marginTop:8},children:[(0,b.jsx)("button",{className:"db-btn-primary",onClick:g,disabled:!O||i!==""||A,children:i||(O?"\u4FDD\u5B58\uFF08UPDATE \u8BE5\u884C\uFF09":"\u4FDD\u5B58")}),(0,b.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u70B9\u51FB\u5355\u5143\u683C\u65C1\u7684\u4EFB\u610F\u5904\u53EF\u518D\u9009\u5176\u5B83\u5355\u5143\u683C"})]})]})}function ut(e,a){if(e==null)return a==null?0:1;if(a==null)return-1;if(typeof e=="number"&&typeof a=="number")return e<a?-1:e>a?1:0;let o=J(e),d=J(a),t=Number(o),f=Number(d);return o!==""&&d!==""&&Number.isFinite(t)&&Number.isFinite(f)?t<f?-1:t>f?1:0:o.localeCompare(d,void 0,{numeric:!0,sensitivity:"base"})}function he({result:e,limit:a,onLimitChange:o}){let[d,t]=(0,H.useState)(0),f=Math.max(1,a),[c,x]=(0,H.useState)(null),[h,D]=(0,H.useState)({}),[N,y]=(0,H.useState)(null),C=e?.columns??[],m=e?.rows??[];(0,H.useEffect)(()=>{t(0),x(null),D({}),y(null)},[e]);let p=(0,H.useMemo)(()=>{let w=Object.entries(h).filter(u=>u[1].trim()!=="");return w.length===0?m:m.filter(u=>w.every(([k,l])=>{let z=Number(k);return J(u[z]).toLowerCase().includes(l.trim().toLowerCase())}))},[m,h]),v=(0,H.useMemo)(()=>{if(!c)return p;let w=c.col,u=c.dir;return[...p].sort((k,l)=>ut(k[w],l[w])*u)},[p,c]),E=m.length,r=v.length,R=Math.max(1,Math.ceil(r/f));(0,H.useEffect)(()=>{t(w=>Math.min(w,R-1))},[R]);let i=v.slice(d*f,(d+1)*f);return!e||e.columns.length===0?(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"db-empty",children:e?.kind==="change"?e.message??`\u5DF2\u6267\u884C\uFF08\u5F71\u54CD ${e.affectedRows??0} \u884C\uFF09`:e?.message??"\u6267\u884C\u540E\u7ED3\u679C\u663E\u793A\u5728\u8FD9\u91CC\uFF08\u7ED3\u679C\u6700\u591A\u663E\u793A 10000 \u884C\uFF09"}),e?(0,b.jsx)(Me,{result:e}):null]}):(0,b.jsxs)("div",{children:[(0,b.jsx)(Me,{result:e}),(0,b.jsx)(fe,{columns:C,rows:i,active:null,onCellClick:()=>{},interaction:{sort:c,onSort:w=>{let u=c?.col===w?c.dir:0;x(u===1?{col:w,dir:-1}:u===-1?null:{col:w,dir:1})},filters:h,onFilter:(w,u)=>{D(k=>({...k,[w]:u}))},filterOpen:N,onFilterOpen:w=>y(w)}}),i.length===0?(0,b.jsx)("div",{className:"db-empty",children:"\uFF08\u6CA1\u6709\u5339\u914D\u7684\u884C\uFF09"}):null,(0,b.jsxs)("div",{className:"db-row",style:{marginTop:6,gap:8},children:[(0,b.jsx)("button",{disabled:d<=0,onClick:()=>t(w=>Math.max(0,w-1)),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,b.jsx)("button",{disabled:d>=R-1,onClick:()=>t(w=>Math.min(R-1,w+1)),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,b.jsxs)("span",{className:"db-muted",children:["\u7B2C ",d+1,"/",R," \u9875 \xB7 \u5171 ",r," \u884C",r!==E?`\uFF08\u5DF2\u53D6\u56DE ${E} \u884C\uFF09`:""]}),(0,b.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875/\u6700\u591A\u53D6"}),(0,b.jsx)("select",{value:f,title:"\u6BCF\u9875\u884C\u6570 = \u672C\u6B21\u6267\u884C\u6700\u591A\u53D6\u56DE\u7684\u884C\u6570\uFF1B\u8C03\u5927\u540E\u8BF7\u91CD\u65B0\u6267\u884C\u4EE5\u53D6\u66F4\u591A\u6570\u636E",onChange:w=>{o(Number(w.target.value)),t(0)},children:[200,500,1e3,5e3].map(w=>(0,b.jsx)("option",{value:w,children:w},w))})]})]})}var s=F("react/jsx-runtime"),mt={postgresql:"PG",mysql:"MySQL",mongodb:"Mongo",sqlite:"SQLite",dameng:"DM"},gt={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"},Be={view:"\u89C6\u56FE",collection:"\u96C6\u5408",table:"\u8868"};function ft({draft:e,onClose:a,onSaved:o,onChanged:d}){let[t,f]=(0,$.useState)({...e}),[c,x]=(0,$.useState)(!1),[h,D]=(0,$.useState)(!1),[N,y]=(0,$.useState)(""),[C,m]=(0,$.useState)(""),p=(()=>{let i=Y[t.type],P=t.type!=="sqlite",w=t.type==="mysql"||t.type==="mongodb",u=t.type==="postgresql"||w,k=t.type==="dameng";return{label:i,needsHost:P,needsDatabase:w,supportsDatabase:u,needsSchema:k,needFile:t.type==="sqlite"}})(),v=i=>{f(P=>({...P,...i})),m(""),y("")},E=()=>{let i={id:t.id,name:t.name.trim(),type:t.type,host:t.host?.trim()||void 0,user:t.user?.trim()||void 0,database:t.database?.trim()||void 0,schema:t.schema?.trim()||void 0,file:t.file?.trim()||void 0,authSource:t.authSource?.trim()||void 0,ssl:t.ssl===!0,options:t.options&&Object.keys(t.options).length>0?t.options:void 0};return t.type==="sqlite"&&(delete i.host,delete i.port,delete i.database),t.port!==void 0&&Number.isFinite(Number(t.port))&&(i.port=Number(t.port)),t.dmCompat&&(i.dmCompat=t.dmCompat),i.dmNoEncrypt=t.dmNoEncrypt===!0,t.password!==void 0&&t.password!==""&&(i.password=t.password),i},r=async()=>{x(!0),y(""),m("");try{let i=await I.test(E());m(i.ok?`\u2705 \u8FDE\u63A5\u6210\u529F\uFF08${i.latencyMs}ms\uFF09`:`\u274C ${i.message}`),i.ok||y(i.detail??i.message)}catch(i){y(await _(i))}finally{x(!1)}},R=async()=>{if(!t.name.trim()){y("\u8BF7\u586B\u5199\u8FDE\u63A5\u540D\u79F0");return}if(p.needsHost&&!t.host?.trim()){y("\u8BF7\u586B\u5199\u4E3B\u673A\u5730\u5740");return}if(p.needsDatabase&&!t.database?.trim()){y(`\u8BF7\u586B\u5199 ${Y[t.type]} \u7684\u6570\u636E\u5E93\u540D`);return}if(p.needFile&&!t.file?.trim()){y("\u8BF7\u586B\u5199 SQLite \u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84");return}D(!0),y("");try{let{connection:i}=await I.save(E());m("\u5DF2\u4FDD\u5B58"),d(),o(i)}catch(i){y(await _(i))}finally{D(!1)}};return(0,s.jsxs)("div",{className:"db-card db-nav-editor",style:{margin:"6px 0"},children:[(0,s.jsxs)("div",{className:"db-card-title",style:{textTransform:"none",letterSpacing:0},children:[(0,s.jsxs)("span",{children:["\u270F\uFE0F ",e.isNew?"\u65B0\u5EFA\u8FDE\u63A5":`\u7F16\u8F91\uFF1A${t.name}`]}),(0,s.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u6536\u8D77"})]}),(0,s.jsxs)("div",{className:"db-grid",children:[(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u540D\u79F0 *"}),(0,s.jsx)("input",{value:t.name??"",onChange:i=>v({name:i.target.value}),placeholder:"\u4F8B\u5982\uFF1A\u751F\u4EA7\u5E93-PG"})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u7C7B\u578B"}),(0,s.jsx)("select",{value:t.type,onChange:i=>v({type:i.target.value}),children:["postgresql","mysql","mongodb","sqlite","dameng"].map(i=>(0,s.jsx)("option",{value:i,children:Y[i]},i))})]}),p.needsHost&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u4E3B\u673A"}),(0,s.jsx)("input",{value:t.host??"",onChange:i=>v({host:i.target.value}),placeholder:p.label==="MongoDB"?"127.0.0.1 \u6216 mongodb://\u2026":"127.0.0.1"})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u7AEF\u53E3"}),(0,s.jsx)("input",{type:"number",value:t.port??ze(t.type)??"",onChange:i=>v({port:i.target.value===""?void 0:Number(i.target.value)})})]})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u7528\u6237\u540D"}),(0,s.jsx)("input",{value:t.user??"",onChange:i=>v({user:i.target.value}),autoComplete:"off"})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsxs)("label",{children:["\u5BC6\u7801 ",e.isNew||!e.hasPassword?"":(0,s.jsx)("span",{className:"db-muted",children:"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u7559\u7A7A\u5373\u7528\u5DF2\u5B58\u5BC6\u7801\uFF09"})]}),(0,s.jsx)("input",{type:"password",value:t.password??"",onChange:i=>v({password:i.target.value}),autoComplete:"new-password",placeholder:e.isNew?"\u65B0\u5EFA\u8FDE\u63A5\u65F6\u586B\u5199":"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u8F93\u5165\u53EF\u8986\u76D6\uFF09"})]}),p.needFile&&(0,s.jsxs)("div",{className:"db-field",style:{gridColumn:"1 / -1"},children:[(0,s.jsx)("label",{children:"\u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84 *"}),(0,s.jsx)("input",{value:t.file??"",onChange:i=>v({file:i.target.value}),placeholder:"C:\\\\data\\\\app.db \u6216 \u76F8\u5BF9\u8DEF\u5F84"})]}),p.supportsDatabase&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsxs)("label",{children:["\u9ED8\u8BA4\u6570\u636E\u5E93",p.needsDatabase?" *":"",t.type==="mongodb"?"\uFF08database\uFF09":""]}),(0,s.jsx)("input",{value:t.database??"",onChange:i=>v({database:i.target.value}),placeholder:t.type==="postgresql"?"\u53EF\u9009\uFF0C\u7559\u7A7A\u4F7F\u7528 PG \u9ED8\u8BA4\u5E93":void 0})]}),p.needsSchema&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"schema\uFF08\u9ED8\u8BA4\u6A21\u5F0F\uFF0C\u53EF\u9009\uFF09"}),(0,s.jsx)("input",{value:t.schema??"",onChange:i=>v({schema:i.target.value}),placeholder:"\u7559\u7A7A\u4F7F\u7528\u767B\u5F55\u7528\u6237"})]}),t.type==="dameng"&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u517C\u5BB9\u6A21\u5F0F"}),(0,s.jsxs)("select",{value:t.dmCompat??"oracle",onChange:i=>v({dmCompat:i.target.value}),children:[(0,s.jsx)("option",{value:"oracle",children:"Oracle \u6A21\u5F0F\uFF08\u9ED8\u8BA4\uFF09"}),(0,s.jsx)("option",{value:"mysql",children:"MySQL \u517C\u5BB9\u6A21\u5F0F"})]})]}),t.type==="dameng"&&(0,s.jsxs)("label",{className:"db-field",style:{flexDirection:"row",gap:8,alignItems:"center",cursor:"pointer"},children:[(0,s.jsx)("input",{type:"checkbox",checked:t.dmNoEncrypt===!0,onChange:i=>v({dmNoEncrypt:i.target.checked})}),(0,s.jsx)("span",{children:"\u517C\u5BB9 OpenSSL3\uFF1A\u5173\u95ED\u767B\u5F55/\u6D88\u606F\u52A0\u5BC6"})]}),t.type==="mongodb"&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"authSource\uFF08\u53EF\u9009\uFF09"}),(0,s.jsx)("input",{value:t.authSource??"",onChange:i=>v({authSource:i.target.value}),placeholder:"admin"})]}),(p.needsHost||p.needFile)&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"SSL/TLS"}),(0,s.jsxs)("select",{value:t.ssl===!0?"yes":"no",onChange:i=>v({ssl:i.target.value==="yes"}),children:[(0,s.jsx)("option",{value:"no",children:"\u5173\u95ED"}),(0,s.jsx)("option",{value:"yes",children:"\u542F\u7528"})]})]})]}),(0,s.jsx)(W,{kind:"error",text:N}),C?(0,s.jsx)(W,{kind:C.startsWith("\u2705")?"ok":"info",text:C}):null,(0,s.jsxs)("div",{className:"db-row",style:{marginTop:8},children:[(0,s.jsx)("button",{className:"db-btn-primary",onClick:R,disabled:h,children:h?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58\u8FDE\u63A5"}),(0,s.jsx)("button",{onClick:r,disabled:c,children:c?"\u6D4B\u8BD5\u4E2D\u2026":"\u6D4B\u8BD5\u8FDE\u63A5"}),(0,s.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u53D6\u6D88"})]})]})}function ht({connection:e,callbacks:a}){let o=ne(e.type),d=e.type==="postgresql"||e.type==="mysql",[t,f]=(0,$.useState)(""),[c,x]=(0,$.useState)(),[h,D]=(0,$.useState)([]),[N,y]=(0,$.useState)([]),[C,m]=(0,$.useState)([]),[p,v]=(0,$.useState)(""),[E,r]=(0,$.useState)(""),R=(0,$.useRef)(0),i=l=>R.current===l,P=async(l,z,O)=>{if(i(l)){v("\u52A0\u8F7D\u8868\u2026");try{let{tables:A}=await I.tables(e.id,O,z||void 0);if(!i(l))return;m(A)}catch(A){i(l)&&r(await _(A))}finally{i(l)&&v("")}}};(0,$.useEffect)(()=>{let l=++R.current;return v("\u52A0\u8F7D\u5BF9\u8C61\u2026"),r(""),(async()=>{try{let[z,O]=await Promise.all([d?I.databases(e.id):Promise.resolve(null),o?I.schemas(e.id,void 0):Promise.resolve(null)]);if(!i(l))return;z?.supported&&D(z.databases);let A;O&&(y(O.schemas),A=O.schemas.find(g=>g.name==="public")?.name??O.schemas.find(g=>g.name===e.schema)?.name??O.schemas[0]?.name,x(A)),await P(l,"",A)}catch(z){i(l)&&r(await _(z))}finally{i(l)&&v("")}})(),()=>{R.current+=1}},[e.id]);let w=async l=>{let z=++R.current;f(l),m([]),y([]),x(void 0),r("");try{if(o){v("\u52A0\u8F7D\u6A21\u5F0F\u2026");let O=await I.schemas(e.id,l||void 0);if(!i(z))return;y(O.schemas);let A=O.schemas.find(g=>g.name==="public")?.name??O.schemas.find(g=>g.name===e.schema)?.name??O.schemas[0]?.name;x(A),await P(z,l,A)}else await P(z,l)}catch(O){i(z)&&r(await _(O))}finally{i(z)&&v("")}},u=async l=>{let z=++R.current;x(l||void 0),m([]),r(""),await P(z,t,l||void 0)},k=l=>{a.onOpenBrowse(e,{table:l,...t?{database:t}:{},...c&&o?{schema:c}:{}})};return(0,s.jsxs)("div",{className:"db-tree",children:[d&&(0,s.jsxs)("div",{className:"db-tree-row",children:[(0,s.jsx)("span",{className:"db-muted",children:"\u6570\u636E\u5E93"}),(0,s.jsxs)("select",{value:t,onChange:l=>void w(l.target.value),title:"\u5207\u6362\u540E\u91CD\u65B0\u52A0\u8F7D\u8BE5\u5E93\u4E0B\u7684\u5BF9\u8C61",children:[(0,s.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u8FDE\u63A5\u9ED8\u8BA4\u5E93","\uFF09"]}),h.map(l=>(0,s.jsx)("option",{value:l,children:l},l))]})]}),o&&N.length>0&&(0,s.jsxs)("div",{className:"db-tree-row",children:[(0,s.jsx)("span",{className:"db-muted",children:"schema"}),(0,s.jsx)("select",{value:c??"",onChange:l=>void u(l.target.value),title:"\u5207\u6362\u6A21\u5F0F\u5E76\u52A0\u8F7D\u5176\u5BF9\u8C61",children:N.map(l=>(0,s.jsx)("option",{value:l.name,children:l.name},l.name))})]}),E?(0,s.jsx)(W,{kind:"error",text:E}):null,p?(0,s.jsx)("div",{className:"db-muted db-tree-hint",children:p}):null,!p&&C.length===0&&!E?(0,s.jsx)("div",{className:"db-muted db-tree-hint",children:"\uFF08\u8BE5\u5E93/\u6A21\u5F0F\u4E0B\u6CA1\u6709\u8868\u6216\u89C6\u56FE\uFF09"}):null,(0,s.jsx)("div",{className:"db-tree-tables",children:C.map(l=>(0,s.jsxs)("button",{className:"db-tree-table",title:`${Be[l.kind]??l.kind}\u300C${l.name}\u300D\u2014\u2014\u70B9\u51FB\u5728\u53F3\u4FA7\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF08\u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\uFF09`,onClick:()=>k(l),children:[(0,s.jsx)("span",{children:gt[l.kind]??"\u{1F5C2}"}),(0,s.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:l.name}),(0,s.jsx)("span",{className:"db-badge",children:Be[l.kind]??l.kind})]},`${l.name}-${l.kind}`))}),(0,s.jsx)("div",{className:"db-tree-actions",style:{gap:6},children:(0,s.jsx)("span",{className:"db-muted db-grow",style:{fontSize:11},children:"\u70B9\u51FB\u8868/\u89C6\u56FE/\u96C6\u5408\u5728\u53F3\u4FA7\u6253\u5F00\u5176\u5DE5\u4F5C\u533A"})}),(0,s.jsxs)("div",{className:"db-tree-actions",style:{borderTop:"1px solid var(--db-border)",paddingTop:6,marginTop:4},children:[(0,s.jsx)("button",{onClick:()=>a.onEdit(e),children:"\u270F\uFE0F \u7F16\u8F91"}),(0,s.jsx)("button",{className:"db-btn-danger",onClick:()=>void a.onDelete(e),children:"\u5220\u9664"}),(0,s.jsx)("span",{className:"db-grow"}),(0,s.jsx)("button",{className:"db-btn-ghost",title:"\u6536\u8D77\u8BE5\u8FDE\u63A5\u7684\u5BF9\u8C61\u6811",onClick:()=>a.onCollapse(),children:"\u6536\u8D77 \u25B4"})]})]})}function Ae(e){let{connections:a,busyList:o,refresh:d,focusId:t}=e,[f,c]=(0,$.useState)(null),[x,h]=(0,$.useState)(null),[D,N]=(0,$.useState)(""),y=(0,$.useRef)(!1),[C,m]=(0,$.useState)(null);(0,$.useEffect)(()=>{y.current||!t||a.some(r=>r.id===t)&&(y.current=!0,c(t),e.onFocused?.(t))},[a,t]),(0,$.useEffect)(()=>{C&&a.some(r=>r.id===C)&&(c(C),e.onFocused?.(C),m(null))},[a,C]);let p=r=>{N(""),f===r.id?c(null):(c(r.id),e.onFocused?.(r.id))},v=r=>{N(""),h(r?{id:r.id,name:r.name,type:r.type,host:r.host,port:r.port,user:r.user,database:r.database,schema:r.schema,ssl:r.ssl,file:r.file,authSource:r.authSource,dmCompat:r.dmCompat,dmNoEncrypt:r.dmNoEncrypt,options:r.options,hasPassword:r.hasPassword,open:!0,isNew:!1}:{name:"",type:"postgresql",open:!0,isNew:!0})},E=async r=>{if(window.confirm(`\u786E\u5B9A\u5220\u9664\u8FDE\u63A5\u300C${r.name}\u300D\u5417\uFF1F`)){N("");try{(await I.remove(r.id)).ok||N(`\u5220\u9664\u5931\u8D25\uFF1A\u672A\u627E\u5230\u8FDE\u63A5 ${r.id}\uFF08\u53EF\u80FD\u5DF2\u88AB\u5176\u5B83\u9875\u9762\u5220\u9664\uFF09`),f===r.id&&c(null),await d()}catch(R){N(await _(R))}}};return(0,s.jsxs)("div",{className:"db-nav",children:[(0,s.jsxs)("div",{className:"db-nav-head",children:[(0,s.jsxs)("span",{className:"db-nav-title",children:["\u{1F50C} \u8FDE\u63A5\u7BA1\u7406",a.length>0?`\uFF08${a.length}\uFF09`:""]}),(0,s.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,s.jsx)("button",{title:"\u5237\u65B0\u8FDE\u63A5\u5217\u8868",onClick:()=>void d(),disabled:o,children:o?"\u2026":"\u21BB"}),(0,s.jsx)("button",{className:"db-btn-primary",title:"\u65B0\u5EFA\u8FDE\u63A5",onClick:()=>v(null),children:"\uFF0B \u65B0\u5EFA"})]})]}),(0,s.jsx)(W,{kind:"error",text:D}),x&&x.open&&(0,s.jsx)(ft,{draft:x,onClose:()=>h(null),onSaved:r=>{m(r.id),d(),h(null)},onChanged:()=>void d()}),a.length===0?(0,s.jsx)("div",{className:"db-empty",children:"\u8FD8\u6CA1\u6709\u8FDE\u63A5\u3002\u70B9\u51FB\u300C\uFF0B \u65B0\u5EFA\u300D\u6DFB\u52A0 PostgreSQL / MySQL / MongoDB / SQLite / \u8FBE\u68A6 \u8FDE\u63A5\u3002"}):(0,s.jsx)("div",{className:"db-nav-list",children:a.map(r=>(0,s.jsxs)($.Fragment,{children:[(0,s.jsxs)("div",{className:`db-conn-row${f===r.id?" db-conn-active":""}`,onClick:()=>p(r),title:`${r.name} \xB7 ${Y[r.type]}${r.lastError?` \xB7 \u4E0A\u6B21\u6D4B\u8BD5\u5931\u8D25\uFF1A${r.lastError}`:""} \u2014\u2014 \u70B9\u51FB\u5C55\u5F00\u5BF9\u8C61\u6811`,children:[(0,s.jsx)("span",{className:"db-conn-caret",children:f===r.id?"\u25BE":"\u25B8"}),(0,s.jsx)("span",{className:"db-grow db-conn-name",children:r.name}),(0,s.jsx)("span",{className:"db-badge db-badge-type",children:mt[r.type]??r.type}),r.lastError?(0,s.jsx)("span",{className:"db-dot db-dot-bad",title:`\u4E0A\u6B21\u6D4B\u8BD5\u5931\u8D25\uFF1A${r.lastError}`}):r.lastTestedAt?(0,s.jsx)("span",{className:"db-dot db-dot-ok",title:`\u4E0A\u6B21\u6D4B\u8BD5\u901A\u8FC7\uFF1A${r.lastTestedAt}`}):null]}),f===r.id&&(0,s.jsxs)("div",{className:"db-tree-host",children:[(0,s.jsx)("div",{className:"db-muted db-tree-hint",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:r.type==="sqlite"?(0,s.jsx)("span",{className:"db-chip",children:r.file}):(0,s.jsxs)("span",{children:[r.host??"",r.port?`:${r.port}`:"",r.user?` \xB7 ${r.user}`:"",r.database?` \xB7 \u5E93:${r.database}`:""]})}),(0,s.jsx)(ht,{connection:r,callbacks:{onOpenBrowse:e.onOpenBrowse,onEdit:v,onDelete:R=>void E(R),onCollapse:()=>c(null)}})]})]},r.id))})]})}var T=F("react");var n=F("react/jsx-runtime");function vt(e,a,o){let d={};e&&o[e.col]&&(d.sort={column:o[e.col]??"",dir:e.dir===1?"asc":"desc"});let t={};for(let[f,c]of Object.entries(a)){let x=o[Number(f)],h=String(c??"").trim();!x||!h||(t[x]=h)}return Object.keys(t).length>0&&(d.filters=t),Object.keys(d).length>0?d:null}function xt({connection:e,target:a}){let{table:o,database:d,schema:t}=a,f=ne(e.type),[c,x]=(0,T.useState)([]),[h,D]=(0,T.useState)(null),[N,y]=(0,T.useState)(0),[C,m]=(0,T.useState)(200),[p,v]=(0,T.useState)(""),[E,r]=(0,T.useState)(""),[R,i]=(0,T.useState)(!1),[P,w]=(0,T.useState)(null),[u,k]=(0,T.useState)(null),[l,z]=(0,T.useState)(null),[O,A]=(0,T.useState)({}),[g,S]=(0,T.useState)(null),q=(0,T.useRef)(void 0);(0,T.useEffect)(()=>{let L=!1;return v(`\u8BFB\u53D6\u300C${o.name}\u300D\u2026`),r(""),w(null),k(null),z(null),A({}),S(null),q.current!==void 0&&(window.clearTimeout(q.current),q.current=void 0),Promise.all([I.columns(e.id,o.name,t,d),I.rows(e.id,o.name,t,C,0,d)]).then(([B,K])=>{L||(x(B.columns),D(K))}).catch(async B=>{L||r(await _(B))}).finally(()=>{L||v("")}),()=>{L=!0}},[e.id,o.name,t,d]);let X=async(L,B,K)=>{q.current!==void 0&&(window.clearTimeout(q.current),q.current=void 0),v("\u67E5\u8BE2\u4E2D\u2026"),r(""),w(null),k(null);try{let be=h?.columns??[],Ye=B===null?null:B?.sort!==void 0?B.sort:l,Ze=B===null?{}:B?.filters!==void 0?B.filters:O,et=vt(Ye,Ze,be),tt=await I.rows(e.id,o.name,t,K??C,Math.max(0,L),d,et);D(tt),y(Math.max(0,L))}catch(be){r(await _(be))}finally{v("")}},Ke=L=>{let B=l?.col===L?l.dir:0,K=B===1?{col:L,dir:-1}:B===-1?null:{col:L,dir:1};z(K),S(null),X(0,{sort:K,filters:O})},Je=(L,B)=>{let K={...O,[L]:B};A(K),q.current!==void 0&&window.clearTimeout(q.current),q.current=window.setTimeout(()=>{X(0,{sort:l,filters:K})},350)},Ue=()=>{z(null),A({}),S(null),X(0,null)},ye=h?.columns??[],ce=h?.rows??[],Xe=l!==null||Object.values(O).some(L=>L.trim()!==""),we=P&&h&&P.row<h.rows.length?h.rows[P.row]??null:null;return(0,n.jsxs)("div",{className:"db-pane-stack",children:[(0,n.jsxs)("div",{className:"db-card",style:{padding:0},children:[(0,n.jsxs)("button",{className:"db-card-title db-structure-toggle",onClick:()=>i(L=>!L),title:R?"\u70B9\u51FB\u6298\u53E0":"\u70B9\u51FB\u5C55\u5F00",style:{width:"100%",cursor:"pointer",border:0,background:"none",textAlign:"left"},children:[(0,n.jsxs)("span",{children:[R?"\u25BE":"\u25B8"," \u{1F9EC} \u5B57\u6BB5\u7ED3\u6784\uFF08",c.length," \u4E2A\u5B57\u6BB5\uFF09"]}),p?(0,n.jsx)("span",{className:"db-muted",children:p}):c.length===0?(0,n.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6\u5931\u8D25\u6216\u65E0\u5B57\u6BB5\uFF09"}):null]}),R&&(0,n.jsx)("div",{style:{padding:"2px 8px 6px",borderTop:"1px solid var(--db-border, rgba(128,128,128,.25))"},children:c.length===0?(0,n.jsx)("div",{className:"db-empty",children:E?"\uFF08\u8BFB\u53D6\u5931\u8D25\uFF09":"\uFF08\u65E0\u5B57\u6BB5\uFF09"}):(0,n.jsx)("div",{className:"db-list",children:c.map(L=>(0,n.jsxs)("div",{className:"db-list-item",style:{cursor:"default"},children:[(0,n.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--db-mono)"},children:L.name}),(0,n.jsx)("span",{className:"db-badge db-badge-type",style:{maxWidth:"45%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:L.type}),L.primary?(0,n.jsx)("span",{className:"db-badge",children:"PK"}):null,L.nullable===!1?(0,n.jsx)("span",{className:"db-badge",children:"NOT NULL"}):null]},L.name))})})]}),(0,n.jsxs)("div",{className:"db-card",style:{padding:0},children:[(0,n.jsxs)("div",{className:"db-card-title",style:{padding:"8px 8px 0"},children:[(0,n.jsx)("span",{children:"\u{1F50D} \u6570\u636E\u9884\u89C8"}),h?(0,n.jsx)("span",{className:"db-muted",children:h.total!==void 0?`\u5171 ${h.total} \u884C \xB7 \u672C\u9875 ${h.rowCount}`:`${h.rowCount} \u884C \xB7 \u504F\u79FB ${N}`}):null]}),(0,n.jsxs)("div",{style:{padding:"0 6px"},children:[(0,n.jsx)(W,{kind:"error",text:E}),u&&(0,n.jsx)(W,{kind:u.kind==="ok"?"ok":"error",text:u.text}),p&&(0,n.jsx)("div",{className:"db-muted",style:{padding:"6px 0"},children:p}),Xe?(0,n.jsxs)("div",{className:"db-row",style:{margin:"2px 0 6px",gap:8},children:[(0,n.jsxs)("span",{className:"db-ok",children:["\u5DF2\u542F\u7528\u6574\u8868",Object.values(O).some(L=>L.trim()!=="")?"\u8FC7\u6EE4":"",l?"\u6392\u5E8F":""]}),(0,n.jsx)("button",{onClick:Ue,children:"\u6E05\u9664\u6392\u5E8F / \u8FC7\u6EE4"}),(0,n.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u6392\u5E8F/\u8FC7\u6EE4\u7531\u6570\u636E\u5E93\u6267\u884C\uFF0C\u7FFB\u9875\u7EE7\u7EED\u751F\u6548"})]}):null,(0,n.jsxs)("div",{style:{display:"flex",alignItems:"stretch"},children:[(0,n.jsxs)("div",{className:"db-gridx",children:[h?ce.length===0?(0,n.jsx)("div",{className:"db-empty",style:{padding:14},children:h.message??"\uFF08\u65E0\u6570\u636E\uFF09"}):(0,n.jsx)(fe,{columns:ye,rows:ce,active:P,onCellClick:(L,B)=>{w({row:L,col:B}),k(null)},interaction:e.type==="mongodb"?void 0:{sort:l,onSort:Ke,filters:O,onFilter:Je,filterOpen:g,onFilterOpen:L=>S(L)}}):(0,n.jsx)("div",{className:"db-empty",style:{padding:14},children:p||"\u52A0\u8F7D\u4E2D\u2026"}),(0,n.jsxs)("div",{className:"db-muted",style:{padding:"4px 2px",fontSize:12},children:["\u70B9\u51FB\u4EFB\u610F\u5355\u5143\u683C\u53EF\u5728\u53F3\u4FA7\u67E5\u770B / \u7F16\u8F91\uFF1B\u62D6\u52A8\u8868\u5934\u5206\u9694\u7EBF\u53EF\u8C03\u5217\u5BBD\uFF1B",e.type!=="mongodb"?"\u70B9\u51FB\u5217\u540D\u6392\u5E8F\u3001\u26B2 \u8FC7\u6EE4\uFF08\u4F5C\u7528\u4E8E\u6574\u8868\uFF09":""]})]}),P&&we&&h&&(0,n.jsx)($e,{connection:e,table:o,schema:t,database:d,tableName:o.name,queryColumns:ye,metaColumns:c,row:we,colIndex:P.col,onClose:()=>w(null),onSaved:()=>{X(N)},onMessage:(L,B)=>k({text:L,kind:B})},`${P.row}-${P.col}`)]}),h&&h.kind==="select"&&(0,n.jsxs)("div",{className:"db-row",style:{marginTop:8,gap:8,paddingBottom:10},children:[(0,n.jsx)("button",{disabled:N<=0,onClick:()=>X(N-C),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,n.jsx)("button",{disabled:h.total!==void 0?N+C>=h.total:ce.length<C,onClick:()=>X(N+C),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,n.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875"}),(0,n.jsx)("select",{value:C,onChange:L=>{let B=Number(L.target.value);m(B),X(0,void 0,B)},children:[50,200,500,1e3,5e3].map(L=>(0,n.jsx)("option",{value:L,children:L},L))})]})]})]})]})}function Ie(e){let[a,o]=(0,T.useState)([]),d=e.type==="postgresql"||e.type==="mysql";return(0,T.useEffect)(()=>{let t=!1;if(o([]),!!d)return I.databases(e.id).then(f=>{!t&&f.supported&&o(f.databases)}).catch(()=>{}),()=>{t=!0}},[e.id,d]),{switchable:d,databases:a}}function yt({connection:e,initialDatabase:a}){let[o,d]=(0,T.useState)(""),[t,f]=(0,T.useState)(!0),[c,x]=(0,T.useState)(null),[h,D]=(0,T.useState)(!1),[N,y]=(0,T.useState)(""),[C,m]=(0,T.useState)(a??""),[p,v]=(0,T.useState)(200),{switchable:E,databases:r}=Ie(e),R=async i=>{let P=(i??o).trim();if(!P){y("\u8BF7\u8F93\u5165 SQL");return}D(!0),y("");try{x(await I.query(e.id,P,t,p,C||void 0))}catch(w){y(await _(w)),x(null)}finally{D(!1)}};return(0,n.jsxs)("div",{className:"db-card",children:[(0,n.jsxs)("div",{className:"db-card-title",children:[(0,n.jsxs)("span",{children:["\u2328\uFE0F SQL \u67E5\u8BE2",e.type==="mongodb"?"":`\uFF1A${e.name}`]}),E&&(0,n.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,n.jsx)("span",{className:"db-muted",children:"\u76EE\u6807\u5E93"}),(0,n.jsxs)("select",{value:C,onChange:i=>m(i.target.value),title:"\u8BE5\u5B50\u9875\u7684\u76EE\u6807\u6570\u636E\u5E93\uFF08\u9ED8\u8BA4=\u8FDE\u63A5\u9ED8\u8BA4\u5E93\uFF09",children:[(0,n.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),r.map(i=>(0,n.jsx)("option",{value:i,children:i},i))]})]}),(0,n.jsx)("span",{className:"db-muted",children:e.type==="mongodb"?"\u63D0\u793A\uFF1A\u8FD9\u91CC\u4E5F\u63A5\u53D7 JSON \u67E5\u8BE2\uFF08\u5E26 collection \u5B57\u6BB5\uFF09":"\u63D0\u793A\uFF1A\u591A\u6761\u8BED\u53E5\u4EC5\u5728\u975E\u53EA\u8BFB\u65F6\u5141\u8BB8"})]}),(0,n.jsx)("textarea",{className:"db-code",value:o,onChange:i=>d(i.target.value),placeholder:e.type==="mongodb"?'{"collection":"users","filter":{"age":{"$gt":18}},"limit":50}':`SELECT * FROM \u8868\u540D LIMIT 100;
-- \u53EA\u8BFB\u6A21\u5F0F\u9ED8\u8BA4\u5F00\u542F`,spellCheck:!1}),(0,n.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,n.jsxs)("label",{className:"db-row",style:{cursor:"pointer",gap:6},children:[(0,n.jsx)("input",{type:"checkbox",checked:t,onChange:i=>f(i.target.checked)})," \u53EA\u8BFB\u6A21\u5F0F\uFF08\u63A8\u8350\uFF09"]}),(0,n.jsx)("div",{className:"db-grow"}),(0,n.jsx)("button",{className:"db-btn-primary",onClick:()=>R(),disabled:h,children:h?"\u6267\u884C\u4E2D\u2026":"\u6267\u884C (Ctrl+Enter)"})]}),(0,n.jsx)(W,{kind:"error",text:N}),(0,n.jsx)(he,{result:c,limit:p,onLimitChange:v})]})}function wt({connection:e,initialDatabase:a}){let[o,d]=(0,T.useState)(""),[t,f]=(0,T.useState)(null),[c,x]=(0,T.useState)(null),[h,D]=(0,T.useState)(""),[N,y]=(0,T.useState)(""),[C,m]=(0,T.useState)(""),[p,v]=(0,T.useState)(200),[E,r]=(0,T.useState)(null),[R,i]=(0,T.useState)(-1),[P,w]=(0,T.useState)(a??""),{switchable:u,databases:k}=Ie(e),l=(0,T.useMemo)(()=>(E?.providers??[]).flatMap(g=>{let S=g.label&&g.label.length>0?`${g.label}\uFF08${g.provider}\uFF09`:g.provider;return g.models.length===0?[{provider:g.provider,label:`${S} \xB7 \u9ED8\u8BA4\u6A21\u578B`}]:g.models.map(q=>({provider:g.provider,model:q.id,label:`${S} / ${q.label&&q.label.length>0?q.label:q.id}`}))}),[E]),z=()=>{let g=R>=0?l[R]:void 0;if(g)return{...g.provider?{provider:g.provider}:{},...g.model?{model:g.model}:{}}};(0,T.useEffect)(()=>{let g=!1;return I.aiModels().then(S=>{g||r(S)}).catch(()=>{g||r(null)}),()=>{g=!0}},[]);let O=async()=>{if(!o.trim()){m("\u8BF7\u8F93\u5165\u8981\u67E5\u8BE2\u7684\u95EE\u9898");return}y("AI \u751F\u6210 SQL \u4E2D\u2026"),m("");try{let g=await I.aiGenerate(e.id,o,z(),P||void 0);f(g),D(g.sql),x(null)}catch(g){m(await _(g))}finally{y("")}},A=async()=>{if(!h.trim()&&!o.trim()){m("\u6CA1\u6709\u53EF\u6267\u884C\u7684 SQL\uFF0C\u8BF7\u5148\u751F\u6210\u6216\u586B\u5199");return}y("\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"),m("");try{let g=await I.aiRun(e.id,o||h,z(),p,P||void 0);x(g),f({sql:g.sql,engine:g.engine,provider:g.provider,model:g.model,note:g.note}),D(g.sql)}catch(g){m(await _(g))}finally{y("")}};return(0,n.jsxs)("div",{className:"db-card",children:[(0,n.jsxs)("div",{className:"db-card-title",children:[(0,n.jsxs)("span",{children:["\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF1A",e.name]}),u&&(0,n.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,n.jsx)("span",{className:"db-muted",children:"\u76EE\u6807\u5E93"}),(0,n.jsxs)("select",{value:P,onChange:g=>w(g.target.value),title:"\u8BE5\u5B50\u9875\u7684\u76EE\u6807\u6570\u636E\u5E93\uFF08\u9ED8\u8BA4=\u8FDE\u63A5\u9ED8\u8BA4\u5E93\uFF09",children:[(0,n.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),k.map(g=>(0,n.jsx)("option",{value:g,children:g},g))]})]}),(0,n.jsx)("span",{className:"db-muted",children:"\u6A21\u578B\u590D\u7528 DSH \u914D\u7F6E\uFF0C\u65E0\u9700\u5728\u63D2\u4EF6\u4E2D\u586B Key"})]}),(0,n.jsxs)("div",{className:"db-row",style:{gap:8,margin:"2px 0 8px"},children:[(0,n.jsx)("label",{className:"db-muted",style:{whiteSpace:"nowrap"},children:"\u6309\u9700\u9009\u6A21\u578B\uFF1A"}),(0,n.jsxs)("select",{value:R,onChange:g=>i(Number(g.target.value)),style:{maxWidth:420},children:[(0,n.jsx)("option",{value:-1,children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),l.map((g,S)=>(0,n.jsx)("option",{value:S,children:g.label},S))]}),E&&!E.ok?(0,n.jsx)("span",{className:"db-badge",style:{color:"var(--db-err)",borderColor:"color-mix(in srgb, var(--db-err) 40%, transparent)"},children:E.message??"\u6A21\u578B\u670D\u52A1\u4E0D\u53EF\u7528"}):null,E===null?(0,n.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6 DSH \u6A21\u578B\u5217\u8868\u4E2D\u2026\uFF09"}):null]}),(0,n.jsx)("textarea",{className:"db-code",style:{minHeight:90},value:o,onChange:g=>d(g.target.value),placeholder:"\u4F8B\u5982\uFF1A\u7EDF\u8BA1\u672C\u6708\u6BCF\u4E2A\u57CE\u5E02\u7684\u4E0B\u5355\u7528\u6237\u6570\u548C\u8BA2\u5355\u603B\u989D\uFF0C\u6309\u57CE\u5E02\u6392\u5E8F",spellCheck:!1}),(0,n.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,n.jsx)("button",{className:"db-btn-primary",onClick:O,disabled:N!==""||!o.trim(),children:N==="AI \u751F\u6210 SQL \u4E2D\u2026"?"\u751F\u6210\u4E2D\u2026":"\u751F\u6210 SQL"}),(0,n.jsx)("button",{disabled:N!==""||!o.trim(),onClick:A,children:N==="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?"\u6267\u884C\u4E2D\u2026":"\u751F\u6210\u5E76\u76F4\u63A5\u67E5\u8BE2"}),(0,n.jsx)("div",{className:"db-grow"}),(0,n.jsx)("button",{className:"db-btn-ghost",onClick:()=>{f(null),D(""),x(null)},children:"\u6E05\u7A7A"})]}),(0,n.jsx)(W,{kind:"error",text:C}),N&&N!=="AI \u751F\u6210 SQL \u4E2D\u2026"&&N!=="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?(0,n.jsx)("div",{className:"db-muted",children:N}):null,t&&(0,n.jsxs)("div",{className:"db-card",style:{background:"var(--db-panel-2)"},children:[(0,n.jsxs)("div",{className:"db-card-title",children:[(0,n.jsx)("span",{children:"\u{1F916} \u751F\u6210\u7684 SQL\uFF08\u53EF\u4FEE\u6539\u540E\u6267\u884C\uFF09"}),(0,n.jsxs)("span",{className:"db-muted",children:[t.engine==="custom"?"\u81EA\u5B9A\u4E49\u7AEF\u70B9":"DSH \u6A21\u578B",t.provider?` \xB7 ${t.provider}${t.model?`/${t.model}`:""}`:"",t.note?` \xB7 ${t.note}`:""]})]}),(0,n.jsx)("textarea",{className:"db-code",value:h,onChange:g=>D(g.target.value),spellCheck:!1,style:{minHeight:110}}),(0,n.jsx)("div",{className:"db-row",style:{marginTop:8},children:(0,n.jsx)("button",{className:"db-btn-primary",onClick:A,disabled:N!=="",children:"\u6267\u884C\u6B64 SQL\uFF08\u53EA\u8BFB\uFF09"})})]}),c&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("div",{className:"db-divider"}),(0,n.jsx)(he,{result:c.result,limit:p,onLimitChange:v})]}),t&&!c&&(0,n.jsx)("div",{className:"db-divider"})]})}var kt={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"},Nt={view:"\u89C6\u56FE",collection:"\u96C6\u5408",table:"\u8868"};function qe({connection:e,target:a}){let{table:o,database:d,schema:t}=a,f=ne(e.type),[c,x]=(0,T.useState)("browse"),[h,D]=(0,T.useState)({browse:!0,sql:!1,nl:!1}),N=C=>{x(C),h[C]||D(m=>({...m,[C]:!0}))},y=C=>c===C?void 0:{display:"none"};return(0,n.jsxs)("div",{className:"db-pane-stack",children:[(0,n.jsxs)("div",{className:"db-ws-head",children:[(0,n.jsx)("span",{className:"db-ws-icon",children:kt[o.kind]??"\u{1F5C2}"}),(0,n.jsx)("strong",{className:"db-ws-name",children:o.name}),(0,n.jsx)("span",{className:"db-badge db-badge-type",children:Nt[o.kind]??o.kind}),d?(0,n.jsxs)("span",{className:"db-badge",children:["\u5E93\uFF1A",d]}):null,t&&f?(0,n.jsxs)("span",{className:"db-badge",children:["schema\uFF1A",t]}):null,(0,n.jsx)("span",{className:"db-badge",children:Y[e.type]}),(0,n.jsx)("span",{className:"db-muted",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:e.name}),(0,n.jsx)("div",{className:"db-grow"}),(0,n.jsxs)("div",{className:"db-seg",role:"tablist","aria-label":"\u5DE5\u4F5C\u533A\u5B50\u9875",children:[(0,n.jsx)("button",{role:"tab","aria-selected":c==="browse",className:c==="browse"?"db-active":"",onClick:()=>N("browse"),children:"\u{1F4DA} \u6570\u636E\u6D4F\u89C8"}),(0,n.jsx)("button",{role:"tab","aria-selected":c==="sql",className:c==="sql"?"db-active":"",onClick:()=>N("sql"),children:"\u2328\uFE0F SQL \u67E5\u8BE2"}),(0,n.jsx)("button",{role:"tab","aria-selected":c==="nl",className:c==="nl"?"db-active":"",onClick:()=>N("nl"),children:"\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2"})]})]}),(0,n.jsxs)("div",{className:"db-ws-pages",children:[(0,n.jsx)("div",{className:"db-ws-page",style:y("browse"),children:(0,n.jsx)(xt,{connection:e,target:a})}),h.sql&&(0,n.jsx)("div",{className:"db-ws-page",style:y("sql"),children:(0,n.jsx)(yt,{connection:e,initialDatabase:d})}),h.nl&&(0,n.jsx)("div",{className:"db-ws-page",style:y("nl"),children:(0,n.jsx)(wt,{connection:e,initialDatabase:d})})]})]})}var M=F("react/jsx-runtime"),Ct={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"};function St(e,a){return`browse:${e.id}|${a.database??""}|${a.schema??""}|${a.table.name}`}function Tt(e,a){return[e.name,a.database,a.schema,a.table.name].filter(Boolean).join(" \xB7 ")}function de(e={}){let[a,o]=(0,V.useState)([]),[d,t]=(0,V.useState)(!1),[f,c]=(0,V.useState)({level:"info",text:"\u52A0\u8F7D\u4E2D\u2026"}),x=(0,V.useRef)(!0),h=(0,V.useRef)(ae().lastConnId??null),[D,N]=(0,V.useState)(null),[y,C]=(0,V.useState)([]),[m,p]=(0,V.useState)(null),v=(0,V.useCallback)(u=>{try{oe({lastConnId:u})}catch{}},[]),E=(0,V.useCallback)(async()=>{t(!0);try{let{connections:u}=await I.connections();o(u),h.current&&u.some(l=>l.id===h.current)&&(N(h.current),h.current=null);let k=y.filter(l=>u.some(z=>z.id===l.connId));k.length!==y.length&&(C(k),p(l=>l!==null&&k.some(z=>z.key===l)?l:k.length>0?k[k.length-1].key:null)),u.length===0?c({level:"info",text:"\u5C1A\u672A\u914D\u7F6E\u8FDE\u63A5"}):c({level:"info",text:`${u.length} \u4E2A\u8FDE\u63A5\u5DF2\u52A0\u8F7D`})}catch(u){let k=u instanceof Error?u.message:String(u);c({level:"error",text:`\u52A0\u8F7D\u8FDE\u63A5\u5217\u8868\u5931\u8D25\uFF1A${k}\uFF08\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u5728 DSH \u4E2D\u542F\u7528\uFF09`})}finally{t(!1)}},[y]);(0,V.useEffect)(()=>{x.current&&(x.current=!1,E())},[E]);let r=(0,V.useCallback)(u=>{C(k=>k.some(l=>l.key===u.key)?k:[...k,u]),p(u.key),v(u.connId)},[v]),R=(0,V.useCallback)((u,k)=>{r({key:St(u,k),kind:"browse",connId:u.id,title:k.table.name,sub:Tt(u,k),target:k})},[r]),i=(0,V.useCallback)(u=>{p(k=>{if(k!==u)return k;let l=!1,z=null;for(let O of y){if(O.key===u){l=!0;continue}if(!l)z=O.key;else return O.key}return z}),C(k=>k.filter(l=>l.key!==u))},[y]),P=u=>{let k=a.find(l=>l.id===u.connId);return k?(0,M.jsx)(qe,{connection:k,target:u.target}):null},w=u=>Ct[u.target.table.kind]??"\u{1F5C2}";return(0,M.jsxs)("div",{className:"db-app",children:[(0,M.jsxs)("div",{className:"db-topbar",children:[(0,M.jsxs)("div",{className:"db-title",children:[(0,M.jsx)("span",{className:"db-logo",children:"DB"})," \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",(0,M.jsx)("span",{className:"db-badge db-badge-type",children:"dsh-database-console"})]}),(0,M.jsx)("div",{className:"db-grow"}),d?(0,M.jsx)("span",{className:"db-muted",children:"\u2026"}):null,f.level==="error"?(0,M.jsx)("span",{className:"db-muted",style:{color:"var(--db-err)"},title:f.text,children:"\u26A0\uFE0F"}):null,e.onClose?(0,M.jsx)("button",{onClick:e.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:e.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),(0,M.jsxs)("div",{className:"db-app-body",children:[(0,M.jsx)(Ae,{connections:a,busyList:d,refresh:E,focusId:D,onFocused:v,onOpenBrowse:R}),(0,M.jsxs)("div",{className:"db-main",children:[(0,M.jsxs)("div",{className:"db-tabbar",role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u5DE5\u4F5C\u533A",children:[y.length===0?(0,M.jsx)("span",{className:"db-muted",style:{padding:"0 10px",whiteSpace:"nowrap"},children:"\u4ECE\u5DE6\u4FA7\u5C55\u5F00\u8FDE\u63A5\uFF0C\u70B9\u51FB\u8868/\u89C6\u56FE/\u96C6\u5408\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF08\u5185\u542B \u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF09\u3002"}):null,y.map(u=>(0,M.jsxs)("div",{role:"tab","aria-selected":u.key===m,className:`db-tab${u.key===m?" db-tab-active":""}`,title:`${u.sub} \u2014\u2014 \u70B9\u51FB\u5207\u6362\uFF0C\u2715 \u5173\u95ED`,onClick:()=>p(u.key),children:[(0,M.jsx)("span",{className:"db-tab-icon",children:w(u)}),(0,M.jsx)("span",{className:"db-tab-label",children:u.title}),(0,M.jsx)("span",{className:"db-tab-close",title:"\u5173\u95ED",onClick:k=>{k.stopPropagation(),i(u.key)},children:"\u2715"})]},u.key))]}),(0,M.jsx)("div",{className:"db-tabpanes",children:y.length===0?(0,M.jsxs)("div",{className:"db-empty",style:{flex:1},children:[(0,M.jsx)("div",{children:"\u8FD8\u6CA1\u6709\u6253\u5F00\u4EFB\u4F55\u5DE5\u4F5C\u533A\u3002"}),(0,M.jsxs)("div",{style:{marginTop:6,fontSize:12},children:["\u5DE6\u4FA7\u70B9\u51FB\u8FDE\u63A5\u540D\u5C55\u5F00\u5BF9\u8C61\u6811 \u2192 \u70B9\u8868/\u89C6\u56FE/\u96C6\u5408\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF1B",(0,M.jsx)("br",{}),"\u6BCF\u4E2A Tab \u5185\u542B\u300C\u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\u300D\u4E09\u4E2A\u5B50\u9875\uFF0C\u5404\u81EA\u72EC\u7ACB\u4FDD\u6301\u72B6\u6001\uFF1B",(0,M.jsx)("br",{}),"\u91CD\u590D\u70B9\u51FB\u540C\u4E00\u5F20\u8868\u4F1A\u5B9A\u4F4D\u56DE\u5B83\u5DF2\u6253\u5F00\u7684 Tab\u3002"]})]}):y.map(u=>(0,M.jsx)("div",{role:"tabpanel",className:"db-pane","data-active":u.key===m?"true":void 0,style:u.key===m?void 0:{display:"none"},children:P(u)},u.key))})]})]})]})}var te=F("react/jsx-runtime"),U=null,Fe=null;function Et(){let e=Pe();return(0,te.jsx)("div",{style:{width:"100%",height:"100%",minHeight:0,minWidth:0,display:e.panelOpen?"flex":"none",flexDirection:"column",overflow:"hidden"},children:(0,te.jsx)(de,{onClose:()=>Q.close(),standalone:!0})})}function Ve(e){return U!==null||(U=document.createElement("div"),U.id="dsh-database-console",U.style.cssText=e==="standalone"?["position:fixed","left:24px","right:24px","top:24px","bottom:24px","z-index:2147482000","border-radius:12px","box-shadow:0 18px 48px rgba(0,0,0,.45)","overflow:hidden","display:flex","flex-direction:column","background:var(--db-bg)"].join(";"):["position:absolute","inset:0","z-index:30","display:none","flex-direction:column","overflow:hidden","background:var(--db-bg)"].join(";"),document.body.appendChild(U),Fe=(0,He.createRoot)(U),Fe.render(e==="standalone"?(0,te.jsx)(Et,{}):(0,te.jsx)(de,{onClose:()=>Q.close(),standalone:!1}))),U}function Qe(){typeof document>"u"||Ve("standalone")}function je(e){let a=(0,ie.useRef)(null);return(0,ie.useEffect)(()=>{let o=a.current;if(o===null)return;let d=Ve("dsh"),t=o.closest("[data-phase]")??o.parentElement,f,c=x=>{Number.isFinite(x)&&x>=32&&d.style.setProperty("--db-shell-header-h",`${x}px`)};if(t!=null){let x=t.querySelector("header");x!==null&&(f=new ResizeObserver(h=>{for(let D of h){let N=D.borderBoxSize,y=Array.isArray(N)?N[0]?.blockSize:void 0;c(y??x.getBoundingClientRect().height)}}),f.observe(x),c(x.getBoundingClientRect().height))}return t!=null&&(Q.setDocked(!0),d.style.display="flex",d.parentElement!==t&&t.appendChild(d)),()=>{f?.disconnect(),Q.setDocked(!1),d.parentElement!==document.body&&document.body.appendChild(d),d.style.display="none"}},[]),(0,te.jsx)("div",{ref:a,style:{height:0,overflow:"hidden"}})}var le=`/* dsh-database-console \u5BA2\u6237\u7AEF\u6837\u5F0F
 *
 * \u4E3B\u9898\u7B56\u7565\uFF08\u5BF9\u9F50\u756A\u8304\u5DE5\u4F5C\u53F0 tomato-board\uFF09\uFF1A
 *   \u989C\u8272\u4E00\u5F8B\u5F15\u7528 DSH Web \u7684\u4E3B\u9898 token\uFF08--dsw-alias-* / --ds-*\uFF09\uFF0C\u8DDF\u968F DSH
 *   \u914D\u7F6E\u7684\u4E3B\u9898\uFF08\u660E\u6697 / \u6362\u80A4\uFF09\u81EA\u52A8\u53D8\u5316\uFF1B\u4EC5\u5728\u8131\u79BB DSH \u7684\u72EC\u7ACB\u9884\u89C8\u6A21\u5F0F\u4E0B\u56DE\u843D\u5230
 *   \u5185\u7F6E\u6697\u8272\u503C\uFF08var() \u7684 fallback\uFF09\u3002
 *
 * \u5E03\u5C40\u7B56\u7565\uFF1A
 *   \u5DE5\u4F5C\u53F0\u56DB\u8FB9\u4E0D\u7559 margin\uFF0C\u533A\u57DF\u4E4B\u95F4\u7528 1px hairline \u5206\u5272\u7EBF\uFF08--db-border\uFF09\u5206\u5F00\uFF1B
 *   \u9762\u677F/\u5361\u7247\u4E0D\u518D\u81EA\u5E26\u63CF\u8FB9\u4E0E\u5E95\u8272\uFF0C\u5C3D\u91CF\u5C11\u8FB9\u6846\u3002
 */
:root {
  --db-bg: var(--dsw-alias-bg-base, #12141a);
  --db-panel: var(--dsw-alias-bg-layer-1, #171a21);
  --db-panel-2: var(--dsw-alias-bg-layer-2, #1d212b);
  --db-border: var(--dsw-alias-border-l2, rgba(136, 148, 168, 0.24));
  --db-border-strong: var(--dsw-alias-border-l3, rgba(136, 148, 168, 0.38));
  --db-text: var(--dsw-alias-label-primary, #e6e9ef);
  --db-muted: var(--dsw-alias-label-secondary, #8b93a3);
  --db-faint: var(--dsw-alias-label-tertiary, #6b7383);
  --db-accent: var(--dsw-alias-state-business-primary, #4c8dff);
  --db-accent-weak: color-mix(in srgb, var(--db-accent) 12%, transparent);
  --db-ok: var(--dsw-alias-state-success-primary, #37c978);
  --db-warn: var(--dsw-alias-state-warn-primary, #e0b341);
  --db-err: var(--dsw-alias-state-error-primary, #ff5f56);
  --db-radius: 10px;
  --db-mono: "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace;
  --db-ease: var(--ds-transition-duration-fast, 120ms) var(--ds-ease-in-out, ease);
  /* \u5BBF\u4E3B\u5BF9\u8BDD\u5934\u90E8\u5B9E\u6D4B\u9AD8\u5EA6\uFF08db-console-overlay \u7528 ResizeObserver \u5199\u5165\uFF09\uFF1B
     \u62FF\u4E0D\u5230\u65F6\u56DE\u843D 76px\u3002\u9876\u680F + TabBar \u9AD8\u5EA6\u4E4B\u548C\u8DDF\u968F\u5B83\uFF0C\u4E0E\u5BBF\u4E3B\u5934\u90E8\u5E95\u8FB9\u5BF9\u9F50\u3002 */
  --db-shell-header-h: 76px;
  --db-tabbar-h: 32px;
}

/* \u4E2D\u680F\u63A5\u7BA1\u8BF4\u660E\uFF1A\u5DE5\u4F5C\u53F0\u6253\u5F00\u65F6\u7531 db-console-overlay \u628A\u6301\u4E45\u5BB9\u5668\uFF08#dsh-database-console\uFF09
   \u4EE5 absolute inset:0 \u8986\u76D6\u5230 Conversation \u6839\u8282\u70B9\u4E0A\uFF08\u53C2\u8003\u756A\u8304\u5DE5\u4F5C\u53F0\uFF09\uFF0C\u4E0D\u9690\u85CF\u3001
   \u4E0D\u4FEE\u6539\u4EFB\u4F55\u5BBF\u4E3B\u5143\u7D20\uFF0C\u56E0\u6B64\u8FD9\u91CC\u6CA1\u6709\u4EFB\u4F55\u9488\u5BF9\u5BBF\u4E3B\uFF08\u5934\u90E8/composer\uFF09\u7684\u89C4\u5219\u3002 */

/* token \u91CD\u58F0\u660E\uFF1ADSH \u7684 --dsw-alias-* \u82E5\u4E0D\u662F\u6302\u5728 :root \u800C\u662F\u6302\u5728\u5E94\u7528\u5BB9\u5668\u4E0A\uFF0C
   \u8FD9\u91CC\u5728\u5BB9\u5668\u81EA\u8EAB\u518D\u6C42\u503C\u4E00\u6B21\uFF0C\u4FDD\u8BC1\u5DE5\u4F5C\u53F0\u53D6\u5230\u6B63\u786E\u4E3B\u9898\u8272\u3002 */
#dsh-database-console {
  --db-bg: var(--dsw-alias-bg-base, #12141a);
  --db-panel: var(--dsw-alias-bg-layer-1, #171a21);
  --db-panel-2: var(--dsw-alias-bg-layer-2, #1d212b);
  --db-border: var(--dsw-alias-border-l2, rgba(136, 148, 168, 0.24));
  --db-border-strong: var(--dsw-alias-border-l3, rgba(136, 148, 168, 0.38));
  --db-text: var(--dsw-alias-label-primary, #e6e9ef);
  --db-muted: var(--dsw-alias-label-secondary, #8b93a3);
  --db-faint: var(--dsw-alias-label-tertiary, #6b7383);
  --db-accent: var(--dsw-alias-state-business-primary, #4c8dff);
  --db-ok: var(--dsw-alias-state-success-primary, #37c978);
  --db-warn: var(--dsw-alias-state-warn-primary, #e0b341);
  --db-err: var(--dsw-alias-state-error-primary, #ff5f56);

  background: var(--db-bg);
  color: var(--db-text);
  font-size: 13px;
  line-height: 1.5;
  font-family: var(--dsw-font-family, inherit);
  box-sizing: border-box;
}
#dsh-database-console *,
#dsh-database-console *::before,
#dsh-database-console *::after {
  box-sizing: border-box;
}

/* ------------------------------------------------------------------ \u9876\u680F */
/* \u9AD8\u5EA6 = \u5BBF\u4E3B\u5BF9\u8BDD\u5934\u90E8\u9AD8\u5EA6 - TabBar \u9AD8\u5EA6\uFF0C\u4F7F\u300C\u9876\u680F+TabBar\u300D\u5E95\u90E8\u5206\u5272\u7EBF\u4E0E
   \u5BBF\u4E3B\u5934\u90E8\u5E95\u8FB9\uFF08\u6D45\u84DD\u8272\u533A\u57DF\u4E0B\u6CBF\uFF09\u7CBE\u786E\u5BF9\u9F50\u3002 */
#dsh-database-console .db-topbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  height: calc(var(--db-shell-header-h, 76px) - var(--db-tabbar-h, 32px));
  min-height: 40px;
  padding: 0 20px;
  margin: 0;
  border: 0;
  border-bottom: 1px solid var(--db-border);
  background: transparent;
}
#dsh-database-console .db-title {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
#dsh-database-console .db-logo {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: var(--db-accent);
  color: var(--dsw-alias-label-primary-inverted, #fff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

/* ------------------------------------------------------------------ \u4E3B\u4F53 */
/* \u4E0A\u4E0B\u7ED3\u6784\uFF1A\u9876\u680F / (\u5DE6\u5BFC\u822A | \u53F3\u5DE5\u4F5C\u533A)\u3002\u533A\u57DF\u95F4\u53EA\u9760\u5206\u5272\u7EBF\uFF0C\u65E0 margin\u3001\u65E0 gap\u3002 */
#dsh-database-console .db-app {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}
#dsh-database-console .db-app-body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  gap: 0;
  padding: 0;
}

/* ---------- \u5DE6\u4FA7\u5BFC\u822A\uFF08\u8FDE\u63A5\u7BA1\u7406 + \u5BF9\u8C61\u6811\uFF09\uFF1A\u900F\u660E\u5E95 + \u53F3\u4FA7\u5206\u5272\u7EBF ---------- */
#dsh-database-console .db-nav {
  flex: 0 0 264px;
  width: 264px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--db-border);
  border-radius: 0;
  padding: 10px 10px 12px;
}
#dsh-database-console .db-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 0 0 auto;
}
#dsh-database-console .db-nav-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--db-muted);
  letter-spacing: 0.4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#dsh-database-console .db-nav-head button {
  padding: 3px 8px;
  font-size: 12px;
}
#dsh-database-console .db-nav-editor {
  background: var(--db-panel);
  border-radius: var(--db-radius);
}
#dsh-database-console .db-nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
}
#dsh-database-console .db-conn-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  min-width: 0;
  transition: background var(--db-ease);
}
#dsh-database-console .db-conn-row:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-accent-weak));
}
#dsh-database-console .db-conn-row.db-conn-active {
  background: var(--dsw-alias-interactive-bg-active, var(--db-accent-weak));
}
#dsh-database-console .db-conn-caret {
  flex: 0 0 auto;
  color: var(--db-muted);
  font-size: 10px;
  width: 12px;
  text-align: center;
}
#dsh-database-console .db-conn-name {
  font-weight: 600;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#dsh-database-console .db-dot {
  flex: 0 0 auto;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
#dsh-database-console .db-dot-ok {
  background: var(--db-ok);
}
#dsh-database-console .db-dot-bad {
  background: var(--db-err);
}

/* \u5C55\u5F00\u7684\u5BF9\u8C61\u6811\uFF1A\u53BB\u6389\u5916\u6846\u4E0E\u5E95\u8272\uFF0C\u4EC5\u4FDD\u7559\u7F29\u8FDB */
#dsh-database-console .db-tree-host {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 4px 14px;
  padding: 2px 0 0;
  border: 0;
  background: transparent;
  min-width: 0;
}
#dsh-database-console .db-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
#dsh-database-console .db-tree-hint {
  font-size: 11px;
  padding: 2px 4px;
}
#dsh-database-console .db-tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
#dsh-database-console .db-tree-row > .db-muted {
  flex: 0 0 auto;
  font-size: 11px;
}
#dsh-database-console .db-tree-row select {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12px;
  padding: 3px 6px;
}
#dsh-database-console .db-tree-tables {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
}
#dsh-database-console .db-tree-table {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--db-text);
  font-size: 12px;
  text-align: left;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  min-width: 0;
  transition: background var(--db-ease);
}
#dsh-database-console .db-tree-table:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-accent-weak));
}
#dsh-database-console .db-tree-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
#dsh-database-console .db-tree-actions button {
  font-size: 12px;
  padding: 3px 8px;
}

/* ---------- \u53F3\u4FA7 Tab \u5DE5\u4F5C\u533A\uFF1A\u900F\u660E\u5E95\uFF0CTabBar \u5E95\u90E8\u4E00\u6761\u5206\u5272\u7EBF ---------- */
#dsh-database-console .db-main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: hidden;
}
#dsh-database-console .db-tabbar {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
  gap: 4px;
  height: calc(var(--db-tabbar-h, 32px) - 1px);
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 12px;
  border-bottom: 1px solid var(--db-border);
  background: transparent;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
}
#dsh-database-console .db-tabbar > .db-muted {
  display: flex;
  align-items: center;
}
/* \u756A\u8304\u5DE5\u4F5C\u53F0 pageTabs \u540C\u6B3E\uFF1A\u6587\u5B57 Tab + \u4E3B\u9898\u8272\u4E0B\u5212\u7EBF\u6307\u793A */
#dsh-database-console .db-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  height: 100%;
  max-width: 240px;
  min-width: 0;
  padding: 0 6px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--db-muted);
  font-size: 12.5px;
  white-space: nowrap;
  user-select: none;
  transition: color var(--db-ease);
}
#dsh-database-console .db-tab::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: -1px;
  left: 2px;
  height: 2px;
  border-radius: 2px;
  background: transparent;
}
#dsh-database-console .db-tab:hover {
  color: var(--db-text);
}
#dsh-database-console .db-tab.db-tab-active {
  color: var(--db-accent);
  font-weight: 600;
}
#dsh-database-console .db-tab.db-tab-active::after {
  background: var(--db-accent);
}
#dsh-database-console .db-tab-icon {
  flex: 0 0 auto;
  font-size: 12px;
}
#dsh-database-console .db-tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
#dsh-database-console .db-tab-close {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  line-height: 14px;
  text-align: center;
  border-radius: 4px;
  font-size: 11px;
  opacity: 0.55;
}
#dsh-database-console .db-tab-close:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--db-err) 18%, transparent);
  color: var(--db-err);
}
#dsh-database-console .db-tabpanes {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  display: flex;
  position: relative;
}
#dsh-database-console .db-pane {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  /* \u5DE6\u53F3\u5185\u8FB9\u8DDD\u4E3A 0\uFF1A\u8BA9 ws-head / \u5361\u7247\u7684\u6A2A\u5411\u5206\u5272\u7EBF\u901A\u5230\u5DE6\u5BFC\u822A\u5206\u5272\u7EBF\u4E0E\u53F3\u8FB9\u7F18\uFF1B
     \u6587\u5B57\u4E0E\u8868\u683C\u7684\u7559\u767D\u7531\u5404\u5185\u5BB9\u5757\u81EA\u5DF1\u7684 padding \u63D0\u4F9B\u3002 */
  padding: 8px 0 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
}
#dsh-database-console .db-pane-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
/* \u7EB5\u5411\u5806\u53E0\u7684\u5361\u7247\u4E4B\u95F4\u7528 hairline \u5206\u5272\u7EBF\u4EE3\u66FF\u5361\u7247\u63CF\u8FB9\uFF08\u7EBF\u4E0A\u4E0B\u7559\u547C\u5438\u7A7A\u95F4\uFF09 */
#dsh-database-console .db-pane-stack > .db-card + .db-card {
  border-top: 1px solid var(--db-border);
  padding-top: 8px;
}
/* \u8868\u5DE5\u4F5C\u533A\u5934\u90E8\uFF1A\u5BF9\u8C61\u4FE1\u606F + \u5B50\u9875\u5207\u6362\u540C\u4E00\u884C\uFF0C\u7D27\u51D1\uFF0C\u5E95\u90E8\u4E00\u6761\u5206\u5272\u7EBF\uFF08\u901A\u5230\u4E24\u8FB9\u7F18\uFF09 */
#dsh-database-console .db-ws-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
  padding: 2px 8px 10px;
  border-bottom: 1px solid var(--db-border);
}
#dsh-database-console .db-ws-head .db-seg {
  flex: 0 0 auto;
}
#dsh-database-console .db-ws-icon {
  font-size: 15px;
}
#dsh-database-console .db-ws-name {
  font-size: 14px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#dsh-database-console .db-ws-pages {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
}

/* ------------------------------------------------------------------ \u901A\u7528\u5C0F\u4EF6 */

#dsh-database-console button {
  font: inherit;
  color: var(--db-text);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--db-border) 72%, transparent);
  border-radius: 8px;
  padding: 5px 12px;
  cursor: pointer;
  transition: background var(--db-ease), border-color var(--db-ease), color var(--db-ease);
}
#dsh-database-console button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-accent-weak));
}
#dsh-database-console button:focus-visible {
  outline: 2px solid var(--db-accent);
  outline-offset: 1px;
}
#dsh-database-console button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
#dsh-database-console button.db-btn-primary {
  background: var(--db-accent);
  border-color: transparent;
  color: var(--dsw-alias-label-primary-inverted, #fff);
  font-weight: 600;
}
#dsh-database-console button.db-btn-primary:hover:not(:disabled) {
  background: color-mix(in srgb, var(--db-accent) 86%, #fff);
}
#dsh-database-console button.db-btn-danger {
  color: var(--db-err);
}
#dsh-database-console button.db-btn-ghost {
  background: transparent;
  border-color: transparent;
}
#dsh-database-console input,
#dsh-database-console select,
#dsh-database-console textarea {
  font: inherit;
  color: var(--db-text);
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 8px;
  padding: 6px 10px;
  outline: none;
  transition: border-color var(--db-ease);
}
#dsh-database-console input:focus,
#dsh-database-console select:focus,
#dsh-database-console textarea:focus {
  border-color: var(--db-accent);
}
#dsh-database-console .db-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
#dsh-database-console .db-field label {
  color: var(--db-muted);
  font-size: 12px;
}
#dsh-database-console .db-grid {
  display: grid;
  gap: 12px;
}
/* \u5361\u7247\uFF1A\u900F\u660E\u65E0\u8FB9\u6846\uFF1B\u5D4C\u5957\u5361\u7247\uFF08\u5982 AI \u751F\u6210\u7684 SQL \u5757\uFF09\u7528\u4E00\u5C42\u5E95\u8272\u533A\u5206 */
#dsh-database-console .db-card {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 10px 8px;
}
#dsh-database-console .db-card .db-card {
  background: var(--db-panel);
  border-radius: var(--db-radius);
}
#dsh-database-console .db-card-title {
  font-size: 12px;
  color: var(--db-muted);
  letter-spacing: 0.4px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
#dsh-database-console .db-banner {
  padding: 8px 12px;
  border-radius: 8px;
  border: 0;
  margin: 6px 0;
}
#dsh-database-console .db-banner-error {
  background: var(--dsw-alias-state-error-secondary, rgba(255, 95, 86, 0.12));
  color: var(--db-err);
}
#dsh-database-console .db-banner-info {
  background: var(--db-accent-weak);
  color: var(--db-accent);
}
#dsh-database-console .db-banner-ok {
  background: var(--dsw-alias-state-success-secondary, rgba(55, 201, 120, 0.12));
  color: var(--db-ok);
}
#dsh-database-console table.db-data {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
#dsh-database-console table.db-data th,
#dsh-database-console table.db-data td {
  border: 1px solid color-mix(in srgb, var(--db-border) 60%, transparent);
  padding: 5px 9px;
  text-align: left;
  vertical-align: top;
  max-width: 340px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
#dsh-database-console table.db-data th {
  background: var(--db-bg);
  color: var(--db-muted);
  position: sticky;
  top: 0;
  font-weight: 600;
  cursor: default;
}
#dsh-database-console table.db-data tbody tr:hover td {
  background: color-mix(in srgb, var(--db-accent) 8%, transparent);
}
#dsh-database-console .db-scroll {
  overflow: auto;
  border: 1px solid color-mix(in srgb, var(--db-border) 60%, transparent);
  border-radius: 8px;
  max-height: 420px;
}
#dsh-database-console .db-null {
  color: var(--db-faint);
  font-style: italic;
}
#dsh-database-console .db-mono {
  font-family: var(--db-mono);
  font-size: 12px;
}
#dsh-database-console .db-ok {
  color: var(--db-ok);
}
#dsh-database-console .db-err {
  color: var(--db-err);
}
#dsh-database-console .db-muted {
  color: var(--db-muted);
}
#dsh-database-console .db-empty {
  color: var(--db-muted);
  text-align: center;
  padding: 28px 10px;
}
#dsh-database-console .db-badge {
  display: inline-block;
  font-size: 11px;
  line-height: 1.6;
  border-radius: 999px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--db-border) 80%, transparent);
  color: var(--db-muted);
  background: transparent;
}
#dsh-database-console .db-badge-ok {
  color: var(--db-ok);
  border-color: color-mix(in srgb, var(--db-ok) 40%, transparent);
}
#dsh-database-console .db-badge-type {
  color: var(--db-accent);
  border-color: color-mix(in srgb, var(--db-accent) 36%, transparent);
}
#dsh-database-console .db-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
#dsh-database-console .db-grow {
  flex: 1 1 auto;
  min-width: 0;
}
#dsh-database-console .db-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
#dsh-database-console .db-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: background var(--db-ease);
}
#dsh-database-console .db-list-item:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-accent-weak));
}
#dsh-database-console .db-list-item.db-active {
  background: var(--dsw-alias-interactive-bg-active, var(--db-accent-weak));
}
#dsh-database-console .db-chip {
  font-family: var(--db-mono);
  font-size: 11px;
  color: var(--db-accent);
}
#dsh-database-console .db-divider {
  height: 1px;
  background: var(--db-border);
  margin: 10px 0;
}
#dsh-database-console textarea.db-code {
  font-family: var(--db-mono);
  font-size: 12.5px;
  line-height: 1.55;
  width: 100%;
  min-height: 150px;
  resize: vertical;
  tab-size: 2;
}
#dsh-database-console .db-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
#dsh-database-console .db-pager {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--db-muted);
  font-size: 12px;
  padding: 6px 0;
}
/* \u5206\u6BB5\u9009\u62E9\u5668\uFF08\u6570\u636E\u6D4F\u89C8 / SQL / \u81EA\u7136\u8BED\u8A00\uFF09 */
#dsh-database-console .db-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: var(--db-panel);
  border: 1px solid color-mix(in srgb, var(--db-border) 72%, transparent);
  border-radius: 999px;
  padding: 2px;
}
#dsh-database-console .db-seg button {
  border: 0;
  background: transparent;
  padding: 3px 11px;
  border-radius: 999px;
  color: var(--db-muted);
}
#dsh-database-console .db-seg button:hover {
  color: var(--db-text);
  background: transparent;
}
#dsh-database-console .db-seg button.db-active {
  background: var(--db-accent-weak);
  color: var(--db-accent);
  font-weight: 600;
}

/* ===== DSH shell \u96C6\u6210\uFF1A\u4FA7\u8FB9\u680F\u5165\u53E3 ===== */
/* \uFF08\u65E7\u5C5E\u6027\u5F00\u5173\u65F6\u4EE3\u7684\u4E2D\u680F\u63A5\u7BA1\u89C4\u5219\u5DF2\u5220\u9664\uFF1A[data-dsh-database-view] \u4E00\u7C7B\u5C5E\u6027
   presence \u9009\u62E9\u5668\u4F1A\u8BEF\u4F24\u5BBF\u4E3B\u8282\u70B9 \u2014\u2014 0.4.5 \u767D\u5C4F\u4E8B\u6545\u6839\u56E0\uFF1B\u65B0\u65B9\u6848\u7531
   db-console-overlay \u76F4\u63A5\u628A #dsh-database-console \u5BB9\u5668\u8986\u76D6\u5230 Conversation
   \u6839\u8282\u70B9\u4E0A\uFF0C\u4E0D\u4F9D\u8D56\u4EFB\u4F55\u5C5E\u6027\u5F00\u5173\u3002\uFF09 */

[data-pane='conversation'],
[class*='centerCol'] {
  position: relative;
}

/* DSH footerActions \u5BB9\u5668\u9ED8\u8BA4\u662F \`display: flex; flex-wrap: nowrap\`\uFF0C\u6240\u6709
   sidebar.footer.action entry \u90FD\u88AB\u6324\u5728\u7B2C\u4E00\u884C\u3002\u8986\u76D6\u4E3A wrap\uFF0C\u8BA9\u6211\u4EEC\u8FD9\u79CD
   flex-basis: 100% \u7684 entry \u771F\u7684\u6362\u884C\u5230\u4E0B\u4E00\u884C\uFF08\u5149\u5199 \`flex: 0 0 100%\` \u53EA\u4F1A
   \u8BA9\u5144\u5F1F entry \u6EA2\u51FA\u88AB\u88C1\u6389\uFF0C\u4E0D\u4F1A\u6362\u884C\uFF09\u3002\u53EA\u5F71\u54CD footerActions \u8FD9\u4E00\u4E2A\u5BB9\u5668\uFF0C
   \u4E0D\u4F1A\u6C61\u67D3 sidebar \u5176\u5B83\u5E03\u5C40\u3002 */
.hHd-Xa_footerActions {
  flex-wrap: wrap !important;
}

/* \u4FA7\u8FB9\u680F\u5165\u53E3\u884C \u2014\u2014 flex-basis 100% \u8BA9\u81EA\u5DF1\u72EC\u5360\u6574\u884C\uFF0C\u914D\u5408\u7236\u5BB9\u5668 wrap \u8BA9\u540E\u9762
   \u7684 entry\uFF08cordis-panel / remote-web-ui \u7B49\uFF09\u6392\u5230\u4E0B\u4E00\u884C\u3002 */
button.db-sidebar-entry {
  box-sizing: border-box;
  flex: 0 0 100%;
  max-width: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin: 0;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  text-align: left;
  cursor: pointer;
}
button.db-sidebar-entry:hover {
  background: var(--dsw-alias-interactive-bg-hover, transparent);
  color: var(--dsw-alias-label-secondary);
}
button.db-sidebar-entry[data-active='true'],
button.db-sidebar-entry[data-active='true']:hover {
  background: var(--dsw-alias-interactive-bg-active);
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}
.db-sidebar-entry-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}
button.db-sidebar-entry svg {
  display: block;
}

/* ===== \u72EC\u7ACB\u9884\u89C8\u6A21\u5F0F ===== */
#dsh-database-standalone-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  background: var(--db-bg, #12141a);
  overflow: auto;
}

/* ---------- \u6570\u636E\u6D4F\u89C8\uFF1A\u53EF\u62D6\u5217\u5BBD\u7F51\u683C / \u5355\u5143\u683C\u7F16\u8F91 ---------- */
#dsh-database-console .db-structure-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 26px;
  padding: 0 8px;
  margin-bottom: 0;
  font: inherit;
  color: inherit;
  border: 0;
  border-radius: 8px;
  transition: background var(--db-ease);
}
#dsh-database-console .db-structure-toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-panel-2));
}
/* \u53CC\u8868\u7F51\u683C\uFF1A\u8868\u5934\u56FA\u5B9A\u5728\u5916\u5C42\u4E0D\u53C2\u4E0E\u7AD6\u5411\u6EDA\u52A8\uFF1B\u8868\u4F53\u72EC\u7ACB\u6EDA\u52A8\uFF1B\u5171\u7528\u540C\u4E00\u7EC4\u5217\u5BBD\u3002
   \u7F51\u683C\u5916\u6846\u53BB\u6389\uFF0C\u4EC5\u9760\u8868\u7EBF\u4E0E\u8868\u5934\u5E95\u90E8\u5206\u5272\u7EBF\u754C\u5B9A\u3002 */
#dsh-database-console .db-gridx {
  flex: 1 1 auto;
  min-width: 0;
  border: 0;
  border-radius: 0;
}
#dsh-database-console .db-gridx-head {
  overflow: hidden;
  background: var(--db-bg);
  border-bottom: 1px solid var(--db-border-strong);
}
#dsh-database-console .db-gridx-body {
  overflow: auto;
  max-height: 460px;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
}
#dsh-database-console table.db-gridx-t {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
#dsh-database-console table.db-gridx-t thead th {
  position: relative;
  color: var(--db-muted);
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
  user-select: none;
  padding: 0;
  min-height: 28px;
  border-right: 1px solid color-mix(in srgb, var(--db-border) 55%, transparent);
  vertical-align: top;
}
#dsh-database-console table.db-gridx-t thead th .db-gridx-th {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 6px 8px 6px 9px;
}
#dsh-database-console table.db-gridx-t thead th .db-gridx-th-main {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px 2px 9px;
}
#dsh-database-console .db-sort-label {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  border: 0;
  background: none;
  color: var(--db-muted);
  font-weight: 600;
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  padding: 2px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}
#dsh-database-console .db-sort-label:hover {
  color: var(--db-accent);
}
#dsh-database-console .db-sort-label .db-sort-idle {
  color: transparent;
  opacity: 0.55;
}
#dsh-database-console .db-sort-label:hover .db-sort-idle {
  color: var(--db-muted);
}
#dsh-database-console .db-sort-label .db-sort-on {
  color: var(--db-accent);
}
#dsh-database-console .db-filter-toggle {
  flex: 0 0 auto;
  width: 15px;
  height: 15px;
  line-height: 15px;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.55;
  user-select: none;
}
#dsh-database-console .db-filter-toggle:hover {
  opacity: 1;
  background: var(--db-accent-weak);
  color: var(--db-accent);
}
#dsh-database-console .db-filter-toggle.db-filter-on {
  opacity: 1;
  color: var(--db-accent);
  background: var(--db-accent-weak);
}
#dsh-database-console .db-gridx-filter {
  box-sizing: border-box;
  display: block;
  width: calc(100% - 9px);
  margin: 0 4px 4px 5px;
  padding: 2px 6px;
  font-size: 11px;
  border: 1px solid color-mix(in srgb, var(--db-accent) 55%, transparent);
  border-radius: 5px;
  background: var(--db-panel);
  color: inherit;
  outline: none;
}
#dsh-database-console .db-gridx-filter:focus {
  border-color: var(--db-accent);
}
#dsh-database-console table.db-gridx-t thead th .db-colresize {
  position: absolute;
  top: 0;
  right: -3px;
  width: 7px;
  height: 100%;
  cursor: col-resize;
  touch-action: none;
  z-index: 5;
}
#dsh-database-console table.db-gridx-t td.db-cell {
  border-bottom: 1px solid color-mix(in srgb, var(--db-border) 45%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--db-border) 45%, transparent);
  padding: 4px 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: inherit;
  transition: background var(--db-ease);
}
#dsh-database-console table.db-gridx-t td.db-cell:hover {
  background: color-mix(in srgb, var(--db-accent) 8%, transparent);
}
#dsh-database-console table.db-gridx-t td.db-cell-active,
#dsh-database-console table.db-gridx-t td.db-cell-active:hover {
  background: color-mix(in srgb, var(--db-accent) 18%, transparent);
  box-shadow: inset 0 0 0 1px var(--db-accent);
}
#dsh-database-console .db-celldetail {
  flex: 0 0 300px;
  width: 300px;
  max-width: 38%;
  min-width: 260px;
  padding: 10px 12px;
  border: 0;
  border-left: 1px solid var(--db-border);
  background: var(--db-panel);
  overflow: auto;
  max-height: 560px;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
}
#dsh-database-console .db-celldetail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 8px;
}
#dsh-database-console .db-celldetail-meta {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-wrap: anywhere;
}
#dsh-database-console .db-row-toggle {
  width: 100%;
  font-size: 12px;
  color: var(--db-accent);
  background: none;
  border: 1px solid color-mix(in srgb, var(--db-border) 72%, transparent);
  border-radius: 8px;
  padding: 5px 8px;
  margin-top: 8px;
  cursor: pointer;
  text-align: left;
  gap: 4px;
}
#dsh-database-console .db-row-toggle:hover {
  border-color: color-mix(in srgb, var(--db-accent) 55%, transparent);
  background: var(--db-accent-weak);
}
#dsh-database-console .db-celldetail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 8px;
  font-size: 11.5px;
  overflow-wrap: anywhere;
  margin-top: 6px;
  padding: 6px;
  border: 1px solid color-mix(in srgb, var(--db-border) 60%, transparent);
  border-radius: 8px;
  background: var(--db-bg);
}

/* \u7A84\u5C4F\u65F6\u7ED9\u6570\u636E\u6D4F\u89C8\u7F51\u683C\u66F4\u9AD8\u7684\u53EF\u89C6\u533A\uFF08Tab \u5185\u6EDA\u52A8\u65F6\u4FDD\u7559\u9875\u811A\uFF09 */
#dsh-database-console .db-gridx-body {
  max-height: 62vh;
}

/* ===== \u81EA\u9002\u5E94\u9875\u9762\u5BBD\u5EA6 =====
 * \u9762\u677F\u5BBD\u5EA6 = DSH \u4E2D\u680F\u5BBD\u5EA6\uFF08\u7531 db-console-overlay.tsx \u8DDF\u8E2A\u4E24\u5217\u5F97\u51FA\uFF09\uFF0C\u4E0D\u7B49\u4E8E\u89C6\u53E3
 * \u5BBD\u5EA6\uFF0C\u6240\u4EE5\u7528 container query\uFF08\u4EE5\u9762\u677F\u81EA\u8EAB\u4E3A\u5BB9\u5668\uFF09\u800C\u4E0D\u662F media query \u505A\u5185\u5BB9\u7EA7
 * \u81EA\u9002\u5E94\uFF1A\u4E2D\u680F\u88AB\u5DE6\u53F3\u4FA7\u680F\u6324\u538B\u65F6\u6536\u7D27\u5185\u8FB9\u8DDD\u4E0E\u5DE6\u5BFC\u822A\u5BBD\u5EA6\uFF0C\u4FDD\u8BC1\u5DE5\u4F5C\u533A\u53EF\u7528\u3002
 * \u4E0D\u652F\u6301 container query \u7684\u6D4F\u89C8\u5668\u4F1A\u6574\u6BB5\u5FFD\u7565\uFF0C\u56DE\u843D\u5230\u56FA\u5B9A 264px \u5BFC\u822A\uFF08\u6E10\u8FDB\u589E\u5F3A\uFF09\u3002 */
#dsh-database-console {
  container-type: inline-size;
}

@container (max-width: 960px) {
  #dsh-database-console .db-topbar {
    padding: 0 14px;
  }
  #dsh-database-console .db-nav {
    flex-basis: 228px;
    width: 228px;
    padding: 8px 8px 10px;
  }
}

@container (max-width: 780px) {
  #dsh-database-console .db-nav {
    flex-basis: 188px;
    width: 188px;
    padding: 8px 6px 10px;
  }
  #dsh-database-console .db-pane {
    padding: 8px 0 16px;
  }
}
`;var _e="dsh-database-console-style";function ve(){if(typeof document>"u")return()=>{};let e=document.getElementById(_e);if(e!==null&&e.isConnected)return()=>{};let a=document.createElement("style");return a.id=_e,a.setAttribute("data-plugin","dsh-database-console"),a.textContent=le,document.head.appendChild(a),()=>{a.isConnected&&a.remove()}}var se="database",Ge={"sidebar.label":"\u6570\u636E\u5E93","sidebar.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","sidebar.title":"\u6253\u5F00\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","overlay.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0\u9762\u677F","overlay.close":"\u56DE\u5230\u5BF9\u8BDD","toolbar.open":"\u6253\u5F00\u6570\u636E\u5E93","toolbar.close":"\u5173\u95ED\u6570\u636E\u5E93"},We={"sidebar.label":"Database","sidebar.aria":"Database console","sidebar.title":"Open database console","overlay.aria":"Database console panel","overlay.close":"Back to conversation","toolbar.open":"Open database","toolbar.close":"Close database"};var Lt=["slots","locale"];function Dt(e){let a=e?.slots,o=e?.locale;if(!a||!o){typeof document<"u"&&e?.effect?.(()=>xe(),"dsh-database-console: standalone preview");return}let d=o.bind(se),t=o.register(se,{zh:Ge,en:We}),f=ve(),c=a.inject("sidebar.footer.action",()=>a.register({name:"sidebar.footer.action",id:"database",order:-10,locale:se,label:()=>d("sidebar.label")},Oe)),x=a.inject("conversation.view",()=>a.register({name:"conversation.view",id:"database",order:60,locale:se,label:()=>d("sidebar.label")},je));e?.effect&&e.effect(()=>()=>{t(),c(),x(),f()},"dsh-database-console: plugin teardown")}function xe(){if(typeof document>"u"||document.getElementById("dsh-database-standalone-button")!==null)return;ve(),Qe();let e=document.createElement("button");e.id="dsh-database-standalone-button",e.textContent="\u{1F5C4} \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483000","background:linear-gradient(135deg,#4c8dff,#7b61ff)","color:#fff","border:0","border-radius:999px","padding:10px 18px","font:600 13px/1.4 system-ui,sans-serif","cursor:pointer","box-shadow:0 6px 18px rgba(0,0,0,.35)"].join(";"),e.addEventListener("click",()=>Q.toggle()),document.body.appendChild(e)}var Pt=globalThis;!Pt.window?.__ModuleLoader__&&typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>xe(),{once:!0}):xe());return dt(Ot);})();
    return __dsh_db_console_module__;
  },
});
