import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle,
    Mic,
    Square,
    Upload,
    Play,
    Pause,
    XCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CreateComplaintTicket() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });
                setAudioBlob(audioBlob);
                if (audioRef.current) {
                    audioRef.current.src = URL.createObjectURL(audioBlob);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAudioBlob(file);
            if (audioRef.current) {
                audioRef.current.src = URL.createObjectURL(file);
            }
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleCancel = () => {
        setAudioBlob(null);
        if (audioRef.current) {
            audioRef.current.src = "";
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        if (audioBlob) {
            formData.append("audio", audioBlob, "complaint_audio.wav");
        }

        try {
            const response = await fetch(
                import.meta.env.VITE_BACKEND_URL + "/ticket/create",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );

            const result = await response.json();

            if (response.ok) {
                setSubmitStatus({
                    success: true,
                    message: "Complaint submitted successfully.",
                });
            } else {
                setSubmitStatus({
                    success: false,
                    message:
                        result.message ||
                        "Failed to submit complaint. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error submitting complaint:", error);
            setSubmitStatus({
                success: false,
                message: "Failed to submit complaint. Please try again.",
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">
                Create a Complaint Ticket
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" required />
                </div>
                <div>
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea id="explanation" name="explanation" />
                </div>
                <div>
                    <Label>Audio (Optional)</Label>
                    <div className="flex flex-col space-y-2">
                        {!audioBlob && (
                            <>
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        onClick={
                                            isRecording
                                                ? stopRecording
                                                : startRecording
                                        }
                                        variant={
                                            isRecording
                                                ? "destructive"
                                                : "secondary"
                                        }
                                    >
                                        {isRecording ? (
                                            <Square className="mr-2 h-4 w-4" />
                                        ) : (
                                            <Mic className="mr-2 h-4 w-4" />
                                        )}
                                        {isRecording
                                            ? "Stop Recording"
                                            : "Record Audio"}
                                    </Button>
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="audio/*"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Button type="button" variant="outline">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Audio
                                        </Button>
                                    </div>
                                </div>
                                {isRecording && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-sm text-muted-foreground">
                                            Recording...
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                        {audioBlob && (
                            <div className="flex items-center space-x-2">
                                <Button
                                    type="button"
                                    onClick={togglePlayPause}
                                    variant="outline"
                                    size="icon"
                                >
                                    {isPlaying ? (
                                        <Pause className="h-4 w-4" />
                                    ) : (
                                        <Play className="h-4 w-4" />
                                    )}
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {isPlaying
                                        ? "Playing audio"
                                        : "Audio ready"}
                                </span>
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    variant="ghost"
                                    size="icon"
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <Button type="submit">Submit Complaint</Button>
            </form>
            {submitStatus && (
                <Alert
                    variant={submitStatus.success ? "default" : "destructive"}
                    className="mt-4"
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                        {submitStatus.success ? "Success" : "Error"}
                    </AlertTitle>
                    <AlertDescription>{submitStatus.message}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
