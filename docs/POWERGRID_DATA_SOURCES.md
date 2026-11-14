# POWERGRID LAB data and provenance

Milestone 1 uses no external telemetry, utility records, customer data, manufacturer data or normative standards tables. Default values are explicitly editable educational scenario inputs, not measured grid data. Calculated values are produced locally by the equations in [`POWERGRID_MODELS.md`](POWERGRID_MODELS.md); the UI and exports identify the model assumptions and limits. No real-world project conclusion should be inferred from the illustrative defaults.

## Regional teaching scenario — Nigeria-inspired (first regional slice)

The source-backed nominal voltage stages and 50 Hz context are taken from the Nigerian Electricity Regulatory Commission's [Nigerian Grid Code, Version 02, public consultation copy](https://nerc.gov.ng/wp-content/uploads/2013/07/Grid%20Code_%28For%20Public%20Consultation%29.pdf) (2013; accessed 14 November 2026). Its voltage table includes 330, 132, 33 and 11 kV. The scenario applies only 132 kV, 330 kV and 33 kV to existing matching worksheet fields; it does not add an 11 kV transformer node.

`NGN` and `Africa/Lagos` are displayed as region metadata (currency code and IANA time-zone identifier), not calculation inputs. No regional resource, weather, demand or customer profile is supplied. The generator-terminal and consumer-voltage inputs remain user-entered. This named teaching scenario is not an operational replica of Nigeria's grid; frequency is informational and is not solved by the balanced steady-state worksheets.

## Regional teaching scenario — Germany-inspired (50Hertz-area example)

The 380, 220 and 110 kV stages and the 15–30 kV medium-voltage range are described on the TSO's [50Hertz transmission grid page](https://www.50hertz.com/en/Grid) (accessed 14 November 2026). The 20 kV value displayed by the scenario is an illustrative point within that published range. Frequency context is supported by the [50Hertz grid-connection rules](https://www.50hertz.com/portals/1/dokumente/vertragspartner/netzanschluss/netzanschlussregeln-stand-05-2008.pdf) (May 2008; accessed 14 November 2026). The 0.4 kV consumer value represents 400 V line-to-line from the [Bundesnetzagentur Monitoringbericht Energie 2024](https://data.bundesnetzagentur.de/Bundesnetzagentur/SharedDocs/Mediathek/Monitoringberichte/MonitoringberichtEnergie2024.pdf) (2024; accessed 14 November 2026).

`EUR` and `Europe/Berlin` are displayed as currency-code and time-zone metadata, not calculation inputs. Applying this scenario updates 220, 380, 110 and 0.4 kV; the generator terminal remains user-entered. It uses one 50Hertz-area example and is not a complete German network model. No local generation, weather, resource or demand time series is loaded, and frequency remains context only.
