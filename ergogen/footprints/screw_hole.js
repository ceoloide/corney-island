module.exports = {
  params: {
      designator: 'H', // for Hole
      size: '2.2',  // Default to M2
      drill: '2.2'
  },
  body: p => `
  (module Screw_Hole (layer F.Cu) (tedit 5F1B9159) (tstamp 61905781)
      ${p.at /* parametric position */}
      (fp_text reference "${p.ref}" (at 0 2.55) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.15))))
      (fp_text value "Screw hole (NPTH)" (at 0 -0.5) (layer F.Fab) (effects (font (size 1 1) (thickness 0.15))))
      (pad "" np_thru_hole circle (at 0 0) (size ${p.size} ${p.size}) (drill ${p.drill}) (layers *.Cu *.Mask))
  )
  `
}