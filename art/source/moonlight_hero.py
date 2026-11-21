import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(n,c,metal=0):
 m=bpy.data.materials.new(n);m.diffuse_color=(*c,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Roughness'].default_value=.43;p.inputs['Metallic'].default_value=metal;return m
skin=mat('peach porcelain',(.95,.63,.46));hair=mat('chestnut',(.12,.045,.037));cream=mat('ivory linen',(.89,.79,.61));plum=mat('wine velvet',(.28,.035,.09));gold=mat('antique gold',(.74,.43,.12),.65);brown=mat('leather',(.13,.065,.042));white=mat('eye white',(1,.94,.85));iris=mat('amber iris',(.27,.09,.025));black=mat('lashes',(.025,.009,.012))
def uv(n,loc,scale,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=loc);o=bpy.context.object;o.name=n;o.scale=scale;o.data.materials.append(m);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for p in o.data.polygons:p.use_smooth=True
 return o
def curve(n,pts,r,m):
 c=bpy.data.curves.new(n,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3;s=c.splines.new('BEZIER');s.bezier_points.add(len(pts)-1)
 for b,p in zip(s.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
 o=bpy.data.objects.new(n,c);bpy.context.collection.objects.link(o);o.data.materials.append(m);return o
# Tailored silhouette, sculpted face planes, layered locks and sewn costume details.
uv('bodice',(0,0,1.14),(.27,.18,.34),plum)
uv('skirt',(0,0,.85),(.36,.25,.22),brown)
uv('apron bib',(0,-.177,1.17),(.205,.04,.25),cream)
uv('apron skirt',(0,-.19,.89),(.28,.065,.23),cream)
for s in [-1,1]:
 uv('stocking',(s*.145,0,.5),(.1,.1,.29),cream);uv('boot',(s*.15,-.035,.23),(.12,.16,.19),brown)
 for z in [.24,.31,.38]:curve('boot laces',[(s*.15-.05,-.17,z),(s*.15+.05,-.17,z+.025)],.008,gold)
 uv('puff sleeve',(s*.3,0,1.31),(.15,.15,.17),cream)
 uv('forearm',(s*.36,-.02,1.08),(.085,.09,.19),skin);uv('glove',(s*.36,-.055,.94),(.095,.1,.11),brown)
uv('neck',(0,0,1.48),(.09,.09,.14),skin)
uv('hair mass',(0,.025,1.84),(.365,.29,.40),hair)
uv('face',(0,-.095,1.80),(.315,.255,.325),skin)
uv('chin',(0,-.145,1.63),(.20,.18,.14),skin)
uv('nose',(0,-.344,1.76),(.035,.045,.04),skin)
for s in [-1,1]:
 uv('eye white',(s*.124,-.315,1.83),(.084,.035,.105),white);uv('iris',(s*.124,-.345,1.825),(.058,.022,.081),iris);uv('pupil',(s*.124,-.363,1.825),(.03,.012,.055),black);uv('catchlight',(s*.11,-.375,1.86),(.019,.008,.025),white)
 curve('upper eyelash',[(s*.21,-.326,1.85),(s*.15,-.359,1.92),(s*.06,-.327,1.88)],.014,black)
 uv('side bun',(s*.335,.025,1.71),(.15,.16,.18),hair)
 for j in range(5):curve('bun lock',[(s*.34,.03,1.87),(s*(.45-j*.018),-.07,1.76),(s*.32,-.10,1.58)],.018,hair)
for i in range(9):
 x=(i-4)*.069;curve('swept fringe',[(x,.0,2.12),(x*1.12,-.24,2.04),(x+.045,-.31,1.92+abs(x)*.3)],.045,hair)
curve('smile',[(-.055,-.322,1.66),(0,-.338,1.64),(.055,-.322,1.66)],.009,plum)
uv('bonnet brim',(0,.02,2.12),(.43,.34,.055),cream);uv('bonnet crown',(0,.045,2.21),(.36,.29,.15),cream)
curve('bonnet piping',[(-.34,-.09,2.17),(-.20,-.25,2.17),(0,-.28,2.17),(.25,-.19,2.17),(.35,0,2.17)],.014,gold)
pts=[(.12+.065*math.cos(a),-.264,2.24+.065*math.sin(a)) for a in [i*math.pi*1.65/20+.5 for i in range(21)]];curve('crescent badge',pts,.014,gold)
for x in [-.12,0,.12]:uv('brass buttons',(x,-.23,1.13),(.022,.018,.022),gold)
# cape with flowing shaped fabric mesh
verts=[]
for j in range(7):
 for i in range(13):
  u=(i/12-.5)*2;v=j/6;verts.append((u*(.24+.18*v),.12+.16*v+.035*math.cos(u*9),1.44-.75*v+.045*math.cos(u*5)*v))
faces=[]
for j in range(6):
 for i in range(12):a=j*13+i;faces.append((a,a+1,a+14,a+13))
me=bpy.data.meshes.new('cape cloth');me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new('tailored cape',me);bpy.context.collection.objects.link(o);o.data.materials.append(plum);sub=o.modifiers.new('smooth cloth','SUBSURF');sub.levels=2;sol=o.modifiers.new('cloth thickness','SOLIDIFY');sol.thickness=.015
for p in me.polygons:p.use_smooth=True
curve('cape gold hem',[verts[78+i] for i in range(13)],.012,gold)
root='/workspace/thirdPrjs';bpy.ops.wm.save_as_mainfile(filepath=root+'/art/source/moonlight_hero.blend');bpy.ops.export_scene.gltf(filepath=root+'/public/assets/custom/moonlight-hero.glb',export_format='GLB')
bpy.ops.object.camera_add(location=(3,-6,3));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.2))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.9;bpy.context.scene.camera=cam
sc=bpy.context.scene;sc.render.engine='BLENDER_WORKBENCH';sc.display.shading.light='STUDIO';sc.display.shading.color_type='MATERIAL';sc.display.shading.show_shadows=True;sc.display.shading.show_cavity=True;sc.display.shading.cavity_type='BOTH';sc.render.resolution_x=720;sc.render.resolution_y=900;sc.render.resolution_percentage=100;sc.render.filepath=root+'/art/renders/hero-01.png';bpy.ops.render.render(write_still=True)
