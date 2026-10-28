/* Telas do painel: navegação por abas, filtros e renderização de cada seção. */

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const tot1=P1.reduce((a,c)=>a+c.v,0), tot2=P2.reduce((a,c)=>a+c.v,0);
const pr=(c,t)=>c.v/t*100;

/* ---------- Visão geral ---------- */
function renderOverview(){
  const mi=n=>(n/1e6).toFixed(1).replace('.',',')+' mi';
  $('#vg-p2').innerHTML=presDonut(P2,tot2,mi(tot2),'votos válidos');
  $('#vg-p2n').textContent='Diferença de '+fmt(P2[0].v-P2[1].v)+' votos (calculada). O TSE declarou Lula (PT) reeleito.';
  const top=P1.slice(0,5),rest=tot1-top.reduce((a,c)=>a+c.v,0);
  $('#vg-p1').innerHTML=presDonut(P1,tot1,mi(tot1),'votos válidos');
  $('#vg-part').innerHTML=donut([{label:'Compareceram',sub:fmt(T2.comp)+' eleitores',value:T2.comp,color:'--accent'},{label:'Abstenção',sub:fmt(ELEIT-T2.comp)+' eleitores',value:ELEIT-T2.comp,color:'--cn'}],pc(T2.comp/ELEIT*100,1),'compareceram');
  const cam=Object.entries(CAM26).slice(0,6),rc=513-cam.reduce((a,[,v])=>a+v,0);
  $('#vg-cam').innerHTML=donut(cam.map(([p,v],i)=>({label:p,sub:v+' cadeiras',value:v,color:PAL[i]})).concat([{label:'Demais partidos',sub:rc+' cadeiras',value:rc,color:'--cn'}]),'513','cadeiras');
}
function govByParty(){
  const m={};Object.entries(UFS).forEach(([u,d])=>{(m[d[5]]=m[d[5]]||[]).push(u);});
  return Object.entries(m).sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0],'pt'));
}

/* ---------- Presidente ---------- */
let prT=1;
function renderPres(){
  const list=prT===1?P1:P2, tot=prT===1?tot1:tot2;
  $('#pr-bars').innerHTML=barRows(list.slice(0,6).map(c=>({num:c.num,label:c.n,sub:c.p,value:pr(c,tot),color:c.k,text:pc(pr(c,tot))})),60);
  $('#pr-donut').innerHTML=presDonut(list,tot,(tot/1e6).toFixed(1).replace('.',',')+' mi','votos válidos');
  $('#pr-table').innerHTML='<caption class="kicker" style="text-align:left;padding:10px 12px;caption-side:top">'+(prT===1?'1º turno · 4 de outubro':'2º turno · 25 de outubro')+'</caption><thead><tr><th>Nº</th><th>Candidato</th><th>Partido</th><th class="r">Votos</th><th class="r">% válidos</th></tr></thead><tbody>'+
   list.map(c=>'<tr><td class="num">'+c.num+'</td><td>'+esc(c.n)+'</td><td>'+esc(c.p)+'</td><td class="r">'+fmt(c.v)+'</td><td class="r">'+pc(pr(c,tot))+'</td></tr>').join('')+
   '<tr><td></td><td><b>Votos válidos</b></td><td></td><td class="r">'+fmt(tot)+'</td><td class="r">100,00%</td></tr></tbody>';
  let note;
  if(prT===1){ note='Brancos: '+fmt(T1.brancos)+' ('+pc(T1.brancos/T1.comp*100)+' dos que compareceram). Nulos: '+fmt(T1.nulos)+' ('+pc(T1.nulos/T1.comp*100)+'). Percentuais sobre votos válidos, como o TSE calcula.'; }
  else { const bn=T2.comp-tot2; note='Brancos e nulos somados: '+fmt(bn)+' ('+pc(bn/T2.comp*100)+' dos que compareceram), valor calculado. Percentuais sobre votos válidos.'; }
  $('#pr-note').textContent=note;
  const mov=$('#pr-mov');
  if(prT===2){
    const rows=P2.map(c=>{const a=P1.find(x=>x.n===c.n);return {c,a1:pr(a,tot1),a2:pr(c,tot2),dv:c.v-a.v};});
    mov.hidden=false;
    mov.innerHTML='<h3>Do 1º para o 2º turno <small>% dos votos válidos</small></h3>'+
     rows.map(r=>{const lo=Math.min(r.a1,r.a2),hi=Math.max(r.a1,r.a2);
      return '<div><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><b>'+esc(r.c.n)+'</b><span class="mono" style="font-size:.85rem">'+pc(r.a1)+' → '+pc(r.a2)+' · '+(r.dv>=0?'+':'−')+fmt(Math.abs(r.dv))+' votos</span></div>'+
      '<div class="dumb" role="img" aria-label="'+esc(r.c.n)+' foi de '+pc(r.a1)+' para '+pc(r.a2)+'">'+[0,25,50,75].map(t=>'<span class="tk" style="left:'+t/0.6+'%"></span>').join('')+
      '<span class="ln" style="left:'+lo/0.6+'%;width:'+(hi-lo)/0.6+'%"></span>'+
      '<span class="dt" style="left:'+r.a1/0.6+'%;background:var(--cn)"></span><span class="dt" style="left:'+r.a2/0.6+'%;background:var('+r.c.k+')"></span></div></div>';}).join('')+
     '<p class="note">Ponto cinza: 1º turno. Ponto colorido: 2º turno. Eixo de 0% a 60%. A variação em votos compara as duas votações e inclui a mudança de comparecimento.</p>';
  } else mov.hidden=true;
}

