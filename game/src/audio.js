export class Soundtrack {
  constructor(){this.context=null;this.muted=false;this.beat=0;this.timer=0;}
  start(){if(!this.context){this.context=new AudioContext();}this.context.resume();}
  tone(frequency,duration=.12,type='triangle',volume=.035,slide=0){
    if(!this.context||this.muted)return;
    const t=this.context.currentTime,o=this.context.createOscillator(),g=this.context.createGain();
    o.type=type;o.frequency.setValueAtTime(frequency,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+duration);
    g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.context.destination);o.start(t);o.stop(t+duration+.02);
  }
  shot(){this.tone(140,.09,'sawtooth',.07,35);}
  crash(){this.tone(75,.16,'square',.055,22);}
  chime(){this.tone(440,.2);setTimeout(()=>this.tone(660,.24),100);setTimeout(()=>this.tone(880,.3),200);}
  alarm(){this.tone(660,.3,'square',.035,330);}
  update(w,dt){
    this.timer-=dt;if(this.timer>0)return;this.timer=.18;
    if(w.heat>0)this.tone(this.beat%4<2?520:710,.16,'sine',.015);
    if(w.player.car)this.tone(37+Math.abs(w.player.car.v)*.19,.19,'sawtooth',.012);
    if(w.radio){const notes=[164.81,196,220,196,146.83,174.61,220,174.61];this.tone(notes[this.beat%8],.16,'triangle',.024);if(this.beat%2===0)this.tone(notes[this.beat%8]*2,.11,'sine',.018);if(this.beat%4===0)this.tone(65,.13,'sine',.055,30);}
    this.beat++;
  }
}
