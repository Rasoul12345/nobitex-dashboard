
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API_TOKEN = '8800d4ea36f2ca3c51c22d2b7ab08a4034c601fe';

export default function NobitexDashboard() {
  const [symbol, setSymbol] = useState('btc-usdt');
  const [data, setData] = useState([]);
  const [signal, setSignal] = useState(null);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('https://api.nobitex.ir/market/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${API_TOKEN}`,
        },
        body: JSON.stringify({ srcCurrency: symbol.split('-')[0], dstCurrency: symbol.split('-')[1] })
      });
      const json = await response.json();
      const price = parseFloat(json.stats[symbol]?.latest);
      const time = new Date().toLocaleTimeString();

      const newData = [...data.slice(-49), { time, price }];
      const prices = newData.map((d) => d.price);
      const tenkan = (Math.max(...prices.slice(-9)) + Math.min(...prices.slice(-9))) / 2;
      const kijun = (Math.max(...prices.slice(-26)) + Math.min(...prices.slice(-26))) / 2;
      const chikou = newData.length > 26 ? newData[newData.length - 26].price : null;

      const rsi = 50 + Math.random() * 10;

      const latestSignal = tenkan > kijun ? '📈 سیگنال خرید' : tenkan < kijun ? '📉 سیگنال فروش' : '⏸️ بدون سیگنال';
      setSignal(latestSignal);

      setData((prev) => [...prev.slice(-49), {
        time,
        price,
        rsi,
        tenkan,
        kijun,
        chikou
      }]);
    } catch (error) {
      console.error('خطا در دریافت داده‌ها:', error);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="p-4 grid gap-4">
      <h2 className="text-xl font-bold">داشبورد تحلیل نوبیتکس</h2>
      <div className="flex items-center gap-2">
        <input
          className="border p-2 rounded"
          placeholder="مثلاً btc-usdt"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={fetchMarketData}>بروزرسانی</button>
      </div>
      {signal && (
        <div className="text-lg font-semibold text-center mt-2">
          وضعیت فعلی: <span className="text-blue-600">{signal}</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tenkan" stroke="#ff7300" strokeDasharray="5 5" dot={false} />
          <Line type="monotone" dataKey="kijun" stroke="#387908" strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="chikou" stroke="#00bcd4" strokeDasharray="2 2" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="rsi" stroke="#82ca9d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
