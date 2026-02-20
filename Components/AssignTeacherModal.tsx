"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/axios'; // Aapka axios instance
import { toast } from 'react-hot-toast';

// 1. Interfaces define karein (Red lines hatane ke liye)
interface Teacher {
    _id: string;
    name: string;
    specialization?: string;
}

interface Student {
    _id: string;
    studentName: string;
}

interface AssignTeacherModalProps {
    student: Student | any; // 'any' safety ke liye agar student object complex hai
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignTeacherModal({ student, onClose, onSuccess }: AssignTeacherModalProps) {
    // 2. States ko types assign karein
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedTeacher, setSelectedTeacher] = useState<string>("");

    // 3. Teachers ki list fetch karna
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/admin/teachers');
                if (res.data.success) {
                    setTeachers(res.data.teachers);
                }
            } catch (err) {
                toast.error("Teachers load nahi ho sakay");
                console.error(err);
            }
        };
        fetchTeachers();
    }, []);

    // 4. Teacher assign karne ka logic
    const handleAssign = async () => {
        if (!selectedTeacher) {
            toast.error("Pehle ek teacher select karein");
            return;
        }

        setLoading(true);
        try {
            const res = await api.patch('/admin/assign-teacher', {
                studentId: student._id,
                teacherId: selectedTeacher
            });

            if (res.data.success) {
                toast.success(`Teacher assigned to ${student.studentName}`);
                onSuccess(); // Dashboard update karne ke liye
                onClose();   // Modal close karne ke liye
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Assignment fail ho gayi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-gray-800">Assign Teacher</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-bold uppercase">Student Name</p>
                    <p className="text-sm font-semibold text-gray-700">{student?.studentName}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Teacher
                    </label>
                    <select
                        className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                    >
                        <option value="">-- Choose a Teacher --</option>
                        {teachers.length > 0 ? (
                            teachers.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name} {t.specialization ? `(${t.specialization})` : ""}
                                </option>
                            ))
                        ) : (
                            <option disabled>No teachers found</option>
                        )}
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading || !selectedTeacher}
                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-md"
                    >
                        {loading ? "Assigning..." : "Confirm Assignment"}
                    </button>
                </div>
            </div>
        </div>
    );
}