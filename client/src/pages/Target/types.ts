export type TargetType = "Regular" | "Revision" | "Extra";
export type Subject = "physics" | "chemistry" | "biology";

export interface SubjectTarget {
    chapterId: number;
    numberOfLecture: number;
    isFinal?: boolean;
}

export interface DayTarget {
    date: string;
    targetType: TargetType;
    physics: SubjectTarget[];
    chemistry: SubjectTarget[];
    biology: SubjectTarget[];
}

export interface LecturesDoneResponse {
    data: {
        numberOfExtraLectures: number;
        numberOfRegularLectures: number;
        numberOfRevisionLectures: number;
    };
    success: boolean;
}

export interface OngoingChapter {
    chapterId: number;
    lecturesPerDay: number;
    lecturesDone: number;
    isComplete: boolean;
}

export interface ChapterSelectProps {
    targetType: TargetType;
    subject: Subject;
    columnIndex: number;
    chapterId: number;
    onChapterSelect: (targetType: TargetType, subject: Subject, columnIndex: number, chapterId: number) => void;
    syllabus: any;
}

export interface OngoingChaptersBoxProps {
    targetType: TargetType;
    ongoingChapters: any;
    handleLecturesPerDayChange: (targetType: TargetType, subject: Subject, chapterId: number, value: number) => void;
    handleMarkComplete: (targetType: TargetType, subject: Subject, chapterId: number, isComplete: boolean) => void;
    syllabus: any;
}

export interface SubjectTableProps {
    targetType: TargetType;
    subject: Subject;
    dates: string[];
    selectedChapters: any;
    checkboxStates: any;
    handleChapterSelect: (targetType: TargetType, subject: Subject, columnIndex: number, chapterId: number) => void;
    handleTargetChange: (date: string, targetType: TargetType, subject: Subject, columnIndex: number, checked: boolean) => void;
    syllabus: any;
}

export interface Target {
    id: string;
    day: number;
    physics: SubjectTarget | null;
    chemistry: SubjectTarget | null;
    biology: SubjectTarget | null;
}

export interface CreateTarget {
    setId: string;
    day: number;
    physicsTarget: SubjectTarget | undefined;
    chemistryTarget: SubjectTarget | undefined;
    biologyTarget: SubjectTarget | undefined;
}

export interface TargetSet {
    id: string;
    name: string;
    createdAt: Date;
}
