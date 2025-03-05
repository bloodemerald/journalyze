
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  onChartReady?: () => void;
  className?: string;
}

export function TradingViewChart({ 
  symbol = 'BINANCE:BTCUSDT', 
  interval = '1D', 
  onChartReady,
  className 
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  
  useEffect(() => {
    // Create TradingView widget when component mounts
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initializeWidget;
    document.head.appendChild(script);
    
    return () => {
      // Clean up when component unmounts
      if (chartRef.current) {
        try {
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        } catch (error) {
          console.error('Error cleaning up TradingView widget:', error);
        }
      }
    };
  }, []);
  
  useEffect(() => {
    // Update symbol when it changes
    if (chartRef.current && symbol) {
      try {
        // Check if the widget has the setSymbol method
        if (chartRef.current.iframe?.contentWindow?.postMessage) {
          // Send message to change symbol
          chartRef.current.iframe.contentWindow.postMessage({
            name: 'set-symbol',
            data: { symbol }
          }, '*');
        }
      } catch (error) {
        console.error('Error updating TradingView symbol:', error);
      }
    }
  }, [symbol]);

  const initializeWidget = () => {
    if (!containerRef.current || !window.TradingView) return;
    
    // Clear any existing chart
    containerRef.current.innerHTML = '';
    
    // Create new widget
    chartRef.current = new window.TradingView.widget({
      container_id: containerRef.current.id,
      symbol: symbol,
      interval: interval,
      toolbar_bg: '#001B29',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      height: '100%',
      width: '100%',
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      withdateranges: true,
      hide_side_toolbar: false,
      overrides: {
        "paneProperties.background": "#001B29",
        "paneProperties.vertGridProperties.color": "rgba(0, 75, 102, 0.1)",
        "paneProperties.horzGridProperties.color": "rgba(0, 75, 102, 0.1)",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#AAA",
        "mainSeriesProperties.candleStyle.wickUpColor": '#00BFFF',
        "mainSeriesProperties.candleStyle.wickDownColor": '#FF4976',
      }
    });
    
    // Notify parent when chart is ready
    if (onChartReady && chartRef.current) {
      chartRef.current.onChartReady(() => {
        onChartReady();
      });
    }
  };
  
  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <div 
        id={`tradingview_chart_${Math.random().toString(36).substring(2, 9)}`} 
        ref={containerRef} 
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

// Add TradingView types for TypeScript
declare global {
  interface Window {
    TradingView: {
      widget: any;
    };
  }
}