/* ---------- Estados ---------- */
const GRID={RR:[2,0],AP:[4,0],AM:[1,1],PA:[3,1],MA:[4,1],CE:[5,1],RN:[6,1],AC:[0,2],RO:[1,2],MT:[2,2],TO:[3,2],PI:[4,2],PE:[5,2],PB:[6,2],MS:[2,3],GO:[3,3],BA:[4,3],SE:[5,3],AL:[6,3],DF:[3,4],MG:[4,4],ES:[5,4],PR:[2,5],SP:[3,5],RJ:[4,5],SC:[2,6],RS:[2,7]};
let selUF='SP',selReg='';
function renderMap(){
  const W=64,H=54,G=6;
  let s='<svg class="tiles" viewBox="0 0 '+(7*(W+G))+' '+(8*(H+G))+'" role="group" aria-label="Mapa em grade dos estados">';
  Object.keys(GRID).forEach(u=>{
    const d=UFS[u],[cx,cy]=GRID[u],x=cx*(W+G),y=cy*(H+G);
    const fill=d[2]==='f'?(d[3]>=60?'var(--ca-m)':'var(--ca-s)'):(d[3]>=60?'var(--cb-m)':'var(--cb-s)');
    const dim=selReg&&d[1]!==selReg;
    s+='<g class="tile'+(u===selUF?' sel':'')+(dim?' dim':'')+'" tabindex="0" role="button" data-uf="'+u+'" aria-label="'+d[0]+': líder no 1º turno '+(d[2]==='f'?'Flávio Bolsonaro':'Lula')+', '+pc(d[3])+'" aria-pressed="'+(u===selUF)+'">'+
      '<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+H+'" rx="6" fill="'+fill+'"/><text class="u" x="'+(x+W/2)+'" y="'+(y+25)+'">'+u+'</text><text class="p" x="'+(x+W/2)+'" y="'+(y+43)+'">'+d[3].toFixed(1).replace('.',',')+'%</text></g>';
  });
  s+='</svg>';
  $('#es-map').innerHTML=s;
  $('#es-leg').innerHTML='<span><i style="background:var(--ca-m)"></i>Flávio Bolsonaro, 60% ou mais</span><span><i style="background:var(--ca-s)"></i>Flávio Bolsonaro, menos de 60%</span><span><i style="background:var(--cb-m)"></i>Lula, 60% ou mais</span><span><i style="background:var(--cb-s)"></i>Lula, menos de 60%</span>';
}
function renderUF(){
  const d=UFS[selUF];
  const lead=d[2]==='f'?'Flávio Bolsonaro (PL)':'Lula (PT)';
  let h='<div><span class="kicker">'+REG[d[1]]+'</span><h3 style="font-size:1.5rem">'+d[0]+' <span class="tag">'+selUF+'</span></h3></div>';
  h+='<dl class="facts"><div><dt>Líder para presidente, 1º turno</dt><dd>'+lead+'</dd></div><div><dt>% dos votos válidos</dt><dd>'+pc(d[3])+'</dd></div></dl>';
  h+='<div><span class="kicker">Governo</span><p style="margin-top:4px"><b>'+esc(d[4])+'</b> ('+d[5]+') <span class="tag">eleito no '+d[6]+'º turno</span></p>';
  if(d[7]) h+='<div style="margin-top:8px">'+barRows(d[7].map((r,i)=>({label:r[0],sub:r[1],value:r[2],color:i?'--cn':'--accent',text:pc(r[2])})),100)+'<p class="note">'+(d[6]===2?'Percentuais do 2º turno, sobre votos válidos.':'Percentuais do 1º turno, sobre votos válidos.')+'</p></div>';
  if(selUF==='RN') h+='<p class="note">No 1º turno: Allyson Bezerra 36,94% e Cadu de Lula 36,16%.</p>';
  if(selUF==='ES') h+='<p class="note">No 1º turno: Lorenzo Pazolini 49,65% e Ricardo Ferraço 34,06%.</p>';
  if(selUF==='RJ') h+='<p class="note">Houve recontagem noticiada após a apuração inicial; confira no Portal Resultados do TSE.</p>';
  h+='</div><div><span class="kicker">Senado · 2 vagas</span><ul style="margin:6px 0 0;padding-left:1.1rem">'+d[8].map(s=>'<li>'+esc(s[0])+' ('+s[1]+')</li>').join('')+'</ul></div>';
  if(selUF==='SP'){
    h+='<div><span class="kicker">Detalhe de São Paulo · 100% das seções</span><dl class="facts" style="margin-top:8px"><div><dt>Comparecimento</dt><dd>'+fmt(SP.comp)+' de '+fmt(SP.eleit)+' ('+pc(SP.comp/SP.eleit*100)+')</dd></div></dl>'+
     '<div class="tw" style="margin-top:10px"><table><thead><tr><th>Presidente</th><th class="r">1º turno</th><th class="r">2º turno</th><th class="r">Variação</th></tr></thead><tbody>'+
     [['Flávio Bolsonaro',SP.t1.f,SP.t2.f],['Lula',SP.t1.l,SP.t2.l]].map(r=>'<tr><td>'+r[0]+'</td><td class="r">'+fmt(r[1][0])+' · '+pc(r[1][1])+'</td><td class="r">'+fmt(r[2][0])+' · '+pc(r[2][1])+'</td><td class="r">+'+fmt(r[2][0]-r[1][0])+'</td></tr>').join('')+
     SP.t1.o.map(o=>'<tr><td>'+o[0]+'</td><td class="r">'+fmt(o[2])+' · '+pc(o[3])+'</td><td class="r">—</td><td class="r">—</td></tr>').join('')+'</tbody></table></div>'+
     '<h3 style="margin-top:14px;font-size:.95rem">Senado em SP <small class="kicker">cada eleitor votou em dois nomes</small></h3>'+
     barRows(SP.sen.map((r,i)=>({label:r[0],sub:r[1]+(i<2?' · eleito':''),value:r[3],color:i<2?'--accent':'--cn',text:pc(r[3])+' · '+fmt(r[2])})),40)+'</div>';
  } else h+='<p class="note">O 2º turno por estado e os dados municipais ainda não estão embutidos aqui (exceto SP). Use a aba Dados do TSE.</p>';
  $('#es-det').innerHTML=h;
}
function renderUFTable(){
  const mode=$('#es-sort').value;
  const rows=Object.entries(UFS);
  rows.sort((a,b)=>mode==='pct'?b[1][3]-a[1][3]:mode==='reg'?(a[1][1].localeCompare(b[1][1])||a[1][0].localeCompare(b[1][0],'pt')):a[1][0].localeCompare(b[1][0],'pt'));
  $('#es-table').innerHTML='<thead><tr><th>UF</th><th>Estado</th><th>Região</th><th>Líder (1º turno)</th><th class="r">% válidos</th><th>Governo</th></tr></thead><tbody>'+
   rows.filter(([,d])=>!selReg||d[1]===selReg).map(([u,d])=>'<tr><td class="num">'+u+'</td><td>'+d[0]+'</td><td>'+REG[d[1]]+'</td><td><span class="sw" style="background:var('+KEYC[d[2]]+')"></span>'+(d[2]==='f'?'Flávio Bolsonaro':'Lula')+'</td><td class="r">'+pc(d[3])+'</td><td>'+esc(d[4])+' ('+d[5]+')</td></tr>').join('')+'</tbody>';
}
function renderEstados(){renderMap();renderUF();renderUFTable();}

