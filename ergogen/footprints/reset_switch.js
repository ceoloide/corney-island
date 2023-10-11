module.exports = {
    params: {
        designator: 'B', // for Button
        side: 'F',
        from: undefined,
        to: undefined
    },
    body: p => `
    (module ceoloide:top-actuated-reset-switch (layer F.Cu) (tedit 5B9559E6) (tstamp 61905781)

        (descr "A two pin, top actuated, through-hole Tactile Switch, the same as on the Corne (PTS636 SP43 LFS)")
        (tags "Tactile Switch")

        ${p.at /* parametric position */}
        ${'' /* footprint reference */}
        (fp_text reference "${p.ref}" (at 0 2.55 90) (layer F.SilkS) ${p.ref_hide} (effects (font (size 1 1) (thickness 0.153))))
        (fp_text value "Reset (PTS636 SP43 LFS)" (at 0 -2.55 90) (layer F.Fab) (effects (font (size 1 1) (thickness 0.153))))

        ${'' /* outline */}
        (fp_text user "RST" (at 0 0 ${p.rot}) (layer F.SilkS) (effects (font (size 1 1) (thickness 0.153))))
        (fp_text user "RST" (at 0 0 ${p.rot}) (layer B.SilkS) (effects (font (size 1 1) (thickness 0.153)) (justify mirror)))

        (fp_line (start 3 1.5) (end 3 1.75) (layer B.SilkS) (width 0.15))
        (fp_line (start 3 1.75) (end -3 1.75) (layer B.SilkS) (width 0.15))
        (fp_line (start -3 1.75) (end -3 1.5) (layer B.SilkS) (width 0.15))
        (fp_line (start -3 -1.5) (end -3 -1.75) (layer B.SilkS) (width 0.15))
        (fp_line (start -3 -1.75) (end 3 -1.75) (layer B.SilkS) (width 0.15))
        (fp_line (start 3 -1.75) (end 3 -1.5) (layer B.SilkS) (width 0.15))
        (fp_line (start -3 1.75) (end 3 1.75) (layer F.SilkS) (width 0.15))
        (fp_line (start 3 1.75) (end 3 1.5) (layer F.SilkS) (width 0.15))
        (fp_line (start -3 1.75) (end -3 1.5) (layer F.SilkS) (width 0.15))
        (fp_line (start -3 -1.75) (end -3 -1.5) (layer F.SilkS) (width 0.15))
        (fp_line (start -3 -1.75) (end 3 -1.75) (layer F.SilkS) (width 0.15))
        (fp_line (start 3 -1.75) (end 3 -1.5) (layer F.SilkS) (width 0.15))

        ${'' /* pins */}
        (pad 2 thru_hole circle (at -3.25 0 ${p.rot}) (size 2 2) (drill 1.3) (layers *.Cu *.Mask) ${p.from.str})
        (pad 1 thru_hole circle (at 3.25 0 ${p.rot}) (size 2 2) (drill 1.3) (layers *.Cu *.Mask) ${p.to.str})
    )
    `
}