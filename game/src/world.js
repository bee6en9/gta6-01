const SIZE = 2880, LAND = 2680, ROADS = [200,680,1160,1640,2120,2600];
const TAU = Math.PI * 2;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
const mod = (a,b) => (a%b+b)%b;
const point = (x,y,name) => ({x,y,name});
const places = {
  radio:point(2618,320,"KITE FM"), depot:point(2138,1107,"CINDER DEPOT"),
  relay:point(1178,2085,"SPOOL EXCHANGE"), beacon:point(2621,2525,"LAST LIGHT"),
  garage:point(2580,422,"KITE GARAGE"), clinic:point(699,720,"SUNWARD CLINIC"),
  circuit:point(2618,1140,"COAST RUN"), yard:point(2087,2540,"MICA SALVAGE")
};
const colors = ['#f39569','#6ac5bd','#e8bc65','#d36778','#a7a3d0','#eae2bb'];
const vehicleNames = ['Tamarind','Skipper','Rook','Pipistrel','Mesa','Calico'];
function randomSource(seed){
  return () => ((seed = (Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
}
function carAt(x,y,a,i){
  return {x,y,a,kind:i%3,color:colors[i%6],name:vehicleNames[i%6],speed:0,hp:100,lane:null,owned:false};
}
function createWorld(){
  const r=randomSource(441920), lots=[], buildings=[], palms=[], lanes=[], cars=[], people=[], grid=new Map();
  const signs=['TANGERINE COURT','MICA MARINE','SUNWARD HOTEL','KITE RECORDS','CASA LIMA','PELICAN CLUB','DRIFT CAFE','SPOOL OFFICE','AQUA MOTOR INN','CINDER STORAGE','SUGAR MARKET','MARROW BANK'];
  for(let row=0;row<6;row++)for(let col=0;col<6;col++){
    const left=col?ROADS[col-1]+72:12, top=row?ROADS[row-1]+72:12;
    const width=ROADS[col]-72-left, height=ROADS[row]-72-top;
    const park=(row*7+col*3)%11<2, port=row>=4&&col<5;
    lots.push({x:left,y:top,w:width,h:height,park,port,k:row*6+col});
    const nx=col?2:1, ny=row?2:1;
    if(!park)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
      const x=left+12+i*width*.51+r()*9,y=top+12+j*height*.51+r()*11;
      const w=width/nx*(.65+r()*.18),h=height/ny*(.54+r()*.22);
      buildings.push({x,y,w,h,z:port?15+r()*16:19+r()*41,color:colors[(row*3+col+i+j*2)%6],
        name:signs[(row*5+col*3+i+j*2)%signs.length],k:buildings.length,port});
    }
    for(let i=0;i<(park?12:5);i++){
      palms.push({x:park?left+12+r()*(width-24):left+10+i*(width-18)/5,
        y:park?top+12+r()*(height-24):top+height-5,s:12+r()*10,k:r()});
    }
  }
  buildings.push({x:2540,y:314,w:38,h:76,z:19,color:'#ed8766',name:'KITE / 84.3',k:98});
  for(const b of buildings){
    for(let x=Math.floor(b.x/160);x<=Math.floor((b.x+b.w)/160);x++)
      for(let y=Math.floor(b.y/160);y<=Math.floor((b.y+b.h)/160);y++){
        const key=x+y*32;
        if(!grid.has(key))grid.set(key,[]);
        grid.get(key).push(b);
      }
  }
  for(let i=0;i<43;i++)palms.push({x:2668+Math.sin(i*1.5)*8,y:48+i*66,s:14+r()*9,k:r()});
  for(const axis of ['x','y'])for(const cross of ROADS)for(const dir of [-1,1]){
    const lane={axis,dir,cross,side:axis==='x'?'y':'x',center:cross+(axis==='x'?dir:-dir)*22,length:axis==='x'?LAND:SIZE,cars:[]};
    lanes.push(lane);
    const n=lanes.length%6===0?3:2;
    for(let i=0;i<n;i++){
      const u=(i+.13+r()*.67)*lane.length/n;
      const c=carAt(axis==='x'?u:lane.center,axis==='y'?u:lane.center,
        axis==='x'?(dir===1?0:Math.PI):dir*Math.PI/2,cars.length);
      Object.assign(c,{lane,cruise:75+r()*57,speed:80});
      lane.cars.push(c);cars.push(c);
    }
  }
  const starter=carAt(2516,222,0,0);
  Object.assign(starter,{owned:true,color:'#ffd05b',name:'Tamarind GT'});
  cars.push(starter);
  [[2623,432],[678,732],[2139,1009],[1181,2106],[2619,1688],[2050,2573],[2430,224]].forEach(([x,y],i)=>cars.push(carAt(x,y,i%3?Math.PI/2:0,i+1)));
  for(let i=0;i<110;i++){
    const axis=i%2?'x':'y',line=ROADS[Math.floor(r()*6)]+(i%4<2?-60:60),u=r()*(axis==='x'?LAND:SIZE);
    people.push({x:axis==='x'?u:line,y:axis==='y'?u:line,axis,dir:i%4<2?-1:1,pace:22+r()*20,
      a:0,step:r()*TAU,color:colors[i%6],skin:['#a46546','#f5b58a','#c07c54'][i%3]});
  }
  const guards=[[2138,1043],[2162,1090],[2101,1098],[2143,1156]].map(([x,y],i)=>
    ({x,y,home:point(x,y),a:0,hp:45,color:'#ad5059',skin:'#c58762',cool:i*.35,step:0}));
  const tapes=[[2642,454],[703,650],[1220,1660],[1658,2150],[2642,2480],[238,2570]].map(([x,y])=>point(x,y,"LOST MASTER"));
  const player={x:2482,y:224,a:0,hp:100,cash:180,car:null,color:'#f6c54f',skin:'#ac6c49',step:0};
  return {lots,buildings,grid,palms,cars,lanes,starter,people,guards,tapes,player,
    camera:{x:player.x,y:player.y,z:1},police:[],particles:[],traces:[],
    mission:0,phase:0,heat:0,search:0,arrest:0,spawn:0,time:0,ammo:8,reserve:48,
    found:[],best:0,race:null,tuned:false,radio:true,toast:'',toastUntil:0,line:'',lineUntil:0};
}
function solid(w,x,y,r=0){
  if(x<r||x>LAND-r||y<r||y>SIZE-r)return true;
  for(let i=Math.floor((x-r)/160);i<=Math.floor((x+r)/160);i++)
    for(let j=Math.floor((y-r)/160);j<=Math.floor((y+r)/160);j++){
      const cell=w.grid.get(i+j*32);
      if(cell?.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h))return true;
    }
  return false;
}
function moveBody(w,e,dx,dy,r){
  const x=solid(w,e.x+dx,e.y,r);
  if(!x)e.x+=dx;
  const y=solid(w,e.x,e.y+dy,r);
  if(!y)e.y+=dy;
  return x||y;
}
function sight(w,a,b){
  const steps=Math.ceil(dist(a,b)/15);
  for(let i=1;i<steps;i++)if(solid(w,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;
  return true;
}
function district(p){
  if(p.x>2470)return p.y>2230?'Last Light Marina':'Marigold Coast';
  if(p.y>2250)return 'Mica Docks';
  if(p.x>1780)return 'Cinder Quarter';
  return p.y>1400?'Spool Exchange':'Sunward Heights';
}
