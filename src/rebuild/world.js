// Original, fully 3D moonlit fantasy environments. No image backdrop.
export function createWorld(THREE, scene, mode) {
  const root=new THREE.Group();root.name=`rebuild-${mode}`;scene.add(root);
  const geos=[],mats=[],lamps=[],animated=[];let t=0;
  function geo(g){geos.push(g);return g;}
  const G={box:geo(new THREE.BoxGeometry(1,1,1)),sphere:geo(new THREE.SphereGeometry(1,16,12)),cylinder:geo(new THREE.CylinderGeometry(1,1,1,12)),cone:geo(new THREE.ConeGeometry(1,1,12)),crystal:geo(new THREE.OctahedronGeometry(1,0)),arch:geo(new THREE.TorusGeometry(1,.10,10,36,Math.PI))};
  function material(color,extra={}){const m=new THREE.MeshStandardMaterial({color,roughness:.82,...extra});mats.push(m);return m;}
  const M={wood:material('#392a31'),woodMid:material('#664739'),woodLight:material('#946848'),gold:material('#c59a54',{metalness:.48,roughness:.36}),dark:material('#141c35'),blue:material('#233c65',{emissive:'#0c183d',emissiveIntensity:.4}),light:material('#ffda92',{emissive:'#ffac43',emissiveIntensity:1.25}),stone:material('#50576b'),stoneLight:material('#737c89'),grass:material('#263e3b'),moss:material('#355747'),soil:material('#675d67'),purple:material('#a76ab5',{emissive:'#512565',emissiveIntensity:.32}),violet:material('#684c99'),cream:material('#efdabd'),red:material('#b86470'),cyan:material('#70baba',{emissive:'#205e70',emissiveIntensity:.25}),leaf:material('#315648'),water:material('#386e84',{transparent:true,opacity:.88,metalness:.18,roughness:.3})};
  function part(g,m,x,y,z,sx,sy,sz,ry=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.y=ry;o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
  const box=(m,x,y,z,w,h,d,r=0)=>part(G.box,m,x,y,z,w,h,d,r);
  const sphere=(m,x,y,z,r)=>part(G.sphere,m,x,y,z,r,r,r);
  function arch(x,y,z,r){const m=part(G.arch,M.gold,x,y,z,r,r,r);return m;}
  function lantern(x,y,z,lit){box(M.wood,x,y+.32,z,.045,.65,.045);box(M.gold,x,y,z,.44,.08,.44);box(M.gold,x,y-.5,z,.46,.08,.46);box(M.light,x,y-.25,z,.25,.42,.25);for(const a of [-.17,.17])for(const b of [-.17,.17])box(M.gold,x+a,y-.25,z+b,.035,.43,.035);if(lit){const l=new THREE.PointLight('#ffc575',9,7,2);l.position.set(x,y-.25,z);root.add(l);lamps.push(l);}}
  function flowers(x,z,n=5){for(let i=0;i<n;i++){const a=i*2.4,r=.1+i*.075,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,h=.35+(i%3)*.09;part(G.cylinder,M.leaf,xx,h/2,zz,.025,h,.025);for(let j=0;j<4;j++){const a=j*Math.PI/2;sphere(M.purple,xx+Math.cos(a)*.085,h,zz+Math.sin(a)*.085,.09)}sphere(M.light,xx,h+.03,zz,.035)}}
  function fungus(x,z,h){part(G.cylinder,M.cream,x,h*.38,z,.13*h,.76*h,.13*h);part(G.sphere,M.purple,x,h*.85,z,.55*h,.25*h,.55*h);for(const [dx,dz] of [[-.2,0],[.22,.1],[0,-.25]])sphere(M.cream,x+dx*h,h*1.04,z+dz*h,.05*h);}
  function bottle(x,y,z,m){part(G.cylinder,m,x,y+.16,z,.15,.32,.15);part(G.cylinder,M.cream,x,y+.36,z,.07,.13,.07);part(G.cylinder,M.woodLight,x,y+.45,z,.08,.06,.08);}
  function shelf(cx){box(M.wood,cx,1.75,-4.33,3.25,3.2,.27);for(const x of [cx-1.64,cx+1.64])box(M.woodLight,x,1.75,-4.03,.16,3.36,.8);for(const y of [.42,1.2,1.98,2.76,3.39]){box(M.woodLight,cx,y,-3.99,3.4,.14,.85);box(M.gold,cx,y+.07,-3.55,3.4,.035,.035)}for(let row=0;row<3;row++)for(let c=0;c<5;c++){const x=cx-1.22+c*.61,y=.5+row*.78;const kind=(row+c)%3;if(kind===0)bottle(x,y,-3.9,[M.red,M.cyan,M.purple,M.blue][(row+c)%4]);else if(kind===1){part(G.cylinder,M.cream,x,y+.14,-3.9,.11,.28,.11);part(G.sphere,M.purple,x,y+.32,-3.9,.19,.1,.19)}else{part(G.crystal,M.cyan,x,y+.2,-3.9,.16,.26,.16);box(M.gold,x,y+.04,-3.9,.3,.08,.3)}}}
  function shop(){
    scene.background=new THREE.Color('#121830');scene.fog=new THREE.Fog('#121830',20,50);
    // A room extends past the camera rather than a miniature tabletop floating in space.
    box(M.wood,0,-.25,0,30,.45,34);
    for(let z=-9;z<=14;z+=.55)box(Math.round(z*10)%2?M.woodMid:M.woodLight,0,.006,z,22,.05,.52);
    box(M.wood,0,2.5,-4.65,16,5,.2);box(M.wood,-5.4,2.5,1,.2,5,12);
    for(const x of [-5,-3.5,-2,0,2,3.5,5])box(M.woodLight,x,2.4,-4.48,.13,4.8,.18);
    for(const y of [.3,4.45])box(M.woodLight,0,y,-4.4,12,.2,.23);
    for(const x of [-4,-1.5,1.5,4])box(M.woodMid,x,4.48,-1.6,.2,.25,6);
    // Central dimensional moon window, with layers rather than a painted image.
    box(M.gold,0,2.64,-4.34,2.25,3.2,.18);box(M.blue,0,2.64,-4.21,2.02,2.98,.12);arch(0,4.16,-4.1,1.09);
    for(const x of [-1.08,1.08])box(M.gold,x,2.68,-4.1,.09,3.05,.12);
    box(M.gold,0,1.1,-4.08,2.2,.11,.12);box(M.woodLight,0,2.38,-4.05,2,.07,.08);box(M.woodLight,0,2.67,-4.04,.07,2.8,.08);
    part(G.cone,M.stone,-.56,1.72,-4.03,.56,1.1,.13);part(G.cone,M.dark,.45,1.65,-4.01,.56,1,.12);box(M.cyan,.19,1.52,-3.92,.19,.7,.04);sphere(M.light,.48,3.49,-4,.19);
    shelf(-2.9);shelf(2.9);
    // Framed counter and presentation table, with an open center aisle.
    box(M.wood,-3, .55,-.35,2.7,1.1,1.1);box(M.woodLight,-3,1.14,-.35,2.85,.15,1.25);for(const x of [-4.1,-3.5,-2.9,-2.3,-1.8])box(M.gold,x,.56,.23,.035,.9,.035);
    box(M.wood,2.8,.46,.3,2.45,.92,1.15);box(M.woodLight,2.8,.96,.3,2.65,.14,1.32);
    for(let i=0;i<4;i++)bottle(1.95+i*.53,1.03,.25,[M.red,M.cyan,M.purple,M.cream][i]);
    lantern(-4,4.1,-1.55,true);lantern(0,4.15,-2.1,false);lantern(4,4.1,-1.55,true);
    // Hanging flower garlands, built as actual curved 3D tubes and buds.
    for(const sign of [-1,1]){const points=[];for(let i=0;i<=12;i++){const q=i/12;points.push(new THREE.Vector3(sign*(.3+q*5),4.1-.38*Math.sin(q*Math.PI),-3.5+.18*Math.sin(q*7)))}const curve=new THREE.CatmullRomCurve3(points);const tube=geo(new THREE.TubeGeometry(curve,30,.04,6,false));part(tube,M.leaf,0,0,0,1,1,1);for(let i=1;i<12;i+=2){const p=points[i];sphere(M.purple,p.x,p.y-.1,p.z,.1);sphere(M.light,p.x,p.y-.1,p.z+.07,.035)}}
    box(M.woodMid,0,4.37,-3.85,1.2,.34,.2);arch(0,4.36,-3.7,.13);
    flowers(-4.6,3.3);flowers(4.6,3.3);fungus(-4.4,2.6,.65);fungus(4.4,2.6,.75);
    const hemi=new THREE.HemisphereLight('#a7b7df','#493136',.9);root.add(hemi);const moon=new THREE.DirectionalLight('#a9baff',1.05);moon.position.set(0,8,4);root.add(moon);
  }
  function forest(){
    scene.background=new THREE.Color('#111e35');scene.fog=new THREE.Fog('#19263a',32,65);
    box(M.grass,0,-.26,0,80,.5,100);
    // Organic path ribbon from entrance to greenhouse through stream crossing.
    const shape=new THREE.Shape(),pts=[];for(let z=-32;z<=32;z+=1){const c=Math.sin(z*.12)*.8;pts.push({z,c});}pts.forEach((p,i)=>i?shape.lineTo(p.c-2.5,p.z):shape.moveTo(p.c-2.5,p.z));[...pts].reverse().forEach(p=>shape.lineTo(p.c+2.5,p.z));shape.closePath();const trail=new THREE.Mesh(geo(new THREE.ShapeGeometry(shape)),M.soil);trail.rotation.x=-Math.PI/2;trail.position.y=.005;root.add(trail);
    // Stream z axis crossing; stone banks and a wooden arched bridge.
    box(M.water,0,-.04,0,70,.12,5.6);for(let x=-25;x<=25;x+=1.7)for(const z of [-3.05,3.05]){const o=part(G.sphere,M.stone,x,.1,z,.85,.28,.48);o.rotation.y=x*.3;}
    box(M.wood,0,.16,0,5.2,.22,7.1);for(let z=-3.3;z<3.5;z+=.45)box(M.woodLight,0,.3,z,5,.1,.4);for(const x of [-2.62,2.62]){box(M.woodMid,x,.76,0,.12,.12,7);for(const z of [-3,-1.5,0,1.5,3])box(M.wood,x,.48,z,.14,.8,.14)}
    // Distant greenhouse gate: stone columns, curved arch and warm glass panes.
    for(const x of [-4.4,4.4]){box(M.stone,x,2.3,-23,1.1,4.6,1.1);box(M.stoneLight,x,4.65,-23,1.3,.25,1.3)}
    const gateway=part(G.arch,M.stoneLight,0,4.55,-23,4.4,3.2,2.5);box(M.gold,0,3.05,-23.1,7.8,.09,.1);
    for(const x of [-3,-1.5,0,1.5,3])box(M.gold,x,2.5,-23,.07,3.8,.08);
    // Near-camera trees and flowers frame the path without filling its center.
    for(let z=-28;z<=28;z+=4.3)for(const side of [-1,1]){
      const x=side*(5.8+(Math.sin(z*2+side)+1)*.7),h=4.7+(Math.sin(z*1.2)+1)*.6;
      part(G.cylinder,M.woodMid,x,h*.31,z,.36,h*.62,.36);part(G.sphere,M.leaf,x,h*.75,z,1.55,1.5,1.55);
      fungus(side*3.8,z+1,.55+(Math.sin(z)+1)*.22);flowers(side*4.2,z-1,3);
    }
    for(const [x,z] of [[-3.6,19],[3.6,15],[-3.8,8],[3.8,-8],[-3.7,-16],[3.8,-21]])lantern(x,2.25,z,false);
    for(const x of [-3.5,3.5]){const l=new THREE.PointLight('#ffc27e',11,8,2);l.position.set(x,1.8,18);root.add(l);lamps.push(l);}
    const hemi=new THREE.HemisphereLight('#a5b6ed','#22352f',.95);root.add(hemi);const moon=new THREE.DirectionalLight('#9eb5f1',1.1);moon.position.set(-8,18,10);moon.castShadow=true;root.add(moon);
  }
  if(mode==='shop')shop();else forest();
  const motes=new THREE.InstancedMesh(G.sphere,M.light,40),dummy=new THREE.Object3D();root.add(motes);const positions=Array.from({length:40},(_,i)=>({x:mode==='shop'?-4+(i*1.67)%8:-7+(i*2.37)%14,z:mode==='shop'?-3+(i*.91)%8:-25+(i*3.73)%50,y:.7+(i*.67)%3,p:i*1.7}));
  return {update(dt){t+=Math.min(.1,dt||0);positions.forEach((p,i)=>{dummy.position.set(p.x+Math.sin(t*.5+p.p)*.1,p.y+Math.cos(t*.7+p.p)*.12,p.z);dummy.scale.setScalar(.025+.012*Math.sin(t*1.6+p.p));dummy.updateMatrix();motes.setMatrixAt(i,dummy.matrix)});motes.instanceMatrix.needsUpdate=true;lamps.forEach((l,i)=>l.intensity=8.7+.3*Math.sin(t*1.8+i));},walkable(x,z){if(mode==='shop')return Math.abs(x)<5&&z>-3.4&&z<5;return Math.abs(x)<17&&Math.abs(z)<29&&!(Math.abs(z)<2.7&&Math.abs(x)>2.4);},dispose(){scene.remove(root);geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());}};
}
