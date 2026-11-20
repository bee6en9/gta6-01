import {places,distance} from './world.js';
export const chapters=[
  {name:'A voice on the coast',brief:'Meet Nia outside Kite FM. Press F at the gold marker.',reward:180},
  {name:'Magnetic evidence',brief:'Pick up a recording at the boardwalk, then bring it to Kite FM.',reward:300},
  {name:'Borrowed authority',brief:'Steal the port courier from Rook Motors. Deliver it to the docks.',reward:450},
  {name:'Paper trail',brief:'Get past the port guards and take the board’s ledger.',reward:650},
  {name:'Dead air',brief:'Lose the police, then reconnect the civic relay on foot.',reward:750},
  {name:'The whole city listens',brief:'Bring the evidence home. Put the port board on the air.',reward:1200}
];
export function toast(w,text) {w.toast=text;w.toastUntil=w.time+4;}
export function speak(w,who,text,seconds=7) {w.dialogue={who,text};w.dialogueUntil=w.time+seconds;}
export function target(w) {
  if(w.mission===0)return places[0];
  if(w.mission===1)return places[w.stage===0?1:0];
  if(w.mission===2)return w.stage===0?places[2]:places[3];
  if(w.mission===3)return places[3];
  if(w.mission===4)return w.heat>0?null:places[4];
  if(w.mission===5)return places[0];
  return null;
}
export function objective(w) {
  const p=w.player;
  if(w.mission===0)return 'F • Talk to Nia at Kite FM';
  if(w.mission===1)return w.stage===0?'F • Collect Sol’s tape at the boardwalk':'F • Deliver the tape to Nia';
  if(w.mission===2)return w.stage===0?'E • Steal the silver Port courier at Rook Motors':'Drive the Port courier to Southport records';
  if(w.mission===3)return 'F • Take the ledger. Watch for port security.';
  if(w.mission===4)return w.heat>0?'Escape the search. Keep your distance from police.':p.car?'Exit your car at the civic relay.':'F • Reconnect the civic relay';
  if(w.mission===5)return 'F • Broadcast the evidence from Kite FM';
  return 'Free roam • Find six lost tapes, visit the diner, make your own summer.';
}
export function complete(w,sound) {
  const chapter=chapters[w.mission];
  w.player.money+=chapter.reward;w.completed++;w.mission++;w.stage=0;w.missionTime=0;
  toast(w,'Chapter complete  +$'+chapter.reward);sound.chime();
  if(w.mission===1)speak(w,'NIA / KITE FM','Sol recorded the board chairman taking a payoff. He left the tape by the boardwalk. Bring it home.');
  if(w.mission===2)speak(w,'ROOK / MOTOR POOL','The silver courier has a port pass. Nobody checks those. Borrow it and head south to the records office.');
  if(w.mission===3)speak(w,'NIA / KITE FM','You’re inside. The ledger is by the yellow crates. Security is bought and paid for. Keep moving.');
  if(w.mission===4){w.heat=Math.max(2,w.heat);speak(w,'NIA / KITE FM','They know. Shake the patrols, then reconnect our civic relay. You’ll need to get out and do it by hand.');}
  if(w.mission===5)speak(w,'NIA / KITE FM','Signal’s clean. Bring that ledger to the studio. Tonight the whole city gets the truth.');
  if(w.mission===6)speak(w,'KITE FM / LIVE','Chairman Vale, Breakwater can hear you now. Every payoff. Every stolen pier. This city belongs to the people who live here.',13);
  w.needsSave=true;
}
export function updateStory(w,input,sound) {
  const p=w.player,t=target(w);w.missionTime+=1/60;
  if(w.mission===2){
    const courier=w.cars.find(car=>car.courier);
    if(courier.hp<=0){
      courier.x=2228;courier.y=810;courier.a=0;courier.v=0;courier.hp=100;w.stage=0;
      toast(w,'Rook recovered the courier • Pick it up at the motor pool');
    }
  }
  if(w.mission===2&&w.stage===0&&p.car?.courier){w.stage=1;toast(w,'Port pass acquired • Drive to Southport');}
  if(w.mission===2&&w.stage===1&&p.car?.courier&&distance(p,places[3])<85)complete(w,sound);
  if(input.tap('f')){
    if(t&&distance(p,t)<86){
      if(w.mission===0){speak(w,'NIA / KITE FM','You’re our new wheelman? Good. The port board is selling our coast. Let’s give Breakwater a voice.');complete(w,sound);}
      else if(w.mission===1){if(w.stage===0){w.stage=1;speak(w,'SOL / BOARDWALK','I kept a copy. The chairman’s voice is unmistakable. Don’t let his people take it.');sound.chime();}else complete(w,sound);}
      else if(w.mission===3){complete(w,sound);sound.alarm();}
      else if(w.mission===4&&!p.car)complete(w,sound);
      else if(w.mission===5)complete(w,sound);
    }else if(distance(p,places[5])<85){
      if(p.money>=40){p.money-=40;p.hp=100;if(p.car)p.car.hp=100;toast(w,'Mara’s special • Health and vehicle restored ($40)');sound.chime();}else toast(w,'Mara: Come back with $40, honey.');
    }else if(distance(p,places[2])<90&&w.mission!==2){
      if(p.money>=100){p.money-=100;w.heat=0;w.escape=0;w.arrest=0;w.police.length=0;if(p.car)p.car.hp=100;toast(w,'Rook’s respray • Search called off ($100)');}
    }
  }
  for(let i=0;i<w.tapes.length;i++)if(!w.collected.includes(i)&&distance(p,w.tapes[i])<24){w.collected.push(i);p.money+=75;sound.chime();toast(w,'Lost mixtape '+w.collected.length+'/6 • +$75');w.needsSave=true;}
}
