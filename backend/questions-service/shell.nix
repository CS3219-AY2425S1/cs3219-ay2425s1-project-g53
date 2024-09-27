{pkgs ? import <nixpkgs> {}}: let
  myPython = pkgs.python3.withPackages (ps:
    with ps; [
      fastapi
      pydantic
      asyncpg
      sqlalchemy
      databases
      uvicorn
      psycopg2
    ]);
in
  pkgs.mkShell {
    nativeBuildInputs = [
      myPython
      pkgs.postgresql
    ];
  }
