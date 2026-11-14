import { useContext, useState } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

type EquipmentId =
  | "reservoir"
  | "trashrack"
  | "intake"
  | "penstock"
  | "drafttube"
  | "turbine"
  | "generator"
  | "gsu"
  | "breaker"
  | "ctvt"
  | "bus"
  | "tower"
  | "conductors"
  | "ground"
  | "controlhouse"
  | "scada"
  | "arrester"
  | "disconnector"
  | "earthswitch";

type Equipment = { name: string; function: string; terminals: string };

const equipment: Record<Locale, Record<EquipmentId, Equipment>> = {
  en: {
    reservoir: {
      name: "Reservoir, intake & trash rack",
      function:
        "The reservoir supplies elevated water; the rack screens debris and the intake gate controls flow into the penstock.",
      terminals:
        "Hydraulic path: reservoir → trash rack → intake gate → penstock. No electrical terminals.",
    },
    trashrack: {
      name: "Trash rack",
      function:
        "A coarse screen at the intake catches large debris before it enters the water passage. Bar spacing and cleaning equipment are site-specific.",
      terminals:
        "Hydraulic barrier upstream of the intake gate; no electrical terminals.",
    },
    intake: {
      name: "Intake gate",
      function:
        "Controls water entering the headrace/penstock passage. The exact gate or valve arrangement depends on the plant.",
      terminals:
        "Hydraulic upstream: headrace/reservoir; downstream: penstock.",
    },
    penstock: {
      name: "Penstock",
      function:
        "The penstock carries pressurized water from the intake passage to the turbine spiral casing; water returns downstream through the separate draft tube.",
      terminals: "Hydraulic inlet from intake passage → turbine spiral casing.",
    },
    drafttube: {
      name: "Draft tube and tailrace",
      function:
        "The expanding draft tube guides water away from the turbine runner and into the downstream tailrace; the drawn shape is a teaching cutaway, not a civil design.",
      terminals: "Hydraulic inlet from turbine discharge → tailrace.",
    },
    turbine: {
      name: "Francis turbine runner & guide vanes",
      function:
        "A reaction turbine converts water pressure and flow into shaft torque. Guide vanes regulate the flow to the runner.",
      terminals:
        "Mechanical shaft coupling → generator rotor. Water inlet → runner; discharge → draft tube.",
    },
    generator: {
      name: "Synchronous generator · illustrative wye winding",
      function:
        "The turbine shaft turns the rotor field inside the stator, inducing three-phase AC. The winding is drawn as a teaching configuration; real lead-outs and neutral grounding are machine-specific.",
      terminals:
        "U1, V1, W1 are the three phase leads; U2, V2, W2 meet at the depicted star point N. Frame PE bonds to the station earth grid. N is not PE.",
    },
    gsu: {
      name: "Generator step-up transformer · Δ / Yg",
      function:
        "The selected teaching arrangement shows a delta generator-side winding and grounded-star transmission-side winding. It raises line voltage and separates the two winding systems; the vector group and grounding are project-specific.",
      terminals:
        "LV: three phase bushings U/V/W. HV: three phase bushings A/B/C; star point H0 shown bonded to earth for this example. Tank bonds to earth.",
    },
    breaker: {
      name: "Three-pole circuit breaker & disconnectors",
      function:
        "The breaker makes or interrupts load and fault current. Disconnectors provide visible isolation only after current has been interrupted; an earth switch grounds an isolated bay for work.",
      terminals:
        "Three phase terminals on each side: A/B/C in, A/B/C out. Earth switch → station earth grid.",
    },
    ctvt: {
      name: "Current and voltage transformers · CT / VT",
      function:
        "Instrument transformers provide scaled, isolated measurements to protection and metering. They do not carry the main load current through their secondary circuits.",
      terminals:
        "CT primary in series with each phase; CT secondary S1/S2. VT primary across phases or phase-to-earth; secondary a/n. Secondary earthing follows the protection design.",
    },
    bus: {
      name: "Three-phase switchyard busbar",
      function:
        "The busbar collects and routes the three transmission phases between bays. The drawing shows one simple bus arrangement, not a universal station layout.",
      terminals:
        "Three isolated phase buses A/B/C; supports and steelwork bond to the station earth grid.",
    },
    tower: {
      name: "Lattice transmission tower & insulator strings",
      function:
        "The lattice structure supports suspended phase conductors through insulators. A separate shield wire at the tower top helps intercept lightning and is bonded to tower earth.",
      terminals:
        "Three phase conductors on insulators; overhead shield wire → tower steel → footing earth. This HV line has no neutral conductor in this example.",
    },
    conductors: {
      name: "Overhead three-phase circuit",
      function:
        "Three separate uninsulated conductors carry phases A, B and C. The IEC brown/black/grey colors here identify phases in the schematic only; they are not the physical color of bare HV conductors.",
      terminals:
        "Phase A/B/C; separate overhead shield wire. No neutral on this depicted transmission circuit.",
    },
    ground: {
      name: "Station earth grid and protective bonding",
      function:
        "Buried conductors bond exposed metalwork and provide an earthing network. Protective earth is separate from the generator neutral and transmission phases.",
      terminals:
        "Generator frame, transformer tank, breaker steel, tower footing and surge-arrester earth connect to the station earth grid.",
    },
    controlhouse: {
      name: "Substation control house",
      function:
        "A separate station building shelters protection, control, communications and auxiliary-service panels. Its layout is plant-specific.",
      terminals:
        "Station auxiliary AC/DC supplies and communications enter the building; they are separate from the main transmission conductors.",
    },
    scada: {
      name: "Protection and SCADA panel",
      function:
        "Protection relays use instrument-transformer signals to detect configured conditions and can command breakers. SCADA communicates station status. This drawing shows the equipment role only; it does not simulate live telemetry or protection trips.",
      terminals:
        "CT/VT secondary circuits, breaker/disconnector control wiring, station DC auxiliary supply and communications. Project wiring diagrams determine actual terminals.",
    },
    arrester: {
      name: "Surge arrester",
      function:
        "A phase-to-earth arrester limits specified transient overvoltages and diverts surge current to the earth grid. Type and protective coordination are site-specific.",
      terminals:
        "HV phase terminal → arrester body → short earth lead → station earth grid.",
    },
    disconnector: {
      name: "Disconnector / isolator",
      function:
        "Provides a visible isolation gap for maintenance after the circuit breaker has interrupted current. It is not a load or fault-current interrupting device.",
      terminals:
        "Three phase terminals A/B/C on each side; operating mechanism is mechanically linked.",
    },
    earthswitch: {
      name: "Bay earthing switch",
      function:
        "Connects an isolated bay to station earth for safe maintenance, following the approved isolation and proving-dead procedure.",
      terminals:
        "Isolated phase conductor(s) → earthing blade → station earth grid.",
    },
  },
  de: {
    reservoir: {
      name: "Stausee, Einlauf und Rechen",
      function:
        "Der Stausee liefert Höhenwasser. Der Rechen hält Treibgut zurück; das Einlauftor regelt den Zufluss zur Druckleitung.",
      terminals:
        "Wasserweg: Stausee → Rechen → Einlauftor → Druckleitung. Keine elektrischen Anschlüsse.",
    },
    trashrack: {
      name: "Einlaufrechen",
      function:
        "Der Rechen hält grobe Fremdkörper am Einlauf zurück. Stababstand und Reinigung sind standortabhängig.",
      terminals:
        "Hydraulische Barriere vor dem Einlauftor; keine elektrischen Anschlüsse.",
    },
    intake: {
      name: "Einlauftor",
      function:
        "Regelt den Wasserzufluss in den Zulauf und die Druckleitung. Die genaue Tor- oder Ventilanordnung hängt vom Kraftwerk ab.",
      terminals: "Hydraulisch: Zulauf/Stausee → Einlauf; weiter zum Druckrohr.",
    },
    penstock: {
      name: "Druckleitung",
      function:
        "Die Druckleitung führt Wasser vom Zulauf zur Turbinenspirale. Das getrennte Saugrohr führt das Wasser ins Unterwasser zurück.",
      terminals: "Wassereinlass aus dem Zulauf → Turbinenspirale.",
    },
    drafttube: {
      name: "Saugrohr und Unterwasser",
      function:
        "Das Saugrohr leitet Wasser vom Turbinenaustritt in das Unterwasser. Die Kontur ist ein Lehrschnitt, kein Bauplan.",
      terminals: "Wassereinlass vom Turbinenauslauf → Unterwasser.",
    },
    turbine: {
      name: "Francis-Laufrad und Leitschaufeln",
      function:
        "Eine Reaktionsturbine wandelt Wasserdruck und Durchfluss in Drehmoment um. Leitschaufeln regeln den Zufluss.",
      terminals:
        "Mechanische Wellenkupplung → Generatorrotor. Einlass → Laufrad; Auslass → Saugrohr.",
    },
    generator: {
      name: "Synchrongenerator · beispielhafte Sternschaltung",
      function:
        "Die Turbinenwelle dreht das Rotorfeld im Stator und erzeugt dreiphasigen Wechselstrom. Reale Klemmen und Neutralpunkterdung sind maschinenspezifisch.",
      terminals:
        "U1, V1, W1 sind die drei Außenleiter. U2, V2, W2 bilden den gezeigten Sternpunkt N. Gehäuse-PE an Stations-Erde; N ist nicht PE.",
    },
    gsu: {
      name: "Maschinentransformator · Δ / Yg",
      function:
        "Die Lehrdarstellung zeigt eine Dreieckwicklung maschinenseitig und eine geerdete Sternwicklung netzseitig. Übersetzung, Schaltgruppe und Erdung sind projektspezifisch.",
      terminals:
        "NS: drei Außenleiter U/V/W. HS: drei Außenleiter A/B/C; Sternpunkt H0 im Beispiel geerdet. Tank an Erde.",
    },
    breaker: {
      name: "Dreipoliger Leistungsschalter und Trenner",
      function:
        "Der Leistungsschalter schaltet Betriebs- und Fehlerströme. Trenner isolieren sichtbar erst nach dem Abschalten; der Erder verbindet die freigeschaltete Anlage mit Erde.",
      terminals:
        "Je Seite drei Phasenanschlüsse A/B/C. Erdungsschalter → Stations-Erde.",
    },
    ctvt: {
      name: "Strom- und Spannungswandler · CT / VT",
      function:
        "Messwandler liefern Schutz und Messung verkleinerte, isolierte Signale. Ihre Sekundärkreise führen nicht den Hauptlaststrom.",
      terminals:
        "CT primär in Reihe; Sekundärseite S1/S2. VT primär zwischen Phasen oder Phase-Erde; sekundär a/n.",
    },
    bus: {
      name: "Dreiphasige Sammelschiene",
      function:
        "Die Sammelschiene verbindet die drei Phasen zwischen Schaltfeldern. Gezeigt ist eine einfache Anordnung, kein universeller Stationsplan.",
      terminals:
        "Getrennte Phasenschienen A/B/C; Stahl und Stützen an Stations-Erde.",
    },
    tower: {
      name: "Gittermast und Isolatoren",
      function:
        "Der Mast trägt die blanken Phasenleiter an Isolatorketten. Ein separates Erdseil oben schützt vor Blitz und ist mit Mast und Fundamenterder verbunden.",
      terminals:
        "Drei Phasen an Isolatoren; Erdseil → Maststahl → Fundamenterder. In diesem Beispiel hat die HS-Leitung keinen Neutralleiter.",
    },
    conductors: {
      name: "Dreiphasige Freileitung",
      function:
        "Drei getrennte blanke Leiter führen A, B und C. Braun/Schwarz/Grau kennzeichnen hier nur die Phasen im Schema, nicht die Farbe blanker HS-Leiter.",
      terminals:
        "Phase A/B/C; separates Erdseil. Kein Neutralleiter in dieser dargestellten Übertragungsleitung.",
    },
    ground: {
      name: "Stations-Erder und Schutzpotentialausgleich",
      function:
        "Erdungsleiter verbinden berührbare Metallteile zu einem Stations-Erdungsnetz. Schutzleiter, Generatorneutralleiter und Netzphasen haben unterschiedliche Aufgaben.",
      terminals:
        "Generatorgehäuse, Tank, Schaltgerüst, Mastfuß und Ableiter-Erde am Stations-Erdungsnetz.",
    },
    controlhouse: {
      name: "Stations-Leitgebäude",
      function:
        "Ein separates Gebäude schützt Schutz-, Steuer-, Kommunikations- und Eigenbedarfsfelder. Der Grundriss ist standortspezifisch.",
      terminals:
        "AC/DC-Eigenbedarf und Kommunikation; getrennt von den Hauptleitern der Übertragung.",
    },
    scada: {
      name: "Schutz- und SCADA-Schaltschrank",
      function:
        "Schutzrelais werten Messwandlersignale aus und können Leistungsschalter ansteuern; SCADA übermittelt Stationszustände. Die Zeichnung zeigt nur die Aufgabe, keine Live-Telemetrie oder Schutz-Auslösung.",
      terminals:
        "CT/VT-Sekundärkreise, Steuerleitungen für Schalter und Trenner, DC-Eigenbedarf und Kommunikation. Maßgeblich sind die Projektpläne.",
    },
    arrester: {
      name: "Überspannungsableiter",
      function:
        "Ein Ableiter begrenzt festgelegte transiente Überspannungen gegen Erde. Bauart und Schutzkoordination sind standortspezifisch.",
      terminals:
        "HS-Phasenanschluss → Ableiter → kurzer Erder → Stations-Erde.",
    },
    disconnector: {
      name: "Trenner",
      function:
        "Erzeugt nach dem Abschalten des Leistungsschalters eine sichtbare Trennstrecke für Wartungsarbeiten. Er schaltet keine Last- oder Fehlerströme.",
      terminals:
        "Drei Phasenanschlüsse A/B/C auf beiden Seiten; gekoppelter Antrieb.",
    },
    earthswitch: {
      name: "Erdungsschalter des Feldes",
      function:
        "Verbindet ein freigeschaltetes Feld nach dem genehmigten Freischalt- und Spannungsfrei-Verfahren mit Stations-Erde.",
      terminals:
        "Freigeschalteter Leiter → Erdungskontakt → Stations-Erdungsnetz.",
    },
  },
  yo: {
    reservoir: {
      name: "Adágún omi, ẹnu omi àti àlẹ̀mọ́ ìdọ̀tí",
      function:
        "Adágún ń pèsè omi tó wà ní gíga. Àlẹ̀mọ́ dá ìdọ̀tí dúró; ẹnu-ọ̀nà ń ṣàkóso omi tó wọ paipu titẹ.",
      terminals:
        "Ọ̀nà omi: adágún → àlẹ̀mọ́ → ẹnu-ọ̀nà → paipu. Kò ní terminal iná.",
    },
    trashrack: {
      name: "Àlẹ̀mọ́ ìdọ̀tí intake",
      function:
        "Àlẹ̀mọ́ ń dá ìdọ̀tí ńlá dúró kí ó tó wọ ọ̀nà omi. Spacing àti ìmọ́tótó rẹ̀ sinmi lórí station.",
      terminals: "Ó wà ṣáájú intake gate; kò ní terminal iná.",
    },
    intake: {
      name: "Intake gate",
      function:
        "Ó ń ṣàkóso omi tó ń wọ ọ̀nà omi àti penstock. Gate gidi àti ìṣètò rẹ̀ yàtọ̀ láti station sí station.",
      terminals: "Omi: headrace/adágún → intake gate → penstock.",
    },
    penstock: {
      name: "Penstock",
      function:
        "Paipu titẹ ń gbé omi láti intake dé turbine spiral casing. Omi padà sí tailrace gba draft tube ọ̀tọ̀.",
      terminals: "Omi wọ láti intake sí turbine spiral casing.",
    },
    drafttube: {
      name: "Draft tube àti tailrace",
      function:
        "Draft tube ń darí omi kúrò ní turbine sí tailrace. Àwòrán náà jẹ́ fún ẹ̀kọ́, kì í ṣe civil design.",
      terminals: "Omi wọ láti ibi tí turbine ti jáde → tailrace.",
    },
    turbine: {
      name: "Francis runner àti guide vanes",
      function:
        "Reaction turbine ń sọ titẹ àti ìṣàn omi di torque ọ̀pá. Guide vanes ń ṣàkóso omi tó ń wọlé.",
      terminals:
        "Ọ̀pá ẹrọ → rotor generator. Omi wọ runner; ó jáde sí draft tube.",
    },
    generator: {
      name: "Synchronous generator · àpẹẹrẹ wye",
      function:
        "Ọ̀pá turbine ń yí rotor sínú stator, ó sì ń dá AC aláfàsẹ́ mẹ́ta sílẹ̀. Terminal àti grounding gidi sinmi lórí machine.",
      terminals:
        "U1/V1/W1 ni phase mẹ́ta. U2/V2/W2 so pọ̀ sí star point N. PE fireemu lọ sí earth grid; N kì í ṣe PE.",
    },
    gsu: {
      name: "Generator step-up transformer · Δ / Yg",
      function:
        "Àpẹẹrẹ ẹ̀kọ́ yìí ní delta ní ẹgbẹ́ generator àti grounded-star ní ẹgbẹ́ grid. Ratio, vector group àti grounding gidi sinmi lórí project.",
      terminals:
        "LV: U/V/W. HV: A/B/C; star point H0 ti àpẹẹrẹ so mọ́ earth. Tank so mọ́ earth.",
    },
    breaker: {
      name: "Circuit breaker mẹ́ta àti disconnector",
      function:
        "Breaker ń ṣí/tì load àti fault current. Disconnector ń fúnni ní isolation lẹ́yìn tí breaker ti dá current dúró; earth switch ń so bay tó ti ya sọ́tọ̀ mọ́ earth.",
      terminals: "Phase A/B/C ní ẹgbẹ́ méjèèjì. Earth switch → station earth.",
    },
    ctvt: {
      name: "Current transformer àti voltage transformer",
      function:
        "CT/VT ń fún protection àti meter ní measurement tó dín kù, tó ya sọ́tọ̀. Wọn kò gbé main load current nínú secondary.",
      terminals:
        "CT primary wà lórí phase; secondary S1/S2. VT primary wà láàárín phases tàbí phase sí earth.",
    },
    bus: {
      name: "Busbar aláfàsẹ́ mẹ́ta",
      function:
        "Busbar ń kó phases mẹ́ta jọ, ó sì ń pín wọn sí bays. Èyí jẹ́ àwòrán topology kan ṣoṣo, kì í ṣe gbogbo station.",
      terminals: "Bus phase A/B/C; irin àti support so mọ́ station earth.",
    },
    tower: {
      name: "Tower transmission àti insulator",
      function:
        "Tower ń gbé phase conductor sórí insulator. Shield/earth wire ọ̀tọ̀ wà lókè láti dá lightning dúró; ó so mọ́ tower àti earth.",
      terminals:
        "Phase mẹ́ta lórí insulator; shield wire → tower → earth. Transmission yìí kò ní neutral.",
    },
    conductors: {
      name: "Transmission aláfàsẹ́ mẹ́ta",
      function:
        "Conductor mẹ́ta ọ̀tọ̀ ń gbé A, B àti C. Àwọ̀ brown/black/grey jẹ́ àmì lórí schema nìkan; HV conductor gidi sábà máa ń jẹ́ bare.",
      terminals:
        "Phase A/B/C àti shield wire ọ̀tọ̀. Kò sí neutral nínú circuit yìí.",
    },
    ground: {
      name: "Station earth grid àti PE bonding",
      function:
        "Earth grid ń so irin ẹrọ tó lè fọwọ́ kàn pọ̀. PE yàtọ̀ sí generator neutral àti phase transmission.",
      terminals:
        "Generator frame, transformer tank, breaker, tower àti arrester earth so mọ́ grid earth.",
    },
    controlhouse: {
      name: "Ilé iṣakoso switchyard",
      function:
        "Ilé lọ́tọ̀ ń dá protection, control, communication àti auxiliary panels sí. Ìṣètò rẹ̀ sinmi lórí station.",
      terminals:
        "AC/DC station service àti communication; wọ́n yàtọ̀ sí main transmission conductor.",
    },
    scada: {
      name: "Protection àti SCADA panel",
      function:
        "Protection relay ń ka àmì CT/VT, ó sì lè pa breaker; SCADA ń fi status station ránṣẹ́. Àwòrán yìí fi iṣẹ́ ẹrọ hàn, kò ṣe live telemetry tàbí protection trip.",
      terminals:
        "CT/VT secondary, breaker/disconnector control wire, DC auxiliary supply àti communication. Drawing project gidi ló ń pinnu terminal.",
    },
    arrester: {
      name: "Surge arrester",
      function:
        "Ó ń dín transient overvoltage kù, ó sì ń darí surge current sí earth grid. Type àti protection coordination sinmi lórí site.",
      terminals: "HV phase → arrester → earth lead → station earth grid.",
    },
    disconnector: {
      name: "Disconnector / isolator",
      function:
        "Ó ń fi open gap hàn fún maintenance lẹ́yìn tí circuit breaker ti dá current dúró. Kì í ṣí load tàbí fault current.",
      terminals:
        "Phase A/B/C terminal ní ẹgbẹ́ méjèèjì; operating mechanism so mọ́ wọn.",
    },
    earthswitch: {
      name: "Bay earthing switch",
      function:
        "Ó so bay tí a ya sọ́tọ̀ mọ́ station earth fún maintenance, lẹ́yìn ìlànà isolation àti proving-dead tó fọwọ́sí.",
      terminals: "Conductor tó ti ya sọ́tọ̀ → earth blade → station earth grid.",
    },
  },
  pcm: {
    reservoir: {
      name: "Reservoir, intake & trash rack",
      function:
        "Reservoir hold water up high. Rack stop debris; intake gate control water entering penstock.",
      terminals:
        "Water path: reservoir → rack → intake gate → penstock. No electrical terminal.",
    },
    trashrack: {
      name: "Trash rack",
      function:
        "Rack catch big debris at di intake before e enter water passage. Rack spacing and cleaning method depend on plant.",
      terminals: "Water barrier before intake gate; no electrical terminal.",
    },
    intake: {
      name: "Intake gate",
      function:
        "E control water entering headrace and penstock. Real gate or valve arrangement depend on di hydro station.",
      terminals: "Water upstream: headrace/reservoir; downstream: penstock.",
    },
    penstock: {
      name: "Penstock",
      function:
        "Penstock carry pressure water from intake passage to turbine spiral casing; water return through the separate draft tube.",
      terminals: "Water in from intake passage → turbine spiral casing.",
    },
    drafttube: {
      name: "Draft tube and tailrace",
      function:
        "Draft tube guide water from turbine outlet into downstream tailrace. Dis shape na teaching cutaway, no be civil design.",
      terminals: "Water inlet from turbine discharge → tailrace.",
    },
    turbine: {
      name: "Francis runner and guide vanes",
      function:
        "Reaction turbine turn water pressure and flow into shaft torque. Guide vanes regulate water entering runner.",
      terminals:
        "Shaft coupling → generator rotor. Water inlet → runner; outlet → draft tube.",
    },
    generator: {
      name: "Synchronous generator · sample wye winding",
      function:
        "Turbine shaft turn rotor field inside stator and produce three-phase AC. Real terminal and neutral grounding depend on machine.",
      terminals:
        "U1/V1/W1 na phase leads. U2/V2/W2 meet for star point N. Frame PE bond to station earth; N no be PE.",
    },
    gsu: {
      name: "Generator step-up transformer · Δ / Yg",
      function:
        "Dis teaching arrangement show delta generator side and grounded-star grid side. Ratio, vector group and grounding depend on project.",
      terminals:
        "LV U/V/W; HV A/B/C and H0 star point earthed for this example. Tank bond earth.",
    },
    breaker: {
      name: "Three-pole breaker and disconnectors",
      function:
        "Breaker interrupt load and fault current. Disconnector isolate only after current don stop; earth switch ground bay wey dem don isolate.",
      terminals:
        "Three phases A/B/C each side. Earth switch → station earth grid.",
    },
    ctvt: {
      name: "Current and voltage transformers · CT / VT",
      function:
        "Instrument transformers give protection and meters safe scaled readings. Their secondary no carry main load current.",
      terminals:
        "CT primary dey series per phase; secondary S1/S2. VT primary across phases or phase-earth; secondary a/n.",
    },
    bus: {
      name: "Three-phase switchyard busbar",
      function:
        "Busbar join and route the three phases between bays. This one na one simple station layout, no be every layout.",
      terminals:
        "Separate phase buses A/B/C; steel and support bond to station earth.",
    },
    tower: {
      name: "Lattice tower and insulator strings",
      function:
        "Tower hold bare phase conductors on insulators. Separate shield wire for top dey help catch lightning and bond to tower earth.",
      terminals:
        "Three phases on insulators; shield wire → tower steel → footing earth. This HV circuit no get neutral.",
    },
    conductors: {
      name: "Overhead three-phase circuit",
      function:
        "Three separate bare conductors carry A/B/C. Brown/black/grey na schematic phase tags; real bare HV wires no dey get this insulation color.",
      terminals:
        "Phase A/B/C and separate shield wire. No neutral for dis transmission circuit.",
    },
    ground: {
      name: "Station earth grid and protective bonding",
      function:
        "Earth grid bond exposed metal equipment. Protective earth dey different from generator neutral and transmission phases.",
      terminals:
        "Generator frame, transformer tank, breaker steel, tower footing and arrester earth connect to station earth.",
    },
    controlhouse: {
      name: "Station control house",
      function:
        "A separate building shelters protection, control, communications and auxiliary panels. The real layout depends on the station.",
      terminals:
        "Station auxiliary AC/DC supply and communications; separate from the main transmission conductors.",
    },
    scada: {
      name: "Protection and SCADA panel",
      function:
        "Protection relays read CT/VT signals and may command breakers; SCADA carries station status. The drawing shows the equipment role, not live readings or a simulated trip.",
      terminals:
        "CT/VT secondary wiring, breaker/disconnector controls, station DC supply and communications. Project drawings decide exact terminals.",
    },
    arrester: {
      name: "Surge arrester",
      function:
        "It limits specified transient overvoltage and diverts surge current to earth. Type and protection settings depend on the site.",
      terminals:
        "HV phase terminal → arrester → short earth lead → station earth.",
    },
    disconnector: {
      name: "Disconnector / isolator",
      function:
        "It provides a visible isolation gap for maintenance after the breaker stops current. It does not interrupt load or fault current.",
      terminals:
        "Three phase terminals A/B/C on both sides; linked operating handle.",
    },
    earthswitch: {
      name: "Bay earthing switch",
      function:
        "It connects an isolated bay to station earth for maintenance after an approved isolation and prove-dead procedure.",
      terminals: "Isolated phase conductor → earth blade → station earth grid.",
    },
  },
};

