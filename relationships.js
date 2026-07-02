function relationshipSelections(){const out=[];selectedNodes.forEach((set,id)=>set.forEach(i=>out.push({id,i,v:data.variables.find(v=>v.id===id)})));return out}

function relationshipLayout(edges,source,W=420,H=220){
  const map=new Map;
  edges.forEach(e=>{map.set(e.a.id+":"+e.ai,{key:e.a.id+":"+e.ai,v:e.a,i:e.ai});map.set(e.b.id+":"+e.bi,{key:e.b.id+":"+e.bi,v:e.b,i:e.bi})});
  if(source?.v)map.set(source.id+":"+source.i,{key:source.id+":"+source.i,v:source.v,i:source.i});
  const nodes=[...map.values()].map((n,i)=>{const seed=[...n.key].reduce((s,c)=>s+c.charCodeAt(0),0);return{...n,x:W/2+Math.cos(seed*1.71+i)*W*.22,y:H/2+Math.sin(seed*.93+i)*H*.25,vx:0,vy:0}}),byKey=new Map(nodes.map(n=>[n.key,n]));
  for(let t=0;t<150;t++){nodes.forEach(n=>{n.vx+=(W/2-n.x)*.002;n.vy+=(H/2-n.y)*.002});for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy+15,f=750/d2;a.vx+=dx*f;a.vy+=dy*f;b.vx-=dx*f;b.vy-=dy*f}edges.forEach(e=>{const a=byKey.get(e.a.id+":"+e.ai),b=byKey.get(e.b.id+":"+e.bi);if(!a||!b)return;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,f=(d-78)*.003*(.5+e.p);a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f});nodes.forEach(n=>{n.vx*=.82;n.vy*=.82;n.x=Math.max(28,Math.min(W-28,n.x+n.vx));n.y=Math.max(24,Math.min(H-24,n.y+n.vy))})}
  return{nodes,positions:new Map(nodes.map(n=>[n.key,n]))}
}

function renderRelationshipSvg(svg,edges,source,routeId){
  const W=420,H=220,{nodes,positions}=relationshipLayout(edges,source,W,H),maxObs=Math.max(1,...nodes.map(n=>bins(n.v)[n.i]?.count||0)),radii=new Map(nodes.map(n=>[n.key,7+Math.sqrt((bins(n.v)[n.i]?.count||0)/maxObs)*7])),marker="arrow-"+routeId;
  let html=`<rect width="${W}" height="${H}" fill="#fafbf9"/><defs><marker id="${marker}" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L12 6L0 12L3 6Z" fill="#c74627" stroke="#6d2b1d" stroke-width=".7"/></marker></defs>`;
  edges.forEach(e=>{const ak=e.a.id+":"+e.ai,bk=e.b.id+":"+e.bi,a=positions.get(ak),b=positions.get(bk);if(!a||!b)return;const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ra=radii.get(ak),rb=radii.get(bk),x1=a.x+dx/len*(ra+2),y1=a.y+dy/len*(ra+2),x2=b.x-dx/len*(rb+8),y2=b.y-dy/len*(rb+8),scaled=Math.max(0,Math.min(1,(e.p-probBrush.min)/Math.max(.001,probBrush.max-probBrush.min))),w=.8+scaled*1.5+Math.log2(e.support||1)*.55,d=`M${x1},${y1} Q${(x1+x2)/2},${(y1+y2)/2+(y2-y1)*.12} ${x2},${y2}`,dash=scaled<.25?' stroke-dasharray="4 3"':'';html+=`<path d="${d}" fill="none" stroke="#6d2b1d" stroke-width="${w+1.5}" opacity="${.18+scaled*.3}"${dash}/><path d="${d}" fill="none" stroke="#e76545" stroke-width="${w}" opacity="${.28+scaled*.7}" marker-end="url(#${marker})"${dash}><title>${esc(e.a.label)} → ${esc(e.b.label)}: ${(e.p*100).toFixed(1)}%</title></path>`});
  nodes.forEach(n=>{const p=positions.get(n.key),bin=bins(n.v)[n.i],obs=bin?.count||0,gray=Math.round(235-obs/maxObs*145),selected=n.key===source?.id+":"+source?.i,r=radii.get(n.key);html+=`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${selected?'#e76545':`rgb(${gray},${gray},${gray})`}" stroke="${selected?'#8d2e1c':'#fff'}" stroke-width="2"><title>${esc(n.v.label)}: ${fmt(bin.lo)}–${fmt(bin.hi)} · ${obs} observations</title></circle><text x="${p.x+r+3}" y="${p.y-1}" font-size="8" font-weight="700" fill="#35453e" paint-order="stroke" stroke="#fafbf9" stroke-width="3">${esc(n.v.label)}</text><text x="${p.x+r+3}" y="${p.y+8}" font-size="6" fill="#75827c">${fmt(bin.lo)}–${fmt(bin.hi)}</text>`});
  svg.innerHTML=html
}

function exportRelationship(svg,name){
  const xml=new XMLSerializer().serializeToString(svg),url=URL.createObjectURL(new Blob([xml],{type:"image/svg+xml;charset=utf-8"})),img=new Image;
  img.onload=()=>{const canvas=document.createElement("canvas");canvas.width=840;canvas.height=440;const ctx=canvas.getContext("2d");ctx.fillStyle="#fafbf9";ctx.fillRect(0,0,840,440);ctx.drawImage(img,0,0,840,440);canvas.toBlob(blob=>{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=((name||"relationship").replace(/[^a-z0-9_-]+/gi,"-").replace(/^-|-$/g,"")||"relationship")+".png";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)},"image/png");URL.revokeObjectURL(url)};
  img.src=url
}

renderForceNetwork=function(edges){
  const shelf=$("#relationshipCards"),selections=relationshipSelections(),pathKey=data.paths[active]?.id||active;
  if(!selections.length){shelf.innerHTML='<div class="relationship-empty">Select cells to create relationship networks.</div>';$("#forceSummary").textContent="";return}
  shelf.innerHTML=selections.map((source,i)=>{const key=pathKey+":"+source.id+":"+source.i,name=relationshipNames.get(key)||`Relationship ${i+1}`,routeEdges=edges.filter(e=>e.routes?.has(i));return`<article class="relationship-card" data-route="${i}" data-key="${esc(key)}"><div class="relationship-card-head"><input class="relationship-name" value="${esc(name)}" aria-label="Relationship name"><button class="download-relationship">Download PNG</button></div><svg class="relationship-network" viewBox="0 0 420 220" aria-label="${esc(name)} network"></svg><div class="relationship-stats">${source.v?esc(source.v.label):source.id} · ${routeEdges.length} directed link${routeEdges.length===1?'':'s'}</div></article>`}).join("");
  selections.forEach((source,i)=>{const card=shelf.querySelector(`[data-route="${i}"]`),routeEdges=edges.filter(e=>e.routes?.has(i)),svg=card.querySelector("svg"),input=card.querySelector("input"),key=card.dataset.key;renderRelationshipSvg(svg,routeEdges,source,i);input.addEventListener("input",()=>{relationshipNames.set(key,input.value);svg.setAttribute("aria-label",input.value+" network")});card.querySelector("button").addEventListener("click",()=>exportRelationship(svg,input.value))});
  $("#forceSummary").textContent=`${selections.length} relationship${selections.length===1?'':'s'} · scroll horizontally`
};

render();
