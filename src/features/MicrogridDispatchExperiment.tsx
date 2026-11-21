import { useContext, useMemo, useState } from "react";
import { Download, RotateCcw, Save, SunMedium } from "lucide-react";
import {
  calculateMicrogridDispatch,
  DEFAULT_MICROGRID_DISPATCH_INPUTS,
  validateMicrogridDispatchInputs,
  type MicrogridDispatchInputs,
} from "../engine/microgridDispatch";
import type { PvPerformanceInputs } from "../engine/pvPerformance";
import { LanguageContext } from "../i18n";
import type { Locale } from "../i18n";

const INPUT_KEY = "adigunpowerlab.powergrid.microgrid-dispatch.v1";
const LIMITS =
  "This is an illustrative AC-bus dispatch, not a site forecast or utility operation model. No feeder/transformer losses, costs, frequency response or unit-specific transient models are included. Entered profiles are assumptions. Generic backup capacity is dispatched after storage and grid imports with the entered ramp-up ceiling; ramp-down is instantaneous.";
const pvDefaults = DEFAULT_MICROGRID_DISPATCH_INPUTS.pvByInterval[0];
const copy: Record<string, [string, string, string]> = {
  "Model thermal backup fuel use": [
    "Brennstoffeinsatz des Reserveaggregats modellieren",
    "Ṣàwòṣe epo tí backup ń lò",
    "Model fuel wey backup dey use",
  ],
  "Net heat rate (MJ/kWh)": [
    "Nettowärmeverbrauch (MJ/kWh)",
    "Ooru epo fún ìṣẹ̀dá (MJ/kWh)",
    "Net heat rate (MJ/kWh)",
  ],
  "Direct CO₂ factor (kg/GJ), optional": [
    "Direkter CO₂-Faktor (kg/GJ), optional",
    "Òṣùwọ̀n CO₂ taara (kg/GJ), àṣàyàn",
    "Direct CO₂ factor (kg/GJ), optional",
  ],
  "Backup fuel energy": [
    "Brennstoffenergie der Reserve",
    "Agbára epo backup",
    "Backup fuel energy",
  ],
  "Backup direct CO₂": [
    "Direktes CO₂ der Reserve",
    "CO₂ taara láti backup",
    "Backup direct CO₂",
  ],
  "Backup fuel energy (MJ)": [
    "Brennstoffenergie der Reserve (MJ)",
    "Agbára epo backup (MJ)",
    "Backup fuel energy (MJ)",
  ],
  "Backup direct CO₂ (kg)": [
    "Direktes CO₂ der Reserve (kg)",
    "CO₂ taara láti backup (kg)",
    "Backup direct CO₂ (kg)",
  ],
  "Enter a heat rate of 3.6–1,000 MJ/kWh and an optional CO₂ factor of 0–1,000 kg/GJ.":
    [
      "Geben Sie einen Nettowärmeverbrauch von 3,6–1.000 MJ/kWh und optional einen CO₂-Faktor von 0–1.000 kg/GJ ein.",
      "Tẹ ooru epo láàárín 3.6–1,000 MJ/kWh àti òṣùwọ̀n CO₂ àṣàyàn láàárín 0–1,000 kg/GJ.",
      "Enter heat rate from 3.6 to 1,000 MJ/kWh and optional CO₂ factor from 0 to 1,000 kg/GJ.",
    ],
  "Fuel energy uses a constant net heat rate. Use the same heating-value basis for the heat rate and CO₂ factor. Startup and part-load fuel are outside this model.":
    [
      "Die Brennstoffenergie verwendet einen konstanten Nettowärmeverbrauch. Verwenden Sie für Wärmeverbrauch und CO₂-Faktor dieselbe Heizwertbasis. Anfahr- und Teillastverbrauch sind nicht modelliert.",
      "A lo ooru epo tó dúró ṣinṣin. Lo ìpìlẹ̀ iye ooru epo kan náà fún ooru àti òṣùwọ̀n CO₂. Àwòṣe kò ka epo ìbẹ̀rẹ̀ tàbí ti ẹrù kékeré.",
      "Fuel energy use constant net heat rate. Use the same fuel heating-value basis for heat rate and CO₂ factor. Startup and part-load fuel dey outside this model.",
    ],
  "Backup outage intervals (optional)": [
    "Ausfallintervalle der Reserveerzeugung (optional)",
    "Àkókò tí backup kò sí (àṣàyàn)",
    "Backup outage intervals (optional)",
  ],
  "Enter backup outage interval numbers within the demand profile.": [
    "Geben Sie Ausfallintervalle der Reserveerzeugung innerhalb des Lastprofils ein.",
    "Tẹ nọ́mbà àkókò ìdádúró backup tó wà nínú àtòjọ ìbéèrè.",
    "Enter backup outage interval numbers inside the demand profile.",
  ],
  "Backup availability": [
    "Verfügbarkeit der Reserveerzeugung",
    "Wíwà backup",
    "Backup availability",
  ],
  "In service": ["In Betrieb", "Ó wà ní iṣẹ́", "In service"],
  "Out of service": ["Außer Betrieb", "Kò sí ní iṣẹ́", "Out of service"],
  "Backup headroom (kW)": [
    "Verbleibende Reserveleistung (kW)",
    "Agbára backup tó ṣì kù (kW)",
    "Backup power wey still remain (kW)",
  ],
  "Backup outage intervals use the same numbering as grid outages. Restart ramps from zero. Headroom is unused capacity within the current ramp limit.":
    [
      "Ausfallintervalle der Reserveerzeugung folgen derselben Nummerierung wie Netzausfälle. Der Wiederanlauf beginnt bei null. Die verbleibende Reserveleistung ist die ungenutzte Leistung innerhalb der aktuellen Hochfahrgrenze.",
      "Ìdádúró backup lo nọ́mbà kan náà bí ti grid. Ìbẹ̀rẹ̀ padà bẹ̀rẹ̀ láti òdo. Headroom ni agbára tí a kò lò lábẹ́ ààlà ìgbéga lọwọlọwọ.",
      "Backup outage intervals use same numbering as grid outage. Restart ramp from zero. Headroom na power wey remain inside current ramp limit.",
    ],
  "Grid import limit (kW)": [
    "Netzbezugsgrenze (kW)",
    "Ààlà gbígba agbára grid (kW)",
    "Grid import limit (kW)",
  ],
  "Grid export limit (kW)": [
    "Einspeisegrenze (kW)",
    "Ààlà fífi agbára ránṣẹ́ sí grid (kW)",
    "Grid export limit (kW)",
  ],
  "Grid outage intervals (optional)": [
    "Netzausfallintervalle (optional)",
    "Àkókò tí grid kò sí (àṣàyàn)",
    "Grid outage intervals (optional)",
  ],
  "Grid import": ["Netzbezug", "Agbára láti grid", "Grid import"],
  "Grid export": ["Netzeinspeisung", "Agbára sí grid", "Grid export"],
  "Grid import (kW)": [
    "Netzbezug (kW)",
    "Agbára láti grid (kW)",
    "Grid import (kW)",
  ],
  "Grid export (kW)": [
    "Netzeinspeisung (kW)",
    "Agbára sí grid (kW)",
    "Grid export (kW)",
  ],
  "Grid connection": ["Netzverbindung", "Ìsopọ̀ grid", "Grid connection"],
  Connected: ["Verbunden", "A so pọ̀", "Connected"],
  Islanded: ["Inselbetrieb", "Grid kò sí", "Islanded"],
  "Enter valid grid limits and outage interval numbers within the demand profile.":
    [
      "Geben Sie gültige Netzgrenzen und Ausfallintervalle innerhalb des Lastprofils ein.",
      "Tẹ ààlà grid àti nọ́mbà àkókò ìdádúró tó wà nínú àtòjọ ìbéèrè.",
      "Enter correct grid limits and outage interval numbers inside the demand profile.",
    ],
  "Enter comma-separated outage interval numbers starting at 1. Storage acts first, then grid imports precede backup. Remaining surplus can be exported while connected.":
    [
      "Geben Sie Ausfallintervalle ab 1 durch Kommas getrennt ein. Zuerst arbeiten die Speicher, danach folgt Netzbezug vor Reserveerzeugung. Verbleibender Überschuss kann bei Netzverbindung eingespeist werden.",
      "Tẹ nọ́mbà àkókò ìdádúró láti 1, pẹ̀lú kọ́mà láàárín wọn. Ìpamọ́ ló kọ́kọ́ ṣiṣẹ́, grid sì pèsè ṣáájú backup. A lè rán agbára tó ṣẹ́ kù sí grid tí a bá so pọ̀.",
      "Enter outage interval numbers from 1, with commas between them. Storage work first, then grid import before backup. Extra power fit go to grid when connection dey.",
    ],
  "Pumped storage capacity (kWh), zero to disable": [
    "Pumpspeicherkapazität (kWh), null zum Abschalten",
    "Ìwọ̀n ìpamọ́ agbára omi (kWh), òdo láti pa á",
    "Pumped storage capacity (kWh), zero to turn am off",
  ],
  "Initial stored hydraulic energy (kWh)": [
    "Hydraulische Anfangsenergie (kWh)",
    "Agbára omi ìbẹ̀rẹ̀ (kWh)",
    "Starting stored water energy (kWh)",
  ],
  "Pump input limit (kW)": [
    "Leistungsgrenze der Pumpe (kW)",
    "Ààlà agbára pump (kW)",
    "Pump input limit (kW)",
  ],
  "Pumped generation limit (kW)": [
    "Erzeugungsgrenze des Pumpspeichers (kW)",
    "Ààlà agbára tí omi ìpamọ́ ń ṣe (kW)",
    "Pumped generation limit (kW)",
  ],
  "Pump efficiency (%)": [
    "Pumpenwirkungsgrad (%)",
    "Ìmúṣẹ pump (%)",
    "Pump efficiency (%)",
  ],
  "Pumped generation efficiency (%)": [
    "Erzeugungswirkungsgrad (%)",
    "Ìmúṣẹ ìṣẹ̀dá agbára omi (%)",
    "Pumped generation efficiency (%)",
  ],
  "Pump input (kW)": [
    "Pumpenaufnahme (kW)",
    "Agbára tí pump ń lò (kW)",
    "Pump input (kW)",
  ],
  "Pumped generation (kW)": [
    "Pumpspeichererzeugung (kW)",
    "Agbára láti omi ìpamọ́ (kW)",
    "Pumped generation (kW)",
  ],
  "Hydraulic storage (kWh)": [
    "Hydraulischer Speicherinhalt (kWh)",
    "Agbára omi tí a pa mọ́ (kWh)",
    "Stored water energy (kWh)",
  ],
  "Pumped storage losses (kWh)": [
    "Pumpspeicherverluste (kWh)",
    "Àdánù agbára omi ìpamọ́ (kWh)",
    "Pumped storage losses (kWh)",
  ],
  "Enter valid pumped storage capacity, energy, ratings and efficiencies (1–100%).":
    [
      "Geben Sie gültige Kapazität, Energie, Leistungen und Wirkungsgrade (1–100 %) ein.",
      "Tẹ ìwọ̀n ìpamọ́, agbára, ààlà àti ìmúṣẹ (1–100%) tó péye.",
      "Enter correct capacity, energy, power limits and efficiencies (1–100%).",
    ],
  "Pumped storage uses surplus after the battery and supplies remaining demand before backup. The model tracks hydraulic energy separately from the hydro reservoir.":
    [
      "Der Pumpspeicher nutzt Überschüsse nach der Batterie und deckt Restlast vor der Reserveerzeugung. Seine hydraulische Energie wird getrennt vom Wasserkraftspeicher bilanziert.",
      "Ìpamọ́ omi lo agbára tó ṣẹ́ kù lẹ́yìn batiri, ó sì pèsè fún ìbéèrè tó kù ṣáájú backup. A ka agbára omi rẹ̀ lọ́tọ̀ sí àdágún hydro.",
      "Pumped storage use surplus after battery and supply remaining demand before backup. E track stored water energy separate from hydro reservoir.",
    ],
  "Hydro flow by interval (m³/s), optional": [
    "Turbinendurchfluss je Intervall (m³/s), optional",
    "Ìṣàn omi turbine fún àkókò kọ̀ọ̀kan (m³/s), àṣàyàn",
    "Hydro water flow for each interval (m³/s), optional",
  ],
  "Hydro net head (m)": [
    "Nettofallhöhe (m)",
    "Gíga omi tó kù (m)",
    "Hydro net head (m)",
  ],
  "Hydro combined efficiency (%)": [
    "Gesamtwirkungsgrad Wasserkraft (%)",
    "Ìmúṣẹ àpapọ̀ agbára omi (%)",
    "Hydro combined efficiency (%)",
  ],
  "Hydro installed rating (kW)": [
    "Elektrische Nennleistung Wasserkraft (kW)",
    "Agbára orúkọ hydro (kW)",
    "Hydro installed rating (kW)",
  ],
  "Hydro kW": ["Wasserkraft kW", "Agbára omi kW", "Hydro kW"],
  "Reservoir inflow by interval (m³/s), optional": [
    "Speicherzufluss je Intervall (m³/s), optional",
    "Omi tó ń wọ àdágún fún àkókò kọ̀ọ̀kan (m³/s), àṣàyàn",
    "Reservoir inflow for each interval (m³/s), optional",
  ],
  "Reservoir capacity (m³)": [
    "Speicherkapazität (m³)",
    "Ìwọ̀n àdágún (m³)",
    "Reservoir capacity (m³)",
  ],
  "Initial reservoir water (m³)": [
    "Anfangsvolumen (m³)",
    "Omi ìbẹ̀rẹ̀ nínú àdágún (m³)",
    "Starting reservoir water (m³)",
  ],
  "Environmental bypass (m³/s)": [
    "Ökologischer Bypassabfluss (m³/s)",
    "Ìṣàn omi fún àyíká (m³/s)",
    "Environmental bypass (m³/s)",
  ],
  "Reservoir water (m³)": [
    "Speicherinhalt (m³)",
    "Omi inú àdágún (m³)",
    "Reservoir water (m³)",
  ],
  "Water spilled (m³)": [
    "Überlauf (m³)",
    "Omi tó ṣàn kọjá (m³)",
    "Water wey spill (m³)",
  ],
  "Unmet bypass (m³)": [
    "Fehlende Bypassmenge (m³)",
    "Omi àyíká tí kò tó (m³)",
    "Bypass water shortfall (m³)",
  ],
  "Enter one valid reservoir inflow per interval and valid storage and release limits.":
    [
      "Geben Sie je Intervall einen gültigen Zufluss sowie gültige Speicher- und Abflussgrenzen ein.",
      "Tẹ ìṣàn omi kan fún àkókò kọ̀ọ̀kan àti ààlà ìpamọ́ àti ìtúsílẹ̀ tó péye.",
      "Enter one valid reservoir inflow for each interval and correct storage and release limits.",
    ],
  "Net head (m)": ["Nettofallhöhe (m)", "Gíga omi tó kù (m)", "Net head (m)"],
  "Head rise at full reservoir (m)": [
    "Zusätzliche Fallhöhe bei vollem Speicher (m)",
    "Àfikún gíga omi nígbà tí àdágún kún (m)",
    "Extra head when reservoir full (m)",
  ],
  "Enter a valid non-negative reservoir head rise.": [
    "Geben Sie eine gültige, nichtnegative zusätzliche Fallhöhe ein.",
    "Tẹ àfikún gíga omi tó péye, tó jẹ́ òdo tàbí jù bẹ́ẹ̀ lọ.",
    "Enter valid extra head wey be zero or more.",
  ],
  "The model allocates bypass first and limits turbine flow by water and rating. Net head adds the full-reservoir rise scaled by starting fill. A zero rise keeps head fixed.":
    [
      "Das Modell bedient zuerst den Bypass und begrenzt den Turbinendurchfluss durch Wasserangebot und Nennleistung. Die zusätzliche Fallhöhe hängt vom Füllstand am Intervallanfang ab. Bei null bleibt die Fallhöhe konstant.",
      "Omi àyíká ló kọ́kọ́ gba omi. Omi tó kù àti agbára orúkọ fi ààlà sí ìṣàn turbine. Àfikún gíga omi dá lórí ìkún àdágún ní ìbẹ̀rẹ̀ àkókò. Àfikún òdo mú gíga omi dúró ṣinṣin.",
      "Bypass get water first. Water wey remain and generator rating limit turbine flow. Extra head depend on how full the reservoir dey at interval start. Zero extra head keeps head fixed.",
    ],
  "Hydro flow must have one value per demand interval.": [
    "Geben Sie für jedes Lastintervall einen Durchflusswert ein.",
    "Tẹ iye ìṣàn kan fún àkókò ìbéèrè kọ̀ọ̀kan.",
    "Enter one flow value for each demand interval.",
  ],
  "Enter valid hydro inputs with a rating up to 1,000,000 kW.": [
    "Geben Sie gültige Wasserkraftwerte mit einer Nennleistung bis 1.000.000 kW ein.",
    "Tẹ iye agbára omi tó péye, pẹ̀lú agbára orúkọ tó tó 1,000,000 kW.",
    "Enter correct hydro values with rating up to 1,000,000 kW.",
  ],
  "Hydro uses entered flow at fixed net head. Leave the flow profile empty to omit hydro.":
    [
      "Wasserkraft verwendet den eingegebenen Durchfluss bei fester Nettofallhöhe. Lassen Sie das Durchflussprofil leer, um Wasserkraft wegzulassen.",
      "Agbára omi ń lo ìṣàn tí o tẹ̀ pẹ̀lú gíga omi kan. Fi àtòjọ ìṣàn sílẹ̀ láìkọ ohunkóhun láti yọ agbára omi kúrò.",
      "Hydro use the flow wey you enter with fixed net head. Leave the flow profile empty to leave hydro out.",
    ],
  "Microgrid dispatch laboratory": [
    "Mikronetz-Dispatch-Labor",
    "Yàrá dispatch microgrid",
    "Microgrid dispatch laboratory",
  ],
  "Combine PV, wind, storage and critical demand across equal time intervals.":
    [
      "Kombinieren Sie PV, Wind, Speicher und kritische Lasten über gleich lange Zeitintervalle.",
      "So PV, wind, storage àti critical demand pọ̀ fún interval tó dọ́gba.",
      "Join PV, wind, storage and critical load across equal-time intervals.",
    ],
  "Wind speed (m/s)": [
    "Windgeschwindigkeit (m/s)",
    "Wind speed (m/s)",
    "Wind speed (m/s)",
  ],
  "Solar irradiance (W/m²)": [
    "Sonneneinstrahlung (W/m²)",
    "Irradiance oorun (W/m²)",
    "Solar irradiance (W/m²)",
  ],
  "Total demand (kW)": [
    "Gesamtlast (kW)",
    "Demand lápapọ̀ (kW)",
    "Total demand (kW)",
  ],
  "Critical demand (kW)": [
    "Kritische Last (kW)",
    "Critical demand (kW)",
    "Critical demand (kW)",
  ],
  "PV array DC rating (kW)": [
    "PV-DC-Nennleistung (kW)",
    "PV DC rating (kW)",
    "PV DC rating (kW)",
  ],
  "PV inverter AC rating (kW)": [
    "PV-Wechselrichterleistung (kW)",
    "PV inverter AC rating (kW)",
    "PV inverter AC rating (kW)",
  ],
  "Wind turbines": ["Windanlagen", "Wind turbine", "Wind turbines"],
  "Interval duration (h)": [
    "Intervalllänge (h)",
    "Àkókò interval (h)",
    "Interval duration (h)",
  ],
  "Battery capacity (kWh)": [
    "Batteriekapazität (kWh)",
    "Battery capacity (kWh)",
    "Battery capacity (kWh)",
  ],
  "Initial battery state of charge (%)": [
    "Batterie-Ladezustand zu Beginn (%)",
    "Battery state of charge ní ìbẹ̀rẹ̀ (%)",
    "Battery charge at start (%)",
  ],
  "Minimum reserve (%)": [
    "Mindestreserve (%)",
    "Reserve tó kéré jù (%)",
    "Minimum reserve (%)",
  ],
  "Battery charge/discharge limit (kW)": [
    "Batterie-Lade-/Entladegrenze (kW)",
    "Battery charge/discharge limit (kW)",
    "Battery charge/discharge limit (kW)",
  ],
  "Dispatchable backup limit (kW)": [
    "Grenze der disponiblen Reserveleistung (kW)",
    "Dispatchable backup limit (kW)",
    "Dispatchable backup limit (kW)",
  ],
  "Backup ramp-up per interval (kW)": [
    "Reserveleistungsanstieg je Intervall (kW)",
    "Backup ramp-up fún interval (kW)",
    "Backup ramp-up each interval (kW)",
  ],
  "Battery charge efficiency (%)": [
    "Batterie-Ladewirkungsgrad (%)",
    "Battery charge efficiency (%)",
    "Battery charge efficiency (%)",
  ],
  "Battery discharge efficiency (%)": [
    "Batterie-Entladewirkungsgrad (%)",
    "Battery discharge efficiency (%)",
    "Battery discharge efficiency (%)",
  ],
  "Available generation": [
    "Verfügbare Erzeugung",
    "Generation tó wà",
    "Generation wey dey available",
  ],
  "Served energy": [
    "Gelieferte Energie",
    "Energy tí a pèsè",
    "Energy supplied",
  ],
  "Unserved critical energy": [
    "Nicht gedeckte kritische Energie",
    "Critical energy tí kò dé",
    "Critical energy wey no get supply",
  ],
  "Unserved non-critical energy": [
    "Nicht gedeckte unkritische Energie",
    "Non-critical energy tí kò dé",
    "Other unmet energy",
  ],
  "Backup energy": ["Reserveenergie", "Backup energy", "Backup energy"],
  "Renewable curtailment": [
    "Abregelung erneuerbarer Energie",
    "Renewable tí a gé kúrò",
    "Renewable power wey dem cut",
  ],
  "Battery throughput": [
    "Batterie-Energiedurchsatz",
    "Battery throughput",
    "Battery energy wey pass through",
  ],
  Interval: ["Intervall", "Interval", "Interval"],
  "PV kW": ["PV kW", "PV kW", "PV kW"],
  "Wind kW": ["Wind kW", "Wind kW", "Wind kW"],
  "Demand kW": ["Last kW", "Demand kW", "Demand kW"],
  "Battery kW (+ discharge)": [
    "Batterie kW (+ Entladung)",
    "Battery kW (+ discharge)",
    "Battery kW (+ discharge)",
  ],
  "SOC kWh": ["Ladezustand kWh", "SOC kWh", "Battery level kWh"],
  "Curtailment kW": ["Abregelung kW", "Curtailment kW", "Power wey cut kW"],
  "Critical unmet kW": [
    "Nicht gedeckte kritische Last kW",
    "Critical demand tí kò dé kW",
    "Critical load wey no get supply kW",
  ],
  "Non-critical unmet kW": [
    "Nicht gedeckte unkritische Last kW",
    "Non-critical demand tí kò dé kW",
    "Other load wey no get supply kW",
  ],
  "Backup kW": ["Reserve kW", "Backup kW", "Backup kW"],
  "Unserved kW": [
    "Nicht gedeckt kW",
    "Demand tí kò dé kW",
    "Load wey no get supply kW",
  ],
  "Save scenario locally": [
    "Szenario lokal speichern",
    "Fi scenario pamọ́ sí browser",
    "Save scenario for this browser",
  ],
  "Saved in this browser": [
    "In diesem Browser gespeichert",
    "A fi pamọ́ sínú browser yìí",
    "E don save am for dis browser",
  ],
  "Export dispatch JSON": [
    "Dispatch als JSON exportieren",
    "Export dispatch JSON",
    "Export dispatch JSON",
  ],
  "Export intervals CSV": [
    "Intervalle als CSV exportieren",
    "Export interval CSV",
    "Export interval CSV",
  ],
  "Reset inputs": ["Eingaben zurücksetzen", "Ṣètò input padà", "Reset inputs"],
  "Fix invalid values before saving or exporting.": [
    "Korrigieren Sie ungültige Werte vor dem Speichern oder Export.",
    "Ṣàtúnṣe iye tí kò tọ́ kí o tó fi pamọ́ tàbí export.",
    "Fix invalid values before saving or exporting.",
  ],
  "This is an illustrative AC-bus dispatch, not a site forecast or utility operation model. No feeder/transformer losses, costs, frequency response or unit-specific transient models are included. Entered profiles are assumptions. Generic backup capacity is dispatched after storage and grid imports with the entered ramp-up ceiling; ramp-down is instantaneous.":
    [
      "Dies ist ein illustratives AC-Sammelschienen-Dispatchmodell, keine Standortprognose oder Netzbetriebsrechnung. Leitungs-/Transformatorverluste, Kosten, Frequenzregelung und anlagenspezifische Transientenmodelle sind nicht enthalten. Die Profileingaben sind Annahmen. Generische Reserveleistung folgt nach den Speichern und dem Netzbezug mit der eingegebenen Hochfahrgrenze; das Abfahren erfolgt unmittelbar.",
      "Èyí jẹ́ dispatch AC-bus fún ẹ̀kọ́, kì í ṣe asọtẹ́lẹ̀ ibi kan tàbí model iṣẹ́ utility. A kò fi feeder/transformer loss, iye owó, frequency response tàbí unit-specific transient model kún un. Profile tí a tẹ̀ jẹ́ àfojúsùn. Backup capacity gbogbogbò ń ṣiṣẹ́ lẹ́yìn storage àti grid import pẹ̀lú ramp-up limit tí a tẹ̀; ramp-down ń ṣẹlẹ̀ lẹ́sẹ̀kẹsẹ̀.",
      "Na AC-bus dispatch teaching model, no be site forecast or utility operation model. E no include feeder/transformer loss, cost, frequency response or unit-specific transient model. Profiles wey you enter na assumptions. Generic backup capacity run after storage and grid imports with di ramp-up limit; ramp-down happen at once.",
    ],
};

