// Lightweight 3D signature accessory so the moving adventurer belongs to the
// moonlit shop world; it is attached to the live model, never a screen sprite.
export function addMoonBonnet(THREE, model, height) {
  const h=height||2;
  const cream=new THREE.MeshStandardMaterial({color:'#f3e2c8',roughness:.72});
  const plum=new THREE.MeshStandardMaterial({color:'#51304e',roughness:.76});
  const gold=new THREE.MeshStandardMaterial({color:'#f3c96d',metalness:.35,roughness:.35,emissive:'#62421a',emissiveIntensity:.12});
  const hair=new THREE.MeshStandardMaterial({color:'#52392f',roughness:.9});
  const hat=new THREE.Group();hat.name='moon-bonnet';hat.position.y=h*.87;model.add(hat);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(h*.18,h*.22,h*.045,24),cream);brim.scale.z=1.13;brim.position.y=h*.035;hat.add(brim);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(h*.17,20,12,0,Math.PI*2,0,Math.PI*.54),cream);crown.scale.set(1.05,.88,1.05);crown.position.y=h*.105;hat.add(crown);
  const band=new THREE.Mesh(new THREE.TorusGeometry(h*.171,h*.014,7,24),plum);band.rotation.x=Math.PI/2;band.position.y=h*.065;hat.add(band);
  for(const side of [-1,1]){const bun=new THREE.Mesh(new THREE.SphereGeometry(h*.085,12,9),hair);bun.position.set(side*h*.17,h*.005,-h*.035);bun.scale.set(1,.9,1);hat.add(bun);}
  // A gold moon medallion on both sides keeps the silhouette readable as the
  // character turns during real 3D movement and combat.
  for(const facing of [-1,1]){const badge=new THREE.Mesh(new THREE.TorusGeometry(h*.057,h*.014,8,20,Math.PI*1.6),gold);badge.position.set(h*.075,h*.12,facing*h*.145);badge.rotation.y=facing===1?0:Math.PI;badge.rotation.z=-.45;hat.add(badge);}

  // Repaint the shared adventurer into the Moonlight palette. The original
  // atlas remains intact; these are material tints on the animated 3D model.
  const palette={Green:'#76509a',LightGreen:'#f0dfcc',White:'#f5e8d8',Gold:'#e9bd68',Hair_Brown:'#563a43',Brown2:'#77523f',Brown_02:'#76513d',Brown:'#875c43',Skin:'#f2c5a7'};
  model.traverse(o=>{if(!o.isMesh)return;for(const m of [].concat(o.material||[])){if(palette[m.name])m.color.set(palette[m.name]);}});

  // A layered moon-plum cape and small adventurer satchel give the heroine a
  // readable silhouette from behind while following the real skeleton.
  const capeMat=new THREE.MeshStandardMaterial({color:'#51335f',roughness:.76,side:THREE.DoubleSide});
  const liningMat=new THREE.MeshStandardMaterial({color:'#d2a75f',metalness:.24,roughness:.46,side:THREE.DoubleSide});
  const torso=model.getObjectByName('Torso')||model.getObjectByName('Chest')||model;
  const cape=new THREE.Group();cape.name='moon-cape';cape.position.set(0,h*.04,-h*.04);torso.add(cape);
  const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',new THREE.Float32BufferAttribute([
    -.16,0,-.02, .16,0,-.02,
    -.24,-h*.22,-.12, .24,-h*.22,-.12,
    -.31,-h*.49,-.18, .31,-h*.49,-.18,
    -.34,-h*.55,-.10, .34,-h*.55,-.10
  ],3));cloth.setIndex([0,2,1,1,2,3,2,4,3,3,4,5,4,6,5,5,6,7]);cloth.computeVertexNormals();
  const fabric=new THREE.Mesh(cloth,capeMat);fabric.name='cape-cloth';fabric.castShadow=true;cape.add(fabric);
  const hemPoints=[new THREE.Vector3(-.34,-h*.55,-h*.05),new THREE.Vector3(-.22,-h*.57,-h*.12),new THREE.Vector3(0,-h*.56,-h*.14),new THREE.Vector3(.22,-h*.57,-h*.12),new THREE.Vector3(.34,-h*.55,-h*.05)];
  const hemGeo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hemPoints),20,h*.009,6,false);const hem=new THREE.Mesh(hemGeo,liningMat);hem.name='cape-gold-hem';cape.add(hem);
  const sigil=new THREE.Mesh(new THREE.TorusGeometry(h*.075,h*.014,8,24,Math.PI*1.55),liningMat);sigil.position.set(0,-h*.2,-h*.08);sigil.rotation.z=-.55;cape.add(sigil);
  const bag=new THREE.Group();bag.name='moon-satchel';bag.position.set(-h*.16,h*.02,-h*.13);torso.add(bag);
  const bagBody=new THREE.Mesh(new THREE.BoxGeometry(h*.19,h*.22,h*.1),new THREE.MeshStandardMaterial({color:'#6f493d',roughness:.86}));bagBody.position.y=-h*.08;bagBody.castShadow=true;bag.add(bagBody);
  const clasp=new THREE.Mesh(new THREE.SphereGeometry(h*.025,10,8),liningMat);clasp.position.set(0,-h*.06,h*.055);bag.add(clasp);
  model.userData.moonCape=cape;
  return hat;
}

export function updateMoonCostume(model,time){
  const cape=model?.userData?.moonCape;
  if(cape)cape.rotation.z=Math.sin(time*3.4)*.035;
}
