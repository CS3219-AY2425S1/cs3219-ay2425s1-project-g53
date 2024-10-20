[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)
# CS3219 Project (PeerPrep) - AY2425S1
## Group: G53

## Setup for Milestone 2
1. Download and install latest version of Python3 using your OS's package manager or from [here](https://www.python.org/downloads/).
2. Download and install Nodejs using your OS's package manager or from [here](https://nodejs.org/en/download/package-manager).
3. Download and install pnpm using your OS's package manager or from [here](https://pnpm.io/installation).
4. Ensure that python, pnpm and node are in your `PATH`.
5. Download and install Postgres using your OS's package manager, using docker or [here](https://www.postgresql.org/download/)
6. Create a database and remember the name of the database, your username, password, as well as the port it is running on.
7. Clone the following git repository: [](https://github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g53.git).
8. Using a shell/terminal, cd into `{GITUB_REPO_LOCATION}/backend/questions-service`.
9. Run the following command `python -m venv .venv`.
10. Run `source (.venv/bin/activate)` to activate the python venv.
11. Run `pip install -r requirements.txt`.
12. Run `DB_URL=postgresql://{db username}:{db password}@localhost:{db port}/{db name} fastapi dev --port 5000`.
13. CD into `{GITHUB_REPO_LOCATION}/frontend/peerprep`.
14. Run `pnpm install`.
15. Run `pnpm run dev`.
16. Assuming no errors had occured, app should be acessible from [](http://localhost:3000/questions).


### Note: 
- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice. 
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator. 
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 