/* ---------- Partidos ---------- */
let paC='cam';
function renderPartidos(){
  const data=paC==='cam'?CAM26:paC==='sen'?SEN26:Object.fromEntries(govByParty().map(([p,l])=>[p,l.length]));
  const total=Object.values(data).reduce((a,b)=>a+b,0);
  const sel=$('#pa-sel').value;
  $('#pa-h').textContent=paC==='cam'?'Deputados federais eleitos ('+total+')':paC==='sen'?'Senadores eleitos em 2026 ('+total+')':'Governadores por partido ('+total+')';
  const entries=Object.entries(data).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt'));
  const gl=Object.fromEntries(govByParty());
  $('#pa-bars').innerHTML=barRows(entries.map(([p,v])=>({label:p,sub:paC==='gov'?gl[p].join(', '):'',value:v,color:p===sel?'--accent':'--c4',text:v+' · '+pc(v/total*100,1)})));
  {const top=entries.slice(0,7);if(sel&&data[sel]&&!top.some(e=>e[0]===sel))top.push([sel,data[sel]]);const rest=total-top.reduce((a,e)=>a+e[1],0);
   $('#pa-donut').innerHTML=donut(top.map(([p,v],i)=>({label:p,value:v,color:p===sel?'--accent':PAL[i%PAL.length]})).concat(rest>0?[{label:'Demais',value:rest,color:'--cn'}]:[]),String(total),paC==='gov'?'governos':'cadeiras');}
  const sv=sel?data[sel]:null;
  $('#pa-note').textContent=sel?(sv?sel+': '+sv+' de '+total+' ('+pc(sv/total*100,1)+').':sel+' não elegeu nesta categoria.'):'Escolha um partido para destacá-lo nas barras e na pizza.'+(paC==='sen'?' São 54 das 81 cadeiras, a renovação de dois terços.':'');
}
function initPartidos(){
  const all=[...new Set([...Object.keys(CAM26),...Object.keys(SEN26),...govByParty().map(g=>g[0])])].sort((a,b)=>a.localeCompare(b,'pt'));
  $('#pa-sel').innerHTML='<option value="">Nenhum</option>'+all.map(p=>'<option>'+p+'</option>').join('');
}

