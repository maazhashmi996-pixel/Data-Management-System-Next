"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { X, Plus, Trash2, BookOpen, User, Loader2, CheckCircle2 } from 'lucide-react';

interface Teacher {
    _id: string;
    name: string;
    specialization?: string;
}

interface AssignedSubject {
    subjectName: string;
    teacherId: string;
}

interface AssignTeacherModalProps {
    student: { _id: string; studentName: string };
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignTeacherModal({ student, onClose, onSuccess }: AssignTeacherModalProps) {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchingTeachers, setFetchingTeachers] = useState<boolean>(true);

    // Initial state: starts with one empty row
    const [assignments, setAssignments] = useState<AssignedSubject[]>([
        { subjectName: '', teacherId: '' }
    ]);

    useEffect(() => {
        const fetchTeachers = async () => {
            setFetchingTeachers(true);
            try {
                const res = await api.get('/admin/teachers');
                // Backend standard handling
                const teachersData = res.data.teachers || res.data;
                setTeachers(Array.isArray(teachersData) ? teachersData : []);
            } catch (err) {
                toast.error("Faculty load karne mein masla hua");
            } finally {
                setFetchingTeachers(false);
            }
        };
        fetchTeachers();
    }, []);

    const addSubjectRow = () => {
        if (assignments.length < 4) {
            setAssignments([...assignments, { subjectName: '', teacherId: '' }]);
        } else {
            toast.error("Maximum 4 subjects allowed");
        }
    };

    const removeSubjectRow = (index: number) => {
        const updated = assignments.filter((_, i) => i !== index);
        setAssignments(updated);
    };

    const updateAssignment = (index: number, field: keyof AssignedSubject, value: string) => {
        const updated = [...assignments];
        updated[index][field] = value;
        setAssignments(updated);
    };

    const handleAssign = async () => {
        // Validation: No empty fields allowed
        const hasEmptyFields = assignments.some(a => !a.subjectName.trim() || !a.teacherId);

        if (hasEmptyFields) {
            toast.error("Please fill all subject names and select teachers");
            return;
        }

        setLoading(true);
        try {
            // MATCHING WITH UPDATED BACKEND CONTROLLER
            const res = await api.patch('/admin/assign-multiple-teachers', {
                studentId: student._id,
                assignments: assignments
            });

            if (res.data.success) {
                toast.success(`${student.studentName} ke subjects update ho gaye!`);
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error("Assignment Error:", err);
            const errorMsg = err.response?.data?.message || "Internal Server Error (500)";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
                    <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Academic Administration</p>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Assign Subjects & Teachers
                        </h2>
                        <p className="text-slate-400 text-xs mt-1 font-medium">
                            Student: <span className="text-emerald-400 font-bold">{student?.studentName}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    {fetchingTeachers ? (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="animate-spin mb-4 text-blue-600" size={32} />
                            <p className="font-bold text-xs uppercase tracking-widest">Fetching Faculty List...</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {assignments.map((item, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:border-blue-200 hover:bg-white hover:shadow-md">

                                        {/* Subject Input */}
                                        <div className="flex-1">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">
                                                <BookOpen size={12} className="text-blue-500" /> Subject
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. English"
                                                value={item.subjectName}
                                                onChange={(e) => updateAssignment(index, 'subjectName', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            />
                                        </div>

                                        {/* Teacher Selection */}
                                        <div className="flex-1">
                                            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">
                                                <User size={12} className="text-emerald-500" /> Teacher
                                            </label>
                                            <select
                                                value={item.teacherId}
                                                onChange={(e) => updateAssignment(index, 'teacherId', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                            >
                                                <option value="">Select Instructor</option>
                                                {teachers.map((t) => (
                                                    <option key={t._id} value={t._id}>
                                                        {t.name} {t.specialization ? `(${t.specialization})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Delete Action */}
                                        {assignments.length > 1 && (
                                            <button
                                                onClick={() => removeSubjectRow(index)}
                                                className="md:mt-6 p-2 text-slate-300 hover:text-red-500 transition-all self-end md:self-center"
                                                title="Remove Row"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Add More Row */}
                            {assignments.length < 4 && (
                                <button
                                    onClick={addSubjectRow}
                                    className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:text-blue-700 px-4 py-2 rounded-lg transition-all"
                                >
                                    <Plus size={16} /> Add More Subject
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || fetchingTeachers}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" size={14} /> Processing...</>
                        ) : (
                            <><CheckCircle2 size={14} /> Save Assignments</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}