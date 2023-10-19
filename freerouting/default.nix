let
  # Import nixpkgs to be able to supply reasonable default values for
  # the anonymous function this file defines.
  pkgs = import <nixpkgs> {};
in
{ stdenv ? pkgs.stdenv
, fetchurl ? pkgs.fetchurl
, makeWrapper ? pkgs.makeWrapper
, jre ? pkgs.jdk17
}:
stdenv.mkDerivation rec {
  name = "freerouting";
  version = "1.8.0";
  src = fetchurl {
      url = "https://github.com/freerouting/freerouting/releases/download/v${version}/${name}-${version}.jar";
      sha256 = "7b508037cd8111f97655840fdb014ac62f4bcbe0cdd2b244dc87e7d4a7f92c12";
  };
  # I fetch the JAR file directly, so no archives to unpack.
  dontUnpack = true;
  nativeBuildInputs = [ makeWrapper ];
  installPhase = ''
    mkdir -pv $out/share/java $out/bin
    cp ${src} $out/share/java/${name}-${version}.jar
  
    makeWrapper ${jre}/bin/java $out/bin/freerouting \
      --add-flags "-jar $out/share/java/${name}-${version}.jar"
    '';
}