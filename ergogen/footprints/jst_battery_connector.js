module.exports = {
    params: {
        side: 'F',
        reversible: false,
        BAT_P: { type: 'net', value: 'BAT_P' },
        BAT_N: { type: 'net', value: 'GND' },
        silkscreen: true,
        fabrication: true,
        courtyard: true,
    },
    body: p => {

        let local_nets = [
            p.local_net("B_POS").str,
            p.local_net("B_NEG").str,
        ];
        const standard_opening = `
            (module "JST_PH_S2B-PH-K" (layer ${p.side}.Cu) (tedit 6135B927)
                ${p.at /* parametric position */}

                (descr "JST PH series connector, S2B-PH-K (http://www.jst-mfg.com/product/pdf/eng/ePH.pdf)")
                (fp_text reference "${p.ref}" (at 1 -2.55 ${p.rot}) (layer "${p.side}.SilkS") ${p.ref_hide}
                    (effects (font (size 1 1) (thickness 0.15)))
                )
            `
            const front_fabrication = `
                (fp_line (start -2.95 -1.35) (end -2.95 6.25) (width 0.1) (layer "F.Fab"))
                (fp_line (start -2.95 6.25) (end 2.95 6.25) (width 0.1) (layer "F.Fab"))
                (fp_line (start -2.25 -1.35) (end -2.95 -1.35) (width 0.1) (layer "F.Fab"))
                (fp_line (start -2.25 0.25) (end -2.25 -1.35) (width 0.1) (layer "F.Fab"))
                (fp_line (start 2.25 -1.35) (end 2.25 0.25) (width 0.1) (layer "F.Fab"))
                (fp_line (start 2.25 0.25) (end -2.25 0.25) (width 0.1) (layer "F.Fab"))
                (fp_line (start 2.95 -1.35) (end 2.25 -1.35) (width 0.1) (layer "F.Fab"))
                (fp_line (start 2.95 6.25) (end 2.95 -1.35) (width 0.1) (layer "F.Fab"))
                `
            const front_courtyard = `
                (fp_line (start -3.45 -1.85) (end -3.45 8.5) (width 0.05) (layer "F.CrtYd"))
                (fp_line (start -3.45 8.5) (end 3.45 8.5) (width 0.05) (layer "F.CrtYd"))
                (fp_line (start 3.45 -1.85) (end -3.45 -1.85) (width 0.05) (layer "F.CrtYd"))
                (fp_line (start 3.45 8.5) (end 3.45 -1.85) (width 0.05) (layer "F.CrtYd"))
            `
            const front_silkscreen = `
                (fp_line (start -1.5 4.375) (end -0.5 4.375) (width 0.1) (layer "F.SilkS"))
                (fp_line (start -1 3.875) (end -1.5 4.375) (width 0.1) (layer "F.SilkS"))
                (fp_line (start -0.5 4.375) (end -1 3.875) (width 0.1) (layer "F.SilkS"))
                (fp_line (start -2.06 -1.46) (end -3.06 -1.46) (width 0.12) (layer "F.SilkS"))
                (fp_line (start -3.06 -1.46) (end -3.06 -0.46) (width 0.12) (layer "F.SilkS"))
                (fp_line (start 2.14 -1.46) (end 3.06 -1.46) (width 0.12) (layer "F.SilkS"))
                (fp_line (start 3.06 -1.46) (end 3.06 -0.46) (width 0.12) (layer "F.SilkS"))
                (fp_line (start -2.14 6.36) (end -3.06 6.36) (width 0.12) (layer "F.SilkS"))
                (fp_line (start -3.06 6.36) (end -3.06 5.36) (width 0.12) (layer "F.SilkS"))
                (fp_line (start 2.14 6.36) (end 3.06 6.36) (width 0.12) (layer "F.SilkS"))
                (fp_line (start 3.06 6.36) (end 3.06 5.36) (width 0.12) (layer "F.SilkS"))
            `
            const back_fabrication = `
                (fp_line (start 1.5 4.375) (end 0.5 4.375) (width 0.1) (layer "B.SilkS"))
                (fp_line (start 1 3.875) (end 1.5 4.375) (width 0.1) (layer "B.SilkS"))
                (fp_line (start 0.5 4.375) (end 1 3.875) (width 0.1) (layer "B.SilkS"))
                (fp_line (start -2.95 -1.35) (end -2.25 -1.35) (width 0.1) (layer "B.Fab"))
                (fp_line (start -2.95 6.25) (end -2.95 -1.35) (width 0.1) (layer "B.Fab"))
                (fp_line (start -2.25 -1.35) (end -2.25 0.25) (width 0.1) (layer "B.Fab"))
                (fp_line (start -2.25 0.25) (end 2.25 0.25) (width 0.1) (layer "B.Fab"))
                (fp_line (start 2.25 -1.35) (end 2.95 -1.35) (width 0.1) (layer "B.Fab"))
                (fp_line (start 2.25 0.25) (end 2.25 -1.35) (width 0.1) (layer "B.Fab"))
                (fp_line (start 2.95 -1.35) (end 2.95 6.25) (width 0.1) (layer "B.Fab"))
                (fp_line (start 2.95 6.25) (end -2.95 6.25) (width 0.1) (layer "B.Fab"))
                `
            const back_courtyard = `
            (fp_line (start -3.45 -1.85) (end -3.45 8.5) (width 0.05) (layer "B.CrtYd"))
            (fp_line (start -3.45 8.5) (end 3.45 8.5) (width 0.05) (layer "B.CrtYd"))
            (fp_line (start 3.45 -1.85) (end -3.45 -1.85) (width 0.05) (layer "B.CrtYd"))
            (fp_line (start 3.45 8.5) (end 3.45 -1.85) (width 0.05) (layer "B.CrtYd"))
            `
            const back_silkscreen = `
            (fp_line (start -2.06 -1.46) (end -3.06 -1.46) (width 0.12) (layer "B.SilkS"))
            (fp_line (start -3.06 -1.46) (end -3.06 -0.46) (width 0.12) (layer "B.SilkS"))
            (fp_line (start 2.14 -1.46) (end 3.06 -1.46) (width 0.12) (layer "B.SilkS"))
            (fp_line (start 3.06 -1.46) (end 3.06 -0.46) (width 0.12) (layer "B.SilkS"))
            (fp_line (start -2.14 6.36) (end -3.06 6.36) (width 0.12) (layer "B.SilkS"))
            (fp_line (start -3.06 6.36) (end -3.06 5.36) (width 0.12) (layer "B.SilkS"))
            (fp_line (start 2.14 6.36) (end 3.06 6.36) (width 0.12) (layer "B.SilkS"))
            (fp_line (start 3.06 6.36) (end 3.06 5.36) (width 0.12) (layer "B.SilkS"))
            `
        const front_pads = `
            (pad 1 thru_hole roundrect (at -1 0 ${p.rot}) (size 1.2 1.75) (drill 0.75) (layers "*.Cu" "*.Mask") (roundrect_rratio 0.208333) ${p.BAT_P.str})
            (pad 2 thru_hole oval (at 1 0 ${p.rot}) (size 1.2 1.75) (drill 0.75) (layers "*.Cu" "*.Mask") ${p.BAT_N.str})
        `
        const back_pads = `
            (pad 1 thru_hole roundrect (at 1 0 ${p.rot}) (size 1.2 1.75) (drill 0.75) (layers "*.Cu" "*.Mask") (roundrect_rratio 0.208333) ${p.BAT_P.str})
            (pad 2 thru_hole oval (at -1 0 ${p.rot}) (size 1.2 1.75) (drill 0.75) (layers "*.Cu" "*.Mask") ${p.BAT_N.str})
        `
        const reversible_pads = `
            (pad 11 thru_hole oval (at -1 0 ${p.rot}) (size 1.2 1.75) (drill 0.75) (layers "*.Cu" "*.Mask") ${local_nets[0]})
            (pad 12 thru_hole oval (at 1 0 ${p.rot}) (size 1.2 1.75) (drill 0.75) (layers "*.Cu" "*.Mask") ${local_nets[1]})
            (pad 21 smd custom (at -1 1.8 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0.4)
                    (xy -0.6 0.4)
                    (xy -0.6 0.2)
                    (xy 0 -0.4)
                    (xy 0.6 0.2)
                    )   
                    (width 0))
                )
                ${local_nets[0]})
            (pad 31 smd custom (at -1 1.8 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0.4)
                    (xy -0.6 0.4)
                    (xy -0.6 0.2)
                    (xy 0 -0.4)
                    (xy 0.6 0.2)
                    )
                    (width 0))
                )
                ${local_nets[1]})
            (pad 22 smd custom (at 1 1.8 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0.4)
                    (xy -0.6 0.4)
                    (xy -0.6 0.2)
                    (xy 0 -0.4)
                    (xy 0.6 0.2)
                    )
                    (width 0))
                )
                ${local_nets[1]})
            (pad 32 smd custom (at 1 1.8 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0.4)
                    (xy -0.6 0.4)
                    (xy -0.6 0.2)
                    (xy 0 -0.4)
                    (xy 0.6 0.2)
                    )
                    (width 0))
                )
                ${local_nets[1]})
            (pad 1 smd custom (at -1 2.816 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.BAT_N.str}
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0)
                    (xy -0.6 0)
                    (xy -0.6 1)
                    (xy 0 0.4)
                    (xy 0.6 1)
                    )
                    (width 0))
                ) )
            (pad 1 smd custom (at 1 2.816 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.BAT_N.str}
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0)
                    (xy -0.6 0)
                    (xy -0.6 1)
                    (xy 0 0.4)
                    (xy 0.6 1)
                    )
                    (width 0))
                ) )
            (pad 2 smd custom (at -1 2.816 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.BAT_P.str}
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0)
                    (xy -0.6 0)
                    (xy -0.6 1)
                    (xy 0 0.4)
                    (xy 0.6 1)
                    )
                    (width 0))
                ) )
            (pad 2 smd custom (at 1 2.816 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.BAT_P.str}
                (clearance 0.1) (zone_connect 0)
                (options (clearance outline) (anchor rect))
                (primitives
                (gr_poly
                    (pts
                    (xy 0.6 0)
                    (xy -0.6 0)
                    (xy -0.6 1)
                    (xy 0 0.4)
                    (xy 0.6 1)
                    )
                    (width 0))
                ) )
                `
        const standard_closing = `
            )
        `

        let final = standard_opening;

        if(p.side == "F" || p.reversible) {
            if(p.fabrication) {
                final += front_fabrication;
            }
            if(p.courtyard) {
                final += front_courtyard;
            }
            if(p.silkscreen) {
                final += front_silkscreen;
            }
        }
        if(p.side == "B" || p.reversible) {
            if(p.fabrication) {
                final += back_fabrication;
            }
            if(p.courtyard) {
                final += back_courtyard;
            }
            if(p.silkscreen) {
                final += back_silkscreen;
            }
        }
        if(p.reversible) {
            final += reversible_pads;
        } else if(p.side == "F") {
            final += front_pads;
        } else if(p.side == "B") {
            final += back_pads;
        }
        
        final += standard_closing;
    
        return final;
      }
}