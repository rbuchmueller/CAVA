projectionPositions=function(vars=data.variables){const a=vars[0],b=vars[Math.min(1,vars.length-1)];return new Map(vars.map((v,i)=>[v.id,{x:50+(variableCorrelation(v,a)+1)*300+(i%3-1)*3,y:50+(variableCorrelation(v,b)+1)*300+((i*7)%5-2)*2}]))};

miniProjection=function(nodes){const positions=projectionPositions(),selected=new Set(nodes);return`<svg class="mini-projection" viewBox="0 0 720 720">${data.variables.map(v=>{const p=positions.get(v.id);return`<circle data-id="${esc(v.id)}" cx="${p.x}" cy="${p.y}" r="${selected.has(v.id)?7:3.5}" class="${selected.has(v.id)?'included':'context'}"><title>${esc(v.label||v.id)} · ${selected.has(v.id)?'included':'not included'}</title></circle>`}).join("")}</svg>`};

const rectangularSequenceBuilder=renderSequenceBuilder;renderSequenceBuilder=function(){rectangularSequenceBuilder();const projection=$("#sequenceProjection"),bg=projection.querySelector(".projection-bg");projection.setAttribute("viewBox","0 0 720 720");if(bg){bg.setAttribute("height","718");bg.setAttribute("width","718")}};

function applyVariableIdentifiers(){const nodes=data.paths[active]?.nodes||[];document.querySelectorAll("#chart .row-label").forEach(label=>{const index=nodes.indexOf(label.dataset.id),code=networkCode(index<0?+label.dataset.row:index),name=label.textContent.replace(/^[A-Z]+\s·\s/,"");label.textContent=`${code} · ${name}`;label.setAttribute("data-code",code)})}

const renderWithCompactNetworks=renderForceNetwork;renderForceNetwork=function(edges){renderWithCompactNetworks(edges);applyVariableIdentifiers()};render();
