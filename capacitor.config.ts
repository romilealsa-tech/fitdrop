import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.fitdrop.app",
  appName: "FitDrop",
  webDir: "www",
  server: {
    // The app loads your real, live site inside a native shell.
    // Any update you push to Vercel shows up in the app instantly —
    // no App Store/Play Store re-submission needed for normal changes.
    url: "https://www.shopfitdrop.com",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0D0D0F",
      showSpinner: false,
    },
  },
}

export default config
