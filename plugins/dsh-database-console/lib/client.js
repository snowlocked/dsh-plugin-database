window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-database-console",
  factory: (require) => {
    "use strict";
    var __dsh_db_module = { exports: {} };
    var __dsh_db_exports = __dsh_db_module.exports;
    Object.defineProperty(__dsh_db_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_db_console_module__=(()=>{var pe=Object.defineProperty;var Xe=Object.getOwnPropertyDescriptor;var Ye=Object.getOwnPropertyNames;var Ze=Object.prototype.hasOwnProperty;var F=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(a,o)=>(typeof require<"u"?require:a)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var et=(e,a)=>{for(var o in a)pe(e,o,{get:a[o],enumerable:!0})},tt=(e,a,o,l)=>{if(a&&typeof a=="object"||typeof a=="function")for(let t of Ye(a))!Ze.call(e,t)&&t!==o&&pe(e,t,{get:()=>a[t],enumerable:!(l=Xe(a,t))||l.enumerable});return e};var at=e=>tt(pe({},"__esModule",{value:!0}),e);var Et={};et(Et,{apply:()=>St,cssText:()=>le,inject:()=>Nt});var ie=F("react");var re=F("react");var Se=F("react");var Ne="dsh-database-console.persist.v1";function te(){try{let e=window.localStorage.getItem(Ne);if(!e)return{};let a=JSON.parse(e);return a&&typeof a=="object"?a:{}}catch{return{}}}function ne(e){try{let a={...te(),...e};window.localStorage.setItem(Ne,JSON.stringify(a))}catch{}}var J=te().panelOpen===!0,Ce=null,me=new Set,se=()=>{for(let e of me)e()},Te=Object.freeze({panelOpen:!0,activeConnectionId:null}),Ee=Object.freeze({panelOpen:!1,activeConnectionId:null}),Re=J?Te:Ee,oe=()=>{Re=J?Te:Ee},ue=()=>{try{ne({panelOpen:J})}catch{}},_={open(){J||(J=!0,oe(),ue(),se())},close(){J&&(J=!1,oe(),ue(),se())},toggle(){J=!J,oe(),ue(),se()},getSnapshot:()=>Re,subscribe(e){return me.add(e),()=>me.delete(e)},setActiveConnection(e){Ce!==e&&(Ce=e,oe(),se())}};function Pe(){return(0,Se.useSyncExternalStore)(_.subscribe,_.getSnapshot,_.getSnapshot)}var G=F("react/jsx-runtime"),nt=(0,G.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,G.jsx)("ellipse",{cx:7.5,cy:11,rx:5.5,ry:2.75}),(0,G.jsx)("path",{d:"M7.5 11V5.5"}),(0,G.jsx)("path",{d:"M2.75 6.25c0-1.1 2.1-2 4.75-2s4.75.9 4.75 2"}),(0,G.jsx)("path",{d:"M7.5 8.25c1.9 0 3.4-.45 3.9-1.1M5.25 4.35V3.5"})]});function Le(e){let{wide:a=!0,t:o=(b=>b)}=e,l=o,t=(0,re.useSyncExternalStore)(_.subscribe,_.getSnapshot,_.getSnapshot),v=(0,re.useCallback)(()=>{_.toggle()},[]);return(0,G.jsxs)("button",{type:"button","data-d-sh-plugin":"database","data-active":t.panelOpen||void 0,"aria-label":l("sidebar.aria"),title:l("sidebar.title"),onClick:v,className:"db-sidebar-entry",children:[(0,G.jsx)("span",{className:"db-sidebar-entry-icon","aria-hidden":"true",children:nt}),a?(0,G.jsx)("span",{className:"db-sidebar-entry-label",children:l("sidebar.label")}):null]})}var de=F("react");var Q=F("react");var Y={postgresql:"PostgreSQL",mysql:"MySQL",mongodb:"MongoDB",sqlite:"SQLite",dameng:"\u8FBE\u68A6 DM"},st="/api/dsh-database-console",Z=class extends Error{status;code;constructor(a,o,l){super(a),this.status=o,this.code=l}};async function ot(e,a){let o;try{o=await fetch(`${st}${e}`,a)}catch(t){throw new Z(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${t instanceof Error?t.message:String(t)}`,0)}let l=null;try{l=await o.json()}catch{l=null}if(!o.ok){let t=l&&typeof l=="object"?l:{};throw new Z(String(t.error??`HTTP ${o.status}`),o.status,String(t.code??""))}return l}function rt(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)}}function j(e,a){return ot(e,rt(a??{}))}var A={state:()=>j("/state"),connections:()=>j("/connections/list"),meta:e=>j("/connection/meta",{id:e}),save:e=>j("/connections/save",e),remove:e=>j("/connection/remove",{id:e}),test:e=>j("/connections/test",e),databases:e=>j("/connection/databases",{id:e}),schemas:(e,a)=>j("/connection/schemas",{id:e,...a?{database:a}:{}}),tables:(e,a,o)=>j("/connection/tables",{id:e,...a?{schema:a}:{},...o?{database:o}:{}}),columns:(e,a,o,l)=>j("/connection/columns",{id:e,table:a,...o?{schema:o}:{},...l?{database:l}:{}}),rows:(e,a,o,l,t,v,b)=>j("/connection/rows",{id:e,table:a,...o?{schema:o}:{},...v?{database:v}:{},limit:l,offset:t,...b?.sort?{sort:b.sort}:{},...b?.filters&&Object.keys(b.filters).length>0?{filters:b.filters}:{}}),cellUpdate:e=>j("/connection/cell/update",{id:e.id,table:e.table,...e.schema?{schema:e.schema}:{},...e.database?{database:e.database}:{},column:e.column,pk:e.pk,value:e.value,isNull:e.isNull}),query:(e,a,o,l,t)=>j("/query",{id:e,sql:a,readOnly:o,...t?{database:t}:{},...l?{limit:l}:{}}),aiModels:()=>j("/ai/models"),aiGenerate:(e,a,o,l)=>j("/ai/generate",{id:e,question:a,...l?{database:l}:{},...o?.provider?{provider:o.provider}:{},...o?.model?{model:o.model}:{}}),aiRun:(e,a,o,l,t)=>j("/ai/run",{id:e,question:a,...t?{database:t}:{},...o?.provider?{provider:o.provider}:{},...o?.model?{model:o.model}:{},...l?{limit:l}:{}})};function ae(e){return e==="postgresql"||e==="dameng"}function Oe(e){switch(e){case"postgresql":return 5432;case"mysql":return 3306;case"mongodb":return 27017;case"dameng":return 5236;default:return null}}function U(e){if(e==null)return"NULL";if(typeof e=="object")try{return JSON.stringify(e)}catch{return String(e)}return String(e)}var z=F("react");var V=F("react");var c=F("react/jsx-runtime");function K({kind:e,text:a}){return a?(0,c.jsx)("div",{className:`db-banner db-banner-${e}`,children:a}):null}function De({result:e}){if(!e)return null;let a=[`\u8017\u65F6 ${e.durationMs}ms`];return(e.rowCount>0||e.columns.length>0)&&a.push(`${e.rowCount} \u884C`),e.affectedRows!==void 0&&a.push(`\u5F71\u54CD ${e.affectedRows} \u884C`),e.truncated&&a.push(`\u26A0\uFE0F \u5DF2\u622A\u65AD\uFF08\u4EC5\u663E\u793A ${e.rows.length} \u884C\uFF09`),(0,c.jsxs)("div",{className:"db-row db-muted",style:{padding:"6px 2px"},children:[(0,c.jsx)("span",{className:e.kind==="change"?"db-ok":"",children:a.join(" \xB7 ")}),e.message?(0,c.jsx)("span",{className:"db-ok",children:e.message}):null]})}async function H(e){return e instanceof Z||e instanceof Error?e.message:String(e)}function dt(e){let a=(e.length+6)*8+40;return Math.min(420,Math.max(120,a))}function ge({columns:e,rows:a,active:o,onCellClick:l,interaction:t}){let[v,b]=(0,V.useState)({}),N=(0,V.useRef)(null),g=m=>Math.min(720,Math.max(72,Math.round(m))),O=m=>v[m]??dt(e[m]??""),C=e.reduce((m,p,h)=>m+O(h),0),x=(m,p)=>{p.preventDefault(),p.stopPropagation();let h=p.clientX,E=O(m),r=d=>{let D=g(E+(d.clientX-h));b(y=>y[m]===D?y:{...y,[m]:D})},R=()=>{window.removeEventListener("pointermove",r),window.removeEventListener("pointerup",R),document.body.style.cursor="",document.body.style.userSelect=""};document.body.style.cursor="col-resize",document.body.style.userSelect="none",window.addEventListener("pointermove",r),window.addEventListener("pointerup",R)},k=()=>(0,c.jsx)("colgroup",{children:e.map((m,p)=>(0,c.jsx)("col",{style:{width:O(p)}},`col-${p}`))});return(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)("div",{className:"db-gridx-head",ref:N,children:(0,c.jsxs)("table",{className:"db-gridx-t",style:{width:C},children:[k(),(0,c.jsx)("thead",{children:(0,c.jsx)("tr",{children:e.map((m,p)=>{let h=t&&t.sort?.col===p?t.sort.dir:0,E=t?!!t.filters[p]:!1;return(0,c.jsxs)("th",{title:m,style:{width:O(p),minWidth:O(p)},children:[(0,c.jsxs)("span",{className:"db-gridx-th-main",children:[t?(0,c.jsxs)("button",{className:"db-sort-label",title:"\u70B9\u51FB\u6392\u5E8F\uFF1A\u5347\u5E8F \u2192 \u964D\u5E8F \u2192 \u53D6\u6D88",onClick:()=>t.onSort(p),children:[m,(0,c.jsx)("span",{className:h===0?"db-sort-idle":"db-sort-on",children:h===1?" \u25B2":h===-1?" \u25BC":" \u2195"})]}):(0,c.jsx)("span",{className:"db-gridx-th",children:m}),t?(0,c.jsx)("span",{className:E?"db-filter-toggle db-filter-on":"db-filter-toggle",title:E?`\u8FC7\u6EE4\uFF1A${t.filters[p]}\uFF08\u70B9\u51FB\u7F16\u8F91\uFF09`:"\u5217\u8FC7\u6EE4",onClick:()=>t.onFilterOpen(t.filterOpen===p?null:p),children:E?"\u2715":"\u26B2"}):null]}),t&&t.filterOpen===p?(0,c.jsx)("input",{className:"db-gridx-filter",autoFocus:!0,value:t.filters[p]??"",placeholder:`\u8FC7\u6EE4 ${m}\u2026`,spellCheck:!1,onChange:r=>t.onFilter(p,r.target.value),onKeyDown:r=>{(r.key==="Escape"||r.key==="Enter")&&t.onFilterOpen(null)}}):null,(0,c.jsx)("span",{className:"db-colresize",onPointerDown:r=>x(p,r),title:"\u62D6\u52A8\u8C03\u6574\u5217\u5BBD"})]},m)})})})]})}),(0,c.jsx)("div",{className:"db-gridx-body",onScroll:m=>{N.current&&(N.current.scrollLeft=m.currentTarget.scrollLeft)},children:(0,c.jsxs)("table",{className:"db-gridx-t",style:{width:C},children:[k(),(0,c.jsx)("tbody",{children:a.map((m,p)=>(0,c.jsx)("tr",{children:m.map((h,E)=>{let r=U(h),R=o?.row===p&&o?.col===E;return(0,c.jsx)("td",{className:R?"db-cell-active":"db-cell",title:r,style:{width:O(E)},onClick:()=>l(p,E),children:h==null?(0,c.jsx)("span",{className:"db-null",children:"NULL"}):typeof h=="object"?(0,c.jsx)("span",{className:"db-mono",children:r}):r},`${p}-${E}`)})},p))})]})})]})}function Me({connection:e,table:a,schema:o,database:l,tableName:t,queryColumns:v,metaColumns:b,row:N,colIndex:g,onClose:O,onSaved:C,onMessage:x}){let k=v[g]??"",m=N[g],p=b.find(S=>S.name===k),[h,E]=(0,V.useState)(()=>m==null?"":U(m)),[r,R]=(0,V.useState)(m==null),[d,D]=(0,V.useState)(""),[y,u]=(0,V.useState)(!1),w=new Map;v.forEach((S,q)=>w.set(S,q));let i=b.filter(S=>S.primary).map(S=>({column:S.name,value:N[w.get(S.name)??-1]??null})).filter(S=>w.has(S.column)),M=i.length>0?i.map(S=>`${S.column}=${U(S.value)}`).join(" & "):"",L=i.length>0,I=e.type==="mongodb",f=async()=>{if(!(!L||!a)){D("\u4FDD\u5B58\u4E2D\u2026");try{let S=await A.cellUpdate({id:e.id,table:a.name,schema:o,...l?{database:l}:{},column:k,pk:i,value:r?null:h,isNull:r});S.ok&&(x(`\u2713 \u5DF2\u66F4\u65B0 ${S.affectedRows} \u884C\uFF08${t}.${k}\uFF09`,"ok"),C())}catch(S){x(await H(S),"error")}finally{D("")}}};return(0,c.jsxs)("div",{className:"db-celldetail",children:[(0,c.jsxs)("div",{className:"db-celldetail-title",children:[(0,c.jsx)("span",{children:"\u270F\uFE0F \u5355\u5143\u683C\u7F16\u8F91"}),(0,c.jsx)("button",{className:"db-btn-ghost",onClick:O,disabled:d!=="",children:"\u2715"})]}),(0,c.jsxs)("div",{className:"db-celldetail-meta",children:[(0,c.jsxs)("div",{children:[(0,c.jsx)("span",{className:"db-muted",children:"\u8868"})," ",t]}),(0,c.jsxs)("div",{children:[(0,c.jsx)("span",{className:"db-muted",children:"\u5217"})," ",k," ",(0,c.jsx)("span",{className:"db-badge db-badge-type",children:p?.type??""})]}),(0,c.jsxs)("div",{children:[(0,c.jsx)("span",{className:"db-muted",children:"\u5B9A\u4F4D"})," ",M||"\uFF08\u65E0\u4E3B\u952E\uFF09"]})]}),(0,c.jsx)("button",{className:"db-row db-row-toggle",onClick:()=>u(S=>!S),title:y?"\u70B9\u51FB\u6536\u8D77\u6574\u884C\u6570\u636E":"\u70B9\u51FB\u5C55\u5F00\u6574\u884C\u6570\u636E",children:(0,c.jsxs)("span",{children:[y?"\u25BE":"\u25B8"," \u6574\u884C\u6570\u636E\uFF08",v.length," \u5217\uFF09"]})}),y&&(0,c.jsx)("div",{className:"db-celldetail-row",children:v.map((S,q)=>(0,c.jsxs)("div",{title:`${S} = ${U(N[q])}`,children:[(0,c.jsx)("span",{className:"db-chip",children:S})," = ",U(N[q])]},S))}),I||!L?(0,c.jsx)("div",{className:"db-empty",style:{padding:"8px"},children:I?"MongoDB \u96C6\u5408\u6682\u4E0D\u652F\u6301\u5355\u5143\u683C\u7F16\u8F91\uFF08\u6CA1\u6709\u4E3B\u952E\u5217\u6982\u5FF5\uFF09":"\u8BE5\u8868\u6CA1\u6709\u4E3B\u952E\uFF0C\u65E0\u6CD5\u5B89\u5168\u5B9A\u4F4D\u884C\uFF0C\u7F16\u8F91\u5DF2\u7981\u7528"}):null,(0,c.jsx)("label",{className:"db-muted",style:{display:"block",margin:"8px 0 4px"},children:"\u65B0\u503C\uFF08\u5B58\u4E3A NULL \u53EF\u7559\u7A7A\uFF09\uFF1A"}),(0,c.jsxs)("label",{className:"db-row",style:{gap:6,cursor:"pointer",fontSize:12},children:[(0,c.jsx)("input",{type:"checkbox",checked:r,onChange:S=>R(S.target.checked)})," \u5B58\u4E3A NULL"]}),(0,c.jsx)("textarea",{className:"db-code",style:{minHeight:90,width:"100%",boxSizing:"border-box",marginTop:6},value:h,disabled:r,spellCheck:!1,onChange:S=>E(S.target.value),placeholder:"\u8F93\u5165\u65B0\u503C\u2026"}),(0,c.jsxs)("div",{className:"db-row",style:{gap:8,marginTop:8},children:[(0,c.jsx)("button",{className:"db-btn-primary",onClick:f,disabled:!L||d!==""||I,children:d||(L?"\u4FDD\u5B58\uFF08UPDATE \u8BE5\u884C\uFF09":"\u4FDD\u5B58")}),(0,c.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u70B9\u51FB\u5355\u5143\u683C\u65C1\u7684\u4EFB\u610F\u5904\u53EF\u518D\u9009\u5176\u5B83\u5355\u5143\u683C"})]})]})}function lt(e,a){if(e==null)return a==null?0:1;if(a==null)return-1;if(typeof e=="number"&&typeof a=="number")return e<a?-1:e>a?1:0;let o=U(e),l=U(a),t=Number(o),v=Number(l);return o!==""&&l!==""&&Number.isFinite(t)&&Number.isFinite(v)?t<v?-1:t>v?1:0:o.localeCompare(l,void 0,{numeric:!0,sensitivity:"base"})}function fe({result:e,limit:a,onLimitChange:o}){let[l,t]=(0,V.useState)(0),v=Math.max(1,a),[b,N]=(0,V.useState)(null),[g,O]=(0,V.useState)({}),[C,x]=(0,V.useState)(null),k=e?.columns??[],m=e?.rows??[];(0,V.useEffect)(()=>{t(0),N(null),O({}),x(null)},[e]);let p=(0,V.useMemo)(()=>{let y=Object.entries(g).filter(u=>u[1].trim()!=="");return y.length===0?m:m.filter(u=>y.every(([w,i])=>{let M=Number(w);return U(u[M]).toLowerCase().includes(i.trim().toLowerCase())}))},[m,g]),h=(0,V.useMemo)(()=>{if(!b)return p;let y=b.col,u=b.dir;return[...p].sort((w,i)=>lt(w[y],i[y])*u)},[p,b]),E=m.length,r=h.length,R=Math.max(1,Math.ceil(r/v));(0,V.useEffect)(()=>{t(y=>Math.min(y,R-1))},[R]);let d=h.slice(l*v,(l+1)*v);return!e||e.columns.length===0?(0,c.jsxs)("div",{children:[(0,c.jsx)("div",{className:"db-empty",children:e?.kind==="change"?e.message??`\u5DF2\u6267\u884C\uFF08\u5F71\u54CD ${e.affectedRows??0} \u884C\uFF09`:e?.message??"\u6267\u884C\u540E\u7ED3\u679C\u663E\u793A\u5728\u8FD9\u91CC\uFF08\u7ED3\u679C\u6700\u591A\u663E\u793A 10000 \u884C\uFF09"}),e?(0,c.jsx)(De,{result:e}):null]}):(0,c.jsxs)("div",{children:[(0,c.jsx)(De,{result:e}),(0,c.jsx)(ge,{columns:k,rows:d,active:null,onCellClick:()=>{},interaction:{sort:b,onSort:y=>{let u=b?.col===y?b.dir:0;N(u===1?{col:y,dir:-1}:u===-1?null:{col:y,dir:1})},filters:g,onFilter:(y,u)=>{O(w=>({...w,[y]:u}))},filterOpen:C,onFilterOpen:y=>x(y)}}),d.length===0?(0,c.jsx)("div",{className:"db-empty",children:"\uFF08\u6CA1\u6709\u5339\u914D\u7684\u884C\uFF09"}):null,(0,c.jsxs)("div",{className:"db-row",style:{marginTop:6,gap:8},children:[(0,c.jsx)("button",{disabled:l<=0,onClick:()=>t(y=>Math.max(0,y-1)),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,c.jsx)("button",{disabled:l>=R-1,onClick:()=>t(y=>Math.min(R-1,y+1)),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,c.jsxs)("span",{className:"db-muted",children:["\u7B2C ",l+1,"/",R," \u9875 \xB7 \u5171 ",r," \u884C",r!==E?`\uFF08\u5DF2\u53D6\u56DE ${E} \u884C\uFF09`:""]}),(0,c.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875/\u6700\u591A\u53D6"}),(0,c.jsx)("select",{value:v,title:"\u6BCF\u9875\u884C\u6570 = \u672C\u6B21\u6267\u884C\u6700\u591A\u53D6\u56DE\u7684\u884C\u6570\uFF1B\u8C03\u5927\u540E\u8BF7\u91CD\u65B0\u6267\u884C\u4EE5\u53D6\u66F4\u591A\u6570\u636E",onChange:y=>{o(Number(y.target.value)),t(0)},children:[200,500,1e3,5e3].map(y=>(0,c.jsx)("option",{value:y,children:y},y))})]})]})}var s=F("react/jsx-runtime"),it={postgresql:"PG",mysql:"MySQL",mongodb:"Mongo",sqlite:"SQLite",dameng:"DM"},ct={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"},$e={view:"\u89C6\u56FE",collection:"\u96C6\u5408",table:"\u8868"};function bt({draft:e,onClose:a,onSaved:o,onChanged:l}){let[t,v]=(0,z.useState)({...e}),[b,N]=(0,z.useState)(!1),[g,O]=(0,z.useState)(!1),[C,x]=(0,z.useState)(""),[k,m]=(0,z.useState)(""),p=(()=>{let d=Y[t.type],D=t.type!=="sqlite",y=t.type==="mysql"||t.type==="mongodb",u=t.type==="postgresql"||y,w=t.type==="dameng";return{label:d,needsHost:D,needsDatabase:y,supportsDatabase:u,needsSchema:w,needFile:t.type==="sqlite"}})(),h=d=>{v(D=>({...D,...d})),m(""),x("")},E=()=>{let d={id:t.id,name:t.name.trim(),type:t.type,host:t.host?.trim()||void 0,user:t.user?.trim()||void 0,database:t.database?.trim()||void 0,schema:t.schema?.trim()||void 0,file:t.file?.trim()||void 0,authSource:t.authSource?.trim()||void 0,ssl:t.ssl===!0,options:t.options&&Object.keys(t.options).length>0?t.options:void 0};return t.type==="sqlite"&&(delete d.host,delete d.port,delete d.database),t.port!==void 0&&Number.isFinite(Number(t.port))&&(d.port=Number(t.port)),t.dmCompat&&(d.dmCompat=t.dmCompat),d.dmNoEncrypt=t.dmNoEncrypt===!0,t.password!==void 0&&t.password!==""&&(d.password=t.password),d},r=async()=>{N(!0),x(""),m("");try{let d=await A.test(E());m(d.ok?`\u2705 \u8FDE\u63A5\u6210\u529F\uFF08${d.latencyMs}ms\uFF09`:`\u274C ${d.message}`),d.ok||x(d.detail??d.message)}catch(d){x(await H(d))}finally{N(!1)}},R=async()=>{if(!t.name.trim()){x("\u8BF7\u586B\u5199\u8FDE\u63A5\u540D\u79F0");return}if(p.needsHost&&!t.host?.trim()){x("\u8BF7\u586B\u5199\u4E3B\u673A\u5730\u5740");return}if(p.needsDatabase&&!t.database?.trim()){x(`\u8BF7\u586B\u5199 ${Y[t.type]} \u7684\u6570\u636E\u5E93\u540D`);return}if(p.needFile&&!t.file?.trim()){x("\u8BF7\u586B\u5199 SQLite \u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84");return}O(!0),x("");try{let{connection:d}=await A.save(E());m("\u5DF2\u4FDD\u5B58"),l(),o(d)}catch(d){x(await H(d))}finally{O(!1)}};return(0,s.jsxs)("div",{className:"db-card db-nav-editor",style:{margin:"6px 0"},children:[(0,s.jsxs)("div",{className:"db-card-title",style:{textTransform:"none",letterSpacing:0},children:[(0,s.jsxs)("span",{children:["\u270F\uFE0F ",e.isNew?"\u65B0\u5EFA\u8FDE\u63A5":`\u7F16\u8F91\uFF1A${t.name}`]}),(0,s.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u6536\u8D77"})]}),(0,s.jsxs)("div",{className:"db-grid",children:[(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u540D\u79F0 *"}),(0,s.jsx)("input",{value:t.name??"",onChange:d=>h({name:d.target.value}),placeholder:"\u4F8B\u5982\uFF1A\u751F\u4EA7\u5E93-PG"})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u7C7B\u578B"}),(0,s.jsx)("select",{value:t.type,onChange:d=>h({type:d.target.value}),children:["postgresql","mysql","mongodb","sqlite","dameng"].map(d=>(0,s.jsx)("option",{value:d,children:Y[d]},d))})]}),p.needsHost&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u4E3B\u673A"}),(0,s.jsx)("input",{value:t.host??"",onChange:d=>h({host:d.target.value}),placeholder:p.label==="MongoDB"?"127.0.0.1 \u6216 mongodb://\u2026":"127.0.0.1"})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u7AEF\u53E3"}),(0,s.jsx)("input",{type:"number",value:t.port??Oe(t.type)??"",onChange:d=>h({port:d.target.value===""?void 0:Number(d.target.value)})})]})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u7528\u6237\u540D"}),(0,s.jsx)("input",{value:t.user??"",onChange:d=>h({user:d.target.value}),autoComplete:"off"})]}),(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsxs)("label",{children:["\u5BC6\u7801 ",e.isNew||!e.hasPassword?"":(0,s.jsx)("span",{className:"db-muted",children:"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u7559\u7A7A\u5373\u7528\u5DF2\u5B58\u5BC6\u7801\uFF09"})]}),(0,s.jsx)("input",{type:"password",value:t.password??"",onChange:d=>h({password:d.target.value}),autoComplete:"new-password",placeholder:e.isNew?"\u65B0\u5EFA\u8FDE\u63A5\u65F6\u586B\u5199":"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u8F93\u5165\u53EF\u8986\u76D6\uFF09"})]}),p.needFile&&(0,s.jsxs)("div",{className:"db-field",style:{gridColumn:"1 / -1"},children:[(0,s.jsx)("label",{children:"\u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84 *"}),(0,s.jsx)("input",{value:t.file??"",onChange:d=>h({file:d.target.value}),placeholder:"C:\\\\data\\\\app.db \u6216 \u76F8\u5BF9\u8DEF\u5F84"})]}),p.supportsDatabase&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsxs)("label",{children:["\u9ED8\u8BA4\u6570\u636E\u5E93",p.needsDatabase?" *":"",t.type==="mongodb"?"\uFF08database\uFF09":""]}),(0,s.jsx)("input",{value:t.database??"",onChange:d=>h({database:d.target.value}),placeholder:t.type==="postgresql"?"\u53EF\u9009\uFF0C\u7559\u7A7A\u4F7F\u7528 PG \u9ED8\u8BA4\u5E93":void 0})]}),p.needsSchema&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"schema\uFF08\u9ED8\u8BA4\u6A21\u5F0F\uFF0C\u53EF\u9009\uFF09"}),(0,s.jsx)("input",{value:t.schema??"",onChange:d=>h({schema:d.target.value}),placeholder:"\u7559\u7A7A\u4F7F\u7528\u767B\u5F55\u7528\u6237"})]}),t.type==="dameng"&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"\u517C\u5BB9\u6A21\u5F0F"}),(0,s.jsxs)("select",{value:t.dmCompat??"oracle",onChange:d=>h({dmCompat:d.target.value}),children:[(0,s.jsx)("option",{value:"oracle",children:"Oracle \u6A21\u5F0F\uFF08\u9ED8\u8BA4\uFF09"}),(0,s.jsx)("option",{value:"mysql",children:"MySQL \u517C\u5BB9\u6A21\u5F0F"})]})]}),t.type==="dameng"&&(0,s.jsxs)("label",{className:"db-field",style:{flexDirection:"row",gap:8,alignItems:"center",cursor:"pointer"},children:[(0,s.jsx)("input",{type:"checkbox",checked:t.dmNoEncrypt===!0,onChange:d=>h({dmNoEncrypt:d.target.checked})}),(0,s.jsx)("span",{children:"\u517C\u5BB9 OpenSSL3\uFF1A\u5173\u95ED\u767B\u5F55/\u6D88\u606F\u52A0\u5BC6"})]}),t.type==="mongodb"&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"authSource\uFF08\u53EF\u9009\uFF09"}),(0,s.jsx)("input",{value:t.authSource??"",onChange:d=>h({authSource:d.target.value}),placeholder:"admin"})]}),(p.needsHost||p.needFile)&&(0,s.jsxs)("div",{className:"db-field",children:[(0,s.jsx)("label",{children:"SSL/TLS"}),(0,s.jsxs)("select",{value:t.ssl===!0?"yes":"no",onChange:d=>h({ssl:d.target.value==="yes"}),children:[(0,s.jsx)("option",{value:"no",children:"\u5173\u95ED"}),(0,s.jsx)("option",{value:"yes",children:"\u542F\u7528"})]})]})]}),(0,s.jsx)(K,{kind:"error",text:C}),k?(0,s.jsx)(K,{kind:k.startsWith("\u2705")?"ok":"info",text:k}):null,(0,s.jsxs)("div",{className:"db-row",style:{marginTop:8},children:[(0,s.jsx)("button",{className:"db-btn-primary",onClick:R,disabled:g,children:g?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58\u8FDE\u63A5"}),(0,s.jsx)("button",{onClick:r,disabled:b,children:b?"\u6D4B\u8BD5\u4E2D\u2026":"\u6D4B\u8BD5\u8FDE\u63A5"}),(0,s.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u53D6\u6D88"})]})]})}function pt({connection:e,callbacks:a}){let o=ae(e.type),l=e.type==="postgresql"||e.type==="mysql",[t,v]=(0,z.useState)(""),[b,N]=(0,z.useState)(),[g,O]=(0,z.useState)([]),[C,x]=(0,z.useState)([]),[k,m]=(0,z.useState)([]),[p,h]=(0,z.useState)(""),[E,r]=(0,z.useState)(""),R=(0,z.useRef)(0),d=i=>R.current===i,D=async(i,M,L)=>{if(d(i)){h("\u52A0\u8F7D\u8868\u2026");try{let{tables:I}=await A.tables(e.id,L,M||void 0);if(!d(i))return;m(I)}catch(I){d(i)&&r(await H(I))}finally{d(i)&&h("")}}};(0,z.useEffect)(()=>{let i=++R.current;return h("\u52A0\u8F7D\u5BF9\u8C61\u2026"),r(""),(async()=>{try{if(l){let L=await A.databases(e.id);if(!d(i))return;L.supported&&O(L.databases)}let M;if(o){let L=await A.schemas(e.id,void 0);if(!d(i))return;x(L.schemas),M=L.schemas.find(I=>I.name==="public")?.name??L.schemas.find(I=>I.name===e.schema)?.name??L.schemas[0]?.name,N(M)}await D(i,"",M)}catch(M){d(i)&&r(await H(M))}finally{d(i)&&h("")}})(),()=>{R.current+=1}},[e.id]);let y=async i=>{let M=++R.current;v(i),m([]),x([]),N(void 0),r("");try{if(o){h("\u52A0\u8F7D\u6A21\u5F0F\u2026");let L=await A.schemas(e.id,i||void 0);if(!d(M))return;x(L.schemas);let I=L.schemas.find(f=>f.name==="public")?.name??L.schemas.find(f=>f.name===e.schema)?.name??L.schemas[0]?.name;N(I),await D(M,i,I)}else await D(M,i)}catch(L){d(M)&&r(await H(L))}finally{d(M)&&h("")}},u=async i=>{let M=++R.current;N(i||void 0),m([]),r(""),await D(M,t,i||void 0)},w=i=>{a.onOpenBrowse(e,{table:i,...t?{database:t}:{},...b&&o?{schema:b}:{}})};return(0,s.jsxs)("div",{className:"db-tree",children:[l&&(0,s.jsxs)("div",{className:"db-tree-row",children:[(0,s.jsx)("span",{className:"db-muted",children:"\u6570\u636E\u5E93"}),(0,s.jsxs)("select",{value:t,onChange:i=>void y(i.target.value),title:"\u5207\u6362\u540E\u91CD\u65B0\u52A0\u8F7D\u8BE5\u5E93\u4E0B\u7684\u5BF9\u8C61",children:[(0,s.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u8FDE\u63A5\u9ED8\u8BA4\u5E93","\uFF09"]}),g.map(i=>(0,s.jsx)("option",{value:i,children:i},i))]})]}),o&&C.length>0&&(0,s.jsxs)("div",{className:"db-tree-row",children:[(0,s.jsx)("span",{className:"db-muted",children:"schema"}),(0,s.jsx)("select",{value:b??"",onChange:i=>void u(i.target.value),title:"\u5207\u6362\u6A21\u5F0F\u5E76\u52A0\u8F7D\u5176\u5BF9\u8C61",children:C.map(i=>(0,s.jsx)("option",{value:i.name,children:i.name},i.name))})]}),E?(0,s.jsx)(K,{kind:"error",text:E}):null,p?(0,s.jsx)("div",{className:"db-muted db-tree-hint",children:p}):null,!p&&k.length===0&&!E?(0,s.jsx)("div",{className:"db-muted db-tree-hint",children:"\uFF08\u8BE5\u5E93/\u6A21\u5F0F\u4E0B\u6CA1\u6709\u8868\u6216\u89C6\u56FE\uFF09"}):null,(0,s.jsx)("div",{className:"db-tree-tables",children:k.map(i=>(0,s.jsxs)("button",{className:"db-tree-table",title:`${$e[i.kind]??i.kind}\u300C${i.name}\u300D\u2014\u2014\u70B9\u51FB\u5728\u53F3\u4FA7\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF08\u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\uFF09`,onClick:()=>w(i),children:[(0,s.jsx)("span",{children:ct[i.kind]??"\u{1F5C2}"}),(0,s.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:i.name}),(0,s.jsx)("span",{className:"db-badge",children:$e[i.kind]??i.kind})]},`${i.name}-${i.kind}`))}),(0,s.jsx)("div",{className:"db-tree-actions",style:{gap:6},children:(0,s.jsx)("span",{className:"db-muted db-grow",style:{fontSize:11},children:"\u70B9\u51FB\u8868/\u89C6\u56FE/\u96C6\u5408\u5728\u53F3\u4FA7\u6253\u5F00\u5176\u5DE5\u4F5C\u533A"})}),(0,s.jsxs)("div",{className:"db-tree-actions",style:{borderTop:"1px solid var(--db-border)",paddingTop:6,marginTop:4},children:[(0,s.jsx)("button",{onClick:()=>a.onEdit(e),children:"\u270F\uFE0F \u7F16\u8F91"}),(0,s.jsx)("button",{className:"db-btn-danger",onClick:()=>void a.onDelete(e),children:"\u5220\u9664"}),(0,s.jsx)("span",{className:"db-grow"}),(0,s.jsx)("button",{className:"db-btn-ghost",title:"\u6536\u8D77\u8BE5\u8FDE\u63A5\u7684\u5BF9\u8C61\u6811",onClick:()=>a.onCollapse(),children:"\u6536\u8D77 \u25B4"})]})]})}function ze(e){let{connections:a,busyList:o,refresh:l,focusId:t}=e,[v,b]=(0,z.useState)(null),[N,g]=(0,z.useState)(null),[O,C]=(0,z.useState)(""),x=(0,z.useRef)(!1),[k,m]=(0,z.useState)(null);(0,z.useEffect)(()=>{x.current||!t||a.some(r=>r.id===t)&&(x.current=!0,b(t),e.onFocused?.(t))},[a,t]),(0,z.useEffect)(()=>{k&&a.some(r=>r.id===k)&&(b(k),e.onFocused?.(k),m(null))},[a,k]);let p=r=>{C(""),v===r.id?b(null):(b(r.id),e.onFocused?.(r.id))},h=r=>{C(""),g(r?{id:r.id,name:r.name,type:r.type,host:r.host,port:r.port,user:r.user,database:r.database,schema:r.schema,ssl:r.ssl,file:r.file,authSource:r.authSource,dmCompat:r.dmCompat,dmNoEncrypt:r.dmNoEncrypt,options:r.options,hasPassword:r.hasPassword,open:!0,isNew:!1}:{name:"",type:"postgresql",open:!0,isNew:!0})},E=async r=>{if(window.confirm(`\u786E\u5B9A\u5220\u9664\u8FDE\u63A5\u300C${r.name}\u300D\u5417\uFF1F`)){C("");try{(await A.remove(r.id)).ok||C(`\u5220\u9664\u5931\u8D25\uFF1A\u672A\u627E\u5230\u8FDE\u63A5 ${r.id}\uFF08\u53EF\u80FD\u5DF2\u88AB\u5176\u5B83\u9875\u9762\u5220\u9664\uFF09`),v===r.id&&b(null),await l()}catch(R){C(await H(R))}}};return(0,s.jsxs)("div",{className:"db-nav",children:[(0,s.jsxs)("div",{className:"db-nav-head",children:[(0,s.jsxs)("span",{className:"db-nav-title",children:["\u{1F50C} \u8FDE\u63A5\u7BA1\u7406",a.length>0?`\uFF08${a.length}\uFF09`:""]}),(0,s.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,s.jsx)("button",{title:"\u5237\u65B0\u8FDE\u63A5\u5217\u8868",onClick:()=>void l(),disabled:o,children:o?"\u2026":"\u21BB"}),(0,s.jsx)("button",{className:"db-btn-primary",title:"\u65B0\u5EFA\u8FDE\u63A5",onClick:()=>h(null),children:"\uFF0B \u65B0\u5EFA"})]})]}),(0,s.jsx)(K,{kind:"error",text:O}),N&&N.open&&(0,s.jsx)(bt,{draft:N,onClose:()=>g(null),onSaved:r=>{m(r.id),l(),g(null)},onChanged:()=>void l()}),a.length===0?(0,s.jsx)("div",{className:"db-empty",children:"\u8FD8\u6CA1\u6709\u8FDE\u63A5\u3002\u70B9\u51FB\u300C\uFF0B \u65B0\u5EFA\u300D\u6DFB\u52A0 PostgreSQL / MySQL / MongoDB / SQLite / \u8FBE\u68A6 \u8FDE\u63A5\u3002"}):(0,s.jsx)("div",{className:"db-nav-list",children:a.map(r=>(0,s.jsxs)(z.Fragment,{children:[(0,s.jsxs)("div",{className:`db-conn-row${v===r.id?" db-conn-active":""}`,onClick:()=>p(r),title:`${r.name} \xB7 ${Y[r.type]}${r.lastError?` \xB7 \u4E0A\u6B21\u6D4B\u8BD5\u5931\u8D25\uFF1A${r.lastError}`:""} \u2014\u2014 \u70B9\u51FB\u5C55\u5F00\u5BF9\u8C61\u6811`,children:[(0,s.jsx)("span",{className:"db-conn-caret",children:v===r.id?"\u25BE":"\u25B8"}),(0,s.jsx)("span",{className:"db-grow db-conn-name",children:r.name}),(0,s.jsx)("span",{className:"db-badge db-badge-type",children:it[r.type]??r.type}),r.lastError?(0,s.jsx)("span",{className:"db-dot db-dot-bad",title:`\u4E0A\u6B21\u6D4B\u8BD5\u5931\u8D25\uFF1A${r.lastError}`}):r.lastTestedAt?(0,s.jsx)("span",{className:"db-dot db-dot-ok",title:`\u4E0A\u6B21\u6D4B\u8BD5\u901A\u8FC7\uFF1A${r.lastTestedAt}`}):null]}),v===r.id&&(0,s.jsxs)("div",{className:"db-tree-host",children:[(0,s.jsx)("div",{className:"db-muted db-tree-hint",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:r.type==="sqlite"?(0,s.jsx)("span",{className:"db-chip",children:r.file}):(0,s.jsxs)("span",{children:[r.host??"",r.port?`:${r.port}`:"",r.user?` \xB7 ${r.user}`:"",r.database?` \xB7 \u5E93:${r.database}`:""]})}),(0,s.jsx)(pt,{connection:r,callbacks:{onOpenBrowse:e.onOpenBrowse,onEdit:h,onDelete:R=>void E(R),onCollapse:()=>b(null)}})]})]},r.id))})]})}var T=F("react");var n=F("react/jsx-runtime");function ut(e,a,o){let l={};e&&o[e.col]&&(l.sort={column:o[e.col]??"",dir:e.dir===1?"asc":"desc"});let t={};for(let[v,b]of Object.entries(a)){let N=o[Number(v)],g=String(b??"").trim();!N||!g||(t[N]=g)}return Object.keys(t).length>0&&(l.filters=t),Object.keys(l).length>0?l:null}function mt({connection:e,target:a}){let{table:o,database:l,schema:t}=a,v=ae(e.type),[b,N]=(0,T.useState)([]),[g,O]=(0,T.useState)(null),[C,x]=(0,T.useState)(0),[k,m]=(0,T.useState)(200),[p,h]=(0,T.useState)(""),[E,r]=(0,T.useState)(""),[R,d]=(0,T.useState)(!1),[D,y]=(0,T.useState)(null),[u,w]=(0,T.useState)(null),[i,M]=(0,T.useState)(null),[L,I]=(0,T.useState)({}),[f,S]=(0,T.useState)(null),q=(0,T.useRef)(void 0);(0,T.useEffect)(()=>{let P=!1;return h(`\u8BFB\u53D6\u300C${o.name}\u300D\u2026`),r(""),y(null),w(null),M(null),I({}),S(null),q.current!==void 0&&(window.clearTimeout(q.current),q.current=void 0),Promise.all([A.columns(e.id,o.name,t,l),A.rows(e.id,o.name,t,k,0,l)]).then(([B,W])=>{P||(N(B.columns),O(W))}).catch(async B=>{P||r(await H(B))}).finally(()=>{P||h("")}),()=>{P=!0}},[e.id,o.name,t,l]);let X=async(P,B,W)=>{q.current!==void 0&&(window.clearTimeout(q.current),q.current=void 0),h("\u67E5\u8BE2\u4E2D\u2026"),r(""),y(null),w(null);try{let be=g?.columns??[],Ke=B===null?null:B?.sort!==void 0?B.sort:i,We=B===null?{}:B?.filters!==void 0?B.filters:L,Je=ut(Ke,We,be),Ue=await A.rows(e.id,o.name,t,W??k,Math.max(0,P),l,Je);O(Ue),x(Math.max(0,P))}catch(be){r(await H(be))}finally{h("")}},je=P=>{let B=i?.col===P?i.dir:0,W=B===1?{col:P,dir:-1}:B===-1?null:{col:P,dir:1};M(W),S(null),X(0,{sort:W,filters:L})},He=(P,B)=>{let W={...L,[P]:B};I(W),q.current!==void 0&&window.clearTimeout(q.current),q.current=window.setTimeout(()=>{X(0,{sort:i,filters:W})},350)},_e=()=>{M(null),I({}),S(null),X(0,null)},we=g?.columns??[],ce=g?.rows??[],Ge=i!==null||Object.values(L).some(P=>P.trim()!==""),ke=D&&g&&D.row<g.rows.length?g.rows[D.row]??null:null;return(0,n.jsxs)("div",{className:"db-pane-stack",children:[(0,n.jsxs)("div",{className:"db-card",style:{padding:0},children:[(0,n.jsxs)("button",{className:"db-card-title db-structure-toggle",onClick:()=>d(P=>!P),title:R?"\u70B9\u51FB\u6298\u53E0":"\u70B9\u51FB\u5C55\u5F00",style:{width:"100%",cursor:"pointer",border:0,background:"none",textAlign:"left"},children:[(0,n.jsxs)("span",{children:[R?"\u25BE":"\u25B8"," \u{1F9EC} \u5B57\u6BB5\u7ED3\u6784\uFF08",b.length," \u4E2A\u5B57\u6BB5\uFF09"]}),p?(0,n.jsx)("span",{className:"db-muted",children:p}):b.length===0?(0,n.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6\u5931\u8D25\u6216\u65E0\u5B57\u6BB5\uFF09"}):null]}),R&&(0,n.jsx)("div",{style:{padding:"6px 10px 10px",borderTop:"1px solid var(--db-border, rgba(128,128,128,.25))"},children:b.length===0?(0,n.jsx)("div",{className:"db-empty",children:E?"\uFF08\u8BFB\u53D6\u5931\u8D25\uFF09":"\uFF08\u65E0\u5B57\u6BB5\uFF09"}):(0,n.jsx)("div",{className:"db-list",children:b.map(P=>(0,n.jsxs)("div",{className:"db-list-item",style:{cursor:"default"},children:[(0,n.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--db-mono)"},children:P.name}),(0,n.jsx)("span",{className:"db-badge db-badge-type",style:{maxWidth:"45%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:P.type}),P.primary?(0,n.jsx)("span",{className:"db-badge",children:"PK"}):null,P.nullable===!1?(0,n.jsx)("span",{className:"db-badge",children:"NOT NULL"}):null]},P.name))})})]}),(0,n.jsxs)("div",{className:"db-card",style:{padding:0},children:[(0,n.jsxs)("div",{className:"db-card-title",style:{padding:"10px 12px 0"},children:[(0,n.jsx)("span",{children:"\u{1F50D} \u6570\u636E\u9884\u89C8"}),g?(0,n.jsx)("span",{className:"db-muted",children:g.total!==void 0?`\u5171 ${g.total} \u884C \xB7 \u672C\u9875 ${g.rowCount}`:`${g.rowCount} \u884C \xB7 \u504F\u79FB ${C}`}):null]}),(0,n.jsxs)("div",{style:{padding:"0 12px"},children:[(0,n.jsx)(K,{kind:"error",text:E}),u&&(0,n.jsx)(K,{kind:u.kind==="ok"?"ok":"error",text:u.text}),p&&(0,n.jsx)("div",{className:"db-muted",style:{padding:"6px 0"},children:p}),Ge?(0,n.jsxs)("div",{className:"db-row",style:{margin:"2px 0 6px",gap:8},children:[(0,n.jsxs)("span",{className:"db-ok",children:["\u5DF2\u542F\u7528\u6574\u8868",Object.values(L).some(P=>P.trim()!=="")?"\u8FC7\u6EE4":"",i?"\u6392\u5E8F":""]}),(0,n.jsx)("button",{onClick:_e,children:"\u6E05\u9664\u6392\u5E8F / \u8FC7\u6EE4"}),(0,n.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u6392\u5E8F/\u8FC7\u6EE4\u7531\u6570\u636E\u5E93\u6267\u884C\uFF0C\u7FFB\u9875\u7EE7\u7EED\u751F\u6548"})]}):null,(0,n.jsxs)("div",{style:{display:"flex",alignItems:"stretch"},children:[(0,n.jsxs)("div",{className:"db-gridx",children:[g?ce.length===0?(0,n.jsx)("div",{className:"db-empty",style:{padding:14},children:g.message??"\uFF08\u65E0\u6570\u636E\uFF09"}):(0,n.jsx)(ge,{columns:we,rows:ce,active:D,onCellClick:(P,B)=>{y({row:P,col:B}),w(null)},interaction:e.type==="mongodb"?void 0:{sort:i,onSort:je,filters:L,onFilter:He,filterOpen:f,onFilterOpen:P=>S(P)}}):(0,n.jsx)("div",{className:"db-empty",style:{padding:14},children:p||"\u52A0\u8F7D\u4E2D\u2026"}),(0,n.jsxs)("div",{className:"db-muted",style:{padding:"4px 2px",fontSize:12},children:["\u70B9\u51FB\u4EFB\u610F\u5355\u5143\u683C\u53EF\u5728\u53F3\u4FA7\u67E5\u770B / \u7F16\u8F91\uFF1B\u62D6\u52A8\u8868\u5934\u5206\u9694\u7EBF\u53EF\u8C03\u5217\u5BBD\uFF1B",e.type!=="mongodb"?"\u70B9\u51FB\u5217\u540D\u6392\u5E8F\u3001\u26B2 \u8FC7\u6EE4\uFF08\u4F5C\u7528\u4E8E\u6574\u8868\uFF09":""]})]}),D&&ke&&g&&(0,n.jsx)(Me,{connection:e,table:o,schema:t,database:l,tableName:o.name,queryColumns:we,metaColumns:b,row:ke,colIndex:D.col,onClose:()=>y(null),onSaved:()=>{X(C)},onMessage:(P,B)=>w({text:P,kind:B})},`${D.row}-${D.col}`)]}),g&&g.kind==="select"&&(0,n.jsxs)("div",{className:"db-row",style:{marginTop:8,gap:8,paddingBottom:10},children:[(0,n.jsx)("button",{disabled:C<=0,onClick:()=>X(C-k),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,n.jsx)("button",{disabled:g.total!==void 0?C+k>=g.total:ce.length<k,onClick:()=>X(C+k),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,n.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875"}),(0,n.jsx)("select",{value:k,onChange:P=>{let B=Number(P.target.value);m(B),X(0,void 0,B)},children:[50,200,500,1e3,5e3].map(P=>(0,n.jsx)("option",{value:P,children:P},P))})]})]})]})]})}function Be(e){let[a,o]=(0,T.useState)([]),l=e.type==="postgresql"||e.type==="mysql";return(0,T.useEffect)(()=>{let t=!1;if(o([]),!!l)return A.databases(e.id).then(v=>{!t&&v.supported&&o(v.databases)}).catch(()=>{}),()=>{t=!0}},[e.id,l]),{switchable:l,databases:a}}function gt({connection:e,initialDatabase:a}){let[o,l]=(0,T.useState)(""),[t,v]=(0,T.useState)(!0),[b,N]=(0,T.useState)(null),[g,O]=(0,T.useState)(!1),[C,x]=(0,T.useState)(""),[k,m]=(0,T.useState)(a??""),[p,h]=(0,T.useState)(200),{switchable:E,databases:r}=Be(e),R=async d=>{let D=(d??o).trim();if(!D){x("\u8BF7\u8F93\u5165 SQL");return}O(!0),x("");try{N(await A.query(e.id,D,t,p,k||void 0))}catch(y){x(await H(y)),N(null)}finally{O(!1)}};return(0,n.jsxs)("div",{className:"db-card",children:[(0,n.jsxs)("div",{className:"db-card-title",children:[(0,n.jsxs)("span",{children:["\u2328\uFE0F SQL \u67E5\u8BE2",e.type==="mongodb"?"":`\uFF1A${e.name}`]}),E&&(0,n.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,n.jsx)("span",{className:"db-muted",children:"\u76EE\u6807\u5E93"}),(0,n.jsxs)("select",{value:k,onChange:d=>m(d.target.value),title:"\u8BE5\u5B50\u9875\u7684\u76EE\u6807\u6570\u636E\u5E93\uFF08\u9ED8\u8BA4=\u8FDE\u63A5\u9ED8\u8BA4\u5E93\uFF09",children:[(0,n.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),r.map(d=>(0,n.jsx)("option",{value:d,children:d},d))]})]}),(0,n.jsx)("span",{className:"db-muted",children:e.type==="mongodb"?"\u63D0\u793A\uFF1A\u8FD9\u91CC\u4E5F\u63A5\u53D7 JSON \u67E5\u8BE2\uFF08\u5E26 collection \u5B57\u6BB5\uFF09":"\u63D0\u793A\uFF1A\u591A\u6761\u8BED\u53E5\u4EC5\u5728\u975E\u53EA\u8BFB\u65F6\u5141\u8BB8"})]}),(0,n.jsx)("textarea",{className:"db-code",value:o,onChange:d=>l(d.target.value),placeholder:e.type==="mongodb"?'{"collection":"users","filter":{"age":{"$gt":18}},"limit":50}':`SELECT * FROM \u8868\u540D LIMIT 100;
-- \u53EA\u8BFB\u6A21\u5F0F\u9ED8\u8BA4\u5F00\u542F`,spellCheck:!1}),(0,n.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,n.jsxs)("label",{className:"db-row",style:{cursor:"pointer",gap:6},children:[(0,n.jsx)("input",{type:"checkbox",checked:t,onChange:d=>v(d.target.checked)})," \u53EA\u8BFB\u6A21\u5F0F\uFF08\u63A8\u8350\uFF09"]}),(0,n.jsx)("div",{className:"db-grow"}),(0,n.jsx)("button",{className:"db-btn-primary",onClick:()=>R(),disabled:g,children:g?"\u6267\u884C\u4E2D\u2026":"\u6267\u884C (Ctrl+Enter)"})]}),(0,n.jsx)(K,{kind:"error",text:C}),(0,n.jsx)(fe,{result:b,limit:p,onLimitChange:h})]})}function ft({connection:e,initialDatabase:a}){let[o,l]=(0,T.useState)(""),[t,v]=(0,T.useState)(null),[b,N]=(0,T.useState)(null),[g,O]=(0,T.useState)(""),[C,x]=(0,T.useState)(""),[k,m]=(0,T.useState)(""),[p,h]=(0,T.useState)(200),[E,r]=(0,T.useState)(null),[R,d]=(0,T.useState)(-1),[D,y]=(0,T.useState)(a??""),{switchable:u,databases:w}=Be(e),i=(0,T.useMemo)(()=>(E?.providers??[]).flatMap(f=>{let S=f.label&&f.label.length>0?`${f.label}\uFF08${f.provider}\uFF09`:f.provider;return f.models.length===0?[{provider:f.provider,label:`${S} \xB7 \u9ED8\u8BA4\u6A21\u578B`}]:f.models.map(q=>({provider:f.provider,model:q.id,label:`${S} / ${q.label&&q.label.length>0?q.label:q.id}`}))}),[E]),M=()=>{let f=R>=0?i[R]:void 0;if(f)return{...f.provider?{provider:f.provider}:{},...f.model?{model:f.model}:{}}};(0,T.useEffect)(()=>{let f=!1;return A.aiModels().then(S=>{f||r(S)}).catch(()=>{f||r(null)}),()=>{f=!0}},[]);let L=async()=>{if(!o.trim()){m("\u8BF7\u8F93\u5165\u8981\u67E5\u8BE2\u7684\u95EE\u9898");return}x("AI \u751F\u6210 SQL \u4E2D\u2026"),m("");try{let f=await A.aiGenerate(e.id,o,M(),D||void 0);v(f),O(f.sql),N(null)}catch(f){m(await H(f))}finally{x("")}},I=async()=>{if(!g.trim()&&!o.trim()){m("\u6CA1\u6709\u53EF\u6267\u884C\u7684 SQL\uFF0C\u8BF7\u5148\u751F\u6210\u6216\u586B\u5199");return}x("\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"),m("");try{let f=await A.aiRun(e.id,o||g,M(),p,D||void 0);N(f),v({sql:f.sql,engine:f.engine,provider:f.provider,model:f.model,note:f.note}),O(f.sql)}catch(f){m(await H(f))}finally{x("")}};return(0,n.jsxs)("div",{className:"db-card",children:[(0,n.jsxs)("div",{className:"db-card-title",children:[(0,n.jsxs)("span",{children:["\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF1A",e.name]}),u&&(0,n.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,n.jsx)("span",{className:"db-muted",children:"\u76EE\u6807\u5E93"}),(0,n.jsxs)("select",{value:D,onChange:f=>y(f.target.value),title:"\u8BE5\u5B50\u9875\u7684\u76EE\u6807\u6570\u636E\u5E93\uFF08\u9ED8\u8BA4=\u8FDE\u63A5\u9ED8\u8BA4\u5E93\uFF09",children:[(0,n.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),w.map(f=>(0,n.jsx)("option",{value:f,children:f},f))]})]}),(0,n.jsx)("span",{className:"db-muted",children:"\u6A21\u578B\u590D\u7528 DSH \u914D\u7F6E\uFF0C\u65E0\u9700\u5728\u63D2\u4EF6\u4E2D\u586B Key"})]}),(0,n.jsxs)("div",{className:"db-row",style:{gap:8,margin:"2px 0 8px"},children:[(0,n.jsx)("label",{className:"db-muted",style:{whiteSpace:"nowrap"},children:"\u6309\u9700\u9009\u6A21\u578B\uFF1A"}),(0,n.jsxs)("select",{value:R,onChange:f=>d(Number(f.target.value)),style:{maxWidth:420},children:[(0,n.jsx)("option",{value:-1,children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),i.map((f,S)=>(0,n.jsx)("option",{value:S,children:f.label},S))]}),E&&!E.ok?(0,n.jsx)("span",{className:"db-badge",style:{color:"var(--db-err)",borderColor:"rgba(255,95,86,.4)"},children:E.message??"\u6A21\u578B\u670D\u52A1\u4E0D\u53EF\u7528"}):null,E===null?(0,n.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6 DSH \u6A21\u578B\u5217\u8868\u4E2D\u2026\uFF09"}):null]}),(0,n.jsx)("textarea",{className:"db-code",style:{minHeight:90},value:o,onChange:f=>l(f.target.value),placeholder:"\u4F8B\u5982\uFF1A\u7EDF\u8BA1\u672C\u6708\u6BCF\u4E2A\u57CE\u5E02\u7684\u4E0B\u5355\u7528\u6237\u6570\u548C\u8BA2\u5355\u603B\u989D\uFF0C\u6309\u57CE\u5E02\u6392\u5E8F",spellCheck:!1}),(0,n.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,n.jsx)("button",{className:"db-btn-primary",onClick:L,disabled:C!==""||!o.trim(),children:C==="AI \u751F\u6210 SQL \u4E2D\u2026"?"\u751F\u6210\u4E2D\u2026":"\u751F\u6210 SQL"}),(0,n.jsx)("button",{disabled:C!==""||!o.trim(),onClick:I,children:C==="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?"\u6267\u884C\u4E2D\u2026":"\u751F\u6210\u5E76\u76F4\u63A5\u67E5\u8BE2"}),(0,n.jsx)("div",{className:"db-grow"}),(0,n.jsx)("button",{className:"db-btn-ghost",onClick:()=>{v(null),O(""),N(null)},children:"\u6E05\u7A7A"})]}),(0,n.jsx)(K,{kind:"error",text:k}),C&&C!=="AI \u751F\u6210 SQL \u4E2D\u2026"&&C!=="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?(0,n.jsx)("div",{className:"db-muted",children:C}):null,t&&(0,n.jsxs)("div",{className:"db-card",style:{background:"var(--db-panel-2)"},children:[(0,n.jsxs)("div",{className:"db-card-title",children:[(0,n.jsx)("span",{children:"\u{1F916} \u751F\u6210\u7684 SQL\uFF08\u53EF\u4FEE\u6539\u540E\u6267\u884C\uFF09"}),(0,n.jsxs)("span",{className:"db-muted",children:[t.engine==="custom"?"\u81EA\u5B9A\u4E49\u7AEF\u70B9":"DSH \u6A21\u578B",t.provider?` \xB7 ${t.provider}${t.model?`/${t.model}`:""}`:"",t.note?` \xB7 ${t.note}`:""]})]}),(0,n.jsx)("textarea",{className:"db-code",value:g,onChange:f=>O(f.target.value),spellCheck:!1,style:{minHeight:110}}),(0,n.jsx)("div",{className:"db-row",style:{marginTop:8},children:(0,n.jsx)("button",{className:"db-btn-primary",onClick:I,disabled:C!=="",children:"\u6267\u884C\u6B64 SQL\uFF08\u53EA\u8BFB\uFF09"})})]}),b&&(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("div",{className:"db-divider"}),(0,n.jsx)(fe,{result:b.result,limit:p,onLimitChange:h})]}),t&&!b&&(0,n.jsx)("div",{className:"db-divider"})]})}var ht={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"},vt={view:"\u89C6\u56FE",collection:"\u96C6\u5408",table:"\u8868"};function Ie({connection:e,target:a}){let{table:o,database:l,schema:t}=a,v=ae(e.type),[b,N]=(0,T.useState)("browse"),[g,O]=(0,T.useState)({browse:!0,sql:!1,nl:!1}),C=k=>{N(k),g[k]||O(m=>({...m,[k]:!0}))},x=k=>b===k?void 0:{display:"none"};return(0,n.jsxs)("div",{className:"db-pane-stack",children:[(0,n.jsxs)("div",{className:"db-card db-ws-meta",children:[(0,n.jsx)("span",{className:"db-ws-icon",children:ht[o.kind]??"\u{1F5C2}"}),(0,n.jsx)("strong",{className:"db-ws-name",children:o.name}),(0,n.jsx)("span",{className:"db-badge db-badge-type",children:vt[o.kind]??o.kind}),l?(0,n.jsxs)("span",{className:"db-badge",children:["\u5E93\uFF1A",l]}):null,t&&v?(0,n.jsxs)("span",{className:"db-badge",children:["schema\uFF1A",t]}):null,(0,n.jsx)("span",{className:"db-badge",children:Y[e.type]}),(0,n.jsx)("span",{className:"db-muted db-grow",style:{textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:e.name})]}),(0,n.jsxs)("div",{className:"db-seg db-ws-seg",role:"tablist","aria-label":"\u5DE5\u4F5C\u533A\u5B50\u9875",children:[(0,n.jsx)("button",{role:"tab","aria-selected":b==="browse",className:b==="browse"?"db-active":"",onClick:()=>C("browse"),children:"\u{1F4DA} \u6570\u636E\u6D4F\u89C8"}),(0,n.jsx)("button",{role:"tab","aria-selected":b==="sql",className:b==="sql"?"db-active":"",onClick:()=>C("sql"),children:"\u2328\uFE0F SQL \u67E5\u8BE2"}),(0,n.jsx)("button",{role:"tab","aria-selected":b==="nl",className:b==="nl"?"db-active":"",onClick:()=>C("nl"),children:"\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2"})]}),(0,n.jsxs)("div",{className:"db-ws-pages",children:[(0,n.jsx)("div",{className:"db-ws-page",style:x("browse"),children:(0,n.jsx)(mt,{connection:e,target:a})}),g.sql&&(0,n.jsx)("div",{className:"db-ws-page",style:x("sql"),children:(0,n.jsx)(gt,{connection:e,initialDatabase:l})}),g.nl&&(0,n.jsx)("div",{className:"db-ws-page",style:x("nl"),children:(0,n.jsx)(ft,{connection:e,initialDatabase:l})})]})]})}var $=F("react/jsx-runtime"),xt={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"};function yt(e,a){return`browse:${e.id}|${a.database??""}|${a.schema??""}|${a.table.name}`}function wt(e,a){return[e.name,a.database,a.schema,a.table.name].filter(Boolean).join(" \xB7 ")}function he(e={}){let[a,o]=(0,Q.useState)([]),[l,t]=(0,Q.useState)(!1),[v,b]=(0,Q.useState)({level:"info",text:"\u52A0\u8F7D\u4E2D\u2026"}),N=(0,Q.useRef)(!0),g=(0,Q.useRef)(te().lastConnId??null),[O,C]=(0,Q.useState)(null),[x,k]=(0,Q.useState)([]),[m,p]=(0,Q.useState)(null),h=(0,Q.useCallback)(u=>{try{ne({lastConnId:u})}catch{}},[]),E=(0,Q.useCallback)(async()=>{t(!0);try{let{connections:u}=await A.connections();o(u),g.current&&u.some(i=>i.id===g.current)&&(C(g.current),g.current=null);let w=x.filter(i=>u.some(M=>M.id===i.connId));w.length!==x.length&&(k(w),p(i=>i!==null&&w.some(M=>M.key===i)?i:w.length>0?w[w.length-1].key:null)),u.length===0?b({level:"info",text:"\u5C1A\u672A\u914D\u7F6E\u8FDE\u63A5"}):b({level:"info",text:`${u.length} \u4E2A\u8FDE\u63A5\u5DF2\u52A0\u8F7D`})}catch(u){let w=u instanceof Error?u.message:String(u);b({level:"error",text:`\u52A0\u8F7D\u8FDE\u63A5\u5217\u8868\u5931\u8D25\uFF1A${w}\uFF08\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u5728 DSH \u4E2D\u542F\u7528\uFF09`})}finally{t(!1)}},[x]);(0,Q.useEffect)(()=>{N.current&&(N.current=!1,E())},[E]);let r=(0,Q.useCallback)(u=>{k(w=>w.some(i=>i.key===u.key)?w:[...w,u]),p(u.key),h(u.connId)},[h]),R=(0,Q.useCallback)((u,w)=>{r({key:yt(u,w),kind:"browse",connId:u.id,title:w.table.name,sub:wt(u,w),target:w})},[r]),d=(0,Q.useCallback)(u=>{p(w=>{if(w!==u)return w;let i=!1,M=null;for(let L of x){if(L.key===u){i=!0;continue}if(!i)M=L.key;else return L.key}return M}),k(w=>w.filter(i=>i.key!==u))},[x]),D=u=>{let w=a.find(i=>i.id===u.connId);return w?(0,$.jsx)(Ie,{connection:w,target:u.target}):null},y=u=>xt[u.target.table.kind]??"\u{1F5C2}";return(0,$.jsxs)("div",{className:"db-app",children:[(0,$.jsxs)("div",{className:"db-topbar",children:[(0,$.jsxs)("div",{className:"db-title",children:[(0,$.jsx)("span",{className:"db-logo",children:"DB"})," \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",(0,$.jsx)("span",{className:"db-badge db-badge-type",children:"dsh-database-console"})]}),(0,$.jsx)("div",{className:"db-grow"}),l?(0,$.jsx)("span",{className:"db-muted",children:"\u2026"}):null,v.level==="error"?(0,$.jsx)("span",{className:"db-muted",style:{color:"var(--db-err)"},title:v.text,children:"\u26A0\uFE0F"}):null,e.onClose?(0,$.jsx)("button",{onClick:e.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:e.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),(0,$.jsxs)("div",{className:"db-app-body",children:[(0,$.jsx)(ze,{connections:a,busyList:l,refresh:E,focusId:O,onFocused:h,onOpenBrowse:R}),(0,$.jsxs)("div",{className:"db-main",children:[(0,$.jsxs)("div",{className:"db-tabbar",role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u5DE5\u4F5C\u533A",children:[x.length===0?(0,$.jsx)("span",{className:"db-muted",style:{padding:"0 10px",whiteSpace:"nowrap"},children:"\u4ECE\u5DE6\u4FA7\u5C55\u5F00\u8FDE\u63A5\uFF0C\u70B9\u51FB\u8868/\u89C6\u56FE/\u96C6\u5408\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF08\u5185\u542B \u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF09\u3002"}):null,x.map(u=>(0,$.jsxs)("div",{role:"tab","aria-selected":u.key===m,className:`db-tab${u.key===m?" db-tab-active":""}`,title:`${u.sub} \u2014\u2014 \u70B9\u51FB\u5207\u6362\uFF0C\u2715 \u5173\u95ED`,onClick:()=>p(u.key),children:[(0,$.jsx)("span",{className:"db-tab-icon",children:y(u)}),(0,$.jsx)("span",{className:"db-tab-label",children:u.title}),(0,$.jsx)("span",{className:"db-tab-close",title:"\u5173\u95ED",onClick:w=>{w.stopPropagation(),d(u.key)},children:"\u2715"})]},u.key))]}),(0,$.jsx)("div",{className:"db-tabpanes",children:x.length===0?(0,$.jsxs)("div",{className:"db-empty",style:{flex:1},children:[(0,$.jsx)("div",{children:"\u8FD8\u6CA1\u6709\u6253\u5F00\u4EFB\u4F55\u5DE5\u4F5C\u533A\u3002"}),(0,$.jsxs)("div",{style:{marginTop:6,fontSize:12},children:["\u5DE6\u4FA7\u70B9\u51FB\u8FDE\u63A5\u540D\u5C55\u5F00\u5BF9\u8C61\u6811 \u2192 \u70B9\u8868/\u89C6\u56FE/\u96C6\u5408\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF1B",(0,$.jsx)("br",{}),"\u6BCF\u4E2A Tab \u5185\u542B\u300C\u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\u300D\u4E09\u4E2A\u5B50\u9875\uFF0C\u5404\u81EA\u72EC\u7ACB\u4FDD\u6301\u72B6\u6001\uFF1B",(0,$.jsx)("br",{}),"\u91CD\u590D\u70B9\u51FB\u540C\u4E00\u5F20\u8868\u4F1A\u5B9A\u4F4D\u56DE\u5B83\u5DF2\u6253\u5F00\u7684 Tab\u3002"]})]}):x.map(u=>(0,$.jsx)("div",{role:"tabpanel",className:"db-pane","data-active":u.key===m?"true":void 0,style:u.key===m?void 0:{display:"none"},children:D(u)},u.key))})]})]})]})}var ve=F("react/jsx-runtime");function qe(e){let[a,o]=(0,de.useState)({left:Ae,right:0});return(0,de.useEffect)(()=>{if(typeof document>"u")return;let l=document.querySelector('[class*="sidebarCol"]'),t=document.querySelector('[class*="detailsCol"]');if(l===null&&t===null)return;let v=()=>{o({left:l!==null?l.getBoundingClientRect().width:Ae,right:t!==null?t.getBoundingClientRect().width:0})};v();let b=new ResizeObserver(v);return l!==null&&b.observe(l),t!==null&&b.observe(t),()=>b.disconnect()},[]),(0,ve.jsx)("div",{id:"dsh-database-console","data-hidden":e.hidden?"true":void 0,style:{position:"absolute",left:Math.max(0,Math.round(a.left)),top:0,right:Math.max(0,Math.round(a.right)),bottom:0,background:"var(--db-bg)",display:e.hidden?"none":"flex",flexDirection:"column",overflow:"hidden",zIndex:1},children:(0,ve.jsx)(he,{onClose:e.onClose,standalone:e.standalone})})}var Ae=280;var le=`/* dsh-database-console \u5BA2\u6237\u7AEF\u6837\u5F0F\uFF08\u6697\u8272\u4E3B\u9898\uFF0C\u65E0\u5916\u90E8\u4F9D\u8D56\uFF09 */
:root {
  --db-bg: #0e1116;
  --db-panel: #151a23;
  --db-panel-2: #1b2230;
  --db-border: #2a3345;
  --db-border-strong: #3a4660;
  --db-text: #e6e9ef;
  --db-muted: #8b93a3;
  --db-accent: #4c8dff;
  --db-accent-weak: rgba(76, 141, 255, 0.14);
  --db-ok: #37c978;
  --db-warn: #e0b341;
  --db-err: #ff5f56;
  --db-radius: 8px;
  --db-mono: "Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace;
}

#dsh-database-console {
  --bg: var(--db-bg);
  color: var(--db-text);
  font-size: 13px;
  line-height: 1.5;
  box-sizing: border-box;
}
#dsh-database-console *,
#dsh-database-console *::before,
#dsh-database-console *::after {
  box-sizing: border-box;
}
#dsh-database-console .db-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(180deg, #1a2130, #141a26);
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius);
  margin-bottom: 10px;
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
  border-radius: 6px;
  background: linear-gradient(135deg, #4c8dff, #7b61ff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
}
#dsh-database-console .db-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
#dsh-database-console button {
  font: inherit;
  color: var(--db-text);
  background: var(--db-panel-2);
  border: 1px solid var(--db-border);
  border-radius: 6px;
  padding: 5px 11px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
#dsh-database-console button:hover:not(:disabled) {
  border-color: var(--db-accent);
  background: var(--db-accent-weak);
}
#dsh-database-console button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
#dsh-database-console button.db-btn-primary {
  background: var(--db-accent);
  border-color: var(--db-accent);
  color: #fff;
}
#dsh-database-console button.db-btn-primary:hover:not(:disabled) {
  background: #6ba0ff;
  border-color: #6ba0ff;
}
#dsh-database-console button.db-btn-danger {
  color: var(--db-err);
}
#dsh-database-console button.db-btn-ghost {
  background: transparent;
}
#dsh-database-console .db-seg {
  display: inline-flex;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 8px;
  padding: 2px;
}
#dsh-database-console .db-seg button {
  border: none;
  background: transparent;
  padding: 4px 12px;
  border-radius: 6px;
}
#dsh-database-console .db-seg button.db-active {
  background: var(--db-accent-weak);
  color: #9cc0ff;
}
#dsh-database-console input,
#dsh-database-console select,
#dsh-database-console textarea {
  font: inherit;
  color: var(--db-text);
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: 6px;
  padding: 6px 9px;
  outline: none;
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
#dsh-database-console .db-card {
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius);
  padding: 12px;
}
#dsh-database-console .db-card-title {
  font-size: 12px;
  color: var(--db-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
#dsh-database-console .db-banner {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  margin: 6px 0;
}
#dsh-database-console .db-banner-error {
  background: rgba(255, 95, 86, 0.1);
  border-color: rgba(255, 95, 86, 0.35);
  color: #ff9b94;
}
#dsh-database-console .db-banner-info {
  background: rgba(76, 141, 255, 0.1);
  border-color: rgba(76, 141, 255, 0.3);
  color: #9cc0ff;
}
#dsh-database-console .db-banner-ok {
  background: rgba(55, 201, 120, 0.1);
  border-color: rgba(55, 201, 120, 0.3);
  color: #7fe3a9;
}
#dsh-database-console table.db-data {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
#dsh-database-console table.db-data th,
#dsh-database-console table.db-data td {
  border: 1px solid var(--db-border);
  padding: 5px 9px;
  text-align: left;
  vertical-align: top;
  max-width: 340px;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
