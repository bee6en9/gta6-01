export const SIZE = 3200;
export const ROADS = [360,840,1320,1800,2280,2760];
export const places = [
  {x:2665,y:1470,name:'Kite FM',icon:'K',color:'#ffe19b'},
  {x:2875,y:1070,name:'Boardwalk tapes',icon:'T',color:'#f2b6bb'},
  {x:2240,y:805,name:'Rook Motors',icon:'R',color:'#a2dfc3'},
  {x:1260,y:2270,name:'Port records',icon:'P',color:'#ffe19b'},
  {x:405,y:1810,name:'Civic relay',icon:'B',color:'#f2b6bb'},
  {x:2240,y:1810,name:'Mara’s diner',icon:'+',color:'#a2dfc3'}
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function district(x,y) {
  if(x>2530) return 'Pelican Strand';
  if(y>2050) return 'Southport Docks';
  if(x<1100) return y<1400?'Old Breakwater':'Civic Quarter';
  return y<1400?'Mercado Heights':'Palmetto Gardens';
}
export function createWorld() {
  const w={time:0,player:{x:2695,y:1480,a:-Math.PI/2,hp:100,money:240,car:null,cooldown:0},cars:[],people:[],buildings:[],palms:[],police:[],enemies:[],bullets:[],particles:[],skids:[],grid:new Map(),lanes:[],heat:0,escape:0,arrest:0,spawnTimer:0,mission:0,stage:0,collected:[],toast:'',toastUntil:0,dialogue:null,dialogueUntil:0,missionTime:0,completed:0,radio:true};
  let seed=1984;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const roofs=['#dfaa85','#d8c5a1','#db8f83','#8fae9c','#a1b9b2','#c1b5c7'];
  for(let row=0;row<6;row++) for(let col=0;col<6;col++) {
    const left=ROADS[col]+75,top=ROADS[row]+79;
    if(col===5) continue;
    for(let part=0;part<3;part++) {
      const b={x:left+(part%2)*180,y:top+Math.floor(part/2)*174,w:part===2?325:145,h:part===2?120:135,z:16+Math.floor(rand()*19),color:roofs[Math.floor(rand()*roofs.length)],shop:rand()>.55};
      if(row===5){b.h=95;b.z=19;b.color=['#809c9d','#c69273','#d7b89c'][part];}
      w.buildings.push(b);
      for(let gy=Math.floor(b.y/240);gy<=Math.floor((b.y+b.h)/240);gy++) for(let gx=Math.floor(b.x/240);gx<=Math.floor((b.x+b.w)/240);gx++) {
        const key=gx+','+gy;if(!w.grid.has(key))w.grid.set(key,[]);w.grid.get(key).push(b);
      }
    }
  }
  for(let y=120;y<3100;y+=125) {
    w.palms.push({x:2838,y,z:35+rand()*15});
    w.palms.push({x:2682,y:y+35,z:35+rand()*15});
  }
  for(const road of ROADS) for(let i=0;i<11;i++)w.palms.push({x:road+78,y:100+i*267,z:38});
  const colors=['#eac177','#9cc9c4','#ca756d','#e9e1be','#687b99','#c6a0b6','#88ac88'];
  for(let axis=0;axis<2;axis++)for(let ri=0;ri<ROADS.length;ri++)for(let dir=-1;dir<=1;dir+=2){
    const lane={axis,base:ROADS[ri]+dir*20,dir,cars:[]};w.lanes.push(lane);
    for(let n=0;n<3;n++){
      const pos=130+n*950+rand()*220;
      const car={x:axis===0?pos:lane.base,y:axis===0?lane.base:pos,a:axis===0?(dir===1?0:Math.PI):(dir===1?Math.PI/2:-Math.PI/2),v:0,hp:100,color:colors[Math.floor(rand()*colors.length)],name:['Kestrel coupe','Cove sedan','Gannet wagon','Marlin sport'][n%4],traffic:true,lane,cruise:70+rand()*35,stolen:false};
      lane.cars.push(car);w.cars.push(car);
    }
  }
  w.cars.push({x:2740,y:1480,a:-Math.PI/2,v:0,hp:100,color:'#edb66e',name:'Kestrel coupe',traffic:false,stolen:false});
  w.cars.push({x:2228,y:810,a:0,v:0,hp:100,color:'#a7c4bc',name:'Port courier',traffic:false,stolen:false,courier:true});
  for(let i=0;i<130;i++){
    const road=ROADS[i%6],side=i%2?68:-68,vertical=i%3!==0;
    w.people.push({x:vertical?road+side:110+rand()*2850,y:vertical?110+rand()*2850:road+side,a:vertical?Math.PI/2:0,v:15+rand()*17,dir:i%2?1:-1,hp:40,shirt:['#edb7a3','#e6d3a1','#a5c7c6','#557d86','#b58caa'][i%5],panic:0});
  }
  w.enemies=[{x:1220,y:2190,a:0,hp:70,cooldown:2},{x:1370,y:2265,a:0,hp:70,cooldown:1},{x:1310,y:2380,a:0,hp:70,cooldown:3}];
  w.tapes=[{x:2850,y:610},{x:2190,y:1378},{x:770,y:900},{x:1840,y:2730},{x:370,y:2480},{x:2650,y:1960}];
  return w;
}
export function solid(w,x,y,r=10) {
  if(x<90||y<70||x>2910-r||y>3120)return true;
  const cells=w.grid.get(Math.floor(x/240)+','+Math.floor(y/240));
  if(!cells)return false;
  for(const b of cells)if(x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h)return true;
  return false;
}
export function move(w,o,dx,dy,r=10) {
  let hit=false;
  if(!solid(w,o.x+dx,o.y,r))o.x+=dx;else hit=true;
  if(!solid(w,o.x,o.y+dy,r))o.y+=dy;else hit=true;
  return hit;
}
export function sight(w,a,b) {
  const d=distance(a,b);if(d>600)return false;
  for(let t=0;t<d;t+=24)if(solid(w,a.x+(b.x-a.x)*t/d,a.y+(b.y-a.y)*t/d,2))return false;
  return true;
}
