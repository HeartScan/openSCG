import dynamic from 'next/dynamic';
import { useWindowSelector } from '../../hooks/useWindowSelector';

const DynamicPlot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface WaveformData {
    t: number[];
    az: number[];
}

interface ZoomedViewProps {
    fullData: WaveformData;
}

export const ZoomedView = ({ fullData }: ZoomedViewProps) => {
    const { windowStart, windowSize, navigationChartRef, windowSelectorRef, handleMouseDown } = useWindowSelector(fullData.t.length);

    const zoomedData = {
        t: fullData.t.slice(windowStart, windowStart + windowSize),
        az: fullData.az.slice(windowStart, windowStart + windowSize),
    };

    const downsampleData = (data: WaveformData, targetPoints: number): WaveformData => {
        if (data.t.length <= targetPoints) {
            return data;
        }
        const ratio = Math.floor(data.t.length / targetPoints);
        const downsampled: WaveformData = { t: [], az: [] };
        for (let i = 0; i < data.t.length; i += ratio) {
            downsampled.t.push(data.t[i]);
            downsampled.az.push(data.az[i]);
        }
        return downsampled;
    };

    const navigationData = downsampleData(fullData, 1000);

    return (
        <>
            <div className="bg-gray-900 rounded-lg p-2">
                <DynamicPlot
                    data={[{ x: zoomedData.t, y: zoomedData.az, type: 'scatter', mode: 'lines', marker: { color: '#6EE7B7' } }]}
                    layout={{ title: { text: 'Zoomed View' }, plot_bgcolor: '#111827', paper_bgcolor: '#111827', font: { color: '#E5E7EB' } }}
                    config={{ responsive: true }}
                    className="w-full h-96"
                />
            </div>
            <div className="bg-gray-900 rounded-lg p-2 relative" ref={navigationChartRef}>
                <DynamicPlot
                    data={[{ x: navigationData.t, y: navigationData.az, type: 'scatter', mode: 'lines', marker: { color: '#6EE7B7' } }]}
                    layout={{ title: { text: 'Navigation View' }, height: 150, plot_bgcolor: '#111827', paper_bgcolor: '#111827', font: { color: '#E5E7EB' } }}
                    config={{ responsive: true }}
                    className="w-full h-40"
                />
                {fullData.t.length > 0 && (
                    <div
                        ref={windowSelectorRef}
                        onMouseDown={(e) => handleMouseDown(e, 'drag')}
                        className="absolute top-0 h-full bg-blue-500 bg-opacity-20 border-x-2 border-blue-500 cursor-grab"
                        style={{
                            left: `${(windowStart / fullData.t.length) * 100}%`,
                            width: `${(windowSize / fullData.t.length) * 100}%`,
                        }}
                    >
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'resize', 'left')}
                            className="absolute top-0 left-0 h-full w-2 cursor-ew-resize"
                        ></div>
                        <div
                            onMouseDown={(e) => handleMouseDown(e, 'resize', 'right')}
                            className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
                        ></div>
                    </div>
                )}
            </div>
        </>
    );
};
