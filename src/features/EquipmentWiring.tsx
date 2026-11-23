import { useState } from "react";
import type { ProjectChange } from "../commands/projectCommands";
import {
  catalogueRecord,
  equipmentConnectionErrors,
} from "../domain/equipmentConnections";
import { newId } from "../domain/project";
import type {
  CatalogueEquipmentInstance,
  EquipmentTerminalEndpoint,
  Project,
} from "../domain/types";
import { useT } from "../i18n";
import { Field } from "./ui";

export function EquipmentWiring({
  project,
  instance,
  change,
}: {
  project: Project;
  instance: CatalogueEquipmentInstance;
  change: ProjectChange;
}) {
  const t = useT();
  const [targetId, setTargetId] = useState(instance.id);
  const [error, setError] = useState(false);
  const equipment = (project.catalogueEquipment ?? []).filter(catalogueRecord);
  const target = equipment.find((item) => item.id === targetId) ?? instance;
  const wires = project.equipmentTerminalConnections ?? [];
  const attached = wires.filter(
    ({ from, to }) =>
      from.instanceId === instance.id || to.instanceId === instance.id,
  );
  const describe = ({
    instanceId,
    unit,
    terminalId,
  }: EquipmentTerminalEndpoint) =>
    `${equipment.find((item) => item.id === instanceId)?.name ?? instanceId} [${unit}] · ${terminalId}`;

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const wire = {
            id: newId("wire"),
            from: {
              instanceId: instance.id,
              unit: Number(data.get("fromUnit")),
              terminalId: String(data.get("fromTerminal")),
            },
            to: {
              instanceId: target.id,
              unit: Number(data.get("toUnit")),
              terminalId: String(data.get("toTerminal")),
            },
          };
          const next = [...wires, wire];
          if (equipmentConnectionErrors(next, equipment).length) {
            setError(true);
            return;
          }
          setError(false);
          change((draft) => {
            draft.equipmentTerminalConnections = next;
          });
        }}
      >
        <div className="form-grid">
          <Field label={t("From unit")}>
            <input
              name="fromUnit"
              type="number"
              min={1}
              max={instance.quantity}
              defaultValue={1}
              required
            />
          </Field>
          <Field label={t("From terminal")}>
            <select name="fromTerminal">
              {catalogueRecord(instance)?.terminals.map((terminal) => (
                <option key={terminal.id} value={terminal.id}>
                  {terminal.group}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("Target equipment")}>
            <select
              value={target.id}
              onChange={(event) => {
                setTargetId(event.currentTarget.value);
                setError(false);
              }}
            >
              {equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("To unit")}>
            <input
              key={target.id}
              name="toUnit"
              type="number"
              min={1}
              max={target.quantity}
              defaultValue={1}
              required
            />
          </Field>
          <Field label={t("To terminal")}>
            <select key={target.id} name="toTerminal">
              {catalogueRecord(target)?.terminals.map((terminal) => (
                <option key={terminal.id} value={terminal.id}>
                  {terminal.group}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button className="button" type="submit">
          {t("Connect")}
        </button>
        {error && (
          <p role="alert">
            {t("Choose different units and compatible, unused endpoint pairs.")}
          </p>
        )}
      </form>
      {attached.map((wire) => (
        <p key={wire.id}>
          {describe(wire.from)} ↔ {describe(wire.to)}{" "}
          <button
            type="button"
            className="button"
            onClick={() => {
              setError(false);
              change((draft) => {
                draft.equipmentTerminalConnections =
                  draft.equipmentTerminalConnections?.filter(
                    ({ id }) => id !== wire.id,
                  );
              });
            }}
          >
            {t("Disconnect")}
          </button>
        </p>
      ))}
    </>
  );
}
