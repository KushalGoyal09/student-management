import { Card, CardContent } from "@/components/ui/card"
import { Phone, Calendar, Target, Clock, BookOpen, GraduationCap, Award, Monitor } from "lucide-react"

interface Student {
  id: string
  name: string
  whattsapNumber: string
  callNumber: string
  target: string
  StudyHours: string
  class: string
  dropperStatus: string
  previousScore: string
  platform: string
  createdAt: Date
  status: boolean
}

interface StudentCardProps {
  student: Student
  onClick: () => void
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <h2 className="font-semibold text-lg mb-2">{student.name}</h2>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Call: {student.callNumber}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>WhatsApp: {student.whattsapNumber}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{new Date(student.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <strong>Target:</strong> {student.target}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <strong>Study Hours:</strong> {student.StudyHours}
            </span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <strong>Class:</strong> {student.class}
            </span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <strong>Dropper Status:</strong> {student.dropperStatus}
            </span>
          </div>
          <div className="flex items-center">
            <Award className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <strong>Previous Score:</strong> {student.previousScore}
            </span>
          </div>
          <div className="flex items-center">
            <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              <strong>Platform:</strong> {student.platform}
            </span>
          </div>
          <div className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full text-xs ${student.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {student.status ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