function tr(message: string, locale: Locale) {
  const row = copy[message];
  if (!row || locale === "en") return message;
  return locale === "de" ? row[0] : locale === "yo" ? row[1] : row[2];
}

interface Editable {
  intervalHours: number;
  windSpeeds: number[];
  irradiance: number[];
  hydroFlows: string;
  hydroHead: number;
  hydroEfficiency: number;
  hydroRating: number;
  reservoirInflows: string;
  reservoirCapacity: number;
  reservoirInitial: number;
  reservoirBypass: number;
  reservoirHeadRise: number;
  demand: number[];
  critical: number[];
  pvDcKW: number;
  pvAcKW: number;
  turbines: number;
  batteryKWh: number;
  pumpedCapacity: number;
  gridImportLimit: number;
  gridExportLimit: number;
  gridOutages: string;
  pumpedInitial: number;
  pumpLimit: number;
  pumpedGenerationLimit: number;
  pumpEfficiency: number;
  pumpedGenerationEfficiency: number;
  initialSoc: number;
  reserveSoc: number;
  batteryPowerKW: number;
  batteryChargeEfficiency: number;
  batteryDischargeEfficiency: number;
  backupKW: number;
  rampKW: number;
  backupOutages: string;
  thermalBackup: boolean;
  backupHeatRate: number;
  backupCO2Factor: string;
}

