module.exports = {
  params: {
    designator: 'LED',
    P1: {type: 'net', value: 'GND'},
    P2: {type: 'net', value: 'VCC'},
    P3: {type: 'net', value: 'SCL'},  // SCK / SCL
    P4: {type: 'net', value: 'SDA'},  // MOSI / SDA
    P5: {type: 'net', value: 'CS'},
    oled: 'both', // Any of ssd1306, nice_view, both
    reversible: true,
    side: 'F',
  },
  body: p => {
    const standard_opening = `
    (module "combo_display" (layer ${p.side}.Cu) (tedit 5B24D78E)
      ${p.at /* parametric position */}
      (descr "Solder-jumper reversible footprint for both nice!view (SPI) and SSD1306 (I2C) displays")
      (fp_text reference "${p.ref}" (at 0 5.6 ${p.rot}) (layer ${p.side}.SilkS) ${p.ref_hide}
        (effects (font (size 1 1) (thickness 0.15)))
      )
    `
    const oled_standard = `
      (fp_line (start -5.99 -34.338) (end 6.01 -34.338)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start -5.99 -32.088) (end 6.01 -32.088)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start -5.99 -2.088) (end 6.01 -2.088)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start -5.99 3.662) (end -5.99 -34.338)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start -5.99 3.662) (end 6.01 3.662)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start -3.77 -3.398) (end -3.77 -25.778)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start -3.77 -3.398) (end 1.75 -3.398)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start 1.75 -25.778) (end -3.77 -25.778)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start 1.75 -3.398) (end 1.75 -25.778)
        (width 0.12) (layer "Dwgs.User"))
      (fp_line (start 6.01 -34.338) (end 6.01 3.662)
        (width 0.12) (layer "Dwgs.User"))
    `
    const oled_front = `
      (fp_text user "VCC" (at 1.27 -4.138 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "SCL" (at -1.27 -4.064 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "SDA" (at -3.81 -4.064 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "GND" (at 3.81 -4.238 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (pad 4 thru_hole circle (at -3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P4.str})
      (pad 3 thru_hole circle (at -1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P3.str})
      (pad 2 thru_hole circle (at 1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P2.str})
      (pad 1 thru_hole circle (at 3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P1.str})
    `
    const oled_back = `
      (fp_text user "SCL" (at 1.2 -4.138 ${270 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "SDA" (at 3.74 -4.064 ${270 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "VCC" (at -1.34 -4.238 ${270 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "GND" (at -3.9 -4.318 ${270 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (pad 1 thru_hole circle (at -3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P1.str})
      (pad 2 thru_hole circle (at -1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P2.str})
      (pad 3 thru_hole circle (at 1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P3.str})
      (pad 4 thru_hole circle (at 3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P4.str})
    `
    const oled_reversible_pads = `
      (pad "" thru_hole circle (at -3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" thru_hole circle (at -1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" thru_hole circle (at 1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" thru_hole circle (at 3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
    `
    const oled_reversible_solder_bridges = `
      (fp_text user "SCL" (at 1.2 -4.138 ${270 + p.rot}) (layer "B.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "SDA" (at 3.74 -4.064 ${270 + p.rot}) (layer "B.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "VCC" (at -1.34 -4.238 ${270 + p.rot}) (layer "B.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "GND" (at -3.9 -4.318 ${270 + p.rot}) (layer "B.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "VCC" (at 1.27 -4.138 ${90 + p.rot}) (layer "F.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "SCL" (at -1.27 -4.064 ${90 + p.rot}) (layer "F.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "SDA" (at -3.81 -4.064 ${90 + p.rot}) (layer "F.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "GND" (at 3.81 -4.238 ${90 + p.rot}) (layer "F.SilkS")
        (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (pad "" smd custom (at -3.81 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at -3.81 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at -1.27 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at -1.27 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 1.27 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 1.27 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 3.81 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 3.81 0.254 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad 1 smd custom (at -3.81 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P1.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 1 smd custom (at 3.81 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P1.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 2 smd custom (at -1.27 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P2.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 2 smd custom (at 1.27 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P2.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 3 smd custom (at -1.27 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P3.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 3 smd custom (at 1.27 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P3.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 4 smd custom (at -3.81 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P4.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 4 smd custom (at 3.81 -0.762 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P4.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
    `
    const nice_view_standard = `
    `
    const nice_view_front = `
      (fp_text user "GND" (at 2.54 -6.24 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "MOSI/SDA" (at -5.1 -10.64 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "VCC" (at 0 -6.14 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "CS" (at 5.1 -5.14 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "SCK/SCL" (at -2.54 -9.94 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (pad 4 thru_hole circle (at -5.08 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P4.str})
      (pad 3 thru_hole circle (at -2.54 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P3.str})
      (pad 2 thru_hole circle (at 0 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P2.str})
      (pad 1 thru_hole circle (at 2.54 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P1.str})
      (pad 5 thru_hole circle (at 5.08 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P5.str})
    `
    const nice_view_back = `
      (fp_text user "CS" (at -5.17 -5.14 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "MOSI/SDA" (at 5.03 -10.64 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "VCC" (at -0.07 -6.14 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "SCK/SCL" (at 2.47 -9.94 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "GND" (at -2.61 -6.24 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (pad 5 thru_hole circle (at -5.08 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P5.str})
      (pad 1 thru_hole circle (at -2.54 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P1.str})
      (pad 2 thru_hole circle (at 0 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P2.str})
      (pad 3 thru_hole circle (at 2.54 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P3.str})
      (pad 4 thru_hole circle (at 5.08 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") ${p.P4.str})
    `
    const nice_view_reversible = `
      (fp_text user "CS" (at -5.17 -5.14 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "MOSI/SDA" (at 5.03 -10.64 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "VCC" (at -0.07 -6.14 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "SCK/SCL" (at 2.47 -9.94 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "GND" (at -2.61 -6.24 ${-90 + p.rot}) (layer "B.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right mirror))
      )
      (fp_text user "GND" (at 2.54 -6.24 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "MOSI/SDA" (at -5.1 -10.64 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "VCC" (at 0 -6.14 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "CS" (at 5.1 -5.14 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_text user "SCK/SCL" (at -2.54 -9.94 ${90 + p.rot}) (layer "F.SilkS")
          (effects (font (size 1 1) (thickness 0.15)) (justify right))
      )
      (fp_line (start -5.08 -1.748) (end -5.08 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -2.54 -1.748) (end -2.54 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 0 -1.748) (end 0 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 2.54 -1.748) (end 2.54 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 5.08 -1.748) (end 5.08 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -5.08 -1.748) (end -5.08 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start -2.54 -1.748) (end -2.54 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 0 -1.748) (end 0 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 2.54 -1.748) (end 2.54 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 5.08 -1.748) (end 5.08 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (pad "" smd custom (at -5.08 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at -5.08 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" thru_hole circle (at -5.08 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" smd custom (at -2.54 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at -2.54 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" thru_hole circle (at -2.54 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" smd custom (at 0 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 0 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" thru_hole circle (at 0 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" smd custom (at 2.54 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 2.54 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" thru_hole circle (at 2.54 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad "" smd custom (at 5.08 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" smd custom (at 5.08 -1.748 ${180 + p.rot}) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 -0.4)
              (xy -0.6 -0.4)
              (xy -0.6 -0.2)
              (xy 0 0.4)
              (xy 0.6 -0.2)
            )
            (width 0))
        ))
      (pad "" thru_hole circle (at 5.08 0 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
      (pad 5 smd custom (at -5.08 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P5.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 1 smd custom (at 2.54 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P1.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 1 smd custom (at -2.54 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P1.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 2 smd custom (at 0 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P2.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 3 smd custom (at -2.54 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P3.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 2 smd custom (at 0 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P2.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 4 smd custom (at -5.08 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P4.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 3 smd custom (at 2.54 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P3.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 4 smd custom (at 5.08 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "B.Cu" "B.Mask") ${p.P4.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
      (pad 5 smd custom (at 5.08 -2.764 ${180 + p.rot}) (size 1.2 0.5) (layers "F.Cu" "F.Mask") ${p.P5.str}
        (clearance 0.1) (zone_connect 0)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy 0.6 0)
              (xy -0.6 0)
              (xy -0.6 -1)
              (xy 0 -0.4)
              (xy 0.6 -1)
            )
            (width 0))
        ))
    `
    const both_connections = `
      (fp_line (start -5.08 -1.748) (end -5.08 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -5.08 -1.748) (end -3.7846 -0.4526)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -3.7846 -0.4526) (end -3.7846 1.1857)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -2.54 -1.748) (end -2.54 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -2.54 -1.748) (end -1.2446 -0.4526)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -1.2446 -0.4526) (end -1.2446 1.1857)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 0 -1.748) (end 0 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 0 -1.748) (end 1.2954 -0.4526)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 1.2954 -0.4526) (end 1.2954 1.1857)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 2.54 -1.748) (end 2.54 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 2.54 -1.748) (end 3.8354 -0.4526)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 3.8354 -0.4526) (end 3.8354 1.1857)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start 5.08 -1.748) (end 5.08 -0.8763)
        (width 0.2) (layer "F.Cu"))
      (fp_line (start -5.08 -1.748) (end -5.08 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start -3.7846 -0.4526) (end -3.7846 1.1857)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start -3.7846 -0.4526) (end -2.4892 -1.748)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start -2.54 -1.748) (end -2.54 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start -1.2446 -0.4526) (end -1.2446 1.1857)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start -1.2446 -0.4526) (end 0.0508 -1.748)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 0 -1.748) (end 0 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 1.2954 -0.4526) (end 1.2954 1.1857)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 1.2954 -0.4526) (end 2.5908 -1.748)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 2.54 -1.748) (end 2.54 -0.8763)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 3.8354 -0.4526) (end 3.8354 1.1857)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 3.8354 -0.4526) (end 5.1308 -1.748)
        (width 0.2) (layer "B.Cu"))
      (fp_line (start 5.08 -1.748) (end 5.08 -0.8763)
        (width 0.2) (layer "B.Cu"))
    `
    const standard_closing = `
    )
    `

    let final = standard_opening;

    if(p.oled == "ssd1306"){
      final += oled_standard;
      if(p.reversible) {
        final += oled_reversible_pads;
        final += oled_reversible_solder_bridges;
      } else {
        if(p.side == "F") {
          final += oled_front;
        }
        if(p.side == "B") {
          final += oled_back;
        }
      }
    } else if(p.oled == "nice_view"){
      final += nice_view_standard;
      if(p.reversible) {
        final += nice_view_reversible;
      } else {
        if(p.side == "F") {
          final += nice_view_front;
        }
        if(p.side == "B") {
          final += nice_view_back;
        }
      }
    } else if(p.oled == "both"){
      final += oled_standard;
      final += nice_view_standard;
      if(p.reversible) {
        final += oled_reversible_pads;
        final += nice_view_reversible;
        final += both_connections;
      } else {
        if(p.side == "F") {
          final += oled_front;
          final += nice_view_front;
        }
        if(p.side == "B") {
          final += oled_back;
          final += nice_view_back;
        }
      }
    }

    final += standard_closing;

    return final;
  }
}