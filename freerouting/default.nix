let
  # Import nixpkgs to be able to supply reasonable default values for
  # the anonymous function this file defines.
  pkgs = import <nixpkgs> {};
in
{ stdenv ? pkgs.stdenv
, fetchFromGitHub ? pkgs.fetchFromGitHub
, makeWrapper ? pkgs.makeWrapper
, openjdk17
, gradle_7
}:
stdenv.mkDerivation rec {
  pname = "freerouting";
  src = fetchFromGitHub {
      owner = "freerouting";
      repo = pname;
      rev = "89dce17"; # HEAD on Oct 19, 2023
      hash = "sha256-mhyn3UOAtP5ahrOieW4AE0WhcL5furlJyCp2WaeqGYI=";
  };
  nativeBuildInputs = [ makeWrapper gradle_7 openjdk17 ];
  
  JDK_HOME = "${openjdk17.home}";
  JAVA_HOME = "${openjdk17.home}";
  GRADLE_USER_HOME = "$(mktemp -d)";

  buildPhase = ''
    runHook preBuild
    ./gradlew --no-daemon assemble
    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall
    mkdir -pv $out/share/java $out/bin
    cp build/libs/freerouting-executable.jar $out/share/java/freerouting.jar
    makeWrapper ${openjdk17}/bin/java $out/bin/freerouting \
      --add-flags "-jar $out/share/java/freerouting.jar"
    runHook postInstall
  '';
}