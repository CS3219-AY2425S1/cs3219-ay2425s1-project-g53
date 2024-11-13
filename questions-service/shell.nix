{pkgs ? import <nixpkgs> {}}: let
  myPython = pkgs.python3.withPackages (ps:
    with ps; [
      fastapi
      pydantic
      sqlalchemy
      uvicorn
      psycopg2
      json5
    ]);
in
  pkgs.mkShell {
    nativeBuildInputs = [
      myPython
    ];
  }
