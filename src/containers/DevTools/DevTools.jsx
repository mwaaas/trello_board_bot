import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

const props = {
  defaultSize: 0.25,
  defaultPosition: 'left',
  defaultIsVisible: false,
};
export default createDevTools(
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    { ...props }
  >
    <LogMonitor theme="monokai" />
  </DockMonitor>,
);