/* ---------- Comparar ---------- */
let coM='cand';
function renderCompareCtl(){
  if(coM==='cand'){
    const o=P1.map((c,i)=>'<option value="'+i+'">'+c.n+' ('+c.p+')</option>').join('');
    $('#co-ctl').innerHTML='<label>Candidato A<select id="co-a">'+o+'</select></label><label>Candidato B<select id="co-b">'+o+'</select></label>';
    $('#co-a').value='0';$('#co-b').value='1';
  } else {
    const o=Object.entries(UFS).sort((a,b)=>a[1][0].localeCompare(b[1][0],'pt')).map(([u,d])=>'<option value="'+u+'">'+d[0]+'</option>').join('');
    $('#co-ctl').innerHTML='<label>Estado A<select id="co-a">'+o+'</select></label><label>Estado B<select id="co-b">'+o+'</select></label>';
    $('#co-a').value='SP';$('#co-b').value='MG';
  }
  $('#co-a').onchange=$('#co-b').onchange=renderCompare;
  renderCompare();
}
function renderCompare(){
  const a=$('#co-a').value,b=$('#co-b').value,out=$('#co-out');
  if(a===b){out.innerHTML='<div class="msg">Escolha duas opções diferentes para comparar.</div>';return;}
  if(coM==='cand'){
    const A=P1[+a],B=P1[+b];
    const card=(c)=>'<article class="card"><span class="kicker">1º turno</span><h3 style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+avatar(c.n,c.k,'lg')+esc(c.n)+' <span class="tag">'+esc(c.p)+'</span> <span class="tag">nº '+c.num+'</span></h3><div class="big">'+pc(pr(c,tot1))+'</div><div class="mono">'+fmt(c.v)+' votos</div></article>';
    const d=A.v-B.v,dp=pr(A,tot1)-pr(B,tot1);
    out.innerHTML='<div class="cmp">'+card(A)+card(B)+'</div><article class="card">'+
     barRows([{label:A.n,value:pr(A,tot1),color:A.k,text:pc(pr(A,tot1))},{label:B.n,value:pr(B,tot1),color:B.k===A.k?'--c4':B.k,text:pc(pr(B,tot1))}],100)+
     '<p><b>'+esc(d>=0?A.n:B.n)+'</b> teve '+fmt(Math.abs(d))+' votos a mais ('+pc(Math.abs(dp))+' pontos percentuais de diferença).</p></article>';
    const fin=['Lula','Flávio Bolsonaro'];
    if(fin.includes(A.n)&&fin.includes(B.n)){
      const r=(n)=>P2.find(x=>x.n===n);
      out.innerHTML+='<article class="card"><h3>No 2º turno <small>% válidos</small></h3>'+barRows(P2.map(c=>({num:c.num,label:c.n,value:pr(c,tot2),color:c.k,text:pc(pr(c,tot2))+' · '+fmt(c.v)})),100)+'</article>';
    }
  } else {
    const card=(u)=>{const d=UFS[u];return '<article class="card"><span class="kicker">'+REG[d[1]]+'</span><h3>'+d[0]+' <span class="tag">'+u+'</span></h3>'+
      '<dl class="facts"><div><dt>Líder para presidente, 1º turno</dt><dd>'+(d[2]==='f'?'Flávio Bolsonaro':'Lula')+'</dd></div><div><dt>% votos válidos</dt><dd>'+pc(d[3])+'</dd></div><div><dt>Governo</dt><dd>'+esc(d[4])+' ('+d[5]+')</dd></div><div><dt>Governador eleito no</dt><dd>'+d[6]+'º turno</dd></div><div><dt>Senadores</dt><dd>'+d[8].map(s=>esc(s[0])+' ('+s[1]+')').join('<br>')+'</dd></div></dl></article>';};
    out.innerHTML='<div class="cmp">'+card(a)+card(b)+'</div>';
  }
}

