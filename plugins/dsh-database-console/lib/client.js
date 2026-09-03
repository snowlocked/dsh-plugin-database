window.__ModuleLoader__.load({
  id: "@snowlocked/dsh-database-console",
  factory: (require) => {
    "use strict";
    var __dsh_db_module = { exports: {} };
    var __dsh_db_exports = __dsh_db_module.exports;
    Object.defineProperty(__dsh_db_exports, Symbol.toStringTag, { value: "Module" });
"use strict";var __dsh_db_console_module__=(()=>{var ie=Object.defineProperty;var Qe=Object.getOwnPropertyDescriptor;var je=Object.getOwnPropertyNames;var He=Object.prototype.hasOwnProperty;var I=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(a,l)=>(typeof require<"u"?require:a)[l]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var _e=(t,a)=>{for(var l in a)ie(t,l,{get:a[l],enumerable:!0})},Ve=(t,a,l,o)=>{if(a&&typeof a=="object"||typeof a=="function")for(let n of je(a))!He.call(t,n)&&n!==l&&ie(t,n,{get:()=>a[n],enumerable:!(o=Qe(a,n))||o.enumerable});return t};var We=t=>Ve(ie({},"__esModule",{value:!0}),t);var mt={};_e(mt,{apply:()=>ut,cssText:()=>le,inject:()=>ct});var re=I("react");var ve=I("react");var U=!1,fe=null,ce=new Set,oe=()=>{for(let t of ce)t()},Ge=Object.freeze({panelOpen:!0,activeConnectionId:null}),he=Object.freeze({panelOpen:!1,activeConnectionId:null}),ye=he,se=()=>{ye=U?Ge:he},$={open(){U||(U=!0,se(),oe())},close(){U&&(U=!1,se(),oe())},toggle(){U=!U,se(),oe()},getSnapshot:()=>ye,subscribe(t){return ce.add(t),()=>ce.delete(t)},setActiveConnection(t){fe!==t&&(fe=t,se(),oe())}};function xe(){return(0,ve.useSyncExternalStore)($.subscribe,$.getSnapshot,$.getSnapshot)}var B=I("react/jsx-runtime"),Ue=(0,B.jsxs)("svg",{viewBox:"0 0 16 16",width:"16",height:"16",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[(0,B.jsx)("ellipse",{cx:7.5,cy:11,rx:5.5,ry:2.75}),(0,B.jsx)("path",{d:"M7.5 11V5.5"}),(0,B.jsx)("path",{d:"M2.75 6.25c0-1.1 2.1-2 4.75-2s4.75.9 4.75 2"}),(0,B.jsx)("path",{d:"M7.5 8.25c1.9 0 3.4-.45 3.9-1.1M5.25 4.35V3.5"})]});function we(t){let{wide:a=!0,t:l=(m=>m)}=t,o=l,n=(0,re.useSyncExternalStore)($.subscribe,$.getSnapshot,$.getSnapshot),g=(0,re.useCallback)(()=>{$.toggle()},[]);return(0,B.jsxs)("button",{type:"button","data-d-sh-plugin":"database","data-active":n.panelOpen||void 0,"aria-label":o("sidebar.aria"),title:o("sidebar.title"),onClick:g,className:"db-sidebar-entry",children:[(0,B.jsx)("span",{className:"db-sidebar-entry-icon","aria-hidden":"true",children:Ue}),a?(0,B.jsx)("span",{className:"db-sidebar-entry-label",children:o("sidebar.label")}):null]})}var Y=I("react");var i=I("react");var K={postgresql:"PostgreSQL",mysql:"MySQL",mongodb:"MongoDB",sqlite:"SQLite",dameng:"\u8FBE\u68A6 DM"},Xe="/api/dsh-database-console",J=class extends Error{status;code;constructor(a,l,o){super(a),this.status=l,this.code=o}};async function Je(t,a){let l;try{l=await fetch(`${Xe}${t}`,a)}catch(n){throw new J(`\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF1A${n instanceof Error?n.message:String(n)}`,0)}let o=null;try{o=await l.json()}catch{o=null}if(!l.ok){let n=o&&typeof o=="object"?o:{};throw new J(String(n.error??`HTTP ${l.status}`),l.status,String(n.code??""))}return o}function Ke(t){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(t)}}function O(t,a){return Je(t,Ke(a??{}))}var M={state:()=>O("/state"),connections:()=>O("/connections/list"),meta:t=>O("/connection/meta",{id:t}),save:t=>O("/connections/save",t),remove:t=>O("/connection/remove",{id:t}),test:t=>O("/connections/test",t),databases:t=>O("/connection/databases",{id:t}),schemas:(t,a)=>O("/connection/schemas",{id:t,...a?{database:a}:{}}),tables:(t,a,l)=>O("/connection/tables",{id:t,...a?{schema:a}:{},...l?{database:l}:{}}),columns:(t,a,l,o)=>O("/connection/columns",{id:t,table:a,...l?{schema:l}:{},...o?{database:o}:{}}),rows:(t,a,l,o,n,g,m)=>O("/connection/rows",{id:t,table:a,...l?{schema:l}:{},...g?{database:g}:{},limit:o,offset:n,...m?.sort?{sort:m.sort}:{},...m?.filters&&Object.keys(m.filters).length>0?{filters:m.filters}:{}}),cellUpdate:t=>O("/connection/cell/update",{id:t.id,table:t.table,...t.schema?{schema:t.schema}:{},...t.database?{database:t.database}:{},column:t.column,pk:t.pk,value:t.value,isNull:t.isNull}),query:(t,a,l,o,n)=>O("/query",{id:t,sql:a,readOnly:l,...n?{database:n}:{},...o?{limit:o}:{}}),aiModels:()=>O("/ai/models"),aiGenerate:(t,a,l,o)=>O("/ai/generate",{id:t,question:a,...o?{database:o}:{},...l?.provider?{provider:l.provider}:{},...l?.model?{model:l.model}:{}}),aiRun:(t,a,l,o,n)=>O("/ai/run",{id:t,question:a,...n?{database:n}:{},...l?.provider?{provider:l.provider}:{},...l?.model?{model:l.model}:{},...o?{limit:o}:{}})};function ke(t){return t==="postgresql"||t==="dameng"}function Ne(t){switch(t){case"postgresql":return 5432;case"mysql":return 3306;case"mongodb":return 27017;case"dameng":return 5236;default:return null}}function Q(t){if(t==null)return"NULL";if(typeof t=="object")try{return JSON.stringify(t)}catch{return String(t)}return String(t)}var e=I("react/jsx-runtime");function j({kind:t,text:a}){return a?(0,e.jsx)("div",{className:`db-banner db-banner-${t}`,children:a}):null}function Ce({result:t}){if(!t)return null;let a=[`\u8017\u65F6 ${t.durationMs}ms`];return(t.rowCount>0||t.columns.length>0)&&a.push(`${t.rowCount} \u884C`),t.affectedRows!==void 0&&a.push(`\u5F71\u54CD ${t.affectedRows} \u884C`),t.truncated&&a.push(`\u26A0\uFE0F \u5DF2\u622A\u65AD\uFF08\u4EC5\u663E\u793A ${t.rows.length} \u884C\uFF09`),(0,e.jsxs)("div",{className:"db-row db-muted",style:{padding:"6px 2px"},children:[(0,e.jsx)("span",{className:t.kind==="change"?"db-ok":"",children:a.join(" \xB7 ")}),t.message?(0,e.jsx)("span",{className:"db-ok",children:t.message}):null]})}async function A(t){return t instanceof J||t instanceof Error?t.message:String(t)}var Ye=["postgresql","mysql","mongodb","sqlite","dameng"];function Se(){return{name:"",type:"postgresql"}}function Ze({draft:t,onClose:a,onSaved:l,onChanged:o}){let[n,g]=(0,i.useState)({...t}),[m,y]=(0,i.useState)(!1),[v,E]=(0,i.useState)(!1),[d,k]=(0,i.useState)(""),[h,p]=(0,i.useState)(""),c=(0,i.useMemo)(()=>{let r=K[n.type],L=n.type!=="sqlite",s=n.type==="mysql"||n.type==="mongodb",S=n.type==="postgresql"||s,T=n.type==="dameng";return{label:r,needsHost:L,needsDatabase:s,supportsDatabase:S,needsSchema:T,needFile:n.type==="sqlite"}},[n.type]),f=r=>{g(L=>({...L,...r})),p(""),k("")},x=()=>{let r={id:n.id,name:n.name.trim(),type:n.type,host:n.host?.trim()||void 0,user:n.user?.trim()||void 0,database:n.database?.trim()||void 0,schema:n.schema?.trim()||void 0,file:n.file?.trim()||void 0,authSource:n.authSource?.trim()||void 0,ssl:n.ssl===!0,options:n.options&&Object.keys(n.options).length>0?n.options:void 0};return n.type==="sqlite"&&(delete r.host,delete r.port,delete r.database),n.port!==void 0&&Number.isFinite(Number(n.port))&&(r.port=Number(n.port)),n.dmCompat&&(r.dmCompat=n.dmCompat),r.dmNoEncrypt=n.dmNoEncrypt===!0,n.password!==void 0&&n.password!==""&&(r.password=n.password),r},C=async()=>{y(!0),k(""),p("");try{let r=await M.test(x());p(r.ok?`\u2705 \u8FDE\u63A5\u6210\u529F\uFF08${r.latencyMs}ms\uFF09`:`\u274C ${r.message}`),r.ok||k(r.detail??r.message)}catch(r){k(await A(r))}finally{y(!1)}},R=async()=>{if(!n.name.trim()){k("\u8BF7\u586B\u5199\u8FDE\u63A5\u540D\u79F0");return}if(c.needsHost&&!n.host?.trim()){k("\u8BF7\u586B\u5199\u4E3B\u673A\u5730\u5740");return}if(c.needsDatabase&&!n.database?.trim()){k(`\u8BF7\u586B\u5199 ${K[n.type]} \u7684\u6570\u636E\u5E93\u540D`);return}if(c.needFile&&!n.file?.trim()){k("\u8BF7\u586B\u5199 SQLite \u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84");return}E(!0),k("");try{let{connection:r}=await M.save(x());p("\u5DF2\u4FDD\u5B58"),o(),l(r)}catch(r){k(await A(r))}finally{E(!1)}};return(0,e.jsxs)("div",{className:"db-card",style:{margin:"4px 0 12px",borderColor:"var(--db-accent)"},children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsxs)("span",{children:["\u270F\uFE0F \u7F16\u8F91\u8FDE\u63A5\uFF08",t.isNew?"\u65B0\u5EFA":n.id,"\uFF09"]}),(0,e.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u6536\u8D77"})]}),(0,e.jsxs)("div",{className:"db-grid",style:{gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))"},children:[(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"\u540D\u79F0 *"}),(0,e.jsx)("input",{value:n.name??"",onChange:r=>f({name:r.target.value}),placeholder:"\u4F8B\u5982\uFF1A\u751F\u4EA7\u5E93-PG"})]}),(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"\u7C7B\u578B"}),(0,e.jsx)("select",{value:n.type,onChange:r=>f({type:r.target.value}),children:Ye.map(r=>(0,e.jsx)("option",{value:r,children:K[r]},r))})]}),c.needsHost&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"\u4E3B\u673A"}),(0,e.jsx)("input",{value:n.host??"",onChange:r=>f({host:r.target.value}),placeholder:c.label==="MongoDB"?"127.0.0.1 \u6216 mongodb://\u2026":"127.0.0.1"})]}),(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"\u7AEF\u53E3"}),(0,e.jsx)("input",{type:"number",value:n.port??Ne(n.type)??"",onChange:r=>f({port:r.target.value===""?void 0:Number(r.target.value)})})]})]}),(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"\u7528\u6237\u540D"}),(0,e.jsx)("input",{value:n.user??"",onChange:r=>f({user:r.target.value}),autoComplete:"off"})]}),(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsxs)("label",{children:["\u5BC6\u7801 ",t.isNew||!t.hasPassword?"":(0,e.jsx)("span",{className:"db-muted",children:"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u7559\u7A7A\u5373\u7528\u5DF2\u5B58\u5BC6\u7801\uFF1B\u70B9\u201C\u6D4B\u8BD5\u8FDE\u63A5\u201D\u4E5F\u7528\u5B83\uFF09"})]}),(0,e.jsx)("input",{type:"password",value:n.password??"",onChange:r=>f({password:r.target.value}),autoComplete:"new-password",placeholder:t.isNew?"\u65B0\u5EFA\u8FDE\u63A5\u65F6\u586B\u5199":"\uFF08\u5DF2\u4FDD\u5B58\uFF0C\u8F93\u5165\u53EF\u8986\u76D6\uFF09"})]}),c.needFile&&(0,e.jsxs)("div",{className:"db-field",style:{gridColumn:"1 / -1"},children:[(0,e.jsx)("label",{children:"\u6570\u636E\u5E93\u6587\u4EF6\u8DEF\u5F84 *"}),(0,e.jsx)("input",{value:n.file??"",onChange:r=>f({file:r.target.value}),placeholder:"C:\\\\data\\\\app.db \u6216 \u76F8\u5BF9\u8DEF\u5F84"})]}),c.supportsDatabase&&(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsxs)("label",{children:["\u9ED8\u8BA4\u6570\u636E\u5E93",c.needsDatabase?" *":"",n.type==="mongodb"?"\uFF08database\uFF09":""]}),(0,e.jsx)("input",{value:n.database??"",onChange:r=>f({database:r.target.value}),placeholder:n.type==="postgresql"?"\u53EF\u9009\uFF0C\u7559\u7A7A\u4F7F\u7528 PostgreSQL \u9ED8\u8BA4\u5E93\uFF08\u901A\u5E38\u4E0E\u7528\u6237\u540D\u76F8\u540C\uFF09":void 0})]}),c.needsSchema&&(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"schema\uFF08\u9ED8\u8BA4\u6A21\u5F0F\uFF0C\u53EF\u9009\uFF09"}),(0,e.jsx)("input",{value:n.schema??"",onChange:r=>f({schema:r.target.value}),placeholder:"\u7559\u7A7A\u4F7F\u7528\u767B\u5F55\u7528\u6237"})]}),n.type==="dameng"&&(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"\u517C\u5BB9\u6A21\u5F0F"}),(0,e.jsxs)("select",{value:n.dmCompat??"oracle",onChange:r=>f({dmCompat:r.target.value}),children:[(0,e.jsx)("option",{value:"oracle",children:"Oracle \u6A21\u5F0F\uFF08\u9ED8\u8BA4\uFF09"}),(0,e.jsx)("option",{value:"mysql",children:"MySQL \u517C\u5BB9\u6A21\u5F0F"})]})]}),n.type==="dameng"&&(0,e.jsxs)("label",{className:"db-field",style:{flexDirection:"row",gap:8,alignItems:"center",cursor:"pointer"},children:[(0,e.jsx)("input",{type:"checkbox",checked:n.dmNoEncrypt===!0,onChange:r=>f({dmNoEncrypt:r.target.checked})}),(0,e.jsx)("span",{children:"\u517C\u5BB9 OpenSSL3\uFF1A\u5173\u95ED\u767B\u5F55/\u6D88\u606F\u52A0\u5BC6\uFF08\u62A5\u9519 0308010C \u6D88\u606F\u52A0\u5BC6\u5931\u8D25\u65F6\u52FE\u9009\uFF1B\u4EC5\u5EFA\u8BAE\u53EF\u4FE1\u5185\u7F51\u4F7F\u7528\uFF09"})]}),n.type==="mongodb"&&(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"authSource\uFF08\u53EF\u9009\uFF09"}),(0,e.jsx)("input",{value:n.authSource??"",onChange:r=>f({authSource:r.target.value}),placeholder:"admin"})]}),(c.needsHost||c.needFile)&&(0,e.jsxs)("div",{className:"db-field",children:[(0,e.jsx)("label",{children:"SSL/TLS"}),(0,e.jsxs)("select",{value:n.ssl===!0?"yes":"no",onChange:r=>f({ssl:r.target.value==="yes"}),children:[(0,e.jsx)("option",{value:"no",children:"\u5173\u95ED"}),(0,e.jsx)("option",{value:"yes",children:"\u542F\u7528"})]})]})]}),(0,e.jsx)(j,{kind:"error",text:d}),(0,e.jsx)(j,{kind:h.startsWith("\u2705")?"ok":"info",text:h}),(0,e.jsxs)("div",{className:"db-row",style:{marginTop:8},children:[(0,e.jsx)("button",{className:"db-btn-primary",onClick:R,disabled:v,children:v?"\u4FDD\u5B58\u4E2D\u2026":"\u4FDD\u5B58\u8FDE\u63A5"}),(0,e.jsx)("button",{onClick:C,disabled:m,children:m?"\u6D4B\u8BD5\u4E2D\u2026":"\u6D4B\u8BD5\u8FDE\u63A5"}),(0,e.jsx)("button",{className:"db-btn-ghost",onClick:a,children:"\u53D6\u6D88"}),(0,e.jsx)("span",{className:"db-muted db-grow",children:"\u6D4B\u8BD5\u8FDE\u63A5\u4E0D\u4F1A\u4FEE\u6539\u5DF2\u4FDD\u5B58\u7684\u8FDE\u63A5\u3002"})]})]})}function et({connections:t,onRefresh:a,onOpen:l}){let[o,n]=(0,i.useState)({...Se(),open:!1,isNew:!0}),[g,m]=(0,i.useState)(""),y=d=>{n(d?{id:d.id,name:d.name,type:d.type,host:d.host,port:d.port,user:d.user,database:d.database,schema:d.schema,ssl:d.ssl,file:d.file,authSource:d.authSource,dmCompat:d.dmCompat,dmNoEncrypt:d.dmNoEncrypt,options:d.options,hasPassword:d.hasPassword,open:!0,isNew:!1}:{...Se(),open:!0,isNew:!0})},v=async d=>{if(window.confirm(`\u786E\u5B9A\u5220\u9664\u8FDE\u63A5\u300C${d.name}\u300D\u5417\uFF1F`)){m("");try{(await M.remove(d.id)).ok||m(`\u5220\u9664\u5931\u8D25\uFF1A\u672A\u627E\u5230\u8FDE\u63A5 ${d.id}\uFF08\u53EF\u80FD\u5DF2\u88AB\u5176\u5B83\u9875\u9762\u5220\u9664\uFF09\uFF0C\u5DF2\u5237\u65B0\u5217\u8868`),await a(),n(h=>({...h,open:!1}))}catch(k){m(await A(k))}}},E=()=>y(null);return(0,e.jsxs)("div",{className:"db-card",children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsxs)("span",{children:["\u{1F50C} \u8FDE\u63A5\u7BA1\u7406\uFF08",t.length,"\uFF09"]}),(0,e.jsxs)("div",{className:"db-row",children:[(0,e.jsx)("button",{className:"db-btn-primary",onClick:E,children:"+ \u65B0\u5EFA\u8FDE\u63A5"}),(0,e.jsx)("button",{onClick:()=>a(),children:"\u5237\u65B0"})]})]}),o.open&&(0,e.jsx)(Ze,{draft:o,onClose:()=>n(d=>({...d,open:!1})),onSaved:()=>{a(),n(d=>({...d,open:!1}))},onChanged:()=>a()}),(0,e.jsx)(j,{kind:"error",text:g}),t.length===0?(0,e.jsx)("div",{className:"db-empty",children:"\u8FD8\u6CA1\u6709\u8FDE\u63A5\u3002\u70B9\u51FB\u300C+ \u65B0\u5EFA\u8FDE\u63A5\u300D\u6DFB\u52A0\u7B2C\u4E00\u4E2A\u6570\u636E\u5E93\u8FDE\u63A5\uFF0C\u652F\u6301 PostgreSQL / MySQL / MongoDB / SQLite / \u8FBE\u68A6\u3002"}):(0,e.jsx)("div",{className:"db-list",children:t.map(d=>(0,e.jsxs)("div",{className:"db-list-item",children:[(0,e.jsxs)("div",{style:{flex:"1 1 auto",minWidth:0},children:[(0,e.jsxs)("div",{className:"db-row",children:[(0,e.jsx)("strong",{children:d.name}),(0,e.jsx)("span",{className:"db-badge db-badge-type",children:K[d.type]}),d.lastError?(0,e.jsx)("span",{className:"db-badge",style:{color:"var(--db-err)",borderColor:"rgba(255,95,86,.4)"},children:"\u6D4B\u8BD5\u5931\u8D25"}):d.lastTestedAt?(0,e.jsx)("span",{className:"db-badge db-badge-ok",children:"\u5DF2\u6D4B\u8BD5"}):null,d.hasPassword?null:(0,e.jsx)("span",{className:"db-badge",children:"\u672A\u4FDD\u5B58\u5BC6\u7801"})]}),(0,e.jsx)("div",{className:"db-muted",style:{fontSize:12,marginTop:2},children:d.type==="sqlite"?(0,e.jsx)("span",{className:"db-chip",children:d.file}):(0,e.jsxs)("span",{children:[(0,e.jsxs)("span",{className:"db-chip",children:[d.host??"",d.port?`:${d.port}`:""]}),d.user?` \xB7 ${d.user}`:"",d.database?` \xB7 ${d.database}`:"",d.schema?` \xB7 schema=${d.schema}`:""]})}),d.lastError&&(0,e.jsxs)("div",{className:"db-muted",style:{fontSize:12,color:"var(--db-err)"},children:["\u4E0A\u6B21\u6D4B\u8BD5\uFF1A",d.lastError]})]}),(0,e.jsxs)("div",{className:"db-row",children:[(0,e.jsx)("button",{onClick:()=>l(d),children:"\u6253\u5F00"}),(0,e.jsx)("button",{onClick:()=>y(d),children:"\u7F16\u8F91"}),(0,e.jsx)("button",{className:"db-btn-danger",onClick:()=>v(d),children:"\u5220\u9664"})]})]},d.id))})]})}function tt(t,a,l){let o={};t&&l[t.col]&&(o.sort={column:l[t.col]??"",dir:t.dir===1?"asc":"desc"});let n={};for(let[g,m]of Object.entries(a)){let y=l[Number(g)],v=String(m??"").trim();!y||!v||(n[y]=v)}return Object.keys(n).length>0&&(o.filters=n),Object.keys(o).length>0?o:null}function nt(t){let a=(t.length+6)*8+40;return Math.min(420,Math.max(120,a))}function Ee({columns:t,rows:a,active:l,onCellClick:o,interaction:n}){let[g,m]=(0,i.useState)({}),y=(0,i.useRef)(null),v=p=>Math.min(720,Math.max(72,Math.round(p))),E=p=>g[p]??nt(t[p]??""),d=t.reduce((p,c,f)=>p+E(f),0),k=(p,c)=>{c.preventDefault(),c.stopPropagation();let f=c.clientX,x=E(p),C=r=>{let L=v(x+(r.clientX-f));m(s=>s[p]===L?s:{...s,[p]:L})},R=()=>{window.removeEventListener("pointermove",C),window.removeEventListener("pointerup",R),document.body.style.cursor="",document.body.style.userSelect=""};document.body.style.cursor="col-resize",document.body.style.userSelect="none",window.addEventListener("pointermove",C),window.addEventListener("pointerup",R)},h=()=>(0,e.jsx)("colgroup",{children:t.map((p,c)=>(0,e.jsx)("col",{style:{width:E(c)}},`col-${c}`))});return(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("div",{className:"db-gridx-head",ref:y,children:(0,e.jsxs)("table",{className:"db-gridx-t",style:{width:d},children:[h(),(0,e.jsx)("thead",{children:(0,e.jsx)("tr",{children:t.map((p,c)=>{let f=n&&n.sort?.col===c?n.sort.dir:0,x=n?!!n.filters[c]:!1;return(0,e.jsxs)("th",{title:p,style:{width:E(c),minWidth:E(c)},children:[(0,e.jsxs)("span",{className:"db-gridx-th-main",children:[n?(0,e.jsxs)("button",{className:"db-sort-label",title:"\u70B9\u51FB\u6392\u5E8F\uFF1A\u5347\u5E8F \u2192 \u964D\u5E8F \u2192 \u53D6\u6D88",onClick:()=>n.onSort(c),children:[p,(0,e.jsx)("span",{className:f===0?"db-sort-idle":"db-sort-on",children:f===1?" \u25B2":f===-1?" \u25BC":" \u2195"})]}):(0,e.jsx)("span",{className:"db-gridx-th",children:p}),n?(0,e.jsx)("span",{className:x?"db-filter-toggle db-filter-on":"db-filter-toggle",title:x?`\u8FC7\u6EE4\uFF1A${n.filters[c]}\uFF08\u70B9\u51FB\u7F16\u8F91\uFF09`:"\u5217\u8FC7\u6EE4",onClick:()=>n.onFilterOpen(n.filterOpen===c?null:c),children:x?"\u2715":"\u26B2"}):null]}),n&&n.filterOpen===c?(0,e.jsx)("input",{className:"db-gridx-filter",autoFocus:!0,value:n.filters[c]??"",placeholder:`\u8FC7\u6EE4 ${p}\u2026`,spellCheck:!1,onChange:C=>n.onFilter(c,C.target.value),onKeyDown:C=>{(C.key==="Escape"||C.key==="Enter")&&n.onFilterOpen(null)}}):null,(0,e.jsx)("span",{className:"db-colresize",onPointerDown:C=>k(c,C),title:"\u62D6\u52A8\u8C03\u6574\u5217\u5BBD"})]},p)})})})]})}),(0,e.jsx)("div",{className:"db-gridx-body",onScroll:p=>{y.current&&(y.current.scrollLeft=p.currentTarget.scrollLeft)},children:(0,e.jsxs)("table",{className:"db-gridx-t",style:{width:d},children:[h(),(0,e.jsx)("tbody",{children:a.map((p,c)=>(0,e.jsx)("tr",{children:p.map((f,x)=>{let C=Q(f),R=l?.row===c&&l?.col===x;return(0,e.jsx)("td",{className:R?"db-cell-active":"db-cell",title:C,style:{width:E(x)},onClick:()=>o(c,x),children:f==null?(0,e.jsx)("span",{className:"db-null",children:"NULL"}):typeof f=="object"?(0,e.jsx)("span",{className:"db-mono",children:C}):C},`${c}-${x}`)})},c))})]})})]})}function at({connection:t,table:a,schema:l,database:o,tableName:n,queryColumns:g,metaColumns:m,row:y,colIndex:v,onClose:E,onSaved:d,onMessage:k}){let h=g[v]??"",p=y[v],c=m.find(N=>N.name===h),[f,x]=(0,i.useState)(()=>p==null?"":Q(p)),[C,R]=(0,i.useState)(p==null),[r,L]=(0,i.useState)(""),[s,S]=(0,i.useState)(!1),T=new Map;g.forEach((N,F)=>T.set(N,F));let u=m.filter(N=>N.primary).map(N=>({column:N.name,value:y[T.get(N.name)??-1]??null})).filter(N=>T.has(N.column)),P=u.length>0?u.map(N=>`${N.column}=${Q(N.value)}`).join(" & "):"",D=u.length>0,H=t.type==="mongodb",_=async()=>{if(!(!D||!a)){L("\u4FDD\u5B58\u4E2D\u2026");try{let N=await M.cellUpdate({id:t.id,table:a.name,schema:l,...o?{database:o}:{},column:h,pk:u,value:C?null:f,isNull:C});N.ok&&(k(`\u2713 \u5DF2\u66F4\u65B0 ${N.affectedRows} \u884C\uFF08${n}.${h}\uFF09`,"ok"),d())}catch(N){k(await A(N),"error")}finally{L("")}}};return(0,e.jsxs)("div",{className:"db-celldetail",children:[(0,e.jsxs)("div",{className:"db-celldetail-title",children:[(0,e.jsx)("span",{children:"\u270F\uFE0F \u5355\u5143\u683C\u7F16\u8F91"}),(0,e.jsx)("button",{className:"db-btn-ghost",onClick:E,disabled:r!=="",children:"\u2715"})]}),(0,e.jsxs)("div",{className:"db-celldetail-meta",children:[(0,e.jsxs)("div",{children:[(0,e.jsx)("span",{className:"db-muted",children:"\u8868"})," ",n]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("span",{className:"db-muted",children:"\u5217"})," ",h," ",(0,e.jsx)("span",{className:"db-badge db-badge-type",children:c?.type??""})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("span",{className:"db-muted",children:"\u5B9A\u4F4D"})," ",P||"\uFF08\u65E0\u4E3B\u952E\uFF09"]})]}),(0,e.jsx)("button",{className:"db-row db-row-toggle",onClick:()=>S(N=>!N),title:s?"\u70B9\u51FB\u6536\u8D77\u6574\u884C\u6570\u636E":"\u70B9\u51FB\u5C55\u5F00\u6574\u884C\u6570\u636E",children:(0,e.jsxs)("span",{children:[s?"\u25BE":"\u25B8"," \u6574\u884C\u6570\u636E\uFF08",g.length," \u5217\uFF09"]})}),s&&(0,e.jsx)("div",{className:"db-celldetail-row",children:g.map((N,F)=>(0,e.jsxs)("div",{title:`${N} = ${Q(y[F])}`,children:[(0,e.jsx)("span",{className:"db-chip",children:N})," = ",Q(y[F])]},N))}),H||!D?(0,e.jsx)("div",{className:"db-empty",style:{padding:"8px"},children:H?"MongoDB \u96C6\u5408\u6682\u4E0D\u652F\u6301\u5355\u5143\u683C\u7F16\u8F91\uFF08\u6CA1\u6709\u4E3B\u952E\u5217\u6982\u5FF5\uFF09":"\u8BE5\u8868\u6CA1\u6709\u4E3B\u952E\uFF0C\u65E0\u6CD5\u5B89\u5168\u5B9A\u4F4D\u884C\uFF0C\u7F16\u8F91\u5DF2\u7981\u7528"}):null,(0,e.jsx)("label",{className:"db-muted",style:{display:"block",margin:"8px 0 4px"},children:"\u65B0\u503C\uFF08\u5B58\u4E3A NULL \u53EF\u7559\u7A7A\uFF09\uFF1A"}),(0,e.jsxs)("label",{className:"db-row",style:{gap:6,cursor:"pointer",fontSize:12},children:[(0,e.jsx)("input",{type:"checkbox",checked:C,onChange:N=>R(N.target.checked)})," \u5B58\u4E3A NULL"]}),(0,e.jsx)("textarea",{className:"db-code",style:{minHeight:90,width:"100%",boxSizing:"border-box",marginTop:6},value:f,disabled:C,spellCheck:!1,onChange:N=>x(N.target.value),placeholder:"\u8F93\u5165\u65B0\u503C\u2026"}),(0,e.jsxs)("div",{className:"db-row",style:{gap:8,marginTop:8},children:[(0,e.jsx)("button",{className:"db-btn-primary",onClick:_,disabled:!D||r!==""||H,children:r||(D?"\u4FDD\u5B58\uFF08UPDATE \u8BE5\u884C\uFF09":"\u4FDD\u5B58")}),(0,e.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u70B9\u51FB\u5355\u5143\u683C\u65C1\u7684\u4EFB\u610F\u5904\u53EF\u518D\u9009\u5176\u5B83\u5355\u5143\u683C"})]})]})}function ot({connection:t,database:a}){let[l,o]=(0,i.useState)([]),[n,g]=(0,i.useState)(),[m,y]=(0,i.useState)([]),[v,E]=(0,i.useState)(null),[d,k]=(0,i.useState)([]),[h,p]=(0,i.useState)(null),[c,f]=(0,i.useState)(0),[x,C]=(0,i.useState)(200),[R,r]=(0,i.useState)(""),[L,s]=(0,i.useState)(""),S=ke(t.type),[T,u]=(0,i.useState)(!1),[P,D]=(0,i.useState)(null),[H,_]=(0,i.useState)(null),[N,F]=(0,i.useState)(null),[X,te]=(0,i.useState)({}),[Oe,ee]=(0,i.useState)(null),z=(0,i.useRef)(void 0),ne=(0,i.useCallback)(async b=>{r("\u52A0\u8F7D\u8868\u5217\u8868\u2026"),s(""),D(null),_(null),F(null),te({}),ee(null),z.current!==void 0&&(window.clearTimeout(z.current),z.current=void 0);try{let{tables:w}=await M.tables(t.id,b,a);y(w),E(null),k([]),p(null)}catch(w){s(await A(w)),y([])}finally{r("")}},[t.id,a]);(0,i.useEffect)(()=>{let b=!1;if(!S){o([]),g(void 0),ne(void 0);return}return r("\u52A0\u8F7D\u6A21\u5F0F\u5217\u8868\u2026"),M.schemas(t.id,a).then(({schemas:w})=>{if(b)return;o(w);let W=(a?w.find(G=>G.name==="public")??w.find(G=>G.name===t.schema)??w[0]:w.find(G=>G.name===t.schema)??w[0])?.name;g(W),W?ne(W):r("")}).catch(async w=>{b||s(await A(w)),r("")}),()=>{b=!0}},[t.id,S,a,ne]);let Me=async b=>{E(b),f(0),s(""),D(null),_(null),F(null),te({}),ee(null),z.current!==void 0&&(window.clearTimeout(z.current),z.current=void 0),r(`\u8BFB\u53D6\u300C${b.name}\u300D\u2026`);try{let[w,q]=await Promise.all([M.columns(t.id,b.name,n,a),M.rows(t.id,b.name,n,x,0,a)]);k(w.columns),p(q)}catch(w){s(await A(w)),k([]),p(null)}finally{r("")}},V=async(b,w,q)=>{if(v){z.current!==void 0&&(window.clearTimeout(z.current),z.current=void 0),r("\u67E5\u8BE2\u4E2D\u2026"),s(""),D(null),_(null);try{let W=h?.columns??[],G=w===null?null:w?.sort!==void 0?w.sort:N,Ie=w===null?{}:w?.filters!==void 0?w.filters:X,Be=tt(G,Ie,W),Fe=await M.rows(t.id,v.name,n,q??x,Math.max(0,b),a,Be);p(Fe),f(Math.max(0,b))}catch(W){s(await A(W))}finally{r("")}}},$e=b=>{let w=N?.col===b?N.dir:0,q=w===1?{col:b,dir:-1}:w===-1?null:{col:b,dir:1};F(q),ee(null),V(0,{sort:q,filters:X})},ze=(b,w)=>{let q={...X,[b]:w};te(q),z.current!==void 0&&window.clearTimeout(z.current),z.current=window.setTimeout(()=>{V(0,{sort:N,filters:q})},350)},Ae=()=>{F(null),te({}),ee(null),V(0,null)},ge=h?.columns??[],de=h?.rows??[],qe=N!==null||Object.values(X).some(b=>b.trim()!==""),ae=P&&h&&P.row<h.rows.length?h.rows[P.row]??null:null,gt=ae&&h?ae[P?.col??-1]:void 0;return(0,e.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"240px 1fr",gap:10,alignItems:"start"},children:[(0,e.jsxs)("div",{className:"db-card",style:{maxHeight:640,overflow:"auto"},children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsx)("span",{children:"\u{1F4DA} \u8868 / \u89C6\u56FE / \u96C6\u5408"}),a?(0,e.jsx)("span",{className:"db-badge db-badge-type",children:a}):null]}),S&&(0,e.jsx)("div",{style:{marginBottom:8},children:(0,e.jsx)("select",{style:{width:"100%"},value:n??"",onChange:b=>{let w=b.target.value;g(w||void 0),ne(w||void 0)},children:l.map(b=>(0,e.jsx)("option",{value:b.name,children:b.name},b.name))})}),R&&(0,e.jsx)("div",{className:"db-muted",style:{padding:"6px 0"},children:R}),m.length===0&&!R?(0,e.jsx)("div",{className:"db-empty",children:"\uFF08\u7A7A\uFF09"}):(0,e.jsx)("div",{className:"db-list",children:m.map(b=>(0,e.jsxs)("div",{className:`db-list-item ${v?.name===b.name?"db-active":""}`,onClick:()=>Me(b),children:[(0,e.jsx)("span",{children:b.kind==="view"?"\u{1F441}":b.kind==="collection"?"\u{1F4E6}":"\u{1F5C2}"}),(0,e.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:b.name}),(0,e.jsx)("span",{className:"db-badge",children:b.kind==="collection"?"\u96C6\u5408":b.kind==="view"?"\u89C6\u56FE":"\u8868"})]},`${b.name}-${b.kind}`))})]}),(0,e.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:10,minWidth:0},children:[(0,e.jsxs)("div",{className:"db-card",style:{padding:0},children:[(0,e.jsxs)("button",{className:"db-card-title db-structure-toggle",onClick:()=>u(b=>!b),title:T?"\u70B9\u51FB\u6298\u53E0":"\u70B9\u51FB\u5C55\u5F00",style:{width:"100%",cursor:"pointer",border:0,background:"none",textAlign:"left"},children:[(0,e.jsxs)("span",{children:[T?"\u25BE":"\u25B8"," \u{1F9EC} \u5B57\u6BB5\u7ED3\u6784",v?`\uFF1A${v.name}`:""]}),d.length>0?(0,e.jsxs)("span",{className:"db-badge db-badge-type",children:[d.length," \u4E2A\u5B57\u6BB5"]}):(0,e.jsx)("span",{className:"db-muted",children:"\uFF08\u9009\u62E9\u8868\u540E\u5C55\u5F00\u67E5\u770B\uFF09"})]}),T&&(0,e.jsx)("div",{style:{padding:"6px 10px 10px",borderTop:"1px solid var(--db-border, rgba(128,128,128,.25))"},children:d.length===0?(0,e.jsx)("div",{className:"db-empty",children:v?"\uFF08\u8BFB\u53D6\u5931\u8D25\u6216\u65E0\u5B57\u6BB5\uFF09":"\u5728\u5DE6\u4FA7\u9009\u62E9\u4E00\u5F20\u8868"}):(0,e.jsx)("div",{className:"db-list",children:d.map(b=>(0,e.jsxs)("div",{className:"db-list-item",style:{cursor:"default"},children:[(0,e.jsx)("span",{className:"db-grow",style:{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"var(--db-mono)"},children:b.name}),(0,e.jsx)("span",{className:"db-badge db-badge-type",style:{maxWidth:"45%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:b.type}),b.primary?(0,e.jsx)("span",{className:"db-badge",children:"PK"}):null,b.nullable===!1?(0,e.jsx)("span",{className:"db-badge",children:"NOT NULL"}):null]},b.name))})})]}),(0,e.jsxs)("div",{className:"db-card",children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsxs)("span",{children:["\u{1F50D} \u6570\u636E\u9884\u89C8",v?`\uFF1A${v.name}`:"",n&&S?`\uFF08${n}\uFF09`:""]}),h?(0,e.jsx)("span",{className:"db-muted",children:h.total!==void 0?`\u5171 ${h.total} \u884C \xB7 \u672C\u9875 ${h.rowCount}`:`${h.rowCount} \u884C \xB7 \u504F\u79FB ${c}`}):null]}),(0,e.jsx)(j,{kind:"error",text:L}),H&&(0,e.jsx)(j,{kind:H.kind==="ok"?"ok":"error",text:H.text}),qe&&v?(0,e.jsxs)("div",{className:"db-row",style:{margin:"2px 0 6px",gap:8},children:[(0,e.jsxs)("span",{className:"db-ok",children:["\u5DF2\u542F\u7528\u6574\u8868",Object.values(X).some(b=>b.trim()!=="")?"\u8FC7\u6EE4":"",N?"\u6392\u5E8F":""]}),(0,e.jsx)("button",{onClick:Ae,children:"\u6E05\u9664\u6392\u5E8F / \u8FC7\u6EE4"}),(0,e.jsx)("span",{className:"db-muted",style:{fontSize:11},children:"\u6392\u5E8F/\u8FC7\u6EE4\u7531\u6570\u636E\u5E93\u6267\u884C\uFF0C\u7FFB\u9875\u7EE7\u7EED\u751F\u6548"})]}):null,(0,e.jsxs)("div",{style:{display:"flex",alignItems:"stretch"},children:[(0,e.jsxs)("div",{className:"db-gridx",children:[h?de.length===0?(0,e.jsx)("div",{className:"db-empty",style:{padding:14},children:h.message??"\uFF08\u65E0\u6570\u636E\uFF09"}):(0,e.jsx)(Ee,{columns:ge,rows:de,active:P,onCellClick:(b,w)=>{D({row:b,col:w}),_(null)},interaction:t.type==="mongodb"?void 0:{sort:N,onSort:$e,filters:X,onFilter:ze,filterOpen:Oe,onFilterOpen:b=>ee(b)}}):(0,e.jsx)("div",{className:"db-empty",style:{padding:14},children:"\u5728\u5DE6\u4FA7\u9009\u62E9\u4E00\u5F20\u8868\uFF0C\u8FD9\u91CC\u663E\u793A\u6570\u636E\u9884\u89C8"}),(0,e.jsxs)("div",{className:"db-muted",style:{padding:"4px 2px",fontSize:12},children:["\u70B9\u51FB\u4EFB\u610F\u5355\u5143\u683C\u53EF\u5728\u53F3\u4FA7\u67E5\u770B / \u7F16\u8F91\uFF1B\u62D6\u52A8\u8868\u5934\u5206\u9694\u7EBF\u53EF\u8C03\u5217\u5BBD\uFF1B",t.type!=="mongodb"?"\u70B9\u51FB\u5217\u540D\u6392\u5E8F\u3001\u26B2 \u8FC7\u6EE4\uFF08\u4F5C\u7528\u4E8E\u6574\u8868\uFF09":""]})]}),P&&ae&&v&&(0,e.jsx)(at,{connection:t,table:v,schema:n,database:a,tableName:v.name,queryColumns:ge,metaColumns:d,row:ae,colIndex:P.col,onClose:()=>D(null),onSaved:()=>{V(c)},onMessage:(b,w)=>_({text:b,kind:w})},`${P.row}-${P.col}`)]}),h&&h.kind==="select"&&v&&(0,e.jsxs)("div",{className:"db-row",style:{marginTop:8,gap:8},children:[(0,e.jsx)("button",{disabled:c<=0,onClick:()=>V(c-x),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,e.jsx)("button",{disabled:h.total!==void 0?c+x>=h.total:de.length<x,onClick:()=>V(c+x),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,e.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875"}),(0,e.jsx)("select",{value:x,onChange:b=>{let w=Number(b.target.value);C(w),V(0,void 0,w)},children:[50,200,500,1e3,5e3].map(b=>(0,e.jsx)("option",{value:b,children:b},b))})]})]})]})]})}function st(t,a){if(t==null)return a==null?0:1;if(a==null)return-1;if(typeof t=="number"&&typeof a=="number")return t<a?-1:t>a?1:0;let l=Q(t),o=Q(a),n=Number(l),g=Number(o);return l!==""&&o!==""&&Number.isFinite(n)&&Number.isFinite(g)?n<g?-1:n>g?1:0:l.localeCompare(o,void 0,{numeric:!0,sensitivity:"base"})}function Te({result:t,limit:a,onLimitChange:l}){let[o,n]=(0,i.useState)(0),g=Math.max(1,a),[m,y]=(0,i.useState)(null),[v,E]=(0,i.useState)({}),[d,k]=(0,i.useState)(null),h=t?.columns??[],p=t?.rows??[];(0,i.useEffect)(()=>{n(0),y(null),E({}),k(null)},[t]);let c=(0,i.useMemo)(()=>{let s=Object.entries(v).filter(S=>S[1].trim()!=="");return s.length===0?p:p.filter(S=>s.every(([T,u])=>{let P=Number(T);return Q(S[P]).toLowerCase().includes(u.trim().toLowerCase())}))},[p,v]),f=(0,i.useMemo)(()=>{if(!m)return c;let s=m.col,S=m.dir;return[...c].sort((T,u)=>st(T[s],u[s])*S)},[c,m]),x=p.length,C=f.length,R=Math.max(1,Math.ceil(C/g));(0,i.useEffect)(()=>{n(s=>Math.min(s,R-1))},[R]);let r=f.slice(o*g,(o+1)*g);return!t||t.columns.length===0?(0,e.jsxs)("div",{children:[(0,e.jsx)("div",{className:"db-empty",children:t?.kind==="change"?t.message??`\u5DF2\u6267\u884C\uFF08\u5F71\u54CD ${t.affectedRows??0} \u884C\uFF09`:t?.message??"\u6267\u884C\u540E\u7ED3\u679C\u663E\u793A\u5728\u8FD9\u91CC\uFF08\u7ED3\u679C\u6700\u591A\u663E\u793A 10000 \u884C\uFF09"}),t?(0,e.jsx)(Ce,{result:t}):null]}):(0,e.jsxs)("div",{children:[(0,e.jsx)(Ce,{result:t}),(0,e.jsx)(Ee,{columns:h,rows:r,active:null,onCellClick:()=>{},interaction:{sort:m,onSort:s=>{let S=m?.col===s?m.dir:0;y(S===1?{col:s,dir:-1}:S===-1?null:{col:s,dir:1})},filters:v,onFilter:(s,S)=>{E(T=>({...T,[s]:S}))},filterOpen:d,onFilterOpen:s=>k(s)}}),r.length===0?(0,e.jsx)("div",{className:"db-empty",children:"\uFF08\u6CA1\u6709\u5339\u914D\u7684\u884C\uFF09"}):null,(0,e.jsxs)("div",{className:"db-row",style:{marginTop:6,gap:8},children:[(0,e.jsx)("button",{disabled:o<=0,onClick:()=>n(s=>Math.max(0,s-1)),children:"\u2190 \u4E0A\u4E00\u9875"}),(0,e.jsx)("button",{disabled:o>=R-1,onClick:()=>n(s=>Math.min(R-1,s+1)),children:"\u4E0B\u4E00\u9875 \u2192"}),(0,e.jsxs)("span",{className:"db-muted",children:["\u7B2C ",o+1,"/",R," \u9875 \xB7 \u5171 ",C," \u884C",C!==x?`\uFF08\u5DF2\u53D6\u56DE ${x} \u884C\uFF09`:""]}),(0,e.jsx)("span",{className:"db-muted",children:"\u6BCF\u9875/\u6700\u591A\u53D6"}),(0,e.jsx)("select",{value:g,title:"\u6BCF\u9875\u884C\u6570 = \u672C\u6B21\u6267\u884C\u6700\u591A\u53D6\u56DE\u7684\u884C\u6570\uFF1B\u8C03\u5927\u540E\u8BF7\u91CD\u65B0\u6267\u884C\u4EE5\u53D6\u66F4\u591A\u6570\u636E",onChange:s=>{l(Number(s.target.value)),n(0)},children:[200,500,1e3,5e3].map(s=>(0,e.jsx)("option",{value:s,children:s},s))})]})]})}function rt({connection:t,database:a}){let[l,o]=(0,i.useState)(""),[n,g]=(0,i.useState)(!0),[m,y]=(0,i.useState)(null),[v,E]=(0,i.useState)(!1),[d,k]=(0,i.useState)(""),[h,p]=(0,i.useState)(200),c=async f=>{let x=(f??l).trim();if(!x){k("\u8BF7\u8F93\u5165 SQL");return}E(!0),k("");try{y(await M.query(t.id,x,n,h,a))}catch(C){k(await A(C)),y(null)}finally{E(!1)}};return(0,e.jsxs)("div",{className:"db-card",children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsxs)("span",{children:["\u2328\uFE0F SQL \u63A7\u5236\u53F0\uFF1A",t.name]}),a?(0,e.jsxs)("span",{className:"db-badge db-badge-type",children:["\u5E93\uFF1A",a]}):null,(0,e.jsx)("span",{className:"db-muted",children:t.type==="mongodb"?"\u63D0\u793A\uFF1A\u8FD9\u91CC\u4E5F\u63A5\u53D7 JSON \u67E5\u8BE2\uFF08\u5E26 collection \u5B57\u6BB5\uFF09":"\u63D0\u793A\uFF1A\u591A\u6761\u8BED\u53E5\u4EC5\u5728\u975E\u53EA\u8BFB\u65F6\u5141\u8BB8"})]}),(0,e.jsx)("textarea",{className:"db-code",value:l,onChange:f=>o(f.target.value),placeholder:t.type==="mongodb"?'{"collection":"users","filter":{"age":{"$gt":18}},"limit":50}':`SELECT * FROM \u8868\u540D LIMIT 100;
-- \u53EA\u8BFB\u6A21\u5F0F\u9ED8\u8BA4\u5F00\u542F`,spellCheck:!1}),(0,e.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,e.jsxs)("label",{className:"db-row",style:{cursor:"pointer",gap:6},children:[(0,e.jsx)("input",{type:"checkbox",checked:n,onChange:f=>g(f.target.checked)})," \u53EA\u8BFB\u6A21\u5F0F\uFF08\u63A8\u8350\uFF09"]}),(0,e.jsx)("div",{className:"db-grow"}),(0,e.jsx)("button",{className:"db-btn-primary",onClick:()=>c(),disabled:v,children:v?"\u6267\u884C\u4E2D\u2026":"\u6267\u884C (Ctrl+Enter)"})]}),(0,e.jsx)(j,{kind:"error",text:d}),(0,e.jsx)(Te,{result:m,limit:h,onLimitChange:p})]})}function lt({connection:t,database:a}){let[l,o]=(0,i.useState)(""),[n,g]=(0,i.useState)(null),[m,y]=(0,i.useState)(null),[v,E]=(0,i.useState)(""),[d,k]=(0,i.useState)(""),[h,p]=(0,i.useState)(""),[c,f]=(0,i.useState)(200),[x,C]=(0,i.useState)(null),[R,r]=(0,i.useState)(-1),L=(0,i.useMemo)(()=>(x?.providers??[]).flatMap(u=>{let P=u.label&&u.label.length>0?`${u.label}\uFF08${u.provider}\uFF09`:u.provider;return u.models.length===0?[{provider:u.provider,label:`${P} \xB7 \u9ED8\u8BA4\u6A21\u578B`}]:u.models.map(D=>({provider:u.provider,model:D.id,label:`${P} / ${D.label&&D.label.length>0?D.label:D.id}`}))}),[x]),s=()=>{let u=R>=0?L[R]:void 0;if(u)return{...u.provider?{provider:u.provider}:{},...u.model?{model:u.model}:{}}};(0,i.useEffect)(()=>{let u=!1;return M.aiModels().then(P=>{u||C(P)}).catch(()=>{u||C(null)}),()=>{u=!0}},[]);let S=async()=>{if(!l.trim()){p("\u8BF7\u8F93\u5165\u8981\u67E5\u8BE2\u7684\u95EE\u9898");return}k("AI \u751F\u6210 SQL \u4E2D\u2026"),p("");try{let u=await M.aiGenerate(t.id,l,s(),a);g(u),E(u.sql),y(null)}catch(u){p(await A(u))}finally{k("")}},T=async()=>{if(!v.trim()&&!l.trim()){p("\u6CA1\u6709\u53EF\u6267\u884C\u7684 SQL\uFF0C\u8BF7\u5148\u751F\u6210\u6216\u586B\u5199");return}k("\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"),p("");try{let u=await M.aiRun(t.id,l||v,s(),c,a);y(u),g({sql:u.sql,engine:u.engine,provider:u.provider,model:u.model,note:u.note}),E(u.sql)}catch(u){p(await A(u))}finally{k("")}};return(0,e.jsxs)("div",{className:"db-card",children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsxs)("span",{children:["\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\uFF1A",t.name]}),a?(0,e.jsxs)("span",{className:"db-badge db-badge-type",children:["\u5E93\uFF1A",a]}):null,(0,e.jsx)("span",{className:"db-muted",children:"\u6A21\u578B\u590D\u7528 DSH \u914D\u7F6E\uFF0C\u65E0\u9700\u5728\u63D2\u4EF6\u4E2D\u586B Key"})]}),(0,e.jsxs)("div",{className:"db-row",style:{gap:8,margin:"2px 0 8px"},children:[(0,e.jsx)("label",{className:"db-muted",style:{whiteSpace:"nowrap"},children:"\u6309\u9700\u9009\u6A21\u578B\uFF1A"}),(0,e.jsxs)("select",{value:R,onChange:u=>r(Number(u.target.value)),style:{maxWidth:420},children:[(0,e.jsx)("option",{value:-1,children:"\u81EA\u52A8\uFF08\u7531 DSH \u9009\u62E9\uFF09"}),L.map((u,P)=>(0,e.jsx)("option",{value:P,children:u.label},P))]}),x&&!x.ok?(0,e.jsx)("span",{className:"db-badge",style:{color:"var(--db-err)",borderColor:"rgba(255,95,86,.4)"},children:x.message??"\u6A21\u578B\u670D\u52A1\u4E0D\u53EF\u7528"}):null,x===null?(0,e.jsx)("span",{className:"db-muted",children:"\uFF08\u8BFB\u53D6 DSH \u6A21\u578B\u5217\u8868\u4E2D\u2026\uFF09"}):null]}),(0,e.jsx)("textarea",{className:"db-code",style:{minHeight:90},value:l,onChange:u=>o(u.target.value),placeholder:"\u4F8B\u5982\uFF1A\u7EDF\u8BA1\u672C\u6708\u6BCF\u4E2A\u57CE\u5E02\u7684\u4E0B\u5355\u7528\u6237\u6570\u548C\u8BA2\u5355\u603B\u989D\uFF0C\u6309\u57CE\u5E02\u6392\u5E8F",spellCheck:!1}),(0,e.jsxs)("div",{className:"db-row",style:{margin:"8px 0"},children:[(0,e.jsx)("button",{className:"db-btn-primary",onClick:S,disabled:d!==""||!l.trim(),children:d==="AI \u751F\u6210 SQL \u4E2D\u2026"?"\u751F\u6210\u4E2D\u2026":"\u751F\u6210 SQL"}),(0,e.jsx)("button",{disabled:d!==""||!l.trim(),onClick:T,children:d==="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?"\u6267\u884C\u4E2D\u2026":"\u751F\u6210\u5E76\u76F4\u63A5\u67E5\u8BE2"}),(0,e.jsx)("div",{className:"db-grow"}),(0,e.jsx)("button",{className:"db-btn-ghost",onClick:()=>{g(null),E(""),y(null)},children:"\u6E05\u7A7A"})]}),(0,e.jsx)(j,{kind:"error",text:h}),d&&d!=="AI \u751F\u6210 SQL \u4E2D\u2026"&&d!=="\u6267\u884C\u67E5\u8BE2\u4E2D\u2026"?(0,e.jsx)("div",{className:"db-muted",children:d}):null,n&&(0,e.jsxs)("div",{className:"db-card",style:{background:"var(--db-panel-2)"},children:[(0,e.jsxs)("div",{className:"db-card-title",children:[(0,e.jsx)("span",{children:"\u{1F916} \u751F\u6210\u7684 SQL\uFF08\u53EF\u4FEE\u6539\u540E\u6267\u884C\uFF09"}),(0,e.jsxs)("span",{className:"db-muted",children:[n.engine==="custom"?"\u81EA\u5B9A\u4E49\u7AEF\u70B9":"DSH \u6A21\u578B",n.provider?` \xB7 ${n.provider}${n.model?`/${n.model}`:""}`:"",n.note?` \xB7 ${n.note}`:""]})]}),(0,e.jsx)("textarea",{className:"db-code",value:v,onChange:u=>E(u.target.value),spellCheck:!1,style:{minHeight:110}}),(0,e.jsx)("div",{className:"db-row",style:{marginTop:8},children:(0,e.jsx)("button",{className:"db-btn-primary",onClick:T,disabled:d!=="",children:"\u6267\u884C\u6B64 SQL\uFF08\u53EA\u8BFB\uFF09"})})]}),m&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("div",{className:"db-divider"}),(0,e.jsx)(Te,{result:m.result,limit:c,onLimitChange:f})]}),n&&!m&&(0,e.jsx)("div",{className:"db-divider"})]})}function be(t={}){let[a,l]=(0,i.useState)([]),[o,n]=(0,i.useState)(null),[g,m]=(0,i.useState)("connections"),[y,v]=(0,i.useState)({level:"info",text:"\u52A0\u8F7D\u4E2D\u2026"}),[E,d]=(0,i.useState)(!1),k=(0,i.useRef)(!0),[h,p]=(0,i.useState)([]),[c,f]=(0,i.useState)(""),x=s=>s==="postgresql"||s==="mysql";(0,i.useEffect)(()=>{f("");let s=o?.id,S=o?.type;if(p([]),!s||!x(S))return;let T=!1;return M.databases(s).then(u=>{!T&&u.supported&&p(u.databases)}).catch(()=>{T||p([])}),()=>{T=!0}},[o?.id,o?.type]);let C=(0,i.useCallback)(async()=>{d(!0);try{let{connections:s}=await M.connections();l(s),n(S=>S?s.find(T=>T.id===S.id)??null:null),s.length===0?v({level:"info",text:"\u5C1A\u672A\u914D\u7F6E\u8FDE\u63A5"}):v({level:"info",text:`${s.length} \u4E2A\u8FDE\u63A5\u5DF2\u52A0\u8F7D`})}catch(s){let S=await A(s);v({level:"error",text:`\u52A0\u8F7D\u8FDE\u63A5\u5217\u8868\u5931\u8D25\uFF1A${S}\uFF08\u8BF7\u786E\u8BA4\u63D2\u4EF6\u5DF2\u5728 DSH \u4E2D\u542F\u7528\uFF09`})}finally{d(!1)}},[]);(0,i.useEffect)(()=>{k.current&&(k.current=!1,C())},[C]);let R=s=>{n(s),m("browse")},r=s=>{n(s),m("sql")},L=s=>{if(s==="__manage"){m("connections");return}let S=a.find(T=>T.id===s)??null;n(S),S&&g==="browse"&&m("browse")};return(0,e.jsxs)("div",{style:{maxWidth:1240,margin:"0 auto",padding:"4px 0 40px"},children:[(0,e.jsxs)("div",{className:"db-topbar",children:[(0,e.jsxs)("div",{className:"db-title",children:[(0,e.jsx)("span",{className:"db-logo",children:"DB"})," \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",(0,e.jsx)("span",{className:"db-badge db-badge-type",children:"dsh-database-console"})]}),(0,e.jsx)("div",{className:"db-grow"}),E?(0,e.jsx)("span",{className:"db-muted",children:"\u2026"}):null,t.onClose?(0,e.jsx)("button",{onClick:t.onClose,title:"\u5173\u95ED\u9762\u677F\uFF0C\u56DE\u5230\u5BF9\u8BDD",children:t.standalone?"\u2715 \u5173\u95ED":"\u2715 \u56DE\u5230\u5BF9\u8BDD"}):null]}),(0,e.jsxs)("div",{className:"db-seg",style:{marginBottom:10},children:[(0,e.jsx)("button",{className:g==="connections"?"db-active":"",onClick:()=>m("connections"),children:"\u{1F50C} \u8FDE\u63A5\u7BA1\u7406"}),(0,e.jsx)("button",{className:g==="browse"?"db-active":"",disabled:!o,onClick:()=>m("browse"),children:"\u{1F4DA} \u6570\u636E\u6D4F\u89C8"}),(0,e.jsx)("button",{className:g==="sql"?"db-active":"",disabled:!o,onClick:()=>m("sql"),children:"\u2328\uFE0F SQL \u63A7\u5236\u53F0"}),(0,e.jsx)("button",{className:g==="ai"?"db-active":"",disabled:!o,onClick:()=>m("ai"),children:"\u{1F4AC} \u81EA\u7136\u8BED\u8A00\u67E5\u8BE2"})]}),y.text.startsWith("\u52A0\u8F7D\u8FDE\u63A5\u5217\u8868\u5931\u8D25")||y.level==="error"?(0,e.jsx)(j,{kind:"error",text:y.text}):null,o&&(0,e.jsxs)("div",{className:"db-row",style:{marginBottom:10,gap:8},children:[(0,e.jsx)("label",{className:"db-muted",children:"\u5F53\u524D\u8FDE\u63A5\uFF1A"}),(0,e.jsxs)("select",{value:o.id,onChange:s=>L(s.target.value),children:[a.map(s=>(0,e.jsxs)("option",{value:s.id,children:[s.name,"\uFF08",K[s.type],"\uFF09"]},s.id)),(0,e.jsx)("option",{value:"__manage",children:"\u2192 \u53BB\u8FDE\u63A5\u7BA1\u7406\u2026"})]}),x(o.type)&&h.length>0&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("label",{className:"db-muted",children:"\u6570\u636E\u5E93\uFF1A"}),(0,e.jsxs)("select",{value:c,onChange:s=>f(s.target.value),title:"\u5207\u6362\u540E\u6D4F\u89C8/\u63A7\u5236\u53F0/AI \u5747\u9488\u5BF9\u6240\u9009\u5E93",children:[(0,e.jsxs)("option",{value:"",children:["\u9ED8\u8BA4\uFF08",o.database||"\u767B\u5F55\u7528\u6237\u9ED8\u8BA4\u5E93","\uFF09"]}),h.map(s=>(0,e.jsx)("option",{value:s,children:s},s))]})]}),(0,e.jsx)("button",{className:"db-btn-ghost",onClick:()=>r(o),children:"\u6253\u5F00 SQL \u63A7\u5236\u53F0"})]}),(0,e.jsx)("div",{style:{display:g==="connections"?"block":"none"},children:(0,e.jsx)(et,{connections:a,onRefresh:C,onOpen:R})}),o&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("div",{style:{display:g==="browse"?"block":"none"},children:(0,e.jsx)(ot,{connection:o,database:c||void 0})}),(0,e.jsx)("div",{style:{display:g==="sql"?"block":"none"},children:(0,e.jsx)(rt,{connection:o,database:c||void 0})}),(0,e.jsx)("div",{style:{display:g==="ai"?"block":"none"},children:(0,e.jsx)(lt,{connection:o,database:c||void 0})})]})]})}var ue=I("react/jsx-runtime");function Re(t){let a=(0,Y.useSyncExternalStore)($.subscribe,$.getSnapshot,$.getSnapshot),[l,o]=(0,Y.useState)(dt);return(0,Y.useEffect)(()=>{if(typeof document>"u")return;let n=document.querySelector('[class*="sidebarCol"]');if(n===null)return;let g=()=>{let y=n.getBoundingClientRect();y.width>0&&o(y.width)};g();let m=new ResizeObserver(g);return m.observe(n),()=>m.disconnect()},[]),!a.panelOpen&&!t.standalone?null:(0,ue.jsx)("div",{id:"dsh-database-console",style:{position:"absolute",left:l,top:0,right:0,bottom:0,background:"var(--db-bg)",display:"flex",flexDirection:"column",overflow:"auto",zIndex:1},children:(0,ue.jsx)(be,{onClose:t.onClose,standalone:t.standalone})})}var dt=280;var le=`/* dsh-database-console \u5BA2\u6237\u7AEF\u6837\u5F0F\uFF08\u6697\u8272\u4E3B\u9898\uFF0C\u65E0\u5916\u90E8\u4F9D\u8D56\uFF09 */
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
`;var Pe="dsh-database-console-style";function pe(){if(typeof document>"u")return()=>{};let t=document.getElementById(Pe);if(t!==null&&t.isConnected)return()=>{};let a=document.createElement("style");return a.id=Pe,a.setAttribute("data-plugin","dsh-database-console"),a.textContent=le,document.head.appendChild(a),()=>{a.isConnected&&a.remove()}}var Z="database",Le={"sidebar.label":"\u6570\u636E\u5E93","sidebar.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","sidebar.title":"\u6253\u5F00\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0","overlay.aria":"\u6570\u636E\u5E93\u5DE5\u4F5C\u53F0\u9762\u677F","overlay.close":"\u56DE\u5230\u5BF9\u8BDD","toolbar.open":"\u6253\u5F00\u6570\u636E\u5E93","toolbar.close":"\u5173\u95ED\u6570\u636E\u5E93"},De={"sidebar.label":"Database","sidebar.aria":"Database console","sidebar.title":"Open database console","overlay.aria":"Database console panel","overlay.close":"Back to conversation","toolbar.open":"Open database","toolbar.close":"Close database"};var ct=["slots","locale"];function bt({renderSlot:t,standalone:a=!1}){return!xe().panelOpen&&!a?null:t("database.console",{onClose:()=>$.close(),standalone:a})}function ut(t){let a=t?.slots,l=t?.locale;if(!a||!l){typeof document<"u"&&t?.effect?.(()=>me(),"dsh-database-console: standalone preview");return}let o=l.bind(Z),n=l.register(Z,{zh:Le,en:De}),g=pe(),m=a.inject("sidebar.footer.action",()=>a.register({name:"sidebar.footer.action",id:"database",order:-10,locale:Z,label:()=>o("sidebar.label")},we)),y=a.inject("database.console",()=>a.register({name:"database.console",id:"dsh",order:0,locale:Z,label:()=>o("sidebar.aria"),children:{"database.console.toolbar":{kind:"list",scope:"root"}}},Re)),v=a.inject("shell.overlay",()=>a.register({name:"shell.overlay",id:"database.console",order:60,locale:Z,label:()=>o("sidebar.aria"),children:{"database.console":{kind:"single",scope:"root"}}},bt));t?.effect&&t.effect(()=>()=>{n(),m(),y(),v(),g()},"dsh-database-console: plugin teardown")}function me(){if(typeof document>"u"||document.getElementById("dsh-database-standalone-button")!==null)return;pe();let t=document.createElement("button");t.id="dsh-database-standalone-button",t.textContent="\u{1F5C4} \u6570\u636E\u5E93\u5DE5\u4F5C\u53F0",t.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483000","background:linear-gradient(135deg,#4c8dff,#7b61ff)","color:#fff","border:0","border-radius:999px","padding:10px 18px","font:600 13px/1.4 system-ui,sans-serif","cursor:pointer","box-shadow:0 6px 18px rgba(0,0,0,.35)"].join(";"),t.addEventListener("click",()=>$.toggle()),document.body.appendChild(t)}var pt=globalThis;!pt.window?.__ModuleLoader__&&typeof document<"u"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>me(),{once:!0}):me());return We(mt);})();
    return __dsh_db_console_module__;
  },
});
