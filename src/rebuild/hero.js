// Original articulated Moonlight heroine. Every visible part is live geometry.
export function createHero(T){
 const group=new T.Group(),m={};
 for(const [k,c] of Object.entries({skin:'#ffd6bc',hair:'#493039',cream:'#f5e5cd',plum:'#783851',gold:'#e6b967',boot:'#45313b',eye:'#56303b',white:'#fff8e9'}))m[k]=new T.MeshStandardMaterial({color:c,roughness:.65});
 const sphere=(p,k,x,y,z,a,b=a,c=a)=>{const o=new T.Mesh(new T.SphereGeometry(1,24,16),m[k]);o.position.set(x,y,z);o.scale.set(a,b,c);o.castShadow=true;p.add(o);return o};
 const body=new T.Group();group.add(body);
 sphere(body,'plum',0,.85,0,.28,.36,.18);sphere(body,'cream',0,.79,.14,.23,.29,.07);
 const head=new T.Group();head.position.y=1.43;body.add(head);
 sphere(head,'hair',0,.08,-.035,.38,.39,.32);sphere(head,'skin',0,.015,.095,.33,.31,.265);
 for(const s of [-1,1]){sphere(head,'hair',s*.32,-.07,-.07,.17,.2,.16);sphere(head,'eye',s*.12,.025,.337,.061,.083,.023);sphere(head,'white',s*.12-.014,.057,.358,.021,.026,.009);sphere(head,'skin',s*.22,-.1,.294,.055,.025,.012);}
 for(let i=0;i<7;i++){const x=(i-3)*.092;const bang=sphere(head,'hair',x,.225-Math.abs(x)*.18,.255,.086,.15,.075);bang.rotation.z=x*1.8;}
 sphere(head,'eye',0,-.13,.355,.035,.017,.008);
 const hat=new T.Group();hat.position.set(0,.34,-.035);hat.rotation.z=-.14;head.add(hat);sphere(hat,'cream',0,0,0,.42,.065,.35);sphere(hat,'cream',0,.09,-.02,.36,.16,.30);
 const moon=new T.Mesh(new T.TorusGeometry(.09,.018,10,30,Math.PI*1.6),m.gold);moon.position.set(.12,.09,.285);moon.rotation.z=-.6;hat.add(moon);
 const legs=[],arms=[];
 for(const s of [-1,1]){const leg=new T.Group();leg.position.set(s*.13,.61,0);body.add(leg);sphere(leg,'cream',0,-.17,0,.09,.22,.09);sphere(leg,'boot',0,-.36,.04,.105,.16,.14);legs.push(leg);const arm=new T.Group();arm.position.set(s*.28,1.02,0);body.add(arm);sphere(arm,'cream',s*.035,-.12,0,.11,.18,.105);sphere(arm,'boot',s*.04,-.28,.03,.085,.10,.09);arms.push(arm);}
 const cape=new T.Mesh(new T.ConeGeometry(.42,.7,36,1,true,0,Math.PI),m.plum);cape.position.set(0,.84,-.12);cape.rotation.y=Math.PI/2;body.add(cape);
 const sword=new T.Group();sword.position.set(.04,-.29,.06);arms[1].add(sword);const blade=new T.Mesh(new T.CylinderGeometry(.018,.055,.65,4),new T.MeshStandardMaterial({color:'#e8efff',metalness:.65,roughness:.25}));blade.position.set(0,0,.36);blade.rotation.x=Math.PI/2;sword.add(blade);sphere(sword,'gold',0,0,.06,.15,.025,.035);
 let time=0;return {group,update(dt,moving,attack=0){time+=dt;const swing=moving?Math.sin(time*11)*.65:0;legs[0].rotation.x=swing;legs[1].rotation.x=-swing;arms[0].rotation.x=-swing*.65;arms[1].rotation.x=swing*.65-attack*1.8;arms[1].rotation.z=-attack*.8;body.position.y=moving?Math.abs(Math.sin(time*11))*.045:Math.sin(time*2)*.012;cape.rotation.z=Math.sin(time*5)*.045;}};
}