#dsh-database-console table.db-data th {
  background: var(--db-panel-2);
  color: var(--db-muted);
  position: sticky;
  top: 0;
  font-weight: 600;
  cursor: default;
}
#dsh-database-console table.db-data tbody tr:hover td {
  background: rgba(76, 141, 255, 0.05);
}
#dsh-database-console .db-scroll {
  overflow: auto;
  border: 1px solid var(--db-border);
  border-radius: 6px;
  max-height: 420px;
}
#dsh-database-console .db-null {
  color: #5b6374;
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
  border-radius: 10px;
  padding: 1px 8px;
  border: 1px solid var(--db-border-strong);
  color: var(--db-muted);
}
#dsh-database-console .db-badge-ok {
  color: var(--db-ok);
  border-color: rgba(55, 201, 120, 0.4);
}
#dsh-database-console .db-badge-type {
  color: #8fb8ff;
  border-color: rgba(76, 141, 255, 0.35);
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
  gap: 6px;
}
#dsh-database-console .db-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--db-border);
  border-radius: 6px;
  background: var(--db-panel-2);
  cursor: pointer;
}
#dsh-database-console .db-list-item:hover {
  border-color: var(--db-accent);
}
#dsh-database-console .db-list-item.db-active {
  border-color: var(--db-accent);
  background: var(--db-accent-weak);
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

