// Form events configuration for delegated dataLayer pushes
// Matches the structure expected by datalayer.js

export const formEventsConfig = {
  // Limit matching to the form container to avoid noise
  parentSelector: '#form-container, form#form224',

  events: {
    // Text field focus
    textFieldFocus: {
      selector: 'input.elqField, input#company',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Text field - Focus in field',
        component: 'contact_form',
        element: 'text_field',
        action: 'focus',
        trigger: 'focusin',
        getDynamicData: function (element) {
          const label = (element.closest('.form-group')?.querySelector('.elqLabel')?.textContent || '').trim();
          return {
            field: label,
            actionValue: ' ',
            linkText: ' ',
            linkURL: ' ',
          };
        },
      },
    },

    // Text input
    textFieldInput: {
      selector: 'input.elqField, input#company',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Text field - Text input in field',
        component: 'contact_form',
        element: 'text_field',
        action: 'input',
        trigger: 'input',
        getDynamicData: function (element) {
          const label = (element.closest('.form-group')?.querySelector('.elqLabel')?.textContent || '').trim();
          return {
            field: label,
            actionValue: ' ',
            linkText: ' ',
            linkURL: ' ',
          };
        },
      },
    },

    // Text field invalid (on blur, only when invalid)
    textFieldInvalid: {
      selector: 'input.elqField, input#company',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Text field - Field error',
        component: 'contact_form',
        element: 'text_field',
        action: 'invalid',
        trigger: 'blur',
        getDynamicData: function (element) {
          if (element.checkValidity && element.checkValidity()) return null;
          const group = element.closest('.form-group');
          const label = (group?.querySelector('.elqLabel')?.textContent || '').trim();
          const errorText = (group?.querySelector('.require-block')?.textContent || element.validationMessage || '').trim();
          return {
            field: label,
            actionValue: errorText,
            linkText: ' ',
            linkURL: ' ',
          };
        },
      },
    },

    // Country dropdown open (focus)
    countryOpen: {
      selector: 'select#countryone',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Dropdown - Open',
        component: 'contact_form',
        element: 'dropdown',
        action: 'open',
        trigger: 'focusin',
        getDynamicData: function (element) {
          const label = (element.closest('.form-group')?.querySelector('.elqLabel')?.textContent || '').trim();
          return { field: label, actionValue: ' ', linkText: ' ', linkURL: ' ' };
        },
      },
    },

    // Country dropdown close (blur)
    countryClose: {
      selector: 'select#countryone',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Dropdown - Close',
        component: 'contact_form',
        element: 'dropdown',
        action: 'close',
        trigger: 'blur',
        getDynamicData: function (element) {
          const label = (element.closest('.form-group')?.querySelector('.elqLabel')?.textContent || '').trim();
          return { field: label, actionValue: ' ', linkText: ' ', linkURL: ' ' };
        },
      },
    },

    // Country dropdown select (change)
    countrySelect: {
      selector: 'select#countryone',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Dropdown - Select',
        component: 'contact_form',
        element: 'dropdown',
        action: 'select',
        trigger: 'change',
        getDynamicData: function (element) {
          const label = (element.closest('.form-group')?.querySelector('.elqLabel')?.textContent || '').trim();
          const valueText = element.options?.[element.selectedIndex]?.text?.trim() || element.value || '';
          return { field: label, actionValue: valueText, linkText: ' ', linkURL: ' ' };
        },
      },
    },

    // Country dropdown invalid (on blur if invalid)
    countryInvalid: {
      selector: 'select#countryone',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Dropdown - Error',
        component: 'contact_form',
        element: 'dropdown',
        action: 'invalid',
        trigger: 'blur',
        getDynamicData: function (element) {
          if (element.checkValidity && element.checkValidity()) return null;
          const group = element.closest('.form-group');
          const label = (group?.querySelector('.elqLabel')?.textContent || '').trim();
          const errorText = (group?.querySelector('.require-block')?.textContent || '').trim();
          return { field: label, actionValue: errorText, linkText: ' ', linkURL: ' ' };
        },
      },
    },

    // Consent checkbox on/off (KR variant covered as well)
    consentCheckbox: {
      selector: '#consentcheckbox, #personalconsent',
      events: {
        on: {
          event: 'product',
          description: 'DemoContactRequest form - Consent text - Checkbox - On',
          component: 'contact_form',
          element: 'checkbox',
          field: 'ConsentText',
          action: 'on',
          trigger: 'change',
          getDynamicData: function (element) {
            if (!element.checked) return null;
            return { actionValue: ' ', linkText: ' ', linkURL: ' ' };
          },
        },
        off: {
          event: 'product',
          description: 'DemoContactRequest form - Consent text - Checkbox - Off',
          component: 'contact_form',
          element: 'checkbox',
          field: 'ConsentText',
          action: 'off',
          trigger: 'change',
          getDynamicData: function (element) {
            if (element.checked) return null;
            return { actionValue: ' ', linkText: ' ', linkURL: ' ' };
          },
        },
      },
    },

    // CTA button click
    ctaClick: {
      selector: '#submit',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - CTA buttton - Click',
        component: 'contact_form',
        element: 'cta_button',
        action: 'click',
        trigger: 'click',
        getDynamicData: function (element) {
          return { actionValue: (element.textContent || element.value || '').trim(), linkText: ' ', linkURL: ' ' };
        },
      },
    },

    // Form submit (valid only)
    submitValid: {
      selector: 'form#form224',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Submit - Valid',
        component: 'contact_form',
        element: 'cta_button',
        action: 'submit',
        trigger: 'submit',
        getDynamicData: function (element) {
          if (element.checkValidity && !element.checkValidity()) return null;
          return { actionValue: 'valid', linkText: ' ', linkURL: ' ' };
        },
      },
    },

    // Privacy link click
    privacyLinkClick: {
      selector: 'a[href*="privacy-policy"]',
      event: {
        event: 'product',
        description: 'DemoContactRequest form - Privacy link - Click',
        component: 'contact_form',
        element: 'link',
        action: 'click',
        trigger: 'click',
        getDynamicData: function (element) {
          return { linkText: (element.textContent || '').trim(), linkURL: element.href || '' };
        },
      },
    },
  },
};


