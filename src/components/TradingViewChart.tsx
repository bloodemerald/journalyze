
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
        // Reinitialize the widget with the new symbol
        initializeWidget();
      } catch (error) {
        console.error('Error updating TradingView symbol:', error);
      }
    }
  }, [symbol]);

  const initializeWidget = () => {
    if (!containerRef.current || typeof window === 'undefined' || !window.TradingView) return;
    
    // Clear any existing chart
    containerRef.current.innerHTML = '';
    
    // Create a unique ID for this chart instance
    const containerId = `tradingview_chart_${Math.random().toString(36).substring(2, 9)}`;
    containerRef.current.id = containerId;
    
    // Create new widget
    chartRef.current = new window.TradingView.widget({
      container_id: containerId,
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
    
    // Notify parent when chart is ready - fix the onChartReady method
    if (onChartReady && chartRef.current) {
      // TradingView widget doesn't always have onChartReady method available immediately
      // So we need to add a small delay or check if it's available
      setTimeout(() => {
        // Manually call the onChartReady callback
        onChartReady();
      }, 1000); // Give the chart some time to initialize
    }
  };
  
  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <div 
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
