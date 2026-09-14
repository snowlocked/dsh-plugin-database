window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-database-console",
  factory: (require) => {
    "use strict";
    var __dsh_db_module = { exports: {} };
    var __dsh_db_exports = __dsh_db_module.exports;
    Object.defineProperty(__dsh_db_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_db_console_module__=(()=>{var ye=Object.defineProperty;var pt=Object.getOwnPropertyDescriptor;var ut=Object.getOwnPropertyNames;var mt=Object.prototype.hasOwnProperty;var I=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(a,n)=>(typeof require<"u"?require:a)[n]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var gt=(e,a)=>{for(var n in a)ye(e,n,{get:a[n],enumerable:!0})},ft=(e,a,n,o)=>{if(a&&typeof a=="object"||typeof a=="function")for(let t of ut(a))!mt.call(e,t)&&t!==n&&ye(e,t,{get:()=>a[t],enumerable:!(o=pt(a,t))||o.enumerable});return e};var ht=e=>ft(ye({},"__esModule",{value:!0}),e);var Kt={};gt(Kt,{apply:()=>jt,cssText:()=>fe,inject:()=>Vt});var pe=I("react");var Ae=I("react");var $e="dsh-database-console.persist.v1";function de(){try{let e=window.localStorage.getItem($e);if(!e)return{};let a=JSON.parse(e);return a&&typeof a=="object"?a:{}}catch{return{}}}function be(e){try{let a={...de(),...e};window.localStorage.setItem($e,JSON.stringify(a))}catch{}}var oe=de().panelOpen===!0,Oe=null,Ne=new Set,He=e=>{if(typeof document>"u")return;let a=0,n=()=>{let o=Array.from(document.querySelectorAll('[role="tab"]')).filter(t=>t.closest("#dsh-database-console")===null).find(t=>{let u=t.textContent?.trim().toLowerCase()??"",d=`${t.getAttribute("aria-label")??""} ${t.title??""}`.toLowerCase();return e==="database"?u==="database"||u==="\u6570\u636E\u5E93"||d.includes("database")||d.includes("\u6570\u636E\u5E93"):u==="chat"||u==="\u5BF9\u8BDD"||d.includes("chat")||d.includes("\u5BF9\u8BDD")});if(o!==void 0){o.click();return}++a<8&&setTimeout(n,16)};n()},we=()=>{for(let e of Ne)e()},ze=!1,Be=Object.freeze({panelOpen:!0,activeConnectionId:null}),Fe=Object.freeze({panelOpen:!1,activeConnectionId:null}),Qe=oe?Be:Fe,ke=()=>{Qe=oe?Be:Fe},Ie=()=>{try{be({panelOpen:oe})}catch{}},K={open(){oe||(oe=!0,ke(),Ie(),we()),He("database")},close(){oe=!1,ke(),Ie(),we(),He("chat")},toggle(){ze?K.close():K.open()},setDocked(e){ze=e},getSnapshot:()=>Qe,subscribe(e){return Ne.add(e),()=>Ne.delete(e)},setActiveConnection(e){Oe!==e&&(Oe=e,ke(),we())}};function Ve(){return(0,Ae.useSyncExternalStore)(K.subscribe,K.getSnapshot,K.getSnapshot)}var U=I("react/jsx-runtime"),vt=(0,U.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,U.jsx)("ellipse",{cx:7.5,cy:11,rx:5.5,ry:2.75}),(0,U.jsx)("path",{d:"M7.5 11V5.5"}),(0,U.jsx)("path",{d:"M2.75 6.25c0-1.1 2.1-2 4.75-2s4.75.9 4.75 2"}),(0,U.jsx)("path",{d:"M7.5 8.25c1.9 0 3.4-.45 3.9-1.1M5.25 4.35V3.5"})]});function je(e){let{wide:a=!0,t:n=(d=>d)}=e,o=n,t=(0,pe.useSyncExternalStore)(K.subscribe,K.getSnapshot,K.getSnapshot),u=(0,pe.useCallback)(()=>{K.toggle()},[]);return(0,U.jsxs)("button",{type:"button","data-d-sh-plugin":"database","data-active":t.panelOpen||void 0,"aria-label":o("sidebar.aria"),title:o("sidebar.title"),onClick:u,className:"db-sidebar-entry",children:[(0,U.jsx)("span",{className:"db-sidebar-entry-icon","aria-hidden":"true",children:vt}),a?(0,U.jsx)("span",{className:"db-sidebar-entry-label",children:o("sidebar.label")}):null]})}var ge=I("react"),et=I("react-dom/client");var _=I("react");var se={postgresql:"PostgreSQL",mysql:"MySQL",mongodb:"MongoDB",sqlite:"SQLite",dameng:"\u8FBE\u68A6 DM"},xt="/api/dsh-database-console",re=class extends Error{status;code;constructor(a,n,o){super(a),this.status=n,this.code=o}};async function yt(e,a){let n;try{n=await fetch(`${xt}${e}`,a)}catch(t){throw new re(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${t instanceof Error?t.message:String(t)}`,0)}let o=null;try{o=await n.json()}catch{o=null}if(!n.ok){let t=o&&typeof o=="object"?o:{};throw new re(String(t.error??`HTTP ${n.status}`),n.status,String(t.code??""))}return o}function wt(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)}}function G(e,a){return yt(e,wt(a??{}))}var F={state:()=>G("/state"),connections:()=>G("/connections/list"),meta:e=>G("/connection/meta",{id:e}),save:e=>G("/connections/save",e),remove:e=>G("/connection/remove",{id:e}),test:e=>G("/connections/test",e),databases:e=>G("/connection/databases",{id:e}),schemas:(e,a)=>G("/connection/schemas",{id:e,...a?{database:a}:{}}),tables:(e,a,n)=>G("/connection/tables",{id:e,...a?{schema:a}:{},...n?{database:n}:{}}),columns:(e,a,n,o)=>G("/connection/columns",{id:e,table:a,...n?{schema:n}:{},...o?{database:o}:{}}),rows:(e,a,n,o,t,u,d)=>G("/connection/rows",{id:e,table:a,...n?{schema:n}:{},...u?{database:u}:{},limit:o,offset:t,...d?.sort?{sort:d.sort}:{},...d?.filters&&Object.keys(d.filters).length>0?{filters:d.filters}:{}}),cellUpdate:e=>G("/connection/cell/update",{id:e.id,table:e.table,...e.schema?{schema:e.schema}:{},...e.database?{database:e.database}:{},column:e.column,pk:e.pk,value:e.value,isNull:e.isNull}),query:(e,a,n,o,t,u)=>G("/query",{id:e,sql:a,readOnly:n,...t?{database:t}:{},...o?{limit:o}:{},total:!0,...u?{offset:u}:{}}),aiModels:()=>G("/ai/models"),aiGenerate:(e,a,n,o)=>G("/ai/generate",{id:e,question:a,...o?{database:o}:{},...n?.provider?{provider:n.provider}:{},...n?.model?{model:n.model}:{}}),aiRun:(e,a,n,o,t)=>G("/ai/run",{id:e,question:a,...t?{database:t}:{},...n?.provider?{provider:n.provider}:{},...n?.model?{model:n.model}:{},...o?{limit:o}:{}})};function le(e){return e==="postgresql"||e==="dameng"}function _e(e){switch(e){case"postgresql":return 5432;case"mysql":return 3306;case"mongodb":return 27017;case"dameng":return 5236;default:return null}}function ae(e){if(e==null)return"NULL";if(typeof e=="object")try{return JSON.stringify(e)}catch{return String(e)}return String(e)}var z=I("react");var V=I("react");var p=I("react/jsx-runtime");function X({kind:e,text:a}){return a?(0,p.jsx)("div",{className:`db-banner db-banner-${e}`,children:a}):null}function Ke({result:e}){if(!e)return null;let a=[`\u8017\u65F6 ${e.durationMs}ms`];return(e.rowCount>0||e.columns.length>0)&&a.push(`${e.rowCount} \u884C`),e.affectedRows!==void 0&&a.push(`\u5F71\u54CD ${e.affectedRows} \u884C`),e.truncated&&a.push(`\u26A0\uFE0F \u5DF2\u622A\u65AD\uFF08\u4EC5\u663E\u793A ${e.rows.length} \u884C\uFF09`),(0,p.jsxs)("div",{className:"db-row db-muted",style:{padding:"6px 2px"},children:[(0,p.jsx)("span",{className:e.kind==="change"?"db-ok":"",children:a.join(" \xB7 ")}),e.message?(0,p.jsx)("span",{className:"db-ok",children:e.message}):null]})}async function J(e){return e instanceof re||e instanceof Error?e.message:String(e)}function kt(e){let a=(e.length+6)*8+40;return Math.min(420,Math.max(120,a))}function Ce({columns:e,rows:a,active:n,onCellClick:o,interaction:t}){let[u,d]=(0,V.useState)({}),l=(0,V.useRef)(null),m=f=>Math.min(720,Math.max(72,Math.round(f))),C=f=>u[f]??kt(e[f]??""),w=e.reduce((f,h,x)=>f+C(x),0),y=(f,h)=>{h.preventDefault(),h.stopPropagation();let x=h.clientX,E=C(f),i=c=>{let L=m(E+(c.clientX-x));d(H=>H[f]===L?H:{...H,[f]:L})},P=()=>{window.removeEventListener("pointermove",i),window.removeEventListener("pointerup",P),document.body.style.cursor="",document.body.style.userSelect=""};document.body.style.cursor="col-resize",document.body.style.userSelect="none",window.addEventListener("pointermove",i),window.addEventListener("pointerup",P)},k=()=>(0,p.jsx)("colgroup",{children:e.map((f,h)=>(0,p.jsx)("col",{style:{width:C(h)}},`col-${h}`))});return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)("div",{className:"db-gridx-head",ref:l,children:(0,p.jsxs)("table",{className:"db-gridx-t",style:{width:w},children:[k(),(0,p.jsx)("thead",{children:(0,p.jsx)("tr",{children:e.map((f,h)=>{let x=t&&t.sort?.col===h?t.sort.dir:0,E=t?!!t.filters[h]:!1;return(0,p.jsxs)("th",{title:f,style:{width:C(h),minWidth:C(h)},children:[(0,p.jsxs)("span",{className:"db-gridx-th-main",children:[t?(0,p.jsxs)("button",{className:"db-sort-label",title:"\u70B9\u51FB\u6392\u5E8F\uFF1A\u5347\u5E8F \u2192 \u964D\u5E8F \u2192 \u53D6\u6D88",onClick:()=>t.onSort(h),children:[f,(0,p.jsx)("span",{className:x===0?"db-sort-idle":"db-sort-on",children:x===1?" \u25B2":x===-1?" \u25BC":" \u2195"})]}):(0,p.jsx)("span",{className:"db-gridx-th",children:f}),t?(0,p.jsx)("span",{className:E?"db-filter-toggle db-filter-on":"db-filter-toggle",title:E?`\u8FC7\u6EE4\uFF1A${t.filters[h]}\uFF08\u70B9\u51FB\u7F16\u8F91\uFF09`:"\u5217\u8FC7\u6EE4",onClick:()=>t.onFilterOpen(t.filterOpen===h?null:h),children:E?"\u2715":"\u26B2"}):null]}),t&&t.filterOpen===h?(0,p.jsx)("input",{className:"db-gridx-filter",autoFocus:!0,value:t.filters[h]??"",placeholder:`\u8FC7\u6EE4 ${f}\u2026`,spellCheck:!1,onChange:i=>t.onFilter(h,i.target.value),onKeyDown:i=>{(i.key==="Escape"||i.key==="Enter")&&t.onFilterOpen(null)}}):null,(0,p.jsx)("span",{className:"db-colresize",onPointerDown:i=>y(h,i),title:"\u62D6\u52A8\u8C03\u6574\u5217\u5BBD"})]},f)})})})]})}),(0,p.jsx)("div",{className:"db-gridx-body",onScroll:f=>{l.current&&(l.current.scrollLeft=f.currentTarget.scrollLeft)},children:(0,p.jsxs)("table",{className:"db-gridx-t",style:{width:w},children:[k(),(0,p.jsx)("tbody",{children:a.map((f,h)=>(0,p.jsx)("tr",{children:f.map((x,E)=>{let i=ae(x),P=n?.row===h&&n?.col===E;return(0,p.jsx)("td",{className:P?"db-cell-active":"db-cell",title:i,style:{width:C(E)},onClick:()=>o(h,E),children:x==null?(0,p.jsx)("span",{className:"db-null",children:"NULL"}):typeof x=="object"?(0,p.jsx)("span",{className:"db-mono",children:i}):i},`${h}-${E}`)})},h))})]})})]})}function Ge({connection:e,table:a,schema:n,database:o,tableName:t,queryColumns:u,metaColumns:d,row:l,colIndex:m,onClose:C,onSaved:w,onMessage:y}){let k=u[m]??"",f=l[m],h=d.find(R=>R.name===k),[x,E]=(0,V.useState)(()=>f==null?"":ae(f)),[i,P]=(0,V.useState)(f==null),[c,L]=(0,V.useState)(""),[H,v]=(0,V.useState)(!1),N=new Map;u.forEach((R,B)=>N.set(R,B));let b=d.filter(R=>R.primary).map(R=>({column:R.name,value:l[N.get(R.name)??-1]??null})).filter(R=>N.has(R.column)),$=b.length>0?b.map(R=>`${R.column}=${ae(R.value)}`).join(" & "):"",q=b.length>0,S=e.type==="mongodb",j=async()=>{if(!(!q||!a)){L("\u4FDD\u5B58\u4E2D\u2026");try{let R=await F.cellUpdate({id:e.id,table:a.name,schema:n,...o?{database:o}:{},column:k,pk:b,value:i?null:x,isNull:i});R.ok&&(y(`\u2713 \u5DF2\u66F4\u65B0 ${R.affectedRows} \u884C\uFF08${t}.${k}\uFF09`,"ok"),w())}catch(R){y(await J(R),"error")}finally{L("")}}};return(0,p.jsxs)("div",{className:"db-celldetail",children:[(0,p.jsxs)("div",{className:"db-celldetail-title",children:[(0,p.jsx)("span",{children:"\u270F\uFE0F \u5355\u5143\u683C\u7F16\u8F91"}),(0,p.jsx)("button",{className:"db-btn-ghost",onClick:C,disabled:c!=="",children:"\u2715"})]}),(0,p.jsxs)("div",{className:"db-celldetail-meta",children:[(0,p.jsxs)("div",{children:[(0,p.jsx)("span",{className:"db-muted",children:"\u8868"})," ",t]}),(0,p.jsxs)("div",{children:[(0,p.jsx)("span",{className:"db-muted",children:"\u5217"})," ",k," ",(0,p.jsx)("span",{className:"db-badge db-badge-type",children:h?.type??""})]}),(0,p.jsxs)("div",{children:[(0,p.jsx)("span",{className:"db-muted",children:"\u5B9A\u4F4D"})," ",$||"\uFF08\u65E0\u4E3B\u952E\uFF09"]})]}),(0,p.jsx)("button",{className:"db-row db-row-toggle",onClick:()=>v(R=>!R),title:H?"\u70B9\u51FB\u6536\u8D77\u6574\u884C\u6570\u636E":"\u70B9\u51FB\u5C55\u5F00\u6574\u884C\u6570\u636E",children:(0,p.jsxs)("span",{children:[H?"\u25BE":"\u25B8"," \u6574\u884C\u6570\u636E\uFF08",u.length," \u5217\uFF09"]})}),H&&(0,p.jsx)("div",{className:"db-celldetail-row",children:u.map((R,B)=>(0,p.jsxs)("div",{title:`${R} = ${ae(l[B])}`,children:[(0,p.jsx)("span",{className:"db-chip",children:R})," = ",ae(l[B])]},R))}),S||!q?(0,p.jsx)("div",{className:"db-empty",style:{padding:"8px"},children:S?"MongoDB \u96C6\u5408\u6682\u4E0D\u652F\u6301\u5355\u5143\u683C\u7F16\u8F91\uFF08\u6CA1\u6709\u4E3B\u952E\u5217\u6982\u5FF5\uFF09":"\u8BE5\u8868\u6CA1\u6709\u4E3B\u952E\uFF0C\u65E0\u6CD5\u5B89\u5168\u5B9A\u4F4D\u884C\uFF0C\u7F16\u8F91\u5DF2\u7981\u7528"}):null,(0,p.jsx)("label",{className:"db-muted",style:{display:"block",margin:"8px 0 4px"},children:"\u65B0\u503C\uFF08\u5B58\u4E3A NULL \u53EF\u7559\u7A7A\uFF09\uFF1A"}),(0,p.jsxs)("label",{className:"db-row",style:{gap:6,cursor:"pointer",fontSize:12},children:[(0,p.jsx)("input",{type:"checkbox",checked:i,onChange:R=>P(R.target.checked)})," \u5B58\u4E3A NULL"]}),(0,p.jsx)("textarea",{className:"db-code",style:{minHeight:90,width:"100%",boxSizing:"border-box",marginTop:6},value:x,disabled:i,spellCheck:!1,onChange:R=>E(R.target.value),placeholder:"\u8F93\u5165\u65B0\u503C\u2026"}),(0,p.jsxs)("div",{className:"db-row",style:{gap:8,marginTop:8},children:[(0,p.jsx)("button",{className:"db-btn-primary",onClick:j,disabled:!q||c!==""||S,children:c||(q?"\u4FDD\u5B58\uFF08UPDATE \u8BE5\u884C\uFF09":"\u4FDD\u5B58")}),(0,p.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u70B9\u51FB\u5355\u5143\u683C\u65C1\u7684\u4EFB\u610F\u5904\u53EF\u518D\u9009\u5176\u5B83\u5355\u5143\u683C"})]})]})}function Nt(e,a){if(e==null)return a==null?0:1;if(a==null)return-1;if(typeof e=="number"&&typeof a=="number")return e<a?-1:e>a?1:0;let n=ae(e),o=ae(a),t=Number(n),u=Number(o);return n!==""&&o!==""&&Number.isFinite(t)&&Number.isFinite(u)?t<u?-1:t>u?1:0:n.localeCompare(o,void 0,{numeric:!0,sensitivity:"base"})}function Se({result:e,limit:a,onLimitChange:n,paging:o}){let[t,u]=(0,V.useState)(0),d=Math.max(1,a),[l,m]=(0,V.useState)(null),[C,w]=(0,V.useState)({}),[y,k]=(0,V.useState)(null),f=(0,V.useRef)(null),h=e?.columns??[],x=e?.rows??[],E=o!==void 0&&e!==null&&e.kind==="select"&&e.offset!==void 0,i=E?Math.max(0,e?.offset??0):0,P=E&&typeof e?.total=="number"?e.total:null;(0,V.useEffect)(()=>{u(0),m(null),w({}),k(null);let M=f.current?.querySelector(":scope > .db-gridx-body");M&&(M.scrollTop=0)},[e]);let c=(0,V.useMemo)(()=>{let M=Object.entries(C).filter(Q=>Q[1].trim()!=="");return M.length===0?x:x.filter(Q=>M.every(([g,Y])=>{let ee=Number(g);return ae(Q[ee]).toLowerCase().includes(Y.trim().toLowerCase())}))},[x,C]),L=(0,V.useMemo)(()=>{if(!l)return c;let M=l.col,Q=l.dir;return[...c].sort((g,Y)=>Nt(g[M],Y[M])*Q)},[c,l]),H=x.length,v=L.length,N=Math.max(1,Math.ceil(v/d));(0,V.useEffect)(()=>{u(M=>Math.min(M,N-1))},[N]);let b=E?L:L.slice(t*d,(t+1)*d),$=Math.floor(i/d),q=P!==null?Math.max(1,Math.ceil(P/d)):null,S=i>0,j=P!==null?i+d<P:b.length>=d,R=Object.values(C).some(M=>M.trim()!=="");return!e||e.columns.length===0?(0,p.jsxs)("div",{children:[(0,p.jsx)("div",{className:"db-empty",children:e?.kind==="change"?e.message??`\u5DF2\u6267\u884C\uFF08\u5F71\u54CD ${e.affectedRows??0} \u884C\uFF09`:e?.message??"\u6267\u884C\u540E\u7ED3\u679C\u663E\u793A\u5728\u8FD9\u91CC\uFF08\u7ED3\u679C\u6700\u591A\u663E\u793A 10000 \u884C\uFF09"}),e?(0,p.jsx)(Ke,{result:e}):null]}):(0,p.jsxs)("div",{className:"db-result",ref:f,children:[(0,p.jsx)(Ke,{result:e}),(0,p.jsx)(Ce,{columns:h,rows:b,active:null,onCellClick:()=>{},interaction:{sort:l,onSort:M=>{let Q=l?.col===M?l.dir:0;m(Q===1?{col:M,dir:-1}:Q===-1?null:{col:M,dir:1})},filters:C,onFilter:(M,Q)=>{w(g=>({...g,[M]:Q}))},filterOpen:y,onFilterOpen:M=>k(M)}}),b.length===0?(0,p.jsx)("div",{className:"db-empty",children:"\uFF08\u6CA1\u6709\u5339\u914D\u7684\u884C\uFF09"}):null,(0,p.jsxs)("div",{className:"db-row",style:{marginTop:6,gap:8},children:[E&&o?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)("button",{disabled:!S||o.busy===!0,onClick:()=>o.onPage(Math.max(0,i-d)),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,p.jsx)("button",{disabled:!j||o.busy===!0,onClick:()=>o.onPage(i+d),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,p.jsxs)("span",{className:"db-muted",children:["\u7B2C ",$+1,q!==null?`/${q}`:""," \u9875 \xB7 ",P!==null?`\u5171 ${P} \u884C`:`\u672C\u9875 ${b.length} \u884C`,R?` \xB7 \u672C\u9875\u8FC7\u6EE4\u540E ${L.length} \u884C`:""]})]}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)("button",{disabled:t<=0,onClick:()=>u(M=>Math.max(0,M-1)),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,p.jsx)("button",{disabled:t>=N-1,onClick:()=>u(M=>Math.min(N-1,M+1)),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,p.jsxs)("span",{className:"db-muted",children:["\u7B2C ",t+1,"/",N," \u9875 \xB7 \u5171 ",v," \u884C",v!==H?`\uFF08\u5DF2\u53D6\u56DE ${H} \u884C\uFF09`:""]})]}),(0,p.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875/\u6700\u591A\u53D6"}),(0,p.jsx)("select",{value:d,title:E?"\u6BCF\u9875\u884C\u6570\uFF1B\u670D\u52A1\u7AEF\u5206\u9875\u65F6\u4FEE\u6539\u540E\u81EA\u52A8\u91CD\u65B0\u6267\u884C":"\u6BCF\u9875\u884C\u6570 = \u672C\u6B21\u6267\u884C\u6700\u591A\u53D6\u56DE\u7684\u884C\u6570\uFF1B\u8C03\u5927\u540E\u8BF7\u91CD\u65B0\u6267\u884C\u4EE5\u53D6\u66F4\u591A\u6570\u636E",onChange:M=>{n(Number(M.target.value)),u(0)},children:[200,500,1e3,5e3].map(M=>(0,p.jsx)("option",{value:M,children:M},M))})]})]})}var r=I("react/jsx-runtime"),Ct={postgresql:"PG",mysql:"MySQL",mongodb:"Mongo",sqlite:"SQLite",dameng:"DM"},St={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"},We={view:"\u89C6\u56FE",collection:"\u96C6\u5408",table:"\u8868"};function Tt({draft:e,onClose:a,onSaved:n,onChanged:o}){let[t,u]=(0,z.useState)({...e}),[d,l]=(0,z.useState)(!1),[m,C]=(0,z.useState)(!1),[w,y]=(0,z.useState)(""),[k,f]=(0,z.useState)(""),h=(()=>{let c=se[t.type],L=t.type!=="sqlite",H=t.type==="mysql"||t.type==="mongodb",v=t.type==="postgresql"||H,N=t.type==="dameng";return{label:c,needsHost:L,needsDatabase:H,supportsDatabase:v,needsSchema:N,needFile:t.type==="sqlite"}})(),x=c=>{u(L=>({...L,...c})),f(""),y("")},E=()=>{let c={id:t.id,name:t.name.trim(),type:t.type,host:t.host?.trim()||void 0,user:t.user?.trim()||void 0,database:t.database?.trim()||void 0,schema:t.schema?.trim()||void 0,file:t.file?.trim()||void 0,authSource:t.authSource?.trim()||void 0,ssl:t.ssl===!0,options:t.options&&Object.keys(t.options).length>0?t.options:void 0};return t.type==="sqlite"&&(delete c.host,delete c.port,delete c.database),t.port!==void 0&&Number.isFinite(Number(t.port))&&(c.port=Number(t.port)),t.dmCompat&&(c.dmCompat=t.dmCompat),c.dmNoEncrypt=t.dmNoEncrypt===!0,t.password!==void 0&&t.password!==""&&(c.password=t.password),c},i=async()=>{l(!0),y(""),f("");try{let c=await F.test(E());f(c.ok?`\u2705 \u8FDE\u63A5\u6210\u529F\uFF08${c.latencyMs}ms\uFF09`:`\u274C ${c.message}`),c.ok||y(c.detail??c.message)}catch(c){y(await J(c))}finally{l(!1)}},P=async()=>{if(!t.name.trim()){y("\u8BF7\u586B\u5199\u8FDE\u63A5\u540D\u79F0");return}if(h.needsHost&&!t.host?.trim()){y("\u8BF7\u586B\u5199\u4E3B\u673A\u5730\u5740");return}if(h.needsDatabase&&!t.database?.trim()){y(`\u8BF7\u586B\u5199 ${se[t.type]} \u7684\u6570\u636E\u5E93\u540D`);return}if(h.needFile&&!t.file?.trim()){y("\u8BF7\u586B\u5199 SQLite \u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84");return}C(!0),y("");try{let{connection:c}=await F.save(E());f("\u5DF2\u4FDD\u5B58"),o(),n(c)}catch(c){y(await J(c))}finally{C(!1)}};return(0,r.jsxs)("div",{className:"db-card db-nav-editor",style:{margin:"6px 0"},children:[(0,r.jsxs)("div",{className:"db-card-title",style:{textTransform:"none",letterSpacing:0},children:[(0,r.jsxs)("span",{children:["\u270F\uFE0F ",e.isNew?"\u65B0\u5EFA\u8FDE\u63A5":`\u7F16\u8F91\uFF1A${t.name}`]}),(0,r.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u6536\u8D77"})]}),(0,r.jsxs)("div",{className:"db-grid",children:[(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"\u540D\u79F0 *"}),(0,r.jsx)("input",{value:t.name??"",onChange:c=>x({name:c.target.value}),placeholder:"\u4F8B\u5982\uFF1A\u751F\u4EA7\u5E93-PG"})]}),(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"\u7C7B\u578B"}),(0,r.jsx)("select",{value:t.type,onChange:c=>x({type:c.target.value}),children:["postgresql","mysql","mongodb","sqlite","dameng"].map(c=>(0,r.jsx)("option",{value:c,children:se[c]},c))})]}),h.needsHost&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"\u4E3B\u673A"}),(0,r.jsx)("input",{value:t.host??"",onChange:c=>x({host:c.target.value}),placeholder:h.label==="MongoDB"?"127.0.0.1 \u6216 mongodb://\u2026":"127.0.0.1"})]}),(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"\u7AEF\u53E3"}),(0,r.jsx)("input",{type:"number",value:t.port??_e(t.type)??"",onChange:c=>x({port:c.target.value===""?void 0:Number(c.target.value)})})]})]}),(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"\u7528\u6237\u540D"}),(0,r.jsx)("input",{value:t.user??"",onChange:c=>x({user:c.target.value}),autoComplete:"off"})]}),(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsxs)("label",{children:["\u5BC6\u7801 ",e.isNew||!e.hasPassword?"":(0,r.jsx)("span",{className:"db-muted",children:"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u7559\u7A7A\u5373\u7528\u5DF2\u5B58\u5BC6\u7801\uFF09"})]}),(0,r.jsx)("input",{type:"password",value:t.password??"",onChange:c=>x({password:c.target.value}),autoComplete:"new-password",placeholder:e.isNew?"\u65B0\u5EFA\u8FDE\u63A5\u65F6\u586B\u5199":"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u8F93\u5165\u53EF\u8986\u76D6\uFF09"})]}),h.needFile&&(0,r.jsxs)("div",{className:"db-field",style:{gridColumn:"1 / -1"},children:[(0,r.jsx)("label",{children:"\u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84 *"}),(0,r.jsx)("input",{value:t.file??"",onChange:c=>x({file:c.target.value}),placeholder:"C:\\\\data\\\\app.db \u6216 \u76F8\u5BF9\u8DEF\u5F84"})]}),h.supportsDatabase&&(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsxs)("label",{children:["\u9ED8\u8BA4\u6570\u636E\u5E93",h.needsDatabase?" *":"",t.type==="mongodb"?"\uFF08database\uFF09":""]}),(0,r.jsx)("input",{value:t.database??"",onChange:c=>x({database:c.target.value}),placeholder:t.type==="postgresql"?"\u53EF\u9009\uFF0C\u7559\u7A7A\u4F7F\u7528 PG \u9ED8\u8BA4\u5E93":void 0})]}),h.needsSchema&&(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"schema\uFF08\u9ED8\u8BA4\u6A21\u5F0F\uFF0C\u53EF\u9009\uFF09"}),(0,r.jsx)("input",{value:t.schema??"",onChange:c=>x({schema:c.target.value}),placeholder:"\u7559\u7A7A\u4F7F\u7528\u767B\u5F55\u7528\u6237"})]}),t.type==="dameng"&&(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"\u517C\u5BB9\u6A21\u5F0F"}),(0,r.jsxs)("select",{value:t.dmCompat??"oracle",onChange:c=>x({dmCompat:c.target.value}),children:[(0,r.jsx)("option",{value:"oracle",children:"Oracle \u6A21\u5F0F\uFF08\u9ED8\u8BA4\uFF09"}),(0,r.jsx)("option",{value:"mysql",children:"MySQL \u517C\u5BB9\u6A21\u5F0F"})]})]}),t.type==="dameng"&&(0,r.jsxs)("label",{className:"db-field",style:{flexDirection:"row",gap:8,alignItems:"center",cursor:"pointer"},children:[(0,r.jsx)("input",{type:"checkbox",checked:t.dmNoEncrypt===!0,onChange:c=>x({dmNoEncrypt:c.target.checked})}),(0,r.jsx)("span",{children:"\u517C\u5BB9 OpenSSL3\uFF1A\u5173\u95ED\u767B\u5F55/\u6D88\u606F\u52A0\u5BC6"})]}),t.type==="mongodb"&&(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"authSource\uFF08\u53EF\u9009\uFF09"}),(0,r.jsx)("input",{value:t.authSource??"",onChange:c=>x({authSource:c.target.value}),placeholder:"admin"})]}),(h.needsHost||h.needFile)&&(0,r.jsxs)("div",{className:"db-field",children:[(0,r.jsx)("label",{children:"SSL/TLS"}),(0,r.jsxs)("select",{value:t.ssl===!0?"yes":"no",onChange:c=>x({ssl:c.target.value==="yes"}),children:[(0,r.jsx)("option",{value:"no",children:"\u5173\u95ED"}),(0,r.jsx)("option",{value:"yes",children:"\u542F\u7528"})]})]})]}),(0,r.jsx)(X,{kind:"error",text:w}),k?(0,r.jsx)(X,{kind:k.startsWith("\u2705")?"ok":"info",text:k}):null,(0,r.jsxs)("div",{className:"db-row",style:{marginTop:8},children:[(0,r.jsx)("button",{className:"db-btn-primary",onClick:P,disabled:m,children:m?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58\u8FDE\u63A5"}),(0,r.jsx)("button",{onClick:i,disabled:d,children:d?"\u6D4B\u8BD5\u4E2D\u2026":"\u6D4B\u8BD5\u8FDE\u63A5"}),(0,r.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u53D6\u6D88"})]})]})}function Et({connection:e,callbacks:a}){let n=le(e.type),o=e.type==="postgresql"||e.type==="mysql",[t,u]=(0,z.useState)(""),[d,l]=(0,z.useState)(),[m,C]=(0,z.useState)([]),[w,y]=(0,z.useState)([]),[k,f]=(0,z.useState)([]),[h,x]=(0,z.useState)(""),[E,i]=(0,z.useState)(""),P=(0,z.useRef)(0),c=b=>P.current===b,L=async(b,$,q)=>{if(c(b)){x("\u52A0\u8F7D\u8868\u2026");try{let{tables:S}=await F.tables(e.id,q,$||void 0);if(!c(b))return;f(S)}catch(S){c(b)&&i(await J(S))}finally{c(b)&&x("")}}};(0,z.useEffect)(()=>{let b=++P.current;return x("\u52A0\u8F7D\u5BF9\u8C61\u2026"),i(""),(async()=>{try{let[$,q]=await Promise.all([o?F.databases(e.id):Promise.resolve(null),n?F.schemas(e.id,void 0):Promise.resolve(null)]);if(!c(b))return;$?.supported&&C($.databases);let S;q&&(y(q.schemas),S=q.schemas.find(j=>j.name==="public")?.name??q.schemas.find(j=>j.name===e.schema)?.name??q.schemas[0]?.name,l(S)),await L(b,"",S)}catch($){c(b)&&i(await J($))}finally{c(b)&&x("")}})(),()=>{P.current+=1}},[e.id]);let H=async b=>{let $=++P.current;u(b),f([]),y([]),l(void 0),i("");try{if(n){x("\u52A0\u8F7D\u6A21\u5F0F\u2026");let q=await F.schemas(e.id,b||void 0);if(!c($))return;y(q.schemas);let S=q.schemas.find(j=>j.name==="public")?.name??q.schemas.find(j=>j.name===e.schema)?.name??q.schemas[0]?.name;l(S),await L($,b,S)}else await L($,b)}catch(q){c($)&&i(await J(q))}finally{c($)&&x("")}},v=async b=>{let $=++P.current;l(b||void 0),f([]),i(""),await L($,t,b||void 0)},N=b=>{a.onOpenBrowse(e,{table:b,...t?{database:t}:{},...d&&n?{schema:d}:{}})};return(0,r.jsxs)("div",{className:"db-tree",children:[o&&(0,r.jsxs)("div",{className:"db-tree-row",children:[(0,r.jsx)("span",{className:"db-muted",children:"\u6570\u636E\u5E93"}),(0,r.jsxs)("select",{value:t,onChange:b=>void H(b.target.value),title:"\u5207\u6362\u540E\u91CD\u65B0\u52A0\u8F7D\u8BE5\u5E93\u4E0B\u7684\u5BF9\u8C61",children:[(0,r.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u8FDE\u63A5\u9ED8\u8BA4\u5E93","\uFF09"]}),m.map(b=>(0,r.jsx)("option",{value:b,children:b},b))]})]}),n&&w.length>0&&(0,r.jsxs)("div",{className:"db-tree-row",children:[(0,r.jsx)("span",{className:"db-muted",children:"schema"}),(0,r.jsx)("select",{value:d??"",onChange:b=>void v(b.target.value),title:"\u5207\u6362\u6A21\u5F0F\u5E76\u52A0\u8F7D\u5176\u5BF9\u8C61",children:w.map(b=>(0,r.jsx)("option",{value:b.name,children:b.name},b.name))})]}),E?(0,r.jsx)(X,{kind:"error",text:E}):null,h?(0,r.jsx)("div",{className:"db-muted db-tree-hint",children:h}):null,!h&&k.length===0&&!E?(0,r.jsx)("div",{className:"db-muted db-tree-hint",children:"\uFF08\u8BE5\u5E93/\u6A21\u5F0F\u4E0B\u6CA1\u6709\u8868\u6216\u89C6\u56FE\uFF09"}):null,(0,r.jsx)("div",{className:"db-tree-tables",children:k.map(b=>(0,r.jsxs)("button",{className:"db-tree-table",title:`${We[b.kind]??b.kind}\u300C${b.name}\u300D\u2014\u2014\u70B9\u51FB\u5728\u53F3\u4FA7\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF08\u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\uFF09`,onClick:()=>N(b),children:[(0,r.jsx)("span",{children:St[b.kind]??"\u{1F5C2}"}),(0,r.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:b.name}),(0,r.jsx)("span",{className:"db-badge",children:We[b.kind]??b.kind})]},`${b.name}-${b.kind}`))}),(0,r.jsx)("div",{className:"db-tree-actions",style:{gap:6},children:(0,r.jsx)("span",{className:"db-muted db-grow",style:{fontSize:11},children:"\u70B9\u51FB\u8868/\u89C6\u56FE/\u96C6\u5408\u5728\u53F3\u4FA7\u6253\u5F00\u5176\u5DE5\u4F5C\u533A"})}),(0,r.jsxs)("div",{className:"db-tree-actions",style:{borderTop:"1px solid var(--db-border)",paddingTop:6,marginTop:4},children:[(0,r.jsx)("button",{onClick:()=>a.onEdit(e),children:"\u270F\uFE0F \u7F16\u8F91"}),(0,r.jsx)("button",{className:"db-btn-danger",onClick:()=>void a.onDelete(e),children:"\u5220\u9664"}),(0,r.jsx)("span",{className:"db-grow"}),(0,r.jsx)("button",{className:"db-btn-ghost",title:"\u6536\u8D77\u8BE5\u8FDE\u63A5\u7684\u5BF9\u8C61\u6811",onClick:()=>a.onCollapse(),children:"\u6536\u8D77 \u25B4"})]})]})}function Je(e){let{connections:a,busyList:n,refresh:o,focusId:t}=e,[u,d]=(0,z.useState)(null),[l,m]=(0,z.useState)(null),[C,w]=(0,z.useState)(""),y=(0,z.useRef)(!1),[k,f]=(0,z.useState)(null);(0,z.useEffect)(()=>{y.current||!t||a.some(i=>i.id===t)&&(y.current=!0,d(t),e.onFocused?.(t))},[a,t]),(0,z.useEffect)(()=>{k&&a.some(i=>i.id===k)&&(d(k),e.onFocused?.(k),f(null))},[a,k]);let h=i=>{w(""),u===i.id?d(null):(d(i.id),e.onFocused?.(i.id))},x=i=>{w(""),m(i?{id:i.id,name:i.name,type:i.type,host:i.host,port:i.port,user:i.user,database:i.database,schema:i.schema,ssl:i.ssl,file:i.file,authSource:i.authSource,dmCompat:i.dmCompat,dmNoEncrypt:i.dmNoEncrypt,options:i.options,hasPassword:i.hasPassword,open:!0,isNew:!1}:{name:"",type:"postgresql",open:!0,isNew:!0})},E=async i=>{if(window.confirm(`\u786E\u5B9A\u5220\u9664\u8FDE\u63A5\u300C${i.name}\u300D\u5417\uFF1F`)){w("");try{(await F.remove(i.id)).ok||w(`\u5220\u9664\u5931\u8D25\uFF1A\u672A\u627E\u5230\u8FDE\u63A5 ${i.id}\uFF08\u53EF\u80FD\u5DF2\u88AB\u5176\u5B83\u9875\u9762\u5220\u9664\uFF09`),u===i.id&&d(null),await o()}catch(P){w(await J(P))}}};return(0,r.jsxs)("div",{className:"db-nav",children:[(0,r.jsxs)("div",{className:"db-nav-head",children:[(0,r.jsxs)("span",{className:"db-nav-title",children:["\u{1F50C} \u8FDE\u63A5\u7BA1\u7406",a.length>0?`\uFF08${a.length}\uFF09`:""]}),(0,r.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,r.jsx)("button",{title:"\u5237\u65B0\u8FDE\u63A5\u5217\u8868",onClick:()=>void o(),disabled:n,children:n?"\u2026":"\u21BB"}),(0,r.jsx)("button",{className:"db-btn-primary",title:"\u65B0\u5EFA\u8FDE\u63A5",onClick:()=>x(null),children:"\uFF0B \u65B0\u5EFA"})]})]}),(0,r.jsx)(X,{kind:"error",text:C}),l&&l.open&&(0,r.jsx)(Tt,{draft:l,onClose:()=>m(null),onSaved:i=>{f(i.id),o(),m(null)},onChanged:()=>void o()}),a.length===0?(0,r.jsx)("div",{className:"db-empty",children:"\u8FD8\u6CA1\u6709\u8FDE\u63A5\u3002\u70B9\u51FB\u300C\uFF0B \u65B0\u5EFA\u300D\u6DFB\u52A0 PostgreSQL / MySQL / MongoDB / SQLite / \u8FBE\u68A6 \u8FDE\u63A5\u3002"}):(0,r.jsx)("div",{className:"db-nav-list",children:a.map(i=>(0,r.jsxs)(z.Fragment,{children:[(0,r.jsxs)("div",{className:`db-conn-row${u===i.id?" db-conn-active":""}`,onClick:()=>h(i),title:`${i.name} \xB7 ${se[i.type]}${i.lastError?` \xB7 \u4E0A\u6B21\u6D4B\u8BD5\u5931\u8D25\uFF1A${i.lastError}`:""} \u2014\u2014 \u70B9\u51FB\u5C55\u5F00\u5BF9\u8C61\u6811`,children:[(0,r.jsx)("span",{className:"db-conn-caret",children:u===i.id?"\u25BE":"\u25B8"}),(0,r.jsx)("span",{className:"db-grow db-conn-name",children:i.name}),(0,r.jsx)("span",{className:"db-badge db-badge-type",children:Ct[i.type]??i.type}),i.lastError?(0,r.jsx)("span",{className:"db-dot db-dot-bad",title:`\u4E0A\u6B21\u6D4B\u8BD5\u5931\u8D25\uFF1A${i.lastError}`}):i.lastTestedAt?(0,r.jsx)("span",{className:"db-dot db-dot-ok",title:`\u4E0A\u6B21\u6D4B\u8BD5\u901A\u8FC7\uFF1A${i.lastTestedAt}`}):null]}),u===i.id&&(0,r.jsxs)("div",{className:"db-tree-host",children:[(0,r.jsx)("div",{className:"db-muted db-tree-hint",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:i.type==="sqlite"?(0,r.jsx)("span",{className:"db-chip",children:i.file}):(0,r.jsxs)("span",{children:[i.host??"",i.port?`:${i.port}`:"",i.user?` \xB7 ${i.user}`:"",i.database?` \xB7 \u5E93:${i.database}`:""]})}),(0,r.jsx)(Et,{connection:i,callbacks:{onOpenBrowse:e.onOpenBrowse,onEdit:x,onDelete:P=>void E(P),onCollapse:()=>d(null)}})]})]},i.id))})]})}var T=I("react");var Z=I("react"),W=I("react/jsx-runtime"),Re=50,Ye="dsh-database-console.history.v1",ue=2e4;function Rt(){return`h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}function Te(e){return typeof e=="string"&&e.trim()!==""?e:null}function Ee(){try{let e=window.localStorage.getItem(Ye);if(!e)return{};let a=JSON.parse(e);if(!a||typeof a!="object"||Array.isArray(a))return{};let n={};for(let[o,t]of Object.entries(a)){if(!o||!Array.isArray(t))continue;let u=[];for(let d of t){if(!d||typeof d!="object")continue;let l=d,m=Te(l.id),C=Te(l.text),w=l.kind==="sql"||l.kind==="nl"?l.kind:null;if(!m||!C||!w)continue;let y=Te(l.sql);if(u.push({id:m,kind:w,text:C.slice(0,ue),...y?{sql:y.slice(0,ue)}:{},database:typeof l.database=="string"?l.database:"",time:typeof l.time=="number"&&Number.isFinite(l.time)?l.time:0}),u.length>=Re)break}u.length>0&&(n[o]=u)}return n}catch{return{}}}function Dt(e){try{window.localStorage.setItem(Ye,JSON.stringify(e))}catch{}}function De(e){let[a,n]=(0,Z.useState)(()=>Ee()[e]??[]);(0,Z.useEffect)(()=>{n(Ee()[e]??[])},[e]);let o=(0,Z.useCallback)(l=>{let m=Ee();l.length>0?m[e]=l:delete m[e],Dt(m)},[e]),t=(0,Z.useCallback)(l=>{let m=l.text.trim().slice(0,ue);if(!m)return;let C=l.database??"",w=a.findIndex(f=>f.kind===l.kind&&f.text===m&&f.database===C),k=[{id:w>=0?a[w].id:Rt(),kind:l.kind,text:m,...l.sql&&l.sql.trim()!==""?{sql:l.sql.trim().slice(0,ue)}:{},database:C,time:Date.now()},...a.filter((f,h)=>h!==w)].slice(0,Re);n(k),o(k)},[a,o]),u=(0,Z.useCallback)(l=>{let m=a.filter(C=>C.id!==l);n(m),o(m)},[a,o]),d=(0,Z.useCallback)(()=>{n([]),o([])},[o]);return{entries:a,record:t,remove:u,clear:d}}function Lt(e){if(!e)return"";let a=new Date(e),n=l=>String(l).padStart(2,"0"),o=`${n(a.getHours())}:${n(a.getMinutes())}`,t=new Date;if(a.getFullYear()===t.getFullYear()&&a.getMonth()===t.getMonth()&&a.getDate()===t.getDate())return o;let d=`${n(a.getMonth()+1)}-${n(a.getDate())}`;return a.getFullYear()===t.getFullYear()?`${d} ${o}`:`${a.getFullYear()}-${d} ${o}`}var Pt={sql:"SQL",nl:"NL"};function Le({entries:e,onLoad:a,onDelete:n,onClear:o}){let[t,u]=(0,Z.useState)(!1);return e.length===0?null:(0,W.jsxs)("div",{className:"db-history",children:[(0,W.jsxs)("button",{type:"button",className:"db-history-toggle",onClick:()=>u(d=>!d),"aria-expanded":t,title:"\u6700\u8FD1\u6267\u884C\u8FC7\u7684 SQL / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF08\u70B9\u51FB\u6761\u76EE\u8F7D\u5165\uFF09",children:[(0,W.jsxs)("span",{children:[t?"\u25BE":"\u25B8"," \u{1F558} \u67E5\u8BE2\u5386\u53F2\uFF08",e.length,"/",Re,"\uFF09"]}),(0,W.jsx)("span",{className:"db-muted",children:t?"\u70B9\u51FB\u6761\u76EE\u8F7D\u5165":""})]}),t&&(0,W.jsxs)("div",{className:"db-history-list",children:[e.map(d=>(0,W.jsxs)("div",{className:"db-history-item",role:"button",tabIndex:0,onClick:()=>a(d),onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),a(d))},children:[(0,W.jsx)("span",{className:d.kind==="sql"?"db-badge db-badge-type":"db-badge",style:{flex:"0 0 auto"},title:d.kind==="sql"?"SQL \u67E5\u8BE2":"\u81EA\u7136\u8BED\u8A00\u67E5\u8BE2",children:Pt[d.kind]}),(0,W.jsx)("span",{className:"db-history-text",title:d.sql?`${d.text}
\u2192 ${d.sql}`:d.text,children:d.text}),(0,W.jsx)("span",{className:"db-history-time",children:Lt(d.time)}),(0,W.jsx)("button",{type:"button",className:"db-history-del",title:"\u5220\u9664\u8BE5\u6761",onClick:l=>{l.stopPropagation(),n(d.id)},children:"\xD7"})]},d.id)),(0,W.jsxs)("div",{className:"db-history-foot",children:[(0,W.jsx)("span",{children:"\u70B9\u51FB\u6761\u76EE\u8F7D\u5165\u5230\u8F93\u5165\u6846 \xB7 \u76F8\u540C\u5185\u5BB9\u81EA\u52A8\u53BB\u91CD\u7F6E\u9876"}),(0,W.jsx)("div",{className:"db-grow"}),(0,W.jsx)("button",{type:"button",onClick:o,children:"\u6E05\u7A7A\u5386\u53F2"})]})]})]})}var s=I("react/jsx-runtime");function qt(e,a,n){let o={};e&&n[e.col]&&(o.sort={column:n[e.col]??"",dir:e.dir===1?"asc":"desc"});let t={};for(let[u,d]of Object.entries(a)){let l=n[Number(u)],m=String(d??"").trim();!l||!m||(t[l]=m)}return Object.keys(t).length>0&&(o.filters=t),Object.keys(o).length>0?o:null}function Mt({connection:e,target:a}){let{table:n,database:o,schema:t}=a,u=le(e.type),[d,l]=(0,T.useState)([]),[m,C]=(0,T.useState)(null),[w,y]=(0,T.useState)(0),[k,f]=(0,T.useState)(200),[h,x]=(0,T.useState)(""),[E,i]=(0,T.useState)(""),[P,c]=(0,T.useState)(!1),[L,H]=(0,T.useState)(null),[v,N]=(0,T.useState)(null),[b,$]=(0,T.useState)(null),[q,S]=(0,T.useState)({}),[j,R]=(0,T.useState)(null),B=(0,T.useRef)(void 0),M=(0,T.useRef)(null);(0,T.useEffect)(()=>{let D=M.current?.querySelector(":scope > .db-gridx-body");D&&(D.scrollTop=0)},[m]),(0,T.useEffect)(()=>{let D=!1;return x(`\u8BFB\u53D6\u300C${n.name}\u300D\u2026`),i(""),H(null),N(null),$(null),S({}),R(null),B.current!==void 0&&(window.clearTimeout(B.current),B.current=void 0),Promise.all([F.columns(e.id,n.name,t,o),F.rows(e.id,n.name,t,k,0,o)]).then(([A,te])=>{D||(l(A.columns),C(te))}).catch(async A=>{D||i(await J(A))}).finally(()=>{D||x("")}),()=>{D=!0}},[e.id,n.name,t,o]);let Q=async(D,A,te)=>{B.current!==void 0&&(window.clearTimeout(B.current),B.current=void 0),x("\u67E5\u8BE2\u4E2D\u2026"),i(""),H(null),N(null);try{let xe=m?.columns??[],dt=A===null?null:A?.sort!==void 0?A.sort:b,lt=A===null?{}:A?.filters!==void 0?A.filters:q,ct=qt(dt,lt,xe),bt=await F.rows(e.id,n.name,t,te??k,Math.max(0,D),o,ct);C(bt),y(Math.max(0,D))}catch(xe){i(await J(xe))}finally{x("")}},g=D=>{let A=b?.col===D?b.dir:0,te=A===1?{col:D,dir:-1}:A===-1?null:{col:D,dir:1};$(te),R(null),Q(0,{sort:te,filters:q})},Y=(D,A)=>{let te={...q,[D]:A};S(te),B.current!==void 0&&window.clearTimeout(B.current),B.current=window.setTimeout(()=>{Q(0,{sort:b,filters:te})},350)},ee=()=>{$(null),S({}),R(null),Q(0,null)},he=m?.columns??[],ve=m?.rows??[],it=b!==null||Object.values(q).some(D=>D.trim()!==""),Me=L&&m&&L.row<m.rows.length?m.rows[L.row]??null:null;return(0,s.jsxs)("div",{className:"db-pane-stack",children:[(0,s.jsxs)("div",{className:"db-card",style:{padding:0},children:[(0,s.jsxs)("button",{className:"db-card-title db-structure-toggle",onClick:()=>c(D=>!D),title:P?"\u70B9\u51FB\u6298\u53E0":"\u70B9\u51FB\u5C55\u5F00",style:{width:"100%",cursor:"pointer",border:0,background:"none",textAlign:"left"},children:[(0,s.jsxs)("span",{children:[P?"\u25BE":"\u25B8"," \u{1F9EC} \u5B57\u6BB5\u7ED3\u6784\uFF08",d.length," \u4E2A\u5B57\u6BB5\uFF09"]}),h?(0,s.jsx)("span",{className:"db-muted",children:h}):d.length===0?(0,s.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6\u5931\u8D25\u6216\u65E0\u5B57\u6BB5\uFF09"}):null]}),P&&(0,s.jsx)("div",{style:{padding:"2px 8px 6px",borderTop:"1px solid var(--db-border, rgba(128,128,128,.25))"},children:d.length===0?(0,s.jsx)("div",{className:"db-empty",children:E?"\uFF08\u8BFB\u53D6\u5931\u8D25\uFF09":"\uFF08\u65E0\u5B57\u6BB5\uFF09"}):(0,s.jsx)("div",{className:"db-list",children:d.map(D=>(0,s.jsxs)("div",{className:"db-list-item",style:{cursor:"default"},children:[(0,s.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--db-mono)"},children:D.name}),(0,s.jsx)("span",{className:"db-badge db-badge-type",style:{maxWidth:"45%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:D.type}),D.primary?(0,s.jsx)("span",{className:"db-badge",children:"PK"}):null,D.nullable===!1?(0,s.jsx)("span",{className:"db-badge",children:"NOT NULL"}):null]},D.name))})})]}),(0,s.jsxs)("div",{className:"db-card db-card-fill",style:{padding:0},children:[(0,s.jsxs)("div",{className:"db-card-title",style:{padding:"8px 8px 0"},children:[(0,s.jsx)("span",{children:"\u{1F50D} \u6570\u636E\u9884\u89C8"}),m?(0,s.jsx)("span",{className:"db-muted",children:m.total!==void 0?`\u5171 ${m.total} \u884C \xB7 \u672C\u9875 ${m.rowCount}`:`${m.rowCount} \u884C \xB7 \u504F\u79FB ${w}`}):null]}),(0,s.jsxs)("div",{style:{padding:"0 6px",flex:"1 1 auto",minHeight:0,display:"flex",flexDirection:"column"},children:[(0,s.jsx)(X,{kind:"error",text:E}),v&&(0,s.jsx)(X,{kind:v.kind==="ok"?"ok":"error",text:v.text}),h&&(0,s.jsx)("div",{className:"db-muted",style:{padding:"6px 0"},children:h}),it?(0,s.jsxs)("div",{className:"db-row",style:{margin:"2px 0 6px",gap:8},children:[(0,s.jsxs)("span",{className:"db-ok",children:["\u5DF2\u542F\u7528\u6574\u8868",Object.values(q).some(D=>D.trim()!=="")?"\u8FC7\u6EE4":"",b?"\u6392\u5E8F":""]}),(0,s.jsx)("button",{onClick:ee,children:"\u6E05\u9664\u6392\u5E8F / \u8FC7\u6EE4"}),(0,s.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u6392\u5E8F/\u8FC7\u6EE4\u7531\u6570\u636E\u5E93\u6267\u884C\uFF0C\u7FFB\u9875\u7EE7\u7EED\u751F\u6548"})]}):null,(0,s.jsxs)("div",{style:{display:"flex",alignItems:"stretch",flex:"1 1 auto",minHeight:0},children:[(0,s.jsxs)("div",{className:"db-gridx",ref:M,children:[m?ve.length===0?(0,s.jsx)("div",{className:"db-empty",style:{padding:14},children:m.message??"\uFF08\u65E0\u6570\u636E\uFF09"}):(0,s.jsx)(Ce,{columns:he,rows:ve,active:L,onCellClick:(D,A)=>{H({row:D,col:A}),N(null)},interaction:e.type==="mongodb"?void 0:{sort:b,onSort:g,filters:q,onFilter:Y,filterOpen:j,onFilterOpen:D=>R(D)}}):(0,s.jsx)("div",{className:"db-empty",style:{padding:14},children:h||"\u52A0\u8F7D\u4E2D\u2026"}),(0,s.jsxs)("div",{className:"db-muted",style:{padding:"4px 2px",fontSize:12},children:["\u70B9\u51FB\u4EFB\u610F\u5355\u5143\u683C\u53EF\u5728\u53F3\u4FA7\u67E5\u770B / \u7F16\u8F91\uFF1B\u62D6\u52A8\u8868\u5934\u5206\u9694\u7EBF\u53EF\u8C03\u5217\u5BBD\uFF1B",e.type!=="mongodb"?"\u70B9\u51FB\u5217\u540D\u6392\u5E8F\u3001\u26B2 \u8FC7\u6EE4\uFF08\u4F5C\u7528\u4E8E\u6574\u8868\uFF09":""]})]}),L&&Me&&m&&(0,s.jsx)(Ge,{connection:e,table:n,schema:t,database:o,tableName:n.name,queryColumns:he,metaColumns:d,row:Me,colIndex:L.col,onClose:()=>H(null),onSaved:()=>{Q(w)},onMessage:(D,A)=>N({text:D,kind:A})},`${L.row}-${L.col}`)]}),m&&m.kind==="select"&&(0,s.jsxs)("div",{className:"db-row",style:{marginTop:8,gap:8,paddingBottom:10},children:[(0,s.jsx)("button",{disabled:w<=0,onClick:()=>Q(w-k),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,s.jsx)("button",{disabled:m.total!==void 0?w+k>=m.total:ve.length<k,onClick:()=>Q(w+k),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,s.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875"}),(0,s.jsx)("select",{value:k,onChange:D=>{let A=Number(D.target.value);f(A),Q(0,void 0,A)},children:[50,200,500,1e3,5e3].map(D=>(0,s.jsx)("option",{value:D,children:D},D))})]})]})]})]})}function Ue(e){let[a,n]=(0,T.useState)([]),o=e.type==="postgresql"||e.type==="mysql";return(0,T.useEffect)(()=>{let t=!1;if(n([]),!!o)return F.databases(e.id).then(u=>{!t&&u.supported&&n(u.databases)}).catch(()=>{}),()=>{t=!0}},[e.id,o]),{switchable:o,databases:a}}function $t({connection:e,initialDatabase:a}){let[n,o]=(0,T.useState)(""),[t,u]=(0,T.useState)(!0),[d,l]=(0,T.useState)(null),[m,C]=(0,T.useState)(!1),[w,y]=(0,T.useState)(""),[k,f]=(0,T.useState)(a??""),[h,x]=(0,T.useState)(200),{switchable:E,databases:i}=Ue(e),{entries:P,record:c,remove:L,clear:H}=De(e.id),[v,N]=(0,T.useState)(""),b=async(S,j=0)=>{let R=(S??n).trim();if(!R){y("\u8BF7\u8F93\u5165 SQL");return}C(!0),y("");try{let B=await F.query(e.id,R,t,h,k||void 0,j);l(B),N(R),c({kind:"sql",text:R,database:k})}catch(B){y(await J(B)),l(null)}finally{C(!1)}},$=S=>{b(v||n,S)},q=S=>{o(S.kind==="nl"?S.sql??S.text:S.text),f(S.database)};return(0,s.jsxs)("div",{className:"db-card db-card-fill",children:[(0,s.jsxs)("div",{className:"db-card-title",children:[(0,s.jsxs)("span",{children:["\u2328\uFE0F SQL \u67E5\u8BE2",e.type==="mongodb"?"":`\uFF1A${e.name}`]}),E&&(0,s.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,s.jsx)("span",{className:"db-muted",children:"\u76EE\u6807\u5E93"}),(0,s.jsxs)("select",{value:k,onChange:S=>f(S.target.value),title:"\u8BE5\u5B50\u9875\u7684\u76EE\u6807\u6570\u636E\u5E93\uFF08\u9ED8\u8BA4=\u8FDE\u63A5\u9ED8\u8BA4\u5E93\uFF09",children:[(0,s.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),i.map(S=>(0,s.jsx)("option",{value:S,children:S},S))]})]}),(0,s.jsx)("span",{className:"db-muted",children:e.type==="mongodb"?"\u63D0\u793A\uFF1A\u8FD9\u91CC\u4E5F\u63A5\u53D7 JSON \u67E5\u8BE2\uFF08\u5E26 collection \u5B57\u6BB5\uFF09":"\u63D0\u793A\uFF1A\u591A\u6761\u8BED\u53E5\u4EC5\u5728\u975E\u53EA\u8BFB\u65F6\u5141\u8BB8"})]}),(0,s.jsx)(Le,{entries:P,onLoad:q,onDelete:L,onClear:H}),(0,s.jsx)("textarea",{className:"db-code",value:n,onChange:S=>o(S.target.value),placeholder:e.type==="mongodb"?'{"collection":"users","filter":{"age":{"$gt":18}},"limit":50}':`SELECT * FROM \u8868\u540D LIMIT 100;
-- \u53EA\u8BFB\u6A21\u5F0F\u9ED8\u8BA4\u5F00\u542F`,spellCheck:!1}),(0,s.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,s.jsxs)("label",{className:"db-row",style:{cursor:"pointer",gap:6},children:[(0,s.jsx)("input",{type:"checkbox",checked:t,onChange:S=>u(S.target.checked)})," \u53EA\u8BFB\u6A21\u5F0F\uFF08\u63A8\u8350\uFF09"]}),(0,s.jsx)("div",{className:"db-grow"}),(0,s.jsx)("button",{className:"db-btn-primary",onClick:()=>b(),disabled:m,children:m?"\u6267\u884C\u4E2D\u2026":"\u6267\u884C (Ctrl+Enter)"})]}),(0,s.jsx)(X,{kind:"error",text:w}),(0,s.jsx)(Se,{result:d,limit:h,onLimitChange:S=>{x(S),d?.offset!==void 0&&v&&b(v,0)},paging:{onPage:$,busy:m}})]})}function Ot({connection:e,initialDatabase:a}){let[n,o]=(0,T.useState)(""),[t,u]=(0,T.useState)(null),[d,l]=(0,T.useState)(null),[m,C]=(0,T.useState)(""),[w,y]=(0,T.useState)(""),[k,f]=(0,T.useState)(""),[h,x]=(0,T.useState)(200),[E,i]=(0,T.useState)(null),[P,c]=(0,T.useState)(-1),[L,H]=(0,T.useState)(a??""),{switchable:v,databases:N}=Ue(e),{entries:b,record:$,remove:q,clear:S}=De(e.id),j=(0,T.useMemo)(()=>(E?.providers??[]).flatMap(g=>{let Y=g.label&&g.label.length>0?`${g.label}\uFF08${g.provider}\uFF09`:g.provider;return g.models.length===0?[{provider:g.provider,label:`${Y} \xB7 \u9ED8\u8BA4\u6A21\u578B`}]:g.models.map(ee=>({provider:g.provider,model:ee.id,label:`${Y} / ${ee.label&&ee.label.length>0?ee.label:ee.id}`}))}),[E]),R=()=>{let g=P>=0?j[P]:void 0;if(g)return{...g.provider?{provider:g.provider}:{},...g.model?{model:g.model}:{}}};(0,T.useEffect)(()=>{let g=!1;return F.aiModels().then(Y=>{g||i(Y)}).catch(()=>{g||i(null)}),()=>{g=!0}},[]);let B=async()=>{if(!n.trim()){f("\u8BF7\u8F93\u5165\u8981\u67E5\u8BE2\u7684\u95EE\u9898");return}y("AI \u751F\u6210 SQL \u4E2D\u2026"),f("");try{let g=await F.aiGenerate(e.id,n,R(),L||void 0);u(g),C(g.sql),l(null),$({kind:"nl",text:n,sql:g.sql,database:L})}catch(g){f(await J(g))}finally{y("")}},M=async()=>{if(!m.trim()&&!n.trim()){f("\u6CA1\u6709\u53EF\u6267\u884C\u7684 SQL\uFF0C\u8BF7\u5148\u751F\u6210\u6216\u586B\u5199");return}y("\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"),f("");try{let g=await F.aiRun(e.id,n||m,R(),h,L||void 0);l(g),u({sql:g.sql,engine:g.engine,provider:g.provider,model:g.model,note:g.note}),C(g.sql),n.trim()?$({kind:"nl",text:n,sql:g.sql,database:L}):$({kind:"sql",text:g.sql,database:L})}catch(g){f(await J(g))}finally{y("")}},Q=g=>{H(g.database),l(null),g.kind==="nl"?(o(g.text),g.sql?(u({sql:g.sql,engine:"history"}),C(g.sql)):(u(null),C(""))):(C(g.text),u({sql:g.text,engine:"history"}))};return(0,s.jsxs)("div",{className:"db-card db-card-fill",children:[(0,s.jsxs)("div",{className:"db-card-title",children:[(0,s.jsxs)("span",{children:["\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF1A",e.name]}),v&&(0,s.jsxs)("span",{className:"db-row",style:{gap:6},children:[(0,s.jsx)("span",{className:"db-muted",children:"\u76EE\u6807\u5E93"}),(0,s.jsxs)("select",{value:L,onChange:g=>H(g.target.value),title:"\u8BE5\u5B50\u9875\u7684\u76EE\u6807\u6570\u636E\u5E93\uFF08\u9ED8\u8BA4=\u8FDE\u63A5\u9ED8\u8BA4\u5E93\uFF09",children:[(0,s.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",e.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),N.map(g=>(0,s.jsx)("option",{value:g,children:g},g))]})]}),(0,s.jsx)("span",{className:"db-muted",children:"\u6A21\u578B\u590D\u7528 DSH \u914D\u7F6E\uFF0C\u65E0\u9700\u5728\u63D2\u4EF6\u4E2D\u586B Key"})]}),(0,s.jsxs)("div",{className:"db-row",style:{gap:8,margin:"2px 0 8px"},children:[(0,s.jsx)("label",{className:"db-muted",style:{whiteSpace:"nowrap"},children:"\u6309\u9700\u9009\u6A21\u578B\uFF1A"}),(0,s.jsxs)("select",{value:P,onChange:g=>c(Number(g.target.value)),style:{maxWidth:420},children:[(0,s.jsx)("option",{value:-1,children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),j.map((g,Y)=>(0,s.jsx)("option",{value:Y,children:g.label},Y))]}),E&&!E.ok?(0,s.jsx)("span",{className:"db-badge",style:{color:"var(--db-err)",borderColor:"color-mix(in srgb, var(--db-err) 40%, transparent)"},children:E.message??"\u6A21\u578B\u670D\u52A1\u4E0D\u53EF\u7528"}):null,E===null?(0,s.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6 DSH \u6A21\u578B\u5217\u8868\u4E2D\u2026\uFF09"}):null]}),(0,s.jsx)(Le,{entries:b,onLoad:Q,onDelete:q,onClear:S}),(0,s.jsx)("textarea",{className:"db-code",style:{minHeight:90},value:n,onChange:g=>o(g.target.value),placeholder:"\u4F8B\u5982\uFF1A\u7EDF\u8BA1\u672C\u6708\u6BCF\u4E2A\u57CE\u5E02\u7684\u4E0B\u5355\u7528\u6237\u6570\u548C\u8BA2\u5355\u603B\u989D\uFF0C\u6309\u57CE\u5E02\u6392\u5E8F",spellCheck:!1}),(0,s.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,s.jsx)("button",{className:"db-btn-primary",onClick:B,disabled:w!==""||!n.trim(),children:w==="AI \u751F\u6210 SQL \u4E2D\u2026"?"\u751F\u6210\u4E2D\u2026":"\u751F\u6210 SQL"}),(0,s.jsx)("button",{disabled:w!==""||!n.trim(),onClick:M,children:w==="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?"\u6267\u884C\u4E2D\u2026":"\u751F\u6210\u5E76\u76F4\u63A5\u67E5\u8BE2"}),(0,s.jsx)("div",{className:"db-grow"}),(0,s.jsx)("button",{className:"db-btn-ghost",onClick:()=>{u(null),C(""),l(null)},children:"\u6E05\u7A7A"})]}),(0,s.jsx)(X,{kind:"error",text:k}),w&&w!=="AI \u751F\u6210 SQL \u4E2D\u2026"&&w!=="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?(0,s.jsx)("div",{className:"db-muted",children:w}):null,t&&(0,s.jsxs)("div",{className:"db-card",style:{background:"var(--db-panel-2)"},children:[(0,s.jsxs)("div",{className:"db-card-title",children:[(0,s.jsx)("span",{children:"\u{1F916} \u751F\u6210\u7684 SQL\uFF08\u53EF\u4FEE\u6539\u540E\u6267\u884C\uFF09"}),(0,s.jsxs)("span",{className:"db-muted",children:[t.engine==="custom"?"\u81EA\u5B9A\u4E49\u7AEF\u70B9":t.engine==="history"?"\u5386\u53F2\u8F7D\u5165":"DSH \u6A21\u578B",t.provider?` \xB7 ${t.provider}${t.model?`/${t.model}`:""}`:"",t.note?` \xB7 ${t.note}`:""]})]}),(0,s.jsx)("textarea",{className:"db-code",value:m,onChange:g=>C(g.target.value),spellCheck:!1,style:{minHeight:110}}),(0,s.jsx)("div",{className:"db-row",style:{marginTop:8},children:(0,s.jsx)("button",{className:"db-btn-primary",onClick:M,disabled:w!=="",children:"\u6267\u884C\u6B64 SQL\uFF08\u53EA\u8BFB\uFF09"})})]}),d&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{className:"db-divider"}),(0,s.jsx)(Se,{result:d.result,limit:h,onLimitChange:x})]}),t&&!d&&(0,s.jsx)("div",{className:"db-divider"})]})}var Ht={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"},zt={view:"\u89C6\u56FE",collection:"\u96C6\u5408",table:"\u8868"};function Xe({connection:e,target:a}){let{table:n,database:o,schema:t}=a,u=le(e.type),[d,l]=(0,T.useState)("browse"),[m,C]=(0,T.useState)({browse:!0,sql:!1,nl:!1}),w=k=>{l(k),m[k]||C(f=>({...f,[k]:!0}))},y=k=>d===k?void 0:{display:"none"};return(0,s.jsxs)("div",{className:"db-pane-stack",children:[(0,s.jsxs)("div",{className:"db-ws-head",children:[(0,s.jsx)("span",{className:"db-ws-icon",children:Ht[n.kind]??"\u{1F5C2}"}),(0,s.jsx)("strong",{className:"db-ws-name",children:n.name}),(0,s.jsx)("span",{className:"db-badge db-badge-type",children:zt[n.kind]??n.kind}),o?(0,s.jsxs)("span",{className:"db-badge",children:["\u5E93\uFF1A",o]}):null,t&&u?(0,s.jsxs)("span",{className:"db-badge",children:["schema\uFF1A",t]}):null,(0,s.jsx)("span",{className:"db-badge",children:se[e.type]}),(0,s.jsx)("span",{className:"db-muted",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:e.name}),(0,s.jsx)("div",{className:"db-grow"}),(0,s.jsxs)("div",{className:"db-seg",role:"tablist","aria-label":"\u5DE5\u4F5C\u533A\u5B50\u9875",children:[(0,s.jsx)("button",{role:"tab","aria-selected":d==="browse",className:d==="browse"?"db-active":"",onClick:()=>w("browse"),children:"\u{1F4DA} \u6570\u636E\u6D4F\u89C8"}),(0,s.jsx)("button",{role:"tab","aria-selected":d==="sql",className:d==="sql"?"db-active":"",onClick:()=>w("sql"),children:"\u2328\uFE0F SQL \u67E5\u8BE2"}),(0,s.jsx)("button",{role:"tab","aria-selected":d==="nl",className:d==="nl"?"db-active":"",onClick:()=>w("nl"),children:"\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2"})]})]}),(0,s.jsxs)("div",{className:"db-ws-pages",children:[(0,s.jsx)("div",{className:"db-ws-page",style:y("browse"),children:(0,s.jsx)(Mt,{connection:e,target:a})}),m.sql&&(0,s.jsx)("div",{className:"db-ws-page",style:y("sql"),children:(0,s.jsx)($t,{connection:e,initialDatabase:o})}),m.nl&&(0,s.jsx)("div",{className:"db-ws-page",style:y("nl"),children:(0,s.jsx)(Ot,{connection:e,initialDatabase:o})})]})]})}var O=I("react/jsx-runtime"),It={view:"\u{1F441}",collection:"\u{1F4E6}",table:"\u{1F5C2}"};function At(e,a){return`browse:${e.id}|${a.database??""}|${a.schema??""}|${a.table.name}`}function Bt(e,a){return[e.name,a.database,a.schema,a.table.name].filter(Boolean).join(" \xB7 ")}function me(e={}){let[a,n]=(0,_.useState)([]),[o,t]=(0,_.useState)(!1),[u,d]=(0,_.useState)({level:"info",text:"\u52A0\u8F7D\u4E2D\u2026"}),l=(0,_.useRef)(!0),m=(0,_.useRef)(de().lastConnId??null),[C,w]=(0,_.useState)(null),[y,k]=(0,_.useState)([]),[f,h]=(0,_.useState)(null),x=(0,_.useCallback)(v=>{try{be({lastConnId:v})}catch{}},[]),E=(0,_.useCallback)(async()=>{t(!0);try{let{connections:v}=await F.connections();n(v),m.current&&v.some(b=>b.id===m.current)&&(w(m.current),m.current=null);let N=y.filter(b=>v.some($=>$.id===b.connId));N.length!==y.length&&(k(N),h(b=>b!==null&&N.some($=>$.key===b)?b:N.length>0?N[N.length-1].key:null)),v.length===0?d({level:"info",text:"\u5C1A\u672A\u914D\u7F6E\u8FDE\u63A5"}):d({level:"info",text:`${v.length} \u4E2A\u8FDE\u63A5\u5DF2\u52A0\u8F7D`})}catch(v){let N=v instanceof Error?v.message:String(v);d({level:"error",text:`\u52A0\u8F7D\u8FDE\u63A5\u5217\u8868\u5931\u8D25\uFF1A${N}\uFF08\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u5728 DSH \u4E2D\u542F\u7528\uFF09`})}finally{t(!1)}},[y]);(0,_.useEffect)(()=>{l.current&&(l.current=!1,E())},[E]);let i=(0,_.useCallback)(v=>{k(N=>N.some(b=>b.key===v.key)?N:[...N,v]),h(v.key),x(v.connId)},[x]),P=(0,_.useCallback)((v,N)=>{i({key:At(v,N),kind:"browse",connId:v.id,title:N.table.name,sub:Bt(v,N),target:N})},[i]),c=(0,_.useCallback)(v=>{h(N=>{if(N!==v)return N;let b=!1,$=null;for(let q of y){if(q.key===v){b=!0;continue}if(!b)$=q.key;else return q.key}return $}),k(N=>N.filter(b=>b.key!==v))},[y]),L=v=>{let N=a.find(b=>b.id===v.connId);return N?(0,O.jsx)(Xe,{connection:N,target:v.target}):null},H=v=>It[v.target.table.kind]??"\u{1F5C2}";return(0,O.jsxs)("div",{className:"db-app",children:[(0,O.jsxs)("div",{className:"db-topbar",children:[(0,O.jsxs)("div",{className:"db-title",children:[(0,O.jsx)("span",{className:"db-logo",children:"DB"})," \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",(0,O.jsx)("span",{className:"db-badge db-badge-type",children:"dsh-database-console"})]}),(0,O.jsx)("div",{className:"db-grow"}),o?(0,O.jsx)("span",{className:"db-muted",children:"\u2026"}):null,u.level==="error"?(0,O.jsx)("span",{className:"db-muted",style:{color:"var(--db-err)"},title:u.text,children:"\u26A0\uFE0F"}):null,e.onClose?(0,O.jsx)("button",{onClick:e.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:e.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),(0,O.jsxs)("div",{className:"db-app-body",children:[(0,O.jsx)(Je,{connections:a,busyList:o,refresh:E,focusId:C,onFocused:x,onOpenBrowse:P}),(0,O.jsxs)("div",{className:"db-main",children:[(0,O.jsxs)("div",{className:"db-tabbar",role:"tablist","aria-label":"\u5DF2\u6253\u5F00\u7684\u5DE5\u4F5C\u533A",children:[y.length===0?(0,O.jsx)("span",{className:"db-muted",style:{padding:"0 10px",whiteSpace:"nowrap"},children:"\u4ECE\u5DE6\u4FA7\u5C55\u5F00\u8FDE\u63A5\uFF0C\u70B9\u51FB\u8868/\u89C6\u56FE/\u96C6\u5408\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF08\u5185\u542B \u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF09\u3002"}):null,y.map(v=>(0,O.jsxs)("div",{role:"tab","aria-selected":v.key===f,className:`db-tab${v.key===f?" db-tab-active":""}`,title:`${v.sub} \u2014\u2014 \u70B9\u51FB\u5207\u6362\uFF0C\u2715 \u5173\u95ED`,onClick:()=>h(v.key),children:[(0,O.jsx)("span",{className:"db-tab-icon",children:H(v)}),(0,O.jsx)("span",{className:"db-tab-label",children:v.title}),(0,O.jsx)("span",{className:"db-tab-close",title:"\u5173\u95ED",onClick:N=>{N.stopPropagation(),c(v.key)},children:"\u2715"})]},v.key))]}),(0,O.jsx)("div",{className:"db-tabpanes",children:y.length===0?(0,O.jsxs)("div",{className:"db-empty",style:{flex:1},children:[(0,O.jsx)("div",{children:"\u8FD8\u6CA1\u6709\u6253\u5F00\u4EFB\u4F55\u5DE5\u4F5C\u533A\u3002"}),(0,O.jsxs)("div",{style:{marginTop:6,fontSize:12},children:["\u5DE6\u4FA7\u70B9\u51FB\u8FDE\u63A5\u540D\u5C55\u5F00\u5BF9\u8C61\u6811 \u2192 \u70B9\u8868/\u89C6\u56FE/\u96C6\u5408\u6253\u5F00\u5DE5\u4F5C\u533A Tab\uFF1B",(0,O.jsx)("br",{}),"\u6BCF\u4E2A Tab \u5185\u542B\u300C\u6570\u636E\u6D4F\u89C8 / SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\u300D\u4E09\u4E2A\u5B50\u9875\uFF0C\u5404\u81EA\u72EC\u7ACB\u4FDD\u6301\u72B6\u6001\uFF1B",(0,O.jsx)("br",{}),"\u91CD\u590D\u70B9\u51FB\u540C\u4E00\u5F20\u8868\u4F1A\u5B9A\u4F4D\u56DE\u5B83\u5DF2\u6253\u5F00\u7684 Tab\u3002"]})]}):y.map(v=>(0,O.jsx)("div",{role:"tabpanel",className:"db-pane","data-active":v.key===f?"true":void 0,style:v.key===f?void 0:{display:"none"},children:L(v)},v.key))})]})]})]})}var ie=I("react/jsx-runtime"),ne=null,Ze=null;function Ft(){let e=Ve();return(0,ie.jsx)("div",{style:{width:"100%",height:"100%",minHeight:0,minWidth:0,display:e.panelOpen?"flex":"none",flexDirection:"column",overflow:"hidden"},children:(0,ie.jsx)(me,{onClose:()=>K.close(),standalone:!0})})}function tt(e){return ne!==null||(ne=document.createElement("div"),ne.id="dsh-database-console",ne.style.cssText=e==="standalone"?["position:fixed","left:24px","right:24px","top:24px","bottom:24px","z-index:2147482000","border-radius:12px","box-shadow:0 18px 48px rgba(0,0,0,.45)","overflow:hidden","display:flex","flex-direction:column","background:var(--db-bg)"].join(";"):["position:absolute","inset:0","z-index:30","display:none","flex-direction:column","overflow:hidden","background:var(--db-bg)"].join(";"),document.body.appendChild(ne),Ze=(0,et.createRoot)(ne),Ze.render(e==="standalone"?(0,ie.jsx)(Ft,{}):(0,ie.jsx)(me,{onClose:()=>K.close(),standalone:!1}))),ne}function at(){typeof document>"u"||tt("standalone")}function nt(e){let a=(0,ge.useRef)(null);return(0,ge.useEffect)(()=>{let n=a.current;if(n===null)return;let o=tt("dsh"),t=n.closest("[data-phase]")??n.parentElement,u,d=l=>{Number.isFinite(l)&&l>=32&&o.style.setProperty("--db-shell-header-h",`${l}px`)};if(t!=null){let l=t.querySelector("header");l!==null&&(u=new ResizeObserver(m=>{for(let C of m){let w=C.borderBoxSize,y=Array.isArray(w)?w[0]?.blockSize:void 0;d(y??l.getBoundingClientRect().height)}}),u.observe(l),d(l.getBoundingClientRect().height))}return t!=null&&(K.setDocked(!0),o.style.display="flex",o.parentElement!==t&&t.appendChild(o)),()=>{u?.disconnect(),K.setDocked(!1),o.parentElement!==document.body&&document.body.appendChild(o),o.style.display="none"}},[]),(0,ie.jsx)("div",{ref:a,style:{height:0,overflow:"hidden"}})}var fe=`/* dsh-database-console \u5BA2\u6237\u7AEF\u6837\u5F0F
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
  /* \u7EB5\u5411 flex\uFF1A\u8BA9\u300C\u67E5\u8BE2\u7ED3\u679C\u8868\u683C\u300D\u81EA\u9002\u5E94\u5269\u4F59\u9AD8\u5EA6\uFF08\u8868\u683C\u4F53\u5185\u90E8\u6EDA\u52A8\uFF09\uFF0C
     \u6B63\u5E38\u60C5\u51B5\u4E0B\u9875\u9762\u672C\u8EAB\u4E0D\u518D\u51FA\u73B0\u7B2C\u4E8C\u6761\u7AD6\u5411\u6EDA\u52A8\u6761\uFF1B\u7A7A\u95F4\u4E0D\u8DB3\u65F6\u6574\u4F53\u6EDA\u52A8\u515C\u5E95 */
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
}
#dsh-database-console .db-pane-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
  min-height: 0;
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
  flex: 0 0 auto;
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
  flex: 1 1 auto;
}
/* \u5B50\u9875\u5BB9\u5668\uFF1A\u7EB5\u5411 flex\uFF0C\u8BA9\u5B50\u9875\u5185\u5BB9\uFF08\u7ED3\u679C\u8868\u683C\uFF09\u81EA\u9002\u5E94\u5269\u4F59\u9AD8\u5EA6\u3002
   \u672A\u6FC0\u6D3B\u7684\u5B50\u9875\u7531\u5185\u8054 display:none \u9690\u85CF\uFF08\u4F18\u5148\u7EA7\u9AD8\u4E8E\u8FD9\u91CC\u7684 display:flex\uFF09\u3002 */
#dsh-database-console .db-ws-page {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* \u586B\u5145\u578B\u5361\u7247\uFF08SQL \u67E5\u8BE2 / \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2 / \u6570\u636E\u6D4F\u89C8\u9884\u89C8\u5361\uFF09\uFF1A
   \u81EA\u8EAB\u6491\u6EE1\u5B50\u9875\u5269\u4F59\u9AD8\u5EA6\uFF0C\u7ED3\u679C\u8868\u683C\u5728\u5176\u5185\u90E8\u7EE7\u7EED\u5411\u4E0B\u586B\u5145 */
#dsh-database-console .db-card-fill {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* \u67E5\u8BE2\u7ED3\u679C\u533A\uFF08ResultTableView\uFF09\uFF1A\u5206\u9875\u6761\u56FA\u5B9A\u5E95\u90E8\uFF0C\u8868\u683C\u4F53\u5403\u6389\u5168\u90E8\u5269\u4F59\u9AD8\u5EA6 */
#dsh-database-console .db-result {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
#dsh-database-console .db-result > .db-gridx-body {
  flex: 1 1 auto;
  min-height: 140px;
  max-height: none;
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

/* ------------------------------------------------------------------ \u67E5\u8BE2\u5386\u53F2 */
/* \u53EF\u6298\u53E0\u9762\u677F\uFF1A\u4E00\u884C\u5F00\u5173 + \u6EDA\u52A8\u5217\u8868\uFF1B\u70B9\u51FB\u6761\u76EE\u8F7D\u5165\uFF0C\xD7 \u5220\u9664\u5355\u6761 */
#dsh-database-console .db-history {
  margin: 0 0 8px;
  min-width: 0;
  flex: 0 0 auto;
}
#dsh-database-console .db-history-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 3px 8px;
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background var(--db-ease);
}
#dsh-database-console .db-history-toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-panel-2));
}
#dsh-database-console .db-history-list {
  margin-top: 2px;
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--db-border-strong) transparent;
  border: 1px solid color-mix(in srgb, var(--db-border) 55%, transparent);
  border-radius: 8px;
  padding: 3px;
  background: color-mix(in srgb, var(--db-panel) 55%, transparent);
}
#dsh-database-console .db-history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: pointer;
  min-width: 0;
  transition: background var(--db-ease);
}
#dsh-database-console .db-history-item:hover,
#dsh-database-console .db-history-item:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover, var(--db-accent-weak));
  outline: none;
}
#dsh-database-console .db-history-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--db-mono);
  font-size: 11.5px;
}
#dsh-database-console .db-history-time {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--db-faint);
}
#dsh-database-console .db-history-del {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  padding: 0;
  line-height: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--db-muted);
  background: transparent;
  border: 0;
  border-radius: 5px;
  opacity: 0.6;
}
#dsh-database-console .db-history-del:hover {
  opacity: 1;
  color: var(--db-err);
  background: color-mix(in srgb, var(--db-err) 14%, transparent);
}
#dsh-database-console .db-history-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px 1px;
  font-size: 11px;
  color: var(--db-faint);
}
#dsh-database-console .db-history-foot button {
  font-size: 11px;
  padding: 2px 8px;
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
  min-height: 0;
  /* \u7EB5\u5411 flex\uFF1A\u8868\u5934\u56FA\u5B9A\u3001\u8868\u4F53\u5403\u6389\u5269\u4F59\u9AD8\u5EA6\uFF08\u6570\u636E\u6D4F\u89C8\u7684\u9884\u89C8\u7F51\u683C\u540C\u6837\u81EA\u9002\u5E94\uFF09 */
  display: flex;
  flex-direction: column;
  border: 0;
  border-radius: 0;
}
#dsh-database-console .db-gridx > .db-gridx-body {
  flex: 1 1 auto;
  min-height: 140px;
  max-height: none;
}
#dsh-database-console .db-gridx-head {
  /* flex \u5B50\u9879\u7981\u6B62\u6536\u7F29\uFF1Aoverflow:hidden \u7684\u5B50\u9879\u81EA\u52A8\u6700\u5C0F\u5C3A\u5BF8\u4E3A 0\uFF0C
     \u7A7A\u95F4\u7D27\u5F20\u65F6\u8868\u5934\u4F1A\u88AB\u6574\u4E2A\u538B\u6CA1\uFF08SQL \u7ED3\u679C\u8868\u201C\u6CA1\u6709\u8868\u5934\u201D\u7684\u6839\u56E0\uFF09 */
  flex: 0 0 auto;
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
  max-height: none;
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

