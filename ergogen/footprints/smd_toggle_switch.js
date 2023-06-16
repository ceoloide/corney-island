module.exports = {
  params: {
      designator: 'SW',
      side: 'F',
      reversible: false,
      P1: {type: 'net', value: 'MP'},
      P2: {type: 'net', value: 'BAT+'},
      P3: {type: 'net', value: 'RAW'},
      MP: {type: 'net', value: 'MP'},
  },
  body: p => {
    const standard_opening = `
      (footprint "SW_MSK12C02-HB" (layer "${p.side}.Cu") (tedit 5F70BC98)
        ${p.at /* parametric position */}
        (descr "12V 50mA SMD toggle switch, available at LCSC/JLCPCB (C431541)")
        (attr smd)
        (fp_text reference "${p.ref}" (at 0 4 ${p.rot}) (layer "${p.side}.SilkS")
            (effects (font (size 1 1) (thickness 0.15)))
        )
        (fp_text value "SW_MSK12C02-HB" (at 0 5.5 ${p.rot}) (layer "${p.side}.Fab")
            (effects (font (size 1 1) (thickness 0.15)))
        )
        (fp_text user "A" (at -0.75 -2.1 ${p.rot}) (layer "Dwgs.User")
            (effects (font (size 1 1) (thickness 0.15)))
        )
        (fp_text user "B" (at 0.8 -2.1 ${p.rot}) (layer "Dwgs.User")
            (effects (font (size 1 1) (thickness 0.15)))
        )
        (fp_line (start -3.4 -1.4) (end -3.4 1.4) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start -3.4 1.4) (end 3.4 1.4) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start -1.5 -2.9) (end -1.5 -1.4) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start -0.1 -2.9) (end -1.5 -2.9) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start -0.1 -1.4) (end -0.1 -2.9) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start 0.1 -2.9) (end 1.5 -2.9) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start 0.1 -1.4) (end 0.1 -2.9) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start 1.5 -2.9) (end 1.5 -1.4) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start 3.4 -1.4) (end -3.4 -1.4) (width 0.08) (layer "Dwgs.User"))
        (fp_line (start 3.4 1.4) (end 3.4 -1.4) (width 0.08) (layer "Dwgs.User"))

        (pad "" np_thru_hole circle (at -1.5 0 ${180 + p.rot}) (size 0.85 0.85) (drill 0.85) (layers "*.Cu" "*.Mask"))
        (pad "" np_thru_hole circle (at 1.5 0 ${180 + p.rot}) (size 0.85 0.85) (drill 0.85) (layers "*.Cu" "*.Mask"))
    `
    const front = `
        (fp_line (start -4 -1.4) (end -4 -0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -4 -1.4) (end -1.5 -1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -4 -0.9) (end -3.4 -0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -4 0.9) (end -4 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -3.4 0.9) (end -4 0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -3.4 0.9) (end -3.4 -0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -2.55 1.4) (end -4 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -2.55 2.4) (end -2.55 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -2.55 2.4) (end -1.95 2.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -1.95 1.4) (end -1.05 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -1.95 2.4) (end -1.95 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -1.5 -2.9) (end 1.5 -2.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -1.5 -1.4) (end -1.5 -2.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -1.05 2.4) (end -1.05 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -1.05 2.4) (end -0.45 2.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -0.45 1.4) (end 1.95 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -0.45 2.4) (end -0.45 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 1.5 -2.9) (end 1.5 -1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 1.5 -1.4) (end 4 -1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 1.95 2.4) (end 1.95 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 1.95 2.4) (end 2.55 2.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 2.55 1.4) (end 4 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 2.55 2.4) (end 2.55 1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 3.4 -0.9) (end 4 -0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 3.4 0.9) (end 3.4 -0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 4 -0.9) (end 4 -1.4) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 4 0.9) (end 3.4 0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start 4 1.4) (end 4 0.9) (width 0.05) (layer "F.CrtYd"))
        (fp_line (start -3.55 -0.65) (end -3.55 0.65) (width 0.12) (layer "F.SilkS"))
        (fp_line (start -3.05 -1.55) (end 3.05 -1.55) (width 0.12) (layer "F.SilkS"))
        (fp_line (start -2.7 1.55) (end -3.05 1.55) (width 0.12) (layer "F.SilkS"))
        (fp_line (start 3.05 1.55) (end 2.7 1.55) (width 0.12) (layer "F.SilkS"))
        (fp_line (start 3.55 0.65) (end 3.55 -0.65) (width 0.12) (layer "F.SilkS"))
        (pad 1 smd roundrect (at 2.25 2 ${180 + p.rot}) (size 0.6 1.25) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.P1.str})
        (pad 2 smd roundrect (at -0.75 2 ${180 + p.rot}) (size 0.6 1.25) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.P2.str})
        (pad 3 smd roundrect (at -2.25 2 ${180 + p.rot}) (size 0.6 1.25) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.P3.str})
        (pad "MP" smd roundrect (at -3.7 -1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.MP.str})
        (pad "MP" smd roundrect (at -3.7 1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.MP.str})
        (pad "MP" smd roundrect (at 3.7 -1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.MP.str})
        (pad "MP" smd roundrect (at 3.7 1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.15) ${p.MP.str})
    `
    const back = `
        (fp_line (start -4 -1.4) (end -4 -0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -4 -1.4) (end -1.5 -1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -4 -0.9) (end -3.4 -0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -4 0.9) (end -4 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -3.4 0.9) (end -4 0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -3.4 0.9) (end -3.4 -0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -2.55 1.4) (end -4 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -2.55 2.4) (end -2.55 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -2.55 2.4) (end -1.95 2.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -1.95 1.4) (end -1.05 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -1.95 2.4) (end -1.95 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -1.5 -2.9) (end 1.5 -2.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -1.5 -1.4) (end -1.5 -2.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -1.05 2.4) (end -1.05 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -1.05 2.4) (end -0.45 2.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -0.45 1.4) (end 1.95 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -0.45 2.4) (end -0.45 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 1.5 -2.9) (end 1.5 -1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 1.5 -1.4) (end 4 -1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 1.95 2.4) (end 1.95 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 1.95 2.4) (end 2.55 2.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 2.55 1.4) (end 4 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 2.55 2.4) (end 2.55 1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 3.4 -0.9) (end 4 -0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 3.4 0.9) (end 3.4 -0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 4 -0.9) (end 4 -1.4) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 4 0.9) (end 3.4 0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start 4 1.4) (end 4 0.9) (width 0.05) (layer "B.CrtYd"))
        (fp_line (start -3.55 -0.65) (end -3.55 0.65) (width 0.12) (layer "B.SilkS"))
        (fp_line (start -3.05 -1.55) (end 3.05 -1.55) (width 0.12) (layer "B.SilkS"))
        (fp_line (start -2.7 1.55) (end -3.05 1.55) (width 0.12) (layer "B.SilkS"))
        (fp_line (start 3.05 1.55) (end 2.7 1.55) (width 0.12) (layer "B.SilkS"))
        (fp_line (start 3.55 0.65) (end 3.55 -0.65) (width 0.12) (layer "B.SilkS"))
        (pad 3 smd roundrect (at 2.25 2 ${180 + p.rot}) (size 0.6 1.25) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.P3.str})
        (pad 2 smd roundrect (at -0.75 2 ${180 + p.rot}) (size 0.6 1.25) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.P2.str})
        (pad 1 smd roundrect (at -2.25 2 ${180 + p.rot}) (size 0.6 1.25) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.P1.str})
        (pad "MP" smd roundrect (at -3.7 -1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.MP.str})
        (pad "MP" smd roundrect (at -3.7 1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.MP.str})
        (pad "MP" smd roundrect (at 3.7 -1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.MP.str})
        (pad "MP" smd roundrect (at 3.7 1.15 ${270 + p.rot}) (size 0.7 1.1) (layers "B.Cu" "B.Paste" "B.Mask") (roundrect_rratio 0.15) ${p.MP.str})
    `
    
    const standard_closing = `
      )
    `
    let final = standard_opening;

    if(p.side == "F" || p.reversible) {
      final += front;
    }
    if(p.side == "B" || p.reversible) {
      final += back;
    }

    final += standard_closing;

    return final;
  }
}