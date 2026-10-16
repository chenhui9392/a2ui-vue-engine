# A2Step

Displays progress through an ordered workflow. The component is not bound to form data.

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `{ title: string; description?: string }[]` | `[]` | Ordered steps to display |
| active | `number` | `0` | Zero-based current step; values outside the range are clamped |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | Display direction |

An empty steps array renders no steps.

## JSON example

```json
[
  {
    "id": "progress",
    "component": "Step",
    "active": 1,
    "direction": "horizontal",
    "steps": [
      { "title": "Submit", "description": "Enter application details" },
      { "title": "Review" },
      { "title": "Complete" }
    ]
  }
]
```
