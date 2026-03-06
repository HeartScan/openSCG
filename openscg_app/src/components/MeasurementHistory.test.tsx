import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MeasurementHistory from './MeasurementHistory';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from '@/lib/utils/storage';
import { MeasurementEntry } from '@/types/scg';

// Mock dependencies
vi.mock('@/lib/utils/storage');
vi.mock('lucide-react', () => ({
    Activity: () => <div data-testid="icon-activity" />,
    Trash2: () => <div data-testid="icon-trash" />,
    ChevronRight: () => <div data-testid="icon-chevron" />,
    Clock: () => <div data-testid="icon-clock" />,
}));

const mockMeasurements: MeasurementEntry[] = [
    {
        id: '1',
        timestamp: 1678886400000, // 2023-03-15T16:00:00.000Z
        duration: 1000,
        data: [],
        source: 'Test data: measurement_0.json'
    },
    {
        id: '2',
        timestamp: 1678890000000, // 2023-03-15T17:00:00.000Z
        duration: 2000,
        data: [
            { timestamp: 1, ax: 0, ay: 0, az: 0 },
            { timestamp: 2, ax: 0, ay: 0, az: 0 }
        ],
        source: 'Local Measurement'
    }
];

describe('MeasurementHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (storage.getAllMeasurements as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockMeasurements);
    });

    it('should render empty state when no measurements', async () => {
        (storage.getAllMeasurements as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        render(<MeasurementHistory onSelect={() => {}} />);
        
        await waitFor(() => {
            expect(screen.getByText('No recent measurements found.')).toBeInTheDocument();
        });
    });

    it('should render list of measurements', async () => {
        render(<MeasurementHistory onSelect={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('measurement_0.json')).toBeInTheDocument();
            expect(screen.getByText('Local Measurement')).toBeInTheDocument();
        });
    });

    it('should call onSelect when clicking an item', async () => {
        const onSelect = vi.fn();
        render(<MeasurementHistory onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText('measurement_0.json')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('measurement_0.json').closest('div.group')!);
        expect(onSelect).toHaveBeenCalledWith(mockMeasurements[0]);
    });

    it('should call deleteMeasurement when clicking delete icon', async () => {
        const onSelect = vi.fn();
        render(<MeasurementHistory onSelect={onSelect} />);

        await waitFor(() => {
            expect(screen.getByText('measurement_0.json')).toBeInTheDocument();
        });

        // Find the trash icon container button
        const deleteButtons = screen.getAllByTestId('icon-trash').map(icon => icon.parentElement!);
        fireEvent.click(deleteButtons[0]);

        expect(storage.deleteMeasurement).toHaveBeenCalledWith('1');
        // onSelect should NOT be called (propagation stopped)
        expect(onSelect).not.toHaveBeenCalled();
    });
});
