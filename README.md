## Overview

For this example project I used the raw HTML of this [page](https://forms.fluke.com/IG-GLOBAL-MULTI-2019-DemoContactRequest-uken-LP-1-A?lcid=85c9d7b6-6eb6-e611-80c4-00155dfe6b1a&lrpf=MULTI&plt=200000000&cra=100000000&lsku=&redir=https://www.fluke.com/en-gb/fluke/thank-you-for-contacting-fluke&utm_lp=https://www.fluke.com/en-gb/product/electrical-testing/power-quality/1773-1775-1777)



This project implements an event-driven dataLayer using delegated DOM listeners. Instead of pushing events on page load, events are only pushed when a user actually interacts with the interface (focus, input, change, click, submit, etc.).

The implementation is split into:
- `js/datalayer.js`: the runtime that sets up delegated listeners and pushes to `window.dataLayer`.
- `js/configs/*.js`: one or more configuration modules that describe which elements and DOM events should produce which dataLayer payloads. Currently, `datalayer.form-events.js` is provided.

## Why delegated events?

- **Accurate timing**: pushes happen when the interaction occurs, not at page load.
- **Low maintenance**: one set of listeners on `document`, no per-element wiring.
- **Extensible**: you add or change behavior by editing/adding config files, not core logic.

## How it works

- `js/datalayer.js` imports one or more config modules from `js/configs/`.
- It initializes delegated listeners for common DOM events: `click`, `focusin`, `blur`, `change`, `input` (debounced), and `submit`.
- When an event fires, it searches the configs for a matching rule (CSS selector + `trigger` type).
- If a match is found, it merges the rule’s static data with any dynamic data returned by `getDynamicData(...)` and pushes the final object to `window.dataLayer`.

## Installation and loading

- Include the loader on every page (preferably in a global layout like header/footer) so tracking is always available:

```html
<!-- Prefer near the end of <body> to ensure DOM is present -->
<script type="module" src="./js/datalayer.js"></script>
```

- ES modules must be served over HTTP(S). If you open `index.html` via `file://`, the imports may fail due to browser security (CORS/origin) rules.

If you cannot use modules, convert the files to classic scripts (see “Non-module fallback” below).

## Config structure (schema)

Each config module exports a single object following this shape:

```js
export const formEventsConfig = {
  // Optional: only match events under this container
  parentSelector: '#form-container, form#form224',

  // A map of named rules
  events: {
    ruleName: {
      // Base selector for this rule
      selector: 'input.elqField, input#company',

      // Single-event rule
      event: {
        // Required field sent to GTM/analytics
        event: 'product',
        // Human-readable description
        description: 'DemoContactRequest form - Text field - Focus in field',
        // Free-form classification fields to aid GTM filtering
        component: 'contact_form',
        element: 'text_field',
        action: 'focus',

        // Which DOM event this rule listens for
        trigger: 'focusin', // one of: click|focusin|blur|change|input|submit

        // Optional: compute dynamic values when the event fires
        // Return an object to merge into the payload, or return null to suppress the push
        getDynamicData: function(element, domEvent) {
          const label = (element.closest('.form-group')?.querySelector('.elqLabel')?.textContent || '').trim();
          return {
            field: label,
            actionValue: ' ' // example value
          };
        }
      }
    },

    otherRule: {
      selector: 'select#countryone',

      // Multi-event rule variant: define several sub-events under one logical rule
      events: {
        open: {
          event: 'product',
          description: 'Dropdown - Open',
          component: 'contact_form',
          element: 'dropdown',
          action: 'open',
          trigger: 'focusin'
        },
        select: {
          event: 'product',
          description: 'Dropdown - Select',
          component: 'contact_form',
          element: 'dropdown',
          action: 'select',
          trigger: 'change',
          getDynamicData: function(el) {
            const valueText = el.options?.[el.selectedIndex]?.text?.trim() || el.value || '';
            return { actionValue: valueText };
          }
        }
      }
    }
  }
};
```

### Field reference

- **parentSelector (optional)**: CSS selector used to scope matching to a container. If set, the target element must be inside this container for the rule to match.
- **events**: Object mapping rule names to either a single-event rule (`event`) or a multi-event rule (`events`). The keys are labels for maintainers and have no runtime effect.

Within a single-event rule (`event`) or each sub-rule of a multi-event rule:
- **selector**: CSS selector for the elements that should trigger this rule.
- **event**: String pushed into `window.dataLayer.event`. Often used by GTM as the main trigger name.
- **description**: Human-readable description to aid debugging/inspection.
- **component/element/action**: Free-form taxonomy fields to allow GTM to filter/group events without changing `event`.
- **trigger**: The DOM event type this rule listens for. Supported values in the runtime: `click`, `focusin`, `blur`, `change`, `input`, `submit`.
- **getDynamicData(element, domEvent) (optional)**: Function called at event time. Return an object to merge into the push payload. Return `null` to suppress the push (useful for validating e.g., only push “invalid” when invalid). Avoid heavy work here.

The runtime also adds a **timestamp** (ISO-8601) if not provided by config.

## Extending with more configs

You can create additional config files in `js/configs/` (e.g., `datalayer.commerce-events.js`) following the same schema, then import and register them in `js/datalayer.js`:

```js
// js/datalayer.js
import { formEventsConfig } from './configs/datalayer.form-events.js';
import { commerceEventsConfig } from './configs/datalayer.commerce-events.js';

function initializeDelegatedEvents() {
  const allConfigs = [formEventsConfig, commerceEventsConfig];
  // ... rest unchanged
}
```

Keep individual config files focused (e.g., one for forms, one for product pages) to simplify maintenance.

## Non-module fallback (optional)

If you can’t serve ES modules over HTTP, you can convert to classic scripts:
- Change each config to assign to a global, e.g., `window.formEventsConfig = { ... }`.
- In `datalayer.js`, remove `import ...` and read globals instead:

```html
<script src="./js/configs/datalayer.form-events.js"></script>
<script src="./js/datalayer.classic.js"></script>
```

```js
// datalayer.classic.js
(function(){
  window.dataLayer = window.dataLayer || [];
  const allConfigs = [window.formEventsConfig /*, window.commerceEventsConfig, ...*/];
  // reuse the same initialization logic
})();
```

## Testing tips

- Use the browser console to inspect `window.dataLayer` after interactions.
- Add GTM Preview to see events and variables live.
- Ensure the elements’ selectors in the config match the actual DOM on the page.
- For input-heavy fields, tune the input debounce (default 500ms) in `datalayer.js` if needed.

## Files

- `index.html`: Example page wiring and dev consent bypass.
- `js/datalayer.js`: Delegated event runtime and dataLayer pushing.
- `js/configs/datalayer.form-events.js`: Example config for form interactions.


