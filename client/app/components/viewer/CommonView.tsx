import dynamic from 'next/dynamic';

const DynamicPlot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface WaveformData {
    t: number[];
    az: number[];
}

interface CommonViewProps {
    fullData: WaveformData;
}

export const CommonView = ({ fullData }: CommonViewProps) => {
    return (
        <div className="bg-gray-900 rounded-lg p-2">
            <DynamicPlot
                data={[{ x: fullData.t, y: fullData.az, type: 'scatter', mode: 'lines', marker: { color: '#6EE7B7' } }]}
                layout={{ title: { text: 'Common View' }, plot_bgcolor: '#111827', paper_bgcolor: '#111827', font: { color: '#E5E7EB' } }}
                config={{ responsive: true }}
                className="w-full h-96"
            />
        </div>
    );
};