/* ===== DSH shell \u96C6\u6210\uFF1A\u4E2D\u680F\u63A5\u7BA1 + \u4FA7\u8FB9\u680F\u5165\u53E3 ===== */

[data-pane='conversation'],
[class*='centerCol'] {
  position: relative;
}

[data-dsh-database-view] {
  position: absolute;
  inset: 0;
  display: none;
  z-index: 60;
  background: var(--db-bg, #0e1116);
  overflow: auto;
}
html[data-dsh-database-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [data-dsh-database-view] {
  display: block;
}
html[data-dsh-database-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [data-pane='conversation'] > :not([data-dsh-database-view]),
html[data-dsh-database-active]:not([data-dsh-taskboard-active]):not([data-dsh-ssh-active]) [class*='centerCol'] > :not([data-dsh-database-view]) {
  display: none !important;
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
  background: var(--db-bg, #0e1116);
  overflow: auto;
}

/* ---------- \u6570\u636E\u6D4F\u89C8\uFF1A\u53EF\u62D6\u5217\u5BBD\u7F51\u683C / \u5355\u5143\u683C\u7F16\u8F91 ---------- */
#dsh-database-console .db-structure-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  font: inherit;
  color: inherit;
  border-radius: 6px;
}
#dsh-database-console .db-structure-toggle:hover {
  background: var(--db-panel-2);
}
/* \u53CC\u8868\u7F51\u683C\uFF1A\u8868\u5934\u56FA\u5B9A\u5728\u5916\u5C42\u4E0D\u53C2\u4E0E\u7AD6\u5411\u6EDA\u52A8\uFF1B\u8868\u4F53\u72EC\u7ACB\u6EDA\u52A8\uFF1B\u5171\u7528\u540C\u4E00\u7EC4\u5217\u5BBD */
#dsh-database-console .db-gridx {
  flex: 1 1 auto;
  min-width: 0;
  border: 1px solid var(--db-border);
  border-radius: 6px;
}
#dsh-database-console .db-gridx-head {
  overflow: hidden;
  background: var(--db-panel-2);
  border-bottom: 1px solid var(--db-border-strong);
  border-radius: 6px 6px 0 0;
}
#dsh-database-console .db-gridx-body {
  overflow: auto;
  max-height: 460px;
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
  border-right: 1px solid var(--db-border);
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
  border-radius: 3px;
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
  border: 1px solid var(--db-accent);
  border-radius: 4px;
  background: var(--db-panel);
  color: inherit;
  outline: none;
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
  border-bottom: 1px solid var(--db-border);
  border-right: 1px solid var(--db-border);
  padding: 4px 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  color: inherit;
}
#dsh-database-console table.db-gridx-t td.db-cell:hover {
  background: var(--db-accent-weak);
}
#dsh-database-console table.db-gridx-t td.db-cell-active,
#dsh-database-console table.db-gridx-t td.db-cell-active:hover {
  background: rgba(76, 141, 255, 0.22);
  box-shadow: inset 0 0 0 1px var(--db-accent);
}
#dsh-database-console .db-celldetail {
  flex: 0 0 300px;
  width: 300px;
  max-width: 38%;
  min-width: 260px;
  padding: 10px 12px;
  border-left: 1px solid var(--db-border);
  background: var(--db-panel-2);
  overflow: auto;
  max-height: 560px;
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
  border: 1px solid var(--db-border);
  border-radius: 6px;
  padding: 5px 8px;
  margin-top: 8px;
  cursor: pointer;
  text-align: left;
  gap: 4px;
}
#dsh-database-console .db-row-toggle:hover {
  border-color: var(--db-accent);
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
  border: 1px solid var(--db-border);
  border-radius: 6px;
  background: var(--db-panel);
}

