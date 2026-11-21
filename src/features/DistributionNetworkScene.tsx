import type { KeyboardEvent, ReactNode } from "react";
import type { Locale } from "../i18n";
import type { PowerGridInputs } from "../engine/powergrid";

export type DistributionEquipmentId =
  | "receivingBay"
  | "disconnectors"
  | "breaker"
  | "ctvt"
  | "surgeArrester"
  | "receivingTransformer"
  | "mvFeeder"
  | "recloser"
  | "distributionTransformer"
  | "feederPillar"
  | "houseService"
  | "mainBoard"
  | "industrialMcc"
  | "motor"
  | "neutral"
  | "protectiveEarth";

type EquipmentId = DistributionEquipmentId;

type Item = {
  name: string;
  function: string;
  terminals: string;
  label: string;
};
type LocaleItems = Record<EquipmentId, Item>;

const copy: Record<
  Locale,
  {
    title: string;
    eyebrow: string;
    select: string;
    inspected: string;
    connections: string;
    receiving: string;
    distribution: string;
    customers: string;
    illustrative: string;
    path: string;
    items: LocaleItems;
  }
> = {
  en: {
    title: "Receiving substation to consumers · selectable equipment path",
    eyebrow: "RECEIVING SUBSTATION · DISTRIBUTION · CUSTOMERS",
    select:
      "Select a device or conductor to inspect its function and represented terminals.",
    inspected: "INSPECTED EQUIPMENT",
    connections: "CONNECTIONS / TERMINALS",
    receiving: "RECEIVING SUBSTATION",
    distribution: "PRIMARY AND SECONDARY DISTRIBUTION",
    customers: "CUSTOMERS",
    illustrative: "ILLUSTRATIVE CONNECTIONS · NOT AN AS-BUILT NETWORK",
    path: "Transmission source",
    items: {
      receivingBay: {
        name: "Receiving substation line bay",
        label: "Line bay · HV entry",
        function:
          "The line bay receives the transmission circuit and provides controlled switching, measurement and protection before the receiving transformer.",
        terminals:
          "Three-phase incoming line A/B/C; outgoing bay terminals to transformer primary. Voltage class follows the editable worksheet values.",
      },
      disconnectors: {
        name: "Disconnectors and earth switch",
        label: "Disconnector + earth switch",
        function:
          "Disconnectors isolate equipment after the circuit breaker has interrupted current. An earth switch bonds an isolated section only after approved isolation and prove-dead procedures.",
        terminals:
          "Line side / bus side poles; earth switch to station earth grid. These devices are not load-break substitutes.",
      },
      breaker: {
        name: "Receiving circuit breaker",
        label: "Circuit breaker",
        function:
          "The circuit breaker interrupts load current and, within its rating and protection scheme, fault current to isolate a line or transformer bay.",
        terminals:
          "Three poles between line bay and bus/transformer bay; trip coil is controlled by protection.",
      },
      ctvt: {
        name: "Current and voltage transformers · CT/VT",
        label: "CT / VT",
        function:
          "Instrument transformers provide scaled, isolated signals for meters, relays and monitoring. Their ratios, burdens and polarity are equipment-specific.",
        terminals:
          "Primary conductors A/B/C; secondary CT and VT circuits to protection and metering. Never open an energized CT secondary.",
      },
      surgeArrester: {
        name: "Surge arrester",
        label: "Surge arrester",
        function:
          "The arrester limits transient overvoltage by diverting surge current to the station earth system; selection depends on system grounding and insulation coordination.",
        terminals:
          "HV terminal to phase; earth terminal to the local earth grid.",
      },
      receivingTransformer: {
        name: "Receiving step-down transformer",
        label: "HV → MV transformer",
        function:
          "This transformer reduces the transmission voltage to the distribution level shown in the worksheet. The diagram's winding connection is illustrative; actual vector group and neutral grounding are site-specific.",
        terminals:
          "HV primary A/B/C; MV secondary a/b/c and the shown neutral point where configured; tank bonded to PE/earth.",
      },
      mvFeeder: {
        name: "Medium-voltage bus and feeder",
        label: "MV bus · outgoing feeders",
        function:
          "The bus distributes the receiving-transformer output to protected outgoing circuits. Feeder sections can supply local substations or distribution transformers.",
        terminals:
          "Three-phase MV bus A/B/C; each feeder has its own switching and protection boundary.",
      },
      recloser: {
        name: "Feeder recloser",
        label: "Recloser",
        function:
          "A recloser detects and interrupts feeder faults and may make configured reclose attempts. Settings and coordination must follow the approved protection study.",
        terminals:
          "Three-phase series device on the feeder; sensing and trip connections follow the selected recloser design.",
      },
      distributionTransformer: {
        name: "Local distribution transformer",
        label: "MV → LV transformer",
        function:
          "The local transformer steps medium voltage down to the consumer service voltage. A grounded-star secondary can provide three phases and neutral; its tank is separately bonded to PE.",
        terminals:
          "MV primary A/B/C; LV secondary a/b/c/N as configured; tank/frame PE to earth. N and PE remain distinct.",
      },
      feederPillar: {
        name: "Low-voltage feeder pillar",
        label: "LV feeder pillar",
        function:
          "The feeder pillar distributes and protects outgoing low-voltage circuits for local service branches; fuse and breaker arrangements vary by network.",
        terminals:
          "Three phases L1/L2/L3 plus neutral N on the shown four-wire service; protective bonding is a separate PE path.",
      },
      houseService: {
        name: "Residential service entry and meter",
        label: "House · service meter",
        function:
          "The service drop supplies the premises through the utility meter and service protective device. The drawing is a functional teaching path, not installation wiring advice.",
        terminals:
          "Service conductors to meter and main switch; neutral N and protective earth PE are distinct per the applicable earthing system.",
      },
      mainBoard: {
        name: "Residential main board",
        label: "Main board · final circuits",
        function:
          "The main board divides supply into protected final circuits. Circuit-breaker and residual-current protection choices depend on local rules and the actual installation.",
        terminals:
          "Incoming L1/L2/L3 or selected phase, N bar, PE bar, outgoing protected circuits. N/PE bonding location is system-specific.",
      },
      industrialMcc: {
        name: "Industrial motor control centre · MCC",
        label: "Industry · MCC",
        function:
          "The MCC groups motor feeders and associated switching, overload protection and controls. Each motor circuit must be coordinated with its equipment and duty.",
        terminals:
          "Incoming three-phase bus; outgoing protected motor feeders; enclosure and PE bar bond to protective earth.",
      },
      motor: {
        name: "Three-phase industrial motor",
        label: "Three-phase motor",
        function:
          "The motor converts electrical power to mechanical shaft output. A variable-frequency drive may control speed and torque when the application supports it.",
        terminals:
          "U/V/W phase terminals, motor frame PE; neutral is normally not a motor power terminal.",
      },
      neutral: {
        name: "Neutral conductor · N",
        label: "N · neutral",
        function:
          "Neutral is the grounded-star return conductor in this illustrative low-voltage service. It is not a protective-earth conductor.",
        terminals:
          "Blue schematic conductor N from the configured transformer secondary; never substitute N for PE.",
      },
      protectiveEarth: {
        name: "Protective earth · PE",
        label: "PE · protective bonding",
        function:
          "PE bonds exposed conductive parts to the protective earthing system. It carries fault current under fault conditions and is not a normal load return.",
        terminals:
          "Green/yellow schematic bond from equipment frames and enclosures to the protective earth system. Kept separate from N except at the system-defined bond.",
      },
    },
  },
  de: {
    title: "Empfangs-Umspannwerk bis Verbraucher · auswählbarer Gerätepfad",
    eyebrow: "EMPFANGSUMSPANNWERK · VERTEILUNG · VERBRAUCHER",
    select:
      "Gerät oder Leiter auswählen, um Funktion und dargestellte Klemmen zu prüfen.",
    inspected: "AUSGEWÄHLTES GERÄT",
    connections: "ANSCHLÜSSE / KLEMMEN",
    receiving: "EMPFANGSUMSPANNWERK",
    distribution: "PRIMÄR- UND SEKUNDÄRVERTEILUNG",
    customers: "VERBRAUCHER",
    illustrative: "BEISPIELHAFTE VERBINDUNGEN · KEIN BESTANDSNETZ",
    path: "Übertragungsquelle",
    items: {
      receivingBay: {
        name: "Leitungsfeld im Empfangsumspannwerk",
        label: "Leitungsfeld · HS-Einspeisung",
        function:
          "Das Leitungsfeld nimmt den Übertragungskreis auf und ermöglicht gesteuertes Schalten, Messen und Schützen vor dem Empfangstransformator.",
        terminals:
          "Dreiphasiger Eingang A/B/C; Abgänge zum Transformator. Die Spannungsklasse folgt den bearbeitbaren Arbeitsblattwerten.",
      },
      disconnectors: {
        name: "Trenner und Erdungsschalter",
        label: "Trenner + Erdungsschalter",
        function:
          "Trenner isolieren Betriebsmittel, nachdem der Leistungsschalter den Strom unterbrochen hat. Erdungsschalter verbinden einen freigeschalteten Teil erst nach Freischaltung und Spannungsfreiheitsprüfung mit Erde.",
        terminals:
          "Leitungs-/Sammelschienenseite; Erdungsschalter zum Stations-Erdungsnetz. Kein Ersatz für Lastschalter.",
      },
      breaker: {
        name: "Leistungsschalter des Empfangsfelds",
        label: "Leistungsschalter",
        function:
          "Der Leistungsschalter unterbricht Laststrom und innerhalb seiner Auslegung auch Fehlerstrom, um Leitung oder Transformatorfeld abzutrennen.",
        terminals:
          "Drei Pole zwischen Leitungs- und Sammelschienen-/Transformatorfeld; Auslösung durch Schutz.",
      },
      ctvt: {
        name: "Strom- und Spannungswandler · CT/VT",
        label: "CT / VT",
        function:
          "Messwandler liefern angepasste, isolierte Signale für Zähler, Relais und Überwachung. Übersetzung, Bürde und Polarität sind anlagenspezifisch.",
        terminals:
          "Primärleiter A/B/C; Sekundärkreise zu Schutz und Messung. Einen bestromten CT-Sekundärkreis niemals öffnen.",
      },
      surgeArrester: {
        name: "Überspannungsableiter",
        label: "Überspannungsableiter",
        function:
          "Der Ableiter begrenzt transiente Überspannungen und leitet Stoßstrom zur Stations-Erde ab; Auswahl nach Erdung und Isolationskoordination.",
        terminals:
          "HV-Anschluss zur Phase; Erdanschluss zum örtlichen Erdungsnetz.",
      },
      receivingTransformer: {
        name: "Empfangs-Transformator",
        label: "HS → MS-Transformator",
        function:
          "Der Transformator senkt die Übertragungsspannung auf die im Arbeitsblatt gezeigte Verteilspannung. Wicklungsschaltung beispielhaft; Vektorgruppe und Erdung sind standortspezifisch.",
        terminals:
          "HS-Primär A/B/C; MS-Sekundär a/b/c und Neutralpunkt, falls vorhanden; Kessel an PE/Erde.",
      },
      mvFeeder: {
        name: "Mittelspannungssammelschiene und Abgang",
        label: "MS-Sammelschiene · Abgänge",
        function:
          "Die Sammelschiene verteilt die Transformatorleistung auf geschützte Abgänge zu örtlichen Umspannwerken oder Verteiltransformatoren.",
        terminals:
          "Dreiphasige MS-Sammelschiene A/B/C; jeder Abgang hat eigene Schalt- und Schutzgrenzen.",
      },
      recloser: {
        name: "Wiedereinschalter am Abgang",
        label: "Wiedereinschalter",
        function:
          "Ein Wiedereinschalter erkennt und unterbricht Abgangsfehler und kann konfigurierte Wiedereinschaltversuche ausführen. Einstellungen nach Schutzstudie.",
        terminals:
          "Dreiphasiges Seriengerät im Abgang; Messung und Auslösung gemäß Gerätetyp.",
      },
      distributionTransformer: {
        name: "Örtlicher Verteiltransformator",
        label: "MS → NS-Transformator",
        function:
          "Der Verteiltransformator senkt Mittelspannung auf die Verbraucherspannung. Eine geerdete Sternwicklung kann drei Phasen und Neutralleiter bereitstellen; Tank/PE ist separat.",
        terminals:
          "MS-Primär A/B/C; NS-Sekundär a/b/c/N nach Ausführung; Tank/PE zur Erde. N und PE bleiben getrennt.",
      },
      feederPillar: {
        name: "Niederspannungs-Verteilerschrank",
        label: "NS-Verteilerschrank",
        function:
          "Der Verteilerschrank verteilt und schützt abgehende Niederspannungskreise; Sicherungs- und Schalteranordnung ist netzabhängig.",
        terminals:
          "Drei Phasen L1/L2/L3 plus N im dargestellten Vierleiternetz; PE ist ein eigener Schutzpfad.",
      },
      houseService: {
        name: "Hausanschluss und Zähler",
        label: "Wohnhaus · Zähler",
        function:
          "Der Hausanschluss versorgt die Anlage über Zähler und Hausanschlussschutz. Die Darstellung ist kein Installationsratgeber.",
        terminals:
          "Anschluss zum Zähler und Hauptschalter; N und PE sind im jeweiligen Erdungssystem getrennt.",
      },
      mainBoard: {
        name: "Hausverteiler",
        label: "Hausverteiler · Endstromkreise",
        function:
          "Der Hausverteiler teilt die Versorgung auf geschützte Endstromkreise. Schutzgeräte richten sich nach Normen und konkreter Anlage.",
        terminals:
          "Eingang L1/L2/L3 oder Phase, N-Schiene, PE-Schiene und geschützte Abgänge. N/PE-Verbindung ist systemabhängig.",
      },
      industrialMcc: {
        name: "Motor-Control-Center · MCC",
        label: "Industrie · MCC",
        function:
          "Das MCC gruppiert Motorabgänge mit Schaltung, Überlastschutz und Steuerung. Jeder Motorstromkreis muss passend koordiniert werden.",
        terminals:
          "Dreiphasiger Eingang; geschützte Motorabgänge; Gehäuse und PE-Schiene an Schutzleiter.",
      },
      motor: {
        name: "Drehstrom-Industriemotor",
        label: "Drehstrommotor",
        function:
          "Der Motor wandelt elektrische Energie in mechanische Wellenleistung um. Ein Umrichter kann Drehzahl und Drehmoment regeln.",
        terminals:
          "U/V/W-Phasenklemmen, Motorgehäuse-PE; Neutralleiter ist normalerweise kein Motoranschluss.",
      },
      neutral: {
        name: "Neutralleiter · N",
        label: "N · Neutralleiter",
        function:
          "N ist der Rückleiter des geerdeten Sternpunkts im beispielhaften Niederspannungsnetz. Er ist kein Schutzleiter.",
        terminals:
          "Blau dargestellter Leiter N ab Transformator-Sekundärseite; N niemals anstelle von PE verwenden.",
      },
      protectiveEarth: {
        name: "Schutzleiter · PE",
        label: "PE · Schutzpotentialausgleich",
        function:
          "PE verbindet berührbare leitfähige Teile mit dem Schutzerdungssystem. Er führt Fehlerstrom, aber keinen normalen Laststrom.",
        terminals:
          "Grün-gelbe Verbindung von Gehäusen zum PE-System; getrennt von N außer an der systemdefinierten Verbindung.",
      },
    },
  },
  yo: {
    title: "Receiving substation sí ọ̀dọ̀ oníbàárà · ọ̀nà ẹ̀rọ tí a lè yan",
    eyebrow: "RECEIVING SUBSTATION · DISTRIBUTION · ONÍBÀÁRÀ",
    select: "Yan ẹ̀rọ tàbí waya láti ṣàyẹ̀wò iṣẹ́ rẹ̀ àti àwọn terminal tó hàn.",
    inspected: "Ẹ̀RỌ TÍ A YAN",
    connections: "ASỌ̀RỌ / TERMINALS",
    receiving: "RECEIVING SUBSTATION",
    distribution: "PRIMARY ÀTI SECONDARY DISTRIBUTION",
    customers: "ONÍBÀÁRÀ",
    illustrative: "ÀPẸẸRẸ ASỌ̀RỌ · KÌ Í ṢE NETWORK GIDI",
    path: "Orísun transmission",
    items: {
      receivingBay: {
        name: "Receiving substation line bay",
        label: "Line bay · HV entry",
        function:
          "Line bay gba transmission circuit wọlé, ó sì pèsè switching, measurement àti protection kí ó tó dé transformer.",
        terminals:
          "Incoming phase mẹ́ta A/B/C; terminals sí transformer primary. Voltage tẹ̀lé iye worksheet tó ṣeé ṣàtúnṣe.",
      },
      disconnectors: {
        name: "Disconnector àti earth switch",
        label: "Disconnector + earth switch",
        function:
          "Disconnector ya equipment sọ́tọ̀ lẹ́yìn tí circuit breaker gé current. Earth switch so apá tí a ya mọ́ earth lẹ́yìn isolation àti prove-dead tó yẹ.",
        terminals:
          "Ẹ̀gbẹ́ line / bus; earth switch sí station earth grid. Kì í ṣe load-break device.",
      },
      breaker: {
        name: "Circuit breaker receiving",
        label: "Circuit breaker",
        function:
          "Circuit breaker ń gé load current àti fault current gẹ́gẹ́ bí rating rẹ̀ láti ya line tàbí transformer bay sọ́tọ̀.",
        terminals:
          "Poles mẹ́ta láàárín line bay àti bus/transformer bay; protection ló ń paṣẹ trip.",
      },
      ctvt: {
        name: "Current àti voltage transformers · CT/VT",
        label: "CT / VT",
        function:
          "CT/VT ń fún meter, relay àti monitoring ní signal tó dínkù, tó sì ya sọ́tọ̀. Ratio àti polarity jẹ́ ti equipment pàtó.",
        terminals:
          "Primary wires A/B/C; secondary circuits sí protection àti meter. Má ṣí CT secondary tó ń ṣiṣẹ́.",
      },
      surgeArrester: {
        name: "Surge arrester",
        label: "Surge arrester",
        function:
          "Arrester ń dín transient overvoltage kù, ó sì ń darí surge current sí station earth; yíyan rẹ̀ tẹ̀lé grounding àti insulation coordination.",
        terminals:
          "HV terminal sí phase; earth terminal sí station earth grid.",
      },
      receivingTransformer: {
        name: "Receiving step-down transformer",
        label: "HV → MV transformer",
        function:
          "Transformer yìí ń dín transmission voltage kù sí distribution voltage tó hàn nínú worksheet. Winding diagram jẹ́ àpẹẹrẹ; vector group àti grounding jẹ́ ti site.",
        terminals:
          "HV primary A/B/C; MV secondary a/b/c àti neutral bí ó bá wà; tank so mọ́ PE/earth.",
      },
      mvFeeder: {
        name: "MV bus àti feeder",
        label: "MV bus · outgoing feeders",
        function:
          "Bus ń pín output transformer sí outgoing circuits tó ní protection fún substation agbègbè tàbí distribution transformer.",
        terminals:
          "MV phase mẹ́ta A/B/C; feeder kọ̀ọ̀kan ní switching àti protection tirẹ̀.",
      },
      recloser: {
        name: "Feeder recloser",
        label: "Recloser",
        function:
          "Recloser ń rí fault feeder, ó ń gé e, ó sì lè gbìyànjú reclose tó wà nínú setting. Protection study ló yẹ kí ó darí settings.",
        terminals:
          "Ẹ̀rọ phase mẹ́ta lórí feeder; sensing àti trip tẹ̀lé design recloser.",
      },
      distributionTransformer: {
        name: "Local distribution transformer",
        label: "MV → LV transformer",
        function:
          "Transformer agbègbè ń dín MV kù sí service voltage. Grounded-star secondary lè pèsè phase mẹ́ta àti neutral; tank PE yàtọ̀.",
        terminals:
          "MV primary A/B/C; LV secondary a/b/c/N gẹ́gẹ́ bí configuration; tank so mọ́ PE/earth. N àti PE yàtọ̀.",
      },
      feederPillar: {
        name: "LV feeder pillar",
        label: "LV feeder pillar",
        function:
          "Feeder pillar ń pín outgoing low-voltage circuits, ó sì ń dáàbò bo wọ́n; fuse/breaker arrangement yàtọ̀ sí network.",
        terminals:
          "L1/L2/L3 àti N lórí four-wire service; PE jẹ́ ọ̀nà ìdáàbòbò tirẹ̀.",
      },
      houseService: {
        name: "House service entry àti meter",
        label: "Ilé · service meter",
        function:
          "Service drop ń pèsè ilé gba meter àti service protection. Àwòrán yìí jẹ́ ọ̀nà ẹ̀kọ́, kì í ṣe ìmọ̀ràn wiring.",
        terminals:
          "Service conductors sí meter àti main switch; neutral N àti earth PE yàtọ̀ gẹ́gẹ́ bí earthing system.",
      },
      mainBoard: {
        name: "Residential main board",
        label: "Main board · final circuits",
        function:
          "Main board ń pín agbára sí final circuits tó ní protection; breaker/RCD yíyan tẹ̀lé installation àti rules agbègbè.",
        terminals:
          "Incoming L1/L2/L3 tàbí phase kan, N bar, PE bar àti protected circuits. Ibi N/PE bond jẹ́ ti system.",
      },
      industrialMcc: {
        name: "Industrial motor control centre · MCC",
        label: "Ilé-iṣẹ́ · MCC",
        function:
          "MCC ń ṣètò motor feeders pẹ̀lú switching, overload protection àti controls. Motor circuit kọ̀ọ̀kan nílò coordination tó yẹ.",
        terminals:
          "Incoming phase mẹ́ta; outgoing motor feeders tó ní protection; enclosure àti PE bar so mọ́ earth.",
      },
      motor: {
        name: "Three-phase industrial motor",
        label: "Motor phase mẹ́ta",
        function:
          "Motor ń yí electrical power sí mechanical shaft output. VFD lè ṣàkóso speed àti torque bí iṣẹ́ náà bá yẹ.",
        terminals:
          "U/V/W phase terminals àti motor frame PE; neutral kì í sábà jẹ́ motor terminal.",
      },
      neutral: {
        name: "Neutral conductor · N",
        label: "N · neutral",
        function:
          "Neutral ni return conductor grounded-star nínú àpẹẹrẹ low-voltage. Kì í ṣe protective earth.",
        terminals:
          "Blue wire N láti transformer secondary gẹ́gẹ́ bí a ṣe ṣètò; má lo N dípò PE.",
      },
      protectiveEarth: {
        name: "Protective earth · PE",
        label: "PE · earth bonding",
        function:
          "PE so exposed metal mọ́ earthing system; ó ń gbé fault current nígbà fault, kì í ṣe normal load return.",
        terminals:
          "Green/yellow bond láti frames/enclosures sí PE system. Ó yàtọ̀ sí N àyàfi bond ibi tí system sọ.",
      },
    },
  },
  pcm: {
    title: "Receiving substation reach consumers · selectable equipment path",
    eyebrow: "RECEIVING SUBSTATION · DISTRIBUTION · CUSTOMERS",
    select:
      "Select device or wire to check wetin e do and the terminals we show.",
    inspected: "EQUIPMENT WEY YOU SELECT",
    connections: "CONNECTIONS / TERMINALS",
    receiving: "RECEIVING SUBSTATION",
    distribution: "PRIMARY AND SECONDARY DISTRIBUTION",
    customers: "CUSTOMERS",
    illustrative: "SAMPLE CONNECTIONS · NO BE AS-BUILT NETWORK",
    path: "Transmission source",
    items: {
      receivingBay: {
        name: "Receiving substation line bay",
        label: "Line bay · HV entry",
        function:
          "Line bay collect transmission circuit, then arrange controlled switching, measurement and protection before receiving transformer.",
        terminals:
          "Three-phase incoming A/B/C; outgoing terminals go transformer primary. Voltage follow editable worksheet values.",
      },
      disconnectors: {
        name: "Disconnectors and earth switch",
        label: "Disconnector + earth switch",
        function:
          "Disconnectors isolate equipment after breaker don interrupt current. Earth switch bond isolated section only after approved isolation and prove-dead.",
        terminals:
          "Line side / bus side; earth switch go station earth grid. No use am to replace load-break device.",
      },
      breaker: {
        name: "Receiving circuit breaker",
        label: "Circuit breaker",
        function:
          "Circuit breaker interrupt load current and, inside its rating, fault current to isolate line or transformer bay.",
        terminals:
          "Three poles between line bay and bus/transformer bay; protection control trip.",
      },
      ctvt: {
        name: "Current and voltage transformers · CT/VT",
        label: "CT / VT",
        function:
          "CT and VT provide scaled isolated signals for meters, relays and monitoring. Ratio and polarity depend on the equipment.",
        terminals:
          "Primary wires A/B/C; secondary circuits go protection and metering. No open live CT secondary.",
      },
      surgeArrester: {
        name: "Surge arrester",
        label: "Surge arrester",
        function:
          "Arrester limit transient overvoltage and divert surge current to station earth; selection depend on grounding and insulation coordination.",
        terminals:
          "HV terminal to phase; earth terminal to station earth grid.",
      },
      receivingTransformer: {
        name: "Receiving step-down transformer",
        label: "HV → MV transformer",
        function:
          "This transformer reduce transmission voltage to distribution voltage wey worksheet show. Winding connection na example; real vector group and grounding depend on site.",
        terminals:
          "HV primary A/B/C; MV secondary a/b/c and neutral if e dey; tank bond to PE/earth.",
      },
      mvFeeder: {
        name: "Medium-voltage bus and feeder",
        label: "MV bus · outgoing feeders",
        function:
          "Bus share transformer output to protected outgoing circuits for local substations or distribution transformers.",
        terminals:
          "Three-phase MV bus A/B/C; each feeder get its own switching and protection.",
      },
      recloser: {
        name: "Feeder recloser",
        label: "Recloser",
        function:
          "Recloser detect and interrupt feeder faults and fit try configured reclosing. Approved protection study suppose guide settings.",
        terminals:
          "Three-phase series device on feeder; sensing and trip follow recloser design.",
      },
      distributionTransformer: {
        name: "Local distribution transformer",
        label: "MV → LV transformer",
        function:
          "Local transformer step medium voltage down to consumer service voltage. Grounded-star secondary fit provide three phases and neutral; tank PE remain separate.",
        terminals:
          "MV primary A/B/C; LV secondary a/b/c/N as configured; tank bond to PE/earth. N no be PE.",
      },
      feederPillar: {
        name: "Low-voltage feeder pillar",
        label: "LV feeder pillar",
        function:
          "Feeder pillar share and protect outgoing low-voltage circuits; fuse and breaker arrangements depend on network.",
        terminals:
          "L1/L2/L3 plus N on the four-wire service; PE na separate safety path.",
      },
      houseService: {
        name: "Residential service entry and meter",
        label: "House · service meter",
        function:
          "Service drop supply premises through utility meter and service protection. The drawing no be wiring instruction.",
        terminals:
          "Service conductors go meter and main switch; neutral N and protective earth PE remain different.",
      },
      mainBoard: {
        name: "Residential main board",
        label: "Main board · final circuits",
        function:
          "Main board split supply into protected final circuits. Breaker and RCD choice depend on local rules and actual installation.",
        terminals:
          "Incoming L1/L2/L3 or phase, N bar, PE bar and outgoing protected circuits. N/PE bond depend on the earthing system.",
      },
      industrialMcc: {
        name: "Industrial motor control centre · MCC",
        label: "Industry · MCC",
        function:
          "MCC group motor feeders with switching, overload protection and control. Each motor circuit need coordination for its duty.",
        terminals:
          "Incoming three-phase bus; outgoing protected motor feeders; enclosure and PE bar bond to earth.",
      },
      motor: {
        name: "Three-phase industrial motor",
        label: "Three-phase motor",
        function:
          "Motor turn electrical power to mechanical shaft output. VFD fit control speed and torque when the application support am.",
        terminals:
          "U/V/W phase terminals and motor frame PE; neutral no dey normally serve motor power.",
      },
      neutral: {
        name: "Neutral conductor · N",
        label: "N · neutral",
        function:
          "Neutral na grounded-star return conductor for this low-voltage example. E no be protective earth.",
        terminals:
          "Blue schematic N from configured transformer secondary; no use N instead of PE.",
      },
      protectiveEarth: {
        name: "Protective earth · PE",
        label: "PE · protective bonding",
        function:
          "PE bond exposed metal parts to safety earth. E carry fault current during fault, no be normal load return.",
        terminals:
          "Green/yellow bond from frames and enclosures to PE system; keep am separate from N except system-defined bond.",
      },
    },
  },
};

