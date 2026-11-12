/* global document, window */
import './style.css';
import { setTheme } from '@fluentui/web-components/theme/set-theme.js';
import { webLightTheme } from '@fluentui/tokens';

setTheme(webLightTheme);

const accordion = document.querySelector('fluent-accordion');
const status = document.querySelector('#status');

// Request frames to encourage short idle periods, without guaranteeing their deadlines.
// This uses the browser's real scheduler; no idle callbacks are replaced here.
function updateStatus() {
  status.textContent = accordion.accordionItems?.length
    ? 'Initialized: the heading should respond. The blocking condition was not sustained on this run.'
    : 'Pending: item discovery has not completed. Brief pending periods are normal during startup.';
  window.requestAnimationFrame(updateStatus);
}
window.requestAnimationFrame(updateStatus);

// Register Fluent after the frame loop starts. demo-content intentionally stays unregistered,
// as can happen with framework component hosts that are not browser custom elements.
await import('@fluentui/web-components/accordion-item/define.js');
await import('@fluentui/web-components/accordion/define.js');