/* ===== \u65B0\u5E03\u5C40\uFF1A\u5DE6\u4FA7\u5BFC\u822A + \u53F3\u4FA7\u591A Tab \u5DE5\u4F5C\u533A ===== */

#dsh-database-console .db-app {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}
#dsh-database-console .db-topbar {
  margin: 10px 12px 0;
}
#dsh-database-console .db-app-body {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  gap: 10px;
  padding: 10px 12px 12px;
}

/* ---------- \u5DE6\u4FA7\u5BFC\u822A\uFF08\u8FDE\u63A5\u7BA1\u7406 + \u5BF9\u8C61\u6811\uFF09 ---------- */
#dsh-database-console .db-nav {
  flex: 0 0 268px;
  width: 268px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius);
  padding: 10px;
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
  text-transform: uppercase;
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
  background: var(--db-panel-2);
  border-color: var(--db-accent);
}
#dsh-database-console .db-nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}
#dsh-database-console .db-conn-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  min-width: 0;
}
#dsh-database-console .db-conn-row:hover {
  background: var(--db-accent-weak);
  border-color: rgba(76, 141, 255, 0.35);
}
#dsh-database-console .db-conn-row.db-conn-active {
  background: var(--db-accent-weak);
  border-color: var(--db-accent);
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

#dsh-database-console .db-tree-host {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 4px 14px;
  padding: 8px;
  border: 1px solid var(--db-border);
  border-radius: 8px;
  background: var(--db-bg);
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
  gap: 2px;
  min-width: 0;
  max-height: 320px;
  overflow-y: auto;
}
#dsh-database-console .db-tree-table {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  border: 1px solid transparent;
  background: transparent;
  color: var(--db-text);
  font-size: 12px;
  text-align: left;
  padding: 3px 6px;
  border-radius: 6px;
  cursor: pointer;
  min-width: 0;
}
#dsh-database-console .db-tree-table:hover {
  background: var(--db-accent-weak);
  border-color: rgba(76, 141, 255, 0.4);
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

