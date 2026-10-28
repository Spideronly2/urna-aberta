/* Utilitários: formatação de números e barras horizontais. */
const nf=new Intl.NumberFormat('pt-BR');
const fmt=n=>nf.format(n);
const pc=(x,d=2)=>x.toFixed(d).replace('.',',')+'%';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function barRows(rows,max){
  const m=max||Math.max(1,...rows.map(r=>r.value));
  return '<ul class="bars">'+rows.map(r=>
   '<li class="brow"><div class="blab">'+(r.num!=null?avatar(r.label,r.color)+'<span class="bnum" title="Número na urna">'+r.num+'</span>':'')+
   '<span class="bname">'+esc(r.label)+'</span>'+(r.sub?'<span class="bsub">'+esc(r.sub)+'</span>':'')+'</div>'+
   '<div class="btrack" aria-hidden="true"><span class="bfill" style="width:'+(r.value/m*100).toFixed(2)+'%;background:var('+(r.color||'--cn')+')"></span></div>'+
   '<div class="bval">'+r.text+'</div></li>').join('')+'</ul>';
}