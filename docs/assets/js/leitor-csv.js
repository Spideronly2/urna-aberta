/* Leitura, no navegador, dos CSVs oficiais do TSE (votacao_candidato_munzona). Nada é enviado a servidores. */
function splitCSV(line,sep){
  const out=[];let cur='',q=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(q){ if(ch==='"'){ if(line[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=ch; }
    else if(ch==='"') q=true;
    else if(ch===sep){out.push(cur);cur='';}
    else cur+=ch;
  }
  out.push(cur);return out;
}
const COLS={cargo:['DS_CARGO'],uf:['SG_UF'],mun:['NM_MUNICIPIO'],turno:['NR_TURNO'],cand:['NM_URNA_CANDIDATO','NM_CANDIDATO'],part:['SG_PARTIDO'],votos:['QT_VOTOS_NOMINAIS','QT_VOTOS']};
function mapHeader(fields){
  const names=fields.map(f=>f.replace(/^﻿/,'').trim().toUpperCase());
  const idx={};const missing=[];
  for(const k in COLS){
    const i=COLS[k].map(c=>names.indexOf(c)).find(i=>i>=0);
    if(i===undefined){ if(['cargo','uf','cand','votos'].includes(k)) missing.push(COLS[k][0]); idx[k]=-1; } else idx[k]=i;
  }
  return {idx,missing,names};
}
function isBlankNull(name){return /^#?\s*(nulo|branco)|^voto\s+(branco|nulo)/i.test(name);}
function ingestLine(line,st){
  if(!line||!line.trim())return;
  const f=splitCSV(line,';');
  if(!st.hdr){ st.hdr=mapHeader(f); if(st.hdr.missing.length) throw new Error('Colunas não encontradas: '+st.hdr.missing.join(', ')+'. Colunas do arquivo: '+st.hdr.names.slice(0,12).join(', ')+'…'); return; }
  const x=st.hdr.idx;
  const cand=(f[x.cand]||'').trim(); if(!cand||isBlankNull(cand)){st.skipped++;return;}
  const v=parseInt((f[x.votos]||'0').replace(/\D/g,''),10)||0;
  const t=x.turno>=0?(f[x.turno]||'').trim():'';
  const cargo=(f[x.cargo]||'').trim(),uf=(f[x.uf]||'').trim(),mun=x.mun>=0?(f[x.mun]||'').trim():'',p=x.part>=0?(f[x.part]||'').trim():'';
  const key=t+'|'+cargo+'|'+uf+'|'+mun+'|'+cand+'|'+p;
  const e=st.map.get(key); if(e) e.v+=v; else st.map.set(key,{t,c:cargo,u:uf,m:mun,n:cand,p,v});
  st.sets.t.add(t);st.sets.c.add(cargo);st.sets.u.add(uf);st.sets.p.add(p);
  if(mun){ if(!st.muns.has(uf)) st.muns.set(uf,new Set()); st.muns.get(uf).add(mun); }
  st.rows++;
}
function newState(){return {hdr:null,map:new Map(),sets:{t:new Set(),c:new Set(),u:new Set(),p:new Set()},muns:new Map(),rows:0,skipped:0};}
function rank(st,f){
  const acc=new Map();let total=0;
  for(const e of st.map.values()){
    if(f.t&&e.t!==f.t)continue; if(f.c&&e.c!==f.c)continue; if(f.u&&e.u!==f.u)continue; if(f.m&&e.m!==f.m)continue; if(f.p&&e.p!==f.p)continue;
    const k=e.n+'|'+e.p; const a=acc.get(k); if(a)a.v+=e.v; else acc.set(k,{n:e.n,p:e.p,v:e.v}); total+=e.v;
  }
  return {list:[...acc.values()].sort((a,b)=>b.v-a.v),total};
}