/* ---------- \u53F3\u4FA7 Tab \u5DE5\u4F5C\u533A ---------- */
#dsh-database-console .db-main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--db-panel);
  border: 1px solid var(--db-border);
  border-radius: var(--db-radius);
  overflow: hidden;
}
#dsh-database-console .db-tabbar {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
  gap: 2px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 4px 6px 0;
  border-bottom: 1px solid var(--db-border);
  background: rgba(0, 0, 0, 0.12);
  scrollbar-width: thin;
}
#dsh-database-console .db-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  max-width: 240px;
  min-width: 0;
  padding: 6px 6px 6px 10px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  color: var(--db-muted);
  font-size: 12.5px;
  white-space: nowrap;
  user-select: none;
}
#dsh-database-console .db-tab:hover {
  background: rgba(76, 141, 255, 0.1);
  color: var(--db-text);
}
#dsh-database-console .db-tab.db-tab-active {
  background: var(--db-panel-2);
  border-color: var(--db-border);
  color: var(--db-text);
  box-shadow: inset 0 1px 0 var(--db-accent);
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
  background: rgba(255, 95, 86, 0.2);
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
  padding: 10px 12px 24px;
}
#dsh-database-console .db-pane-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
#dsh-database-console .db-ws-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  min-width: 0;
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

