const UP=['KeyW','ArrowUp'], DOWN=['KeyS','ArrowDown'], LEFT=['KeyA','ArrowLeft'], RIGHT=['KeyD','ArrowRight'];
const mix=(a,b,t)=>a+(b-a)*t;
const turn=(a,b)=>mod(b-a+Math.PI,TAU)-Math.PI;
function burst(w,x,y,color,n=9){
  for(let i=0;i<n;i++){
    const a=Math.random()*TAU,v=24+Math.random()*95,life=.25+Math.random()*.36;
    w.particles.push({x,y,dx:Math.cos(a)*v,dy:Math.sin(a)*v,life,max:life,color});
  }
}
function nearestCar(w,r=61){
  let best=null,d=r;
  for(const c of w.cars)if(!c.sold&&c.hp>0){
    const gap=dist(w.player,c);
    if(gap<d){d=gap;best=c;}
  }
  return best;
}
function useCar(w,sound){
  const p=w.player,c=p.car;
  if(c){
    if(Math.abs(c.speed)>85){notify(w,'SLOW DOWN TO EXIT');return;}
    for(const side of [1,-1,2,-2]){
      const a=c.a+Math.sign(side)*(Math.abs(side)===1?Math.PI/2:Math.PI);
      const x=c.x+Math.cos(a)*30,y=c.y+Math.sin(a)*30;
      if(solid(w,x,y,10))continue;
      p.car=null;p.x=x;p.y=y;c.speed=0;sound('door');return;
    }
    return;
  }
  const ride=nearestCar(w);
  if(!ride)return;
  if(ride.lane){
    const occupants=ride.lane.cars;
    occupants.splice(occupants.indexOf(ride),1);ride.lane=null;
    w.people.push({x:ride.x,y:ride.y+19,axis:'x',dir:-1,pace:47,a:Math.PI,step:0,color:'#d08456',skin:'#a97551'});
  }
  if(!ride.owned){raiseHeat(w,1);notify(w,'REPORTED STOLEN / '+ride.name.toUpperCase());}
  p.car=ride;p.x=ride.x;p.y=ride.y;p.a=ride.a;sound('door');
}
function trafficStep(w,dt){
  for(const lane of w.lanes){
    const {cars,axis,dir,length}=lane;
    const along=c=>dir*c[axis];
    cars.sort((a,b)=>along(a)-along(b));
    const n=cars.length;
    for(let i=0;i<n;i++){
      const c=cars[i],ahead=cars[(i+1)%n],gap=n>1?mod(along(ahead)-along(c),length):length;
      const next=ROADS.reduce((v,r)=>Math.min(v,mod(dir*(r-c[axis]),length)),length);
      const red=(Math.floor(w.time/7)+(axis==='x'?0:1))%2!==0;
      const limit=red&&next>32&&next<96?Math.max(0,(next-34)*3):c.cruise;
      c.nextSpeed=mix(c.speed,Math.min(limit,Math.max(0,(gap-46)*2.8)),Math.min(1,dt*7));
    }
    for(const c of cars){
      c.speed=c.nextSpeed;
      c[axis]=mod(c[axis]+dir*c.speed*dt,length);
    }
  }
}
function drive(w,dt,input,sound){
  const p=w.player,c=p.car;
  const throttle=+input.held(...UP)-input.held(...DOWN),steer=+input.held(...RIGHT)-input.held(...LEFT);
  if(!c){
    const n=Math.hypot(steer,throttle)||1,v=input.held('ShiftLeft','ShiftRight')?233:153;
    if(steer||throttle){
      moveBody(w,p,steer/n*v*dt,-throttle/n*v*dt,9);
      p.a=Math.atan2(-throttle,steer);p.step+=dt*v*.075;
    }
    return;
  }
  const braking=input.held('Space'),top=(w.tuned?408:348)-c.kind*24;
  c.speed=clamp((c.speed+throttle*(throttle<0&&c.speed>0?465:266)*dt)*Math.exp(-dt*(braking?5.2:throttle?.24:1.08)),-122,top);
  c.a+=steer*Math.sign(c.speed)*dt*Math.min(braking?3.8:2.5,Math.abs(c.speed)/29);
  const impact=Math.abs(c.speed),dx=Math.cos(c.a)*c.speed*dt,dy=Math.sin(c.a)*c.speed*dt;
  if(moveBody(w,c,dx,dy,17)){
    c.speed*=-.24;
    if(impact>70){c.hp-=impact*.033*(w.tuned?.55:1);burst(w,c.x,c.y,'#ffd688');sound('hit');}
  }
  for(const other of w.cars){
    if(other===c||other.sold||dist(other,c)>34)continue;
    const d=Math.max(1,dist(other,c));
    moveBody(w,c,(c.x-other.x)/d*(35-d),(c.y-other.y)/d*(35-d),17);
    c.speed*=-.24;
    if(impact>78&&w.time>(c.bump||0)){
      c.bump=w.time+.42;c.hp-=impact*.032;
      if(other.lane)other.speed*=.36;
      burst(w,c.x,c.y,'#f8c98b');sound('hit');
    }
  }
  for(const ped of w.people)if(impact>120&&dist(c,ped)<17&&w.time>(ped.scared||0)){
    ped.scared=w.time+3;ped.dir*=-1;raiseHeat(w,.7);c.speed*=.84;
    burst(w,ped.x,ped.y,'#f3cead',5);
  }
  if(Math.abs(c.speed)>175&&(braking&&steer||c.hp<30)&&Math.random()<dt*18)burst(w,c.x-Math.cos(c.a)*15,c.y-Math.sin(c.a)*15,'#ccd3c7',2);
  p.x=c.x;p.y=c.y;p.a=c.a;
  if(c.hp<=0){
    c.speed=0;p.car=null;p.hp-=22;burst(w,c.x,c.y,'#fca26b',28);notify(w,'VEHICLE DISABLED');
  }
}
function walkCivilians(w,dt){
  for(const p of w.people){
    const flee=dist(p,w.player)<110&&(w.heat>0||w.player.car?.speed>120);
    const v=(flee?2.6:1)*p.pace;
    p[p.axis]=mod(p[p.axis]+p.dir*v*dt,p.axis==='x'?LAND:SIZE);
    p.a=p.axis==='x'?(p.dir>0?0:Math.PI):p.dir*Math.PI/2;p.step+=dt*v*.065;
  }
}
function fireWeapon(w,input,sound,aim){
  const p=w.player;
  if(p.car)return;
  if(w.reloading&&w.time>=w.reloading){
    const n=Math.min(8-w.ammo,w.reserve);w.ammo+=n;w.reserve-=n;w.reloading=0;
  }
  if((input.tap('KeyR')||!w.ammo&&input.mouse.fire)&&!w.reloading&&w.reserve&&w.ammo<8){
    w.reloading=w.time+.74;sound('reload');
  }
  const mouse=input.mouse.fire;
  if((!mouse&&!input.held('Space'))||w.reloading||!w.ammo||w.time<(w.fire||0))return;
  if(mouse&&input.mouse.active)p.a=Math.atan2(aim.y-p.y,aim.x-p.x);
  if(!mouse){
    let closest=420;
    for(const group of [w.guards,w.police])for(const g of group)if(g.hp>0&&(group!==w.guards||w.mission===1)){
      const d=dist(g,p);
      if(d<closest&&sight(w,p,g)){closest=d;p.a=Math.atan2(g.y-p.y,g.x-p.x);}
    }
  }
  w.ammo--;w.fire=w.time+.22;p.firing=w.time+.16;sound('shot');
  if(w.mission!==1||dist(p,places.depot)>170)raiseHeat(w,.24);
  const dx=Math.cos(p.a),dy=Math.sin(p.a);
  let x=p.x,y=p.y;
  for(let i=13;i<430;i+=8){
    x=p.x+dx*i;y=p.y+dy*i;
    if(solid(w,x,y,1)){burst(w,x,y,'#ffc385',5);break;}
    let hit=null;
    if(w.mission===1)hit=w.guards.find(g=>g.hp>0&&Math.hypot(g.x-x,g.y-y)<14);
    hit ||= w.police.find(g=>g.hp>0&&Math.hypot(g.x-x,g.y-y)<(g.vehicle?22:13));
    if(hit){hit.hp-=25;burst(w,x,y,'#ff7960');if(w.police.includes(hit))raiseHeat(w,.7);break;}
  }
  w.traces.push({x:p.x+dx*12,y:p.y+dy*12,tx:x,ty:y,life:.085});
  burst(w,p.x+dx*13,p.y+dy*13,'#ffe7a0',5);
}
function policeStep(w,dt,sound){
  const p=w.player;
  if(w.heat<=0){w.police.length=0;w.arrest=0;return;}
  const stars=Math.ceil(w.heat);
  const nearestRoad=v=>ROADS.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);
  w.police=w.police.filter(o=>o.hp>0&&dist(o,p)<1050);
  if(w.time>w.spawn&&w.police.length<stars+1){
    const i=w.police.length,sign=i%2?-1:1;
    const x=nearestRoad(p.x)+(i%2?-22:22),y=clamp(p.y+sign*(290+i*45),40,SIZE-40);
    w.police.push({x,y,a:sign*Math.PI/2+Math.PI,vehicle:true,hp:100,speed:0,color:'#eee7d5',
      kind:1,siren:i*.41,cool:0,step:0});
    w.spawn=w.time+1.55;
  }
  let seen=false,contact=false;
  for(const o of w.police){
    let d=dist(p,o);
    const visible=d<305&&sight(w,o,p);
    seen||=visible;
    if(o.vehicle&&d<105&&!p.car&&visible&&w.police.length<7&&!o.deployed){
      o.deployed=true;
      w.police.push({x:o.x,y:o.y,a:o.a,hp:55,color:'#4a78a9',skin:'#c08661',step:0,cool:.7});
    }
    const direct=Math.atan2(p.y-o.y,p.x-o.x);
    let a=direct;
    if(!visible&&solid(w,o.x+Math.cos(a)*28,o.y+Math.sin(a)*28,11)){
      const choices=[direct+1.1,direct-1.1,direct+2.2,direct-2.2];
      a=choices.find(k=>!solid(w,o.x+Math.cos(k)*30,o.y+Math.sin(k)*30,12))??o.a;
    }
    o.a+=turn(o.a,a)*Math.min(1,dt*(o.vehicle?4.5:11));
    const speed=o.vehicle?(p.car?263+stars*13:d>65?145:15):101+stars*7;
    const v=Math.min(d,speed*dt);
    if(o.vehicle)o.speed=speed;
    moveBody(w,o,Math.cos(o.a)*v,Math.sin(o.a)*v,o.vehicle?15:8);
    o.step+=dt*10;
    d=dist(p,o);
    if(p.car&&o.vehicle&&d<33&&w.time>(o.cool||0)){
      o.cool=w.time+.6;p.car.speed*=.58;p.car.hp-=7;
      moveBody(w,p.car,Math.cos(direct)*8,Math.sin(direct)*8,17);
      p.x=p.car.x;p.y=p.car.y;
      burst(w,p.x,p.y,'#ffb873');sound('hit');
      if(p.car.hp<=0){p.car.speed=0;p.car=null;p.hp-=18;notify(w,'VEHICLE DISABLED');}
    }
    if(d<(o.vehicle?37:24)&&(!p.car||Math.abs(p.car.speed)<68))contact=true;
  }
  w.search=seen?10:Math.max(0,w.search-dt);
  if(!seen&&w.search===0){w.heat=0;w.police.length=0;notify(w,'PATROL LOST');sound('tick');}
  w.arrest=clamp(w.arrest+(contact?dt:-dt*1.5),0,2);
  if(w.arrest>=2)recover(w,'BOOKED / IMPOUND FEE',160);
}
function guardStep(w,dt,sound){
  if(w.mission!==1)return;
  const p=w.player;
  for(const g of w.guards)if(g.hp>0){
    const d=dist(g,p);
    const watching=d<247&&sight(w,g,p);
    const goal=watching?p:g.home;
    if(watching||dist(g,goal)>5){
      g.a=Math.atan2(goal.y-g.y,goal.x-g.x);
      if(!watching||d>68){
        moveBody(w,g,Math.cos(g.a)*dt*55,Math.sin(g.a)*dt*55,8);g.step+=dt*7;
      }
    }
    if(watching&&w.time>g.cool){
      g.cool=w.time+1.3+Math.random()*.77;
      w.traces.push({x:g.x,y:g.y,tx:p.x+(Math.random()-.5)*18,ty:p.y+(Math.random()-.5)*18,life:.10});
      p.hp-=(p.car?2:5);w.hurt=w.time+.25;sound('hit');
    }
  }
}
function recover(w,reason,fee){
  const p=w.player;
  if(p.car)p.car.speed=0;
  p.car=null;p.x=2598;p.y=358;p.hp=100;p.cash=Math.max(0,p.cash-fee);
  w.heat=0;w.arrest=0;w.search=0;w.police.length=0;w.race=null;w.ammo=8;w.reserve=Math.max(w.reserve,20);
  notify(w,reason+'   −$'+fee);writeSave(w);
}
function simulate(w,dt,input,sound,aim){
  w.time+=dt;
  if(input.tap('KeyE'))useCar(w,sound);
  if(input.tap('KeyQ')){w.radio=!w.radio;notify(w,w.radio?'KITE FM  /  84.3':'RADIO OFF');}
  trafficStep(w,dt);drive(w,dt,input,sound);walkCivilians(w,dt);
  fireWeapon(w,input,sound,aim);guardStep(w,dt,sound);policeStep(w,dt,sound);
  if(w.player.hp<=0)recover(w,'TREATED AT KITE GARAGE',120);
  storyStep(w,input.tap('KeyF'),dt,sound);
  for(const p of w.particles){p.x+=p.dx*dt;p.y+=p.dy*dt;p.life-=dt;}
  for(const t of w.traces)t.life-=dt;
  w.particles=w.particles.filter(p=>p.life>0);w.traces=w.traces.filter(t=>t.life>0);
}
