// Delegated dataLayer event system
// Imports the form events config and wires listeners to push events only when they occur

import { formEventsConfig } from './configs/datalayer.form-events.js';

// Datalayer object to store events
window.dataLayer = window.dataLayer || [];

// Function to push events to dataLayer
function pushToDataLayer(event) {
  window.dataLayer.push(event);
}

// Function to check if element has a specific parent
function hasParent(element, parentSelector) {
  let currentElement = element;
  while (currentElement) {
    if (currentElement.matches && currentElement.matches(parentSelector)) {
      return true;
    }
    currentElement = currentElement.parentElement;
  }
  return false;
}

// Debounce function for input events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Find the matching configuration for an element
function findMatchingConfig(element, eventType, configs) {
  for (const [key, value] of Object.entries(configs.events)) {
    // Single event configuration
    if (value.event && value.event.trigger === eventType) {
      if (element.matches && element.matches(value.selector)) {
        // Check parent selector if needed
        if (configs.parentSelector && !hasParent(element, configs.parentSelector)) {
          continue;
        }
        return { configKey: key, config: value.event, element };
      }
    }

    // Multiple events configuration
    if (value.events) {
      for (const [eventKey, eventConfig] of Object.entries(value.events)) {
        if (eventConfig.trigger === eventType) {
          const selector = eventConfig.selector || value.selector;
          if (element.matches && element.matches(selector)) {
            if (configs.parentSelector && !hasParent(element, configs.parentSelector)) {
              continue;
            }
            return { configKey: `${key}.${eventKey}`, config: eventConfig, element };
          }
        }
      }
    }
  }
  return null;
}

// Base event properties
const BASE_EVENT_PROPERTIES = {
  event: '',
  action: '',
  timestamp: '',
};

function processEvent(match, event) {
  if (!match) return;

  const baseEventData = {
    ...BASE_EVENT_PROPERTIES,
  };

  // Extract static data from the config, removing internal properties
  const staticConfigData = { ...match.config };
  delete staticConfigData.getDynamicData;
  delete staticConfigData.trigger;

  // Get dynamic data; allow null to suppress event
  const dynamicData = match.config.getDynamicData ? match.config.getDynamicData(match.element, event) : {};
  if (dynamicData === null) {
    return;
  }

  // Merge base, static, and dynamic data
  const eventData = {
    ...baseEventData,
    ...staticConfigData,
    ...dynamicData,
  };

  // Ensure 'event' field is present
  if (!eventData.event) {
    return;
  }

  // Stamp timestamp if not provided by config/dynamic data
  if (!eventData.timestamp) {
    eventData.timestamp = new Date().toISOString();
  }

  pushToDataLayer(eventData);
}

function initializeDelegatedEvents() {
  const allConfigs = [formEventsConfig];

  // Track last focused element across window blur/focus cycles to suppress synthetic focus
  let lastFocusedElementBeforeWindowBlur = null;
  let windowRefocusedAt = 0;
  window.addEventListener('blur', () => {
    lastFocusedElementBeforeWindowBlur = document.activeElement;
  });
  window.addEventListener('focus', () => {
    windowRefocusedAt = Date.now();
  });

  // Handle click events
  document.addEventListener('click', (event) => {
    let actualTarget = event.target;
    // Example for shadow DOM host handling (kept from reference)
    if (event.target && event.composedPath) {
      const path = event.composedPath();
      if (path && path.length) {
        actualTarget = path[0];
      }
    }

    for (const config of allConfigs) {
      const match = findMatchingConfig(actualTarget, 'click', config);
      if (match) {
        processEvent(match, event);
        break;
      }
    }
  });

  // Handle focusin events with brief debounce and suppression after window refocus
  let focusinTimer;
  document.addEventListener('focusin', (event) => {
    if (focusinTimer) clearTimeout(focusinTimer);
    const target = event.target;
    const now = Date.now();
    if (
      windowRefocusedAt &&
      now - windowRefocusedAt < 200 &&
      lastFocusedElementBeforeWindowBlur &&
      target === lastFocusedElementBeforeWindowBlur
    ) {
      return;
    }
    focusinTimer = setTimeout(() => {
      for (const config of allConfigs) {
        const match = findMatchingConfig(target, 'focusin', config);
        if (match) {
          processEvent(match, event);
          break;
        }
      }
    }, 60);
  });

  // Handle blur events
  document.addEventListener('blur', (event) => {
    for (const config of allConfigs) {
      const match = findMatchingConfig(event.target, 'blur', config);
      if (match) {
        processEvent(match, event);
        break;
      }
    }
  }, true);

  // Handle change events
  document.addEventListener('change', (event) => {
    for (const config of allConfigs) {
      const match = findMatchingConfig(event.target, 'change', config);
      if (match) {
        processEvent(match, event);
        break;
      }
    }
  });

  // Handle input events with debounce
  const debouncedInputHandler = debounce((event) => {
    for (const config of allConfigs) {
      const match = findMatchingConfig(event.target, 'input', config);
      if (match) {
        processEvent(match, event);
        break;
      }
    }
  }, 500);
  document.addEventListener('input', debouncedInputHandler);

  // Handle submit events
  document.addEventListener('submit', (event) => {
    for (const config of allConfigs) {
      const match = findMatchingConfig(event.target, 'submit', config);
      if (match) {
        processEvent(match, event);
        // continue to allow multiple configs if needed
      }
    }
  });
}

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded - initializeDelegatedEvents');
  initializeDelegatedEvents();
});


