# PathMatrix prototype

Open `index.html` in a modern browser. No installation or server is required.

## What it does

- Bins numeric observations on each variable's measurement scale.
- Shows a spectrum of observed trajectories and their centroid.
- Treats direction as an optional interpretation, not an assumption.
- Switches between candidate paths and toggles alternatives.
- Imports a complete PathMatrix JSON dataset.
- Imports CSV observations using the built-in variable/path structure.
- Shows counts and percentages on hover/click.

## Important data note

The built-in dataset is deterministic synthetic presentation data, **not the canonical ALARM dataset**. It is intentionally labelled unverified. Use **Data format** to import validated numeric observations and relationship metadata.

CSV columns are interpreted as numeric variables. JSON additionally supports units, ranges, relation metadata, and named path families.
