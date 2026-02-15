'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { Lesson } from '@/lib/types';
import { getTeacherLessons, assignLessonToClassroom } from '@/lib/services/classrooms';

interface AssignLessonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classroomId: string;
    teacherId: string;
    assignedLessonIds: string[];
    onAssigned: () => void;
}

export default function AssignLessonModal({
    open,
    onOpenChange,
    classroomId,
    teacherId,
    assignedLessonIds,
    onAssigned,
}: AssignLessonModalProps) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setSearch('');
            setSelectedLessonId(null);
            return;
        }

        const fetchLessons = async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                const data = await getTeacherLessons(supabase, teacherId);
                setLessons(data);
            } catch (error) {
                console.error('Error fetching lessons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [open, teacherId]);

    const availableLessons = lessons.filter(
        (lesson) => !assignedLessonIds.includes(lesson.id)
    );

    const filteredLessons = availableLessons.filter((lesson) =>
        lesson.title.toLowerCase().includes(search.toLowerCase()) ||
        (lesson.subject && lesson.subject.toLowerCase().includes(search.toLowerCase()))
    );

    const handleAssign = async () => {
        if (!selectedLessonId) return;

        setAssigning(true);
        try {
            const supabase = createClient();
            await assignLessonToClassroom(supabase, selectedLessonId, classroomId, teacherId);
            onAssigned();
            onOpenChange(false);
        } catch (error) {
            console.error('Error assigning lesson:', error);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Lesson</DialogTitle>
                    <DialogDescription>
                        Select a lesson from your library to assign to this classroom.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search lessons..."
                        aria-label="Search lessons"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                {/* Lesson list */}
                <div aria-live="polite" className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Loading lessons...</div>
                    ) : filteredLessons.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen size={32} className="text-slate-600 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">
                                {availableLessons.length === 0 && lessons.length > 0
                                    ? 'All your lessons are already assigned.'
                                    : lessons.length === 0
                                        ? 'No lessons yet. Create one first.'
                                        : 'No lessons match your search.'}
                            </p>
                        </div>
                    ) : (
                        filteredLessons.map((lesson) => (
                            <button
                                key={lesson.id}
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                                    selectedLessonId === lesson.id
                                        ? 'border-emerald-500/60 bg-emerald-500/10'
                                        : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="font-medium text-white text-sm truncate">{lesson.title}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {lesson.subject || 'General'} &middot; {new Date(lesson.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {selectedLessonId === lesson.id && (
                                        <Check size={16} className="text-emerald-400 flex-shrink-0 ml-2" />
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedLessonId || assigning}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-[#0d281e] font-bold rounded-lg transition-all shadow-[0_2px_0_#065f46] hover:translate-y-[1px] hover:shadow-[0_1px_0_#065f46] text-sm"
                    >
                        {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
