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
  return hat;
}
