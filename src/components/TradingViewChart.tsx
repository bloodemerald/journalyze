
import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  onChartReady?: () => void;
  className?: string;
}

export function TradingViewChart({ 
  symbol = 'BINANCE:BTCUSDT', 
  interval = '5', // 5 minute chart by default
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
    
    // Create new widget with improved price chart settings
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
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies', 'MACD@tv-basicstudies'],
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
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user',
      // Critical setting to ensure price chart is shown, not market cap
      supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D", "1W", "1M"],
      // Default to 5 minute timeframe for consistent analysis
      interval: "5",
      // Explicitly set time interval buttons to include 5m
      time_frames: [
        { text: "1m", resolution: "1" },
        { text: "5m", resolution: "5", title: "5 Minutes" },
        { text: "15m", resolution: "15" },
        { text: "30m", resolution: "30" },
        { text: "1h", resolution: "60" },
        { text: "4h", resolution: "240" },
        { text: "1d", resolution: "1D" },
      ],
      overrides: {
        "paneProperties.background": "#001B29",
        "paneProperties.vertGridProperties.color": "rgba(0, 75, 102, 0.1)",
        "paneProperties.horzGridProperties.color": "rgba(0, 75, 102, 0.1)",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#AAA",
        "mainSeriesProperties.candleStyle.wickUpColor": '#00BFFF',
        "mainSeriesProperties.candleStyle.wickDownColor": '#FF4976',
        "mainSeriesProperties.candleStyle.upColor": '#00BFFF',
        "mainSeriesProperties.candleStyle.downColor": '#FF4976',
        // Critical settings to ensure price display, not market cap
        "mainSeriesProperties.priceAxisProperties.autoScale": true,
        "mainSeriesProperties.priceFormat.type": "price",
        "mainSeriesProperties.priceFormat.precision": 2,
        "mainSeriesProperties.visible": true,
        "scalesProperties.showStudyLastValue": true,
        // Explicitly set price scale
        "priceScale": "right",
        "scalesProperties.lineColor": "#555",
        "paneProperties.legendProperties.showSeriesTitle": true,
        "paneProperties.legendProperties.showStudyTitles": true,
        "paneProperties.legendProperties.showStudyValues": true,
      },
      studies_overrides: {
        "volume.volume.color.0": "rgba(255, 73, 118, 0.5)",
        "volume.volume.color.1": "rgba(0, 191, 255, 0.5)",
        "volume.show.tooltip": true,
        "MACD.histogram.color.1": "rgba(0, 191, 255, 0.5)",
        "MACD.histogram.color.0": "rgba(255, 73, 118, 0.5)",
      },
      // This is the key fix - adding the onChartReady callback from TradingView
      onChartReady: () => {
        console.log('Chart is ready!', symbol, 'Interval:', interval);
        chartReadyRef.current = true;
        
        // Force price display mode and add MACD
        if (chartRef.current && chartRef.current.activeChart) {
          try {
            const chart = chartRef.current.activeChart();
            chart.setChartType(1); // Candlestick
            
            // Force 5 minute timeframe
            chart.setResolution("5", function() {
              console.log("Resolution set to 5 minutes");
            });
            
            // Ensure we have MACD added
            const macdStudy = chart.createStudy('MACD', false, false, {
              in_fast_length: 12,
              in_slow_length: 26,
              in_signal_length: 9
            });
            
            // Make sure price scale is visible
            chart.executeActionById("drawingsPriceAxisSettings");
            
            // Print the current price to console for debugging
            chart.crossHairMoved(function(price) {
              if (price && price.price) {
                console.log("Current price:", price.price);
              }
            });
            
          } catch (e) {
            console.error("Error setting chart type:", e);
          }
        }
        
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
