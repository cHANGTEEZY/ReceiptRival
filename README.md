# ReceiptRival

<p align="center">
  <img src="src/assets/images/RR.png" alt="ReceiptRival logo — purple vs green ticket strips with a glass shield and a bold R" width="220" />
</p>

<p align="center">
  <strong>Split receipts. Track the drama. Settle like adults (or don’t).</strong>
</p>

---

## What is this?

**ReceiptRival** is for everyone who’s ever smiled through dinner and whispered *“we’ll split it on Venmo”* while doing mental math about who ordered the extra appetizer. It’s a mobile app that takes receipts, splits, and the gentle art of **knowing exactly who owes whom**—with enough personality that “rivals” feels less like HR and more like a group chat bit.

The vibe: **“Pal today, PayPal tomorrow.”** We’re not saying your friends are enemies. We’re just saying the spreadsheet doesn’t lie.

---

## Why it exists (the intention)

- **Receipts** shouldn’t live in your camera roll next to pet photos.
- **Splits** shouldn’t require a whiteboard and three witnesses.
- **Rivals** (your “I’ll remember this Venmo”) list is a *feature*, not a bug—so you can roast responsibly, export your debt history like a CFO, or block someone when the friendship amortizes faster than the tip.

Built for people who want **real-time data**, **actual auth**, and **one less awkward text** that starts with “hey so about last Tuesday…”

---

## Tech stack (the serious part)

We didn’t throw darts at npm—we picked things that ship.

| Layer | Toys |
|--------|------|
| **App & navigation** | [Expo](https://expo.dev) (SDK 54), [Expo Router](https://docs.expo.dev/router/introduction/) |
| **UI** | [React Native](https://reactnative.dev) · [React 19](https://react.dev) · [HeroUI Native](https://heroui.com) · [Uniwind](https://docs.uniwind.dev/) + [Tailwind CSS](https://tailwindcss.com) |
| **Backend & data** | [Convex](https://convex.dev) — queries, mutations, real-time sync, the whole vibe |
| **Auth** | [Better Auth](https://www.better-auth.com) via [@convex-dev/better-auth](https://www.convex.dev/components/better-auth) & [@convex-dev/auth](https://www.convex.dev/components/convex-auth) |
| **Forms & validation** | [React Hook Form](https://react-hook-form.com) · [Zod](https://zod.dev) |
| **Camera & media** | [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/), [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) |
| **Motion & gestures** | [Reanimated](https://docs.swmansion.com/react-native-reanimated/) · [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) · [@gorhom/bottom-sheet](https://gorhom.dev/react-native-bottom-sheet/) |
| **Language** | TypeScript |

If it’s not in the table, it’s probably still in `package.json` judging us.

---

## Getting started

```bash
pnpm install   # or npm install / yarn — we don’t start rivalries over package managers
npx expo start
```

You’ll need your own Convex project and env wired for auth—follow Convex + Better Auth docs like the responsible adult you pretend to be at brunch.

---

## Logo note

That **purple vs. neon green** ticket energy? That’s two sides of the receipt. The **shield** is where the **R** lives—because protecting your ledger is basically a sport. Glassmorphism sold separately; drama included.

---

## License

Private project—keep your splits and your rivals on your own deployment.

---

*Built with Convex, Expo, and the belief that friendship is a series of small IOUs documented in triplicate.*
