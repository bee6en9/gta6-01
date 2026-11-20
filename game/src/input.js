export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = {x:640,y:360,down:false};
    addEventListener('keydown', event => {
      const key = event.key.toLowerCase();
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      if ([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) event.preventDefault();
    });
    addEventListener('keyup', event => this.keys.delete(event.key.toLowerCase()));
    addEventListener('blur', () => { this.keys.clear(); this.mouse.down=false; });
    canvas.addEventListener('mousemove', event => {this.mouse.x=event.clientX;this.mouse.y=event.clientY;});
    canvas.addEventListener('mousedown', () => this.mouse.down=true);
    addEventListener('mouseup', () => this.mouse.down=false);
    canvas.addEventListener('contextmenu', event => event.preventDefault());
  }
  down(...keys) { return keys.some(key=>this.keys.has(key)); }
  tap(key) { return this.pressed.has(key); }
  finish() { this.pressed.clear(); }
}
