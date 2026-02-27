"use client";
import React, { forwardRef } from 'react';

interface FormProps {
    data: any;
    type: 'Education Zone' | 'DIB Education System';
}

const AdmissionForm = forwardRef<HTMLDivElement, FormProps>(({ data, type }, ref) => {
    const isEZ = type === 'Education Zone';

    // --- PURE HEX COLORS (Anti-Crash) ---
    const primaryHex = isEZ ? '#ea580c' : '#3730a3';
    const bgSoftHex = '#f9fafb';

    // Logo Logic
    const logoSrc = isEZ ? '/ez-logo.png' : '/dib-logo.png';

    // Helper safely get values
    const getVal = (path: string, defaultValue = '________________') => {
        return path.split('.').reduce((obj, key) => obj?.[key], data) || defaultValue;
    };

    // --- FEE LOGIC ---
    const totalFee = Number(data?.officeUse?.totalFee) || 0;
    const registrationFee = Number(data?.officeUse?.registrationFee) || 0;
    const totalPaidFromHistory = data?.feeHistory?.reduce((sum: number, item: any) => sum + (Number(item.amountPaid) || 0), 0) || 0;

    const grandTotalPaid = registrationFee + totalPaidFromHistory;
    const remainingBalance = totalFee - grandTotalPaid;

    // --- DUE DATES LOGIC ---
    const pendingInstallments = data?.installments?.filter((inst: any) => inst.status === 'pending') || [];

    return (
        <div
            ref={ref}
            className="p-10 bg-white text-black w-[210mm] min-h-[297mm] mx-auto font-sans relative overflow-hidden text-[12px] print:p-6 print:w-full shadow-none border border-gray-100"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
        >

            {/* --- WATERMARK --- */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <img src={logoSrc} alt="" className="w-[500px] -rotate-45" style={{ filter: 'grayscale(100%)' }} />
            </div>

            {/* --- HEADER --- */}
            <div className="relative z-10 flex justify-between items-center mb-6 border-b-2 pb-6" style={{ borderColor: primaryHex }}>
                <div className="flex items-center gap-6">
                    <div className="bg-white p-2 rounded-xl border border-gray-100">
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className="w-24 h-24 object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase leading-none" style={{ color: primaryHex }}>
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
            <div className="relative z-10 flex justify-between text-[11px] mb-6 font-bold p-3 rounded-xl border border-gray-200" style={{ backgroundColor: bgSoftHex }}>
                <div className="space-y-1">
                    <p className="italic">📍 Office # 2,3, 1st Floor Midland Plaza, Defence Mor, Lahore.</p>
                    <p>📧 {isEZ ? 'info@ez-system.pk' : 'admissions@dib-system.edu.pk'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black" style={{ color: primaryHex }}>Ph: 0326-0804049</p>
                    <p className="text-[9px] text-gray-400 uppercase">Authorized Admission Center</p>
                </div>
            </div>

            {/* --- ENROLLMENT BAR --- */}
            <div className="relative z-10 flex items-center gap-0 mb-8 border-2 border-black rounded-xl overflow-hidden">
                <div className="px-6 py-3 font-black text-lg border-r-2 border-black min-w-[180px]" style={{ backgroundColor: '#f3f4f6' }}>
                    REG NO: <span className="font-mono text-blue-700">{getVal('regNo')}</span>
                </div>
                <div className="flex-1 text-white text-center py-3 text-2xl font-black tracking-[0.4em] uppercase" style={{ backgroundColor: primaryHex }}>
                    Admission Form
                </div>
                <div className="px-6 py-3 font-black text-lg border-l-2 border-black min-w-[180px] text-center" style={{ backgroundColor: '#f3f4f6' }}>
                    DATE: {data?.date || (data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'))}
                </div>
            </div>

            {/* --- COURSE INFO (Updated with Class Mode) --- */}
            <div className="relative z-10 grid grid-cols-3 gap-6 mb-4">
                <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
                    <span className="font-black uppercase text-gray-600">Course:</span>
                    <span className="text-md font-bold text-black flex-1 uppercase">{getVal('course')}</span>
                </div>
                <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
                    <span className="font-black uppercase text-gray-600">Duration:</span>
                    <span className="text-md font-bold text-black flex-1 uppercase">{getVal('duration')}</span>
                </div>
                <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2">
                    <span className="font-black uppercase text-gray-600">Mode:</span>
                    <span className="text-md font-bold text-blue-700 flex-1 uppercase">{getVal('classMode', 'Physical')}</span>
                </div>
            </div>

            {/* --- PURPOSE FIELD --- */}
            <div className="relative z-10 mb-8">
                <div className="flex items-center gap-3 border-b-2 border-gray-300 pb-2 w-full">
                    <span className="font-black uppercase text-gray-600">Admission Purpose:</span>
                    <span className="text-lg font-bold text-black flex-1 uppercase">{getVal('purpose', 'Pakistan')}</span>
                </div>
            </div>

            {/* --- PERSONAL INFO --- */}
            <div className="relative z-10 space-y-5 uppercase font-bold">
                <div className="flex items-end gap-4">
                    <span className="w-44 text-[11px] text-gray-600">Student Name:</span>
                    <span className="flex-1 border-b-2 border-black text-xl font-black pb-1 uppercase">{getVal('studentName')}</span>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-44 text-[11px] text-gray-600">Father's Name:</span>
                    <span className="flex-1 border-b-2 border-black text-lg pb-1 uppercase">{getVal('fatherName')}</span>
                </div>
                <div className="grid grid-cols-2 gap-10">
                    <div className="flex items-end gap-4">
                        <span className="w-44 text-[11px] text-gray-600">CNIC / B-Form:</span>
                        <span className="flex-1 border-b-2 border-black pb-1 font-mono text-lg">{getVal('cnic')}</span>
                    </div>
                    <div className="flex items-end gap-4">
                        <span className="w-32 text-[11px] text-gray-600">Mobile No:</span>
                        <span className="flex-1 border-b-2 border-black pb-1 font-mono text-lg">{getVal('mobileNo')}</span>
                    </div>
                </div>
                <div className="flex items-end gap-4">
                    <span className="w-44 text-[11px] text-gray-600">Residential Address:</span>
                    <span className="flex-1 border-b-2 border-black pb-1 uppercase">{getVal('address')}</span>
                </div>
            </div>

            {/* --- REMARKS SECTION (Added) --- */}
            <div className="relative z-10 mt-6 p-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                <span className="text-[10px] font-black text-gray-500 block mb-1 uppercase tracking-widest">Office Remarks / Special Notes:</span>
                <p className="text-[11px] font-bold text-black leading-relaxed italic">
                    {getVal('remarks', 'No additional remarks provided.')}
                </p>
            </div>

            {/* --- ACADEMIC BACKGROUND --- */}
            <div className="relative z-10 mt-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-md" style={{ backgroundColor: primaryHex }}>✓</div>
                    <h3 className="font-black text-lg uppercase" style={{ color: primaryHex }}>Academic Background:</h3>
                </div>
                <table className="w-full border-collapse border-2 border-black text-center text-[11px]">
                    <thead className="uppercase border-b-2 border-black font-black" style={{ backgroundColor: '#f3f4f6' }}>
                        <tr>
                            <th className="border-r-2 border-black p-3 w-1/4">Certificate / Degree</th>
                            <th className="border-r-2 border-black p-3 w-1/3">Board / University</th>
                            <th className="border-r-2 border-black p-3">Marks / Grade</th>
                            <th className="p-3">Passing Year</th>
                        </tr>
                    </thead>
                    <tbody className="uppercase font-bold">
                        <tr className="border-b-2 border-black h-12">
                            <td className="border-r-2 border-black p-2" style={{ backgroundColor: '#f9fafb' }}>Matric / O-Level</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.matric.board', 'N/A')}</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.matric.marks', 'N/A')}</td>
                            <td className="p-2">{getVal('qualification.matric.year', 'N/A')}</td>
                        </tr>
                        <tr className="h-12 border-b-2 border-black">
                            <td className="border-r-2 border-black p-2" style={{ backgroundColor: '#f9fafb' }}>Inter / A-Level</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.inter.board', 'N/A')}</td>
                            <td className="border-r-2 border-black p-2">{getVal('qualification.inter.marks', 'N/A')}</td>
                            <td className="p-2">{getVal('qualification.inter.year', 'N/A')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- FEE SECTION --- */}
            <div className="relative z-10 mt-8 border-4 rounded-[2.5rem] p-8" style={{ borderColor: primaryHex, backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
                <div className="absolute -top-5 left-12 bg-white px-8 border-2 rounded-full py-2 text-[12px] font-black italic shadow-md uppercase tracking-widest" style={{ borderColor: primaryHex, color: primaryHex }}>
                    Fee & Office Record
                </div>
                <div className="grid grid-cols-2 gap-x-16 gap-y-6 mt-4 font-black uppercase text-[12px]">
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-300 pb-1">
                            Total Course Fee: <span style={{ color: '#000' }}>RS. {totalFee}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">
                            Admission Paid: <span style={{ color: '#15803d' }}>RS. {registrationFee}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">
                            Installments Paid: <span style={{ color: '#1d4ed8' }}>RS. {totalPaidFromHistory}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-1 font-black" style={{ color: '#dc2626' }}>
                            Net Balance: <span>RS. {remainingBalance}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-300 pb-1">
                            Monthly Installment: <span style={{ color: '#4338ca' }}>RS. {getVal('officeUse.monthlyInstallment', '0')}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">
                            Total Installments: <span style={{ color: '#1d4ed8' }}>{getVal('officeUse.noOfInstallments', '1')}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-1">
                            Class Schedule: <span className="italic" style={{ color: '#1d4ed8' }}>{getVal('officeUse.classSchedule', 'TBA')}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-300 pb-1" style={{ color: '#059669' }}>
                            Enrollment Status: <span className="uppercase">{data?.status || 'ACTIVE'}</span>
                        </div>
                    </div>
                </div>

                {/* --- INSTALLMENT DUE DATES --- */}
                {pendingInstallments.length > 0 && (
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-300">
                        <p className="text-[10px] mb-2 text-gray-500 italic">Upcoming Installments Schedule:</p>
                        <div className="grid grid-cols-4 gap-4">
                            {pendingInstallments.slice(0, 4).map((inst: any, idx: number) => (
                                <div key={idx} className="border border-gray-200 p-2 rounded-lg bg-white text-center">
                                    <span className="block text-[8px] text-gray-400">Inst. {idx + 1}</span>
                                    <span className="block font-bold text-blue-700">RS. {inst.amount}</span>
                                    <span className="block text-[9px] text-gray-600 font-mono">
                                        {new Date(inst.dueDate).toLocaleDateString('en-GB')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
                <div className="grid grid-cols-3 gap-6 font-black uppercase text-[11px] p-4 rounded-xl border border-gray-200" style={{ backgroundColor: bgSoftHex }}>
                    <div>
                        <span className="text-[8px] text-gray-500 block">Student Name:</span>
                        {getVal('studentName')}
                    </div>
                    <div>
                        <span className="text-[8px] text-gray-500 block">Grand Total Paid:</span>
                        RS. {grandTotalPaid}
                    </div>
                    <div>
                        <span className="text-[8px] text-gray-500 block">Remaining Balance:</span>
                        RS. {remainingBalance}
                    </div>
                </div>
                <p className="text-[7px] text-gray-400 mt-2 text-center uppercase tracking-widest">Note: This is a computer generated acknowledgement slip.</p>
            </div>
        </div>
    );
});

AdmissionForm.displayName = "AdmissionForm";
export default AdmissionForm;