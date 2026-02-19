import React, { forwardRef } from 'react';

interface FormProps {
    data: any;
    type: 'Education Zone' | 'DIB Education System';
}

const AdmissionForm = forwardRef<HTMLDivElement, FormProps>(({ data, type }, ref) => {
    return (
        <div ref={ref} className="p-10 bg-white text-black w-[210mm] min-h-[297mm] mx-auto border shadow-lg font-serif relative overflow-hidden text-sm">

            {/* Header Section */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 flex items-center justify-center font-bold border border-black">
                        LOGO
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tighter uppercase">{type}</h1>
                        <p className="text-xs font-bold">Contact: 0326-0804049</p>
                        <p className="text-sm font-bold mt-2 text-orange-600">Course: <span className="border-b border-black min-w-[100px] inline-block">{data.course}</span></p>
                        <p className="text-sm font-bold text-orange-600">Duration: <span className="border-b border-black min-w-[100px] inline-block">{data.duration}</span></p>
                    </div>
                </div>
                <div className="text-[10px] leading-tight text-right">
                    <p>NTN# ________________</p>
                    <p className="font-bold">Address 1:</p>
                    <p>Office # 2,3, First Floor Midland Plaza Near Defence Mor Lahore.</p>
                    <p className="font-bold mt-1">Address 2:</p>
                    <p>275-1-3 Ghazni Lane Super Town Lahore.</p>
                </div>
            </div>

            {/* Title */}
            <div className="text-center my-4">
                <h2 className="text-2xl font-bold underline decoration-double">Admission Form</h2>
                <p className="text-right text-xs">Date: <span className="border-b border-black px-4">{data.date}</span></p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mt-6">
                <p className="flex gap-2"><b>Name:</b> <span className="border-b border-dotted border-black flex-1">{data.studentName}</span></p>
                <p className="flex gap-2"><b>Father's Name:</b> <span className="border-b border-dotted border-black flex-1">{data.fatherName}</span></p>
                <p className="flex gap-2"><b>CNIC:</b> <span className="border-b border-dotted border-black flex-1">{data.cnic}</span></p>
                <p className="flex gap-2"><b>Mobile No:</b> <span className="border-b border-dotted border-black flex-1">{data.mobileNo}</span></p>
                <p className="flex gap-2"><b>Address:</b> <span className="border-b border-dotted border-black flex-1">{data.address}</span></p>
                <p className="flex gap-2"><b>E-mail Address:</b> <span className="border-b border-dotted border-black flex-1">{data.email}</span></p>
            </div>

            {/* Qualifications Table */}
            <div className="mt-8">
                <h3 className="font-bold uppercase mb-2 underline">Qualifications:</h3>
                <table className="w-full border-collapse border border-black text-center">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2">Matric / O-Level</th>
                            <th className="border border-black p-2">Marks</th>
                            <th className="border border-black p-2">Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="h-10">
                            <td className="border border-black"></td>
                            <td className="border border-black">{data.qualification?.marks}</td>
                            <td className="border border-black">{data.qualification?.year}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Office Use Section */}
            <div className="mt-10 border-t-2 border-black pt-4">
                <h3 className="font-bold underline italic mb-4">FOR OFFICE USE ONLY</h3>
                <div className="grid grid-cols-2 gap-x-10">
                    <div className="space-y-2">
                        <p>Total Fee: <span className="border-b border-black inline-block w-40"></span></p>
                        <p className="text-orange-600">Installments: <span className="border-b border-black inline-block w-32"></span></p>
                        <p className="text-orange-600">Remaining: <span className="border-b border-black inline-block w-32"></span></p>
                    </div>
                    <div className="space-y-2">
                        <p>Remarks: <span className="border-b border-black inline-block w-40"></span></p>
                        <p className="text-orange-600">Note: <span className="border-b border-black inline-block w-40"></span></p>
                    </div>
                </div>
            </div>

            {/* Footer Signatures */}
            <div className="flex justify-between mt-16 px-4">
                <div className="text-center">
                    <div className="border-t border-black w-40"></div>
                    <p className="text-xs">Agent Signature</p>
                </div>
                <div className="text-center">
                    <div className="border-t border-black w-40"></div>
                    <p className="text-xs">Student Signature</p>
                </div>
            </div>
        </div>
    );
});

AdmissionForm.displayName = "AdmissionForm";
export default AdmissionForm;