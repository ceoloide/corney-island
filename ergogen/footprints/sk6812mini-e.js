module.exports = {
  params: {
    designator: 'LED',
    P1: {type: 'net', value: 'VCC'},
    P2: undefined,
    P3: {type: 'net', value: 'GND'},
    P4: undefined,
    reversible: false,
    reverse_mount: true, // True = per-key, False = underglow
    add_traces_vias: true, // Only valid if reversible is True
    add_courtyard: true,
    add_keepout: true,
    gnd_trace_width: 0.25, // Max 0.8 to avoid clearance errors
    pwr_trace_width: 0.25, // Max 0.8 to avoid clearance errors
    signal_trace_width: 0.15,
    via_size: 0.8, // JLCPC min is 0.5 for 1-2 layer boards, KiCad defaults to 0.8
    via_drill: 0.4, // JLCPC min is 0.3 for 1-2 layer boards, KiCad defaults to 0.4
    side: 'B',
  },
  body: p => {
    const get_at_coordinates = () => {
        const pattern = /\(at (-?[\d\.]*) (-?[\d\.]*) (-?[\d\.]*)\)/;
        const matches = p.at.match(pattern);
        if (matches && matches.length == 4) {
            return [parseFloat(matches[1]), parseFloat(matches[2]), parseFloat(matches[3])];
        } else {
            return null;
        }
    }

    const adjust_point = (x, y) => {
        const at_l = get_at_coordinates();
        if(at_l == null) {
            throw new Error(
            `Could not get x and y coordinates from p.at: ${p.at}`
            );
        }
        const at_x = at_l[0];
        const at_y = at_l[1];
        const at_angle = at_l[2];
        const adj_x = at_x + x;
        const adj_y = at_y + y;

        const radians = (Math.PI / 180) * at_angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (adj_x - at_x)) + (sin * (adj_y - at_y)) + at_x,
            ny = (cos * (adj_y - at_y)) - (sin * (adj_x - at_x)) + at_y;

        const point_str = `${nx.toFixed(3)} ${ny.toFixed(3)}`;
        return point_str;
    }
    
    const standard_opening = `
      (module "ceoloide:YS-SK6812MINI-E (${p.reverse_mount ? "per-key" : "underglow"}${p.reversible ? ", reversible" : "single-side"})" 
        (layer ${p.side}.Cu) (tedit 5F70BC98)
        ${p.at /* parametric position */}

        (fp_text reference "${p.ref}" (at -4.75 0 90) (layer ${p.side}.SilkS) ${p.ref_hide}
          (effects (font (size 1 1) (thickness 0.153)))
        )

        (fp_line (start -1.6 -1.4) (end 1.6 -1.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start -1.6 1.4) (end 1.6 1.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start -1.6 -1.4) (end -1.6 1.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start 1.6 -1.4) (end 1.6 1.4) (layer Dwgs.User) (width 0.12))
        (fp_line (start -1.6 -1.05) (end -2.94 -1.05) (layer Dwgs.User) (width 0.12))
        (fp_line (start -2.94 -1.05) (end -2.94 -0.37) (layer Dwgs.User) (width 0.12))
        (fp_line (start -2.94 -0.37) (end -1.6 -0.37) (layer Dwgs.User) (width 0.12))
        (fp_line (start -1.6 0.35) (end -2.94 0.35) (layer Dwgs.User) (width 0.12))
        (fp_line (start -2.94 1.03) (end -1.6 1.03) (layer Dwgs.User) (width 0.12))
        (fp_line (start -2.94 0.35) (end -2.94 1.03) (layer Dwgs.User) (width 0.12))
        (fp_line (start 1.6 1.03) (end 2.94 1.03) (layer Dwgs.User) (width 0.12))
        (fp_line (start 2.94 0.35) (end 1.6 0.35) (layer Dwgs.User) (width 0.12))
        (fp_line (start 2.94 1.03) (end 2.94 0.35) (layer Dwgs.User) (width 0.12))
        (fp_line (start 1.6 -0.37) (end 2.94 -0.37) (layer Dwgs.User) (width 0.12))
        (fp_line (start 2.94 -1.05) (end 1.6 -1.05) (layer Dwgs.User) (width 0.12))
        (fp_line (start 2.94 -0.37) (end 2.94 -1.05) (layer Dwgs.User) (width 0.12))
    `
    const marks_reversed = `
    (fp_line (start -0.8 -1.4) (end -0.8 1.4) (layer Dwgs.User) (width 0.12))
    (fp_line (start 0.8 -1.4) (end 0.8 1.4) (layer Dwgs.User) (width 0.12))
    (fp_line (start -1 -1.4) (end -1 1.4) (layer Dwgs.User) (width 0.12))
    (fp_line (start 1 -1.4) (end 1 1.4) (layer Dwgs.User) (width 0.12))
    `
    const marks_straight = `
    (fp_line (start -1.6 -0.7) (end -0.8 -1.4) (layer Dwgs.User) (width 0.12))

    `
    const front_reversed = `
        (fp_line (start -3.8 1.6) (end -2.2 1.6) (layer F.SilkS) (width 0.12))
        (fp_line (start -3.8 0) (end -3.8 1.6) (layer F.SilkS) (width 0.12))
        (pad 4 smd rect (at -2.7 -0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P4.str})
        (pad 3 smd rect (at -2.7 0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P3.str})
        (pad 1 smd rect (at 2.7 -0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P1.str})
        (pad 2 smd rect (at 2.7 0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P2.str})
        `
    const front = `
        (fp_line (start -3.8 -1.6) (end -2.2 -1.6) (layer F.SilkS) (width 0.12))
        (fp_line (start -3.8 0) (end -3.8 -1.6) (layer F.SilkS) (width 0.12))
        (pad 4 smd rect (at -2.70 0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P4.str})
        (pad 3 smd rect (at -2.70 -0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P3.str})
        (pad 1 smd rect (at 2.70 0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P1.str})
        (pad 2 smd rect (at 2.70 -0.7 ${p.rot}) (size 1.4 1) (layers F.Cu F.Paste F.Mask) ${p.P2.str})
    `
    const back_reversed = `
        (fp_line (start -3.8 -1.6) (end -2.2 -1.6) (layer B.SilkS) (width 0.12))
        (fp_line (start -3.8 0) (end -3.8 -1.6) (layer B.SilkS) (width 0.12))
        (pad 2 smd rect (at 2.70 -0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P2.str})
        (pad 1 smd rect (at 2.70 0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P1.str})
        (pad 3 smd rect (at -2.70 -0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P3.str})
        (pad 4 smd rect (at -2.70 0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P4.str})
      `
    const back = `
        (fp_line (start -3.8 1.6) (end -2.2 1.6) (layer B.SilkS) (width 0.12))
        (fp_line (start -3.8 0) (end -3.8 1.6) (layer B.SilkS) (width 0.12))
        (pad 2 smd rect (at 2.70 0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P2.str})
        (pad 1 smd rect (at 2.70 -0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P1.str})
        (pad 3 smd rect (at -2.70 0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P3.str})
        (pad 4 smd rect (at -2.70 -0.7 ${p.rot}) (size 1.4 1) (layers B.Cu B.Paste B.Mask) ${p.P4.str})
    `
    const standard_closing = `
        (fp_line (start -1.8 -1.55) (end -1.8 1.55) (layer Edge.Cuts) (width 0.12))
        (fp_line (start -1.8 1.55) (end 1.8 1.55) (layer Edge.Cuts) (width 0.12))
        (fp_line (start 1.8 1.55) (end 1.8 -1.55) (layer Edge.Cuts) (width 0.12))
        (fp_line (start 1.8 -1.55) (end -1.8 -1.55) (layer Edge.Cuts) (width 0.12))
      )
    `
    
    const traces_vias_reversed = `
      ${'' /* VCC Trace */}
      (segment (start ${ adjust_point(3.4, -0.7)}) (end ${ adjust_point(4.06, -0.105916)}) (width ${p.pwr_trace_width}) (layer "F.Cu") (net ${p.P1.index}))
      (segment (start ${ adjust_point(4.06, -0.105916)}) (end ${ adjust_point(4.06, 0.7)}) (width ${p.pwr_trace_width}) (layer "F.Cu") (net ${p.P1.index}))
      (segment (start ${ adjust_point(2.7, -0.7)}) (end ${ adjust_point(3.4, -0.7)}) (width ${p.pwr_trace_width}) (layer "F.Cu") (net ${p.P1.index}))
      (via (at ${ adjust_point(4.06, 0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P1.index}))
      (segment (start ${ adjust_point(2.7, 0.7)}) (end ${ adjust_point(4.06, 0.7)}) (width ${p.pwr_trace_width}) (layer "B.Cu") (net ${p.P1.index}))
      ${'' /* Data signal out trace */}
      (segment (start ${ adjust_point(4.95, -0.7)}) (end ${ adjust_point(2.7, -0.7)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P2.index}))
      (via (at ${ adjust_point(4.95, -0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P2.index}))
      (segment (start ${ adjust_point(2.7, 0.7)}) (end ${ adjust_point(3.481, 1.485)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P2.index}))
      (segment (start ${ adjust_point(3.481, 1.485)}) (end ${ adjust_point(4.529, 1.485)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P2.index}))
      (segment (start ${ adjust_point(4.95, 1.06)}) (end ${ adjust_point(4.95, -0.7)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P2.index}))
      (segment (start ${ adjust_point(4.529, 1.485)}) (end ${ adjust_point(4.95, 1.06)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P2.index}))
      ${'' /* GND Trace */}
      (segment (start ${ adjust_point(-3.4, -0.7)}) (end ${ adjust_point(-4.06, -0.105916)}) (width ${p.gnd_trace_width}) (layer "B.Cu") (net ${p.P3.index}))
      (segment (start ${ adjust_point(-4.06, -0.105916)}) (end ${ adjust_point(-4.06, 0.7)}) (width ${p.gnd_trace_width}) (layer "B.Cu") (net ${p.P3.index}))
      (segment (start ${ adjust_point(-2.7, -0.7)}) (end ${ adjust_point(-3.4, -0.7)}) (width ${p.gnd_trace_width}) (layer "B.Cu") (net ${p.P3.index}))
      (via (at ${ adjust_point(-4.06, 0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P3.index}))
      (segment (start ${ adjust_point(-2.7, 0.7)}) (end ${ adjust_point(-4.06, 0.7)}) (width ${p.gnd_trace_width}) (layer "F.Cu") (net ${p.P3.index}))
      ${'' /* Data signal in trace */}
      (segment (start ${ adjust_point(-4.95, -0.7)}) (end ${ adjust_point(-2.7, -0.7)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P4.index}))
      (via (at ${ adjust_point(-4.95, -0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P4.index}))
      (segment (start ${ adjust_point(-2.7, 0.7)}) (end ${ adjust_point(-3.481, 1.485)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P4.index}))
      (segment (start ${ adjust_point(-3.481, 1.485)}) (end ${ adjust_point(-4.529, 1.485)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P4.index}))
      (segment (start ${ adjust_point(-4.95, 1.06)}) (end ${ adjust_point(-4.95, -0.7)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P4.index}))
      (segment (start ${ adjust_point(-4.529, 1.485)}) (end ${ adjust_point(-4.95, 1.06)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P4.index}))
    `

    const traces_vias_straight = `
    ${'' /* VCC Trace */}
    (segment (start ${ adjust_point(3.4, -0.7)}) (end ${ adjust_point(4.06, -0.105916)}) (width ${p.pwr_trace_width}) (layer "B.Cu") (net ${p.P1.index}))
    (segment (start ${ adjust_point(4.06, -0.105916)}) (end ${ adjust_point(4.06, 0.7)}) (width ${p.pwr_trace_width}) (layer "B.Cu") (net ${p.P1.index}))
    (segment (start ${ adjust_point(2.7, -0.7)}) (end ${ adjust_point(3.4, -0.7)}) (width ${p.pwr_trace_width}) (layer "B.Cu") (net ${p.P1.index}))
    (via (at ${ adjust_point(4.06, 0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P1.index}))
    (segment (start ${ adjust_point(2.7, 0.7)}) (end ${ adjust_point(4.06, 0.7)}) (width ${p.pwr_trace_width}) (layer "F.Cu") (net ${p.P1.index}))
    ${'' /* Data signal out trace */}
    (segment (start ${ adjust_point(4.95, -0.7)}) (end ${ adjust_point(2.7, -0.7)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P2.index}))
    (via (at ${ adjust_point(4.95, -0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P2.index}))
    (segment (start ${ adjust_point(2.7, 0.7)}) (end ${ adjust_point(3.481, 1.485)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P2.index}))
    (segment (start ${ adjust_point(3.481, 1.485)}) (end ${ adjust_point(4.529, 1.485)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P2.index}))
    (segment (start ${ adjust_point(4.95, 1.06)}) (end ${ adjust_point(4.95, -0.7)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P2.index}))
    (segment (start ${ adjust_point(4.529, 1.485)}) (end ${ adjust_point(4.95, 1.06)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P2.index}))
    ${'' /* GND Trace */}
    (segment (start ${ adjust_point(-3.4, -0.7)}) (end ${ adjust_point(-4.06, -0.105916)}) (width ${p.gnd_trace_width}) (layer "F.Cu") (net ${p.P3.index}))
    (segment (start ${ adjust_point(-4.06, -0.105916)}) (end ${ adjust_point(-4.06, 0.7)}) (width ${p.gnd_trace_width}) (layer "F.Cu") (net ${p.P3.index}))
    (segment (start ${ adjust_point(-2.7, -0.7)}) (end ${ adjust_point(-3.4, -0.7)}) (width ${p.gnd_trace_width}) (layer "F.Cu") (net ${p.P3.index}))
    (via (at ${ adjust_point(-4.06, 0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P3.index}))
    (segment (start ${ adjust_point(-2.7, 0.7)}) (end ${ adjust_point(-4.06, 0.7)}) (width ${p.gnd_trace_width}) (layer "B.Cu") (net ${p.P3.index}))
    ${'' /* Data signal in trace */}
    (segment (start ${ adjust_point(-4.95, -0.7)}) (end ${ adjust_point(-2.7, -0.7)}) (width ${p.signal_trace_width}) (layer "B.Cu") (net ${p.P4.index}))
    (via (at ${ adjust_point(-4.95, -0.7)}) (size ${p.via_size}) (drill ${p.via_drill}) (layers "F.Cu" "B.Cu") (net ${p.P4.index}))
    (segment (start ${ adjust_point(-2.7, 0.7)}) (end ${ adjust_point(-3.481, 1.485)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P4.index}))
    (segment (start ${ adjust_point(-3.481, 1.485)}) (end ${ adjust_point(-4.529, 1.485)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P4.index}))
    (segment (start ${ adjust_point(-4.95, 1.06)}) (end ${ adjust_point(-4.95, -0.7)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P4.index}))
    (segment (start ${ adjust_point(-4.529, 1.485)}) (end ${ adjust_point(-4.95, 1.06)}) (width ${p.signal_trace_width}) (layer "F.Cu") (net ${p.P4.index}))
    `

    const courtyard_front = `
        (fp_poly
          (pts
            (xy 1.6 -1.05)
            (xy 2.94 -1.05)
            (xy 2.94 -0.37)
            (xy 1.6 -0.37)
            (xy 1.6 0.35)
            (xy 2.94 0.35)
            (xy 2.94 1.03)
            (xy 1.6 1.03)
            (xy 1.6 1.4)
            (xy -1.6 1.4)
            (xy -1.6 1.03)
            (xy -2.94 1.03)
            (xy -2.94 0.35)
            (xy -1.6 0.35)
            (xy -1.6 -0.37)
            (xy -2.94 -0.37)
            (xy -2.94 -1.05)
            (xy -1.6 -1.05)
            (xy -1.6 -1.4)
            (xy 1.6 -1.4)
          )
          (width 0.1) (layer "B.CrtYd"))
    `

    const courtyard_back = `
        (fp_poly
          (pts
            (xy 1.6 -1.05)
            (xy 2.94 -1.05)
            (xy 2.94 -0.37)
            (xy 1.6 -0.37)
            (xy 1.6 0.35)
            (xy 2.94 0.35)
            (xy 2.94 1.03)
            (xy 1.6 1.03)
            (xy 1.6 1.4)
            (xy -1.6 1.4)
            (xy -1.6 1.03)
            (xy -2.94 1.03)
            (xy -2.94 0.35)
            (xy -1.6 0.35)
            (xy -1.6 -0.37)
            (xy -2.94 -0.37)
            (xy -2.94 -1.05)
            (xy -1.6 -1.05)
            (xy -1.6 -1.4)
            (xy 1.6 -1.4)
          )
          (width 0.1) (layer "B.CrtYd"))
    `

    const keepout = `
      (zone (net 0) (net_name "") (layers "F&B.Cu") (hatch edge 0.3)
        (connect_pads (clearance 0))
        (min_thickness 0.25)
        (keepout (tracks not_allowed) (vias not_allowed) (copperpour not_allowed))
        (fill (thermal_gap 0.5) (thermal_bridge_width 0.5))
        (polygon
          (pts
            (xy ${ adjust_point(-2.00, -1.85)})
            (xy ${ adjust_point(2.00, -1.85)})
            (xy ${ adjust_point(2.00, 1.85)})
            (xy ${ adjust_point(-2.00, 1.85)})
          )
        )
      )
    `

    let final = standard_opening;

    if(p.side == "F" || p.reversible) {
      if(p.reverse_mount) {
        final += marks_reversed;
        final += front_reversed;
      } else {
        final += marks_straight;
        final += front;
      }
      if(p.add_courtyard) {
        final += courtyard_front;
      }
    }
    if(p.side == "B" || p.reversible) {
      if(p.reverse_mount) {
        final += back_reversed;
        final += marks_reversed;
      } else {
        final += marks_straight;
        final += back;
      }
      if(p.add_courtyard) {
        final += courtyard_back;
      }
    }

    final += standard_closing;
    if(p.add_keepout) {
      final += keepout;
    }
    if(p.reversible && p.add_traces_vias) {
      if(p.reverse_mount) {
        final += traces_vias_reversed;
      } else {
        final += traces_vias_straight;
      }
    }

    return final;
  }
}