import { useState } from "react";
import { useT } from "../i18n";

type PlantId = "combined-cycle" | "utility-pv" | "wind";

const plants: Record<
  PlantId,
  {
    name: string;
    image: string;
    alt: string;
    caption: string;
    equipment: readonly { name: string; purpose: string; interface: string }[];
  }
> = {
  "combined-cycle": {
    name: "Combined-cycle gas plant",
    image: "./assets/thermal-gas-powerhouse.png",
    alt: "Training illustration of a combined-cycle plant with gas turbine, heat-recovery steam generator, steam turbine, condenser and generator train.",
    caption: "Custom training illustration · combined-cycle gas plant",
    equipment: [
      {
        name: "Gas turbine compressor, combustor and expander",
        purpose:
          "The compressor raises air pressure; combustion adds heat; expanding gas turns the turbine shaft.",
        interface:
          "Air and fuel enter the combustion train; shaft power drives the generator. Arrangement varies by turbine.",
      },
      {
        name: "Heat-recovery steam generator",
        purpose:
          "The heat-recovery steam generator transfers gas-turbine exhaust heat to a steam-water circuit.",
        interface:
          "Hot exhaust gas passes across water/steam heat-transfer surfaces; steam outlet connects to the steam turbine.",
      },
      {
        name: "Steam turbine and shaft coupling",
        purpose:
          "Steam expansion turns turbine stages and transfers torque through the coupled shaft train.",
        interface:
          "Steam inlet and exhaust connect to the cycle; coupled shaft connects turbine stages and generator.",
      },
      {
        name: "Condenser and cooling-water system",
        purpose:
          "The condenser returns exhaust steam to water while the cooling system rejects heat as designed.",
        interface:
          "Steam-side inlet/outlet and cooling-water circuit; exact nozzle arrangement is plant-specific.",
      },
      {
        name: "Generator and unit transformer",
        purpose:
          "The generator converts shaft power to electrical output; the unit transformer connects the generator circuit to the station bus/grid interface.",
        interface:
          "Representative three-phase generator circuit; terminal board, neutral grounding and transformer connection depend on the selected unit.",
      },
    ],
  },
  "utility-pv": {
    name: "Utility-scale solar PV",
    image: "./assets/solar-plant-illustration.jpg",
    alt: "Custom training illustration tracing utility photovoltaic rows through DC collection, central inverter, transformer and switchyard.",
    caption:
      "Custom training illustration · utility-scale solar photovoltaic plant",
    equipment: [
      {
        name: "PV modules and string circuits",
        purpose:
          "Photovoltaic modules convert incident light to direct current; modules are connected into strings within designed electrical limits.",
        interface:
          "DC string positive and negative conductors; module and string values depend on the selected equipment.",
      },
      {
        name: "DC combiner and isolation",
        purpose:
          "The combiner gathers designed string circuits; fuses and disconnecting equipment are selected for the actual DC system.",
        interface:
          "Multiple DC string inputs and a combined DC output; polarity and maximum ratings are equipment-specific.",
      },
      {
        name: "Central inverter",
        purpose:
          "Power electronics convert the collected DC into grid-synchronized AC and provide configured grid-support functions.",
        interface:
          "DC input and AC output; voltage, grounding and grid-support behavior are inverter-specific.",
      },
      {
        name: "AC collection and step-up transformer",
        purpose:
          "AC collection circuits gather inverter output; the transformer raises voltage for the plant collector or grid connection.",
        interface:
          "Low-voltage inverter-side and higher-voltage collector-side windings; actual vector group and terminals vary.",
      },
      {
        name: "Plant switchyard and grid interconnection",
        purpose:
          "Switchgear, measurement and protection equipment connect the generating facility to its approved point of interconnection.",
        interface:
          "Three-phase collector circuit, CT/VT measurement and protected grid connection as designed for the site.",
      },
    ],
  },
  wind: {
    name: "Utility wind plant",
    image: "./assets/wind-plant-illustration.jpg",
    alt: "Custom training illustration of wind turbines and a cutaway nacelle showing rotor, drivetrain, generator and collector connection.",
    caption: "Custom training illustration · wind turbines and nacelle cutaway",
    equipment: [
      {
        name: "Rotor blades, hub and pitch system",
        purpose:
          "Aerodynamic lift turns the rotor; the pitch system changes blade angle to regulate captured energy and rotor operation.",
        interface:
          "Mechanical rotor assembly; no external electrical terminals at the blades or hub.",
      },
      {
        name: "Main shaft, bearing and gearbox",
        purpose:
          "The drivetrain transmits rotor torque; geared machines increase shaft speed, while direct-drive designs omit the gearbox.",
        interface:
          "Mechanical low-speed rotor shaft and generator-side shaft; the drivetrain depends on turbine design.",
      },
      {
        name: "Nacelle generator",
        purpose:
          "The generator converts drivetrain rotation into electrical power inside the nacelle.",
        interface:
          "Generator leads connect to turbine power-conversion equipment; voltage and lead markings are model-specific.",
      },
      {
        name: "Power converter and turbine transformer",
        purpose:
          "Power conversion conditions turbine output for the collector system; a transformer provides the designed collection voltage.",
        interface:
          "Converter generator-side and grid-side circuits, then transformer windings; topology varies among turbines.",
      },
      {
        name: "Collector cables and substation",
        purpose:
          "Underground or overhead collector circuits gather turbine output for transformation, switching and interconnection to the grid.",
        interface:
          "Multiple turbine feeder circuits connect to collector switchgear and the plant grid connection.",
      },
    ],
  },
};

