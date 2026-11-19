class Input {
  constructor(canvas){
    this.down=new Set();this.pressed=new Set();this.mouse={x:0,y:0,active:false,fire:false};
    const capture=new Set(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab']);
    addEventListener('keydown',e=>{
      if(capture.has(e.code)&&e.target.tagName!=='BUTTON')e.preventDefault();
      if(!e.repeat)this.pressed.add(e.code);
      this.down.add(e.code);
    });
    addEventListener('keyup',e=>this.down.delete(e.code));
    addEventListener('blur',()=>this.reset());
    canvas.addEventListener('pointermove',e=>Object.assign(this.mouse,{x:e.clientX,y:e.clientY,active:true}));
    canvas.addEventListener('pointerdown',e=>{if(e.button===0)this.mouse.fire=true;});
    addEventListener('pointerup',()=>this.mouse.fire=false);
  }
  held(...keys){return keys.some(k=>this.down.has(k));}
  tap(k){return this.pressed.has(k);}
  reset(){this.down.clear();this.pressed.clear();this.mouse.fire=false;}
  finish(){this.pressed.clear();}
}
