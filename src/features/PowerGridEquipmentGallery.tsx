import { useState } from "react";
import { useT } from "../i18n";

const fieldPhotos = [
  {
    stage: "Hydro generation",
    title: "Bonneville Lock and Dam powerhouse generator",
    image: "./assets/powergrid/field-photos/hydro-generator.jpg",
    alt: "Top of a vertical hydroelectric generating unit inside Bonneville Lock and Dam powerhouse.",
    photographer:
      "John Leonard · U.S. Army Corps of Engineers, Northwestern Division",
    source:
      "https://www.dvidshub.net/image/7443974/generator-bonneville-lock-and-dam",
  },
  {
    stage: "Waterway and dam",
    title: "Water over the Terminus Dam spillway fuse gates",
    image: "./assets/powergrid/field-photos/hydro-spillway.jpg",
    alt: "Water flowing over the fuse gates of the Terminus Dam spillway into the downstream basin.",
    photographer:
      "Ryan Watson · U.S. Army Corps of Engineers, Sacramento District",
    source:
      "https://www.dvidshub.net/image/7741243/water-flows-over-fuse-gates-spillway-terminus-dam",
  },
  {
    stage: "Generator step-up transformer",
    title: "Generator step-up transformer delivered to Fort Randall Dam",
    image: "./assets/powergrid/field-photos/step-up-transformer.jpg",
    alt: "A large generator step-up transformer secured on a rail car during delivery to Fort Randall Powerhouse.",
    photographer:
      "Jason Colbert · U.S. Army Corps of Engineers, Omaha District",
    source:
      "https://www.dvidshub.net/image/7397026/new-generator-step-up-transformers",
  },
  {
    stage: "Receiving substation",
    title: "Al Ameen 400 kV gas-insulated substation",
    image: "./assets/powergrid/field-photos/substation-switchyard.jpg",
    alt: "High-voltage gas-insulated substation bays with tall insulated bushings and metal bus connections.",
    photographer: "U.S. Army courtesy photo · DVIDS",
    source:
      "https://www.dvidshub.net/image/6274/al-ameen-substation-400-kilovolt-gas-insulated-system",
  },
  {
    stage: "Transmission structure · failure case",
    title: "Lattice transmission tower damaged after Hurricane Maria",
    image: "./assets/powergrid/field-photos/transmission-tower-damage.jpg",
    alt: "A damaged steel lattice transmission tower lies across trees after a storm; this is a failure example, not a normal operating condition.",
    photographer: "Eliud Echevarria · Federal Emergency Management Agency",
    source:
      "https://www.dvidshub.net/image/3867225/damaged-electrical-transmission-tower",
  },
  {
    stage: "Solar generation",
    title: "Eglin solar energy array",
    image: "./assets/powergrid/field-photos/solar-array.jpg",
    alt: "Rows of photovoltaic panels across the Eglin solar energy field under a cloudy sky.",
    photographer: "Samuel King Jr. · 96th Test Wing",
    source: "https://www.dvidshub.net/image/7586867/eglin-solar-energy-array",
  },
  {
    stage: "Wind generation · facility-scale example",
    title: "Wind turbine above the Stirling solar array at Tooele",
    image: "./assets/powergrid/field-photos/wind-utility-scale.jpg",
    alt: "A nearly 300-foot wind turbine stands above a solar thermal array at the Tooele Army Depot site.",
    photographer:
      "John Prettyman · U.S. Army Corps of Engineers, Sacramento District",
    source:
      "https://www.dvidshub.net/image/3117643/second-wind-turbine-brings-tooele-army-depot-closer-to-net-zero-energy",
  },
  {
    stage: "Secondary distribution",
    title: "Pole-mounted transformer restored to a residential neighborhood",
    image: "./assets/powergrid/field-photos/distribution-pole-transformer.jpg",
    alt: "A pole-mounted distribution transformer and overhead conductors above a residential street in Puerto Rico.",
    photographer:
      "Staff Sgt. Eric W. Jones · U.S. Army Corps of Engineers, Los Angeles District",
    source: "https://www.dvidshub.net/image/4104461/plane-pole-power-72-hours",
    objectPosition: "center 24%",
  },
];

