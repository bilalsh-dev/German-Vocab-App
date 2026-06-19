import { getDb } from "./database";
import { defaultLocale, type Locale } from "../../i18n/config";
import type {
  SchedulerParams,
  Settings,
  StudyDirection,
} from "../content/types";

export const SETTINGS_ID = "app";

export const DEFAULT_SCHEDULER_PARAMS: SchedulerParams = {
  algorithm: "fsrs",
  requestRetention: 0.9,
  maximumIntervalDays: 36500,
};

export function defaultSettings(): Settings {
  return {
    id: SETTINGS_ID,
    uiLanguage: defaultLocale,
    studyDirection: "english-front",
    scheduler: { ...DEFAULT_SCHEDULER_PARAMS },
  };
}

export function getStoredSettings(): Promise<Settings | undefined> {
  return getDb().settings.get(SETTINGS_ID);
}

export async function getSettings(): Promise<Settings> {
  const existing = await getStoredSettings();
  return existing ?? defaultSettings();
}

export async function updateSettings(
  patch: Partial<Omit<Settings, "id">>,
): Promise<Settings> {
  const current = await getSettings();
  const next: Settings = {
    ...current,
    ...patch,
    scheduler: patch.scheduler
      ? { ...current.scheduler, ...patch.scheduler }
      : current.scheduler,
    id: SETTINGS_ID,
  };
  await getDb().settings.put(next);
  return next;
}

export async function setUiLanguage(locale: Locale): Promise<Settings> {
  return updateSettings({ uiLanguage: locale });
}

export async function setStudyDirection(
  direction: StudyDirection,
): Promise<Settings> {
  return updateSettings({ studyDirection: direction });
}