function Device({
  id,
  selected,
  onSelect,
  label,
  children,
}: {
  id: EquipmentId;
  selected: EquipmentId;
  onSelect: (id: EquipmentId) => void;
  label: string;
  children: ReactNode;
}) {
  const key = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id);
    }
  };
  return (
    <g
      className={`pg-pick${selected === id ? " is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Inspect: ${label}`}
      aria-pressed={selected === id}
      onClick={() => onSelect(id)}
      onKeyDown={key}
    >
      {children}
    </g>
  );
}

export function DistributionNetworkScene({
  locale,
  inputs,
  selected,
  onSelect: setSelected,
}: {
  locale: Locale;
  inputs: PowerGridInputs;
  selected: EquipmentId;
  onSelect: (asset: EquipmentId) => void;
}) {
  const text = copy[locale];
  const item = text.items[selected];
  const receivingKV = inputs.raisedVoltageKV;
  const mediumKV = inputs.distributionVoltageKV;
  const consumerKV = inputs.consumerVoltageKV;
  return (
    <section
      className="panel panel-pad pg-station pg-downstream"
      aria-labelledby="pg-downstream-title"
    >
      <header className="pg-station-heading">
        <div>
          <span className="eyebrow">{text.eyebrow}</span>
          <h3 id="pg-downstream-title">{text.title}</h3>
        </div>
        <span className="pg-station-disclaimer">{text.illustrative}</span>
      </header>
      <p className="pg-downstream-note">
        {text.select} {receivingKV} kV → {mediumKV} kV → {consumerKV} kV
      </p>
      <div
        className="pg-station-scroll"
        role="region"
        aria-label={text.title}
        tabIndex={0}
      >
        <svg
          className="pg-station-svg pg-downstream-svg"
          viewBox="0 0 1640 600"
          role="group"
          aria-labelledby="pg-downstream-svg-title"
        >
          <title id="pg-downstream-svg-title">{text.title}</title>
          <rect
            x="1"
            y="1"
            width="1638"
            height="598"
            rx="12"
            className="pg-station-bg"
          />
          <text x="22" y="32" className="pg-svg-kicker">
            {text.illustrative}
          </text>
          <rect
            x="244"
            y="70"
            width="480"
            height="420"
            rx="12"
            className="pg-downstream-yard"
          />
          <rect
            x="748"
            y="70"
            width="510"
            height="420"
            rx="12"
            className="pg-downstream-feeders"
          />
          <text x="265" y="99" className="pg-svg-label">
            {text.receiving} · {receivingKV} kV
          </text>
          <text x="772" y="99" className="pg-svg-label">
            {text.distribution} · {mediumKV} / {consumerKV} kV
          </text>
          <text x="1290" y="99" className="pg-svg-label">
            {text.customers}
          </text>
          <path d="M22 150h138" className="pg-shield-wire" />
          <path d="M22 188h212M22 218h212M22 248h212" className="pg-wire-a" />
          <path
            d="M22 218h212"
            className="pg-wire-b"
            transform="translate(0 16)"
          />
          <path
            d="M22 218h212"
            className="pg-wire-c"
            transform="translate(0 46)"
          />
          <Device
            id="receivingBay"
            selected={selected}
            onSelect={setSelected}
            label={text.items.receivingBay.label}
          >
            <path d="M34 276h198v82H34z" fill="#16273a" stroke="#71859b" />
            <path d="M42 292h180M42 318h180M42 344h180" className="pg-wire-a" />
            <text x="44" y="383" className="pg-svg-small">
              {text.path}
            </text>
          </Device>
          <Device
            id="disconnectors"
            selected={selected}
            onSelect={setSelected}
            label={text.items.disconnectors.label}
          >
            {[188, 218, 248].map((y) => (
              <g key={y}>
                <path d={`M245 ${y}h28m8-9 18 18`} className="pg-switch-line" />
                <circle cx="273" cy={y} r="3" className="pg-device-dot" />
              </g>
            ))}
            <text x="238" y="281" className="pg-svg-tiny">
              {text.items.disconnectors.label}
            </text>
          </Device>
          <Device
            id="breaker"
            selected={selected}
            onSelect={setSelected}
            label={text.items.breaker.label}
          >
            <rect
              x="315"
              y="197"
              width="54"
              height="68"
              rx="5"
              className="pg-device-box"
            />
            <path d="M326 231h32m-16-17v34" className="pg-device-symbol" />
            <text x="314" y="282" className="pg-svg-tiny">
              {text.items.breaker.label}
            </text>
          </Device>
          <Device
            id="ctvt"
            selected={selected}
            onSelect={setSelected}
            label={text.items.ctvt.label}
          >
            <circle cx="402" cy="203" r="12" className="pg-device-coil" />
            <circle cx="402" cy="233" r="12" className="pg-device-coil" />
            <circle cx="402" cy="263" r="12" className="pg-device-coil" />
            <text x="385" y="294" className="pg-svg-small">
              CT / VT
            </text>
          </Device>
          <Device
            id="surgeArrester"
            selected={selected}
            onSelect={setSelected}
            label={text.items.surgeArrester.label}
          >
            {[196, 228, 260].map((y) => (
              <g key={y}>
                <path
                  d={`M449 ${y}v13l-8 8 16 8-16 8 16 8-8 8v10`}
                  className="pg-arrester"
                />
                <path d={`M449 ${y + 75}v26`} className="pg-ground-line" />
              </g>
            ))}
            <text x="458" y="293" className="pg-svg-tiny">
              {text.items.surgeArrester.label}
            </text>
          </Device>
          <Device
            id="receivingTransformer"
            selected={selected}
            onSelect={setSelected}
            label={`${text.items.receivingTransformer.label} ${receivingKV} kV / ${mediumKV} kV`}
          >
            <rect
              x="515"
              y="174"
              width="156"
              height="151"
              rx="10"
              className="pg-transformer-tank"
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`M${532 + i * 19} 191v113`}
                className="pg-transformer-fin"
              />
            ))}
            <path
              d="M540 168v-22m35 22v-22m35 22v-22m-64 164v29m35-29v29m35-29v29"
              className="pg-transformer-bushing"
            />
            <circle cx="625" cy="159" r="18" className="pg-transformer-coil" />
            <circle cx="625" cy="348" r="18" className="pg-transformer-coil" />
            <text x="520" y="373" className="pg-svg-small">
              {receivingKV} kV → {mediumKV} kV
            </text>
          </Device>
          <Device
            id="mvFeeder"
            selected={selected}
            onSelect={setSelected}
            label={text.items.mvFeeder.label}
          >
            <path d="M685 201h50M685 231h50M685 261h50" className="pg-busbar" />
            <text x="686" y="293" className="pg-svg-tiny">
              {text.items.mvFeeder.label}
            </text>
          </Device>
          <Device
            id="recloser"
            selected={selected}
            onSelect={setSelected}
            label={text.items.recloser.label}
          >
            <rect
              x="774"
              y="177"
              width="66"
              height="110"
              rx="7"
              className="pg-device-box"
            />
            <path
              d="M807 186v29m-13 0 26 18-26 18 26 18-13 11"
              className="pg-device-symbol"
            />
            <text x="772" y="308" className="pg-svg-small">
              {text.items.recloser.label}
            </text>
          </Device>
          <path
            d="M840 201h194M840 231h194M840 261h194"
            className="pg-wire-a"
          />
          <path
            d="M840 231h194"
            className="pg-wire-b"
            transform="translate(0 16)"
          />
          <path
            d="M840 231h194"
            className="pg-wire-c"
            transform="translate(0 46)"
          />
          <Device
            id="distributionTransformer"
            selected={selected}
            onSelect={setSelected}
            label={`${text.items.distributionTransformer.label} ${mediumKV} kV / ${consumerKV} kV`}
          >
            <path
              d="M1048 170v-70m-21 71h42m-38-16 34 32m-34 0 34-32m-29 32 8 42m8-42-8 42"
              className="pg-pole"
            />
            <rect
              x="1020"
              y="196"
              width="58"
              height="45"
              rx="6"
              className="pg-transformer-tank"
            />
            <path
              d="M1027 201v34m8-34v34m8-34v34m8-34v34m8-34v34m8-34v34"
              className="pg-transformer-fin"
            />
            <path
              d="M1030 190v-12m15 12v-12m15 12v-12"
              className="pg-transformer-bushing"
            />
            <text x="994" y="284" className="pg-svg-tiny">
              {mediumKV} kV / {consumerKV} kV
            </text>
          </Device>
          <Device
            id="feederPillar"
            selected={selected}
            onSelect={setSelected}
            label={text.items.feederPillar.label}
          >
            <rect
              x="1120"
              y="325"
              width="94"
              height="104"
              rx="5"
              className="pg-device-box"
            />
            <path d="M1140 345v60m25-60v60m25-60v60" className="pg-wire-a" />
            <path d="M1190 345v60" className="pg-neutral-wire" />
            <text x="1119" y="449" className="pg-svg-tiny">
              {text.items.feederPillar.label}
            </text>
          </Device>
          <path
            d="M1078 392h42M1214 350h68M1214 375h68M1214 400h68"
            className="pg-wire-a"
          />
          <path d="M1214 425h68" className="pg-neutral-wire" />
          <path d="M1078 454h210" className="pg-ground-line" />
          <text x="1084" y="471" className="pg-svg-tiny">
            N · neutral
          </text>
          <text x="1174" y="471" className="pg-svg-tiny">
            PE · separate protective earth
          </text>
          <Device
            id="houseService"
            selected={selected}
            onSelect={setSelected}
            label={text.items.houseService.label}
          >
            <path d="M1304 245 1372 188l68 57v111h-136z" className="pg-house" />
            <path d="M1317 253h110v89h-110z" className="pg-house-wall" />
            <path d="M1361 254v88m-44-43h110" className="pg-house-window" />
            <rect
              x="1290"
              y="372"
              width="36"
              height="49"
              rx="4"
              className="pg-meter"
            />
            <text x="1301" y="446" className="pg-svg-small">
              {text.items.houseService.label}
            </text>
          </Device>
          <Device
            id="mainBoard"
            selected={selected}
            onSelect={setSelected}
            label={text.items.mainBoard.label}
          >
            <rect
              x="1444"
              y="278"
              width="76"
              height="112"
              rx="5"
              className="pg-device-box"
            />
            <path d="M1461 293v76m21-76v76m21-76v76" className="pg-wire-a" />
            <path d="M1503 293v76" className="pg-neutral-wire" />
            <text x="1440" y="414" className="pg-svg-tiny">
              {text.items.mainBoard.label}
            </text>
          </Device>
          <Device
            id="industrialMcc"
            selected={selected}
            onSelect={setSelected}
            label={text.items.industrialMcc.label}
          >
            <rect
              x="1304"
              y="490"
              width="126"
              height="74"
              rx="5"
              className="pg-device-box"
            />
            <path
              d="M1320 505h92m-92 15h92m-92 15h92"
              className="pg-device-symbol"
            />
            <text x="1313" y="558" className="pg-svg-tiny">
              {text.items.industrialMcc.label}
            </text>
          </Device>
          <Device
            id="motor"
            selected={selected}
            onSelect={setSelected}
            label={text.items.motor.label}
          >
            <circle cx="1512" cy="526" r="32" className="pg-motor-circle" />
            <text x="1503" y="531" className="pg-svg-label">
              M
            </text>
            <path d="M1430 515h50m0 22h-50" className="pg-wire-a" />
          </Device>
          <Device
            id="neutral"
            selected={selected}
            onSelect={setSelected}
            label={text.items.neutral.label}
          >
            <path d="M1078 392v33h42m94 0h74" className="pg-neutral-wire" />
          </Device>
          <Device
            id="protectiveEarth"
            selected={selected}
            onSelect={setSelected}
            label={text.items.protectiveEarth.label}
          >
            <path d="M1100 241v211" className="pg-ground-line" />
            <path
              d="M1084 454h32m-27 7h22m-16 7h10"
              className="pg-ground-symbol"
            />
          </Device>
          <path d="M250 520H1270" className="pg-svg-divider" />
          <path d="M277 542h54" className="pg-wire-a" />
          <text x="338" y="547" className="pg-svg-small">
            L1 · brown
          </text>
          <path d="M441 542h54" className="pg-wire-b" />
          <text x="502" y="547" className="pg-svg-small">
            L2 · black
          </text>
          <path d="M606 542h54" className="pg-wire-c" />
          <text x="667" y="547" className="pg-svg-small">
            L3 · grey
          </text>
          <path d="M772 542h54" className="pg-neutral-wire" />
          <text x="833" y="547" className="pg-svg-small">
            N · blue · grounded service neutral
          </text>
          <path d="M1080 542h54" className="pg-ground-line" />
          <text x="1142" y="547" className="pg-svg-small">
            PE · green/yellow protective earth
          </text>
          <text x="24" y="582" className="pg-svg-small">
            {text.illustrative} · phase colors are schematic identifiers; actual
            site connections must come from approved drawings.
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
          <h4>{item.name}</h4>
          <p>{item.function}</p>
        </div>
        <div>
          <span className="eyebrow">{text.connections}</span>
          <p>{item.terminals}</p>
        </div>
      </div>
    </section>
  );
}
