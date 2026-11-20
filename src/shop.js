import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// A small isometric shop diorama. UI, renderer, camera and inventory belong to the shell.
export function createShop(THREE, scene) {
  const root = new THREE.Group();
  scene.add(root);
  const loader = new GLTFLoader();
  const base = import.meta.env.BASE_URL;
  let disposed = false, time = 0, celebration = 0;
  const customers = [], mixers = [];
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
  function model(path,x,y,z,height,rotation=0, customer=false) {
    loader.load(`${base}assets/models/${path}.glb`, gltf => {
      if (disposed) { gltf.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of [].concat(o.material))m.dispose();}}); return; }
      const object=gltf.scene;
      const size=new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
      object.scale.setScalar(height/Math.max(size.y,0.001));
      const bounds=new THREE.Box3().setFromObject(object); object.position.set(x,y-bounds.min.y,z); object.rotation.y=rotation;
      object.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      root.add(object); if(gltf.animations.length){const mixer=new THREE.AnimationMixer(object);const clip=gltf.animations.find(c=>/idle/i.test(c.name))||gltf.animations[0];mixer.clipAction(clip).play();mixers.push(mixer);} if(customer)customers.push({object, baseY:object.position.y, phase:customers.length*1.8});
    }, undefined, err => console.warn('Shop model unavailable:', path, err));
  }
  // Platform, warm wood planks and mint checker floor.
  box(0,-.24,0,10,.45,8,'#453933');
  for(let x=-4.5;x<5;x++)for(let z=-3.5;z<4;z++)box(x,0,z,.97,.08,.97,(Math.round(x+z)%2===0)?'#f6e6cb':'#e6d2ae');
  // Back and side walls open toward the camera, with contrasting baseboards.
  box(0,2,-3.9,10,4,.22,'#e9cba6'); box(-4.9,2,0,.22,4,8,'#e2bb98');
  box(0,.3,-3.72,10,.28,.16,'#b58467'); box(-4.72,.3,0,.16,.28,8,'#b58467');
  // Awning, sign, shelves, checkout, display tables.
  box(0,3.8,-3.63,10,.22,.75,'#f3e8d7');
  for(let x=-4.5;x<5;x++) box(x,3.68,-3.38,.96,.14,.43,Math.round(x+.5)%2?'#f3a49a':'#fff1d4');
  box(0,2.75,-3.72,3.1,.73,.18,'#956149');
  box(0,2.75,-3.58,2.85,.54,.11,'#8fc6a2');
  for(let x=-.9;x<=.9;x+=.45) ball(x,2.75,-3.5,.095,'#ffe1a0');
  // Full modeled retail shelving and chilled cabinets from the Mini Shop kit.
  model('mini-shop/shelf-bags',-3.55,.08,-3.2,2.25);
  model('mini-shop/shelf-boxes',-1.5,.08,-3.2,2.25);
  model('mini-shop/freezers-standing',1.05,.08,-3.2,2.25);
  model('mini-shop/shelf-boxes',3.4,.08,-3.2,2.25);
  box(-2.5,.62,.2,2.65,1.2,1.15,'#ae8064'); box(-2.5,1.25,.2,2.85,.13,1.35,'#f8dab2');
  model('mini-shop/cash-register',-2.7,1.35,.08,.52);
  box(2.0,.48,-.45,2.5,.92,1.3,'#a7795b');box(2.0,.97,-.45,2.65,.12,1.45,'#f8d9b3');
  box(2.0,.35,2.4,2.35,.66,1.0,'#ad7e60');box(2.0,.72,2.4,2.5,.1,1.1,'#f5d9b6');
  // Shop decorations and warm window.
  box(-4.73,2.5,1.6,.12,1.3,2.2,'#926d58');box(-4.64,2.5,1.6,.08,1.08,1.95,'#c2e7df');
  box(-4.57,2.5,1.6,.08,1.08,.08,'#f6e1bf');box(-4.57,2.5,1.6,.08,.08,1.95,'#f6e1bf');
  for(let x=-4;x<=4;x+=2){ball(x,3.4,-3.4,.1,'#ffe4a2');}
  model('food/apple',1.35,1.04,-.55,.4); model('food/cupcake',2,1.04,-.55,.46); model('food/burger-double',2.68,1.04,-.55,.37);
  model('nature/mushroom_redTall',1.5,.79,2.4,.48);model('nature/mushroom_redTall',2.1,.79,2.4,.36);model('food/apple',2.6,.79,2.4,.31);
  model('mini-shop/character-employee',-2.6,.08,-.9,1.45,Math.PI,true);
  model('chars/character-female-c',-2.4,.08,1.95,1.35,Math.PI,true);
  model('mini-shop/display-bread',3.65,.08,.95,1.0); model('mini-shop/display-fruit',.05,.08,-1.0,.95);
  model('mini-shop/shopping-basket',-.6,.08,2.2,.4); model('mini-shop/shopping-cart',-3.7,.08,2.8,.9);
  model('town/tree-high-round',4.25,.05,3.3,1.9);
  model('nature/flower_yellowA',-4,.05,3.3,.55);
  const ambient=new THREE.HemisphereLight('#e8fbff','#9a7569',2.1);root.add(ambient);
  const sun=new THREE.DirectionalLight('#fff0ce',2.2);sun.position.set(3,8,5);root.add(sun);
  return {
    update(dt){ mixers.forEach(m=>m.update(Math.min(dt||0,.1))); time += Math.min(dt||0,.1);celebration=Math.max(0,celebration-(dt||0));customers.forEach(c=>{c.object.position.y=c.baseY+Math.sin(time*2+c.phase)*.025+(celebration>0?Math.abs(Math.sin(celebration*12))*.14:0);}); },
    sell(){celebration=.8;},
    dispose(){disposed=true;scene.remove(root);root.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of [].concat(o.material)){if(m.map)m.map.dispose();m.dispose();}}});}
  };
}
