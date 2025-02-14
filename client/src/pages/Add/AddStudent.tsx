import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const formSchema = z.object({
    fullName: z.string(),
    email: z.string(),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender.",
    }),
    fatherName: z.string(),
    motherName: z.string(),
    whatsappNumber: z.string().regex(/^\d{10}$/, {
        message: "WhatsApp number must be exactly 10 digits.",
    }),
    callingNumber: z.string().regex(/^\d{10}$/, {
        message: "Calling number must be exactly 10 digits.",
    }),
    parentNumber: z.string().regex(/^\d{10}$/, {
        message: "Parent's number must be exactly 10 digits.",
    }),
    parentNumberOwner: z.enum(["father", "mother"], {
        required_error: "Please specify whose number you've shared.",
    }),
    preferredLanguage: z.enum(["Hindi", "English"], {
        required_error: "Please select a preferred language.",
    }),
    target: z.enum(
        [
            "AIIMS",
            "Private MBBS",
            "MBBS Abroad",
            "Just Qualify",
            "Mark Improvement",
            "Drop for NEET 25",
            "BDS/BHMS/BAMS",
        ],
        { required_error: "Please select your target." },
    ),
    studyHours: z.string(),
    currentStatus: z.enum(
        [
            "Class XI",
            "Class XII",
            "1st Drop",
            "2nd Drop",
            "3rd Drop",
            "4th Drop",
            "5th Drop",
        ],
        { required_error: "Please select your current status." },
    ),
    dropperStatus: z.enum(
        ["Complete Dropper", "Partial Dropper", "Not a dropper"],
        { required_error: "Please select your dropper status." },
    ),
    previousNeetScore: z.string().optional(),
    studyPlatform: z.enum(
        [
            "PW",
            "Sankalp Bharat",
            "Unacademy",
            "Allen",
            "Aakash",
            "YouTube",
            "NEETprep",
            "Biomentors",
            "Others",
            "None",
        ],
        { required_error: "Please select your study platform." },
    ),
    completeAddress: z.string(),
    landmark: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    country: z.string(),
    expectation: z.string(),
});

