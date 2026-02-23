import React, { useEffect, useState } from 'react';
import { Bell, MessageCircle, AlertTriangle, X } from 'lucide-react';
import api from '@/lib/axios'; // Aapki axios file

const AlertNotification = () => {
    const [alerts, setAlerts] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await api.get('/admin/payment-alerts');
                if (res.data.success) {
                    setAlerts(res.data.alerts);
                }
            } catch (err) {
                console.error("Alerts fetch error", err);
            }
        };
        fetchAlerts();
    }, []);

    if (alerts.length === 0 || !isVisible) return null;

    return (
        <div className="fixed top-5 right-5 z-50 w-full max-w-md animate-bounce-slow">
            <div className="bg-white border-l-4 border-red-500 shadow-2xl rounded-lg p-4 relative overflow-hidden">
                {/* Background Blinking Effect */}
                <div className="absolute inset-0 bg-red-50 opacity-10 animate-pulse"></div>

                <div className="relative flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-900">Payment Alarms!</h3>
                        <p className="text-xs text-gray-600 mb-3">
                            {alerts.length} Students ki payment overdue ya qareeb hai.
                        </p>

                        <div className="max-h-40 overflow-y-auto space-y-2 custom-scrollbar">
                            {alerts.map((student: any) => (
                                <div key={student._id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                    <span className="text-[10px] font-medium text-gray-700">{student.studentName}</span>
                                    <button
                                        onClick={() => {
                                            const msg = `Asalam-o-Alaikum ${student.studentName}, aapki fee installment due hai. Kindly jald az jald jama karwaein. Shukriya!`;
                                            window.open(`https://wa.me/${student.parentPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                        }}
                                        className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full transition-colors"
                                    >
                                        <MessageCircle size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertNotification;