import {useState, useEffect} from 'react'
import {useRecoilValue} from 'recoil'
import {format} from 'date-fns'
import {CalendarIcon} from 'lucide-react'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {Checkbox} from '@/components/ui/checkbox'
import {Button} from '@/components/ui/button'
import {Popover, PopoverTrigger, PopoverContent} from '@/components/ui/popover'
import {Label} from '@/components/ui/label'
import {Textarea} from '@/components/ui/textarea'
import {Card, CardContent} from '@/components/ui/card'
import {Calendar} from '@/components/ui/calendar'
import existingStudents from '@/recoil/existingStudents'
import syllabusAtom from '@/recoil/syllabus'
import PreviewModal from './Preview'
import PreviousTargets from './PreviousTargets'
import {TargetSection} from './TargetSection'
import {getLecturesDone} from './api'
import {TargetType, Subject, DayTarget, SubjectTarget, OngoingChapter} from './types'

const TargetAssignment = () => {
  const [checkboxStates, setCheckboxStates] = useState<{
    [key: string]: boolean
  }>({})
  const [showRevision, setShowRevision] = useState(false)
  const [showRegular, setShowRegular] = useState(false)
  const [showExtra, setShowExtra] = useState(false)
  const students = useRecoilValue(existingStudents)
  const syllabus = useRecoilValue(syllabusAtom)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [dates, setDates] = useState<string[]>([])
  const [targets, setTargets] = useState<DayTarget[]>([])
  const [includeCommonSteps, setIncludeCommonSteps] = useState(false)
  const [specialNote, setSpecialNote] = useState('')
  const [includeSpecialNote, setIncludeSpecialNote] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [selectedChapters, setSelectedChapters] = useState<{
    [key in TargetType]: {[key in Subject]: number[]}
  }>({
    Regular: {physics: [0, 0, 0], chemistry: [0, 0, 0], biology: [0, 0, 0]},
    Revision: {physics: [0, 0, 0], chemistry: [0, 0, 0], biology: [0, 0, 0]},
    Extra: {physics: [0, 0, 0], chemistry: [0, 0, 0], biology: [0, 0, 0]}
  })
  const [ongoingChapters, setOngoingChapters] = useState<{
    [key in TargetType]: {[key in Subject]: OngoingChapter[]}
  }>({
    Regular: {physics: [], chemistry: [], biology: []},
    Revision: {physics: [], chemistry: [], biology: []},
    Extra: {physics: [], chemistry: [], biology: []}
  })

  useEffect(() => {
    const initialDates = Array.from({length: 7}, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date.toISOString().split('T')[0]
    })
    setDates(initialDates)
  }, [startDate])

  const addDay = () => {
    const lastDate = new Date(dates[dates.length - 1])
    lastDate.setDate(lastDate.getDate() + 1)
    setDates([...dates, lastDate.toISOString().split('T')[0]])
  }

  const handleTargetChange = (date: string, targetType: TargetType, subject: Subject, columnIndex: number, checked: boolean) => {
    const chapterId = selectedChapters[targetType][subject][columnIndex]
    if (chapterId === 0) return
    const checkboxKey = `${date}-${targetType}-${subject}-${columnIndex}`
    setCheckboxStates(prev => ({...prev, [checkboxKey]: checked}))
    setTargets(prevTargets => {
      const targetIndex = prevTargets.findIndex(t => t.date === date && t.targetType === targetType)
      if (targetIndex === -1) {
        const lecturesPerDay = ongoingChapters[targetType][subject].find(chapter => chapter.chapterId === chapterId)?.lecturesPerDay || 1
        return [
          ...prevTargets,
          {
            date,
            targetType,
            physics: subject === 'physics' ? [{chapterId, numberOfLecture: lecturesPerDay}] : [],
            chemistry: subject === 'chemistry' ? [{chapterId, numberOfLecture: lecturesPerDay}] : [],
            biology: subject === 'biology' ? [{chapterId, numberOfLecture: lecturesPerDay}] : []
          }
        ]
      } else {
        const updatedTargets = [...prevTargets]
        if (checked) {
          const lecturesPerDay = ongoingChapters[targetType][subject].find(chapter => chapter.chapterId === chapterId)?.lecturesPerDay || 1
          updatedTargets[targetIndex][subject].push({
            chapterId,
            numberOfLecture: lecturesPerDay
          })
        } else {
          updatedTargets[targetIndex][subject] = updatedTargets[targetIndex][subject].filter(t => t.chapterId !== chapterId)
        }
        return updatedTargets
      }
    })

    setOngoingChapters(prev => {
      const updatedOngoingChapters = {...prev}
      const chapterIndex = updatedOngoingChapters[targetType][subject].findIndex(chapter => chapter.chapterId === chapterId)

      if (chapterIndex !== -1) {
        const lecturesPerDay = updatedOngoingChapters[targetType][subject][chapterIndex].lecturesPerDay
        updatedOngoingChapters[targetType][subject][chapterIndex].lecturesDone += checked ? lecturesPerDay : -lecturesPerDay
      }

      return updatedOngoingChapters
    })
  }

  const handleChapterSelect = async (targetType: TargetType, subject: Subject, columnIndex: number, chapterId: number) => {
    setSelectedChapters(prev => ({
      ...prev,
      [targetType]: {
        ...prev[targetType],
        [subject]: prev[targetType][subject].map((id, index) => (index === columnIndex ? chapterId : id))
      }
    }))

    if (selectedStudent && chapterId !== 0) {
      try {
        const lecturesDone = await getLecturesDone(selectedStudent, chapterId, subject)
        const lecturesDoneCount = targetType === 'Regular' ? lecturesDone.numberOfRegularLectures : targetType === 'Revision' ? lecturesDone.numberOfRevisionLectures : lecturesDone.numberOfExtraLectures

        setOngoingChapters(prev => {
          const updatedOngoingChapters = {...prev}
          const chapterIndex = updatedOngoingChapters[targetType][subject].findIndex(chapter => chapter.chapterId === chapterId)

          if (chapterIndex === -1) {
            updatedOngoingChapters[targetType][subject].push({
              chapterId,
              lecturesPerDay: 1,
              lecturesDone: lecturesDoneCount,
              isComplete: false
            })
          } else {
            updatedOngoingChapters[targetType][subject][chapterIndex].lecturesDone = lecturesDoneCount
          }

          return updatedOngoingChapters
        })
      } catch (error) {
        console.error('Error fetching lectures done:', error)
      }
    }
  }

  const handleLecturesPerDayChange = (targetType: TargetType, subject: Subject, chapterId: number, value: number) => {
    setOngoingChapters(prev => {
      const updatedOngoingChapters = {...prev}
      const chapterIndex = updatedOngoingChapters[targetType][subject].findIndex(chapter => chapter.chapterId === chapterId)

      if (chapterIndex !== -1) {
        updatedOngoingChapters[targetType][subject][chapterIndex].lecturesPerDay = value
      }

      return updatedOngoingChapters
    })
  }

  const handleMarkComplete = (targetType: TargetType, subject: Subject, chapterId: number, isComplete: boolean) => {
    setOngoingChapters(prev => {
      const updatedOngoingChapters = {...prev}
      const chapterIndex = updatedOngoingChapters[targetType][subject].findIndex(chapter => chapter.chapterId === chapterId)

      if (chapterIndex !== -1) {
        updatedOngoingChapters[targetType][subject][chapterIndex].isComplete = isComplete
      }

      return updatedOngoingChapters
    })

    // Set isFinal to true for the last target of this chapter if marked as complete
    if (isComplete) {
      setTargets(prevTargets => {
        const updatedTargets = [...prevTargets]
        const lastTargetIndex = (() => {
          for (let i = updatedTargets.length - 1; i >= 0; i--) {
            const target = updatedTargets[i]
            if (target.targetType === targetType && target[subject].some((t: SubjectTarget) => t.chapterId === chapterId)) {
              return i
            }
          }
          return -1
        })()

        if (lastTargetIndex !== -1) {
          const chapterIndex = updatedTargets[lastTargetIndex][subject].findIndex(t => t.chapterId === chapterId)
          if (chapterIndex !== -1) {
            updatedTargets[lastTargetIndex][subject][chapterIndex].isFinal = true
          }
        }

        return updatedTargets
      })
    }
  }

  const handlePreview = () => {
    console.log(targets)
    setIsPreviewOpen(true)
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-pcb">Target Assignment</h1>

      <Card className="mb-6 bg-white shadow-md">
        <CardContent className="p-4">
          <div className="mb-4">
            <Label htmlFor="student-select" className="text-pcb">
              Select Junior
            </Label>
            <Select onValueChange={setSelectedStudent} value={selectedStudent}>
              <SelectTrigger id="student-select" className="border-pcb/30 text-pcb">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start-date" className="text-pcb">
              Start Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="start-date" variant="outline" className="w-full justify-start text-left font-normal border-pcb/30 text-pcb">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar mode="single" selected={startDate} onSelect={date => date && setStartDate(date)} initialFocus className="border-pcb/10" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      <PreviousTargets studentId={selectedStudent} startDate={startDate} />

      <TargetSection targetType="Regular" showState={showRegular} setShowState={setShowRegular} addDay={addDay} ongoingChapters={ongoingChapters} handleLecturesPerDayChange={handleLecturesPerDayChange} handleMarkComplete={handleMarkComplete} dates={dates} selectedChapters={selectedChapters} checkboxStates={checkboxStates} handleChapterSelect={handleChapterSelect} handleTargetChange={handleTargetChange} syllabus={syllabus} />

      <TargetSection targetType="Revision" showState={showRevision} setShowState={setShowRevision} addDay={addDay} ongoingChapters={ongoingChapters} handleLecturesPerDayChange={handleLecturesPerDayChange} handleMarkComplete={handleMarkComplete} dates={dates} selectedChapters={selectedChapters} checkboxStates={checkboxStates} handleChapterSelect={handleChapterSelect} handleTargetChange={handleTargetChange} syllabus={syllabus} />

      <TargetSection targetType="Extra" showState={showExtra} setShowState={setShowExtra} addDay={addDay} ongoingChapters={ongoingChapters} handleLecturesPerDayChange={handleLecturesPerDayChange} handleMarkComplete={handleMarkComplete} dates={dates} selectedChapters={selectedChapters} checkboxStates={checkboxStates} handleChapterSelect={handleChapterSelect} handleTargetChange={handleTargetChange} syllabus={syllabus} />

      <Card className="mt-8 bg-white shadow-md">
        <CardContent className="p-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="include-common-steps" checked={includeCommonSteps} onCheckedChange={checked => setIncludeCommonSteps(checked as boolean)} className="border-pcb/30 text-pcb" />
              <Label htmlFor="include-common-steps" className="text-pcb">
                Include common steps
              </Label>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="include-special-note" checked={includeSpecialNote} onCheckedChange={checked => setIncludeSpecialNote(checked as boolean)} className="border-pcb/30 text-pcb" />
              <Label htmlFor="include-special-note" className="text-pcb">
                Mentor's Special Note
              </Label>
            </div>
            {includeSpecialNote && <Textarea id="special-note" placeholder="Enter special note" value={specialNote} onChange={e => setSpecialNote(e.target.value)} className="border-pcb/30 text-pcb placeholder-pcb/50" />}
          </div>

          <Button onClick={handlePreview} className="w-full bg-pcb text-white hover:bg-pcb/90">
            Preview
          </Button>
        </CardContent>
      </Card>

      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onEdit={() => setIsPreviewOpen(false)}
        data={{
          studentId: selectedStudent,
          studentName: students.find(s => s.id === selectedStudent)?.name || '',
          targets: {
            regular: targets.filter(t => t.targetType === 'Regular'),
            revision: targets.filter(t => t.targetType === 'Revision'),
            extra: targets.filter(t => t.targetType === 'Extra')
          },
          includeCommonSteps,
          specialNote: includeSpecialNote ? specialNote : null,
          whatsappGroupLink: students.find(s => s.id === selectedStudent)?.whattsapGroupLink || null
        }}
      />
    </div>
  )
}

export default TargetAssignment