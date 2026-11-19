const contracts = [
  {name:'Dead Air',pay:350,brief:'Take the gold Tamarind to Kite FM.'},
  {name:'The Salt Ledger',pay:750,brief:'Clear the depot. Recover the ledger on foot.'},
  {name:'Open Frequency',pay:950,brief:'Lose the patrol, then meet Sol at the exchange.'},
  {name:'Everybody Hears',pay:1450,brief:'Reach Last Light and put the ledger on air.'}
];
const coastGates=[point(2619,1658,'01'),point(2619,2150,'02'),point(2098,2150,'03'),point(2098,1183,'04'),point(2619,1183,'FINISH')];
function tell(w,line){
  w.line=line;w.lineUntil=w.time+10;
}
function notify(w,line){
  w.toast=line;w.toastUntil=w.time+3.4;
}
function raiseHeat(w,amount){
  w.heat=clamp(w.heat+amount,0,5);w.search=10;
}
function target(w){
  if(w.race)return coastGates[w.race.gate];
  if(w.mission===0)return w.phase||w.player.car?places.radio:{...w.starter,name:'TAMARIND GT'};
  return [null,places.depot,places.relay,w.phase?places.radio:places.beacon][w.mission]||null;
}
function objective(w){
  if(w.race)return 'Gate '+(w.race.gate+1)+' / '+coastGates.length+'  ·  '+Math.ceil(75-w.race.time)+'s';
  if(w.mission===0&&!w.phase&&!w.player.car)return 'Get in the gold Tamarind  [E]';
  if(w.mission===1){
    const n=w.guards.filter(g=>g.hp>0).length;
    if(n)return 'Clear Cinder Depot  ·  '+n+' enforcers';
  }
  if(w.mission===3&&w.phase)return w.heat?'Lose the patrol to return to Kite FM.':'Return to Kite FM and meet Rhea.';
  return contracts[w.mission]?.brief||'Free roam  ·  Race, recover tapes, or trade rides.';
}
function clearContract(w,sound,line){
  const job=contracts[w.mission++];
  w.phase=0;w.player.cash+=job.pay;w.player.hp=Math.max(75,w.player.hp);
  w.reserve=Math.max(32,w.reserve);
  notify(w,'CONTRACT CLEARED   +$'+job.pay);tell(w,line);sound('reward');
}
function storyStep(w,use,dt,sound){
  const p=w.player,t=target(w);
  if(w.mission===0&&p.car)w.phase=1;
  if(w.mission===0&&p.car&&dist(p,places.radio)<48){
    clearContract(w,sound,'RHEA / Port Authority cut our transmitter. Their payout ledger is at Cinder. Bring it here and we can name names.');
    writeSave(w);return;
  }
  if(use&&t&&!w.race&&w.mission>0&&w.mission<4&&dist(p,t)<48){
    if(w.mission===1){
      if(p.car||w.guards.some(g=>g.hp>0)){notify(w,'CLEAR THE DEPOT AND APPROACH ON FOOT');return;}
      clearContract(w,sound,'RHEA / It has everything. Sol can route this through the harbor beacon. Lose the patrol before you meet him.');
      raiseHeat(w,2);
    }else if(w.heat){notify(w,'SHAKE THE PATROL FIRST');return;}
    else if(w.mission===2)clearContract(w,sound,'SOL / Beacon relay is up. Take the ledger to Last Light. Rhea will be listening.');
    else if(!w.phase){
      w.phase=1;raiseHeat(w,3);sound('reward');notify(w,'KITE FM IS LIVE');
      tell(w,'RHEA / This is Kite. We have the dates, the money and the names. Coast Guard, check your harbor.');
    }else clearContract(w,sound,'RHEA / The port board resigned this morning. Keep the station on, Ari.');
    writeSave(w);return;
  }
  for(let i=0;i<w.tapes.length;i++)if(!w.found.includes(i)&&dist(p,w.tapes[i])<20){
    w.found.push(i);p.cash+=110;notify(w,'LOST MASTER '+w.found.length+'/6   +$110');sound('reward');writeSave(w);
  }
  if(w.race){
    w.race.time+=dt;
    if(w.race.time>=75){w.race=null;notify(w,'COAST RUN / TIME EXPIRED');}
    else if(p.car&&dist(p,t)<58){
      sound('tick');
      if(++w.race.gate===coastGates.length){
        const time=w.race.time;w.best=w.best?Math.min(w.best,time):time;w.race=null;p.cash+=520;
        notify(w,'COAST RUN / '+time.toFixed(1)+'s   +$520');sound('reward');writeSave(w);
      }
    }
    return;
  }
  if(!use)return;
  if(dist(p,places.circuit)<45){
    if(!p.car){notify(w,'BRING A CAR TO THE COAST RUN');return;}
    w.race={gate:0,time:0};notify(w,'COAST RUN / 75 SECONDS');sound('tick');return;
  }
  if(dist(p,places.yard)<54&&p.car&&!p.car.owned){
    const c=p.car;c.sold=true;p.car=null;p.x=c.x;p.y=c.y+22;p.cash+=280;
    notify(w,'SALVAGED   +$280');sound('reward');writeSave(w);return;
  }
  if(dist(p,places.clinic)<45){
    if(p.cash<60){notify(w,'TREATMENT COSTS $60');return;}
    p.cash-=60;p.hp=100;notify(w,'PATCHED UP   −$60');writeSave(w);return;
  }
  if(dist(p,places.garage)<45){
    if(w.heat){notify(w,'GARAGE CLOSED DURING PURSUIT');return;}
    if(!w.tuned&&p.cash>=650){p.cash-=650;w.tuned=true;notify(w,'ENGINE & ARMOR FITTED   −$650');}
    else notify(w,'GEAR RESTOCKED / CAR REPAIRED');
    p.hp=100;w.ammo=8;w.reserve=48;if(p.car)p.car.hp=100;
    sound('reward');writeSave(w);
  }
}
