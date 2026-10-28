/* Gráficos em SVG puro: rosca (pizza), linha e combo (barras + linha); avatares com foto ou iniciais. */

function avatar(n,c,cls){const src=PHOTO[n];return src?'<img class="av'+(cls?' '+cls:'')+'" src="'+src+'" alt="" style="border-color:var('+(c||'--cn')+')" width="34" height="34">':'<span class="av'+(cls?' '+cls:'')+'" style="border-color:var('+(c||'--cn')+')" aria-hidden="true">'+esc(ini(n))+'</span>';}
function presDonut(list,tot,center,sub){
  const main=list.filter(c=>PHOTO[c.n]),rest=list.filter(c=>!PHOTO[c.n]),rv=rest.reduce((a,c)=>a+c.v,0);
  const rows=main.map(c=>({label:c.n,sub:c.p,value:c.v,color:c.k,cand:1}));
  if(rv>0)rows.push({label:'Outros',value:rv,color:'--cn'});
  return donut(rows,center,sub,{groups:true,others:rest});
}
const PAL=['--cb','--ca','--c3','--c5','--c6','--c7','--c4','--accent'];
function ini(n){const w=n.split(/\s+/);return (w.length>1?w[0][0]+w[w.length-1][0]:n.slice(0,2)).toUpperCase();}
function donut(rows,center,sub,o){o=o||{};
  const tot=rows.reduce((a,r)=>a+r.value,0),R=42,C=2*Math.PI*R;let off=0;
  const desc=rows.map(r=>r.label+' '+pc(r.value/tot*100)).join('; ');
  const arcs=rows.map(r=>{const len=r.value/tot*C,gap=rows.length>1?Math.min(1.2,len*.2):0;
    const e='<circle cx="60" cy="60" r="'+R+'" fill="none" style="stroke:var('+r.color+')" stroke-width="20" stroke-dasharray="'+(len-gap)+' '+(C-len+gap)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 60 60)"><title>'+esc(r.label)+': '+pc(r.value/tot*100)+'</title></circle>';off+=len;return e;}).join('');
  return '<div class="donut"><svg viewBox="0 0 120 120" role="img" aria-label="Gráfico de pizza. '+esc(desc)+'">'+arcs+
   '<text class="dc" x="60" y="62">'+esc(center)+'</text><text class="ds" x="60" y="72">'+esc(sub)+'</text></svg>'+
   legendHTML(rows,tot,o)+'</div>';
}

function legendHTML(rows,tot,o){
  const li=r=>'<li>'+(r.cand?avatar(r.label,r.color,'sm'):'<i style="background:var('+r.color+')"></i>')+'<span>'+esc(r.label)+(r.sub?'<small>'+esc(r.sub)+'</small>':'')+'</span><b>'+pc(r.value/tot*100,1)+'</b></li>';
  if(!o.groups)return '<ul class="dleg">'+rows.map(li).join('')+'</ul>';
  const main=rows.filter(r=>r.cand),oth=rows.find(r=>!r.cand);
  let h='<div class="dlegs"><p class="lgh">Principais</p><ul class="dleg">'+main.map(li).join('')+'</ul>';
  if(oth&&o.others.length){h+='<p class="lgh"><span class="sw" style="background:var(--cn)"></span>Outros <b class="mono">'+pc(oth.value/tot*100,1)+'</b></p><ul class="dleg oth">'+o.others.map(c=>'<li>'+avatar(c.n,'--cn','xs')+'<span>'+esc(c.n)+'<small>'+esc(c.p)+'</small></span><b>'+pc(c.v/tot*100,2)+'</b></li>').join('')+'</ul>';}
  return h+'</div>';
}
function xlab(x,i,px,py){return Array.isArray(x)?x.map((t,k)=>'<text class="ax" x="'+px+'" y="'+(py+k*14)+'" text-anchor="middle">'+t+'</text>').join(''):'<text class="ax" x="'+px+'" y="'+py+'" text-anchor="middle">'+x+'</text>';}
function lineChart(o){
  const W=560,H=290,L=44,R=20,T=24,B=50,iw=W-L-R,ih=H-T-B,n=o.x.length;
  const X=i=>L+iw*(n===1?.5:i/(n-1)),Y=v=>T+ih*(1-(v-o.min)/(o.max-o.min));
  let g='';for(let v=o.min;v<=o.max+1e-9;v+=o.step)g+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="ax" x="'+(L-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+o.unit+'</text>';
  const xs=o.x.map((t,i)=>xlab(t,i,X(i),H-B+22)).join('');
  const ser=o.series.map(s=>'<polyline class="ln" style="stroke:var('+s.color+')" points="'+s.vals.map((v,i)=>X(i)+','+Y(v)).join(' ')+'"/>'+
    s.vals.map((v,i)=>'<circle cx="'+X(i)+'" cy="'+Y(v)+'" r="6" style="fill:var('+s.color+');stroke:var(--surface)" stroke-width="3"><title>'+esc(s.name)+': '+pc(v)+'</title></circle>').join('')).join('');
  const lab=o.series.map((s,si)=>s.vals.map((v,i)=>{const hi=o.series.every((q,qi)=>qi===si||v>=q.vals[i]);return '<text class="vl" x="'+X(i)+'" y="'+(Y(v)+(hi?-14:24))+'">'+pc(v,1)+'</text>';}).join('')).join('');
  const d=o.series.map(s=>s.name+': '+s.vals.map((v,i)=>(Array.isArray(o.x[i])?o.x[i].join(' '):o.x[i])+' '+pc(v)).join(', ')).join('. ');
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gráfico de linhas. '+esc(d)+'">'+g+xs+ser+lab+'</svg>'+
   '<div class="cleg">'+o.series.map(s=>'<span style="display:inline-flex;align-items:center;gap:6px">'+(PHOTO[s.name]?avatar(s.name,s.color,'xs'):'<i style="background:var('+s.color+')"></i>')+esc(s.name)+'</span>').join('')+'</div>';
}
function comboChart(o){
  const W=560,H=310,L=50,R=50,T=30,B=50,iw=W-L-R,ih=H-T-B,n=o.x.length,bw=iw/n*.5;
  const cx=i=>L+iw*(i+.5)/n,yb=v=>T+ih*(1-v/o.bars.max),yl=v=>T+ih*(1-v/o.line.max),ticks=Math.round(o.bars.max/o.bars.step);
  let g='';for(let k=0;k<=ticks;k++){const y=T+ih*(1-k/ticks);
    g+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/><text class="ax" x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end">'+k*o.bars.step+'</text><text class="ax" x="'+(W-R+8)+'" y="'+(y+4)+'">'+k*o.line.step+'%</text>';}
  g+='<text class="ax" x="'+L+'" y="12" text-anchor="end">milhões</text><text class="ax" x="'+(W-R)+'" y="12">abstenção</text>';
  const bars=o.bars.vals.map((v,i)=>'<rect x="'+(cx(i)-bw/2)+'" y="'+yb(v)+'" width="'+bw+'" height="'+(T+ih-yb(v))+'" rx="4" style="fill:var('+o.bars.color+')"><title>'+esc(o.bars.name)+': '+v.toFixed(1).replace('.',',')+' mi</title></rect>'+
    '<text class="vl" x="'+cx(i)+'" y="'+(T+ih-8)+'" style="fill:var(--surface);stroke:none;font-size:11px">'+v.toFixed(1).replace('.',',')+' mi</text>').join('');
  const ln='<polyline class="ln" style="stroke:var('+o.line.color+')" points="'+o.line.vals.map((v,i)=>cx(i)+','+yl(v)).join(' ')+'"/>'+
    o.line.vals.map((v,i)=>'<circle cx="'+cx(i)+'" cy="'+yl(v)+'" r="6" style="fill:var('+o.line.color+');stroke:var(--surface)" stroke-width="3"><title>'+esc(o.line.name)+': '+pc(v)+'</title></circle><text class="vl" x="'+cx(i)+'" y="'+(yl(v)-14)+'">'+pc(v,1)+'</text>').join('');
  const xs=o.x.map((t,i)=>xlab(t,i,cx(i),H-B+22)).join('');
  const d=o.x.map((t,i)=>(Array.isArray(t)?t.join(' '):t)+': '+o.bars.vals[i].toFixed(1)+' milhões de votantes, abstenção '+pc(o.line.vals[i])).join('; ');
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gráfico combinado de barras e linha. '+esc(d)+'">'+g+bars+ln+xs+'</svg>'+
   '<div class="cleg"><span><i style="background:var('+o.bars.color+')"></i>'+esc(o.bars.name)+' (eixo esquerdo)</span><span><i style="background:var('+o.line.color+')"></i>'+esc(o.line.name)+' (eixo direito)</span></div>';
}