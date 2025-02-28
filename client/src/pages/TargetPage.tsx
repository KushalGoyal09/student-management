import Loading from "@/components/Loading";
import { useState } from "react";
import { Suspense, lazy } from "react";
const Target = lazy(() => import("./Target/Test"));
const PremadeTarget = lazy(() => import("./PremadeTarget/PremadeTarget"));

export default function TargetPage() {
    const [tab, setTab] = useState<"Target" | "PremadeTarget">("PremadeTarget");

    return (
        <Suspense fallback={<Loading />}>
            <div className="flex justify-center mb-4">
                <button
                    className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${
                        tab === "PremadeTarget"
                            ? "bg-pcb text-white"
                            : "bg-pcb/25 text-pcb"
                    }`}
                    onClick={() => setTab("PremadeTarget")}
                >
                    PREMADE TARGET
                </button>
                <button
                    className={`ml-4 px-4 py-2 font-semibold rounded-t-lg transition-colors ${
                        tab === "Target"
                            ? "bg-pcb text-white"
                            : "bg-pcb/25 text-pcb"
                    }`}
                    onClick={() => setTab("Target")}
                >
                    TARGET
                </button>
            </div>
            <div className="p-4 border-t-2 border-pcb">
                {tab === "PremadeTarget" ? <PremadeTarget /> : <Target />}
            </div>
        </Suspense>
    );
}
