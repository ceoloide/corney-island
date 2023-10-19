{ pkgs ? import <nixpkgs> {}
, board ? ""
, dsn_path ? "ergogen/output/pcbs/${board}.dsn"
, rules_path ? "freerouting/freerouting.rules"
, output_path ? "ergogen/output/pcbs/${board}.ses" 
, max_passes ? "35"
}:
with pkgs;
let
  freerouting = callPackage ./freerouting {};
in
mkShell {
  name = "freerouting-nix";
  buildInputs = [
    freerouting
    gtk3
    xvfb_run
  ];
  shellHook = ''
    xvfb-run -a freerouting -de ${dsn_path} -dr ${rules_path} -do ${output_path} -mp ${max_passes} -dct 1 -da
  '';
}
