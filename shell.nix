{ pkgs ? import <nixpkgs> {}
, board ? ""
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
    xvfb-run -a freerouting -de ergogen/output/pcbs/${board}.dsn -dr freerouting/freerouting.rules -do -de ergogen/output/pcbs/${board}.ses -mp 35 -dct 1 -da
  '';
}
