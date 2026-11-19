class Soundscape {
  start(){
    if(!this.ctx){
      this.ctx=new AudioContext();
      const a=this.ctx;
      this.bus=a.createGain();this.bus.gain.value=.28;this.bus.connect(a.destination);
      [this.motor,this.motorGain]=this.voice('triangle',39);
      [this.siren,this.sirenGain]=this.voice('sine',420);
    }
    this.ctx.resume().catch(()=>{});
  }
  voice(shape,hz){
    const a=this.ctx,o=a.createOscillator(),g=a.createGain();
    o.type=shape;o.frequency.value=hz;g.gain.value=0;o.connect(g);g.connect(this.bus);o.start();
    return [o,g];
  }
  note(hz,duration,volume,shape='sine',end=hz,delay=0){
    if(!this.ctx||this.muted)return;
    const a=this.ctx,t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
    o.type=shape;o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);
    g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+duration+.02);
  }
  event(name){
    if(name==='shot')this.note(154,.12,.34,'sawtooth',42);
    if(name==='hit')this.note(79,.18,.24,'triangle',33);
    if(name==='door')this.note(90,.12,.2,'square',45);
    if(name==='tick')this.note(630,.12,.2,'triangle',860);
    if(name==='reward')[392,494,587,784].forEach((f,i)=>this.note(f,.27,.15,'triangle',f,i*.075));
    if(name==='reload')this.note(460,.08,.08,'square',160);
  }
  update(w,playing){
    if(!this.ctx)return;
    const a=this.ctx,t=a.currentTime,p=w.player;
    this.bus.gain.setTargetAtTime(this.muted?0:.28,t,.06);
    this.motorGain.gain.setTargetAtTime(playing&&p.car?.hp>0?.16:0,t,.08);
    this.motor.frequency.setTargetAtTime(36+Math.abs(p.car?.speed||0)*.23,t,.055);
    const audible=w.police.some(c=>c.vehicle&&dist(c,p)<470);
    this.sirenGain.gain.setTargetAtTime(playing&&w.heat&&audible?.10:0,t,.07);
    this.siren.frequency.setTargetAtTime(565+155*Math.sin(w.time*7.6),t,.04);
    if(!playing||!w.radio||this.muted||t<(this.next||0))return;
    this.next=t+.22;const i=this.beat=(this.beat??-1)+1;
    const bass=[55,55,65.4,49][Math.floor(i/8)%4],lead=[220,0,329.63,0,293.66,261.63,0,196][i%8];
    if(i%2===0)this.note(bass,.29,.18,'triangle');
    if(i%4===0)this.note(108,.19,.17,'sine',35);
    if(lead)this.note(lead,.21,.07,'triangle',lead*1.003);
  }
}
