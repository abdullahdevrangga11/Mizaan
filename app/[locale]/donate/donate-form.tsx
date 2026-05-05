"use client";

import { useReducer, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WizardShell } from "@/components/donate/wizard-shell";
import { Step1Type } from "@/components/donate/steps/01-type";
import { Step2Amount } from "@/components/donate/steps/02-amount";
import { Step3Laz, type LazPickValue } from "@/components/donate/steps/03-laz";
import { Step4Category } from "@/components/donate/steps/04-category";
import { Step5Wallet } from "@/components/donate/steps/05-wallet";
import { Step6Review } from "@/components/donate/steps/06-review";
import { ZAKAT_FITRAH_PER_PERSON_IDRZ } from "@/lib/constants";
import type { SupportedLocale } from "@/lib/constants";
import type { Category, DonationType } from "@/lib/types";

interface DonateFormProps {
  locale: SupportedLocale;
}

const TOTAL_STEPS = 6;

interface WizardState {
  step: number;
  donationType: DonationType | null;
  wealthIdrz: bigint;
  fitrahPeople: number;
  amountIdrz: bigint;
  laz: LazPickValue | null;
  categoryPreference: Category[];
  walletAddress: string | null;
}

type WizardAction =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SET_DONATION_TYPE"; payload: DonationType }
  | { type: "SET_AMOUNT"; payload: bigint }
  | { type: "SET_WEALTH"; payload: bigint }
  | { type: "SET_FITRAH_PEOPLE"; payload: number }
  | { type: "SET_LAZ"; payload: LazPickValue }
  | { type: "TOGGLE_CATEGORY"; payload: Category }
  | { type: "SET_WALLET"; payload: string };

const INITIAL_STATE: WizardState = {
  step: 1,
  donationType: null,
  wealthIdrz: 0n,
  fitrahPeople: 1,
  amountIdrz: 0n,
  laz: null,
  categoryPreference: [],
  walletAddress: null,
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "NEXT":
      return { ...state, step: Math.min(TOTAL_STEPS, state.step + 1) };
    case "BACK":
      return { ...state, step: Math.max(1, state.step - 1) };
    case "SET_DONATION_TYPE": {
      const next = action.payload;
      // Reset amount/wealth when donation type changes; preset fitrah default.
      const amountIdrz =
        next === "ZAKAT_FITRAH"
          ? ZAKAT_FITRAH_PER_PERSON_IDRZ * BigInt(state.fitrahPeople || 1)
          : 0n;
      return {
        ...state,
        donationType: next,
        amountIdrz,
        wealthIdrz: 0n,
      };
    }
    case "SET_AMOUNT":
      return { ...state, amountIdrz: action.payload };
    case "SET_WEALTH":
      return { ...state, wealthIdrz: action.payload };
    case "SET_FITRAH_PEOPLE":
      return { ...state, fitrahPeople: Math.max(1, action.payload) };
    case "SET_LAZ":
      return { ...state, laz: action.payload };
    case "TOGGLE_CATEGORY": {
      const exists = state.categoryPreference.includes(action.payload);
      return {
        ...state,
        categoryPreference: exists
          ? state.categoryPreference.filter((c) => c !== action.payload)
          : [...state.categoryPreference, action.payload],
      };
    }
    case "SET_WALLET":
      return { ...state, walletAddress: action.payload };
    default:
      return state;
  }
}

