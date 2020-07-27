const electron = window.require ? window.require("electron") : {}

export function openLink(fancyLink){
  if(electron&&electron.shell) {
    electron.shell.openExternal(fancyLink);
  }
}