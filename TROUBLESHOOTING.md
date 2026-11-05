# Troubleshooting

This page covers problems people hit when setting up, running, or building Time Tracker. If your problem isn't here, open an issue with the details listed in CONTRIBUTING.md.

## Development setup

### "Web Bundling failed" with expo-sqlite

The app is built for Android (and iOS) only. Don't press `w` in the Expo terminal to open the web version. Open the app with Expo Go by scanning the QR code, or press `a` for an Android emulator.

### "Unexpected token <" or a JSX syntax error

A file that contains JSX must end in `.tsx`, not `.ts`. Only files that return components need `.tsx`. Rename the file and restart:

```bash
npx expo start -c
```

### Errors that persist after you change code

Metro, the development server, may be using a stale cache. Stop it and restart with the cache cleared:

```bash
npx expo start -c
```

### `react-native-svg` or chart errors

Install native-compatible versions with the Expo command, not plain npm:

```bash
npx expo install react-native-svg
```

### Dependency warnings

Run the Expo doctor to see mismatched versions, then follow its suggestions:

```bash
npx expo-doctor
```

## Running the app

### Reminders don't arrive in Expo Go

Notification behaviour in Expo Go differs from a built app. Test reminders on an APK built with EAS. Also check that notifications are allowed for the app in your phone's settings.

### Reminder switch turns back off

The app turns the switch off when notification permission is denied. Open your phone's settings, allow notifications for Time Tracker, then enable the reminder again.

### A timer session isn't saved

Sessions shorter than one minute are never saved, by design. A Pomodoro focus block that you stop early is saved only if it ran for at least one minute. Breaks are never saved.

### A running session is lost when going back

When a timer or Pomodoro session is running, the app asks before leaving. Choose "Save & leave" to keep the time. Choosing "Keep going" stays on the screen with the timer still running.

### The Week or History chart shows old data

Charts reload when you switch to their tab. If a value still looks wrong, close the app fully and reopen it. Confirm the entry was logged to the topic you expected, since time logged to a domain and its topics is grouped under the domain on the charts.

### Dark mode doesn't apply to a screen

Make sure the screen reads its colours from `useTheme()` and not from fixed values such as `#fff`. Search the code for hard-coded colours with:

```bash
grep -rn "#fff\|#111\|#FFF" src
```

### Scroll wheels feel slow on an older phone

Close other heavy apps and try again. If it persists, note your phone model and open an issue.

## Building the APK

### `eas build` asks for a login

Run `eas login` and sign in with your Expo account. Create a free account at expo.dev if you don't have one.

### The build fails with a package name error

The `android.package` value in `app.json` must be a unique reverse-domain name, such as `com.yourname.timetracker`. Use only lowercase letters, numbers, and dots, with each part starting with a letter.

### Testers see "App not installed"

This usually means the phone already has a version of the app signed with a different key, or an older build with the same package name. Uninstall the old version, then install the new APK. Keep the same package name and EAS signing key for every build you share.

### Testers see "Install blocked" or "Unsafe app"

Apps shared outside the Play Store show this warning. On the phone, allow installs from the source they downloaded from, then tap "Install anyway." This is expected for test builds.

### An upgrade doesn't keep the data

Upgrading works only when the new APK has the same package name, the same signing key, and a higher `versionCode` in `app.json`. Increase `versionCode` before each new build.

## Data

### How do I reset everything?

Open Settings and choose Reset app. This deletes all domains, topics, logs, and settings, then restores the default setup. It can't be undone.

### Where is my data stored?

On the device only, in a local SQLite database named `timetracker.db`. Uninstalling the app deletes it. Backup and restore are planned for a later release.

## Tests and type checks

### `npm test` finds no tests

Test files must sit inside a `__tests__` folder or end in `.test.ts` or `.test.tsx`. The tests in `src/lib/__tests__/` follow this pattern.

### CI fails on the type check but works locally

Run `npm run typecheck` on your machine and fix every reported error. CI uses the same check, so the results match once the errors are gone.

### CI says it can't find the lock file

`npm ci` needs `package-lock.json`. Run `npm install` once, then commit the generated `package-lock.json`.
