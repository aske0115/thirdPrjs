// Fully 3D night-shop set dressing; no static background image.
// Floor footprint x:-5..5, z:-4..4; keep the central customer/player aisle open.
export function createShopScenery(THREE, parent) {
  const root=new THREE.Group();root.name='night-shop-scenery';parent.add(root);
  const geo={cube:new THREE.BoxGeometry(1,1,1),sphere:new THREE.SphereGeometry(1,12,8),cylinder:new THREE.CylinderGeometry(1,1,1,10),ring:new THREE.TorusGeometry(1,.10,8,32,Math.PI), crystal:new THREE.OctahedronGeometry(1,0), mountain:new THREE.ConeGeometry(1,1,5), cap:new THREE.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.5)};
  const mat={wood:new THREE.MeshStandardMaterial({color:'#483039',roughness:.82}), woodLight:new THREE.MeshStandardMaterial({color:'#80553e',roughness:.8}),woodDark:new THREE.MeshStandardMaterial({color:'#302936',roughness:.87}), brass:new THREE.MeshStandardMaterial({color:'#bc9050',metalness:.45,roughness:.38}), dark:new THREE.MeshStandardMaterial({color:'#19243d',roughness:.9}), night:new THREE.MeshStandardMaterial({color:'#263c68',roughness:.75,emissive:'#152747',emissiveIntensity:.3}), glow:new THREE.MeshStandardMaterial({color:'#ffe3a4',emissive:'#ffb643',emissiveIntensity:1.35,roughness:.6}), purple:new THREE.MeshStandardMaterial({color:'#ac7bc1',emissive:'#522860',emissiveIntensity:.25}), leaf:new THREE.MeshStandardMaterial({color:'#496b5b',roughness:1}), cream:new THREE.MeshStandardMaterial({color:'#f5d7aa',roughness:.75}), red:new THREE.MeshStandardMaterial({color:'#c16671',roughness:.8}), cyan:new THREE.MeshStandardMaterial({color:'#76c2ba',emissive:'#1e6865',emissiveIntensity:.25}), blue:new THREE.MeshStandardMaterial({color:'#75a4d0',emissive:'#243e75',emissiveIntensity:.3}), amber:new THREE.MeshStandardMaterial({color:'#dfae68',emissive:'#593b18',emissiveIntensity:.2})};
  const lights=[],extraGeometries=[],textures=[];let time=0;
  // Hand-painted, locally generated wood grain runs across real 3D surfaces.
  function woodMap(base,dark,light,seed){
    const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');
    const grad=ctx.createLinearGradient(0,0,0,256);grad.addColorStop(0,light);grad.addColorStop(.48,base);grad.addColorStop(1,dark);ctx.fillStyle=grad;ctx.fillRect(0,0,512,256);
    let n=seed;const rand=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
    for(let i=0;i<1200;i++){const y=rand()*256,amp=.5+rand()*2.8,freq=.006+rand()*.025,phase=rand()*Math.PI*2;ctx.beginPath();ctx.moveTo(0,y);for(let x=8;x<=512;x+=8)ctx.lineTo(x,y+Math.sin(x*freq+phase)*amp);ctx.strokeStyle=i%5?'rgba(240,190,142,.08)':'rgba(23,14,25,.14)';ctx.lineWidth=.4+rand()*1.4;ctx.stroke();}
    for(let i=0;i<9;i++){const x=rand()*512,y=rand()*256;ctx.strokeStyle='rgba(38,21,25,.24)';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(x,y,5+rand()*11,2+rand()*4,rand()*.4,0,Math.PI*2);ctx.stroke();}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1,1);textures.push(t);return t;
  }
  mat.wood.map=woodMap('#694239','#352833','#a67855',17);mat.wood.color.set('#ffffff');
  mat.woodLight.map=woodMap('#9b684b','#674239','#d5a579',73);mat.woodLight.color.set('#ffffff');
  mat.woodDark.map=woodMap('#382d36','#211e30','#5a4146',119);mat.woodDark.color.set('#ffffff');
  function piece(g,m,x,y,z,sx,sy,sz,ry=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.y=ry;o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
  const box=(m,x,y,z,w,h,d,ry=0)=>piece(geo.cube,m,x,y,z,w,h,d,ry);
  const ball=(m,x,y,z,r)=>piece(geo.sphere,m,x,y,z,r,r,r);
  // Wood plank flooring floats above old floor, safely below actor feet.
  for(let z=-3.75;z<3.9;z+=.48){box(Math.round(z*10)%2?mat.wood:mat.woodLight,0,.045,z,9.8,.055,.455);}
  // Deep timber wall lining and vertical frame, behind store fixtures.
  box(mat.woodDark,0,1.95,-3.73,9.8,3.8,.08);
  box(mat.woodDark,-4.72,1.95,0,.08,3.8,7.8);
  for(const x of [-4.55,-3,-1.5,0,1.5,3,4.55])box(mat.woodLight,x,1.9,-3.62,.13,3.75,.16);
  for(const y of [.35,3.6])box(mat.woodLight,0,y,-3.6,9.7,.17,.19);
  for(const z of [-3.5,-1.8,0,1.8,3.5])box(mat.woodLight,-4.63,1.9,z,.15,3.75,.14);
  // Arched moonlit window on left wall: real geometry with a crescent and mullions.
  box(mat.wood,-4.57,2.05,1.15,.13,2.25,2.18);
  box(mat.night,-4.49,2.05,1.15,.07,1.94,1.9);
  for(const z of [.22,1.15,2.08])box(mat.woodLight,-4.42,2.1,z,.10,1.9,.08);
  box(mat.woodLight,-4.4,2.18,1.15,.10,.08,1.9);
  const arch=piece(geo.ring,mat.brass,-4.4,3.02,1.15,1.04,1.04,1.04,Math.PI/2);arch.rotation.z=Math.PI/2;
  const moon=piece(geo.sphere,mat.glow,-4.36,2.6,.7,.035,.16,.16);
  for(const [y,z] of [[2.35,1.65],[2.8,1.45],[2.65,.5],[1.8,1.8]])piece(geo.sphere,mat.cream,-4.35,y,z,.02,.025,.025);
  // Central arched moon window: dimensional inset frame, tiny 3D mountains and stream.
  // Positioned in the clear gap between shelves on the rear wall.
  const wx=0,wz=-2.95;
  box(mat.woodLight,wx,2.15,wz,2.92,2.35,.14);
  box(mat.night,wx,2.08,wz+.085,2.68,2.0,.06);
  // The arch is a half-torus rotated into the wall's XY plane.
  piece(geo.ring,mat.brass,wx,3.14,wz+.12,1.38,1.02,1.0);
  box(mat.brass,-1.4,2.18,wz+.12,.07,1.98,.08);box(mat.brass,1.4,2.18,wz+.12,.07,1.98,.08);
  box(mat.brass,0,1.19,wz+.12,1.82,.08,.1);box(mat.woodLight,0,2.12,wz+.14,.08,1.83,.08);
  box(mat.woodLight,0,1.73,wz+.14,1.7,.07,.08);
  // Small layered low-poly mountains and a waterfall are spatial 3D meshes.
  const mountainBack=piece(geo.mountain,mat.blue,-.92,1.65,wz+.16,.78,.85,.11);
  const mountainFront=piece(geo.mountain,mat.dark,.78,1.55,wz+.18,.7,.7,.1);
  box(mat.cyan,.05,1.5,wz+.24,.22,.57,.04);box(mat.cream,.05,1.26,wz+.27,.34,.045,.03);
  piece(geo.sphere,mat.glow,.98,2.7,wz+.18,.2,.2,.035);
  for(const [x,y] of [[-1.1,2.7],[-.65,2.9],[.35,2.48],[1.23,2.43]])piece(geo.sphere,mat.cream,x,y,wz+.18,.025,.025,.018);
  // Curving overhead vines use actual tubes. Violet blossom clusters frame the shop.
  const vineMaterials=[mat.leaf,mat.purple,mat.glow];
  for(const mirror of [-1,1]){
    const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector3(mirror*(.25+t*4.1),3.55-.28*Math.sin(t*Math.PI*1.5),-3.12+.17*Math.sin(t*7)));}
    const curve=new THREE.CatmullRomCurve3(pts);const vg=new THREE.TubeGeometry(curve,28,.035,5,false);const vine=new THREE.Mesh(vg,mat.leaf);root.add(vine);extraGeometries.push(vg);
    for(let i=1;i<12;i+=2){const p=pts[i];for(let k=0;k<3;k++)piece(geo.sphere,mat.purple,p.x+(k-1)*.07,p.y-.09,p.z,.075,.09,.055);piece(geo.sphere,mat.glow,p.x,p.y-.09,p.z+.05,.026,.026,.026);}
  }
  // Carved crescent sign above the window, kept below the top beam.
  box(mat.wood,0,3.55,-3.05,1.18,.35,.16);
  const signMoon=piece(geo.ring,mat.brass,0,3.55,-2.94,.13,.13,.13);signMoon.rotation.z=-Math.PI*.2;
  // Ceiling beams and copper warmth articulate depth without closing the cutaway view.
  for(const x of [-3.7,-1.25,1.25,3.7])box(mat.wood,x,3.75,-1.7,.16,.2,4.1);
  function lantern(x,z,point=false){
    box(mat.woodDark,x,3.44,z,.045,.5,.045);box(mat.brass,x,3.17,z,.4,.09,.4);box(mat.brass,x,2.72,z,.43,.09,.43);box(mat.glow,x,2.94,z,.25,.4,.25);
    for(const dx of [-.17,.17])for(const dz of [-.17,.17])box(mat.brass,x+dx,2.94,z+dz,.035,.4,.035);
    if(point){const light=new THREE.PointLight('#ffc57b',6,6,2);light.position.set(x,2.85,z);root.add(light);lights.push(light);}
  }
  lantern(-3.7,-1.7,true);lantern(0,-1.8,false);lantern(3.7,-1.7,true);
  // Freestanding fantasy apothecary shelving: three timber tiers, stock visible in silhouette.
  // Behind the walkable aisle; no collision changes or overlay art.
  function shelf(cx) {
    const w=2.75, z=-3.15;
    box(mat.woodDark,cx,1.56,z-.3,w,2.72,.12);
    for(const dx of [-w/2,w/2]){
      box(mat.woodLight,cx+dx,1.55,z,.16,2.9,.74);
      box(mat.brass,cx+dx,2.96,z,.2,.09,.78);
    }
    box(mat.woodLight,cx,2.97,z,w+.25,.18,.78);
    for(const y of [.45,1.18,1.91,2.64]){
      box(mat.woodLight,cx,y,z,w,.13,.76);
      box(mat.brass,cx,y+.045,z+.37,w,.035,.035);
    }
    // Potion bottles have bright liquid, neck and cork; shape/color readable at phone scale.
    const potions=[mat.cyan,mat.red,mat.blue,mat.purple,mat.amber];
    for(let row=0;row<3;row++)for(let col=0;col<5;col++){
      const x=cx-1.0+col*.5,y=.58+row*.73, color=potions[(row*2+col+(cx>0?1:0))%potions.length];
      if((row+col)%4===0){
        piece(geo.cylinder,mat.cream,x,y+.13,z,.10,.25,.10);
        piece(geo.cap,mat.purple,x,y+.27,z,.19,.17,.19);
      } else if((row+col)%4===1){
        piece(geo.crystal,color,x,y+.18,z,.15,.25,.14);
        box(mat.brass,x,y+.025,z,.29,.05,.26);
      } else {
        piece(geo.cylinder,color,x,y+.14,z,.14,.27,.14);
        piece(geo.cylinder,mat.cream,x,y+.31,z,.06,.12,.06);
        piece(geo.cylinder,mat.woodLight,x,y+.39,z,.075,.045,.075);
      }
    }
    // Warm header, a small sign is visible even at a distance.
    box(mat.brass,cx,3.08,z+.2,1.32,.19,.08);
  }
  shelf(-2.65);shelf(2.65);
  // Wooden planters with legible violet blooms beside the shop's corners.
  for(const [x,z] of [[-4.1,2.8],[4.05,2.8]]){
    box(mat.woodLight,x,.35,z,.9,.55,.7);box(mat.woodDark,x,.64,z,.95,.08,.75);
    for(let i=0;i<7;i++){const dx=(i%3-1)*.23,dz=(Math.floor(i/3)-1)*.21;piece(geo.cylinder,mat.leaf,x+dx,.83,z+dz,.035,.4,.035);ball(mat.purple,x+dx,1.06,z+dz,.105);ball(mat.glow,x+dx,1.11,z+dz,.035);}
  }
  // Animated fireflies: only a few draw calls and no rendering overlay.
  const motes=new THREE.InstancedMesh(geo.sphere,mat.glow,16),dummy=new THREE.Object3D();root.add(motes);
  const points=Array.from({length:16},(_,i)=>({x:-4.3+(i*1.41)%8.6,y:1.5+(i*1.19)%1.6,z:-2.8+(i*.97)%5.4,p:i*1.9}));
  return {
    update(dt){time+=Math.min(.1,dt||0);points.forEach((p,i)=>{dummy.position.set(p.x+Math.sin(time*.6+p.p)*.08,p.y+Math.cos(time*.8+p.p)*.09,p.z);dummy.scale.setScalar(.018+.012*(.5+.5*Math.sin(time*1.5+p.p)));dummy.updateMatrix();motes.setMatrixAt(i,dummy.matrix)});motes.instanceMatrix.needsUpdate=true;lights.forEach((l,i)=>l.intensity=5.8+.4*Math.sin(time*2+i));},
    dispose(){parent.remove(root);Object.values(geo).forEach(g=>g.dispose());extraGeometries.forEach(g=>g.dispose());Object.values(mat).forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  };
}
