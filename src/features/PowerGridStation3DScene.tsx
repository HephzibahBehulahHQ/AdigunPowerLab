import { useEffect, useRef, useState } from "react";
import type { Locale } from "../i18n";

type AssetId =
  | "reservoir"
  | "turbine"
  | "generator"
  | "unit-transformer"
  | "switchyard"
  | "tower"
  | "receiving-transformer"
  | "house"
  | "industry";

type Asset = {
  id: AssetId;
  label: Record<Locale, string>;
  role: Record<Locale, string>;
  terminals: Record<Locale, string>;
};

const assets: Asset[] = [
  {
    id: "reservoir",
    label: { en: "Dam, reservoir & intake", de: "Damm, Reservoir & Einlauf", yo: "Damu, ibi omi àti ẹnu omi", pcm: "Dam, reservoir and intake" },
    role: { en: "Elevated water passes through an intake and penstock to drive a hydraulic runner. The reservoir and powerhouse are shown as separate physical and electrical parts.", de: "Höher gelegenes Wasser strömt durch Einlauf und Druckrohr zur Turbine. Reservoir und Krafthaus sind getrennte hydraulische und elektrische Bereiche.", yo: "Omi tó ga ń gba ẹnu omi àti paipu omi láti yí turbine. A ya ibi omi sọ́tọ̀ kúrò ní yàrá iná.", pcm: "Water from the reservoir passes through the intake and penstock to turn the turbine. Waterway and electrical plant are separate systems." },
    terminals: { en: "Hydraulic route: reservoir → trash rack → intake gate → penstock. No electrical terminals.", de: "Wasserweg: Reservoir → Rechen → Einlaufschütz → Druckrohr. Keine elektrischen Klemmen.", yo: "Ọ̀nà omi: ibi omi → àlẹ̀ omi → ẹnu omi → paipu omi. Kò sí terminal iná.", pcm: "Water path: reservoir → trash rack → intake gate → penstock. No electrical terminals." },
  },
  {
    id: "turbine",
    label: { en: "Francis turbine & draft tube", de: "Francis-Turbine & Saugrohr", yo: "Francis turbine àti draft tube", pcm: "Francis turbine and draft tube" },
    role: { en: "The runner extracts energy from pressurised water and turns the shaft. The draft tube carries discharge water away; this teaching geometry is not a turbine design.", de: "Das Laufrad entnimmt Druckwasser Energie und treibt die Welle. Das Saugrohr führt Wasser ab; die Geometrie ist keine Turbinenauslegung.", yo: "Runner gba agbára láti inú omi tó ní titẹ, ó sì ń yí shaft. Draft tube ń gbé omi jáde; àwòrán yìí kì í ṣe ìṣètò turbine gidi.", pcm: "The runner takes energy from pressurised water and turns the shaft. The draft tube returns water; this is an educational shape, not a turbine design." },
    terminals: { en: "Hydraulic inlet and draft-tube outlet; mechanical shaft coupling to the generator. No electrical terminals at the runner.", de: "Hydraulischer Einlass und Saugrohrauslass; mechanische Wellenkupplung zum Generator. Keine elektrischen Klemmen am Laufrad.", yo: "Ẹnu omi àti ẹnu draft tube; shaft so turbine mọ generator. Kò sí terminal iná lórí runner.", pcm: "Water inlet and draft-tube outlet; the shaft couples to the generator. The runner has no electrical terminals." },
  },
  {
    id: "generator",
    label: { en: "Synchronous generator", de: "Synchrongenerator", yo: "Synchronous generator", pcm: "Synchronous generator" },
    role: { en: "The turbine shaft drives a rotor inside the stator to produce three-phase AC. The scene does not simulate electromagnetic behaviour or generator output.", de: "Die Turbinenwelle treibt den Rotor im Stator an und erzeugt Drehstrom. Elektromagnetik und Generatorleistung werden hier nicht simuliert.", yo: "Shaft turbine ń yí rotor inú stator láti ṣe AC aláfàsẹ́ mẹ́ta. A kò ṣe àfarawé output generator nínú scene yìí.", pcm: "The turbine shaft turns a rotor inside the stator to produce three-phase AC. This scene does not calculate machine output." },
    terminals: { en: "Illustrative terminal identity: U/V/W phase leads, N neutral where provided by the winding, and PE protective bonding. Actual winding connection and neutral grounding are design-specific.", de: "Beispielhafte Klemmen: U/V/W, N sofern aus der Wicklung geführt, und PE. Wicklungsschaltung und Sternpunkterdung sind anlagenspezifisch.", yo: "Àpẹẹrẹ terminal: U/V/W, N bí winding bá mú un jáde, àti PE. Ọ̀nà winding àti ìsopọ ilẹ̀ dá lórí design.", pcm: "Illustrative terminals: U/V/W, N where brought out, and PE. Winding connection and neutral grounding depend on the design." },
  },
  {
    id: "unit-transformer",
    label: { en: "Generator step-up transformer", de: "Maschinentransformator", yo: "Generator step-up transformer", pcm: "Generator step-up transformer" },
    role: { en: "The generator transformer raises voltage to reduce current for a given transmitted power. Winding ratio, vector group, rating and losses are not calculated by this scene.", de: "Der Maschinentransformator erhöht die Spannung und senkt bei gleicher Leistung den Strom. Übersetzung, Schaltgruppe, Leistung und Verluste werden nicht berechnet.", yo: "Transformer generator ń gbé voltage sókè, ó dín current kù fún agbára kan náà. A kò ṣe ratio, vector group tàbí losses nínú scene.", pcm: "The generator transformer raises voltage and reduces current for the same power. Ratio, vector group, rating and losses are not calculated here." },
    terminals: { en: "Generator-side LV bushings and grid-side HV bushings; phase and neutral arrangement depends on the approved transformer nameplate and drawings.", de: "NS-Durchführungen zur Generatorseite und HS-Durchführungen zum Netz; Phasen- und Neutralleiteranordnung laut Typenschild und Plan.", yo: "LV bushing wà sí generator; HV bushing sí grid. Àwọn phase àti neutral gbọ́dọ̀ tẹ̀lé nameplate àti drawing.", pcm: "LV bushings face the generator; HV bushings face the grid. Use the approved nameplate and drawings for terminals." },
  },
  {
    id: "switchyard",
    label: { en: "Switchyard: breaker, CT/VT & bus", de: "Schaltanlage: Leistungsschalter, Strom-/Spannungswandler & Sammelschiene", yo: "Switchyard: breaker, CT/VT àti busbar", pcm: "Switchyard: breaker, CT/VT and busbar" },
    role: { en: "The yard arranges switching, measurement and protection interfaces around the grid connection. The model shows physical positions only; it does not operate protection.", de: "Die Anlage ordnet Schalten, Messung und Schutz an der Netzkupplung. Gezeigt sind Positionen; Schutzfunktionen werden nicht simuliert.", yo: "Yard ń ṣètò switching, measurement àti protection ní grid connection. Scene fi ibi ẹrọ hàn, kò ṣiṣẹ́ protection.", pcm: "The yard places switching, measurement and protection equipment at the grid connection. Protection operation is not simulated." },
    terminals: { en: "Three phase bus and line connections; CT/VT secondary circuits and protective earth omitted from this overview. Isolator and breaker duties are distinct.", de: "Drei Phasen an Sammelschiene und Leitung; CT/VT-Sekundärkreise und PE fehlen in dieser Übersicht. Trennschalter und Leistungsschalter haben unterschiedliche Aufgaben.", yo: "Phase mẹ́ta so bus mọ́ line; a kò fi CT/VT secondary àti PE hàn. Isolator àti breaker kì í ṣe iṣẹ́ kan náà.", pcm: "Three-phase bus and line connections; CT/VT secondary and PE are omitted here. Isolators and breakers have different duties." },
  },
  {
    id: "tower",
    label: { en: "Transmission tower & conductors", de: "Freileitungsmast & Leiterseile", yo: "Transmission tower àti conductors", pcm: "Transmission tower and conductors" },
    role: { en: "The lattice structure supports insulated phase conductors and a shield wire. The route is conceptual and not to scale; no conductor sag, clearance or line impedance is calculated.", de: "Der Gittermast trägt isolierte Phasenleiter und ein Erdseil. Die Strecke ist schematisch und nicht maßstäblich; Durchhang, Abstände und Leitungsimpedanz werden nicht berechnet.", yo: "Tower ń gbé phase conductors àti earth wire. Ọ̀nà náà jẹ́ àpẹẹrẹ; a kò ṣe sag, clearance tàbí line impedance.", pcm: "The lattice tower supports insulated phases and a shield wire. Route is conceptual; sag, clearances and line impedance are not calculated." },
    terminals: { en: "L1/L2/L3 are brown/black/grey; N is blue where a neutral is part of the circuit; protective earth/shield is green-yellow. Transmission circuits are often 3-wire and do not carry distribution neutral.", de: "L1/L2/L3: braun/schwarz/grau; N blau, sofern vorhanden; Schutz-/Erdseil grün-gelb. Übertragungskreise sind oft dreipolig ohne Verteilungsneutralleiter.", yo: "L1/L2/L3: brown/black/grey; N jẹ́ blue bí ó bá wà; PE/earth jẹ́ green-yellow. Transmission lè jẹ́ waya mẹ́ta láìní neutral.", pcm: "L1/L2/L3: brown/black/grey; N is blue where present; earth/shield is green-yellow. Transmission is often three-wire with no neutral." },
  },
  {
    id: "receiving-transformer",
    label: { en: "Receiving-substation transformer", de: "Transformator im Empfangsumspannwerk", yo: "Transformer receiving substation", pcm: "Receiving-substation transformer" },
    role: { en: "This transformer reduces transmission voltage for a regional distribution network. Voltage labels in the adjacent experiment are entered teaching assumptions, not nameplate data.", de: "Dieser Transformator senkt die Übertragungsspannung für das regionale Verteilnetz. Werte im Experiment sind Eingabeannahmen, keine Typenschilddaten.", yo: "Transformer yìí ń dín transmission voltage kù fún distribution network. Àwọn voltage experiment jẹ́ àpẹẹrẹ tí a tẹ̀, kì í ṣe nameplate.", pcm: "This transformer lowers transmission voltage for regional distribution. Experiment values are teaching inputs, not nameplate data." },
    terminals: { en: "HV line terminals and MV bus terminals; neutral grounding, winding vector group, taps and ratings depend on the actual substation design.", de: "HS-Leitungsanschlüsse und MS-Sammelschienenanschlüsse; Erdung, Schaltgruppe, Stufen und Nennwerte sind anlagenspezifisch.", yo: "HV terminal wà sí line; MV terminal wà sí bus. Grounding, vector group, tap àti rating dá lórí design.", pcm: "HV line terminals and MV bus terminals. Grounding, vector group, tap changer and ratings are site-specific." },
  },
  {
    id: "house",
    label: { en: "Residential service & house", de: "Hausanschluss & Wohnhaus", yo: "Service ilé àti ilé", pcm: "House service and home" },
    role: { en: "A local distribution transformer supplies a service connection and consumer board. This overview does not depict an installation design or certify wiring.", de: "Ein Ortsnetztransformator versorgt Hausanschluss und Verbraucher-Verteiler. Die Übersicht ist kein Installationsplan und keine Verdrahtungsfreigabe.", yo: "Distribution transformer ń fún service connection àti consumer board ní iná. Èyí kì í ṣe wiring design tàbí ìfọwọ́sí.", pcm: "A local transformer supplies the service and consumer board. This is not an installation drawing or wiring approval." },
    terminals: { en: "Service conductors, neutral and protective earth are separated according to the local earthing arrangement; actual service details vary by jurisdiction.", de: "Außenleiter, Neutralleiter und PE werden nach örtlichem Erdungssystem geführt; Anschlussdetails unterscheiden sich regional.", yo: "Service conductor, neutral àti PE yà sọ́tọ̀ gẹ́gẹ́ bí earthing arrangement agbègbè. Ìlànà agbègbè yàtọ̀.", pcm: "Service conductors, neutral and PE follow the local earthing arrangement. Service details vary by jurisdiction." },
  },
  {
    id: "industry",
    label: { en: "Industrial MCC & motor", de: "Industrie-MCC & Motor", yo: "MCC àti motor ilé-iṣẹ́", pcm: "Industrial MCC and motor" },
    role: { en: "A motor-control centre distributes and protects motor feeders; the motor converts electrical input to mechanical output. No motor load or protective setting is calculated here.", de: "Eine Motorsteuerzentrale verteilt und schützt Motorabgänge; der Motor wandelt elektrische Eingangsleistung in mechanische Leistung um. Last und Schutzwerte werden nicht berechnet.", yo: "MCC ń pín àti dáàbò bo motor feeder; motor ń yí electrical input sí mechanical output. A kò ṣe load tàbí protection setting.", pcm: "An MCC distributes and protects motor feeders; the motor converts electrical input to mechanical output. Load and protection settings are not calculated here." },
    terminals: { en: "Three-phase motor supply at U/V/W; PE bonding at the frame. Neutral is typically not a motor power conductor. Actual starter/VFD topology varies.", de: "Drehstrom am Motor U/V/W; PE am Gehäuse. N ist üblicherweise kein Motorleistungsleiter. Starter-/FU-Aufbau ist anlagenspezifisch.", yo: "Supply phase mẹ́ta so mọ́ U/V/W; PE so mọ́ frame. Neutral kì í sábà jẹ́ waya agbára motor. Starter/VFD yàtọ̀.", pcm: "Three-phase supply at U/V/W and PE bonded to the frame. Neutral is usually not a motor power conductor; starter/VFD designs vary." },
  },
];

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("WebGL shader allocation failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "WebGL shader failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function buildScene(gl: WebGLRenderingContext, selected: AssetId) {
  const vertices: number[] = [];
  const colors: number[] = [];
  const shade = (rgb: [number, number, number], amount: number) =>
    rgb.map((value) => Math.min(1, value * amount)) as [number, number, number];
  const triangle = (a: readonly number[], b: readonly number[], c: readonly number[], color: [number, number, number]) => {
    for (const point of [a, b, c]) {
      vertices.push(point[0], point[1], point[2]);
      colors.push(...color);
    }
  };
  const material = (id: AssetId, color: [number, number, number]) =>
    id === selected ? [1, 0.76, 0.18] as [number, number, number] : color;
  const box = (
    id: AssetId,
    x: number, y: number, z: number,
    width: number, height: number, depth: number,
    rgb: [number, number, number],
  ) => {
    const x0 = x - width / 2, x1 = x + width / 2;
    const y0 = y - height / 2, y1 = y + height / 2;
    const z0 = z - depth / 2, z1 = z + depth / 2;
    const faces = [
      [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],1],
      [[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],0.65],
      [[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],0.72],
      [[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],0.82],
      [[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],1.28],
      [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],0.48],
    ] as const;
    const base = material(id, rgb);
    for (const [a,b,c,d,light] of faces) {
      const col = shade(base, light);
      triangle(a,b,c,col); triangle(a,c,d,col);
    }
  };
  const rod = (
    id: AssetId,
    start: [number, number, number],
    end: [number, number, number],
    radius: number,
    rgb: [number, number, number],
  ) => {
    const delta: [number,number,number] = [end[0]-start[0],end[1]-start[1],end[2]-start[2]];
    const length = Math.hypot(...delta);
    const axis = delta.map((v) => v / length) as [number,number,number];
    const ref: [number,number,number] = Math.abs(axis[1]) > 0.9 ? [1,0,0] : [0,1,0];
    const cross = (a: [number,number,number], b: [number,number,number]): [number,number,number] =>
      [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const u0 = cross(axis,ref), un = Math.hypot(...u0);
    const u = u0.map((v) => v/un) as [number,number,number];
    const v = cross(axis,u);
    const base = material(id,rgb);
    const sides = 9;
    for (let i=0;i<sides;i++) {
      const at = (angle: number, point: [number,number,number]) => [
        point[0] + radius*(Math.cos(angle)*u[0]+Math.sin(angle)*v[0]),
        point[1] + radius*(Math.cos(angle)*u[1]+Math.sin(angle)*v[1]),
        point[2] + radius*(Math.cos(angle)*u[2]+Math.sin(angle)*v[2]),
      ];
      const a=at(2*Math.PI*i/sides,start), b=at(2*Math.PI*(i+1)/sides,start);
      const c=at(2*Math.PI*(i+1)/sides,end), d=at(2*Math.PI*i/sides,end);
      const color=shade(base,0.7+0.3*(i%3)/2);
      triangle(a,b,c,color); triangle(a,c,d,color);
    }
  };

  // Ground, water and dam face.
  box("reservoir",0,-2.18,0,17.2,0.22,6,[0.26,0.31,0.36]);
  box("reservoir",-6.7,-0.9,0,3.5,2.45,4.5,[0.33,0.39,0.46]);
  box("reservoir",-7.5,0.55,-0.15,3.2,0.18,3.8,[0.08,0.48,0.75]);
  box("reservoir",-4.6,-0.7,0,0.65,2.6,3.5,[0.55,0.6,0.62]);
  // Penstock, turbine casing, shaft, generator and step-up transformer.
  rod("reservoir",[-4.2,0.12,0],[-1.4,-0.65,0],0.17,[0.12,0.58,0.82]);
  box("turbine",-1.45,-1.1,0,1.1,0.85,1.35,[0.75,0.43,0.16]);
  rod("turbine",[-1.0,-1.1,0],[0.1,-1.1,0],0.075,[0.8,0.76,0.65]);
  box("generator",0.85,-0.82,0,1.55,1.15,1.45,[0.22,0.44,0.65]);
  rod("generator",[0.4,-0.82,0],[1.42,-0.82,0],0.04,[0.82,0.82,0.76]);
  for (let i=0;i<3;i++) rod("generator",[1.25+i*0.15,-0.23,0.55],[1.25+i*0.15,0.05,0.55],0.035,[0.8,0.8,0.78]);
  box("unit-transformer",3.05,-1.05,0,1.3,1.2,1.25,[0.73,0.62,0.34]);
  for (let i=0;i<3;i++) rod("unit-transformer",[2.67+i*0.36,-0.42,0.25],[2.67+i*0.36,0.02,0.25],0.07,[0.78,0.75,0.66]);
  // Switchyard equipment and bus.
  rod("switchyard",[3.8,-0.15,-0.65],[6.3,-0.15,-0.65],0.055,[0.82,0.69,0.36]);
  for (let i=0;i<3;i++) {
    const z=-0.48+i*0.48;
    box("switchyard",4.45,0.05,z,0.34,0.44,0.3,[0.69,0.72,0.75]);
    rod("switchyard",[4.45,0.27,z],[4.45,0.62,z],0.055,[0.84,0.84,0.82]);
    box("switchyard",5.35,-0.02,z,0.19,0.55,0.19,[0.4,0.51,0.59]);
  }
  // Lattice transmission tower and five distinctly coloured conductors.
  const apex: [number,number,number]=[8,1.65,0], footL: [number,number,number]=[7.0,-2.05,-0.9], footR: [number,number,number]=[9.0,-2.05,0.9];
  rod("tower",apex,footL,0.055,[0.65,0.69,0.73]); rod("tower",apex,footR,0.055,[0.65,0.69,0.73]);
  for (let level=0;level<5;level++) {
    const y=1.12-level*0.61, spread=0.48+level*0.13;
    rod("tower",[8-spread,y,0],[8+spread,y,0],0.04,[0.71,0.75,0.78]);
    if(level<4) {
      rod("tower",[8-spread,y,0],[8+spread,y-0.61,0],0.025,[0.62,0.68,0.72]);
      rod("tower",[8+spread,y,0],[8-spread,y-0.61,0],0.025,[0.62,0.68,0.72]);
    }
  }
  const phaseColors: [AssetId,[number,number,number]][]=[
    ["tower",[0.48,0.25,0.15]],["tower",[0.09,0.1,0.12]],["tower",[0.48,0.51,0.55]],
    ["tower",[0.2,0.52,0.82]],["tower",[0.42,0.72,0.22]],
  ];
  phaseColors.forEach(([,color],i)=>rod("tower",[3.8,0.48-i*0.36,0.75],[11.8,0.48-i*0.36,0.75],0.026,color));
  // Receiving yard, local transformer, house and industrial motor hall.
  box("receiving-transformer",12.25,-1.05,0,1.25,1.25,1.3,[0.68,0.6,0.38]);
  for(let i=0;i<3;i++) rod("receiving-transformer",[11.9+i*0.34,-0.4,0.28],[11.9+i*0.34,0.02,0.28],0.06,[0.82,0.78,0.63]);
  box("receiving-transformer",13.65,-1.36,0,0.35,0.62,0.38,[0.62,0.67,0.71]);
  box("house",15.2,-1.27,-1.35,1.25,1.45,1.25,[0.85,0.79,0.62]);
  // pitched-roof outline rods
  rod("house",[14.45,-0.55,-2.0],[15.2,0.14,-2.0],0.055,[0.52,0.25,0.18]);
  rod("house",[15.2,0.14,-2.0],[15.95,-0.55,-2.0],0.055,[0.52,0.25,0.18]);
  box("industry",15.1,-1.36,1.6,1.8,1.25,1.25,[0.62,0.68,0.74]);
  for(let i=0;i<2;i++) box("industry",14.55+i*0.65,-0.58,1.6,0.18,0.32,0.18,[0.41,0.47,0.54]);

  const positionBuffer=gl.createBuffer(), colorBuffer=gl.createBuffer();
  if(!positionBuffer||!colorBuffer) throw new Error("WebGL buffer allocation failed");
  gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);
  return {positionBuffer,colorBuffer,count:vertices.length/3};
}

