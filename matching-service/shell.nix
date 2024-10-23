{pkgs ? import <nixpkgs> {}}: let
  myPython = pkgs.python3.withPackages (ps:
    with ps; [
      fastapi
      pydantic
      psycopg2
      json5
    ]);
in
  pkgs.mkShell {
    nativeBuildInputs = [
      myPython
      pkgs.fastapi-cli
    ];
  }
