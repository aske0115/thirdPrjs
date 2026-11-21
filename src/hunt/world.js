import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// A continuous food-foraging valley: market path, stream crossing, and ruined grove.
// Game logic owns characters and all interactivity; this module owns visual scenery.
export function createWorld(THREE, scene) {
  const root = new THREE.Group(); root.name='foraging-valley'; scene.add(root);
  const loader=new GLTFLoader(), objects=[], materials=[], textures=[];
  let disposed=false, elapsed=0;
  const base=import.meta.env.BASE_URL;
  function mat(color,extra={}){const m=new THREE.MeshStandardMaterial({color,roughness:.9,...extra});materials.push(m);return m;}
  const turf=mat('#688565'), dirt=mat('#a18563'), rock=mat('#777f76'), rockLight=mat('#a3a59a'), wood=mat('#684638'), plank=mat('#a97b52'), moss=mat('#708c64'), mushroom=mat('#d98768'), cream=mat('#f5dbc2');
  const water=mat('#72afa8',{roughness:.34,metalness:.03,transparent:true,opacity:.88});
  function box(x,y,z,w,h,d,m,rotation=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.rotation.y=rotation;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);objects.push(mesh);return mesh;}
  function disk(x,y,z,r,m){const mesh=new THREE.Mesh(new THREE.CircleGeometry(r,32),m);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);objects.push(mesh);return mesh;}
  // Fine low-contrast flecks, generated locally so terrain loads offline.
  function terrainTexture(base,colors,seed){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,512);let n=seed;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<4200;i++){ctx.globalAlpha=.07+random()*.13;ctx.fillStyle=colors[Math.floor(random()*colors.length)];const x=random()*512,y=random()*512,r=.4+random()*2.1;ctx.beginPath();ctx.ellipse(x,y,r*1.7,r*.6,random()*Math.PI,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
    const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(16,16);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;
  }
  turf.map=terrainTexture('#718a68',['#344d36','#c2cd99','#94ae76'],875);turf.color.set('#ffffff');
  dirt.map=terrainTexture('#aa8c68',['#705d49','#e0c29a','#8a7859'],413);dirt.map.repeat.set(8,2);dirt.color.set('#ffffff');
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
  const plantGeo=new THREE.ConeGeometry(.09,.48,4),plantMat=mat('#526e4b');
  const tufts=new THREE.InstancedMesh(plantGeo,plantMat,1100),flowerGeo=new THREE.SphereGeometry(.085,5,4),flowerMat=mat('#e8c98a');
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
  const fill=new THREE.HemisphereLight('#e4e5c5','#4a5542',1.15);root.add(fill);
  const sun=new THREE.DirectionalLight('#ffe4b5',1.6);sun.position.set(-15,28,12);root.add(sun);
  // Keep movable silhouettes off the river; the central z ±2.4 crossing remains open.
  function walkable(x,z){return Math.abs(x)<=31&&Math.abs(z)<=28&&!(Math.abs(x)<2.65&&Math.abs(z)>2.35);}
  return {walkable,update(dt){elapsed+=Math.min(.1,dt||0);water.opacity=.83+.05*Math.sin(elapsed*1.1);},dispose(){disposed=true;scene.remove(root);const geometries=new Set(),mats=new Set(),maps=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of [].concat(o.material||[])){mats.add(m);for(const key of ['map','normalMap','roughnessMap','emissiveMap'])if(m[key])maps.add(m[key]);}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());maps.forEach(t=>t.dispose());textures.forEach(t=>t.dispose());}};
}