function defaults(): Editable {
  return {
    intervalHours: DEFAULT_MICROGRID_DISPATCH_INPUTS.intervalHours,
    hydroFlows: "",
    hydroHead: 30,
    hydroEfficiency: 85,
    hydroRating: 50,
    reservoirInflows: "",
    reservoirCapacity: 10000,
    reservoirInitial: 5000,
    reservoirBypass: 0,
    reservoirHeadRise: 0,
    windSpeeds: DEFAULT_MICROGRID_DISPATCH_INPUTS.wind.windSpeedsMps,
    irradiance: DEFAULT_MICROGRID_DISPATCH_INPUTS.pvByInterval.map(
      (x) => x.planeOfArrayIrradianceWm2,
    ),
    demand: DEFAULT_MICROGRID_DISPATCH_INPUTS.demandKW,
    critical: DEFAULT_MICROGRID_DISPATCH_INPUTS.criticalDemandKW,
    pvDcKW: pvDefaults.dcNameplateKW,
    pvAcKW: pvDefaults.inverterAcRatingKW,
    turbines: DEFAULT_MICROGRID_DISPATCH_INPUTS.wind.turbineCount,
    batteryKWh: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.capacityKWh,
    pumpedCapacity: 0,
    gridImportLimit: 0,
    gridExportLimit: 0,
    gridOutages: "",
    backupOutages: "",
    thermalBackup: false,
    backupHeatRate: 10,
    backupCO2Factor: "",
    pumpedInitial: 0,
    pumpLimit: 25,
    pumpedGenerationLimit: 25,
    pumpEfficiency: 85,
    pumpedGenerationEfficiency: 85,
    initialSoc: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.initialSocPercent,
    reserveSoc: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.minimumSocPercent,
    batteryPowerKW: DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.maxDischargeKW,
    batteryChargeEfficiency:
      DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.chargeEfficiency * 100,
    batteryDischargeEfficiency:
      DEFAULT_MICROGRID_DISPATCH_INPUTS.battery.dischargeEfficiency * 100,
    backupKW: DEFAULT_MICROGRID_DISPATCH_INPUTS.backupGenerator.ratedKW,
    rampKW:
      DEFAULT_MICROGRID_DISPATCH_INPUTS.backupGenerator.rampUpKWPerInterval,
  };
}

