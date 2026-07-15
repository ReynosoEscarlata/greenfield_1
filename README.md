<!-- generated-by: gsd-doc-writer -->
# Turnero de Sala de Espera

Mini-app de turnero para la sala de espera de una clínica: una sola pantalla que muestra el turno actual de cada ventanilla y los próximos en la cola compartida — sin backend, sin autenticación, todo el estado vive en el navegador.

## Installation

Requires Node.js `v22.23.0` or compatible (Vite 8 requires Node 20.19+ or 22.12+).

```bash
npm install
```

## Quick Start

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the printed local URL (typically `http://localhost:5173`) in your browser.

## Usage

- Click **Agregar turno** to add a new ticket to the shared queue. Tickets are numbered sequentially and never reused.
- Click **Agregar ventanilla** to add a new call window (ventanilla). Each window starts with no current ticket ("sin turno").
- Each ventanilla has its own **Llamar siguiente** button — it pulls the next ticket off the front of the shared queue and displays it as that window's current ticket, playing a short beep.
- If the queue is empty when **Llamar siguiente** is pressed, the window shows a temporary "No hay turnos en espera" warning instead.
- A ventanilla can be removed via the **×** button in its corner, but only if it has no active ticket — removing a window with an active ticket is blocked to prevent data loss.
- All state (queue, ventanillas, ticket/window counters) is persisted to `localStorage` under the key `turnero-v1`, so refreshing the page keeps the current state.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over the project |
| `npm run test` | Run the test suite once with Vitest |

## Tech Stack

- **React 19** + **TypeScript** — UI and state, using `useReducer` for the queue/ventanillas state machine (see `src/turnero.ts`)
- **Vite 8** — dev server and build tool
- **Tailwind CSS 4** (`@tailwindcss/vite`) — styling
- **Vitest** + **Testing Library** — unit and component tests

## Project Structure

```
src/
  turnero.ts        # Queue/ventanilla reducer, types, and state transitions
  turnero.test.ts    # Reducer unit tests
  App.tsx            # Root component: header, "Agregar turno", queue list, ventanillas grid
  App.test.tsx        # Component tests
  useBeep.ts          # Web Audio API hook that plays a short beep on "Llamar siguiente"
  index.css           # Tailwind entry + custom styles
  main.tsx            # React app entry point
```

## License

No LICENSE file is present in this repository. <!-- VERIFY: intended license for this project -->