/* ---------- Tendências ---------- */
function renderTend(){
  const X=[['1º turno','2022'],['2º turno','2022'],['1º turno','2026'],['2º turno','2026']];
  $('#te-line').innerHTML=lineChart({x:X,min:40,max:55,step:5,unit:'%',series:[
    {name:'Lula',color:'--cb',vals:[Y22.t1.top[0][3],Y22.t2.top[0][3],pr(P1[1],tot1),pr(P2[0],tot2)]},
    {name:'Adversário (Bolsonaro em 2022; Flávio Bolsonaro em 2026)',color:'--ca',vals:[Y22.t1.top[1][3],Y22.t2.top[1][3],pr(P1[0],tot1),pr(P2[1],tot2)]}]});
  const ab=t=>(t.apto-t.comp)/t.apto*100;
  $('#te-combo').innerHTML=comboChart({x:X,bars:{name:'Eleitores que votaram',color:'--c4',max:150,step:25,vals:[Y22.t1.comp,Y22.t2.comp,T1.comp,T2.comp].map(v=>v/1e6)},
    line:{name:'Abstenção',color:'--accent',max:30,step:5,vals:[ab(Y22.t1),ab(Y22.t2),(ELEIT-T1.comp)/ELEIT*100,(ELEIT-T2.comp)/ELEIT*100]}});
  const rows=Object.keys(CAM26).filter(p=>p in CAM22).map(p=>[p,CAM22[p],CAM26[p],CAM26[p]-CAM22[p]]).sort((a,b)=>b[3]-a[3]||a[0].localeCompare(b[0],'pt'));
  const mx=Math.max(...rows.map(r=>Math.abs(r[3])));
  $('#te-cam').innerHTML='<div style="display:flex;flex-direction:column;gap:10px">'+rows.map(r=>{
    const w=Math.abs(r[3])/mx*50;
    return '<div class="div"><span><b>'+r[0]+'</b> <span class="bsub">'+r[1]+' → '+r[2]+'</span></span><div class="t" aria-hidden="true"><span style="'+(r[3]>=0?'left:50%':'right:50%')+';width:'+w+'%;background:var('+(r[3]>=0?'--accent':'--c5')+')"></span></div><span class="bval">'+(r[3]>0?'+':r[3]<0?'−':'')+Math.abs(r[3])+'</span></div>';}).join('')+'</div>';
}