export function PowerGridStation3DScene({ locale }: { locale: Locale }) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [selected,setSelected]=useState<AssetId>("generator");
  const [yaw,setYaw]=useState(-0.32);
  const [pitch,setPitch]=useState(0.12);
  const [zoom,setZoom]=useState(1);
  const [unavailable,setUnavailable]=useState(false);
  const [renderError,setRenderError]=useState("");
  const lang=locale in assets[0].label ? locale : "en";
  const selectedAsset=assets.find((asset)=>asset.id===selected)!;

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    let program:WebGLProgram|undefined, scene:ReturnType<typeof buildScene>|undefined;
    try {
      const gl=canvas.getContext("webgl",{antialias:true,alpha:false,preserveDrawingBuffer:false});
      if(!gl){setUnavailable(true);return;}
      const vertex=compile(gl,gl.VERTEX_SHADER,`
        attribute vec3 aPosition;
        attribute vec3 aColor;
        uniform float uYaw;
        uniform float uPitch;
        uniform float uZoom;
        varying vec3 vColor;
        void main(){
          float cy=cos(uYaw), sy=sin(uYaw);
          float cx=cos(uPitch), sx=sin(uPitch);
          vec3 p=vec3(aPosition.x*cy-aPosition.z*sy,aPosition.y,aPosition.x*sy+aPosition.z*cy);
          p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);
          gl_Position=vec4(p.x*0.055*uZoom,p.y*0.105*uZoom,p.z*0.018,1.0);
          vColor=aColor;
        }`);
      const fragment=compile(gl,gl.FRAGMENT_SHADER,`
        precision mediump float;
        varying vec3 vColor;
        void main(){gl_FragColor=vec4(vColor,1.0);}
      `);
      program=gl.createProgram()??undefined;
      if(!program) throw new Error("WebGL program allocation failed");
      gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)??"WebGL link failed");
      scene=buildScene(gl,selected);
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clearColor(0.055,0.08,0.13,1);
      gl.enable(gl.DEPTH_TEST);
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      const position=gl.getAttribLocation(program,"aPosition");
      gl.bindBuffer(gl.ARRAY_BUFFER,scene.positionBuffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
      const color=gl.getAttribLocation(program,"aColor");
      gl.bindBuffer(gl.ARRAY_BUFFER,scene.colorBuffer);gl.enableVertexAttribArray(color);gl.vertexAttribPointer(color,3,gl.FLOAT,false,0,0);
      gl.uniform1f(gl.getUniformLocation(program,"uYaw"),yaw);
      gl.uniform1f(gl.getUniformLocation(program,"uPitch"),pitch);
      gl.uniform1f(gl.getUniformLocation(program,"uZoom"),zoom);
      gl.drawArrays(gl.TRIANGLES,0,scene.count);
      setUnavailable(false);setRenderError("");
      gl.deleteShader(vertex);gl.deleteShader(fragment);
      return ()=>{
        if(scene){gl.deleteBuffer(scene.positionBuffer);gl.deleteBuffer(scene.colorBuffer);}
        if(program)gl.deleteProgram(program);
      };
    } catch(error) {
      setUnavailable(true);
      setRenderError(error instanceof Error?error.message:"WebGL scene unavailable");
    }
  },[selected,yaw,pitch,zoom]);

  return (
    <section className="panel panel-pad" aria-labelledby="pg-station-3d-title">
      <header>
        <span className="eyebrow">POWERGRID · INTERACTIVE STATION MODEL</span>
        <h3 id="pg-station-3d-title">
          {lang==="de"?"Navigierbares Kraftwerks- und Netzmodell":lang==="yo"?"Àwòṣe 3D ibùdó agbára tí a lè yí":lang==="pcm"?"Move-around power station and grid model":"Navigable power station and grid model"}
        </h3>
        <p>
          {lang==="de"?"Schematische Lehrgeometrie mit auswählbaren Betriebsmitteln. Keine maßstäbliche Anlage oder Anlagenplanung.":lang==="yo"?"Àwòrán 3D ẹ̀kọ́ tí a lè yan ẹ̀rọ. Kì í ṣe plant tó wà ní scale tàbí engineering design.":lang==="pcm"?"Selectable 3D teaching model. No exact site scale or installation design.":"Selectable 3D teaching model. It is not a surveyed site or installation design."}
        </p>
      </header>
      <div style={{display:"grid",gridTemplateColumns:"minmax(0,2fr) minmax(15rem,1fr)",gap:"1rem",alignItems:"start"}}>
        <div>
          {unavailable ? (
            <div role="status" className="notice">
              <p>{lang==="de"?"3D-Ansicht nicht verfügbar. Die zugängliche Stationsschaltung oben bleibt verfügbar.":lang==="yo"?"3D view kò sí. Schematic station tó ṣeé lò wà lókè.":lang==="pcm"?"3D view no dey available. Use the labelled station schematic above.":"3D view unavailable. Use the labelled station schematic above."}</p>
              {renderError&&<small>{renderError}</small>}
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={1000}
              height={460}
              aria-hidden="true"
              style={{display:"block",width:"100%",height:"auto",borderRadius:"0.75rem",background:"#0e1522"}}
            />
          )}
          <fieldset style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(12rem,1fr))",gap:"0.6rem",marginTop:"0.75rem"}}>
            <legend>{lang==="de"?"Kamerasteuerung":lang==="yo"?"Ìṣàkóso camera":lang==="pcm"?"Camera controls":"Camera controls"}</legend>
            <label>{lang==="de"?"Azimut":"Azimuth"} <input aria-label="3D azimuth" type="range" min="-3.14" max="3.14" step="0.05" value={yaw} onChange={(e)=>setYaw(e.currentTarget.valueAsNumber)}/></label>
            <label>{lang==="de"?"Neigung":"Elevation"} <input aria-label="3D elevation" type="range" min="-0.55" max="0.75" step="0.05" value={pitch} onChange={(e)=>setPitch(e.currentTarget.valueAsNumber)}/></label>
            <label>{lang==="de"?"Zoom":"Zoom"} <input aria-label="3D zoom" type="range" min="0.7" max="1.45" step="0.05" value={zoom} onChange={(e)=>setZoom(e.currentTarget.valueAsNumber)}/></label>
          </fieldset>
        </div>
        <div>
          <div role="group" aria-label={lang==="de"?"Anlagenteil auswählen":lang==="yo"?"Yan ẹ̀rọ ibùdó":lang==="pcm"?"Choose equipment":"Choose equipment"} style={{display:"grid",gap:"0.35rem"}}>
            {assets.map((asset)=>(
              <button key={asset.id} type="button" aria-pressed={selected===asset.id} onClick={()=>setSelected(asset.id)}>{asset.label[lang]}</button>
            ))}
          </div>
          <article aria-live="polite" style={{marginTop:"0.75rem"}}>
            <h4>{selectedAsset.label[lang]}</h4>
            <p>{selectedAsset.role[lang]}</p>
            <strong>{lang==="de"?"Anschlüsse und Grenzen":lang==="yo"?"Àwọn terminal àti ààlà":lang==="pcm"?"Terminals and limits":"Terminals and limits"}</strong>
            <p>{selectedAsset.terminals[lang]}</p>
          </article>
        </div>
      </div>
      <p className="pg-model-boundary">
        {lang==="de"?"L1/L2/L3 sind braun/schwarz/grau, N blau und PE grün-gelb dargestellt; die drei Phasen sowie N und PE bleiben getrennt. Geometrie und Leitungsführung sind nicht maßstäblich.":lang==="yo"?"L1/L2/L3 jẹ́ brown/black/grey, N jẹ́ blue, PE sì jẹ́ green-yellow; phase mẹ́ta, N àti PE yà sọ́tọ̀. Ìwọ̀n àti routing kì í ṣe gidi.":lang==="pcm"?"L1/L2/L3 show brown/black/grey; N is blue; PE is green-yellow. Three phases, neutral and earth stay separate. Layout no dey to scale.":"L1/L2/L3 are brown/black/grey, N is blue and PE is green-yellow. Three phases, neutral and PE remain separate. Layout is not to scale."}
      </p>
    </section>
  );
}
