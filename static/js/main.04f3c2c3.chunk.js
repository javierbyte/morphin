(this.webpackJsonpmorphin=this.webpackJsonpmorphin||[]).push([[0],{27:function(e,t,n){"use strict";n.r(t);var r=n(2),i=n(8),s=n.n(i),a=n(9),c=n.n(a),h=n(3);function o(e){const t=e.toString(16);return 1==t.length?"0"+t:t}var l=function(e){const t=`rgb(${e.r},${e.g},${e.b},${Math.ceil(e.a/255*10)/10})`;if(e.a<240)return t;const n=(r=e.r,i=e.g,s=e.b,"#"+o(r)+o(i)+o(s));var r,i,s;switch(n){case"#c0c0c0":return"silver";case"#808080":return"gray";case"#800000":return"maroon";case"#ff0000":return"red";case"#800080":return"purple";case"#008000":return"green";case"#808000":return"olive";case"#000080":return"navy";case"#008080":return"teal"}return n[1]===n[2]&&n[3]===n[4]&&n[5]===n[6]?"#"+n[1]+n[3]+n[5]:n};var j=function(e,t){const n=new Image;n.crossOrigin="Anonymous",n.onload=function(){let e=document.createElement("CANVAS");const n=e.getContext("2d");e.height=this.height,e.width=this.width,n.drawImage(this,0,0);const r=e.toDataURL();t(r),e=null},n.src=e},d=n(10),b=n.n(d),x=n(1),g=n(0);const{base64ImageToRGBArray:p}=b.a,O=h.b.img((({width:e,height:t})=>({height:28/Math.max(t,e)*t,width:28/Math.max(t,e)*e,display:"block",imageRendering:"pixelated"}))),u={Yoshi:{name:"Yoshi",sprites:["yoshi1.png","yoshi2.png"]},"3 Dots":{name:"3 Dots",sprites:["3dots1.png","3dots2.png"],scale:8,transition:80,alternate:!1,sortMethod:"Brightness"},Square:{name:"Square",sprites:["square1.png","square2.png"],scale:12,transition:100,alternate:!1,sortMethod:"Brightness"},Mario:{name:"Mario",sprites:["mario1.png","mario2.png"]},Pikachu:{name:"Pikachu",sprites:["pikachu.png","raichu.png"],sortMethod:"Brightness"},Supermario:{name:"Super Mario",sprites:["supermario1.png","supermario2.png"],sortMethod:"Horizontal"}};const m={Diagonal:[e=>Math.floor((e.x-e.y)/3),e=>e.rgb.r+e.rgb.g+e.rgb.b],Vertical:[e=>e.x],Horizontal:[e=>e.y],Brightness:[e=>Math.floor((e.rgb.r+e.rgb.g+e.rgb.b)/2)]};function f(e,{sortMethod:t="Brightness",scale:n=1}){return c.a.chain(e).filter((e=>!(e.rgb.a<1||e.rgb.r>254&&e.rgb.g>254&&e.rgb.b>254))).sortBy(m[t]).map((e=>`${l(e.rgb)} ${(e.x+1)*n}px ${(e.y+1)*n}px`)).compact().value().join(",")}function w(e,t,n){j(e,(e=>{p(e,((t,r)=>{const i=r.reduce(((e,t)=>Math.max(e,t.y)),-1/0),s=r.reduce(((e,t)=>Math.min(e,t.y)),1/0),a=r.reduce(((e,t)=>Math.max(e,t.x)),-1/0),c=r.reduce(((e,t)=>Math.min(e,t.x)),1/0);n({src:e,rgbArray:r,height:Math.abs(i-s)+1,width:Math.abs(a-c)+1})}))}))}var v=function(){const[e,t]=Object(r.useState)(Math.round(Math.pow(1e3,1/2.2))),n=Math.round(Math.pow(e,2.2))+11+16,[i,s]=Object(r.useState)(25),[a,c]=Object(r.useState)(!0),[h,o]=Object(r.useState)("Yoshi"),[l,j]=Object(r.useState)("Vertical"),[d,b]=Object(r.useState)(5),[p,v]=Object(r.useState)({shadow:null,height:5,width:5}),[y,M]=Object(r.useState)({shadow:null,height:5,width:5});Object(r.useEffect)((()=>{h&&(w(`${document.location.href}/sprites/${u[h].sprites[0]}`,0,v),w(`${document.location.href}/sprites/${u[h].sprites[1]}`,0,M),v({shadow:null,height:0,width:0}),M({shadow:null,height:0,width:0}),b(u[h].scale||3),s(u[h].transition||25),c(void 0===u[h].alternate||u[h].alternate),j(u[h].sortMethod||"Vertical"))}),[h]);const S=Math.max(p.width,y.width)*d,q=Math.max(p.height,y.height)*d,C=`\n@keyframes morphin {\n  0%, ${50-i/2}% {\n    box-shadow: ${f(p.rgbArray,{scale:d,sortMethod:l,translationX:S/-2,translationY:q/-2})};\n  }\n  ${50+i/2}%, 100% {\n    box-shadow: ${f(y.rgbArray,{scale:d,sortMethod:l,translationX:S/-2,translationY:q/-2})};\n  }\n}\n\n.pixel {\n  height: ${d}px;\n  width: ${d}px;\n  margin: ${-d}px ${q+2*d}px ${S+2*d}px ${-d}px;\n  animation: morphin ${n}ms infinite${a?" alternate ":" "}cubic-bezier(0.45, 0, 0.55, 1);\n}`.trim();function $(e,t,n){o(null),e.stopPropagation(),e.preventDefault();const r=e.dataTransfer,i=(r?r.files:e.target.files)[0],s=new window.FileReader;s.onload=async e=>{const n=e.currentTarget.result,[r]=await function(e,t=3200){return new Promise((n=>{let r=new Image;r.src=e,r.onload=()=>{let e=document.createElement("canvas");const i=r.width,s=r.height;let a=r.width,c=r.height;for(;a*c>t;)a/=Math.sqrt(2,2),c/=Math.sqrt(2,2);a=Math.round(a),c=Math.round(c),e.width=a,e.height=c,e.getContext("2d").drawImage(r,0,0,a,c),n([e.toDataURL(),{originalWidth:i,originalHeight:s}])}}))}(n);w(r,0,t)},s.readAsDataURL(i)}function k(e){e.stopPropagation(),e.preventDefault()}return Object(g.jsxs)(x.e,{children:[Object(g.jsx)(x.j,{accent:"#ab99cf"}),Object(g.jsx)(x.l,{children:"morphin"}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)(x.q,{children:"Tool that creates animated CSS transitions. Add sprites and get the code ready to paste in your site."}),Object(g.jsx)(x.n,{h:2}),Object(g.jsx)(x.p,{children:Object(g.jsxs)(x.i,{children:[Object(g.jsx)(x.o,{info:!0,children:Object(g.jsx)(x.q,{children:"Examples: "})}),Object.keys(u).map((e=>Object(g.jsx)(x.o,{active:h===e,onClick:()=>{o(e)},children:Object(g.jsx)(x.q,{children:e})},e)))]})}),Object(g.jsx)(x.n,{h:1}),Object(g.jsxs)(x.i,{children:[Object(g.jsxs)(x.f,{onDrop:e=>$(e,v),onDragOver:k,onDragEnter:k,children:[Object(g.jsx)("div",{style:{display:"flex",height:48,width:48,alignItems:"center",alignContent:"center",justifyContent:"center"},children:Object(g.jsx)(O,{width:p.width,height:p.height,"aria-label":"Sprite A",src:p.src})}),Object(g.jsx)(x.q,{children:"Sprite 1"}),Object(g.jsx)("input",{type:"file",onChange:e=>$(e,v),accept:"image/*","aria-label":"Drop an image here, or click to select"})]}),Object(g.jsx)(x.n,{h:1,w:1}),Object(g.jsxs)(x.f,{onDrop:e=>$(e,M),onDragOver:k,onDragEnter:k,children:[Object(g.jsx)("div",{style:{display:"flex",height:48,width:48,alignItems:"center",alignContent:"center",justifyContent:"center"},children:Object(g.jsx)(O,{width:y.width,height:y.height,"aria-label":"Sprite B",src:y.src})}),Object(g.jsx)(x.q,{children:"Sprite 2"}),Object(g.jsx)("input",{type:"file",onChange:e=>$(e,M),accept:"image/*","aria-label":"Drop an image here, or click to select"})]})]}),Object(g.jsx)(x.n,{h:2}),Object(g.jsx)(x.g,{children:"Preview"}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)("style",{children:C}),Object(g.jsx)("div",{className:"pixel"},C),Object(g.jsx)(x.n,{h:2}),Object(g.jsx)(x.p,{children:Object(g.jsxs)(x.i,{children:[Object(g.jsx)(x.o,{info:!0,children:Object(g.jsx)(x.q,{children:"Pixel matching method:"})}),Object.keys(m).map((e=>Object(g.jsx)(x.o,{active:l===e,onClick:()=>{j(e)},children:Object(g.jsx)(x.q,{children:e})},e)))]})}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)(x.p,{children:Object(g.jsxs)(x.i,{children:[Object(g.jsx)(x.o,{info:!0,children:Object(g.jsx)(x.q,{children:"Alternate:"})}),Object(g.jsx)(x.o,{active:!0===a,onClick:()=>{c(!0)},children:Object(g.jsx)(x.q,{children:"Yes"})}),Object(g.jsx)(x.o,{active:!1===a,onClick:()=>{c(!1)},children:Object(g.jsx)(x.q,{children:"No"})})]})}),Object(g.jsx)(x.n,{h:1}),Object(g.jsxs)(x.i,{h:-1,children:[Object(g.jsxs)(x.b,{flex:1,padding:[.5,1],minWidth:"240px",children:[Object(g.jsxs)(x.q,{children:["Scale ",Object(g.jsx)("span",{style:{color:"#666"},children:d})]}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)(x.m,{"aria-label":"Scale",type:"range",value:d,onChange:e=>b(Number(e.target.value)),min:"1",max:"25",step:"0.5"})]}),Object(g.jsxs)(x.b,{flex:1,padding:[.5,1],minWidth:"240px",children:[Object(g.jsxs)(x.q,{children:["Transition"," ",Object(g.jsxs)("span",{style:{color:"#666"},children:[i,"%"]})]}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)(x.m,{"aria-label":"Transition Speed",type:"range",value:i,onChange:e=>s(e.target.value),min:"1",max:"100"})]}),Object(g.jsxs)(x.b,{flex:1,padding:[.5,1],minWidth:"240px",children:[Object(g.jsxs)(x.q,{children:["Speed ",Object(g.jsxs)("span",{style:{color:"#666"},children:[n,"ms"]})]}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)(x.m,{"aria-label":"Animation Speed",type:"range",value:e,onChange:e=>t(e.target.value),step:"0.5",min:"2",max:Math.ceil(Math.pow(8192,1/2.2))})]})]}),Object(g.jsx)(x.n,{h:2}),Object(g.jsx)(x.h,{children:"Code"}),Object(g.jsx)(x.n,{h:1}),Object(g.jsx)("code",{children:Object(g.jsx)(x.d,{"aria-label":"Generated code",onChange:()=>{},className:"code",value:C})}),Object(g.jsx)(x.n,{h:1}),navigator&&navigator.clipboard&&navigator.clipboard.writeText&&Object(g.jsx)(x.c,{onClick:()=>{navigator.clipboard.writeText(C)},children:"Copy Code"}),Object(g.jsx)(x.n,{h:2}),Object(g.jsxs)(x.q,{children:["For a simpler image to box-shadow conversion, see"," ",Object(g.jsx)(x.a,{href:"https://javier.xyz/img2css/",children:"img2css"}),"."]}),Object(g.jsx)(x.n,{h:2}),Object(g.jsx)(x.q,{children:"More unrelated experiments"}),Object(g.jsx)(x.n,{h:.5}),Object(g.jsx)(x.q,{children:Object(g.jsxs)(x.r,{children:[Object(g.jsxs)(x.k,{children:["Create more cohesive color schemes, ",Object(g.jsx)(x.a,{href:"https://javier.xyz/cohesive-colors/",children:"cohesive-colors"}),"."]}),Object(g.jsxs)(x.k,{children:["Find the visual center of your images / logos,"," ",Object(g.jsx)(x.a,{href:"https://javier.xyz/visual-center/",children:"visual-center"}),"."]}),Object(g.jsxs)(x.k,{children:["JS AI Battle Game, ",Object(g.jsx)(x.a,{href:"https://clashjs.com/",children:"clashjs"}),"."]})]})}),Object(g.jsx)(x.n,{h:2}),Object(g.jsxs)(x.q,{children:["Made by ",Object(g.jsx)(x.a,{href:"https://javier.xyz",children:"javierbyte"}),"."]})]})};s.a.render(Object(g.jsx)(v,{}),document.getElementById("root"))}},[[27,1,2]]]);
//# sourceMappingURL=main.04f3c2c3.chunk.js.map