const fieldVideos = [
  {
    stage: "Hydropower grid support",
    title: "USACE powerhouses support grid demand during a winter storm",
    embed: "https://www.dvidshub.net/video/embed/993768",
    source:
      "https://www.dvidshub.net/video/993768/usace-powerhouses-support-grid-demands-during-2026-winter-storm",
    producer: "Brannen Parrish · U.S. Army Corps of Engineers, Tulsa District",
    context:
      "The source describes Tulsa District hydropower support during the January 2026 winter storm. This is documentary B-roll, not dispatch telemetry or a measured output trace.",
  },
  {
    stage: "Powerhouse and river context",
    title: "Garrison Dam powerhouse and Missouri River time lapse",
    embed: "https://www.dvidshub.net/video/embed/1014627",
    source:
      "https://www.dvidshub.net/video/1014627/garrison-dam-powerhouse-time-lapse",
    producer: "Delanie Stafford · U.S. Army Corps of Engineers, Omaha District",
    context:
      "A 21-second early-morning time lapse of the Garrison Dam hydroelectric powerhouse and Missouri River. It shows facility context, not turbine internals or generation measurements.",
  },
  {
    stage: "Spillway functional flow test",
    title: "Garrison Dam spillway safety modification flow test",
    embed: "https://www.dvidshub.net/video/embed/1015702",
    source:
      "https://www.dvidshub.net/video/1015702/spillway-flow-test-conducted-garrison-dam-safety-modification-project",
    producer: "Delanie Stafford · U.S. Army Corps of Engineers, Omaha District",
    context:
      "Footage documents a June 2026 functional flow test for the Garrison Dam Safety Modification Project. It is a structural test event, not a turbine-output demonstration.",
  },
  {
    stage: "Turbine runner rehabilitation",
    title: "Fort Randall Dam turbine runner placement",
    embed: "https://www.dvidshub.net/video/embed/1026500",
    source:
      "https://www.dvidshub.net/video/1026500/fort-randall-turbine-runner-placement",
    producer: "Makenzie Leonard · U.S. Army Corps of Engineers, Omaha District",
    context:
      "Footage documents a replacement turbine runner being moved into the Fort Randall powerhouse during unit rehabilitation. It shows equipment handling, not a running generator.",
  },
];