const names = {
  en: {
    title: "Hydroelectric generating station · teaching cutaway",
    physical: "PHYSICAL POWERHOUSE AND SWITCHYARD · illustrative layout",
    circuit: "THREE-PHASE ELECTRICAL PATH · one teaching connection",
    select:
      "Select a machine or connection to inspect its function and terminals.",
    source:
      "Hydro process and equipment sequence based on U.S. Department of Energy hydropower references. The equipment arrangement and winding connections shown here are illustrative, not a station-specific as-built drawing.",
    disclaimer: "ILLUSTRATIVE EQUIPMENT AND CONNECTION CONFIGURATION",
    inspected: "INSPECTED EQUIPMENT",
    terminalsLabel: "TERMINALS / CONNECTIONS",
    water: "WATER FLOW",
    drive: "SHAFT TORQUE",
    power: "ELECTRICAL POWER",
    earth: "STATION EARTH GRID",
    lv: "GENERATOR SIDE · Δ",
    hv: "TRANSMISSION SIDE · Yg",
    line: "A B C · HV TRANSMISSION",
    chart: "Schematic phase colors · IEC L1/L2/L3 identification",
  },
  de: {
    title: "Wasserkraftwerk · Lehrschnitt",
    physical: "KRAFTHAUS UND SCHALTANLAGE · beispielhafte Anordnung",
    circuit: "DREIPHASIGER STROMPFAD · Lehrschaltung",
    select: "Maschine oder Verbindung für Funktion und Klemmen auswählen.",
    source:
      "Ablauf und Betriebsmittel nach Referenzen des US-Energieministeriums. Anordnung und Wicklungsschaltung sind beispielhaft und kein Bestandsplan eines konkreten Kraftwerks.",
    disclaimer: "BEISPIELHAFTE GERÄTE- UND ANSCHLUSSKONFIGURATION",
    inspected: "AUSGEWÄHLTES GERÄT",
    terminalsLabel: "KLEMMEN / ANSCHLÜSSE",
    water: "WASSERFLUSS",
    drive: "WELLENDREHMOMENT",
    power: "ELEKTRISCHE LEISTUNG",
    earth: "STATIONS-ERDUNGSNETZ",
    lv: "MASCHINENSEITE · Δ",
    hv: "NETZSEITE · Yg",
    line: "A B C · HS-FREILEITUNG",
    chart: "Phasenfarben im Schema · IEC-Kennzeichnung L1/L2/L3",
  },
  yo: {
    title: "Ibùdó hydroelectric · àwòrán gígé ẹ̀kọ́",
    physical: "POWERHOUSE ÀTI SWITCHYARD · àpẹẹrẹ ìṣètò",
    circuit: "Ọ̀NÀ INÁ ALÁFÀSẸ́ MẸ́TA · àpẹẹrẹ ẹ̀kọ́",
    select: "Yan ẹrọ tàbí asopọ láti ṣàyẹ̀wò iṣẹ́ àti terminal rẹ̀.",
    source:
      "Ọ̀nà hydro àti equipment tẹ̀lé ìtọ́kasí U.S. Department of Energy. Layout àti winding connection jẹ́ àpẹẹrẹ, kì í ṣe as-built drawing station kan.",
    disclaimer: "ÀPẸẸRẸ ÌṢÈTÒ Ẹ̀RỌ ÀTI ASỌ̀RỌ INÁ",
    inspected: "Ẹ̀RỌ TÍ A YAN",
    terminalsLabel: "TERMINAL / ASỌ̀RỌ",
    water: "ÌṢÀN OMI",
    drive: "TORQUE Ọ̀PÁ",
    power: "AGBÁRA INÁ",
    earth: "STATION EARTH GRID",
    lv: "Ẹ̀GBẸ́ GENERATOR · Δ",
    hv: "Ẹ̀GBẸ́ GRID · Yg",
    line: "A B C · HV TRANSMISSION",
    chart: "Àwọ̀ phase schema · IEC L1/L2/L3",
  },
  pcm: {
    title: "Hydroelectric station · teaching cutaway",
    physical: "POWERHOUSE AND SWITCHYARD · illustrative layout",
    circuit: "THREE-PHASE ELECTRIC PATH · sample connection",
    select: "Select machine or wire to check function and terminals.",
    source:
      "Hydro steps and equipment follow U.S. Department of Energy references. Layout and winding connections na teaching example, no be as-built station drawing.",
    disclaimer: "ILLUSTRATIVE EQUIPMENT AND CONNECTION CONFIGURATION",
    inspected: "EQUIPMENT WEY YOU SELECT",
    terminalsLabel: "TERMINALS / CONNECTIONS",
    water: "WATER FLOW",
    drive: "SHAFT TORQUE",
    power: "ELECTRIC POWER",
    earth: "STATION EARTH GRID",
    lv: "GENERATOR SIDE · Δ",
    hv: "GRID SIDE · Yg",
    line: "A B C · HV TRANSMISSION",
    chart: "Schematic phase colors · IEC L1/L2/L3",
  },
};

