import { useState } from "react";
import { useT, type Locale } from "../i18n";

const equipmentByRoute: Record<string, string> = {
  overview: "transmission-substation.png",
  loads: "distribution-consumers.png",
  boards: "grid-transformer-switchyard.png",
  diagram: "transmission-substation.png",
  simulation: "hydro-powerhouse-generator.png",
  cables: "powergrid/field-photos/distribution-pole-transformer.jpg",
  motors: "hydro-powerhouse-generator.png",
  quality: "electrical-test-tools.png",
  tools: "electrical-test-tools.png",
  renewables: "solar-plant-illustration.jpg",
  ev: "distribution-consumers.png",
  scenarios: "wind-plant-illustration.jpg",
  costs: "thermal-gas-powerhouse.png",
  library: "electrical-test-tools.png",
  reports: "distribution-consumers.png",
  reference: "grid-transformer-switchyard.png",
  history: "powergrid/field-photos/transmission-tower-damage.jpg",
  settings: "transmission-substation.png",
  help: "electrical-test-tools.png",
  powergrid: "powergrid-hydro-station-illustration.png",
};

const headings = {
  en: "Explore the workspace",
  de: "Arbeitsbereich erkunden",
  yo: "Ṣàwárí ibi iṣẹ́",
  pcm: "Explore di workspace",
} satisfies Record<Locale, string>;

type MenuEntry = { id: string; label: string; group: string };

export function WorkspaceLabMenu({
  entries,
  locale,
  onRoute,
  onOpenHelp,
}: {
  entries: readonly MenuEntry[];
  locale: Locale;
  onRoute: (route: string) => void;
  onOpenHelp: () => void;
}) {
  const t = useT();
  const groups = [...new Set(entries.map(({ group }) => group))];
  const [group, setGroup] = useState(
    entries.find(({ id }) => id === "overview")?.group ?? groups[0],
  );
  return (
    <section
      className="panel panel-pad workspace-lab-menu"
      aria-labelledby="workspace-lab-menu"
    >
      <h3 id="workspace-lab-menu">{headings[locale]}</h3>
      <div className="pg-actions">
        {groups.map((name) => (
          <button
            className="button"
            type="button"
            aria-pressed={group === name}
            key={name}
            onClick={() => setGroup(name)}
          >
            {t(name)}
          </button>
        ))}
      </div>
      <ul className="pg-home-photo-grid">
        {entries
          .filter((entry) => entry.group === group)
          .map(({ id, label }) => {
            const content = (
              <>
                <img
                  src={`./assets/${equipmentByRoute[id]}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span>{t(label)}</span>
              </>
            );
            return (
              <li className="pg-home-photo" key={id}>
                {id === "help" ? (
                  <button
                    className="workspace-lab-tile"
                    type="button"
                    onClick={onOpenHelp}
                  >
                    {content}
                  </button>
                ) : (
                  <a
                    className="workspace-lab-tile"
                    href={id === "powergrid" ? "#POWERGRID" : `#/${id}`}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      event.preventDefault();
                      onRoute(id);
                    }}
                  >
                    {content}
                  </a>
                )}
              </li>
            );
          })}
      </ul>
    </section>
  );
}
