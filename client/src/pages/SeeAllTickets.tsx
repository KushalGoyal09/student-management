import { useState, useEffect, useRef } from "react";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { Role } from "@/recoil/userAtom";
import { useNavigate } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface TicketResponse {
    id: string;
    subject: string;
    explanation: string | null;
    audioFile: string | null;
    createdByRole: Role;
    createdByUserId: string;
    createdByUsername: string;
    createdByName: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function StylizedTickets() {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
        null,
    );
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const animationRef = useRef<number | null>(null);
    const progressRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await fetch(`${backendUrl}/ticket/get`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            setTickets(data.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleAudioPlayPause = (audioFile: string, ticketId: string) => {
        if (currentAudio && isPlaying === ticketId) {
            currentAudio.pause();
            setIsPlaying(null);
            cancelAnimationFrame(animationRef.current!);
        } else {
            if (currentAudio) {
                currentAudio.pause();
                cancelAnimationFrame(animationRef.current!);
            }
            const audio = new Audio(
                `${backendUrl}/ticket/uploads/${audioFile}`,
            );
            audio.play();
            setCurrentAudio(audio);
            setIsPlaying(ticketId);
            animateProgress(audio, ticketId);
        }
    };

    const animateProgress = (audio: HTMLAudioElement, ticketId: string) => {
        const updateProgress = () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            if (progressRef.current && ticketId === isPlaying) {
                progressRef.current.style.width = `${progress}%`;
            }
            if (audio.ended) {
                setIsPlaying(null);
                cancelAnimationFrame(animationRef.current!);
            } else {
                animationRef.current = requestAnimationFrame(updateProgress);
            }
        };
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    const handleResolveTicket = async (id: string) => {
        try {
            await fetch(`${backendUrl}/ticket/close`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ id, status: "closed" }),
            });
            fetchTickets();
        } catch (error) {
            console.error("Error resolving ticket:", error);
        }
    };

    const openProfile = (role: Role, username: string) => {
        console.log(role, username);
        if (role === Role.groupMentor) {
            navigate(`/mentor/${username}`);
        } else if (role === Role.seniorMentor) {
            navigate(`/seniorMentor`);
        } else if (role === Role.supervisor) {
            navigate(`/supervisor`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-pcb/10 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-pcb">
                TICKETS
            </h1>

            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-black">
                    ONGOING TICKETS
                </h2>
                {tickets
                    .filter((ticket) => ticket.status === false)
                    .map((ticket) => (
                        <div
                            key={ticket.id}
                            className="bg-pcb/30 rounded-lg p-4 mb-4"
                        >
                            <div className="mb-2">
                                <div>
                                    <strong>Created by:</strong>{" "}
                                    {ticket.createdByName}
                                    <ExternalLinkIcon
                                        className="h-4 w-4 ml-1 cursor-pointer inline"
                                        onClick={() =>
                                            openProfile(
                                                ticket.createdByRole,
                                                ticket.createdByUsername,
                                            )
                                        }
                                    />
                                </div>
                                <p>
                                    <strong>Subject:</strong> {ticket.subject}
                                </p>
                                <p>
                                    <strong>Explanation:</strong>{" "}
                                    {ticket.explanation}
                                </p>
                            </div>
                            {ticket.audioFile && (
                                <div className="flex items-center mb-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleAudioPlayPause(
                                                ticket.audioFile!,
                                                ticket.id,
                                            )
                                        }
                                        className="bg-pink-300 text-pcb"
                                    >
                                        {isPlaying === ticket.id ? (
                                            <Pause className="h-4 w-4 mr-2" />
                                        ) : (
                                            <Play className="h-4 w-4 mr-2" />
                                        )}
                                        {isPlaying === ticket.id
                                            ? "Pause"
                                            : "Play"}
                                    </Button>
                                </div>
                            )}
                            <Button
                                onClick={() => handleResolveTicket(ticket.id)}
                                className="bg-white text-pink-600 hover:bg-pink-100"
                            >
                                RESOLVED
                            </Button>
                        </div>
                    ))}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4 text-black">
                    CLOSED TICKETS
                </h2>
                {tickets
                    .filter((ticket) => ticket.status === true)
                    .map((ticket) => (
                        <div
                            key={ticket.id}
                            className="bg-pcb/30 rounded-lg p-4 mb-4"
                        >
                            <div className="mb-2">
                                <div>
                                    <strong>Created by:</strong>{" "}
                                    {ticket.createdByName}
                                    <ExternalLinkIcon
                                        className="h-4 w-4 ml-1 cursor-pointer inline"
                                        onClick={() =>
                                            openProfile(
                                                ticket.createdByRole,
                                                ticket.createdByUsername,
                                            )
                                        }
                                    />
                                </div>
                                <p>
                                    <strong>Subject:</strong> {ticket.subject}
                                </p>
                                <p>
                                    <strong>Explanation:</strong>{" "}
                                    {ticket.explanation}
                                </p>
                            </div>
                            {ticket.audioFile && (
                                <div className="flex items-center mb-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handleAudioPlayPause(
                                                ticket.audioFile!,
                                                ticket.id,
                                            )
                                        }
                                        className="bg-pink-300 hover:bg-pink-400 text-pink-800"
                                    >
                                        {isPlaying === ticket.id ? (
                                            <Pause className="h-4 w-4 mr-2" />
                                        ) : (
                                            <Play className="h-4 w-4 mr-2" />
                                        )}
                                        {isPlaying === ticket.id
                                            ? "Pause"
                                            : "Play"}
                                    </Button>
                                </div>
                            )}
                            <Button
                                disabled
                                className="bg-pcb text-white cursor-not-allowed"
                            >
                                RESOLVED
                            </Button>
                        </div>
                    ))}
            </div>
        </div>
    );
}
