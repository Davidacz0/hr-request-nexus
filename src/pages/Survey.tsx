import { useEffect, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import clsx from 'clsx';


export default function SurveyPage() {
    const [vapi] = useState(new Vapi(""));
    const [isCallActive, setIsCallActive] = useState(false);
    // const [transcripts, setTranscripts] = useState([]);
    const [error, setError] = useState('');

    const handleCallEvents = useCallback(() => {
        vapi.on('call-start', () => {
            setIsCallActive(true);
            setError('');
        });

        vapi.on('call-end', () => setIsCallActive(false));

        // vapi.on('message', (message) => {
        //     if (message.type === 'transcript') {
        //         setTranscripts(prev => [...prev, message.content]);
        //     }
        // });

        vapi.on('error', (err) => setError(err.message));
    }, [vapi]);

    useEffect(() => {
        handleCallEvents();

        return () => {
            if (isCallActive) {
                vapi.stop();
            }
        };
    }, [handleCallEvents, vapi]);

    const handleCallButtonClick = () => {
        if (isCallActive) {
            vapi.say("Our time's up, goodbye!", true)

            vapi.stop();
            setIsCallActive(false);
        } else {
            vapi.start("", {
                variableValues: {
                    email: 'test@test.com',
                },
                clientMessages: [],
                serverMessages: []
            })

            setIsCallActive(true);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                    Voice-Powered Survey
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                                Call Status: {isCallActive ? 'Active' : 'Ended'}
                            </span>
                            <button
                                onClick={() => handleCallButtonClick()}
                                className={clsx(
                                    'px-4 py-2 rounded-md text-white',
                                    isCallActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                )}
                            >
                                {isCallActive ? 'End Call' : 'Start Call'}
                            </button>
                        </div>

                        {/* <div className="h-64 overflow-y-auto p-4 bg-white rounded-md border border-gray-200">
                            {transcripts.map((text, index) => (
                                <p key={index} className="text-gray-600 mb-2">
                                    {text}
                                </p>
                            ))}
                        </div> */}
                    </div>

                    <p className="text-center text-gray-500 text-sm">
                        We'll ask you 5 questions about your experience. Please speak clearly.
                    </p>
                </div>
            </div>
        </div>
    );
}