function readSaved(): Editable {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(INPUT_KEY) ?? "null",
    );
    if (saved && typeof saved === "object" && "demand" in saved) {
      const value = saved as Partial<Editable>;
      if (
        [
          value.windSpeeds,
          value.irradiance,
          value.demand,
          value.critical,
        ].every(Array.isArray)
      )
        return {
          ...defaults(),
          ...value,
          hydroFlows:
            typeof value.hydroFlows === "string" ? value.hydroFlows : "",
          reservoirInflows:
            typeof value.reservoirInflows === "string"
              ? value.reservoirInflows
              : "",
          gridOutages:
            typeof value.gridOutages === "string" ? value.gridOutages : "",
          backupOutages:
            typeof value.backupOutages === "string" ? value.backupOutages : "",
          thermalBackup: value.thermalBackup === true,
          backupCO2Factor:
            typeof value.backupCO2Factor === "string"
              ? value.backupCO2Factor
              : "",
        };
    }
  } catch {
    /* use the published illustrative lesson defaults */
  }
  return defaults();
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function parseNumericProfile(profile: string) {
  return profile.split(",").map((flow) => (flow.trim() ? Number(flow) : NaN));
}

export function MicrogridDispatchExperiment() {
  const locale = useContext(LanguageContext);
  const label = (s: string) => tr(s, locale);
  const [state, setState] = useState<Editable>(readSaved);
  const [saved, setSaved] = useState(false);
  const inputs: MicrogridDispatchInputs = useMemo(() => {
    const pvByInterval: PvPerformanceInputs[] = state.irradiance.map(
      (planeOfArrayIrradianceWm2) => ({
        ...pvDefaults,
        dcNameplateKW: state.pvDcKW,
        inverterAcRatingKW: state.pvAcKW,
        planeOfArrayIrradianceWm2,
      }),
    );
    return {
      intervalHours: state.intervalHours,
      wind: {
        windSpeedsMps: state.windSpeeds,
        intervalHours: state.intervalHours,
        turbineCount: state.turbines,
      },
      pvByInterval,
      hydro:
        state.hydroFlows.trim() || state.reservoirInflows.trim()
          ? {
              netHeadM: state.hydroHead,
              efficiencyPercent: state.hydroEfficiency,
              ratedKW: state.hydroRating,
              flowsM3s: parseNumericProfile(state.hydroFlows),
              reservoir: state.reservoirInflows.trim()
                ? {
                    inflowsM3s: parseNumericProfile(state.reservoirInflows),
                    capacityM3: state.reservoirCapacity,
                    initialM3: state.reservoirInitial,
                    environmentalReleaseM3s: state.reservoirBypass,
                    fullStorageHeadRiseM: state.reservoirHeadRise,
                  }
                : undefined,
            }
          : undefined,
      demandKW: state.demand,
      criticalDemandKW: state.critical,
      battery: {
        ...DEFAULT_MICROGRID_DISPATCH_INPUTS.battery,
        capacityKWh: state.batteryKWh,
        initialSocPercent: state.initialSoc,
        minimumSocPercent: state.reserveSoc,
        maxChargeKW: state.batteryPowerKW,
        maxDischargeKW: state.batteryPowerKW,
        chargeEfficiency: state.batteryChargeEfficiency / 100,
        dischargeEfficiency: state.batteryDischargeEfficiency / 100,
      },
      backupGenerator: {
        ratedKW: state.backupKW,
        rampUpKWPerInterval: state.rampKW,
        outageIntervals: state.backupOutages.trim()
          ? parseNumericProfile(state.backupOutages)
          : undefined,
        thermal: state.thermalBackup
          ? {
              heatRateMJPerKWh: state.backupHeatRate,
              directCO2KgPerGJ:
                state.backupCO2Factor.trim() === ""
                  ? undefined
                  : Number(state.backupCO2Factor),
            }
          : undefined,
      },
      grid:
        state.gridImportLimit === 0 &&
        state.gridExportLimit === 0 &&
        !state.gridOutages.trim()
          ? undefined
          : {
              importLimitKW: state.gridImportLimit,
              exportLimitKW: state.gridExportLimit,
              outageIntervals: state.gridOutages.trim()
                ? parseNumericProfile(state.gridOutages)
                : [],
            },
      pumpedStorage:
        state.pumpedCapacity === 0
          ? undefined
          : {
              capacityKWh: state.pumpedCapacity,
              initialKWh: state.pumpedInitial,
              maxPumpKW: state.pumpLimit,
              maxGenerationKW: state.pumpedGenerationLimit,
              pumpEfficiency: state.pumpEfficiency / 100,
              generationEfficiency: state.pumpedGenerationEfficiency / 100,
            },
    };
  }, [state]);
  const errors = useMemo(
    () => validateMicrogridDispatchInputs(inputs),
    [inputs],
  );
  const result = useMemo(
    () => (errors.length ? null : calculateMicrogridDispatch(inputs)),
    [errors, inputs],
  );
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale === "pcm" ? "en-NG" : locale, {
      maximumFractionDigits: 2,
    }).format(v);
  const field = (
    key: keyof Editable,
    title: string,
    value: number | number[],
    textarea = false,
  ) => (
    <label className="pg-field" key={key}>
      <span>{label(title)}</span>
      {textarea ? (
        <textarea
          aria-label={label(title)}
          rows={2}
          value={(value as number[]).join(", ")}
          onChange={(e) => {
            const parsed =
              e.currentTarget.value.trim() === ""
                ? []
                : e.currentTarget.value
                    .split(",")
                    .map((x) => (x.trim() === "" ? Number.NaN : Number(x)));
            setState((old) => ({ ...old, [key]: parsed }));
            setSaved(false);
          }}
        />
      ) : (
        <input
          aria-label={label(title)}
          data-testid={`microgrid-${key}`}
          type="number"
          min="0"
          step="any"
          value={value as number}
          onChange={(e) => {
            const nextValue = e.currentTarget.valueAsNumber;
            setState((old) => ({ ...old, [key]: nextValue }));
            setSaved(false);
          }}
        />
      )}
    </label>
  );
  const exportResult = (kind: "json" | "csv") => {
    if (!result) return;
    if (kind === "json")
      download(
        "powergrid-microgrid-dispatch.json",
        JSON.stringify(
          {
            model:
              "chronological-ac-bus-dispatch-pv-wind-hydro-battery-critical-load",
            inputs,
            result,
            limitations: label(LIMITS),
          },
          null,
          2,
        ),
        "application/json",
      );
    else
      download(
        "powergrid-microgrid-intervals.csv",
        [
          "interval,pv_available_kW,wind_available_kW,renewable_available_kW,demand_kW,critical_demand_kW,battery_charge_kW,battery_discharge_kW,battery_soc_kWh,backup_generation_kW,curtailment_kW,critical_unserved_kW,noncritical_unserved_kW,served_kW,balance_residual_kW,hydro_available_kW,reservoir_storage_m3,turbine_m3,environmental_bypass_m3,unmet_bypass_m3,spill_m3,reservoir_net_head_m,grid_import_kW,grid_export_kW,grid_connected,backup_in_service,backup_headroom_kW,backup_fuel_energy_MJ,backup_direct_CO2_kg,pump_input_kW,pumped_generation_kW,hydraulic_storage_kWh,pumped_storage_losses_kWh",
          ...result.intervals.map((r) =>
            [
              r.interval,
              r.pvAvailableKW,
              r.windAvailableKW,
              r.renewableAvailableKW,
              r.demandKW,
              r.criticalDemandKW,
              r.batteryChargeKW,
              r.batteryDischargeKW,
              r.batterySocKWh,
              r.backupGenerationKW,
              r.renewableCurtailmentKW,
              r.criticalUnservedKW,
              r.nonCriticalUnservedKW,
              r.servedDemandKW,
              r.balanceResidualKW,
              r.hydroAvailableKW,
              r.hydroWater?.storageM3,
              r.hydroWater?.turbineM3,
              r.hydroWater?.environmentalReleaseM3,
              r.hydroWater?.unmetEnvironmentalReleaseM3,
              r.hydroWater?.spillM3,
              r.hydroWater?.netHeadM,
              r.gridImportKW,
              r.gridExportKW,
              r.gridConnected,
              r.backupInService,
              r.backupHeadroomKW,
              r.backupFuelEnergyMJ,
              r.backupDirectCO2Kg,
              r.pumpedStorage?.pumpKW,
              r.pumpedStorage?.generationKW,
              r.pumpedStorage?.storedKWh,
              r.pumpedStorage?.conversionLossKWh,
            ].join(","),
          ),
        ].join("\r\n"),
        "text/csv;charset=utf-8",
      );
  };

  return (
    <section
      className="panel panel-pad pg-panel pg-pv"
      aria-labelledby="pg-microgrid-title"
    >
      <div className="pg-heading">
        <span className="pg-icon" aria-hidden="true">
          <SunMedium size={18} />
        </span>
        <div>
          <h3 id="pg-microgrid-title">
            {label("Microgrid dispatch laboratory")}
          </h3>
          <p>
            {label(
              "Combine PV, wind, storage and critical demand across equal time intervals.",
            )}
          </p>
        </div>
      </div>
      <div className="pg-wind-controls">
        {field("windSpeeds", "Wind speed (m/s)", state.windSpeeds, true)}
        {field("irradiance", "Solar irradiance (W/m²)", state.irradiance, true)}
        <label className="pg-field">
          <span>{label("Hydro flow by interval (m³/s), optional")}</span>
          <textarea
            rows={2}
            value={state.hydroFlows}
            onChange={(event) => {
              const hydroFlows = event.currentTarget.value;
              setState((old) => ({ ...old, hydroFlows }));
              setSaved(false);
            }}
          />
        </label>
        {field("hydroHead", "Hydro net head (m)", state.hydroHead)}
        {field(
          "hydroEfficiency",
          "Hydro combined efficiency (%)",
          state.hydroEfficiency,
        )}
        {field("hydroRating", "Hydro installed rating (kW)", state.hydroRating)}
        <label className="pg-field">
          <span>{label("Reservoir inflow by interval (m³/s), optional")}</span>
          <textarea
            rows={2}
            value={state.reservoirInflows}
            onChange={(event) => {
              const reservoirInflows = event.currentTarget.value;
              setState((old) => ({ ...old, reservoirInflows }));
              setSaved(false);
            }}
          />
        </label>
        {state.reservoirInflows.trim() && (
          <>
            {field(
              "reservoirCapacity",
              "Reservoir capacity (m³)",
              state.reservoirCapacity,
            )}
            {field(
              "reservoirInitial",
              "Initial reservoir water (m³)",
              state.reservoirInitial,
            )}
            {field(
              "reservoirBypass",
              "Environmental bypass (m³/s)",
              state.reservoirBypass,
            )}
            {field(
              "reservoirHeadRise",
              "Head rise at full reservoir (m)",
              state.reservoirHeadRise,
            )}
          </>
        )}
        {field("demand", "Total demand (kW)", state.demand, true)}
        {field("critical", "Critical demand (kW)", state.critical, true)}
        {field("pvDcKW", "PV array DC rating (kW)", state.pvDcKW)}
        {field("pvAcKW", "PV inverter AC rating (kW)", state.pvAcKW)}
        {field("turbines", "Wind turbines", state.turbines)}
        {field("intervalHours", "Interval duration (h)", state.intervalHours)}
        {field("batteryKWh", "Battery capacity (kWh)", state.batteryKWh)}
        {field(
          "pumpedCapacity",
          "Pumped storage capacity (kWh), zero to disable",
          state.pumpedCapacity,
        )}
        {inputs.pumpedStorage && (
          <>
            {field(
              "pumpedInitial",
              "Initial stored hydraulic energy (kWh)",
              state.pumpedInitial,
            )}
            {field("pumpLimit", "Pump input limit (kW)", state.pumpLimit)}
            {field(
              "pumpedGenerationLimit",
              "Pumped generation limit (kW)",
              state.pumpedGenerationLimit,
            )}
            {field(
              "pumpEfficiency",
              "Pump efficiency (%)",
              state.pumpEfficiency,
            )}
            {field(
              "pumpedGenerationEfficiency",
              "Pumped generation efficiency (%)",
              state.pumpedGenerationEfficiency,
            )}
          </>
        )}
        {field(
          "initialSoc",
          "Initial battery state of charge (%)",
          state.initialSoc,
        )}
        {field("reserveSoc", "Minimum reserve (%)", state.reserveSoc)}
        {field(
          "batteryPowerKW",
          "Battery charge/discharge limit (kW)",
          state.batteryPowerKW,
        )}
        {field(
          "batteryChargeEfficiency",
          "Battery charge efficiency (%)",
          state.batteryChargeEfficiency,
        )}
        {field(
          "batteryDischargeEfficiency",
          "Battery discharge efficiency (%)",
          state.batteryDischargeEfficiency,
        )}
        {field("backupKW", "Dispatchable backup limit (kW)", state.backupKW)}
        {field("rampKW", "Backup ramp-up per interval (kW)", state.rampKW)}
        <label className="pg-field">
          <span>{label("Model thermal backup fuel use")}</span>
          <input
            type="checkbox"
            checked={state.thermalBackup}
            onChange={(event) => {
              const thermalBackup = event.currentTarget.checked;
              setState((old) => ({ ...old, thermalBackup }));
              setSaved(false);
            }}
          />
        </label>
        {state.thermalBackup && (
          <>
            {field(
              "backupHeatRate",
              "Net heat rate (MJ/kWh)",
              state.backupHeatRate,
            )}
            <label className="pg-field">
              <span>{label("Direct CO₂ factor (kg/GJ), optional")}</span>
              <input
                type="number"
                step="any"
                min="0"
                value={state.backupCO2Factor}
                onChange={(event) => {
                  const backupCO2Factor = event.currentTarget.value;
                  setState((old) => ({ ...old, backupCO2Factor }));
                  setSaved(false);
                }}
              />
            </label>
          </>
        )}
        <label className="pg-field">
          <span>{label("Backup outage intervals (optional)")}</span>
          <input
            type="text"
            value={state.backupOutages}
            onChange={(event) => {
              const backupOutages = event.currentTarget.value;
              setState((old) => ({ ...old, backupOutages }));
              setSaved(false);
            }}
          />
        </label>
        {field(
          "gridImportLimit",
          "Grid import limit (kW)",
          state.gridImportLimit,
        )}
        {field(
          "gridExportLimit",
          "Grid export limit (kW)",
          state.gridExportLimit,
        )}
        <label className="pg-field">
          <span>{label("Grid outage intervals (optional)")}</span>
          <input
            type="text"
            value={state.gridOutages}
            onChange={(event) => {
              const gridOutages = event.currentTarget.value;
              setState((old) => ({ ...old, gridOutages }));
              setSaved(false);
            }}
          />
        </label>
      </div>
      <p>
        {label(
          "Hydro uses entered flow at fixed net head. Leave the flow profile empty to omit hydro.",
        )}
      </p>
      {errors.length > 0 && (
        <div className="pg-errors" role="alert">
          <ul>
            {errors.map((e, i) => (
              <li key={`${e}-${i}`}>{label(e)}</li>
            ))}
          </ul>
        </div>
      )}
      {inputs.hydro?.reservoir && (
        <p>
          {label(
            "The model allocates bypass first and limits turbine flow by water and rating. Net head adds the full-reservoir rise scaled by starting fill. A zero rise keeps head fixed.",
          )}
        </p>
      )}
      {result && (
        <>
          <dl className="pg-metrics pg-wind-metrics">
            {[
              [
                "Available generation",
                result.renewableEnergyAvailableKWh,
                "kWh",
              ],
              ["Served energy", result.servedEnergyKWh, "kWh"],
              [
                "Unserved critical energy",
                result.criticalUnservedEnergyKWh,
                "kWh",
              ],
              [
                "Unserved non-critical energy",
                result.nonCriticalUnservedEnergyKWh,
                "kWh",
              ],
              ["Backup energy", result.backupEnergyKWh, "kWh"],
              ...(result.backupFuelEnergyMJ !== undefined
                ? [["Backup fuel energy", result.backupFuelEnergyMJ, "MJ"]]
                : []),
              ...(result.backupDirectCO2Kg !== undefined
                ? [["Backup direct CO₂", result.backupDirectCO2Kg, "kg"]]
                : []),
              ...(inputs.grid
                ? [
                    ["Grid import", result.gridImportEnergyKWh, "kWh"],
                    ["Grid export", result.gridExportEnergyKWh, "kWh"],
                  ]
                : []),
              [
                "Renewable curtailment",
                result.renewableEnergyCurtailedKWh,
                "kWh",
              ],
              ["Battery throughput", result.batteryThroughputKWh, "kWh"],
            ].map(([name, value, unit]) => (
              <div key={name as string}>
                <dt>{label(name as string)}</dt>
                <dd>
                  {fmt(value as number)} {unit}
                </dd>
              </div>
            ))}
          </dl>
          <div className="pg-table-wrap">
            <table className="pg-wind-table">
              <thead>
                <tr>
                  {[
                    "Interval",
                    "PV kW",
                    "Wind kW",
                    "Hydro kW",
                    "Demand kW",
                    "Battery kW (+ discharge)",
                    "SOC kWh",
                    "Backup kW",
                    "Backup availability",
                    "Backup headroom (kW)",
                    ...(result.backupFuelEnergyMJ !== undefined
                      ? ["Backup fuel energy (MJ)"]
                      : []),
                    ...(result.backupDirectCO2Kg !== undefined
                      ? ["Backup direct CO₂ (kg)"]
                      : []),
                    "Curtailment kW",
                    "Critical unmet kW",
                    "Non-critical unmet kW",
                    ...(inputs.grid
                      ? [
                          "Grid connection",
                          "Grid import (kW)",
                          "Grid export (kW)",
                        ]
                      : []),
                    ...(inputs.hydro?.reservoir
                      ? [
                          "Reservoir water (m³)",
                          "Net head (m)",
                          "Water spilled (m³)",
                          "Unmet bypass (m³)",
                        ]
                      : []),
                    ...(inputs.pumpedStorage
                      ? [
                          "Pump input (kW)",
                          "Pumped generation (kW)",
                          "Hydraulic storage (kWh)",
                          "Pumped storage losses (kWh)",
                        ]
                      : []),
                  ].map((s) => (
                    <th key={s}>{label(s)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.intervals.map((r) => (
                  <tr key={r.interval}>
                    <th scope="row">{r.interval}</th>
                    <td>{fmt(r.pvAvailableKW)}</td>
                    <td>{fmt(r.windAvailableKW)}</td>
                    <td>{fmt(r.hydroAvailableKW)}</td>
                    <td>{fmt(r.demandKW)}</td>
                    <td>{fmt(r.batteryDischargeKW - r.batteryChargeKW)}</td>
                    <td>{fmt(r.batterySocKWh)}</td>
                    <td>{fmt(r.backupGenerationKW)}</td>
                    <td>
                      {label(
                        r.backupInService ? "In service" : "Out of service",
                      )}
                    </td>
                    <td>{fmt(r.backupHeadroomKW)}</td>
                    {r.backupFuelEnergyMJ !== undefined && (
                      <td>{fmt(r.backupFuelEnergyMJ)}</td>
                    )}
                    {r.backupDirectCO2Kg !== undefined && (
                      <td>{fmt(r.backupDirectCO2Kg)}</td>
                    )}
                    <td>{fmt(r.renewableCurtailmentKW)}</td>
                    <td>{fmt(r.criticalUnservedKW)}</td>
                    <td>{fmt(r.nonCriticalUnservedKW)}</td>
                    {inputs.grid && (
                      <>
                        <td>
                          {label(r.gridConnected ? "Connected" : "Islanded")}
                        </td>
                        <td>{fmt(r.gridImportKW)}</td>
                        <td>{fmt(r.gridExportKW)}</td>
                      </>
                    )}
                    {r.hydroWater && (
                      <>
                        <td>{fmt(r.hydroWater.storageM3)}</td>
                        <td>{fmt(r.hydroWater.netHeadM)}</td>
                        <td>{fmt(r.hydroWater.spillM3)}</td>
                        <td>{fmt(r.hydroWater.unmetEnvironmentalReleaseM3)}</td>
                      </>
                    )}
                    {r.pumpedStorage && (
                      <>
                        <td>{fmt(r.pumpedStorage.pumpKW)}</td>
                        <td>{fmt(r.pumpedStorage.generationKW)}</td>
                        <td>{fmt(r.pumpedStorage.storedKWh)}</td>
                        <td>{fmt(r.pumpedStorage.conversionLossKWh)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="pg-model-note">{label(LIMITS)}</p>
      {state.thermalBackup && (
        <p className="pg-model-note">
          {label(
            "Fuel energy uses a constant net heat rate. Use the same heating-value basis for the heat rate and CO₂ factor. Startup and part-load fuel are outside this model.",
          )}{" "}
          <a href="https://www.eia.gov/tools/faqs/faq.php?id=107">EIA</a>
        </p>
      )}
      <p className="pg-model-note">
        {label(
          "Backup outage intervals use the same numbering as grid outages. Restart ramps from zero. Headroom is unused capacity within the current ramp limit.",
        )}
      </p>
      <p className="pg-model-note">
        {label(
          "Enter comma-separated outage interval numbers starting at 1. Storage acts first, then grid imports precede backup. Remaining surplus can be exported while connected.",
        )}
      </p>
      {inputs.pumpedStorage && (
        <p className="pg-model-note">
          {label(
            "Pumped storage uses surplus after the battery and supplies remaining demand before backup. The model tracks hydraulic energy separately from the hydro reservoir.",
          )}
        </p>
      )}
      <div className="pg-actions">
        <button
          className="button"
          disabled={!result}
          onClick={() => {
            localStorage.setItem(INPUT_KEY, JSON.stringify(state));
            setSaved(true);
          }}
        >
          <Save size={16} />
          {saved
            ? label("Saved in this browser")
            : label("Save scenario locally")}
        </button>
        <button
          className="button"
          disabled={!result}
          onClick={() => exportResult("json")}
        >
          <Download size={16} />
          {label("Export dispatch JSON")}
        </button>
        <button
          className="button"
          disabled={!result}
          onClick={() => exportResult("csv")}
        >
          <Download size={16} />
          {label("Export intervals CSV")}
        </button>
        <button
          className="button"
          onClick={() => {
            localStorage.removeItem(INPUT_KEY);
            setState(defaults());
            setSaved(false);
          }}
        >
          <RotateCcw size={16} />
          {label("Reset inputs")}
        </button>
      </div>
      {errors.length > 0 && (
        <p role="status">
          {label("Fix invalid values before saving or exporting.")}
        </p>
      )}
    </section>
  );
}
