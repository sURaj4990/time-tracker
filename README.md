# Time Tracker

A simple, private time tracker for people building skills across several areas at once. Log time by domain and topic with a timer, a Pomodoro session, or a manual entry, then see your progress as a daily chart, a weekly trend, and a heatmap.

All data stays on your device. There is no account, no server, and no tracking.

## Features

- **Domains and topics:** organise work into areas like Learning or Fitness, each with subtopics.
- **Three ways to log:** a stopwatch timer, a Pomodoro timer with configurable durations, or a manual entry for past time.
- **Notes:** attach a note to any session.
- **Charts:** a daily donut chart, a seven-day stacked bar chart, and a 12-week heatmap.
- **Streaks:** consecutive days with logged time. A missed day resets the count.
- **Daily goals:** set a target per domain and track progress on the Track page.
- **Reminders:** an optional daily notification on days with nothing logged.
- **Themes:** light, dark, or follow the system.
- **Settings:** choose whether weeks start on Monday or Sunday, and reset the app to a clean state.

## Tech stack

- [Expo](https://expo.dev) with React Native and TypeScript
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) for on-device storage
- [React Navigation](https://reactnavigation.org) for tabs and stacks
- [react-native-gifted-charts](https://github.com/Abhinayademy/react-native-gifted-charts) for charts
- [Jest](https://jestjs.io) with `jest-expo` for tests

## Getting started

Requirements: Node.js 20 or newer, npm, and the Expo Go app on your phone (or an Android emulator).

```bash
git clone https://github.com/YOUR_USERNAME/time-tracker.git
cd time-tracker
npm install
npm start
```

Scan the QR code with Expo Go, or press `a` to open an Android emulator.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Starts the Expo development server |
| `npm test` | Runs the test suite once |
| `npm run test:watch` | Runs tests and reruns them on changes |
| `npm run typecheck` | Checks TypeScript types without building |

## Building an APK

The project uses [EAS Build](https://docs.expo.dev/build/introduction/) to create installable Android builds.

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

The build runs in the cloud and returns a download link. See `eas.json` for the build profiles.

## Project structure

```
src/
  components/   Reusable UI: modals, pickers, session panels
  db/           SQLite schema, queries, and data helpers
  hooks/        Timer logic for the stopwatch and Pomodoro
  lib/          Pure helpers: dates, formatting, streaks, phases (tested)
  navigation/   Stack and tab definitions
  screens/      Full screens
  settings/     App-wide settings provider
  theme/        Light and dark palettes and the theme provider
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Changes to `main` go through a pull request and review, so direct pushes are not allowed.

For setup problems, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## License

Released under the MIT License. See [LICENSE](LICENSE).