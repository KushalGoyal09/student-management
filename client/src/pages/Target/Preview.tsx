import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Send, Printer, Edit, Check } from "lucide-react";
import { useRecoilValue } from "recoil";
import syllabusAtom from "@/recoil/syllabus";
import { jsPDF } from "jspdf";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import autoTable from "jspdf-autotable";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface SubjectTarget {
    chapterId: number;
    numberOfLecture: number;
    isFinal?: boolean;
}

interface DayTarget {
    date: string;
    targetType: "Regular" | "Revision" | "Extra";
    physics: SubjectTarget[];
    chemistry: SubjectTarget[];
    biology: SubjectTarget[];
}

interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    data: {
        studentName: string;
        studentId: string;
        targets: {
            regular: DayTarget[];
            revision: DayTarget[];
            extra: DayTarget[];
        };
        includeCommonSteps: boolean;
        specialNote: string | null;
        whatsappGroupLink: string | null;
    };
}

const sendTargetToBackend = async (targets: DayTarget[], studentId: string) => {
    const response = await fetch(`${backendUrl}/target/setTarget`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            studentId,
            target: targets,
        }),
    });
    return response.json();
};

const PreviewModal: React.FC<PreviewModalProps> = ({
    isOpen,
    onClose,
    onEdit,
    data,
}) => {
    const [isApproved, setIsApproved] = useState(false);
    const [showApproveAlert, setShowApproveAlert] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(isOpen);
    const syllabus = useRecoilValue(syllabusAtom);
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    useEffect(() => {
        setIsDialogOpen(isOpen);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsDialogOpen(false);
        setIsApproved(false);
        setShowApproveAlert(false);
        onClose();
    }, [onClose]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        if (isDialogOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isDialogOpen, handleClose]);

    const commonSteps = [
        "👀 Watch Lecture and Take Notes 📝",
        "Solve DPP / Topic Wise Questions in Time Limit on OMR (Try 100 Questions per Day per Subject)",
        "Mark Incorrect❌ and Unattempted⭕ Questions and analyse your question practice and send in your group ✅",
        "Read NCERT - until covered in your today's lecture 📖",
        "📍Note :- Reattempt all marked questions from today's practice on the Next day 🔄",
    ];

    const commonStepsWithout = [
        "Watch Lecture and Take Notes",
        "Solve DPP / Topic Wise Questions in Time Limit on OMR (Try 100 Questions per Day per Subject)",
        "Mark Incorrect and Unattempted Questions and analyse your question practice and send in your group",
        "Read NCERT - until covered in your today's lecture",
        "Note :- Reattempt all marked questions from today's practice on the Next day",
    ];

    const handleSendToWhatsApp = async () => {
        if (data.whatsappGroupLink) {
            window.open(`${data.whatsappGroupLink}`, "_blank");
        } else {
            alert("WhatsApp group link is not available.");
        }
    };

    const generatePDF = () => {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 10;
        const pcbColor = "#8A0C7A";
        const contentWidth = pageWidth - 2 * margin;

        let yPosition = margin;

        const addHeader = () => {
            pdf.addImage(
                "/pcb-point-logo.png",
                "PNG",
                margin,
                yPosition,
                20,
                20,
            );
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(pcbColor);
            pdf.text(
                "Personal Mentorship Programme",
                margin + 25,
                yPosition + 10,
            );
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0);
            pdf.text(
                `Target for Future Doctor: ${data.studentName}`,
                margin + 25,
                yPosition + 18,
            );
            pdf.setDrawColor(pcbColor);
            pdf.line(
                margin,
                yPosition + 25,
                pageWidth - margin,
                yPosition + 25,
            );
            yPosition += 30;
        };

        const addTargetTable = (targets: DayTarget[], title: string) => {
            if (yPosition + 60 > pageHeight) {
                pdf.addPage();
                yPosition = margin;
                addHeader();
            }

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(pcbColor);
            pdf.text(title, margin, yPosition);
            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0);

            const headers = ["Date", "Physics", "Chemistry", "Biology"];
            const rows = targets.map((target) => [
                `${format(new Date(target.date), "dd/MM/yyyy")}\n${
                    daysOfWeek[new Date(target.date).getDay()]
                }`,
                target.physics
                    .map(
                        (chapter) =>
                            syllabus.physics.find(
                                (p) => p.id === chapter.chapterId,
                            )?.chapterName,
                    )
                    .join(", "),
                target.chemistry
                    .map(
                        (chapter) =>
                            syllabus.chemistry.find(
                                (p) => p.id === chapter.chapterId,
                            )?.chapterName,
                    )
                    .join(", "),
                target.biology
                    .map(
                        (chapter) =>
                            syllabus.biology.find(
                                (p) => p.id === chapter.chapterId,
                            )?.chapterName,
                    )
                    .join(", "),
            ]);

            autoTable(pdf, {
                head: [headers],
                body: rows,
                startY: yPosition,
                margin: { left: margin, right: margin },
                columnStyles: {
                    0: { cellWidth: 30, fillColor: [255, 255, 255] },
                    1: { cellWidth: 45, fillColor: [230, 247, 255] },
                    2: { cellWidth: 45, fillColor: [255, 243, 230] },
                    3: { cellWidth: 45, fillColor: [230, 255, 230] },
                },
                styles: { cellPadding: 2, fontSize: 8 },
                headStyles: { fillColor: [138, 12, 122], textColor: 255 },
                alternateRowStyles: {},
            });

            yPosition = (pdf as any).lastAutoTable.finalY + 10;
        };

        const addInstructions = () => {
            if (yPosition + 80 > pageHeight) {
                pdf.addPage();
                yPosition = margin;
            }

            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(pcbColor);
            pdf.text("Follow These Steps:", margin, yPosition);
            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0);
            commonStepsWithout.forEach((step, index) => {
                if (yPosition + 10 > pageHeight) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${index + 1}. ${step}`, margin, yPosition);
                yPosition += 10;
            });
        };

        // Regular Targets
        addHeader();
        addTargetTable(data.targets.regular, "Regular Target");

        // Revision Targets
        if (data.targets.revision.length > 0) {
            if (yPosition + 60 > pageHeight) {
                pdf.addPage();
                yPosition = margin;
                addHeader();
            }
            addTargetTable(data.targets.revision, "Revision Target");
        }

        // Extra Targets
        if (data.targets.extra.length > 0) {
            if (yPosition + 60 > pageHeight) {
                pdf.addPage();
                yPosition = margin;
                addHeader();
            }
            addTargetTable(data.targets.extra, "Extra Target");
        }

        // Instructions
        if (data.includeCommonSteps) {
            addInstructions();
        }

        // Special Note
        if (data.specialNote) {
            if (yPosition + 60 > pageHeight) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(pcbColor);
            pdf.text("Special Note by Mentor:", margin, yPosition);
            yPosition += 10;
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(0);
            const lines = pdf.splitTextToSize(data.specialNote, contentWidth);
            pdf.text(lines, margin, yPosition);
        }

        return pdf;
    };

    const handlePrintPDF = async () => {
        const pdf = await generatePDF();
        if (pdf) {
            pdf.save(
                `${data.studentName} - ${format(new Date(), "dd-MM-yyyy")}.pdf`,
            );
        }
    };

    const handleApproveClick = () => {
        setShowApproveAlert(true);
    };

    const handleApprove = async () => {
        setIsApproved(true);
        setShowApproveAlert(false);
        const allTargets = [
            ...data.targets.regular,
            ...data.targets.revision,
            ...data.targets.extra,
        ];
        await sendTargetToBackend(allTargets, data.studentId);
        handleClose();
    };

    const renderTargetTable = (targets: DayTarget[], title: string) => (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-pcb mb-2">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Physics</th>
                            <th className="border p-2">Chemistry</th>
                            <th className="border p-2">Biology</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map((target, index) => (
                            <tr key={index}>
                                <td className="border p-2">
                                    {format(
                                        new Date(target.date),
                                        "dd/MM/yyyy",
                                    )}
                                    <br />
                                    {daysOfWeek[new Date(target.date).getDay()]}
                                </td>
                                <td
                                    className={`border p-2 ${index % 2 === 0 ? "bg-blue-100" : ""}`}
                                >
                                    {target.physics
                                        .map(
                                            (chapter) =>
                                                `${syllabus.physics.find((p) => p.id === chapter.chapterId)?.chapterName}`,
                                        )
                                        .join(", ")}
                                </td>
                                <td
                                    className={`border p-2 ${index % 2 === 0 ? "bg-orange-100" : ""}`}
                                >
                                    {target.chemistry
                                        .map(
                                            (chapter) =>
                                                `${syllabus.chemistry.find((p) => p.id === chapter.chapterId)?.chapterName}`,
                                        )
                                        .join(", ")}
                                </td>
                                <td
                                    className={`border p-2 ${index % 2 === 0 ? "bg-green-100" : ""}`}
                                >
                                    {target.biology
                                        .map(
                                            (chapter) =>
                                                `${syllabus.biology.find((p) => p.id === chapter.chapterId)?.chapterName}`,
                                        )
                                        .join(", ")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={handleClose}>
                <DialogContent
                    className="max-w-4xl max-h-[90vh] overflow-y-auto"
                    onPointerDownOutside={handleClose}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <img
                                    src="/pcb-point-logo.png"
                                    alt="PCB Point Logo"
                                    className="w-12 h-12 mr-2"
                                />
                                <span className="text-2xl font-bold text-pcb">
                                    Personal Mentorship Programme
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div id="preview-content" className="space-y-4">
                        <div className="bg-pcb text-white p-4 rounded-t-lg">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">
                                    Target for Future Doctor
                                </h2>
                                <div className="bg-white text-pcb px-4 py-1 rounded">
                                    {data.studentName}
                                </div>
                            </div>
                        </div>
                        {renderTargetTable(
                            data.targets.regular,
                            "Regular Target 🎯",
                        )}
                        {data.targets.revision.length > 0 &&
                            renderTargetTable(
                                data.targets.revision,
                                "Revision Target 🔄",
                            )}
                        {data.targets.extra.length > 0 &&
                            renderTargetTable(
                                data.targets.extra,
                                "Extra Target 🚀",
                            )}

                        {data.includeCommonSteps && (
                            <div className="p-4 bg-gray-100 rounded">
                                <h4 className="font-bold mb-2">
                                    Follow These Steps:
                                </h4>
                                <ol className="list-decimal list-inside">
                                    {commonSteps.map((step, index) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {data.specialNote && (
                            <div className="p-4 bg-yellow-100 rounded">
                                <h4 className="font-bold mb-2">
                                    Special Note by Mentor:
                                </h4>
                                <p>{data.specialNote}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-start gap-2 mt-4">
                        <Button
                            onClick={() => {
                                setIsApproved(false);
                                onEdit();
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600"
                        >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button
                            onClick={handleApproveClick}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={isApproved}
                        >
                            <Check className="mr-2 h-4 w-4" />{" "}
                            {isApproved ? "Approved" : "Approve"}
                        </Button>
                        <Button
                            onClick={handlePrintPDF}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            <Printer className="mr-2 h-4 w-4" /> Print PDF
                        </Button>
                        <Button
                            onClick={handleSendToWhatsApp}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            <Send className="mr-2 h-4 w-4" /> Send
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog
                open={showApproveAlert}
                onOpenChange={setShowApproveAlert}
            >
                <AlertDialogContent
                    onPointerDown={() => setShowApproveAlert(false)}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will not be able to change the target once you
                            approve it.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setShowApproveAlert(false);
                                handleClose();
                            }}
                        >
                            Edit
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default PreviewModal;