/* ---------- Importar ---------- */
let IM=null;
function showMsg(t,err){const m=$('#im-msg');m.hidden=!t;m.className='msg'+(err?' err':'');m.textContent=t||'';}
async function loadFile(file){
  showMsg('');$('#im-out').style.display='none';
  const prog=$('#im-prog');prog.hidden=false;prog.value=0;
  if(file.size>400*1024*1024) showMsg('Arquivo grande ('+Math.round(file.size/1048576)+' MB). Pode demorar e consumir muita memória; prefira o arquivo do seu estado.');
  const st=newState();
  try{
    const reader=file.stream().getReader();const dec=new TextDecoder($('#im-enc').value);
    let buf='',read=0,n=0;
    for(;;){
      const {done,value}=await reader.read();
      if(done)break;
      read+=value.length;buf+=dec.decode(value,{stream:true});
      const lines=buf.split('\n');buf=lines.pop();
      for(const l of lines)ingestLine(l.replace(/\r$/,''),st);
      prog.value=read/file.size*100;
      if(++n%8===0)await new Promise(r=>setTimeout(r));
    }
    buf+=dec.decode();if(buf)ingestLine(buf.replace(/\r$/,''),st);
  }catch(e){prog.hidden=true;showMsg('Não foi possível ler o arquivo. '+e.message,true);return;}
  prog.hidden=true;
  if(!st.rows){showMsg('Nenhuma linha de candidato foi encontrada. Confira se o arquivo é o de votação por candidato e município/zona e se a codificação está correta.',true);return;}
  IM=st;
  showMsg('Arquivo lido: '+fmt(st.rows)+' linhas de candidatos, '+fmt(st.map.size)+' combinações únicas. Linhas de brancos/nulos ignoradas: '+fmt(st.skipped)+'.');
  buildImFilters();
}
function buildImFilters(){
  const st=IM,S=a=>[...a].filter(Boolean).sort((x,y)=>x.localeCompare(y,'pt'));
  const sel=(id,label,opts,all)=>'<label>'+label+'<select id="'+id+'">'+(all?'<option value="">'+all+'</option>':'')+opts.map(o=>'<option>'+esc(o)+'</option>').join('')+'</select></label>';
  $('#im-filters').innerHTML=sel('f-t','Turno',S(st.sets.t),S(st.sets.t).length>1?'Todos':'')+sel('f-c','Cargo',S(st.sets.c),'')+sel('f-u','Estado',S(st.sets.u),'Todos')+'<label>Município<select id="f-m"><option value="">Todos</option></select></label>'+sel('f-p','Partido',S(st.sets.p),'Todos');
  $$('#im-filters select').forEach(s=>s.onchange=()=>{if(s.id==='f-u')fillMun();renderIm();});
  $('#im-out').style.display='flex';
  fillMun();renderIm();
}
function fillMun(){
  const u=$('#f-u').value,m=$('#f-m');
  const arr=u&&IM.muns.has(u)?[...IM.muns.get(u)].sort((a,b)=>a.localeCompare(b,'pt')):[];
  m.innerHTML='<option value="">Todos</option>'+arr.map(x=>'<option>'+esc(x)+'</option>').join('');m.disabled=!u;
}
function renderIm(){
  const f={t:$('#f-t').value,c:$('#f-c').value,u:$('#f-u').value,m:$('#f-m').value,p:$('#f-p').value};
  const r=rank(IM,f),top=r.list.slice(0,20);
  $('#im-h').textContent=(f.c||'Cargo')+(f.u?' · '+f.u:'')+(f.m?' · '+f.m:'')+' — '+fmt(r.total)+' votos nominais';
  $('#im-bars').innerHTML=top.length?barRows(top.map((c,i)=>({label:c.n,sub:c.p,value:c.v,color:i<3?'--accent':'--c4',text:pc(c.v/r.total*100)+' · '+fmt(c.v)}))):'<div class="msg">Nenhum candidato neste filtro.</div>';
}

