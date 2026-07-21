import { ToolsSharingModule } from '/js/modules/tools-sharing.js';
window.ToolsSharingModule = ToolsSharingModule;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof ToolsSharingModule.init === 'function') {
    ToolsSharingModule.init();
  }
});
