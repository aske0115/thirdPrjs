import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// A continuous food-foraging valley: market path, stream crossing, and ruined grove.
// Game logic owns characters and all interactivity; this module owns visual scenery.
export function createWorld(THREE, scene) {
  const root = new THREE.Group(); root.name='foraging-valley'; scene.add(root);
  const loader=new GLTFLoader(), objects=[], materials=[], textures=[];
  let disposed=false, elapsed=0;
  const base=import.meta.env.BASE_URL;
  function mat(color,extra={}){const m=new THREE.MeshStandardMaterial({color,roughness:.9,...extra});materials.push(m);return m;}
  const turf=mat('#354b4d'), dirt=mat('#635a66'), rock=mat('#44495c'), rockLight=mat('#73758a'), wood=mat('#514046'), plank=mat('#98704f'), moss=mat('#516962'), mushroom=mat('#9061ae',{emissive:'#301038',emissiveIntensity:.22}), cream=mat('#d4c8ca');
  const water=mat('#3c7892',{roughness:.3,metalness:.12,transparent:true,opacity:.88});
  function box(x,y,z,w,h,d,m,rotation=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);objects.push(mesh);return mesh;}
  function disk(x,y,z,r,m){const mesh=new THREE.Mesh(new THREE.CircleGeometry(r,32),m);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);objects.push(mesh);return mesh;}
  // Fine low-contrast flecks, generated locally so terrain loads offline.
  function terrainTexture(base,colors,seed){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,512);let n=seed;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<4200;i++){ctx.globalAlpha=.07+random()*.13;ctx.fillStyle=colors[Math.floor(random()*colors.length)];const x=random()*512,y=random()*512,r=.4+random()*2.1;ctx.beginPath();ctx.ellipse(x,y,r*1.7,r*.6,random()*Math.PI,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
    const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(16,16);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;
  }
  turf.map=terrainTexture('#344c50',['#222a43','#819c8b','#5b7777'],875);turf.color.set('#ffffff');
  dirt.map=terrainTexture('#675d6e',['#413a58','#c4a787','#897a79'],413);dirt.map.repeat.set(8,2);dirt.color.set('#ffffff');
  // Field continues under the forest edges rather than exposing an island.
  box(0,-.28,0,112,.5,112,turf);
  // A single smooth freeform ribbon, avoiding the repeated scalloped circle outline.
  const path=new THREE.Shape();
  const samples=[];for(let x=-36;x<=36;x+=1.5){const mid=Math.sin((x+3)*.12)*1.4;const width=2.15+.28*Math.sin(x*.29);samples.push({x,mid,width});}
  samples.forEach((p,i)=>i?path.lineTo(p.x,p.mid+p.width):path.moveTo(p.x,p.mid+p.width));
  [...samples].reverse().forEach(p=>path.lineTo(p.x,p.mid-p.width));path.closePath();
  const trail=new THREE.Mesh(new THREE.ShapeGeometry(path),dirt);trail.rotation.x=-Math.PI/2;trail.position.y=.008;trail.receiveShadow=true;root.add(trail);objects.push(trail);
  // Stream runs north/south: land at either bank with a clearly visible crossing.
  box(0,-.05,0,5.4,.13,74,water);
  for(let z=-28;z<=28;z+=1.8){for(const side of [-1,1]){const x=side*(3.05+(Math.sin(z*.42)+1)*.18);box(x,.07,z,.65,.23,1.5,z%3?rock:rockLight,Math.sin(z)*.22);}}
  // Raised timber bridge with planks and rails across the river, wide enough to fight.
  box(0,.16,0,7.1,.22,5.4,wood);
  for(let x=-3.25;x<=3.25;x+=.48)box(x,.31,0,.43,.10,5.2,plank);
  for(const z of [-2.68,2.68]){box(0,.75,z,7.2,.12,.14,wood);for(const x of [-3.2,-1.6,0,1.6,3.2])box(x,.48,z,.16,.8,.16,wood);}
  // Tumbled ancient stonework frames the far side without blocking the main route.
  for(const z of [-7.2,7.2]){for(const x of [12,19]){box(x,.75,z,.85,1.5,.85,rockLight);box(x,1.56,z,1.05,.17,1.05,rock);box(x,.25,z,1,.14,1,moss);}}
  for(const z of [-7.2,7.2])for(const x of [13.7,16,17.8])box(x,.26,z,1.35,.52,.6,rock,Math.sin(x*z)*.25);
  // Market crates and a mushroom gathering rest area on the entrance bank.
  for(const [x,z] of [[-19,-5],[-17,-5.4],[-18.3,-6.5]]){box(x,.48,z,.9,.92,.9,wood);box(x,.97,z,.95,.08,.95,plank);box(x,.49,z+.47,.76,.12,.06,plank);}
  for(const [x,z,scale] of [[-16,-7,1],[-14,-6.8,.65],[17,8,1.4],[19,8,.9]]){
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.15*scale,.2*scale,.8*scale,9),cream);stem.position.set(x,.4*scale,z);root.add(stem);objects.push(stem);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.5*scale,12,8,0,Math.PI*2,0,Math.PI*.5),mushroom);cap.position.set(x,.8*scale,z);root.add(cap);objects.push(cap);
  }
  // A deterministic wooded border and clustered habitat furnish depth without random rerenders.
  let seed=76543;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  // Dense small vegetation, in instanced draws, frames the traversable path without blocking it.
  const plantGeo=new THREE.ConeGeometry(.09,.48,4),plantMat=mat('#405d5b');
  const tufts=new THREE.InstancedMesh(plantGeo,plantMat,1100),flowerGeo=new THREE.SphereGeometry(.085,5,4),flowerMat=mat('#b99bd2',{emissive:'#332044',emissiveIntensity:.35});
  const petals=new THREE.InstancedMesh(flowerGeo,flowerMat,220),dummy=new THREE.Object3D();
  for(let i=0;i<1100;i++){const x=-32+rand()*64;let z=-27+rand()*54;const mid=-Math.sin((x+3)*.12)*1.4;if(Math.abs(z-mid)<2.7)z=mid+(z<mid?-1:1)*(2.8+rand()*3);if(Math.abs(x)<4)z=(z<0?-1:1)*(6+rand()*18);dummy.position.set(x,.17,z);dummy.rotation.set(0,rand()*Math.PI,rand()*.3-.15);const k=.65+rand()*.8;dummy.scale.set(k,k,k);dummy.updateMatrix();tufts.setMatrixAt(i,dummy.matrix);}
  for(let i=0;i<220;i++){const x=-32+rand()*64,z=(rand()<.5?-1:1)*(3+rand()*18);dummy.position.set(x,.22,z);dummy.rotation.set(0,0,0);dummy.scale.setScalar(.8+rand());dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}
  tufts.instanceMatrix.needsUpdate=true;petals.instanceMatrix.needsUpdate=true;root.add(tufts,petals);objects.push(tufts,petals);
  const placements={tree:[],rock:[],bush:[],fungus:[]};
  for(let i=0;i<210;i++){
    const x=-35+rand()*70,z=-30+rand()*60;
    if(Math.abs(z)<4.1 || Math.abs(x)<4 || (x<-22&&Math.abs(z)<5.5) || (x>21&&Math.abs(z)<5.5))continue;
    const kind=i%5===0?'rock':i%5===1?'bush':i%8===0?'fungus':'tree';
    placements[kind].push({x,z,angle:rand()*Math.PI*2,height:kind==='tree'?3+rand()*3:kind==='rock'?.8+rand()*.85:kind==='bush'?.5+rand()*.5:.45+rand()*.55});
  }
  // Hand-composed near-path groves keep a portrait camera filled as it follows the player.
  // The ±3.8 corridor and river crossing stay clear of decorative trees.
  for(let x=-30;x<=30;x+=5.2){
    if(Math.abs(x)<5)continue;
    for(const side of [-1,1]){
      const z=side*(5.15+.5*rand())-Math.sin((x+3)*.12)*1.4;
      placements.tree.push({x:x+(rand()-.5)*1.4,z,angle:rand()*Math.PI*2,height:side>0?2.6+rand()*.8:3.4+rand()*1.2});
      placements.bush.push({x:x+1.15,z:side*3.85-Math.sin((x+3)*.12)*1.4,angle:rand()*Math.PI*2,height:.5+rand()*.45});
      placements.rock.push({x:x-1.4,z:side*4.25-Math.sin((x+3)*.12)*1.4,angle:rand()*Math.PI*2,height:.42+rand()*.38});
    }
  }
  function scatter(path,items){loader.load(`${base}assets/models/${path}`,gltf=>{
    if(disposed){gltf.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)for(const m of [].concat(o.material))m.dispose();});return;}
    const original=gltf.scene;const bounds=new THREE.Box3().setFromObject(original),size=bounds.getSize(new THREE.Vector3());
    for(const item of items){const instance=original.clone(true),k=item.height/Math.max(.001,size.y);instance.scale.setScalar(k);instance.rotation.y=item.angle;instance.position.set(item.x,-bounds.min.y*k,item.z);instance.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});root.add(instance);}
  },undefined,e=>console.warn('World asset unavailable',path,e));}
  // Mixed stylized textured trees and low-poly vegetation. All files are CC0.
  scatter('quaternius-nature/CommonTree_1.gltf',placements.tree.filter((_,i)=>i%2===0));
  scatter('hunt-nature/tree-oak.glb',placements.tree.filter((_,i)=>i%2===1));
  scatter('hunt-nature/rock-largea.glb',placements.rock);
  scatter('hunt-nature/plant-bush.glb',placements.bush);
  scatter('hunt-nature/mushroom-redtall.glb',placements.fungus);
  // Lanterns are actual geometry with emissive cores, adding warm visual anchors.
  const lampMetal=mat('#4b3942',{metalness:.25}),glow=mat('#ffd791',{emissive:'#ffab39',emissiveIntensity:1.6});
  function lantern(x,z,hasLight=false){
    box(x,.68,z,.12,1.36,.12,lampMetal);box(x,1.37,z,.53,.08,.53,lampMetal);box(x,1.95,z,.6,.11,.6,lampMetal);
    box(x,1.66,z,.36,.47,.36,glow);for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(x+dx,1.66,z+dz,.045,.52,.045,lampMetal);
    if(hasLight){const light=new THREE.PointLight('#ffc46a',16,6,2);light.position.set(x,1.7,z);root.add(light);}
  }
  for(const [x,z,on] of [[-25,3.35,true],[-22,-3.8,false],[-18,3.8,false],[-12,-3.8,false],[-6,3.6,false],[7,-3.8,true],[13,3.5,false],[20,-4,false],[26,3.8,false]])lantern(x,z,on);
  // Conspicuous lavender caps and pale stalks make this a food-foraging world.
  for(const [x,z,k] of [[-29,4.5,1],[-25,-4.6,1.15],[-23,4.8,.9],[-21,4.8,.75],[-19,-4.6,.85],[-16,5,1.15],[-13,-4.5,1.1],[-10,-5,.85],[-7,4.7,.8],[9,5,1.35],[14,-5,1],[20,-5,1.2],[26,4.8,1]]){
    const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.17*k,.24*k,.95*k,9),cream);stalk.position.set(x,.48*k,z);root.add(stalk);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.63*k,14,8,0,Math.PI*2,0,Math.PI*.5),mushroom);cap.position.set(x,.95*k,z);root.add(cap);
    for(const [dx,dz] of [[-.25,0],[.22,.08],[0,-.25]]){const spot=new THREE.Mesh(new THREE.SphereGeometry(.06*k,8,6),cream);spot.position.set(x+dx*k,1.44*k,z+dz*k);root.add(spot);}
  }
  // Animated motes add life using one draw call; no static-image backdrop.
  const moteGeo=new THREE.SphereGeometry(.045,6,4),moteMat=new THREE.MeshBasicMaterial({color:'#ffd995'}),motes=new THREE.InstancedMesh(moteGeo,moteMat,60),moteData=[];
  for(let i=0;i<60;i++)moteData.push({x:-30+rand()*60,z:-13+rand()*26,y:.4+rand()*2.8,phase:rand()*6.28});
  root.add(motes);
  const fill=new THREE.HemisphereLight('#a7b7e9','#283b45',.48);root.add(fill);
  const sun=new THREE.DirectionalLight('#a4b8ff',.6);sun.position.set(-15,28,12);root.add(sun);
  // Keep movable silhouettes off the river; the central z ±2.4 crossing remains open.
  function walkable(x,z){return Math.abs(x)<=31&&Math.abs(z)<=28&&!(Math.abs(x)<2.65&&Math.abs(z)>2.35);}
  return {walkable,update(dt){elapsed+=Math.min(.1,dt||0);water.opacity=.83+.05*Math.sin(elapsed*1.1);moteData.forEach((p,i)=>{dummy.position.set(p.x+Math.sin(elapsed*.45+p.phase)*.22,p.y+Math.sin(elapsed*.8+p.phase)*.16,p.z);dummy.scale.setScalar(.6+.4*(.5+.5*Math.sin(elapsed*1.3+p.phase)));dummy.updateMatrix();motes.setMatrixAt(i,dummy.matrix)});motes.instanceMatrix.needsUpdate=true;},dispose(){disposed=true;scene.remove(root);const geometries=new Set(),mats=new Set(),maps=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[])){mats.add(m);for(const key of ['map','normalMap','roughnessMap','emissiveMap'])if(m[key])maps.add(m[key]);}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());maps.forEach(t=>t.dispose());textures.forEach(t=>t.dispose());}};
}
