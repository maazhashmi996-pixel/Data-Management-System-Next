"use client";
import React, { forwardRef } from 'react';

interface FormProps {
    data: any;
    type: 'Education Zone' | 'DIB Education System';
}

const AdmissionForm = forwardRef<HTMLDivElement, FormProps>(({ data, type }, ref) => {
    const isEZ = type === 'Education Zone';
    const primaryColor = isEZ ? 'text-orange-600' : 'text-indigo-800';
    const borderColor = isEZ ? 'border-orange-600' : 'border-indigo-800';
    const bgColor = isEZ ? 'bg-orange-600' : 'bg-indigo-800';

    // --- DYNAMIC LOGO SELECTION ---
    const logoSrc = isEZ ? '/ez-logo.png' : '/dib-logo.png';

    const getVal = (path: string, fallback: string) => {
        const nestedValue = path.split('.').reduce((obj, key) => obj?.[key], data);
        if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') return nestedValue;

        const directValue = data[fallback];
        if (directValue !== undefined && directValue !== null && directValue !== '') return directValue;

        const officeValue = data.officeUse?.[fallback];
        if (officeValue !== undefined && officeValue !== null && officeValue !== '') return officeValue;

        return '________________';
    };

    return (
        <div ref={ref} className="p-10 bg-white text-black w-[210mm] min-h-[297mm] mx-auto font-sans relative overflow-hidden text-[12px] print:p-6 print:w-full shadow-lg print:shadow-none border border-gray-100">

            {/* --- WATERMARK --- */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <img src={logoSrc} alt="" className="w-[500px] -rotate-45 grayscale" />
            </div>

            {/* --- HEADER --- */}
            <div className="relative z-10 flex justify-between items-center mb-6 border-b-2 pb-6" style={{ borderColor: isEZ ? '#ea580c' : '#3730a3' }}>
                <div className="flex items-center gap-6">
                    {/* --- PNG LOGO ADDED HERE --- */}
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                        <img
                            src={logoSrc}
                            alt="Institution Logo"
                            className="w-24 h-24 object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                    <div>
                        <h1 className={`text-5xl font-black tracking-tighter uppercase leading-none ${primaryColor}`}>
                            {type}
                        </h1>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">
                            Technical Education & Vocational Training System
                        </p>
                    </div>
                </div>
                <div className="w-28 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-[9px] text-gray-400 text-center p-2 uppercase font-bold bg-gray-50 rounded-lg">
                    Paste Recent<br />Photograph<br />Here
                </div>
            </div>

            {/* --- CONTACT INFO --- */}
            <div className="relative z-10 flex justify-between text-[11px] mb-6 font-bold bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="space-y-1">
                    <p className="flex items-center gap-2 italic">📍 Office # 2,3, 1st Floor Midland Plaza, Defence Mor, Lahore.</p>
                    <p className="flex items-center gap-2">📧 {isEZ ? 'info@ez-system.pk' : 'admissions@dib-system.edu.pk'}</p>
                </div>
                <div className="text-right">
                    <p className={`text-xl font-black ${isEZ ? 'text-orange-600' : 'text-indigo-800'}`}>Ph: 0326-0804049</p>
                    <p className="text-[9px] text-gray-400 uppercase">Authorized Admission Center</p>
                </div>
            </div>

            {/* --- ENROLLMENT BAR --- */}
            <div className="relative z-10 flex items-center gap-0 mb-8 border-2 border-black rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-6 py-3 font-black text-lg border-r-2 border-black min-w-[180px]">
                    REG NO: <span className="font-mono text-blue-700">{getVal('regNo', 'regNo')}</span>
                </div>
                <div className={`flex-1 ${bgColor} text-white text-center py-3 text-2xl font-black tracking-[0.4em] uppercase shadow-inner`}>
                    Admission Form
                </div>
                <div className="bg-gray-100 px-6 py-3 font-black text-lg border-l-2 border-black min-w-[180px] text-center">
                    DATE: {data.date || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'))}
                </div>
            </div>

            {/* --- COURSE INFO --- */}
            <div className="relative z-10 grid grid-cols-2 gap-8 mb-8">
                <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
                    <span className="font-black uppercase text-gray-600">Applied Course:</span>
                    <span className="text-lg font-bold text-black flex-1 uppercase">{getVal('course', 'course')}</span>
                </div>
                <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
                    <span className="font-black uppercase text-gray-600">Duration:</span>
                    <span className="text-lg font-bold text-black flex-1 uppercase">{getVal('duration', 'duration')}</span>
                </div>
            </div>

            {/* --- PERSONAL INFO --- */}
            <div className="relative z-10 space-y-5 uppercase font-bold">
                <div className="flex items-end gap-4">
                    <span className="w-44 text-[11px] text-gray-600">Student Name:</span>
                    <span className="flex-1 border-b-2 border-black text-xl font-black pb-1 uppercase">{getVal('studentName', 'studentName')}</span>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-44 text-[11px] text-gray-600">Father's Name:</span>
                    <span className="flex-1 border-b-2 border-black text-lg pb-1 uppercase">{getVal('fatherName', 'fatherName')}</span>
                </div>
                <div className="grid grid-cols-2 gap-10">
                    <div className="flex items-end gap-4">
                        <span className="w-44 text-[11px] text-gray-600">CNIC / B-Form:</span>
                        <span className="flex-1 border-b-2 border-black pb-1 font-mono text-lg">{getVal('cnic', 'cnic')}</span>
                    </div>
                    <div className="flex items-end gap-4">
                        <span className="w-32 text-[11px] text-gray-600">Mobile No:</span>
                        <span className="flex-1 border-b-2 border-black pb-1 font-mono text-lg">{getVal('mobileNo', 'mobileNo')}</span>
                    </div>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-44 text-[11px] text-gray-600">Residential Address:</span>
                    <span className="flex-1 border-b-2 border-black pb-1 normal-case font-normal uppercase">{getVal('address', 'address')}</span>
                </div>
            </div>

            {/* --- ACADEMIC BACKGROUND --- */}
            <div className="relative z-10 mt-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-6 h-6 ${bgColor} rounded-full text-white flex items-center justify-center text-xs font-bold shadow-md`}>✓</div>
                    <h3 className={`font-black text-lg uppercase ${primaryColor}`}>Academic Background:</h3>
                </div>
                <table className="w-full border-collapse border-2 border-black text-center text-[11px]">
                    <thead className="bg-gray-100 uppercase border-b-2 border-black font-black">
                        <tr>
                            <th className="border-r-2 border-black p-3 w-1/4">Certificate / Degree</th>
                            <th className="border-r-2 border-black p-3 w-1/3">Board / University</th>
                            <th className="border-r-2 border-black p-3">Marks / Grade</th>
                            <th className="p-3">Passing Year</th>
                        </tr>
                    </thead>
                    <tbody className="uppercase font-bold">
                        <tr className="border-b-2 border-black h-12">
                            <td className="border-r-2 border-black bg-gray-50 p-2">Matric / O-Level</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.matric.board', 'matricBoard')}</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.matric.marks', 'matricMarks')}</td>
                            <td className="p-2">{getVal('qualification.matric.year', 'matricYear')}</td>
                        </tr>
                        <tr className="h-12 border-b-2 border-black">
                            <td className="border-r-2 border-black bg-gray-50 p-2">Inter / A-Level</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.inter.board', 'interBoard')}</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.inter.marks', 'interMarks')}</td>
                            <td className="p-2">{getVal('qualification.inter.year', 'interYear')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- FEE SECTION --- */}
            <div className={`relative z-10 mt-10 border-4 ${borderColor} rounded-[2.5rem] p-8 bg-gray-50/30`}>
                <div className={`absolute -top-5 left-12 bg-white px-8 border-2 ${borderColor} rounded-full py-2 text-[12px] font-black italic shadow-md ${primaryColor} uppercase tracking-widest`}>
                    Fee & Office Record
                </div>
                <div className="grid grid-cols-2 gap-x-16 gap-y-6 mt-4 font-black uppercase text-[12px]">
                    <div className="space-y-4">
                        <div className="flex justify-between border-b-2 border-gray-300 pb-2">
                            Total Course Fee: <span className="text-black">RS. {getVal('officeUse.totalFee', 'totalFee')}</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-gray-300 pb-2">
                            Paid Amount: <span className="text-green-700">RS. {getVal('officeUse.registrationFee', 'registrationFee')}</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-gray-300 pb-2 text-red-600 font-black">
                            Balance Payable: <span>RS. {getVal('officeUse.balanceAmount', 'balanceAmount')}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b-2 border-gray-300 pb-2">
                            Class Schedule: <span className="text-blue-700 italic">{getVal('officeUse.classSchedule', 'classSchedule')}</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-gray-300 pb-2">
                            Admission Status: <span className="text-emerald-600">CONFIRMED</span>
                        </div>
                        <div className="flex justify-between border-b-2 border-gray-300 pb-2">
                            Issued By: <span className="text-gray-600">{getVal('officeUse.issuedBy', 'issuedBy')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SIGNATURES --- */}
            <div className="relative z-10 mt-16 flex justify-between items-end px-12">
                <div className="text-center">
                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <p className="text-[10px] font-black uppercase">Registrar Signature</p>
                </div>
                <div className="text-center">
                    <div className="w-48 border-t-2 border-black mb-1"></div>
                    <p className="text-[10px] font-black uppercase">Student Signature</p>
                </div>
            </div>

            {/* --- ACKNOWLEDGEMENT SLIP --- */}
            <div className="relative z-10 mt-12 pt-6 border-t-4 border-dotted border-gray-400">
                <p className="inline-block px-4 py-1 bg-black text-white text-[9px] font-black rounded-full uppercase mb-4 italic">Acknowledgement Slip</p>
                <div className="grid grid-cols-3 gap-6 font-black uppercase text-[11px] bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                        <span className="text-[8px] text-gray-500 block">Name:</span>
                        {getVal('studentName', 'studentName')}
                    </div>
                    <div>
                        <span className="text-[8px] text-gray-500 block">Total Paid:</span>
                        RS. {getVal('officeUse.registrationFee', 'registrationFee')}
                    </div>
                    <div>
                        <span className="text-[8px] text-gray-500 block">Balance:</span>
                        RS. {getVal('officeUse.balanceAmount', 'balanceAmount')}
                    </div>
                </div>
            </div>
        </div>
    );
});

AdmissionForm.displayName = "AdmissionForm";
export default AdmissionForm;