export function GenerationPlantScene() {
  const t = useT();
  const [plantId, setPlantId] = useState<PlantId>("combined-cycle");
  const plant = plants[plantId];
  const [selectedEquipment, setSelectedEquipment] = useState(0);
  const selected = plant.equipment[selectedEquipment];

  function selectPlant(id: PlantId) {
    setPlantId(id);
    setSelectedEquipment(0);
  }

  return (
    <section
      className="pg-generation-study"
      aria-labelledby="pg-generation-study-title"
    >
      <header className="pg-gallery-heading">
        <span className="eyebrow">{t("GENERATION STUDIES")}</span>
        <h3 id="pg-generation-study-title">
          {t("Explore other generation plants")}
        </h3>
        <p>
          {t(
            "The hydro cutaway is above. Choose a plant to follow its equipment and energy-conversion path. Illustrations are original teaching renders, not photographs of an identified operating facility.",
          )}
        </p>
      </header>
      <div
        className="pg-generation-tabs"
        role="group"
        aria-label={t("Generation plant type")}
      >
        {(Object.keys(plants) as PlantId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={plantId === id}
            onClick={() => selectPlant(id)}
          >
            {t(plants[id].name)}
          </button>
        ))}
      </div>
      <figure className="pg-generation-image">
        <img
          src={plant.image}
          alt={t(plant.alt)}
          loading="lazy"
          decoding="async"
        />
        <figcaption>{t(plant.caption)}</figcaption>
      </figure>
      <div className="pg-generation-detail">
        <div
          className="pg-generation-equipment"
          role="group"
          aria-label={t("Select equipment to inspect")}
        >
          {plant.equipment.map((equipment, index) => (
            <button
              key={equipment.name}
              type="button"
              aria-pressed={selectedEquipment === index}
              onClick={() => setSelectedEquipment(index)}
            >
              {t(equipment.name)}
            </button>
          ))}
        </div>
        <article aria-live="polite">
          <h4>{t(selected.name)}</h4>
          <p>{t(selected.purpose)}</p>
          <strong>{t("Representative interfaces")}</strong>
          <p>{t(selected.interface)}</p>
          <small>
            {t(
              "Terminal names, ratings, protection and equipment layout are model- and site-specific; confirm them from approved drawings and manufacturer data.",
            )}
          </small>
        </article>
      </div>
    </section>
  );
}