function Pick({
  id,
  selected,
  onSelect,
  children,
}: {
  id: EquipmentId;
  selected: EquipmentId;
  onSelect: (id: EquipmentId) => void;
  children: ReactNode;
}) {
  const locale = useContext(LanguageContext);
  const item = equipment[locale]?.[id] ?? equipment.en[id];
  const inspect = {
    en: "Inspect",
    de: "Prüfen",
    yo: "Ṣàyẹ̀wò",
    pcm: "Inspect",
  }[locale];
  return (
    <g
      className={`pg-pick${selected === id ? " is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${inspect}: ${item.name}`}
      aria-pressed={selected === id}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
    >
      {children}
    </g>
  );
}

export function HydroStationScene({ locale }: { locale: keyof typeof names }) {
  const text = names[locale] ?? names.en;
  const [selected, setSelected] = useState<EquipmentId>("generator");
  const info = equipment[locale]?.[selected] ?? equipment.en[selected];
  return (
    <section
      className="panel panel-pad pg-station"
      aria-labelledby="pg-station-title"
    >
      <header className="pg-station-heading">
        <div>
          <span className="eyebrow">{text.physical}</span>
          <h3 id="pg-station-title">{text.title}</h3>
        </div>
        <span className="pg-station-disclaimer">{text.disclaimer}</span>
      </header>
      <div
        className="pg-station-scroll"
        role="region"
        aria-label={text.title}
        tabIndex={0}
      >
        <svg
          className="pg-station-svg"
          viewBox="0 0 1440 735"
          role="group"
          aria-labelledby="pg-station-svg-title pg-station-svg-desc"
        >
          <title id="pg-station-svg-title">{text.title}</title>
          <desc id="pg-station-svg-desc">
            Reservoir, dam intake, penstock, Francis turbine, synchronous
            generator, delta-to-grounded-star step-up transformer, switchyard,
            lattice tower, three phase conductors, shield wire and station earth
            grid.
          </desc>
          <defs>
            <linearGradient id="pg-water" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#27b8dc" stopOpacity=".75" />
              <stop offset="1" stopColor="#165d86" stopOpacity=".35" />
            </linearGradient>
            <linearGradient id="pg-steel" x1="0" x2="1">
              <stop stopColor="#596b80" />
              <stop offset=".5" stopColor="#cad1da" />
              <stop offset="1" stopColor="#65768a" />
            </linearGradient>
            <linearGradient
              id="pg-pe-stripes"
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="0"
              x2="8"
              y2="0"
              spreadMethod="repeat"
            >
              <stop offset="0" stopColor="#a9cc42" />
              <stop offset=".5" stopColor="#a9cc42" />
              <stop offset=".5" stopColor="#f0dc46" />
              <stop offset="1" stopColor="#f0dc46" />
            </linearGradient>
            <pattern
              id="pg-concrete"
              width="32"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 0H32M0 11H32M16 0V11M8 11V22"
                fill="none"
                stroke="#586777"
                strokeWidth="1"
                opacity=".45"
              />
            </pattern>
            <marker
              id="pg-arrow-water"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 10 5 0 10z" fill="#27b8dc" />
            </marker>
            <marker
              id="pg-arrow-power"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M0 0 10 5 0 10z" fill="#e6bb38" />
            </marker>
          </defs>
          <rect
            x="1"
            y="1"
            width="1438"
            height="733"
            rx="12"
            className="pg-station-bg"
          />
          <text x="24" y="31" className="pg-svg-kicker">
            {text.physical}
          </text>
          <path d="M16 398H1424" className="pg-svg-divider" />
          {/* Waterway and dam: the water path is shown separately from the electrical circuit. */}
          <Pick id="reservoir" selected={selected} onSelect={setSelected}>
            <path
              d="M25 126H239V245H25Z"
              fill="url(#pg-water)"
              stroke="#28b8d5"
              strokeWidth="2"
            />
            <path
              d="M26 126q22-11 44 0t44 0 44 0 44 0 38 0"
              fill="none"
              stroke="#73ddf2"
              strokeWidth="3"
            />
            <text x="43" y="106" className="pg-svg-label">
              RESERVOIR · headwater
            </text>
          </Pick>
          <Pick id="trashrack" selected={selected} onSelect={setSelected}>
            <text x="45" y="157" className="pg-svg-small">
              Trash rack
            </text>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path key={i} d={`M${188 + i * 7} 128V174`} className="pg-rack" />
            ))}
          </Pick>
          <Pick id="intake" selected={selected} onSelect={setSelected}>
            <rect
              x="183"
              y="169"
              width="59"
              height="13"
              rx="2"
              className="pg-valve"
            />
            <text x="190" y="200" className="pg-svg-small">
              Intake gate
            </text>
          </Pick>
          <Pick id="penstock" selected={selected} onSelect={setSelected}>
            <path d="M242 181L380 269L426 303" className="pg-penstock" />
            <path
              d="M248 183L380 268L423 301"
              className="pg-water-flow"
              markerEnd="url(#pg-arrow-water)"
            />
            <text
              x="270"
              y="220"
              className="pg-svg-label"
              transform="rotate(32 270 220)"
            >
              PENSTOCK
            </text>
          </Pick>
          <path d="M243 246V354H447V319L420 296" className="pg-concrete" />
          <path d="M243 246V354H447V319L420 296" fill="url(#pg-concrete)" />
          <path d="M243 246H452" className="pg-dam-top" />
          <text x="264" y="334" className="pg-svg-label">
            DAM / INTAKE STRUCTURE
          </text>
          {/* Powerhouse cross-section and machine train */}
          <path d="M387 276H671V366H387Z" className="pg-building" />
          <path d="M403 263H653L668 276H391Z" className="pg-roof" />
          <text x="444" y="292" className="pg-svg-small">
            POWERHOUSE · unit hall
          </text>
          <Pick id="turbine" selected={selected} onSelect={setSelected}>
            <circle cx="443" cy="333" r="23" className="pg-machine-case" />
            <circle cx="443" cy="333" r="5" className="pg-machine-hub" />
            <path
              d="M443 310v18l-13-11m36 16h-18l12-13m-28 29 10-15 5 18m-22-18 18 1-13 12"
              className="pg-runner"
            />
            <path
              d="M423 308q20-19 40 0m-40 50q20 18 40 0"
              className="pg-guide"
            />
            <text x="407" y="373" className="pg-svg-small">
              Francis runner
            </text>
          </Pick>
          <Pick id="drafttube" selected={selected} onSelect={setSelected}>
            <path d="M443 356 429 385H302" className="pg-penstock" />
            <path
              d="M435 367 425 382H318"
              className="pg-water-flow"
              markerEnd="url(#pg-arrow-water)"
            />
            <text x="300" y="393" className="pg-svg-tiny">
              DRAFT TUBE → TAILRACE
            </text>
          </Pick>
          <path d="M466 333H489" className="pg-shaft" />
          <Pick id="generator" selected={selected} onSelect={setSelected}>
            <rect
              x="489"
              y="302"
              width="111"
              height="62"
              rx="18"
              className="pg-generator-shell"
            />
            <rect
              x="500"
              y="309"
              width="90"
              height="48"
              rx="14"
              className="pg-generator-stator"
            />
            <ellipse
              cx="544"
              cy="333"
              rx="29"
              ry="17"
              className="pg-generator-rotor"
            />
            <circle cx="544" cy="333" r="5" className="pg-generator-hub" />
            <text x="512" y="378" className="pg-svg-small">
              STATOR · ROTOR · shaft
            </text>
            <path
              d="M590 311v-8h-16m16 8h7v-8h8"
              className="pg-generator-cooling"
            />
            <text x="594" y="298" className="pg-svg-tiny">
              Air cooler
            </text>
            <path d="M600 323h16" className="pg-wire-a" />
            <path d="M600 333h16" className="pg-wire-b" />
            <path d="M600 343h16" className="pg-wire-c" />
          </Pick>
          <text x="25" y="379" className="pg-svg-small pg-water-key">
            {text.water}
          </text>
          <path
            d="M120 374H169"
            className="pg-water-flow"
            markerEnd="url(#pg-arrow-water)"
          />
          <text x="407" y="379" className="pg-svg-small pg-drive-key">
            {text.drive}
          </text>
          <path d="M482 373H616" className="pg-shaft" />
          {/* GSU transformer */}
          <path d="M617 322H684" className="pg-wire-a" />
          <path d="M617 332H684" className="pg-wire-b" />
          <path d="M617 342H684" className="pg-wire-c" />
          <Pick id="gsu" selected={selected} onSelect={setSelected}>
            <circle cx="704" cy="317" r="25" className="pg-transformer-coil" />
            <circle cx="704" cy="350" r="25" className="pg-transformer-coil" />
            <path
              d="M692 311l12 6-12 6 12 6m-12 13 12 6-12 6 12 6"
              className="pg-transformer-winding"
            />
            <path d="M735 303v63m9-63v63" className="pg-transformer-core" />
            <path d="M784 308v27m-8 0 8 9 8-9" className="pg-tap" />
            <text x="754" y="297" className="pg-svg-tiny">
              Tap changer
            </text>
            <path d="M759 346h39v13h-39z" className="pg-radiator" />
            <path
              d="M764 346v13m8-13v13m8-13v13m8-13v13"
              className="pg-radiator-fin"
            />
            <text x="669" y="380" className="pg-svg-small">
              GSU · Δ / Yg
            </text>
          </Pick>
          <path d="M739 318H802" className="pg-wire-a" />
          <path d="M739 329H802" className="pg-wire-b" />
          <path d="M739 340H802" className="pg-wire-c" />
          <Pick id="controlhouse" selected={selected} onSelect={setSelected}>
            <path
              d="M821 93 943 69l125 24v108H821Z"
              className="pg-control-building"
            />
            <path d="M813 93 943 63l132 30" className="pg-control-roof" />
            <path
              d="M831 106h34v25h-34zm49 0h34v25h-34zm99 0h25v49h-25z"
              className="pg-control-window"
            />
            <text x="831" y="173" className="pg-svg-small">
              SUBSTATION CONTROL HOUSE
            </text>
            <text x="831" y="187" className="pg-svg-tiny">
              protection · control · communications
            </text>
          </Pick>
          <Pick id="scada" selected={selected} onSelect={setSelected}>
            <rect
              x="901"
              y="99"
              width="77"
              height="59"
              rx="4"
              className="pg-scada-panel"
            />
            <rect
              x="909"
              y="106"
              width="60"
              height="25"
              rx="2"
              className="pg-scada-screen"
            />
            <path d="M916 124h12l7-10 8 9 8-6h11" className="pg-scada-trace" />
            <circle cx="917" cy="143" r="3" className="pg-scada-led" />
            <circle cx="930" cy="143" r="3" className="pg-scada-led" />
            <circle cx="943" cy="143" r="3" className="pg-scada-led" />
            <text x="951" y="146" className="pg-svg-tiny">
              PROTECTION / SCADA
            </text>
          </Pick>
          {/* Switchyard bay: bus, three-pole breaker, CT/VT and surge arresters */}
          <text x="904" y="272" className="pg-svg-label">
            THREE-PHASE BUS · A / B / C
          </text>
          <path d="M802 318H1111" className="pg-wire-a" />
          <path d="M802 329H1111" className="pg-wire-b" />
          <path d="M802 340H1111" className="pg-wire-c" />
          <Pick id="breaker" selected={selected} onSelect={setSelected}>
            <rect
              x="830"
              y="302"
              width="45"
              height="54"
              rx="4"
              className="pg-breaker-box"
            />
            <path d="M839 326h10m13-7-9 8h10" className="pg-breaker-symbol" />
            <text x="825" y="374" className="pg-svg-tiny">
              3-pole circuit breaker
            </text>
          </Pick>
          <Pick id="disconnector" selected={selected} onSelect={setSelected}>
            <path d="M827 299v-8m51 8v-8" className="pg-disconnector" />
            <circle cx="827" cy="291" r="3" className="pg-contact" />
            <circle cx="878" cy="291" r="3" className="pg-contact" />
            <text x="823" y="283" className="pg-svg-tiny">
              DS · visible isolation gap
            </text>
          </Pick>
          <Pick id="earthswitch" selected={selected} onSelect={setSelected}>
            <path d="M850 356v17l9 8-9 8" className="pg-earth-switch" />
            <text x="863" y="389" className="pg-svg-tiny">
              ES · bay earth switch
            </text>
          </Pick>
          <Pick id="ctvt" selected={selected} onSelect={setSelected}>
            <circle cx="914" cy="329" r="12" className="pg-instrument-ring" />
            <path d="M914 317v-17m-7 0h14m-7 0v-13" className="pg-instrument" />
            <text x="893" y="373" className="pg-svg-tiny">
              CT / VT
            </text>
          </Pick>
          <Pick id="arrester" selected={selected} onSelect={setSelected}>
            <path
              d="M968 340v25m-7 0 7 7 7-7m-10 11h6m-8 4h10m-12 4h14"
              className="pg-arrester"
            />
            <text x="979" y="367" className="pg-svg-tiny">
              Surge arrester
            </text>
            <path
              d="M990 340v35m-8 0 8 8 8-8m-12 12h8m-10 4h12m-14 4h16"
              className="pg-ground-line"
            />
          </Pick>
          <Pick id="bus" selected={selected} onSelect={setSelected}>
            <path d="M929 318H1076" className="pg-yard-bus-a" />
            <path d="M929 329H1076" className="pg-yard-bus-b" />
            <path d="M929 340H1076" className="pg-yard-bus-c" />
            <text x="920" y="303" className="pg-svg-small">
              Separate rigid phase bars · station support steel is earthed
            </text>
          </Pick>
          {/* Lattice transmission structure, phase conductors, shield wire and station earth */}
          <Pick id="tower" selected={selected} onSelect={setSelected}>
            <path
              d="M1164 205 1128 376h127l-39-171m-32 19h29m-35 31h41m-48 32h55m-61 32h67m-75 31h83m-70-126 44 31-53 33 59 31-67 32 69 31m12-157-44 31 53 33-59 31 67 32-69 31"
              className="pg-tower-steel"
            />
            <path
              d="M1140 245h84m-93 33h103m-110 34h116"
              className="pg-crossarm"
            />
            <path
              d="M1132 247h-23m115 0h23m-124 33h-23m133 0h23m-141 34h-23m149 0h23"
              className="pg-insulator"
            />
            <text x="1134" y="395" className="pg-svg-small">
              LATTICE TOWER · insulators
            </text>
          </Pick>
          <Pick id="conductors" selected={selected} onSelect={setSelected}>
            <path d="M1080 247H1374" className="pg-wire-a" />
            <path d="M1072 280H1384" className="pg-wire-b" />
            <path d="M1064 314H1394" className="pg-wire-c" />
            <path d="M1115 204H1374" className="pg-shield-wire" />
            <text x="1260" y="191" className="pg-svg-tiny">
              SHIELD / EARTH WIRE
            </text>
            <text x="1273" y="340" className="pg-svg-label">
              A · B · C
            </text>
          </Pick>
          <Pick id="ground" selected={selected} onSelect={setSelected}>
            <path
              d="M493 364v23m26-23v23m86-23v23m99-23v23m86-23v23m76-23v23m-389 0h389m-365 6 5 6m68-6 5 6m68-6 5 6m68-6 5 6m68-6 5 6"
              className="pg-earth-grid"
            />
            <text x="792" y="393" className="pg-svg-tiny">
              {text.earth}
            </text>
          </Pick>
          <text x="22" y="426" className="pg-svg-kicker">
            {text.circuit}
          </text>
          {/* Electrical one-line below: distinct from the physical cutaway above. */}
          <path d="M101 565H285" className="pg-wire-a" />
          <path d="M101 577H285" className="pg-wire-b" />
          <path d="M101 589H285" className="pg-wire-c" />
          <Pick id="generator" selected={selected} onSelect={setSelected}>
            <rect
              x="27"
              y="522"
              width="74"
              height="99"
              rx="8"
              className="pg-sld-machine"
            />
            <circle cx="64" cy="557" r="20" className="pg-sld-symbol" />
            <text x="64" y="563" className="pg-sld-icon">
              G
            </text>
            <text x="64" y="598" className="pg-sld-label">
              3φ GEN
            </text>
            <text x="64" y="612" className="pg-svg-tiny">
              U1 V1 W1
            </text>
            <path d="M63 621v15h24" className="pg-neutral-wire" />
            <rect
              x="87"
              y="630"
              width="24"
              height="12"
              className="pg-ground-resistor"
            />
            <path
              d="M111 636h18v12m-7 0 7 7 7-7m-11 11h8m-10 4h12"
              className="pg-neutral-wire"
            />
            <text x="132" y="638" className="pg-svg-tiny">
              N · neutral grounding
            </text>
            <path
              d="M62 621v57h71m-6 0 6 7 6-7m-12 11h12m-15 5h18"
              className="pg-ground-line"
            />
            <text x="148" y="682" className="pg-svg-tiny">
              FRAME PE · separate
            </text>
          </Pick>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle
                cx={149}
                cy={565 + i * 12}
                r="4"
                className="pg-terminal"
              />
              <text x="157" y={569 + i * 12} className="pg-terminal-label">
                {["U1", "V1", "W1"][i]}
              </text>
            </g>
          ))}
          <path d="M285 565v24" className="pg-wire-a" />
          <path
            d="M277 565l8-8 8 8m-16 40 8 8 8-8"
            className="pg-delta-symbol"
          />
          <text x="252" y="617" className="pg-svg-tiny">
            LV delta · illustrative
          </text>
          <Pick id="gsu" selected={selected} onSelect={setSelected}>
            <rect
              x="306"
              y="518"
              width="163"
              height="107"
              rx="9"
              className="pg-sld-box"
            />
            <circle cx="350" cy="566" r="23" className="pg-sld-winding" />
            <circle cx="421" cy="566" r="23" className="pg-sld-winding" />
            <path
              d="M344 552q13 14 0 28m12-28q13 14 0 28m59-28q13 14 0 28m12-28q13 14 0 28"
              className="pg-sld-coil"
            />
            <path d="M383 538v56m7-56v56" className="pg-sld-core" />
            <text x="387" y="610" className="pg-sld-label">
              GSU transformer
            </text>
            <path
              d="M421 589v49m-8 0 8 8 8-8m-12 12h8m-10 4h12m-14 4h16"
              className="pg-neutral-wire"
            />
            <text x="434" y="642" className="pg-svg-tiny">
              H0 · earthed star point
            </text>
          </Pick>
          <path d="M469 565H586" className="pg-wire-a" />
          <path d="M469 577H586" className="pg-wire-b" />
          <path d="M469 589H586" className="pg-wire-c" />
          <Pick id="breaker" selected={selected} onSelect={setSelected}>
            <path d="M587 558v42m-11-35 11 8 11-8" className="pg-sld-breaker" />
            <text x="587" y="622" className="pg-svg-tiny">
              3-pole CB
            </text>
          </Pick>
          <path d="M598 565H738" className="pg-wire-a" />
          <path d="M598 577H738" className="pg-wire-b" />
          <path d="M598 589H738" className="pg-wire-c" />
          <Pick id="ctvt" selected={selected} onSelect={setSelected}>
            <circle cx="652" cy="577" r="13" className="pg-instrument-ring" />
            <text x="652" y="581" className="pg-svg-tiny">
              CT
            </text>
            <text x="628" y="610" className="pg-svg-tiny">
              CT in series
            </text>
          </Pick>
          <Pick id="bus" selected={selected} onSelect={setSelected}>
            <path d="M738 548v58m7-58v58m7-58v58" className="pg-sld-bus" />
            <text x="710" y="625" className="pg-svg-tiny">
              A · B · C bus
            </text>
          </Pick>
          <path d="M752 565H893M893 565h49" className="pg-wire-a" />
          <path d="M752 577H893m0 0h49" className="pg-wire-b" />
          <path d="M752 589H893m0 0h49" className="pg-wire-c" />
          <Pick id="tower" selected={selected} onSelect={setSelected}>
            <path
              d="M964 535 942 611h49l-27-76m-15 22h29m-34 19h39m-41 19h43m-31-60 18 17-25 18 28 17m-2-52-18 17 25 18-28 17"
              className="pg-sld-tower"
            />
            <text x="966" y="629" className="pg-svg-tiny">
              Transmission tower
            </text>
          </Pick>
          <Pick id="conductors" selected={selected} onSelect={setSelected}>
            <path d="M1001 558h246" className="pg-wire-a" />
            <path d="M1001 577h246" className="pg-wire-b" />
            <path d="M1001 596h246" className="pg-wire-c" />
            <path d="M977 535H1260" className="pg-shield-wire" />
            <text x="1101" y="542" className="pg-svg-tiny">
              separate shield wire
            </text>
          </Pick>
          <path d="M114 503h23v11h-23z" className="pg-wire-a" />
          <text x="143" y="512" className="pg-svg-tiny">
            L1 / phase A
          </text>
          <path d="M278 503h23v11h-23z" className="pg-wire-b" />
          <text x="307" y="512" className="pg-svg-tiny">
            L2 / phase B
          </text>
          <path d="M444 503h23v11h-23z" className="pg-wire-c" />
          <text x="473" y="512" className="pg-svg-tiny">
            L3 / phase C
          </text>
          <path d="M610 503h23v11h-23z" className="pg-neutral-wire" />
          <text x="639" y="512" className="pg-svg-tiny">
            N · neutral only at shown source point
          </text>
          <path d="M905 503h23v11h-23z" className="pg-ground-line" />
          <text x="934" y="512" className="pg-svg-tiny">
            PE / earth bonding, separate from N
          </text>
          <text x="23" y="714" className="pg-svg-small">
            {text.chart} · HV phase conductors are bare; the palette is a
            schematic identifier only.
          </text>
        </svg>
      </div>
      <div
        className="pg-equipment-detail"
        aria-live="polite"
        aria-atomic="true"
      >
        <div>
          <span className="eyebrow">{text.inspected}</span>
          <h4>{info.name}</h4>
          <p>{info.function}</p>
        </div>
        <div>
          <span className="eyebrow">{text.terminalsLabel}</span>
          <p>{info.terminals}</p>
        </div>
        <p className="pg-equipment-source">
          {text.source}{" "}
          <a
            href="https://www.energy.gov/cmei/water/how-hydropower-works"
            target="_blank"
            rel="noreferrer"
          >
            DOE · How hydropower works
          </a>{" "}
          ·{" "}
          <a
            href="https://www.energy.gov/sites/default/files/2024-12/Hydropower%20Supply%20Chain%20Report%20-%20Final%5B1%5D.pdf"
            target="_blank"
            rel="noreferrer"
          >
            DOE · Hydropower supply chain and unit cutaway
          </a>
        </p>
      </div>
      <p className="pg-station-screenreader">{text.select}</p>
    </section>
  );
}
