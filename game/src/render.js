function box(c,x,y,w,h,color){
  c.fillStyle=color;c.fillRect(x,y,w,h);
}
function oval(c,x,y,rx,ry,color){
  c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();
}
function path(c,points,color){
  c.fillStyle=color;c.beginPath();c.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
  c.closePath();c.fill();
}
function label(c,text,x,y,size,color,align='left',weight=700){
  c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';
  c.font=weight+' '+size+'px system-ui';c.fillText(text,x,y);
}
function buildGround(c,w){
  const sea=c.createLinearGradient(2640,0,2880,0);
  sea.addColorStop(0,'#7bbcb0');sea.addColorStop(.31,'#47a79d');sea.addColorStop(1,'#14697a');
  box(c,0,0,SIZE,SIZE,sea);
  const sand=c.createLinearGradient(2635,0,2757,0);
  sand.addColorStop(0,'#e4b781');sand.addColorStop(.8,'#f5d7a2');sand.addColorStop(1,'#91c3aa');
  c.fillStyle=sand;c.beginPath();c.moveTo(0,0);c.lineTo(2740,0);
  for(let y=0;y<=SIZE;y+=20)c.lineTo(2735+12*Math.sin(y/77)+8*Math.sin(y/193),y);
  c.lineTo(0,SIZE);c.fill();
  box(c,0,0,2657,SIZE,'#be9b73');
  const r=randomSource(6702);
  for(let i=0;i<8000;i++){
    const x=r()*2755,y=r()*SIZE;
    box(c,x,y,1+r()*3,1+r()*2,i%3?'#302f2720':'#fff1cc58');
  }
  for(const l of w.lots){
    box(c,l.x-5,l.y-5,l.w+10,l.h+10,'#e2ba8c');
    box(c,l.x,l.y,l.w,l.h,l.park?'#759177':l.port?'#a49d86':'#c2a782');
    for(let j=0;j<l.h-1;j+=14)box(c,l.x,l.y+j,l.w,1,'#fff0c326');
    if(l.park){
      box(c,l.x+5,l.y+l.h*.52,l.w-10,10,'#d8bc8e');
      box(c,l.x+l.w*.47,l.y+4,10,l.h-8,'#d8bc8e');
      if(l.w>150&&l.h>150){
        box(c,l.x+25,l.y+27,100,66,'#eed5ab');box(c,l.x+31,l.y+33,88,54,'#50a8a3');
        for(let j=0;j<5;j++)box(c,l.x+35,l.y+39+j*9,80,1,'#a0e3d3');
        for(let j=0;j<3;j++)box(c,l.x+136,l.y+31+j*20,14,8,'#e98d6b');
      }
    }else if(l.port){
      for(let j=0;j<4;j++){
        box(c,l.x+8+j*22,l.y+l.h-47,18,32,['#9d6258','#c69464','#64958c','#77808f'][j]);
        for(let k=0;k<5;k++)box(c,l.x+10+j*22,l.y+l.h-43+k*5,14,1,'#3d49494d');
      }
    }else for(let i=12;i<l.w-18;i+=18){
      box(c,l.x+i,l.y+l.h-24,1,18,'#f8e2ab99');
      box(c,l.x+i,l.y+l.h-6,16,1,'#f8e2ab99');
    }
  }
  for(const axis of ['x','y'])for(const r0 of ROADS){
    const h=axis==='x',length=h?2657:SIZE;
    c.save();if(!h)c.transform(0,1,1,0,0,0);
    box(c,0,r0-67,length,134,'#dfbf95');
    box(c,0,r0-52,length,104,'#843f4c');
    box(c,0,r0-49,length,98,'#4d5360');
    box(c,0,r0-44,length,88,'#535865');
    for(let i=6;i<length;i+=11){
      box(c,i,r0-61,8,1,'#f5d5a5');box(c,i,r0+60,8,1,'#aa8268');
    }
    for(let i=1;i<length;i+=32){
      if(ROADS.some(a=>Math.abs(i-a)<67))continue;
      box(c,i,r0-2,17,1,'#e2b576');box(c,i,r0+2,17,1,'#e2b576');
    }
    c.restore();
  }
  for(const x of ROADS)for(const y of ROADS){
    box(c,x-48,y-48,96,96,'#535865');
    for(let i=-36;i<=36;i+=9){
      box(c,x+i,y-49,4,12,'#c9beb0');box(c,x+i,y+37,4,12,'#c9beb0');
      box(c,x-49,y+i,12,4,'#c9beb0');box(c,x+37,y+i,12,4,'#c9beb0');
    }
    for(const dx of [-55,55])for(const dy of [-55,55]){
      oval(c,x+dx+6,y+dy+7,5,4,'#332b3b54');
      oval(c,x+dx,y+dy,3,3,'#5e4148');
    }
  }
  for(const y of [448,1440,2490]){
    box(c,2691,y+7,128,29,'#244e5d70');box(c,2680,y,133,28,'#a57962');
    for(let x=2682;x<2811;x+=7)box(c,x,y+2,1,24,'#e4b887');
    box(c,2680,y,133,3,'#f1c597');box(c,2680,y+25,133,3,'#705d5c');
  }
  for(let i=0;i<18;i++){
    const y=350+i*83,x=2716+7*Math.sin(i);
    c.save();c.translate(x,y);c.rotate(i%2?.13:-.16);
    box(c,-13,-9,26,18,colors[i%6]);box(c,-11,-1,22,2,'#f8ead688');c.restore();
  }
  box(c,2651,0,14,SIZE,'#d6ad89');
  for(let y=3;y<SIZE;y+=12)box(c,2652,y,12,1,'#f7d6a7');
  c.save();c.translate(2639,557);c.rotate(-Math.PI/2);label(c,'M A R I G O L D   /   E S P L A N A D E',0,0,11,'#dbc5a9');c.restore();
  for(const b of w.buildings)drawBuilding(c,b);
  for(const p of w.palms)drawPalm(c,p);
  for(const [x,y,name] of [[2679,880,'MARIGOLD'],[2679,2380,'LAST LIGHT']]){
    c.save();c.translate(x,y);c.rotate(Math.PI/2);label(c,name,0,0,9,'#835f55');c.restore();
  }
}
function drawBuilding(c,b){
  const {x,y,w,h,z,k}=b,ox=-z*.32,oy=-z*.57,X=x+ox,Y=y+oy;
  path(c,[[x,y],[x+w,y],[x+w+z*.77,y+z*.62],[x+w+z*.77,y+h+z*.62],[x+z*.25,y+h+z*.62],[x,y+h]],'#34274542');
  path(c,[[X,Y+h],[X+w,Y+h],[x+w,y+h],[x,y+h]],'#895d60');
  path(c,[[X+w,Y],[x+w,y],[x+w,y+h],[X+w,Y+h]],'#625262');
  box(c,X,Y,w,h,b.color);
  box(c,X+4,Y+4,w-8,h-8,'#fff1c333');
  box(c,X,Y,w,3,'#fff0bd');box(c,X,Y,3,h,'#ffedc994');
  box(c,X,Y+h-4,w,4,'#503b574f');box(c,X+w-4,Y,4,h,'#503b574f');
  for(let j=11;j<w-10;j+=14){
    const wy=Y+h+Math.max(3,(y-Y)*.33);
    box(c,X+j+4,wy,7,Math.max(2,z*.12),'#344352');
    box(c,X+j+4,wy,7,1,'#edbf8a');
  }
  if(w>48&&h>35){
    const rx=X+w*.56,ry=Y+h*.27;
    box(c,rx+5,ry+6,23,14,'#302c4652');box(c,rx,ry,23,14,'#ddd1b2');
    for(let j=0;j<5;j++)box(c,rx+3+j*4,ry+3,1,8,'#7b7f78');
    if(k%4===0){
      box(c,X+8,Y+9,w*.32,h*.35,'#eddfbf');box(c,X+11,Y+12,w*.32-6,h*.35-6,'#4b9c9b');
    }
    const size=Math.min(11,(w-13)/(b.name.length*.62));
    box(c,X+6,Y+h-19,w-12,14,'#3c3d50');
    label(c,b.name,X+w/2,Y+h-12,size,'#ffe5b6','center',800);
  }
}
function drawPalm(c,{x,y,s,k}){
  c.save();c.translate(x,y);
  oval(c,s*.55,s*.34,s*.85,s*.42,'#29273d35');
  c.strokeStyle='#855f59';c.lineWidth=3;c.beginPath();c.moveTo(1,4);c.quadraticCurveTo(4,-s*.32,-2,-s*.64);c.stroke();
  c.translate(-2,-s*.64);c.rotate(k*TAU);
  for(let i=0;i<7;i++){
    c.rotate(TAU/7);
    path(c,[[0,0],[s*.33,-s*.17],[s*.75,-s*.12],[s,0],[s*.61,s*.03],[s*.39,s*.17]],i%3===0?'#abc27b':i%3===1?'#53795d':'#72955e');
    box(c,1,-.45,s*.78,.9,'#d3ce8766');
  }
  oval(c,0,0,3,3,'#c39e64');c.restore();
}
function drawCar(c,o,time){
  c.save();c.translate(o.x,o.y);c.rotate(o.a);
  const len=[43,47,38][o.kind||0],b=len/2;
  oval(c,3,4,b+2,13,'#25213568');
  for(const x of [-b+6,b-13])for(const y of [-12,8])box(c,x,y,8,4,'#242731');
  c.fillStyle=o.hp<=0?'#504654':o.color;c.beginPath();c.roundRect(-b,-10,len,20,5);c.fill();
  box(c,-b+4,-9,len-10,2,'#fff1ce89');
  box(c,-b+4,7,len-10,2,'#442d5546');
  path(c,[[-12,-7],[9,-7],[15,-5],[15,5],[9,7],[-12,7],[-15,5],[-15,-5]],'#30434e');
  path(c,[[-9,-7],[7,-7],[10,-4],[10,4],[7,7],[-9,7]],o.hp<=0?'#6b6066':o.color);
  box(c,11,-4,3,8,'#809fa6');box(c,-14,-5,3,10,'#94a6a5');
  box(c,b-3,-8,3,4,'#fff0b0');box(c,b-3,4,3,4,'#fff0b0');
  box(c,-b,-8,3,4,'#f16570');box(c,-b,4,3,4,'#f16570');
  if(o.vehicle){
    box(c,-8,-10,11,20,'#344e70');
    const red=Math.sin(time*22+o.siren)>0;
    oval(c,-1,0,12,13,red?'#fe446550':'#42cbff55');
    box(c,-3,-8,5,7,red?'#ff3e60':'#9b4163');
    box(c,-3,2,5,7,red?'#3f619e':'#58e4ff');
  }
  c.restore();
}
function drawPerson(c,p,time,hero){
  c.save();c.translate(p.x,p.y);
  oval(c,4,5,11,6,'#28243e54');
  if(hero){c.strokeStyle='#ffe498aa';c.lineWidth=1.3;c.beginPath();c.arc(0,0,12,0,TAU);c.stroke();}
  c.rotate(p.a||0);const gait=Math.sin(p.step||0)*3.6;
  box(c,-8+gait,-5,8,3,'#303647');box(c,-8-gait,2,8,3,'#303647');
  oval(c,0,0,6.5,7,p.color);oval(c,3,-.5,4.5,4.2,p.skin||'#bd8968');
  box(c,1,-4,3,7,'#473946');
  if(hero&&time<=(p.firing||0))box(c,6,-2,9,2,'#34303e');
  c.restore();
}
function beacon(c,p,time,color,caption){
  const pulse=(Math.sin(time*4.5)+1)*.5;
  c.strokeStyle=color;c.lineWidth=1.6;c.beginPath();c.ellipse(p.x,p.y,16+pulse*5,12+pulse*4,0,0,TAU);c.stroke();
  path(c,[[p.x,p.y-15],[p.x-6,p.y-25],[p.x,p.y-31],[p.x+6,p.y-25]],color);
  if(caption){
    c.font='800 10px system-ui';const width=c.measureText(caption).width+16;
    box(c,p.x-width/2,p.y-50,width,15,'#192735e8');
    label(c,caption,p.x,p.y-42,10,color,'center',800);
  }
}
class Renderer {
  constructor(canvas,map,w){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});
    this.map=map;this.mc=map.getContext('2d',{alpha:false});
    this.groundCanvas=document.createElement('canvas');
    this.groundCanvas.width=this.groundCanvas.height=2880;
    buildGround(this.groundCanvas.getContext('2d',{alpha:false}),w);
    this.mapCache=document.createElement('canvas');this.mapCache.width=this.mapCache.height=384;
    const m=this.mapCache.getContext('2d',{alpha:false});m.drawImage(this.groundCanvas,0,0,384,384);
    const g=m.getImageData(0,0,384,384);
    for(let i=0;i<g.data.length;i+=4){
      const l=.34*g.data[i]+.5*g.data[i+1]+.16*g.data[i+2];
      g.data[i]=l*.32;g.data[i+1]=l*.37+9;g.data[i+2]=l*.43+14;
    }
    m.putImageData(g,0,0);
    this.actors=[];this.resize();addEventListener('resize',()=>this.resize());
  }
  resize(){
    this.width=innerWidth;this.height=innerHeight;this.dpr=Math.min(devicePixelRatio,1.5);
    this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);
    const c=this.c,w=this.width,h=this.height;
    this.vignette=c.createRadialGradient(w*.55,h*.47,h*.23,w*.52,h*.5,Math.max(w,h)*.69);
    this.vignette.addColorStop(0,'#17243b00');this.vignette.addColorStop(1,'#18223982');
  }
  aim(w,m){
    const z=this.zoom||1;
    return {x:w.camera.x+(m.x-this.width*.5)/z,y:w.camera.y+(m.y-this.height*.5)/z};
  }
  ground(w){
    const c=this.c;
    c.drawImage(this.groundCanvas,0,0);
    c.lineWidth=1.2;
    for(let i=0;i<38;i++){
      const y=i*77-20,x=2750+mod(w.time*6+i*43,115);
      c.strokeStyle=i%4===0?'#def4db80':'#b8e9d342';
      c.beginPath();c.moveTo(x-8,y);c.quadraticCurveTo(x+9,y+13,x,y+29+i%8);c.stroke();
    }
    const green=Math.floor(w.time/7)%2===0;
    oval(c,2545,144,3,3,green?'#99e391':'#ff6676');
    oval(c,2655,256,3,3,green?'#ff6676':'#99e391');
  }
  drawMap(w,expanded){
    const c=this.mc,p=w.player,size=this.map.width,mid=size/2;
    const view=expanded?SIZE:840,s=size/view,ox=expanded?0:p.x-view/2,oy=expanded?0:p.y-view/2;
    box(c,0,0,size,size,'#101e2b');
    c.drawImage(this.mapCache,-ox*s,-oy*s,SIZE*s,SIZE*s);
    const t=target(w);
    for(const o of w.police)oval(c,(o.x-ox)*s,(o.y-oy)*s,4,4,w.time%1<.5?'#ff637b':'#75c9ff');
    if(t){
      const x=clamp((t.x-ox)*s,9,size-9),y=clamp((t.y-oy)*s,9,size-9);
      path(c,[[x,y-6],[x+6,y],[x,y+6],[x-6,y]],'#ffcf72');
    }
    if(expanded)for(const m of [places.clinic,places.garage,places.circuit,places.yard])
      oval(c,m.x*s,m.y*s,3,3,'#83dace');
    c.save();c.translate(expanded?p.x*s:mid,expanded?p.y*s:mid);c.rotate(p.a);
    path(c,[[8,0],[-5,-5],[-2,0],[-5,5]],'#fff6d7');c.restore();
  }
  draw(w,dt=0,expanded=false){
    const c=this.c,p=w.player,cam=w.camera,W=this.width,H=this.height;
    const ride=p.car,speed=ride?.speed||0,look=ride?36+Math.abs(speed)*.16:16;
    const t=dt?1-Math.exp(-dt*6):1;
    cam.z=mix(cam.z,ride?1.07-Math.abs(speed)*.0005:1.32,t);
    const z=this.zoom=cam.z*clamp(H/720,.76,1.4);
    const marginX=Math.min(SIZE/2,W/(2*z)),marginY=Math.min(SIZE/2,H/(2*z));
    cam.x=mix(cam.x,clamp(p.x+Math.cos(p.a)*look,marginX,SIZE-marginX),t);
    cam.y=mix(cam.y,clamp(p.y+Math.sin(p.a)*look,marginY,SIZE-marginY),t);
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
    box(c,0,0,W,H,'#227887');
    c.save();c.translate(W/2,H/2);c.scale(z,z);c.translate(-cam.x,-cam.y);
    this.ground(w);
    const hw=W/(2*z)+60,hh=H/(2*z)+65;
    const visible=o=>Math.abs(o.x-cam.x)<hw&&Math.abs(o.y-cam.y)<hh;
    const targetPoint=target(w);
    if(targetPoint&&visible(targetPoint))beacon(c,targetPoint,w.time,'#ffd37d',targetPoint.name);
    for(const q of [places.circuit,places.clinic,places.garage,places.yard])
      if(q!==targetPoint&&visible(q))beacon(c,q,w.time,'#a4e3d7',q.name);
    for(let i=0;i<w.tapes.length;i++)if(!w.found.includes(i)&&visible(w.tapes[i])){
      const q=w.tapes[i];oval(c,q.x,q.y,11,11,'#ff89b44d');box(c,q.x-5,q.y-3,10,6,'#f690b2');
    }
    const actors=this.actors;actors.length=0;
    for(const o of w.cars)if(!o.sold&&visible(o))actors.push(o);
    for(const o of w.people)if(visible(o))actors.push(o);
    for(const o of w.police)if(visible(o))actors.push(o);
    if(w.mission===1)for(const o of w.guards)if(o.hp>0&&visible(o))actors.push(o);
    if(!ride)actors.push(p);
    actors.sort((a,b)=>a.y-b.y);
    for(const o of actors){
      if(o.kind!==undefined)drawCar(c,o,w.time);
      else{
        drawPerson(c,o,w.time,o===p);
        if(o.home){box(c,o.x-9,o.y-15,18,2,'#4a3249');box(c,o.x-9,o.y-15,18*o.hp/45,2,'#ff7d82');}
      }
    }
    for(const q of w.particles){
      c.globalAlpha=clamp(q.life/q.max,0,1);box(c,q.x,q.y,3,3,q.color);
    }
    c.globalAlpha=1;c.strokeStyle='#fff1bb';c.lineWidth=1.5;
    for(const s of w.traces){c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.tx,s.ty);c.stroke();}
    c.restore();
    box(c,0,0,W,H,this.vignette);
    if(w.hurt>w.time)box(c,0,0,W,H,'#e6375525');
    this.drawMap(w,expanded);
  }
}