export default function AddStudent() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            gender: undefined,
            fatherName: "",
            motherName: "",
            whatsappNumber: "",
            callingNumber: "",
            parentNumber: "",
            parentNumberOwner: undefined,
            preferredLanguage: undefined,
            target: undefined,
            studyHours: "",
            currentStatus: undefined,
            dropperStatus: undefined,
            previousNeetScore: "",
            studyPlatform: undefined,
            expectation: "",
            email: "",
            completeAddress: "",
            landmark: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await axios.post(
                `${backendUrl}/add/student`,
                {
                    name: data.fullName,
                    gender: data.gender,
                    fatherName: data.fatherName,
                    motherName: data.motherName,
                    whattsapNumber: data.whatsappNumber,
                    callNumber: data.callingNumber,
                    motherNumber:
                        data.parentNumberOwner === "mother"
                            ? data.parentNumber
                            : "",
                    fatherNumber:
                        data.parentNumberOwner === "father"
                            ? data.parentNumber
                            : "",
                    language: data.preferredLanguage,
                    target: data.target,
                    StudyHours: data.studyHours,
                    class: data.currentStatus,
                    dropperStatus: data.dropperStatus,
                    previousScore: data.previousNeetScore || "",
                    platform: data.studyPlatform,
                    email: data.email,
                    completeAddress: data.completeAddress,
                    landmark: data.landmark,
                    city: data.city,
                    state: data.state,
                    pincode: data.pincode,
                    country: data.country,
                    expectation: data.expectation,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                },
            );
            toast({
                title: "Registration Successful",
                description:
                    "Your registration has been submitted successfully.",
            });
            setIsSubmitting(false);
            form.reset();
        } catch (error) {
            setIsSubmitting(false);
            if (axios.isAxiosError(error)) {
                if (error.response?.data.message) {
                    toast({
                        title: "Error",
                        description: error.response.data.message,
                    });
                    return;
                }
            }
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
            });
        }
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Add Student</CardTitle>
                    <CardDescription>
                        Enter the details of the new Student.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="male" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Male
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="female" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Female
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="other" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Other
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fatherName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Father's Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Father's name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="motherName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mother's Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Mother's Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="whatsappNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>WhatsApp Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1234567890"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="callingNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calling Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1234567890"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parentNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent's Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1234567890"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parentNumberOwner"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Whose number have you shared?
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select whose number" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="father">
                                                    Father's
                                                </SelectItem>
                                                <SelectItem value="mother">
                                                    Mother's
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="preferredLanguage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Preferred Language
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Hindi">
                                                    Hindi
                                                </SelectItem>
                                                <SelectItem value="English">
                                                    English
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="target"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your TARGET</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your target" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="AIIMS">
                                                    AIIMS
                                                </SelectItem>
                                                <SelectItem value="Private MBBS">
                                                    Private MBBS
                                                </SelectItem>
                                                <SelectItem value="MBBS Abroad">
                                                    MBBS Abroad
                                                </SelectItem>
                                                <SelectItem value="Just Qualify">
                                                    Just Qualify
                                                </SelectItem>
                                                <SelectItem value="Mark Improvement">
                                                    Mark Improvement
                                                </SelectItem>
                                                <SelectItem value="Drop for NEET 25">
                                                    Drop for NEET 25
                                                </SelectItem>
                                                <SelectItem value="BDS/BHMS/BAMS">
                                                    BDS/BHMS/BAMS
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="studyHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Study Hours per day
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currentStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your current status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Class XI">
                                                    Class XI
                                                </SelectItem>
                                                <SelectItem value="Class XII">
                                                    Class XII
                                                </SelectItem>
                                                <SelectItem value="1st Drop">
                                                    1st Drop
                                                </SelectItem>
                                                <SelectItem value="2nd Drop">
                                                    2nd Drop
                                                </SelectItem>
                                                <SelectItem value="3rd Drop">
                                                    3rd Drop
                                                </SelectItem>
                                                <SelectItem value="4th Drop">
                                                    4th Drop
                                                </SelectItem>
                                                <SelectItem value="5th Drop">
                                                    5th Drop
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dropperStatus"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dropper Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your dropper status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Complete Dropper">
                                                    Complete Dropper (Studying
                                                    for NEET only)
                                                </SelectItem>
                                                <SelectItem value="Partial Dropper">
                                                    Partial Dropper (Studying
                                                    for NEET + Alternate Course)
                                                </SelectItem>
                                                <SelectItem value="Not a dropper">
                                                    I am not a dropper
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="previousNeetScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Previous NEET Score (if attempted)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your score"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Please mention marks in all attempts
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="studyPlatform"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Study Platform</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your study platform" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PW">
                                                    PW
                                                </SelectItem>
                                                <SelectItem value="Sankalp Bharat">
                                                    Sankalp Bharat
                                                </SelectItem>
                                                <SelectItem value="Unacademy">
                                                    Unacademy
                                                </SelectItem>
                                                <SelectItem value="Allen">
                                                    Allen
                                                </SelectItem>
                                                <SelectItem value="Aakash">
                                                    Aakash
                                                </SelectItem>
                                                <SelectItem value="YouTube">
                                                    YouTube
                                                </SelectItem>
                                                <SelectItem value="NEETprep">
                                                    NEETprep
                                                </SelectItem>
                                                <SelectItem value="Biomentors">
                                                    Biomentors
                                                </SelectItem>
                                                <SelectItem value="Others">
                                                    Others
                                                </SelectItem>
                                                <SelectItem value="None">
                                                    None (self study without
                                                    Lectures)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="completeAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Complete Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your Address"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pincode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pincode</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Pincode"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your State"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your Country"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expectation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Why did you join the Mentorship
                                            Programme and what do you expect
                                            from it?
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Type your answer here"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
