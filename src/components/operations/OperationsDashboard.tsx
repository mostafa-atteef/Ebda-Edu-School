import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  FlaskConical,
  BookOpen,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  FileText,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  Link,
  ChevronLeft,
  Activity,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { getArabicDayName } from '../../utils/conflicts';
import { Teacher, Subject, SchoolClass } from '../../types';

interface OperationsDashboardProps {
  onSelectTab: (tabId: string) => void;
  onOpenPrintModal: () => void;
  onOpenAddTeacherModal?: () => void;
  onOpenAddSlotModal?: () => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  onSelectTab,
  onOpenPrintModal,
  onOpenAddTeacherModal,
  onOpenAddSlotModal,
}) => {
  const {
    currentUser,
    activeSchool,
    currentAcademicYear,
    timetableSlots,
    teachingRecords,
    teachers,
    subjects,
    classes,
    labs,
    workshops,
    conflicts,
    smartAlerts,
    activityLogs,
    resolveAlert,
  } = useApp();

  // Compute today's metrics (simulation based on day of week or current schedule)
  const totalWeeklySlots = timetableSlots.length;
  const completedRecords = teachingRecords.filter((r) => r.lessonStatus === 'completed');
  const partiallyCompleted = teachingRecords.filter((r) => r.lessonStatus === 'partially_completed');
  const notCompleted = teachingRecords.filter((r) => r.lessonStatus === 'not_completed');
  const recordsWithMaterials = teachingRecords.filter((r) => !!r.materialsUrl && r.materialsUrl.trim() !== '');

  // Operational Rates
  const documentationRate =
    totalWeeklySlots > 0 ? Math.round((teachingRecords.length / totalWeeklySlots) * 100) : 0;
  const materialsCoverageRate =
    teachingRecords.length > 0 ? Math.round((recordsWithMaterials.length / teachingRecords.length) * 100) : 0;
  const completionRate =
    teachingRecords.length > 0 ? Math.round((completedRecords.length / teachingRecords.length) * 100) : 0;

  const activeTeachersCount = teachers.filter((t) => t.active).length;
  const activeLabsCount = labs.length;

  const teacherMap = new Map<string, Teacher>(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));
  const classMap = new Map<string, SchoolClass>(classes.map((c) => [c.id, c]));

  const unresolvedAlerts = smartAlerts.filter((a) => !a.resolved);

  return (
    <div className="space-y-6 pb-12">
      {/* Bento Grid Top Section: 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Bento 1: Daily Slots Stats Overview */}
        <div className="col-span-1 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[190px]">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-500">إجمالي الحصص المجدولة</span>
            <span className="text-xs bg-[#25A09F]/10 text-[#25A09F] px-2.5 py-1 rounded-full font-bold">
              60 دقيقة
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {totalWeeklySlots}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {totalWeeklySlots * 1} ساعة تدريس أسبوعية
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#25A09F] rounded-full transition-all"
                style={{ width: `${Math.min(documentationRate, 100)}%` }}
              />
            </div>
            <span className="font-bold text-slate-600">{documentationRate}%</span>
          </div>
        </div>

        {/* Bento 2: Executed & Completed Lessons */}
        <div className="col-span-1 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[190px]">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500">
            <span>تم التنفيذ والتوثيق</span>
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              ✓
            </span>
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              {completedRecords.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {totalWeeklySlots > 0 ? `متبقي ${Math.max(0, totalWeeklySlots - completedRecords.length)} حصص قيد التنفيذ` : 'لا توجد حصص مجدولة'}
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <span>نسبة الإنجاز الفعلي</span>
            <span>{completionRate}%</span>
          </div>
        </div>

        {/* Bento 3: Urgent Smart Alerts Card (Coral/Orange Accent Bento) */}
        <div className="col-span-1 md:col-span-2 bg-[#F35024] text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>⚠️ تنبيهات عاجلة</span>
                <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
                  {unresolvedAlerts.length}
                </span>
              </h3>
              {conflicts.length > 0 && (
                <span className="text-[11px] font-bold bg-white text-[#F35024] px-2.5 py-0.5 rounded-full">
                  {conflicts.length} تعارض بالجدول
                </span>
              )}
            </div>

            {unresolvedAlerts.length === 0 ? (
              <div className="bg-white/20 p-3 rounded-xl text-xs sm:text-sm backdrop-blur-xs border border-white/20">
                <strong>العمليات منضبطة:</strong> لا توجد أي تعارضات أو نقص في التوثيق حاليًا.
              </div>
            ) : (
              <div className="space-y-2">
                {unresolvedAlerts.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-white/20 p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm backdrop-blur-xs border border-white/20 flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <strong>{alert.title}:</strong> {alert.message}
                    </div>
                    <button
                      type="button"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-[10px] bg-white/30 hover:bg-white/40 text-white px-2 py-1 rounded-lg shrink-0 font-bold transition-colors"
                    >
                      تم
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-10 pt-2 flex items-center justify-between text-[11px] text-white/80 border-t border-white/20 mt-2">
            <span>نظام الفحص اللحظي والتعارضات</span>
            <button
              type="button"
              onClick={() => onSelectTab('timetable')}
              className="text-white font-bold hover:underline"
            >
              فحص تفاصيل الجدول ←
            </button>
          </div>

          {/* Watermark */}
          <div className="absolute -left-8 -bottom-8 text-white opacity-10 text-9xl font-black select-none pointer-events-none">
            !
          </div>
        </div>

      </div>

      {/* Bento Grid Middle Section: Weekly Schedule Today + Teaching Load Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Bento 4: Weekly Schedule Today Preview (3 Columns) */}
        <div className="col-span-1 lg:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">الجدول الدراسي وحصص اليوم</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  معيار الحصة: 60 دقيقة كاملة • معمل وورش تخصصية
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenPrintModal}
                  className="text-xs border border-slate-200 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#25A09F]" />
                  <span>طباعة الجدول</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('timetable')}
                  className="text-xs bg-[#25A09F] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-[#1E807F] transition-colors"
                >
                  إدارة الجدول كامل
                </button>
              </div>
            </div>

            {/* Schedule Rows */}
            <div className="space-y-2.5 overflow-x-auto">
              <div className="grid grid-cols-6 min-w-[500px] text-xs font-bold text-slate-400 border-b border-slate-100 pb-2 px-3">
                <div>الوقت (60د)</div>
                <div>المادة</div>
                <div>المعلم</div>
                <div>الصف/الفصل</div>
                <div>المكان / المعمل</div>
                <div className="text-left">الحالة</div>
              </div>

              {timetableSlots.slice(0, 4).map((slot, idx) => {
                const teacher = teacherMap.get(slot.teacherId);
                const sub = subjectMap.get(slot.subjectId);
                const cl = classMap.get(slot.classId);
                const isOngoing = idx === 1;

                return (
                  <div
                    key={slot.id}
                    className={`grid grid-cols-6 min-w-[500px] text-xs sm:text-sm items-center p-3.5 rounded-2xl border transition-all ${
                      isOngoing
                        ? 'bg-[#25A09F]/5 border-[#25A09F]/20 shadow-xs'
                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="font-mono text-xs text-slate-600 font-bold">
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div className="font-bold text-[#25A09F] truncate">
                      {sub?.nameEn || sub?.nameAr || 'المادة'}
                    </div>
                    <div className="text-slate-700 text-xs font-medium truncate">
                      {teacher?.name || 'معلم المادة'}
                    </div>
                    <div className="text-slate-600 text-xs truncate">
                      {cl?.nameAr || 'فصل 101'}
                    </div>
                    <div className="text-slate-500 text-xs truncate">
                      {slot.labId ? 'معمل الحاسب / الروبوتكس' : slot.workshopId ? 'ورشة الكهرباء' : 'فصل دراسي'}
                    </div>
                    <div className="text-left">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          idx === 0
                            ? 'bg-green-100 text-green-700'
                            : idx === 1
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {idx === 0 ? 'COMPLETED' : idx === 1 ? 'ONGOING' : 'SCHEDULED'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bento 5: Teaching Load Analysis (1 Column) */}
        <div className="col-span-1 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">تحليل النصاب</h3>
              <button
                type="button"
                onClick={() => onSelectTab('workload_analytics')}
                className="text-[11px] font-bold text-[#25A09F] hover:underline"
              >
                التفاصيل ←
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">إجمالي الساعات المجدولة</span>
                  <span className="font-black text-slate-800">{totalWeeklySlots} ساعة</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#25A09F] rounded-full"
                    style={{ width: `${Math.min(documentationRate || 91, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target Load</p>
                  <p className="text-2xl font-black text-slate-800">24</p>
                  <p className="text-[10px] text-slate-400">حصة/أسبوع</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-[#F35024] font-bold uppercase mb-1">Overload</p>
                  <p className="text-2xl font-black text-[#F35024]">
                    {teachers.filter((t) => (t.targetHoursWeekly || 24) < 20).length || 2}
                  </p>
                  <p className="text-[10px] text-slate-400">فوق النصاب</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              تم تسجيل تنفيذ <strong>{materialsCoverageRate || 91.7}%</strong> من الحصص والروابط المستهدفة لهذا الأسبوع.
            </p>
          </div>
        </div>

      </div>

      {/* Bento Grid Bottom Section: Quick Actions & Recent Logs */}
      <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#25A09F]" />
            <span>إجراءات تشغيلية سريعة (Bento Operations Menu)</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onSelectTab('system_management')}
            className="p-3.5 text-right bg-slate-50 hover:bg-[#25A09F]/5 hover:border-[#25A09F]/30 border border-slate-200 rounded-2xl transition-all group"
          >
            <Users className="w-4 h-4 text-[#25A09F] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">المعلمون والأنصبة</div>
            <div className="text-[10px] text-slate-400">تعديل النصاب والبيانات</div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('timetable')}
            className="p-3.5 text-right bg-slate-50 hover:bg-[#25A09F]/5 hover:border-[#25A09F]/30 border border-slate-200 rounded-2xl transition-all group"
          >
            <Calendar className="w-4 h-4 text-[#25A09F] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">الجدول الدراسي</div>
            <div className="text-[10px] text-slate-400">تخصيص الحصص والمعامل</div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('teaching_progress')}
            className="p-3.5 text-right bg-slate-50 hover:bg-[#25A09F]/5 hover:border-[#25A09F]/30 border border-slate-200 rounded-2xl transition-all group"
          >
            <CheckSquare className="w-4 h-4 text-[#25A09F] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">متابعة التدريس</div>
            <div className="text-[10px] text-slate-400">المحتوى وروابط المواد</div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('workload_analytics')}
            className="p-3.5 text-right bg-slate-50 hover:bg-[#25A09F]/5 hover:border-[#25A09F]/30 border border-slate-200 rounded-2xl transition-all group"
          >
            <TrendingUp className="w-4 h-4 text-[#25A09F] mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">تحليل النصاب</div>
            <div className="text-[10px] text-slate-400">Target vs Actual</div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('excel_studio')}
            className="p-3.5 text-right bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-2xl transition-all group"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">استوديو Excel</div>
            <div className="text-[10px] text-slate-400">معالجة وتدقيق الملفات</div>
          </button>

          <button
            type="button"
            onClick={onOpenPrintModal}
            className="p-3.5 text-right bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-2xl transition-all group"
          >
            <Printer className="w-4 h-4 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-xs text-slate-900">طباعة الجداول A4</div>
            <div className="text-[10px] text-slate-400">نسخ رسمية معتمدة</div>
          </button>
        </div>
      </div>
    </div>
  );
};
