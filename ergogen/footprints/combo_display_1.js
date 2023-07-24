module.exports = {
  params: {
    designator: 'SCREEN',
    P1: {type: 'net', value: 'GND'},
    P2: {type: 'net', value: 'VCC'},
    P3: {type: 'net', value: 'SCL'},  // SCK / SCL
    P4: {type: 'net', value: 'SDA'},  // MOSI / SDA
    P5: {type: 'net', value: 'CS'},
    oled: 'both', // Any of ssd1306, nice_view, both
    reverse: true,
    side: 'F',
  },
  body: p => {
    const standard_opening = `
    (module "combo_display_1" (layer ${p.side}.Cu) (tedit 5B24D78E)
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
      (pad "" thru_hole circle (at -3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
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
      (pad "" thru_hole circle (at -1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
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
      (pad "" thru_hole circle (at 1.27 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
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
      (pad "" thru_hole circle (at 3.81 2.062 ${p.rot}) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask"))
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
      (fp_rect (start 7 1.3) (end -6.68 -34.7) (width 0.12) (layer "Dwgs.User"))
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
    const both_standard = `
    `
    const both_front = `
      (fp_line (start -6.35 -1.25) (end 6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp f5e8e799-55ab-4afb-9d60-e3d04cd2bb44))
      (fp_line (start -6.35 1.25) (end -6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 7cee49af-6a75-408b-866c-39bc136791ea))
      (fp_line (start -6.35 1.25) (end -5.85 1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 9ad6f7f0-44f8-467c-a6a5-b4c8d9fbcff6))
      (fp_line (start 6.35 -1.25) (end 6.35 1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 94500340-db65-4282-8dda-1ca32596fdfb))
      (fp_line (start 6.35 1.25) (end 6 1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 282ea974-4dc1-4738-b91a-92e9bbabbbb0))
      (pad "4" thru_hole oval (at -4.8 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp 5e0e8b5c-c0ae-48ce-8aee-2545b12d0c12))
      (pad "3" thru_hole oval (at -2.26 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp e64fb3a5-eefe-4c92-98da-f71815d9244a))
      (pad "2" thru_hole oval (at 0.28 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp 05035955-043e-4627-acd1-a7b1939485ec))
      (pad "1" thru_hole oval (at 2.82 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp c8a10a2a-8d64-4597-a88f-f773cb8e008e))
      (pad "5" thru_hole circle (at 5.08 0) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask")
        (tstamp 35d714a5-b739-4c4c-b838-983bbff76ecc))
    `
    const both_back = `
      (fp_line (start -6.35 -1.25) (end -6.35 1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 3232349b-ebde-43f2-80f6-09b393cab644))  
      (fp_line (start -6.35 1.25) (end -5.85 1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 04c9ae2d-b0c4-47d1-88d9-58f636167c5e))
      (fp_line (start 6.35 -1.25) (end -6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 3e6d89e7-19f1-4488-b697-88749e3e26a2))
      (fp_line (start 6.35 1.25) (end 6 1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp dd50e94f-74f8-46f9-aed1-2def0795719b))
      (fp_line (start 6.35 1.25) (end 6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 3d862805-9846-4ebb-ac54-841e5a1c441c))
      (fp_line (start -6.35 -1.25) (end 6.35 -1.25)
       (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp f5e8e799-55ab-4afb-9d60-e3d04cd2bb44))
      (pad "5" thru_hole oval (at -4.8 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp 5e0e8b5c-c0ae-48ce-8aee-2545b12d0c12))
      (pad "1" thru_hole oval (at -2.26 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp e64fb3a5-eefe-4c92-98da-f71815d9244a))
      (pad "2" thru_hole oval (at 0.28 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp 05035955-043e-4627-acd1-a7b1939485ec))
      (pad "3" thru_hole oval (at 2.82 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp c8a10a2a-8d64-4597-a88f-f773cb8e008e))
      (pad "4" thru_hole circle (at 5.08 0) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") (tstamp 35d714a5-b739-4c4c-b838-983bbff76ecc))
    `
    const both_pads = `
      (fp_line (start -6.35 -1.25) (end 6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp f5e8e799-55ab-4afb-9d60-e3d04cd2bb44))
      (fp_line (start -6.35 1.25) (end -6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 7cee49af-6a75-408b-866c-39bc136791ea))
      (fp_line (start -6.35 1.25) (end -5.85 1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 9ad6f7f0-44f8-467c-a6a5-b4c8d9fbcff6))
      (fp_line (start 6.35 -1.25) (end 6.35 1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 94500340-db65-4282-8dda-1ca32596fdfb))
      (fp_line (start 6.35 1.25) (end 6 1.25)
        (stroke (width 0.1) (type default)) (layer "F.SilkS") (tstamp 282ea974-4dc1-4738-b91a-92e9bbabbbb0))
      
      (fp_line (start -6.35 -1.25) (end 6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp f5e8e799-55ab-4afb-9d60-e3d04cd2bb44))
      (fp_line (start -6.35 1.25) (end -6.35 -1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 7cee49af-6a75-408b-866c-39bc136791ea))
      (fp_line (start -6.35 1.25) (end -5.85 1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 9ad6f7f0-44f8-467c-a6a5-b4c8d9fbcff6))
      (fp_line (start 6.35 -1.25) (end 6.35 1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 94500340-db65-4282-8dda-1ca32596fdfb))
      (fp_line (start 6.35 1.25) (end 6 1.25)
        (stroke (width 0.1) (type default)) (layer "B.SilkS") (tstamp 282ea974-4dc1-4738-b91a-92e9bbabbbb0))

      (pad "" thru_hole oval (at -4.8 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp 5e0e8b5c-c0ae-48ce-8aee-2545b12d0c12))
      (pad "" thru_hole oval (at -2.26 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp e64fb3a5-eefe-4c92-98da-f71815d9244a))
      (pad "" thru_hole oval (at 0.28 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp 05035955-043e-4627-acd1-a7b1939485ec))
      (pad "" thru_hole oval (at 2.82 0) (size 2.31 1.7526) (drill oval 1.65 1.0922) (layers "*.Cu" "*.Mask")
        (clearance 0.1) (zone_connect 0) (tstamp c8a10a2a-8d64-4597-a88f-f773cb8e008e))
      (pad "" thru_hole circle (at 5.08 0) (size 1.7526 1.7526) (drill 1.0922) (layers "*.Cu" "*.Mask") (tstamp 35d714a5-b739-4c4c-b838-983bbff76ecc))
      (fp_line (start -4.8 1.7) (end -4.8 0)
        (stroke (width 0.2) (type default)) (layer "F.Cu") (tstamp 135a3999-9009-44d3-89e7-bff0fcd69088))
      (fp_line (start -2.26 1.7) (end -2.26 0)
        (stroke (width 0.2) (type default)) (layer "F.Cu") (tstamp 6b09debd-bab3-4683-8dc3-508ba9175efc))
      (fp_line (start 0.28 1.7) (end 0.28 0)
        (stroke (width 0.2) (type default)) (layer "F.Cu") (tstamp cf886189-bddd-4884-9c57-490f7326217c))
      (fp_line (start 2.82 1.7) (end 2.82 0)
        (stroke (width 0.2) (type default)) (layer "F.Cu") (tstamp b27a7d70-03cb-4241-9411-a1450cd2ad6d))
      (fp_line (start 5.08 1.7) (end 5.08 0)
        (stroke (width 0.2) (type default)) (layer "F.Cu") (tstamp 03a29783-941b-49d6-95fd-e10e120ef499))
      (fp_line (start -4.8 1.7) (end -4.8 0)
        (stroke (width 0.2) (type default)) (layer "B.Cu") (tstamp 1539a8de-0ea5-4221-81b7-b30c27e170ee))
      (fp_line (start -2.26 1.7) (end -2.26 0)
        (stroke (width 0.2) (type default)) (layer "B.Cu") (tstamp 57c14191-4720-4f92-a181-5573c94bee8f))
      (fp_line (start 0.28 1.7) (end 0.28 0)
        (stroke (width 0.2) (type default)) (layer "B.Cu") (tstamp 94e0db31-78d4-4a30-b5eb-a75f3d5c1e9e))
      (fp_line (start 2.82 1.7) (end 2.82 0)
        (stroke (width 0.2) (type default)) (layer "B.Cu") (tstamp 5f0fe9f8-52a4-48a4-81c2-72bb76c97f8c))
      (fp_line (start 5.08 1.7) (end 5.08 0)
        (stroke (width 0.2) (type default)) (layer "B.Cu") (tstamp fd1b353b-ab61-461f-9972-721f6b8fde01))
      (pad "" smd custom (at -4.8 1.7) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 5b4eb70a-0ff1-4dfe-8cd6-adea9c21e81f))
      (pad "" smd custom (at -4.8 1.7) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp f59ded5f-6b01-4056-ad3d-ab896d13e5a0))
      (pad "" smd custom (at -2.26 1.7) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp ca4f4720-5f57-4051-b63b-9dc88e4fe9ab))
      (pad "" smd custom (at -2.26 1.7) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 8877a4cf-66b3-4f11-91d7-68f735362195))
      (pad "" smd custom (at 0.28 1.7) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 7f832916-8396-4150-b270-48c24a252dd1))
      (pad "" smd custom (at 0.28 1.7) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 8192da8a-b67e-4814-b7c0-1a591bd40c83))
      (pad "" smd custom (at 2.82 1.7) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 32f3a1b9-9ea9-4e60-95c4-b867d5cfe383))
      (pad "" smd custom (at 2.82 1.7) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 6683189d-efe3-4526-a40f-686c55f0edbc))
      (pad "" smd custom (at 5.08 1.7) (size 0.1 0.1) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp 36d57814-a207-4584-b064-cb5c4c90128e))
      (pad "" smd custom (at 5.08 1.7) (size 0.1 0.1) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 -0.4)
              (xy 0.6 -0.4)
              (xy 0.6 -0.2)
              (xy 0 0.4)
              (xy -0.6 -0.2)
            )
            (width 0) (fill yes))
        ) (tstamp b1bf9abd-f7af-40d9-b914-d80a8a236112))
      (pad "1" smd custom (at -2.26 2.716) (size 1.2 0.5) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp 42a04515-e088-4170-a9f9-a9a55340ef6a))
      (pad "1" smd custom (at 2.82 2.716) (size 1.2 0.5) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp d585cd33-600d-42b4-8a65-48b9618839fe))
      (pad "2" smd custom (at 0.28 2.716) (size 1.2 0.5) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp 98c6e051-1613-4b0f-b2b1-6ff7cac76dda))
      (pad "2" smd custom (at 0.28 2.716) (size 1.2 0.5) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp d8217870-7b5f-4a50-a899-bf457a638ed5))
      (pad "3" smd custom (at -2.26 2.716) (size 1.2 0.5) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp bfefe290-8c1f-4ea6-9fc5-bd64e5699a18))
      (pad "3" smd custom (at 2.82 2.716) (size 1.2 0.5) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp 99002706-73ee-4eb3-9092-80dea23e0dca))
      (pad "4" smd custom (at -4.8 2.716) (size 1.2 0.5) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp 503283ed-abd5-4cea-b4f4-48b4767a3199))
      (pad "4" smd custom (at 5.08 2.716) (size 1.2 0.5) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp 51202ec6-bfa3-4a1d-8edd-e6f55dec6561))
      (pad "5" smd custom (at -4.8 2.716) (size 1.2 0.5) (layers "B.Cu" "B.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp 1cc113cd-ac5f-44c7-b509-91d5d8d58155))
      (pad "5" smd custom (at 5.08 2.716) (size 1.2 0.5) (layers "F.Cu" "F.Mask")
        (clearance 0.1) (zone_connect 0) (thermal_bridge_angle 45)
        (options (clearance outline) (anchor rect))
        (primitives
          (gr_poly
            (pts
              (xy -0.6 0)
              (xy 0.6 0)
              (xy 0.6 -1)
              (xy 0 -0.4)
              (xy -0.6 -1)
            )
            (width 0) (fill yes))
        ) (tstamp fd02eb60-a346-4857-8db2-a7f8e78200a6))
    `
    const standard_closing = `
    )
    `

    let final = standard_opening;

    if(p.oled == "ssd1306"){
      final += oled_standard;
      if(p.reverse) {
        final += oled_reversible_pads;
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
      if(p.reverse) {
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
      final += both_standard;
      if(p.reverse) {
        final += both_pads;
      } else {
        if(p.side == "F") {
          final += both_front;
        }
        if(p.side == "B") {
          final += both_back;
        }
      }
    }

    final += standard_closing;

    return final;
  }
}