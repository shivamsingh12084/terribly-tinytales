import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const App = () => {
  const [histogramData, setHistogramData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chart, setChart] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://www.terriblytinytales.com/test.txt');
      const text = await response.text();
      const words = text.split(/[^\w']+/);
      const wordCountMap = words.reduce((map, word) => {
        map[word] = (map[word] || 0) + 1;
        return map;
      }, {});
      const sortedData = Object.entries(wordCountMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
      setHistogramData(sortedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  const exportToCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + histogramData.map(row => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'histogram_data.csv');
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    if (histogramData.length > 0) {
      const labels = histogramData.map(([word]) => word);
      const counts = histogramData.map(([_, count]) => count);

      const ctx = document.getElementById('histogram-chart').getContext('2d');
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Word Count',
              data: counts,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              precision: 0,
            },
          },
        },
      });

      setChart(newChart);
    }
  }, [histogramData]);

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
      {histogramData.length > 0 && (
        <div>
          <h2>Word Frequency Histogram</h2>
          <div>
            <button onClick={exportToCSV}>Export</button>
          </div>
          <div>
            <canvas id="histogram-chart" width="400" height="300"></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;