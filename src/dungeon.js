import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { BALANCE } from './balance.js';

// A self-contained, offline hunting field. World dimensions are intentionally small
// enough for a mobile GPU; all art is shared low-poly geometry and materials.
export function createDungeon({container,onReturn=()=>{},onState=()=>{},onSound=()=>{}}) {
  if (!container) throw new Error('Dungeon requires a container');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b4dfd7');
  scene.fog = new THREE.Fog('#b4dfd7', 30, 72);
  const camera = new THREE.OrthographicCamera(-10,10,10,-10,.1,100);
  const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','던전 사냥 게임 화면');
  renderer.domElement.style.cssText='width:100%;height:100%;display:block;touch-action:none';
  container.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x6d8f69,2));
  const sun=new THREE.DirectionalLight(0xffe5b7,1.7);sun.position.set(8,18,8);scene.add(sun);
  const materials={grass:new THREE.MeshStandardMaterial({color:0x8cc690}),darkGrass:new THREE.MeshStandardMaterial({color:0x779a7c}),path:new THREE.MeshStandardMaterial({color:0xe0c89d}),cream:new THREE.MeshStandardMaterial({color:0xffdfb8}),hair:new THREE.MeshStandardMaterial({color:0x705246}),apron:new THREE.MeshStandardMaterial({color:0x84bfa1}),slime:new THREE.MeshStandardMaterial({color:0x76d2a3,roughness:.4}),bat:new THREE.MeshStandardMaterial({color:0xb89bcf}),leaf:new THREE.MeshStandardMaterial({color:0x529673}),trunk:new THREE.MeshStandardMaterial({color:0x9c7656}),red:new THREE.MeshStandardMaterial({color:0xe57367}),white:new THREE.MeshStandardMaterial({color:0xfff5dc}),rock:new THREE.MeshStandardMaterial({color:0xa8b5a3}),gold:new THREE.MeshStandardMaterial({color:0xffd772,emissive:0x664400}),weapon:new THREE.MeshStandardMaterial({color:0xf0c282,metalness:.25}),fx:new THREE.MeshBasicMaterial({color:0xffe7a3,transparent:true,opacity:.85})};
  const geos={sphere:new THREE.SphereGeometry(1,12,8),box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(1,1,1,12),cone:new THREE.ConeGeometry(1,1,7),ring:new THREE.RingGeometry(.55,.67,24)};
  const owned=[];
  function mesh(geo,mat,parent,x,y,z,sx=1,sy=sx,sz=sx){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
  function box(parent,x,y,z,w,h,d,mat){return mesh(geos.box,mat,parent,x,y,z,w,h,d)}
  function orb(parent,x,y,z,size,mat){return mesh(geos.sphere,mat,parent,x,y,z,size)}
  const treeGroups=[];
  function ground(){box(scene,-10,-.18,0,20,.35,24,materials.grass);box(scene,10,-.18,0,20,.35,24,materials.darkGrass);box(scene,0,.01,0,39,.04,2.8,materials.path);
    // The open path joins two visual regions; props never block mobile movement.
    for(let i=0;i<38;i++){const x=-19+(i*11.37)%38,z=-11+(i*7.19)%22;if(Math.abs(z)<2.6)continue; if(i%3===0){const tree=new THREE.Group();tree.position.set(x,0,z);box(tree,0,.6,0,.34,1.2,.34,materials.trunk);orb(tree,0,1.55,0,.8,materials.leaf);scene.add(tree);treeGroups.push(tree)}else if(i%3===1){mesh(geos.sphere,materials.rock,scene,x,.25,z,.45,.3,.42)}else{orb(scene,x,.18,z,.12,materials.white);orb(scene,x+.3,.13,z+.2,.1,materials.red)}}
    // A gate between the meadow and deeper mushroom grove makes exploration legible.
    for(const z of [-2.1,2.1]){box(scene,0,.85,z,.35,1.7,.35,materials.trunk);orb(scene,0,1.8,z,.25,materials.gold)}box(scene,0,1.75,0,.35,.22,4.5,materials.trunk);
  }
  ground();
  for(const [x,z,size] of [[3,9,1],[7,-9,1.35],[12,10,1.1],[17,-8,1.5]]){mesh(geos.cylinder,materials.white,scene,x,size*.48,z,size*.18,size*.9,size*.18);const cap=orb(scene,x,size*.95,z,size*.55,materials.red);cap.scale.set(1,.42,1);orb(scene,x+.2*size,size*1.08,z+.3*size,.09*size,materials.white)}
  const player=new THREE.Group();scene.add(player);const body=orb(player,0,.62,0,.48,materials.apron);body.scale.set(1,1.1,.8);orb(player,0,1.3,0,.38,materials.cream);const hair=orb(player,0,1.52,-.04,.38,materials.hair);hair.scale.set(1,.55,1);for(const x of [-.15,.15])orb(player,x,1.33,.34,.04,new THREE.MeshBasicMaterial({color:0x392f36}));box(player,.43,.64,0,.55,.13,.18,materials.weapon);
  let mushrooms=[],enemies=[],effects=[],running=false,disposed=false,raf=0,last=0,state=null,move={x:0,y:0},stateTimer=0,spawnTimer=0,attackTimer=0,hitInvulnerable=0,dashTimer=0,dashCooldown=0,attackBoost=0,rangeBoost=0,skillSpent=false,pendingWeapon='ladle';
  const maxHealth=BALANCE.player.maxHealth;
  const gltfLoader=new GLTFLoader();const base=import.meta.env.BASE_URL;let mushroomModel=null;
  function decorateMushroom(group){if(!mushroomModel)return;for(const child of group.children)child.visible=false;const model=mushroomModel.clone(true);group.add(model)}
  gltfLoader.load(`${base}assets/models/nature-kit/mushroom-redtall.glb`,gltf=>{if(disposed)return;mushroomModel=gltf.scene;const box=new THREE.Box3().setFromObject(mushroomModel),height=box.max.y-box.min.y;mushroomModel.scale.setScalar(.8/(height||1));for(const group of mushrooms)decorateMushroom(group)},undefined,()=>{});
  gltfLoader.load(`${base}assets/models/mini-characters/character-female-d.glb`,gltf=>{if(disposed)return;const model=gltf.scene,box=new THREE.Box3().setFromObject(model),height=box.max.y-box.min.y;model.scale.setScalar(1.65/(height||1));for(const child of player.children)child.visible=false;player.add(model)},undefined,()=>{});
  gltfLoader.load(`${base}assets/models/nature-kit/tree-oak.glb`,gltf=>{if(disposed)return;const model=gltf.scene,box=new THREE.Box3().setFromObject(model),height=box.max.y-box.min.y;model.scale.setScalar(2.4/(height||1));for(const group of treeGroups){for(const child of group.children)child.visible=false;group.add(model.clone(true))}},undefined,()=>{});
  gltfLoader.load(`${base}assets/models/nature-kit/crop-melon.glb`,gltf=>{if(disposed)return;const model=gltf.scene,box=new THREE.Box3().setFromObject(model),height=box.max.y-box.min.y;model.scale.setScalar(.8/(height||1));for(const [x,z] of [[5,7],[10,-8],[16,5]]){const copy=model.clone(true);copy.position.set(x,0,z);scene.add(copy)}},undefined,()=>{});
  function mushroom(x,z){const g=new THREE.Group();mesh(geos.cylinder,materials.white,g,0,.22,0,.12,.42,.12);const cap=orb(g,0,.48,0,.34,materials.red);cap.scale.set(1,.55,1);orb(g,.12,.54,.19,.07,materials.white);g.position.set(x,0,z);scene.add(g);mushrooms.push(g);decorateMushroom(g)}
  function populate(){for(const p of [[-7,3],[-11,-4],[-15,7],[-2,-6],[3,4],[8,-5],[13,7],[17,-3]])mushroom(...p)}
  function enemy(type,x,z){const root=new THREE.Group(),mat=type==='slime'?materials.slime:materials.bat;const b=orb(root,0,.45,0,.48,mat);b.scale.set(1,.8,.8);for(const dx of [-.15,.15])orb(root,dx,.51,.35,.04,materials.hair);if(type==='bat'){const l=orb(root,-.53,.5,0,.35,mat),r=orb(root,.53,.5,0,.35,mat);l.scale.set(1,.35,.6);r.scale.set(1,.35,.6)}root.position.set(x,0,z);scene.add(root);enemies.push({root,type,hp:type==='slime'?BALANCE.enemies.normal.health:BALANCE.enemies.fast.health,speed:(type==='slime'?BALANCE.enemies.normal.speed:BALANCE.enemies.fast.speed)/40,flash:0})}
  function particle(x,z,color=materials.fx){const p=mesh(geos.ring,color,scene,x,.2,z);p.rotation.x=-Math.PI/2;effects.push({mesh:p,age:0})}
  function projectile(target){const p=orb(scene,player.position.x,.85,player.position.z,.17,materials.gold);effects.push({mesh:p,age:0,flight:true,from:player.position.clone(),to:target.root.position.clone()})}
  function clean(){for(const m of mushrooms)scene.remove(m);for(const e of enemies)scene.remove(e.root);for(const e of effects)scene.remove(e.mesh);mushrooms=[];enemies=[];effects=[]}
  function snapshot(){return {health:state.health,maxHealth,time:Math.max(0,Math.ceil(state.time)),loot:{...state.loot},kills:state.kills,weapon:state.weapon,xp:state.xp,skillReady:state.xp>=3&&!skillSpent,zone:player.position.x<0?'햇살 숲':'버섯 숲',dashReady:dashCooldown<=0}}
  function emit(){if(state)onState(snapshot())}
  function start(options={}){if(disposed)return;cancelAnimationFrame(raf);clean();state={health:maxHealth,time:BALANCE.nightSeconds,loot:{mushroom:0,slime:0},kills:0,xp:0,weapon:(options.weapon||pendingWeapon)==='pan'?'pan':'ladle'};move={x:0,y:0};attackBoost=Math.max(0,Math.min(2,Number(options.permanentPower)||0));rangeBoost=0;skillSpent=false;spawnTimer=1;attackTimer=0;hitInvulnerable=0;dashTimer=0;dashCooldown=0;stateTimer=0;player.position.set(-15,0,0);populate();enemy('slime',-9,4);enemy('bat',-3,-5);running=true;last=0;resize();emit();renderer.render(scene,camera);raf=requestAnimationFrame(frame)}
  function stop(){running=false;cancelAnimationFrame(raf);move={x:0,y:0};last=0}
  function returnToShop(){if(!running)return;stop();onSound('return');const result={loot:{...state.loot},kills:state.kills};onReturn(result)}
  function hit(enemy){enemy.hp-=BALANCE.combat.attackDamage+attackBoost;enemy.flash=.18;particle(enemy.root.position.x,enemy.root.position.z);onSound('hit');if(enemy.hp<=0){scene.remove(enemy.root);enemies=enemies.filter(e=>e!==enemy);state.kills++;state.xp++;state.loot.slime++;if(state.xp===3)onSound('level')}}
  function autoAttack(){const radius=BALANCE.combat.attackRange/35*(state.weapon==='pan'?1:2)+rangeBoost;let sorted=enemies.map(e=>({e,d:e.root.position.distanceTo(player.position)})).filter(v=>v.d<radius).sort((a,b)=>a.d-b.d);if(!sorted.length)return;if(state.weapon==='pan'){particle(player.position.x,player.position.z);sorted.slice(0,3).forEach(v=>hit(v.e));attackTimer=.7}else{projectile(sorted[0].e);hit(sorted[0].e);attackTimer=BALANCE.combat.attackCooldown}}
  function setMove(x,y){if(!running)return;const length=Math.hypot(Number(x)||0,Number(y)||0);move=length>1?{x:x/length,y:y/length}:{x:Number(x)||0,y:Number(y)||0}}
  function dash(){if(!running||dashCooldown>0)return false;dashTimer=BALANCE.player.dodgeDuration;dashCooldown=BALANCE.player.dodgeCooldown;hitInvulnerable=Math.max(hitInvulnerable,BALANCE.player.dodgeInvulnerability);particle(player.position.x,player.position.z);onSound('dash');return true}
  function setWeapon(id){if(!['ladle','pan'].includes(id))return;pendingWeapon=id;if(state){state.weapon=id;emit()}}
  function upgrade(id){if(!running||state.xp<3||skillSpent||!['power','range'].includes(id))return false;if(id==='power')attackBoost+=1;else rangeBoost=1.4;skillSpent=true;onSound('level');emit();return true}
  function resize(){const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight;const aspect=w/Math.max(h,1),span=10;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
  function frame(now){if(!running)return;if(!last)last=now;const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){update(dt);if(!running)return;renderer.render(scene,camera)}raf=requestAnimationFrame(frame)}
  function update(dt){state.time-=dt;hitInvulnerable=Math.max(0,hitInvulnerable-dt);dashTimer=Math.max(0,dashTimer-dt);dashCooldown=Math.max(0,dashCooldown-dt);attackTimer-=dt;spawnTimer-=dt;stateTimer-=dt;const moving=Math.hypot(move.x,move.y);if(moving>.05){const speed=(dashTimer>0?BALANCE.player.dodgeSpeed:BALANCE.player.speed)/35;player.position.x=THREE.MathUtils.clamp(player.position.x+move.x*speed*dt,-19,19);player.position.z=THREE.MathUtils.clamp(player.position.z+move.y*speed*dt,-11,11);player.rotation.y=Math.atan2(move.x,move.y);body.scale.y=1.1+Math.sin(performance.now()*.015)*.06}player.visible=hitInvulnerable<=0||Math.floor(performance.now()/90)%2===0;
    for(const m of [...mushrooms])if(m.position.distanceTo(player.position)<BALANCE.combat.lootPickupRadius/30){scene.remove(m);mushrooms=mushrooms.filter(v=>v!==m);state.loot.mushroom++;particle(m.position.x,m.position.z);onSound('pickup')}
    for(const e of [...enemies]){const dx=player.position.x-e.root.position.x,dz=player.position.z-e.root.position.z,dist=Math.hypot(dx,dz)||1;e.root.position.x+=dx/dist*e.speed*dt;e.root.position.z+=dz/dist*e.speed*dt;e.root.rotation.y=Math.atan2(dx,dz);e.flash-=dt;e.root.scale.setScalar(e.flash>0?1.25:1);if(dist<.75&&hitInvulnerable<=0){state.health-=e.type==='slime'?BALANCE.enemies.normal.contactDamage:BALANCE.enemies.fast.contactDamage;hitInvulnerable=BALANCE.player.damageImmunity;onSound('hurt');if(state.health<=0){returnToShop();return}}}
    if(attackTimer<=0)autoAttack();if(spawnTimer<=0&&enemies.length<BALANCE.combat.maxEnemies){let x=player.position.x,z=player.position.z;const minimum=BALANCE.combat.spawnSafeRadius/35;for(let attempt=0;attempt<12;attempt++){const angle=Math.random()*Math.PI*2;x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*8,-19,19);z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*8,-11,11);if(Math.hypot(x-player.position.x,z-player.position.z)>=minimum)break}if(Math.hypot(x-player.position.x,z-player.position.z)<minimum){x=player.position.x<0?19:-19;z=player.position.z<0?11:-11}enemy(Math.random()<.55?'slime':'bat',x,z);spawnTimer=BALANCE.combat.spawnInterval}
    for(const fx of [...effects]){fx.age+=dt;if(fx.flight){const t=Math.min(1,fx.age/.24);fx.mesh.position.lerpVectors(fx.from,fx.to,t);fx.mesh.position.y=.7+Math.sin(t*Math.PI)*.75}else fx.mesh.scale.setScalar(1+fx.age*4);if(fx.age>.3){scene.remove(fx.mesh);effects=effects.filter(v=>v!==fx)}}
    camera.position.set(player.position.x+10,16,player.position.z+13);camera.lookAt(player.position.x,0,player.position.z);if(stateTimer<=0){emit();stateTimer=.15}if(state.time<=0)returnToShop();}
  function visibility(){last=0;move={x:0,y:0}}
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);
  function dispose(){if(disposed)return;stop();disposed=true;window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);clean();scene.traverse(obj=>{if(obj.material&& !Object.values(materials).includes(obj.material))obj.material.dispose?.()});Object.values(geos).forEach(v=>v.dispose());Object.values(materials).forEach(v=>v.dispose());owned.forEach(x=>x.dispose());renderer.dispose();renderer.domElement.remove()}
  return {start,stop,dispose,setMove,dash,setWeapon,upgrade,returnToShop};
}
