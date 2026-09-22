// One cup, shared by the hero, the "One store" section and the flight
// between them. The 3D scene reads this every frame; DOM controls write it.
export const cupStore = {
  /** target yaw (radians) set by drag, keys and buttons */
  yaw: 0,
  /** visitor has turned the cup (stops the idle sway) */
  touched: false,
  lidOpen: false,
  sleeveOn: false,
  /** 0 = sitting in the hero, 1 = landed in "One store" */
  flight: 0,
};

export const LANDED = 0.985;
