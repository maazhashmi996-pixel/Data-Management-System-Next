"use client";
import React, { forwardRef } from 'react';

interface FormProps {
    data: any;
    type: 'Education Zone' | 'DIB Education System';
}

const AdmissionForm = forwardRef<HTMLDivElement, FormProps>(({ data, type }, ref) => {
    const isEZ = type === 'Education Zone';
    const primaryColor = isEZ ? 'text-orange-600' : 'text-indigo-700';
    const borderColor = isEZ ? 'border-orange-600' : 'border-indigo-700';
    const bgColor = isEZ ? 'bg-orange-600' : 'bg-indigo-700';

    // Helper function for data mapping
    const getVal = (path: string, fallback: string) => {
        const value = path.split('.').reduce((obj, key) => obj?.[key], data);
        return value || data[fallback] || '________________';
    };

    return (
        <div ref={ref} className="p-10 bg-white text-black w-[210mm] mx-auto font-sans relative overflow-hidden text-[12px] print:p-6 print:w-full">

            {/* --- TOP HEADER --- */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`w-20 h-20 ${bgColor} rounded-lg flex items-center justify-center text-white font-black text-2xl`}>
                        {isEZ ? 'EZ' : 'DIB'}
                    </div>
                    <div>
                        <h1 className={`text-4xl font-black tracking-tighter uppercase ${primaryColor}`}>
                            {type}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                            Registered & Recognized Technical Education System
                        </p>
                    </div>
                </div>
                <div className="text-[11px] text-right font-bold">
                    <p className="text-lg">Ph: 0326-0804049</p>
                    <p className="text-blue-600 underline">Admission Enrollment Office</p>
                    <p className="mt-1 text-[9px] text-gray-600 leading-tight">
                        MAIN CAMPUS: Office # 2,3, 1st Floor Midland Plaza, Defence Mor, Lahore.
                    </p>
                </div>
            </div>

            {/* --- COURSE INFO --- */}
            <div className="flex gap-10 mb-6 font-bold text-sm border-b-2 border-gray-100 pb-4">
                <p>Course: <span className="border-b-2 border-black px-4 ml-2">{getVal('course', 'course')}</span></p>
                <p>Duration: <span className="border-b-2 border-black px-4 ml-2">{getVal('duration', 'duration')}</span></p>
            </div>

            {/* --- ADMISSION FORM TITLE BAR --- */}
            <div className="flex items-center gap-0 mb-8">
                <div className="border-2 border-black px-4 py-2 font-black text-lg min-w-[150px] text-center">
                    REG NO: {getVal('regNo', 'regNo')}
                </div>
                <div className={`flex-1 ${bgColor} text-white text-center py-2 text-2xl font-black tracking-[0.3em] uppercase`}>
                    Admission Form
                </div>
                <div className="border-2 border-black border-l-0 px-4 py-2 font-black text-lg min-w-[150px] text-center">
                    {data.date || new Date().toLocaleDateString('en-GB')}
                </div>
            </div>

            {/* --- PERSONAL INFO SECTION --- */}
            <div className="space-y-5 uppercase font-bold">
                <div className="flex items-end gap-4">
                    <span className="w-40 text-[11px]">Full Name of Student:</span>
                    <span className="flex-1 border-b border-black text-lg font-black pb-1">{getVal('studentName', 'studentName')}</span>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-40 text-[11px]">Father's Name:</span>
                    <span className="flex-1 border-b border-black pb-1">{getVal('fatherName', 'fatherName')}</span>
                </div>
                <div className="flex gap-10">
                    <div className="flex-1 flex items-end gap-4">
                        <span className="w-40 text-[11px]">CNIC / B-Form:</span>
                        <span className="flex-1 border-b border-black pb-1 tracking-[4px] font-mono">{getVal('cnic', 'cnic')}</span>
                    </div>
                    <div className="flex-1 flex items-end gap-4">
                        <span className="w-24 text-[11px]">Mobile No:</span>
                        <span className="flex-1 border-b border-black pb-1 font-mono">{getVal('mobileNo', 'mobileNo')}</span>
                    </div>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-40 text-[11px]">Residential Address:</span>
                    <span className="flex-1 border-b border-black pb-1 italic font-normal normal-case">{getVal('address', 'address')}</span>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-40 text-[11px]">Email Address:</span>
                    <span className="flex-1 border-b border-black pb-1 font-normal normal-case">{getVal('email', 'email') || 'N/A'}</span>
                </div>
            </div>

            {/* --- QUALIFICATIONS --- */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-5 h-5 ${bgColor} text-white flex items-center justify-center text-[10px]`}>✓</div>
                    <h3 className={`font-black uppercase ${primaryColor}`}>Academic Qualification:</h3>
                </div>
                <table className="w-full border-collapse border border-black text-center text-[10px]">
                    <thead className="bg-gray-50 uppercase">
                        <tr>
                            <th className="border border-black p-2 w-1/4">Certificate</th>
                            <th className="border border-black p-2 w-1/3">Board / University</th>
                            <th className="border border-black p-2">Marks / Grade</th>
                            <th className="border border-black p-2">Year</th>
                        </tr>
                    </thead>
                    <tbody className="uppercase">
                        <tr className="h-10">
                            <td className="border border-black font-bold p-2">Matric / O-Level</td>
                            <td className="border border-black p-2">{getVal('qualification.matric.board', 'matricBoard')}</td>
                            <td className="border border-black p-2">{getVal('qualification.matric.marks', 'matricMarks')}</td>
                            <td className="border border-black p-2">{getVal('qualification.matric.year', 'matricYear')}</td>
                        </tr>
                        <tr className="h-10">
                            <td className="border border-black font-bold p-2">Inter / A-Level</td>
                            <td className="border border-black p-2">{getVal('qualification.inter.board', 'interBoard')}</td>
                            <td className="border border-black p-2">{getVal('qualification.inter.marks', 'interMarks')}</td>
                            <td className="border border-black p-2">{getVal('qualification.inter.year', 'interYear')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- OFFICIAL USE ONLY (Rounded Box like Image) --- */}
            <div className={`mt-10 border-2 ${borderColor} rounded-[2rem] p-6 relative`}>
                <div className={`absolute -top-4 left-10 bg-white px-6 border-2 ${borderColor} rounded-full py-1 text-[10px] font-black italic ${primaryColor}`}>
                    OFFICIAL USE ONLY
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-4 font-bold uppercase text-[11px]">
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-300 pb-1">Total Course Fee: <span className="text-black">RS. {getVal('officeUse.totalFee', 'totalFee')}</span></div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">Registration Fee: <span className="text-black">RS. {getVal('officeUse.registrationFee', 'registrationFee')}</span></div>
                        <div className="flex justify-between border-b border-gray-300 pb-1 text-red-600">Balance Amount: <span className="">RS. {getVal('officeUse.balanceAmount', 'balanceAmount')}</span></div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-gray-300 pb-1">Remarks: <span className="font-normal italic">{getVal('officeUse.remarks', 'remarks')}</span></div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">Class Schedule: <span className="font-normal">{getVal('officeUse.classSchedule', 'classSchedule')}</span></div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">Issued By: <span className="font-normal">{getVal('officeUse.issuedBy', 'issuedBy')}</span></div>
                    </div>
                </div>
            </div>

            {/* --- TERMS & CONDITIONS --- */}
            <div className="mt-8 bg-gray-50 p-3 rounded-xl text-[9px] text-gray-600 font-medium border border-gray-200">
                <p>Terms: 1) Fee is non-refundable. 2) Admission is provisional subject to document verification. 3) 75% attendance is mandatory for certification.</p>
            </div>

            {/* --- SIGNATURES --- */}
            <div className="mt-16 flex justify-between items-end px-10">
                <div className="text-center">
                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <p className="text-[10px] font-black uppercase">Authorized Seal</p>
                </div>
                <div className="text-center">
                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <p className="text-[10px] font-black uppercase">Student Signature</p>
                </div>
            </div>

            {/* --- STUDENT COPY (For Education Zone Image Reference) --- */}
            {isEZ && (
                <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-400">
                    <p className="text-center text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[1em]">Student Copy</p>
                    <div className="grid grid-cols-2 gap-20 font-bold uppercase text-[11px]">
                        <div className="flex justify-between border-b border-black pb-1">Total Fee Paid: <span>RS. {getVal('officeUse.totalFee', 'totalFee')}</span></div>
                        <div className="flex justify-between border-b border-black pb-1">Date: <span>{data.date || '__________'}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
});

AdmissionForm.displayName = "AdmissionForm";
export default AdmissionForm;