const groups = [
  {
    title: "Generation plant equipment",
    image: "./assets/hydro-powerhouse-generator.png",
    alt: "Hydroelectric powerhouse with a large synchronous generator, shaft, turbine casing, controls and an engineer for scale.",
    caption: "Powerhouse training view · hydro turbine-generator set",
    items: [
      [
        "Dam intake, trash rack and gate",
        "The intake admits water, the rack screens debris and the gate regulates flow into the waterway.",
      ],
      [
        "Penstock, wicket gates and draft tube",
        "The penstock delivers pressurized water, guide vanes control its entry to the runner, and the draft tube returns discharge to the tailrace.",
      ],
      [
        "Turbine runner, shaft and governor",
        "The runner converts water energy to shaft torque; the governor adjusts guide-vane position to control speed and output.",
      ],
      [
        "Synchronous generator: stator, rotor and terminals",
        "The driven rotor field induces three-phase voltage in the stator; terminal boards identify the machine leads and any neutral point.",
      ],
      [
        "Exciter, AVR, bearings and cooling",
        "The excitation system supplies and regulates rotor field current; bearing lubrication and cooling systems manage mechanical and thermal limits.",
      ],
    ],
  },
  {
    title: "Steam and gas generation equipment",
    image: "./assets/thermal-gas-powerhouse.png",
    alt: "Combined-cycle power hall showing a gas turbine, heat-recovery boiler, steam turbine, condenser pipework and generator.",
    caption:
      "Thermal plant training view · gas and steam turbine-generator train",
    items: [
      [
        "Gas turbine compressor, combustor and expander",
        "The compressor raises air pressure, combustion adds heat, and expanding gas turns the turbine shaft.",
      ],
      [
        "Boiler or heat-recovery steam generator",
        "A boiler supplies steam from fuel heat; a heat-recovery unit uses turbine exhaust to raise steam in a combined-cycle plant.",
      ],
      [
        "Steam turbine and shaft coupling",
        "Steam expansion turns turbine stages that transmit mechanical torque through a coupled shaft to the generator.",
      ],
      [
        "Condenser and cooling-water system",
        "The condenser returns exhaust steam to water and rejects heat through the plant's designed cooling system.",
      ],
      [
        "Governor, generator and excitation",
        "Controls regulate prime-mover power and generator field; protection trips the unit when configured limits are exceeded.",
      ],
    ],
  },
  {
    title: "Step-up transformer and switchyard",
    image: "./assets/grid-transformer-switchyard.png",
    alt: "Large power transformer with bushings, radiators, control cabinet and outdoor switchyard equipment.",
    caption: "Switchyard training view · transformer and primary equipment",
    items: [
      [
        "Generator step-up transformer and bushings",
        "The transformer raises generator voltage for transmission; bushings bring insulated winding terminals through the grounded tank.",
      ],
      [
        "Tap changer, conservator and radiators",
        "A tap changer adjusts the turns ratio within its design; the oil system and radiators transfer heat away from the windings.",
      ],
      [
        "Buchholz relay and pressure relief",
        "On suitable conservator-type units, the Buchholz relay detects gas or oil movement; pressure devices limit tank overpressure.",
      ],
      [
        "Surge arresters, CTs and VTs",
        "Arresters limit transient overvoltage; current and voltage transformers provide scaled signals for metering and protection.",
      ],
      [
        "Breakers, disconnectors, earth switches and busbars",
        "Breakers interrupt load or fault current; disconnectors isolate a visible gap; earth switches bond an isolated section; busbars join bays.",
      ],
    ],
  },
  {
    title: "Transmission line and receiving substation",
    image: "./assets/transmission-substation.png",
    alt: "Lattice transmission tower connected to a fenced high-voltage substation with insulators and switchgear.",
    caption:
      "Line-side training view · tower, phase conductors and substation gantry",
    items: [
      [
        "Phase conductors, clamps and bundle spacers",
        "Conductors carry three-phase power; clamps attach them to strings and spacers hold bundled sub-conductors apart.",
      ],
      [
        "Insulator strings and tower crossarms",
        "Insulators support energized conductors while separating them electrically from the grounded steel structure.",
      ],
      [
        "Lattice tower, shield wire and OPGW",
        "The tower maintains clearances; a shield wire intercepts lightning and an OPGW version can also carry communications fibres.",
      ],
      [
        "Tower footing and station earth grid",
        "Bonded electrodes provide a path for lightning and fault current; actual touch and step voltages require site-specific study.",
      ],
      [
        "Line protection relays and communications",
        "Relays use CT/VT signals to detect abnormal conditions and command breakers; communications support remote protection and control.",
      ],
    ],
  },
  {
    title: "Distribution and customer equipment",
    image: "./assets/distribution-consumers.png",
    alt: "Distribution pole transformer and overhead feeder serving a house and industrial motor facility.",
    caption:
      "Distribution training view · pole transformer, service entry and motor load",
    items: [
      [
        "Receiving transformer and medium-voltage bus",
        "A receiving transformer reduces transmission voltage to a sub-transmission or distribution level feeding outgoing bays.",
      ],
      [
        "Feeder breaker, recloser, sectionalizer and fuse",
        "These devices clear or isolate faults on coordinated sections; ratings and settings must match the utility study.",
      ],
      [
        "Distribution transformer and feeder pillar",
        "The transformer supplies local low-voltage service; a feeder pillar divides and protects outgoing low-voltage circuits.",
      ],
      [
        "Voltage regulator, capacitor bank and meter",
        "Regulators adjust feeder voltage, capacitors support reactive power locally, and meters record delivered energy and demand.",
      ],
      [
        "House service, main board, MCC, motor and VFD",
        "Service protection feeds final circuits; an industrial MCC controls motor feeders and a VFD varies motor speed and torque.",
      ],
    ],
  },
  {
    title: "Safety and test instruments",
    image: "./assets/electrical-test-tools.png",
    alt: "Electrical training bench with multimeter, clamp meter, insulation tester, relay test set, PPE and isolated training panel.",
    caption:
      "Safe test-bench training view · instruments and protective equipment",
    items: [
      [
        "Digital multimeter and clamp meter",
        "A correctly rated meter measures voltage, resistance or continuity; a clamp meter measures current without opening the circuit.",
      ],
      [
        "Insulation-resistance tester",
        "The tester applies a specified test voltage to isolated equipment to assess insulation resistance; disconnect sensitive electronics first.",
      ],
      [
        "Earth-resistance and phase-sequence testers",
        "These check an earthing-electrode system and phase rotation using the instrument method and limits specified for the installation.",
      ],
      [
        "Relay injection set and voltage detector",
        "A secondary-injection set checks relay response using isolated test signals; prove a voltage detector on a proving unit before and after use.",
      ],
      [
        "Arc-rated PPE, lockout and portable earths",
        "Use task-rated PPE, isolation/lockout, prove-dead and approved earthing procedures under an authorized site safety plan.",
      ],
    ],
  },
] as const;