export function DonateForm({ locale }: DonateFormProps) {
  const t = useTranslations("donate");
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const goNext = () => dispatch({ type: "NEXT" });
  const goBack = () => dispatch({ type: "BACK" });

  const handleSubmit = async () => {
    if (!state.donationType || !state.laz || !state.walletAddress) return;

    // POST /api/donations creates the off-chain meta + (in real-mode) signs
    // the SAS attestation + transfers IDRZ. Mock-mode returns a synthetic
    // PDA so the success page renders convincingly without any provisioning.
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        donorWallet: state.walletAddress,
        lazId: state.laz.id,
        donationType: state.donationType,
        amountIdrz: state.amountIdrz.toString(),
        categoryPreference: state.categoryPreference,
      }),
    });

    const json = (await res.json()) as
      | { data: { id: string }; error: null }
      | { data: null; error: { code: string; message: string } };

    if (!res.ok || json.error || !json.data) {
      console.error(
        "[mizaan/donate] submit failed:",
        json.error ?? `HTTP ${res.status}`,
      );
      return;
    }

    startTransition(() => {
      router.push(`/donate/${json.data.id}`);
    });
  };

  const stepCopy: Record<
    number,
    { eyebrow: string; title: string; subtitle?: string }
  > = {
    1: {
      eyebrow: t("step1.eyebrow"),
      title: t("step1.title"),
      subtitle: t("step1.subtitle"),
    },
    2: {
      eyebrow: t("step2.eyebrow"),
      title: t("step2.title"),
    },
    3: {
      eyebrow: t("step3.eyebrow"),
      title: t("step3.title"),
      subtitle: t("step3.subtitle"),
    },
    4: {
      eyebrow: t("step4.eyebrow"),
      title: t("step4.title"),
      subtitle: t("step4.subtitle"),
    },
    5: {
      eyebrow: t("step5.eyebrow"),
      title: t("step5.title"),
      subtitle: t("step5.subtitle"),
    },
    6: {
      eyebrow: t("step6.eyebrow"),
      title: t("step6.title"),
      subtitle: t("step6.subtitle"),
    },
  };

  const copy = stepCopy[state.step];

  return (
    <WizardShell
      step={state.step}
      totalSteps={TOTAL_STEPS}
      eyebrow={copy.eyebrow}
      title={copy.title}
      subtitle={copy.subtitle}
      onBack={isPending ? undefined : goBack}
    >
      {state.step === 1 ? (
        <Step1Type
          locale={locale}
          value={state.donationType}
          onChange={(v) => dispatch({ type: "SET_DONATION_TYPE", payload: v })}
          onNext={goNext}
        />
      ) : null}

      {state.step === 2 && state.donationType ? (
        <Step2Amount
          donationType={state.donationType}
          amountIdrz={state.amountIdrz}
          wealthIdrz={state.wealthIdrz}
          fitrahPeople={state.fitrahPeople}
          onAmountChange={(v) => dispatch({ type: "SET_AMOUNT", payload: v })}
          onWealthChange={(v) => dispatch({ type: "SET_WEALTH", payload: v })}
          onFitrahPeopleChange={(v) =>
            dispatch({ type: "SET_FITRAH_PEOPLE", payload: v })
          }
          onNext={goNext}
        />
      ) : null}

      {state.step === 3 ? (
        <Step3Laz
          locale={locale}
          selectedLazId={state.laz?.id ?? null}
          onChange={(laz) => dispatch({ type: "SET_LAZ", payload: laz })}
          onNext={goNext}
        />
      ) : null}

      {state.step === 4 ? (
        <Step4Category
          locale={locale}
          value={state.categoryPreference}
          onToggle={(c) => dispatch({ type: "TOGGLE_CATEGORY", payload: c })}
          onNext={goNext}
        />
      ) : null}

      {state.step === 5 ? (
        <Step5Wallet
          walletAddress={state.walletAddress}
          onMockConnect={(addr) =>
            dispatch({ type: "SET_WALLET", payload: addr })
          }
          onNext={goNext}
        />
      ) : null}

      {state.step === 6 &&
      state.donationType &&
      state.laz &&
      state.walletAddress ? (
        <Step6Review
          locale={locale}
          donationType={state.donationType}
          amountIdrz={state.amountIdrz}
          lazName={state.laz.name}
          categoryPreference={state.categoryPreference}
          walletAddress={state.walletAddress}
          onSubmit={handleSubmit}
        />
      ) : null}
    </WizardShell>
  );
}
