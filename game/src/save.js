const SLOT='breakwater84.slot.v1';
const finite = (x,fallback,lo,hi) => Number.isFinite(x)?clamp(x,lo,hi):fallback;
function readSave(){
  try{
    const save=JSON.parse(localStorage.getItem(SLOT));
    return save?.version===1&&typeof save.player==='object'&&save.player?save:null;
  }catch{return null;}
}
function writeSave(w){
  const p=w.player,c=p.car;
  const player={x:p.x,y:p.y,a:p.a,hp:p.hp,cash:p.cash};
  const ride=c?{x:c.x,y:c.y,a:c.a,hp:c.hp,color:c.color,name:c.name,kind:c.kind,owned:c.owned}:null;
  const save={version:1,player,ride,mission:w.mission,phase:w.phase,found:w.found,best:w.best,
    tuned:w.tuned,radio:w.radio,ammo:w.ammo,reserve:w.reserve,guards:w.guards.map(g=>g.hp),heat:w.heat};
  try{localStorage.setItem(SLOT,JSON.stringify(save));return true;}catch{return false;}
}
function restoreWorld(save){
  const w=createWorld(),p=w.player,s=save.player;
  const x=finite(s.x,p.x,12,LAND-12),y=finite(s.y,p.y,12,SIZE-12);
  if(!solid(w,x,y,9)){p.x=x;p.y=y;}
  p.a=finite(s.a,0,-10000,10000);p.cash=Math.floor(finite(s.cash,180,0,1e7));
  p.hp=finite(s.hp,100,1,100);
  for(const [key,fallback,max] of [['mission',0,4],['phase',0,1],['ammo',8,8],['reserve',48,250],['heat',0,5]])
    w[key]=Math.floor(finite(save[key],fallback,0,max));
  w.search=w.heat?8:0;
  w.best=finite(save.best,0,0,75);w.tuned=save.tuned===true;w.radio=save.radio!==false;
  if(Array.isArray(save.found))w.found=[...new Set(save.found.filter(n=>Number.isInteger(n)&&n>=0&&n<w.tapes.length))];
  w.guards.forEach((g,i)=>g.hp=finite(save.guards?.[i],w.mission>1?0:45,0,45));
  if(save.ride&&!solid(w,p.x,p.y,18)){
    const c=carAt(p.x,p.y,p.a,0),r=save.ride;
    c.a=finite(r.a,p.a,-10000,10000);c.hp=finite(r.hp,100,1,100);
    c.kind=Math.floor(finite(r.kind,0,0,2));c.owned=r.owned===true;
    if(typeof r.color==='string'&&/^#[a-f0-9]{6}$/i.test(r.color))c.color=r.color;
    if(typeof r.name==='string')c.name=r.name.slice(0,24);
    if(c.owned)w.starter.sold=true;
    p.car=c;w.cars.push(c);
  }
  w.camera.x=p.x;w.camera.y=p.y;return w;
}