/* \u7F51\u683C\u4F53\u9AD8\u5EA6\u7B56\u7565\u5DF2\u6539\u4E3A flex \u81EA\u9002\u5E94\u5269\u4F59\u9AD8\u5EA6\uFF1A
   .db-result > .db-gridx-body\uFF08SQL/NL \u7ED3\u679C\uFF09\u4E0E .db-gridx > .db-gridx-body\uFF08\u6570\u636E\u6D4F\u89C8\uFF09
   \u5747\u4E3A flex:1 + max-height:none\uFF0C\u65E7\u7684 62vh \u4E0A\u9650\u89C4\u5219\u5DF2\u5220\u9664\u3002 */

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
`;var st="dsh-database-console-style";function Pe(){if(typeof document>"u")return()=>{};let e=document.getElementById(st);if(e!==null&&e.isConnected)return()=>{};let a=document.createElement("style");return a.id=st,a.setAttribute("data-plugin","dsh-database-console"),a.textContent=fe,document.head.appendChild(a),()=>{a.isConnected&&a.remove()}}var ce="database",ot={"sidebar.label":"\u6570\u636E\u5E93","sidebar.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","sidebar.title":"\u6253\u5F00\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","overlay.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0\u9762\u677F","overlay.close":"\u56DE\u5230\u5BF9\u8BDD","toolbar.open":"\u6253\u5F00\u6570\u636E\u5E93","toolbar.close":"\u5173\u95ED\u6570\u636E\u5E93"},rt={"sidebar.label":"Database","sidebar.aria":"Database console","sidebar.title":"Open database console","overlay.aria":"Database console panel","overlay.close":"Back to conversation","toolbar.open":"Open database","toolbar.close":"Close database"};var Vt=["slots","locale"];function jt(e){let a=e?.slots,n=e?.locale;if(!a||!n){typeof document<"u"&&e?.effect?.(()=>qe(),"dsh-database-console: standalone preview");return}let o=n.bind(ce),t=n.register(ce,{zh:ot,en:rt}),u=Pe(),d=a.inject("sidebar.footer.action",()=>a.register({name:"sidebar.footer.action",id:"database",order:-10,locale:ce,label:()=>o("sidebar.label")},je)),l=a.inject("conversation.view",()=>a.register({name:"conversation.view",id:"database",order:60,locale:ce,label:()=>o("sidebar.label")},nt));e?.effect&&e.effect(()=>()=>{t(),d(),l(),u()},"dsh-database-console: plugin teardown")}function qe(){if(typeof document>"u"||document.getElementById("dsh-database-standalone-button")!==null)return;Pe(),at();let e=document.createElement("button");e.id="dsh-database-standalone-button",e.textContent="\u{1F5C4} \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483000","background:linear-gradient(135deg,#4c8dff,#7b61ff)","color:#fff","border:0","border-radius:999px","padding:10px 18px","font:600 13px/1.4 system-ui,sans-serif","cursor:pointer","box-shadow:0 6px 18px rgba(0,0,0,.35)"].join(";"),e.addEventListener("click",()=>K.toggle()),document.body.appendChild(e)}var _t=globalThis;!_t.window?.__ModuleLoader__&&typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>qe(),{once:!0}):qe());return ht(Kt);})();
    return __dsh_db_console_module__;
  },
});