/* \u7A84\u5C4F\u65F6\u7ED9\u6570\u636E\u6D4F\u89C8\u7F51\u683C\u66F4\u9AD8\u7684\u53EF\u89C6\u533A\uFF08Tab \u5185\u6EDA\u52A8\u65F6\u4FDD\u7559\u9875\u811A\uFF09 */
#dsh-database-console .db-gridx-body {
  max-height: 62vh;
}
`;var Fe="dsh-database-console-style";function xe(){if(typeof document>"u")return()=>{};let e=document.getElementById(Fe);if(e!==null&&e.isConnected)return()=>{};let a=document.createElement("style");return a.id=Fe,a.setAttribute("data-plugin","dsh-database-console"),a.textContent=le,document.head.appendChild(a),()=>{a.isConnected&&a.remove()}}var ee="database",Ve={"sidebar.label":"\u6570\u636E\u5E93","sidebar.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","sidebar.title":"\u6253\u5F00\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","overlay.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0\u9762\u677F","overlay.close":"\u56DE\u5230\u5BF9\u8BDD","toolbar.open":"\u6253\u5F00\u6570\u636E\u5E93","toolbar.close":"\u5173\u95ED\u6570\u636E\u5E93"},Qe={"sidebar.label":"Database","sidebar.aria":"Database console","sidebar.title":"Open database console","overlay.aria":"Database console panel","overlay.close":"Back to conversation","toolbar.open":"Open database","toolbar.close":"Close database"};var Nt=["slots","locale"];function Ct({renderSlot:e,standalone:a=!1}){let o=Pe(),l=(0,ie.useRef)(!1);if((0,ie.useEffect)(()=>{o.panelOpen&&(l.current=!0)},[o.panelOpen]),!o.panelOpen&&!a&&!l.current)return null;let t=o.panelOpen||a;return e("database.console",{onClose:()=>_.close(),standalone:a,hidden:!t})}function St(e){let a=e?.slots,o=e?.locale;if(!a||!o){typeof document<"u"&&e?.effect?.(()=>ye(),"dsh-database-console: standalone preview");return}let l=o.bind(ee),t=o.register(ee,{zh:Ve,en:Qe}),v=xe(),b=a.inject("sidebar.footer.action",()=>a.register({name:"sidebar.footer.action",id:"database",order:-10,locale:ee,label:()=>l("sidebar.label")},Le)),N=a.inject("database.console",()=>a.register({name:"database.console",id:"dsh",order:0,locale:ee,label:()=>l("sidebar.aria"),children:{"database.console.toolbar":{kind:"list",scope:"root"}}},qe)),g=a.inject("shell.overlay",()=>a.register({name:"shell.overlay",id:"database.console",order:60,locale:ee,label:()=>l("sidebar.aria"),children:{"database.console":{kind:"single",scope:"root"}}},Ct));e?.effect&&e.effect(()=>()=>{t(),b(),N(),g(),v()},"dsh-database-console: plugin teardown")}function ye(){if(typeof document>"u"||document.getElementById("dsh-database-standalone-button")!==null)return;xe();let e=document.createElement("button");e.id="dsh-database-standalone-button",e.textContent="\u{1F5C4} \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483000","background:linear-gradient(135deg,#4c8dff,#7b61ff)","color:#fff","border:0","border-radius:999px","padding:10px 18px","font:600 13px/1.4 system-ui,sans-serif","cursor:pointer","box-shadow:0 6px 18px rgba(0,0,0,.35)"].join(";"),e.addEventListener("click",()=>_.toggle()),document.body.appendChild(e)}var Tt=globalThis;!Tt.window?.__ModuleLoader__&&typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>ye(),{once:!0}):ye());return at(Et);})();
    return __dsh_db_console_module__;
  },
});
