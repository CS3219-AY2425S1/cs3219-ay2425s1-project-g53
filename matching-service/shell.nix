{pkgs ? import <nixpkgs> {}}: let
  myPython = pkgs.python3.withPackages (ps:
    with ps; [
      fastapi
      uvicorn
      pydantic
      psycopg2
      json5
      websockets
    ]);
in
  pkgs.mkShell {
    nativeBuildInputs = [
      myPython
      pkgs.fastapi-cli
    ];
  }