export function PowerGridEquipmentGallery() {
  const t = useT();
  const [playingVideos, setPlayingVideos] = useState<string[]>([]);
  return (
    <section
      className="pg-equipment-gallery"
      aria-labelledby="pg-gallery-title"
    >
      <header className="pg-gallery-heading">
        <span className="eyebrow">{t("FIELD REFERENCE")}</span>
        <h3 id="pg-gallery-title">
          {t("Equipment used from generation to the consumer")}
        </h3>
        <p>
          {t(
            "Study each station view, then match the equipment checklist to the selectable electrical schematic above. These are custom training illustrations, not photographs of an identified operating site.",
          )}
        </p>
      </header>
      <section
        className="pg-field-photo-section"
        aria-labelledby="pg-field-photo-title"
      >
        <div className="pg-field-photo-heading">
          <div>
            <span className="eyebrow">{t("DOCUMENTARY FIELD PHOTOS")}</span>
            <h4 id="pg-field-photo-title">
              {t("Photographs of real power facilities")}
            </h4>
          </div>
          <p>
            {t(
              "These are locally stored photographs of identified sites and equipment. Captions describe only what the source records; they are visual references, not ratings, connection drawings, operating instructions, or proof of the current state of a site.",
            )}
          </p>
        </div>
        <div className="pg-field-photo-grid">
          {fieldPhotos.map((photo) => (
            <article className="pg-field-photo-card" key={photo.image}>
              <figure>
                <img
                  src={photo.image}
                  alt={t(photo.alt)}
                  loading="lazy"
                  decoding="async"
                  style={
                    photo.objectPosition
                      ? { objectPosition: photo.objectPosition }
                      : undefined
                  }
                />
                <figcaption>{t(photo.stage)}</figcaption>
              </figure>
              <div className="pg-field-photo-content">
                <h5>{t(photo.title)}</h5>
                <p>{photo.photographer}</p>
                <a href={photo.source} target="_blank" rel="noreferrer">
                  {t("Open original photo record")}
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="pg-photo-rights-note">
          {t(
            "The appearance of U.S. Department of War visual information does not imply or constitute Department of War endorsement.",
          )}
        </p>
      </section>
      <section
        className="pg-field-video-section"
        aria-labelledby="pg-field-video-title"
      >
        <div className="pg-field-photo-heading">
          <div>
            <span className="eyebrow">{t("REAL POWER STATION VIDEO")}</span>
            <h4 id="pg-field-video-title">
              {t("Watch documentary station footage")}
            </h4>
          </div>
          <p>
            {t(
              "These videos stream from source records and show real facility events. Captions describe the recorded footage; it is not live telemetry, operating measurements, connection evidence, or proof of current site conditions.",
            )}
          </p>
        </div>
        <div className="pg-field-video-grid">
          {fieldVideos.map((video) => (
            <article className="pg-field-video-card" key={video.embed}>
              {playingVideos.includes(video.embed) ? (
                <iframe
                  className="pg-field-video-player"
                  src={video.embed}
                  title={t(video.title)}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button
                  className="pg-field-video-play"
                  type="button"
                  aria-label={`${t("Play video")}: ${t(video.title)}`}
                  onClick={() =>
                    setPlayingVideos((current) => [...current, video.embed])
                  }
                >
                  <span aria-hidden="true">▶</span>
                  <span>{t("Play video")}</span>
                </button>
              )}
              <div className="pg-field-video-content">
                <span className="eyebrow">{t(video.stage)}</span>
                <h5>{t(video.title)}</h5>
                <p className="pg-field-video-credit">{video.producer}</p>
                <p>{t(video.context)}</p>
                <a href={video.source} target="_blank" rel="noreferrer">
                  {t("Open original video record")}
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="pg-photo-rights-note">
          {t(
            "Video playback is streamed by DVIDS and requires internet access. The appearance of U.S. Department of War visual information does not imply or constitute Department of War endorsement.",
          )}
        </p>
      </section>
      <div className="pg-gallery-grid">
        {groups.map((group) => (
          <article className="pg-gallery-card" key={group.title}>
            <figure>
              <img
                src={group.image}
                alt={t(group.alt)}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{t(group.caption)}</figcaption>
            </figure>
            <div className="pg-gallery-content">
              <h4>{t(group.title)}</h4>
              <ul>
                {group.items.map(([name, purpose]) => (
                  <li key={name}>
                    <strong>{t(name)}</strong>
                    <p>{t(purpose)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
