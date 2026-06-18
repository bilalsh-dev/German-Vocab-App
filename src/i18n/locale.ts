"use server";

import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";

const COOKIE_NAME = "wortbox.locale";

export async function getUserLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return value && isLocale(value) ? value : defaultLocale;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  (await cookies()).set(COOKIE_NAME, locale);
}
