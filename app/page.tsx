'use client';

import { useEffect, useMemo, useState } from 'react';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

type PricesResponse = {
  coin: 'bitcoin';
  lastUpdated: string;
  prices: Record<CurrencyCode, number>;
};

const REFRESH_INTERVAL_MS = 30000;

export default function Page() {
  const [data, setData] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPrices = async () => {
      try {
        const response = await fetch('/api/prices', {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const json = (await response.json()) as PricesResponse;

        if (active) {
          setData(json);
          setError(false);
        }
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPrices();
    const timer = setInterval(loadPrices, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const formatters = useMemo(() => {
    const entries = CURRENCIES.map(({ code }) => {
      return [
        code,
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          maximumFractionDigits: 2
        })
      ] as const;
    });

    return Object.fromEntries(entries) as Record<CurrencyCode, Intl.NumberFormat>;
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <section className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sats in Every Currency</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Live Bitcoin price across major global currencies.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-zinc-300">Loading Bitcoin price…</p>
        ) : error || !data ? (
          <p className="mt-6 text-sm text-red-300">Failed to load price data.</p>
        ) : (
          <div className="mt-6 divide-y divide-white/10">
            {CURRENCIES.map(({ code, name }) => (
              <div key={code} className="grid grid-cols-[56px_1fr_auto] items-center gap-3 py-3 text-sm">
                <span className="font-medium text-zinc-200">{code}</span>
                <span className="text-zinc-400">{name}</span>
                <span className="font-medium text-zinc-100">
                  {formatters[code].format(data.prices[code])}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-zinc-500">
          Updates every 30 seconds. Data source: CoinGecko.
        </p>
      </section>
    </main>
  );
}
