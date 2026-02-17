import { NextResponse } from 'next/server';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,jpy,gbp,aud,cad,chf,cny,hkd,idr';

type CoinGeckoResponse = {
  bitcoin?: {
    usd?: number;
    eur?: number;
    jpy?: number;
    gbp?: number;
    aud?: number;
    cad?: number;
    chf?: number;
    cny?: number;
    hkd?: number;
    idr?: number;
  };
};

export async function GET() {
  try {
    const response = await fetch(COINGECKO_URL, {
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko request failed: ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoResponse;
    const btc = data.bitcoin;

    if (
      !btc ||
      typeof btc.usd !== 'number' ||
      typeof btc.eur !== 'number' ||
      typeof btc.jpy !== 'number' ||
      typeof btc.gbp !== 'number' ||
      typeof btc.aud !== 'number' ||
      typeof btc.cad !== 'number' ||
      typeof btc.chf !== 'number' ||
      typeof btc.cny !== 'number' ||
      typeof btc.hkd !== 'number' ||
      typeof btc.idr !== 'number'
    ) {
      throw new Error('Invalid CoinGecko response payload');
    }

    const payload = {
      coin: 'bitcoin',
      lastUpdated: new Date().toISOString(),
      prices: {
        USD: btc.usd,
        EUR: btc.eur,
        JPY: btc.jpy,
        GBP: btc.gbp,
        AUD: btc.aud,
        CAD: btc.cad,
        CHF: btc.chf,
        CNY: btc.cny,
        HKD: btc.hkd,
        IDR: btc.idr
      }
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 's-maxage=30, stale-while-revalidate=120'
      }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price data.' },
      {
        status: 503,
        headers: {
          'Cache-Control': 's-maxage=30, stale-while-revalidate=120'
        }
      }
    );
  }
}
