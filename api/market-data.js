import { createClient } from '@supabase/supabase-js';

const BINANCE_SYMBOLS = {
  "BTC/USDT": "BTCUSDT",
  "ETH/USDT": "ETHUSDT",
  "SOL/USDT": "SOLUSDT",
  "BNB/USDT": "BNBUSDT",
  "XRP/USDT": "XRPUSDT",
  "DOGE/USDT": "DOGEUSDT"
};

export default async function handler(req, res) {
  try {
    const pair = (req.query.pair || req.body?.pair || "BTC/USDT").toUpperCase();
    const symbol = BINANCE_SYMBOLS[pair] || pair.replace("/", "");
    const interval = req.query.interval || req.body?.interval || "15m";

    const [ticker, klines, depth, funding, fear] = await Promise.allSettled([
      fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
      fetchJson(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`),
      fetchJson(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=20`),
      fetchJson(`https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=1`),
      fetchJson(`https://api.alternative.me/fng/?limit=1`)
    ]);

    const candles = klines.status === "fulfilled" ? parseCandles(klines.value) : [];
    const indicators = candles.length ? calcIndicators(candles) : {};

    const payload = {
      ok:true,
      pair,
      symbol,
      interval,
      ticker: ticker.status === "fulfilled" ? ticker.value : null,
      orderbook: depth.status === "fulfilled" ? summarizeBook(depth.value) : null,
      funding: funding.status === "fulfilled" ? funding.value?.[0] || null : null,
      fearGreed: fear.status === "fulfilled" ? fear.value?.data?.[0] || null : null,
      indicators,
      candles: candles.slice(-20),
      source: "Binance public API + Alternative.me"
    };

    const supabase = getSupabase();
    if (supabase) await supabase.from("kr_logs").insert({ type:"market_data", data:payload }).catch(()=>{});

    return res.status(200).json(payload);
  } catch (e) {
    return res.status(500).json({ ok:false, error:e.message });
  }
}

async function fetchJson(url){
  const r = await fetch(url);
  const data = await r.json();
  if(!r.ok) throw new Error(data?.msg || data?.message || "Fetch failed");
  return data;
}

function parseCandles(rows){
  return rows.map(r => ({
    time:r[0],
    open:Number(r[1]),
    high:Number(r[2]),
    low:Number(r[3]),
    close:Number(r[4]),
    volume:Number(r[5])
  }));
}

function calcIndicators(c){
  const closes=c.map(x=>x.close), vols=c.map(x=>x.volume);
  const ema20=ema(closes,20), ema50=ema(closes,50);
  const rsi14=rsi(closes,14);
  const last=c[c.length-1];
  const avgVol=vols.slice(-20).reduce((a,b)=>a+b,0)/Math.min(20,vols.length);
  return {
    lastClose:last.close,
    ema20:Number(ema20.toFixed(4)),
    ema50:Number(ema50.toFixed(4)),
    rsi14:Number(rsi14.toFixed(2)),
    volumeSpike:last.volume > avgVol*1.5,
    trend: ema20 > ema50 ? "bullish" : ema20 < ema50 ? "bearish" : "neutral",
    avgVolume20:Number(avgVol.toFixed(2))
  };
}

function ema(values, period){
  const k=2/(period+1);
  let e=values[0];
  for(const v of values.slice(1)) e=v*k+e*(1-k);
  return e;
}

function rsi(values, period){
  let gains=0, losses=0;
  const start=Math.max(1, values.length-period);
  for(let i=start;i<values.length;i++){
    const d=values[i]-values[i-1];
    if(d>=0) gains+=d; else losses-=d;
  }
  const avgGain=gains/period, avgLoss=losses/period;
  if(avgLoss===0) return 100;
  const rs=avgGain/avgLoss;
  return 100-(100/(1+rs));
}

function summarizeBook(depth){
  const bidVol=(depth.bids||[]).reduce((a,b)=>a+Number(b[1]),0);
  const askVol=(depth.asks||[]).reduce((a,b)=>a+Number(b[1]),0);
  return {
    bestBid: depth.bids?.[0]?.[0] || null,
    bestAsk: depth.asks?.[0]?.[0] || null,
    bidVolume20:Number(bidVol.toFixed(4)),
    askVolume20:Number(askVol.toFixed(4)),
    pressure: bidVol>askVol ? "buyers" : askVol>bidVol ? "sellers" : "balanced"
  };
}

function getSupabase(){
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) return null;
  return createClient(url,key);
}
