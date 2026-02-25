import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPlanLimits } from '@/lib/subscription';
import { getSupabase } from '@/lib/supabase';
import { FREE_LANGUAGES, LANGUAGE_NAMES } from '@/app/api/translate/route';

const FREE_LANG_CODES = FREE_LANGUAGES as readonly string[];

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;
  const { plan, limits } = await getPlanLimits(email);

  // Fetch saved languages from Supabase
  const supabase = getSupabase();
  const { data } = await supabase
    .from('translator_settings')
    .select('target_languages, selected_channel_id')
    .eq('email', email)
    .single();

  const targetLanguages: string[] = data?.target_languages ?? ['zh', 'es'];
  const selectedChannelId: string | null = data?.selected_channel_id ?? null;

  // Build language lists based on plan
  const allFree = FREE_LANG_CODES.map((code) => ({ code, name: LANGUAGE_NAMES[code] ?? code }));
  const allPremium = Object.entries(LANGUAGE_NAMES)
    .filter(([code]) => !FREE_LANG_CODES.includes(code))
    .map(([code, name]) => ({ code, name }));

  const availableLanguages =
    plan === 'free'
      ? { free: allFree, premium: allPremium }
      : { free: allFree, premium: allPremium };

  return NextResponse.json({
    targetLanguages,
    selectedChannelId,
    maxLanguages: limits.translatorMaxLanguages,
    plan,
    availableLanguages,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;
  const { plan, limits } = await getPlanLimits(email);

  const body = await request.json();
  const { targetLanguages, selectedChannelId } = body as {
    targetLanguages?: string[];
    selectedChannelId?: string | null;
  };

  // Build the upsert payload — only include fields that were provided
  const upsertData: Record<string, unknown> = {
    email,
    updated_at: new Date().toISOString(),
  };

  if (targetLanguages !== undefined) {
    if (!Array.isArray(targetLanguages)) {
      return NextResponse.json({ error: 'targetLanguages must be an array' }, { status: 400 });
    }

    // Validate length
    if (targetLanguages.length > limits.translatorMaxLanguages) {
      return NextResponse.json(
        {
          error: `Your ${plan} plan allows up to ${limits.translatorMaxLanguages} languages.`,
          code: 'PLAN_LIMIT_EXCEEDED',
        },
        { status: 403 }
      );
    }

    // Validate each language against plan access
    for (const lang of targetLanguages) {
      if (!LANGUAGE_NAMES[lang]) {
        return NextResponse.json({ error: `Unknown language code: ${lang}` }, { status: 400 });
      }
      if (plan === 'free' && !FREE_LANG_CODES.includes(lang)) {
        return NextResponse.json(
          {
            error: `Your free plan only supports EN/ZH/JA/ES. Upgrade for: ${lang}.`,
            code: 'PLAN_LIMIT_EXCEEDED',
          },
          { status: 403 }
        );
      }
    }

    upsertData.target_languages = targetLanguages;
  }

  if (selectedChannelId !== undefined) {
    upsertData.selected_channel_id = selectedChannelId;
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('translator_settings')
    .upsert(upsertData, { onConflict: 'email' });

  if (error) {
    console.error('Failed to save translator settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }

  return NextResponse.json({
    ...(targetLanguages !== undefined ? { targetLanguages } : {}),
    ...(selectedChannelId !== undefined ? { selectedChannelId } : {}),
  });
}