/* ---------- navegação e eventos ---------- */
const VIEWS=['visao-geral','presidente','estados','partidos','comparar','tendencias','importar','fontes'];
function route(){
  let id=(location.hash||'').replace('#','');if(!VIEWS.includes(id))id='visao-geral';
  VIEWS.forEach(v=>{$('#v-'+v).hidden=v!==id;});
  $$('#tabs a').forEach(a=>{if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const cur=$('#tabs a[aria-current]');if(cur&&cur.scrollIntoView)cur.scrollIntoView({block:'nearest',inline:'center'});
  window.scrollTo(0,0);
}
function seg(sel,attr,fn){
  $$(sel+' button').forEach(b=>b.addEventListener('click',()=>{$$(sel+' button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));fn(b.dataset[attr]);}));
}
function init(){
  renderOverview();renderPres();renderEstados();initPartidos();renderPartidos();renderCompareCtl();renderTend();
  $('#es-reg').innerHTML='<button class="chip" data-r="" aria-pressed="true">Todas</button>'+Object.entries(REG).map(([k,v])=>'<button class="chip" data-r="'+k+'" aria-pressed="false">'+v+'</button>').join('');
  $$('#es-reg .chip').forEach(b=>b.addEventListener('click',()=>{selReg=b.dataset.r;$$('#es-reg .chip').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderMap();renderUFTable();}));
  const pick=e=>{const g=e.target.closest('.tile');if(g){selUF=g.dataset.uf;renderMap();renderUF();const t=$('.tile.sel');if(t&&e.type==='keydown')t.focus();}};
  $('#es-map').addEventListener('click',pick);
  $('#es-map').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(e);}});
  $('#es-sort').addEventListener('change',renderUFTable);
  seg('#v-presidente .seg','t',v=>{prT=+v;renderPres();});
  seg('#pa-cargo','c',v=>{paC=v;renderPartidos();});
  seg('#co-mode','m',v=>{coM=v;renderCompareCtl();});
  $('#pa-sel').addEventListener('change',renderPartidos);
  $('#im-file').addEventListener('change',e=>{const f=e.target.files[0];if(f)loadFile(f);});
  window.addEventListener('hashchange',route);route();
}
init();