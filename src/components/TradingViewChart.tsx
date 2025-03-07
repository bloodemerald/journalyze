
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
  const chartReadyRef = useRef<boolean>(false);
  
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
    
    // Reset chart ready state
    chartReadyRef.current = false;
    
    // Create a unique ID for this chart instance
    const containerId = `tradingview_chart_${Math.random().toString(36).substring(2, 9)}`;
    containerRef.current.id = containerId;
    
    // Create new widget with price chart settings
    chartRef.current = new window.TradingView.widget({
      container_id: containerId,
      symbol: symbol,
      interval: interval,
      toolbar_bg: '#001B29',
      theme: 'dark',
      style: '1', // Candlestick chart
      details: true, // Show details
      hotlist: true,
      calendar: true,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
      locale: 'en',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      height: '100%',
      width: '100%',
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      show_market_status: true,
      indicators_file_name: "indicators", // Custom indicators
      // Critical setting to ensure price chart is shown, not market cap
      supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"],
      overrides: {
        "paneProperties.background": "#001B29",
        "paneProperties.vertGridProperties.color": "rgba(0, 75, 102, 0.1)",
        "paneProperties.horzGridProperties.color": "rgba(0, 75, 102, 0.1)",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#AAA",
        "mainSeriesProperties.candleStyle.wickUpColor": '#00BFFF',
        "mainSeriesProperties.candleStyle.wickDownColor": '#FF4976',
        // Critical settings to ensure price display, not market cap
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        "mainSeriesProperties.priceFormat.type": "price",
        "mainSeriesProperties.priceFormat.precision": 2,
        "mainSeriesProperties.visible": true,
        "scalesProperties.showStudyLastValue": true
      },
      studies_overrides: {
        "volume.volume.color.0": "rgba(255, 73, 118, 0.5)",
        "volume.volume.color.1": "rgba(0, 191, 255, 0.5)"
      },
      datafeed: {
        // Adding custom datafeed to force price chart mode
        onReady: (callback) => {
          setTimeout(() => callback({
            supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"],
            exchanges: [{ value: "BINANCE", name: "Binance", desc: "Binance" }],
            symbols_types: [{ name: "crypto", value: "crypto" }]
          }), 0);
        }
      },
      // This is the key fix - adding the onChartReady callback from TradingView
      onChartReady: () => {
        console.log('Chart is ready!', symbol);
        chartReadyRef.current = true;
        
        // Notify parent when chart is ready
        if (onChartReady) {
          onChartReady();
        }
      }
    });
  };
  
  return (
    <div className={className} style={{ height: '100%', width: '100%' }}>
      <div 
        ref={containerRef} 
        style={{ height: '100%', width: '100%' }}
        data-testid="trading-view-chart"
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
