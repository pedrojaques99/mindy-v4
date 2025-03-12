// This file is only used when running in Tempo
// It exports routes that are used by Tempo to navigate to storyboards

import React from "react";

const routes = [
  {
    path: "/tempobook/*",
    element: <div>Tempo Storybook</div>,
  },
];

export default routes;
