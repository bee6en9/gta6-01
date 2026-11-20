import {solid} from './world.js';
const KEY='breakwater84-fresh-v1';
export function saveGame(w) {
  try {
    const p=w.player;
    const snapshot=car=>car?{x:car.x,y:car.y,a:car.a,hp:car.hp,name:car.name,color:car.color,courier:!!car.courier}:null;
    localStorage.setItem(KEY,JSON.stringify({version:1,x:p.x,y:p.y,hp:p.hp,money:p.money,mission:w.mission,stage:w.stage,collected:w.collected,completed:w.completed,radio:w.radio,vehicle:snapshot(p.car),courier:snapshot(w.cars.find(car=>car.courier)),date:new Date().toISOString()}));
    return true;
  }catch{return false;}
}
export function hasSave(){try{return !!localStorage.getItem(KEY);}catch{return false;}}
export function loadGame(w) {
  try {
    const data=JSON.parse(localStorage.getItem(KEY));
    if(!data||data.version!==1)return false;
    const p=w.player;
    if(Number.isFinite(data.x)&&Number.isFinite(data.y)&&!solid(w,data.x,data.y)){p.x=data.x;p.y=data.y;}
    p.hp=Math.max(30,Math.min(100,Number(data.hp)||100));p.money=Math.max(0,Number(data.money)||0);
    w.mission=Math.max(0,Math.min(6,Math.floor(data.mission)||0));w.stage=data.stage===1?1:0;
    w.collected=Array.isArray(data.collected)?data.collected.filter(n=>Number.isInteger(n)&&n>=0&&n<6):[];
    w.completed=w.mission;w.radio=data.radio!==false;
    const restore=(car,snapshot)=>{
      if(!snapshot||!Number.isFinite(snapshot.x)||!Number.isFinite(snapshot.y)||solid(w,snapshot.x,snapshot.y,16))return false;
      car.x=snapshot.x;car.y=snapshot.y;car.a=Number(snapshot.a)||0;car.v=0;car.hp=Math.max(0,Math.min(100,Number(snapshot.hp)||0));car.stolen=true;car.traffic=false;
      if(typeof snapshot.name==='string')car.name=snapshot.name;
      if(/^#[0-9a-f]{6}$/i.test(snapshot.color))car.color=snapshot.color;
      return true;
    };
    const courier=w.cars.find(car=>car.courier);
    restore(courier,data.courier);
    if(data.vehicle){
      const car=data.vehicle.courier?courier:w.cars.find(car=>!car.traffic&&!car.courier);
      if(restore(car,data.vehicle)&&car.hp>0){p.car=car;p.x=car.x;p.y=car.y;p.a=car.a;}
    }
    if(w.mission===2&&w.stage===1&&!data.courier)w.stage=0;
    return true;
  }catch{return false;}
}
