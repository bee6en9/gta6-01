import {ROADS,clamp,distance,move,sight,solid} from './world.js';
import {toast,speak,updateStory} from './story.js';
export function crime(w,amount=1){w.heat=clamp(w.heat+amount,0,5);w.escape=0;}
export function burst(w,x,y,color,count=9){for(let i=0;i<count;i++)w.particles.push({x,y,vx:Math.cos(i*2.4)*55,vy:Math.sin(i*2.4)*55,life:.5,color});}
export function enterExit(w,sound){
  const p=w.player;
  if(p.car){
    if(Math.abs(p.car.v)>75){toast(w,'Slow down before getting out');return;}
    const car=p.car;
    for(const side of [1,-1]){const x=car.x+Math.cos(car.a+Math.PI/2)*side*32,y=car.y+Math.sin(car.a+Math.PI/2)*side*32;if(!solid(w,x,y,11)){p.x=x;p.y=y;p.car=null;car.v=0;toast(w,'On foot • Mouse to aim, click to fire');return;}}
    toast(w,'Door blocked • Move the car a little');return;
  }
  let nearest=null,d=65;
  for(const c of w.cars){const test=distance(p,c);if(test<d&&c.hp>0){nearest=c;d=test;}}
  if(nearest){p.car=nearest;nearest.traffic=false;nearest.v=0;if(!nearest.stolen){nearest.stolen=true;crime(w,.65);toast(w,'Vehicle borrowed • Police have a description');}sound.tone(220,.08,'square');}
  else toast(w,'Get closer to a vehicle and press E');
}
function updateTraffic(w,dt){
  for(const lane of w.lanes){
    lane.cars.sort((a,b)=>lane.axis===0?a.x-b.x:a.y-b.y);
    for(let i=0;i<lane.cars.length;i++){
      const c=lane.cars[i];if(!c.traffic||c.hp<=0)continue;
      c.yield=Math.max(0,(c.yield||0)-dt);
      let ahead=1000;
      const next=lane.cars[(i+(lane.dir>0?1:lane.cars.length-1))%lane.cars.length];
      if(next!==c&&next.traffic){ahead=(lane.axis===0?next.x-c.x:next.y-c.y)*lane.dir;if(ahead<0)ahead+=lane.axis===0?2660:2940;}
      const crossing=ROADS.some(road=>Math.abs((lane.axis===0?c.x:c.y)-road)<42);
      const red=Math.floor(w.time/6)%2===lane.axis;
      const nearPlayer=distance(c,w.player)<57;
      const desired=c.yield>0||ahead<68||nearPlayer||crossing&&red?0:c.cruise;
      c.v+=(desired-c.v)*Math.min(1,dt*3);
      if(lane.axis===0)c.x+=lane.dir*c.v*dt;else c.y+=lane.dir*c.v*dt;
      if(lane.axis===0){if(c.x<130)c.x=2790;if(c.x>2790)c.x=130;}
      else {if(c.y<120)c.y=3060;if(c.y>3080)c.y=130;}
    }
  }
}
function drive(w,input,dt,sound){
  const p=w.player,c=p.car;
  c.impact=Math.max(0,(c.impact||0)-dt);
  const throttle=(input.down('w','arrowup')?1:0)-(input.down('s','arrowdown')?1:0);
  c.v+=throttle*160*dt;
  c.v*=Math.pow(input.down(' ')? .13:.69,dt);
  c.v=clamp(c.v,-95,270);
  const steering=(input.down('d','arrowright')?1:0)-(input.down('a','arrowleft')?1:0);
  c.a+=steering*2.25*dt*clamp(c.v/85,-1,1)*(input.down(' ')?1.4:1);
  const hit=move(w,c,Math.cos(c.a)*c.v*dt,Math.sin(c.a)*c.v*dt,16);
  if(hit&&Math.abs(c.v)>35){c.hp-=Math.abs(c.v)*.065;c.v*=-.23;burst(w,c.x,c.y,'#ffdd8c');sound.crash();}
  if(Math.abs(steering*c.v)>90&&input.down(' ')){w.skids.push({x:c.x,y:c.y,a:c.a,life:12});if(w.skids.length>180)w.skids.shift();}
  for(const other of w.cars){
    if(other===c)continue;
    const d=distance(c,other);
    if(d<34&&Math.abs(c.v)>45&&c.impact===0){
      c.hp-=1.5;other.hp-=3;c.impact=1;other.yield=1.3;other.v=0;
      const a=Math.atan2(other.y-c.y,other.x-c.x);
      move(w,other,Math.cos(a)*(36-d),Math.sin(a)*(36-d),15);
      if(other.traffic)move(w,other,Math.cos(c.a+Math.PI/2)*26,Math.sin(c.a+Math.PI/2)*26,15);
      c.v*=.65;crime(w,.12);burst(w,c.x,c.y,'#ffdf98',5);sound.crash();
    }
  }
  for(const person of w.people)if(person.hp>0&&distance(c,person)<23&&Math.abs(c.v)>65){person.hp=0;crime(w,.65);burst(w,person.x,person.y,'#f1c695');}
  p.x=c.x;p.y=c.y;p.a=c.a;
  if(c.hp<=0){c.hp=0;p.car=null;p.x=c.x+37;p.hp-=15;toast(w,'Engine ruined • Find another ride');burst(w,c.x,c.y,'#ff9f64',20);}
}
function walk(w,input,dt,aim){
  const p=w.player;let dx=(input.down('d','arrowright')?1:0)-(input.down('a','arrowleft')?1:0),dy=(input.down('s','arrowdown')?1:0)-(input.down('w','arrowup')?1:0);
  const length=Math.hypot(dx,dy)||1,speed=input.down('shift')?155:96;
  move(w,p,dx/length*speed*dt,dy/length*speed*dt,10);
  p.a=Math.atan2(aim.y-p.y,aim.x-p.x);
}
function fire(w,who,angle,enemy=false){w.bullets.push({x:who.x+Math.cos(angle)*15,y:who.y+Math.sin(angle)*15,vx:Math.cos(angle)*550,vy:Math.sin(angle)*550,life:.85,enemy});burst(w,who.x+Math.cos(angle)*20,who.y+Math.sin(angle)*20,'#fff2a5',3);}
function spawnPolice(w){
  const p=w.player;
  const road=ROADS.reduce((a,b)=>Math.abs(a-p.x)<Math.abs(b-p.x)?a:b);
  w.police.push({x:road+20,y:clamp(p.y+(w.police.length%2?390:-390),110,3070),a:0,v:0,hp:100,car:true,cooldown:1});
}
function updatePolice(w,dt,sound){
  const p=w.player;w.spawnTimer-=dt;
  if(w.heat>0&&w.spawnTimer<=0&&w.police.length<Math.ceil(w.heat)+1){spawnPolice(w);w.spawnTimer=5;}
  let seen=false,close=false;
  for(const cop of w.police){
    if(cop.hp<=0)continue;
    const d=distance(p,cop);if(d<330&&sight(w,cop,p))seen=true;
    cop.a=Math.atan2(p.y-cop.y,p.x-cop.x);
    if(w.heat>0){
      const speed=p.car?Math.min(200,130+w.heat*12):65;
      if(d>30){const blocked=move(w,cop,Math.cos(cop.a)*speed*dt,Math.sin(cop.a)*speed*dt,14);if(blocked)move(w,cop,Math.cos(cop.a+Math.PI/2)*60*dt,Math.sin(cop.a+Math.PI/2)*60*dt,14);}
      if(d<52){close=true;if(p.car){p.car.v*=Math.pow(.4,dt);p.car.hp-=dt*2;}else p.hp-=dt*3;}
      cop.cooldown-=dt;
      if(w.heat>=3&&d<260&&d>65&&cop.cooldown<0&&sight(w,cop,p)){fire(w,cop,cop.a,true);cop.cooldown=1.8;}
    }
  }
  if(w.heat>0){
    w.escape=seen?0:w.escape+dt;
    if(w.escape>11){w.heat=Math.max(0,w.heat-1);w.escape=0;toast(w,w.heat>0?'Search cooling down • Keep out of sight':'Search called off • You’re clear');if(w.heat===0)w.police.length=0;}
    w.arrest=close&&(p.car?Math.abs(p.car.v)<20:true)?w.arrest+dt:Math.max(0,w.arrest-dt*2);
    if(w.arrest>5)recover(w,'BUSTED • $120 impound fee');
  }
}
export function recover(w,message){
  const p=w.player;if(p.car)p.car.v=0;p.car=null;p.x=2695;p.y=1480;p.hp=100;p.money=Math.max(0,p.money-120);w.heat=0;w.police.length=0;w.arrest=0;w.escape=0;
  if(w.mission===2)w.stage=0;
  toast(w,message);speak(w,'NIA / KITE FM','You’re still breathing. That’s what counts. The job is waiting when you’re ready.');
}
export function update(w,input,dt,sound,aim){
  w.time+=dt;const p=w.player;p.cooldown-=dt;
  if(input.tap('e'))enterExit(w,sound);
  if(p.car)drive(w,input,dt,sound);else walk(w,input,dt,aim);
  if(input.mouse.down&&p.cooldown<=0&&!p.car){fire(w,p,p.a);p.cooldown=.26;crime(w,.18);sound.shot();}
  if(input.tap(' ')&&!p.car&&p.cooldown<=0){
    p.cooldown=.4;burst(w,p.x+Math.cos(p.a)*23,p.y+Math.sin(p.a)*23,'#fff0c9',6);sound.tone(80,.09);
    for(const list of [w.enemies,w.police,w.people])for(const actor of list)if(actor.hp>0&&distance(p,actor)<57){actor.hp-=40;crime(w,.5);toast(w,'Melee hit');}
  }
  updateTraffic(w,dt);
  for(const person of w.people){
    if(person.hp<=0)continue;
    if(distance(person,p)<150&&(input.mouse.down||w.heat>1))person.panic=3;
    person.panic=Math.max(0,person.panic-dt);
    const speed=person.v*(person.panic>0?2.8:1)*person.dir;
    if(move(w,person,Math.cos(person.a)*speed*dt,Math.sin(person.a)*speed*dt,5))person.dir*=-1;
    if(person.x<120||person.x>2880||person.y<100||person.y>3070)person.dir*=-1;
  }
  for(const guard of w.enemies){
    if(guard.hp<=0)continue;guard.cooldown-=dt;
    if(w.mission>=3&&distance(guard,p)<380&&sight(w,guard,p)){
      guard.a=Math.atan2(p.y-guard.y,p.x-guard.x);
      if(distance(guard,p)>140)move(w,guard,Math.cos(guard.a)*35*dt,Math.sin(guard.a)*35*dt,9);
      if(guard.cooldown<=0){fire(w,guard,guard.a,true);guard.cooldown=1.6;}
    }
  }
  updatePolice(w,dt,sound);
  for(const b of w.bullets){
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    if(solid(w,b.x,b.y,2)){b.life=0;burst(w,b.x,b.y,'#f8d49f',3);}
    if(b.enemy){if(distance(b,p)<(p.car?22:12)){if(p.car)p.car.hp-=5;else p.hp-=9;b.life=0;}}
    else for(const list of [w.enemies,w.police,w.people])for(const actor of list){if(b.life>0&&actor.hp>0&&distance(b,actor)<17){actor.hp-=35;b.life=0;burst(w,actor.x,actor.y,'#e2b899');if(actor.hp<=0){p.money+=actor.shirt?0:35;toast(w,actor.shirt?'Civilian hurt • Police alerted':'+$35 • Threat stopped');}crime(w,actor.shirt?.4:.25);}}
  }
  for(const part of w.particles){part.x+=part.vx*dt;part.y+=part.vy*dt;part.life-=dt;}
  for(const skid of w.skids)skid.life-=dt;
  w.bullets=w.bullets.filter(b=>b.life>0);w.particles=w.particles.filter(b=>b.life>0);w.skids=w.skids.filter(b=>b.life>0);
  updateStory(w,input,sound);
  p.hp=clamp(p.hp,0,100);if(p.hp<=0)recover(w,'WIPED OUT • Mara patched you up ($120)');
}
