# context: urbangrow smart aquaponic monorepo

## project overview
urbangrow is a climate-adaptive urban food ecosystem using iot and ai.
we are building the software ecosystem using a monorepo architecture managed by `moonrepo` (v2.5+). 

## tech stack & folder structure
the workspace root is `urbangrow-workspace`. inside, we have:
1. `apps/web`: frontend dashboard using next.js, tailwind css.
2. `apps/mobile`: smart aquaponics control center using flutter.
3. `services/backend`: core logic and api using elysiajs (on bun), drizzle orm, and postgresql (timescaledb).
4. `services/ai-engine`: predictive analytics using python, fastapi, and scikit-learn/xgboost.

## current repository status
- all folders have been scaffolded with their respective frameworks.
- git has been initialized at the root.
- `moonrepo` has been initialized, and the `.moon/workspace.yml` correctly maps the projects.

## your tasks as an ai agent
please execute the following tasks sequentially:

1. **fix moonrepo configuration**: 
   create or update the `moon.yml` file in the following directories using the correct moonrepo v2 syntax (do not use `type: application` or `local: true` as they are deprecated).
   - `services/backend/moon.yml` -> add a dev task running `bun run --watch src/index.ts`
   - `apps/web/moon.yml` -> add a dev task running `bun run dev`
   - `apps/mobile/moon.yml` -> add a dev task running `flutter run`

2. **setup backend mock data (elysiajs)**:
   since the physical iot sensors (esp32) are not yet connected, modify the `services/backend/src/index.ts` to include a simple data generator function. 
   - it should mock real-time data for: ph, tds, water temperature, air temperature, humidity, and light intensity.
   - create a basic GET endpoint (e.g., `/api/sensors/current`) that returns this mock data as a json response.

3. **run and verify**:
   instruct the user to run `moon run backend:dev` to verify the backend is serving the mock data properly.