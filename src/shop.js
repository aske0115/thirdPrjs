import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { addMoonBonnet } from './character-style.js';
import { createShopScenery } from './shop/scenery.js';

// A small isometric shop diorama. UI, renderer, camera and inventory belong to the shell.
export function createShop(THREE, scene) {
  const root = new THREE.Group();
  scene.add(root);
  const scenery=createShopScenery(THREE,root);
  const loader = new GLTFLoader();
  const base = import.meta.env.BASE_URL;
  let disposed = false, time = 0, celebration = 0;
  const customers = [], mixers = [];
  const visitor = { object:null, mixer:null, action:null, clips:[], phase:"enter", wait:0, baseY:0 };
  let displayCount = 0; const displayItems = [];
  let bubblePhase = '';
  const bubbleCanvas=document.createElement('canvas');bubbleCanvas.width=512;bubbleCanvas.height=160;
  const bubbleCtx=bubbleCanvas.getContext('2d');
  const bubbleTexture=new THREE.CanvasTexture(bubbleCanvas);bubbleTexture.colorSpace=THREE.SRGBColorSpace;
  const bubble=new THREE.Sprite(new THREE.SpriteMaterial({map:bubbleTexture,transparent:true,depthTest:false}));
  bubble.scale.set(2.65,.83,1);bubble.renderOrder=20;bubble.visible=false;root.add(bubble);
  function say(text){bubbleCtx.clearRect(0,0,512,160);bubbleCtx.fillStyle='rgba(255,253,243,.96)';bubbleCtx.beginPath();bubbleCtx.roundRect(5,5,502,128,48);bubbleCtx.fill();bubbleCtx.fillStyle='#533f36';bubbleCtx.font='bold 37px sans-serif';bubbleCtx.textAlign='center';bubbleCtx.textBaseline='middle';bubbleCtx.fillText(text,256,72);bubbleTexture.needsUpdate=true;}
  const mats = new Map();
  const material = color => {
    if (!mats.has(color)) mats.set(color, new THREE.MeshStandardMaterial({color, roughness: 0.86}));
    return mats.get(color);
  };
  function box(x,y,z,w,h,d,color,rot=0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material(color));
    mesh.position.set(x,y,z); mesh.rotation.y=rot; mesh.castShadow=true; mesh.receiveShadow=true; root.add(mesh); return mesh;
  }
  function ball(x,y,z,r,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material(color));m.position.set(x,y,z);root.add(m);return m;}
  function model(path,x,y,z,height,rotation=0, customer=false, onReady=null) {
    loader.load(`${base}assets/models/${path}${/\.(glb|gltf)$/i.test(path)?'':'.glb'}`, gltf => {
      if (disposed) { gltf.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}}); return; }
      const object=gltf.scene;
      const size=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
      object.scale.setScalar(height/Math.max(size.y,0.001));
      const bounds=new THREE.Box3().setFromObject(object); object.position.set(x,y-bounds.min.y,z); object.rotation.y=rotation;
      object.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      root.add(object); let mixer=null; if(gltf.animations.length){mixer=new THREE.AnimationMixer(object);const clip=gltf.animations.find(c=>/idle/i.test(c.name))||gltf.animations[0];mixer.clipAction(clip).play();mixers.push(mixer);} if(customer)customers.push({object, baseY:object.position.y, phase:customers.length*1.8}); if(onReady)onReady(object,mixer,gltf.animations);
    }, undefined, err => console.warn('Shop model unavailable:', path, err));
  }
  // Continuous wooden shop floor and low structural foundation.
  box(0,-.24,0,10,.45,8,'#453933');
  box(-2.5,.62,.2,2.65,1.2,1.15,'#ae8064'); box(-2.5,1.25,.2,2.85,.13,1.35,'#f8dab2');
  model('mini-shop/cash-register',-2.7,1.35,.08,.52);
  box(2.0,.48,-.45,2.5,.92,1.3,'#a7795b');box(2.0,.97,-.45,2.65,.12,1.45,'#f8d9b3');
  box(2.0,.35,2.4,2.35,.66,1.0,'#ad7e60');box(2.0,.72,2.4,2.5,.1,1.1,'#f5d9b6');
  model('food/apple',1.35,1.04,-.55,.4); model('food/cupcake',2,1.04,-.55,.46); model('food/burger-double',2.68,1.04,-.55,.37);
  for(let i=0;i<5;i++) model('nature/mushroom_redTall',1.25+i*.36,.79,2.4,.34,0,false,(object)=>{displayItems[i]=object; object.visible=i<displayCount;});
  model('mini-shop/character-employee',-2.6,.08,-.9,1.45,Math.PI,true);
  model('mini-characters/character-female-d',3.8,.08,4.3,1.35,Math.PI,false,(object,mixer,clips)=>{visitor.object=object;visitor.object.scale.multiplyScalar(1.12);visitor.mixer=mixer;visitor.clips=clips;visitor.baseY=object.position.y;visitor.action=mixer?.clipAction(clips.find(c=>/idle/i.test(c.name))||clips[0]);});
  model('mini-shop/display-bread',3.65,.08,.95,1.0); model('mini-shop/display-fruit',.05,.08,-1.0,.95);
  model('mini-shop/shopping-basket',-.6,.08,2.2,.4); model('mini-shop/shopping-cart',-3.7,.08,2.8,.9);
  model('town/tree-high-round',4.25,.05,3.3,1.9);
  model('nature/flower_yellowA',-4,.05,3.3,.55);
  // The player is a real, animated 3D actor, independent of the visiting customer.
  const player=new THREE.Group();player.position.set(0,.08,2.7);player.scale.setScalar(1.6);root.add(player);
  const fallback=new THREE.Group();player.add(fallback);const body=new THREE.Mesh(new THREE.SphereGeometry(.37,12,8),material('#8fb49c'));body.position.y=.62;body.scale.set(1,1.25,.8);fallback.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8),material('#ffd6b6'));head.position.y=1.25;fallback.add(head);
  const stick=new THREE.Vector2();let playerMixer=null,playerActions={},playerAction='';
  function animatePlayer(name){const next=playerActions[name];if(!next||playerAction===name)return;playerActions[playerAction]?.fadeOut(.15);next.reset().fadeIn(.15).play();playerAction=name;}
  model('quaternius-adventurer/Adventurer.gltf',0,0,0,1.6,0,false,(object,mixer,clips)=>{const y=object.position.y;player.add(object);object.position.set(0,y,0);addMoonBonnet(THREE,object,1.6);fallback.visible=false;playerMixer=mixer;for(const clip of clips)playerActions[clip.name]=mixer.clipAction(clip);animatePlayer('Idle');});
  function walkable(x,z){if(x< -4.45||x>4.45||z< -3.3||z>3.7)return false;const counters=[[-4.0,-1.0,-.55,.95],[.55,3.45,-1.25,.35],[.65,3.35,1.75,3.05]];return !counters.some(([x1,x2,z1,z2])=>x>x1&&x<x2&&z>z1&&z<z2)}
  function stepPlayer(dt){const x=stick.x*.84+stick.y*.54,z=-stick.x*.54+stick.y*.84,speed=2.7,nx=player.position.x+x*speed*dt,nz=player.position.z+z*speed*dt;if(walkable(nx,player.position.z))player.position.x=nx;if(walkable(player.position.x,nz))player.position.z=nz;if(Math.hypot(x,z)>.05){const a=Math.atan2(x,z),delta=Math.atan2(Math.sin(a-player.rotation.y),Math.cos(a-player.rotation.y));player.rotation.y+=delta*Math.min(1,dt*14);animatePlayer('Run')}else animatePlayer('Idle')}
  function nearby(){const p=player.position;if(visitor.phase==='wait'&&visitor.object&&Math.hypot(p.x-visitor.object.position.x,p.z-visitor.object.position.z)<1.55)return 'customer';if(Math.hypot(p.x-2,p.z-2.4)<1.8)return 'display';if(Math.hypot(p.x+2.5,p.z-.2)<1.85)return 'counter';if(p.z>3.12&&Math.abs(p.x)<1.15)return 'exit';return null}
  const ambient=new THREE.HemisphereLight('#a7b7e9','#3d3046',.9);root.add(ambient);
  const sun=new THREE.DirectionalLight('#b7c4ff',1.0);sun.position.set(3,8,5);root.add(sun);
  function animateVisitor(name) {
    if(!visitor.mixer)return;
    const clip=visitor.clips.find(c=>c.name===name);if(!clip)return;
    const next=visitor.mixer.clipAction(clip);if(next===visitor.action)return;
    if(visitor.action)visitor.action.fadeOut(.18);
    next.reset().fadeIn(.18).play();visitor.action=next;
  }
  function moveVisitor(x,z,dt,next) {
    const object=visitor.object, dx=x-object.position.x, dz=z-object.position.z;
    const distance=Math.hypot(dx,dz), step=1.35*dt;
    if(distance<=step){object.position.x=x;object.position.z=z;visitor.phase=next;visitor.wait=0;animateVisitor('idle');return;}
    object.position.x+=dx/distance*step;object.position.z+=dz/distance*step;
    object.rotation.y=Math.atan2(dx,dz);animateVisitor('walk');
  }
  function updateVisitor(dt){
    if(!visitor.object)return;
    switch(visitor.phase){
      case 'enter': moveVisitor(2.9,1.35,dt,'browse');break;
      case 'browse': visitor.wait+=dt;visitor.object.rotation.y=Math.PI; if(visitor.wait>2.4)visitor.phase='checkout';break;
      case 'checkout': moveVisitor(-1.4,1.85,dt,'wait');break;
      case 'wait': visitor.wait+=dt;visitor.object.rotation.y=-Math.PI/2; break;
      case 'happy': visitor.wait+=dt;visitor.object.position.y=visitor.baseY+Math.abs(Math.sin(visitor.wait*11))*.13;if(visitor.wait>1.25){visitor.object.position.y=visitor.baseY;visitor.phase='exit';}break;
      case 'exit': moveVisitor(3.8,4.3,dt,'away');break;
      case 'away': visitor.wait+=dt;visitor.object.visible=false;if(visitor.wait>1.8){visitor.object.visible=true;visitor.phase='enter';visitor.wait=0;}break;
    }
    const phrase=visitor.phase==='browse'?'이건 어떤 맛일까?':visitor.phase==='wait'?'버섯을 살 수 있을까요?':visitor.phase==='happy'?'고마워요! ✨':'';
    bubble.visible=!!phrase && visitor.object.visible;
    if(phrase && bubblePhase!==phrase){say(phrase);bubblePhase=phrase;}
    bubble.position.set(visitor.object.position.x,visitor.object.position.y+2.0,visitor.object.position.z);
  }
  return {
    update(dt){ dt=Math.min(dt||0,.1);scenery.update(dt);stepPlayer(dt);mixers.forEach(m=>m.update(dt));time+=dt;celebration=Math.max(0,celebration-dt);customers.forEach(c=>{c.object.position.y=c.baseY+Math.sin(time*2+c.phase)*.025+(celebration>0?Math.abs(Math.sin(celebration*12))*.14:0);});updateVisitor(dt); },
    sell(){if(!visitor.object || visitor.phase!=='wait')return false;celebration=.8;visitor.phase='happy';visitor.wait=0;animateVisitor('emote-yes');return true;},
    canSell(){return !!visitor.object && visitor.phase==='wait';},
    getCustomerState(){return visitor.phase;},
    setMove(x,y){stick.set(Number(x)||0,Number(y)||0);if(stick.length()>1)stick.normalize()},
    getNearby(){return nearby()},
    setDisplay(count){displayCount=Math.max(0,Math.floor(Number(count)||0));displayItems.forEach((item,i)=>item.visible=i<displayCount);},
    dispose(){disposed=true;scenery.dispose();bubbleTexture.dispose();scene.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of [].concat(o.material)){if(m.map)m.map.dispose();m.dispose();}}});}
  };
}
