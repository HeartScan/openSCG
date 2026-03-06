import SignalViewer from '@/components/SignalViewer';

export default async function ViewPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;

    return (
        <div className="w-full h-screen bg-slate-100 overflow-hidden">
             <SignalViewer sessionId={sessionId} title="Physician Live Monitor" />
        </div>
    );
}
