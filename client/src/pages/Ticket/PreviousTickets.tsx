import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Ticket {
    id: string;
    subject: string;
    explaination: string | null;
    audioFile: string | null;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const getMyTickets = async (): Promise<Ticket[]> => {
    const { data } = await axios.get(`${backendUrl}/ticket/get-my`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    return data.data;
};

export default function Previous() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [currentAudio, setCurrentAudio] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        getMyTickets().then((data) => {
            setTickets(data);
        });
    }, []);

    const handlePlayPause = (audioFile: string) => {
        if (currentAudio === audioFile) {
            if (isPlaying) {
                audioRef.current?.pause();
            } else {
                audioRef.current?.play();
            }
            setIsPlaying(!isPlaying);
        } else {
            setCurrentAudio(audioFile);
            setIsPlaying(true);
            if (audioRef.current) {
                audioRef.current.src = `${backendUrl}/ticket/uploads/${audioFile}`;
                audioRef.current.play();
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-2 text-center">My Tickets</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="bg-white rounded-lg shadow-md p-6"
                    >
                        <h2 className="text-xl font-semibold mb-2">
                            {ticket.subject}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {ticket.explaination}
                        </p>
                        <div className="flex items-center justify-between">
                            <span
                                className={`px-2 py-1 rounded-full text-sm ${
                                    ticket.status
                                        ? "bg-green-200 text-green-800"
                                        : "bg-red-200 text-red-800"
                                }`}
                            >
                                {ticket.status ? "Resolved" : "Not Resolved"}
                            </span>
                            <span className="text-sm text-gray-500">
                                {new Date(
                                    ticket.createdAt,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        {ticket.audioFile && (
                            <div className="mt-4">
                                <button
                                    onClick={() =>
                                        handlePlayPause(ticket.audioFile!)
                                    }
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                                >
                                    {currentAudio === ticket.audioFile &&
                                    isPlaying ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                </button>
                                {currentAudio === ticket.audioFile && (
                                    <div className="mt-2">
                                        <audio
                                            ref={audioRef}
                                            src={`${backendUrl}/ticket/uploads/${ticket.audioFile}`}
                                            onEnded={() => setIsPlaying(false)}
                                            className="w-full"
                                            controls
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
