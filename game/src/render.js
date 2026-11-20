import {SIZE,ROADS,places,district,distance,clamp} from './world.js';
import {target,objective,chapters} from './story.js';
const PALETTE={water:'#3c9298',sand:'#e7d4a0',land:'#c4c5a0',road:'#576b71',walk:'#d7d1b1',ink:'#24434c'};
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
function line(c,x,y,xx,yy,color,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
function poly(c,points,color){c.beginPath();c.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);c.closePath();c.fillStyle=color;c.fill();}
function label(c,text,x,y,size=13,color='#fff0cb'){c.font='bold '+size+'px Arial';c.fillStyle=color;c.textAlign='center';c.fillText(text,x,y);}
export class Renderer {
  constructor(canvas,w){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.camera={x:w.player.x,y:w.player.y};this.zoom=.91;this.largeMap=false;this.actors=[];this.lastHud=-1;this.nodes={};
    for(const id of ['chapter','job','task','distance','stars','cash','heatText','district','health','hp','speed','carName','condition','prompt','speaker','line','dialogue','toast','radioState'])this.nodes[id]=document.getElementById(id);
    this.radar=document.getElementById('radar').getContext('2d');
    this.ground=document.createElement('canvas');this.ground.width=SIZE;this.ground.height=SIZE;
    this.paintCity(this.ground.getContext('2d'),w);
    this.map=document.createElement('canvas');this.map.width=512;this.map.height=512;this.paintMap(w);
    this.resize();addEventListener('resize',()=>this.resize());
  }
  resize(){this.width=innerWidth;this.height=innerHeight;this.canvas.width=innerWidth;this.canvas.height=innerHeight;this.tint=this.c.createLinearGradient(0,0,0,this.height);this.tint.addColorStop(0,'#ffe9ac08');this.tint.addColorStop(1,'#23466112');}
  paintCity(c,w){
    rect(c,0,0,SIZE,SIZE,PALETTE.water);
    rect(c,65,65,2830,3070,PALETTE.sand);
    rect(c,110,65,2595,3070,PALETTE.land);
    rect(c,2810,65,50,3070,'#d5c497');
    for(let y=70;y<3130;y+=18)line(c,2820,y,2860,y,'#b6a67c',2);
    for(let y=150;y<3100;y+=360){rect(c,2855,y,185,39,'#b3a481');for(let x=2860;x<3040;x+=14)line(c,x,y,x,y+39,'#8e967a');rect(c,3020,y-11,32,61,'#e0cc9a');}
    for(let y=100;y<3150;y+=60){line(c,2930,y,3160,y-14,'#8dc9bd40',2);line(c,2950,y+12,3100,y+3,'#b6d8c340',1);}
    for(const road of ROADS){
      rect(c,110,road-66,2695,132,PALETTE.walk);rect(c,road-66,70,132,3060,PALETTE.walk);
      rect(c,110,road-49,2695,98,PALETTE.road);rect(c,road-49,70,98,3060,PALETTE.road);
      line(c,110,road-51,2805,road-51,'#f5e0ac',2);line(c,110,road+51,2805,road+51,'#f5e0ac',2);
      line(c,road-51,70,road-51,3130,'#f5e0ac',2);line(c,road+51,70,road+51,3130,'#f5e0ac',2);
      c.setLineDash([21,17]);line(c,110,road,2805,road,'#e5cf8b',2);line(c,road,70,road,3130,'#e5cf8b',2);c.setLineDash([]);
    }
    for(const x of ROADS)for(const y of ROADS){
      rect(c,x-49,y-49,98,98,PALETTE.road);
      for(let k=-34;k<=34;k+=14){rect(c,x+k,y-64,7,13,'#e8e0c2');rect(c,x+k,y+51,7,13,'#e8e0c2');rect(c,x-64,y+k,13,7,'#e8e0c2');rect(c,x+51,y+k,13,7,'#e8e0c2');}
      circle(c,x+60,y-60,3,'#24464b');circle(c,x-60,y+60,3,'#24464b');
    }
    for(let y=140;y<3000;y+=410){
      rect(c,2460,y,160,80,'#9fbdad');rect(c,2473,y+12,134,56,'#5ba9af');rect(c,2480,y+18,120,43,'#78bfc0');
      for(let i=0;i<4;i++)rect(c,2440+i*46,y+95,22,9,'#efe0b3');
    }
    for(const b of w.buildings)this.building(c,b);
    for(let i=0;i<12;i++){
      const x=430+(i%6)*360,y=2930+Math.floor(i/6)*70;
      rect(c,x+8,y+10,145,47,'#344b4b40');rect(c,x,y,140,40,['#b47765','#729a9c','#e0b479'][i%3]);
      for(let k=10;k<137;k+=12)line(c,x+k,y+4,x+k,y+36,'#304a4930',2);
    }
    const signs=[['KITE FM',2580,1414,'#34616a'],['ROOK MOTORS',2070,741,'#b7d3bd'],['MARA’S',2070,1740,'#efbd9e'],['PORT AUTHORITY',1090,2185,'#c6ceab'],['CIVIC EXCHANGE',465,1750,'#d6b9b4']];
    for(const s of signs){rect(c,s[1]-70,s[2]-20,140,28,s[3]);label(c,s[0],s[1],s[2]-1,12,'#28434a');}
    c.save();c.translate(2856,1700);c.rotate(-Math.PI/2);label(c,'PELICAN STRAND  /  BREAKWATER COUNTY',0,0,14,'#927d57');c.restore();
    const streets=['GULL STREET','SOLAR AVENUE','CYPRESS DRIVE','PALMETTO BOULEVARD','PORT ROAD','DOCKSIDE'];
    for(let i=0;i<ROADS.length;i++)label(c,streets[i],2450,ROADS[i]+5,10,'#d1d3be');
    for(const palm of w.palms)this.palm(c,palm);
    for(let y=650;y<2850;y+=320){circle(c,2900,y,22,'#cb8f88');poly(c,[[2879,y],[2900,y],[2900,y-22]],'#f3d3a0');poly(c,[[2900,y],[2921,y],[2900,y+22]],'#f3d3a0');rect(c,2875,y+27,16,27,'#eee0b5');rect(c,2905,y+27,16,27,'#eee0b5');}
  }
  building(c,b){
    const x=b.x,y=b.y,z=b.z;
    poly(c,[[x+7,y+10],[x+b.w+z+15,y+15],[x+b.w+z+15,y+b.h+z+12],[x+z,y+b.h+z+12]],'#294c4e30');
    rect(c,x,y,b.w,b.h,'#9c9b87');rect(c,x,y-z,b.w,b.h,b.color);
    poly(c,[[x,y+b.h-z],[x+b.w,y+b.h-z],[x+b.w,y+b.h],[x,y+b.h]],'#a18e79');
    poly(c,[[x+b.w,y-z],[x+b.w+8,y-z+6],[x+b.w+8,y+b.h],[x+b.w,y+b.h-z]],'#879a91');
    rect(c,x+5,y-z+5,b.w-10,b.h-10,'#ffffff13');
    c.strokeStyle='#fff1c155';c.lineWidth=3;c.strokeRect(x+5,y-z+5,b.w-10,b.h-10);
    for(let xx=x+15;xx<x+b.w-12;xx+=25){rect(c,xx,y+b.h-z+4,13,11,'#405c65');rect(c,xx+1,y+b.h-z+4,3,10,'#8bafb0');}
    rect(c,x+18,y-z+18,29,23,'#7c9390');rect(c,x+20,y-z+16,25,19,'#c5c7af');
    for(let i=0;i<3;i++)line(c,x+24,y-z+21+i*4,x+40,y-z+21+i*4,'#859991');
    if(b.shop){rect(c,x+8,y+b.h-z-10,b.w-16,12,'#4c8281');for(let xx=x+10;xx<x+b.w-12;xx+=16)rect(c,xx,y+b.h-z-10,7,12,'#e6ca9c');}
  }
  palm(c,p){
    c.save();c.globalAlpha=.18;line(c,p.x,p.y,p.x+35,p.y+25,'#214a4a',6);for(let k=0;k<6;k++){const a=k*Math.PI/3;line(c,p.x+35,p.y+25,p.x+35+Math.cos(a)*28,p.y+25+Math.sin(a)*18,'#214a4a',7);}c.restore();
    line(c,p.x,p.y,p.x-7,p.y-p.z,'#9a8863',5);line(c,p.x-2,p.y,p.x-9,p.y-p.z,'#c1aa78',2);
    const x=p.x-7,y=p.y-p.z;
    for(let k=0;k<7;k++){const a=k*Math.PI*2/7;poly(c,[[x,y],[x+Math.cos(a-.24)*17,y+Math.sin(a-.24)*16],[x+Math.cos(a)*37,y+Math.sin(a)*28],[x+Math.cos(a+.2)*13,y+Math.sin(a+.2)*12]],k%2?'#3f7a66':'#568b68');}
    circle(c,x,y,4,'#acc183');
  }
  paintMap(w){
    const c=this.map.getContext('2d'),s=512/SIZE;c.fillStyle='#317c84';c.fillRect(0,0,512,512);c.save();c.scale(s,s);rect(c,90,70,2810,3070,'#b7b58f');
    for(const r of ROADS){rect(c,110,r-49,2690,98,'#536971');rect(c,r-49,70,98,3060,'#536971');}
    for(const b of w.buildings)rect(c,b.x,b.y,b.w,b.h,'#d8c5a4');rect(c,2810,70,75,3060,'#ead6a0');c.restore();
  }
  screenToWorld(x,y){return {x:(x-this.width/2)/this.zoom+this.camera.x,y:(y-this.height/2)/this.zoom+this.camera.y};}
  visible(o,margin=80){return Math.abs(o.x-this.camera.x)<this.width/this.zoom/2+margin&&Math.abs(o.y-this.camera.y)<this.height/this.zoom/2+margin;}
  vehicle(c,car,police,w){
    c.save();c.translate(car.x,car.y);c.rotate(car.a);
    rect(c,-22+5,-12+7,46,26,'#183e4750');
    rect(c,-16,-15,9,4,'#263f46');rect(c,10,-15,9,4,'#263f46');rect(c,-16,11,9,4,'#263f46');rect(c,10,11,9,4,'#263f46');
    rect(c,-24,-12,49,24,car.hp<=0?'#626664':police?'#e6e3c5':car.color);
    rect(c,-19,-10,37,20,police?'#345260':car.color);
    rect(c,-7,-10,22,20,'#315968');poly(c,[[4,-9],[14,-9],[17,9],[4,9]],'#78a7aa');
    rect(c,-9,-9,10,18,police?'#f0e5bd':car.color);line(c,-1,-8,9,-8,'#e8e3bd80');
    rect(c,23,-10,3,6,'#fff1b3');rect(c,23,4,3,6,'#fff1b3');rect(c,-25,-10,3,5,'#d87967');rect(c,-25,5,3,5,'#d87967');
    if(police){rect(c,-1,-12,5,24,'#e7e5c7');rect(c,-2,-8,7,7,Math.floor(w.time*7)%2?'#f17c70':'#7696c3');rect(c,-2,1,7,7,Math.floor(w.time*7)%2?'#7696c3':'#f17c70');}
    if(car===w.player.car){c.strokeStyle='#fff1b5';c.lineWidth=1.5;c.strokeRect(-27,-15,55,30);}
    if(car.hp<35&&Math.floor(w.time*6)%2)circle(c,21,-3,8,'#6e6a6660');
    c.restore();
  }
  person(c,p,kind,w){
    c.save();c.translate(p.x,p.y);if(p.hp<=0){c.rotate(p.a);rect(c,-10,-4,20,8,kind==='guard'?'#6f7771':p.shirt);c.restore();return;}
    circle(c,4,5,8,'#1a48523a');const stride=Math.sin(w.time*9+p.x)*3;
    line(c,-3,0,-4+stride,7,'#314b5c',4);line(c,3,0,4-stride,7,'#314b5c',4);
    circle(c,0,-4,7,kind==='player'?'#f5d8ac':kind==='guard'?'#5c7677':p.shirt);
    circle(c,0,-10,4.5,kind==='player'?'#bd8869':'#ce9f78');
    if(kind==='player'){line(c,0,-4,Math.cos(p.a)*13,Math.sin(p.a)*13-4,'#efd7aa',4);line(c,Math.cos(p.a)*11,Math.sin(p.a)*11-4,Math.cos(p.a)*19,Math.sin(p.a)*19-4,'#284650',3);c.strokeStyle='#ffe4a0';c.lineWidth=1.4;c.beginPath();c.ellipse(0,2,13,9,0,0,Math.PI*2);c.stroke();}
    if(kind==='guard')line(c,0,-4,Math.cos(p.a)*16,Math.sin(p.a)*16-4,'#25434b',4);
    c.restore();
  }
  marker(c,p,w){
    const pulse=1+Math.sin(w.time*4)*.1;
    c.save();c.translate(p.x,p.y);c.strokeStyle='#ffe19b';c.lineWidth=2;c.beginPath();c.ellipse(0,0,28*pulse,14*pulse,0,0,Math.PI*2);c.stroke();
    rect(c,-2,-75,4,65,'#ffe39a70');poly(c,[[0,-35],[10,-49],[0,-62],[-10,-49]],'#ffe19b');
    label(c,p.name,0,-86,13,'#193f49');c.restore();
  }
  draw(w,dt=1){
    const c=this.c,p=w.player;this.zoom=p.car?.86:.95;
    const blend=Math.min(1,dt*7);this.camera.x+=(p.x+Math.cos(p.a)*(p.car?50:0)-this.camera.x)*blend;this.camera.y+=(p.y+Math.sin(p.a)*(p.car?50:0)-this.camera.y)*blend;
    c.fillStyle=PALETTE.water;c.fillRect(0,0,this.width,this.height);c.save();c.translate(this.width/2,this.height/2);c.scale(this.zoom,this.zoom);c.translate(-this.camera.x,-this.camera.y);
    c.drawImage(this.ground,0,0);
    for(let y=0;y<3200;y+=90)line(c,2925+Math.sin(w.time*.6+y)*3,y,2995,y-8,'#d4e9c960',2);
    for(const x of ROADS)for(const y of ROADS)if(this.visible({x,y})){circle(c,x+60,y-60,3,Math.floor(w.time/6)%2?'#eb9477':'#9ed0a7');}
    for(const skid of w.skids)if(this.visible(skid)){c.save();c.translate(skid.x,skid.y);c.rotate(skid.a);rect(c,-8,-12,20,2,'#2b454760');rect(c,-8,10,20,2,'#2b454760');c.restore();}
    for(let i=0;i<w.tapes.length;i++)if(!w.collected.includes(i)&&this.visible(w.tapes[i])){const t=w.tapes[i];rect(c,t.x-8,t.y-6,16,12,'#f0b1bc');circle(c,t.x-3,t.y,2,'#284954');circle(c,t.x+4,t.y,2,'#284954');}
    for(const place of places)if(this.visible(place)&&place!==target(w)){circle(c,place.x,place.y,13,'#224b50bc');label(c,place.icon,place.x,place.y+4,13,place.color);}
    const goal=target(w);if(goal)this.marker(c,goal,w);
    this.actors.length=0;
    for(const car of w.cars)if(this.visible(car))this.actors.push({y:car.y,kind:0,ref:car});
    for(const cop of w.police)if(cop.hp>0&&this.visible(cop))this.actors.push({y:cop.y,kind:1,ref:cop});
    for(const person of w.people)if(this.visible(person))this.actors.push({y:person.y,kind:2,ref:person});
    for(const guard of w.enemies)if(this.visible(guard))this.actors.push({y:guard.y,kind:3,ref:guard});
    if(!p.car)this.actors.push({y:p.y,kind:4,ref:p});
    this.actors.sort((a,b)=>a.y-b.y);
    for(const actor of this.actors){if(actor.kind<2)this.vehicle(c,actor.ref,actor.kind===1,w);else this.person(c,actor.ref,actor.kind===4?'player':actor.kind===3?'guard':'civilian',w);}
    for(const b of w.bullets)line(c,b.x,b.y,b.x-b.vx*.018,b.y-b.vy*.018,b.enemy?'#f3a492':'#fff0ba',2);
    for(const part of w.particles){c.globalAlpha=clamp(part.life*2,0,1);circle(c,part.x,part.y,2.4,part.color);}c.globalAlpha=1;
    if(w.arrest>0){c.strokeStyle='#f3a995';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y,40,-Math.PI/2,-Math.PI/2+w.arrest/5*Math.PI*2);c.stroke();}
    c.restore();c.fillStyle=this.tint;c.fillRect(0,0,this.width,this.height);
    if(goal)this.edgeArrow(goal);
    if(this.largeMap)this.drawLargeMap(w);
    this.drawRadar(w);if(w.time-this.lastHud>.1||this.lastHud<0){this.hud(w);this.lastHud=w.time;}
  }
  edgeArrow(goal){
    const dx=(goal.x-this.camera.x)*this.zoom,dy=(goal.y-this.camera.y)*this.zoom;
    const limitX=this.width/2-70,limitY=this.height/2-70;
    if(Math.abs(dx)<limitX&&Math.abs(dy)<limitY)return;
    const factor=Math.min(limitX/Math.abs(dx),limitY/Math.abs(dy));const c=this.c;
    c.save();c.translate(this.width/2+dx*factor,this.height/2+dy*factor);c.rotate(Math.atan2(dy,dx));poly(c,[[13,0],[-10,-9],[-6,0],[-10,9]],'#ffe39a');c.restore();
  }
  mapDots(c,w,x,y,size){
    const scale=size/SIZE,p=w.player,t=target(w);
    if(t){c.setLineDash([4,4]);line(c,x+p.x*scale,y+p.y*scale,x+t.x*scale,y+t.y*scale,'#ffe4a6',1.5);c.setLineDash([]);circle(c,x+t.x*scale,y+t.y*scale,4,'#ffdc8f');}
    for(const place of places){circle(c,x+place.x*scale,y+place.y*scale,2,place.color);}
    for(const cop of w.police)if(cop.hp>0)circle(c,x+cop.x*scale,y+cop.y*scale,3,Math.floor(w.time*5)%2?'#fa9d8f':'#c9dcff');
    c.save();c.translate(x+p.x*scale,y+p.y*scale);c.rotate(p.a);poly(c,[[7,0],[-5,-4],[-3,0],[-5,4]],'#fff8dc');c.restore();
  }
  drawRadar(w){const c=this.radar;c.clearRect(0,0,190,190);c.drawImage(this.map,0,0,190,190);this.mapDots(c,w,0,0,190);label(c,'N',10,15,10,'#fff0cb');}
  drawLargeMap(w){
    const c=this.c,size=Math.min(this.height-90,600),x=(this.width-size)/2,y=(this.height-size)/2;
    rect(c,0,0,this.width,this.height,'#143844df');c.drawImage(this.map,x,y,size,size);this.mapDots(c,w,x,y,size);
    label(c,'BREAKWATER COUNTY / M to close',this.width/2,y-15,15);
    for(const place of places){label(c,place.name,x+place.x/SIZE*size,y+place.y/SIZE*size-9,10);}
    label(c,'Gold: current objective    Pink: tapes    Green: services',this.width/2,y+size+23,12);
  }
  set(id,text){const node=this.nodes[id];if(node.textContent!==String(text))node.textContent=text;}
  hud(w){
    const p=w.player,t=target(w),job=chapters[w.mission];
    this.set('chapter',w.mission<6?'KITE FM / '+String(w.mission+1).padStart(2,'0')+' OF 06':'KITE FM / THE CITY IS LISTENING');
    this.set('job',job?.name||'Your summer. Your city.');this.set('task',objective(w));this.set('distance',t?Math.round(distance(p,t))+' m / '+t.name:w.heat>0?'Stay unseen for 11 seconds to lower the search':'Lost mixtapes: '+w.collected.length+' / 6');
    this.set('stars','★'.repeat(Math.ceil(w.heat))+'☆'.repeat(5-Math.ceil(w.heat)));
    const money=Math.floor(p.money);
    if(this.moneyValue!==money){this.set('cash','$ '+money.toLocaleString());this.moneyValue=money;}
    this.set('heatText',w.arrest>0?'ARRESTING '+Math.round(w.arrest/5*100)+'%':w.heat>0?(w.escape>0?'SEARCHING / '+Math.max(0,Math.ceil(11-w.escape))+'s':'POLICE IN PURSUIT'):'No police attention');
    this.set('district',district(p.x,p.y));this.nodes.health.style.width=p.hp+'%';this.set('hp',Math.ceil(p.hp));
    this.set('speed',p.car?Math.round(Math.abs(p.car.v)*.28):0);this.set('carName',p.car?p.car.name:'On foot / Mouse to aim');this.nodes.condition.style.width=(p.car?Math.max(0,p.car.hp):100)*1.2+'px';
    let prompt='';
    if(t&&distance(p,t)<86){
      prompt=w.mission===2?(w.stage===0?'E • Enter the Port courier':p.car?.courier?'Delivery point • Pull in here':'Bring the Port courier here'):'F • '+(w.mission===0?'Talk to Nia':w.mission===3?'Take the ledger':'Interact');
    }
    if(!p.car)for(const car of w.cars)if(distance(p,car)<59&&car.hp>0){prompt='E • Enter '+car.name;break;}
    if(distance(p,places[5])<80)prompt='F • Diner / Heal & repair $40';
    if(distance(p,places[2])<80&&w.mission!==2)prompt='F • Respray / Clear search $100';
    this.set('prompt',prompt);this.set('radioState',w.radio?'FM • ON AIR':'FM • RADIO OFF');
    this.nodes.dialogue.classList.toggle('active',!!w.dialogue&&w.time<w.dialogueUntil);if(w.dialogue){this.set('speaker',w.dialogue.who);this.set('line',w.dialogue.text);}
    this.nodes.toast.classList.toggle('active',w.time<w.toastUntil);this.set('toast',w.toast);
  }
}
