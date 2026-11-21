# POWERGRID LAB data and provenance

Milestone 1 uses no external telemetry, utility records, customer data, manufacturer data or normative standards tables. Default values are explicitly editable educational scenario inputs, not measured grid data. Calculated values are produced locally by the equations in [`POWERGRID_MODELS.md`](POWERGRID_MODELS.md); the UI and exports identify the model assumptions and limits. No real-world project conclusion should be inferred from the illustrative defaults.

## Regional teaching scenario — Nigeria-inspired (first regional slice)

The source-backed nominal voltage stages and 50 Hz context are taken from the Nigerian Electricity Regulatory Commission's [Nigerian Grid Code, Version 02, public consultation copy](https://nerc.gov.ng/wp-content/uploads/2013/07/Grid%20Code_%28For%20Public%20Consultation%29.pdf) (2013; accessed 14 November 2026). Its voltage table includes 330, 132, 33 and 11 kV. The scenario applies only 132 kV, 330 kV and 33 kV to existing matching worksheet fields; it does not add an 11 kV transformer node.

`NGN` and `Africa/Lagos` are displayed as region metadata (currency code and IANA time-zone identifier), not calculation inputs. No regional resource, weather, demand or customer profile is supplied. The generator-terminal and consumer-voltage inputs remain user-entered. This named teaching scenario is not an operational replica of Nigeria's grid; frequency is informational and is not solved by the balanced steady-state worksheets.

## Regional teaching scenario — Germany-inspired (50Hertz-area example)

The 380, 220 and 110 kV stages and the 15–30 kV medium-voltage range are described on the TSO's [50Hertz transmission grid page](https://www.50hertz.com/en/Grid) (accessed 14 November 2026). The 20 kV value displayed by the scenario is an illustrative point within that published range. Frequency context is supported by the [50Hertz grid-connection rules](https://www.50hertz.com/portals/1/dokumente/vertragspartner/netzanschluss/netzanschlussregeln-stand-05-2008.pdf) (May 2008; accessed 14 November 2026). The 0.4 kV consumer value represents 400 V line-to-line from the [Bundesnetzagentur Monitoringbericht Energie 2024](https://data.bundesnetzagentur.de/Bundesnetzagentur/SharedDocs/Mediathek/Monitoringberichte/MonitoringberichtEnergie2024.pdf) (2024; accessed 14 November 2026).

`EUR` and `Europe/Berlin` are displayed as currency-code and time-zone metadata, not calculation inputs. Applying this scenario updates 220, 380, 110 and 0.4 kV; the generator terminal remains user-entered. It uses one 50Hertz-area example and is not a complete German network model. No local generation, weather, resource or demand time series is loaded, and frequency remains context only.

## Hydroelectric station scene — process and equipment provenance

The illustrative source-to-generator sequence follows the U.S. Department of Energy [How Hydropower Works](https://www.energy.gov/cmei/water/how-hydropower-works) and [Hydropower Supply Chain report](https://www.energy.gov/sites/default/files/2024-12/Hydropower%20Supply%20Chain%20Report%20-%20Final%5B1%5D.pdf) (accessed 14 November 2026). These references explain representative reservoir/intake/penstock/turbine/generator/transformer equipment and include representative hydropower cutaway material. They do not establish the exact layout, winding terminals or switchyard configuration of a particular station.

The drawing therefore labels its Francis machine and Δ/Yg transformer as an illustrative selected configuration, and identifies the exact depicted terminals and bonds in its inspection panel. No manufacturer, rating, measured water flow, station protection setting or as-built connection is asserted. Brown/black/grey phase colors are schematic identifiers only; the overhead circuit has three bare phase conductors and a separate shield wire, with no line neutral. The generator star point N, protective-earth PE and tower/line shield earth are shown as distinct routes.

## Other generation plant studies — process and equipment references

The combined-cycle teaching scene follows the U.S. Department of Energy (DOE) description of [gas turbine power plants](https://www.energy.gov/hgeo/how-gas-turbine-power-plants-work), including compressor, combustor, turbine and heat recovery, and DOE's [gas-turbine technology fact sheet](https://www.energy.gov/sites/default/files/2016/09/f33/catalog_of_chp_technologies.pdf), which describes exhaust heat recovery through an HRSG and steam turbine in combined-cycle arrangements. The equipment list is representative; actual unit layout, coupling, terminals and cooling systems are plant-specific.

The utility-PV path follows DOE references for [solar PV system design](https://www.energy.gov/cmei/systems/solar-photovoltaic-system-design-basics), [inverters and grid integration](https://www.energy.gov/cmei/systems/solar-integration-inverters-and-grid-services-basics), and [power electronics and balance-of-system hardware](https://www.energy.gov/cmei/systems/power-electronics-and-balance-system-hardware-technologies). The listed modules, strings, DC collection, inverter, AC collection, transformer and interconnection are common functional stages; protection, voltage, grounding, equipment selection and interconnection requirements must be obtained from the specific design.

The wind equipment path follows DOE's [wind turbine component guide](https://www.energy.gov/cmei/systems/explore-wind-turbine-text-version), which describes the rotor, pitch, drivetrain, gearbox or direct drive, generator and controller, and its [wind turbine operation overview](https://www.energy.gov/cmei/systems/how-do-wind-turbines-work). Turbine converter, transformer, collector and substation are shown as representative project interfaces. Specific generator topology, converter arrangement and collection ratings vary by turbine and site.

The solar and wind images are custom teaching illustrations generated for this product, not documentary photographs or evidence of an identified site's construction. They must not be used to infer dimensions, ratings, clearances, exact terminal labels or the installed arrangement.

## Wind reference curve exercise

The worksheet uses Appendix D's tabulated NREL 6 MW (2015) reference turbine curve from [NREL/TP-6A20-67414](https://www.nrel.gov/docs/fy17osti/67414.pdf) (2017 report). This is a research reference turbine, not a commercial machine selected for a site. The model linearly interpolates the supplied wind-speed/power points, including the published zero-output cut-out point.

Wind speeds, interval duration and turbine count are user-entered teaching inputs. The example sequence exercises zero, partial-load, rated and cut-out regions; it is not measured weather or a regional profile. Air density, hub-height adjustment, turbulence, wakes, electrical conversion, availability, curtailment, control strategy and long-term energy yield are outside scope.

The solar thermal worksheet uses the conversion chain from the [U.S. Department of Energy power tower reference](https://www.energy.gov/cmei/systems/power-tower-system-concentrating-solar-thermal-power-basics). The worksheet's efficiencies, aperture, irradiance, capacity and operating threshold are illustrative inputs.

The [DOE-hosted tidal stream resource assessment](https://www.energy.gov/sites/default/files/2013/12/f5/1023527.pdf) documents how turbines extract kinetic energy from tidal currents. The lab operating points and limits are educational inputs.

The binary geothermal worksheet follows the separation of brine and working-fluid loops described in the [DOE geothermal electricity generation reference](https://www.energy.gov/hgeo/geothermal/geothermal-electricity-generation). All operating points and fluid-property simplifications are analytical teaching assumptions.

The deep-water wave worksheet follows equation 19 in the [OSTI-hosted wave energy converter study](https://www.osti.gov/servlets/purl/3014149). The study describes wave flux per metre of crest. The lab uses an illustrative capture width, seawater density and operating limits.

The [DOE gas turbine power plant reference](https://www.energy.gov/hgeo/how-gas-turbine-power-plants-work) describes exhaust heat recovery and the gas/steam conversion chain. The worksheet parameters are illustrative and come from user inputs.
